# Chapter 29 fact-check

## Direct fixes applied

None.

## Findings

1. **MISSING:** The chapter promises exact observed Jest and Metro output but still contains unverified sample numbers. Do not publish `42 suites`, `1,136 tests`, `61.2 s`, or `1,284 modules` as expected output until Job 3's frozen lab copy is installed and run. Keep only the shape if exact numbers are intentionally illustrative.
2. **MISSING:** On a clean simulator with no preview flags and no saved synthetic session, source inspection indicates `RootGate` settles to "Sign-in is not connected yet." A ready saved session instead renders `BootScreen`, and blocked storage renders the recovery copy. State those branches and record the actual Job 3 simulator observation when available.
3. **NIT:** The instruction to run `sudo xcodebuild -license accept` is a privileged system mutation. It should be conditional on the exact Xcode license error and clearly separated as a user-approved Mac setup step, not routine project setup.

## Verification

- `package.json`, `_layout.tsx`, `index.tsx:147-150`, the README quote, and phone-test record all match native pin `93bfa796`.
- The pin has exactly two dev-preview branches in `Index`: entry and feel, then `RootGate`.
- The recovery sentence appears in exactly three pinned source files as the exercise states.
- Runtime counts and simulator appearance remain deliberately pending the disposable lab run; nothing was installed or run in Memento.
- No em dashes found in the chapter source.
