// Shared script for learning material and its explanatory visuals.
// See "Material format" in loop.md.
//
// - In a visual embedded in a material page: report the page's height to the parent.
// - In a material page: size each embedded visual's iframe to the height it reports,
//   and put an answer box under each question of each self-check (<section class="self-check">),
//   with one Check button before the folded reference answers.
// - In an implementation check (<section class="impl-check" data-dir="...">): a Verify button
//   that has Claude read and test the code in projects/<name>/src/<dir>, and a Help button that
//   opens a box to ask for a nudge when stuck.
//   Answers are checked by Claude through the local server (`just material`).
//
// Uses postMessage because pages opened from file:// can't read each other's DOM.

if (window.parent !== window) {
  const report = () => window.parent.postMessage(
    { materialVisualHeight: document.body.scrollHeight }, "*");
  window.addEventListener("load", report);
  new ResizeObserver(report).observe(document.body);
} else {
  window.addEventListener("message", event => {
    const height = event.data && event.data.materialVisualHeight;
    if (!height) return;
    for (const frame of document.querySelectorAll("figure.visual iframe")) {
      if (frame.contentWindow === event.source) frame.style.height = `${height}px`;
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("section.self-check").forEach(addAnswerBox);
    document.querySelectorAll("section.impl-check").forEach(addImplCheck);
  });
}

// ---- Answer boxes --------------------------------------------------------------

const served = location.protocol.startsWith("http");

// The h2 a self-check belongs to, and the section's text up to the self-check.
function sectionOf(selfCheck) {
  let heading = null;
  const parts = [];
  for (let node = selfCheck.previousElementSibling; node; node = node.previousElementSibling) {
    if (node.tagName === "H2") { heading = node; break; }
    if (node.matches("figure, details, section.self-check, section.impl-check")) continue;
    parts.unshift(node.textContent);
  }
  return { heading: heading ? heading.textContent.trim() : document.title, context: parts.join("\n\n") };
}

function draftKey(heading) {
  return `material-answer:${location.pathname}:${heading}`;
}

function store(key, value) {
  try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch {}
}

function load(key) {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}

function paragraphs(text) {
  const box = document.createElement("div");
  for (const para of text.split(/\n\s*\n/)) {
    const p = document.createElement("p");
    p.textContent = para.trim();
    box.append(p);
  }
  return box;
}

// The questions a self-check asks, each with its label: "1", "2", or "2a", "2b" for the
// sub-questions in a nested <ol type="a">. The question's text includes its parent's stem.
function questionsOf(selfCheck) {
  const list = selfCheck.querySelector(":scope > ol");
  if (!list) return [];
  const textOf = li => [...li.childNodes]
    .filter(node => !(node.nodeType === 1 && node.matches("ol, textarea")))
    .map(node => node.textContent).join("").replace(/\s+/g, " ").trim();
  const questions = [];
  [...list.children].forEach((li, i) => {
    const number = `${i + 1}`;
    const subs = li.querySelector(":scope > ol");
    if (!subs) return questions.push({ li, label: number, text: textOf(li) });
    const stem = textOf(li);
    [...subs.children].forEach((sub, j) => {
      const label = `${number}${String.fromCharCode(97 + j)}`;
      questions.push({ li: sub, label, text: `${stem} ${label}) ${textOf(sub)}` });
    });
  });
  return questions;
}

// One answer box per question, right under it, and one Check button for the whole
// self-check, which sends every answer at once, labeled with its question's number.
// A self-check without an <ol> of questions gets a single box.
function addAnswerBox(selfCheck) {
  const { heading, context } = sectionOf(selfCheck);
  const questionsAndAnswers = selfCheck.textContent;  // read before the boxes are added
  let questions = questionsOf(selfCheck);
  const single = questions.length === 0;
  if (single) questions = [{ li: null, label: "", text: "" }];

  const controls = document.createElement("div");
  controls.className = "answer";
  controls.innerHTML = `
    <div class="row"><button type="button">Check</button><span class="status"></span></div>
    <div class="result"></div>`;
  const answers = selfCheck.querySelector("details.answers");
  answers ? answers.before(controls) : selfCheck.append(controls);

  const boxes = questions.map(q => {
    const textarea = document.createElement("textarea");
    textarea.className = "answer-box";
    textarea.placeholder = "Your answer, in your own words.";
    textarea.setAttribute("aria-label", single ? "Your answer" : `Your answer to ${q.label}`);
    q.li ? q.li.append(textarea) : controls.before(textarea);
    const key = draftKey(`${heading}#${q.label}`);
    textarea.value = load(key);
    textarea.addEventListener("input", () => store(key, textarea.value));
    return { ...q, textarea };
  });

  const button = controls.querySelector("button");
  const status = controls.querySelector(".status");
  const result = controls.querySelector(".result");

  if (!served) {
    button.disabled = true;
    status.textContent = "Checking needs the local server: run `just material <project> <NN>`.";
    return;
  }

  button.addEventListener("click", async () => {
    const empty = boxes.find(b => !b.textarea.value.trim());
    if (empty) {
      status.textContent = single ? "Write your answer first." : `Answer every question first (${empty.label} is empty).`;
      empty.textarea.focus();
      return;
    }
    const answer = single
      ? boxes[0].textarea.value.trim()
      : boxes.map(b => `${b.label}) ${b.text}\nHer answer: ${b.textarea.value.trim()}`).join("\n\n");
    button.disabled = true;
    status.textContent = "Claude is reading your answers…";
    result.replaceChildren();
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ page: location.pathname, heading, context, selfcheck: questionsAndAnswers, answer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || response.statusText);
      showFeedback(result, data);
      status.textContent = "";
    } catch (error) {
      status.textContent = `Couldn't check it: ${error.message}`;
    } finally {
      button.disabled = false;
    }
  });
}

// ---- Implementation checks -----------------------------------------------------

async function post(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || response.statusText);
  return data;
}

function addImplCheck(implCheck) {
  const { heading, context } = sectionOf(implCheck);
  const dir = implCheck.dataset.dir;
  const box = document.createElement("div");
  box.className = "answer";
  box.innerHTML = `
    <div class="row">
      <button type="button" class="verify">Verify my implementation</button>
      <button type="button" class="secondary help-toggle" aria-expanded="false">I'm stuck</button>
      <span class="status"></span>
    </div>
    <div class="result"></div>
    <div class="help" hidden>
      <textarea class="answer-box" aria-label="Where are you stuck?" placeholder="Where are you stuck? What did you try, and what happened?"></textarea>
      <div class="row"><button type="button" class="ask">Ask for a nudge</button><span class="status"></span></div>
      <div class="result"></div>
    </div>`;
  implCheck.append(box);

  const verify = box.querySelector(".verify");
  const status = box.querySelector(".row .status");
  const result = box.querySelector(".result");
  const toggle = box.querySelector(".help-toggle");
  const help = box.querySelector(".help");
  const question = help.querySelector("textarea");
  const ask = help.querySelector(".ask");
  const helpStatus = help.querySelector(".status");
  const helpResult = help.querySelector(".result");

  const key = draftKey(`${heading}#help`);
  question.value = load(key);
  question.addEventListener("input", () => store(key, question.value));
  toggle.addEventListener("click", () => {
    help.hidden = !help.hidden;
    toggle.setAttribute("aria-expanded", String(!help.hidden));
    if (!help.hidden) question.focus();
  });

  if (!served) {
    verify.disabled = ask.disabled = true;
    status.textContent = "Checking needs the local server: run `just material <project> <NN>`.";
    return;
  }

  verify.addEventListener("click", async () => {
    verify.disabled = true;
    status.textContent = "Claude is reading your code and running the tests…";
    result.replaceChildren();
    try {
      showFeedback(result, await post("/api/verify", { page: location.pathname, heading, context, dir }));
      status.textContent = "";
    } catch (error) {
      status.textContent = `Couldn't verify it: ${error.message}`;
    } finally {
      verify.disabled = false;
    }
  });

  ask.addEventListener("click", async () => {
    if (!question.value.trim()) { question.focus(); return; }
    ask.disabled = true;
    helpStatus.textContent = "Claude is looking at your code…";
    helpResult.replaceChildren();
    try {
      const data = await post("/api/help", { page: location.pathname, heading, context, dir, question: question.value.trim() });
      showFeedback(helpResult, { verdict: "help", feedback: data.reply, logged: data.logged });
      helpStatus.textContent = "";
    } catch (error) {
      helpStatus.textContent = `Couldn't ask: ${error.message}`;
    } finally {
      ask.disabled = false;
    }
  });
}

const VERDICTS = { "correct": "Correct.", "pass": "Pass.", "partly": "Partly there.", "not-yet": "Not yet.", "help": "Nudge:" };

function showFeedback(target, { verdict, feedback, logged }) {
  const box = document.createElement("div");
  box.className = `feedback ${verdict}`;
  const body = paragraphs(feedback);
  const first = body.firstElementChild;
  const label = document.createElement("span");
  label.className = "verdict";
  label.textContent = VERDICTS[verdict] || verdict;
  first.prepend(label, " ");
  box.append(...body.children);
  if (logged) {
    const note = document.createElement("div");
    note.className = "logged";
    note.textContent = "Logged to STUCK.md, so the material can get better here.";
    box.append(note);
  }
  target.replaceChildren(box);
}
