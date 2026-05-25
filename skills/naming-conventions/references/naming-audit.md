# Naming Audit — the sub-routine

> **Scope:** A repeatable procedure for auditing an existing folder or repo for naming compliance. Use when:
> - Onboarding a new repo to the SHAUGHV standard
> - The user (or you) asks "is this folder compliant?"
> - You spot a suspected violation and want to know how widespread it is
> - Before a renaming sweep (so you have a complete list before you start)
>
> **Output:** A markdown findings report with three severity tiers (CRITICAL / MEDIUM / LOW) and a proposed remediation list. The user decides what to fix and when — this audit does **not** rename anything on its own.

## The six steps

### Step 1 — Inventory

Walk the target and list everything by type. Don't classify yet; just enumerate.

| Target | Inventory commands |
|---|---|
| A Git repo on disk | `Glob "**/*"` (with reasonable filters); plus `git ls-files` for tracked-only |
| A GitHub repo (without cloning) | `gh api repos/<owner>/<repo>/git/trees/HEAD?recursive=true` — returns the full file list |
| A structured artifact archive folder (personal context library, project notes, research dump) | `Glob "**/*"` under the archive root |

Save the raw list — you'll diff against it in Step 3.

### Step 2 — Classify by artifact type

Bucket each item into one of the categories from the SKILL.md decision tree:

- Sentinel doc (README, CLAUDE, CHANGELOG, HUMAN_CHANGELOG, LICENSE, CONTRIBUTING, CODEOWNERS, SECURITY, AUTHORS)
- File in a structured archive folder
- Subfolder in a structured archive folder
- Other markdown doc in a repo
- Source file (`.py`, `.ts`, `.tsx`, `.cs`, `.sh`, …)
- Tool-junked file (`(2)`, `_FINAL`, raw Teams timestamp, ChatGPT export, etc.)
- Git branch / commit / PR / feature flag
- Database column / table / migration

Anything that doesn't fit a category is "uncategorized" — note it and move on. Don't force-fit.

### Step 3 — Diff against the rules

For each classified artifact, load the matching reference file and check compliance.

| Category | Rule file | Common violations to look for |
|---|---|---|
| Sentinel docs | `files-and-folders.md` | Mis-cased: `Claude.md`, `readme.md`, `Changelog.MD`. **Linux-CI breakers.** |
| Archive files | `files-and-folders.md` | Spaces, ampersands, parens, copy markers, `_FINAL`, `_WORKING`, ALL-CAPS slugs, missing date prefix on time-stamped artifacts, missing type-tag |
| Archive subfolders | `files-and-folders.md` | Spaces, Title Case, missing reserved prefix on `_archive`/`.claude` |
| Tool-junked files | `files-and-folders.md` | Any pattern from the tool-junk replacement table |
| Source files | `code-identifiers.md` | Casing mismatch with the language idiom (e.g. `MyModule.py` instead of `my_module.py`); React component file in camelCase instead of PascalCase |
| Git branches | `git-branches-commits.md` | Long-lived branches (>3 days); missing type prefix; non-kebab slug; `<type>/<TASK-ID>-...` legacy pattern from a non-SHAUGHV repo |
| Commits | `git-branches-commits.md` | Non-Conventional-Commits format in a repo that's adopted CC; past-tense or non-imperative verbs; no body explanation of *why* |
| Feature flags | `git-branches-commits.md` | Reused flag names; `vN` suffixes; technical-change names instead of business-capability names |
| Database columns | `code-identifiers.md` (SQL row) | **PascalCase or spaces — the auto-API breaker (PostgREST / OData / Hasura / Data API Builder / Supabase will fail silently)** |
| Migrations | `git-branches-commits.md` | Non-contiguous numbering; renumbered after merge (immutability violation); missing idempotency guards; PascalCase descriptions |

Build a list of `(artifact, rule-violated)` tuples.

### Step 4 — Triage by severity

Sort violations into three tiers:

#### CRITICAL — fix immediately

These cause silent failures or active misrouting. Examples:

- **Mis-cased sentinel docs on a Linux-CI-running repo** — Claude Code can't find `Claude.md` on Linux; GitHub doesn't auto-render `readme.md`.
- **PascalCase or spaces in database column names** — auto-API layers (PostgREST / OData / Hasura / Data API Builder / Supabase REST) break silently downstream.
- **Reused feature-flag names** across semantically different features (Knight Capital Power Peg class).
- **Mutated migrations** — a migration that has already run in any environment and was then edited; will silently mis-apply on fresh environments.

#### MEDIUM — fix opportunistically

These cause friction and cognitive load but not silent failures. Examples:

- Tool-junked filenames (raw Teams timestamps, `(2)` copies, `_WORKING` markers) — annoying but not load-bearing.
- Long-lived branches (>3 days but still merging cleanly) — merge-hell risk but no current breakage.
- Mixed commit-message format within a repo (some Conventional Commits, some free-form) — reduces grep/changelog utility but doesn't break anything.
- Folder typos that have hardened into canonical paths — cosmetic ugliness but doesn't break tooling.
- Mis-cased source files on a Windows-only repo — works fine on Windows; would break on a Linux clone.

#### LOW — note and move on

These are matters of taste or sub-millimeter consistency. Examples:

- Variable names that are 7 or 22 chars (outside the 10–16 sweet spot but still readable).
- Repo folder names with PascalCase casing that match origin casing (no breakage; just stylistically out of step).
- Documented exceptions (a file whose name is dictated by an external system, e.g. a third-party schema export). Do not flag — these are intentional.

### Step 5 — Propose remediation list

For each CRITICAL and MEDIUM violation, propose:

- **What to rename** — current name → proposed name (compliant per the rule)
- **Where it's referenced** — files / configs / docs that need to update along with the rename (so the user knows the blast radius)
- **Estimated cost** — small (single file edit), medium (multiple files), large (cross-project ripple)
- **Whether to fix now** — agent recommendation, with reasoning

**Do not rename anything on your own.** The agent prepares the proposal; the user decides. Tool-junked filenames, in particular, follow the rename-on-save policy: prompt, don't act.

### Step 6 — Log findings

Write the audit as a markdown report in the working directory:

```
YYYY-MM-DD_audit-naming-<target-slug>.md
```

Example: `2026-05-19_audit-naming-shaughv-code.md`, `2026-05-19_audit-naming-downloads-folder.md`.

The audit file follows the file-naming convention from `files-and-folders.md` (date + `audit` type-tag + slug). It is itself an artifact, so it follows the standard it was authoring against.

### Audit report template

```markdown
# Naming Audit — <Target>

**Audited:** <date>
**Target:** <repo path / archive folder / etc.>
**Inventory size:** <number of artifacts scanned>

## Summary

- CRITICAL: <count>
- MEDIUM: <count>
- LOW: <count> (omitted from detail; tracked in the "Out of scope" section)

## CRITICAL findings

### 1. <one-line description>
- **Artifact:** <current name>
- **Rule violated:** <reference file name + section>
- **Why critical:** <silent failure described>
- **Proposed rename:** <new name>
- **Blast radius:** <files / configs that reference the current name>
- **Recommendation:** Fix this session.

(repeat per finding)

## MEDIUM findings

(same template, "Fix opportunistically" recommendation)

## LOW findings — counted, not detailed

<just the count by category>

## Out of scope / acknowledged exceptions

<the things that look like violations but are blessed — third-party schemas, vendored libraries, external-system-required names>

## Remediation order proposed

1. <highest-priority rename>
2. <next>
3. ...
```

The user reads the audit, decides what to fix, and either drives the renames themselves or asks the agent to walk through them one at a time.

## When NOT to run a naming audit

- **Don't audit on autopilot.** The audit is a 6-step procedure that takes 10–30 minutes for a medium repo. It is not a "before every change" gate. Trigger it when there's a specific question to answer.
- **Don't audit a third-party repo or external code.** This skill governs SHAUGHV-authored artifacts. A vendored library's naming is not under our authority — it just is what it is.
- **Don't audit documented exceptions.** If a name is dictated by an external system (an SDK that hardcodes a filename, a third-party export with a fixed schema), note it under "Acknowledged exceptions" and move on.

---

*This audit routine is the operational hardening of the conventions defined elsewhere in this skill. The conventions themselves are in the other reference files; this file is how you find out where reality has drifted from them.*
