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
documented in the README (delivers skills + the bundled MCP + slash command),
(2) the Codex marketplace install documented in the README (skills-only for
now), and (3) `npx skills add RealEmmettS/shaughv-code` for a skills-only
install in any [skills.sh](https://skills.sh)-supported agent. All paths read
the same source — the `skills/` directory — so editing a skill propagates to
each surface.

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

- **`.codex-plugin/plugin.json`** is the Codex manifest. Keep it lowercase.
- **`.agents/plugins/marketplace.json`** is the Codex marketplace entry. It
  points `shaughv-code` at this Git repo with a URL source descriptor because
  Codex does not list plugins whose local source path is the marketplace root.
- The Codex manifest is intentionally skills-only. Do not add `mcpServers`
  there unless `.mcp.json` is first converted or mirrored into the Codex
  `mcpServers` wrapper shape and validated.
- The Claude marketplace surface remains in `.claude-plugin/`; do not rename
  or remove it when editing the Codex surface.

## Editing a skill

- Edit `skills/<name>/SKILL.md` directly. No build step, no `.skill` zip to
  rebuild — the old zip-bundle workflow was retired.
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
2. Put supporting docs in `skills/<name>/references/`, code in `examples/`,
   assets in `assets/`.
3. Bump `version` in `.codex-plugin/plugin.json` if it's a substantive change.
   Bump the same version in `.claude-plugin/plugin.json` and
   `.claude-plugin/marketplace.json` so the plugin surfaces stay aligned.
4. Add a release entry to both changelogs (see the Changelog rule below).

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

## What not to do

- Don't recreate `.skill` zip bundles — that workflow was deliberately dropped.
- Don't add a build script. There's nothing to build.
- Don't write tests. The skills are documentation/prompts; the useful checks
  are plugin manifest validation, Codex marketplace discovery, and seeing the
  skill trigger on its phrases in a fresh thread.
