# 23-logic: one bug, logic

Nothing is red. `node --check` passes. The console is clean. The app just lies.

Reset the page ("Reset everything"), then hold the button. The streak says `0`
after you completed today.

Do not read FIX.md until you have found it yourself.

## Hint 1
There is no error to read, so make the app talk. Put a `console.log` inside
`completeToday()` printing `state.lastCompleted`, the computed `today`, and
`state.streak` at the start and at the end.

## Hint 2
`completeToday()` has two branches: chain continued, chain broken. Which one
runs on a fresh install? Print the branch you land in.

## Hint 3
The broken branch sets the streak to a number. Count out loud: you have
completed today. How many days is that?
