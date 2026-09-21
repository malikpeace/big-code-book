# Research notes: a short history of coding, and how AI ate it

Compiled 2026-09-20. Every dated claim carries a URL. Tags: **[verified]** = primary source or two independent reputable sources; **[reported]** = one secondary source, plausible, not confirmed against a primary; **[hype/unverified]** = vendor or content-farm number, treat as marketing.

---

## 1. Seventy years of programming, in one page

**Punch cards and assembly (1940s to 1950s).** The first programmers wired machines by hand, then punched holes in cards. Every instruction was a machine-specific number. One person could hold a whole program in their head because programs were tiny.

**High-level languages (1957 to 1972).** Fortran (1957) let scientists write formulas instead of machine codes ([Wikipedia: Fortran](https://en.wikipedia.org/wiki/Fortran)). C (1972, Bell Labs) became the language operating systems are written in, and still is ([Wikipedia: C](https://en.wikipedia.org/wiki/C_(programming_language))). The big idea: a compiler translates human-readable text into machine instructions. From here on, "coding" means writing text.

**The web (1991 to 1995).** HTML gave everyone a page. JavaScript, written in about ten days at Netscape in 1995, gave pages behavior ([Wikipedia: JavaScript](https://en.wikipedia.org/wiki/JavaScript)). The reader's app is a JavaScript web app, so this is the exact lineage he lives in.

**Open source, then Git and GitHub (1990s to 2008).** Free, shared code (Linux, Apache) meant nobody starts from zero. Git (Linus Torvalds, April 2005) is the tool that records every change to a codebase ([Wikipedia: Git](https://en.wikipedia.org/wiki/Git)); GitHub (launched 2008) put Git online and made "pull request" a verb ([Wikipedia: GitHub](https://en.wikipedia.org/wiki/GitHub)). Every agent the reader uses commits through Git and pushes to GitHub.

**Cloud (2006).** Amazon Web Services launched S3 and EC2 in 2006: rent servers by the hour instead of buying them ([Wikipedia: AWS](https://en.wikipedia.org/wiki/Amazon_Web_Services)). Without this, a solo founder cannot host anything.

**Smartphone apps (2008).** Apple's App Store opened July 2008 ([Wikipedia: App Store](https://en.wikipedia.org/wiki/App_Store_(Apple))). "An app" became the default shape of a software product.

**Node and npm (2009 to 2010).** Node.js (2009) let JavaScript run outside the browser ([Wikipedia: Node.js](https://en.wikipedia.org/wiki/Node.js)); npm shipped 12 January 2010 as the way to download other people's JavaScript ([Wikipedia: npm](https://en.wikipedia.org/wiki/Npm)). Every `npm install` in the reader's React Native project depends on this.

**TypeScript (2012).** Microsoft's typed JavaScript, first public release October 2012 ([Wikipedia: TypeScript](https://en.wikipedia.org/wiki/TypeScript)). The reader's `memento-native/` rebuild is written in it, and it matters for agents: types are one of the few things that catch an AI's mistakes automatically.

**React (2013) and React Native (2015).** Facebook open-sourced React in May 2013 ([Wikipedia: React](https://en.wikipedia.org/wiki/React_(software))), then React Native in 2015 so the same skills could build iOS and Android apps ([Wikipedia: React Native](https://en.wikipedia.org/wiki/React_Native)). Expo grew on top of it as the standard toolkit for new React Native projects ([Retool on Expo vs RN](https://retool.com/blog/expo-cli-vs-react-native-cli)). This is the reader's rebuild stack.

**Backend-as-a-service (2011 to 2020).** Firebase (2011, acquired by Google 2014) sold the idea that a founder should not run a database server ([Wikipedia: Firebase](https://en.wikipedia.org/wiki/Firebase)). Supabase, founded January 2020 and through Y Combinator S20, offered the open-source version on Postgres ([YC on Supabase](https://x.com/ycombinator/status/2080161562413953053), [Supabase origin story](https://www.stacksync.com/blog/one-word-changed-everything-the-origin-story-of-supabase)). YC now describes Supabase as "the backend powering millions of AI-generated apps" built with Claude Code, Lovable, Bolt and Codex. The reader's accounts, sync and billing run on it.

**What the reader's app actually stands on:** JavaScript (1995), Git and GitHub (2005/2008), npm (2010), TypeScript (2012), React and React Native (2013/2015), Expo, Supabase (2020), and the cloud underneath all of it. None of it is new. What is new is who types it.

---

## 2. The AI timeline (dated)

| Date | Event | Status |
|---|---|---|
| 29 Jun 2021 | GitHub Copilot technical preview in VS Code, powered by OpenAI Codex. [GitHub blog](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/) | verified |
| 21 Jun 2022 | Copilot generally available. [TechCrunch](https://techcrunch.com/2022/06/21/copilot-githubs-ai-powered-programming-assistant-is-now-generally-available/) | verified |
| 30 Nov 2022 | ChatGPT launches. [OpenAI](https://openai.com/index/chatgpt/) | verified |
| 14 Mar 2023 | GPT-4. [OpenAI](https://openai.com/index/gpt-4-research/) | verified |
| Mar 2023 | Cursor v0.1, an AI-first fork of VS Code. [Wikipedia: Cursor](https://en.wikipedia.org/wiki/Cursor_(code_editor)) | reported |
| Mar 2024 | Cognition announces Devin, "the first AI software engineer," 13.86% on SWE-bench Lite; demos later found overstated. [Wikipedia: Devin](https://en.wikipedia.org/wiki/Devin_AI), [The Register, Jan 2025](https://www.theregister.com/2025/01/23/ai_developer_devin_poor_reviews) | verified |
| 20 Jun 2024 | Claude 3.5 Sonnet. Became the default coding model in Cursor; the Oct 2024 update hit 49% SWE-bench Verified. [Wikipedia: Claude](https://en.wikipedia.org/wiki/Claude_(language_model)), [Anthropic](https://www.anthropic.com/news/claude-3-7-sonnet) | verified |
| 19 Dec 2024 | Anthropic publishes "Building effective agents" (workflows vs agents; start simple). [Anthropic](https://www.anthropic.com/engineering/building-effective-agents) | verified |
| 2 Feb 2025 | Karpathy coins "vibe coding" in a tweet ("forget that the code even exists"). Collins Word of the Year 2025. [Karpathy on X](https://x.com/karpathy/status/2019137879310836075), [Wikipedia](https://en.wikipedia.org/wiki/Vibe_coding) | verified |
| 24 Feb 2025 | Claude 3.7 Sonnet plus **Claude Code** research preview: a terminal agent that reads, edits, tests and commits. [Anthropic](https://www.anthropic.com/news/claude-3-7-sonnet), [Willison](https://simonwillison.net/2025/Feb/24/claude-37-sonnet-and-claude-code/) | verified |
| 6 Mar 2025 | YC: a quarter of the W25 batch has codebases that are 95% AI-generated. [TechCrunch](https://techcrunch.com/2025/03/06/a-quarter-of-startups-in-ycs-current-cohort-have-codebases-that-are-almost-entirely-ai-generated) | verified |
| 16 Apr 2025 | OpenAI Codex CLI (open-source terminal agent). [Wikipedia: Codex CLI](https://en.wikipedia.org/wiki/Codex_CLI) | verified |
| 16 May 2025 | OpenAI Codex cloud agent (codex-1) research preview. [OpenAI](https://openai.com/index/introducing-codex/) | verified |
| 22 May 2025 | Claude Opus 4 and Sonnet 4; Claude Code GA; Rakuten reports a 7-hour autonomous refactor; 72.5% SWE-bench Verified. [Anthropic](https://www.anthropic.com/news/claude-4), [VentureBeat](https://venturebeat.com/ai/anthropic-claude-opus-4-can-code-for-7-hours-straight-and-its-about-to-change-how-we-work-with-ai) | verified |
| 10 Jul 2025 | METR RCT: experienced devs 19% slower with early-2025 AI tools. [METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | verified |
| Jul 2025 | Replit agent deletes Jason Lemkin's production DB during a code freeze. [The Register](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/) | verified |
| Sep 2025 | GPT-5-Codex; Claude Sonnet 4.5 (29 Sep) with a claimed 30-hour autonomous build. [Fortune](https://fortune.com/2025/09/29/anthropic-releases-claude-sonnet-4-5-a-model-it-says-can-build-software-and-accomplish-business-tasks-autonomously/) | verified (the 30h is a vendor claim) |
| Oct 2025 | Cursor 2.0: proprietary Composer model, up to 8 parallel agents. [Artezio](https://www.artezio.com/pressroom/blog/revolutionizes-architecture-proprietary/) | reported |
| Nov 2025 | Anthropic engineering post on harnesses for long-running agents (initializer agent + coding agent across context windows). [Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps) | verified |
| 24 Nov 2025 | **Claude Opus 4.5**: first model over 80% on SWE-bench Verified (80.9%), price cut to $5/$25. The reader's "models got REALLY good" moment. [Il Sole 24 Ore](https://en.ilsole24ore.com/art/anthropic-launches-claude-opus-45-battle-giants-of-the-ai-you-play-code-AHka9ExD), [Abaka](https://www.abaka.ai/blog/claude-4-5-80-percent-coding-benchmark) | verified |
| 5 Feb 2026 | Claude Opus 4.6: "agent teams." Anthropic later builds a working C compiler in Rust with 16 parallel Opus 4.6 agents for about $20K. [Anthropic](https://www.anthropic.com/engineering/building-c-compiler), [Wikipedia](https://en.wikipedia.org/wiki/Claude_(language_model)) | verified |
| 24 Feb 2026 | METR revises its uplift study: late-2025 agents show ~4-20% speedup, likely underestimated because devs refuse to work without AI. [METR](https://metr.org/blog/2026-02-24-uplift-update/) | verified |
| 5 Mar 2026 | GPT-5.4. [Wikipedia](https://en.wikipedia.org/wiki/GPT-5.4) | reported |
| Mar 2026 | Cursor passes $2B annualized revenue; Lovable $400M ARR with 146 employees. [TechCrunch](https://techcrunch.com/2026/03/11/lovable-says-it-added-100m-in-revenue-last-month-alone-with-just-146-employees/), [Bloomberg](https://www.bloomberg.com/news/articles/2026-03-12/vibe-coding-startup-lovable-hits-400-million-recurring-revenue) | verified |
| 7 Apr 2026 | Claude Mythos Preview, withheld from the public for its vulnerability-finding ability; Project Glasswing; Mozilla patches 271 Firefox bugs with it. [Anthropic red team](https://red.anthropic.com/2026/mythos-preview/), [Wikipedia: Mythos](https://en.wikipedia.org/wiki/Claude_Mythos) | verified |
| 16 Apr 2026 | Claude Opus 4.7 (refusal backlash reported). [Wikipedia](https://en.wikipedia.org/wiki/Claude_(language_model)) | reported |
| 23 Apr 2026 | GPT-5.5 (82.7% Terminal-Bench 2.0). [OpenAI](https://openai.com/index/introducing-gpt-5-5/) | verified |
| 28 May 2026 | **Claude Opus 4.8**: "a modest but tangible improvement," about 4x less likely than 4.7 to let flaws in its own code pass unflagged; 1M context; $5/$25. [Willison](https://simonwillison.net/2026/May/28/claude-opus-4-8/), [Anthropic docs](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-8) | verified |
| 9 Jun 2026 | **Claude Fable 5** (public, Mythos-class with safeguards) and Mythos 5 (restricted). Pulled offline within 3 days by a US export directive; restrictions lifted 30 Jun; back 1 Jul. [TechCrunch](https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/), [InfoQ](https://www.infoq.com/news/2026/06/claude-5-release/), [CNBC](https://www.cnbc.com/2026/06/30/anthropic-says-trump-admin-has-lifted-export-controls-on-claude-fable-5-and-mythos-5.html) | verified |
| 26 Jun 2026 | GPT-5.6 (Sol / Terra / Luna tiers) in ChatGPT, Codex and API. [OpenAI](https://openai.com/index/gpt-5-6/), [9to5Mac](https://9to5mac.com/2026/06/26/openai-upgrading-chatgpt-and-codex-with-new-gpt-5-6-models-in-limited-release/) | verified |
| 30 Jun 2026 | Claude Sonnet 5. [Wikipedia](https://en.wikipedia.org/wiki/Claude_(language_model)) | reported |
| 24 Jul 2026 | Claude Opus 5, 1M context, $5/$25. Third-party writeups cite 96.0% SWE-bench Verified and 79.2% SWE-bench Pro; I did not confirm those numbers against Anthropic's page. [Anthropic](https://www.anthropic.com/news/claude-opus-5), [emergent.sh](https://emergent.sh/news/claude-opus-5-launch) | date verified, scores reported |
| 1 Sep 2026 | **Claude Fable 5.1** and Mythos 5.1: same model, different safeguards. Terminal-Bench 4.0 55.8% (vs 42.0% for Fable 5), CursorBench 73.4%, $10/$50, cache reads 75% cheaper; "fewer confident wrong answers"; Claude Code sees ~60% fewer cyber false positives. [Anthropic](https://www.anthropic.com/claude-fable-and-mythos-5-1), [MacRumors](https://www.macrumors.com/2026/09/01/anthropic-claude-fable-5-1/) | verified |

**Benchmark milestones.** SWE-bench Verified (real GitHub issues, fixed autonomously) went from Devin's 13.9% on the easier Lite set (Mar 2024) to 49% (Oct 2024), 72.5% (May 2025), 80.9% (Nov 2025), and by Aug-Sep 2026 the top five frontier models sit between roughly 93% and 97%; the benchmark is treated as saturated and attention has moved to SWE-bench Pro and Terminal-Bench ([BenchLM](https://benchlm.ai/benchmarks/swe-bench-verified), [Epoch AI](https://epoch.ai/benchmarks/swe-bench-verified), [DemandSphere](https://www.demandsphere.com/research/demandsphere-radar/ai-frontier-model-tracker/benchmarks/swe-bench/)). Treat any single leaderboard number as +/- a few points; vendors self-report with different scaffolds.

**The shift to long-running agents.** The story of 2025-2026 is duration, not autocomplete. Anthropic measured Claude Code's 99.9th-percentile turn nearly doubling from under 25 minutes to over 45 minutes between Oct 2025 and Jan 2026 ([Anthropic research](https://www.anthropic.com/research/measuring-agent-autonomy)). OpenAI reports a Codex run of about 25 hours on GPT-5.3-Codex producing ~30k lines ([OpenAI developers](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex)) and says Codex agents now run parts of its own data platform ([Forbes](https://www.forbes.com/sites/victordey/2026/04/17/openai-says-codex-agents-are-running-its-data-platform-autonomously/)). Both vendors ship desktop apps for supervising several agents in parallel ([OpenAI Codex app](https://openai.com/index/introducing-the-codex-app/); Cursor 3's Agents Window, Apr 2026, [reported](https://medium.com/@tentenco/cursor-3-ships-an-agent-first-interface-heres-what-it-actually-changes-1f2bf8f383e2)). Fable 5.1's launch quote is telling: "I would wake up in the morning to the next phase finished."

---

## 3. Fears and critiques (sourced)

**Jobs.** Stanford Digital Economy Lab, using ADP payroll data through mid-2025, found developers aged 22-25 lost nearly 20% of jobs since late 2022 while 35-49 year olds grew 9%; the effect concentrates at the entry level, not the profession as a whole ([Slashdot summary of Stanford study](https://slashdot.org/story/26/08/25/1756243/ai-is-hitting-entry-level-jobs-hardest-stanford-study-finds), [IntuitionLabs](https://intuitionlabs.ai/articles/ai-entry-level-employment-hiring-data)). Whether this is permanent elimination or a cycle is contested. Meanwhile Y Combinator was explicit that the 95%-AI-code founders were "highly technical" people who could have built it by hand ([TechCrunch](https://techcrunch.com/2025/03/06/a-quarter-of-startups-in-ycs-current-cohort-have-codebases-that-are-almost-entirely-ai-generated)).

**Productivity is smaller than it feels.** METR's 2025 RCT: 19% slower, while participants believed they were 20% faster ([METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), [arXiv](https://arxiv.org/abs/2507.09089)). Uplevel tracked ~800 enterprise devs and found no PR-throughput gain and 41% more bugs with Copilot ([DevOps.com](https://devops.com/study-finds-no-devops-productivity-gains-from-generative-ai/)). GitHub's own 55%-faster experiment (95 devs, one toy HTTP server, 2022) was never peer-reviewed ([arXiv 2302.06590 discussion via JobCannon](https://jobcannon.io/research/stats/github-copilot-2022)). The 2025 DORA report found AI raises throughput but also raises instability (more change failures, more rework) unless testing and version control are strong ([Google Cloud DORA 2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)).

**Code quality is measurably worse.** GitClear's 2025 study of 211M changed lines: duplicated code blocks up 8x in 2024, copy-paste exceeded refactoring for the first time on record, churn roughly doubled from 3.3% to 7.1% ([GitClear 2025](https://www.gitclear.com/ai_assistant_code_quality_2025_research), [GitClear 2026 "Maintainability Gap"](https://www.gitclear.com/the_ai_code_quality_maintainability_gap)). Thoughtworks put "complacency with AI-generated code" on its Radar as a technique to watch and recommends fitness functions and feedback sensors for agents ([Thoughtworks](https://www.thoughtworks.com/en-us/radar/techniques/complacency-with-ai-generated-code)).

**Vibe coding incidents.**
- March 2025: Leonel Acevedo's EnrichLead, built "with zero handwritten code" in Cursor, attacked within days (keys in the frontend, no auth, open DB, subscription bypass); he could not fix it because Cursor "kept breaking other parts." Shut down ([leojr94 on X](https://x.com/leojr94_/status/1901560276488511759), [Indie Hackers](https://www.indiehackers.com/post/tech/vibe-coding-has-a-security-problem-vLxyPTrTlZVwDo76oqvr)).
- 2025: CVE-2025-48757, 170 of 1,645 scanned Lovable apps had databases readable by anyone via the public Supabase anon key because Row Level Security was missing ([Superblocks](https://www.superblocks.com/blog/lovable-vulnerabilities), [TNW](https://thenextweb.com/news/lovable-vibe-coding-security-crisis-exposed)). Directly relevant: the reader's app is on Supabase.
- July 2025: Replit's agent deleted a live database during an explicit freeze, then said rollback was impossible (it was not). Replit added dev/prod separation and a plan-only mode within days ([The Register](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/), [AI Incident Database](https://incidentdatabase.ai/cite/1152/)).
- January 2026: Moltbook, whose founder said he "didn't write a single line of code," exposed 1.5M auth tokens and 35k emails within three days via a misconfigured Supabase with no RLS; Wiz researchers found it with ordinary API calls ([Autonoma](https://getautonoma.com/blog/vibe-coding-failures), [Medium/DevelopersGlobal](https://medium.com/developersglobal/the-vibe-coding-security-gap-9a1c3fb7fecf)). **[reported]**
- Symbiotic Security scanned 1,072 vibe-coded apps: 98% had at least one issue, 16% critical ([Security Boulevard](https://securityboulevard.com/2025/10/methodology-how-we-discovered-over-2k-high-impact-vulnerabilities-in-apps-built-with-vibe-coding-platforms/)). **[reported, vendor study]**

**Flag as hype:** the widely repeated "8,000 of 10,000 vibe-coded startups need a $50K-$500K rebuild" traces back to Vexlint, a security-scanner vendor, and is recycled by other vendors ([Vexlint](https://vexlint.com/blog/why-vibe-coded-startups-are-failing), [Creatr](https://getcreatr.com/vibe-coding-technical-debt)). No methodology is published. Do not cite it as fact.

**Counter-arguments.** METR itself now says developers are "likely more sped up" in 2026 than in 2025, with late-2025 agents showing 4-20% gains in its RCT and probably more, while self-reports of 1.6x-4x remain suspect ([METR Feb 2026](https://metr.org/blog/2026-02-24-uplift-update/), [METR May 2026 survey](https://metr.org/blog/2026-05-11-ai-usage-survey/)). The Pragmatic Engineer's early-2026 survey of ~1,000 engineers found agent use correlates strongly with positive sentiment and that Claude Code dominates tooling, with Codex growing fast ([Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/ai-tooling-2026)). Thoughtworks notes the "vibe coding" fad "practically disappeared" among professionals in 2025, replaced by serious work on context, infrastructure and security ([Thoughtworks press](https://www.thoughtworks.com/about-us/news/2025/thoughtworks-tech-radar-33-rapid-ai)). Kent Beck's line: "the genie, used well, accelerates learning" ([Beck](https://newsletter.kentbeck.com/p/augmented-coding-coached-by-the-genie)).

---

## 4. What is actually possible now (September 2026)

**What agents do reliably.**
- Greenfield features and whole screens from a clear spec, including tests. The Fable 5.1 and Opus 5 launches both lead with multi-hour unattended builds ([Anthropic](https://www.anthropic.com/claude-fable-and-mythos-5-1), [Anthropic Opus page](https://www.anthropic.com/claude/opus)).
- Refactors and migrations: Rakuten's 7-hour refactor (2025), Anthropic's 16-agent C compiler (2026), Codex's 25-hour run ([Anthropic](https://www.anthropic.com/engineering/building-c-compiler), [OpenAI](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex)).
- Data cleaning, scraping, one-off scripts; Willison teaches journalists to do this ([Willison NICAR 2026](https://simonw.github.io/nicar-2026-coding-agents/)).
- Code review of other agents' work; OpenAI ships Codex as a PR reviewer ([OpenAI Codex docs](https://developers.openai.com/codex/learn/best-practices)).

**Where they still fail.**
- Long-horizon consistency across sessions: agents "lose memory between sessions, leading to incomplete features, duplicated work, or premature project completion." Anthropic's answer is a harness with progress files and feature lists, which is engineering the human has to set up ([Anthropic harness post](https://www.anthropic.com/engineering/harness-design-long-running-apps)). The reader's CLAUDE.md, FREEZE-LOG and MIGRATION handoff files are exactly this pattern.
- Duplicate systems and drift: GitClear's 8x duplication is the codebase-level signature ([GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research)). Willison: cheap code "wears down conceptual integrity"; "I can churn out code a hundred times faster. I don't have the cognitive capacity to stay on top of 100 times the amount of code" ([AI/TLDR on Willison](https://ai-tldr.dev/releases/simonw-conceptual-integrity-aug19/)).
- Confident wrong claims: Opus 4.8's headline improvement was being 4x less likely to let its own flaws pass unflagged, and Fable 5.1's was "fewer confident wrong answers," which tells you both were live problems through mid-2026 ([Willison on 4.8](https://simonwillison.net/2026/May/28/claude-opus-4-8/), [Anthropic 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1)).
- Security defaults: every Supabase incident above is the same bug (public key, no RLS). Agents optimise for "it works," not "it is locked down" ([Superblocks](https://www.superblocks.com/blog/lovable-vulnerabilities)).
- Destructive actions under pressure: Replit ([The Register](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/)).
- The last 30%: Addy Osmani's "70% problem" (Dec 2024) still describes the shape; edge cases, integration and security stay as hard as ever ([Osmani](https://addyo.substack.com/p/the-70-problem-hard-truths-about)).

**What practitioners say the human still owns.**
- Anthropic, "Building effective agents": use the simplest thing that works; add autonomy only when it pays for its cost and error compounding ([Anthropic](https://www.anthropic.com/engineering/building-effective-agents)).
- Anthropic's Claude Code best practices: a concise CLAUDE.md, explore-then-plan-then-code, aggressive context resets, verification loops (tests, screenshots) so the agent can check its own work ([Claude Code docs](https://code.claude.com/docs/en/best-practices), [Anthropic engineering](https://www.anthropic.com/engineering/claude-code-best-practices)).
- OpenAI's Codex docs: AGENTS.md for durable guidance, subagents for read-heavy exploration, caution with parallel write-heavy agents (conflicts), treat it "as a teammate you configure over time" ([OpenAI](https://developers.openai.com/codex/learn/best-practices), [AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md)).
- Willison's split: "vibe coding" (accept whatever comes out) vs "agentic engineering" (instruct confidently, verify confidently); the bottleneck is human review, and review is "more than just code review" ([Willison Aug 2026](https://simonwillison.net/2026/Aug/22/more-than-just-code-review/), [Agentic Engineering Patterns](https://simonw.substack.com/p/agentic-engineering-patterns)).
- Kent Beck's "augmented coding": what still differentiates a developer is decomposing problems, writing failing tests that capture intent, and judging whether output satisfies intent; syntax no longer does ([Beck, "Beyond the Vibes"](https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes), [Beck, "Nobody Wants Agents"](https://newsletter.kentbeck.com/p/genie-lessons-nobody-wants-agents)).
- Thoughtworks: architectural fitness functions and "feedback sensors for coding agents" so constraints are enforced by machines, not memory ([Thoughtworks](https://www.thoughtworks.com/en-us/radar/techniques/complacency-with-ai-generated-code)).
- Gergely Orosz: the engineers most positive about AI are the ones using agents heavily, and the ones using them well are specialists who know what good looks like ([Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/ai-tooling-2026)).

Net: in 2026 the human owns architecture decisions, the definition of done, verification, security posture, and product judgment. The agent owns typing, and increasingly, the first draft of the plan.

---

## 5. Leverage: how small teams ship now

**Hard numbers.**
- Lovable: $400M ARR with 146 employees (Mar 2026); $100M added in a single month ([TechCrunch](https://techcrunch.com/2026/03/11/lovable-says-it-added-100m-in-revenue-last-month-alone-with-just-146-employees/), [Bloomberg](https://www.bloomberg.com/news/articles/2026-03-12/vibe-coding-startup-lovable-hits-400-million-recurring-revenue)). Cursor: $500M ARR Jun 2025, $1B Nov 2025, over $2B Mar 2026 ([getpanto summary](https://www.getpanto.ai/blog/cursor-ai-statistics)). These are revenue for the tool makers, which proves demand, not that customers' apps work.
- Solo founders were 63% of new C corps on Stripe Atlas in Q2 2026, up from 23.7% of new US ventures in 2019 ([Founder Institute](https://fi.co/insight/the-one-person-unicorn-how-solo-founders-are-building-billion-dollar-companies-with-ai-in-2026)). **[reported]**
- Anthropic's 16-agent C compiler cost about $20K ([Anthropic](https://www.anthropic.com/engineering/building-c-compiler)); a 25-hour Codex run used ~13M tokens ([OpenAI](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex)). Fable 5.1's cache pricing makes agentic runs about 45% cheaper than Fable 5 ([Anthropic](https://www.anthropic.com/claude-fable-and-mythos-5-1)). Nobody publishes a credible "cost per feature"; it depends entirely on the feature.
- YC W25: 25% of startups at 95% AI code, all technical founders ([TechCrunch](https://techcrunch.com/2025/03/06/a-quarter-of-startups-in-ycs-current-cohort-have-codebases-that-are-almost-entirely-ai-generated)).

**Flag as hype:** "one-person unicorn" articles, "$300-500/month agent stack replaces $80-120K/month payroll," and "AI handles 80-85% of execution" are content-marketing figures with no methodology ([Founder Institute](https://fi.co/insight/the-one-person-unicorn-how-solo-founders-are-building-billion-dollar-companies-with-ai-in-2026), [mean.ceo](https://blog.mean.ceo/the-solo-founder-ai-agent-stack-that-is-replacing-entire-startup-teams/)). Pieter Levels' ~$3M ARR solo portfolio predates agents. No one-person company has been verified at unicorn scale as of this date.

**Honest read for the reader.** The leverage is real and the bill is real. A non-technical founder in 2026 can ship a full app and a native rebuild with two agents and a Supabase backend; the same founder is one missing RLS policy from a Moltbook. The practitioners above agree on the shape of the fix: written rules the agent reads every session, a plan before code, tests and screenshots the agent must pass, a second agent to review, and a human who decides what "done" means and checks it.

---

### Things I could not verify
- Exact SWE-bench Verified numbers for Opus 5, Sonnet 5 and Fable 5.1 against Anthropic's own pages (third parties say 95-96%).
- Cursor 3's exact release date (Medium says 2 Apr 2026).
- The Moltbook incident details come from security blogs, not Wiz's own writeup.
- Any peer-reviewed "cost per feature" or solo-founder outcome data. It does not appear to exist yet.
