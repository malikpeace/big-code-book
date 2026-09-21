# Chapter 15 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** "Everything on the network is text, always" is false. Networks move bytes; HTTP bodies may be JSON text, HTML, images, audio, compressed data, or arbitrary binary. The chapter's own final analogy correctly upgrades to bytes. Change the earlier sentence to "JSON crosses the network as text."
2. **MISLEADING:** The status-code shorthand "4 your parcel was wrong" and "A 4 means stop and fix the request" is too broad. The chapter itself includes 409 and 429, which can result from server state or policy and may require reload or delayed retry rather than changing the payload. Say 4xx means the server refused the request for a client-side, identity, policy, conflict, or rate reason.

## Verification

- URL selection, request headers, native status mapping, and POST-only proxy excerpts match both pins.
- The Memento Jr curl sequence is consistent with `sandbox/v1/server.js` and yields the described status classes.
- No em dashes found in the chapter source.
