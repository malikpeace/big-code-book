# 23-syntax: one bug, syntax

The page is blank-ish and nothing works. Open the browser console first, or run
`node --check state.js` and `node --check app.js` from this folder.

Do not read FIX.md until you have found it yourself.

## Hint 1
Only one of the two JavaScript files fails `node --check`. Find out which one.
The browser console tells you the same thing in the same words.

## Hint 2
The error names a line number and points a caret at a word. The word it names is
not the broken thing. The broken thing is just before it.

## Hint 3
It is a single missing character inside an object literal on line 4. Objects
separate their entries with something.
