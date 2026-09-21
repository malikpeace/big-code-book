# Chapter 01 fact-check

## Direct fixes applied

None.

## Findings

No open findings.

## Verification

- The web pin contains 38 JavaScript files under `memento-app/js/`.
- `memento-app/js/33-action-shim.js` is exactly 37 lines at `ca8afc8`; lines 1-19 explain the deletion and forwarding contract, and lines 20-37 contain the shim shown in the chapter.
- The file itself says "about eighty places" still name the old door. Treat that phrase as the repository's documented estimate, not as an exact current call-site count.
- Sandbox code is internally consistent and does not write to Memento.
- No em dashes found in the chapter source.
