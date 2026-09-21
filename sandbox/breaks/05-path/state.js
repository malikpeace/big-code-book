// state.js: the one place our data lives, plus saving and loading it.

// What a brand new user starts with.
const DEFAULT_STATE = { northStar: "", streak: 0, lastCompleted: null, history: [] };

// The live copy of the data. Everything reads and writes this one object.
let state = { ...DEFAULT_STATE };

// Where we keep the data in the browser.
const STORAGE_KEY = "mementojr_v1";

// Turns a date into a short "YYYY-MM-DD" text, in the user's own timezone.
function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

// Gets the saved data back from the browser, or the defaults if there is none.
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (err) {
    state = { ...DEFAULT_STATE };
  }
}

// Writes the data to the browser right now.
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("could not save", err);
  }
}

// Saves, but waits 150ms first, so we do not write on every keystroke.
let saveTimer = null;
function persistState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 150);
}

// Marks today as done and bumps the streak the right way.
function completeToday() {
  const today = dayKey(new Date());
  if (state.lastCompleted === today) return; // already done today, nothing to do

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (state.lastCompleted === dayKey(yesterday)) {
    state.streak = state.streak + 1; // kept the chain going
  } else {
    state.streak = 1; // chain broke, start fresh
  }
  state.lastCompleted = today;
  state.history.push(today);
  persistState();
}

// Throws everything away and starts over.
function resetState() {
  state = { ...DEFAULT_STATE, history: [] };
  saveState();
}
