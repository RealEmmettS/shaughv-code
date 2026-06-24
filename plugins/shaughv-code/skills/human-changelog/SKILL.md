---
name: human-changelog
description: Create or update a HUMAN_CHANGELOG.md in a repo by translating the existing CHANGELOG.md into plain-English, layman's-terms entries (no version numbers, no variable names, no technical jargon — just what changed and why). Also wires up the repo's CLAUDE.md (creating it if missing) with a standing instruction that any agent updating CHANGELOG.md must update HUMAN_CHANGELOG.md in lockstep. Use whenever the user says "human changelog", "humanize the changelog", "plain-English changelog", "non-technical changelog", "translate the changelog", "make a readable changelog", "set up HUMAN_CHANGELOG", or asks for a changelog a non-engineer can read. Also trigger when the user wants agents to automatically keep a human-readable changelog in sync with a technical one.
---

# Human Changelog

This skill produces a parallel, human-readable changelog (`HUMAN_CHANGELOG.md`) alongside a repo's existing technical `CHANGELOG.md`, and installs a standing rule in the repo's `CLAUDE.md` so future agent edits keep the two in sync automatically.

The user's mental model: the technical changelog is correct but unfriendly to read — full of version bumps, file paths, env vars, function names, and metric thresholds. The human changelog is the "what we actually changed and why" view, suitable for a non-engineer skimming release history.

## When to run

Run this skill when the user asks to:
- Create a HUMAN_CHANGELOG.md from an existing CHANGELOG.md
- "Humanize", "translate", or "plain-English" a changelog
- Set up automatic syncing between technical and human changelogs
- Make a changelog a non-engineer can read

The user will usually tell you which repo to work in. If they don't, assume the current working directory of the conversation is the target repo. If still ambiguous, ask which repo.

## Workflow

### 1. Locate the existing changelog

Look for `CHANGELOG.md` at the repo root first. If it isn't there, check common alternative locations in this order:
- `CHANGELOG`
- `docs/CHANGELOG.md`
- `HISTORY.md`
- `RELEASES.md`

If no changelog file exists at all, stop and tell the user — this skill needs a source changelog to translate. Offer to help them create one from git history as a separate task.

### 2. Read the entire CHANGELOG.md

Read the whole file, not just the head. Length doesn't matter — every entry needs to be translated. Don't skim or summarize: every entry in the source must have a corresponding entry in the human version. Skipping entries is the most common failure mode for this skill.

### 3. Check for an existing HUMAN_CHANGELOG.md

- **If it doesn't exist:** create it from scratch with every entry translated.
- **If it exists:** read it, identify which CHANGELOG.md entries are already represented, and only add translations for new/missing entries. Preserve existing human-written content — don't overwrite hand-edited phrasing just because you'd word it differently. Match the existing tone and structure of the human changelog.

### 4. Translate each entry to plain English

Apply these rules to every entry. See the "Translation examples" section at the bottom for worked before/after pairs.

**Strip out:**
- Version numbers (1.4.2, v3.0.0-rc1) — group by date or release name instead
- File paths and module names (`src/api/auth.py`, `lib/utils/helpers.ts`)
- Function, class, and variable names (`refactor_user_session()`, `MAX_RETRY_COUNT`)
- Specific metric values ("reduced p99 from 240ms to 180ms" → "made it noticeably faster")
- Issue/PR/ticket numbers (#1234, JIRA-456)
- Commit SHAs and branch names
- Database column names, env vars, config keys
- Library version bumps unless user-facing — bundle as "updated dependencies for security and stability"
- Jargon: refactor, deprecate, polyfill, migration, transpile, hydrate, idempotent, etc.

**Keep / add:**
- What changed, in everyday words (a sentence is fine; a short paragraph if needed)
- Why it matters to a human — the user-visible effect or the reason the team made the change
- Plain category labels: **Added**, **Improved**, **Fixed**, **Removed**, **Security**, **Behind the scenes** (use this last one for invisible-but-important infra/refactor work)
- Approximate dates or release names instead of version numbers

**Tone:**
- Conversational but informative. Imagine explaining the release to a non-technical teammate.
- No marketing fluff. "We made login faster" — not "We're thrilled to announce blazingly fast login!"
- Honest about removals and breaking changes: say what stopped working and what to do instead.

### 5. Structure of HUMAN_CHANGELOG.md

```markdown
# Human Changelog

A plain-English companion to [CHANGELOG.md](./CHANGELOG.md). Every change in the technical changelog has a layman's-terms version here. No version numbers, no code references — just what changed and why.

For the technical version with versions, file paths, and PR links, see CHANGELOG.md.

---

## Most recent release — <Month Year or release name>

**Added**
- <plain-English description of new thing> — <why it matters>

**Improved**
- <plain-English description of improvement> — <user-visible effect>

**Fixed**
- <plain-English description of bug fix> — <what was broken>

**Behind the scenes**
- <invisible-but-important change> — <why we did it>

---

## Previous release — <Month Year>

...
```

If the source changelog uses Keep a Changelog conventions, mirror its release grouping but drop the version numbers from headings.

### 6. Update CLAUDE.md (the standing rule)

The user wants future agents to keep both changelogs in sync automatically. Install that rule in the repo's `CLAUDE.md`.

**If `CLAUDE.md` exists at the repo root:**
- Read it first.
- Look for an existing changelog section. If one exists, update it; don't add a duplicate.
- Otherwise, append a new section near other documentation/contribution rules. Don't reorganize the file.

**If `CLAUDE.md` does not exist:**
- Create a minimal one at the repo root with just the changelog rule (and a brief preamble explaining what CLAUDE.md is). Don't try to invent project-level context you don't have — keep it small and focused.

**Section to add (adapt phrasing to match the file's existing tone):**

```markdown
## Changelog rule

This repo maintains two changelogs in parallel:

- `CHANGELOG.md` — the technical changelog. Use standard conventions (Keep a Changelog or the project's existing style). Version numbers, file references, PR links, and metric details are all welcome here.
- `HUMAN_CHANGELOG.md` — a plain-English companion. Every entry in CHANGELOG.md has a corresponding entry here, written for a non-engineer reader. No version numbers, no code references, no jargon — just what changed and why it matters.

**When you update CHANGELOG.md, you must also update HUMAN_CHANGELOG.md in the same commit.** Translate each entry by stripping version numbers, file paths, function names, specific metrics, and issue/PR numbers; replace jargon with everyday words; and add a short "why it matters" clause where the user-visible effect isn't obvious. Use the category labels Added / Improved / Fixed / Removed / Security / Behind the scenes.

If the change is purely internal (a refactor, dependency bump, or test-only change), still record it in HUMAN_CHANGELOG.md under "Behind the scenes" — a sentence is fine. Skipping entries is not allowed; the two files must stay in lockstep.

See HUMAN_CHANGELOG.md's header for the file's tone and structure.
```

### 7. Verify before finishing

Do a final pass:
- Open both files and confirm every release/section in `CHANGELOG.md` has a corresponding section in `HUMAN_CHANGELOG.md`.
- Spot-check three random entries: do they avoid version numbers, file paths, and jargon? Does each one say *what* changed and *why* it matters?
- Confirm `CLAUDE.md` has the changelog rule and that it points at both files by name.

Report what you did: the file paths created/updated, how many entries were translated, and a one-line note if `CLAUDE.md` was created vs. updated.

## Tips and edge cases

- **Huge changelogs:** If the source has hundreds of entries across years of history, ask the user whether to translate all of it or only the last N releases. Default to all if they don't answer — completeness is the user's stated goal.
- **Monorepos:** If the repo has multiple changelogs (e.g. per-package), ask which one(s) to humanize. Don't assume.
- **Non-English source:** If the source changelog is in another language, translate to the same language for the human version unless the user specifies otherwise.
- **Auto-generated changelogs (conventional commits, release-please, etc.):** These are usually the *most* in need of humanization. Don't try to disable the generator — just make sure the human version is updated alongside it. The CLAUDE.md rule handles this going forward.
- **Existing HUMAN_CHANGELOG.md with different conventions:** Match what's already there. Don't impose this skill's preferred structure if the user has already established a different one.

## Translation examples

Concrete before/after pairs. Use these as a guide for tone, level of detail, and what to strip out.

### Bug fixes

**Before (CHANGELOG.md):**
> Fixed null pointer exception in `UserSessionManager.refresh()` when `session.refresh_token` is expired and the user has no fallback credential (#4821).

**After (HUMAN_CHANGELOG.md):**
> Fixed a crash that could happen when a logged-in session quietly expired in the background — the app would lock up instead of just asking you to sign in again.

---

**Before:**
> Resolved race condition in cache eviction logic in `lib/cache/lru.go` that caused intermittent test failures on CI under high parallelism.

**After (Behind the scenes):**
> Fixed an intermittent bug in our internal caching that was making automated tests flaky. No user-facing effect, but it was slowing down development.

### New features

**Before:**
> Added `--dry-run` flag to `migrate` CLI command. When set, prints the SQL that would be executed without applying changes. Resolves #3102.

**After:**
> Added a preview mode for database migrations — you can now see exactly what would change before actually running anything. Helpful when you want to double-check before touching production data.

---

**Before:**
> Implemented OAuth2 device code flow for headless device login (RFC 8628). New endpoints: `POST /oauth/device`, `POST /oauth/device/token`.

**After:**
> You can now sign in from devices that don't have a keyboard or browser (TVs, IoT devices, etc.) by typing a short code on your phone or laptop instead.

### Improvements

**Before:**
> Reduced p99 latency on `/api/search` from 340ms to 110ms by adding GIN index on `documents.tsv` column and switching to prepared statements.

**After:**
> Search is roughly three times faster now, especially for big result sets. You'll feel it most on the main search page.

---

**Before:**
> Refactored `PaymentProcessor` class hierarchy to use strategy pattern; consolidated 7 payment-method-specific subclasses into a single configurable processor with pluggable handlers.

**After (Behind the scenes):**
> Reorganized how we handle different payment methods internally. No visible change today, but it makes it much easier to add new payment options in the future without breaking the existing ones.

### Removals and breaking changes

**Before:**
> **BREAKING:** Removed deprecated `getUserById(id)` method. Use `users.findById(id)` instead. Removed in v4.0.0; deprecated since v3.2.

**After (Removed):**
> The old way of looking up a user by ID has been removed — it was marked for removal a while back and has now been taken out. If you're using an older integration that relied on it, you'll need to update to the new lookup method. (Most users won't notice.)

---

**Before:**
> Deprecated `REDIS_URL` environment variable in favor of `CACHE_URL`. `REDIS_URL` will be removed in the next major release.

**After (Behind the scenes):**
> Renamed one of the internal configuration settings to be clearer about what it does. The old name still works for now but will go away in a future update — system administrators may need to rename it eventually.

### Security

**Before:**
> Patched XSS vulnerability in comment rendering pipeline. CVE-2025-XXXX. Affected versions: 2.0–2.4.7.

**After (Security):**
> Fixed a security issue where a malicious user could sneak harmful code into a comment. If you saw or interacted with comments on the site, there's no action you need to take — we patched it on our end.

### Dependency updates

**Before:**
> Bumped `react` from 18.2.0 to 18.3.1, `tailwindcss` from 3.4.1 to 3.4.4, `axios` from 1.6.5 to 1.7.2. Resolves Dependabot alerts #88, #89, #91.

**After (Behind the scenes):**
> Updated some of the underlying libraries the app is built on to get the latest security fixes and bug patches. No visible changes.

### What "good" looks like

A human-changelog entry passes the test if a non-engineer can read it and answer two questions:

1. **What changed?** (in their own words, without re-using yours)
2. **Does this affect me?** (yes / no / maybe in the future)

If the answer to either is "I have no idea," strip more jargon or add more context.

### What "bad" looks like

Common failure modes to watch for:

- **Translation that still has jargon.** "Refactored the auth subsystem for better separation of concerns" is not plain English — it just dropped the variable names. Try: "Reorganized how login works behind the scenes to make it easier to maintain."
- **Translation that loses all information.** "Fixed some bugs" is not a translation — it's a deletion. The reader should still learn *what category of thing* changed and *whether it affects them*.
- **Marketing voice.** "We're excited to bring you blazingly fast search!" Just say it's faster. Save excitement for the actual launch post, not the changelog.
- **Inventing impact you don't know.** If the original entry says "refactored X" with no user-visible effect listed, write a "Behind the scenes" entry. Don't fabricate a benefit ("makes the app feel snappier!") that wasn't claimed in the source.
