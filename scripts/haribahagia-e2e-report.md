# HariBahagia auth verification — 8 November 2026

Deployment: `https://samuelpgt.com/haribahagia/`.
Callback: `https://samuelpgt.com/haribahagia/callback`.
Application commit: `6c5dae2`.
Worker version: `923ec43f-135d-4b84-bb2f-a2082ac832d8`.

## Scope

This is a standalone authentication verification page, not a migration of the
Muse wedding dashboard. The Muse artifact depends on its private SQLite runtime
and privileged Google Sheets integration. Those services and personal data have
not been copied into the public repository or exposed through this page.

## Automated checks performed by Codex

- 22/22 tests passed: 5 auth tests and 17 existing RSVP/music regression tests.
- Auth tests use the real Supabase SDK 2.119.0 with synthetic HTTP responses:
  callback exchange once, PKCE pairing, verified login, persisted session,
  fresh-client restore, refresh token rotation, local logout, invalid callback,
  storage failure, and logout failure. They do not prove Google consent live.
- Local Wrangler HTTP: root auth route, callback with synthetic query, scripts
  and SDK return 200; CSP/no-store present; portfolio and invitation return 200.
- Live HTTP: all auth assets match the repository; callback returns 200; existing
  portfolio and invitation return 200. Test scripts and AGENTS.md return 404.
- Pingu reported adding only the exact callback to Supabase Redirect URLs and
  verifying it persisted after reloading the dashboard. Existing Muse URLs and
  Site URL were retained. Codex did not read or alter Supabase secrets.

## Live browser results reported by Pingu

Codex browser control was disabled in Work settings. Samuel authorized
coordination with Pingu, who tested using the available Muse browser.

| Step | Result | Evidence reported by Pingu |
| --- | --- | --- |
| Load login and diagnostics | PASS | No JS/CSP error; build `haribahagia-web-2026-11-08`; storage readable; no session; exchange not attempted |
| Load exact callback path | PASS | Same login page, not a host error page |
| Google authorization | BLOCKED | Button reaches Google account chooser; Samuel account is signed out; next screen requires password |
| Callback exchange with real account | BLOCKED | Not reached |
| Reload and close/reopen persistence | BLOCKED | Not reached |
| Live refresh | BLOCKED | Not reached |
| Logout and reload | BLOCKED | Not reached |

No credential was entered or requested through chat. No authorization code,
verifier, access token, or refresh token is included in this report.

## Resume

Samuel completes Google sign-in himself in the Muse browser holding this flow,
then returns control to Pingu. Continue through callback, verify the requested
account, check clean address bar and diagnostics, reload, reopen in the same
browser profile, then log out locally and verify reload remains logged out.
Record only statuses, names of storage keys, and sanitized error metadata.

Do not report full application E2E PASS from these auth checks. Checklist,
budget, vendors, RSVP, subscriptions, and private Sheets integration need their
own deployed backend and separate end-to-end verification.
