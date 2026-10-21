# CODEX_PROJECT.md — shaughv-code

## TL;DR

`shaughv-code` is Emmett Shaughnessy's personal cross-agent skill bundle. The
repository root is the authoring source for Claude Code and skills.sh-compatible
agents; `plugins/shaughv-code/` is a generated, self-contained Codex package.
Release 1.8.0 adds discovery and integration guidance for the optional ambient background. Release 1.7.0 establishes the shared CDN site baseline: cursor, frosted dropdowns, and both footer logos with copyright, including full-viewport footer placement. Earlier releases refresh the design skill with complete footer and font references,
bundled crests, runnable footer examples, proportional logo scaling, and current
static-mark and typography guidance. Original crest bytes survive Windows
checkouts and marketplace installs without newline conversion.

## Project status

> The three numbers below are enforced by CI (`.github/workflows/validate.yml`),
> which fails the build if this file's stated release or package counts disagree
> with the manifests and the generated package. Update them in the same commit as
> any version bump; see the release workflow below.

- **Current release:** 1.8.2 (21 October 2026).
- **Default branch:** `main`.
- **Repository:** `RealEmmettS/shaughv-code`.
- **Primary purpose:** Maintain one editable source of truth for Emmett's
  reusable skills and the explicitly approved Claude-only slash command.
- **Current state:** Claude and Codex plugin manifests are version-aligned; the
  generated Codex package contains 32 skill directories and 491 files.
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
├── .github
│   └── workflows
│       └── validate.yml
├── assets
│   ├── shaughv-icon-dark.png
│   └── shaughv-icon-light.png
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
│           │   ├── references
│           │   │   ├── evaluation.md
│           │   │   ├── long-horizon-control.md
│           │   │   ├── math-science-adapter.md
│           │   │   ├── model-overlays.md
│           │   │   ├── prompt-construction.md
│           │   │   ├── software-data-adapter.md
│           │   │   └── task-contract.md
│           │   └── SKILL.md
│           ├── bug-triage
│           │   ├── references
│           │   │   ├── bug-report-template.md
│           │   │   └── investigation-playbook.md
│           │   └── SKILL.md
│           ├── choose-optional-mcps
│           │   ├── agents
│           │   │   └── openai.yaml
│           │   ├── references
│           │   │   └── connections.md
│           │   └── SKILL.md
│           ├── code-design-patterns
│           │   ├── references
│           │   │   ├── behavioral
│           │   │   │   ├── chain-of-responsibility.md
│           │   │   │   ├── command.md
│           │   │   │   ├── iterator.md
│           │   │   │   ├── mediator.md
│           │   │   │   ├── memento.md
│           │   │   │   ├── observer.md
│           │   │   │   ├── state.md
│           │   │   │   ├── strategy.md
│           │   │   │   ├── template-method.md
│           │   │   │   └── visitor.md
│           │   │   ├── creational
│           │   │   │   ├── abstract-factory.md
│           │   │   │   ├── builder.md
│           │   │   │   ├── factory-method.md
│           │   │   │   ├── prototype.md
│           │   │   │   └── singleton.md
│           │   │   ├── structural
│           │   │   │   ├── adapter.md
│           │   │   │   ├── bridge.md
│           │   │   │   ├── composite.md
│           │   │   │   ├── decorator.md
│           │   │   │   ├── facade.md
│           │   │   │   ├── flyweight.md
│           │   │   │   └── proxy.md
│           │   │   ├── _template.md
│           │   │   ├── anti-patterns.md
│           │   │   ├── INDEX.md
│           │   │   ├── pattern-relationships.md
│           │   │   ├── recognition.md
│           │   │   ├── recommendations.md
│           │   │   └── solid-principles.md
│           │   └── SKILL.md
│           ├── critical-thinking
│           │   ├── references
│           │   │   ├── strategic
│           │   │   │   ├── annexes
│           │   │   │   │   ├── 36-stratagems-full.md
│           │   │   │   │   ├── 5-rings-full.md
│           │   │   │   │   └── art-of-war-full.md
│           │   │   │   ├── art-of-war.md
│           │   │   │   ├── book-of-five-rings.md
│           │   │   │   ├── game-theory-and-mental-levels.md
│           │   │   │   └── thirty-six-stratagems.md
│           │   │   ├── visual-models
│           │   │   │   ├── html
│           │   │   │   │   ├── 01-pros-cons-fixes.html
│           │   │   │   │   ├── 02-sorting-timeline.html
│           │   │   │   │   ├── 03-causal-flow.html
│           │   │   │   │   ├── 04-matrix-2x2.html
│           │   │   │   │   ├── 05-decision-tree.html
│           │   │   │   │   ├── 06-weighted-ranking.html
│           │   │   │   │   ├── 07-hypothesis-testing.html
│           │   │   │   │   ├── 08-devils-advocacy.html
│           │   │   │   │   ├── 09-probability-tree.html
│           │   │   │   │   ├── 10-utility-tree.html
│           │   │   │   │   ├── 11-utility-matrix.html
│           │   │   │   │   ├── 12-advanced-utility.html
│           │   │   │   │   ├── 13-triage-card.html
│           │   │   │   │   └── README.md
│           │   │   │   ├── causality.md
│           │   │   │   ├── comparison.md
│           │   │   │   ├── interactive.md
│           │   │   │   ├── probability.md
│           │   │   │   └── structure.md
│           │   │   ├── cognitive-scaffolds.md
│           │   │   ├── contemplating.md
│           │   │   ├── cross-cutting-disciplines.md
│           │   │   ├── decision-making.md
│           │   │   ├── design.md
│           │   │   ├── devils-advocacy.md
│           │   │   ├── problem-solving.md
│           │   │   ├── scientific-inquiry.md
│           │   │   ├── sensemaking.md
│           │   │   ├── strategic.md
│           │   │   └── working-canvas.md
│           │   └── SKILL.md
│           ├── crystal-upscaler
│           │   ├── references
│           │   │   └── api-reference.md
│           │   ├── scripts
│           │   │   ├── fit.py
│           │   │   ├── requirements.txt
│           │   │   └── upscale.py
│           │   └── SKILL.md
│           ├── debugging-framework
│           │   ├── references
│           │   │   ├── agent-assisted-debugging.md
│           │   │   ├── anti-patterns.md
│           │   │   ├── bug-shapes.md
│           │   │   ├── lightweight-triage.md
│           │   │   ├── scientific-method.md
│           │   │   └── worked-examples.md
│           │   └── SKILL.md
│           ├── defensive-programming
│           │   ├── references
│           │   │   ├── anti-patterns.md
│           │   │   ├── by-stack-layer.md
│           │   │   ├── checklist.md
│           │   │   └── examples.md
│           │   └── SKILL.md
│           ├── gcs-storage
│           │   └── SKILL.md
│           ├── git-workflow
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
│           │   ├── branch-age.sh
│           │   ├── branch-naming.md
│           │   ├── check-branch.sh
│           │   ├── conflict-resolution.md
│           │   ├── feature-flags.md
│           │   ├── multi-agent.md
│           │   ├── policy-violations.md
│           │   ├── pr-template.md
│           │   ├── pre-pr-gates.md
│           │   ├── secret-scan.sh
│           │   ├── SKILL.md
│           │   ├── workbranch-status.sh
│           │   ├── workbranches.md
│           │   ├── worktree-add.sh
│           │   ├── worktree-list.sh
│           │   └── worktrees.md
│           ├── handoff
│           │   └── SKILL.md
│           ├── human-changelog
│           │   ├── references
│           │   │   └── translation-examples.md
│           │   └── SKILL.md
│           ├── image-gen
│           │   ├── references
│           │   │   ├── mai-image.md
│           │   │   ├── nano-banana.md
│           │   │   └── reve.md
│           │   ├── scripts
│           │   │   └── generate.py
│           │   └── SKILL.md
│           ├── iterative-plan
│           │   ├── references
│           │   │   ├── agile-patterns.md
│           │   │   ├── anti-patterns.md
│           │   │   ├── retro-feedback.md
│           │   │   └── standing-checks.md
│           │   └── SKILL.md
│           ├── learn
│           │   ├── references
│           │   │   ├── chunk-types.md
│           │   │   ├── encoding-hierarchy.md
│           │   │   ├── feedback-types.md
│           │   │   ├── kickoff-session.md
│           │   │   ├── learning-journal.md
│           │   │   ├── learning-loop-session.md
│           │   │   ├── proficiency-levels.md
│           │   │   └── weekly-review-session.md
│           │   └── SKILL.md
│           ├── logical-reasoning
│           │   ├── references
│           │   │   ├── argument-analysis.md
│           │   │   ├── categorical-logic.md
│           │   │   ├── deductive-predicate.md
│           │   │   ├── deductive-propositional.md
│           │   │   ├── definition-and-classification.md
│           │   │   ├── explanation.md
│           │   │   ├── fallacies.md
│           │   │   ├── inductive-and-statistical.md
│           │   │   ├── modal-and-advanced.md
│           │   │   └── notation-and-symbolization.md
│           │   └── SKILL.md
│           ├── loop-escape
│           │   ├── references
│           │   │   └── convergence-checkpoint.md
│           │   └── SKILL.md
│           ├── mistral
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
│           │   ├── scripts
│           │   │   ├── _client.py
│           │   │   ├── mistral_key.py
│           │   │   ├── mistral_ocr.py
│           │   │   ├── mistral_speech.py
│           │   │   ├── mistral_transcribe.py
│           │   │   └── requirements.txt
│           │   └── SKILL.md
│           ├── naming-conventions
│           │   ├── references
│           │   │   ├── code-identifiers.md
│           │   │   ├── files-and-folders.md
│           │   │   ├── git-branches-commits.md
│           │   │   ├── naming-audit.md
│           │   │   └── rationale.md
│           │   └── SKILL.md
│           ├── openai-audio
│           │   ├── examples
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
│           │   │   ├── webrtc-browser-voice-agent
│           │   │   │   ├── index.html
│           │   │   │   ├── server.js
│           │   │   │   └── server.ts
│           │   │   ├── README.md
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
│           │   │   ├── websocket-voice-agent.js
│           │   │   ├── websocket-voice-agent.py
│           │   │   └── websocket-voice-agent.ts
│           │   ├── references
│           │   │   ├── 01-choosing-a-path.md
│           │   │   ├── 02-voice-agents.md
│           │   │   ├── 03-transcription.md
│           │   │   ├── 04-translation.md
│           │   │   ├── 05-text-to-speech.md
│           │   │   ├── 06-transport-webrtc.md
│           │   │   ├── 07-transport-websocket.md
│           │   │   ├── 08-transport-sip.md
│           │   │   ├── 09-conversation-lifecycle.md
│           │   │   ├── 10-prompting-realtime-2.md
│           │   │   ├── 11-prompting-realtime-1.5.md
│           │   │   ├── 12-tools-and-mcp.md
│           │   │   ├── 13-server-side-controls.md
│           │   │   ├── 14-costs-and-rate-limits.md
│           │   │   ├── 15-chat-completions-audio.md
│           │   │   ├── 16-custom-voices.md
│           │   │   ├── 17-beta-to-ga-migration.md
│           │   │   ├── 18-evals-and-testing.md
│           │   │   ├── 19-use-cases.md
│           │   │   └── 20-official-openai-skills.md
│           │   ├── README.md
│           │   └── SKILL.md
│           ├── personal-productivity
│           │   ├── references
│           │   │   ├── deep-work.md
│           │   │   ├── finitude.md
│           │   │   ├── focus-funnel.md
│           │   │   └── slow-productivity.md
│           │   └── SKILL.md
│           ├── pretext
│           │   ├── references
│           │   │   ├── api-reference.md
│           │   │   ├── demos-guide.md
│           │   │   ├── gotchas-and-debugging.md
│           │   │   ├── react-patterns.md
│           │   │   └── setup-guide.md
│           │   └── SKILL.md
│           ├── quiver-ai
│           │   ├── references
│           │   │   └── api-reference.md
│           │   └── SKILL.md
│           ├── security-check
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
│           │   ├── scripts
│           │   │   ├── impact_stats.py
│           │   │   └── secret_scan.py
│           │   └── SKILL.md
│           ├── shaughv-animated-brandmark
│           │   ├── references
│           │   │   └── implementation.md
│           │   └── SKILL.md
│           ├── shaughv-cdn
│           │   └── SKILL.md
│           ├── shaughv-design
│           │   ├── assets
│           │   │   ├── crests
│           │   │   │   ├── crest-info.json
│           │   │   │   ├── Shaughnessy-Crest-Footer.svg
│           │   │   │   ├── Shaughnessy-Crest-Mono.svg
│           │   │   │   └── Shaughnessy-Crest.svg
│           │   │   ├── figurines
│           │   │   │   ├── transparent
│           │   │   │   │   ├── figurine-404.webp
│           │   │   │   │   ├── figurine-footer.webp
│           │   │   │   │   ├── figurine-header.webp
│           │   │   │   │   ├── figurine-look-at-this.webp
│           │   │   │   │   └── figurine-mail.webp
│           │   │   │   ├── figurine-404.svg
│           │   │   │   ├── figurine-404.webp
│           │   │   │   ├── figurine-footer.webp
│           │   │   │   ├── figurine-header.svg
│           │   │   │   ├── figurine-header.webp
│           │   │   │   ├── figurine-look-at-this.webp
│           │   │   │   └── figurine-mail.webp
│           │   │   ├── animated-brand-mark.js
│           │   │   ├── AnimatedBrandMark.jsx
│           │   │   ├── SHAUGHV-Favicon-Dark-Alt.svg
│           │   │   ├── SHAUGHV-Favicon-Dark.svg
│           │   │   ├── SHAUGHV-Favicon-Light-Alt.svg
│           │   │   ├── SHAUGHV-Favicon-Light.svg
│           │   │   ├── SHAUGHV-Green.png
│           │   │   ├── shaughv-loader.js
│           │   │   ├── SHAUGHV-Official.svg
│           │   │   └── SHAUGHV-Orange.png
│           │   ├── examples
│           │   │   ├── footer.css
│           │   │   └── footer.html
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
│           │   │   ├── Makira-SemiBold.woff2
│           │   │   ├── PaperMono-Bold.woff2
│           │   │   ├── PaperMono-ExtraBold.woff2
│           │   │   ├── PaperMono-ExtraLight.woff2
│           │   │   ├── PaperMono-LICENSE.txt
│           │   │   ├── PaperMono-Light.woff2
│           │   │   ├── PaperMono-Medium.woff2
│           │   │   ├── PaperMono-OFL.txt
│           │   │   ├── PaperMono-Regular.woff2
│           │   │   ├── PaperMono-SemiBold.woff2
│           │   │   ├── PaperMono-Thin.woff2
│           │   │   └── PaperMono-Variable.woff2
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
│           │   ├── references
│           │   │   ├── fonts.md
│           │   │   └── footer.md
│           │   ├── ui_kits
│           │   │   ├── personal_site
│           │   │   │   ├── About.jsx
│           │   │   │   ├── Contact.jsx
│           │   │   │   ├── data.js
│           │   │   │   ├── DotMatrix.jsx
│           │   │   │   ├── Footer.jsx
│           │   │   │   ├── Hero.jsx
│           │   │   │   ├── index.html
│           │   │   │   ├── Navbar.jsx
│           │   │   │   ├── Projects.jsx
│           │   │   │   ├── README.md
│           │   │   │   ├── Skills.jsx
│           │   │   │   ├── Works.jsx
│           │   │   │   └── WorkTile.jsx
│           │   │   └── vintage_site
│           │   │       ├── AboutSection.jsx
│           │   │       ├── BauhausPrimitives.jsx
│           │   │       ├── ContactSection.jsx
│           │   │       ├── FooterSection.jsx
│           │   │       ├── HeroSection.jsx
│           │   │       ├── index.html
│           │   │       ├── Navigation.jsx
│           │   │       ├── ProjectsSection.jsx
│           │   │       ├── README.md
│           │   │       └── SkillsSection.jsx
│           │   ├── uploads
│           │   │   ├── figurine_404.svg
│           │   │   ├── figurine_header-857c9e16.svg
│           │   │   ├── figurine_header.svg
│           │   │   ├── IBMPlexMono-Bold-00f39625.woff2
│           │   │   ├── IBMPlexMono-Bold-7631bb97.woff
│           │   │   ├── IBMPlexMono-Bold.woff
│           │   │   ├── IBMPlexMono-Bold.woff2
│           │   │   ├── IBMPlexMono-BoldItalic-9d07b353.woff2
│           │   │   ├── IBMPlexMono-BoldItalic-f2f7af62.woff
│           │   │   ├── IBMPlexMono-BoldItalic.woff
│           │   │   ├── IBMPlexMono-BoldItalic.woff2
│           │   │   ├── IBMPlexMono-ExtraLight-1f8e21d5.woff
│           │   │   ├── IBMPlexMono-ExtraLight-e5efad45.woff2
│           │   │   ├── IBMPlexMono-ExtraLight.woff
│           │   │   ├── IBMPlexMono-ExtraLight.woff2
│           │   │   ├── IBMPlexMono-ExtraLightItalic-72240cf7.woff2
│           │   │   ├── IBMPlexMono-ExtraLightItalic-d70c25fe.woff
│           │   │   ├── IBMPlexMono-ExtraLightItalic.woff
│           │   │   ├── IBMPlexMono-ExtraLightItalic.woff2
│           │   │   ├── IBMPlexMono-Italic-1843c0dc.woff
│           │   │   ├── IBMPlexMono-Italic-aafe9077.woff2
│           │   │   ├── IBMPlexMono-Italic.woff
│           │   │   ├── IBMPlexMono-Italic.woff2
│           │   │   ├── IBMPlexMono-Light-1b891bd6.woff2
│           │   │   ├── IBMPlexMono-Light-eb1fccac.woff
│           │   │   ├── IBMPlexMono-Light.woff
│           │   │   ├── IBMPlexMono-Light.woff2
│           │   │   ├── IBMPlexMono-LightItalic-b0dfe403.woff2
│           │   │   ├── IBMPlexMono-LightItalic-bd04b7c0.woff
│           │   │   ├── IBMPlexMono-LightItalic.woff
│           │   │   ├── IBMPlexMono-LightItalic.woff2
│           │   │   ├── IBMPlexMono-Medium-ad59ae21.woff2
│           │   │   ├── IBMPlexMono-Medium-f1b29d16.woff
│           │   │   ├── IBMPlexMono-Medium.woff
│           │   │   ├── IBMPlexMono-Medium.woff2
│           │   │   ├── IBMPlexMono-MediumItalic-723b6432.woff
│           │   │   ├── IBMPlexMono-MediumItalic-e53906ea.woff2
│           │   │   ├── IBMPlexMono-MediumItalic.woff
│           │   │   ├── IBMPlexMono-MediumItalic.woff2
│           │   │   ├── IBMPlexMono-Regular-0af5656d.woff2
│           │   │   ├── IBMPlexMono-Regular-134dcad4.woff
│           │   │   ├── IBMPlexMono-Regular.woff
│           │   │   ├── IBMPlexMono-Regular.woff2
│           │   │   ├── IBMPlexMono-SemiBold-3b6fcb91.woff
│           │   │   ├── IBMPlexMono-SemiBold-a7cc7bc1.woff2
│           │   │   ├── IBMPlexMono-SemiBold.woff
│           │   │   ├── IBMPlexMono-SemiBold.woff2
│           │   │   ├── IBMPlexMono-SemiBoldItalic-86ffa47b.woff
│           │   │   ├── IBMPlexMono-SemiBoldItalic-c3622eb4.woff2
│           │   │   ├── IBMPlexMono-SemiBoldItalic.woff
│           │   │   ├── IBMPlexMono-SemiBoldItalic.woff2
│           │   │   ├── IBMPlexMono-Thin-183c7b9c.woff
│           │   │   ├── IBMPlexMono-Thin-72ad3a05.woff2
│           │   │   ├── IBMPlexMono-Thin.woff
│           │   │   ├── IBMPlexMono-Thin.woff2
│           │   │   ├── IBMPlexMono-ThinItalic-3f0645c4.woff2
│           │   │   ├── IBMPlexMono-ThinItalic-f62a3613.woff
│           │   │   ├── IBMPlexMono-ThinItalic.woff
│           │   │   ├── IBMPlexMono-ThinItalic.woff2
│           │   │   ├── Makira-Black.woff
│           │   │   ├── Makira-Black.woff2
│           │   │   ├── Makira-Bold.woff
│           │   │   ├── Makira-Bold.woff2
│           │   │   ├── Makira-ExtraBold.woff
│           │   │   ├── Makira-ExtraBold.woff2
│           │   │   ├── Makira-Medium.woff
│           │   │   ├── Makira-Medium.woff2
│           │   │   ├── Makira-Regular.woff
│           │   │   ├── Makira-Regular.woff2
│           │   │   ├── Makira-SemiBold.woff
│           │   │   ├── Makira-SemiBold.woff2
│           │   │   ├── SHAUGHV AWS Logo List.md
│           │   │   ├── SHAUGHV-Favicon-Dark-Alt.svg
│           │   │   ├── SHAUGHV-Favicon-Dark.svg
│           │   │   ├── SHAUGHV-Favicon-Light-Alt.svg
│           │   │   ├── SHAUGHV-Favicon-Light.svg
│           │   │   ├── SHAUGHV-Green.png
│           │   │   ├── SHAUGHV-Official-63b30679.svg
│           │   │   ├── SHAUGHV-Official.svg
│           │   │   ├── SHAUGHV-Orange.png
│           │   │   └── Unbounded-Blond.woff2
│           │   ├── BRANDMARK.md
│           │   ├── colors_and_type.css
│           │   ├── README.md
│           │   └── SKILL.md
│           ├── shaughv-gcs-storage
│           │   └── SKILL.md
│           ├── ttdr
│           │   ├── references
│           │   │   └── examples.md
│           │   └── SKILL.md
│           ├── usage-statusline
│           │   ├── references
│           │   │   └── build-guide.md
│           │   ├── scripts
│           │   │   ├── install.mjs
│           │   │   └── statusline-usage.mjs
│           │   └── SKILL.md
│           ├── wb300
│           │   ├── references
│           │   │   ├── agent-json.md
│           │   │   ├── install.md
│           │   │   └── tui.md
│           │   └── SKILL.md
│           └── workflow-optimization
│               ├── references
│               │   ├── business-process-reengineering.md
│               │   ├── checklists.md
│               │   ├── core-principles.md
│               │   ├── diagramming.md
│               │   ├── lean.md
│               │   ├── meta-workflow-checklist.md
│               │   ├── prioritization.md
│               │   ├── process-optimization.md
│               │   ├── six-sigma.md
│               │   ├── theory-of-constraints.md
│               │   └── total-quality-management.md
│               └── SKILL.md
├── skills
│   ├── agentic-prompt-engineering
│   │   ├── references
│   │   │   ├── evaluation.md
│   │   │   ├── long-horizon-control.md
│   │   │   ├── math-science-adapter.md
│   │   │   ├── model-overlays.md
│   │   │   ├── prompt-construction.md
│   │   │   ├── software-data-adapter.md
│   │   │   └── task-contract.md
│   │   └── SKILL.md
│   ├── bug-triage
│   │   ├── references
│   │   │   ├── bug-report-template.md
│   │   │   └── investigation-playbook.md
│   │   └── SKILL.md
│   ├── choose-optional-mcps
│   │   ├── agents
│   │   │   └── openai.yaml
│   │   ├── references
│   │   │   └── connections.md
│   │   └── SKILL.md
│   ├── code-design-patterns
│   │   ├── references
│   │   │   ├── behavioral
│   │   │   │   ├── chain-of-responsibility.md
│   │   │   │   ├── command.md
│   │   │   │   ├── iterator.md
│   │   │   │   ├── mediator.md
│   │   │   │   ├── memento.md
│   │   │   │   ├── observer.md
│   │   │   │   ├── state.md
│   │   │   │   ├── strategy.md
│   │   │   │   ├── template-method.md
│   │   │   │   └── visitor.md
│   │   │   ├── creational
│   │   │   │   ├── abstract-factory.md
│   │   │   │   ├── builder.md
│   │   │   │   ├── factory-method.md
│   │   │   │   ├── prototype.md
│   │   │   │   └── singleton.md
│   │   │   ├── structural
│   │   │   │   ├── adapter.md
│   │   │   │   ├── bridge.md
│   │   │   │   ├── composite.md
│   │   │   │   ├── decorator.md
│   │   │   │   ├── facade.md
│   │   │   │   ├── flyweight.md
│   │   │   │   └── proxy.md
│   │   │   ├── _template.md
│   │   │   ├── anti-patterns.md
│   │   │   ├── INDEX.md
│   │   │   ├── pattern-relationships.md
│   │   │   ├── recognition.md
│   │   │   ├── recommendations.md
│   │   │   └── solid-principles.md
│   │   └── SKILL.md
│   ├── critical-thinking
│   │   ├── references
│   │   │   ├── strategic
│   │   │   │   ├── annexes
│   │   │   │   │   ├── 36-stratagems-full.md
│   │   │   │   │   ├── 5-rings-full.md
│   │   │   │   │   └── art-of-war-full.md
│   │   │   │   ├── art-of-war.md
│   │   │   │   ├── book-of-five-rings.md
│   │   │   │   ├── game-theory-and-mental-levels.md
│   │   │   │   └── thirty-six-stratagems.md
│   │   │   ├── visual-models
│   │   │   │   ├── html
│   │   │   │   │   ├── 01-pros-cons-fixes.html
│   │   │   │   │   ├── 02-sorting-timeline.html
│   │   │   │   │   ├── 03-causal-flow.html
│   │   │   │   │   ├── 04-matrix-2x2.html
│   │   │   │   │   ├── 05-decision-tree.html
│   │   │   │   │   ├── 06-weighted-ranking.html
│   │   │   │   │   ├── 07-hypothesis-testing.html
│   │   │   │   │   ├── 08-devils-advocacy.html
│   │   │   │   │   ├── 09-probability-tree.html
│   │   │   │   │   ├── 10-utility-tree.html
│   │   │   │   │   ├── 11-utility-matrix.html
│   │   │   │   │   ├── 12-advanced-utility.html
│   │   │   │   │   ├── 13-triage-card.html
│   │   │   │   │   └── README.md
│   │   │   │   ├── causality.md
│   │   │   │   ├── comparison.md
│   │   │   │   ├── interactive.md
│   │   │   │   ├── probability.md
│   │   │   │   └── structure.md
│   │   │   ├── cognitive-scaffolds.md
│   │   │   ├── contemplating.md
│   │   │   ├── cross-cutting-disciplines.md
│   │   │   ├── decision-making.md
│   │   │   ├── design.md
│   │   │   ├── devils-advocacy.md
│   │   │   ├── problem-solving.md
│   │   │   ├── scientific-inquiry.md
│   │   │   ├── sensemaking.md
│   │   │   ├── strategic.md
│   │   │   └── working-canvas.md
│   │   └── SKILL.md
│   ├── crystal-upscaler
│   │   ├── references
│   │   │   └── api-reference.md
│   │   ├── scripts
│   │   │   ├── fit.py
│   │   │   ├── requirements.txt
│   │   │   └── upscale.py
│   │   └── SKILL.md
│   ├── debugging-framework
│   │   ├── references
│   │   │   ├── agent-assisted-debugging.md
│   │   │   ├── anti-patterns.md
│   │   │   ├── bug-shapes.md
│   │   │   ├── lightweight-triage.md
│   │   │   ├── scientific-method.md
│   │   │   └── worked-examples.md
│   │   └── SKILL.md
│   ├── defensive-programming
│   │   ├── references
│   │   │   ├── anti-patterns.md
│   │   │   ├── by-stack-layer.md
│   │   │   ├── checklist.md
│   │   │   └── examples.md
│   │   └── SKILL.md
│   ├── gcs-storage
│   │   └── SKILL.md
│   ├── git-workflow
│   │   ├── references
│   │   │   ├── branch-naming.md
│   │   │   ├── conflict-resolution.md
│   │   │   ├── feature-flags.md
│   │   │   ├── policy-violations.md
│   │   │   ├── pr-template.md
│   │   │   └── pre-pr-gates.md
│   │   ├── scripts
│   │   │   ├── branch-age.sh
│   │   │   ├── check-branch.sh
│   │   │   └── secret-scan.sh
│   │   ├── branch-age.sh
│   │   ├── branch-naming.md
│   │   ├── check-branch.sh
│   │   ├── conflict-resolution.md
│   │   ├── feature-flags.md
│   │   ├── multi-agent.md
│   │   ├── policy-violations.md
│   │   ├── pr-template.md
│   │   ├── pre-pr-gates.md
│   │   ├── secret-scan.sh
│   │   ├── SKILL.md
│   │   ├── workbranch-status.sh
│   │   ├── workbranches.md
│   │   ├── worktree-add.sh
│   │   ├── worktree-list.sh
│   │   └── worktrees.md
│   ├── handoff
│   │   └── SKILL.md
│   ├── human-changelog
│   │   ├── references
│   │   │   └── translation-examples.md
│   │   └── SKILL.md
│   ├── image-gen
│   │   ├── references
│   │   │   ├── mai-image.md
│   │   │   ├── nano-banana.md
│   │   │   └── reve.md
│   │   ├── scripts
│   │   │   └── generate.py
│   │   └── SKILL.md
│   ├── iterative-plan
│   │   ├── references
│   │   │   ├── agile-patterns.md
│   │   │   ├── anti-patterns.md
│   │   │   ├── retro-feedback.md
│   │   │   └── standing-checks.md
│   │   └── SKILL.md
│   ├── learn
│   │   ├── references
│   │   │   ├── chunk-types.md
│   │   │   ├── encoding-hierarchy.md
│   │   │   ├── feedback-types.md
│   │   │   ├── kickoff-session.md
│   │   │   ├── learning-journal.md
│   │   │   ├── learning-loop-session.md
│   │   │   ├── proficiency-levels.md
│   │   │   └── weekly-review-session.md
│   │   └── SKILL.md
│   ├── logical-reasoning
│   │   ├── references
│   │   │   ├── argument-analysis.md
│   │   │   ├── categorical-logic.md
│   │   │   ├── deductive-predicate.md
│   │   │   ├── deductive-propositional.md
│   │   │   ├── definition-and-classification.md
│   │   │   ├── explanation.md
│   │   │   ├── fallacies.md
│   │   │   ├── inductive-and-statistical.md
│   │   │   ├── modal-and-advanced.md
│   │   │   └── notation-and-symbolization.md
│   │   └── SKILL.md
│   ├── loop-escape
│   │   ├── references
│   │   │   └── convergence-checkpoint.md
│   │   └── SKILL.md
│   ├── mistral
│   │   ├── references
│   │   │   ├── agents.md
│   │   │   ├── audio-speech.md
│   │   │   ├── audio-transcriptions.md
│   │   │   ├── authentication.md
│   │   │   ├── batch.md
│   │   │   ├── chat.md
│   │   │   ├── classifiers.md
│   │   │   ├── files.md
│   │   │   ├── fine-tuning.md
│   │   │   ├── models.md
│   │   │   ├── more-endpoints.md
│   │   │   ├── ocr.md
│   │   │   ├── openapi.yaml
│   │   │   └── text-and-embeddings.md
│   │   ├── scripts
│   │   │   ├── _client.py
│   │   │   ├── mistral_key.py
│   │   │   ├── mistral_ocr.py
│   │   │   ├── mistral_speech.py
│   │   │   ├── mistral_transcribe.py
│   │   │   └── requirements.txt
│   │   └── SKILL.md
│   ├── naming-conventions
│   │   ├── references
│   │   │   ├── code-identifiers.md
│   │   │   ├── files-and-folders.md
│   │   │   ├── git-branches-commits.md
│   │   │   ├── naming-audit.md
│   │   │   └── rationale.md
│   │   └── SKILL.md
│   ├── openai-audio
│   │   ├── examples
│   │   │   ├── agents-sdk-browser
│   │   │   │   ├── index.html
│   │   │   │   └── server.js
│   │   │   ├── audio_samples
│   │   │   │   ├── REGENERATE.md
│   │   │   │   ├── sample-en.wav
│   │   │   │   └── sample-es.wav
│   │   │   ├── ephemeral-token-server
│   │   │   │   ├── server.js
│   │   │   │   ├── server.py
│   │   │   │   └── server.ts
│   │   │   ├── prompt-templates
│   │   │   │   ├── transcription-domain-keywords.md
│   │   │   │   ├── translation-listen-along.md
│   │   │   │   ├── voice-agent-support.md
│   │   │   │   └── voice-agent-tutor.md
│   │   │   ├── webrtc-browser-voice-agent
│   │   │   │   ├── index.html
│   │   │   │   ├── server.js
│   │   │   │   └── server.ts
│   │   │   ├── README.md
│   │   │   ├── sideband-server-control.js
│   │   │   ├── sideband-server-control.ts
│   │   │   ├── sip-webhook-handler.py
│   │   │   ├── transcription-file-fallback.py
│   │   │   ├── transcription-session.py
│   │   │   ├── transcription-session.ts
│   │   │   ├── translation-session.js
│   │   │   ├── translation-session.py
│   │   │   ├── translation-session.ts
│   │   │   ├── tts-streaming.js
│   │   │   ├── tts-streaming.py
│   │   │   ├── tts-streaming.ts
│   │   │   ├── websocket-voice-agent.js
│   │   │   ├── websocket-voice-agent.py
│   │   │   └── websocket-voice-agent.ts
│   │   ├── references
│   │   │   ├── 01-choosing-a-path.md
│   │   │   ├── 02-voice-agents.md
│   │   │   ├── 03-transcription.md
│   │   │   ├── 04-translation.md
│   │   │   ├── 05-text-to-speech.md
│   │   │   ├── 06-transport-webrtc.md
│   │   │   ├── 07-transport-websocket.md
│   │   │   ├── 08-transport-sip.md
│   │   │   ├── 09-conversation-lifecycle.md
│   │   │   ├── 10-prompting-realtime-2.md
│   │   │   ├── 11-prompting-realtime-1.5.md
│   │   │   ├── 12-tools-and-mcp.md
│   │   │   ├── 13-server-side-controls.md
│   │   │   ├── 14-costs-and-rate-limits.md
│   │   │   ├── 15-chat-completions-audio.md
│   │   │   ├── 16-custom-voices.md
│   │   │   ├── 17-beta-to-ga-migration.md
│   │   │   ├── 18-evals-and-testing.md
│   │   │   ├── 19-use-cases.md
│   │   │   └── 20-official-openai-skills.md
│   │   ├── README.md
│   │   └── SKILL.md
│   ├── personal-productivity
│   │   ├── references
│   │   │   ├── deep-work.md
│   │   │   ├── finitude.md
│   │   │   ├── focus-funnel.md
│   │   │   └── slow-productivity.md
│   │   └── SKILL.md
│   ├── pretext
│   │   ├── references
│   │   │   ├── api-reference.md
│   │   │   ├── demos-guide.md
│   │   │   ├── gotchas-and-debugging.md
│   │   │   ├── react-patterns.md
│   │   │   └── setup-guide.md
│   │   └── SKILL.md
│   ├── quiver-ai
│   │   ├── references
│   │   │   └── api-reference.md
│   │   └── SKILL.md
│   ├── security-check
│   │   ├── references
│   │   │   ├── data-security.md
│   │   │   ├── impact-assessment.md
│   │   │   ├── playbook-audit.md
│   │   │   ├── playbook-diff-review.md
│   │   │   ├── playbook-redteam.md
│   │   │   ├── severity-and-triage.md
│   │   │   ├── stack-auth-entra.md
│   │   │   ├── stack-azure-functions-ts.md
│   │   │   ├── stack-azure-platform.md
│   │   │   ├── stack-azure-sql.md
│   │   │   ├── stack-llm-mcp.md
│   │   │   ├── stack-python-fastapi.md
│   │   │   ├── stack-react-spa.md
│   │   │   ├── stack-rust.md
│   │   │   └── stack-supply-chain.md
│   │   ├── scripts
│   │   │   ├── impact_stats.py
│   │   │   └── secret_scan.py
│   │   └── SKILL.md
│   ├── shaughv-animated-brandmark
│   │   ├── references
│   │   │   └── implementation.md
│   │   └── SKILL.md
│   ├── shaughv-cdn
│   │   └── SKILL.md
│   ├── shaughv-design
│   │   ├── assets
│   │   │   ├── crests
│   │   │   │   ├── crest-info.json
│   │   │   │   ├── Shaughnessy-Crest-Footer.svg
│   │   │   │   ├── Shaughnessy-Crest-Mono.svg
│   │   │   │   └── Shaughnessy-Crest.svg
│   │   │   ├── figurines
│   │   │   │   ├── transparent
│   │   │   │   │   ├── figurine-404.webp
│   │   │   │   │   ├── figurine-footer.webp
│   │   │   │   │   ├── figurine-header.webp
│   │   │   │   │   ├── figurine-look-at-this.webp
│   │   │   │   │   └── figurine-mail.webp
│   │   │   │   ├── figurine-404.svg
│   │   │   │   ├── figurine-404.webp
│   │   │   │   ├── figurine-footer.webp
│   │   │   │   ├── figurine-header.svg
│   │   │   │   ├── figurine-header.webp
│   │   │   │   ├── figurine-look-at-this.webp
│   │   │   │   └── figurine-mail.webp
│   │   │   ├── animated-brand-mark.js
│   │   │   ├── AnimatedBrandMark.jsx
│   │   │   ├── SHAUGHV-Favicon-Dark-Alt.svg
│   │   │   ├── SHAUGHV-Favicon-Dark.svg
│   │   │   ├── SHAUGHV-Favicon-Light-Alt.svg
│   │   │   ├── SHAUGHV-Favicon-Light.svg
│   │   │   ├── SHAUGHV-Green.png
│   │   │   ├── shaughv-loader.js
│   │   │   ├── SHAUGHV-Official.svg
│   │   │   └── SHAUGHV-Orange.png
│   │   ├── examples
│   │   │   ├── footer.css
│   │   │   └── footer.html
│   │   ├── fonts
│   │   │   ├── Gail-Rock-Bold.woff2
│   │   │   ├── Gail-Rock-Extralight.woff2
│   │   │   ├── Gail-Rock-Light.woff2
│   │   │   ├── Gail-Rock-Medium.woff2
│   │   │   ├── Gail-Rock-Regular.woff2
│   │   │   ├── Gail-Rock-Semibold.woff2
│   │   │   ├── Gail-Rock-Thin.woff2
│   │   │   ├── Makira-Black.woff2
│   │   │   ├── Makira-Bold.woff2
│   │   │   ├── Makira-ExtraBold.woff2
│   │   │   ├── Makira-Medium.woff2
│   │   │   ├── Makira-Regular.woff2
│   │   │   ├── Makira-SemiBold.woff2
│   │   │   ├── PaperMono-Bold.woff2
│   │   │   ├── PaperMono-ExtraBold.woff2
│   │   │   ├── PaperMono-ExtraLight.woff2
│   │   │   ├── PaperMono-LICENSE.txt
│   │   │   ├── PaperMono-Light.woff2
│   │   │   ├── PaperMono-Medium.woff2
│   │   │   ├── PaperMono-OFL.txt
│   │   │   ├── PaperMono-Regular.woff2
│   │   │   ├── PaperMono-SemiBold.woff2
│   │   │   ├── PaperMono-Thin.woff2
│   │   │   └── PaperMono-Variable.woff2
│   │   ├── preview
│   │   │   ├── _card-base.css
│   │   │   ├── brand-animated-mark.html
│   │   │   ├── brand-cursor.html
│   │   │   ├── brand-dot-matrix.html
│   │   │   ├── brand-favicons.html
│   │   │   ├── brand-figurines.html
│   │   │   ├── brand-loader.html
│   │   │   ├── brand-lockup.html
│   │   │   ├── colors-bamboo.html
│   │   │   ├── colors-bauhaus.html
│   │   │   ├── colors-cream.html
│   │   │   ├── colors-olive.html
│   │   │   ├── colors-sage.html
│   │   │   ├── colors-semantic.html
│   │   │   ├── components-bauhaus.html
│   │   │   ├── components-buttons.html
│   │   │   ├── components-chips.html
│   │   │   ├── components-fields.html
│   │   │   ├── components-project-row.html
│   │   │   ├── components-work-tile.html
│   │   │   ├── spacing-elevation.html
│   │   │   ├── spacing-radii.html
│   │   │   ├── spacing-scale.html
│   │   │   ├── spacing-section.html
│   │   │   ├── type-body.html
│   │   │   ├── type-display.html
│   │   │   ├── type-eyebrow.html
│   │   │   ├── type-heading.html
│   │   │   └── type-mono.html
│   │   ├── references
│   │   │   ├── fonts.md
│   │   │   └── footer.md
│   │   ├── ui_kits
│   │   │   ├── personal_site
│   │   │   │   ├── About.jsx
│   │   │   │   ├── Contact.jsx
│   │   │   │   ├── data.js
│   │   │   │   ├── DotMatrix.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── index.html
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Projects.jsx
│   │   │   │   ├── README.md
│   │   │   │   ├── Skills.jsx
│   │   │   │   ├── Works.jsx
│   │   │   │   └── WorkTile.jsx
│   │   │   └── vintage_site
│   │   │       ├── AboutSection.jsx
│   │   │       ├── BauhausPrimitives.jsx
│   │   │       ├── ContactSection.jsx
│   │   │       ├── FooterSection.jsx
│   │   │       ├── HeroSection.jsx
│   │   │       ├── index.html
│   │   │       ├── Navigation.jsx
│   │   │       ├── ProjectsSection.jsx
│   │   │       ├── README.md
│   │   │       └── SkillsSection.jsx
│   │   ├── uploads
│   │   │   ├── figurine_404.svg
│   │   │   ├── figurine_header-857c9e16.svg
│   │   │   ├── figurine_header.svg
│   │   │   ├── IBMPlexMono-Bold-00f39625.woff2
│   │   │   ├── IBMPlexMono-Bold-7631bb97.woff
│   │   │   ├── IBMPlexMono-Bold.woff
│   │   │   ├── IBMPlexMono-Bold.woff2
│   │   │   ├── IBMPlexMono-BoldItalic-9d07b353.woff2
│   │   │   ├── IBMPlexMono-BoldItalic-f2f7af62.woff
│   │   │   ├── IBMPlexMono-BoldItalic.woff
│   │   │   ├── IBMPlexMono-BoldItalic.woff2
│   │   │   ├── IBMPlexMono-ExtraLight-1f8e21d5.woff
│   │   │   ├── IBMPlexMono-ExtraLight-e5efad45.woff2
│   │   │   ├── IBMPlexMono-ExtraLight.woff
│   │   │   ├── IBMPlexMono-ExtraLight.woff2
│   │   │   ├── IBMPlexMono-ExtraLightItalic-72240cf7.woff2
│   │   │   ├── IBMPlexMono-ExtraLightItalic-d70c25fe.woff
│   │   │   ├── IBMPlexMono-ExtraLightItalic.woff
│   │   │   ├── IBMPlexMono-ExtraLightItalic.woff2
│   │   │   ├── IBMPlexMono-Italic-1843c0dc.woff
│   │   │   ├── IBMPlexMono-Italic-aafe9077.woff2
│   │   │   ├── IBMPlexMono-Italic.woff
│   │   │   ├── IBMPlexMono-Italic.woff2
│   │   │   ├── IBMPlexMono-Light-1b891bd6.woff2
│   │   │   ├── IBMPlexMono-Light-eb1fccac.woff
│   │   │   ├── IBMPlexMono-Light.woff
│   │   │   ├── IBMPlexMono-Light.woff2
│   │   │   ├── IBMPlexMono-LightItalic-b0dfe403.woff2
│   │   │   ├── IBMPlexMono-LightItalic-bd04b7c0.woff
│   │   │   ├── IBMPlexMono-LightItalic.woff
│   │   │   ├── IBMPlexMono-LightItalic.woff2
│   │   │   ├── IBMPlexMono-Medium-ad59ae21.woff2
│   │   │   ├── IBMPlexMono-Medium-f1b29d16.woff
│   │   │   ├── IBMPlexMono-Medium.woff
│   │   │   ├── IBMPlexMono-Medium.woff2
│   │   │   ├── IBMPlexMono-MediumItalic-723b6432.woff
│   │   │   ├── IBMPlexMono-MediumItalic-e53906ea.woff2
│   │   │   ├── IBMPlexMono-MediumItalic.woff
│   │   │   ├── IBMPlexMono-MediumItalic.woff2
│   │   │   ├── IBMPlexMono-Regular-0af5656d.woff2
│   │   │   ├── IBMPlexMono-Regular-134dcad4.woff
│   │   │   ├── IBMPlexMono-Regular.woff
│   │   │   ├── IBMPlexMono-Regular.woff2
│   │   │   ├── IBMPlexMono-SemiBold-3b6fcb91.woff
│   │   │   ├── IBMPlexMono-SemiBold-a7cc7bc1.woff2
│   │   │   ├── IBMPlexMono-SemiBold.woff
│   │   │   ├── IBMPlexMono-SemiBold.woff2
│   │   │   ├── IBMPlexMono-SemiBoldItalic-86ffa47b.woff
│   │   │   ├── IBMPlexMono-SemiBoldItalic-c3622eb4.woff2
│   │   │   ├── IBMPlexMono-SemiBoldItalic.woff
│   │   │   ├── IBMPlexMono-SemiBoldItalic.woff2
│   │   │   ├── IBMPlexMono-Thin-183c7b9c.woff
│   │   │   ├── IBMPlexMono-Thin-72ad3a05.woff2
│   │   │   ├── IBMPlexMono-Thin.woff
│   │   │   ├── IBMPlexMono-Thin.woff2
│   │   │   ├── IBMPlexMono-ThinItalic-3f0645c4.woff2
│   │   │   ├── IBMPlexMono-ThinItalic-f62a3613.woff
│   │   │   ├── IBMPlexMono-ThinItalic.woff
│   │   │   ├── IBMPlexMono-ThinItalic.woff2
│   │   │   ├── Makira-Black.woff
│   │   │   ├── Makira-Black.woff2
│   │   │   ├── Makira-Bold.woff
│   │   │   ├── Makira-Bold.woff2
│   │   │   ├── Makira-ExtraBold.woff
│   │   │   ├── Makira-ExtraBold.woff2
│   │   │   ├── Makira-Medium.woff
│   │   │   ├── Makira-Medium.woff2
│   │   │   ├── Makira-Regular.woff
│   │   │   ├── Makira-Regular.woff2
│   │   │   ├── Makira-SemiBold.woff
│   │   │   ├── Makira-SemiBold.woff2
│   │   │   ├── SHAUGHV AWS Logo List.md
│   │   │   ├── SHAUGHV-Favicon-Dark-Alt.svg
│   │   │   ├── SHAUGHV-Favicon-Dark.svg
│   │   │   ├── SHAUGHV-Favicon-Light-Alt.svg
│   │   │   ├── SHAUGHV-Favicon-Light.svg
│   │   │   ├── SHAUGHV-Green.png
│   │   │   ├── SHAUGHV-Official-63b30679.svg
│   │   │   ├── SHAUGHV-Official.svg
│   │   │   ├── SHAUGHV-Orange.png
│   │   │   └── Unbounded-Blond.woff2
│   │   ├── BRANDMARK.md
│   │   ├── colors_and_type.css
│   │   ├── README.md
│   │   └── SKILL.md
│   ├── shaughv-gcs-storage
│   │   └── SKILL.md
│   ├── subagent-model-preference
│   │   ├── references
│   │   │   ├── repo-snippet.md
│   │   │   └── user-global-snippet.md
│   │   └── SKILL.md
│   ├── ttdr
│   │   ├── references
│   │   │   └── examples.md
│   │   └── SKILL.md
│   ├── usage-statusline
│   │   ├── references
│   │   │   └── build-guide.md
│   │   ├── scripts
│   │   │   ├── install.mjs
│   │   │   └── statusline-usage.mjs
│   │   └── SKILL.md
│   ├── wb300
│   │   ├── references
│   │   │   ├── agent-json.md
│   │   │   ├── install.md
│   │   │   └── tui.md
│   │   └── SKILL.md
│   └── workflow-optimization
│       ├── references
│       │   ├── business-process-reengineering.md
│       │   ├── checklists.md
│       │   ├── core-principles.md
│       │   ├── diagramming.md
│       │   ├── lean.md
│       │   ├── meta-workflow-checklist.md
│       │   ├── prioritization.md
│       │   ├── process-optimization.md
│       │   ├── six-sigma.md
│       │   ├── theory-of-constraints.md
│       │   └── total-quality-management.md
│       └── SKILL.md
├── .gitattributes
├── .gitignore
├── AGENTS.md
├── build-codex-plugin.ps1
├── CHANGELOG.md
├── CLAUDE.md
├── CODEX_PROJECT.md
├── HUMAN_CHANGELOG.md
└── README.md
```
