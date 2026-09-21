# Fix

`state = DEFAULT_STATE` makes both names point at the same object. Later edits to `state` also edit the supposed defaults.

Use a new object and a new nested array:

    state = { ...DEFAULT_STATE, history: [] };

The live state can then change without rewriting the template for future resets.
