# Fix

`readSecrets()` looks for `secret.env`, but the setup creates `secrets.env`.

Change:

    path.join(__dirname, "secret.env")

to:

    path.join(__dirname, "secrets.env")

The server then reads `AI_KEY` and stays running instead of exiting with code 1.
