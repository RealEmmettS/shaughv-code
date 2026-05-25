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

The bundle is consumable two ways: (1) the Claude Code marketplace install
documented in the README (delivers skills + the bundled MCP + slash command),
and (2) `npx skills add RealEmmettS/shaughv-code` for a skills-only install
in any [skills.sh](https://skills.sh)-supported agent. Both paths read the
same source — the `skills/` directory — so editing a skill propagates to both.

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

## Editing a skill

- Edit `skills/<name>/SKILL.md` directly. No build step, no `.skill` zip to
  rebuild — the old zip-bundle workflow was retired.
- Changes propagate to every Claude instance via `/plugin marketplace update`.

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
3. Bump `version` in `.claude-plugin/plugin.json` if it's a substantive change.

## Quirks to leave alone

- The `skills/` directory MUST stay lowercase. Case-only renames on Windows
  need a two-step `mv` (e.g. `mv skills tmp && mv tmp skills`).

## What not to do

- Don't recreate `.skill` zip bundles — that workflow was deliberately dropped.
- Don't add a build script. There's nothing to build.
- Don't write tests. The skills are documentation/prompts; the only "test" is
  `claude --plugin-dir <path>` and seeing the skill trigger on its phrases.
