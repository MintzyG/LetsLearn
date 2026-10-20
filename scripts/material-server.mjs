#!/usr/bin/env node
// Serves learning material (projects/) on localhost and checks self-check answers with
// Claude Code. Run it with `just material <project> [NN]`. See "Material format" in loop.md.
//
// POST /api/check sends one self-check's answers to `claude -p` (no tools, structured output).
// POST /api/verify has `claude -p` read the learner's code in projects/<project>/src/<dir> and
// run its tests, and judge it against the section's task. POST /api/help answers a "help, I'm
// stuck" question about that code with a nudge, never the solution.
// Every attempt is appended to projects/<project>/answers/<section>.jsonl. An attempt that
// isn't fully right, and every help request, starts or extends a STUCK.md entry, as loop.md asks.

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
const CODE_TIMEOUT_MS = 300_000;

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
what matters is the idea. Her answers come one per question, each labeled with the question's
number ("1)", "2a)") and its text; judge every one, and refer to them by number in your feedback.

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

// Runs `claude -p` with a system prompt and a JSON schema. By default it has no tools; the
// code checks get read-only tools plus `go test` / `go vet`, in the learner's code directory.
function runClaude(prompt, { schema = SCHEMA, system = SYSTEM, tools = [], allowed = [], cwd = tmpdir(), timeout = CHECK_TIMEOUT_MS } = {}) {
  return new Promise((done, fail) => {
    const child = spawn("claude", [
      "-p",
      "--output-format", "json",
      "--json-schema", schema,
      "--system-prompt", system,
      "--tools", tools.join(","),
      ...(allowed.length ? ["--allowedTools", ...allowed] : []),
      "--no-session-persistence",
      "--model", MODEL,
    ], { cwd, stdio: ["pipe", "pipe", "pipe"] });

    let out = "", err = "";
    const timer = setTimeout(() => child.kill(), timeout);
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

// ---- Checking an implementation -------------------------------------------------

const CODE_TOOLS = { tools: ["Read", "Grep", "Glob", "Bash"], allowed: ["Read", "Grep", "Glob", "Bash(go test:*)", "Bash(go vet:*)"], timeout: CODE_TIMEOUT_MS };

const VERIFY_SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["pass", "partly", "not-yet"] },
    feedback: { type: "string" },
    stuck_on: { type: "string" },
    book_note: { type: "string" },
  },
  required: ["verdict", "feedback", "stuck_on", "book_note"],
});

const VERIFY_SYSTEM = `You check a learner's implementation for one section of a learn-by-building book.
The learner is Sophia: she wants to build it herself, not be handed the solution.

You get the section's task (the spec, in prose) and the directory her code is in, which is your working
directory's subdirectory named below. Read her code and the tests beside it, and run the tests with
\`go test ./<dir>/\` (and \`go vet ./<dir>/\` if useful). Never edit files.

- verdict: "pass" if the tests pass and the code does what the task asks; "partly" if some of it works;
  "not-yet" if it doesn't build or the core of the task is missing.
- feedback: short, warm and direct, written to her ("you"). Say what works. For each problem, name the
  failing test or the symptom and where to look (a file and function), and stop there. Don't diagnose
  the cause, don't walk her through the reasoning, don't suggest which input to try beyond what the
  test output already says, and never write code, quote a fixed line or say what to change. Finding
  the cause is her job. A note on readability is welcome if it matters. Plain text, at most about 80
  words. Don't address her by name.
- stuck_on: if the verdict isn't "pass", one sentence naming the concept she's missing, for the
  material's author (third person, "she"). Empty string on a pass.
- book_note: one sentence for the material's author if the section's text (its spec, task or hints)
  is wrong, unclear or missing something that led to this mistake; otherwise an empty string.`;

const HELP_SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    ack: { type: "string", maxLength: 100 },
    nudge: { type: "string", maxLength: 160 },
    stuck_on: { type: "string" },
  },
  required: ["ack", "nudge", "stuck_on"],
});

const HELP_SYSTEM = `A learner is stuck while implementing one section of a learn-by-building book and asks for help.
The learner is Sophia: she wants to build it herself, not be handed the solution.

You get the section's task, the directory her code is in (your working directory's subdirectory named
below), and her question. Read her code and tests as needed, and run the tests with \`go test ./<dir>/\`
if it helps. Never edit files.

- ack: one short, warm sentence acknowledging what she tried or noticed (or an empty string).
- nudge: ONE nudge about the thing she asked, the smallest that could unblock her: a single question to
  think about, or a single thing to print, look at or re-read. One sentence, one question mark at most.
  Never a sequence of steps ("first..., then..., now...", "and then compare..."): if you're tempted to
  chain steps, give only the first one.
  - Answer only what she asked. Never mention other problems you notice in her code, even in passing:
    she finds those herself, or the Verify button points at them.
  - Don't diagnose. Don't name the cause ("the bytes are swapped", "the check is off by one"); lead her
    to the place where she can see it herself.
  - Escalate slowly. If earlier nudges for this task are listed, don't repeat them: go exactly one small
    step further than the last one on the same problem, and no further.
  - Explaining a general concept is fine; explaining how her code should be written is not. Never write
    code, quote a fixed line or say what to change. If she explicitly asks for the answer, don't give it:
    tell her to ask in the conversation with her agent, which will confirm first.
  Plain text, written to her ("you"). These rules apply to the ack too.
- stuck_on: one sentence for the material's author naming what she is stuck on, i.e. what she asked
  about, nothing else (third person, "she").`;

function codePrompt({ heading, context, dir, question }, earlier = []) {
  return [
    `## Section: ${heading}`,
    context.trim(),
    `## Her code`,
    `The directory \`${dir}/\` (run its tests as \`go test ./${dir}/\`).`,
    ...(earlier.length ? ["## Earlier nudges today, oldest first", earlier.join("\n\n")] : []),
    ...(question ? ["## Her question", question.trim()] : []),
  ].join("\n\n");
}

// Today's earlier help replies and verify feedback for this check, so help can escalate one step at a time.
async function earlierNudges(project, section, heading) {
  const file = join(ROOT, project, "answers", `${section}.jsonl`);
  const lines = (await readFile(file, "utf8").catch(() => "")).split("\n").filter(Boolean);
  return lines.map(line => JSON.parse(line))
    .filter(e => e.heading === heading && e.mode && new Date(e.time).toLocaleDateString("sv-SE") === today())
    .slice(-6)
    .map(e => e.mode === "help"
      ? `Help. She asked: ${oneLine(e.question)}\nNudge given: ${oneLine(e.reply)}`
      : `Verify (${e.verdict}). Feedback given: ${oneLine(e.feedback)}`);
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

// One STUCK.md entry per check per day. The first nudge opens it, every later one is added to
// it, and a passing attempt closes it.
//   kind:   "auto-check" (questions) or "impl-check" (implementation: verify and help)
//   nudge:  the line to add, or null when the attempt passed
//   close:  the closing line for a pass, given the number of nudges so far
async function logStuck({ project, section, heading, kind, stuckOn, nudge, close }) {
  const marker = `<!-- ${kind}: ${project}/${section}/${slug(heading)}/${today()} -->`;
  let text = await readFile(STUCK, "utf8");
  const at = text.indexOf(marker);
  const impl = kind === "impl-check";

  if (at === -1) {
    if (!nudge) return false;
    text = text.replace(/\n*$/, "\n\n") + [
      `### ${project} / ${section} — ${today()}`,
      marker,
      `- **Stuck on:** ${oneLine(stuckOn)}`,
      `- **Where:** ${impl ? "implementation check" : "self-check"} of "${heading}" (material)`,
      `- **Nudges:** from the automatic ${impl ? "implementation check and help button" : "answer check"}`,
      `  1. ${nudge}`,
      `- **Material fix:** pending`,
      "",
    ].join("\n");
    await writeFile(STUCK, text);
    return true;
  }

  const fix = text.indexOf("- **Material fix:**", at);
  const entry = text.slice(at, fix);
  const nudges = entry.match(/^ {2}\d+\. /gm)?.length ?? 0;
  if (entry.includes("\n  → ")) return false;
  const line = nudge ? `  ${nudges + 1}. ${nudge}\n` : `  → ${close(nudges)}\n`;
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
    return logStuck({
      project, section, heading: input.heading, kind: "auto-check", stuckOn: result.stuck_on,
      nudge: result.verdict === "correct" ? null : oneLine(result.feedback),
      close: n => `answered correctly on try ${n + 1}`,
    });
  });
  console.log(`${section} · ${input.heading} · ${result.verdict}`);
  send(res, 200, { verdict: result.verdict, feedback: result.feedback, logged: logged && result.verdict !== "correct" });
}

// The section's code directory, inside projects/<project>/src/.
function codeDir(project, dir) {
  if (!/^[\w-]+(\/[\w-]+)*$/.test(dir)) return null;
  return join(ROOT, project, "src");
}

async function handleCode(req, res, mode) {
  const input = await readJson(req);
  const page = String(input.page ?? "").match(/^\/([\w-]+)\/material\/([\w-]+)\//);
  const fields = ["heading", "context", "dir", ...(mode === "help" ? ["question"] : [])];
  if (!page || fields.some(f => typeof input[f] !== "string") || (mode === "help" && !input.question.trim())) {
    return send(res, 400, { error: `expected page, ${fields.join(", ")}` });
  }
  const [, project, section] = page;
  const cwd = codeDir(project, input.dir);
  if (!cwd) return send(res, 400, { error: "bad code directory" });

  const prompt = codePrompt(input, mode === "help" ? await earlierNudges(project, section, input.heading) : []);
  const result = mode === "help"
    ? await runClaude(prompt, { schema: HELP_SCHEMA, system: HELP_SYSTEM, cwd, ...CODE_TOOLS })
    : await runClaude(prompt, { schema: VERIFY_SCHEMA, system: VERIFY_SYSTEM, cwd, ...CODE_TOOLS });
  if (mode === "help") result.reply = [result.ack, result.nudge].map(t => t.trim()).filter(Boolean).join(" ");

  let nudge;
  if (mode === "help") {
    nudge = `(help) asked "${oneLine(input.question)}": ${oneLine(result.reply)}`;
  } else if (result.verdict !== "pass") {
    nudge = `(verify, ${result.verdict}) ${oneLine(result.feedback)}` +
      (result.book_note.trim() ? `\n    Book note: ${oneLine(result.book_note)}` : "");
  } else {
    nudge = null;
  }
  const logged = await serially(async () => {
    await logAttempt(project, section, { time: new Date().toISOString(), heading: input.heading, mode, question: input.question, ...result });
    return logStuck({
      project, section, heading: input.heading, kind: "impl-check", stuckOn: result.stuck_on, nudge,
      close: n => `verified (pass) after ${n} nudge${n === 1 ? "" : "s"}` +
        (result.book_note.trim() ? `\n    Book note: ${oneLine(result.book_note)}` : ""),
    });
  });
  console.log(`${section} · ${input.heading} · ${mode} · ${result.verdict ?? "nudge"}`);
  send(res, 200, { ...(mode === "help" ? { reply: result.reply } : { verdict: result.verdict, feedback: result.feedback }), logged: logged && !!nudge });
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
    if (req.method === "POST" && req.url === "/api/verify") return await handleCode(req, res, "verify");
    if (req.method === "POST" && req.url === "/api/help") return await handleCode(req, res, "help");
    if (req.method === "GET") return await handleFile(req, res);
    send(res, 405, "method not allowed", "text/plain");
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: e.message });
  }
}).listen(PORT, HOST, () => {
  console.log(`Material at http://${HOST}:${PORT}/  (answers checked by claude --model ${MODEL})`);
});
