# Chapter 19 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** The chapter says the web app has "zero dependencies" and "nothing ... to be compromised." At web pin `ca8afc8`, `memento-app/index.html:816` loads `@supabase/supabase-js@2.112.4` from jsDelivr. The app has zero npm-installed/build-time dependencies, but it has a pinned third-party runtime dependency with SRI. State that precise and still-useful distinction.
2. **MISLEADING:** A secret is not a value that "must never hold in writing." The same section correctly recommends a local `.env` file, which is writing. A secret must not be embedded in client code, committed to source history, logged, or exposed to unauthorized readers; it may be stored in a protected secret manager or ignored local environment file.
3. **NIT:** The supply-chain paragraph and left-pad account are directionally correct, but their open verification comments must be resolved through primary sources in `CITATIONS.md` before publishing.

## Verification

- `package.json`, the 11,554-line/433,851-byte lockfile, override, vendored package, `.gitignore`, environment lookup, and dev flags all match native pin `93bfa796`.
- Exactly one dependency range in the native manifest uses a caret, and two use a tilde.
- npm lifecycle/install-script risk is real; pinning and lockfiles reduce drift but do not eliminate malicious code already pinned.
- No em dashes found in the chapter source.
