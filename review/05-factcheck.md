# Chapter 05 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** The exercise promises "Those 178 entries are the real repo root." The native pin contains 97 tracked top-level entries, and the current checkout presently shows 168 non-hidden top-level entries. An exact live `ls` count is not pinned and will drift. Remove the number and say the root is unusually crowded.

## Verification

- The web pin contains 38 JS files and 22 CSS files; the native pin has 16 directories under `memento-native/src/`.
- `persistState` appears on 25 matching lines when searching the pinned web app, consistent with the editor example's "25 places" wording.
- The index comment at 809-813 and `CLAUDE.md` excerpt are accurate at their cited pins.
- No em dashes found in the chapter source.
