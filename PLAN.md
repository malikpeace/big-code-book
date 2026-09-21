# BIG CODE BOOK: the plan

Status: v2, 2026-09-20, by Fable. Merges Codex review findings 1-6, 8-12, 14-19, 21-25 and Malik's answers. Declined: 13 (Malik keeps 30 chapters), 20 (Malik picked diagrams as a learning style), 7 (Malik keeps the paste-able why-question), 5 (Malik deferred sync). Awaiting Malik's approval. No chapter is written until he says go.

Title: **BIG CODE BOOK** (Malik's pick).

---

## 0. The contract (what Malik and Fable agreed on 2026-09-20)

- **Who:** Malik. Recognizes the words, not the meaning. Runs a SaaS built by two AI agents. Refuses to be the founder who understands nothing.
- **Goal:** technical-founder competence plus junior-level reading skill. Graduation is gated on what Malik can DO (section 1 and the rubric in chapter 30), not on the calendar; six weeks is the target, retakes are normal. Can open an unfamiliar codebase and find his way, read real code and say what it does, use a terminal without fear, understand git, the frontend/backend/database/API split, environments, data flow, auth, databases, packages, errors, testing, security, performance, architecture, deployment, enough JS/TS/React Native to read Memento, make small changes, and spot obvious bullshit in AI-generated code. Not god tier. Not dependent.
- **Time:** ~1 hour a day, 6 weeks, one chapter per sitting, rest days allowed. 30 chapters, about 30-35 hours.
- **Format:** a local website in `~/Downloads/CODE-BOOK` (its own git repo). Mac = full experience. Phone = reading + in-page JavaScript sandboxes. Terminal, git, and native exercises show: "Mac only. Skip, or continue on your Mac."
- **Memento is READ-ONLY** for this project. Read it, quote it, screenshot it. Never modify, commit, install, format, or write anything in `~/Downloads/MEMENTO`. Anything that must RUN (tests, the native app) runs in a disposable, gitignored copy under `CODE-BOOK/lab/memento-native/` exported from the pinned commit. The one exception is the graduation chapter, on a branch, only with Malik's explicit permission at that moment.
- **Two pins, not one.** Web: the frozen commit `ca8afc8` (v1378). Native: a reviewed commit on the migration branch that contains the taught files (main has almost no native code; Codex records the hash in `research/MEMENTO-PIN`). Every citation names its pin.
- **Git practice happens in a disposable `git-lab/` repo** with a one-command reset, never in the book repo itself.
- **Practice code:** Memento Jr, a tiny fake app built for the book. Every break-it/fix-it exercise happens there.
- **Language path:** JavaScript first, TypeScript layered in (week 5), React Native at the end. Other languages get cameos: what it is, who uses it, whether Memento touches it.
- **Every concept follows one pattern:** universal idea → generic example → Memento's real vendor and code → the alternative → why Memento chose it.
- **Every topic is tagged:** YOU NEED THIS / ENGINEER KNOWLEDGE / RABBIT HOLE.
- **Glossary evolves.** A term is defined in one plain sentence the first time it appears, and the definition is upgraded in later chapters.
- **Analogies are scaffolding.** Every analogy is labelled temporary and the chapter says where it breaks and what the real model is.
- **Voice:** casual, blunt, swearing allowed, Hormozi-style. Small doses of mindset and business. No "build it all by hand without AI" track.
- **Split:** Fable owns curriculum and prose (one voice). Codex owns visuals, interactives, the Memento Jr build, and adversarial fact-checking. Handoff via files in this repo. Malik relays.
- **Heavy quizzing later.** For now: a 2-minute recap and a 3-question check per chapter, plus three practical checkpoints (end of weeks 2, 4, 6) that gate graduation.
- **Hosting:** GitHub Pages from a private repo (the site itself is public by URL). A simple client-side passphrase gate in front, which is obscurity, not security, and the plan says so. No Memento secrets are ever quoted, only code structure.
- **Progress is local per device** (localStorage). Cross-device highlights and notes are deferred; noted as a later feature.

---

## 1. What "graduated" means (the competency list)

Everything below is what Malik can DO at the end, grouped, tagged. This list is the finish line the curriculum works backward from. Sources: Dropbox IC2 ladder, SFIA level 2-3, Willison, Osmani, Beck, Thoughtworks, Anthropic and OpenAI agent guidance (see research/research-pedagogy.md §3).

### YOU NEED THIS (necessary to run Memento)
- **Reading code.** Open any file in Memento, say in plain words what it does, trace one function by hand, name its inputs, outputs and side effects, and spot a function doing two jobs.
- **The journey.** Draw, from memory, what happens when a Memento user taps "start Clarity": phone → JavaScript → network → Supabase edge function → Anthropic → back → state → localStorage/MMKV → Supabase sync. Say which parts run on the phone, which run on a server, and who pays for each.
- **Terminal.** Move around, list, find, grep, read a log, run a script, read `--help`, set an env var, kill a stuck process. Zero fear.
- **Git.** Explain a commit as a snapshot and history as a graph. Read status, diff, log. Explain branch, merge, conflict, pull request, revert. Know why `git add -A` is banned in Memento and why nobody force-pushes.
- **Architecture split.** Frontend vs backend vs database vs API vs server, and where each of Memento's pieces sits.
- **Environments.** Local vs dev vs staging vs production. What "deploy" actually does in Memento's two-repo mirror.
- **Data flow.** Where a piece of data is born, where it is transformed, where it is stored, what "source of truth" means, and why Memento's paid receipt is explicitly not authority.
- **Auth.** Identity vs permission. Sessions vs tokens. OAuth as a delegation handshake. Why the anon key is public and the Anthropic key is not. What Row Level Security is and what went wrong in the famous vibe-coding incidents (each a different trust-boundary failure).
- **Databases.** Tables, rows, keys, relations. Read a SELECT. Know what a migration is and why Memento has 33 of them.
- **Packages.** A dependency is borrowed code. package.json, lockfile, semver, `npm install` vs `npm ci`, why an upgrade is a change.
- **Errors.** Read a stack trace top down. Reproduce first. Tell syntax, runtime and logic errors apart. Read a console.
- **Testing.** What a test asserts. Run Memento's native suite and read one failure. Know that coverage is not correctness.
- **Security basics.** Trust boundaries, secrets never ship to the client, validate at the edges, least privilege, rate limits fail closed.
- **AI supervision.** Write a spec, read a plan, read a diff, verify a claim, spot a hallucination, catch a duplicate system, catch scope creep, decide understand-vs-delegate, test after a change, recover after a mess.
- **Codebase navigation.** Open a repo in an editor, use the file tree, project-wide search, go-to-definition and find-references, follow a `path:line` link, and run a repeatable ten-minute reconnaissance on an unfamiliar codebase.
- **Operations basics.** Know where Memento's logs, alerts, backups and bills live, what restoring a backup means, what to do first in an incident, and what each vendor costs.

### ENGINEER KNOWLEDGE (a junior should know it)
- HTTP verbs, status codes, headers, JSON bodies; server-sent events at a glance.
- State → render → events, one-way data flow, why frameworks exist.
- Reducers, hooks, components, props in React and React Native.
- TypeScript types as contracts; union types; why the compiler catches AI mistakes.
- Async, promises, the event loop; why `await` does not freeze the app.
- Build vs run; CI as a robot reviewer; rollbacks; cache busting.
- Coupling and cohesion; "where should this live"; writing a trade-off down.
- Performance: measure first, latency vs throughput, N+1, bundle size, caching.
- Native pipeline: Expo, dev builds, simulator, Xcode, App Store, the 15% cut.

### RABBIT HOLE (later, if ever)
- Big-O, algorithms, data structures beyond arrays and objects.
- Compilers, how the CPU pipeline works, memory management.
- Networking below HTTP (TCP, TLS internals, DNS resolution mechanics beyond "a phone book").
- Docker, Kubernetes, custom servers, load balancers.
- Other languages beyond cameo depth (Python, Swift, Go, C++, Rust, SQL beyond reading).

---

## 2. The teaching system

### 2.1 One chapter = one sitting (45-60 min)
1. **Recap** (2 min). Three sentences on what the last chapter installed.
2. **Check** (3 min). Three questions on earlier chapters, answers hidden until tapped. Retrieval practice, the single highest-leverage technique for adult learners (Dunlosky 2013; Hattie 2021).
3. **The idea** (15-20 min). Universal concept. The ELI5 analogy, labelled TEMPORARY. Then the real model, drawn. One Codex diagram per chapter.
4. **The generic example** (5 min). Ten lines of code that show it, in a sandbox that runs in the page.
5. **The Memento look** (10 min). The real file, the real lines, read-only, quoted into the page with a link to the path. Then: the alternative, and why Memento chose what it chose.
6. **The exercise** (15 min, kept small on purpose). Predict → run → investigate → modify (PRIMM). Usually in the in-page sandbox. Sometimes in Memento Jr on the Mac. Where it fits, one "break it, fix it": a planted bug with a hint ladder. Every lab states its exact working directory, the expected output, a reset command or button, and the sentence "this cannot touch Memento". From chapter 14 on, every exercise ends with one assertion (a tiny test) and one boundary check (what happens on bad input), so testing and security are habits before their own chapters.
7. **Ask the agent why** (2 min). One question to paste into Codex or Fable that asks for an explanation, never for a change. Anthropic's 2026 study: delegating cut comprehension by 17 points, asking conceptual questions preserved it.
8. **Words you now own** (1 min). The glossary delta: new terms and upgraded definitions.
9. **The analogy's expiry** (1 min). Where today's analogy breaks and what replaces it.

### 2.2 The analogy law
Every analogy gets a box: "TEMPORARY. Breaks when: ___. Real model: ___." The pedagogy research is blunt about this: a wrong analogy sticks (Hermans' box-vs-label variable experiment). So no analogy is ever the final word. Known ones that need their expiry stated up front: "everything is a file" (not on iOS, not for a database row), "JavaScript has one thread" (one main thread; workers and the native side run beside it), "a token is a ticket" (tokens expire, get refreshed, and can be revoked), and "events change state, never the screen" (that is React's declarative model; Memento's web app updates the DOM imperatively, and chapter 14 teaches both as alternatives).

### 2.3 The evolving glossary
`glossary.json` holds every term with a list of definitions, each tied to a chapter. In the page, a term shows the best definition the reader has reached so far. Example:

- **API**, ch. 2: "An agreed way for two programs to talk."
- **API**, ch. 15: "A contract: these URLs, these verbs, this JSON in, this JSON out, these status codes."
- **API**, ch. 16: "Memento's API is a handful of Supabase edge functions and one Postgres function; the client never talks to Anthropic or Polar directly."

The glossary page shows all terms, all levels, and which ones are still ahead of the reader.

### 2.4 The three tags
Every section header carries one: **NEED**, **ENGINEER**, or **RABBIT HOLE**. Rabbit holes are collapsed by default. Malik can skip every rabbit hole and still graduate.

### 2.5 Memento Jr (the practice app)
A tiny fake app built for the book. Same shapes as Memento, none of the size.
- **v1 (weeks 2-4), plain JavaScript, no build step:** `index.html`, `app.js`, `state.js`, `style.css`. One screen: a "north star" text field, a "hold to complete" button, a streak counter. Saves to localStorage. Later a fake sign-in and a fake AI call.
- **v1 server (week 4):** `server.js`, a 60-line Node server with two routes: `/api/ai` (fake AI reply) and `/api/sync` (writes a JSON file that plays the database). A `secrets.env` that the reader must keep out of git. Labelled INTENTIONALLY INCOMPLETE on its first page; chapters 17, 18 and 25 evolve it: owner-scoped data, input limits, error handling, revisions, real authorization. The fake sign-in token is always called a fake and never presented as real authentication.
- **v2 (week 5), TypeScript:** the same `app.ts` with types, to show what the compiler catches.
- **v3 (week 5), one React Native screen:** the hold-to-complete button as a component with `useState`, `useEffect`, read next to Memento's real `HoldToComplete.tsx`. Shown in the page as a prebuilt artifact (Codex compiles it once; react-native-web is not loadable from a CDN without a bundler) and run for real in the disposable native lab copy on the Mac.
- **Planted bugs:** `breaks/` folder, one per chapter that has a break-it exercise, each a copy of Memento Jr with one thing wrong, plus a three-step hint ladder and the fix.
- Codex builds Memento Jr. Fable writes the exercises against it.

### 2.6 Phone vs Mac
Every exercise carries a device badge. Sandboxes run in the page on both. Terminal, git, server, and native exercises show the "Mac only. Skip, or continue on your Mac" panel, and the progress tracker records the skip so the reader can come back.

### 2.7 Progress
Sidebar with 30 chapters, checkboxes, and a "you are here". Stored in the browser (localStorage), so the reader's first-hand contact with "where does my data live" is the book itself. Chapter 14 opens the book's own source to show it.

### 2.8 Separating general from Memento
Two visual lanes in every chapter. The left lane is universal (works for any app). The right lane is Memento (this file, this vendor, this decision). A reader who only reads the left lane learns software. A reader who reads both learns Memento. They are never mixed in one paragraph.

---

## 3. The curriculum: 30 chapters, 6 weeks

Legend: **SB** = in-page sandbox (phone + Mac). **MAC** = Terminal / Memento Jr / native, Mac only. **READ** = reading real Memento, any device.

### Week 1: The machine and the story (no typing yet, fear stays low)

**1. The machine does exactly what you say.** NEED.
Model: a CPU executes literal instructions on memory; there is no mind inside. Kills the "superbug" (Pea 1986): the belief the computer does what you meant. Doubly important now, because the AI agent does guess intent, and the reader must keep "the agent guesses" and "the machine obeys" as two different things. Memento look: `js/33-action-shim.js`, 38 lines where a human explains to the machine that a deleted feature's name must survive. SB: predict the output of five tiny literal programs.

**2. What happens when you tap a button.** NEED. The spine of the book.
Model: the journey. Finger → screen → JavaScript → state → network → server → database → back. Every later chapter zooms into one stop. Memento look: the Clarity tap traced end to end with real file names (`02-clarity-experience.js:475` → `03-ai-integration.js:3044` → `supabase/functions/ai-proxy/index.ts` → `01-state-foundation.js:488` → `12-cloud-sync.js:770` → the `sync_user_state` SQL). Codex's hero diagram: the Memento journey map, revisited in every chapter with the current stop lit up. READ + a card-sort of the stops.

**3. Seventy years of coding in one hour.** ENGINEER, with cameos.
Punch cards → Fortran and C (the compiler idea) → the web and JavaScript (1995) → open source, Git (2005), GitHub (2008) → cloud (2006) → App Store (2008) → Node and npm (2009-10) → TypeScript (2012) → React (2013), React Native (2015) → Firebase and Supabase (2020). Language cameos: what C, Python, Swift, Go, Rust, SQL each are for and whether Memento touches them (SQL yes, Swift under React Native, the rest no). Point of the chapter: everything under Memento is old. Only the typist is new. Exercise: place Memento's stack on the timeline.

**4. How AI ate coding, and what is actually true in 2026.** NEED.
Dated timeline: Copilot (2021-22), ChatGPT (Nov 2022), GPT-4, Cursor, Devin's overclaims, Claude 3.5 Sonnet (Jun 2024), "vibe coding" (Feb 2025), Claude Code (Feb 2025), Codex (Apr-May 2025), Claude 4 (May 2025), Opus 4.5 crossing 80% SWE-bench (Nov 2025, the "it got REALLY good" moment), Opus 4.6-4.8, Mythos Preview, Fable 5 / Sonnet 5 / Opus 5, GPT-5.5 / 5.6, Fable 5.1 (Sep 2026). The fears with receipts: METR's slower-but-felt-faster study, GitClear's 8x duplication, DORA's instability finding, the entry-level job data. The incidents: EnrichLead, the 170 Lovable apps, Replit deleting a production database, Moltbook. Three of them are the same bug and it is Memento's exact backend. Then the honest capability picture and the five habits to start today: read the plan, read the diff, ask why, demand a verification step, own the commit. Everything sourced (research/research-ai-timeline.md). Small dose of mindset: leverage is real, the bill is real, the human owns "done".

**5. Files, folders, paths, and opening code in an editor.** NEED. MAC.
Model: (almost) everything is a file; a path is an address; the app on your phone is a folder of files somewhere. Also: open Memento in an editor, use the file tree, project search, go-to-definition, find-references, and follow a `path:line` link. The ten-minute reconnaissance routine for any unfamiliar codebase. Open Terminal for the first time. `pwd`, `ls`, `cd`, `open .`, `cat`. Walk into `~/Downloads/MEMENTO/memento-app` and `memento-native/src` and just look. Memento look: the folder tree and why `memento-app/js` is numbered. Break-it: mistype a path, read the error, fix it. Phone: the panel.

### Week 2: The tools, then the language begins

**6. The terminal is a conversation.** NEED. MAC.
Model: a command is a program plus arguments; output comes back on two channels (stdout, stderr); every command ends with an exit code; PATH is where the shell looks for programs. `--help`, `grep`, `find`, `head`, `tail`, `echo`, env vars, `Ctrl-C`, killing a stuck process. Memento look: the `Open Memento (new modular).command` launcher and `package.json` scripts (`npm run check`). Break-it: run a command that fails on purpose, read the exit code.

**7. Git 1: snapshots and history.** NEED. MAC.
Model: a commit is a snapshot of the whole folder; history is a chain; the `.git` folder is the time machine. In the disposable `git-lab/` repo: `git status`, `git diff`, `git add <file>`, `git commit`, `git log`. Then READ Memento's `git log --oneline -20` and one `git show`. Why Memento bans `git add -A` (two agents, one tree). Codex's second hero diagram: the git graph.

**8. Git 2: branches, merges, conflicts, pull requests.** NEED. MAC.
Model: a branch is a pointer, not a copy; merge joins two lines of history; a conflict is two humans editing one line, not a breakage. Stage and resolve a conflict in `git-lab/`, then reset it with one command. Then the Fable/Codex protocol as a git story: `MIGRATION/01-MIGRATION-PLAN.md` ownership, "APPROVED @ <sha>", why one owner per file, `git pull --rebase`. Malik has been running this protocol for months; now he sees what it is.

**9. JavaScript 1: values, variables, types.** NEED. SB.
Model: a variable is a label on a value, not a box (the label model survives later chapters; the box model does not). Strings, numbers, booleans, null/undefined, arrays, objects. Memento look: `DEFAULT_STATE` in `01-state-foundation.js:35-60`, a person's life as one object. PRIMM: trace by hand, then run.

**10. JavaScript 2: functions and the call stack.** NEED. SB.
Model: a function is a recipe; calling it runs it; the stack is a pile of index cards. Parameters, return values, guard clauses. Memento look: `persistState()` (6 lines, `01-state-foundation.js:488-495`) and the double-submit guard (`03-ai-integration.js:4173-4177`). Exercise: draw the stack for nested calls.

**Checkpoint 1 (end of week 2, 20 min):** navigate a folder in Terminal, read a git log, trace a 10-line function by hand.

### Week 3: From language to app

**11. JavaScript 3: control flow, loops, objects, references.** NEED. SB.
Model: the program has one finger on one line at a time; two labels can point at the same object (mutation surprises). if/else, loops, array methods, spread. Memento look: `writeStateToStorage()` with its try/catch and backup timer (`01-state-foundation.js:461-487`). Break-it: an aliasing bug.

**12. JavaScript 4: async, promises, the event loop.** ENGINEER. SB.
Model: one thread, a queue, and a waiting list; `await` yields the thread, it does not freeze it. Memento look: `autoStartAiChat()` (`03-ai-integration.js:4753-4762`): set loading, repaint, await. Codex interactive: event-loop visualizer. Exercise: order the log lines before running.

**13. HTML, CSS, and how a screen gets drawn.** NEED (short). SB.
Model: HTML is the skeleton, CSS the skin, the DOM is the live tree the browser builds, JavaScript pokes the tree. Why Memento's visual laws are CSS laws (safe areas, tokens, backdrop-filter). Memento look: `index.html` shell, the `<script>` load order at 816-880, one token block in `css/base.css`. Exercise: change a color in Memento Jr and see it. Native cameo: React Native draws native views, not HTML; the CSS ideas survive as style objects.

**14. State → render → events: data flow in a frontend.** NEED. SB + MAC.
Model: data lives in one place (state); events change state; the screen gets updated from state. Two ways to do that update, taught as alternatives: imperative (find the element, change it; Memento's web app) and declarative (describe the screen as a function of state and let a framework redraw; React, the native rebuild). First assertion and first boundary check land here. Memento look: the `state` object, `persistState()`, `refreshAiChatUI()`, and the book's own progress tracker in localStorage. Memento Jr v1 gets built here: the hold-to-complete button updates state, state re-renders the streak. Break-it: a bug where the screen is edited directly and drifts from state.

**15. How the web works: client, server, HTTP, APIs, JSON.** NEED.
Model: client asks, server answers; a URL is an address, a verb is an intent, a status code is the outcome, JSON is the envelope. Memento look: `callClaude()` building its URL and headers (`03-ai-integration.js:3079-3108`), `codeForStatus` mapping 429 to "rate-limit" (`transport.ts:52`). MAC: `curl` Memento Jr's server. Codex interactive: a request/response inspector.

### Week 4: The back half of the journey

**16. Backends: servers, routes, handlers, edge functions.** NEED. MAC.
Model: a route is a function attached to an address; a "serverless" function is a server someone else keeps warm. Memento Jr's `server.js` gets built. Memento look: `supabase/functions/ai-proxy/index.ts` top to bottom: origin check, rate limit, build request, forward to Anthropic, scrub the error. Why a proxy exists at all, with the leaked-key origin story at `03:11`. Alternative: call Anthropic from the phone (never). Cameo: Deno vs Node.

**17. Databases, SQL, migrations, and the trust-boundary bug.** NEED. SB (SQL playground, labelled a policy SIMULATOR: sql.js cannot run real Postgres RLS; real RLS is shown as recorded Postgres output).
Model: tables of rows, keys relate them, a schema is a promise, a migration is a dated change to the promise. Read a SELECT, INSERT, UPDATE. Memento look: `supabase/migrations/` (33 forward-only files), `is_memento_state_meaningful` (business rules in the database), `sync_user_state` refusing a blank overwrite. Row Level Security explained properly, then the incidents as separate cases with related trust-boundary failures: EnrichLead (keys in the frontend, open database), the 170 Lovable apps (missing RLS), Moltbook (misconfigured Supabase, repaired), Replit (a different failure: an agent deleting production data). Alternative: Firebase, a custom Postgres, a plain JSON file (Memento Jr's "database"). Why Supabase.

**18. Auth: who you are and what you may do.** NEED.
Model: authentication (who) vs authorization (what); a session is a ticket, a token is the ticket's serial number; OAuth is handing a valet key, not your car keys. Memento look: anon key public at `12-cloud-sync.js:20-21` and why that is fine; the paid/free header fork in `callClaude`; Google OAuth at `12-cloud-sync.js:1562`; native `emailProvider.ts` re-verifying with `getUser()`; tokens in `expo-secure-store`, never in the state blob; `accessController.ts` `paidServerAuthority: false`. Memento Jr gets a fake sign-in with a token. Break-it: trust the client's "isPaid" flag (Memento's own documented gap in `DECISIONS.md`).

**19. Packages, dependencies, secrets, and environment variables.** NEED. MAC.
Model: a dependency is borrowed code with a version number; the lockfile is the exact receipt; `npm install` fetches, `npm ci` reproduces; a secret is a value the code needs but must never contain; an env var is how the secret gets in. Memento look: `memento-native/package.json` and the lockfile, `Deno.env.get('ANTHROPIC_API_KEY')`, `EXPO_PUBLIC_*` being public by prefix, `.gitignore` blocking `.env*`. Memento Jr: `secrets.env` that must not be committed. Supply-chain cameo: why an `npm install` is never free.

**20. Deploy and operate: environments, builds, CI, hosting, domains, DNS, and what happens after.** NEED.
Model: local vs dev vs staging vs production; build (turn source into something runnable) vs run; CI is a robot reviewer that runs on every push; hosting is a computer that answers on a domain; DNS is the phone book. Memento look: `deploy-live.yml` (syntax gate, 30 test scripts, rsync into `memento-live`, GitHub Pages), `native-ci.yml` (`tsc` + jest + `expo export`), the `?v=v1378` cache-busting by hand and what a bundler would do instead, Netlify for public links, mementoapp.co. Rollback: what "revert the commit and push" actually does. Operations: where Memento's logs, alerts, backups and bills live, what restoring a backup means, the first three moves in an incident. Exercise: read one real workflow run log (READ).

**Checkpoint 2 (end of week 4, 30 min):** draw the journey map from memory, read a SELECT, explain why the anon key is public and the Anthropic key is not, find one hole in Memento Jr's server.

### Week 5: Reading Memento's future

**21. TypeScript: types as contracts.** ENGINEER. SB.
Model: a type describes a shape; the compiler is a proofreader that never runs the code; TS is JS with the proofreader on. Union types (`success | failure`) as "this function returns one of two shapes". Why types are one of the few things that catch an AI's mistakes automatically. Memento look: `src/ai/transport.ts:1-11`, `accessPolicy.ts:44-51`. Memento Jr v2: the same app in TS; fix six type errors.

**22. React and React Native: components, props, state, hooks.** ENGINEER. SB + READ.
Model: a component is a function of props and state that returns what to draw; hooks are how a function remembers; React Native renders real native views. Expo as the toolkit, expo-router as the file-based router. Memento look: `_layout.tsx:10-31`, `HoldToComplete.tsx:22-64`, `theme.ts`, `clarityFlow.ts` as a reducer. Memento Jr v3: the hold button as a component, next to the real one. Native pipeline cameo: dev build, simulator, Xcode, App Store, the 15% cut, why MMKV.

**23. Errors, logs, stack traces, debugging.** NEED. MAC.
Model: reproduce, isolate, bisect; a stack trace reads top down and names the file and line; syntax vs runtime vs logic errors; logs are the app talking to you. The browser console, `preview_logs`, `console.log` as a flashlight. Memento look: the scrubbed error allowlist in `transport.ts:94-97`; a real stack trace from Memento's dev tools. Three planted bugs in Memento Jr, one of each kind. Codex interactive: the stack-trace reader.

**24. Testing.** NEED. MAC.
Model: a test is an executable expectation; a failing test is a spec; unit vs integration vs end-to-end; flaky tests; coverage is not correctness. Run `npm test` in the disposable lab copy `CODE-BOOK/lab/memento-native/` (exported from the native pin; the real repo is never touched) and read one green and one deliberately-read-as-red output. Memento look: `ai-transport.test.ts:22-27`, the test that hashes the frozen web file and uses the old code as the oracle. Web has no runner, just 47 scripts: what that costs. Exercise: write three assertions for Memento Jr.

**25. Security and performance, the junior version.** NEED.
Model: trust boundaries (never trust the client), validate at the edges, least privilege, secrets, rate limits that fail closed, the OWASP short list (injection, XSS, broken auth). Performance: measure before you optimize, latency vs throughput, N+1, bundle size, caching, debouncing. Memento look: `checkRateLimit` fail-closed branch, `stateValidation.ts` capping a JSON tree at 250,000 nodes, `persistState()` debounce, the 411 KB `dashboard.css`. Exercise: audit Memento Jr's server for the three obvious holes.

### Week 6: Architecture, supervision, graduation

**26. Why engineers structure software this way (and what technical debt looks like).** NEED.
Model: coupling and cohesion, boundaries, "where should this live", the trade-off written down. Memento's two architectures side by side: 39 numbered global scripts vs typed folders with an import graph; what each buys and costs. Then debt, with Memento's own specimens, stated factually: the 10,478-line file, two files numbered 20, the file map that drifted from the files, the 38-line tombstone, the bypassable paywall, the leaked key comment, the 189 KB handoff log. How vibe coding accumulates exactly this (GitClear's 8x duplication) and how the freeze, the ownership rules, and the review gate are the antidote. Small dose of business: debt is a loan, interest is every future change.

**27. The AI-assisted engineer, part 1: asking, plans, diffs, claims.** NEED.
How to ask Codex or Fable for a change (spec, files, symptom, done-condition, what not to touch). How to review a plan before allowing implementation. How to inspect what changed (`git diff`, the desktop diff pane) and read a diff line by line. How to ask AI to explain unfamiliar code (why-questions, not do-questions). How to verify a claim (run it, screenshot it, test it; "if you can't verify it, don't ship it"). How to recognize hallucinations (confident file paths that don't exist, APIs that don't exist, "tests pass" without output). Codex interactive: the diff-reading trainer with planted problems.

**28. The AI-assisted engineer, part 2: duplicates, scope, recovery.** NEED.
How duplicate systems get born (two paywalls in Memento, two event styles) and how to prevent them (grep first, one owner, "does this already exist?"). How scope creep happens (the agent "improves" nearby code) and the one-sentence guard. When to understand vs delegate (Anthropic's 17-point finding). How to test after an AI change (the four-cell screenshot law, `npm run check`, the console gate). How to recover when it fucks up: inspect first, make a safety commit, then `git restore --source=<commit> -- <file>` with an explicit target, `git revert`, `git reflog`, the branch that saved you. Commands that discard uncommitted work are marked in red and never taught first. How to challenge an architectural decision (ask for the alternative and the cost). The review protocol Malik already runs, now understood: fresh-context adversarial review, approvals pinned to a commit.

**29. Run Memento's native app yourself.** ENGINEER. MAC, in the disposable lab copy.
Guided: `cd CODE-BOOK/lab/memento-native`, `npm ci`, `npm run check`, `npx expo start --dev-client`, watch the boot, open the simulator (Xcode is already installed), tap a screen, find the file that drew it. The real repo is never touched. Kills the last piece of magic: the thing on the phone came from these files.

**30. Graduation: one real change to Memento.** NEED. MAC.
With Malik's explicit permission at that moment, on a branch, following Memento's own rules: read a real Codex diff and find one planted problem, run the tests, make one small real change (a fix-sized change that would pass the freeze rules, logged in `FREEZE-LOG.md` if it touches the web app, or a native-side change), commit with the right message, push the branch, open the pull request. Then the rubric, open-tool (AI allowed, as in real life): trace one function by hand, find a planted bug from a stack trace, review a diff and name its problems, explain one security decision, verify one claim with evidence, and narrate one complete data journey from memory. Pass every line or retake the ones you missed. Stops at a reviewed branch unless Malik authorizes more.

---

## 4. The site (how the book is built)

- **Stack: plain HTML, CSS, JavaScript. No framework, no build step.** On purpose. The book's own source becomes a teaching specimen in chapters 13-14, and it mirrors the web Memento's philosophy so the reader sees the same shape twice.
- **Layout:** `index.html` (cover + contents), `chapters/NN-slug.html`, `glossary.html`, `css/book.css`, `js/book.js` (sidebar, progress, glossary chips, device gating, sandbox runner), `glossary.json`, `sandbox/` (Memento Jr v1/v2/v3 + `breaks/`), `img/` (Codex diagrams), `research/`.
- **Design:** dark-first, sharp, restrained. Same taste rules as Memento (no gold, no serifs, no eyebrow labels, no em dashes, no bubbles). Light mode faithful. Phone-first, 16px gutters, no horizontal scroll. Verified in the four-cell matrix before any chapter is called done.
- **Sandbox runner:** a code box with Run. Plain JavaScript runs in a Web Worker with a timeout, so an infinite loop cannot strand the page on iOS Safari; DOM exercises use a sandboxed iframe with a hard reset. Captures `console.log` and errors into a panel under the box. Codex builds it.
- **Device gating:** exercises carry `data-device="mac"`; on a phone-width viewport the panel replaces the exercise with "Mac only. Skip, or continue on your Mac." and records the skip.
- **Glossary chips:** any term wrapped in `<dfn data-term="api">` shows a popover with the definition at the reader's current chapter level.
- **Git:** the book repo holds the book. The reader's playground is a separate disposable `git-lab/` (gitignored, regenerated by a script). The book is pushed to a private GitHub repo and served by GitHub Pages behind a simple passphrase gate.
- **Diagrams:** one per chapter (Malik learns from pictures), every one with a text alternative, contrast checked in both themes, and no motion that ignores `prefers-reduced-motion`.

---

## 5. Workflow between Fable and Codex

- **Files own the conversation.** PLAN.md (Fable), CODEX-BRIEF.md (Fable), CODEX-REVIEW.md (Codex), then per chapter: `chapters/NN-slug.html` (Fable prose) + `img/NN-*.png|svg` (Codex) + `sandbox/breaks/NN-*` (Codex) + `review/NN-factcheck.md` (Codex).
- **Order per chapter:** Fable drafts the chapter → Codex fact-checks every claim, every file:line against a pinned Memento commit, every date against a source, and flags anything a beginner would misread → Fable fixes → Codex delivers the diagram and any interactive → Fable integrates → four-cell screenshots → done. Nothing ships with an open fact-check finding.
- **No agent edits the other's file.** Findings go in the review file, numbered, with severity (WRONG / MISLEADING / MISSING / NIT).
- **Memento pinned:** all citations reference one commit hash recorded in `research/MEMENTO-PIN`. When Memento moves, Codex re-verifies the cited lines and the book updates its line numbers, never the other way around.
- **Malik relays.** Neither agent messages the other directly.

---

## 6. Malik's answers (2026-09-20)
1. Title: BIG CODE BOOK.
2. 30 chapters.
3. Xcode is already installed.
4. Hosting: GitHub Pages behind a simple passphrase; obscurity is fine, he knows it is not security.
5. Cross-device highlights and notes: later, not now.
6. Keep the paste-able why-question.

## 7. Sources
- research/research-pedagogy.md (notional machines, PRIMM, worked examples, retrieval practice, curricula comparison, competency ladders, terminology anxiety)
- research/research-ai-timeline.md (dated AI timeline, incidents, studies, capability picture, all with URLs)
- research/research-memento-map.md (the read-only survey: journey traces, data model, infra, decisions, 27 teaching specimens, debt specimens). Codex verified corrections adopted: 38 JS and 22 CSS files, `callClaude` at line 3045, mixed `?v=` versions across script tags (not all v1378), 29 tool commands in the deploy workflow. Codex regenerates the citation inventory from the two pins.
- CODEX-REVIEW.md (Codex's 25 findings on plan v1)
