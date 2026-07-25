# Changelog

All notable changes to this plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

A plain-English companion lives at [HUMAN_CHANGELOG.md](./HUMAN_CHANGELOG.md) and is kept in lockstep with this file — see the changelog rule in [CLAUDE.md](./CLAUDE.md).

## [0.37.1] — 2026-07-25

Improved: `agentic-prompt-engineering` now safely routes an unspecified invocation from the active
conversation and compiles every orchestrated subagent brief through the same evidence contract in
Claude Code and Codex.

### Improved
- `skills/agentic-prompt-engineering/SKILL.md` — adds a top-level invocation resolver. When the
  operator does not name Author, Audit, Operate, Evaluate, a domain, or an overlay, it infers the
  final deliverable from the latest applicable unresolved request, explicit corrections, canonical
  task state, supplied artifacts, and governing instructions; builds a compact routing contract;
  and selects only relevant conditional guidance. A vague consequential request now surfaces the
  proposed interpretation and asks one compact batch of still-unanswered material questions before
  committing to a long-horizon route. Derived routing cannot revive stale instructions, silently
  assume material operator choices, or create new authority.
- The resolver is also an automatic escalation path when an underspecified long-horizon task or
  difficult problem needs better representation, method families, premises, or oracles. An
  execution that already satisfies the separate recurrence gate invokes `loop-escape` and
  continues from its checkpoint rather than merely suggesting another Skill; expected long
  operations, changed experiments, and declared independent replication are not mislabeled.
- Top-level and nested orchestrators now compile every authorized dispatch through the Skill.
  Branch prompts combine the normal repository/tool context with branch-specific objective,
  starting evidence, scope, method family, artifacts, next action window, acceptance oracle,
  loop/retirement policy, valid terminal states, and evidence receipt. The orchestrator explicitly
  requests `agentic-prompt-engineering` when the child runtime exposes it and embeds the equivalent
  contract otherwise; loading a Skill in the parent is never assumed to propagate automatically.
- `references/long-horizon-control.md` — adds a portable branch-brief schema, cross-runtime Claude
  Code/Codex invocation guidance, nested-orchestrator boundary, contamination protection, and the
  rule that a branch cannot expand authority or claim global completion.

### Behind the scenes
- Claude/Codex manifests bumped `0.37.0` → `0.37.1`, discovery copy now exposes self-routing and
  subagent brief compilation, and the generated Codex package was refreshed from root sources.
- Revalidated the existing `loop-escape` source, generated Codex copy, trigger contract, relative
  references, and standalone recovery output; no loop-escape change was necessary.

## [0.37.0] — 2026-07-24

Added: a compact **`agentic-prompt-engineering`** Skill for designing, auditing, applying, and
evaluating prompts for long-horizon software, data, research-mathematics, and scientific work.
Improved: the existing planning, recovery, reasoning, debugging, handoff, and workflow Skills now
share evidence-typed state without becoming one giant universal prompt.

### Added
- `skills/agentic-prompt-engineering/SKILL.md` — adds the portable core: falsifiable outcome and
  authority contracts, load-bearing-premise checks, short information-bearing action windows,
  causal attempt signatures, claim-matched oracles, completion receipts, mechanism-specific
  response/route/task stopping, typed handoffs, and truthful partial/blocked/refuted/unknown
  outcomes. Routine work stays proportional; active stalls still route to `loop-escape`.
- `skills/agentic-prompt-engineering/references/` — adds one-level conditional references for
  task-contract construction, prompt wording/schemas/examples, long-horizon branching and fresh
  review, software/data oracles, Erdős-level mathematics and executable scientific discovery,
  dated Fable 5 versus Opus 5 overlays, a dated GPT-5.6 Sol/Codex overlay for lean outcome-first
  prompts and surgical eval-driven migration, and prompt/Skill evaluation with compact baselines,
  ablations, held-out cases, false-success checks, and repeat-run reliability.
  The mathematics adapter also makes quantifier games, nearest misses, representation parity,
  probabilistic dual certificates, post-success mechanism digestion, and a three-arm
  bare/compact/full control explicit; the science adapter separates ranking from measurement.

### Improved
- `loop-escape` — expands attempts with causal hypothesis, strategy family, oracle, prediction,
  contradiction, and state delta; distinguishes token, epistemic, action-policy, and
  false-premise loops; separates response/route/task stops; and replays the original and broader
  acceptance oracles after repair. Two equivalent cycles remain a guarded audit trigger, not a
  universal task limit.
- `iterative-plan` — treats turn, slice, task, and milestone counts as ordinary product-planning
  defaults; supports conjunctive acceptance rows and truthful non-success; tests cheap
  load-bearing premises before long chains; records slice receipts; and permits genuinely
  independent parallel work without weakening WIP discipline.
- `handoff` and `critical-thinking` — replace transcript-style live context with compact typed
  decision packets and stable pointers to lossless archives. Handoffs now separate verified facts,
  hypotheses, evidence receipts, retired routes, unresolved contradictions, and the exact next
  action; runtime/model and secret references are portable. When an active task system already
  owns continuation state, that task packet remains canonical and a standalone handoff is created
  only when explicitly requested or needed by a receiver without task access. Critical-thinking's
  local Decided/Directed/Blocked labels no longer substitute for an owning task's evidence-bearing
  terminal state.
- `workflow-optimization` — replaces mandatory exhaustive six-lens ceremony with focused,
  comprehensive, and design modes. Every lens gets an applicability disposition; only
  evidence-distinct lenses run deeply; improvements require a baseline, causal hypothesis,
  bounded pilot, and remeasurement receipt; diagrams and clarification waits are conditional.
- `logical-reasoning` — enriches retry audits with causal hypotheses, strategy families,
  competing predictions, oracles, state deltas, and re-entry conditions while routing
  research-mathematics search to the new adapter.
- `subagent-model-preference` — advances the named Opus lineage from Opus 4.8 to Opus 5 with its
  default/maximum 1M context while preserving `xhigh` preferred, `max` when needed, Sonnet 5 for
  fan-out, and the rule that distinct Fable and Mythos classes require an explicit preference
  change rather than an automatic remap.
- The software/data adapter now routes full lifecycle work—features, architecture, refactors,
  migrations, performance/reliability, release/deploy, transformations, data incidents,
  backfills, streaming/incremental correctness, and cost—through mode-specific contracts and
  acceptance oracles instead of forcing everything through bug repair or analytical SQL.
- Prompt/Skill evaluation now freezes task/spec versions, starting state, contamination and
  evaluator-change policy; reports repeat-run terminal distributions and trajectory burden; and
  locates failures at the capability, prompt, scaffold/tool, runtime, or evaluator layer before
  changing prose.
- `debugging-framework` and `bug-triage` — allow the strongest alternative oracle when exact
  reproduction is impossible, bound non-informative routes, protect evaluator integrity, make
  regression evidence proportional to the claim, distinguish root-cause repair from authorized
  containment, keep sibling sweeps discovery-first, and pause only at real authority/risk
  boundaries.

### Behind the scenes
- `README.md` — documents the new Skill, invocation forms, progressive-disclosure package, and
  revised specialist boundaries.
- `critical-thinking` now keeps its executable core below 500 lines and routes detailed
  cross-cutting disciplines to a direct reference; every touched long reference includes a
  compact contents map for selective loading.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, and
  `.codex-plugin/plugin.json` — version bumped `0.36.1` → `0.37.0`; discovery descriptions and
  keywords expose prompt engineering, long-horizon work, GPT-5.6 Sol guidance, completion
  receipts, and Erdős-level search.
- No agent definitions, hooks, commands, MCP servers, build system, or legacy `.skill` archives
  were added.

## [0.36.1] — 2026-07-23

Fixed: **`loop-escape`** is now a comprehensive, self-contained recovery guide rather than a router whose usefulness depends on other skills being visible. This preserves one portable recovery surface for Claude Code and Codex without adding hooks, agents, commands, duplicate recovery skills, a general index, or machine-specific standing instructions.

### Changed
- `skills/loop-escape/SKILL.md` — embeds the strategy, scope, evidence, observability, and concrete-defect recovery lenses directly. Specialist skills remain available for optional depth, but the checkpoint, smallest working rung, discriminating next action, and continued execution no longer depend on loading them.
- `skills/loop-escape/SKILL.md` — adds public-safe lessons from a long-running stalled recovery: inherit verified handoffs instead of restarting settled audits; promptly put an authorized validated candidate in front of the deciding oracle; repair silent reporting before changing behavior; let the owner explicitly disposition expensive nonessential gates; test the real runtime in an uncontaminated environment; change tools when the current tool cannot observe the objective; and leave durable conclusions for the next session.
- `skills/loop-escape/SKILL.md` and `skills/loop-escape/references/convergence-checkpoint.md` — scale the recovery ceremony to the stakes and describe the four recovery lenses without prescribing a rigid state machine. The full ledger remains available for long, expensive, or release-critical stalls, while small loops can use an equivalent compact checkpoint.
- `README.md` — documents that automatic matching depends on each runtime's skill-description budget and that explicit invocation is the reliable supported escape hatch. It also makes clear that the skill stands alone and sibling skills are optional depth.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.36.0` → `0.36.1`.
- `plugins/shaughv-code/` — regenerated from the root sources for Claude/Codex parity.

## [0.36.0] — 2026-07-23

Added: **`loop-escape`**, a narrow convergence-recovery router for stalled, repetitive, or over-ambitious work. Improved: **`critical-thinking`**, **`iterative-plan`**, and **`logical-reasoning`** now share an evidence-aware stop condition for materially identical cycles while preserving their distinct ownership of reframing, progressive delivery, and inference.

### Added
- `skills/loop-escape/SKILL.md` — front-loads portable automatic-selection signals such as "going in circles," "same result twice," "no new evidence," "stuck for hours/days," "task is too ambitious," and "get the basic version working first." Negative boundaries protect expected long operations, passive monitoring, meaningful iteration, and intentionally independent replication. Explicit recovery is available as `/shaughv-code:loop-escape` in Claude Code and `$shaughv-code:loop-escape` in Codex.
- `skills/loop-escape/references/convergence-checkpoint.md` — adds a reusable recovery canvas and attempt ledger covering the objective, last known-good state, functional versus qualification bars, the last two state/intervention/observation/information signatures, repetition verdict, smallest working rung, next discriminating action, and stop condition.

### Changed
- `skills/critical-thinking/` — adds stuck-loop and strategy-change routing, a two-identical-cycle checkpoint, state/action/evidence delta checks, distinct alternative strategy families, and an explicit distinction between intentional replication and blind retrying.
- `skills/iterative-plan/` — adds loop-triggered re-slicing into a smallest end-to-end functional rung, separately demoable integration/hardening rungs, and remaining qualification evidence. Expensive optional gates now require an owner, explicit disposition, and backlog placement; standing checks cover validation-oracle visibility, target runtime, silent reporting failures, and observer contamination.
- `skills/logical-reasoning/` — adds attempt-signature audits and the classifications `new evidence`, `valid replication`, and `duplicate cycle`; distinguishes independent replication from pseudoreplication and correlated retries; and changes proof method when an unchanged transformation stalls.
- `README.md` — documents the router, both invocation forms, probabilistic automatic selection, negative boundaries, and the ownership boundaries of the four affected skills. No general plugin index, hook, agent, command, or MCP server was added.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.35.0` → `0.36.0`; descriptions and keywords now expose loop escape, convergence recovery, evidence-aware retries, and progressive slicing.
- `plugins/shaughv-code/` — regenerated from root sources; the Claude surface contains 31 skills and the Codex package contains 30, excluding only the Claude-specific `subagent-model-preference`.

## [0.35.0] — 2026-07-14

Added: a fourth bundled MCP server, **`pipedream`**, at `https://mcp.pipedream.net/v2` on both the Claude Code and Codex surfaces. Improved: the **`git-workflow`** skill still defaults to its full workbranch/worktree/PR discipline, but now accepts simple owner approval for a direct/default-branch route without treating that route override as permission to skip quality checks.

### Added
- `.mcp.json` — bundles `pipedream` over Streamable HTTP transport (`"type": "http"`). Pipedream's end-user endpoint uses OAuth on first connection, so the committed static URL is not a credential; users sign in, select the apps to expose, and authorize the MCP client. The short server name avoids adding unnecessary length to Pipedream's generated tool names.
- `.codex/config.toml` — adds the matching `[mcp_servers.pipedream]` URL-only block for Codex sessions run inside this repository.
- `CODEX_PROJECT.md` — adds the required project-status reference with a TL;DR, architecture/release summary, current goals, and complete workspace tree.

### Changed
- `skills/git-workflow/SKILL.md` — replaces reason-gated, prescribed-phrase overrides with lightweight owner authorization. Clear instructions such as "I approve a push to main" or "push directly to the default branch when ready" now authorize the delivery route immediately and remain valid after checks finish.
- `skills/git-workflow/{policy-violations.md,pre-pr-gates.md,workbranches.md,multi-agent.md}` and their applicable `references/` counterparts — align override/sign-off guidance with the new rule. The full workbranch/worktree/PR path remains the recommendation and default; route approval never silently accepts a failing test, secret finding, or security failure, which must be disclosed separately.
- `skills/git-workflow/scripts/check-branch.sh` — adds `--allow-main` for an explicitly approved direct default-branch push while continuing branch-sync and trunk-CI checks.
- `skills/git-workflow/scripts/secret-scan.sh` — aligned with the full-tree Tier-1 checker (full mode by default, optional weaker `--diff` mode clearly labeled) so the packaged helper no longer performs a narrower scan than the policy requires.
- `build-codex-plugin.ps1` — makes the mirror/source path guard platform-aware instead of hard-coding Windows separators, so regeneration remains path-safe and now works under PowerShell on macOS as well as Windows.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.34.0` → `0.35.0`; Pipedream added to the MCP descriptions/keywords while the three plugin surfaces remain in lockstep.
- `README.md`, `AGENTS.md`, `CLAUDE.md` — document all four bundled MCP servers and the Git workflow's "delivery route, not quality bar" owner-override policy.
- `plugins/shaughv-code/` — regenerated from the root authoring sources for Claude/Codex parity.

## [0.34.0] — 2026-07-10

Added: a third bundled MCP server, **`shaughv-health`** — Emmett's personal health-data MCP at `https://health.emmetts.dev/api/mcp` — on both the Claude Code and Codex surfaces.

### Added
- `.mcp.json` — bundles a third MCP server, `shaughv-health`, pointing at `https://health.emmetts.dev/api/mcp` over Streamable HTTP transport (`"type": "http"`). The URL is OAuth-gated: installers see the server appear, then authenticate via Google sign-in (restricted to an allowlisted account) on first tool use, so the link committed to this public repo is not itself a credential. The server supports Dynamic Client Registration, so no OAuth-specific config is required beyond `type`/`url`. Exposes Emmett's health/nutrition/sleep/exercise query and logging tools.
- `.codex/config.toml` — hand-added a matching `[mcp_servers.shaughv-health]` block (URL-only TOML shape) so Codex sessions run inside this repo pick up the server before the plugin is installed.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — version bumped `0.33.0` → `0.34.0`; `health` and `shaughv-health` added to `keywords`; plugin description's MCP clause updated to list Shaughv Health alongside the Remotion documentation and Craft Docs MCP servers.
- `.codex-plugin/plugin.json` — version bumped `0.33.0` → `0.34.0`; `interface.longDescription` updated to name Shaughv Health in the bundled-MCP-servers clause.
- `README.md` — "MCP servers bundled" table extended with a `shaughv-health` row; "bundled MCP server" pluralized in the Claude install blurb; the Codex-install-section server list and the `.mcp.json` comment in the repo-layout tree updated to include Shaughv Health.
- `CLAUDE.md`, `AGENTS.md` — the "Bundled non-skill components" `.mcp.json` bullet rewritten to enumerate all three servers (Remotion documentation, Craft Docs, and Shaughv Health), backfilling the `craft-docs` entry that was previously never added.
- `plugins/shaughv-code/` — regenerated (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.33.0] — 2026-07-09

Changed: **`critical-thinking`** absorbs **`strategic-thinking`** as its seventh framework and — together with **`logical-reasoning`** — is reframed **agent-first**: the default consumer is an agent slowing down to reason through its own in-progress work (self-check mode), with human facilitation retained as the secondary mode. The **`spawn`** skill is removed.

### Added
- `skills/critical-thinking/references/strategic.md` — the Strategic / Adversarial framework's reference file, condensed from the old strategic-thinking SKILL.md: triage gate, the five facets + Strategic Picture template, signal→lens routing, the Lens Ledger (now a section of the scaled working canvas, not a separate mandatory file), Win-Without-Fighting bias + its defeaters, the Ethics & Proportionality guard in full, and the review loop — reframed so the agent war-games the opponent itself (in facilitation the operator confirms the constraint read; in autonomous self-application the opponent read is flagged as the weakest-evidenced, highest-leverage assumption and confidence-banded hard).
- `skills/critical-thinking/references/strategic/` — the four lens distillations moved (git renames) from `skills/strategic-thinking/references/`: `art-of-war.md`, `thirty-six-stratagems.md`, `book-of-five-rings.md`, `game-theory-and-mental-levels.md`.
- `skills/critical-thinking/references/strategic/annexes/art-of-war-full.md` — the complete public-domain Lionel Giles (1910) translation of *The Art of War* (Project Gutenberg-derived etext incl. Giles' introduction and the classical commentators' bracketed notes), OCR-cleaned: 242 artifact lines removed (page numbers, running heads) with the word-delta verified to exactly match, 20 hand-verified page-break paragraph rejoins, chapter-heading levels normalized, and the known "element in water" → "in war" OCR fix. Reference-only annex — the distilled lens stays the working layer.
- `skills/critical-thinking/SKILL.md` — the Strategic / Adversarial routing row in §1C, a framework quick-reference entry, reference-index entries for `strategic.md` / the lenses / the annex, a Decision-Making ↔ Strategic routing clause, and a seventh failure mode (skipping the forced pause / divergence / sanity check).

### Changed
- `skills/critical-thinking/SKILL.md` — rewritten agent-first: new frontmatter description (969 chars, under the 1024 cap); §1B modes now led by **Self-check (default)** with Facilitate demoted to the secondary human mode; the facilitation machinery recast as self-check discipline (batches = forced pause points, active listening = answer-checking, transitions close the step, the closing sanity check mandatory before reporting in any mode); §1D working canvas now **scales to stakes** (inline for quick self-checks; a file for high-stakes / long-running / auditable work and all human-facilitated sessions); Checkpoints split into self-imposed vs. operator-directed; Stacking drops the external `strategic-thinking` entry and gains the `workflow-optimization` hand-off.
- `skills/critical-thinking/references/` — full context-aware audience sweep across the reference files (`decision-making`, `contemplating`, `cognitive-scaffolds`, `devils-advocacy`, `design`, `sensemaking`, `problem-solving`, `working-canvas`, `visual-models/{comparison,structure,probability,interactive}`, and the four moved lens files): facilitatee-sense "the user" reframed to the agent / "the operator" with each framework's meaning preserved exactly. Deliberately kept: `design.md`'s end-user/stakeholder tokens, `contemplating.md`'s human-facing emotional framing, `cognitive-scaffolds.md`'s facilitation-only mechanics (Active Recall) now explicitly marked, and `interactive.md` / `html/`'s artifact-facing "the human".
- `skills/critical-thinking/references/working-canvas.md` — scale-to-stakes section added to match §1D; template's Framework/Mode lines cover all seven frameworks + Self-check; `strategic-thinking` dropped from the stacked-skills line.
- `skills/logical-reasoning/SKILL.md` — frontmatter description (865 chars) + intro reframed to the agent applying formal rigor to its OWN load-bearing, contested conclusion before asserting it; its `references/` untouched (already audience-clean).
- Cross-references repointed from `strategic-thinking` to "`critical-thinking` (Strategic / Adversarial framework)": `skills/iterative-plan/SKILL.md`, `skills/workflow-optimization/SKILL.md`, `skills/personal-productivity/SKILL.md`.
- `skills/subagent-model-preference/SKILL.md` — dropped the `/spawn` playbook parenthetical and removed the `spawn` bullet from Cross-references.
- `.claude-plugin/plugin.json` + `.codex-plugin/plugin.json` — descriptions updated (critical thinking now "seven agent-first thinking frameworks incl. strategic/adversarial reasoning via Art of War, 36 Stratagems, Five Rings, and game theory"; the "/spawn orchestration playbook" / "spawn orchestration" and "strategic thinking" clauses removed).
- `README.md` — `critical-thinking` and `logical-reasoning` rows rewritten for the new framing; `spawn` and `strategic-thinking` rows removed.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.32.0` → `0.33.0`.
- `plugins/shaughv-code/` — regenerated (`pwsh ./build-codex-plugin.ps1 -Check` passes).

### Removed
- `skills/spawn/` — the manual `/spawn` two-phase orchestration playbook, retired.
- `skills/strategic-thinking/` — merged into `critical-thinking` (content preserved as `references/strategic.md` + `references/strategic/`); the standalone skill is gone.
- Keywords: `spawn` from `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`; `subagent` from `.codex-plugin/plugin.json` (orphaned on the Codex surface — spawn removed, and `subagent-model-preference` was already excluded from the Codex package).

## [0.32.0] — 2026-07-06

Changed: the **`subagent-model-preference`** skill is now scoped to Claude Code / Anthropic harnesses only, and is excluded from the Codex package — its Opus/Sonnet model classes and `xhigh`/`max` effort levels have no valid mapping on Codex/GPT.

### Added
- `build-codex-plugin.ps1` — a `$ExcludeSkills` list (currently `subagent-model-preference`) that the copy loop skips by top-level skill directory. Both the real build and `-Check` call `Build-Package`, so the exclusion is enforced identically on regenerate and validate. Header comment + inline comment document the exclusion and how to extend it.

### Changed
- `skills/subagent-model-preference/SKILL.md` + `references/repo-snippet.md` — added a **Scope** blockquote and a frontmatter `description` clause marking the skill Claude Code / Anthropic-harness only (any non-Anthropic agent should ignore it — its Opus/Sonnet model classes and `xhigh`/`max` effort levels have no mapping elsewhere), and stripped the skill body + repo-install snippet of every Codex / `AGENTS.md` / other-harness reference so the convention reads as Claude-only throughout. The in-skill scope note is the safety net for the skills.sh install path, which delivers the skill file directly and can't be reached by the Codex-package exclusion.
- `.codex-plugin/plugin.json` — dropped the "standing subagent model/effort preference convention" clause from the `description` (added a note that the skill is intentionally omitted from the Codex surface) and removed the now-orphaned `model-preference`, `opus`, `sonnet`, `effort` keywords (kept `subagent`, still relevant to `spawn`).
- `AGENTS.md` + `CLAUDE.md` — the Codex-surface descriptions now note the package is a copy of root `skills/` **minus** the `$ExcludeSkills` Claude-only skills, and how to exclude a future one.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.31.0` → `0.32.0`.
- `plugins/shaughv-code/` — regenerated; `skills/subagent-model-preference/` no longer present in the Codex package (`pwsh ./build-codex-plugin.ps1 -Check` passes).

### Removed
- `plugins/shaughv-code/skills/subagent-model-preference/` — the Claude-only skill is dropped from the tracked Codex package. It remains fully present in the Claude surface (root `skills/`).

## [0.31.0] — 2026-07-06

Added: **`usage-statusline`** row 1 now shows the active thinking/effort level beside the model, and the session's launch-directory name beside the git branch.

### Added
- `skills/usage-statusline/scripts/statusline-usage.mjs` —
  - **Thinking level:** `effort.level` from the stdin payload renders dim right after the model name (`Fable 5 xhigh`); when `thinking.enabled === false` it shows `no-think` instead (the effort level is inert in that state). Field availability confirmed with a live payload capture on Claude Code 2.1.201.
  - **Launch directory:** the basename of `workspace.project_dir` joins the branch segment (`shaughv-code ⎇ main`) via a new separator-tolerant `baseName()` helper; outside a git repo only the directory name shows.
  - Selftest 55 → 62 assertions (`baseName` ×3, effort shown, launch-dir shown, `no-think` behavior ×2).

### Changed
- `skills/usage-statusline/SKILL.md` + `references/build-guide.md` — example renders, field tables, §0 as-built decisions, and the §2 stdin schema (now documents `effort` / `thinking`); §5 verbatim script re-spliced byte-identical.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.30.0` → `0.31.0`.
- `plugins/shaughv-code/` — regenerated (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.30.0] — 2026-07-06

Removed: the **`usage-statusline`** pace tick, by request. Everything else from the 0.27.0–0.29.0 run stays — trend arrows, colored ctx %, high-usage decimals, eighth-precision fill on the tinted track, the deeper thinned sample history, and the git-branch segment.

### Removed
- `skills/usage-statusline/scripts/statusline-usage.mjs` — the `▓` pace-tick overlay and everything that existed only to support it: `TICK`, `TICK_COLOR`, `elapsedFrac()`, the `FIVE_HOUR_SECS`/`SEVEN_DAY_SECS` window-length constants, and `bar()`'s `tickFrac` parameter. Bars render fill + dotted tinted track only. Selftest 66 → 55 assertions (tick and elapsed-fraction tests dropped; all other coverage intact).
- `skills/usage-statusline/SKILL.md` + `references/build-guide.md` — pace-tick table rows, §0 bullet, and tunable mentions removed; example renders updated; §5 verbatim script re-spliced byte-identical.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.29.0` → `0.30.0`.
- `plugins/shaughv-code/` — regenerated (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.29.0] — 2026-07-06

Changed: **`usage-statusline`** gets its eighth-block sub-cell precision back — on a tinted track, so the continuous look from 0.28.0 is kept too.

### Changed
- `skills/usage-statusline/scripts/statusline-usage.mjs` — 0.28.0 removed the eighth-block partial cell to kill the black gap at the fill edge; this restores it and solves the gap properly: every inner bar cell now carries a subtle dark background (`TRACK_BG`, 256-color 236), so a partial cell's unpainted remainder renders as tinted track instead of terminal-black. Result: 1/80-bar fill precision AND a continuous track. `TRACK_BG` is a tunable — set it to `""` on light terminal themes.
- Selftest 65 → 66 assertions (eighth-sliver renders for 44%/23%, tinted track present).
- `skills/usage-statusline/SKILL.md` + `references/build-guide.md` — example renders, §0 as-built decision (whole-cell fill → sub-cell fill on a tinted track), constants list, §8 tunables; §5 verbatim script re-spliced byte-identical.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.28.0` → `0.29.0`.
- `plugins/shaughv-code/` — regenerated (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.28.0] — 2026-07-06

Fixed: the **`usage-statusline`** bars no longer show bare-background "black holes" — the pace tick is now a full-cell bright-white (silver) `▓` marker, and the fill rounds to whole cells so the dotted empty texture runs right up to the fill edge.

### Fixed
- `skills/usage-statusline/scripts/statusline-usage.mjs` — the pace tick was a thin `┃` glyph, which left the rest of its character cell as bare terminal background: on screen that read as black bars surrounding a thin silver line. The tick is now `TICK = "▓"` painted `TICK_COLOR` (bright white, `\x1b[97m`): it fills its entire cell (no background shows through) while staying visually distinct from the solid `█` fill and the dim `░` empties, including in monochrome. Both are tunables. Yellow was considered for the tick and rejected — it collides with the 50–75% fill color, which would hide the tick exactly mid-range.
- `skills/usage-statusline/scripts/statusline-usage.mjs` — the bar fill now rounds to **whole cells** (the sub-cell eighth-block boundary is gone). A partial-cell glyph painted only its left fraction and left the rest as bare background — a black gap between the fill edge and the dotted empty cells. Rounding lets the `░` texture start immediately where the fill ends; per-cell resolution is 10%, and the precise value remains the printed percentage beside the bar.
- Selftest 62 → 65 assertions (new: tick painted in `TICK_COLOR`; whole-cell fill leaves no background gap ×2; the glyph-position assertions carry over since `▓` stays unique within a bar).

### Changed
- `skills/usage-statusline/SKILL.md` + `references/build-guide.md` — sample renders, field-table row, §0 pace-tick rationale, §8 tunables updated; §5 verbatim script re-spliced byte-identical.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.27.0` → `0.28.0`.
- `plugins/shaughv-code/` — regenerated (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.27.0] — 2026-07-06

Changed: the **`usage-statusline`** canonical script advances — pace ticks on both bars, `↗`/`↘` trend arrows, colored context %, one-decimal precision near the cap, a git-branch segment, and a deeper, age-thinned sample history that keeps the burn-rate trend accurate under heavy multi-agent load. Also trimmed a work-only cross-reference from `subagent-model-preference`.

### Changed
- `skills/usage-statusline/scripts/statusline-usage.mjs` — the standardized build advances:
  - **Pace ticks:** each bar overlays a `┃` at the elapsed-time position of its window (start = `resets_at` − window length; no extra data needed) — fill past the tick = running hot, short of it = cool. Zero added width.
  - **Trend arrows:** the `~time left` text carries `↗`/`↘` alongside its red/green trend color (dual-encoded for theme quirks and color-blindness; steady = no arrow; the <30 min bold-red urgency keeps the arrow).
  - **Colored `ctx %`** using the same `colorFor` thresholds as the bars.
  - **High-usage precision:** 5h/7d percentages show one decimal at ≥ `PCT_DECIMAL_AT` (90); integer below, trailing `.0` trimmed.
  - **Trend accuracy under load:** `MAX_SAMPLES` `512` → `4096` (backstop) plus new age-based thinning (`THIN_AFTER = 15 min`) — samples newer than 15 min keep full density, older ones are decimated to the `MIN_SAMPLE_GAP` (20 s) cadence, so burst traffic (e.g. several concurrent sessions changing the percentage every second) can never crowd the 10-min trend look-back or the slow slope out of the retained series. Previously a sustained burst could shrink retained history below the look-back and silently flatten the trend signal during exactly the periods it matters.
  - **Git branch in row 1** (`⎇ <branch>`): resolved by pure file reads of `.git/HEAD` — worktree-aware (`gitdir:` files parsed), detached HEAD → 7-char SHA, omitted outside a repo. Never spawns a process, so it is safe at `refreshInterval: 1`.
  - Selftest grown 42 → 62 assertions (ticks, `fmtPct`, `elapsedFrac`, `parseGitHead`, arrows incl. the urgency+arrow interaction, thinning, colored ctx, render ticks).
- `skills/usage-statusline/SKILL.md` + `references/build-guide.md` — sample renders, field tables, §0 as-built decisions and constants, §4 retention/thinning, §5 verbatim script (re-spliced byte-identical), and §8 tunables updated in lockstep with the script.
- `skills/subagent-model-preference/SKILL.md` — dropped the `create-mission-control-task` cross-reference (work-only skill with no counterpart in this bundle); the `iterative-plan` cross-reference remains.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.26.0` → `0.27.0`.
- `plugins/shaughv-code/` — regenerated (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.26.0] — 2026-07-06

Added: the **`subagent-model-preference`** skill — the operator's standing model/effort convention for every subagent (the Agent tool including Explore/Plan agents, Workflow `agent()` calls, custom agent types), the plugin's canonical copy of the user-global preference set 2026-07-01.

### Added
- `skills/subagent-model-preference/` — SKILL.md carrying the convention (Opus 4.8 [1m] at `xhigh`, `max` when needed, for deep synthesis/planning/verification; Sonnet 5 at `max`, `xhigh` when lighter, for high-parallelism fan-out; never Haiku/budget classes, never auto-substitute the Fable/mythos class, never below `xhigh` effort), the forward-mapping procedure for advancing the Opus/Sonnet classes when new Anthropic lineups ship, and cross-references to `spawn` / `iterative-plan`.
- `skills/subagent-model-preference/references/user-global-snippet.md` and `references/repo-snippet.md` — paste-able installs of the convention for `~/.claude/CLAUDE.md` (any machine) and repo-level `CLAUDE.md` / `AGENTS.md` (any harness), for surfaces that don't load the plugin.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.25.0` → `0.26.0`; descriptions mention the new convention skill; added `subagent` / `model-preference` (and `opus` / `sonnet` / `effort` where the manifest carries the longer keyword list) keywords.
- `README.md` — added the `subagent-model-preference` skill row.
- `plugins/shaughv-code/` — regenerated to include the new skill (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.25.0] — 2026-06-26

Removed: the **`perplexity-search`** skill (web search and AI-grounded answers via the Perplexity Agent, Search, and Sonar APIs).

### Removed
- `skills/perplexity-search` — the Perplexity web-search / AI-grounded-answers skill.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.24.0` → `0.25.0`; dropped the `perplexity` keyword and the Perplexity mention from the descriptions / Codex `longDescription`.
- `README.md` — removed the `perplexity-search` skill row and its entry in the repo-layout tree.
- `plugins/shaughv-code/` — regenerated; the Codex package no longer carries `perplexity-search` (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.24.0] — 2026-06-26

Removed: the **task + workplace-memory system** (the `tasks-*` skills) has moved to its own standalone plugin, **[shaughv-tasks](https://github.com/RealEmmettS/shaughv-tasks)**, so it can be installed independently in any agent and stay focused. Nothing else in this bundle changed.

### Removed
- `skills/tasks-start`, `skills/tasks-update`, `skills/tasks-management`, `skills/tasks-memory`, `skills/tasks-remove` — the entire `.tasks/` task board + workplace-memory system, including `tasks-start`'s bundled `board-server.mjs`, `dashboard.html`, and the sha256-pinned `assets/vendor/**` board assets. They now live in the `shaughv-tasks` plugin (`RealEmmettS/shaughv-tasks`), which carries the same skills plus a guaranteed-on-init memory scaffold and a resume-where-you-left-off flow.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.23.0` → `0.24.0`; descriptions and keywords no longer mention the tasks system (now in `shaughv-tasks`).
- `.gitattributes` — dropped the `skills/tasks-start/assets/vendor/**` (root + Codex mirror) `binary` pins; those assets are gone.
- `README.md`, `CLAUDE.md`, `AGENTS.md` — removed the `tasks-*` skill/command rows and the tasks-as-example note; point to the `shaughv-tasks` plugin instead.
- `plugins/shaughv-code/` — regenerated; the Codex package no longer carries the 5 `tasks-*` skills (`pwsh ./build-codex-plugin.ps1 -Check` passes).

### Migration
- To keep using the task board, install the new plugin: `/plugin marketplace add RealEmmettS/shaughv-tasks` then `/plugin install shaughv-tasks@shaughv-tasks` (Claude Code); `codex plugin marketplace add RealEmmettS/shaughv-tasks` then `codex plugin add shaughv-tasks@shaughv-tasks` (Codex); or `npx skills add RealEmmettS/shaughv-tasks` (other agents). Existing `.tasks/` folders in your repos are unaffected — the new plugin reads them as-is.

## [0.23.0] — 2026-06-25

Minor: **tiered, offline-capable dependencies** for the live board. The board now *progressively enhances* — it tries the full external libraries/assets, falls back to minimal, then to fully bundled/offline copies, with **byte-identical behavior at every tier**. `/tasks-start` runs an internal **try-everything installer** (npm → pinned CDN → plugin-bundled → offline floor) that records an **install manifest**, and `/tasks-remove` reads that manifest for a **complete, reversible uninstall** — including an opt-in offer to undo a global Node install if setup had to add one.

### Added
- `skills/tasks-start/assets/vendor/` — plugin-bundled offline copies of the board's display assets: the **anime.js** motion driver (MIT), the **IBM Plex Mono + Unbounded** brand fonts (OFL), the **animated brand mark**, and a local-first `fonts.css`. Each sha256-pinned. (Makira is a commercial font and is deliberately **not** bundled — it loads from the CDN with a system-font fallback; the motion is glyph-agnostic, so behavior is identical.)
- `skills/tasks-start/assets/board-server.mjs` — new **`install` subcommand** (internal, not user-invocable): a try-everything provisioning chain (`full` npm → `vendor` pinned CDN fetch → `shipped` plugin copy → `offline` floor), every candidate **sha256-verified**; idempotent and integrity-self-healing; writes `.tasks/.install-manifest.json` (eager, then atomically finalized — a crash leaves a valid partial record). Best-effort, recorded global **Node bootstrap** (winget/brew/apt) when npm is needed but absent, plus a `--node-bootstrap` seam for when `/tasks-start` installs Node itself. Flags: `--tier`, `--offline`, `--no-global`, `--json`, `--node-bootstrap`.
- `skills/tasks-start/assets/board-server.mjs` — **`GET /vendor/*`** static route serving the provisioned assets (path-confined like the memory API, binary-safe, correct MIME); the recursive `fs.watch` now ignores the installer's files (`vendor/`, transient `node_modules`, the manifest, tmp/lock) so provisioning never spams SSE.
- `skills/tasks-start/assets/dashboard.html` — a **runtime tiered loader** (over `http`): prefers local `/vendor/*`, self-heals to the CDN, then to system fonts / the built-in engine — per resource, resolving never rejecting, so degradation is silent. An **anime.js driver seam** inside the Slot Roll: when anime.js has loaded it drives the per-glyph roll from the **same computed tuple** as the built-in CSS driver (identical motion; **FLIP stays on WAAPI**). A dependency-free **brand-mark text fallback** for the pure-offline floor.

### Changed
- `skills/tasks-start/SKILL.md` — step 2 now runs the internal `install` after copying assets; new **Node dependency** guidance (detect → optional per-OS global bootstrap, recorded for reversal → `file://` fallback if Node can't be had); report surfaces the achieved asset `tier`.
- `skills/tasks-remove/SKILL.md` — **manifest-aware teardown**: reads `.install-manifest.json`; everything under `.tasks/` (vendor, transient `node_modules`, the manifest) is wiped wholesale; **offers** to reverse any global Node install (default **keep**, never auto-run, high-risk caveat surfaced); legacy no-manifest and unknown-schema paths handled.
- `skills/tasks-start/references/board-server.md` — documents the `install` subcommand, the `/vendor/*` route, the four-tier model, the global-bootstrap seams, the runtime loader, and the full manifest schema + teardown contract.
- `.gitattributes` — pins `skills/tasks-start/assets/vendor/**` (and its Codex mirror) as `binary` so the sha256-pinned assets stay byte-exact across OS checkout and pass the `build-codex-plugin.ps1 -Check` byte-compare.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.22.0` → `0.23.0`; tasks descriptions note the tiered, offline-capable asset loader + reversible install.
- `plugins/shaughv-code/` — regenerated for version lockstep (`pwsh ./build-codex-plugin.ps1 -Check` passes).

### Verification
- Install chain exercised live across all four tiers in scratch repos: `shipped` (8/8 from the bundle, every sha256 pin matched), `vendor` (CDN fetch), `full` (anime via npm, then `node_modules` pruned), and the `offline` floor (provision nothing, no `vendor/` created); plus idempotent re-run (provenance preserved), integrity self-heal (a tampered asset re-provisioned to the right bytes), and the `--node-bootstrap` recording + carry-forward across re-runs. Static `/vendor/*` verified for serve/MIME and traversal confinement (encoded `..` → 404 via URL normalization, encoded-slash → 403).
- Live browser (Playwright MCP): full-tier board loads all 8 assets from `/vendor` with **anime.js active** and **0 console errors**; the offline-floor board self-heals to the CDN and still renders + animates (only the expected `/vendor` 404 probes). **anime-on vs anime-off Slot Roll tuples are byte-identical** (parity asserted via `window.__slotTuples`); `prefers-reduced-motion` is honored above the driver check.

## [0.22.0] — 2026-06-25

Minor: **rich task cards.** Each task now carries an exhaustive, TT;DR-led **description** plus an **activity log** (stored per-task at `.tasks/tasks/<id>.md`), surfaced through a **click-to-open task detail modal** where *all* editing now happens — so a task is a self-contained handoff document any agent can pick up cold. Adds a **freshness indicator** and subtle, on-brand **motion** (QubeTX Slot Roll + FLIP card-glide), with the cards themselves becoming read-only display surfaces.

### Added
- `skills/tasks-start/assets/dashboard.html` — **task detail modal** (opens on a click anywhere on a card or list row): edit title, note, column, prerequisites, **subtasks** (add/toggle/rename/delete), **done**, **delete**, and a **rendered-markdown description with an Edit toggle**; an **activity log** (newest-first); closes via X / backdrop / ESC with an unsaved-edit guard. **All editing moved into the modal** — board cards and list rows are now read-only display + drag only (no inline field editing, no card checkbox).
- **Freshness indicator** in the header: shows `live` for 2 minutes after any board change, then counts up in seconds, then `stale` after 45 minutes (single 1/s timer; resets to `live` on every change).
- **Motion (dependency-free):** a vendored, themed port of the QubeTX **Slot Roll** (per-character roll) drives the column **count badges** (accent arrival flash) and the **freshness odometer** (quiet ink roll); a **FLIP** glide animates a card moving between columns (via a `position:fixed` ghost clone so it isn't clipped by a column's scroll box) with a Web-Animations-API pop-in for new cards and a `just-changed` pulse for in-place changes. All respect `prefers-reduced-motion`.
- `skills/tasks-start/assets/board-server.mjs` — `GET|POST|DELETE /api/task?id=<id>` for the per-task detail file `.tasks/tasks/<id>.md` (id-validated `^[0-9a-z]{2,8}$`, atomic writes, self-write echo-suppression); DELETE fires on task deletion so a reused id can't inherit stale detail.
- `renderTaskMarkdown` — a minimal, dependency-free markdown renderer for the description pane (TT;DR callout, headings, lists, **bold**/_italic_/`code`/fences/links).

### Changed
- `skills/tasks-management/SKILL.md` — documents the per-task description + activity model and storage (`.tasks/tasks/<id>.md`); mandates the **description be a self-contained handoff document** (TT;DR lead, then *what & why*, origin/decision-trail or operator order, intended-vs-unintended **system impact**, full plan/context/acceptance, and what's done vs. left) so any independent agent can resume cold; "add/finish a task" verbs now seed/append detail.
- `skills/tasks-start/assets/board-server.mjs` — the `SessionStart` nudge now also asks agents to keep a rich, handoff-complete description per task.
- `skills/tasks-start/references/board-server.md` — documents `/api/task` (GET/POST/DELETE) and the `.tasks/tasks/<id>.md` detail-file format.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.21.0` → `0.22.0`; tasks descriptions note the rich cards, detail modal, freshness, and animations.
- `plugins/shaughv-code/` — regenerated for version lockstep (`pwsh ./build-codex-plugin.ps1 -Check` passes).

### Fixed
- FLIP card animation is now suppressed while the task modal is open (the `z-index:9000` ghost would otherwise glide over the `z-index:100` modal).
- Deleting a task now removes its `.tasks/tasks/<id>.md` detail file, so a future task that reuses the id can't inherit stale content.
- Description Edit/Preview toggle no longer desyncs (the header toggle is hidden during edit, where the in-area Cancel/Save govern exit).

### Verification
- Live browser smoke test (Playwright MCP) against a scratch board: modal open/edit/save (persisted to `.tasks/tasks/<id>.md` with an auto activity entry), subtasks, read-only cards (`pointer-events:none`), Active-column block gate, column move (FLIP + count Slot Roll), ESC close — **0 console errors** throughout. Server `/api/task` GET/POST/DELETE + bad-id 400 verified via curl; detail split/join round-trips unit-tested.

## [0.21.0] — 2026-06-25

Minor: reshape the task board into a proper **Kanban flow with dependencies**. Columns are now **Backlog → To-Do → Active → Done**, every task carries a stable short **id**, and tasks can declare **prerequisites** — a task with an unfinished prerequisite is "blocked" (🔒 badge + the board refuses to move it into Active until its prerequisites are checked off). This replaces the old "Waiting On" column: a task now waits on whatever it depends on, anywhere on the board.

### Changed
- `skills/tasks-management/SKILL.md` — default template columns reordered/renamed to `Backlog`, `To-Do`, `Active`, `Done`; added a "Columns (Kanban flow)" guide and an "IDs & prerequisites" section (line format `**Title** - note (needs #b2c, #d4e) #a3f`); "add a task" now queues into To-Do, assigns an id, and creates+links any missing prerequisite tasks.
- `skills/tasks-start/assets/dashboard.html` — tasks now carry **persistent base-36 ids** (parsed, serialized, backfilled on load, de-duped) and **`(needs #…)` prerequisites**. Board and list cards show an id chip and a `🔒 needs #…` badge and dim when blocked; the drag handler **gates the Active column** (refuses a blocked card with a status message and snaps it back). Drag matching switched from numeric to string ids (also fixes a latent number-vs-string id-coercion mismatch in the drop handlers).
- `skills/tasks-start/references/board-server.md` — TASKS.md format contract updated for the new columns, ids, and `(needs …)` notation.
- `skills/tasks-update/SKILL.md`, `skills/tasks-remove/SKILL.md` — prose updated for the new column names (`Someday`→`Backlog`, `Waiting On`→`To-Do`).
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.20.0` → `0.21.0`.
- `plugins/shaughv-code/` — regenerated for version lockstep (`pwsh ./build-codex-plugin.ps1 -Check` passes).

## [0.20.0] — 2026-06-25

Minor: the task board goes **live**. `/tasks-start` now serves the dashboard from a zero-dependency local Node server on `localhost` (two-way live sync between the agent's file edits and the operator's UI), auto-opens it, and — opt-in — wires **board-maintenance hooks** into the target repo so every Claude session is nudged to keep `.tasks/TASKS.md` current. `/tasks-start` is now idempotent (re-running relaunches/repairs the board, with nesting-aware detection) and `/tasks-remove` tears the server + hooks back down.

### Added
- `skills/tasks-start/assets/board-server.mjs` — zero-dependency (`node` built-ins only; no `npm install`, no build) live board server. Subcommands `serve` / `ensure` / `hook` / `stop` / `status`. Serves `dashboard.html` on `localhost:4317` (next free port if busy), exposes `GET|POST /api/tasks` (atomic write with an `X-Base-Mtime` optimistic-concurrency guard → **409** on conflict, so an agent's write is never silently stomped), an SSE `/api/events` stream (`fs.watchFile` + best-effort recursive `fs.watch`) for live reload, and a path-guarded `/api/memory/*` API. Records `{port,pid}` in `.tasks/.board-server.json`; liveness is verified via an `/api/ping` health check, not just PID-alive.
- `skills/tasks-start/references/board-server.md` — single source of truth for the server API, the exact hooks JSON block, the merge/teardown rules (stable `board-server.mjs hook` marker), the Node-absent fallback, and the `TASKS.md` format contract; linked from both `tasks-start` and `tasks-remove`.
- Board-maintenance hooks, written into the **target repo's** `.claude/settings.local.json` by default (`settings.json` if `.tasks/` is committed): `SessionStart` (revive the board + standing reminder; re-fires on resume/clear/compact), `PostToolUse` on `Bash|ExitPlanMode` (nudge on `git commit`/`git push` and plan approval — inspects `tool_input.command`), and `SubagentStart` / `SubagentStop`. Nudges inject agent-visible `additionalContext` and are de-duped **per semantic type** (commit/push/plan/subagent) on a 30s cooldown.

### Changed
- `skills/tasks-start/assets/dashboard.html` — now dual-mode: served over `http(s)` it talks to the board server (auto-load, `fetch`/`POST`, SSE live updates, server-side memory I/O); opened as `file://` it keeps the legacy File System Access API flow verbatim as a fallback. All parsing / serialization / drag-drop / theming reused unchanged.
- `skills/tasks-start/SKILL.md` — step 1 is now directory-aware (detects an existing `.tasks/` in cwd or an ancestor; prompts use-parent-vs-create-nested on ambiguity); step 3 launches the localhost board (`ensure --open`; Node-absent → `file://` fallback); a new step 4 wires the hooks (ask once); steps renumbered; report updated.
- `skills/tasks-remove/SKILL.md` — teardown now stops the board server (`board-server.mjs stop`) and removes the board hooks from `.claude/settings*.json` by the `board-server.mjs hook` marker (never by position), shown in the migration plan and final report.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.19.0` → `0.20.0`; tasks descriptions note the live localhost board + maintenance hooks.
- `CLAUDE.md`, `AGENTS.md` — clarified that the tasks-* skills configure hooks in *target* repos and ship a Node board asset, which is distinct from (and not a violation of) the "no bundled hooks/MCP in the plugin" rule.
- `plugins/shaughv-code/` — regenerated for version lockstep and the new board server + reference (`pwsh ./build-codex-plugin.ps1 -Check` confirms the gate).

## [0.19.0] — 2026-06-24

Minor: add a native **task + workplace-memory system** — five `tasks-*` skills plus a SHAUGHV-branded dashboard — adapted and expanded from Anthropic's Productivity plugin. Everything the system owns lives in a self-contained `.tasks/` folder, and a new `/tasks-remove` flattens it back into the host repo.

### Added
- `skills/tasks-start/` — `/tasks-start`. Scaffolds a self-contained `.tasks/` folder (`TASKS.md`, `CLAUDE.md` working memory, `memory/` deep store, `dashboard.html`) in the current repo/folder, opens the dashboard, and bootstraps workplace memory from the user's real task list and (optionally) connected tools.
- `skills/tasks-update/` — `/tasks-update [--comprehensive]`. Syncs tasks from a connected tracker (Asana/Linear/Jira/GitHub Issues), triages overdue/stale items, and fills memory gaps; `--comprehensive` deep-scans chat/email/calendar/docs for missed todos and new memories.
- `skills/tasks-management/` — reference skill (`user-invocable: false`) for the `.tasks/TASKS.md` markdown contract and overdue/priority surfacing.
- `skills/tasks-memory/` — reference skill (`user-invocable: false`) for the two-tier memory model (`.tasks/CLAUDE.md` hot cache + `.tasks/memory/` deep store).
- `skills/tasks-remove/` — `/tasks-remove [--keep-tasks] [--dry-run]`. Decommissions the system: merges working memory into the repo's root `CLAUDE.md`, moves deep memory into a repo-level `memory/`, preserves open tasks, then deletes `.tasks/`. The inverse of `/tasks-start`.
- `skills/tasks-start/assets/dashboard.html` — the Productivity dashboard rebuilt on the SHAUGHV design system: vintage-cream (sage `#5B8A5B`) and brutalist-dark (brand-orange `#FF5E1A`) themes with a persisted toggle, Makira / Unbounded / IBM Plex Mono served from `cdn.shaughv.com`, the animated `<shaughv-mark>` on empty states, and SHAUGHV favicons. The board/list task views and the File System Access API memory browser are preserved verbatim from the original.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.18.2` → `0.19.0`; descriptions and keywords now note the tasks system.
- `README.md` — Skills table (+5 rows) and Commands table (+3 rows) document the tasks-* system.
- `plugins/shaughv-code/` — regenerated for version lockstep and the five new skills (mirrored byte-for-byte from root; PowerShell was unavailable in this environment, so run `pwsh ./build-codex-plugin.ps1 -Check` on Windows to confirm the gate before pushing).

## [0.18.2] — 2026-06-24

Patch: bring four skill `description` fields under Claude Code's 1024-char cap so they can't be silently skipped — with **no context removed**, only relocated.

### Fixed
- `skills/mistral/`, `skills/shaughv-cdn/`, `skills/gcs-storage/`, `skills/shaughv-gcs-storage/` — trimmed each frontmatter `description` from over (or at) the **1024-char** cap to ~800–950 chars. Claude Code silently skips a skill whose description exceeds the cap, so these were at risk of never loading. **Nothing was deleted:** the full trigger-phrase lists, capability enumerations, model-id lists, and the `gcs-storage` "confirm GCP project + bucket before any mutating command" safety rule were moved verbatim into new `## When this skill fires` (and, for `gcs-storage`, `## Before any mutating command`) sections in each skill's body. Closes the cleanup flagged in 0.18.1.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.18.1` → `0.18.2`.
- `plugins/shaughv-code/` — regenerated (version lockstep); `-Check` passes.

## [0.18.1] — 2026-06-24

Patch: make the new CI validate gate's `-Check` line-ending-reproducible on Windows runners, and capture two recurring maintainer gotchas in the repo docs.

### Fixed
- `.gitattributes` — pinned the Codex package's generated `.mcp.json` to LF (`.mcp.json text eol=lf`). `build-codex-plugin.ps1 -Check` SHA-compares byte-exact and the build writes the wrapped `.mcp.json` as LF, so the repo's `* text=auto` was checking the committed copy out as **CRLF** on the Windows CI runner — failing the 0.18.0 validate gate with `hash mismatch: .mcp.json`. Skill files were unaffected (copied verbatim, identical treatment on both sides). Pin any future *generated* (not verbatim-copied) package file the same way.

### Changed
- `CLAUDE.md`, `AGENTS.md` — documented two recurring gotchas for future maintainers: the LF-pin requirement for any *generated* package file, and the **1024-char** Claude Code skill-`description` cap above which a skill is silently skipped (flagging `mistral`, `shaughv-cdn`, `gcs-storage` as currently over the cap).
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.18.0` → `0.18.1`.
- `plugins/shaughv-code/` — regenerated (version lockstep); `-Check` passes.

## [0.18.0] — 2026-06-24

Synced the bundle against the upstream work `theia-tools` skills and **de-work-ified** everything brought over — every Millis / Theia / Mission Control / CDP / Procore / Acumatica / Christian reference stripped or genericized. Net: a major `critical-thinking` expansion, four new general-purpose skills, and a reconciliation pass over the shared skills (most of which were already ahead of upstream, so were left untouched).

### Added
- `skills/critical-thinking/` — expanded from four to **six** frameworks. Added **Information Triage / Sensemaking** (`references/sensemaking.md` — the overload front door, the dense-hand-back procedure, the 30-second "5:30pm test") and **Scientific Inquiry** (`references/scientific-inquiry.md` — Observe → Research → Hypothesize → Experiment → Analyze → Report). Added the "Interactive Externalization / mental compacting" escalation section, `references/visual-models/interactive.md`, and **13 ready-to-use interactive HTML model templates** under `references/visual-models/html/`. De-work-ified throughout: sibling-skill refs restored (`logical-reasoning`, `strategic-thinking`, `personal-productivity`, `iterative-plan`, `debugging-framework`), the `~/critical-thinking-sessions/` canvas path kept, and the Procore/CDP "daily-log sync" worked examples (in `SKILL.md`, `sensemaking.md`, `scientific-inquiry.md`, `cognitive-scaffolds.md`, and `html/13-triage-card.html`) genericized to neutral software examples.
- `skills/workflow-optimization/` — new skill: turn-based facilitation to document, map (as a diagram), and improve any process via a multi-lens review (Lean, Six Sigma, Theory of Constraints, TQM, BPR, Process Optimization), ending in a ranked shortlist. Imported verbatim (already work-ism-free). `SKILL.md` + 11 references.
- `skills/iterative-plan/` — new skill: milestone-planning methodology (Profile → Clarify → Spine → Slice loop) with a binary/demoable success-criterion gate. De-work-ified — the Mission Control / Milestone / Orchestrator / Friday-update / BUILDR vocabulary genericized into ordinary planning language; worked examples rebuilt on neutral software. `SKILL.md` + 4 references.
- `skills/handoff/` — new skill: writes an exhaustive session handoff document (conversation arc, plan state, every decision, what's left) to a dated `docs/agents/handoff/` file, then defers to `git-workflow` for the commit. De-work-ified (Mission Control / Acumatica / Azure-SQL examples genericized; the `file-structure` and unauthored `documentation-standards` cross-refs dropped).
- `skills/security-check/` — new skill: full-repo security audit, branch/diff review, merge-impact (blast-radius) read, and on-request red-team (STRIDE + WSTG). De-work-ified — the per-stack `stack-*.md` guidance (React SPA, Azure Functions, FastAPI, Rust, Azure SQL, Entra/MSAL auth, LLM/MCP, supply chain) kept as general references; the "Millis stack" framing, company infra/resource names, and worked examples genericized. `SKILL.md` + 15 references + 2 scripts.
- `.github/workflows/validate.yml` — a CI gate (the shaughv-code equivalent of the work plugin's `validate.yml`) that runs on every PR and push to `main`: it validates every JSON manifest, runs `build-codex-plugin.ps1 -Check` so the tracked Codex package (`plugins/shaughv-code/`) can never drift from root content, and asserts version lockstep across `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, and `CHANGELOG.md`. CI **validates** the package — it does not regenerate or commit it (the package stays hand-committed, per `AGENTS.md`). No `release-skills.yml` was ported: this repo retired the `.skill` bundle distribution.

### Changed
- `skills/logical-reasoning/SKILL.md` — adopted the tightened upstream description (adds the "prefer critical-thinking for open-ended facilitation; this skill is for formal rigor" note); dropped a stub `## Evaluating this skill` / `evals/` section. The 10 reference files were already byte-identical.
- `skills/personal-productivity/SKILL.md` — grafted a clean "Stacking with other skills" section (`critical-thinking` / `strategic-thinking` / `learn`).
- `skills/learn/SKILL.md` — fixed an internal inconsistency (the proficiency-levels index now reads "Unaware → Expert", matching the table).
- `skills/openai-audio/README.md` — fixed a stale source-folder name in the manual-install snippet (`openai-realtime-skill` → `openai-audio`).
- `skills/bug-triage/`, `skills/debugging-framework/`, `skills/naming-conventions/` — scrubbed residual work-isms that had leaked into the personal copies (CDP MCP tool names `describe_entities` / `read_records` in worked examples; a `OneDrive` / `Outlook` example list). Upstream's purely-work reference files (`millis-bug-shapes.md`, `infrastructure-and-data.md`, `projects-tasks-milestones.md`) were deliberately **not** ported.
- The remaining shared skills (`git-workflow`, `wb300`, `pretext`, `human-changelog`, `spawn`, `strategic-thinking`, `code-design-patterns`, `defensive-programming`) were reviewed against upstream and **left unchanged** — the personal copies were already ahead of / cleaner than the work versions (Emmett-specific machine paths and project names, already-de-work-ified examples, restructured layouts, extra files work lacks).
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.17.0` → `0.18.0` across all three; descriptions extended to mention the four new skills; keywords extended with `handoff`, `iterative-plan`, `planning`, `security-check`, `security`, `workflow-optimization`, `workflow` (and `milestone`, `audit`, `red-team`, `process` on the Claude manifest).
- `README.md` — "Skills bundled" table extended with `handoff`, `iterative-plan`, `security-check`, and `workflow-optimization` rows (kept alphabetical); the `critical-thinking` row updated from four to six frameworks.
- `plugins/shaughv-code/` — regenerated via `build-codex-plugin.ps1` (now 32 skill directories, 460 files); `-Check` passes (SHA + version lockstep).
- `AGENTS.md`, `CLAUDE.md` — documented the new CI validate gate (it enforces the Codex package stays in sync on every PR/push to `main`; it validates, it does not regenerate).

## [0.17.0] — 2026-06-23

### Added
- `skills/ttdr/` — a skill teaching the **TT;DR ("Too Tired; Didn't Read")** convention: a short (1–3 sentence), plain-English, high-level lead that sits *on top of* a detailed answer for a busy or tired reader. It's the opposite spirit of a TL;DR — it assumes a competent-but-overloaded reader and **accompanies** the detail rather than replacing it. `SKILL.md` (frontmatter `name: ttdr` matching the directory) covers what a TT;DR is, the TL;DR-vs-TT;DR distinction, where to use it (status updates, commit/PR descriptions, incident write-ups, long docs, hand-offs), how to write one for the context at hand, format/placement, how it differs from a technical overview or tech spec, and common mistakes. Ships one reference, `references/examples.md` — a before/after example bank across status updates, commit & PR descriptions, incident write-ups, and edge cases (one-line fields, multi-section reports). Imported verbatim (pure Markdown, no scripts/deps/secrets).
- `plugins/shaughv-code/` — a tracked, **generated** self-contained Codex plugin package (its own `.codex-plugin/plugin.json`, a wrapped `.mcp.json`, and a copy of `skills/`), so Codex can snapshot a real subdirectory instead of being pointed at the bare repo. Brings the Codex distribution mechanism to parity with the work `theia-tools` plugin. Never hand-edit it — it's regenerated from root.
- `build-codex-plugin.ps1` — regenerates `plugins/shaughv-code/` from repo root: copies the Codex manifest verbatim, **wraps** the bare root `.mcp.json` into Codex's `{ "mcpServers": { … } }` shape, copies `skills/` verbatim, and guards against Windows `MAX_PATH` overflow. `-Check` rebuilds into a temp dir and SHA-compares (plus a version-lockstep assertion) without touching the worktree.
- `.codex/config.toml` — a repo-local Codex MCP fallback (native TOML) registering `remotion-documentation` (stdio: `npx @remotion/mcp@latest`) and `craft-docs` (streamable HTTP) for Codex sessions run inside this repo, before the plugin is installed.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.16.0` → `0.17.0` across all three manifests; the Claude and Codex descriptions extended to mention the TT;DR skill, and keywords extended with `ttdr`, `tldr`, and `summary`.
- `README.md` — "Skills bundled" table extended with a `ttdr` row (kept alphabetical, between `strategic-thinking` and `usage-statusline`).
- `.agents/plugins/marketplace.json` — Codex marketplace source flipped from a Git-URL descriptor (`source: url`, the repo `.git`) to a local subdirectory (`source: local`, `path: ./plugins/shaughv-code`), so Codex snapshots the self-contained package rather than the flat repo root. Install command is unchanged (`shaughv-code@shaughv-code`).
- `.codex-plugin/plugin.json` — gained `"mcpServers": "./.mcp.json"`, so the Codex surface now bundles the same MCP servers (Remotion documentation + Craft Docs) as the Claude surface; `interface.longDescription` reworded (the Codex surface is no longer "skills-only"). The root `.mcp.json` is unchanged (it must stay the bare Claude-plugin shape; the build script wraps it for the package).
- `README.md`, `AGENTS.md`, `CLAUDE.md` — Codex sections rewritten for the packaged-snapshot mechanism and MCP-in-Codex (repo-layout trees updated with `.codex/`, `plugins/shaughv-code/`, and `build-codex-plugin.ps1`; maintainer workflow gains the regen step); the standing "don't add a build script" rule replaced with the Codex-package regen rule (`build-codex-plugin.ps1` is the repo's only build step and the Claude surface still has none).

## [0.16.0] — 2026-06-19

### Added
- `skills/mistral/` — a comprehensive **Mistral AI API** skill making an agent fully capable of using every Mistral service, with **OCR**, **audio transcription**, and **text-to-speech** as the headline use cases. `SKILL.md` (frontmatter `name: mistral` matching the directory) is a trigger-rich router covering the key flow, the freshness contract, a task→reference→script routing table, the model catalog, and the priority workflows. Ships **14 reference docs** under `references/`: the full bundled **`openapi.yaml`** (the complete ~26k-line spec, byte-for-byte from `https://docs.mistral.ai/openapi.yaml`, for offline use and freshness diffing); `authentication.md` (the discover→prompt→save key flow, base URL, SDKs, error/rate-limit table); schema-complete deep refs for the three priority areas (`ocr.md`, `audio-transcriptions.md`, `audio-speech.md`) plus `chat.md` (tools/function-calling, structured outputs, vision, streaming), `text-and-embeddings.md` (FIM + embeddings), `classifiers.md` (moderations + classifications), `files.md`, `models.md` (+ model catalog), `batch.md`, `fine-tuning.md`, `agents.md` (Agents completions + the beta Agents & Conversations APIs); and `more-endpoints.md`, an operation-level index of 90+ long-tail/beta endpoints (libraries/RAG, connectors, observability, workflows, events, deprecated) that defers to the bundled spec. Every reference carries its canonical `https://docs.mistral.ai/api/endpoint/<group>[/<operation>]` doc link and cURL + Python + TypeScript examples.
- `skills/mistral/scripts/` — dependency-optional Python runners (pure stdlib; the `mistralai` SDK is only needed for the SDK code samples) with a stable JSON-on-stdout contract, stderr logs, and exit codes (`0` ok / `2` missing key / `1` other): `mistral_key.py` (the discover/check/`--set-system`/`--set-repo` key flow), `mistral_ocr.py`, `mistral_transcribe.py`, `mistral_speech.py`, a shared `_client.py` (key resolution + retrying REST client + multipart/SSE helpers + `upload_file`/`delete_file`), and `requirements.txt`. **Files uploaded to `/v1/files` to feed a one-shot call are deleted automatically once the result is back** (`mistral_ocr.py --file` auto-deletes its upload; documented as a standing rule in `SKILL.md` and `files.md`), so a temporary upload never accrues storage cost. Verified end-to-end against the live API: key saved to the machine and a real chat completion returned through the skill's own client.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.15.0` → `0.16.0` across all three manifests; the Claude and Codex descriptions extended to mention the Mistral skill, and keywords extended with `mistral`, `mistral-ai`, `ocr`, `voxtral`, `transcription`, `text-to-speech`, `tts`, `embeddings` (and `document-understanding`, `mistral-ocr`, `speech` on the Claude manifest).
- `README.md` — "Skills bundled" table extended with a `mistral` row (kept alphabetical, between `logical-reasoning` and `naming-conventions`).
- `.gitignore` — ignore the local `zipped-skills/` folder (per-skill `.skill` bundles, regenerated on demand, never committed) plus local API-key files (`.env`, `.mistral.env`, `.env.local`) a skill's key flow may write.

## [0.15.0] — 2026-06-14

### Added
- `skills/usage-statusline/scripts/install.mjs` — a cross-platform, zero-dependency Node installer for the usage status line, **dynamic by design**: it locates the bundled `statusline-usage.mjs` next to itself (`import.meta.url`), resolves the Claude config dir from `$CLAUDE_CONFIG_DIR` (else `~/.claude`), copies the script there, computes the absolute `node "<path>"` command **for the host it runs on** (forward slashes, quoted for spaces), merges that into `<config>/settings.json` non-destructively (backing the file up first; aborts rather than clobber invalid JSON), and runs the script's `--selftest`. Supports `--dry-run` and `--uninstall`. This makes installing the plugin + status line on several separate machines safe — each install resolves its own home dir, config dir, and absolute path; nothing is pinned to the authoring machine. Verified against a throwaway `CLAUDE_CONFIG_DIR`: it wrote that dir's path (not the author's) and preserved pre-existing settings keys.

### Changed
- `skills/usage-statusline/SKILL.md` — install section reworked around the one-command installer, with the manual copy-and-wire steps kept as a fallback (now with explicit per-machine absolute-path resolution instead of a literal example path). Added an explicit "nothing is tied to a specific machine" guarantee; frontmatter gained an `install:` line; uninstall now points at `install.mjs --uninstall`.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.14.0` → `0.15.0` across all three manifests.
- `README.md` — the `usage-statusline` row notes the cross-platform installer and the path-resolves-per-machine behavior.

## [0.14.0] — 2026-06-14

### Changed
- `skills/shaughv-cdn/SKILL.md` — **rebuilt as a manifest-driven hybrid.** The skill now leads with the CDN's own canonical rule — fetch the self-describing JSON manifest at `https://cdn.shaughv.com/tree.json` (alias `/tree`) and use the `url` / `embed` / `css_url` it returns, never hardcode asset paths — so the guide self-heals across asset additions, renames, and reorganizations (verified live: `count: 99`). It documents the manifest shape (`base_url` / `count` / `usage` / `fonts` / `tree`) and how to walk it. The high-value human context a bare manifest can't express was preserved from the previous hardcoded version: the license / redistribution table, the 64px animated-mark minimum, the `crossorigin` font-preload requirement, the cache contract, CORS, the "which asset do I need?" matrix, and the consumer-vs-maintainer scoping. The previously-unmerged `feat/document-unbounded-on-cdn` work was folded in — the **Unbounded** opt-in brutalist display family (weights 300–900 plus the "Unbounded Blond" stylistic cut, woff2-only, OFL 1.1, reserved for SHAUGHV's own surfaces) is now documented.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.13.0` → `0.14.0` across all three manifests.
- `README.md` — the `shaughv-cdn` row reworded to reflect the manifest-driven approach and the added Unbounded font.

### Removed
- Branch `feat/document-unbounded-on-cdn` (local + `origin`) — its sole change (hand-documenting the Unbounded font on the old hardcoded skill) is superseded by the manifest-driven rebuild, which surfaces Unbounded automatically. Its substance was folded into `main` first, so nothing was lost.

> Context: the `shaughvCDN.skill` file that prompted this was identified as a byte-for-byte copy of the CDN's own self-published `/agents` guide (not a repo artifact and not from any branch); it motivated adopting that manifest-driven approach in the bundled skill.

## [0.13.0] — 2026-06-14

### Added
- `skills/usage-statusline/` — a skill that installs and standardizes Emmett's Claude Code **usage status line**: a two-row status line showing live 5-hour and weekly usage percentages (color-coded sub-cell progress bars), model / context-fill / session-cost, and a locally-computed burn-rate "time left" projection for the 5-hour window with a red/green acceleration-trend color and a bold-red <30-min urgency override. Ships the **canonical, byte-identical** runtime as a bundled artifact — `scripts/statusline-usage.mjs` (Node ≥18, zero dependencies, extracted verbatim from the source build guide; its built-in `--selftest` passes 35/35) — plus `references/build-guide.md` (the full design rationale: the stdin schema, the burn-rate algorithm, the trend indicator, tuning knobs, and edge cases). `SKILL.md` (frontmatter `name: usage-statusline` matching the directory) walks the agent through copying the script into `<CLAUDE_DIR>` (not the version-stamped plugin cache, so its rolling state file persists), merging the `statusLine` block into `settings.json`, verifying with `--selftest`, and uninstalling. Bundling the script as a skill is the supported path because Claude Code reads `statusLine` only from `settings.json` — a plugin cannot ship one as a native component.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.12.0` → `0.13.0` across all three manifests; the Claude and Codex descriptions extended to mention the usage status-line installer, and keywords extended with `statusline`, `usage`, `rate-limit`, and `burn-rate`.
- `README.md` — "Skills bundled" table extended with a `usage-statusline` row (kept alphabetical, between `strategic-thinking` and `wb300`).

## [0.12.0] — 2026-06-14

### Added
- `skills/crystal-upscaler/` — the **crystal-upscaler** image-upscaling skill, imported from a `.skill` bundle export. Wraps fal.ai's Clarity Crystal Upscaler (`clarityai/crystal-upscaler`, image-to-image, tuned for facial detail / portraits) for resolution increase, sharpening, low-res / blur restoration, and print / retina prep at 1×–200× scale with a 0–10 creativity dial and PNG/JPG output. Ships `SKILL.md` (frontmatter `name: crystal-upscaler` matching the directory), `references/api-reference.md` (verbatim input/output schema, queue + webhook endpoints, the full pricing table, and cURL / `fal_client` / `@fal-ai/client` snippets), and three `scripts/`: `upscale.py` (the recommended path — upload, queue polling, output download, cost reporting, a `--json` agent contract on stdout, and auto-fitting of oversized inputs; falls back to a dependency-free stdlib queue client when `fal-client` is absent), `fit.py` (a least→most-destructive ladder that shrinks an over-limit input under the 100 MiB API cap behind a structural-integrity gate, working on a copy), and `requirements.txt` (`fal-client` + Pillow). Reads `FAL_KEY` from the environment; bills $0.016 per output megapixel.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.11.0` → `0.12.0` across all three manifests; the Claude and Codex descriptions extended to mention the fal.ai Crystal image upscaler, and keywords extended with `crystal-upscaler`, `upscale`, `upscaling`, `super-resolution`, `fal`, `fal-ai`, and `image-enhancement`.
- `README.md` — "Skills bundled" table extended with a `crystal-upscaler` row (kept alphabetical, between `critical-thinking` and `debugging-framework`).

## [0.11.0] — 2026-06-11

### Added
- `skills/wb300/` — the **wb300** branch / worktree / agent control-tower skill, imported from a `.skill` bundle export. Teaches the agent to reach for `wb300 agent` (JSON, schema `wb300.agent.v2`) as its read interface for branch/worktree/agent state, to map user questions ("what's running / dirty / ready to review / will collide / safe to delete") onto the schema's lifecycle and collision fields, and to hand the interactive full-screen TUI to the human rather than launching it itself. Ships `SKILL.md` plus three references: `references/agent-json.md` (full `wb300.agent.v2` schema + jq/PowerShell recipes), `references/install.md` (cross-platform install/update/uninstall matrix), and `references/tui.md` (views, keys, symbols). Frontmatter `name: wb300` matches the directory.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.10.0` → `0.11.0` across all three manifests; the Claude and Codex descriptions extended to mention the wb300 control tower, and keywords extended with `wb300`, `worktree`, `workbranch`, `branch`.
- `README.md` — "Skills bundled" table extended with a `wb300` row (kept alphabetical).

## [0.10.0] — 2026-06-07

### Changed
- Decoupled the imported skills from Emmett's private work stack so the public bundle no longer leaks work-specific context. Across `skills/{debugging-framework,defensive-programming,bug-triage,code-design-patterns,git-workflow,critical-thinking,learn,strategic-thinking,spawn}/`, every reference to the `theia-tools` work plugin, the Millis / TheiaConstruct data platform (CDP, Procore, Acumatica, Azure / Cosmos / Service Bus, thin-GI, Scorecard / PSR, `data.theiaconstruct.com`, `mcp__claude_ai_Millis_CDP__*`), the Mission Control task tracker, and named teammates / work agents (Christian, Dan, Talos, Hephaestus) was genericized or removed. Frontmatter `description`s were rewritten to trigger on the same generic intents minus the Millis framing; the debugging worked examples and the defensive-programming / design-pattern example domains were rewritten as stack-neutral composites.
- Rewired cross-skill references to the bare local skill names that exist in this bundle (`critical-thinking`, `git-workflow`, `bug-triage`, `learn`, `defensive-programming`, `naming-conventions`); no `theia-tools:`-namespaced references remain. Real external-plugin references (`superpowers:*`, `pr-review-toolkit:*`) were preserved.
- `skills/debugging-framework/references/millis-bug-shapes.md` → `skills/debugging-framework/references/bug-shapes.md` (renamed via `git mv`; all in-skill references updated and the "Millis bug shape" vocabulary relabeled "bug shape").
- `skills/spawn/` Phase 2 no longer files a Mission Control task — the flow is now investigate → execute, with the executor briefed directly from the investigation findings.
- `skills/git-workflow/` multi-agent coordination now runs on git-native signals (branch names on origin, `git worktree list`, last-commit times) instead of the Mission Control overlay.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.9.0` → `0.10.0`.

### Removed
- References to skills with no equivalent in this bundle: `mission-control-toolkit`, `cdp-design-pattern`, `cto-advisor`, `agile`, plus dead cross-refs to `mission-control-checkins`, `acumatica-thin-gi`, and `prompt-library`. The Mission Control tracker is Millis-only with no public counterpart, so its machinery (`result_notes`, `current_activity`, `update_task`, agent check-ins) was dropped rather than remapped.

## [0.9.0] — 2026-06-06

### Added
- Eleven new skills imported from a `.skill` bundle export (each ships its `SKILL.md` — frontmatter `name` matching the directory name — plus any bundled `references/` docs, unmodified):
  - `skills/bug-triage/` — interactive bug triage and investigation agent for internal tools; investigates with browser tools and data-platform queries rather than only asking questions.
  - `skills/code-design-patterns/` — Gang of Four design-patterns reference and analyzer; all 22 GoF patterns with Python/TypeScript/SQL examples.
  - `skills/debugging-framework/` — structured debugging for stack bugs: integration drift, missing writes, vanished messages, 5xx, datetime/idempotency gotchas.
  - `skills/defensive-programming/` — boundary-focused defensive coding: error contracts, try/except critique, retry-backoff/timeouts, validation placement.
  - `skills/git-workflow/` — official git workflow and committing strategy: branches, worktrees, commits, PRs, rebasing, conflicts, hotfixes, multi-agent coordination.
  - `skills/image-gen/` — text-to-image and image-to-image generation routed to Nano Banana 2 / Gemini (via fal.ai or native API), MAI-Image-2.5 (fal.ai), or Reve; asks provider first; saves to Downloads.
  - `skills/learn/` — guided facilitation for deliberate learning: Kickoff/Session/Review/Course-Correct, the Learning Loop, Learning Journal.
  - `skills/logical-reasoning/` — deductive/inductive reasoning toolkit: Copi-style natural deduction, propositional/predicate/categorical/modal logic, fallacies, induction, IBE.
  - `skills/personal-productivity/` — productivity toolbox distilled from five books (Burkeman ×2, Newport ×2, Vaden).
  - `skills/spawn/` — manual-invocation-only `/spawn` orchestration playbook; two-phase Opus subagent pattern (INVESTIGATE then EXECUTE); explicitly never auto-triggers.
  - `skills/strategic-thinking/` — turn-based strategic facilitation: Strategic Picture plus four lenses (Art of War, 36 Stratagems, Five Rings, game theory).
- Not imported: the bundle's twelfth skill, a work-specific variant of `naming-conventions`, was deliberately skipped so the repo's SHAUGHV-personal `skills/naming-conventions/` stays untouched.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — version bumped `0.8.0` → `0.9.0` across all three manifests; descriptions and keywords extended to cover the eleven new skills.
- `README.md` — "Skills bundled" table extended with eleven new rows (kept alphabetical).

### Fixed
- Normalized CRLF → LF line endings on `.md`/`.sh` files in the eleven imported skills (the export was Windows-authored) and on the pre-existing `skills/shaughv-animated-brandmark/` markdown files (`SKILL.md` + `references/implementation.md`), whose `SKILL.md` frontmatter `name` carried a trailing `\r`. Matches the repo's `* text=auto` `.gitattributes` policy.

## [0.8.0] — 2026-05-28

### Added
- `.codex-plugin/plugin.json` — adds a Codex skills-only plugin manifest for `shaughv-code`, pointing at the existing `skills/` tree and intentionally omitting `mcpServers` so Codex does not parse the Claude-style `.mcp.json`.
- `.agents/plugins/marketplace.json` — adds a Codex marketplace entry that points `shaughv-code` at this repository with a Git URL source descriptor, preserving the root-level plugin layout that Claude Code already uses.
- `AGENTS.md` — tracks the Codex-facing maintainer guide and documents that `.codex-plugin/` is lowercase, skills-only, and version-aligned with the Claude plugin surface.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — version bumped `0.7.0` → `0.8.0` so the Claude and Codex plugin surfaces stay aligned.
- `README.md` — documented Codex install/update commands, the skills-only Codex scope, and the parallel Claude Code / Codex / `npx skills` consumption paths.

## [0.7.0] — 2026-05-25

### Added
- `.mcp.json` — bundles a second MCP server, `craft-docs`, pointing at the Craft Docs link `https://mcp.craft.do/links/LKUYYz65h6s/mcp` over Streamable HTTP transport (`"type": "http"`). The URL is OAuth-gated: installers see the server appear, then authenticate via Craft's OAuth flow on first tool use, so the link committed to this public repo is not itself a credential. Exposes Craft's standard tool set (`craft_read`, `craft_write`, `blocks_revert`).

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — version bumped `0.6.0` → `0.7.0`; `craft` and `craft-docs` added to `keywords`; plugin description updated to mention the Craft Docs MCP server alongside the Remotion documentation MCP.
- `README.md` — "MCP servers bundled" table extended with a `craft-docs` row; `.mcp.json` comment in the repo-layout tree updated to mention both servers.

## [0.6.0] — 2026-05-25

### Added
- `skills/gcs-storage/` — generic Google Cloud Storage reference. Covers install on macOS / Linux (apt, snap, dnf, tarball) / Windows, ADC vs service-account auth, impersonation, upload/download/list/delete, flat vs HNS folders, public access via uniform bucket-level access + `allUsers`, signed URLs (with the 7-day cap gotcha documented), CORS, lifecycle, scripting flags, the gcloud command-structure primer + cheat-sheet, the Cloud Client Libraries language matrix, and a comprehensive gotchas catalog. Agent must ask for project ID + bucket name before any mutating command.
- `skills/shaughv-gcs-storage/` — pre-wired skill for Emmett's personal public bucket at `gs://shaughv`. Bucket facts (uniform IAM, public reads granted to `allUsers`, 7-day soft delete, object versioning ON, CORS OFF, US multi-region, Standard storage class, two lifecycle rules) are baked in so the agent never has to ask. Returns `https://storage.googleapis.com/shaughv/<path>` URLs. Embeds the full cross-platform reference from `gcs-storage` so the skill stands alone.

### Changed
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — version bumped `0.5.1` → `0.6.0`; keywords extended with `gcs`, `google-cloud-storage`, `gcloud`, `storage`, `upload`; description updated to mention the two new skills.
- `README.md` — "Skills bundled" table and "Repo layout" tree updated to list `gcs-storage` and `shaughv-gcs-storage`.

### Verified
- Smoke-tested the documented workflow against the live `gs://shaughv` bucket before publishing: `gcloud storage cp` upload with `--content-type` + `--cache-control`, `ls -l`, public-URL HEAD + GET via `https://storage.googleapis.com/shaughv/test.txt` (200 OK, correct response headers, body verbatim), `rm` deletion, public URL goes 404, soft-deleted noncurrent version recoverable via `--all-versions` + generation ID, and hard-delete cleanup.

## [0.5.1] — 2026-05-25

### Changed
- Version bumped `0.5.0` → `0.5.1` in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.
- `README.md` + `CLAUDE.md` — documented the alternative `npx skills add RealEmmettS/shaughv-code` install path for non-Claude-Code agents (Cursor, OpenCode, Codex, Gemini CLI, etc.). Added `human-changelog` and `naming-conventions` to the listed skills.
- `skills/perplexity-search/SKILL.md` — clarified Perplexity API key prerequisites and `$env:PERPLEXITY_API_KEY` guidance.

### Added
- `.playwright-mcp` entry added to `.gitignore` to ignore Playwright MCP session snapshots.

## [0.5.0] — 2026-05-25

### Added
- `skills/naming-conventions/` — naming rules for any identifier (variables, files, folders, repos, branches, commits, PRs, columns, flags). Carries Code Complete 2 and DevOps Handbook principles plus SHAUGHV-specific conventions. Includes `references/code-identifiers.md`, `references/files-and-folders.md`, `references/git-branches-commits.md`, `references/naming-audit.md`, `references/rationale.md`.

### Changed
- `.claude-plugin/plugin.json` — version bumped `0.4.0` → `0.5.0`; description extended to mention naming conventions; `naming` and `conventions` added to `keywords`.

## [0.4.0] — 2026-05-24

### Added
- `skills/shaughv-cdn/` — consumer guide for the `cdn.shaughv.com` private CDN. URL conventions for `/brand/`, `/fonts/`, `/js/`; canonical `<link>` / `<script>` / `<img>` snippets; font preload patterns; cache contract (1-year immutable binaries, 1-day SWR for CSS/JS); CORS; license restrictions; quick decision matrix.

### Changed
- Version bumped `0.3.0` → `0.4.0`.

## [0.3.0] — 2026-05-24

### Added
- `.mcp.json` — bundles the Remotion documentation MCP server (`npx @remotion/mcp@latest`). Exposes a single tool, `remotion-documentation`, proxied to `mcp.remotion.dev`.
- `commands/create-video.md` — `/shaughv-code:create-video` slash command that scaffolds a Remotion Recorder project via `npx create-video@latest --recorder`, then adds `@remotion/web-renderer` inside the new project (`npx remotion add @remotion/web-renderer`). Falls back to `! npx ...` if either step needs a TTY.

### Changed
- Version bumped `0.2.0` → `0.3.0`.

## [0.2.0] — 2026-05-20

### Added
- `skills/human-changelog/` — translates a repo's `CHANGELOG.md` into a plain-English `HUMAN_CHANGELOG.md`, and installs a standing rule in the repo's `CLAUDE.md` so future agent edits keep the two in lockstep.

### Changed
- Normalized the new skill's `reference/` directory to `references/` to match the rest of the plugin.
- Removed the no-op `user-invocable: true` setting from `shaughv-design` (defaults to true; setting it was redundant). Dropped the now-obsolete "leave it alone" warning from `CLAUDE.md`.
- Version bumped `0.1.0` → `0.2.0`.

## [0.1.0] — 2026-05-19

### Added
- Initial plugin scaffolding. `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` manifests, `.gitignore`, `CLAUDE.md` developer notes, README with installation and repo-layout documentation.
- Initial set of seven skills, migrated from legacy binary `.skill` bundles into a normalized `skills/` tree:
  - `skills/critical-thinking/` — four critical-thinking frameworks (contemplating, problem-solving, decision-making, design) plus devil's advocacy and a working canvas.
  - `skills/openai-audio/` — OpenAI audio stack (Realtime API, transcription, translation, TTS, WebRTC/WebSocket/SIP transports) with 13 runnable examples in Python / JS / TS.
  - `skills/perplexity-search/` — web search and AI-grounded answers via the Perplexity Agent, Search, and Sonar APIs.
  - `skills/pretext/` — DOM-free text measurement and line layout using `@chenglou/pretext`.
  - `skills/quiver-ai/` — SVG generation and raster→vector via Quiver AI's Arrow model.
  - `skills/shaughv-animated-brandmark/` — build the SHAUGHV animated brand mark (draws itself path-by-path, then loops between wordmark and icon).
  - `skills/shaughv-design/` — generate well-branded interfaces and assets for the SHAUGHV brand. Ships fonts, favicons, color tokens, type system, component previews, and two UI kits.

### Removed
- Legacy binary `.skill` bundles in `SKILLS/` — replaced by the normalized `skills/` tree.

[0.8.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.8.0
[0.7.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.7.0
[0.6.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.6.0
[0.5.1]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.5.1
[0.5.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.5.0
[0.4.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.4.0
[0.3.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.3.0
[0.2.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.2.0
[0.1.0]: https://github.com/RealEmmettS/shaughv-code/releases/tag/v0.1.0
