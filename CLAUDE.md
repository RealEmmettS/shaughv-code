# CLAUDE.md — shaughv-code

This is Emmett's personal "skill bundle" Claude Code plugin. The README is for
users installing it; this file is for you, future Claude, when editing it.

## What this repo is

A primarily **skills-only** plugin. The entire purpose is to be a single
editable source of truth for every skill (and the small set of bundled
non-skill components below) that should be available across all of Emmett's
Claude Code instances.

Don't introduce `agents/`, `hooks/`, additional MCP servers, or additional
commands unless Emmett explicitly asks to expand scope.

> Note: that rule is about **bundling those things in the plugin itself**. It is
> NOT violated by a skill that writes hooks into a *target* repo when run — those
> hooks live in whatever repo the skill is run in, never in this plugin, so the
> no-bundled-hooks rule still holds. (The task + workplace-memory system that used
> to demonstrate this — the `tasks-*` skills — now lives in the standalone
> `shaughv-tasks` plugin; see CHANGELOG 0.24.0.)

The bundle is consumable two ways: (1) the Claude Code marketplace install
documented in the README (delivers skills + the bundled MCP + slash command),
and (2) `npx skills add RealEmmettS/shaughv-code` for a skills-only install
in any [skills.sh](https://skills.sh)-supported agent. Both paths read the
same source — the `skills/` directory — so editing a skill propagates to both.

## Bundled non-skill components

Each of these was added by explicit ask — don't remove them without one:

- **`.mcp.json` at repo root** — bundles three MCP servers: the Remotion
  documentation server (`npx @remotion/mcp@latest`, exposing a single
  `remotion-documentation` tool), `craft-docs` (OAuth-gated Streamable HTTP
  link to a Craft Docs page), and `shaughv-health` (OAuth-gated Streamable
  HTTP link to `https://health.emmetts.dev/api/mcp`, Emmett's personal
  health-data MCP, Google-sign-in gated).
- **`commands/create-video.md`** — `/shaughv-code:create-video` slash command
  that scaffolds a Remotion Recorder project via
  `npx create-video@latest --recorder`, then adds `@remotion/web-renderer`
  inside the new project (`npx remotion add @remotion/web-renderer`). Order
  is fixed because `remotion add` has to run from inside an existing project.
- **`build-codex-plugin.ps1` + `plugins/shaughv-code/` + `.codex/config.toml`** —
  the Codex surface. `plugins/shaughv-code/` is a generated, self-contained Codex
  package (a copy of root `skills/` — minus the Claude-only skills in the build
  script's `$ExcludeSkills`, currently `subagent-model-preference` — a wrapped copy
  of `.mcp.json`, and the Codex
  manifest); `build-codex-plugin.ps1` regenerates it from root; `.codex/config.toml`
  is a repo-local MCP fallback. **Never hand-edit `plugins/shaughv-code/`.** See
  `AGENTS.md` for the full Codex story.

## Editing a skill

- Edit `skills/<name>/SKILL.md` directly. No `.skill` zip to rebuild — the old
  zip-bundle workflow was retired.
- After editing root skills (or `.mcp.json` / `.codex-plugin/plugin.json`),
  regenerate the Codex package: `pwsh ./build-codex-plugin.ps1` (verify with
  `-Check`), and commit the regenerated `plugins/shaughv-code/` too.
- CI (`.github/workflows/validate.yml`) re-runs `build-codex-plugin.ps1 -Check`,
  validates every JSON manifest, and checks version lockstep on every PR and push
  to `main` — so a forgotten regeneration or a drifted package can't land on `main`
  unnoticed. CI **validates**; it does not regenerate the package for you.
- Changes propagate to every Claude instance via `/plugin marketplace update`.

## Adding a skill

1. Create `skills/<kebab-name>/SKILL.md` with frontmatter:
   ```
   ---
   name: kebab-name           # MUST match the directory name exactly
   description: <trigger-phrase-rich description>
   ---
   ```
   Keep the `description` under **1024 chars** — Claude Code silently skips a
   skill whose description exceeds the cap (`mistral`, `shaughv-cdn`, and
   `gcs-storage` currently exceed it and should be trimmed).
2. Put supporting docs in `skills/<name>/references/`, code in `examples/`,
   assets in `assets/`.
3. Bump `version` in `.claude-plugin/plugin.json` if it's a substantive change.
   Bump the same version in `.claude-plugin/marketplace.json` and
   `.codex-plugin/plugin.json` so the manifests stay aligned.
4. Regenerate the Codex package: `pwsh ./build-codex-plugin.ps1`.
5. Add a release entry to both changelogs (see the Changelog rule below).

## Changelog rule

This repo maintains two changelogs in parallel:

- `CHANGELOG.md` — the technical changelog. Keep a Changelog format,
  semver. Version numbers, file paths, manifest diffs, and concrete
  details all belong here.
- `HUMAN_CHANGELOG.md` — a plain-English companion for someone who isn't
  reading code. Every release in `CHANGELOG.md` has a corresponding
  section here. No version numbers, no file paths, no jargon — just what
  changed and why it matters.

**Whenever you bump `version` in `.claude-plugin/plugin.json` you MUST
update BOTH changelogs in the same commit.** Translate each technical
entry by stripping versions / paths / function names / metric details /
PR numbers, replacing jargon with everyday words, and adding a one-line
"why it matters" clause where the user-visible effect isn't obvious. Use
the category labels **Added**, **Improved**, **Fixed**, **Removed**,
**Security**, **Behind the scenes**.

If a change is purely internal (refactor, dependency bump, test-only),
still record it in `HUMAN_CHANGELOG.md` under **Behind the scenes** — a
sentence is fine. Skipping entries is not allowed; the two files must
stay in lockstep.

The bundled `human-changelog` skill encodes the full translation rules
and example before/after pairs. Invoke it if you need a refresher on
tone or structure.

## Quirks to leave alone

- The `skills/` directory MUST stay lowercase. Case-only renames on Windows
  need a two-step `mv` (e.g. `mv skills tmp && mv tmp skills`).
- `.gitattributes` pins the Codex package's *generated* `.mcp.json` to LF
  (`.mcp.json text eol=lf`). `build-codex-plugin.ps1 -Check` SHA-compares
  byte-exact and the build writes LF, so `* text=auto` would otherwise check it
  out as CRLF on Windows CI and fail the gate (`hash mismatch: .mcp.json`). Pin
  any new *generated* (not verbatim-copied) package file to LF the same way.

## What not to do

- Don't recreate `.skill` zip bundles — that workflow was deliberately dropped.
- Don't hand-edit `plugins/shaughv-code/` — it's generated. Edit root content and
  re-run `build-codex-plugin.ps1` (the repo's one build step, which only
  regenerates the Codex package; the Claude surface still has no build step).
- Don't write tests. The skills are documentation/prompts; the only "tests" are
  `build-codex-plugin.ps1 -Check` and `claude --plugin-dir <path>` + seeing the
  skill trigger on its phrases.
