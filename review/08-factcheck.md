# Chapter 08 fact-check

## Direct fixes applied

None.

## Findings

1. **MISLEADING:** "`git branch` at native pin `93bfa796` lists 59 labels" cannot be pinned to a commit. Branch refs live outside commit history and keep changing; the checkout now lists 60. Present the output as a dated snapshot, not a fact belonging to `93bfa796`.
2. **NIT:** "Deleting a branch is not dangerous" is too absolute before the later caveat. Deleting the last label for unmerged commits makes them reachable only through reflog until expiry. Say it does not immediately delete commits, then keep the reachability explanation.

## Verification

- The sampled branch names and the `+` worktree marker exist in the current repository.
- The migration-plan and approval-log excerpts match the native pin.
- The conflict exercise correctly creates same-line edits on two branches and leads to a two-parent merge commit.
- No em dashes found in the chapter source.
