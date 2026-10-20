// Shared script for learning material and its explanatory visuals.
// See "Material format" in loop.md.
//
// - In a visual embedded in a material page: report the page's height to the parent.
// - In a material page: size each embedded visual's iframe to the height it reports,
//   and put an answer box in each self-check (<section class="self-check">), after the
//   questions and before the folded reference answers.
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
    if (node.matches("figure, details, section.self-check")) continue;
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

function addAnswerBox(selfCheck) {
  const { heading, context } = sectionOf(selfCheck);
  const questionsAndAnswers = selfCheck.textContent;  // read before the box is added
  const id = `answer-${Math.random().toString(36).slice(2, 8)}`;
  const form = document.createElement("form");
  form.className = "answer";
  form.innerHTML = `
    <label for="${id}">Your answer</label>
    <textarea id="${id}" placeholder="Answer the questions above in your own words. Number them if there are several."></textarea>
    <div class="row"><button type="submit">Check</button><span class="status"></span></div>
    <div class="result"></div>`;
  const answers = selfCheck.querySelector("details.answers");
  answers ? answers.before(form) : selfCheck.append(form);

  const textarea = form.querySelector("textarea");
  const button = form.querySelector("button");
  const status = form.querySelector(".status");
  const result = form.querySelector(".result");
  const key = draftKey(heading);
  textarea.value = load(key);
  textarea.addEventListener("input", () => store(key, textarea.value));

  if (!served) {
    button.disabled = true;
    status.textContent = "Checking needs the local server: run `just material <project> <NN>`.";
    return;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const answer = textarea.value.trim();
    if (!answer) { textarea.focus(); return; }
    button.disabled = true;
    status.textContent = "Claude is reading your answer…";
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

const VERDICTS = { "correct": "Correct.", "partly": "Partly there.", "not-yet": "Not yet." };

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
