---
name: loop-escape
description: >-
  Convergence recovery for work that is stuck, going in circles, producing the same result
  twice, or running for hours or days without new evidence. Use when a task is too ambitious,
  the agent keeps retrying the same command/check/tool, nobody can state the last known-good
  state, the validation oracle cannot see the current candidate, or the operator says "get the
  basic version working first," "try a different approach," "break this into steps," "we
  learned nothing," or "does another retry help?" Builds an attempt ledger, separates the
  basic functional bar from additional qualification, classifies repetitions as new evidence,
  valid replication, or duplicate cycles, then routes narrowly to critical-thinking,
  iterative-plan, logical-reasoning, or debugging-framework. Do not trigger for passive
  monitoring, an expected long operation, materially changed iterations, or deliberately
  independent replication with a stated prediction.
---

# Loop Escape

Use this skill as a recovery entrypoint, not as a general-purpose reasoning framework.
Its job is to restore information gain when work has become repetitive, over-scoped, or
impossible to validate.

Automatic invocation depends on the runtime matching the description above. Explicit
invocation is the reliable escape hatch.

## Eligibility gate

Use this workflow when at least one condition holds:

- two consecutive attempts have materially the same relevant state, intervention, and
  observation
- work has continued for a long time without a passed check, actionable failure payload,
  or narrower hypothesis
- the current candidate is invisible to the system that decides success
- the task contains too many coupled gates to establish a basic end-to-end path
- nobody can state the last verified-working state

Do not call ordinary waiting a loop. Passive monitoring, a build that is still within its
expected duration, a retry after a known transient with an explicit bound, a materially
changed experiment, and intentionally independent replication are not duplicate cycles.

## Recovery protocol

### 1. Freeze and checkpoint

Stop the next retry. Read `references/convergence-checkpoint.md` and capture:

- objective
- last known-good state
- basic functional bar
- additional evidence / qualification bar
- the last two attempt signatures

If the information is unavailable, say precisely what is missing. Do not invent a clean
baseline.

Treat facts supplied by the operator or task record as the current evidence unless there
is a concrete contradiction. Missing raw output is an observability failure, not proof
that the attempt never happened. Unknown fields stay marked unknown, but they do not
block the checkpoint when the available facts establish the relevant equality or delta.

### 2. Classify the last two attempts

An attempt signature is:

`relevant starting state + intervention + observation + information gained`

Classify the pair:

- **New evidence** — a relevant input, state, intervention, or observable changed and the
  result distinguishes live hypotheses.
- **Valid replication** — the intervention is intentionally repeated to estimate noise or
  reproducibility; independence, prediction, sample/attempt count, and stop rule were stated
  in advance.
- **Duplicate cycle** — the relevant signature is unchanged and the result neither settles
  a criterion nor narrows a hypothesis.

A retry that merely feels different is still a duplicate if the deciding system receives
the same candidate and produces the same uninformative observation.

If the operator states that the candidate/revision, intervention, and silent observation
were the same twice, classify the available signature as a duplicate cycle even when the
hidden payload cannot be reconstructed. Do not demand independent proof of the supplied
facts before restoring convergence.

### 3. Repair observability before behavior

When a check fails silently or the validation oracle cannot see the candidate, make the
next move expose evidence:

- land or otherwise present the candidate to the real oracle
- print or preserve the payload before throwing
- redirect output when the runtime hides it
- write a cross-boundary report when privilege or process isolation swallows errors
- verify the actual target runtime rather than a convenient substitute
- remove observers and environmental contamination before measuring

Do not spend another cycle changing product behavior while the failure remains
unobservable.

### 4. Route to the owning skill

Always name and read one primary sibling skill, including when observability is broken.
Use `critical-thinking` for an unsuitable oracle/tool, hidden output, observer
contamination, or a strategy-family change; the reporting-first action is the first move
inside that route, not a reason to leave ownership blank.

Read only the smallest useful sibling skill set:

| Failure shape | Primary skill | Optional support |
|---|---|---|
| The framing, assumptions, tool, or strategy family may be wrong | `../critical-thinking/SKILL.md` | `../logical-reasoning/SKILL.md` when the conclusion itself needs an evidence audit |
| The task is too ambitious or lacks a basic end-to-end rung | `../iterative-plan/SKILL.md` | `../critical-thinking/SKILL.md` when no viable slice is apparent |
| The question is whether repeated attempts add evidential weight | `../logical-reasoning/SKILL.md` | `../critical-thinking/SKILL.md` to generate a genuinely different test |
| A concrete code defect remains after the loop is narrowed | `../debugging-framework/SKILL.md` | none; it owns hypothesis-driven debugging |

Normally read one primary skill and at most one support skill. Read all three reasoning
skills only when framing, scope, and evidence are simultaneously broken; state why the
extra context is necessary.

The router contract controls the recovery. Sibling guidance informs the next action but
must not erase a supplied fact, suppress the checkpoint, or add a new proof burden before
the smallest discriminating move.

### 5. Re-enter on the smallest working rung

Preserve the real end goal. Do not silently redefine success downward.

Separate:

1. **Basic functional rung** — the smallest end-to-end path that answers "can this work?"
2. **Integration and hardening rungs** — separately demoable expansions
3. **Qualification and evidence** — required release proof plus any optional, expensive
   proof with an owner and explicit disposition

Choose one next action that is cheap, reversible where possible, and discriminates
between live explanations. State the evidence expected under each relevant outcome and
the condition that stops or redirects the attempt.

## Required output

Before resuming execution, surface:

```markdown
## Convergence checkpoint

- Objective:
- Last known-good:
- Basic functional bar:
- Additional evidence bar:
- Attempt verdict: new evidence | valid replication | duplicate cycle
- Primary skill route:
- Smallest working rung:
- Next discriminating action:
- Expected evidence:
- Stop / redirect condition:
```

Then continue the task using the selected sibling guidance. Do not end by merely telling
the operator which skill they should invoke.
