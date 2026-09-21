# Chapter 26 fact-check

## Direct fixes applied

None.

## Findings

1. **MISLEADING:** The architecture comparison says the web app has "40 hand-written scripts" and 27 in the workflow, while chapter 24 correctly counts 47 total test scripts and 29 named. Later this chapter reveals that 40/27 counts only `.mjs`, but the earlier table does not say so. Use 47/29 for the total or label the extension-specific subset every time.

## Verification

- The web pin has 38 JS files and 67,023 lines across them; the native pin has 16 top-level source folders and 43 test files.
- The large-file line counts, drifted CLAUDE map, 37-line shim, 921-line billing module, stale `DECISIONS.md`, and duplicated numeric prefixes match the pins.
- There are exactly 40 `.mjs` test scripts, 27 of which are named in the workflow; including `.js` gives 47 total and 29 named.
- `MIGRATION/FROZEN-AT` and `FREEZE-LOG.md` match the stated frozen state at the native pin.
- No em dashes found in the chapter source.
