// app.js: connects the screen to the data. Reads state, updates the page, handles taps.

const HOLD_MS = 3000;    // how long you have to hold, in milliseconds
const RING_LENGTH = 283; // matches stroke-dasharray in style.css
let holdStart = null;    // when the current hold began, or null if not holding
let holdFrame = null;    // the animation frame we are waiting on

// Shortcut for grabbing an element by its id.
function el(id) {
  return document.getElementById(id);
}

// Paints the current state onto the page.
function render() {
  el("north-star").value = state.northStar;
  el("streak-count").textContent = String(state.streak);
  el("last").textContent = state.lastCompleted || "never";
  const doneToday = state.lastCompleted === dayKey(new Date());
  el("hold").classList.toggle("done", doneToday);
  el("hold-label").textContent = doneToday ? "Done for today" : "Hold to complete";
}

// Shows a short note under the buttons.
function say(text) {
  el("message").textContent = text;
}

// Moves the green ring to a fraction between 0 (empty) and 1 (full).
function setRing(fraction) {
  el("ring-fill").style.strokeDashoffset = String(RING_LENGTH * (1 - fraction));
}

// Called when the user starts holding the button.
function startHold() {
  if (holdStart !== null) return; // already holding
  holdStart = Date.now();
  tickHold();
}

// Runs every animation frame while holding, fills the ring, finishes at 3s.
function tickHold() {
  if (holdStart === null) return;
  const fraction = Math.min(1, (Date.now() - holdStart) / HOLD_MS);
  setRing(fraction);
  if (fraction < 1) { holdFrame = requestAnimationFrame(tickHold); return; }
  holdStart = null;
  completeToday();
  render();
}

// Called when the user lets go early. Empties the ring.
function cancelHold() {
  if (holdStart === null) return;
  holdStart = null;
  cancelAnimationFrame(holdFrame);
  setRing(0);
}

// Sends JSON to the server and gives back the parsed reply. Throws if anything fails.
async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("bad status " + res.status);
  return res.json();
}

// Sends the north star to the fake AI on the server and shows what comes back.
async function askAI() {
  say("thinking...");
  try {
    const data = await postJSON("/api/ai", { message: state.northStar });
    say(data.reply);
  } catch (err) {
    say("server not running, that is fine, this is a later chapter");
  }
}

// Sends the whole state to the server so it gets written to db.json.
async function syncState() {
  say("syncing...");
  try {
    await postJSON("/api/sync", state);
    say("synced");
  } catch (err) {
    say("server not running, that is fine, this is a later chapter");
  }
}

// True for the two keys that count as "holding" on the keyboard.
function isHoldKey(e) {
  return e.key === " " || e.key === "Enter";
}

// Hooks up every button and field once, when the page loads.
function wireEvents() {
  el("north-star").addEventListener("input", (e) => {
    state.northStar = e.target.value;
    persistState();
  });
  const hold = el("hold");
  hold.addEventListener("pointerdown", startHold);
  hold.addEventListener("pointerup", cancelHold);
  hold.addEventListener("pointerleave", cancelHold);
  hold.addEventListener("pointercancel", cancelHold);
  // Keyboard: holding Space or Enter works like holding the mouse down.
  hold.addEventListener("keydown", (e) => { if (isHoldKey(e)) { e.preventDefault(); startHold(); } });
  hold.addEventListener("keyup", (e) => { if (isHoldKey(e)) cancelHold(); });
  el("ask").addEventListener("click", askAI);
  el("sync").addEventListener("click", syncState);
  el("reset").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Reset everything?")) { resetState(); setRing(0); render(); say(""); }
  });
}

// Boot: load what was saved, draw it, then start listening.
loadState();
render();
wireEvents();
