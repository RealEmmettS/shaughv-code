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
| `critical-thinking` | Four critical-thinking frameworks (contemplating, problem-solving, decision-making, design) plus devil's advocacy and a working canvas. |
| `gcs-storage` | Generic Google Cloud Storage reference. Install on macOS/Linux/Windows, ADC vs service-account auth, upload/download/list/delete, flat vs HNS folders, public access, signed URLs, CORS, lifecycle, scripting cheat-sheet, and a comprehensive gotchas catalog. Agent asks for project ID + bucket before mutating commands. |
| `human-changelog` | Create/update a `HUMAN_CHANGELOG.md` by translating a repo's `CHANGELOG.md` into plain-English entries (no version numbers, no jargon), and wires up the repo's `CLAUDE.md` to keep both files in sync going forward. |
| `naming-conventions` | SHAUGHV + general naming rules for any identifier — variables, files, folders, repos, branches, commits, PRs, columns, flags. Carries Code Complete 2 and DevOps Handbook principles plus SHAUGHV-specific conventions. |
| `openai-audio` | OpenAI audio stack — Realtime API, transcription, translation, TTS, WebRTC/WebSocket/SIP transports. Includes 13 runnable examples (py/js/ts). |
| `perplexity-search` | Web search and AI-grounded answers via the Perplexity Agent, Search, and Sonar APIs. |
| `pretext` | DOM-free text measurement and line layout using `@chenglou/pretext`. |
| `quiver-ai` | SVG generation and raster→vector via Quiver AI's Arrow model. Reads `$env:QUIVERAI_API_KEY`. |
| `shaughv-animated-brandmark` | Build the SHAUGHV animated brand mark — draws itself path-by-path, then loops between wordmark and icon. |
| `shaughv-cdn` | Consumer guide for the `cdn.shaughv.com` private CDN. Covers URL conventions for `/brand/`, `/fonts/`, `/js/`; canonical `<link>`/`<script>`/`<img>` snippets; font preload patterns; cache contract; CORS; license restrictions. |
| `shaughv-design` | Generate well-branded interfaces and assets for the SHAUGHV brand. Ships fonts, favicons, color tokens, type system, component previews, and two UI kits. |
| `shaughv-gcs-storage` | Pre-wired skill for Emmett's personal public bucket at `gs://shaughv`. Bucket facts (uniform IAM, public reads, 7-day soft delete, versioning on, CORS off, US multi-region) baked in so the agent never has to ask. Returns `https://storage.googleapis.com/shaughv/<path>` URLs. Embeds the full cross-platform reference from `gcs-storage` so it stands alone. |

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
