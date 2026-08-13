# CODEX_PROJECT.md — shaughv-code

## TL;DR

`shaughv-code` is Emmett Shaughnessy's personal cross-agent skill bundle. The
repository root is the authoring source for Claude Code and skills.sh-compatible
agents; `plugins/shaughv-code/` is a generated, self-contained Codex package.
Release 1.3.0 removes automatic MCP registration from every plugin surface and
adds advisory connection guidance for Remotion documentation, Shaughv Health,
and Pipedream when a task actually needs one.

## Project status

> The three numbers below are enforced by CI (`.github/workflows/validate.yml`),
> which fails the build if this file's stated release or package counts disagree
> with the manifests and the generated package. Update them in the same commit as
> any version bump; see the release workflow below.

- **Current release:** 1.3.0 (13 August 2026).
- **Default branch:** `main`.
- **Repository:** `RealEmmettS/shaughv-code`.
- **Primary purpose:** Maintain one editable source of truth for Emmett's
  reusable skills and the explicitly approved Claude-only slash command.
- **Current state:** Claude and Codex plugin manifests are version-aligned; the
  generated Codex package contains 32 skill directories and 472 files.
- **Validation:** `pwsh ./build-codex-plugin.ps1 -Check` rebuilds into a
  temporary directory, compares file hashes, checks manifest version lockstep,
  and enforces the Windows clone-path ceiling.
- **Application build:** None. Skills are prompt/documentation packages; the
  PowerShell generator is the only repository build step.

## Goals

1. Keep all personal skills portable across Claude Code, Codex, and
   skills.sh-compatible agents.
2. Preserve the flat repository root required by Claude Code while publishing a
   self-contained generated subdirectory for Codex marketplace snapshots.
3. Keep Claude, Codex, marketplace, README, maintainer guidance, and both
   changelogs aligned for every substantive release.
4. Bundle only non-skill components Emmett explicitly requests.
5. Prefer a disciplined Git workflow while honoring clear owner control:
   delivery-route overrides are easy, quality checks remain the default.

## Distribution architecture

| Consumer | Source | Contents |
|---|---|---|
| Claude Code marketplace | Repository root | Root skills and `commands/create-video.md`; no MCP registrations |
| Codex marketplace | `plugins/shaughv-code/` | Generated manifest, root assets, and root skills except explicit Claude-only exclusions; no MCP registrations |
| skills.sh-compatible agents | Root `skills/` | Skills only; no MCP registrations or slash command |

The plugin intentionally carries no `.mcp.json`, no manifest `mcpServers` field,
and no repo-local MCP fallback. `choose-optional-mcps` preserves connection facts
and setup examples as advisory context without registering, authenticating, or
loading a server. Never hand-edit the generated package.

Root `assets/` holds the plugin's branding images. `.codex-plugin/plugin.json`
references them as `interface.composerIcon` / `logo` / `logoDark`, and Codex
resolves those paths against the *package* root — so the generator copies
`assets/` into `plugins/shaughv-code/` and Codex plugin validation fails with
"points to a missing file" if it does not. Claude Code does not scan `assets/`.

## Optional MCP catalog

| Name | Transport/source | Advisory use |
|---|---|---|
| `remotion-documentation` | stdio via `npx @remotion/mcp@latest` | Live Remotion documentation |
| `shaughv-health` | Streamable HTTP | Google-sign-in-gated personal health service |
| `pipedream` | Streamable HTTP at `https://mcp.pipedream.net/v2` | OAuth on first use; user selects and authorizes apps |

These are catalog entries inside `choose-optional-mcps`, not plugin components.
The skill checks for an existing client connector or standalone MCP first and asks
the operator before any configuration or authentication change.

## Release workflow

1. Edit root authoring sources.
2. Bump the same version in **exactly two** manifests: `.claude-plugin/plugin.json`
   and `.codex-plugin/plugin.json`. Do **not** add a `version` to
   `.claude-plugin/marketplace.json` — Claude Code always prefers the one in
   `plugin.json`, so a second copy can only drift, and CI fails if one appears.
3. Update `CHANGELOG.md` and `HUMAN_CHANGELOG.md` in lockstep.
4. Update this file's **Project status** block — the release number and, if the
   package contents changed, the skill-directory and file counts printed by
   `pwsh ./build-codex-plugin.ps1`. CI enforces all three.
5. Regenerate with `pwsh ./build-codex-plugin.ps1`.
6. Validate JSON, skill metadata, scripts, the generated package, secrets, and
   any repository-applicable local checks.
7. Commit and deliver through the preferred PR workflow, or use an explicitly
   owner-approved direct default-branch route without skipping quality checks.
8. Verify the exact pushed commit and its GitHub Actions run.

## Key constraints

- Do not add top-level plugin agents, hooks, commands, or MCP servers unless Emmett
  explicitly expands scope.
- Do not hand-edit `plugins/shaughv-code/`.
- Keep `skills/` lowercase.
- Keep Claude-only skills in root but list them in `$ExcludeSkills` so the
  Codex package omits them.
- Treat a direct-push approval as a route decision, not permission to skip
  testing, validation, secret scanning, or post-push CI.

## Complete workspace tree

This tree lists every **Git-tracked** file (`git ls-files`), which is what any
consumer actually receives on clone. Untracked and ignored working-directory
content — `.git/`, `zipped-skills/`, editor scratch — is deliberately excluded.
The generated Codex package is included in full.

Regenerate rather than hand-editing; hand edits drift immediately. Indentation is
plain ASCII spaces (an earlier revision of this block carried non-breaking spaces
in the indent runs, which broke copy-paste).

```text
.
├── .agents
│   └── plugins
│       └── marketplace.json
├── .claude-plugin
│   ├── marketplace.json
│   └── plugin.json
├── .codex-plugin
│   └── plugin.json
├── .gitattributes
├── .github
│   └── workflows
│       └── validate.yml
├── .gitignore
├── AGENTS.md
├── CHANGELOG.md
├── CLAUDE.md
├── CODEX_PROJECT.md
├── HUMAN_CHANGELOG.md
├── README.md
├── assets
│   ├── shaughv-icon-dark.png
│   └── shaughv-icon-light.png
├── build-codex-plugin.ps1
├── commands
│   └── create-video.md
├── plugins
│   └── shaughv-code
│       ├── .codex-plugin
│       │   └── plugin.json
│       ├── assets
│       │   ├── shaughv-icon-dark.png
│       │   └── shaughv-icon-light.png
│       └── skills
│           ├── agentic-prompt-engineering
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── evaluation.md
│           │       ├── long-horizon-control.md
│           │       ├── math-science-adapter.md
│           │       ├── model-overlays.md
│           │       ├── prompt-construction.md
│           │       ├── software-data-adapter.md
│           │       └── task-contract.md
│           ├── bug-triage
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── bug-report-template.md
│           │       └── investigation-playbook.md
│           ├── choose-optional-mcps
│           │   ├── SKILL.md
│           │   ├── agents
│           │   │   └── openai.yaml
│           │   └── references
│           │       └── connections.md
│           ├── code-design-patterns
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── INDEX.md
│           │       ├── _template.md
│           │       ├── anti-patterns.md
│           │       ├── behavioral
│           │       │   ├── chain-of-responsibility.md
│           │       │   ├── command.md
│           │       │   ├── iterator.md
│           │       │   ├── mediator.md
│           │       │   ├── memento.md
│           │       │   ├── observer.md
│           │       │   ├── state.md
│           │       │   ├── strategy.md
│           │       │   ├── template-method.md
│           │       │   └── visitor.md
│           │       ├── creational
│           │       │   ├── abstract-factory.md
│           │       │   ├── builder.md
│           │       │   ├── factory-method.md
│           │       │   ├── prototype.md
│           │       │   └── singleton.md
│           │       ├── pattern-relationships.md
│           │       ├── recognition.md
│           │       ├── recommendations.md
│           │       ├── solid-principles.md
│           │       └── structural
│           │           ├── adapter.md
│           │           ├── bridge.md
│           │           ├── composite.md
│           │           ├── decorator.md
│           │           ├── facade.md
│           │           ├── flyweight.md
│           │           └── proxy.md
│           ├── critical-thinking
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── cognitive-scaffolds.md
│           │       ├── contemplating.md
│           │       ├── cross-cutting-disciplines.md
│           │       ├── decision-making.md
│           │       ├── design.md
│           │       ├── devils-advocacy.md
│           │       ├── problem-solving.md
│           │       ├── scientific-inquiry.md
│           │       ├── sensemaking.md
│           │       ├── strategic
│           │       │   ├── annexes
│           │       │   │   ├── 36-stratagems-full.md
│           │       │   │   ├── 5-rings-full.md
│           │       │   │   └── art-of-war-full.md
│           │       │   ├── art-of-war.md
│           │       │   ├── book-of-five-rings.md
│           │       │   ├── game-theory-and-mental-levels.md
│           │       │   └── thirty-six-stratagems.md
│           │       ├── strategic.md
│           │       ├── visual-models
│           │       │   ├── causality.md
│           │       │   ├── comparison.md
│           │       │   ├── html
│           │       │   │   ├── 01-pros-cons-fixes.html
│           │       │   │   ├── 02-sorting-timeline.html
│           │       │   │   ├── 03-causal-flow.html
│           │       │   │   ├── 04-matrix-2x2.html
│           │       │   │   ├── 05-decision-tree.html
│           │       │   │   ├── 06-weighted-ranking.html
│           │       │   │   ├── 07-hypothesis-testing.html
│           │       │   │   ├── 08-devils-advocacy.html
│           │       │   │   ├── 09-probability-tree.html
│           │       │   │   ├── 10-utility-tree.html
│           │       │   │   ├── 11-utility-matrix.html
│           │       │   │   ├── 12-advanced-utility.html
│           │       │   │   ├── 13-triage-card.html
│           │       │   │   └── README.md
│           │       │   ├── interactive.md
│           │       │   ├── probability.md
│           │       │   └── structure.md
│           │       └── working-canvas.md
│           ├── crystal-upscaler
│           │   ├── SKILL.md
│           │   ├── references
│           │   │   └── api-reference.md
│           │   └── scripts
│           │       ├── fit.py
│           │       ├── requirements.txt
│           │       └── upscale.py
│           ├── debugging-framework
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── agent-assisted-debugging.md
│           │       ├── anti-patterns.md
│           │       ├── bug-shapes.md
│           │       ├── lightweight-triage.md
│           │       ├── scientific-method.md
│           │       └── worked-examples.md
│           ├── defensive-programming
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── anti-patterns.md
│           │       ├── by-stack-layer.md
│           │       ├── checklist.md
│           │       └── examples.md
│           ├── gcs-storage
│           │   └── SKILL.md
│           ├── git-workflow
│           │   ├── SKILL.md
│           │   ├── branch-age.sh
│           │   ├── branch-naming.md
│           │   ├── check-branch.sh
│           │   ├── conflict-resolution.md
│           │   ├── feature-flags.md
│           │   ├── multi-agent.md
│           │   ├── policy-violations.md
│           │   ├── pr-template.md
│           │   ├── pre-pr-gates.md
│           │   ├── references
│           │   │   ├── branch-naming.md
│           │   │   ├── conflict-resolution.md
│           │   │   ├── feature-flags.md
│           │   │   ├── policy-violations.md
│           │   │   ├── pr-template.md
│           │   │   └── pre-pr-gates.md
│           │   ├── scripts
│           │   │   ├── branch-age.sh
│           │   │   ├── check-branch.sh
│           │   │   └── secret-scan.sh
│           │   ├── secret-scan.sh
│           │   ├── workbranch-status.sh
│           │   ├── workbranches.md
│           │   ├── worktree-add.sh
│           │   ├── worktree-list.sh
│           │   └── worktrees.md
│           ├── handoff
│           │   └── SKILL.md
│           ├── human-changelog
│           │   ├── SKILL.md
│           │   └── references
│           │       └── translation-examples.md
│           ├── image-gen
│           │   ├── SKILL.md
│           │   ├── references
│           │   │   ├── mai-image.md
│           │   │   ├── nano-banana.md
│           │   │   └── reve.md
│           │   └── scripts
│           │       └── generate.py
│           ├── iterative-plan
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── agile-patterns.md
│           │       ├── anti-patterns.md
│           │       ├── retro-feedback.md
│           │       └── standing-checks.md
│           ├── learn
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── chunk-types.md
│           │       ├── encoding-hierarchy.md
│           │       ├── feedback-types.md
│           │       ├── kickoff-session.md
│           │       ├── learning-journal.md
│           │       ├── learning-loop-session.md
│           │       ├── proficiency-levels.md
│           │       └── weekly-review-session.md
│           ├── logical-reasoning
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── argument-analysis.md
│           │       ├── categorical-logic.md
│           │       ├── deductive-predicate.md
│           │       ├── deductive-propositional.md
│           │       ├── definition-and-classification.md
│           │       ├── explanation.md
│           │       ├── fallacies.md
│           │       ├── inductive-and-statistical.md
│           │       ├── modal-and-advanced.md
│           │       └── notation-and-symbolization.md
│           ├── loop-escape
│           │   ├── SKILL.md
│           │   └── references
│           │       └── convergence-checkpoint.md
│           ├── mistral
│           │   ├── SKILL.md
│           │   ├── references
│           │   │   ├── agents.md
│           │   │   ├── audio-speech.md
│           │   │   ├── audio-transcriptions.md
│           │   │   ├── authentication.md
│           │   │   ├── batch.md
│           │   │   ├── chat.md
│           │   │   ├── classifiers.md
│           │   │   ├── files.md
│           │   │   ├── fine-tuning.md
│           │   │   ├── models.md
│           │   │   ├── more-endpoints.md
│           │   │   ├── ocr.md
│           │   │   ├── openapi.yaml
│           │   │   └── text-and-embeddings.md
│           │   └── scripts
│           │       ├── _client.py
│           │       ├── mistral_key.py
│           │       ├── mistral_ocr.py
│           │       ├── mistral_speech.py
│           │       ├── mistral_transcribe.py
│           │       └── requirements.txt
│           ├── naming-conventions
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── code-identifiers.md
│           │       ├── files-and-folders.md
│           │       ├── git-branches-commits.md
│           │       ├── naming-audit.md
│           │       └── rationale.md
│           ├── openai-audio
│           │   ├── README.md
│           │   ├── SKILL.md
│           │   ├── examples
│           │   │   ├── README.md
│           │   │   ├── agents-sdk-browser
│           │   │   │   ├── index.html
│           │   │   │   └── server.js
│           │   │   ├── audio_samples
│           │   │   │   ├── REGENERATE.md
│           │   │   │   ├── sample-en.wav
│           │   │   │   └── sample-es.wav
│           │   │   ├── ephemeral-token-server
│           │   │   │   ├── server.js
│           │   │   │   ├── server.py
│           │   │   │   └── server.ts
│           │   │   ├── prompt-templates
│           │   │   │   ├── transcription-domain-keywords.md
│           │   │   │   ├── translation-listen-along.md
│           │   │   │   ├── voice-agent-support.md
│           │   │   │   └── voice-agent-tutor.md
│           │   │   ├── sideband-server-control.js
│           │   │   ├── sideband-server-control.ts
│           │   │   ├── sip-webhook-handler.py
│           │   │   ├── transcription-file-fallback.py
│           │   │   ├── transcription-session.py
│           │   │   ├── transcription-session.ts
│           │   │   ├── translation-session.js
│           │   │   ├── translation-session.py
│           │   │   ├── translation-session.ts
│           │   │   ├── tts-streaming.js
│           │   │   ├── tts-streaming.py
│           │   │   ├── tts-streaming.ts
│           │   │   ├── webrtc-browser-voice-agent
│           │   │   │   ├── index.html
│           │   │   │   ├── server.js
│           │   │   │   └── server.ts
│           │   │   ├── websocket-voice-agent.js
│           │   │   ├── websocket-voice-agent.py
│           │   │   └── websocket-voice-agent.ts
│           │   └── references
│           │       ├── 01-choosing-a-path.md
│           │       ├── 02-voice-agents.md
│           │       ├── 03-transcription.md
│           │       ├── 04-translation.md
│           │       ├── 05-text-to-speech.md
│           │       ├── 06-transport-webrtc.md
│           │       ├── 07-transport-websocket.md
│           │       ├── 08-transport-sip.md
│           │       ├── 09-conversation-lifecycle.md
│           │       ├── 10-prompting-realtime-2.md
│           │       ├── 11-prompting-realtime-1.5.md
│           │       ├── 12-tools-and-mcp.md
│           │       ├── 13-server-side-controls.md
│           │       ├── 14-costs-and-rate-limits.md
│           │       ├── 15-chat-completions-audio.md
│           │       ├── 16-custom-voices.md
│           │       ├── 17-beta-to-ga-migration.md
│           │       ├── 18-evals-and-testing.md
│           │       ├── 19-use-cases.md
│           │       └── 20-official-openai-skills.md
│           ├── personal-productivity
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── deep-work.md
│           │       ├── finitude.md
│           │       ├── focus-funnel.md
│           │       └── slow-productivity.md
│           ├── pretext
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── api-reference.md
│           │       ├── demos-guide.md
│           │       ├── gotchas-and-debugging.md
│           │       ├── react-patterns.md
│           │       └── setup-guide.md
│           ├── quiver-ai
│           │   ├── SKILL.md
│           │   └── references
│           │       └── api-reference.md
│           ├── security-check
│           │   ├── SKILL.md
│           │   ├── references
│           │   │   ├── data-security.md
│           │   │   ├── impact-assessment.md
│           │   │   ├── playbook-audit.md
│           │   │   ├── playbook-diff-review.md
│           │   │   ├── playbook-redteam.md
│           │   │   ├── severity-and-triage.md
│           │   │   ├── stack-auth-entra.md
│           │   │   ├── stack-azure-functions-ts.md
│           │   │   ├── stack-azure-platform.md
│           │   │   ├── stack-azure-sql.md
│           │   │   ├── stack-llm-mcp.md
│           │   │   ├── stack-python-fastapi.md
│           │   │   ├── stack-react-spa.md
│           │   │   ├── stack-rust.md
│           │   │   └── stack-supply-chain.md
│           │   └── scripts
│           │       ├── impact_stats.py
│           │       └── secret_scan.py
│           ├── shaughv-animated-brandmark
│           │   ├── SKILL.md
│           │   └── references
│           │       └── implementation.md
│           ├── shaughv-cdn
│           │   └── SKILL.md
│           ├── shaughv-design
│           │   ├── BRANDMARK.md
│           │   ├── README.md
│           │   ├── SKILL.md
│           │   ├── assets
│           │   │   ├── AnimatedBrandMark.jsx
│           │   │   ├── SHAUGHV-Favicon-Dark-Alt.svg
│           │   │   ├── SHAUGHV-Favicon-Dark.svg
│           │   │   ├── SHAUGHV-Favicon-Light-Alt.svg
│           │   │   ├── SHAUGHV-Favicon-Light.svg
│           │   │   ├── SHAUGHV-Green.png
│           │   │   ├── SHAUGHV-Official.svg
│           │   │   ├── SHAUGHV-Orange.png
│           │   │   ├── animated-brand-mark.js
│           │   │   ├── figurines
│           │   │   │   ├── figurine-404.svg
│           │   │   │   ├── figurine-404.webp
│           │   │   │   ├── figurine-footer.webp
│           │   │   │   ├── figurine-header.svg
│           │   │   │   ├── figurine-header.webp
│           │   │   │   ├── figurine-look-at-this.webp
│           │   │   │   ├── figurine-mail.webp
│           │   │   │   └── transparent
│           │   │   │       ├── figurine-404.webp
│           │   │   │       ├── figurine-footer.webp
│           │   │   │       ├── figurine-header.webp
│           │   │   │       ├── figurine-look-at-this.webp
│           │   │   │       └── figurine-mail.webp
│           │   │   └── shaughv-loader.js
│           │   ├── colors_and_type.css
│           │   ├── fonts
│           │   │   ├── Gail-Rock-Bold.woff2
│           │   │   ├── Gail-Rock-Extralight.woff2
│           │   │   ├── Gail-Rock-Light.woff2
│           │   │   ├── Gail-Rock-Medium.woff2
│           │   │   ├── Gail-Rock-Regular.woff2
│           │   │   ├── Gail-Rock-Semibold.woff2
│           │   │   ├── Gail-Rock-Thin.woff2
│           │   │   ├── Makira-Black.woff2
│           │   │   ├── Makira-Bold.woff2
│           │   │   ├── Makira-ExtraBold.woff2
│           │   │   ├── Makira-Medium.woff2
│           │   │   ├── Makira-Regular.woff2
│           │   │   └── Makira-SemiBold.woff2
│           │   ├── preview
│           │   │   ├── _card-base.css
│           │   │   ├── brand-animated-mark.html
│           │   │   ├── brand-cursor.html
│           │   │   ├── brand-dot-matrix.html
│           │   │   ├── brand-favicons.html
│           │   │   ├── brand-figurines.html
│           │   │   ├── brand-loader.html
│           │   │   ├── brand-lockup.html
│           │   │   ├── colors-bamboo.html
│           │   │   ├── colors-bauhaus.html
│           │   │   ├── colors-cream.html
│           │   │   ├── colors-olive.html
│           │   │   ├── colors-sage.html
│           │   │   ├── colors-semantic.html
│           │   │   ├── components-bauhaus.html
│           │   │   ├── components-buttons.html
│           │   │   ├── components-chips.html
│           │   │   ├── components-fields.html
│           │   │   ├── components-project-row.html
│           │   │   ├── components-work-tile.html
│           │   │   ├── spacing-elevation.html
│           │   │   ├── spacing-radii.html
│           │   │   ├── spacing-scale.html
│           │   │   ├── spacing-section.html
│           │   │   ├── type-body.html
│           │   │   ├── type-display.html
│           │   │   ├── type-eyebrow.html
│           │   │   ├── type-heading.html
│           │   │   └── type-mono.html
│           │   ├── ui_kits
│           │   │   ├── personal_site
│           │   │   │   ├── About.jsx
│           │   │   │   ├── Contact.jsx
│           │   │   │   ├── DotMatrix.jsx
│           │   │   │   ├── Footer.jsx
│           │   │   │   ├── Hero.jsx
│           │   │   │   ├── Navbar.jsx
│           │   │   │   ├── Projects.jsx
│           │   │   │   ├── README.md
│           │   │   │   ├── Skills.jsx
│           │   │   │   ├── WorkTile.jsx
│           │   │   │   ├── Works.jsx
│           │   │   │   ├── data.js
│           │   │   │   └── index.html
│           │   │   └── vintage_site
│           │   │       ├── AboutSection.jsx
│           │   │       ├── BauhausPrimitives.jsx
│           │   │       ├── ContactSection.jsx
│           │   │       ├── FooterSection.jsx
│           │   │       ├── HeroSection.jsx
│           │   │       ├── Navigation.jsx
│           │   │       ├── ProjectsSection.jsx
│           │   │       ├── README.md
│           │   │       ├── SkillsSection.jsx
│           │   │       └── index.html
│           │   └── uploads
│           │       ├── IBMPlexMono-Bold-00f39625.woff2
│           │       ├── IBMPlexMono-Bold-7631bb97.woff
│           │       ├── IBMPlexMono-Bold.woff
│           │       ├── IBMPlexMono-Bold.woff2
│           │       ├── IBMPlexMono-BoldItalic-9d07b353.woff2
│           │       ├── IBMPlexMono-BoldItalic-f2f7af62.woff
│           │       ├── IBMPlexMono-BoldItalic.woff
│           │       ├── IBMPlexMono-BoldItalic.woff2
│           │       ├── IBMPlexMono-ExtraLight-1f8e21d5.woff
│           │       ├── IBMPlexMono-ExtraLight-e5efad45.woff2
│           │       ├── IBMPlexMono-ExtraLight.woff
│           │       ├── IBMPlexMono-ExtraLight.woff2
│           │       ├── IBMPlexMono-ExtraLightItalic-72240cf7.woff2
│           │       ├── IBMPlexMono-ExtraLightItalic-d70c25fe.woff
│           │       ├── IBMPlexMono-ExtraLightItalic.woff
│           │       ├── IBMPlexMono-ExtraLightItalic.woff2
│           │       ├── IBMPlexMono-Italic-1843c0dc.woff
│           │       ├── IBMPlexMono-Italic-aafe9077.woff2
│           │       ├── IBMPlexMono-Italic.woff
│           │       ├── IBMPlexMono-Italic.woff2
│           │       ├── IBMPlexMono-Light-1b891bd6.woff2
│           │       ├── IBMPlexMono-Light-eb1fccac.woff
│           │       ├── IBMPlexMono-Light.woff
│           │       ├── IBMPlexMono-Light.woff2
│           │       ├── IBMPlexMono-LightItalic-b0dfe403.woff2
│           │       ├── IBMPlexMono-LightItalic-bd04b7c0.woff
│           │       ├── IBMPlexMono-LightItalic.woff
│           │       ├── IBMPlexMono-LightItalic.woff2
│           │       ├── IBMPlexMono-Medium-ad59ae21.woff2
│           │       ├── IBMPlexMono-Medium-f1b29d16.woff
│           │       ├── IBMPlexMono-Medium.woff
│           │       ├── IBMPlexMono-Medium.woff2
│           │       ├── IBMPlexMono-MediumItalic-723b6432.woff
│           │       ├── IBMPlexMono-MediumItalic-e53906ea.woff2
│           │       ├── IBMPlexMono-MediumItalic.woff
│           │       ├── IBMPlexMono-MediumItalic.woff2
│           │       ├── IBMPlexMono-Regular-0af5656d.woff2
│           │       ├── IBMPlexMono-Regular-134dcad4.woff
│           │       ├── IBMPlexMono-Regular.woff
│           │       ├── IBMPlexMono-Regular.woff2
│           │       ├── IBMPlexMono-SemiBold-3b6fcb91.woff
│           │       ├── IBMPlexMono-SemiBold-a7cc7bc1.woff2
│           │       ├── IBMPlexMono-SemiBold.woff
│           │       ├── IBMPlexMono-SemiBold.woff2
│           │       ├── IBMPlexMono-SemiBoldItalic-86ffa47b.woff
│           │       ├── IBMPlexMono-SemiBoldItalic-c3622eb4.woff2
│           │       ├── IBMPlexMono-SemiBoldItalic.woff
│           │       ├── IBMPlexMono-SemiBoldItalic.woff2
│           │       ├── IBMPlexMono-Thin-183c7b9c.woff
│           │       ├── IBMPlexMono-Thin-72ad3a05.woff2
│           │       ├── IBMPlexMono-Thin.woff
│           │       ├── IBMPlexMono-Thin.woff2
│           │       ├── IBMPlexMono-ThinItalic-3f0645c4.woff2
│           │       ├── IBMPlexMono-ThinItalic-f62a3613.woff
│           │       ├── IBMPlexMono-ThinItalic.woff
│           │       ├── IBMPlexMono-ThinItalic.woff2
│           │       ├── Makira-Black.woff
│           │       ├── Makira-Black.woff2
│           │       ├── Makira-Bold.woff
│           │       ├── Makira-Bold.woff2
│           │       ├── Makira-ExtraBold.woff
│           │       ├── Makira-ExtraBold.woff2
│           │       ├── Makira-Medium.woff
│           │       ├── Makira-Medium.woff2
│           │       ├── Makira-Regular.woff
│           │       ├── Makira-Regular.woff2
│           │       ├── Makira-SemiBold.woff
│           │       ├── Makira-SemiBold.woff2
│           │       ├── SHAUGHV AWS Logo List.md
│           │       ├── SHAUGHV-Favicon-Dark-Alt.svg
│           │       ├── SHAUGHV-Favicon-Dark.svg
│           │       ├── SHAUGHV-Favicon-Light-Alt.svg
│           │       ├── SHAUGHV-Favicon-Light.svg
│           │       ├── SHAUGHV-Green.png
│           │       ├── SHAUGHV-Official-63b30679.svg
│           │       ├── SHAUGHV-Official.svg
│           │       ├── SHAUGHV-Orange.png
│           │       ├── Unbounded-Blond.woff2
│           │       ├── figurine_404.svg
│           │       ├── figurine_header-857c9e16.svg
│           │       └── figurine_header.svg
│           ├── shaughv-gcs-storage
│           │   └── SKILL.md
│           ├── ttdr
│           │   ├── SKILL.md
│           │   └── references
│           │       └── examples.md
│           ├── usage-statusline
│           │   ├── SKILL.md
│           │   ├── references
│           │   │   └── build-guide.md
│           │   └── scripts
│           │       ├── install.mjs
│           │       └── statusline-usage.mjs
│           ├── wb300
│           │   ├── SKILL.md
│           │   └── references
│           │       ├── agent-json.md
│           │       ├── install.md
│           │       └── tui.md
│           └── workflow-optimization
│               ├── SKILL.md
│               └── references
│                   ├── business-process-reengineering.md
│                   ├── checklists.md
│                   ├── core-principles.md
│                   ├── diagramming.md
│                   ├── lean.md
│                   ├── meta-workflow-checklist.md
│                   ├── prioritization.md
│                   ├── process-optimization.md
│                   ├── six-sigma.md
│                   ├── theory-of-constraints.md
│                   └── total-quality-management.md
└── skills
    ├── agentic-prompt-engineering
    │   ├── SKILL.md
    │   └── references
    │       ├── evaluation.md
    │       ├── long-horizon-control.md
    │       ├── math-science-adapter.md
    │       ├── model-overlays.md
    │       ├── prompt-construction.md
    │       ├── software-data-adapter.md
    │       └── task-contract.md
    ├── bug-triage
    │   ├── SKILL.md
    │   └── references
    │       ├── bug-report-template.md
    │       └── investigation-playbook.md
    ├── choose-optional-mcps
    │   ├── SKILL.md
    │   ├── agents
    │   │   └── openai.yaml
    │   └── references
    │       └── connections.md
    ├── code-design-patterns
    │   ├── SKILL.md
    │   └── references
    │       ├── INDEX.md
    │       ├── _template.md
    │       ├── anti-patterns.md
    │       ├── behavioral
    │       │   ├── chain-of-responsibility.md
    │       │   ├── command.md
    │       │   ├── iterator.md
    │       │   ├── mediator.md
    │       │   ├── memento.md
    │       │   ├── observer.md
    │       │   ├── state.md
    │       │   ├── strategy.md
    │       │   ├── template-method.md
    │       │   └── visitor.md
    │       ├── creational
    │       │   ├── abstract-factory.md
    │       │   ├── builder.md
    │       │   ├── factory-method.md
    │       │   ├── prototype.md
    │       │   └── singleton.md
    │       ├── pattern-relationships.md
    │       ├── recognition.md
    │       ├── recommendations.md
    │       ├── solid-principles.md
    │       └── structural
    │           ├── adapter.md
    │           ├── bridge.md
    │           ├── composite.md
    │           ├── decorator.md
    │           ├── facade.md
    │           ├── flyweight.md
    │           └── proxy.md
    ├── critical-thinking
    │   ├── SKILL.md
    │   └── references
    │       ├── cognitive-scaffolds.md
    │       ├── contemplating.md
    │       ├── cross-cutting-disciplines.md
    │       ├── decision-making.md
    │       ├── design.md
    │       ├── devils-advocacy.md
    │       ├── problem-solving.md
    │       ├── scientific-inquiry.md
    │       ├── sensemaking.md
    │       ├── strategic
    │       │   ├── annexes
    │       │   │   ├── 36-stratagems-full.md
    │       │   │   ├── 5-rings-full.md
    │       │   │   └── art-of-war-full.md
    │       │   ├── art-of-war.md
    │       │   ├── book-of-five-rings.md
    │       │   ├── game-theory-and-mental-levels.md
    │       │   └── thirty-six-stratagems.md
    │       ├── strategic.md
    │       ├── visual-models
    │       │   ├── causality.md
    │       │   ├── comparison.md
    │       │   ├── html
    │       │   │   ├── 01-pros-cons-fixes.html
    │       │   │   ├── 02-sorting-timeline.html
    │       │   │   ├── 03-causal-flow.html
    │       │   │   ├── 04-matrix-2x2.html
    │       │   │   ├── 05-decision-tree.html
    │       │   │   ├── 06-weighted-ranking.html
    │       │   │   ├── 07-hypothesis-testing.html
    │       │   │   ├── 08-devils-advocacy.html
    │       │   │   ├── 09-probability-tree.html
    │       │   │   ├── 10-utility-tree.html
    │       │   │   ├── 11-utility-matrix.html
    │       │   │   ├── 12-advanced-utility.html
    │       │   │   ├── 13-triage-card.html
    │       │   │   └── README.md
    │       │   ├── interactive.md
    │       │   ├── probability.md
    │       │   └── structure.md
    │       └── working-canvas.md
    ├── crystal-upscaler
    │   ├── SKILL.md
    │   ├── references
    │   │   └── api-reference.md
    │   └── scripts
    │       ├── fit.py
    │       ├── requirements.txt
    │       └── upscale.py
    ├── debugging-framework
    │   ├── SKILL.md
    │   └── references
    │       ├── agent-assisted-debugging.md
    │       ├── anti-patterns.md
    │       ├── bug-shapes.md
    │       ├── lightweight-triage.md
    │       ├── scientific-method.md
    │       └── worked-examples.md
    ├── defensive-programming
    │   ├── SKILL.md
    │   └── references
    │       ├── anti-patterns.md
    │       ├── by-stack-layer.md
    │       ├── checklist.md
    │       └── examples.md
    ├── gcs-storage
    │   └── SKILL.md
    ├── git-workflow
    │   ├── SKILL.md
    │   ├── branch-age.sh
    │   ├── branch-naming.md
    │   ├── check-branch.sh
    │   ├── conflict-resolution.md
    │   ├── feature-flags.md
    │   ├── multi-agent.md
    │   ├── policy-violations.md
    │   ├── pr-template.md
    │   ├── pre-pr-gates.md
    │   ├── references
    │   │   ├── branch-naming.md
    │   │   ├── conflict-resolution.md
    │   │   ├── feature-flags.md
    │   │   ├── policy-violations.md
    │   │   ├── pr-template.md
    │   │   └── pre-pr-gates.md
    │   ├── scripts
    │   │   ├── branch-age.sh
    │   │   ├── check-branch.sh
    │   │   └── secret-scan.sh
    │   ├── secret-scan.sh
    │   ├── workbranch-status.sh
    │   ├── workbranches.md
    │   ├── worktree-add.sh
    │   ├── worktree-list.sh
    │   └── worktrees.md
    ├── handoff
    │   └── SKILL.md
    ├── human-changelog
    │   ├── SKILL.md
    │   └── references
    │       └── translation-examples.md
    ├── image-gen
    │   ├── SKILL.md
    │   ├── references
    │   │   ├── mai-image.md
    │   │   ├── nano-banana.md
    │   │   └── reve.md
    │   └── scripts
    │       └── generate.py
    ├── iterative-plan
    │   ├── SKILL.md
    │   └── references
    │       ├── agile-patterns.md
    │       ├── anti-patterns.md
    │       ├── retro-feedback.md
    │       └── standing-checks.md
    ├── learn
    │   ├── SKILL.md
    │   └── references
    │       ├── chunk-types.md
    │       ├── encoding-hierarchy.md
    │       ├── feedback-types.md
    │       ├── kickoff-session.md
    │       ├── learning-journal.md
    │       ├── learning-loop-session.md
    │       ├── proficiency-levels.md
    │       └── weekly-review-session.md
    ├── logical-reasoning
    │   ├── SKILL.md
    │   └── references
    │       ├── argument-analysis.md
    │       ├── categorical-logic.md
    │       ├── deductive-predicate.md
    │       ├── deductive-propositional.md
    │       ├── definition-and-classification.md
    │       ├── explanation.md
    │       ├── fallacies.md
    │       ├── inductive-and-statistical.md
    │       ├── modal-and-advanced.md
    │       └── notation-and-symbolization.md
    ├── loop-escape
    │   ├── SKILL.md
    │   └── references
    │       └── convergence-checkpoint.md
    ├── mistral
    │   ├── SKILL.md
    │   ├── references
    │   │   ├── agents.md
    │   │   ├── audio-speech.md
    │   │   ├── audio-transcriptions.md
    │   │   ├── authentication.md
    │   │   ├── batch.md
    │   │   ├── chat.md
    │   │   ├── classifiers.md
    │   │   ├── files.md
    │   │   ├── fine-tuning.md
    │   │   ├── models.md
    │   │   ├── more-endpoints.md
    │   │   ├── ocr.md
    │   │   ├── openapi.yaml
    │   │   └── text-and-embeddings.md
    │   └── scripts
    │       ├── _client.py
    │       ├── mistral_key.py
    │       ├── mistral_ocr.py
    │       ├── mistral_speech.py
    │       ├── mistral_transcribe.py
    │       └── requirements.txt
    ├── naming-conventions
    │   ├── SKILL.md
    │   └── references
    │       ├── code-identifiers.md
    │       ├── files-and-folders.md
    │       ├── git-branches-commits.md
    │       ├── naming-audit.md
    │       └── rationale.md
    ├── openai-audio
    │   ├── README.md
    │   ├── SKILL.md
    │   ├── examples
    │   │   ├── README.md
    │   │   ├── agents-sdk-browser
    │   │   │   ├── index.html
    │   │   │   └── server.js
    │   │   ├── audio_samples
    │   │   │   ├── REGENERATE.md
    │   │   │   ├── sample-en.wav
    │   │   │   └── sample-es.wav
    │   │   ├── ephemeral-token-server
    │   │   │   ├── server.js
    │   │   │   ├── server.py
    │   │   │   └── server.ts
    │   │   ├── prompt-templates
    │   │   │   ├── transcription-domain-keywords.md
    │   │   │   ├── translation-listen-along.md
    │   │   │   ├── voice-agent-support.md
    │   │   │   └── voice-agent-tutor.md
    │   │   ├── sideband-server-control.js
    │   │   ├── sideband-server-control.ts
    │   │   ├── sip-webhook-handler.py
    │   │   ├── transcription-file-fallback.py
    │   │   ├── transcription-session.py
    │   │   ├── transcription-session.ts
    │   │   ├── translation-session.js
    │   │   ├── translation-session.py
    │   │   ├── translation-session.ts
    │   │   ├── tts-streaming.js
    │   │   ├── tts-streaming.py
    │   │   ├── tts-streaming.ts
    │   │   ├── webrtc-browser-voice-agent
    │   │   │   ├── index.html
    │   │   │   ├── server.js
    │   │   │   └── server.ts
    │   │   ├── websocket-voice-agent.js
    │   │   ├── websocket-voice-agent.py
    │   │   └── websocket-voice-agent.ts
    │   └── references
    │       ├── 01-choosing-a-path.md
    │       ├── 02-voice-agents.md
    │       ├── 03-transcription.md
    │       ├── 04-translation.md
    │       ├── 05-text-to-speech.md
    │       ├── 06-transport-webrtc.md
    │       ├── 07-transport-websocket.md
    │       ├── 08-transport-sip.md
    │       ├── 09-conversation-lifecycle.md
    │       ├── 10-prompting-realtime-2.md
    │       ├── 11-prompting-realtime-1.5.md
    │       ├── 12-tools-and-mcp.md
    │       ├── 13-server-side-controls.md
    │       ├── 14-costs-and-rate-limits.md
    │       ├── 15-chat-completions-audio.md
    │       ├── 16-custom-voices.md
    │       ├── 17-beta-to-ga-migration.md
    │       ├── 18-evals-and-testing.md
    │       ├── 19-use-cases.md
    │       └── 20-official-openai-skills.md
    ├── personal-productivity
    │   ├── SKILL.md
    │   └── references
    │       ├── deep-work.md
    │       ├── finitude.md
    │       ├── focus-funnel.md
    │       └── slow-productivity.md
    ├── pretext
    │   ├── SKILL.md
    │   └── references
    │       ├── api-reference.md
    │       ├── demos-guide.md
    │       ├── gotchas-and-debugging.md
    │       ├── react-patterns.md
    │       └── setup-guide.md
    ├── quiver-ai
    │   ├── SKILL.md
    │   └── references
    │       └── api-reference.md
    ├── security-check
    │   ├── SKILL.md
    │   ├── references
    │   │   ├── data-security.md
    │   │   ├── impact-assessment.md
    │   │   ├── playbook-audit.md
    │   │   ├── playbook-diff-review.md
    │   │   ├── playbook-redteam.md
    │   │   ├── severity-and-triage.md
    │   │   ├── stack-auth-entra.md
    │   │   ├── stack-azure-functions-ts.md
    │   │   ├── stack-azure-platform.md
    │   │   ├── stack-azure-sql.md
    │   │   ├── stack-llm-mcp.md
    │   │   ├── stack-python-fastapi.md
    │   │   ├── stack-react-spa.md
    │   │   ├── stack-rust.md
    │   │   └── stack-supply-chain.md
    │   └── scripts
    │       ├── impact_stats.py
    │       └── secret_scan.py
    ├── shaughv-animated-brandmark
    │   ├── SKILL.md
    │   └── references
    │       └── implementation.md
    ├── shaughv-cdn
    │   └── SKILL.md
    ├── shaughv-design
    │   ├── BRANDMARK.md
    │   ├── README.md
    │   ├── SKILL.md
    │   ├── assets
    │   │   ├── AnimatedBrandMark.jsx
    │   │   ├── SHAUGHV-Favicon-Dark-Alt.svg
    │   │   ├── SHAUGHV-Favicon-Dark.svg
    │   │   ├── SHAUGHV-Favicon-Light-Alt.svg
    │   │   ├── SHAUGHV-Favicon-Light.svg
    │   │   ├── SHAUGHV-Green.png
    │   │   ├── SHAUGHV-Official.svg
    │   │   ├── SHAUGHV-Orange.png
    │   │   ├── animated-brand-mark.js
    │   │   ├── figurines
    │   │   │   ├── figurine-404.svg
    │   │   │   ├── figurine-404.webp
    │   │   │   ├── figurine-footer.webp
    │   │   │   ├── figurine-header.svg
    │   │   │   ├── figurine-header.webp
    │   │   │   ├── figurine-look-at-this.webp
    │   │   │   ├── figurine-mail.webp
    │   │   │   └── transparent
    │   │   │       ├── figurine-404.webp
    │   │   │       ├── figurine-footer.webp
    │   │   │       ├── figurine-header.webp
    │   │   │       ├── figurine-look-at-this.webp
    │   │   │       └── figurine-mail.webp
    │   │   └── shaughv-loader.js
    │   ├── colors_and_type.css
    │   ├── fonts
    │   │   ├── Gail-Rock-Bold.woff2
    │   │   ├── Gail-Rock-Extralight.woff2
    │   │   ├── Gail-Rock-Light.woff2
    │   │   ├── Gail-Rock-Medium.woff2
    │   │   ├── Gail-Rock-Regular.woff2
    │   │   ├── Gail-Rock-Semibold.woff2
    │   │   ├── Gail-Rock-Thin.woff2
    │   │   ├── Makira-Black.woff2
    │   │   ├── Makira-Bold.woff2
    │   │   ├── Makira-ExtraBold.woff2
    │   │   ├── Makira-Medium.woff2
    │   │   ├── Makira-Regular.woff2
    │   │   └── Makira-SemiBold.woff2
    │   ├── preview
    │   │   ├── _card-base.css
    │   │   ├── brand-animated-mark.html
    │   │   ├── brand-cursor.html
    │   │   ├── brand-dot-matrix.html
    │   │   ├── brand-favicons.html
    │   │   ├── brand-figurines.html
    │   │   ├── brand-loader.html
    │   │   ├── brand-lockup.html
    │   │   ├── colors-bamboo.html
    │   │   ├── colors-bauhaus.html
    │   │   ├── colors-cream.html
    │   │   ├── colors-olive.html
    │   │   ├── colors-sage.html
    │   │   ├── colors-semantic.html
    │   │   ├── components-bauhaus.html
    │   │   ├── components-buttons.html
    │   │   ├── components-chips.html
    │   │   ├── components-fields.html
    │   │   ├── components-project-row.html
    │   │   ├── components-work-tile.html
    │   │   ├── spacing-elevation.html
    │   │   ├── spacing-radii.html
    │   │   ├── spacing-scale.html
    │   │   ├── spacing-section.html
    │   │   ├── type-body.html
    │   │   ├── type-display.html
    │   │   ├── type-eyebrow.html
    │   │   ├── type-heading.html
    │   │   └── type-mono.html
    │   ├── ui_kits
    │   │   ├── personal_site
    │   │   │   ├── About.jsx
    │   │   │   ├── Contact.jsx
    │   │   │   ├── DotMatrix.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   ├── Hero.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Projects.jsx
    │   │   │   ├── README.md
    │   │   │   ├── Skills.jsx
    │   │   │   ├── WorkTile.jsx
    │   │   │   ├── Works.jsx
    │   │   │   ├── data.js
    │   │   │   └── index.html
    │   │   └── vintage_site
    │   │       ├── AboutSection.jsx
    │   │       ├── BauhausPrimitives.jsx
    │   │       ├── ContactSection.jsx
    │   │       ├── FooterSection.jsx
    │   │       ├── HeroSection.jsx
    │   │       ├── Navigation.jsx
    │   │       ├── ProjectsSection.jsx
    │   │       ├── README.md
    │   │       ├── SkillsSection.jsx
    │   │       └── index.html
    │   └── uploads
    │       ├── IBMPlexMono-Bold-00f39625.woff2
    │       ├── IBMPlexMono-Bold-7631bb97.woff
    │       ├── IBMPlexMono-Bold.woff
    │       ├── IBMPlexMono-Bold.woff2
    │       ├── IBMPlexMono-BoldItalic-9d07b353.woff2
    │       ├── IBMPlexMono-BoldItalic-f2f7af62.woff
    │       ├── IBMPlexMono-BoldItalic.woff
    │       ├── IBMPlexMono-BoldItalic.woff2
    │       ├── IBMPlexMono-ExtraLight-1f8e21d5.woff
    │       ├── IBMPlexMono-ExtraLight-e5efad45.woff2
    │       ├── IBMPlexMono-ExtraLight.woff
    │       ├── IBMPlexMono-ExtraLight.woff2
    │       ├── IBMPlexMono-ExtraLightItalic-72240cf7.woff2
    │       ├── IBMPlexMono-ExtraLightItalic-d70c25fe.woff
    │       ├── IBMPlexMono-ExtraLightItalic.woff
    │       ├── IBMPlexMono-ExtraLightItalic.woff2
    │       ├── IBMPlexMono-Italic-1843c0dc.woff
    │       ├── IBMPlexMono-Italic-aafe9077.woff2
    │       ├── IBMPlexMono-Italic.woff
    │       ├── IBMPlexMono-Italic.woff2
    │       ├── IBMPlexMono-Light-1b891bd6.woff2
    │       ├── IBMPlexMono-Light-eb1fccac.woff
    │       ├── IBMPlexMono-Light.woff
    │       ├── IBMPlexMono-Light.woff2
    │       ├── IBMPlexMono-LightItalic-b0dfe403.woff2
    │       ├── IBMPlexMono-LightItalic-bd04b7c0.woff
    │       ├── IBMPlexMono-LightItalic.woff
    │       ├── IBMPlexMono-LightItalic.woff2
    │       ├── IBMPlexMono-Medium-ad59ae21.woff2
    │       ├── IBMPlexMono-Medium-f1b29d16.woff
    │       ├── IBMPlexMono-Medium.woff
    │       ├── IBMPlexMono-Medium.woff2
    │       ├── IBMPlexMono-MediumItalic-723b6432.woff
    │       ├── IBMPlexMono-MediumItalic-e53906ea.woff2
    │       ├── IBMPlexMono-MediumItalic.woff
    │       ├── IBMPlexMono-MediumItalic.woff2
    │       ├── IBMPlexMono-Regular-0af5656d.woff2
    │       ├── IBMPlexMono-Regular-134dcad4.woff
    │       ├── IBMPlexMono-Regular.woff
    │       ├── IBMPlexMono-Regular.woff2
    │       ├── IBMPlexMono-SemiBold-3b6fcb91.woff
    │       ├── IBMPlexMono-SemiBold-a7cc7bc1.woff2
    │       ├── IBMPlexMono-SemiBold.woff
    │       ├── IBMPlexMono-SemiBold.woff2
    │       ├── IBMPlexMono-SemiBoldItalic-86ffa47b.woff
    │       ├── IBMPlexMono-SemiBoldItalic-c3622eb4.woff2
    │       ├── IBMPlexMono-SemiBoldItalic.woff
    │       ├── IBMPlexMono-SemiBoldItalic.woff2
    │       ├── IBMPlexMono-Thin-183c7b9c.woff
    │       ├── IBMPlexMono-Thin-72ad3a05.woff2
    │       ├── IBMPlexMono-Thin.woff
    │       ├── IBMPlexMono-Thin.woff2
    │       ├── IBMPlexMono-ThinItalic-3f0645c4.woff2
    │       ├── IBMPlexMono-ThinItalic-f62a3613.woff
    │       ├── IBMPlexMono-ThinItalic.woff
    │       ├── IBMPlexMono-ThinItalic.woff2
    │       ├── Makira-Black.woff
    │       ├── Makira-Black.woff2
    │       ├── Makira-Bold.woff
    │       ├── Makira-Bold.woff2
    │       ├── Makira-ExtraBold.woff
    │       ├── Makira-ExtraBold.woff2
    │       ├── Makira-Medium.woff
    │       ├── Makira-Medium.woff2
    │       ├── Makira-Regular.woff
    │       ├── Makira-Regular.woff2
    │       ├── Makira-SemiBold.woff
    │       ├── Makira-SemiBold.woff2
    │       ├── SHAUGHV AWS Logo List.md
    │       ├── SHAUGHV-Favicon-Dark-Alt.svg
    │       ├── SHAUGHV-Favicon-Dark.svg
    │       ├── SHAUGHV-Favicon-Light-Alt.svg
    │       ├── SHAUGHV-Favicon-Light.svg
    │       ├── SHAUGHV-Green.png
    │       ├── SHAUGHV-Official-63b30679.svg
    │       ├── SHAUGHV-Official.svg
    │       ├── SHAUGHV-Orange.png
    │       ├── Unbounded-Blond.woff2
    │       ├── figurine_404.svg
    │       ├── figurine_header-857c9e16.svg
    │       └── figurine_header.svg
    ├── shaughv-gcs-storage
    │   └── SKILL.md
    ├── subagent-model-preference
    │   ├── SKILL.md
    │   └── references
    │       ├── repo-snippet.md
    │       └── user-global-snippet.md
    ├── ttdr
    │   ├── SKILL.md
    │   └── references
    │       └── examples.md
    ├── usage-statusline
    │   ├── SKILL.md
    │   ├── references
    │   │   └── build-guide.md
    │   └── scripts
    │       ├── install.mjs
    │       └── statusline-usage.mjs
    ├── wb300
    │   ├── SKILL.md
    │   └── references
    │       ├── agent-json.md
    │       ├── install.md
    │       └── tui.md
    └── workflow-optimization
        ├── SKILL.md
        └── references
            ├── business-process-reengineering.md
            ├── checklists.md
            ├── core-principles.md
            ├── diagramming.md
            ├── lean.md
            ├── meta-workflow-checklist.md
            ├── prioritization.md
            ├── process-optimization.md
            ├── six-sigma.md
            ├── theory-of-constraints.md
            └── total-quality-management.md
```
