# Chapter 02 fact-check

## Direct fixes applied

None.

## Findings

1. **NIT:** "comes back, in about two seconds" is an unsourced latency estimate, not a property guaranteed by either pin. Keep it clearly illustrative or remove the number.

## Verification

- Every cited web excerpt matches `ca8afc8`, including the click handler at lines 474-481, `autoStartAiChat` at 4753-4757, the proxy URL selection at 3080-3082, the environment key lookup at 108-118, `persistState` at 488-494, and the sync RPC call at 778-782.
- The journey accurately distinguishes local state, browser storage, the Supabase edge function, the AI provider, and the database.
- No em dashes found in the chapter source.
