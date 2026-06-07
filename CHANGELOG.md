# Changelog

All notable changes to this plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

A plain-English companion lives at [HUMAN_CHANGELOG.md](./HUMAN_CHANGELOG.md) and is kept in lockstep with this file — see the changelog rule in [CLAUDE.md](./CLAUDE.md).

## [0.9.0] — 2026-06-06

### Added
- Eleven new skills imported from a `.skill` bundle export (each ships its `SKILL.md` — frontmatter `name` matching the directory name — plus any bundled `references/` docs, unmodified):
  - `skills/bug-triage/` — interactive bug triage and investigation agent for internal tools; investigates with browser tools and data-platform queries rather than only asking questions.
  - `skills/code-design-patterns/` — Gang of Four design-patterns reference and analyzer; all 22 GoF patterns with Python/TypeScript/SQL examples.
  - `skills/debugging-framework/` — structured debugging for stack bugs: integration drift, missing writes, vanished messages, 5xx, datetime/idempotency gotchas.
  - `skills/defensive-programming/` — boundary-focused defensive coding: error contracts, try/except critique, retry-backoff/timeouts, validation placement.
  - `skills/git-workflow/` — official git workflow and committing strategy: branches, worktrees, commits, PRs, rebasing, conflicts, hotfixes, multi-agent coordination.
  - `skills/image-gen/` — text-to-image and image-to-image generation routed to Nano Banana 2 / Gemini (via fal.ai or native API), MAI-Image-2.5 (fal.ai), or Reve; asks provider first; saves to Downloads.
  - `skills/learn/` — guided facilitation for deliberate learning: Kickoff/Session/Review/Course-Correct, the Learning Loop, Learning Journal.
  - `skills/logical-reasoning/` — deductive/inductive reasoning toolkit: Copi-style natural deduction, propositional/predicate/categorical/modal logic, fallacies, induction, IBE.
  - `skills/personal-productivity/` — productivity toolbox distilled from five books (Burkeman ×2, Newport ×2, Vaden).
  - `skills/spawn/` — manual-invocation-only `/spawn` orchestration playbook; two-phase Opus subagent pattern (INVESTIGATE then EXECUTE); explicitly never auto-triggers.
  - `skills/strategic-thinking/` — turn-based strategic facilitation: Strategic Picture plus four lenses (Art of War, 36 Stratagems, Five Rings, game theory).
- Not imported: the bundle's twelfth skill, a Millis-work variant of `naming-conventions`, was deliberately skipped so the repo's SHAUGHV-personal `skills/naming-conventions/` stays untouched.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.8.0` → `0.9.0` across all three manifests; descriptions and keywords extended to cover the eleven new skills.
- `README.md` — "Skills bundled" table extended with eleven new rows (kept alphabetical).

### Fixed
- Normalized CRLF → LF line endings on `.md`/`.sh` files in the eleven imported skills (the export was Windows-authored) and on the pre-existing `skills/shaughv-animated-brandmark/` markdown files (`SKILL.md` + `references/implementation.md`), whose `SKILL.md` frontmatter `name` carried a trailing `\r`. Matches the repo's `* text=auto` `.gitattributes` policy.

## [0.8.0] — 2026-05-28

### Added
- `.codex-plugin/plugin.json` — adds a Codex skills-only plugin manifest for `shaughv-code`, pointing at the existing `skills/` tree and intentionally omitting `mcpServers` so Codex does not parse the Claude-style `.mcp.json`.
- `.agents/plugins/marketplace.json` — adds a Codex marketplace entry that points `shaughv-code` at this repository with a Git URL source descriptor, preserving the root-level plugin layout that Claude Code already uses.
- `AGENTS.md` — tracks the Codex-facing maintainer guide and documents that `.codex-plugin/` is lowercase, skills-only, and version-aligned with the Claude plugin surface.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — version bumped `0.7.0` → `0.8.0` so the Claude and Codex plugin surfaces stay aligned.
- `README.md` — documented Codex install/update commands, the skills-only Codex scope, and the parallel Claude Code / Codex / `npx skills` consumption paths.

## [0.7.0] — 2026-05-25

### Added
- `.mcp.json` — bundles a second MCP server, `craft-docs`, pointing at the Craft Docs link `https://mcp.craft.do/links/LKUYYz65h6s/mcp` over Streamable HTTP transport (`"type": "http"`). The URL is OAuth-gated: installers see the server appear, then authenticate via Craft's OAuth flow on first tool use, so the link committed to this public repo is not itself a credential. Exposes Craft's standard tool set (`craft_read`, `craft_write`, `blocks_revert`).

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — version bumped `0.6.0` → `0.7.0`; `craft` and `craft-docs` added to `keywords`; plugin description updated to mention the Craft Docs MCP server alongside the Remotion documentation MCP.
- `README.md` — "MCP servers bundled" table extended with a `craft-docs` row; `.mcp.json` comment in the repo-layout tree updated to mention both servers.

## [0.6.0] — 2026-05-25

### Added
- `skills/gcs-storage/` — generic Google Cloud Storage reference. Covers install on macOS / Linux (apt, snap, dnf, tarball) / Windows, ADC vs service-account auth, impersonation, upload/download/list/delete, flat vs HNS folders, public access via uniform bucket-level access + `allUsers`, signed URLs (with the 7-day cap gotcha documented), CORS, lifecycle, scripting flags, the gcloud command-structure primer + cheat-sheet, the Cloud Client Libraries language matrix, and a comprehensive gotchas catalog. Agent must ask for project ID + bucket name before any mutating command.
- `skills/shaughv-gcs-storage/` — pre-wired skill for Emmett's personal public bucket at `gs://shaughv`. Bucket facts (uniform IAM, public reads granted to `allUsers`, 7-day soft delete, object versioning ON, CORS OFF, US multi-region, Standard storage class, two lifecycle rules) are baked in so the agent never has to ask. Returns `https://storage.googleapis.com/shaughv/<path>` URLs. Embeds the full cross-platform reference from `gcs-storage` so the skill stands alone.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — version bumped `0.5.1` → `0.6.0`; keywords extended with `gcs`, `google-cloud-storage`, `gcloud`, `storage`, `upload`; description updated to mention the two new skills.
- `README.md` — "Skills bundled" table and "Repo layout" tree updated to list `gcs-storage` and `shaughv-gcs-storage`.

### Verified
- Smoke-tested the documented workflow against the live `gs://shaughv` bucket before publishing: `gcloud storage cp` upload with `--content-type` + `--cache-control`, `ls -l`, public-URL HEAD + GET via `https://storage.googleapis.com/shaughv/test.txt` (200 OK, correct response headers, body verbatim), `rm` deletion, public URL goes 404, soft-deleted noncurrent version recoverable via `--all-versions` + generation ID, and hard-delete cleanup.

## [0.5.1] — 2026-05-25

### Changed
- Version bumped `0.5.0` → `0.5.1` in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.
- `README.md` + `CLAUDE.md` — documented the alternative `npx skills add RealEmmettS/shaughv-code` install path for non-Claude-Code agents (Cursor, OpenCode, Codex, Gemini CLI, etc.). Added `human-changelog` and `naming-conventions` to the listed skills.
- `skills/perplexity-search/SKILL.md` — clarified Perplexity API key prerequisites and `$env:PERPLEXITY_API_KEY` guidance.

### Added
- `.playwright-mcp` entry added to `.gitignore` to ignore Playwright MCP session snapshots.

## [0.5.0] — 2026-05-25

### Added
- `skills/naming-conventions/` — naming rules for any identifier (variables, files, folders, repos, branches, commits, PRs, columns, flags). Carries Code Complete 2 and DevOps Handbook principles plus SHAUGHV-specific conventions. Includes `references/code-identifiers.md`, `references/files-and-folders.md`, `references/git-branches-commits.md`, `references/naming-audit.md`, `references/rationale.md`.

### Changed
- `.claude-plugin/plugin.json` — version bumped `0.4.0` → `0.5.0`; description extended to mention naming conventions; `naming` and `conventions` added to `keywords`.

## [0.4.0] — 2026-05-24

### Added
- `skills/shaughv-cdn/` — consumer guide for the `cdn.shaughv.com` private CDN. URL conventions for `/brand/`, `/fonts/`, `/js/`; canonical `<link>` / `<script>` / `<img>` snippets; font preload patterns; cache contract (1-year immutable binaries, 1-day SWR for CSS/JS); CORS; license restrictions; quick decision matrix.

### Changed
- Version bumped `0.3.0` → `0.4.0`.

## [0.3.0] — 2026-05-24

### Added
- `.mcp.json` — bundles the Remotion documentation MCP server (`npx @remotion/mcp@latest`). Exposes a single tool, `remotion-documentation`, proxied to `mcp.remotion.dev`.
- `commands/create-video.md` — `/shaughv-code:create-video` slash command that scaffolds a Remotion Recorder project via