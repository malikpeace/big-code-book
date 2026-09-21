# Chapter 18 fact-check

## Direct fixes applied

None.

## Findings

1. **MISLEADING:** "The anon key only identifies the project" and "the anon key is an address, not a permission" are too absolute. The publishable key identifies the project/API role and is still a credential accepted by the API. Database grants and RLS are what constrain that role. Teach that it is safe to publish only because its authority is deliberately limited, not because it has no authority.
2. **NIT:** A bearer access token behaves like a temporary password to whoever possesses it. Calling it "not a password" is useful only when immediately paired with the expiry, scope, storage, and theft consequences.

## Verification

- The public Supabase key, Google OAuth call, paid/free bearer selection, native session validation, billing authority type, receipt arithmetic, and SecureStore configuration all match the cited pins.
- `WHEN_UNLOCKED_THIS_DEVICE_ONLY` accurately describes device-bound keychain accessibility while unlocked.
- No em dashes found in the chapter source.
