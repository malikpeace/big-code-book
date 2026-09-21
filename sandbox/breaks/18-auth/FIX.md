# Fix

`checkAuth()` accepts any valid-looking owner name without checking `FAKE_TOKEN`. A stranger can claim somebody else's name.

Restore this as the first line of `checkAuth()`:

    if (req.headers["fake_token"] !== FAKE_TOKEN) return null;

This toy token is still not real authentication, but the lesson's identity gate works again.
