# Chapter 22 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** The excerpt attributed to `memento-native/src/app/index.tsx:45-50` includes `CLARITY_SAMPLE`, but native pin `93bfa796` has no such constant. At the pin, line 44 defines `FEEL_SAMPLE`, lines 45-47 define the entry preview and helper, and line 50 defines `RUN`. Remove the uncommitted working-tree excerpt and quote only the pin.
2. **WRONG:** Because the third preview constant is absent at the pin, "every one of these previews" describes three gates while the pinned `Index` function at lines 147-150 has only two dev-preview branches: entry and feel.

## Verification

- `_layout.tsx`, package versions, `HoldToComplete`, theme, reducer, and migration-decision excerpts match the native pin.
- `src/app/index.tsx` is exactly 150 lines at the pin and its default export is at 147-150.
- The read-only exercise points to an existing native source file and requires no writes.
- No em dashes found in the chapter source.
