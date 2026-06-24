# Files & Folders

> **Scope:** Files and folders inside SHAUGHV repos and structured artifact archives (a personal context library, a project notes folder, a research dump — anything you'll grep through in a year).
>
> **Authoritative principle:** McConnell's read:write-ratio (see [`rationale.md`](rationale.md) and [`code-identifiers.md`](code-identifiers.md)). A misnamed file rots silently; a correctly named file announces nothing, but the compounding cost of a wrong name is what makes the few seconds of write-time discipline worth it.

## Why this convention exists

Filenames are read by humans visually scanning a directory listing, by AI agents pattern-matching for relevance, by `Glob` and `Get-ChildItem` and `git log`, by GitHub's renderer, by changelog tools, and by CI runners. Each of those readers makes assumptions about format. A filename that reads cleanly to all of them is worth choosing carefully; a filename that fights one of them creates silent friction every time someone touches the file.

The rules below are optimized for the worst reader in the chain — usually an agent or a Linux CI runner that won't squint or correct for you.

## The grammar

Two file-name forms — pick the one that matches what the file is:

```
[!]<type-tag>-<kebab-slug>[_vN].<ext>             ← evergreen artifacts
YYYY-MM-DD_<type-tag>-<kebab-slug>[_vN].<ext>    ← time-stamped artifacts
```

| Part | Rule |
|---|---|
| `!` | Optional. Leading `!` is reserved for files that must sort to the top of a folder listing — manifests, briefs. Do not use it for any other reason. |
| `YYYY-MM-DD_` | Required for time-stamped artifacts (meetings, transcripts, audits, retros, decisions, daily plans, dated emails). Omit for evergreen artifacts (briefs, manifests, context docs). ISO 8601 only. Underscore separator after the date. |
| `<type-tag>` | Required. From the controlled vocabulary below. Lowercase. |
| `-` | Single dash separator between tag and slug. |
| `<kebab-slug>` | Required. Lowercase, 2–6 words, dash-separated, descriptive. No stop words unless they aid clarity. |
| `_vN` | Optional. Only for files that **genuinely have coexisting versions**. Underscore separator, lowercase `v`, integer. Old versions go to `_archive/`; do not retain `_v1`, `_v2`, `_v3` side-by-side unless all three are actively referenced. |
| `.<ext>` | Lowercase extension. |

### Compliant examples

```
!BRIEF.md
brief-shaughv-cdn-rollout.md
context-remotion-pipeline.md
2026-05-15_meeting-client-discovery.md
2026-04-20_decision-color-system-overhaul.md
2026-04-29_retro-q1-shipped.md
2026-05-07_audit-brand-asset-inventory.xlsx
research-remotion-audio-pipeline.md
plan-brand-refresh_v3.md
email-draft-collab-pitch-2026-05-08.md
```

### Forbidden patterns

```
2026-05-14 Q2 Plan Review with Stakeholders.txt          ← spaces, no type-tag
Brand Refresh Meeting with Designer & Dev.m4a            ← spaces, ampersand
exports_brand_assets (17).xlsx                           ← parens, copy marker, tool junk
Project_Review_v7_WORKING (2).xlsm                       ← _WORKING, (2), Title_Case
2026-02-19_09-30-34.mp4                                  ← raw Teams timestamp, no slug, no tag
ChatGPT Image Mar 20, 2026, 02_41_52 PM.png              ← raw ChatGPT export
INFO SHEET FLYER.pdf                                     ← ALL CAPS, spaces
```

## The type-tag vocabulary

These tags cover virtually every artifact in a structured archive. Use the catch-all `note` only when nothing else fits.

| Tag | Meaning | Typical extensions |
|---|---|---|
| `brief` | Project brief, executive summary, "what is this project" | `.md` |
| `context` | Reference document, background, system context | `.md` |
| `meeting` | Live meeting notes, discovery sessions, debriefs | `.md` |
| `transcript` | Raw or cleaned meeting transcript | `.txt`, `.md` |
| `audit` | Investigation, verification, data audit | `.md`, `.xlsx` |
| `decision` | Architecture Decision Record (ADR) | `.md` |
| `email-draft` | Draft email to a person or group | `.md` |
| `research` | Research deliverable, deep-dive, briefing | `.md`, `.pdf`, `.docx` |
| `plan` | Build plan, work plan, roadmap, gameplan | `.md` |
| `retro` | Retrospective | `.md` |
| `spec` | Functional spec, technical spec | `.md`, `.docx`, `.pdf` |
| `task-queue` | Task list for an agent or human | `.md` |
| `handoff` | EOD or session handoff document | `.md` |
| `prompt` | Saved prompt artifact | `.md` |
| `report` | Output / deliverable report | `.md`, `.pdf`, `.docx`, `.html` |
| `note` | Catch-all when none of the above fit | any |

**Combining tags: don't.** One tag per file. Pick the most specific one. If a file is both a "decision" and a "report," it's a `decision`.

## Sentinel docs — UPPERCASE filename

Some files are *sentinels* — they live at the root of a repo or context folder and are looked up by tooling, by humans, and by AI agents using a fixed name. These have a fixed UPPERCASE convention that overrides the kebab-case rule above. **No exceptions.**

| Filename | Where | Why this exact casing |
|---|---|---|
| `README.md` | Every repo root, every distributable project folder | GitHub / GitLab / Bitbucket / npm / PyPI all auto-render this exact filename on the project page. Lowercase `readme.md` or mixed `Readme.md` is rendered on Linux (case-sensitive) and silently confuses tooling. |
| `CLAUDE.md` | Every repo root and the Context library root | Claude Code looks for this exact filename to load project-level instructions. Mis-cased variants (`claude.md`, `Claude.md`) are not picked up on Linux runners (case-sensitive filesystem) even though Windows treats them as the same file. |
| `CHANGELOG.md` | Every actively-versioned repo root | Keep-a-Changelog convention; release tooling (`release-please`, `semantic-release`, `commitizen`) expects this exact filename. |
| `HUMAN_CHANGELOG.md` | SHAUGHV repos that maintain a plain-English changelog (per the `human-changelog` skill) | Companion to `CHANGELOG.md`; same UPPERCASE convention, same Linux-CI concerns. |
| `LICENSE` (no extension) | Every open-source-style repo root | GitHub's license detection scans for this exact filename. `LICENSE.md` is also accepted, but `LICENSE` (no extension) is the canonical form. |
| `CONTRIBUTING.md` | Any repo that accepts contributions | GitHub auto-links this from the PR creation page. |
| `CODEOWNERS` (no extension) | `.github/CODEOWNERS` or repo root | GitHub's code-review routing reads this exact filename. |
| `SECURITY.md` | Any repo with a security-disclosure policy | GitHub's "Report a vulnerability" link looks for this exact filename. |
| `AUTHORS` (no extension) or `AUTHORS.md` | Long-running open-source-style repos | Convention from the GNU project; tooling like `git shortlog` doesn't read it, but humans do. |

**Why UPPERCASE at all** — convention going back to the 1970s Unix world (`README`, `INSTALL`, `LICENSE`, `COPYING` all UPPERCASE) so the sentinel files sorted to the top of a folder listing (uppercase letters sort before lowercase in ASCII). Modern tooling still expects the convention; deviating from it breaks the tooling silently on Linux runners.

**The Windows vs Linux trap.** Windows is case-insensitive on disk by default (`Claude.md` and `claude.md` are the same file). Linux is case-sensitive (they are different files). A repo authored on Windows with `Claude.md` will not be found by Claude Code running on a Linux CI runner. **Always commit the exact UPPERCASE form** to source control; never commit a mis-cased variant even if it "works on your machine."

## Folder naming

Same grammar applies inside project folders: lowercase kebab-case, no spaces, no special characters.

```
audit/                          ← good
image-mockups/                  ← good
brand-refresh-2026/             ← good
_archive/                       ← reserved: archived content (leading underscore)
.claude/                        ← reserved: tooling (leading dot)
```

`_archive/` and `.claude/` are the two universal reserved prefixes. The leading underscore on `_archive/` keeps deprecated content sorted to the top in most file browsers and signals "deprioritize me" to agents. The leading dot on `.claude/` follows the Unix dot-folder convention for tooling configuration.

## Optional pattern — the `!project.md` manifest

For larger structured archives where one folder maps to one project, a manifest file at the project folder root makes machine routing easier. The leading `!` forces sort-to-top in directory listings.

```yaml
---
project_id: brand-refresh-2026     # kebab-case, globally unique within the archive
project_name: Brand Refresh 2026   # display name, matches folder name
status: active                     # active | paused | completed | archived
owner: hey@emmetts.dev
created: 2026-03-17
last_updated: 2026-05-15
---
```

The body is a 1–3 paragraph description of what the project is and what the current state is. Use this pattern only if it earns its keep — for a one-off folder or a transient workspace, the overhead isn't worth it.

## The rename-on-save policy for tool exports

Raw exports from tools (Teams, ChatGPT, cloud-storage copies, email attachments, screenshot tools) frequently have meaningless or hostile names. The standard is:

**The agent MUST propose a compliant rename for any tool export before treating it as a final artifact. Renaming is not automatic — the agent prompts the user and waits for confirmation.**

| Tool-junk pattern | Replace with |
|---|---|
| `2026-02-19_09-30-34.mp4` (Teams recording) | `YYYY-MM-DD_meeting-{topic-slug}.mp4` |
| `2026-02-19_09-30 Meeting Transcript.txt` (Teams transcript) | `YYYY-MM-DD_transcript-{topic-slug}.txt` |
| `ChatGPT Image Mar 20, 2026, 02_41_52 PM.png` | `YYYY-MM-DD_mockup-{topic-slug}.png` (or whatever type-tag fits) |
| `reports_brand_export (17).xlsx` | `YYYY-MM-DD_export-brand-assets.xlsx` (or `audit-` if doing analysis) |
| `Document - Copy.docx`, `Document (2).docx` | Resolve before saving. Pick one; archive the other to `_archive/`. |
| `Project_Review_v7_WORKING.xlsm` | `spec-project-review_v7.xlsm` (drop `_WORKING`) |
| `Screenshot 2026-05-19 at 14.32.07.png` | `YYYY-MM-DD_screenshot-{what-it-shows}.png` |

Files that violate the standard SHOULD be flagged by the agent when they appear in working directories. The agent does **not silently rename them** — silent renaming destroys the user's mental model of what's in the folder.

## Versioning

`_vN` (underscore + lowercase `v` + integer) is legal **only for files that genuinely have coexisting versions** that are both actively referenced.

- ✅ `spec-revenue-projections_v1.md` + `spec-revenue-projections_v2.md` when v1 is preserved for a stakeholder comparison
- ✅ `plan-brand-refresh_v3.md` when v1 and v2 are in `_archive/` and v3 is current
- ❌ `spec_DRAFT.md`, `spec_WORKING.md`, `spec_FINAL.md` — forbidden
- ❌ `spec (2).md`, `spec - Copy.md` — forbidden (tool junk)

Old versions go to `_archive/` (leading underscore so they sort to the top and the agent treats them as deprioritized).

## Quick checklist for the agent before saving a file in a structured archive

1. **Identify the project / context folder** the file belongs to.
2. **Pick a type-tag** from the controlled vocabulary above.
3. **Decide time-stamped or evergreen.** Meetings/transcripts/audits/retros/decisions/dated emails get `YYYY-MM-DD_`; briefs/contexts/plans/specs/manifests do not.
4. **Write a 2–6-word kebab-case slug** that describes the content.
5. **Verify no collision** with an existing file in the same folder.
6. **If the user provided a tool-junked filename**, propose a compliant rename and prompt for confirmation. Do not silently rename.
7. **Save.**

---

*Conventions distilled from McConnell, *Code Complete* 2nd ed. (Microsoft Press, 2004) read:write-ratio principle and standard Unix / GitHub sentinel-doc conventions. The type-tag vocabulary is opinionated but extensible — add a tag when a clearly missing category surfaces.*
