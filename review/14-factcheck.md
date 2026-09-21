# Chapter 14 fact-check

## Direct fixes applied

None.

## Findings

1. **NIT:** The reset command `git checkout sandbox/v1` is dependent on being at the CODE-BOOK root and uses the older overloaded `checkout` spelling. Use `git -C ~/Downloads/CODE-BOOK restore -- sandbox/v1` so a beginner cannot accidentally run it from the wrong directory.

## Verification

- The web state, persistence, and render excerpts match `ca8afc8`; the native reducer and `HoldToComplete` excerpts match `93bfa796`.
- `sandbox/v1/app.js:14-21` and `state.js:47-62` match the exercise's reading directions exactly.
- The 150 ms debounce is exact at both the real web pin and Memento Jr.
- No em dashes found in the chapter source.
