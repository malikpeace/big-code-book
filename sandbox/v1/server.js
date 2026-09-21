// server.js: a tiny practice server for Memento Jr.
//
// INTENTIONALLY INCOMPLETE: no auth, no limits, no owner scoping.
// Chapters 17, 18, 25 of the book fix this. Never copy this server into a real app.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4321;
const DB_FILE = path.join(__dirname, "db.json");

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

// Collects the whole request body, then hands it back as parsed JSON (or null if it was bad).
function readBody(req, done) {
  let raw = "";
  req.on("data", (chunk) => { raw += chunk; });
  req.on("end", () => {
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

// Decides what to do with each request that comes in.
function handle(req, res) {
  const url = req.url.split("?")[0];
  console.log(new Date().toLocaleTimeString(), req.method, url);
  if (!url.startsWith("/api/")) return serveFile(res, url);
  if (req.method === "POST" && url === "/api/ai") {
    return readBody(req, (body) => {
      if (!body) return sendJSON(res, 400, { error: "bad json" });
      setTimeout(() => sendJSON(res, 200, { reply: fakeReply(body.message) }), 600);
    });
  }
  if (req.method === "POST" && url === "/api/sync") {
    return readBody(req, (body) => {
      if (!body) return sendJSON(res, 400, { error: "bad json" });
      fs.writeFileSync(DB_FILE, JSON.stringify(body, null, 2));
      sendJSON(res, 200, { ok: true });
    });
  }
  if (req.method === "GET" && url === "/api/sync") {
    if (!fs.existsSync(DB_FILE)) return sendJSON(res, 200, {});
    return sendJSON(res, 200, JSON.parse(fs.readFileSync(DB_FILE, "utf8")));
  }
  sendJSON(res, 404, { error: "not found" });
}

http.createServer(handle).listen(PORT, () => {
  console.log("Memento Jr server on http://localhost:" + PORT);
});
