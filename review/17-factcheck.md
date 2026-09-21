# Chapter 17 fact-check

## Direct fixes applied

None.

## Findings

1. **MISLEADING:** Saying normalization would turn 35 top-level JSON keys into "roughly thirty-five tables" treats one object key as one relational table. A normalized schema groups entities and relationships, so several keys may become columns in one table while one nested collection may require several tables. Keep the real trade-off, but remove the one-key/one-table estimate.
2. **NIT:** The Moltbook repair is now independently corroborated by reporting quoting Wiz: the exposure was secured within hours after disclosure. Replace the unresolved verification comment with a citation in `CITATIONS.md`.

## Verification

- There are 33 SQL migrations at web pin `ca8afc8`.
- The safe-sync migration contains the quoted meaningful-state, authenticated-user, stale-revision, and blank-overwrite checks at the cited lines.
- The least-privilege migration creates the read-only authenticated policy and removes broad grants as described.
- The pinned state is stored as one `jsonb` value with the listed top-level shape.
- No em dashes found in the chapter source.
