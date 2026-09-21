# Research report: teaching a non-programmer founder to junior-plus in ~35 hours (2026)

Scope: pedagogy, existing curricula, competency maps, terminology anxiety, and a proposed 25-chapter sequence. Everything below is web-sourced (searched 2026-09-20); items marked [unverified] could not be confirmed against a primary source.

---

## 1. Pedagogy: what actually works for adult beginners

### 1.1 Notional machines (du Boulay, Sorva)
- Du Boulay coined "notional machine": the idealised model of the computer implied by a language's constructs. Sorva's 2013 ACM TOCE survey argues the notional machine must be an **explicit learning objective**, not something learners are left to infer, because novices' runtime mental models are the main bottleneck in CS1. https://dl.acm.org/doi/10.1145/2483710.2483713
- Sorva's doctoral thesis (Aalto, 2012) builds *visual program simulation*: the learner plays the computer, stepping through memory state. Mistakes made during simulation map onto known misconceptions, and drawing/tracing forces ambiguity in the mental model to resolve. http://lib.tkk.fi/Diss/2012/isbn9789526046266/ and https://aaltodoc.aalto.fi/handle/123456789/3534
- Practical takeaway: every chapter should teach a small, drawable machine (variables as labels, the call stack as a pile of index cards, the request/response loop, the git graph) and have the learner **trace** it by hand before running it.

### 1.2 Misconceptions research
- Pea (1986) identified language-independent "conceptual bugs" (parallelism, intentionality, egocentrism) rooted in one **superbug**: the belief that a hidden mind inside the computer interprets what you *meant*. https://doi.org/10.2190/689t-1r2a-x4w4-29j2 A 2025/26 TOCE paper revisits the "computer-mind" metaphor. https://dl.acm.org/doi/10.1145/3769856
- This matters doubly in 2026: an AI agent *does* have interpretive powers, which makes the superbug feel true. The book must separate "the agent guesses intent" from "the machine executes literally."
- Hermans and colleagues ran a 496-participant experiment on explaining variables as a **box vs a label**; the box metaphor is suspected of feeding the "a variable can hold multiple values" misconception. https://www.felienne.com/wp-content/uploads/2018/08/box-label-vars.pdf [effect size unverified: PDF did not parse; treat the direction as suggestive, not settled]
- ICER 2025 found intuitive-reasoning misconceptions persist across experience levels, so a book cannot assume they self-correct with exposure. https://dl.acm.org/doi/full/10.1145/3702652.3744209

### 1.3 The Programmer's Brain (Hermans, 2021)
- Reading code is a learnable skill separate from writing it; expertise is chunking (long-term memory patterns) plus working memory management. Cognitive load splits into intrinsic (the problem), extraneous (presentation noise), germane (schema building). https://www.manning.com/books/the-programmers-brain
- Direct implication for a supervisor of AI agents: the core job is **reading**, so the book should spend most exercises on reading, tracing, and explaining code, not producing it.

### 1.4 PRIMM (Sentance et al., 2017+)
- Predict, Run, Investigate, Modify, Make. Learners read and predict a starter program before writing anything; ownership transfers gradually. Widely adopted in UK schools; a 2019 study of teachers' experiences reported improved engagement and confidence. https://primmportal.com/wp-content/uploads/2019/01/pre_print_teachers__experiences_of_using_primm_to_teach_programming_in_school.pdf and https://teachcomputing.org/blog/using-primm-to-structure-programming-lessons/
- Originally for school-age learners, but it maps cleanly onto adults and onto agent supervision: "predict what this diff does, run it, investigate, modify" is literally code review.

### 1.5 Worked examples and faded scaffolding (Sweller, Renkl)
- Sweller & Cooper (1985): novices learn more from studying worked examples than from problem solving. Renkl (2014) reviews fading: start fully worked, remove steps until the learner does it alone. https://en.wikipedia.org/wiki/Worked-example_effect and https://files.eric.ed.gov/fulltext/EJ1086007.pdf
- Applied in CS1 course design as worked examples + scaffolding + faded guidance + pattern emphasis. https://dl.acm.org/doi/10.1145/1288580.1288595

### 1.6 Retrieval practice and spacing
- Dunlosky et al. (2013) rated practice testing and distributed practice as the two highest-utility techniques; Hattie & Donoghue's 2021 meta-review (242 studies, 169k participants) replicated it. https://journals.sagepub.com/doi/abs/10.1177/1529100612453266 and https://evidencebased.education/resource/retrieval-and-spaced-practice-study-strategies-that-must-be-combined/
- Execute Program (Gary Bernhardt) is the working proof in programming: interactive lessons with spaced-repetition review of earlier concepts. https://www.executeprogram.com/spaced-repetition
- One hour a day for 30+ days is ideal for spacing: every chapter should open with a 5-minute retrieval quiz on earlier chapters.

### 1.7 Analogies as scaffolding, then replaced
- Bridging analogies are a recognized technique for dislodging misconceptions (APA guidance). https://www.apa.org/education-career/k12/misconceptions Too much teacher scaffolding suppresses participation; too little breeds misconceptions; the balance is a mapped analogy followed by learner-constructed models. https://www.tandfonline.com/doi/full/10.1080/03057267.2024.2434797
- CS1 work on tool-scaffolded, student-generated analogies. https://dl.acm.org/doi/abs/10.1145/3633053.3633061
- The Hermans box/label result is the cautionary tale: a wrong analogy sticks. Rule for the book: every analogy is labelled as temporary, and the chapter ends by stating where it breaks and what the real model is.

### 1.8 Guzdial: learner-centered design
- Not every learner wants to be a CS major; goals and methods should follow the learner's purpose, and problem-solving "transfer" from programming is unproven. https://link.springer.com/book/10.1007/978-3-031-02216-6 For this reader the purpose is supervision of a real product, so every exercise should touch code shaped like his app.

### 1.9 Evidence specific to AI-assisted learning (2025-2026)
- Anthropic's Feb 2026 RCT (52 mostly-junior devs learning a new library): the AI-assisted group scored ~17 points lower on a comprehension quiz; but participants who used AI for **conceptual questions** ("why this pattern?") scored 65%+, matching hand-coders. Delegation hurts learning; inquiry does not. https://www.anthropic.com/research/AI-assistance-coding-skills
- METR (July 2025): experienced OSS devs were 19% slower with early-2025 tools while believing they were 20% faster. Self-report of AI productivity is unreliable. https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
- Kent Beck: AI collapses the search space, so juniors ramp faster **if managed for learning**, and the differentiating skills are decomposing a problem, writing a failing test that captures intent, and evaluating whether the output satisfies it. https://newsletter.kentbeck.com/p/the-bet-on-juniors-just-got-better

---

## 2. Existing curricula: how zero-to-junior programs sequence things

| Program | Sequence (abridged) | Treats as must-know first | Defers |
|---|---|---|---|
| The Odin Project (Foundations) | How the web works, installs, editor, command line, git; HTML; CSS; Flexbox; JS basics (variables, types, functions, errors, loops, DOM, objects) | Terminal + git **before** any code; "Understanding Errors" as its own lesson | Backend, frameworks, testing (later paths) https://www.theodinproject.com/paths/foundations/courses/foundations |
| freeCodeCamp | Responsive Web Design; JS; Front-end libs; Relational DB; Backend/APIs; QA | Quincy Larson: 90% of pre-job time on HTML, CSS, JS, Linux, Git, SQL, Node, Express | React, NGINX, Docker https://www.freecodecamp.org/news/learn-to-code-book/ |
| CS50x | Scratch, C, arrays, algorithms, memory, data structures, Python, SQL, AI unit, HTML/CSS/JS, Flask | Machine-level model (memory) early | Web comes at week 8 https://cs50.harvard.edu/x/ |
| Launch School (Core) | Prep; language basics x2 + OOP; networking foundations; database foundations; then HTML/CSS, JS, DOM, async/APIs | Mastery + assessments; networking and DBs **before** front end; 1,200-1,800 hours | Frameworks entirely https://launchschool.com/courses |
| Teach Yourself CS | Programming, architecture, algorithms, math, OS, networking, databases, compilers, distributed | If only two: CS:APP and DDIA | Everything else https://teachyourselfcs.com/ |
| MIT Missing Semester (2026) | Shell, CLI environment, dev environment, debugging/profiling, git, packaging, **agentic coding**, code quality | Tool fluency as a first-class subject; AI woven into lectures | Language syntax https://missing.csail.mit.edu/ |
| roadmap.sh full-stack | HTML/CSS/JS, one backend language, a full-stack framework, then databases, projects | Front end first | DB after framework https://roadmap.sh/full-stack |
| Boot.dev (backend) | One language deeply, shell, then data structures, databases, web servers, deployed projects | Shell early; testing/debugging inside language fundamentals | Front end https://www.boot.dev/blog/backend/backend-developer-roadmap |
| Josh Comeau, Joy of React | Fundamentals (JSX/props), state, hooks, component design, full-stack React | Assumes JS fluency | https://www.joyofreact.com/ |
| Learn Enough (Hartl) | Command line, text editor, git, then HTML/CSS/JS/Ruby | Tools first, "enough to be dangerous" | https://www.learnenough.com/git-tutorial/getting_started |
| Execute Program | JS arrays, TS, SQL, regex; spaced repetition | Retention over coverage | https://www.executeprogram.com/why-ep |

**Common spine:** how the web works -> terminal + git -> HTML/CSS -> JS -> DOM/events -> errors -> objects/async -> backend + HTTP -> databases -> a framework -> deploy.
**Where they differ:** whether the machine model (CS50) or the web model (Odin) comes first; whether databases precede front end (Launch School) or follow the framework (roadmap.sh); how early testing appears (Boot.dev early, Odin later). Only Missing Semester has made agentic coding a core lecture.

---

## 3. Competency maps: what a junior at a small startup needs in 2026

Sources: Dropbox IC2 (junior) craft expectations, SFIA level 2 "Assist" / level 3 "Apply", and 2025-26 practitioner writing.
- Dropbox IC2: translate ideas into clear code written to be read; well-tested; catch bugs in edge cases; navigate large codebases and debug others' code; understand existing designs; separation of concerns. https://dropbox.github.io/dbx-career-framework/ic2_software_engineer.html
- SFIA L2: works under routine supervision, reviews own work; L3: works under general direction, reviewed at milestones. https://sfia-online.org/en/sfia-9/responsibilities
- Osmani: "the 70% problem" (AI carries you most of the way; the last 30% is where juniors used to become seniors) and a 2026 workflow of specs, small chunks, tests, review everything, commit often. https://addyosmani.com/blog/ai-coding-workflow/ [the 70%-problem post itself returned 404 at the URL I tried; the claim is widely quoted]
- Willison: vibe coding = not reviewing the code; the golden rule is do not commit code you could not explain; "vibe engineering" (Oct 2025) = agents inside tests, version control, planning, review. https://simonwillison.net/2025/Mar/19/vibe-coding/ and https://simonw.substack.com/p/vibe-engineering
- Böckeler (Thoughtworks, via Pragmatic Engineer): judgment over confident output, awareness of automation/anchoring bias, small task decomposition, feedback loops (tests, static analysis), knowing when to revert, treating the agent as an eager inexperienced teammate; later work on "harness engineering." https://newsletter.pragmaticengineer.com/p/two-years-of-using-ai and https://www.thoughtworks.com/insights/podcasts/technology-podcasts/what-harness-engineering
- Anthropic Claude Code best practices: give the agent a verifiable check; explore -> plan -> implement -> commit; specific prompts naming files and symptoms; concise CLAUDE.md; clear context between tasks; fresh-context adversarial review; "if you can't verify it, don't ship it." https://code.claude.com/docs/en/best-practices
- Yegge's "Gas Town" (Jan 2026) is the pure-vibe extreme (author has never read the code); useful as a foil, not a model. https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04

### Competency list (junior-plus, supervisor of agents)
- **Reading code:** trace execution by hand; identify inputs/outputs/side effects of a function; read a diff and say what changed in plain words; spot a function that does two jobs.
- **Terminal:** navigate, list, find, grep, read logs, run scripts, env vars, `--help`; know what a PATH is; kill a stuck process.
- **Git:** the commit graph model; status/diff/log/branch/merge/rebase (conceptually); revert vs reset; PRs; read blame; never force-push shared branches.
- **Web/app architecture:** client vs server vs database; request/response; URLs, HTTP verbs, status codes; static vs dynamic; SPA vs server-rendered; native shell vs web view.
- **Data flow:** state, props, events; where data is born, transformed, stored; one-way data flow; what "source of truth" means.
- **Auth:** identity vs permission; sessions vs tokens; OAuth as a delegation handshake; why secrets never ship to the client; row-level security.
- **Databases:** tables, rows, keys, relations; SELECT/INSERT/UPDATE/DELETE; indexes; migrations; backups; why "just add a column" is a migration.
- **Packages:** dependency = borrowed code; semver; lockfiles; `npm install` vs `npm ci`; supply-chain risk; upgrading is a change.
- **Errors/debugging:** read a stack trace top-down; reproduce first; binary search the cause; logs vs breakpoints; distinguish syntax, runtime, logic errors.
- **Testing:** what a test asserts; unit vs integration vs end-to-end; a failing test as a spec; flaky tests; coverage is not correctness.
- **Security:** OWASP top-level ideas (injection, XSS, broken auth), secrets management, least privilege, input validation at boundaries.
- **Performance:** measure before optimizing; latency vs throughput; N+1 queries; bundle size; caching basics.
- **Architecture reasoning:** coupling/cohesion, boundaries, "where should this live," when to split a file/module, trade-offs stated in writing.
- **Deployment/infra:** build vs run; environments (dev/staging/prod); CI; env config; rollbacks; logs and monitoring; cost.
- **AI supervision:** write a spec; decompose; demand a verification step; read every diff; ask conceptual questions (not just delegate); detect confident nonsense; clear context; run an independent review; know when to revert; own the commit.

---

## 4. Terminology anxiety

- A 2025 systematic review (JITE) finds programming anxiety reduces engagement, performance and retention, peaks in early weeks when entirely new concepts arrive, and rises with perceived difficulty; supportive environments and appropriate tooling reduce it. https://www.informingscience.org/Publications/5543
- Practitioner sources consistently name jargon overload as a top intimidation factor for newcomers. https://inventwithpython.com/beyond/chapter7.html (Sweigart's "Programming Jargon" chapter) and https://nicholasidoko.com/blog/how-to-understand-programming-jargon-for-newbies/
- Cognitive-load theory explains why: undefined terms are extraneous load, stealing working memory from the actual model. Hermans' book covers this directly. https://www.manning.com/books/the-programmers-brain
- "Just-in-time" documentation (define at the moment of need) is an established lean-docs practice. https://www.docsie.io/blog/glossary/just-in-time/ [no controlled study on "evolving glossaries" for programming found; treat as practitioner consensus, not research]
- Recommended mechanics: define each term the first time in one plain sentence inline; keep a running glossary that gets **revised** as models deepen (the chapter 4 definition of "variable" is superseded in chapter 9); end each chapter with "words you now own."

---

## 5. Proposed 25-chapter sequence (45-60 min each)

Legend: SB = in-browser JS sandbox; TM = Mac Terminal on the learner's own repo. Every chapter opens with a 5-minute retrieval quiz and closes with a glossary delta.

| # | Chapter | Core mental model | Misconception it kills | Exercise |
|---|---|---|---|---|
| 1 | What a computer actually does | CPU executes literal instructions on memory; no mind inside | The superbug (Pea): it does what I meant | SB: predict output of 5 tiny literal programs |
| 2 | From punch cards to agents | History as rising abstraction: machine code -> languages -> libraries -> frameworks -> LLM agents; each layer hides, none removes | "AI replaced programming" | Read + timeline sort; write where your app sits on the stack |
| 3 | Files, folders, paths | Everything is a file; a path is an address | The app "lives in the cloud" only | TM: `ls`, `cd`, `pwd`, `open`, find your app's files |
| 4 | The terminal is a conversation | Command = program + arguments; stdout/stderr; exit codes | Terminal is dangerous magic | TM: run scripts, read `--help`, break and fix a command |
| 5 | Git, part 1: snapshots | A commit is a snapshot; history is a graph | Git is a backup folder | TM: status/diff/log on the real repo, read one commit |
| 6 | Git, part 2: branches, merges, PRs | Branches are pointers; merge combines lines of history | "Merge conflicts mean something broke" | TM: branch, commit, resolve a staged conflict |
| 7 | JavaScript: values and variables | Variable = label on a value (not a box) | A variable can hold two things / stale copy | SB: trace-by-hand then run (PRIMM) |
| 8 | Functions and the call stack | Functions are recipes; the stack is a pile of index cards | Function runs when defined | SB: trace nested calls, draw the stack |
| 9 | Control flow, loops, collections | The program has exactly one finger on one line at a time | Loop runs "all at once"; parallelism bug | SB: modify a loop, predict iterations |
| 10 | Objects, references, mutation | Two labels can point at one object | Copy vs reference | SB: predict aliasing outcomes |
| 11 | Async: promises and the event loop | One thread, a queue, a waiting list | `await` pauses the whole app | SB: order the log lines before running |
| 12 | TypeScript: types as contracts | Types describe shapes; compiler = proofreader that never runs code | Types make code run faster / TS is a different language | SB: fix 6 type errors, then read a real `.ts` file |
| 13 | How the web works | Client asks, server answers; URL, verb, status code, headers, body | "The app" is one thing | TM: `curl` your own API, read a status code |
| 14 | Frontend architecture and data flow | State -> render; events -> state; one way | UI edits the data directly | SB: mini state -> view loop; read a real component |
| 15 | Backend: servers, routes, handlers | A route is a function attached to an address | Backend = database | TM: read a route file, add a logged route in a sandbox copy |
| 16 | Databases and SQL | Tables of rows, keys relate them; schema is a promise | DB is a spreadsheet | SB or TM (SQLite): 6 queries, one migration read |
| 17 | Auth: identity and permission | Who are you (authn) vs what may you do (authz); tokens are tickets | "Logged in" is a boolean on the client | TM: inspect your app's auth flow, trace a token |
| 18 | APIs, packages, secrets | APIs are contracts; packages are borrowed code; secrets never ship | `npm install` is free and safe | TM: read package.json + lockfile, find every secret path |
| 19 | Deploy and infra | Build vs run; environments; CI as a robot reviewer; rollback | Deploy = save | TM: read the deploy workflow, trace one deploy log |
| 20 | React and React Native | Components are functions of props + state; RN renders native views, not HTML | RN is a web page in a box | SB: build a 3-component tree; read one RN screen |
| 21 | Errors and debugging | Reproduce, isolate, bisect; stack traces read top-down | "It just broke" | TM: given a planted bug, find it with logs |
| 22 | Testing | A test is an executable expectation; failing test = spec | Tests prove correctness / are for later | SB: write 3 assertions; TM: run the suite, read a failure |
| 23 | Security and performance | Trust boundaries; measure before optimizing | "Nobody would do that"; faster == better code | TM: audit inputs at boundaries; time one slow path |
| 24 | Architecture reasoning | Boundaries, coupling, "where should this live," written trade-offs | More files = more complex | Read: critique a proposed change in writing |
| 25 | The AI supervision toolkit + graduation | Spec -> decompose -> verify -> review diff -> ask why -> own the commit; Anthropic/Willison/Böckeler rules | Vibe coding = engineering | TM: run one real agent task end to end with a written review; graduation checklist |

Design notes:
- Chapters 1-2 are conceptual (no tooling) so early anxiety is low; 3-6 are terminal-only so the learner meets his real repo before any syntax.
- JS before TS follows Execute Program / Odin; TS earns its own chapter because the app's native rebuild is TypeScript.
- Testing sits at 22 rather than earlier (Boot.dev style) because this learner will not write much production code; he reviews it. It is placed right after debugging so "failing test as spec" lands when it is useful for supervision (Beck).
- The AI supervision chapter is last on purpose but its habits are seeded from chapter 7 onward: every sandbox exercise ends with "ask the agent *why*, not *do*," per the Anthropic inquiry-vs-delegation finding.

### Flags
- Hermans box/label effect size: unverified (PDF unparsed).
- Osmani "70% problem" primary URL 404'd; content confirmed via secondary sources only.
- No controlled research located on evolving glossaries; recommendation rests on CLT reasoning and practitioner consensus.
- PRIMM evidence base is school-age; adult transfer is an inference.
- Sorva TOCE page returned 403; claims taken from abstract text in search results and the Aalto thesis page.
