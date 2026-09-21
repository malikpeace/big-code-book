# Chapter 24 fact-check

## Direct fixes applied

None.

## Findings

No open findings.

## Verification

- Native pin `93bfa796` contains 43 `*.test.*` files, 307 plain `test(` declarations, and 70 `test.each` tokens.
- Web pin `ca8afc8` contains 47 `tools/test-*` scripts in total; the deploy workflow names 29, leaving 18 unlisted.
- The token test, frozen-web oracle, native scripts, and workflow lines match the pins.
- The chapter carefully says `test.each` expands at runtime rather than pretending 377 declarations equal the final Jest test count.
- No em dashes found in the chapter source.
