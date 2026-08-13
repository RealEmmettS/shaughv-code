# AGENTS.md — shaughv-code

This is Emmett's personal "skill bundle" Codex plugin. The README is for
users installing it; this file is for you, future Codex, when editing it.

## What this repo is

A **skills-focused** plugin. The entire purpose is to be a single editable source
of truth for every skill (plus the explicitly retained Claude-only slash command)
that should be available across all of Emmett's Codex instances.

Don't introduce top-level plugin agents, hooks, MCP servers, or additional
commands unless Emmett explicitly asks to expand scope.

> Note: that rule is about **bundling those things in the plugin itself**. It is NOT
> violated by a skill that writes hooks into a *target* repo when run — those hooks
> live in whatever repo the skill is run in, never in this plugin. (The task +
> workplace-memory system that used to demonstrate this — the `tasks-*` skills — now
> lives in the standalone `shaughv-tasks` plugin; see CHANGELOG 0.24.0.)

The bundle is consumable three ways: (1) the Claude Code marketplace install
documented in the README (skills + slash command), (2) the Codex marketplace
install documented in the README (skills), and (3)
`npx skills add RealEmmettS/shaughv-code` for a skills-only install in any
[skills.sh](https://skills.sh)-supported agent. Root `skills/`, `assets/`, and
`.codex-plugin/plugin.json` are the Codex authoring sources; the Codex surface is
a generated copy of them (see "Codex plugin surface"). No surface bundles MCP
servers. Optional connection knowledge lives in the `choose-optional-mcps` skill.

## Bundled non-skill components

Each of these was added by explicit ask — don't remove them without one:

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
  copy of root `.codex-plugin/plugin.json`, a verbatim copy of root `assets/`
  (the branding images the manifest's
  `interface.composerIcon` / `logo` / `logoDark` point at — Codex resolves those
  paths against the *package* root, so they have to ship inside it), and a
  copy of `skills/` **minus the Claude-only skills excluded by
  `build-codex-plugin.ps1` (`$ExcludeSkills`)** — currently
  `subagent-model-preference`, whose Opus/Sonnet model-class and `xhigh`/`max`
  effort convention has no valid mapping on Codex/GPT. **Never hand-edit it.**
  Regenerate from root with `pwsh ./build-codex-plugin.ps1` (validate with
  `-Check`). To keep a future Claude-only skill out of the Codex surface, add its
  directory name to `$ExcludeSkills` and regenerate.
- **`.agents/plugins/marketplace.json`** is the Codex marketplace entry. Its
  source is `{ "source": "local", "path": "./plugins/shaughv-code" }` — a
  subdirectory, not the repo root (Codex does not list a plugin whose local
  source path is the marketplace root itself). It also carries a top-level
  `owner` object, added in 1.0.1: Codex ignores it (verified against
  `codex-cli 0.145.0` — the marketplace loaded and listed its plugin normally),
  and it makes the file less likely to hard-fail any other agent that happens to
  scan `.agents/` and expects an owner. Don't "clean it up". Equally, don't try
  to make this file valid as a *Claude* marketplace: `source: "local"` is not a
  Claude source type, and a Claude surface that did load this file would point
  at the Codex package, which has no `.claude-plugin/` and no `commands/`.
  Claude's marketplace is `.claude-plugin/marketplace.json` and only that.
- **`.codex-plugin/plugin.json`** is the Codex manifest (source of truth, copied
  verbatim into the package). Keep it lowercase. It points at `./skills/` and
  intentionally declares no MCP servers.
- The Claude marketplace surface remains in `.claude-plugin/`; do not rename or
  remove it when editing the Codex surface.

## Editing a skill

- Edit `skills/<name>/SKILL.md` directly. No `.skill` zip to rebuild — the old
  zip-bundle workflow was retired.
- Regenerate the Codex package after any change to root `skills/`, `assets/`, or
  `.codex-plugin/plugin.json`: `pwsh ./build-codex-plugin.ps1` (verify with
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
   skill whose description exceeds the cap. All current skills fit; validate
   the limit again whenever a description changes.
2. Put supporting docs in `skills/<name>/references/`, code in `examples/`,
   assets in `assets/`.
3. Bump `version` in `.codex-plugin/plugin.json` if it's a substantive change.
   Bump the same version in `.claude-plugin/plugin.json` and
   `.claude-plugin/marketplace.json` so the plugin surfaces stay aligned.
4. Regenerate the Codex package: `pwsh ./build-codex-plugin.ps1`.
5. Add a release entry to both changelogs, and refresh `CODEX_PROJECT.md`'s
   **Project status** block (see the Changelog rule below).

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
update BOTH changelogs AND `CODEX_PROJECT.md`'s **Project status** block
in the same commit** — its `- **Current release:**` line, plus the
`contains N skill directories and M files` counts if the package changed
(both numbers are printed by `pwsh ./build-codex-plugin.ps1`). CI parses
those exact phrasings and fails the build when they disagree with the
manifests and the generated package, so don't reword them. That file
drifted several releases behind before the check existed. Translate each technical
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
- `.gitattributes` pins copied PNG branding as binary so root/package hash
  comparisons remain byte-stable across platforms. Pin any future copied binary
  type explicitly rather than relying on content sniffing.

## What not to do

- Don't recreate `.skill` zip bundles — that workflow was deliberately dropped.
- Don't hand-edit `plugins/shaughv-code/` — it's generated. Edit root content
  and re-run `build-codex-plugin.ps1` (the repo's only build step; it just
  regenerates the Codex package from root).
- Don't write tests. The skills are documentation/prompts; the useful checks
  are `build-codex-plugin.ps1 -Check`, plugin manifest validation, Codex
  marketplace discovery, and seeing the skill trigger on its phrases.
