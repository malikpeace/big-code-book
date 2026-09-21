# Fix

`state.js`, in `completeToday()`, the "chain broke" branch:

    state.streak = 0; // chain broke, start fresh

Today counts. Starting a fresh chain means one day, not zero.

Fixed:

    state.streak = 1; // chain broke, start fresh

Off by one, in the direction that always looks plausible. Day one reads `0`,
day two reads `1`, and every number the app ever shows is one short. No error,
no stack trace, no red. This is why chapter 24 exists.
