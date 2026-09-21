// server.js (secure-ish version): the v1 server with the book's fixes layered on.
//
// Each fix is tagged CHAPTER 17/18/25 so you can find the chapter that explains it.
// FAKE_TOKEN is a stand-in for real auth. It is NOT secure. Real apps use signed sessions.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4321;
const DB_FILE = path.join(__dirname, "db.json");
const MAX_BODY_BYTES = 50 * 1024; // CHAPTER 18: 50 KB is plenty for our tiny state
const FAKE_TOKEN = "letmein";      // CHAPTER 17: a stand-in for real auth, NOT secure

// Reads secrets.env (KEY=VALUE lines) into a plain object.
function readSecrets() {
  const file = path.join(__dirname, "secrets.env");
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && key.trim()) out[key.trim()] = rest.join("=").trim();
  }
  return out;
}

const secrets = readSecrets();
if (!secrets.AI_KEY) {
  console.error("Missing AI_KEY. Copy secrets.env.example to secrets.env and try again.");
  process.exit(1);
}

// Sends a JSON reply with the given status code.
function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}

// Collects the body, stops early if it is too big, then hands back parsed JSON (or null).
function readBody(req, res, done) {
  let raw = "";
  let tooBig = false;
  req.on("data", (chunk) => {
    raw += chunk;
    // CHAPTER 18: refuse huge bodies instead of letting them eat memory.
    if (raw.length > MAX_BODY_BYTES && !tooBig) {
      tooBig = true;
      sendJSON(res, 413, { error: "body too large, 50 KB max" });
      req.destroy();
    }
  });
  req.on("end", () => {
    if (tooBig) return;
    try { done(JSON.parse(raw || "{}")); } catch (err) { done(null); }
  });
}

// Picks one of a few canned replies that mention the north star.
function fakeReply(message) {
  const star = message || "your north star";
  const options = [
    "Still working toward " + star + "? One hold a day is enough.",
    "Nothing about " + star + " happens without today. Go.",
    "You wrote " + star + ". Now make one small move on it.",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// Serves a plain file from this folder (the html, css and js the page needs).
function serveFile(res, urlPath) {
  const name = urlPath === "/" ? "index.html" : urlPath.slice(1);
  const file = path.join(__dirname, path.basename(name));
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
  fs.readFile(file, (err, data) => {
    if (err) return sendJSON(res, 404, { error: "not found" });
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "text/plain" });
    res.end(data);
  });
}

// CHAPTER 17: who is asking? The FAKE_TOKEN header must match, and we need an owner name.
function checkAuth(req) {
  const owner = req.headers["x-owner"];
  return owner && /^[a-z0-9_-]{1,40}$/i.test(owner) ? owner : null;
}

// CHAPTER 18: is the posted state shaped the way we expect? Returns a plain message or null.
function validateState(body) {
  if (!body || typeof body !== "object") return "body must be an object";
  if (typeof body.northStar !== "string") return "northStar must be text";
  if (body.northStar.length > 200) return "northStar is too long, 200 characters max";
  if (!Number.isInteger(body.streak) || body.streak < 0) return "streak must be a whole number, 0 or more";
  if (!Number.isInteger(body.revision) || body.revision < 0) return "revision must be a whole number";
  return null;
}

// Loads db.json as an object keyed by owner, or {} if it is missing.
function loadDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

// Handles POST /api/sync: auth, validate, check the revision, then save under the owner.
function handleSync(req, res) {
  const owner = checkAuth(req);
  if (!owner) return sendJSON(res, 401, { error: "missing or wrong FAKE_TOKEN or X-Owner" });
  readBody(req, res, (body) => {
    if (!body) return sendJSON(res, 400, { error: "bad json" });
    const problem = validateState(body);
    if (problem) return sendJSON(res, 400, { error: problem });
    const db = loadDB();                       // CHAPTER 25: one file, one slot per owner
    const current = db[owner];
    // CHAPTER 25: the client must send the revision it last saw. If it is behind, say so.
    if (current && body.revision !== current.revision) {
      return sendJSON(res, 409, { error: "conflict, reload and try again", revision: current.revision });
    }
    body.revision = body.revision + 1;
    db[owner] = body;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    sendJSON(res, 200, { ok: true, revision: body.revision });
  });
}

// Handles GET /api/sync: returns only the caller's own slot, never everyone's.
function handleGetSync(req, res) {
  const owner = checkAuth(req);
  if (!owner) return sendJSON(res, 401, { error: "missing or wrong FAKE_TOKEN or X-Owner" });
  sendJSON(res, 200, loadDB()[owner] || {});
}

// Decides what to do with each request that comes in.
function route(req, res) {
  const url = req.url.split("?")[0];
  console.log(new Date().toLocaleTimeString(), req.method, url);
  if (!url.startsWith("/api/")) return serveFile(res, url);
  if (req.method === "POST" && url === "/api/ai") {
    return readBody(req, res, (body) => {
      if (!body) return sendJSON(res, 400, { error: "bad json" });
      setTimeout(() => sendJSON(res, 200, { reply: fakeReply(body.message) }), 600);
    });
  }
  if (req.method === "POST" && url === "/api/sync") return handleSync(req, res);
  if (req.method === "GET" && url === "/api/sync") return handleGetSync(req, res);
  sendJSON(res, 404, { error: "not found" });
}

// CHAPTER 18: wrap every request so a crash becomes a clean 500, never a raw stack trace.
function handle(req, res) {
  try {
    route(req, res);
  } catch (err) {
    console.error("handler failed:", err);
    sendJSON(res, 500, { error: "something went wrong on the server" });
  }
}

http.createServer(handle).listen(PORT, () => {
  console.log("Memento Jr (secure-ish) server on http://localhost:" + PORT);
});
