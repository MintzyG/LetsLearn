#!/usr/bin/env node
// Serves learning material (projects/) on localhost and checks self-check answers with
// Claude Code. Run it with `just material <project> [NN]`. See "Material format" in loop.md.
//
// POST /api/check sends one self-check answer to `claude -p` (no tools, structured output).
// Every attempt is appended to projects/<project>/answers/<section>.jsonl. An answer that
// isn't fully right starts or extends a STUCK.md entry, as loop.md asks.

import { spawn } from "node:child_process";
import { appendFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve, sep } from "node:path";

const REPO = resolve(import.meta.dirname, "..");
const ROOT = join(REPO, "projects");
const STUCK = join(REPO, "STUCK.md");
const HOST = "127.0.0.1";
const PORT = Number(process.env.MATERIAL_PORT ?? 5190);
const MODEL = process.env.MATERIAL_CHECK_MODEL ?? "sonnet";
const CHECK_TIMEOUT_MS = 180_000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".md": "text/plain; charset=utf-8",
};

// ---- Checking an answer ------------------------------------------------------

const SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["correct", "partly", "not-yet"] },
    feedback: { type: "string" },
    stuck_on: { type: "string" },
  },
  required: ["verdict", "feedback", "stuck_on"],
});

const SYSTEM = `You check a learner's answers to the self-check questions in a learn-by-building book.
The learner is Sophia: she wants to understand, not be handed answers.

You get the section's text, the self-check questions with their reference answers, and her answer.
Judge her answer against the reference answers and the section's text. Different wording is fine;
what matters is the idea. If several questions are answered, judge all of them.

- verdict: "correct" if every answer gets the key idea right; "partly" if some are right or the idea is
  half there; "not-yet" if the key ideas are missing or wrong.
- feedback: short, warm and direct, written to her ("you"). Say what she got right. For anything
  missing or wrong, nudge with the smallest hint that could get her there: a question to think about,
  or which part of the section to re-read. Never state, quote or paraphrase the right answer, and
  don't restate a definition so that it gives the answer away; she should get there herself.
  Plain text, at most about 80 words. Don't address her by name.
- stuck_on: if the verdict isn't "correct", one sentence naming the concept she's missing or confusing,
  for the material's author (third person, "she"). Empty string if correct.`;

function checkPrompt({ heading, context, selfcheck, answer }) {
  return [
    `## Section: ${heading}`,
    context.trim(),
    "## Self-check questions and reference answers",
    selfcheck.trim(),
    "## Her answer",
    answer.trim(),
  ].join("\n\n");
}

function runClaude(prompt) {
  return new Promise((done, fail) => {
    const child = spawn("claude", [
      "-p",
      "--output-format", "json",
      "--json-schema", SCHEMA,
      "--system-prompt", SYSTEM,
      "--tools", "",
      "--no-session-persistence",
      "--model", MODEL,
    ], { cwd: tmpdir(), stdio: ["pipe", "pipe", "pipe"] });

    let out = "", err = "";
    const timer = setTimeout(() => child.kill(), CHECK_TIMEOUT_MS);
    child.stdout.on("data", d => (out += d));
    child.stderr.on("data", d => (err += d));
    child.on("error", fail);
    child.on("close", code => {
      clearTimeout(timer);
      try {
        const result = JSON.parse(out);
        if (result.is_error || !result.structured_output) throw new Error(result.result || "no structured output");
        done(result.structured_output);
      } catch (e) {
        fail(new Error(`claude exited ${code}: ${e.message} ${err.slice(0, 300)}`));
      }
    });
    child.stdin.end(prompt);
  });
}

// ---- Logging -----------------------------------------------------------------

// Writes happen one at a time, so two checks never interleave in STUCK.md.
let writes = Promise.resolve();
const serially = task => (writes = writes.then(task, task));

// Local date, YYYY-MM-DD.
const today = () => new Date().toLocaleDateString("sv-SE");
const oneLine = text => text.replace(/\s+/g, " ").trim();
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function logAttempt(project, section, entry) {
  const dir = join(ROOT, project, "answers");
  await mkdir(dir, { recursive: true });
  await appendFile(join(dir, `${section}.jsonl`), JSON.stringify(entry) + "\n");
}

// One STUCK.md entry per self-check per day. A wrong answer opens it; every later attempt
// adds its nudge; a correct answer closes it with the number of tries.
async function logStuck(project, section, heading, result) {
  const marker = `<!-- auto-check: ${project}/${section}/${slug(heading)}/${today()} -->`;
  let text = await readFile(STUCK, "utf8");
  const at = text.indexOf(marker);

  if (at === -1) {
    if (result.verdict === "correct") return false;
    text = text.replace(/\n*$/, "\n\n") + [
      `### ${project} / ${section} — ${today()}`,
      marker,
      `- **Stuck on:** ${oneLine(result.stuck_on)}`,
      `- **Where:** self-check of "${heading}" (material)`,
      `- **Nudges:** from the automatic answer check`,
      `  1. ${oneLine(result.feedback)}`,
      `- **Material fix:** pending`,
      "",
    ].join("\n");
    await writeFile(STUCK, text);
    return true;
  }

  const fix = text.indexOf("- **Material fix:**", at);
  const nudges = text.slice(at, fix).match(/^ {2}\d+\. /gm)?.length ?? 0;
  if (text.slice(at, fix).includes("→ answered correctly")) return false;
  const line = result.verdict === "correct"
    ? `  → answered correctly on try ${nudges + 1}\n`
    : `  ${nudges + 1}. ${oneLine(result.feedback)}\n`;
  await writeFile(STUCK, text.slice(0, fix) + line + text.slice(fix));
  return true;
}

// ---- HTTP --------------------------------------------------------------------

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 200_000) throw new Error("request too large");
  }
  return JSON.parse(body);
}

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function handleCheck(req, res) {
  const input = await readJson(req);
  const page = String(input.page ?? "").match(/^\/([\w-]+)\/material\/([\w-]+)\//);
  const fields = ["heading", "context", "selfcheck", "answer"];
  if (!page || fields.some(f => typeof input[f] !== "string") || !input.answer.trim()) {
    return send(res, 400, { error: "expected page, heading, context, selfcheck and answer" });
  }
  const [, project, section] = page;

  const result = await runClaude(checkPrompt(input));
  const logged = await serially(async () => {
    await logAttempt(project, section, { time: new Date().toISOString(), heading: input.heading, answer: input.answer, ...result });
    return logStuck(project, section, input.heading, result);
  });
  console.log(`${section} · ${input.heading} · ${result.verdict}`);
  send(res, 200, { verdict: result.verdict, feedback: result.feedback, logged: logged && result.verdict !== "correct" });
}

async function handleFile(req, res) {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  const file = join(ROOT, path);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return send(res, 403, "forbidden", "text/plain");

  const info = await stat(file).catch(() => null);
  if (!info) return send(res, 404, "not found", "text/plain");
  if (info.isDirectory()) {
    if (!path.endsWith("/")) { res.writeHead(301, { location: path + "/" }); return res.end(); }
    const names = (await readdir(file, { withFileTypes: true }))
      .filter(d => !d.name.startsWith("."))
      .map(d => `<li><a href="${d.name}${d.isDirectory() ? "/" : ""}">${d.name}${d.isDirectory() ? "/" : ""}</a></li>`);
    return send(res, 200, `<!doctype html><meta charset="utf-8"><title>${path}</title><ul>${names.join("")}</ul>`, TYPES[".html"]);
  }
  send(res, 200, await readFile(file), TYPES[extname(file)] ?? "application/octet-stream");
}

createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/check") return await handleCheck(req, res);
    if (req.method === "GET") return await handleFile(req, res);
    send(res, 405, "method not allowed", "text/plain");
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: e.message });
  }
}).listen(PORT, HOST, () => {
  console.log(`Material at http://${HOST}:${PORT}/  (answers checked by claude --model ${MODEL})`);
});
