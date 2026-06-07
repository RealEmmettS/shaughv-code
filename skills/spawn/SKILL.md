---
name: spawn
description: "MANUAL-INVOCATION-ONLY orchestration playbook — invoke ONLY when the operator explicitly types the /spawn command. Encodes the two-phase Opus-subagent pattern (a read-only INVESTIGATE agent, then a separate EXECUTE agent) for driving one problem to done via subagents. Do NOT auto-trigger this skill from task wording, keywords, or context — it is never useful as an auto-loaded skill, and auto-loading it inside a subagent risks recursive agent spawning. If you are a dispatched subagent, do not load or act on this skill."
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to carry out a specific task, STOP — do not load or act on this skill. /spawn orchestrates the spawning of subagents; a subagent that acted on it would recursively spawn more subagents. Only the top-level, operator-facing agent runs this, and only when the operator explicitly typed /spawn.
</SUBAGENT-STOP>

# /spawn — two-phase subagent orchestration

Use this when the operator types **/spawn** and wants a single problem driven to done by subagents using our standard pattern: one agent **investigates**, a separate agent **executes**. Nothing here auto-triggers — if the operator didn't type /spawn, you should not be reading this.

## Why two phases

Investigating and executing are different jobs with different risk. Splitting them:
- keeps each agent's context lean and single-purpose,
- makes the diagnosis **auditable before any change touches prod**,
- lets the operator gate the fix between the two,
- and avoids one over-long agent that diagnoses and edits in the same muddled pass.

The investigator is **read-only** and can be wrong cheaply. The executor gets a **precise, pre-vetted brief** and a clean slate.

## Phase 1 — Investigate (read-only)

Dispatch **one** subagent:
- Model: **the latest Opus with 1M context (currently Opus 4.8 `[1m]`)** at **XHIGH** thinking. Never downgrade.
- Mode: **read-only**. It diagnoses; it does **not** implement, deploy, or edit.
- Optional pairing: have it invoke **theia-tools:critical-thinking** and a triage skill (e.g. **bug-triage**) when the problem is a bug or an ambiguous failure.
- Output: a findings report with the **actual evidence** (paths, queries, row counts, errors) and a **recommended fix** — scoped (files, repos, risk, reversibility) and ranked if there are options.

Dispatch template (Agent tool, `model: "opus"`, `run_in_background: true`):

```
You are a READ-ONLY INVESTIGATION subagent. Work at MAXIMUM reasoning depth (XHIGH).
Do NOT make any code/SQL/infra changes — produce findings + a recommended fix only.
[If a bug:] invoke the bug-triage skill and theia-tools:critical-thinking.
PROBLEM: <one-paragraph statement + where to look>.
ANSWER, with evidence: <the specific questions to settle>.
DELIVER: findings (with numbers), root cause, recommended fix (scope / risk / reversibility / repos),
and a blocking-vs-fix-forward verdict. Do NOT implement — the orchestrator files the fix task
and dispatches a SEPARATE execute agent from your recommendation.
```

When it returns, **read the findings** and decide the fix. Don't stop at the report — that's Phase 2.

## Phase 2 — Execute

From the investigation:
1. **File a Mission Control task** (project as appropriate) capturing the problem + the intended fix, scoped enough that a fresh agent could pick it up cold (the new-hire test).
2. Dispatch a **separate** subagent (again the latest Opus `[1m]`, XHIGH) to implement it:
   - invoke **theia-tools:git-workflow** (and **theia-tools:mission-control-toolkit** to claim/update the task),
   - **fully reversible** — capture the exact rollback,
   - **live-verified** — prove the fix on the real target, not just "it should work,"
   - open a **PR but do NOT self-merge** — the orchestrator reviews and merges.

Dispatch template:

```
You are a fix subagent. Work at MAXIMUM reasoning depth (XHIGH).
Invoke theia-tools:mission-control-toolkit + theia-tools:git-workflow (+ theia-tools:critical-thinking).
Claim MC task <ID> and execute it end-to-end.
FIX: <the investigation's recommended fix, made concrete>.
GUARDRAILS: additive / reversible where possible; capture exact rollback; verify live;
git-workflow worktree off the latest origin/main; PR — do NOT self-merge (operator merges).
ON DONE: update the task completed/done with evidence + rollback; check out; report what changed,
the verification, the PR number, and anything needing the operator.
```

## Standing conventions (bake these into every dispatch)

- **Always the latest Opus with 1M context (currently Opus 4.8 `[1m]`) at XHIGH.** Never downgrade a subagent to a smaller model or lower thinking to save cost — correctness and depth win. When "latest Opus" advances past 4.8, follow it.
- **Investigation → task → fix chain.** When an investigation surfaces a fixable issue, drive it to done: file the task, dispatch the executor. Don't hand the operator a passive report.
- **Separate agents for investigate vs execute.** Clean, single-purpose context each.
- **Orchestrator stays in the loop.** Verify each agent's result against the live target. Optionally run a **theia-tools:critical-thinking review agent** over the executed work (was the task scoped well? was it done thoroughly?) before merging. Then merge.
- **Reversibility first.** Every production change carries a captured rollback.

## Anti-recursion (why this is invoke-only)

This skill's whole job is to spawn agents. If a spawned agent loaded and acted on it, it would spawn more agents, and so on. Two guards prevent that:
1. The description is **manual-invocation-only** — it must never auto-trigger from task content.
2. The `<SUBAGENT-STOP>` guard at the top halts any dispatched subagent that loads it anyway.

Never instruct a dispatched agent to load /spawn. The orchestration lives only at the top level.
