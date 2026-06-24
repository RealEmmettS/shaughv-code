# Git — Repos, Branches, Commits, Pull Requests, Feature Flags, Migrations

> **Scope:** Naming for Git repositories, branches, commit messages, pull request titles, feature flags, and database migration files. Plus the branching strategy and the discipline arguments that justify it.
>
> **Authoritative sources:**
> - The DevOps Handbook (Gene Kim, Jez Humble, Patrick Debois, John Willis), IT Revolution, 2016/2021 — chapters 7, 11, 12, 14
> - Conventional Commits 1.0 spec — conventionalcommits.org
> - Trunk Based Development site (Paul Hammant) — trunkbaseddevelopment.com
> - *Accelerate* (Forsgren, Humble, Kim), IT Revolution, 2018 — Ch. 4

## SHAUGHV repo conventions

A small, opinionated set of conventions that apply across all of Emmett's repos.

| Aspect | Convention |
|---|---|
| **GitHub orgs** | `RealEmmettS` (personal, https://github.com/RealEmmettS) and `QubeTX` (work, https://github.com/QubeTX). Both are regular push targets. |
| **Repo names** | lowercase kebab, no dots, no underscores. Example: `shaughv-code`, not `Shaughv_Code` or `shaughv.code`. |
| **Local clones** | live under `C:\Users\hey\git\<repo-name>\` on this machine. The on-disk folder name matches the GitHub repo name exactly. |
| **Default branch** | `main` |
| **Workflow** | Trunk-based; PRs are short-lived; squash-merge to `main`; PR title matches the eventual merge commit's first line so squash history stays clean. |
| **Commit format** | Conventional Commits 1.0 (`<type>(<scope>): <summary>`) — see "Commit messages" below. |

## Branching strategy — trunk-based with short-lived branches

The DevOps Handbook is unambiguous on this. Branches that live longer than a few days cost more than they save.

> *"Merging branches back in sporadically only creates a 'merge hell' resulting in chaos, delayed feedback, and rework."*
> — *The DevOps Handbook*, Ch. 11

The countermeasure: **continuous integration and trunk-based development, where all developers check in to trunk at least once per day, and branches "ideally exist for only a few hours or days before being merged back into the trunk"** (Ch. 11).

*Accelerate* Ch. 4 ratifies this empirically: **"trunk-based development predicts higher throughput and better stability, and even higher job satisfaction and lower rates of burnout."** Operationally, *Accelerate* defines trunk-based as:

- Fewer than **three** active branches in a code repository
- Branches and forks having **very short lifetimes** (e.g., less than a day) before being merged into main
- Application teams rarely or never having "code lock" periods

Paul Hammant's trunkbaseddevelopment.com is stricter: **"the branch should only last a couple of days. Any longer than two days, and there is a risk of the branch becoming a long-lived feature branch."**

### Branch lifetime targets

| Branch type | Target lifetime | Maximum lifetime |
|---|---|---|
| `feature/...` | 1 day | 3 days |
| `fix/...` | hours | 1 day |
| `hotfix/...` | hours | same day |
| `chore/...` | hours | 1 day |
| `experiment/...` | as needed; merge or delete | 1 week, then either merge or delete |

If a branch is approaching the maximum, ship a partial increment behind a feature flag and merge the branch.

## Branch naming

### Recommended pattern

```
<type>/<short-slug>
```

| Type | Use for |
|---|---|
| `feature` | New behavior, new capability |
| `fix` | Bug fix in development (not yet production-impacting) |
| `hotfix` | Urgent production fix, branched off main, fast-tracked |
| `chore` | Housekeeping (dependency bumps, build tweaks, file moves) |
| `docs` | Documentation-only |
| `refactor` | Behavior-preserving code reshape |
| `test` | Test-only changes |
| `experiment` | Spike / proof-of-concept; usually deleted, not merged |

### Examples

```
feature/naming-skill
fix/transcript-line-overflow
hotfix/cdn-cors-headers
chore/bump-remotion
docs/update-onboarding-guide
refactor/audio-pipeline-cleanup
test/add-pretext-edge-cases
experiment/three-js-brand-mark
```

### Short slug rules

- 2–4 words
- kebab-case
- describes the *change*, not the *file you touched* or *the bug number*
- ≤ 30 chars after the type prefix

## Commit messages — Conventional Commits 1.0

The standard SHAUGHV commit format. Enables automated changelog generation, semver release tooling, and lint enforcement via `commitlint` / `commitlint-cli` if a repo opts in.

```
<type>(<scope>): <imperative summary in ≤72 chars>

<body — what changed and WHY, wrapped at 72 chars>
```

Types (from conventionalcommits.org):

| Type | Use for |
|---|---|
| `feat` | New feature for the user |
| `fix` | Bug fix |
| `chore` | Housekeeping, no production code change |
| `docs` | Documentation only |
| `refactor` | Behavior-preserving code reshape |
| `test` | Test-only changes |
| `perf` | Performance improvement |
| `ci` | CI / pipeline config |
| `build` | Build system / external dependencies |
| `revert` | Reverts a previous commit |

Scope = subsystem (`brandmark`, `cdn`, `naming`, `remotion`, `auth`, …) and is optional.

### Examples

```
feat(brandmark): add inverted-color variant for dark backgrounds

Adds a second `<symbol>` definition keyed off prefers-color-scheme.
The original mark stays the default; the inverted variant only kicks
in on dark backgrounds. Closes the contrast issue raised in #42.
```

```
fix(cdn): correct cache-control header on signed URLs

The 24h TTL was being overridden by an upstream s-maxage=60, which
collapsed cache hit rate from 94% to under 10% in the past week.
Sets explicit Cache-Control on the response.
```

```
chore: bump @remotion/web-renderer to 4.0.230
```

### Rules

- **Imperative mood, present tense.** "Add caching" — not "Added caching" or "Adds caching." Matches what Git writes for merges. (See Tim Pope's 2008 "A Note About Git Commit Messages.")
- **Summary line ≤ 72 chars.**
- **Body explains *why*, not *what*.** The diff shows what; the message explains why. Wrap body lines at 72 chars.
- **One logical change per commit.** Atomic commits make bisect cheap and review tractable.
- **`Co-authored-by:` trailer** for pair-programmed work or AI-assisted authoring.

### Pre-commit hooks

`commitlint` (with the `@commitlint/config-conventional` preset) is the standard hook if a SHAUGHV repo wants enforcement. Repos that aren't there yet should follow the format manually until enforcement is wired up.

## Pull request titles

Match the merge commit's first line. SHAUGHV repos use squash-merge — the PR title becomes the merge commit subject. Inconsistency between the PR title and the eventual commit subject reads as sloppy in the git log.

```
PR title:    feat(brandmark): add inverted-color variant for dark backgrounds
                                  ↓ squash-merge
Commit:      feat(brandmark): add inverted-color variant for dark backgrounds (#42)
```

PR body should include the context you'd want in the commit body — *why* the change, what trade-offs you weighed, what you tested.

## Feature flags

The Knight Capital Power Peg cautionary tale is the load-bearing argument here.

> **Knight Capital, 2012:** Knight repurposed an old, unused feature-flag name ("Power Peg") to activate brand-new RLP code. When deployment landed on 7 of 8 servers, the 8th still had the old Power Peg code wired to the same flag — and the flag flipped on. **$440M in 45 minutes; the company was acquired the next year.**
> (See Doug Seven, "Knightmare: A DevOps Cautionary Tale," dougseven.com.)

### Rules

1. **Name the business capability, not the technical change.** `inline-bid-capture-v2` is bad (vN won't stay meaningful); `inline-bid-capture` is good (names what the flag exposes to the user).
2. **Never reuse a flag name across semantically different features.** When a flag is retired, leave the name retired. Don't recycle.
3. **Flags outlive the developer who wrote them** — pick names that read clearly in three years to someone who wasn't on the team when the flag was added.
4. **Document the flag's intent and lifecycle** in code comments adjacent to the flag check.

Etsy's Gatekeeper and Facebook's Gatekeeper are the cited exemplars in The DevOps Handbook Ch. 12.

### Format

```
<verb-or-noun-naming-the-capability>-<optional-scope>
```

Examples:

```
animated-brandmark-prerender
shaughv-cdn-image-resize
dark-mode-marketing-pages
remotion-web-renderer-streaming
```

Avoid: `enable-X`, `disable-X` — every flag enables or disables; the prefix is noise. Avoid: `vN` suffixes — version flags lock you into recycling the name later.

## Database migrations

When a SHAUGHV repo carries a database schema, migration files follow this convention:

```
<repo-root>/migrations/000N_<short_description>.sql
```

| Rule | Why |
|---|---|
| **Numbered contiguously** (`0001_`, `0002_`, …) | The number is the apply order. Gaps make the apply order ambiguous; jumping from `0007_` to `0042_` reads as either intentional or a typo, and the agent can't tell which. |
| **Snake_case description** after the number | Matches the SQL `snake_case` convention (see [`code-identifiers.md`](code-identifiers.md)); `0003_add_user_preferences.sql` reads more cleanly than `0003-AddUserPreferences.sql`. |
| **`.sql` extension lowercase** | Linux is case-sensitive; toolchains expect `.sql`. |
| **Immutable once merged** | Never edit a migration after it has run in any environment. Add a new migration instead. Mutating a merged migration breaks every environment that already applied the old version. |
| **Idempotency guards where possible** | `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE … ADD COLUMN IF NOT EXISTS`. Re-running a partially-failed migration shouldn't break. |

```
✅  0001_create_users_table.sql
✅  0002_add_users_email_index.sql
✅  0003_backfill_user_preferences_defaults.sql
❌  0042_AddUserPrefs.sql           ← PascalCase, gap in numbering
❌  add_user_prefs.sql              ← no number; apply order ambiguous
❌  0003_create_users_table_v2.sql  ← migrations don't version; new migration instead
```

## The Three Ways — why this matters

From The DevOps Handbook Part I:

- **First Way (Flow):** *"The First Way enables fast left-to-right flow of work from Development to Operations to the customer."* Convention reduces friction at every handoff. A standard branch name lets CI know what to run; a standard commit prefix lets the changelog bot parse the history.
- **Second Way (Feedback):** *"The goal of almost any process improvement initiative is to shorten and amplify feedback loops so necessary corrections can be continually made."* Naming-driven automation is what makes feedback fast. The cost of a misnamed feature flag is silent — it doesn't fail loudly, it does the wrong thing quietly.
- **Third Way (Continuous Learning):** *"Experimentation and taking risks are what ensures that we keep pushing to improve."* Conventions make knowledge transferable. A new engineer (or a future-you with no context) reading `feature/animated-brandmark-prerender` knows the type and the change at a glance.

## HP LaserJet — the case study

The Handbook's canonical trunk-based-at-scale case (Ch. 11, with Gary Gruver):

Gruver's HP LaserJet firmware team **eliminated separate branches for all 24 printer models, putting them all into a single trunk**, with printer capabilities established at runtime via an XML configuration file rather than compile-time `#ifdef`s. Outcomes:

- Cycle time of code-commit-to-shippable: **months → 1 day**
- Overall development cost: **down ~40%**
- Programs under development: **up ~140%**
- Cost per program: **down 78%**

The lesson the Handbook draws: **convention** (one trunk, runtime config, consistent build) is what made the scale tractable. Not heroism, not staffing, not better individual engineers. The names and the discipline.

## Quick checklist when starting a branch

1. **Confirm the trunk's current state** — `git fetch origin && git status` from `main`.
2. **Pick the type** from the table (`feature`, `fix`, `hotfix`, `chore`, `docs`, `refactor`, `test`, `experiment`).
3. **Compose the branch name:** `<type>/<short-slug>`.
4. **Set the lifetime target** — most branches close within a day. If you're hitting day 3, consider whether to ship behind a flag and close the branch.

## Quick checklist when writing a commit message

1. **Check the repo's existing format** — `git log --oneline -20`. If the repo already uses Conventional Commits, keep using it. If it uses something else (a one-off legacy repo, an open-source contribution to someone else's project), match what's there.
2. **Pick the type** (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`).
3. **Pick the scope** if there's a sensible subsystem name; omit if the change is repo-wide.
4. **Compose the summary** in imperative mood, ≤72 chars.
5. **Write the body** explaining *why*, wrapped at 72.
6. **Add `Co-authored-by:`** if pair-programmed with another agent or human.

## Quick checklist when opening a pull request

1. **PR title** = the commit subject line that will result from squash-merge.
2. **PR body** = the commit body, plus any verification steps you ran and screenshots if the change is visible.
3. **Self-review the diff** — `git diff origin/main...HEAD` — read every hunk before requesting review.

---

*Authoritative sources: The DevOps Handbook (Kim, Humble, Debois, Willis), IT Revolution, 2016/2021 — Ch. 7, 11, 12, 14; Conventional Commits 1.0 (conventionalcommits.org); Trunk Based Development site (Hammant); *Accelerate* (Forsgren, Humble, Kim), IT Revolution, 2018. Knight Capital case via Doug Seven, dougseven.com.*
