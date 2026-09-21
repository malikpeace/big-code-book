# Fix

`app.js`, inside `render()`, asks for an element that does not exist:

    el("streak-count").textContent = String(state.streak);

`index.html` calls that element `streak`, not `streak-count`. So `el(...)`
returns `null`, and setting `.textContent` on `null` throws:

    TypeError: Cannot set properties of null (setting 'textContent')

Fixed:

    el("streak").textContent = String(state.streak);

Why the button also stopped working: `render()` is called at the bottom of
`app.js`, before `wireEvents()`. The crash killed the boot halfway, so no event
listeners were ever attached. One bad id, a whole dead page.
