# Fix

`tickHold()` writes a calculated streak straight to the screen. It never changes or saves `state`.

Replace:

    el("streak").textContent = String(Number(el("streak").textContent) + 1);

with:

    completeToday();

Then restore the following `render()` call. It paints the saved truth, and the value survives a reload.
