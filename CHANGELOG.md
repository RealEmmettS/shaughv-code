# Changelog

All notable changes to this plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

A plain-English companion lives at [HUMAN_CHANGELOG.md](./HUMAN_CHANGELOG.md) and is kept in lockstep with this file — see the changelog rule in [CLAUDE.md](./CLAUDE.md).

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
- `commands/create-video.md` — `/shaughv-code:create-video` slash command that scaffolds a Remotion Recorder project via `npx create-video@latest --recorder`, then adds `@remotion/web-renderer` inside the new project (`npx remotion add @remotion/web-renderer`). Falls back to `! npx ...` if either step needs a TTY.

### Changed
- Version bumped `0.2.0` → `0.3.0`.

## [0.2.0] — 2026-05-20

### Added
- `skills/human-changelog/` — translates a repo's `CHANGELOG.md` into a plain-English `HUMAN_CHANGELOG.md`, and installs a standing rule in the repo's `CLAUDE.md` so future agent edits keep the two in lockstep.

### Changed
- Normalized the new skill's `reference/` directory to `references/` to match the rest of the plugin.
- Removed the no-op `user-invocable: true` setting from `shaughv-design` (defaults to true; setting it was redundant). Dropped the now-obsolete "leave it alone" warning from `CLAUDE.md`.
- Version bumped `0.1.0` → `0.2.0`.

## [0.1.0] — 2026-05-19

### Added
- Initial plugin scaffolding. `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` manifests, `.gitignore`, `CLAUDE.md` developer notes, README with installation and repo-layout documentation.
- Initial set of seven skills, migrated from legacy binary `.skill` bundles into a normalized `skills/` tree:
  - `skills/critical-thinking/` — four critical-thinking frameworks (contemplating, problem-solving, decision-making, design) plus devil's advocacy and a working canvas.
  - `skills/openai-audio/` — OpenAI audio stack (Realtime API, transcription, translation, TTS, WebRTC/WebSocket/SIP transports) with 13 runnable examples in Python / JS / TS.
  - `skills/perplexity-search/` — web search and AI-grounded answers via the Perplexity Agent, Search, and Sonar APIs.
  - `skills/pretext/` — DOM-free text measurement and line layout using `@chenglou/pretext`.
  - `skills/quiver-ai/` — SVG generation and raster→vector via Quiver AI's Arrow model.
  - `skills/shaughv-animated-brandmark/` — build the SHAUGHV animated brand mark (draws itself path-by-path, then loops between wordmark and icon).
  - `skills/shaughv-design/` — generate well-branded interfaces and assets for the SHAUGHV brand. Ships fonts, favicons, color tokens, type system, component previews, and two UI kits.

### Removed
- Legacy binary `.skill` bundles in `SKILLS/` — replaced by the normalized `skills/` tree.

[0.6.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.6.0
[0.5.1]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.5.1
[0.5.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.5.0
[0.4.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.4.0
[0.3.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.3.0
[0.2.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.2.0
[0.1.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.1.0
