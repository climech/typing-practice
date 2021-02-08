"use strict";

const LETTERS_LOWER = "abcdefghijklmnopqrstuvwxyz";
const LETTERS_UPPER = LETTERS_LOWER.toUpperCase();
const DIGITS = "0123456789";
const PUNCTUATION = "`~!@#$%^&*()_+-=[]\\{}|;':\",./<>?";

const STATE = {
  bufferSize: 25,
  given: "",
  typed: "",
  focused: false,
  settings: {
    lettersLower: 4,
    lettersUpper: 1,
    digits: 2,
    punctuation: 2,
    maxWordLength: 12,
  },
};

function randomChoice(collection) {
  const n = Math.floor(Math.random() * collection.length);
  return collection[n];
}

function makeCharset() {
  const s = STATE.settings;
  return (
    LETTERS_LOWER.repeat(s.lettersLower) +
    LETTERS_UPPER.repeat(s.lettersUpper) +
    DIGITS.repeat(s.digits) +
    PUNCTUATION.repeat(s.punctuation)
  );
}

function randomWord() {
  const length = Math.floor(Math.random() * STATE.settings.maxWordLength + 1);
  const charset = makeCharset();
  return [...new Array(length)].map(() => randomChoice(charset)).join("");
}

const resetCells = (parent) => {
  const bs = STATE.bufferSize;
  const divs = parent.querySelectorAll("div");
  if (divs.length !== bs) {
    divs.forEach((d) => d.remove());
    parent.append(
      ...[...new Array(bs)].map(() => document.createElement("div"))
    );
  } else {
    divs.forEach((d) => {
      d.className = "";
      d.textContent = "";
    });
  }
};

function updateUI(root) {
  const elemGiven = root.querySelector(".given");
  const elemTyped = root.querySelector(".typed");
  const elemCount = root.querySelector(".count");

  resetCells(elemGiven);
  resetCells(elemTyped);

  const cellsGiven = elemGiven.querySelectorAll("div");
  const cellsTyped = elemTyped.querySelectorAll("div");
  const bs = STATE.bufferSize;
  const mid = Math.floor(bs / 2);
  const d = STATE.typed.length - mid;
  const given = d < 0 ? STATE.given.slice(0, bs) : STATE.given.slice(d, d + bs);
  const typed = d < 0 ? STATE.typed : STATE.typed.slice(d);

  // Fill the cells.
  [...given].forEach((c, i) => (cellsGiven[i].textContent = c));
  [...typed].forEach((c, i) => (cellsTyped[i].textContent = c));

  // Highlight current char.
  cellsGiven[typed.length].classList.add("hl");
  if (STATE.focused) {
    cellsTyped[typed.length].classList.add("hl", "animated");
  }

  // Highlight errors.
  [...typed].forEach((c, i) => {
    if (given[i] !== c) {
      cellsGiven[i].classList.add("err");
      cellsTyped[i].classList.add("err");
    }
  });

  elemCount.textContent = `Total: ${STATE.typed.length}`;
}

function advance(char) {
  STATE.typed += char;
  const bs = STATE.bufferSize;
  if (STATE.given.length <= STATE.typed.length + Math.floor(bs / 2)) {
    STATE.given += " " + randomWord();
  }
}

function backup() {
  STATE.typed = STATE.typed.slice(0, -1);
}

function escapeRegExp(str) {
  return str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, "\\$&");
}

function init() {
  const app = document.getElementById("app");
  const input = app.querySelector("input");

  input.addEventListener("focus", () => {
    STATE.focused = true;
    updateUI(app);
  });

  input.addEventListener("blur", () => {
    STATE.focused = false;
    updateUI(app);
  });

  input.addEventListener("keydown", (e) => {
    const charsetRegExp = new RegExp(
      `^[a-zA-Z0-9 ${escapeRegExp(PUNCTUATION)}]\$`
    );
    if (e.key === "Backspace") {
      backup();
    } else if (!e.ctrlKey && e.key.match(charsetRegExp)) {
      advance(e.key);
    } else {
      return;
    }
    e.preventDefault();
    updateUI(app);
  });

  STATE.given = randomWord();
  while (STATE.given.length < STATE.bufferSize * 5) {
    STATE.given += " " + randomWord();
  }

  input.focus();
  updateUI(app);
}

init();
