# Chapter 09 fact-check

## Direct fixes applied

None.

## Findings

1. **MISLEADING:** "everything read from storage, and everything that comes back over the network starts as a string" is false after parsing and false for binary network data. `localStorage.getItem` returns a string, but `JSON.parse` restores numbers and booleans; network bodies are bytes and may be decoded as JSON, text, images, or other formats. Narrow the claim to raw form inputs and raw `localStorage` values.

## Verification

- The `DEFAULT_STATE` excerpt and cited lines match web pin `ca8afc8`.
- The examples correctly distinguish primitive assignment from object-reference aliasing and `const` binding from object mutation.
- No em dashes found in the chapter source.
