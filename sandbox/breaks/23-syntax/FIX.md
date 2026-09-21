# Fix

`state.js` line 4 is missing the comma between `streak: 0` and `lastCompleted`.

Broken:

    const DEFAULT_STATE = { northStar: "", streak: 0 lastCompleted: null, history: [] };

Fixed:

    const DEFAULT_STATE = { northStar: "", streak: 0, lastCompleted: null, history: [] };

`node --check state.js` now prints nothing and exits 0. Reload the page: the app works.

Why the whole app died from one comma: the browser parses the entire file before
running any of it. A file that cannot be parsed is never run at all, so
`dayKey`, `completeToday` and `state` never exist, and `app.js` then fails too.
One typo, two broken files, a blank screen.
