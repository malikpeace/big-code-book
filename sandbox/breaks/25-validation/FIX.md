# Fix

`validateState()` confirms that `northStar` is text but never limits its length. A caller can skip the browser and send an oversized value directly.

Restore:

    if (body.northStar.length > 200) return "northStar is too long, 200 characters max";

The important limit now lives at the trust boundary, where every caller must pass it.
