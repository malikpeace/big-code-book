// errors/app.ts: the practice copy. Six type errors hide in here. Find them with tsc.
// (The State type and the state.ts functions are declared up top so this file checks alone.)

type State = { northStar: string; streak: number; lastCompleted: string | null; history: string[] };
declare let state: State;
declare function dayKey(date: Date): string;
declare function persistState(): void;
declare function completeToday(): void;
declare function resetState(): void;


const HOLD_MS: number = 3000;    // how long you have to hold, in milliseconds
const RING_LENGTH: number = 283; // matches stroke-dasharray in style.css
let holdStart: number | null = null; // when the current hold began, or null if not holding
let holdFrame: number = 0;           // the animation frame we are waiting on

// Shortcut for grabbing an element by its id. Throws a clear error if it is missing.
function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error("missing element #" + id);
  return node as T;
}

// Paints the current state onto the page.
function render(): void {
  el<HTMLInputElement>("north-star").value = state.northStar;
  state.streak = "0"; // error 1
  el("streak").textContent = String(state.streak);
  el("last").textContent = state.lastDone || "never"; // error 2
  const doneToday = state.lastCompleted === dayKey(new Date());
  el("hold").classList.toggle("done", doneToday);
  el("hold-label").textContent = doneToday ? "Done for today" : "Hold to complete";
}

// Shows a short note under the buttons.
function say(text: string): void {
  document.getElementById("message").textContent = text; // error 3
}

// Moves the green ring to a fraction between 0 (empty) and 1 (full).
function setRing(fraction: number): void {
  el("ring-fill").style.strokeDashoffset = String(RING_LENGTH * (1 - fraction));
}

// Called when the user starts holding the button.
function startHold(): void {
  if (holdStart !== null) return; // already holding
  holdStart = Date.now();
  tickHold();
}

// Runs every animation frame while holding, fills the ring, finishes at 3s.
function tickHold(): void {
  if (holdStart === null) return;
  const fraction = Math.min(1, (Date.now() - holdStart) / HOLD_MS);
  setRing(fraction);
  if (fraction < 1) { holdFrame = requestAnimationFrame(tickHold); return; }
  holdStart = null;
  completeToday();
  render();
}

// Called when the user lets go early. Empties the ring.
function cancelHold(): void {
  if (holdStart === null) return;
  holdStart = null;
  cancelAnimationFrame(holdFrame);
  setRing(); // error 5
}

// Sends JSON to the server and gives back the parsed reply. Throws if anything fails.
async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("bad status " + res.status);
  return res.json() as Promise<T>;
}

// Sends the north star to the fake AI on the server and shows what comes back.
async function askAI(): Promise<void> {
  say("thinking...");
  try {
    const data = await postJSON<{ reply: string }>("/api/ai", { message: state.northStar });
    say(data.reply);
  } catch (err) {
    say("server not running, that is fine, this is a later chapter");
  }
}

// Sends the whole state to the server so it gets written to db.json.
async function syncState(): Promise<void> {
  say("syncing...");
  try {
    await postJSON("/api/sync", state);
    say("synced");
  } catch (err) {
    say("server not running, that is fine, this is a later chapter");
  }
}

// True for the two keys that count as "holding" on the keyboard.
function isHoldKey(e: KeyboardEvent): boolean {
  return e.key; // error 4
}

// Hooks up every button and field once, when the page loads.
function wireEvents(): void {
  el<HTMLInputElement>("north-star").addEventListener("input", (e: Event) => {
    state.northstar = (e.target as HTMLInputElement).value; // error 6
    persistState();
  });
  const hold = el<HTMLButtonElement>("hold");
  hold.addEventListener("pointerdown", startHold);
  hold.addEventListener("pointerup", cancelHold);
  hold.addEventListener("pointerleave", cancelHold);
  hold.addEventListener("pointercancel", cancelHold);
  // Keyboard: holding Space or Enter works like holding the mouse down.
  hold.addEventListener("keydown", (e: KeyboardEvent) => { if (isHoldKey(e)) { e.preventDefault(); startHold(); } });
  hold.addEventListener("keyup", (e: KeyboardEvent) => { if (isHoldKey(e)) cancelHold(); });
  el("ask").addEventListener("click", askAI);
  el("sync").addEventListener("click", syncState);
  el("reset").addEventListener("click", (e: Event) => {
    e.preventDefault();
    if (confirm("Reset everything?")) { resetState(); setRing(0); render(); say(""); }
  });
}

// Boot: load what was saved, draw it, then start listening.
loadState();
render();
wireEvents();
