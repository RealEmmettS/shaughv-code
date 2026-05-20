# shaughv-code

Emmett Shaughnessy's personal Claude Code plugin. Bundles every custom SHAUGHV skill into a single, marketplace-installable plugin so every Claude Code instance (and any agent that respects the same layout) picks up updates from one source of truth.

## Install

```text
/plugin marketplace add RealEmmettS/shaughv-code
/plugin install shaughv-code@shaughv-code
```

That's it. All skills below auto-load whenever their description matches the task.

To test locally before publishing:

```bash
claude --plugin-dir C:/Users/hey/git/shaughv-code
```

## Skills bundled

| Skill | Purpose |
|---|---|
| `critical-thinking` | Four critical-thinking frameworks (contemplating, problem-solving, decision-making, design) plus devil's advocacy and a working canvas. |
| `openai-audio` | OpenAI audio stack — Realtime API, transcription, translation, TTS, WebRTC/WebSocket/SIP transports. Includes 13 runnable examples (py/js/ts). |
| `perplexity-search` | Web search and AI-grounded answers via the Perplexity Agent, Search, and Sonar APIs. |
| `pretext` | DOM-free text measurement and line layout using `@chenglou/pretext`. |
| `quiver-ai` | SVG generation and raster→vector via Quiver AI's Arrow model. Reads `$env:QUIVERAI_API_KEY`. |
| `shaughv-animated-brandmark` | Build the SHAUGHV animated brand mark — draws itself path-by-path, then loops between wordmark and icon. |
| `shaughv-design` | Generate well-branded interfaces and assets for the SHAUGHV brand. Ships fonts, favicons, color tokens, type system, component previews, and two UI kits. |

## Repo layout

```
shaughv-code/
├── .claude-plugin/
│   ├── plugin.json          # plugin manifest
│   └── marketplace.json     # marketplace entry (single-plugin marketplace)
└── skills/
    ├── critical-thinking/
    ├── openai-audio/
    ├── perplexity-search/
    ├── pretext/
    ├── quiver-ai/
    ├── shaughv-animated-brandmark/
    └── shaughv-design/
```

Each skill is a plain folder with `SKILL.md` (plus `references/`, `examples/`, `assets/`, etc.). Edit in place — there is no separate build step and no `.skill` zip to keep in sync.

## Updating a skill

1. Edit files under `skills/<name>/`.
2. Commit and push.
3. In any Claude Code instance: `/plugin marketplace update shaughv-code` then reload the plugin (or restart).

## Author

[Emmett Shaughnessy](https://emmetts.dev) · `hey@emmetts.dev` · [@RealEmmettS](https://github.com/RealEmmettS)
