# Memento Jr, the practice sandbox

A tiny app you can read top to bottom. One text field, one hold-to-complete button, one streak. It exists so the book has something small and real to point at.

Nothing here can touch the real Memento.

## What each folder is

- `v1/` is the plain JavaScript version. Start here. Four files for the page (`index.html`, `style.css`, `state.js`, `app.js`) and one optional server (`server.js`).
- `v1-secure/` is the same page with `server.js` evolved: a fake token, per-owner data, a body size limit, input checks, a revision number, and a try/catch around everything. Each addition is tagged `CHAPTER 17/18/25:` so you can find the chapter that explains it. The token is called `FAKE_TOKEN` because it is fake. Do not ship it.
- `v2/` is the same app in TypeScript. `state.ts` and `app.ts` have types. `app.js` is those two files with the types stripped by hand, and it is what the browser actually runs. `v2/errors/app.ts` has six deliberate type errors for you to find. Answers are in `v2/errors/ANSWERS.md`.

## How to open v1

Option A, no server: double-click `v1/index.html`. Everything works except the two bottom buttons, which will say "server not running, that is fine, this is a later chapter".

Option B, with the server:

```
cd v1
cp secrets.env.example secrets.env
node server.js
```

Then open http://localhost:4321 in a browser. Now "Ask the (fake) AI" and "Sync" work too. The server prints one line per request.

If you skip the `cp` step the server stops right away and says `Missing AI_KEY`. That is on purpose.

## What you should see on first load

- A card titled "Memento Jr".
- An empty field under "Your north star".
- A round button that says "Hold to complete" with a faint ring around it.
- Two boxes: `0` over "day streak", and `never` over "last completed".
- Two small buttons, "Ask the (fake) AI" and "Sync", with an empty line under them.
- A small "Reset everything" link at the bottom.

Type something in the field, then press and hold the round button for three seconds. The ring fills green. When it closes, the streak becomes `1`, "last completed" shows today's date, and the button says "Done for today". Reload the page and it all sticks. Letting go early empties the ring and nothing changes.

## How to reset

- The page: click "Reset everything" at the bottom. It clears the saved data in your browser (localStorage key `mementojr_v1`, or `mementojr_v2` in v2).
- The server: `rm db.json` in the folder you ran it from. Also `rm secrets.env` if you want to see the missing-key message again.

## v1-secure, quick test

```
cd v1-secure
cp secrets.env.example secrets.env
node server.js
```

Sync from the page works because the page sends the fake token and an owner name. Try it from the command line without the token and you get a 401:

```
curl -s -X POST http://localhost:4321/api/sync -d '{}'
```
