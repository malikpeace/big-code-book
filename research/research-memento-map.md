# Memento, a teaching map (read-only survey, 2026-09-20)

Surveyed at the frozen web version v1378 and the native rebuild as of this date. Every path is relative to `~/Downloads/MEMENTO`. Line numbers drift; Codex re-verifies each one against a pinned commit before a chapter ships.

## A. The two apps

### 1. `memento-app/` : the frozen web app
A plain website. No framework, no build step, no bundler. `index.html` is the shell; the browser loads about 39 JavaScript files and 23 CSS files in a fixed order via `<script src>` tags (index.html lines 816-880, each tagged `?v=v1378` for cache busting). 67,023 lines of JS, 32,288 lines of CSS.

The numbering IS the architecture: files load in numeric order, share one global scope (classic scripts, deliberately not ES modules), and the number encodes load order.

Best 7 files to teach from:

| File | Concept |
|---|---|
| `js/01-state-foundation.js` (3,168 lines) | State: one big object, saved to the browser |
| `js/03-ai-integration.js` (7,021 lines) | Calling an AI over the network; where keys must not live |
| `js/12-cloud-sync.js` (1,924 lines) | Accounts, sync, conflict resolution |
| `js/15-router.js` (315 lines) | Routing: which screen the URL means |
| `js/16-doors.js` | Hash routing + back-button handling |
| `js/22-billing.js` | Money: checkout, receipts, entitlement |
| `js/33-action-shim.js` (38 lines) | Deleting a feature safely; the whole file is a comment plus a forwarder |

### 2. `memento-native/` : the React Native / Expo / TypeScript rebuild
104 TS/TSX files, 8,571 lines. Expo SDK 57, React Native 0.86, React 19, expo-router, TypeScript strict. About one eighth the size of the web app and covering a fraction of it: a careful re-derivation, not a port.

Folders in plain terms:
- `src/app/` router entry points (`_layout.tsx`, `index.tsx`).
- `src/ui/` colors, fonts, text primitives, theme hook.
- `src/storage/` how data is saved on the phone (MMKV) plus ~15 normalizer files that repair old saved data.
- `src/sync/` talking to Supabase, deciding which copy wins.
- `src/auth/` sign-in, session vault, secure token storage.
- `src/billing/` paid-access receipts and their rules.
- `src/ai/` the typed transport to the AI proxy.
- `src/clarity/` the Clarity interview screens + reducer.
- `src/home/`, `src/notes/`, `src/rewards/`, `src/star/`, `src/entry/` screens.
- `src/rules/` pure logic ported verbatim from the web as `.js` + hand-written `.d.ts`.
- `src/runtime/` boot gates deciding what renders first.
- `src/sample/` dev-only synthetic data.

Best 8 files:

| File | Concept |
|---|---|
| `src/ai/transport.ts` (103 lines) | Types, async/await, streaming, error codes |
| `src/storage/journal.ts` | Saving data safely (two copies, checksums) |
| `src/storage/mmkv.ts` (9 lines) | The smallest useful module in the repo |
| `src/home/HoldToComplete.tsx` | A React component + hooks + animation |
| `src/clarity/clarityFlow.ts` | A reducer: state changes as pure functions |
| `src/billing/accessPolicy.ts` (51 lines) | Business rules as testable pure functions |
| `src/ui/theme.ts` | Design tokens and a custom hook |
| `src/runtime/RootGate.tsx` | `useEffect`, subscriptions, cleanup |

## B. One button press, end to end

### The Clarity interview (free, anonymous), web path
1. UI event: `js/02-clarity-experience.js:475` `addEventListener('click', ...)`. Clarity's close button is inline in `index.html:621` (`onclick="smartCloseClarity()"`). Two event styles in one app.
2. State + first request: `js/03-ai-integration.js:4753` `autoStartAiChat()` sets `aiChatLoading = true`, calls `refreshAiChatUI()`, awaits `callClaude(...)`.
3. The network call: `js/03-ai-integration.js:3044` `callClaude(messages, systemPrompt, options)`. Line 3050 reads `window.MEMENTO_SUPABASE_URL` / `_ANON` (set at `js/12-cloud-sync.js:25`). Lines 3080-3082 pick `supaUrl + '/functions/v1/' + (paidAction ? 'action-ai-proxy' : 'clarity-ai-proxy')`. Lines 3094-3102 headers: free Clarity uses the public anon key; paid Action uses the user's session token (3084-3092), else `throw new Error('Sign in to use paid Memento AI.')`. Lines 3119-3124: free Clarity sends only `{ operation, messages, profile_context }`; the server picks model, prompt, token limit.
4. The proxy: `supabase/functions/clarity-ai-proxy/index.ts` is 7 lines re-exporting `../ai-proxy/index.ts`. The real thing is `supabase/functions/ai-proxy/index.ts` (283 lines). Header comment lines 1-17: "the ONLY place its Anthropic key lives". Line 108 `Deno.env.get('ANTHROPIC_API_KEY')`. Lines 102-106 origin check, POST only. Lines 121-159 rate limits (device, IP, global) before any spend, fail closed. Line 143 `buildClarityRequest(body)`: server decides model and prompt. Line 239+ `fetch('https://api.anthropic.com/v1/messages', ...)` with a 120s timeout. Line 188: never forward the provider's raw error body.
5. Response to state: `03-ai-integration.js:4090` `parseAiQuestion(response)`; `autoStartAiChat` writes into `aiChatMessages` (4788-4794), `refreshAiChatUI()`.
6. Persistence: `js/01-state-foundation.js:488` `persistState()` debounced 150ms, then `writeStateToStorage()` (461) does `localStorage.setItem(APP_KEY, JSON.stringify(state))` at 476, with a 30-second rolling backup (471-472) and a quota warning (477-486).
7. Cloud sync: `persistState()` line 493 calls `CloudSync.schedulePush()` (`js/12-cloud-sync.js:763`) → `pushNow()` at 770 → `client.rpc('sync_user_state', { p_state, p_device, p_expected_revision })` at 778.
8. Supabase: `supabase/migrations/20260724113000_safe_user_state_sync.sql` defines `sync_user_state`, a `security definer` Postgres function that checks `auth.uid()`, compares revisions, and refuses to let a blank snapshot overwrite a meaningful one (`is_memento_state_meaningful`, lines 6-34).

### Native path (same shape, typed)
`src/clarity/ClarityExperience.tsx` → `clarityFlow.ts` reducer emits a pending request → `src/clarity/aiPort.ts` (an interface, "never a URL", line 1) → `src/ai/transport.ts`: `buildRequest()` 15-44 picks the path (43); line 17 refuses a request that is both paid and Clarity, or neither; 74 headers; 76-89 server-sent-event streaming; 59 `allowed()` kills the request if the signed-in user changes; 52 maps HTTP status to a friendly code (`429 → 'rate-limit'`).

### Sign-in
- Web: `js/12-cloud-sync.js:20-21` hardcodes `SUPABASE_URL` and the anon key (public by design). 1783 `supabase.createClient(...)`. Google: 1562 `client.auth.signInWithOAuth({ provider: 'google', ... })`, gated by `window.MEMENTO_GOOGLE_AUTH` (12-14, 1507).
- Native: `src/auth/emailProvider.ts` email one-time-code sign-in, 35 lines; line 26 re-verifies with `getUser()` and checks the id matches. `src/auth/sessionController.ts` holds the lifecycle (epochs, serialized vault writes, sign-out that keeps unsynced data, line 60 `retainPending`). Tokens in `expo-secure-store`, never in the state blob.

### Payment (Polar, not Stripe)
- Web: `js/22-billing.js` 18-27 maps environment → edge function name (`polar-checkout` vs `polar-production-checkout`). 114 `fetch(base + '/functions/v1/' + name, ...)`. 414-420 get a `checkout_url`, verify `result.environment === environment`, `location.assign(...)`. Card details never touch Memento. 484 `refreshAccess(checkoutId)`.
- Server: `supabase/functions/polar-production-checkout/index.ts`, `polar-production-webhook/index.ts`. Token in `Deno.env.get('POLAR_PRODUCTION_ACCESS_TOKEN')` (`_shared/polar-production.ts:105`), kill switch `POLAR_PRODUCTION_MODE` (78), allowlist `POLAR_PRODUCTION_TEST_EMAILS` (86).
- Native: `src/billing/accessPolicy.ts` + `accessController.ts`. Receipt is a UI cache, never authority: `accessController.ts:10-12` `paidServerAuthority: false`. Offline grace 72h bounded by paid-through (`accessPolicy.ts:5, 19-23`); `validateReceipt` recomputes bounds (49).

## C. Data model
- Web: one object `state` in `js/01-state-foundation.js`; `DEFAULT_STATE` from line 35, ~90 lines. Top-level keys: profile, dev, entitlements, clarity, action, goalProgress, perfectWeek, goalDone, rewards, dayRecords, actionPlan, clarityNotes, streak, flow, mori, lifestats, checkins, reflection, support, spotify, deepwork, distraction, inbox, timeblocks, people, vivere, widgetOrder, hiddenWidgets, introsSeen, meta, ui, prefs, aiCache, proofEvents, analytics. Saved under `APP_KEY = 'memento_v5'` (14), `SCHEMA_VERSION = 1` (15), `_backup` and `_corrupt` copies (310-327).
- Native: same payload, different container. `src/storage/mmkv.ts` one MMKV db per user id. `src/storage/journal.ts` two-copy journal (`primary` + `pending`), envelope `{format, owner, generation, schema, payload}` with an FNV checksum (22-26); error codes at 13: `corrupt | future-format | wrong-owner | stale | invalid | write-uncertain`. `src/storage/stateValidation.ts` JSON walker capped at 250,000 nodes / depth 40 (17), credential stripping (`CREDENTIAL_PATHS`, 11). `src/storage/frozenDefaults.json` is the web `DEFAULT_STATE` as data. ~15 `normalize*.js` files.
- SQL: 33 dated, forward-only migrations in `supabase/migrations/`. Notable: `..._safe_user_state_sync.sql`, `..._security_rate_limits.sql`, `..._account_deletion.sql`, `..._harden_public_shares.sql`, `..._least_privilege_boundaries.sql`, `20260827130000_ai_spend_guardrails.sql`, `20260910150000_analytics_funnel_v2.sql`. Loose scripts: `supabase/setup-events-and-rate-limit.sql`, `supabase/setup-push.sql`.

## D. Infra and deploy
- Web deploy is a two-repo mirror. `.github/workflows/deploy-live.yml`: on push to `main` touching `memento-app/**`, run `node --check` on every JS file plus ~30 `tools/test-*.mjs` suites, then `rsync -a --delete` `memento-app/` into the public repo `malikpeace/memento-live`, served by GitHub Pages. `.github/workflows/deploy.yml` is the Pages workflow, inert here and active there. `AGENTS.md` documents a manual mirror script.
- Native CI: `.github/workflows/native-ci.yml`: `npm ci`, `npm run check` (= `tsc --noEmit && jest --runInBand`), `expo install --check`, `expo export` for iOS and Android.
- Public on purpose, in git: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (`js/12-cloud-sync.js:20-21`); Row Level Security protects data, not key secrecy (comment at 10).
- Secret, Supabase function env only: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `POLAR_PRODUCTION_ACCESS_TOKEN`, `POLAR_PRODUCTION_MODE`. Secret in GitHub Actions: `LIVE_DEPLOY_TOKEN`. Native `EXPO_PUBLIC_*` are public by prefix, all dev-only flags guarded by `__DEV__`. `memento-native/.gitignore` blocks `*.jks *.p8 *.p12 *.key *.mobileprovision .env*`.
- Tests: native jest + jest-expo, 43 files in `memento-native/__tests__/`, 376 static `test(...)` declarations (runs of 884 to 1,257 with `test.each`). Web: no runner; 47 hand-written `tools/test-*.mjs` scripts listed one by one in the deploy workflow.
- Hooks: `.githooks/pre-commit`, `.githooks/version-stamp-guard.sh`, `.claude/hooks/visual-contract.sh`.

## E. Architecture decisions worth teaching
1. Plain JS, numbered files, no framework, no bundler. `index.html:809` "App, split into per-feature files. Loaded as classic scripts (NOT modules)". `js/01` lines 2-3: shared global scope, order matters. Tradeoff: zero tooling and instant deploy, at the cost of no import graph; a wrong order is a runtime crash.
2. Cache-busting by hand. Every script tag `?v=v1378`; `js/01:11` sets `window.MEMENTO_JS_BUILD` and compares at boot. Comment: kills the "phone silently runs old cached js under a new index" class, hit three times in one day. A bundler normally does this.
3. Why React Native + Expo: `MIGRATION/01-MIGRATION-PLAN.md` §0: iPhone + Android in one codebase; storefronts accepted with the 15% cut; TypeScript + Expo + expo-router proposed by Fable, accepted by Codex, versions pinned.
4. Why Supabase: `DECISIONS.md` "Supabase + Resend + Polar (NOT Stripe)". Auth, Postgres with RLS, edge functions. The trust boundary lives in SQL, not app code.
5. Why an AI proxy: `supabase/functions/ai-proxy/index.ts:1-17`. Key never reaches a browser; server owns model/prompt/ceiling so anonymous callers can't disguise paid work as free; rate limits fail closed. Origin story in `js/03:11`: a key "is in git history; it MUST be revoked".
6. Why MMKV: `01-MIGRATION-PLAN.md` §4a: synchronous reads after hydration so the first render is correct; atomic single-key writes; multi-key transactions avoided by design.
7. Why hash routing: `js/16-doors.js:29` reads `location.hash`; 166 `history.pushState`. No server config needed, right for GitHub Pages; back gesture works.
8. The migration freeze: `MIGRATION/FROZEN-AT` = `v1378 / ca8afc8 / 2026-09-11`. `CLAUDE.md` makes it law; `FREEZE-LOG.md` reads "(none yet)".
9. The multi-agent protocol: `01-MIGRATION-PLAN.md` §1 splits ownership (Codex: scaffold, state, storage, sync, auth, entitlement, CI; Fable: screens, motion, copy, screenshot gates). One owner at a time for manifests, config, router, state, auth. Channel is `MIGRATION/*.md`, Malik relays. "Self-review alone cannot close this cross-review gate." Approvals recorded as "APPROVED @ <sha>".
10. Tests that pin a rewrite to the original: `__tests__/ai-transport.test.ts:23` asserts the SHA-256 of the frozen `js/03-ai-integration.js`, then (33) runs the original function in a VM sandbox and compares outputs against the TypeScript. The old code is the oracle.

## F. Teaching specimens (file:lines, concept)
1. `memento-native/src/storage/mmkv.ts:1-9` a whole module: import, export, one function, type parameter.
2. `memento-app/js/01-state-foundation.js:35-60` an object literal as the shape of a person's life.
3. `memento-app/js/01-state-foundation.js:461-487` `writeStateToStorage()`: saving, backup on a timer, try/catch for a full disk.
4. `memento-app/js/01-state-foundation.js:488-495` `persistState()`: debouncing in 6 lines.
5. `memento-app/index.html:621` inline `onclick`.
6. `memento-app/js/02-clarity-experience.js:475-480` `addEventListener('click', ...)`.
7. `memento-app/js/03-ai-integration.js:3079-3108` building a fetch URL and headers; the paid/free fork.
8. `memento-app/js/03-ai-integration.js:4753-4762` `async function autoStartAiChat()`: set loading, repaint, await.
9. `memento-app/js/03-ai-integration.js:4173-4177` the guard clause preventing double-submit.
10. `supabase/functions/ai-proxy/index.ts:108-118` `Deno.env.get('ANTHROPIC_API_KEY')` and the 503.
11. `supabase/functions/ai-proxy/index.ts:44-65` `checkRateLimit`, fail-closed branch.
12. `memento-native/src/ai/transport.ts:1-11` TypeScript types incl. a union `success | failure`.
13. `memento-native/src/ai/transport.ts:45-52` `extract()` + `codeForStatus`.
14. `memento-native/src/ai/transport.ts:94-97` catch with an allowlist of safe error messages.
15. `memento-native/src/home/HoldToComplete.tsx:22-47` component signature, `useRef`, two `useEffect`s with cleanup.
16. `memento-native/src/home/HoldToComplete.tsx:57-64` `begin()` with `useCallback`, animation, timer.
17. `memento-native/src/ui/theme.ts:22-33` design tokens; `useColorScheme` makes it a hook.
18. `memento-native/src/billing/accessPolicy.ts:44-51` `validateReceipt`, pure function, type predicate; "don't trust your own cache".
19. `memento-native/src/storage/journal.ts:21-26` a checksum in 5 lines.
20. `memento-native/__tests__/ai-transport.test.ts:22-27` a test that hashes the original file.
21. `memento-app/js/15-router.js:44-78` registering a screen with open/close/active callbacks.
22. `memento-app/js/16-doors.js:29-30` reading `location.hash` inside try/catch.
23. `memento-native/src/app/index.tsx:45-50` reading env vars: `__DEV__ && process.env.EXPO_PUBLIC_FEEL_SAMPLE === '1'`.
24. `memento-native/src/app/_layout.tsx:10-31` the outermost component: fonts, splash, `<Stack>`.
25. `supabase/migrations/20260724113000_safe_user_state_sync.sql:6-34` business rules living in the database.
26. `memento-app/js/12-cloud-sync.js:770-800` `pushNow()`: optimistic write, conflict detection, one bounded retry.
27. `CLAUDE.md` "THE MIGRATION FREEZE": a rule written so a machine can follow it.

## G. Debt specimens (factual, mostly self-documented)
- Scale: `js/08-cards-grid-share.js` 10,478 lines; `js/09-controllers.js` 7,064; `js/03` 7,021; `css/dashboard.css` 411 KB. CLAUDE.md: "Don't read the big files in full".
- Two files share a number, twice: `20-push.js` / `20-sound.js`; `22-billing.js` / `22-prompt-lab.js`.
- The file map drifted: CLAUDE.md says no `16-*`, but `js/16-doors.js` exists and loads at `index.html:833`; CLAUDE.md lists `21-descent.js` and `23-action-states.js`, neither exists now.
- A file that is mostly an apology: `js/33-action-shim.js`, 38 lines, 20 of comment, explaining 6,070 deleted lines and ~80 call sites still saying `ActionExperience.open()`.
- Two billing-ish systems: `js/13-clarity-paywall.js` flips `isPaid` client-side; `js/22-billing.js` does real Polar. `DECISIONS.md`: "the paywall is UI-only today... bypassable. Real billing enforcement is the #1 pre-launch gap."
- A leaked API key in git history, preserved as a comment at `js/03:11`.
- Repo root: 178 entries mixing source with a 161 MB screen recording, PDFs, ~25 frozen `memento-vN.html` snapshots, fonts, ~80 planning markdown files.
- `HANDOFF.md` is 189 KB, append-only.
- Web has no test runner; 47 bespoke scripts listed in the workflow.
- `deploy-live.yml` excludes `mockups/` from `--delete`, with a comment naming the tradeoff.
- `supabase/.temp/` committed.
- Native has three dev-only sample roots branching in `src/app/index.tsx:150-153`.
