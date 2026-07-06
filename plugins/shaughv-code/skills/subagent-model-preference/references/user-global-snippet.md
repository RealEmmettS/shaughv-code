# Subagent Model Preference — for `~/.claude/CLAUDE.md`

> Paste the section below into your user-global Claude instructions file on any machine:
> `C:\Users\<you>\.claude\CLAUDE.md` (Windows) or `~/.claude/CLAUDE.md` (macOS/Linux).
> It applies to every project. Set 2026-07-01 per Emmett.

---

## Subagent model preference (applies to ALL subagents)

Whenever you spawn a subagent — the `Agent` tool (**including Explore and Plan agents**), `Workflow`
agents, or any other subagent — use a top-tier model/effort pairing. **Never** leave a subagent on a
lower model or below `xhigh` effort.

**Per model — pick the model that fits the task, then its effort. Prefer the first; never go below either.**
- **Opus 4.8 [1m]:** `xhigh` **preferred** (most situations); `max` allowed when the agent judges it
  needs the deeper reasoning (e.g. the single hardest stage).
- **Sonnet 5:** `max` **preferred** (most situations); `xhigh` allowed when the agent doesn't need the
  extra thinking (e.g. cheaper/faster mechanical fan-out).

**Never** a weaker model (no Haiku/older) and **never below `xhigh`** effort. Which model + which of its
two efforts is the orchestrating/spawning agent's call per situation — just honor each model's preferred
default and the floor. In `Workflow` scripts pass model + effort explicitly per agent
(`{model:'opus', effort:'xhigh'|'max'}` or `{model:'sonnet', effort:'max'|'xhigh'}`); for the `Agent`
tool set `model` to `opus`/`sonnet` (it inherits the session's `[1m]` context/effort).
_(Set 2026-07-01 per Emmett.)_

---

## Mapping this forward (when new models are released)

This policy names **two specific model classes** — **Opus** and **Sonnet** — plus each one's **role**
and an **effort floor**. It is not tied to version numbers. When Anthropic ships a new lineup, advance
**each named class along its own lineage** (Opus → next Opus, Sonnet → next Sonnet) and keep it in role:

- **Opus class — flagship / deepest reasoning.** Today **Opus 4.8 [1m]** → the newest **Opus-class**
  model in its **largest-context** variant. Keep **`xhigh` preferred, `max` when needed**. Role: deep
  synthesis, planning, verification, the single hardest stage.
- **Sonnet class — workhorse / high-throughput.** Today **Sonnet 5** → the newest **Sonnet-class**
  model. Keep **`max` preferred, `xhigh` when lighter**. Role: high-parallelism fan-out, mechanical/bulk work.
- **Only the Opus and Sonnet classes are in scope — mind the other classes.** **Haiku** is the excluded
  budget class (never use it for subagents). The **Fable ("mythos") class** — and any other or brand-new
  class — is **not** one of these two slots: do **not** silently map a Fable/mythos model into the Opus
  or Sonnet role just because it's new, large, or capable. Adopting a different class is a *deliberate*
  update to this preference, never an automatic role-remap.
- **The floor holds regardless of names:** never a class below Sonnet (no Haiku/older), and **never
  below `xhigh`** effort.

**At each release, do this:**
1. Find the current **Opus-class** and **Sonnet-class** models (same class lineage as today). Ignore
   Haiku, and ignore any other class (e.g. Fable/mythos) unless this preference is explicitly updated to include it.
2. Swap in the new Opus-class and Sonnet-class names; keep each class's preferred/allowed efforts and the floor.
3. If the effort-level names change, preserve the *shape* on the effort ladder: Opus defaults to
   **one below the top** and may go **top**; Sonnet defaults to the **top** and may drop **one below**.
   The floor stays at "one below the top" (today = `xhigh`) — never lower.
4. Confirm the exact model IDs and the long-context suffix (today `[1m]`), and update the
   `{model:'opus'|'sonnet'}` tool aliases if the class keywords change. (Check current model docs /
   the `claude-api` reference.)
5. Bump the "Set …" date.

**Rule of thumb:** _Opus + Sonnet classes only (never Haiku, never auto-adopt Fable/mythos), top-ish
effort, never below the second-highest effort._
