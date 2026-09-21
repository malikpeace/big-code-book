# Chapter 30 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** The graduation procedure tells Malik to create and switch a branch inside `~/Downloads/MEMENTO`, the shared checkout, then later `git switch main`. That violates the repository's own multi-agent rule not to switch the Downloads checkout out from under another agent and conflicts with this project's strict read-only rule. After explicit graduation permission, create an isolated worktree or separate clone for the branch; keep the Downloads checkout untouched.
2. **WRONG:** "Native: `npm run check` in the lab copy" does not verify the proposed change unless the lab was freshly exported from the graduation branch after the change. The current Job 3 lab is pinned to `93bfa796`, so it would test the old snapshot. Add an explicit export of the authorized branch commit into a new disposable verification directory.
3. **MISSING:** `closeToday()` at `feelSampleStore.ts:67` is nested inside `openFeelSampleStore` and needs storage/context setup before it can be run. For a first tracing rubric, Memento Jr's global `completeToday()` is directly runnable and tests the same core skill; otherwise provide the exact native test that exercises `closeToday`.
4. **NIT:** "Nine days of freeze" became stale the next day. Use the fixed freeze date, 11 September 2026, or compute the elapsed duration rather than baking it into prose.
5. **MISLEADING:** The reset note says `git switch main` leaves the branch harmlessly, but switching the shared Downloads checkout is precisely the action the protocol forbids. In an isolated worktree, closing the pull request and removing that worktree are the safe cleanup operations.

## Verification

- The freeze rules, empty freeze log, commit rules, and approval commit match native pin `93bfa796`.
- `persistState()` is directly traceable at the web pin; `closeToday()` exists at native line 67 but is not directly exported.
- The permission gate is explicit and strong; the unsafe part is checkout location, not the requirement for same-day authorization.
- No em dashes found in the chapter source.
