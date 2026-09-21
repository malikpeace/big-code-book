# Answers for errors/app.ts

Run `npx tsc --noEmit errors/app.ts` (or open the file in an editor with TypeScript on) and you should see six red lines. Here is what each one is.

1. `state.streak = "0";` in `render`. `streak` is a `number`, and `"0"` is a string. TypeScript will not let you put text where a number belongs. Fix: `state.streak = 0;` (or just delete the line, it was never needed).

2. `state.lastDone` in `render`. There is no `lastDone` on `State`. The real name is `lastCompleted`. Fix: `state.lastCompleted`.

3. `document.getElementById("message").textContent = text;` in `say`. `getElementById` can return `null` if the id is missing, and strict mode makes you deal with that. Fix: use the `el("message")` helper, which throws a clear error instead, or check for null first.

4. `return e.key;` in `isHoldKey`. The function promises a `boolean` but hands back a `string`. Fix: `return e.key === " " || e.key === "Enter";`.

5. `setRing();` in `cancelHold`. `setRing` needs one number and got nothing. Fix: `setRing(0);`.

6. `state.northstar` in `wireEvents`. Lowercase s. The property is `northStar`. TypeScript catches the typo because `northstar` is not on `State`. Fix: `state.northStar`.

The lesson: five of these six would have been silent bugs in plain JavaScript. The page would load, and then something would quietly be wrong.
