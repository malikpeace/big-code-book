# Chapter 07 fact-check

## Direct fixes applied

None.

## Findings

1. **NIT:** The `.git` size of 462 MB is a property of a mutable local object database, not of commit `93bfa796`. It is currently about 468 MB. Label it as a measurement made on the author's date, or omit the exact number.

## Verification

- `git rev-list --count 93bfa796` returns 2,659 commits.
- The archived `memento-app/` content at the web pin is about 7.9 MB, consistent with the rounded 7.8 MB claim.
- The shown commit metadata, stat, hashes, and subjects match repository history.
- The git-lab commands are safe when run only in the disposable book repo.
- No em dashes found in the chapter source.
