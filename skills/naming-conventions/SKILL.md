---
name: naming-conventions
description: Use whenever you are about to name ANYTHING in SHAUGHV brand work or in one of Emmett's repos (whether under the `RealEmmettS` or `QubeTX` GitHub org) — a variable, function, class, constant, boolean, file, folder, Git repo, branch, commit message, pull request title, feature flag, database column, migration, or any other identifier. Also when reviewing a rename, reading a name and unsure if compliant, or when the user hands you a tool-junk filename (Teams timestamps, ChatGPT exports, copy markers, FINAL/WORKING/DRAFT flags). Carries SHAUGHV-specific conventions (kebab-case repo names under `C:\Users\hey\git\`, `main` default branch, Conventional Commits) plus the universal principles from Code Complete 2 (Steve McConnell, Microsoft Press, 2004) and The DevOps Handbook (Kim, Humble, Debois, Willis, IT Revolution, 2016/2021). Triggers on ANY naming decision — even ones that feel "obvious" — because naming compounds and agents under-trigger naming skills.
---

# Naming Conventions

## The one rule

**Before you commit to a name, identify what kind of thing you are naming and consult the matching reference below.** Names compound. A misnamed file, branch, or column rarely fails loudly — it usually fails silently and creates rework hours or weeks later. Two minutes of "what convention applies here?" prevents hours of cleanup, and protects the user's trust in everything else the agent does in the session.

## Where this skill fits

This skill is the single entry point for any naming decision in SHAUGHV brand work and in Emmett's repos under the GitHub orgs `RealEmmettS` (personal) and `QubeTX` (also a push target), all cloned locally under `C:\Users\hey\git\`. It **condenses** the conventions and **points to** their authoritative sources. The skill is short on purpose; the depth lives in `references/`. Load only the reference that matches the decision in front of you.

| Authoritative source (never duplicated here) | Where it lives |
|---|---|
| Code identifier principles | Code Complete, 2nd Edition (Steve McConnell, Microsoft Press, 2004) — chapters 6, 7, 11 |
| Branching / commit / telemetry discipline | The DevOps Handbook (Kim, Humble, Debois, Willis), IT Revolution, 2016/2021 |
| Commit message format | Conventional Commits 1.0 — conventionalcommits.org |

When this skill and a source disagree, the source wins.

## The decision tree

Scan top-to-bottom. The first row that matches is the right reference.

| I am naming a … | Reference | Quick rule |
|---|---|---|
| **Code identifiers** | | |
| Variable, parameter, local | [`references/code-identifiers.md`](references/code-identifiers.md) | Language idiom + the name fully describes the entity (McConnell p. 260); 10–16 chars optimal (Gorla, Benander, Benander 1990); no Hungarian |
| Function / method / procedure | [`references/code-identifiers.md`](references/code-identifiers.md) | Strong verb + object for procedures; return-value description for functions; avoid `handle`/`process`/`perform` |
| Class | [`references/code-identifiers.md`](references/code-identifiers.md) | Noun phrase describing one ADT (McConnell p. 135); avoid classes-named-after-verbs (p. 155) |
| Constant | [`references/code-identifiers.md`](references/code-identifiers.md) | UPPER_SNAKE in most langs; name the meaning, not the value (`DONUTS_MAX`, not `BAKERS_DOZEN`) |
| Boolean variable | [`references/code-identifiers.md`](references/code-identifiers.md) | Positive form preferred (`isDone`, `hasError`); canonical names `done` / `error` / `found` / `success` |
| **Files & folders** | | |
| **Sentinel docs at a repo root** (README, CLAUDE, CHANGELOG, LICENSE, CONTRIBUTING, CODEOWNERS, SECURITY) | [`references/files-and-folders.md`](references/files-and-folders.md) | **UPPERCASE** filename, lowercase extension: `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `LICENSE`, `CONTRIBUTING.md`, `CODEOWNERS`. No exceptions — Linux CI runners are case-sensitive. |
| File inside a structured artifact archive (personal context library, project notes, research dump) | [`references/files-and-folders.md`](references/files-and-folders.md) | `[YYYY-MM-DD_]<type-tag>-<kebab-slug>[_vN].<ext>` (16-entry type-tag vocabulary) |
| Subfolder inside a project folder | [`references/files-and-folders.md`](references/files-and-folders.md) | lowercase kebab; reserved prefixes `_archive/`, `.claude/` |
| Other markdown docs inside a repo | [`references/files-and-folders.md`](references/files-and-folders.md) | lowercase kebab (`design-notes.md`, `2026-05-19_meeting-naming-skill.md`) |
| A source file (`.py`, `.ts`, `.tsx`, `.cs`, `.sh`, …) | [`references/code-identifiers.md`](references/code-identifiers.md) | Per language idiom (Python `snake_case.py`, React component `PascalCase.tsx`, etc.) — see the language-idiom table |
| Tool export (Teams `.mp4`, ChatGPT export, `(2)` copy) | [`references/files-and-folders.md`](references/files-and-folders.md) | Never the final name — propose a compliant rename, prompt the user, do not silently rename |
| **Git** | | |
| A Git repository | [`references/git-branches-commits.md`](references/git-branches-commits.md) | kebab-case on GitHub (`RealEmmettS` for personal, `QubeTX` for work); local clone folder matches the GitHub repo name |
| A Git branch | [`references/git-branches-commits.md`](references/git-branches-commits.md) | Short-lived (≤3 days); `<type>/<short-slug>` (e.g. `feature/naming-skill`) |
| A commit message | [`references/git-branches-commits.md`](references/git-branches-commits.md) | Conventional Commits 1.0: `<type>(<scope>): <imperative summary>`; body explains *why*, not *what* |
| A pull request title | [`references/git-branches-commits.md`](references/git-branches-commits.md) | Match the merge commit's first line so squash-merges produce clean history |
| A feature flag | [`references/git-branches-commits.md`](references/git-branches-commits.md) | Name for the **business capability**, not the technical change; **never reuse a flag name** across semantically different features (Knight Capital Power Peg) |
| **Databases & migrations** | | |
| A database column | [`references/code-identifiers.md`](references/code-identifiers.md) (SQL row) | **snake_case ALWAYS** — PostgREST / OData / Data API Builder and similar auto-API layers silently break on PascalCase or spaces |
| A database migration file | [`references/git-branches-commits.md`](references/git-branches-commits.md) | `000N_<short_description>.sql`; numbered contiguously; **immutable once merged** |
| **Auditing a folder, repo, or project for naming compliance** | [`references/naming-audit.md`](references/naming-audit.md) | Walk the 6-step audit routine: inventory → classify → diff against rules → triage by severity → propose remediation list → log findings |
| **Anything else** | [`references/rationale.md`](references/rationale.md) | Read the rationale, then choose by analogy. When in doubt, ask the user. |

## The five universal rules

These apply across every domain. If a domain rule and a universal rule conflict, the domain rule wins (it knows its own constraints), but flag the conflict.

### U1 — Optimize for the reader, not the writer

> *"Code is read far more times than it is written. Be sure that the names you choose favor read-time convenience over write-time convenience."*
> — McConnell, *Code Complete* 2nd ed., p. 285, KEY POINT

This trade-off settles every close call. A name that takes 30 seconds to choose saves 30 minutes of confusion over the artifact's lifetime. A file inside a project folder named `2026-05-14_meeting-brand-refresh-kickoff.md` reads cleanly to a human and parses unambiguously for an agent; the same file named `2026-02-19_09-30-34.mp4 Meeting Transcript (2).txt` reads as junk to both.

### U2 — Names carry no tool junk

Raw Teams timestamps (`2026-02-19_09-30-34.mp4`), ChatGPT exports (`ChatGPT Image Mar 20, 2026, 02_41_52 PM.png`), `(2)` and `(17)` copy markers, `_FINAL` / `_WORKING` / `_DRAFT` flags are **never** the final name of a SHAUGHV artifact.

When the user hands the agent a tool-junked filename, the agent proposes a compliant rename and prompts for confirmation. The agent does **not** silently rename — that destroys the user's mental model of what's in the folder.

### U3 — Names must be machine-parseable

Lowercase kebab-case + ISO dates + controlled vocabulary + strict regexes win over Title Case + ambiguous separators every time agents are in the loop. Claude Code (and any other agent in the loop) enforces the standard at write time; humans only have to read the rules in `CLAUDE.md` to follow along.

### U4 — Namespace lives in the path or prefix, not the name

A file inside a `projects/brand-refresh/` folder does not also encode `brand-refresh` in the filename. A column named `created_at` inside `user_session` does not need to be `user_session_created_at` because the table already supplies that context. **Redundancy rots.**

### U5 — Conventions exist to make work flow

From the DevOps Handbook Three Ways (Kim, Humble, Debois, Willis, 2016, Part I):

- **Flow** — convention reduces friction at handoff between humans and agents and across tooling boundaries. A standard branch name lets CI know what to run.
- **Feedback** — convention enables the automation that gives fast feedback. The cost of a misnamed metric is silent: the alert simply never fires.
- **Learning** — convention makes knowledge transferable. A named pattern is recallable and teachable.

The cost of an inconsistent name is silent. A correctly named name does not announce itself, but a misnamed name eventually causes either rework or an incident (Knight Capital). See `references/rationale.md` for the full receipts.

## The workflow when this skill is invoked

The six steps are non-negotiable. The third one is the single most common skipped step.

1. **Identify** what you are naming. Use the decision tree above. If it doesn't fit a row, read `references/rationale.md` and choose by analogy or ask the user.

2. **Load** the matching reference file. Skim it; don't reread it from memory.

3. **Query** for existing convention and collisions before drafting any names.

   | If you are naming a … | Query first |
   |---|---|
   | File in a folder | `Glob` or `Get-ChildItem` on the folder — confirm no name collision |
   | Git branch | `git branch -a` — confirm no name collision; check the trunk's current state |
   | Commit message | `git log --oneline -20` — confirm the repo's existing commit-message format and copy it |
   | Database column | Read the table's existing columns — match casing and conventions |
   | Git repository | Check `gh repo list RealEmmettS` or `gh repo list QubeTX` (whichever org) — confirm no name collision |

4. **Draft** 2–3 candidate names. Don't lock in on the first one.

5. **Sanity-check** each candidate against the five universal rules + the domain rule for the thing you're naming. If a candidate fails any rule, drop it.

6. **Propose** the top candidate to the user. If the user provided a name that violates the standard, propose a compliant alternative **and cite the rule it violates** — do not silently rename. The user's mental model is more important than the rule; explaining why preserves both.

## What this skill is NOT

- **SHAUGHV brand visual design** (color tokens, type scale, mark variants, motion vocabulary) — defer to the `shaughv-design` skill. Token *naming* belongs there because it sits with the design system.
- **HTTP API endpoint design** — separate concern; not covered here.
- **Product / marketing / external naming** — out of scope.
- **Renaming sweeps of existing artifacts** — this skill governs the names of *new* things and the response to tool-junked names. It does NOT mandate a sweep through existing repos to rename things; opportunistic cleanup as artifacts are touched is preferred over a migration project.

## Sources

| Source | Used in |
|---|---|
| Code Complete, 2nd Edition (Steve McConnell, Microsoft Press, 2004) | `references/code-identifiers.md`, `references/rationale.md` |
| The DevOps Handbook (Kim, Humble, Debois, Willis, IT Revolution, 2016/2021) | `references/git-branches-commits.md`, `references/rationale.md` |
| Conventional Commits 1.0 (conventionalcommits.org) | `references/git-branches-commits.md` |
| Trunk Based Development (Paul Hammant, trunkbaseddevelopment.com) | `references/git-branches-commits.md` |
| *Accelerate* (Forsgren, Humble, Kim, IT Revolution, 2018) | `references/git-branches-commits.md` |

## Related skills

- **`shaughv-design`** — SHAUGHV brand visual design system. Token names (color, type, spacing, motion) live there because they sit alongside the design tokens themselves; this skill defers to it for any visual-design naming decision.
- **`human-changelog`** — keeps a plain-English `HUMAN_CHANGELOG.md` in lockstep with `CHANGELOG.md`. The "sentinel docs UPPERCASE" rule here applies to both filenames.

## Version & ownership

- **Version:** 1.0
- **Created:** 2026-05-25
- **Owner:** Emmett Shaughnessy `<hey@emmetts.dev>`
- **Source of truth:** This skill is the agent-callable entry point. The published works in the Sources table are the source of truth for the underlying rules. When this skill and a published source disagree, the source wins.
