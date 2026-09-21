# Chapter 06 fact-check

## Direct fixes applied

None.

## Findings

No open findings.

## Verification

- `memento-native/package.json:9-16` defines the commands exactly as shown.
- The launcher excerpt and its port-kill explanation match the pinned repository.
- `memento-app/js/` contains 38 files, and searching the pinned app produces 25 lines that call or otherwise reference `persistState` in the intended exercise shape.
- The v1 sandbox contains five application/data files plus `server.js`, with `.gitignore` as an additional hidden file.
- No em dashes found in the chapter source.
