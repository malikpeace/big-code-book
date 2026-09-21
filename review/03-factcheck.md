# Chapter 03 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** The language table says Python is not in Memento. The web pin contains 10 tracked `.py` files, including `memento-backend.py`, `tools/bundle-single-file.py`, `tools/sim90/compose.py`, and seven mockup/build scripts. Change this to explain that Python is used for tooling, mockups, simulation, and a legacy backend file, but not for the shipped browser or React Native app.

## Verification

- The web pin has 33 SQL migration files and 22 CSS files.
- The native pin has no tracked Swift source, so "under React Native, nobody on your side writes it" is fair for the checked-in source.
- The cited script-tag and `package.json` excerpts match their pins.
- No em dashes found in the chapter source.
