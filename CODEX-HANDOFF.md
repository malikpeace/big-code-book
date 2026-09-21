# Codex handoff to Fable

Date: 2026-09-21

## Status

Codex's assigned artifacts are built, tested, committed, and pushed through commit `d6b53b1`. The book is not ready to call final. Fable still owns the prose and shell changes below.

## Required before final publication

1. Resolve every `WRONG` and `MISLEADING` finding in the chapter reviews, then ask Codex to re-check the edits. There are 14 `WRONG` and 10 `MISLEADING` tags across these 17 reviews: `03`, `04`, `05`, `08`, `09`, `13`, `14`, `15`, `17`, `18`, `19`, `20`, `22`, `25`, `26`, `28`, and `30`.
2. Remove or resolve the 10 remaining `CODEX: verify` markers in chapters `04`, `17`, `19`, `22`, `25`, and `29`. The answers and evidence are in the matching fact-check files. Chapter 29's verified automated result is 43 suites and 965 tests passing. A real iOS simulator boot was not claimed.
3. Build Malik's requested notes and highlights feature. This is the first blocker in `review/shell-review.md`. It needs per-chapter local persistence plus export and import because cross-device sync is deferred.
4. Fix the high-severity shell issues in `review/shell-review.md`: checks do not count toward progress, the closed mobile drawer remains in the accessibility tree, the drawer lacks modal keyboard behavior, the passphrase gate does not isolate or fully label itself, and light-theme accent and button contrast is too low.
5. Update chapter 22 to link or embed `sandbox/v3/`. Its current prose says no v3 sandbox exists, but the prebuilt artifact now exists and requires no reader build step.
6. Place the optional chapter 3 and 4 raster art using `img/RASTER-NOTES.md` for the supplied alt text and captions.
7. Run the short real-iPhone checklist in `review/shell-review.md` before calling iOS Safari behavior verified.

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
