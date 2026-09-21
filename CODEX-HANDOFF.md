# Codex handoff to Fable

Date: 2026-09-21

## Status

Codex's assigned artifacts are built, tested, committed, and pushed through commit `d6b53b1`. Malik's priority is an accurate 80/20 understanding of what Memento does in the background, not textbook-level completeness. Only factual corrections block him from using the book. Fable owns those prose edits.

## Required before Malik relies on the book

1. Resolve every `WRONG` and `MISLEADING` finding in the chapter reviews, then ask Codex to re-check the edits. There are 14 `WRONG` and 10 `MISLEADING` tags across these 17 reviews: `03`, `04`, `05`, `08`, `09`, `13`, `14`, `15`, `17`, `18`, `19`, `20`, `22`, `25`, `26`, `28`, and `30`.
2. Remove or resolve the 10 remaining `CODEX: verify` markers in chapters `04`, `17`, `19`, `22`, `25`, and `29`. The answers and evidence are in the matching fact-check files. Chapter 29's verified automated result is 43 suites and 965 tests passing. A real iOS simulator boot was not claimed.

`MISSING` and `NIT` findings do not block this goal unless they would cause Malik to form a false mental model of Memento.

## Useful extras, not blockers

1. Notes and highlights are optional. A local-only notes tab is simple. Notes that stay synchronized between Mac and phone require shared storage and identity, so defer that rather than expanding the project.
2. Embedding the seven interactives and `sandbox/v3/` is optional. If used, place them only where they make the explanation easier.
3. Shell accessibility fixes and a real-iPhone test are valuable polish, but they do not delay the correctness pass.
4. Malik's visual direction is simple teaching diagrams in the spirit of Alex Hormozi's books: one clear relationship, minimal labels, and only where the picture adds understanding. Do not force an image into every explanation. Every chapter already has an inline diagram. Simplify or remove one only when it does not help. The chapter 3 and 4 raster files are optional extras, not required chapter art.

## Codex deliverables

1. `review/01-factcheck.md` through `review/30-factcheck.md`, commit `cf8f393`.
2. `research/CITATIONS.md` and `tools/cite-check.sh`, commit `2399f2e`. Latest run verified 139 pinned file ranges and listed 9 manual citations.
3. Nine disposable break exercises and the native lab maker, commit `2189207`. The current native lab passes typecheck plus all 43 suites and 965 tests.
4. Disposable Git lab maker, commit `0f7d2c4`. Latest run produced exactly 3 commits, 2 branches, and 1 intentional unmerged conflict.
5. Seven framework-free interactives, commit `2e425b0`. Each HTML file is under 200 lines. The SQL policy demo is explicitly labeled a simulator.
6. Shell audit with nine screenshots, commit `7a9046b`.
7. Chapter 3 and 4 raster art plus prompt and alt-text handoff, commit `7ecb3cb`.
8. Prebuilt React Native Web v3 exercise, commit `d6b53b1`. `HoldToComplete.tsx` is 75 lines and uses `useState`, `useEffect`, and `useRef`. `npm ci`, the build, browser render, and early-release behavior passed. Dependency audit found zero vulnerabilities.

## Environment state

- `~/Downloads/MEMENTO` was treated as read-only throughout.
- The CODE-BOOK worktree is clean at this handoff.
- The plain local server is running at `http://127.0.0.1:8477/index.html`.
