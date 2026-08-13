# shaughv-code

Emmett Shaughnessy's personal Claude Code and Codex plugin. Bundles every custom SHAUGHV skill into a single source of truth so Claude Code, Codex, and any agent that respects the same skills layout can pick up updates from one repo.

## Install

### Claude Code install

For first-time install — paste these two lines into any Claude Code session:

```text
/plugin marketplace add RealEmmettS/shaughv-code
/plugin install shaughv-code@shaughv-code
```

That's it. All skills below auto-load whenever their description matches the task, and the bundled slash command is available immediately. The plugin registers no MCP servers; `choose-optional-mcps` can surface connection guidance when a task needs one.

**Optional follow-up:** for the Remotion team's official skill set, run `npx skills add remotion-dev/skills` separately. Those skills aren't bundled here so they stay upstream-controlled.

### Codex install

For first-time install in Codex, run:

```bash
codex plugin marketplace add RealEmmettS/shaughv-code
codex plugin add shaughv-code@shaughv-code
```

Codex installs a marketplace plugin by snapshotting a self-contained plugin **subdirectory** — it can't consume this repo's flat root (which stays flat for Claude Code's install). The repo therefore carries a tracked, generated package at `plugins/shaughv-code/`, built from root `skills/`, `assets/`, and `.codex-plugin/plugin.json` by `build-codex-plugin.ps1`, and `.agents/plugins/marketplace.json` points Codex at it. The package registers no MCP servers; `choose-optional-mcps` documents optional connections without loading them. Only the `/shaughv-code:create-video` slash command stays Claude-only. **Never hand-edit `plugins/shaughv-code/`** — it's generated; edit root content and regenerate with `pwsh ./build-codex-plugin.ps1`.

### Alternative: install skills-only with `npx skills`

If you're using another agent (Cursor, OpenCode, Gemini CLI, and ~50 others), or you only want the skills without plugin marketplace metadata, install via the [`skills`](https://skills.sh) CLI:

```bash
npx skills add RealEmmettS/shaughv-code
```

Defaults to a project install at `.claude/skills/` (or your agent's equivalent — the CLI auto-detects). Add `-g` for a global install at `~/.claude/skills/`. Update later with `npx skills update`. The skills-only install still includes the optional MCP catalog; use the Claude Code marketplace flow above when you also want the slash command.

## Update

### Claude Code update

If you already have it installed and just want to pick up the latest version — paste these two lines into any Claude Code session:

```text
/plugin marketplace update shaughv-code
/reload-plugins
```

If a new skill or command doesn't show up after `/reload-plugins`, restart Claude Code — commands may require a fresh session.

### Codex update

If you installed through Codex, refresh the marketplace snapshot and reinstall the plugin:

```bash
codex plugin marketplace upgrade shaughv-code
codex plugin add shaughv-code@shaughv-code
```

Start a fresh Codex thread after reinstalling so new or changed skills are loaded.

To develop against a local checkout instead of the published marketplace:

```bash
claude --plugin-dir C:/Users/hey/git/shaughv-code
```

If you originally installed with `npx skills add`, update with `npx skills update` (add `-g` if you installed globally).

## Agentic prompt engineering

Use `agentic-prompt-engineering` to write, audit, or apply prompts for difficult software/data
work, research mathematics and science, multi-agent investigation, and other long-horizon tasks.
It keeps one compact portable core—observable contract, early premise test, information-bearing
actions, claim-matched oracles, completion receipts, route-level loop control, and truthful
terminal states—then loads only the needed domain adapter or dated Claude Fable 5 / Opus 5 or
GPT-5.6 Sol / Codex overlay.

- Claude Code: `/shaughv-code:agentic-prompt-engineering`
- Codex: `$shaughv-code:agentic-prompt-engineering`

If no mode or domain is named, the skill infers the final deliverable from the latest active
request and corrections, builds a compact working contract, selects only the relevant
software/data/math/science, model, long-horizon, or evaluation guidance, and asks one compact set
of material questions when a vague consequential request still leaves a real operator choice.
It does not ask for facts the live session already answers or silently turn important unknowns
into assumptions. When a top-level agent delegates, it compiles each subagent's normal task
context into a branch-specific prompt with evidence, scope, oracle, loop policy, and return
receipt. It explicitly invokes the skill in Claude Code or Codex when the child can see it and
embeds the equivalent contract when it cannot; top-level skill loading is never assumed to
propagate automatically.

The skill may also auto-route a hard problem when better representation, method selection, or
verification—not another routine attempt—is the bottleneck. If the execution is already repeating
without information gain, it invokes `loop-escape` and continues from the recovery checkpoint.

The skill is intentionally not an agent-platform, memory-system, or environment-design guide.
Routine directly verifiable work stays routine; `loop-escape` remains the focused recovery entry
point once an execution is already stuck.

## Loop escape and convergence recovery

The `loop-escape` skill is a self-contained recovery workflow for work that is going in circles, has produced the same result twice without new evidence, has been stuck for hours or days, or needs to get a basic version working before pursuing the full goal.

- Claude Code: `/shaughv-code:loop-escape`
- Codex: `$shaughv-code:loop-escape`

Agents may select the skill automatically from those signals, but automatic selection depends on each runtime's description budget and matching; explicit invocation is the reliable recovery mechanism. Once loaded, the skill stands alone: it creates a convergence checkpoint, classifies the last two attempts as `new evidence`, `valid replication`, or `duplicate cycle`, applies the relevant strategy, scope, evidence, observability, or defect lens, and selects the smallest working rung. It may read one or two specialist skills for deeper method, but their visibility is never required. It deliberately does not treat expected long operations, passive monitoring, meaningful iteration, or independent replication as loops.

## Skills bundled

| Skill | Purpose |
|---|---|
| `agentic-prompt-engineering` | Self-routing prompt-facing operating system for vague, difficult, or long-horizon agentic work: improves the operator's request from active context, asks compact material questions, infers Author/Audit/Operate/Evaluate and applicable adapters, compiles cross-runtime subagent briefs, builds falsifiable task contracts, tests load-bearing premises, selects information-bearing actions, requires claim-matched receipts, routes true stalls to loop escape, and conditionally loads software/data/math/science, Claude Fable 5 / Opus 5, GPT-5.6 Sol / Codex, and evaluation guidance. |
| `bug-triage` | Interactive bug-triage and investigation agent for internal tools — actively reproduces and investigates with browser tools and data-platform queries instead of just asking questions. |
| `choose-optional-mcps` | Advisory catalog for Remotion documentation, Shaughv Health, and Pipedream connections. Checks for an existing client connector or MCP first, avoids duplicate registration, recommends project vs user scope, and surfaces setup/authentication boundaries without loading or installing anything automatically. |
| `code-design-patterns` | Gang of Four design-patterns reference and analyzer — all 22 GoF patterns (Creational/Structural/Behavioral) with Python, TypeScript, and SQL examples. Triggers on "what pattern fits" / "how should I structure this". |
| `critical-thinking` | Seven agent-first thinking frameworks for reframing assumptions, changing strategy families, and testing whether a stalled approach is still fit for purpose. Two materially identical cycles force a convergence checkpoint; alternatives must differ through observability, a smaller end-to-end prototype, another runtime/tool, a working reference, or environmental isolation. |
| `crystal-upscaler` | Upscale, enlarge, and enhance images via fal.ai's Clarity Crystal Upscaler (`clarityai/crystal-upscaler`) — tuned for faces, portraits, and profile pictures. 1x–200x scale, creativity dial, PNG/JPG out. Bundled `upscale.py` handles upload, queue polling, cost reporting, and auto-fitting inputs over the 100 MiB API cap. Reads `$env:FAL_KEY`. |
| `debugging-framework` | Structured debugging framework for stack bugs — integration drift, writes that didn't land, vanished messages, 5xx errors, datetime and idempotency gotchas, "works locally but not in prod". |
| `defensive-programming` | What "defensive" means at a system boundary — error contracts, try/except critique, retry-backoff and timeout logic, where validation belongs — safety without the noise. |
| `gcs-storage` | Generic Google Cloud Storage reference. Install on macOS/Linux/Windows, ADC vs service-account auth, upload/download/list/delete, flat vs HNS folders, public access, signed URLs, CORS, lifecycle, scripting cheat-sheet, and a comprehensive gotchas catalog. Agent asks for project ID + bucket before mutating commands. |
| `git-workflow` | The team's preferred git workflow for branches, worktrees, commits, PRs, rebasing, merge conflicts, hotfixes, and multi-agent coordination. It strongly defaults to the full workbranch/worktree/PR route, while treating clear owner approval as sufficient for a simpler delivery route without skipping tests, validation, secret checks, or post-push CI. |
| `handoff` | Write a compact typed continuation packet: objective/acceptance, authority, verified state and evidence, artifacts, hypotheses, attempt ledger, failed routes, unresolved obligations, and exact next action—with stable pointers to raw history instead of a transcript dump. An active task system remains canonical; standalone handoffs are explicit or fallback artifacts. |
| `human-changelog` | Create/update a `HUMAN_CHANGELOG.md` by translating a repo's `CHANGELOG.md` into plain-English entries (no version numbers, no jargon), and wires up the repo's `CLAUDE.md` to keep both files in sync going forward. |
| `image-gen` | Generate or edit images (text-to-image and image-to-image), routed to Nano Banana 2 / Gemini, MAI-Image-2.5, or Reve — always asks which provider to use first, saves results to Downloads. |
| `iterative-plan` | Milestone planning and loop-triggered re-slicing for work that is too ambitious or needs the basic version first. Preserves the final goal while separating the smallest end-to-end functional rung, demoable integration/hardening rungs, and remaining qualification evidence. |
| `learn` | Guided facilitation for deliberate learning — Kickoff/Session/Review/Course-Correct modes, the Learning Loop, proficiency levels, and a Learning Journal as the living artifact. |
| `logical-reasoning` | Rigorous deductive and inductive reasoning, including whether another retry actually adds evidence. Audits attempt signatures, distinguishes independent replication from correlated retries and pseudoreplication, and changes proof method when an unchanged transformation stalls. |
| `loop-escape` | Self-contained recovery for repetitive, stalled, or over-ambitious work. Compares causal attempt signatures, classifies token/epistemic/action-policy/false-premise loops, repairs observability, finds the smallest working rung, and separates response/route/task stopping before replaying acceptance oracles. |
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
| `subagent-model-preference` | The operator's standing model/effort convention for **every subagent** (Agent tool incl. Explore/Plan, Workflow `agent()` calls, custom agent types): Opus 5 [1m] at `xhigh` (`max` when needed) for deep work, Sonnet 5 at `max` (`xhigh` when lighter) for fan-out — never Haiku/budget classes, never auto-substitute Fable or Mythos, never below `xhigh`. Includes the forward-mapping procedure for new model lineups plus paste-able install snippets for `~/.claude/CLAUDE.md` and repo-level `CLAUDE.md`/`AGENTS.md`. |
| `ttdr` | Write a **TT;DR** ("Too Tired; Didn't Read") — a short (1–3 sentence), plain-English, high-level lead that sits *on top of* a detailed answer for a busy or tired reader (the opposite spirit of a TL;DR; it accompanies the detail, never replaces it). Covers what it is, how to write one for the context at hand, format/placement, and how it differs from a TL;DR, technical overview, or tech spec. Bundles a before/after example bank. |
| `usage-statusline` | Install Emmett's Claude Code usage status line — two rows showing live 5-hour and weekly usage % (color-coded bars), model / context-fill / session cost, plus a local burn-rate "time left" estimate before the 5h limit with a red/green acceleration-trend color. Ships the canonical zero-dependency Node script plus a **cross-platform installer** (`install.mjs`) that resolves paths per machine, merges `settings.json` non-destructively (with backup), and runs `--selftest` — so the identical status line installs cleanly on every machine, nothing hardcoded. |
| `wb300` | Inspect and supervise Git branches, worktrees, and the coding agents running across them via the `wb300` control tower — `wb300 agent` JSON for answering "what's running / dirty / ready to review / safe to clean up / will collide", plus install/update/uninstall guidance and how to point the human at the live TUI. |
| `workflow-optimization` | Proportional process improvement with focused and comprehensive modes: contract the outcome, measure a baseline, select only applicable Lean/Six Sigma/TOC/TQM/BPR/optimization lenses, pilot the smallest discriminating change, and remeasure with a receipt. Diagramming is conditional. |

## Commands bundled

| Command | Purpose |
|---|---|
| `/shaughv-code:create-video` | Scaffold a new Remotion Recorder project via `npx create-video@latest --recorder`, then add `@remotion/web-renderer` inside the new project (`npx remotion add @remotion/web-renderer`). Asks for a directory name, then runs both steps non-interactively; falls back to `! npx ...` if either needs a TTY. |

## Optional MCP connections (not bundled)

| Connection | Source | When it may help |
|---|---|---|
| `remotion-documentation` | `npx @remotion/mcp@latest` | Searches the live Remotion documentation. Exposes a single tool — `remotion-documentation` — proxied to `mcp.remotion.dev`. |
| `shaughv-health` | `https://health.emmetts.dev/api/mcp` (Streamable HTTP) | Explicitly authorized personal health, nutrition, sleep, or exercise tasks. OAuth-gated via Google sign-in to an allowlisted account. |
| `pipedream` | `https://mcp.pipedream.net/v2` (Streamable HTTP) | Tools from apps the operator selects and authorizes through Pipedream OAuth. |

Neither plugin surface registers these connections. The `choose-optional-mcps` skill carries their identifiers, transports, installation examples, scope guidance, privacy/authorization boundaries, and a reuse-first rule. Loading the plugin therefore cannot duplicate a client-provided or standalone MCP.

## Repo layout

```
shaughv-code/
├── .agents/
│   └── plugins/
│       └── marketplace.json # Codex marketplace entry (points at plugins/shaughv-code/)
├── .claude-plugin/
│   ├── plugin.json          # plugin manifest
│   └── marketplace.json     # marketplace entry (single-plugin marketplace)
├── .codex-plugin/
│   └── plugin.json          # Codex plugin manifest (skills only)
├── assets/                  # plugin branding (Codex interface.composerIcon/logo/logoDark)
├── build-codex-plugin.ps1   # regenerates plugins/shaughv-code/ from root
├── commands/
│   └── create-video.md      # /shaughv-code:create-video
├── plugins/
│   └── shaughv-code/        # GENERATED Codex package — do not hand-edit
│       ├── .codex-plugin/plugin.json   # copy of root manifest
│       ├── assets/                     # copy of root assets/
│       └── skills/                     # copy of root skills/
└── skills/
    ├── agentic-prompt-engineering/
    ├── choose-optional-mcps/
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

Each skill is a plain folder with `SKILL.md` (plus `references/`, `examples/`, `assets/`, etc.). Edit skills in place — there is no build step for the Claude Code surface. The **Codex** surface is the one exception: its `plugins/shaughv-code/` package is generated from root by `build-codex-plugin.ps1` and must be regenerated (not hand-edited) whenever root skills, assets, or the Codex manifest change.

## Editing a skill (maintainer workflow)

For consumers: see [Update](#update) above — you don't need this section.

For Emmett / anyone editing the plugin's source:

1. Edit files under `skills/<name>/` (or `assets/` / `.codex-plugin/plugin.json`).
2. Regenerate the Codex package: `pwsh ./build-codex-plugin.ps1` (verify with `pwsh ./build-codex-plugin.ps1 -Check`). Never hand-edit `plugins/shaughv-code/`.
3. Commit and push — include both the root change and the regenerated `plugins/shaughv-code/`.
4. In any Claude Code instance: `/plugin marketplace update shaughv-code` then `/reload-plugins` (or restart).
5. In Codex: `codex plugin marketplace upgrade shaughv-code`, then `codex plugin add shaughv-code@shaughv-code`, then start a fresh thread.

## Author

[Emmett Shaughnessy](https://emmetts.dev) · `hey@emmetts.dev` · [@RealEmmettS](https://github.com/RealEmmettS)
