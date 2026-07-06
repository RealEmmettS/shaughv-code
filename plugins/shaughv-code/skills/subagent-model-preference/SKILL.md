---
name: subagent-model-preference
description: >-
  The operator's standing model/effort convention for EVERY subagent — the Agent tool (including
  Explore/Plan agents), Workflow agent() calls, custom agent types, any dispatch. Trigger whenever
  spawning a subagent, choosing a model or effort/reasoning level for one, writing a Workflow
  script's model/effort params, or authoring a dispatch prompt; also when a new Anthropic lineup
  ships (the mapping-forward procedure lives here) or when installing the rule into a repo/machine
  (paste-able snippets in references/). Short form: Opus 4.8 [1m] at xhigh (max when needed) for
  deep work; Sonnet 5 at max (xhigh when lighter) for fan-out; never Haiku/budget classes, never
  auto-substitute Fable/mythos, never below xhigh. Set 2026-07-01 per Emmett.
---

# Subagent Model Preference

The operator's standing convention for the model + effort of **every subagent** spawned in any
session, any repo. It mirrors the user-global preference in `~/.claude/CLAUDE.md`; this skill is the
plugin's canonical copy so every teammate's agents inherit it, plus the forward-mapping procedure for
new model releases and paste-able snippets for repo/user installation.

## The convention (applies to ALL subagents)

Whenever you spawn a subagent — the `Agent` tool (**including Explore and Plan agents**), `Workflow`
`agent()` calls, custom agent types, or any other subagent — use a top-tier model/effort pairing.
**Never** leave a subagent on a lower model or below `xhigh` effort.

**Per model — pick the model that fits the task, then its effort. Prefer the first; never go below either.**

- **Opus 4.8 [1m]:** `xhigh` **preferred** (most situations); `max` allowed when the agent judges it
  needs the deeper reasoning (e.g. the single hardest stage). Role: deep synthesis, planning,
  verification, investigation.
- **Sonnet 5:** `max` **preferred** (most situations); `xhigh` allowed when the agent doesn't need
  the extra thinking (e.g. cheaper/faster mechanical fan-out). Role: high-parallelism fan-out,
  mechanical/bulk work.

Only the **Opus** and **Sonnet** classes are in scope. **Never** a weaker/budget class (no **Haiku**
or older), and do **not** substitute the **Fable ("mythos") class** — or any other/new class — into
the Opus or Sonnet slot just because it's new or capable: adopting a different class is a deliberate
update to this convention, not an automatic remap. **Never below `xhigh`** effort. Which model +
which of its two efforts is the spawning/orchestrating agent's call per situation — just honor each
model's preferred default and the floor.

**Mechanics:**

- `Workflow` scripts: pass model + effort explicitly per agent —
  `{model:'opus', effort:'xhigh'|'max'}` or `{model:'sonnet', effort:'max'|'xhigh'}`.
- `Agent` tool: set `model` to `opus`/`sonnet` (it inherits the session's `[1m]` context/effort
  configuration; if the surface has no effort parameter, instruct the depth in the dispatch prompt —
  "Work at MAXIMUM reasoning depth").
- Never downgrade a subagent to save cost — correctness and depth win (the /spawn playbook's
  standing rule; it defers to this skill for current defaults).

## Mapping this forward (when new models are released)

This convention names **two model classes** — **Opus** and **Sonnet** — plus each one's **role** and
an **effort floor**. It is not tied to version numbers. When Anthropic ships a new lineup, advance
**each named class along its own lineage** (Opus → next Opus, Sonnet → next Sonnet) and keep it in
role:

- **Opus class — flagship / deepest reasoning.** Today **Opus 4.8 [1m]** → the newest **Opus-class**
  model in its **largest-context** variant. Keep **`xhigh` preferred, `max` when needed**.
- **Sonnet class — workhorse / high-throughput.** Today **Sonnet 5** → the newest **Sonnet-class**
  model. Keep **`max` preferred, `xhigh` when lighter**.
- **Mind the other classes.** **Haiku** is the excluded budget class (never for subagents). The
  **Fable ("mythos") class** — and any other or brand-new class — is **not** one of these two slots:
  do **not** silently map a Fable/mythos model into the Opus or Sonnet role because it's new, large,
  or capable. Adopting a different class is a *deliberate* update to this convention, never an
  automatic role-remap.
- **The floor holds regardless of names:** never a class below Sonnet, and **never below `xhigh`**
  effort.

**At each release:**

1. Find the current **Opus-class** and **Sonnet-class** models (same class lineage as today). Ignore
   Haiku and any other class (e.g. Fable/mythos) unless this convention is explicitly updated to
   include it.
2. Swap in the new Opus-class and Sonnet-class names; keep each class's preferred/allowed efforts and
   the floor.
3. If the effort-level names change, preserve the *shape* on the effort ladder: Opus defaults to
   **one below the top** and may go **top**; Sonnet defaults to the **top** and may drop **one
   below**. The floor stays at "one below the top" (today = `xhigh`) — never lower.
4. Confirm the exact model IDs and the long-context suffix (today `[1m]`), and update the
   `{model:'opus'|'sonnet'}` tool aliases if the class keywords change (check current model docs).
5. Bump the "Set …" date — here, in `references/`, and in any CLAUDE.md/AGENTS.md installs.

**Rule of thumb:** _Opus + Sonnet classes only (never Haiku, never auto-adopt Fable/mythos), top-ish
effort, never below the second-highest effort._

## Installing the convention outside the plugin

Two paste-able snippets, for surfaces that don't load this skill:

- [`references/user-global-snippet.md`](references/user-global-snippet.md) — for
  `~/.claude/CLAUDE.md` on any machine (applies to every project).
- [`references/repo-snippet.md`](references/repo-snippet.md) — for a repository's `CLAUDE.md`
  (Claude Code) / `AGENTS.md` (Codex and others), so repo-scoped agents on any harness follow it.

Keep installs in lockstep with this skill when the mapping advances.

## Cross-references

- **`spawn`** — the /spawn two-phase orchestration playbook; its dispatches follow this convention
  for model/effort choices.
- **`iterative-plan`** — when planning fans work out to agents, the fan-out's model choices follow
  this convention.
