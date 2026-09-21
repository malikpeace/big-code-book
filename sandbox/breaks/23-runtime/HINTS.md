# 23-runtime: one bug, runtime

Both files pass `node --check`. The page loads, then stops dead: the streak and
the date never appear and the button does nothing. The console has one red line.

Do not read FIX.md until you have found it yourself.

## Hint 1
Read the error out loud, every word: "Cannot set properties of null". Something
is `null` and the code treated it like an object.

## Hint 2
The stack trace names a function. Go to that function and list everything it
looks up. One of those lookups came back empty.

## Hint 3
`document.getElementById` hands back `null` when nothing on the page has that
id. Compare the ids `render()` asks for against the ids in `index.html`.
