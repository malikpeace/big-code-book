# CODEX BRIEF: your jobs on BIG CODE BOOK

From Fable, 2026-09-20. Read PLAN.md first, then research/*.md. Then write CODEX-REVIEW.md before doing any build work. Malik relays between us; we never message each other directly.

## Hard rules (same as Fable's)
1. `~/Downloads/MEMENTO` is READ-ONLY for this project. Read, grep, quote, screenshot. Never modify, commit, install, format, run anything that writes, or `git checkout` a different branch there.
2. Do not edit PLAN.md or any `chapters/*.html`. Fable owns prose. Your findings go in review files, numbered.
3. Everything you make lives in `~/Downloads/CODE-BOOK`. Commit only your own files (`git add <file>`, never `-A`).
4. Book design law: dark-first, sharp, restrained. No gold, no serif or display fonts, no eyebrow labels, no purple gradients, no emoji as icons, no em dashes anywhere (not in code, copy, or filenames), no everything-rounded bubbles. Same taste as Memento. Light mode must be faithful.
5. Voice in anything you write (captions, hints, error text): plain, short, no jargon without a translation, no "It's not X, it's Y".

## Job 1: Review the plan (DONE, CODEX-REVIEW.md, merged into PLAN.md v2)
Write `CODEX-REVIEW.md`. Number every finding. Tag each WRONG / MISLEADING / MISSING / TOO-DEEP / TOO-SHALLOW / NIT. Specifically attack:
- Is the competency list in PLAN.md §1 what a junior-plus at a small startup actually needs in 2026? What is missing? What is padding?
- Is the 30-chapter order right for someone who knows the words but not the meaning? Which chapter would lose him? Which two would you merge? Which is missing?
- Does every chapter's Memento look actually exist at the cited path and lines? Re-verify against the current repo; report drift.
- Are the dates and claims in research/research-ai-timeline.md right? You have your own search; hit the ones tagged "reported" hardest.
- Is Memento Jr (PLAN.md §2.5) the right practice app? Too big, too small, wrong shapes?
- Anything in the plan that would make a beginner learn "how Memento works" instead of "how software works"?
- Propose additions or changes. Fable merges what survives; Malik breaks ties.

## Job 2: Build the site shell (after Malik approves the plan)
Plain HTML/CSS/JS, no framework, no build step (this is a teaching decision, see PLAN.md §4). Deliver:
- `index.html`: cover, contents (30 chapters in 6 weeks), progress bar.
- `css/book.css`: tokens on `:root`, dark default, light under `prefers-color-scheme` and `[data-theme]`, phone-first, 16px gutters, no horizontal scroll, tabular numerals for numbers, code blocks with the app font family for prose and a monospace stack for code.
- `js/book.js`:
  - sidebar + progress (localStorage, wrapped in try/catch, degrades to no-persistence),
  - glossary chips: `<dfn data-term="api">` opens a popover showing the definition for the reader's current chapter level from `glossary.json`,
  - device gating: any `[data-device="mac"]` block on a viewport under 768px is replaced by a panel "Mac only. Skip, or continue on your Mac." with a Skip button that records the skip,
  - the sandbox runner: a code box with Run. Plain JS runs in a Web Worker with a timeout (kill after 3s); DOM exercises run in a sandboxed iframe (`sandbox="allow-scripts"`) with a hard reset. Captures `console.log`/`console.error`/uncaught errors into a panel under the box. Must work on iOS Safari.
  - a passphrase gate: on first visit ask for a passphrase (Malik sets it in a config constant), remember it in localStorage. This is obscurity, not security; say so in a code comment.
  - chapter check: `<details class="check">` questions with hidden answers, counted into progress.
- `chapters/00-template.html`: the chapter skeleton with every section from PLAN.md §2.1 as empty slots and the two-lane layout (left = universal, right = Memento).
- `glossary.html` rendering `glossary.json` (Fable fills the JSON).
Verify at 390x844 and 1440x900, dark and light, screenshots in `review/shell-screens/`.

## Job 3: Build Memento Jr (the practice app), PLAN.md §2.5
In `sandbox/`:
- `v1/` plain JS, no build: `index.html`, `app.js`, `state.js`, `style.css`. One screen: north-star text field, hold-to-complete button (3 seconds, progress ring), streak counter, "last completed" date. State is one object, saved to localStorage on change with a 150ms debounce (mirrors Memento's `persistState`). Under 300 lines total. Every function has a one-line comment saying what it is for. No cleverness.
- `v1/server.js`: Node, no dependencies, ~60 lines. Routes: `POST /api/ai` returns a canned "AI" reply after a 600ms delay; `POST /api/sync` writes the posted state to `db.json`; `GET /api/sync` reads it. Reads `secrets.env` for a fake `AI_KEY` and refuses to start without it. `.gitignore` excludes `secrets.env` and `db.json`; ship `secrets.env.example`.
- `v2/`: the same app in TypeScript (`app.ts`, `state.ts`, a `tsconfig.json`), plus six deliberate type errors in `v2/errors/app.ts` for the chapter 21 exercise, each with a comment number only (no hint in the file).
- `v3/`: the hold-to-complete button as one React Native component (`HoldToComplete.tsx`) using `useState`, `useEffect`, `useRef`, under 80 lines. Compile it ONCE with react-native-web into a prebuilt `v3/dist/` artifact the page loads (no build step for the reader). It sits next to Memento's real `HoldToComplete.tsx` in chapter 22.
- `v1/server.js` carries a top comment "INTENTIONALLY INCOMPLETE: no auth, no limits, no owner scoping. Chapters 17, 18, 25 fix this." and `v1-secure/` is the evolved version (owner-scoped data, input limits, error handling, revisions, authorization) for those chapters. The fake token is named `FAKE_TOKEN` everywhere.
- `git-lab/`: a script `make-git-lab.sh` that creates a disposable repo with three commits, two branches and one staged conflict, and resets it on every run. Gitignored.
- `lab/`: a script `make-native-lab.sh` that exports the native pin (`git -C ~/Downloads/MEMENTO archive <native-pin> memento-native | tar -x -C lab/`) into `lab/memento-native/`, gitignored. All `npm ci`, `npm test`, and Expo runs happen there. Nothing runs inside `~/Downloads/MEMENTO`.
- Every lab folder ships a `README` line: working directory, expected output, reset command, "this cannot touch Memento".
- `breaks/NN-slug/`: one folder per chapter that has a break-it exercise (Fable will list the exact bugs per chapter after approval; expected chapters: 5, 6, 11, 14, 18, 23 x3, 25). Each is a copy of the relevant version with ONE planted bug, plus `HINTS.md` (three hints, increasing) and `FIX.md`.

## Job 4: Diagrams (one per chapter, three heroes)
Deliver SVG where possible (theme-aware via CSS variables), PNG only for raster art. Same palette as the book. Label everything in plain words. Every visual ships with a text alternative, passes contrast in both themes, and respects `prefers-reduced-motion`. One per chapter is Malik's call (he learns from pictures); keep each one about a single relationship.
Heroes:
- **The Journey Map** (chapter 2, then reused with one stop lit in every chapter): finger → screen → JavaScript → state → network → Supabase edge function → Anthropic → back → state → localStorage/MMKV → Supabase sync → Postgres. Two rows: "on the phone" and "on a server someone else runs". Mark who pays for each hop.
- **The Git Graph** (chapters 7-8): commits as dots, branches as pointers, a merge, a conflict, and the Fable/Codex "APPROVED @ sha" overlay.
- **The Memento System Map** (chapters 20 and 30): every vendor (GitHub, GitHub Pages, Netlify, Supabase auth/Postgres/edge functions, Anthropic, OpenAI, Polar, Resend, Google OAuth, App Store), what talks to what, which are public and which hold secrets.
Per-chapter diagrams (one each; Fable will specify the exact content per chapter after approval): CPU/memory/file (1), timeline (3), AI timeline (4), path tree (5), command anatomy (6), label-not-box variables (9), call stack (10), reference aliasing (11), event loop (12), DOM tree (13), state→render→events loop (14), request/response anatomy (15), proxy sandwich (16), table/keys/RLS (17), authn vs authz + OAuth valet key (18), dependency tree + lockfile (19), environments pipeline + two-repo mirror (20), type as contract (21), component tree + hooks (22), stack trace anatomy (23), test pyramid (24), trust boundary (25), coupling/cohesion + debt ledger (26), the review loop (27), recovery flowchart (28).

## Job 5: Interactives (small, each under 200 lines, no framework)
Priority order. Ship what fits; none is blocking a chapter except the sandbox runner.
1. Sandbox runner (Job 2).
2. Journey-map explorer: tap a stop, see what runs there, what it costs, and the Memento file that lives there.
3. Event-loop visualizer (chapter 12): step through a queue and a waiting list.
4. Request inspector (chapter 15): compose a request, see the response, status code explained.
5. Git graph playground (chapters 7-8): make commits, branch, merge, see the dots move.
6. Diff-reading trainer (chapter 27): a real-looking diff with three planted problems; reader marks them; reveal.
7. Stack-trace reader (chapter 23): a real trace, tap each line to see what it means.
8. SQL playground (chapter 17): sql.js from a CDN, four tables, six guided queries, and a policy SIMULATOR labelled as such (sql.js cannot run Postgres RLS); real RLS shown as recorded Postgres output.

## Job 6: Fact-check protocol (every chapter, after Fable drafts it)
Write `review/NN-factcheck.md` per chapter with numbered findings:
- Every Memento path and line range re-verified against the commit in `research/MEMENTO-PIN`. Report drift as WRONG with the correct lines.
- Every date, number, and named study checked against a primary source. Report the URL you used.
- Every analogy: does it break somewhere the chapter does not admit? Report as MISLEADING.
- Every definition in the glossary delta: would a real engineer object? Report as WRONG or NIT.
- Every exercise: run it. Does the planted bug reproduce? Do the hints lead to the fix? Report failures.
- Beginner read: is there a sentence a person who "knows the words, not the meaning" would misread? Quote it.
Nothing ships with an open WRONG or MISLEADING finding.

## Job 7: Memento pins (two)
Create `research/MEMENTO-PIN` with two lines: `web ca8afc8` (the frozen v1378 commit) and `native <hash>`, a reviewed commit on the migration branch that contains every taught native file (main has almost none). Regenerate the citation inventory (`research/CITATIONS.md`: chapter, path, lines, pin, sha256 of the cited range) from those pins. Re-verify against the pins, never against whatever branch is checked out.

## Deliverables order
1. CODEX-REVIEW.md (done).
2. After Malik approves plan v2: MEMENTO-PIN, site shell, Memento Jr v1 + server, the three hero diagrams. Fable starts chapters 1-5 in parallel.
3. Rolling: per-chapter diagram + break folder + fact-check as Fable delivers drafts.
4. Interactives in priority order as time allows.
