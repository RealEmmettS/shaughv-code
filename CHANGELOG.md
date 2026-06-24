# Changelog

All notable changes to this plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

A plain-English companion lives at [HUMAN_CHANGELOG.md](./HUMAN_CHANGELOG.md) and is kept in lockstep with this file — see the changelog rule in [CLAUDE.md](./CLAUDE.md).

## [0.18.2] — 2026-06-24

Patch: bring four skill `description` fields under Claude Code's 1024-char cap so they can't be silently skipped — with **no context removed**, only relocated.

### Fixed
- `skills/mistral/`, `skills/shaughv-cdn/`, `skills/gcs-storage/`, `skills/shaughv-gcs-storage/` — trimmed each frontmatter `description` from over (or at) the **1024-char** cap to ~800–950 chars. Claude Code silently skips a skill whose description exceeds the cap, so these were at risk of never loading. **Nothing was deleted:** the full trigger-phrase lists, capability enumerations, model-id lists, and the `gcs-storage` "confirm GCP project + bucket before any mutating command" safety rule were moved verbatim into new `## When this skill fires` (and, for `gcs-storage`, `## Before any mutating command`) sections in each skill's body. Closes the cleanup flagged in 0.18.1.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.18.1` → `0.18.2`.
- `plugins/shaughv-code/` — regenerated (version lockstep); `-Check` passes.

## [0.18.1] — 2026-06-24

Patch: make the new CI validate gate's `-Check` line-ending-reproducible on Windows runners, and capture two recurring maintainer gotchas in the repo docs.

### Fixed
- `.gitattributes` — pinned the Codex package's generated `.mcp.json` to LF (`.mcp.json text eol=lf`). `build-codex-plugin.ps1 -Check` SHA-compares byte-exact and the build writes the wrapped `.mcp.json` as LF, so the repo's `* text=auto` was checking the committed copy out as **CRLF** on the Windows CI runner — failing the 0.18.0 validate gate with `hash mismatch: .mcp.json`. Skill files were unaffected (copied verbatim, identical treatment on both sides). Pin any future *generated* (not verbatim-copied) package file the same way.

### Changed
- `CLAUDE.md`, `AGENTS.md` — documented two recurring gotchas for future maintainers: the LF-pin requirement for any *generated* package file, and the **1024-char** Claude Code skill-`description` cap above which a skill is silently skipped (flagging `mistral`, `shaughv-cdn`, `gcs-storage` as currently over the cap).
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.18.0` → `0.18.1`.
- `plugins/shaughv-code/` — regenerated (version lockstep); `-Check` passes.

## [0.18.0] — 2026-06-24

Synced the bundle against the upstream work `theia-tools` skills and **de-work-ified** everything brought over — every Millis / Theia / Mission Control / CDP / Procore / Acumatica / Christian reference stripped or genericized. Net: a major `critical-thinking` expansion, four new general-purpose skills, and a reconciliation pass over the shared skills (most of which were already ahead of upstream, so were left untouched).

### Added
- `skills/critical-thinking/` — expanded from four to **six** frameworks. Added **Information Triage / Sensemaking** (`references/sensemaking.md` — the overload front door, the dense-hand-back procedure, the 30-second "5:30pm test") and **Scientific Inquiry** (`references/scientific-inquiry.md` — Observe → Research → Hypothesize → Experiment → Analyze → Report). Added the "Interactive Externalization / mental compacting" escalation section, `references/visual-models/interactive.md`, and **13 ready-to-use interactive HTML model templates** under `references/visual-models/html/`. De-work-ified throughout: sibling-skill refs restored (`logical-reasoning`, `strategic-thinking`, `personal-productivity`, `iterative-plan`, `debugging-framework`), the `~/critical-thinking-sessions/` canvas path kept, and the Procore/CDP "daily-log sync" worked examples (in `SKILL.md`, `sensemaking.md`, `scientific-inquiry.md`, `cognitive-scaffolds.md`, and `html/13-triage-card.html`) genericized to neutral software examples.
- `skills/workflow-optimization/` — new skill: turn-based facilitation to document, map (as a diagram), and improve any process via a multi-lens review (Lean, Six Sigma, Theory of Constraints, TQM, BPR, Process Optimization), ending in a ranked shortlist. Imported verbatim (already work-ism-free). `SKILL.md` + 11 references.
- `skills/iterative-plan/` — new skill: milestone-planning methodology (Profile → Clarify → Spine → Slice loop) with a binary/demoable success-criterion gate. De-work-ified — the Mission Control / Milestone / Orchestrator / Friday-update / BUILDR vocabulary genericized into ordinary planning language; worked examples rebuilt on neutral software. `SKILL.md` + 4 references.
- `skills/handoff/` — new skill: writes an exhaustive session handoff document (conversation arc, plan state, every decision, what's left) to a dated `docs/agents/handoff/` file, then defers to `git-workflow` for the commit. De-work-ified (Mission Control / Acumatica / Azure-SQL examples genericized; the `file-structure` and unauthored `documentation-standards` cross-refs dropped).
- `skills/security-check/` — new skill: full-repo security audit, branch/diff review, merge-impact (blast-radius) read, and on-request red-team (STRIDE + WSTG). De-work-ified — the per-stack `stack-*.md` guidance (React SPA, Azure Functions, FastAPI, Rust, Azure SQL, Entra/MSAL auth, LLM/MCP, supply chain) kept as general references; the "Millis stack" framing, company infra/resource names, and worked examples genericized. `SKILL.md` + 15 references + 2 scripts.
- `.github/workflows/validate.yml` — a CI gate (the shaughv-code equivalent of the work plugin's `validate.yml`) that runs on every PR and push to `main`: it validates every JSON manifest, runs `build-codex-plugin.ps1 -Check` so the tracked Codex package (`plugins/shaughv-code/`) can never drift from root content, and asserts version lockstep across `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, and `CHANGELOG.md`. CI **validates** the package — it does not regenerate or commit it (the package stays hand-committed, per `AGENTS.md`). No `release-skills.yml` was ported: this repo retired the `.skill` bundle distribution.

### Changed
- `skills/logical-reasoning/SKILL.md` — adopted the tightened upstream description (adds the "prefer critical-thinking for open-ended facilitation; this skill is for formal rigor" note); dropped a stub `## Evaluating this skill` / `evals/` section. The 10 reference files were already byte-identical.
- `skills/personal-productivity/SKILL.md` — grafted a clean "Stacking with other skills" section (`critical-thinking` / `strategic-thinking` / `learn`).
- `skills/learn/SKILL.md` — fixed an internal inconsistency (the proficiency-levels index now reads "Unaware → Expert", matching the table).
- `skills/openai-audio/README.md` — fixed a stale source-folder name in the manual-install snippet (`openai-realtime-skill` → `openai-audio`).
- `skills/bug-triage/`, `skills/debugging-framework/`, `skills/naming-conventions/` — scrubbed residual work-isms that had leaked into the personal copies (CDP MCP tool names `describe_entities` / `read_records` in worked examples; a `OneDrive` / `Outlook` example list). Upstream's purely-work reference files (`millis-bug-shapes.md`, `infrastructure-and-data.md`, `projects-tasks-milestones.md`) were deliberately **not** ported.
- The remaining shared skills (`git-workflow`, `wb300`, `pretext`, `human-changelog`, `spawn`, `strategic-thinking`, `code-design-patterns`, `defensive-programming`) were reviewed against upstream and **left unchanged** — the personal copies were already ahead of / cleaner than the work versions (Emmett-specific machine paths and project names, already-de-work-ified examples, restructured layouts, extra files work lacks).
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.17.0` → `0.18.0` across all three; descriptions extended to mention the four new skills; keywords extended with `handoff`, `iterative-plan`, `planning`, `security-check`, `security`, `workflow-optimization`, `workflow` (and `milestone`, `audit`, `red-team`, `process` on the Claude manifest).
- `README.md` — "Skills bundled" table extended with `handoff`, `iterative-plan`, `security-check`, and `workflow-optimization` rows (kept alphabetical); the `critical-thinking` row updated from four to six frameworks.
- `plugins/shaughv-code/` — regenerated via `build-codex-plugin.ps1` (now 32 skill directories, 460 files); `-Check` passes (SHA + version lockstep).
- `AGENTS.md`, `CLAUDE.md` — documented the new CI validate gate (it enforces the Codex package stays in sync on every PR/push to `main`; it validates, it does not regenerate).

## [0.17.0] — 2026-06-23

### Added
- `skills/ttdr/` — a skill teaching the **TT;DR ("Too Tired; Didn't Read")** convention: a short (1–3 sentence), plain-English, high-level lead that sits *on top of* a detailed answer for a busy or tired reader. It's the opposite spirit of a TL;DR — it assumes a competent-but-overloaded reader and **accompanies** the detail rather than replacing it. `SKILL.md` (frontmatter `name: ttdr` matching the directory) covers what a TT;DR is, the TL;DR-vs-TT;DR distinction, where to use it (status updates, commit/PR descriptions, incident write-ups, long docs, hand-offs), how to write one for the context at hand, format/placement, how it differs from a technical overview or tech spec, and common mistakes. Ships one reference, `references/examples.md` — a before/after example bank across status updates, commit & PR descriptions, incident write-ups, and edge cases (one-line fields, multi-section reports). Imported verbatim (pure Markdown, no scripts/deps/secrets).
- `plugins/shaughv-code/` — a tracked, **generated** self-contained Codex plugin package (its own `.codex-plugin/plugin.json`, a wrapped `.mcp.json`, and a copy of `skills/`), so Codex can snapshot a real subdirectory instead of being pointed at the bare repo. Brings the Codex distribution mechanism to parity with the work `theia-tools` plugin. Never hand-edit it — it's regenerated from root.
- `build-codex-plugin.ps1` — regenerates `plugins/shaughv-code/` from repo root: copies the Codex manifest verbatim, **wraps** the bare root `.mcp.json` into Codex's `{ "mcpServers": { … } }` shape, copies `skills/` verbatim, and guards against Windows `MAX_PATH` overflow. `-Check` rebuilds into a temp dir and SHA-compares (plus a version-lockstep assertion) without touching the worktree.
- `.codex/config.toml` — a repo-local Codex MCP fallback (native TOML) registering `remotion-documentation` (stdio: `npx @remotion/mcp@latest`) and `craft-docs` (streamable HTTP) for Codex sessions run inside this repo, before the plugin is installed.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.16.0` → `0.17.0` across all three manifests; the Claude and Codex descriptions extended to mention the TT;DR skill, and keywords extended with `ttdr`, `tldr`, and `summary`.
- `README.md` — "Skills bundled" table extended with a `ttdr` row (kept alphabetical, between `strategic-thinking` and `usage-statusline`).
- `.agents/plugins/marketplace.json` — Codex marketplace source flipped from a Git-URL descriptor (`source: url`, the repo `.git`) to a local subdirectory (`source: local`, `path: ./plugins/shaughv-code`), so Codex snapshots the self-contained package rather than the flat repo root. Install command is unchanged (`shaughv-code@shaughv-code`).
- `.codex-plugin/plugin.json` — gained `"mcpServers": "./.mcp.json"`, so the Codex surface now bundles the same MCP servers (Remotion documentation + Craft Docs) as the Claude surface; `interface.longDescription` reworded (the Codex surface is no longer "skills-only"). The root `.mcp.json` is unchanged (it must stay the bare Claude-plugin shape; the build script wraps it for the package).
- `README.md`, `AGENTS.md`, `CLAUDE.md` — Codex sections rewritten for the packaged-snapshot mechanism and MCP-in-Codex (repo-layout trees updated with `.codex/`, `plugins/shaughv-code/`, and `build-codex-plugin.ps1`; maintainer workflow gains the regen step); the standing "don't add a build script" rule replaced with the Codex-package regen rule (`build-codex-plugin.ps1` is the repo's only build step and the Claude surface still has none).

## [0.16.0] — 2026-06-19

### Added
- `skills/mistral/` — a comprehensive **Mistral AI API** skill making an agent fully capable of using every Mistral service, with **OCR**, **audio transcription**, and **text-to-speech** as the headline use cases. `SKILL.md` (frontmatter `name: mistral` matching the directory) is a trigger-rich router covering the key flow, the freshness contract, a task→reference→script routing table, the model catalog, and the priority workflows. Ships **14 reference docs** under `references/`: the full bundled **`openapi.yaml`** (the complete ~26k-line spec, byte-for-byte from `https://docs.mistral.ai/openapi.yaml`, for offline use and freshness diffing); `authentication.md` (the discover→prompt→save key flow, base URL, SDKs, error/rate-limit table); schema-complete deep refs for the three priority areas (`ocr.md`, `audio-transcriptions.md`, `audio-speech.md`) plus `chat.md` (tools/function-calling, structured outputs, vision, streaming), `text-and-embeddings.md` (FIM + embeddings), `classifiers.md` (moderations + classifications), `files.md`, `models.md` (+ model catalog), `batch.md`, `fine-tuning.md`, `agents.md` (Agents completions + the beta Agents & Conversations APIs); and `more-endpoints.md`, an operation-level index of 90+ long-tail/beta endpoints (libraries/RAG, connectors, observability, workflows, events, deprecated) that defers to the bundled spec. Every reference carries its canonical `https://docs.mistral.ai/api/endpoint/<group>[/<operation>]` doc link and cURL + Python + TypeScript examples.
- `skills/mistral/scripts/` — dependency-optional Python runners (pure stdlib; the `mistralai` SDK is only needed for the SDK code samples) with a stable JSON-on-stdout contract, stderr logs, and exit codes (`0` ok / `2` missing key / `1` other): `mistral_key.py` (the discover/check/`--set-system`/`--set-repo` key flow), `mistral_ocr.py`, `mistral_transcribe.py`, `mistral_speech.py`, a shared `_client.py` (key resolution + retrying REST client + multipart/SSE helpers + `upload_file`/`delete_file`), and `requirements.txt`. **Files uploaded to `/v1/files` to feed a one-shot call are deleted automatically once the result is back** (`mistral_ocr.py --file` auto-deletes its upload; documented as a standing rule in `SKILL.md` and `files.md`), so a temporary upload never accrues storage cost. Verified end-to-end against the live API: key saved to the machine and a real chat completion returned through the skill's own client.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.15.0` → `0.16.0` across all three manifests; the Claude and Codex descriptions extended to mention the Mistral skill, and keywords extended with `mistral`, `mistral-ai`, `ocr`, `voxtral`, `transcription`, `text-to-speech`, `tts`, `embeddings` (and `document-understanding`, `mistral-ocr`, `speech` on the Claude manifest).
- `README.md` — "Skills bundled" table extended with a `mistral` row (kept alphabetical, between `logical-reasoning` and `naming-conventions`).
- `.gitignore` — ignore the local `zipped-skills/` folder (per-skill `.skill` bundles, regenerated on demand, never committed) plus local API-key files (`.env`, `.mistral.env`, `.env.local`) a skill's key flow may write.

## [0.15.0] — 2026-06-14

### Added
- `skills/usage-statusline/scripts/install.mjs` — a cross-platform, zero-dependency Node installer for the usage status line, **dynamic by design**: it locates the bundled `statusline-usage.mjs` next to itself (`import.meta.url`), resolves the Claude config dir from `$CLAUDE_CONFIG_DIR` (else `~/.claude`), copies the script there, computes the absolute `node "<path>"` command **for the host it runs on** (forward slashes, quoted for spaces), merges that into `<config>/settings.json` non-destructively (backing the file up first; aborts rather than clobber invalid JSON), and runs the script's `--selftest`. Supports `--dry-run` and `--uninstall`. This makes installing the plugin + status line on several separate machines safe — each install resolves its own home dir, config dir, and absolute path; nothing is pinned to the authoring machine. Verified against a throwaway `CLAUDE_CONFIG_DIR`: it wrote that dir's path (not the author's) and preserved pre-existing settings keys.

### Changed
- `skills/usage-statusline/SKILL.md` — install section reworked around the one-command installer, with the manual copy-and-wire steps kept as a fallback (now with explicit per-machine absolute-path resolution instead of a literal example path). Added an explicit "nothing is tied to a specific machine" guarantee; frontmatter gained an `install:` line; uninstall now points at `install.mjs --uninstall`.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.14.0` → `0.15.0` across all three manifests.
- `README.md` — the `usage-statusline` row notes the cross-platform installer and the path-resolves-per-machine behavior.

## [0.14.0] — 2026-06-14

### Changed
- `skills/shaughv-cdn/SKILL.md` — **rebuilt as a manifest-driven hybrid.** The skill now leads with the CDN's own canonical rule — fetch the self-describing JSON manifest at `https://cdn.shaughv.com/tree.json` (alias `/tree`) and use the `url` / `embed` / `css_url` it returns, never hardcode asset paths — so the guide self-heals across asset additions, renames, and reorganizations (verified live: `count: 99`). It documents the manifest shape (`base_url` / `count` / `usage` / `fonts` / `tree`) and how to walk it. The high-value human context a bare manifest can't express was preserved from the previous hardcoded version: the license / redistribution table, the 64px animated-mark minimum, the `crossorigin` font-preload requirement, the cache contract, CORS, the "which asset do I need?" matrix, and the consumer-vs-maintainer scoping. The previously-unmerged `feat/document-unbounded-on-cdn` work was folded in — the **Unbounded** opt-in brutalist display family (weights 300–900 plus the "Unbounded Blond" stylistic cut, woff2-only, OFL 1.1, reserved for SHAUGHV's own surfaces) is now documented.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.13.0` → `0.14.0` across all three manifests.
- `README.md` — the `shaughv-cdn` row reworded to reflect the manifest-driven approach and the added Unbounded font.

### Removed
- Branch `feat/document-unbounded-on-cdn` (local + `origin`) — its sole change (hand-documenting the Unbounded font on the old hardcoded skill) is superseded by the manifest-driven rebuild, which surfaces Unbounded automatically. Its substance was folded into `main` first, so nothing was lost.

> Context: the `shaughvCDN.skill` file that prompted this was identified as a byte-for-byte copy of the CDN's own self-published `/agents` guide (not a repo artifact and not from any branch); it motivated adopting that manifest-driven approach in the bundled skill.

## [0.13.0] — 2026-06-14

### Added
- `skills/usage-statusline/` — a skill that installs and standardizes Emmett's Claude Code **usage status line**: a two-row status line showing live 5-hour and weekly usage percentages (color-coded sub-cell progress bars), model / context-fill / session-cost, and a locally-computed burn-rate "time left" projection for the 5-hour window with a red/green acceleration-trend color and a bold-red <30-min urgency override. Ships the **canonical, byte-identical** runtime as a bundled artifact — `scripts/statusline-usage.mjs` (Node ≥18, zero dependencies, extracted verbatim from the source build guide; its built-in `--selftest` passes 35/35) — plus `references/build-guide.md` (the full design rationale: the stdin schema, the burn-rate algorithm, the trend indicator, tuning knobs, and edge cases). `SKILL.md` (frontmatter `name: usage-statusline` matching the directory) walks the agent through copying the script into `<CLAUDE_DIR>` (not the version-stamped plugin cache, so its rolling state file persists), merging the `statusLine` block into `settings.json`, verifying with `--selftest`, and uninstalling. Bundling the script as a skill is the supported path because Claude Code reads `statusLine` only from `settings.json` — a plugin cannot ship one as a native component.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.12.0` → `0.13.0` across all three manifests; the Claude and Codex descriptions extended to mention the usage status-line installer, and keywords extended with `statusline`, `usage`, `rate-limit`, and `burn-rate`.
- `README.md` — "Skills bundled" table extended with a `usage-statusline` row (kept alphabetical, between `strategic-thinking` and `wb300`).

## [0.12.0] — 2026-06-14

### Added
- `skills/crystal-upscaler/` — the **crystal-upscaler** image-upscaling skill, imported from a `.skill` bundle export. Wraps fal.ai's Clarity Crystal Upscaler (`clarityai/crystal-upscaler`, image-to-image, tuned for facial detail / portraits) for resolution increase, sharpening, low-res / blur restoration, and print / retina prep at 1×–200× scale with a 0–10 creativity dial and PNG/JPG output. Ships `SKILL.md` (frontmatter `name: crystal-upscaler` matching the directory), `references/api-reference.md` (verbatim input/output schema, queue + webhook endpoints, the full pricing table, and cURL / `fal_client` / `@fal-ai/client` snippets), and three `scripts/`: `upscale.py` (the recommended path — upload, queue polling, output download, cost reporting, a `--json` agent contract on stdout, and auto-fitting of oversized inputs; falls back to a dependency-free stdlib queue client when `fal-client` is absent), `fit.py` (a least→most-destructive ladder that shrinks an over-limit input under the 100 MiB API cap behind a structural-integrity gate, working on a copy), and `requirements.txt` (`fal-client` + Pillow). Reads `FAL_KEY` from the environment; bills $0.016 per output megapixel.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.11.0` → `0.12.0` across all three manifests; the Claude and Codex descriptions extended to mention the fal.ai Crystal image upscaler, and keywords extended with `crystal-upscaler`, `upscale`, `upscaling`, `super-resolution`, `fal`, `fal-ai`, and `image-enhancement`.
- `README.md` — "Skills bundled" table extended with a `crystal-upscaler` row (kept alphabetical, between `critical-thinking` and `debugging-framework`).

## [0.11.0] — 2026-06-11

### Added
- `skills/wb300/` — the **wb300** branch / worktree / agent control-tower skill, imported from a `.skill` bundle export. Teaches the agent to reach for `wb300 agent` (JSON, schema `wb300.agent.v2`) as its read interface for branch/worktree/agent state, to map user questions ("what's running / dirty / ready to review / will collide / safe to delete") onto the schema's lifecycle and collision fields, and to hand the interactive full-screen TUI to the human rather than launching it itself. Ships `SKILL.md` plus three references: `references/agent-json.md` (full `wb300.agent.v2` schema + jq/PowerShell recipes), `references/install.md` (cross-platform install/update/uninstall matrix), and `references/tui.md` (views, keys, symbols). Frontmatter `name: wb300` matches the directory.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.10.0` → `0.11.0` across all three manifests; the Claude and Codex descriptions extended to mention the wb300 control tower, and keywords extended with `wb300`, `worktree`, `workbranch`, `branch`.
- `README.md` — "Skills bundled" table extended with a `wb300` row (kept alphabetical).

## [0.10.0] — 2026-06-07

### Changed
- Decoupled the imported skills from Emmett's private work stack so the public bundle no longer leaks work-specific context. Across `skills/{debugging-framework,defensive-programming,bug-triage,code-design-patterns,git-workflow,critical-thinking,learn,strategic-thinking,spawn}/`, every reference to the `theia-tools` work plugin, the Millis / TheiaConstruct data platform (CDP, Procore, Acumatica, Azure / Cosmos / Service Bus, thin-GI, Scorecard / PSR, `data.theiaconstruct.com`, `mcp__claude_ai_Millis_CDP__*`), the Mission Control task tracker, and named teammates / work agents (Christian, Dan, Talos, Hephaestus) was genericized or removed. Frontmatter `description`s were rewritten to trigger on the same generic intents minus the Millis framing; the debugging worked examples and the defensive-programming / design-pattern example domains were rewritten as stack-neutral composites.
- Rewired cross-skill references to the bare local skill names that exist in this bundle (`critical-thinking`, `git-workflow`, `bug-triage`, `learn`, `defensive-programming`, `naming-conventions`); no `theia-tools:`-namespaced references remain. Real external-plugin references (`superpowers:*`, `pr-review-toolkit:*`) were preserved.
- `skills/debugging-framework/references/millis-bug-shapes.md` → `skills/debugging-framework/references/bug-shapes.md` (renamed via `git mv`; all in-skill references updated and the "Millis bug shape" vocabulary relabeled "bug shape").
- `skills/spawn/` Phase 2 no longer files a Mission Control task — the flow is now investigate → execute, with the executor briefed directly from the investigation findings.
- `skills/git-workflow/` multi-agent coordination now runs on git-native signals (branch names on origin, `git worktree list`, last-commit times) instead of the Mission Control overlay.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.9.0` → `0.10.0`.

### Removed
- References to skills with no equivalent in this bundle: `mission-control-toolkit`, `cdp-design-pattern`, `cto-advisor`, `agile`, plus dead cross-refs to `mission-control-checkins`, `acumatica-thin-gi`, and `prompt-library`. The Mission Control tracker is Millis-only with no public counterpart, so its machinery (`result_notes`, `current_activity`, `update_task`, agent check-ins) was dropped rather than remapped.

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
- Not imported: the bundle's twelfth skill, a work-specific variant of `naming-conventions`, was deliberately skipped so the repo's SHAUGHV-personal `skills/naming-conventions/` stays untouched.

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

[0.8.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.8.0
[0.7.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.7.0
[0.6.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.6.0
[0.5.1]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.5.1
[0.5.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.5.0
[0.4.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.4.0
[0.3.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.3.0
[0.2.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.2.0
[0.1.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.1.0
