# Chapter 20 fact-check

## Direct fixes applied

None.

## Findings

1. **WRONG:** "A push to a branch is the deploy" contradicts the workflow immediately above it. The trigger is a push to `main` that touches `memento-app/**`, or a manual dispatch. A feature-branch push does not deploy.
2. **MISLEADING:** "Two files changed in v1378" is inferred from two URL tags, not from git history, and the sample directly below shows one `v1378` tag and one `v1358` tag. If the lesson is contrast, say so; if the lesson is which two tags are `v1378`, show `js/01-state-foundation.js` and `js/11-init.js`.

## Verification

- The deploy workflow trigger, syntax gate, test list, `rsync`, and mockup exemption match web pin `ca8afc8`.
- The pinned index contains 57 version tags across 14 distinct versions, with two `v1378` tags.
- The workflow names 29 unique test scripts: 27 `.mjs` and two `.js` scripts.
- Native CI uses `npm ci`, `npm run check`, and export builds as described.
- No em dashes found in the chapter source.
