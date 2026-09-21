# Chapter 13 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** The paste-able why-question says "every src ends in `?v=v1378`." At web pin `ca8afc8`, the 57 version tags contain 14 different versions; only two tags use `v1378`. Ask why each local script has a `?v=` tag, why the values differ, and what the build-stamp check does.
2. **NIT:** The reset command `git checkout sandbox/v1/style.css` only works from the CODE-BOOK root, while the exercise's location is `sandbox/v1`. Use an unambiguous command such as `git -C ~/Downloads/CODE-BOOK restore -- sandbox/v1/style.css`.

## Verification

- The HTML, CSS token, inline handler, event-listener, and native-theme excerpts match the cited pins.
- `sandbox/v1/style.css:3` contains the stated dark accent, with a separate light-mode accent at line 9.
- No em dashes found in the chapter source.
