# Chapter 25 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** "Every script tag carries `?v=v1378`" conflicts with the web pin. All local script tags carry a `?v=` cache-buster, but the 57 tags contain 14 versions and only two are `v1378`. Use the same precise explanation as chapter 20.
2. **MISSING:** The exercise says the fixed server's size cap, validator, and 500 wall are tagged for chapter 25, but `sandbox/v1-secure/server.js` tags those fixes `CHAPTER 18`. Only the owner slot and revision conflict are tagged `CHAPTER 25`. Either retag the file or update the exercise's navigation promise.
3. **MISLEADING:** As in chapter 18, the Supabase anon key is not merely "an address." It is a publishable credential whose database role must be constrained by grants and RLS.

## Verification

- The proxy posture, fail-closed limiter, method gate, native tree validator, array cap, debounce, file sizes, line counts, build stamp, and spend-guardrail migration all match the pins.
- Exact pinned measurements: `dashboard.css` 411,050 bytes; `action.css` 283,557 bytes; `08-cards-grid-share.js` 10,478 lines; `09-controllers.js` 7,064 lines.
- The vulnerable and secure Memento Jr server line references otherwise match the current sandbox files.
- No em dashes found in the chapter source.
