# AGENTS.md — shaughv-code

This is Emmett's personal "skill bundle" Codex plugin. The README is for
users installing it; this file is for you, future Codex, when editing it.

## What this repo is

A primarily **skills-only** plugin. The entire purpose is to be a single
editable source of truth for every skill (and the small set of bundled
non-skill components below) that should be available across all of Emmett's
Codex instances.

Don't introduce `agents/`, `hooks/`, additional MCP servers, or additional
commands unless Emmett explicitly asks to expand scope.

The bundle is consumable three ways: (1) the Claude Code marketplace install
documented in the README (delivers skills + the bundled MCP servers + slash
command), (2) the Codex marketplace install documented in the README (skills +
the same bundled MCP servers), and (3) `npx skills add RealEmmettS/shaughv-code`
for a skills-only install in any [skills.sh](https://skills.sh)-supported agent.
Root content — `skills/`, `.mcp.json`, `.codex-plugin/plugin.json` — is the
authoring source of truth; the Codex surface is a generated copy of it (see
"Codex plugin surface").

## Bundled non-skill components

Each of these was added by explicit ask — don't remove them without one:

- **`.mcp.json` at repo root** — bundles the Remotion documentation MCP
  server (`npx @remotion/mcp@latest`). Exposes a single tool,
  `remotion-documentation`, that searches the live Remotion docs.
- **`commands/create-video.md`** — `/shaughv-code:create-video` slash command
  that scaffolds a Remotion Recorder project via
  `npx create-video@latest --recorder`, then adds `@remotion/web-renderer`
  inside the new project (`npx remotion add @remotion/web-renderer`). Order
  is fixed because `remotion add` has to run from inside an existing project.

## Codex plugin surface

Codex installs a marketplace plugin by snapshotting a self-contained plugin
**subdirectory** named by the marketplace entry — it cannot consume this repo's
flat root (which must stay flat for Claude Code). So the Codex surface is a
tracked, generated package, mirroring how the work `theia-tools` plugin does it:

- **`plugins/shaughv-code/`** is the self-contained Codex package — a generated
  copy of root `.codex-plugin/plugin.json`, a wrapped copy of `.mcp.json`, and a
  copy of `skills/`. **Never hand-edit it.** Regenerate from root with
  `pwsh ./build-codex-plugin.ps1` (validate with `-Check`).
- **`.agents/plugins/marketplace.json`** is the Codex marketplace entry. Its
  source is `{ "source": "local", "path": "./plugins/shaughv-code" }` — a
  subdirectory, not the repo root (Codex does not list a plugin whose local
  source path is the marketplace root itself).
- **`.codex-plugin/plugin.json`** is the Codex manifest (source of truth, copied
  verbatim into the package). Keep it lowercase. It points at `./skills/` and
  `./.mcp.json` and carries the MCP servers — the Codex surface is **not**
  skills-only.
- **`.mcp.json`** at root is the bare Claude-plugin shape (`{ "<name>": {…} }`);
  the build script wraps it (`{ "mcpServers": {…} }`) in the package, which is
  the shape Codex expects. Do not change the root file's shape — Claude Code
  needs the bare form.
- **`.codex/config.toml`** is a repo-local MCP fallback (TOML) so Codex sessions
  run *inside this repo* get the servers before the plugin is installed. It is
  hand-maintained (different format from `.mcp.json`) and the build script does
  not touch it; keep the two in sync by hand.
- The Claude marketplace surface remains in `.claude-plugin/`; do not rename or
  remove it when editing the Codex surface.

## Editing a skill

- Edit `skills/<name>/SKILL.md` directly. No `.skill` zip to rebuild — the old
  zip-bundle workflow was retired.
- Regenerate the Codex package after any change to root `skills/`, `.mcp.json`,
  or `.codex-plugin/plugin.json`: `pwsh ./build-codex-plugin.ps1` (verify with
  `-Check`). Commit the regenerated `plugins/shaughv-code/` alongside the root
  change; never hand-edit the package. CI (`.github/workflows/validate.yml`)
  re-runs `build-codex-plugin.ps1 -Check`, validates the JSON manifests, and
  checks version lockstep on every PR and push to `main`, so a forgotten
  regeneration can't reach `main` unnoticed — CI validates, it does not
  regenerate or commit the package itself.
- Changes propagate to Claude Code via `/plugin marketplace update`. Changes
  propagate to Codex via `codex plugin marketplace upgrade shaughv-code` and
  `codex plugin add shaughv-code@shaughv-code` after the commit is pushed.

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
3. Bump `version` in `.codex-plugin/plugin.json` if it's a substantive change.
   Bump the same version in `.claude-plugin/plugin.json` and
   `.claude-plugin/marketplace.json` so the plugin surfaces stay aligned.
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

**Whenever you bump `version` in `.codex-plugin/plugin.json` you MUST
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
- Don't hand-edit `plugins/shaughv-code/` — it's generated. Edit root content
  and re-run `build-codex-plugin.ps1` (the repo's only build step; it just
  regenerates the Codex package from root).
- Don't write tests. The skills are documentation/prompts; the useful checks
  are `build-codex-plugin.ps1 -Check`, plugin manifest validation, Codex
  marketplace discovery, and seeing the skill trigger on its phrases.
