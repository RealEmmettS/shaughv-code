---
name: loop-escape
description: >-
  Recover work that is stuck, going in circles, repeating the same result, or running without
  new evidence. Use when an agent repeats a command/check/tool, the current candidate is invisible
  to the deciding oracle, nobody can state the last verified state, the task is too ambitious, or
  the operator says "get the basic version working," "try a different approach," "we learned
  nothing," or "does another retry help?" Builds causal attempt signatures, distinguishes
  productive iteration, valid replication, and duplicate routes, classifies token, epistemic,
  action-policy, and false-premise loops, repairs observability, and re-enters through a
  discriminating action. Self-contained; sibling skills add optional depth. Do not trigger for
  passive monitoring, expected long operations, materially changed experiments, or predeclared
  independent replication.
---

# Loop Escape

Use this as a complete recovery workflow, not merely a dispatcher. Its job is to restore
information gain when work has become repetitive, over-scoped, or impossible to validate.
It must still produce a useful checkpoint and next action when no sibling skill is visible
or available. Scale the ceremony to the situation: a short loop may need a compact inline
checkpoint; a long, expensive, or release-critical stall deserves the full ledger.

Automatic invocation depends on the runtime matching the description above. Explicit
invocation is the reliable escape hatch.

## Eligibility gate

Use this workflow when at least one condition holds:

- two consecutive attempts have materially the same relevant state, causal hypothesis,
  intervention family, oracle, and observation, with no information gain — the default audit
  trigger, not a universal attempt limit
- work has continued for a long time without a passed check, actionable failure payload,
  or narrower hypothesis
- the current candidate is invisible to the system that decides success
- the task contains too many coupled gates to establish a basic end-to-end path
- nobody can state the last verified-working state
- one deterministic contradictory observation invalidates a load-bearing premise or route

Do not call ordinary waiting a loop. Passive monitoring, a build that is still within its
expected duration, a retry after a known transient with an explicit bound, a materially
changed experiment, and intentionally independent replication are not duplicate cycles.
Noisy trials may need more than two observations, but only under a predeclared independence
model, sample count or power rationale, and stop rule.

## Recovery guide

### 1. Freeze and checkpoint

Stop the next retry. Read `references/convergence-checkpoint.md` and capture:

- objective
- last known-good state
- basic functional bar
- additional evidence / qualification bar
- load-bearing premise, causal hypothesis, and earliest predicted contradiction
- the last two attempt signatures

If the information is unavailable, say precisely what is missing. Do not invent a clean
baseline.

Treat facts supplied by the operator or task record as the current evidence unless there
is a concrete contradiction. Missing raw output is an observability failure, not proof
that the attempt never happened. Unknown fields stay marked unknown, but they do not
block the checkpoint when the available facts establish the relevant equality or delta.

### 2. Classify the last two attempts

An attempt signature is:

`target + relevant starting state + load-bearing premise + causal hypothesis + strategy
family + intervention + evidence source/oracle + prediction + actual observation +
artifact/state delta + information gained`

Classify the pair:

- **New evidence** — a relevant input, state, intervention, or observable changed and the
  result distinguishes live hypotheses.
- **Valid replication** — the intervention is intentionally repeated to estimate noise or
  reproducibility; independence, prediction, sample/attempt count, and stop rule were stated
  in advance.
- **Non-informative route variation** — the exact intervention or artifact changed, but it stayed
  inside the same causal premise and strategy family and produced no observation that
  distinguishes a live hypothesis. Retire or redesign the family instead of rewarding surface
  variation.
- **Duplicate cycle** — the decision-relevant signature is causally equivalent or unchanged and
  the result neither settles a criterion nor narrows a hypothesis.

A retry that merely feels different is still a duplicate if the deciding system receives
the same candidate and produces the same uninformative observation. A genuinely different
candidate that repeats the family's non-discriminating outcome is a non-informative route
variation, not new evidence.

If the operator states that the candidate/revision, intervention, and silent observation
were the same twice, classify the available signature as a duplicate cycle even when the
hidden payload cannot be reconstructed. Do not demand independent proof of the supplied
facts before restoring convergence.

### 3. Classify the recurrence mechanism

Classify before choosing the repair:

| Class | Observable shape | Mechanism-matched change |
|---|---|---|
| **Token loop** | repeated words or reasoning fragments inside one response | stop/resample, shorten the target, cautiously change decoding, or switch model |
| **Epistemic loop** | rephrased uncertainty with no new test | acquire missing evidence, branch by method, clarify, or return a bounded unknown |
| **Action-policy loop** | the same safe/easy action recurs while a hard progress action is avoided | name and decompose the avoided action or change representation |
| **False-premise trajectory** | varied coherent actions all extend one wrong premise | invalidate descendants, reopen the premise, and test a rival causal model |

Structured equality comes before prose similarity. A different explanation can still be the
same route; a repeated action with a real state or evidence delta can still be productive.

### 4. Repair observability before behavior

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

### 5. Orient with the recovery lenses

Use the failure shapes below as prompts, not a rigid state machine. One usually dominates,
but several may overlap. Apply enough of the embedded guidance to reveal a materially
different next move. Loading another skill is optional, never a prerequisite for recovery.

| Failure shape | Recovery action owned here | Optional deeper guidance |
|---|---|---|
| Framing, assumptions, oracle, tool, or strategy family may be wrong | State the load-bearing assumption, earliest dependent action, predicted contradiction, and descendants invalidated if false. Generate alternatives from genuinely different families: improve observability, build a smaller end-to-end prototype, use an alternate runtime/tool, compare with a working reference, or isolate the environment. Pick the cheapest discriminating family. | `../critical-thinking/SKILL.md` |
| The task is too ambitious or lacks a basic end-to-end rung | Preserve the final goal, then separate the smallest functional rung, demoable integration/hardening rungs, and remaining qualification. Give every expensive optional gate an owner and explicit disposition. | `../iterative-plan/SKILL.md` |
| The question is whether repetition adds evidential weight | Compare starting state, intervention, observation, and information gained. Treat unchanged correlated retries as one inference; require stated independence, prediction, sample count, and stop rule for valid replication. | `../logical-reasoning/SKILL.md` |
| A concrete defect remains after the loop is narrowed | State one live defect hypothesis, the observation that would distinguish it, and one bounded experiment. Hand off only after the oracle can see the candidate and preserve the result. | `../debugging-framework/SKILL.md` |

Use the embedded guidance by default. Read a sibling only when its full method would
materially improve the next move, and keep the added context proportionate. Never block,
invent a replacement skill, or add a proof burden because a sibling is omitted from a
runtime's visible skill list.

### 6. Re-enter on the smallest working rung

Preserve the real end goal. Do not silently redefine success downward.

Separate:

1. **Basic functional rung** — the smallest end-to-end path that answers "can this work?"
2. **Integration and hardening rungs** — separately demoable expansions
3. **Qualification and evidence** — required release proof plus any optional, expensive
   proof with an owner and explicit disposition

Choose one next action that is cheap, reversible where possible, and discriminates
between live explanations. State the evidence expected under each relevant outcome and
the condition that stops or redirects the attempt.

Distinguish three stopping decisions:

- **response stop** — end malformed or repeating generation
- **route stop** — retire one hypothesis, representation, proof family, or repair strategy
- **task stop** — return the truthful terminal state only when acceptance is proved, authority or
  an external dependency blocks progress, a finite budget is exhausted, or no
  information-bearing route remains

After a repair, replay the original failing oracle and the broader acceptance oracle. A
second model's agreement or confident closing paragraph is not a completion receipt.

## Habits that turn a stall into progress

These are judgment guides drawn from a real long-running recovery, not mandatory ceremony:

- **Inherit verified work.** Read the handoff and current evidence completely. Spot-check
  load-bearing claims, but do not restart settled audits merely to feel certain.
- **Convert diagnosis into an observable result.** A locally validated fix sitting outside
  the deciding oracle produces no new information. When delivery is already authorized,
  land and dispatch it promptly; otherwise identify the missing authority plainly.
- **Make the failure speak.** If a check is mute, improve reporting before guessing at
  behavior. Preserve raw payloads and bridge privilege, process, or GUI output boundaries.
- **Let the owner arbitrate scope.** Surface the cost and consequence of an expensive,
  nonessential gate once. Record any deferral with an owner, date, and backlog home rather
  than silently dropping it or grinding on it forever.
- **Treat environment and runtime as test inputs.** Remove observers, inspect competing
  processes, isolate measurements, and prove runtime-specific behavior on the actual
  runtime the product uses.
- **Respect tool boundaries.** After a bounded number of attempts, distinguish “the tool
  ran” from “the objective was observed.” Change tools when the current one cannot see or
  affect the target.
- **Leave conclusions, not a mystery.** Record the evidence, decision, and remaining debt
  so the next session advances from the known state.

## Required output

Before resuming execution, surface the equivalent of this checkpoint. Use the full form
for long or high-stakes work and a concise version for a small loop:

```markdown
## Convergence checkpoint

- Objective:
- Last known-good:
- Basic functional bar:
- Additional evidence bar:
- Load-bearing premise:
- Causal hypothesis:
- Predicted contradictory signal:
- Attempt verdict: new evidence | valid replication | non-informative route variation | duplicate cycle
- Loop class: token | epistemic | action-policy | false-premise trajectory | not a loop
- Primary recovery lens: strategy | scope | evidence | defect
- Optional deeper skill:
- Invalidated descendants:
- Smallest working rung:
- Next discriminating action:
- Expected evidence:
- Response stop condition:
- Route stop condition:
- Task stop condition:
- Original failing oracle to replay:
- Broader acceptance oracle:
- Terminal state if the finite budget ends:
```

Then continue the task using the selected recovery lens. Do not end by merely telling the
operator which skill they should invoke.
