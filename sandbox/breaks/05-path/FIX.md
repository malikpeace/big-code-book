# Fix

`index.html` asks for `states.js`, but the file is named `state.js`.

Change:

    <script src="states.js"></script>

to:

    <script src="state.js"></script>

The browser can then load the state functions before `app.js` uses them.
