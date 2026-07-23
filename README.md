# shaughv-code

Emmett Shaughnessy's personal Claude Code and Codex plugin. Bundles every custom SHAUGHV skill into a single source of truth so Claude Code, Codex, and any agent that respects the same skills layout can pick up updates from one repo.

## Install

### Claude Code install

For first-time install — paste these two lines into any Claude Code session:

```text
/plugin marketplace add RealEmmettS/shaughv-code
/plugin install shaughv-code@shaughv-code
```

That's it. All skills below auto-load whenever their description matches the task. The bundled MCP servers connect on first use; the bundled slash command is available immediately.

**Optional follow-up:** for the Remotion team's official skill set, run `npx skills add remotion-dev/skills` separately. Those skills aren't bundled here so they stay upstream-controlled.

### Codex install

For first-time install in Codex, run:

```bash
codex plugin marketplace add RealEmmettS/shaughv-code
codex plugin add shaughv-code@shaughv-code
```

Codex installs a marketplace plugin by snapshotting a self-contained plugin **subdirectory** — it can't consume this repo's flat root (which stays flat for Claude Code's install). The repo therefore carries a tracked, generated package at `plugins/shaughv-code/`, built from repo root (`skills/`, `.mcp.json`, `.codex-plugin/plugin.json`) by `build-codex-plugin.ps1`, and `.agents/plugins/marketplace.json` points Codex at it. The Codex package carries the same skills **and the same MCP servers** (Remotion documentation, Craft Docs, Shaughv Health, and Pipedream) as the Claude Code plugin; only the `/shaughv-code:create-video` slash command stays Claude-only. **Never hand-edit `plugins/shaughv-code/`** — it's generated; edit root content and regenerate with `pwsh ./build-codex-plugin.ps1`.

### Alternative: install skills-only with `npx skills`

If you're using another agent (Cursor, OpenCode, Gemini CLI, and ~50 others), or you only want the skills without plugin marketplace metadata, install via the [`skills`](https://skills.sh) CLI:

```bash
npx skills add RealEmmettS/shaughv-code
```

Defaults to a project install at `.claude/skills/` (or your agent's equivalent — the CLI auto-detects). Add `-g` for a global install at `~/.claude/skills/`. Update later with `npx skills update`. To get the bundled MCP servers and slash command too, use the Claude Code marketplace flow above instead.

## Update

### Claude Code update

If you already have it installed and just want to pick up the latest version — paste these two lines into any Claude Code session:

```text
/plugin marketplace update shaughv-code
/reload-plugins
```

If a new component (skill, command, or MCP) doesn't show up after `/reload-plugins`, restart Claude Code — some changes (new MCP servers, new commands) only register on a fresh session.

### Codex update

If you installed through Codex, refresh the marketplace snapshot and reinstall the plugin:

```bash
codex plugin marketplace upgrade shaughv-code
codex plugin add shaughv-code@shaughv-code
```

Start a fresh Codex thread after reinstalling so new or changed skills or MCP servers are loaded.

To develop against a local checkout instead of the published marketplace:

```bash
claude --plugin-dir C:/Users/hey/git/shaughv-code
```

If you originally installed with `npx skills add`, update with `npx skills update` (add `-g` if you installed globally).

## Loop escape and convergence recovery

The `loop-escape` skill is a narrow recovery router for work that is going in circles, has produced the same result twice without new evidence, has been stuck for hours or days, or needs to get a basic version working before pursuing the full goal.

- Claude Code: `/shaughv-code:loop-escape`
- Codex: `$shaughv-code:loop-escape`

Agents may select the skill automatically from those signals, but automatic selection is probabilistic; explicit invocation is the reliable recovery mechanism. The skill creates a convergence checkpoint, classifies the last two attempts as `new evidence`, `valid replication`, or `duplicate cycle`, selects the smallest working rung, and routes to the relevant specialist guidance. It deliberately does not treat expected long operations, passive monitoring, meaningful iteration, or independent replication as loops.

## Skills bundled

| Skill | Purpose |
|---|---|
| `bug-triage` | Interactive bug-triage and investigation agent for internal tools — actively reproduces and investigates with browser tools and data-platform queries instead of just asking questions. |
| `code-design-patterns` | Gang of Four design-patterns reference and analyzer — all 22 GoF patterns (Creational/Structural/Behavioral) with Python, TypeScript, and SQL examples. Triggers on "what pattern fits" / "how should I structure this". |
| `critical-thinking` | Seven agent-first thinking frameworks for reframing assumptions, changing strategy families, and testing whether a stalled approach is still fit for purpose. Two materially identical cycles force a convergence checkpoint; alternatives must differ through observability, a smaller end-to-end prototype, another runtime/tool, a working reference, or environmental isolation. |
| `crystal-upscaler` | Upscale, enlarge, and enhance images via fal.ai's Clarity Crystal Upscaler (`clarityai/crystal-upscaler`) — tuned for faces, portraits, and profile pictures. 1x–200x scale, creativity dial, PNG/JPG out. Bundled `upscale.py` handles upload, queue polling, cost reporting, and auto-fitting inputs over the 100 MiB API cap. Reads `$env:FAL_KEY`. |
| `debugging-framework` | Structured debugging framework for stack bugs — integration drift, writes that didn't land, vanished messages, 5xx errors, datetime and idempotency gotchas, "works locally but not in prod". |
| `defensive-programming` | What "defensive" means at a system boundary — error contracts, try/except critique, retry-backoff and timeout logic, where validation belongs — safety without the noise. |
| `gcs-storage` | Generic Google Cloud Storage reference. Install on macOS/Linux/Windows, ADC vs service-account auth, upload/download/list/delete, flat vs HNS folders, public access, signed URLs, CORS, lifecycle, scripting cheat-sheet, and a comprehensive gotchas catalog. Agent asks for project ID + bucket before mutating commands. |
| `git-workflow` | The team's preferred git workflow for branches, worktrees, commits, PRs, rebasing, merge conflicts, hotfixes, and multi-agent coordination. It strongly defaults to the full workbranch/worktree/PR route, while treating clear owner approval as sufficient for a simpler delivery route without skipping tests, validation, secret checks, or post-push CI. |
| `handoff` | Write an exhaustive session handoff document so a future agent resumes exactly where this one stopped — conversation arc, plan state, every decision, and what's left. Produces a dated `docs/agents/handoff/` file, then defers to `git-workflow` for the commit. |
| `human-changelog` | Create/update a `HUMAN_CHANGELOG.md` by translating a repo's `CHANGELOG.md` into plain-English entries (no version numbers, no jargon), and wires up the repo's `CLAUDE.md` to keep both files in sync going forward. |
| `image-gen` | Generate or edit images (text-to-image and image-to-image), routed to Nano Banana 2 / Gemini, MAI-Image-2.5, or Reve — always asks which provider to use first, saves results to Downloads. |
| `iterative-plan` | Milestone planning and loop-triggered re-slicing for work that is too ambitious or needs the basic version first. Preserves the final goal while separating the smallest end-to-end functional rung, demoable integration/hardening rungs, and remaining qualification evidence. |
| `learn` | Guided facilitation for deliberate learning — Kickoff/Session/Review/Course-Correct modes, the Learning Loop, proficiency levels, and a Learning Journal as the living artifact. |
| `logical-reasoning` | Rigorous deductive and inductive reasoning, including whether another retry actually adds evidence. Audits attempt signatures, distinguishes independent replication from correlated retries and pseudoreplication, and changes proof method when an unchanged transformation stalls. |
| `loop-escape` | Narrow recovery router for repetitive, stalled, or over-ambitious work. Produces a convergence checkpoint, finds the smallest working rung, chooses a discriminating next action with a stop condition, and loads at most the relevant critical-thinking, iterative-plan, logical-reasoning, or debugging guidance. |
| `mistral` | Comprehensive Mistral AI API skill — every endpoint in the spec, with **OCR**, **audio transcription** (Voxtral), and **text-to-speech** as the headline jobs, plus chat/tools/structured-output, embeddings, FIM, classifiers, files, batch, fine-tuning, and the Agents & Conversations API. Bundles the full OpenAPI spec for offline/diff use, dependency-optional runner scripts (`mistral_ocr.py` / `mistral_transcribe.py` / `mistral_speech.py`), and a key discover→prompt→save flow. Uploaded files are auto-deleted after use. Reads `$env:MISTRAL_API_KEY`. |
| `naming-conventions` | SHAUGHV + general naming rules for any identifier — variables, files, folders, repos, branches, commits, PRs, columns, flags. Carries Code Complete 2 and DevOps Handbook principles plus SHAUGHV-specific conventions. |
| `openai-audio` | OpenAI audio stack — Realtime API, transcription, translation, TTS, WebRTC/WebSocket/SIP transports. Includes 13 runnable examples (py/js/ts). |
| `personal-productivity` | Productivity toolbox distilled from five books (Burkeman, Newport, Vaden) — prioritizing a task list, planning the week, deciding what to drop, defer, or delegate. |
| `pretext` | DOM-free text measurement and line layout using `@chenglou/pretext`. |
| `quiver-ai` | SVG generation and raster→vector via Quiver AI's Arrow model. Reads `$env:QUIVERAI_API_KEY`. |
| `security-check` | Repo/branch security work — full-repo audit, branch/diff review, merge-impact (blast-radius) read, and on-request red-team (STRIDE + WSTG). Stack-aware per-stack security guidance (React SPA, serverless functions, FastAPI, Rust, SQL, auth/identity, LLM/MCP, supply chain). |
| `shaughv-animated-brandmark` | Build the SHAUGHV animated brand mark — draws itself path-by-path, then loops between wordmark and icon. |
| `shaughv-cdn` | Consumer guide for the `cdn.shaughv.com` private CDN. **Manifest-driven** — reads the self-describing `/tree.json` instead of hardcoding paths, so it self-heals across asset changes. Covers the manifest shape, canonical embed/preload patterns (64px brand-mark minimum, `crossorigin` font preload), the Makira / Unbounded / IBM Plex Mono families, cache contract, CORS, and license/redistribution limits. |
| `shaughv-design` | Generate well-branded interfaces and assets for the SHAUGHV brand. Ships fonts, favicons, color tokens, type system, component previews, and two UI kits. |
| `shaughv-gcs-storage` | Pre-wired skill for Emmett's personal public bucket at `gs://shaughv`. Bucket facts (uniform IAM, public reads, 7-day soft delete, versioning on, CORS off, US multi-region) baked in so the agent never has to ask. Returns `https://storage.googleapis.com/shaughv/<path>` URLs. Embeds the full cross-platform reference from `gcs-storage` so it stands alone. |
| `subagent-model-preference` | The operator's standing model/effort convention for **every subagent** (Agent tool incl. Explore/Plan, Workflow `agent()` calls, custom agent types): Opus 4.8 [1m] at `xhigh` (`max` when needed) for deep work, Sonnet 5 at `max` (`xhigh` when lighter) for fan-out — never Haiku/budget classes, never auto-substitute Fable/mythos, never below `xhigh`. Includes the forward-mapping procedure for new model lineups plus paste-able install snippets for `~/.claude/CLAUDE.md` and repo-level `CLAUDE.md`/`AGENTS.md`. |
| `ttdr` | Write a **TT;DR** ("Too Tired; Didn't Read") — a short (1–3 sentence), plain-English, high-level lead that sits *on top of* a detailed answer for a busy or tired reader (the opposite spirit of a TL;DR; it accompanies the detail, never replaces it). Covers what it is, how to write one for the context at hand, format/placement, and how it differs from a TL;DR, technical overview, or tech spec. Bundles a before/after example bank. |
| `usage-statusline` | Install Emmett's Claude Code usage status line — two rows showing live 5-hour and weekly usage % (color-coded bars), model / context-fill / session cost, plus a local burn-rate "time left" estimate before the 5h limit with a red/green acceleration-trend color. Ships the canonical zero-dependency Node script plus a **cross-platform installer** (`install.mjs`) that resolves paths per machine, merges `settings.json` non-destructively (with backup), and runs `--selftest` — so the identical status line installs cleanly on every machine, nothing hardcoded. |
| `wb300` | Inspect and supervise Git branches, worktrees, and the coding agents running across them via the `wb300` control tower — `wb300 agent` JSON for answering "what's running / dirty / ready to review / safe to clean up / will collide", plus install/update/uninstall guidance and how to point the human at the live TUI. |
| `workflow-optimization` | Guided facilitation to document, map, and improve any process — renders the workflow as a diagram, then runs a multi-lens review (Lean, Six Sigma, Theory of Constraints, TQM, BPR) ending in a ranked shortlist of improvements. |

## Commands bundled

| Command | Purpose |
|---|---|
| `/shaughv-code:create-video` | Scaffold a new Remotion Recorder project via `npx create-video@latest --recorder`, then add `@remotion/web-renderer` inside the new project (`npx remotion add @remotion/web-renderer`). Asks for a directory name, then runs both steps non-interactively; falls back to `! npx ...` if either needs a TTY. |

## MCP servers bundled

| Server | Source | Purpose |
|---|---|---|
| `remotion-documentation` | `npx @remotion/mcp@latest` | Searches the live Remotion documentation. Exposes a single tool — `remotion-documentation` — proxied to `mcp.remotion.dev`. |
| `craft-docs` | `https://mcp.craft.do/links/.../mcp` (Streamable HTTP) | Connects to a specific Craft Docs link. OAuth-gated — first tool use pops a Craft sign-in flow, so the bundled URL alone is not a credential. Exposes Craft's standard tools (read/write blocks, revert). |
| `shaughv-health` | `https://health.emmetts.dev/api/mcp` (Streamable HTTP) | Connects to Emmett's personal health-data MCP server. OAuth-gated via Google sign-in (allowlisted account) — first tool use pops a sign-in flow, so the bundled URL alone is not a credential. Exposes health/nutrition/sleep/exercise query and logging tools. |
| `pipedream` | `https://mcp.pipedream.net/v2` (Streamable HTTP) | Connects to Pipedream's end-user MCP service, with access to tools from thousands of apps. OAuth-gated — first use prompts the installer to sign in, choose apps, and authorize access; the bundled URL is not a credential. |

Both surfaces bundle these now: Claude Code reads them from the root `.mcp.json`, and the Codex package ships them too (`plugins/shaughv-code/.mcp.json`). Codex sessions run *inside this repo* also pick them up from `.codex/config.toml` before the plugin is installed.

## Repo layout

```
shaughv-code/
├── .agents/
│   └── plugins/
│       └── marketplace.json # Codex marketplace entry (points at plugins/shaughv-code/)
├── .claude-plugin/
│   ├── plugin.json          # plugin manifest
│   └── marketplace.json     # marketplace entry (single-plugin marketplace)
├── .codex/
│   └── config.toml          # repo-local Codex MCP fallback (in-repo sessions)
├── .codex-plugin/
│   └── plugin.json          # Codex plugin manifest (skills + MCP)
├── .mcp.json                # bundled MCP servers (Remotion, Craft, Health, Pipedream)
├── build-codex-plugin.ps1   # regenerates plugins/shaughv-code/ from root
├── commands/
│   └── create-video.md      # /shaughv-code:create-video
├── plugins/
│   └── shaughv-code/        # GENERATED Codex package — do not hand-edit
│       ├── .codex-plugin/plugin.json   # copy of root manifest
│       ├── .mcp.json                   # root .mcp.json in Codex's wrapped shape
│       └── skills/                     # copy of root skills/
└── skills/
    ├── critical-thinking/
    ├── gcs-storage/
    ├── human-changelog/
    ├── loop-escape/
    ├── naming-conventions/
    ├── openai-audio/
    ├── pretext/
    ├── quiver-ai/
    ├── shaughv-animated-brandmark/
    ├── shaughv-cdn/
    ├── shaughv-design/
    ├── shaughv-gcs-storage/
    └── ttdr/
```

Each skill is a plain folder with `SKILL.md` (plus `references/`, `examples/`, `assets/`, etc.). Edit skills in place — there is no build step for the Claude Code surface. The **Codex** surface is the one exception: its `plugins/shaughv-code/` package is generated from root by `build-codex-plugin.ps1` and must be regenerated (not hand-edited) whenever root skills, `.mcp.json`, or the Codex manifest change.

## Editing a skill (maintainer workflow)

For consumers: see [Update](#update) above — you don't need this section.

For Emmett / anyone editing the plugin's source:

1. Edit files under `skills/<name>/` (or `.mcp.json` / `.codex-plugin/plugin.json`).
2. Regenerate the Codex package: `pwsh ./build-codex-plugin.ps1` (verify with `pwsh ./build-codex-plugin.ps1 -Check`). Never hand-edit `plugins/shaughv-code/`.
3. Commit and push — include both the root change and the regenerated `plugins/shaughv-code/`.
4. In any Claude Code instance: `/plugin marketplace update shaughv-code` then `/reload-plugins` (or restart).
5. In Codex: `codex plugin marketplace upgrade shaughv-code`, then `codex plugin add shaughv-code@shaughv-code`, then start a fresh thread.

## Author

[Emmett Shaughnessy](https://emmetts.dev) · `hey@emmetts.dev` · [@RealEmmettS](https://github.com/RealEmmettS)
