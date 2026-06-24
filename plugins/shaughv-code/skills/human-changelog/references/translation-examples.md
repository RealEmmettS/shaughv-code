# Translation examples

Concrete before/after pairs for translating technical changelog entries into plain-English ones. Use these as a guide for tone, level of detail, and what to strip out.

## Bug fixes

**Before (CHANGELOG.md):**
> Fixed null pointer exception in `UserSessionManager.refresh()` when `session.refresh_token` is expired and the user has no fallback credential (#4821).

**After (HUMAN_CHANGELOG.md):**
> Fixed a crash that could happen when a logged-in session quietly expired in the background — the app would lock up instead of just asking you to sign in again.

---

**Before:**
> Resolved race condition in cache eviction logic in `lib/cache/lru.go` that caused intermittent test failures on CI under high parallelism.

**After (Behind the scenes):**
> Fixed an intermittent bug in our internal caching that was making automated tests flaky. No user-facing effect, but it was slowing down development.

---

## New features

**Before:**
> Added `--dry-run` flag to `migrate` CLI command. When set, prints the SQL that would be executed without applying changes. Resolves #3102.

**After:**
> Added a preview mode for database migrations — you can now see exactly what would change before actually running anything. Helpful when you want to double-check before touching production data.

---

**Before:**
> Implemented OAuth2 device code flow for headless device login (RFC 8628). New endpoints: `POST /oauth/device`, `POST /oauth/device/token`.

**After:**
> You can now sign in from devices that don't have a keyboard or browser (TVs, IoT devices, etc.) by typing a short code on your phone or laptop instead.

---

## Improvements

**Before:**
> Reduced p99 latency on `/api/search` from 340ms to 110ms by adding GIN index on `documents.tsv` column and switching to prepared statements.

**After:**
> Search is roughly three times faster now, especially for big result sets. You'll feel it most on the main search page.

---

**Before:**
> Refactored `PaymentProcessor` class hierarchy to use strategy pattern; consolidated 7 payment-method-specific subclasses into a single configurable processor with pluggable handlers.

**After (Behind the scenes):**
> Reorganized how we handle different payment methods internally. No visible change today, but it makes it much easier to add new payment options in the future without breaking the existing ones.

---

## Removals and breaking changes

**Before:**
> **BREAKING:** Removed deprecated `getUserById(id)` method. Use `users.findById(id)` instead. Removed in v4.0.0; deprecated since v3.2.

**After (Removed):**
> The old way of looking up a user by ID has been removed — it was marked for removal a while back and has now been taken out. If you're using an older integration that relied on it, you'll need to update to the new lookup method. (Most users won't notice.)

---

**Before:**
> Deprecated `REDIS_URL` environment variable in favor of `CACHE_URL`. `REDIS_URL` will be removed in the next major release.

**After (Behind the scenes):**
> Renamed one of the internal configuration settings to be clearer about what it does. The old name still works for now but will go away in a future update — system administrators may need to rename it eventually.

---

## Security

**Before:**
> Patched XSS vulnerability in comment rendering pipeline. CVE-2025-XXXX. Affected versions: 2.0–2.4.7.

**After (Security):**
> Fixed a security issue where a malicious user could sneak harmful code into a comment. If you saw or interacted with comments on the site, there's no action you need to take — we patched it on our end.

---

## Dependency updates

**Before:**
> Bumped `react` from 18.2.0 to 18.3.1, `tailwindcss` from 3.4.1 to 3.4.4, `axios` from 1.6.5 to 1.7.2. Resolves Dependabot alerts #88, #89, #91.

**After (Behind the scenes):**
> Updated some of the underlying libraries the app is built on to get the latest security fixes and bug patches. No visible changes.

---

## What "good" looks like

A human-changelog entry passes the test if a non-engineer can read it and answer two questions:

1. **What changed?** (in their own words, without re-using yours)
2. **Does this affect me?** (yes / no / maybe in the future)

If the answer to either is "I have no idea," strip more jargon or add more context.

## What "bad" looks like

Common failure modes to watch for:

- **Translation that still has jargon.** "Refactored the auth subsystem for better separation of concerns" is not plain English — it just dropped the variable names. Try: "Reorganized how login works behind the scenes to make it easier to maintain."
- **Translation that loses all information.** "Fixed some bugs" is not a translation — it's a deletion. The reader should still learn *what category of thing* changed and *whether it affects them*.
- **Marketing voice.** "We're excited to bring you blazingly fast search!" Just say it's faster. Save excitement for the actual launch post, not the changelog.
- **Inventing impact you don't know.** If the original entry says "refactored X" with no user-visible effect listed, write a "Behind the scenes" entry. Don't fabricate a benefit ("makes the app feel snappier!") that wasn't claimed in the source.
