# shaughv-code

Emmett Shaughnessy's personal Claude Code and Codex plugin. Bundles every custom SHAUGHV skill into a single source of truth so Claude Code, Codex, and any agent that respects the same skills layout can pick up updates from one repo.

## Install

### Claude Code install

For first-time install — paste these two lines into any Claude Code session:

```text
/plugin marketplace add RealEmmettS/shaughv-code
/plugin install shaughv-code@shaughv-code
```

That's it. All skills below auto-load whenever their description matches the task. The bundled MCP server connects on first use; the bundled slash command is available immediately.

**Optional follow-up:** for the Remotion team's official skill set, run `npx skills add remotion-dev/skills` separately. Those skills aren't bundled here so they stay upstream-controlled.

### Codex install (skills-only)

For first-time install in Codex, run:

```bash
codex plugin marketplace add RealEmmettS/shaughv-code
codex plugin add shaughv-code@shaughv-code
```

Codex currently receives the skills only. The bundled MCP servers and `/shaughv-code:create-video` command remain on the Claude Code marketplace surface until a Codex-compatible MCP/command pass is done.

### Alternative: install skills-only with `npx skills`

If you're using another agent (Cursor, OpenCode, Gemini CLI, and ~50 others), or you only want the skills without plugin marketplace metadata, install via the [`skills`](https://skills.sh) CLI:

```bash
npx skills add RealEmmettS/shaughv-code
```

Defaults to a project install at `.claude/skills/` (or your agent's equivalent — the CLI auto-detects). Add `-g` for a global install at `~/.claude/skills/`. Update later with `npx skills update`. To get the bundled MCP server and slash command too, use the Claude Code marketplace flow above instead.

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

Start a fresh Codex thread after reinstalling so new or changed skills are loaded.

To develop against a local checkout instead of the published marketplace:

```bash
claude --plugin-dir C:/Users/hey/git/shaughv-code
```

If you originally installed with `npx skills add`, update with `npx skills update` (add `-g` if you installed globally).

## Skills bundled

| Skill | Purpose |
|---|---|
| `bug-triage` | Interactive bug-triage and investigation agent for internal tools — actively reproduces and investigates with browser tools and data-platform queries instead of just asking questions. |
| `code-design-patterns` | Gang of Four design-patterns reference and analyzer — all 22 GoF patterns (Creational/Structural/Behavioral) with Python, TypeScript, and SQL examples. Triggers on "what pattern fits" / "how should I structure this". |
| `critical-thinking` | Four critical-thinking frameworks (contemplating, problem-solving, decision-making, design) plus devil's advocacy and a working canvas. |
| `crystal-upscaler` | Upscale, enlarge, and enhance images via fal.ai's Clarity Crystal Upscaler (`clarityai/crystal-upscaler`) — tuned for faces, portraits, and profile pictures. 1x–200x scale, creativity dial, PNG/JPG out. Bundled `upscale.py` handles upload, queue polling, cost reporting, and auto-fitting inputs over the 100 MiB API cap. Reads `$env:FAL_KEY`. |
| `debugging-framework` | Structured debugging framework for stack bugs — integration drift, writes that didn't land, vanished messages, 5xx errors, datetime and idempotency gotchas, "works locally but not in prod". |
| `defensive-programming` | What "defensive" means at a system boundary — error contracts, try/except critique, retry-backoff and timeout logic, where validation belongs — safety without the noise. |
| `gcs-storage` | Generic Google Cloud Storage reference. Install on macOS/Linux/Windows, ADC vs service-account auth, upload/download/list/delete, flat vs HNS folders, public access, signed URLs, CORS, lifecycle, scripting cheat-sheet, and a comprehensive gotchas catalog. Agent asks for project ID + bucket before mutating commands. |
| `git-workflow` | The team's official git workflow and committing strategy for all repos — branches, worktrees, commits, PRs, rebasing, merge conflicts, hotfixes, multi-agent coordination. |
| `human-changelog` | Create/update a `HUMAN_CHANGELOG.md` by translating a repo's `CHANGELOG.md` into plain-English entries (no version numbers, no jargon), and wires up the repo's `CLAUDE.md` to keep both files in sync going forward. |
| `image-gen` | Generate or edit images (text-to-image and image-to-image), routed to Nano Banana 2 / Gemini, MAI-Image-2.5, or Reve — always asks which provider to use first, saves results to Downloads. |
| `learn` | Guided facilitation for deliberate learning — Kickoff/Session/Review/Course-Correct modes, the Learning Loop, proficiency levels, and a Learning Journal as the living artifact. |
| `logical-reasoning` | Rigorous deductive and inductive reasoning — Copi-style natural deduction, propositional/predicate/categorical/modal logic, fallacies, induction, statistics, inference to the best explanation. |
| `naming-conventions` | SHAUGHV + general naming rules for any identifier — variables, files, folders, repos, branches, commits, PRs, columns, flags. Carries Code Complete 2 and DevOps Handbook principles plus SHAUGHV-specific conventions. |
| `openai-audio` | OpenAI audio stack — Realtime API, transcription, translation, TTS, WebRTC/WebSocket/SIP transports. Includes 13 runnable examples (py/js/ts). |
| `perplexity-search` | Web search and AI-grounded answers via the Perplexity Agent, Search, and Sonar APIs. |
| `personal-productivity` | Productivity toolbox distilled from five books (Burkeman, Newport, Vaden) — prioritizing a task list, planning the week, deciding what to drop, defer, or delegate. |
| `pretext` | DOM-free text measurement and line layout using `@chenglou/pretext`. |
| `quiver-ai` | SVG generation and raster→vector via Quiver AI's Arrow model. Reads `$env:QUIVERAI_API_KEY`. |
| `shaughv-animated-brandmark` | Build the SHAUGHV animated brand mark — draws itself path-by-path, then loops between wordmark and icon. |
| `shaughv-cdn` | Consumer guide for the `cdn.shaughv.com` private CDN. Covers URL conventions for `/brand/`, `/fonts/`, `/js/`; canonical `<link>`/`<script>`/`<img>` snippets; font preload patterns; cache contract; CORS; license restrictions. |
| `shaughv-design` | Generate well-branded interfaces and assets for the SHAUGHV brand. Ships fonts, favicons, color tokens, type system, component previews, and two UI kits. |
| `shaughv-gcs-storage` | Pre-wired skill for Emmett's personal public bucket at `gs://shaughv`. Bucket facts (uniform IAM, public reads, 7-day soft delete, versioning on, CORS off, US multi-region) baked in so the agent never has to ask. Returns `https://storage.googleapis.com/shaughv/<path>` URLs. Embeds the full cross-platform reference from `gcs-storage` so it stands alone. |
| `spawn` | Manual-invocation-only `/spawn` orchestration playbook — two-phase Opus subagent pattern (read-only INVESTIGATE, then EXECUTE) for driving one problem to done. Never auto-triggers. |
| `strategic-thinking` | Turn-based facilitation for any strategic situation — builds a Strategic Picture, pulls four lenses (Art of War, 36 Stratagems, Five Rings, game theory), converges on a recommended line plus alternatives. |
| `wb300` | Inspect and supervise Git branches, worktrees, and the coding agents running across them via the `wb300` control tower — `wb300 agent` JSON for answering "what's running / dirty / ready to review / safe to clean up / will collide", plus install/update/uninstall guidance and how to point the human at the live TUI. |

## Commands bundled

| Command | Purpose |
|---|---|
| `/shaughv-code:create-video` | Scaffold a new Remotion Recorder project via `npx create-video@latest --recorder`, then add `@remotion/web-renderer` inside the new project (`npx remotion add @remotion/web-renderer`). Asks for a directory name, then runs both steps non-interactively; falls back to `! npx ...` if either needs a TTY. |

## MCP servers bundled

| Server | Source | Purpose |
|---|---|---|
| `remotion-documentation` | `npx @remotion/mcp@latest` | Searches the live Remotion documentation. Exposes a single tool — `remotion-documentation` — proxied to `mcp.remotion.dev`. |
| `craft-docs` | `https://mcp.craft.do/links/.../mcp` (Streamable HTTP) | Connects to a specific Craft Docs link. OAuth-gated — first tool use pops a Craft sign-in flow, so the bundled URL alone is not a credential. Exposes Craft's standard tools (read/write blocks, revert). |

## Repo layout

```
shaughv-code/
├── .agents/
│   └── plugins/
│       └── marketplace.json # Codex marketplace entry (skills-only)
├── .claude-plugin/
│   ├── plugin.json          # plugin manifest
│   └── marketplace.json     # marketplace entry (single-plugin marketplace)
├── .codex-plugin/
│   └── plugin.json          # Codex plugin manifest (skills-only)
├── .mcp.json                # bundled MCP servers (Remotion docs, Craft Docs)
├── commands/
│   └── create-video.md      # /shaughv-code:create-video
└── skills/
    ├── critical-thinking/
    ├── gcs-storage/
    ├── human-changelog/
    ├── naming-conventions/
    ├── openai-audio/
    ├── perplexity-search/
    ├── pretext/
    ├── quiver-ai/
    ├── shaughv-animated-brandmark/
    ├── shaughv-cdn/
    ├── shaughv-design/
    └── shaughv-gcs-storage/
```

Each skill is a plain folder with `SKILL.md` (plus `references/`, `examples/`, `assets/`, etc.). Edit in place — there is no separate build step and no `.skill` zip to keep in sync.

## Editing a skill (maintainer workflow)

For consumers: see [Update](#update) above — you don't need this section.

For Emmett / anyone editing the plugin's source:

1. Edit files under `skills/<name>/`.
2. Commit and push.
3. In any Claude Code instance: `/plugin marketplace update shaughv-code` then `/reload-plugins` (or restart).
4. In Codex: `codex plugin marketplace upgrade shaughv-code`, then `codex plugin add shaughv-code@shaughv-code`, then start a fresh thread.

## Author

[Emmett Shaughnessy](https://emmetts.dev) · `hey@emmetts.dev` · [@RealEmmettS](https://github.com/RealEmmettS)
