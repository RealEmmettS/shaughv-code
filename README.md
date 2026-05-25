# shaughv-code

Emmett Shaughnessy's personal Claude Code plugin. Bundles every custom SHAUGHV skill into a single, marketplace-installable plugin so every Claude Code instance (and any agent that respects the same layout) picks up updates from one source of truth.

## Install

For first-time install — paste these two lines into any Claude Code session:

```text
/plugin marketplace add RealEmmettS/shaughv-code
/plugin install shaughv-code@shaughv-code
```

That's it. All skills below auto-load whenever their description matches the task. The bundled MCP server connects on first use; the bundled slash command is available immediately.

**Optional follow-up:** for the Remotion team's official skill set, run `npx skills add remotion-dev/skills` separately. Those skills aren't bundled here so they stay upstream-controlled.

### Alternative: install skills-only with `npx skills`

If you're using a non-Claude-Code agent (Cursor, OpenCode, Codex, Gemini CLI, and ~50 others), or you only want the skills (not the bundled Remotion docs MCP or `/shaughv-code:create-video` command), install via the [`skills`](https://skills.sh) CLI:

```bash
npx skills add RealEmmettS/shaughv-code
```

Defaults to a project install at `.claude/skills/` (or your agent's equivalent — the CLI auto-detects). Add `-g` for a global install at `~/.claude/skills/`. Update later with `npx skills update`. To get the bundled MCP server and slash command too, use the marketplace flow above instead.

## Update

If you already have it installed and just want to pick up the latest version — paste these two lines into any Claude Code session:

```text
/plugin marketplace update shaughv-code
/reload-plugins
```

If a new component (skill, command, or MCP) doesn't show up after `/reload-plugins`, restart Claude Code — some changes (new MCP servers, new commands) only register on a fresh session.

To develop against a local checkout instead of the published marketplace:

```bash
claude --plugin-dir C:/Users/hey/git/shaughv-code
```

If you originally installed with `npx skills add`, update with `npx skills update` (add `-g` if you installed globally).

## Skills bundled

| Skill | Purpose |
|---|---|
| `critical-thinking` | Four critical-thinking frameworks (contemplating, problem-solving, decision-making, design) plus devil's advocacy and a working canvas. |
| `human-changelog` | Create/update a `HUMAN_CHANGELOG.md` by translating a repo's `CHANGELOG.md` into plain-English entries (no version numbers, no jargon), and wires up the repo's `CLAUDE.md` to keep both files in sync going forward. |
| `naming-conventions` | SHAUGHV + general naming rules for any identifier — variables, files, folders, repos, branches, commits, PRs, columns, flags. Carries Code Complete 2 and DevOps Handbook principles plus SHAUGHV-specific conventions. |
| `openai-audio` | OpenAI audio stack — Realtime API, transcription, translation, TTS, WebRTC/WebSocket/SIP transports. Includes 13 runnable examples (py/js/ts). |
| `perplexity-search` | Web search and AI-grounded answers via the Perplexity Agent, Search, and Sonar APIs. |
| `pretext` | DOM-free text measurement and line layout using `@chenglou/pretext`. |
| `quiver-ai` | SVG generation and raster→vector via Quiver AI's Arrow model. Reads `$env:QUIVERAI_API_KEY`. |
| `shaughv-animated-brandmark` | Build the SHAUGHV animated brand mark — draws itself path-by-path, then loops between wordmark and icon. |
| `shaughv-cdn` | Consumer guide for the `cdn.shaughv.com` private CDN. Covers URL conventions for `/brand/`, `/fonts/`, `/js/`; canonical `<link>`/`<script>`/`<img>` snippets; font preload patterns; cache contract; CORS; license restrictions. |
| `shaughv-design` | Generate well-branded interfaces and assets for the SHAUGHV brand. Ships fonts, favicons, color tokens, type system, component previews, and two UI kits. |

## Commands bundled

| Command | Purpose |
|---|---|
| `/shaughv-code:create-video` | Scaffold a new Remotion Recorder project via `npx create-video@latest --recorder`, then add `@remotion/web-renderer` inside the new project (`npx remotion add @remotion/web-renderer`). Asks for a directory name, then runs both steps non-interactively; falls back to `! npx ...` if either needs a TTY. |

## MCP servers bundled

| Server | Source | Purpose |
|---|---|---|
| `remotion-documentation` | `npx @remotion/mcp@latest` | Searches the live Remotion documentation. Exposes a single tool — `remotion-documentation` — proxied to `mcp.remotion.dev`. |

## Repo layout

```
shaughv-code/
├── .claude-plugin/
│   ├── plugin.json          # plugin manifest
│   └── marketplace.json     # marketplace entry (single-plugin marketplace)
├── .mcp.json                # bundled MCP servers (Remotion docs)
├── commands/
│   └── create-video.md      # /shaughv-code:create-video
└── skills/
    ├── critical-thinking/
    ├── human-changelog/
    ├── naming-conventions/
    ├── openai-audio/
    ├── perplexity-search/
    ├── pretext/
    ├── quiver-ai/
    ├── shaughv-animated-brandmark/
    ├── shaughv-cdn/
    └── shaughv-design/
```

Each skill is a plain folder with `SKILL.md` (plus `references/`, `examples/`, `assets/`, etc.). Edit in place — there is no separate build step and no `.skill` zip to keep in sync.

## Editing a skill (maintainer workflow)

For consumers: see [Update](#update) above — you don't need this section.

For Emmett / anyone editing the plugin's source:

1. Edit files under `skills/<name>/`.
2. Commit and push.
3. In any Claude Code instance: `/plugin marketplace update shaughv-code` then `/reload-plugins` (or restart).

## Author

[Emmett Shaughnessy](https://emmetts.dev) · `hey@emmetts.dev` · [@RealEmmettS](https://github.com/RealEmmettS)
