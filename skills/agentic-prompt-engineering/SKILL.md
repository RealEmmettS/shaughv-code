---
name: agentic-prompt-engineering
description: >-
  Design, audit, and apply high-reliability prompts for difficult agentic work. Use for vague or
  underspecified consequential requests, prompts/system prompts/agent briefs, Claude Code or Codex
  instructions, multi-agent workflows, hard problems needing a better representation or method,
  complex software/data work, Erdős-level mathematics/science, and durable long-horizon tasks.
  Without a named mode, infer Author/Audit/Operate/Evaluate and relevant guidance from the latest
  active context, propose a compact working contract, ask concise material questions, and proceed.
  When orchestrating, compile every subagent brief with branch-specific context, oracle, loop
  policy, and return receipt. Tests load-bearing premises, selects information-bearing actions, and
  preserves truthful partial/blocked/refuted states. Route already-stalled work to loop-escape;
  keep routine work proportional.
---

# Agentic Prompt Engineering

Build prompts that control **epistemic state**: what the agent is trying to establish, what is
currently verified, what observation would change the plan, and what evidence permits the final
claim. The goal is not a longer prompt or a smarter-sounding persona. The goal is a reliable
trajectory toward the user's real outcome.

Scale the method to the task. A routine edit may need one objective and one check. A multi-hour
software investigation, research-mathematics search, or scientific workflow needs the full
contract, action ledger, independent evidence, and truthful exit states.

## Resolve and route the invocation

Apply this resolver when the operator invokes the Skill and also when a consequential request is
vague, a clearly long-horizon task lacks a usable contract, or a hard problem needs a better
representation, method family, or success oracle. Infer from the **latest applicable unresolved
request**, explicit corrections, active canonical task state, supplied artifacts, and requested
deliverable. Do not ask the operator to learn or choose this taxonomy when the context decides it:

- **Author** — the requested deliverable is a copy-ready prompt, brief, or instruction set for
  another capable agent.
- **Audit** — a prompt or Skill is supplied and the requested outcome is diagnosis and correction.
- **Evaluate** — the requested outcome is an empirical comparison or release decision about prompt
  or Skill variants. Read `references/evaluation.md`.
- **Operate** — the requested outcome is the underlying software, data, mathematics, science,
  research, or other task. This is the default when invoked against an active task.

For a mixed request, choose the mode matching the final deliverable and use the others as bounded
phases. If the user asks only for a prompt, do not execute the underlying task. If the user asks for
the outcome, do not stop after drafting a prompt. Explicit mode selection wins within governing
authority.

Before substantive work, synthesize a compact routing contract from the current context and treat
it as the working prompt for this run:

```yaml
routing_contract:
  mode:
  objective:
  authority_scope_and_approval_boundaries:
  inputs_and_source_precedence:
  non_goals_and_preservation_invariants:
  deliverable:
  acceptance_criteria_and_oracles:
  valid_terminal_states:
  first_load_bearing_premise:
  next_action_window:
  domain_adapter:
  model_overlay:
  orchestration: none | branch | review | synthesis
```

Fill only decision-relevant fields. Preserve unknowns rather than inventing them. This contract is
derived state, not a new authority layer, and must not revive stale or superseded instructions.
When a vague or underspecified consequential request leaves any material choice unresolved,
surface the proposed interpretation and ask one compact batch of clarification or confirmation
questions before committing to the long-horizon route. Do not silently convert a material unknown
into an assumption. Do not ask for information already answered by the current conversation,
canonical task state, or designated instructions. Read-only or safely reversible discovery may
continue while awaiting answers only when it cannot prejudice the choice. If no material ambiguity
remains, do not invent a question merely to perform ceremony; proceed and surface the resolved
contract only as much as the operator needs.

Route automatically through the conditional guidance below: use task objects to select a domain
adapter, the actual target model/version to select a model overlay, dependency depth or genuinely
independent branches to select long-horizon/orchestration controls, and reuse/release decisions to
select evaluation guidance. Unknown model identity means no model overlay. Routing never requires
delegation when direct work is cheaper and equally reliable.

If the current execution already meets `loop-escape` eligibility—equivalent attempts without
information gain, an invisible deciding oracle, no recoverable verified state, or a false-premise
trajectory—invoke that Skill and continue from its convergence checkpoint. Do not merely recommend
it to the operator. A merely difficult problem, expected long operation, materially changed
experiment, or declared independent replication remains here and is not mislabeled as a loop.

### Compile every subagent prompt

When acting as an orchestrator, apply this Skill before every dispatch. Do not assume the
top-level invocation automatically propagates into a subagent:

1. Resolve the branch's mode and applicable adapters from the live parent contract.
2. Compile a branch-scoped prompt containing the normal task-local context plus the applicable
   objective/dependency, authority, starting evidence, source precedence, scope and preservation
   rules, unique role or method family, artifacts, next action window, acceptance oracle,
   loop/retirement policy, valid terminal states, and return receipt.
3. If the branch runtime exposes this Skill, explicitly tell the subagent to use
   `agentic-prompt-engineering` in **Operate** mode for that branch. Claude Code may invoke
   `/shaughv-code:agentic-prompt-engineering`; Codex may invoke
   `$shaughv-code:agentic-prompt-engineering`. If the Skill is unavailable or invocation syntax
   will not propagate through the dispatch surface, embed the equivalent compact contract instead.
4. Keep decision-relevant context and stable evidence pointers; do not dump the full Skill or
   conversation. Preserve deliberate independence by withholding another branch's conclusions
   from a fresh reviewer when contamination would weaken the oracle.
5. Require the subagent to return claims as evidence, not authority. The orchestrator integrates
   dependencies and owns the global completion claim.

A subagent that is explicitly authorized to orchestrate repeats this compiler for its own
dispatches. Otherwise the instruction does not authorize recursive fan-out. Read
`references/long-horizon-control.md` for the branch brief schema and synthesis rules.

## The invariant control loop

```text
Contract the observable outcome.
Test the premise that could invalidate the most downstream work.
Choose the smallest action that can change a live belief.
Ground every update in current evidence.
Verify the claim at the correct layer.
Change the route when another cycle adds no information.
Return the true terminal state.
```

## 1. Contract the real outcome

Capture the minimum contract that prevents a plausible wrong trajectory:

1. **Objective** — the semantic result and why it matters.
2. **Authority** — whose instructions govern; what may be changed or executed; approval boundaries.
3. **Inputs and sources of truth** — supplied artifacts, live state, and precedence when they
   conflict.
4. **Scope** — in scope, non-goals, preservation invariants, and forbidden side effects.
5. **Deliverables** — artifacts to create or update. A deliverable is not acceptance evidence.
6. **Acceptance map** — each mandatory criterion paired with an oracle whose scope entails the
   claim.
7. **Valid outcomes** — `VERIFIED`, `PARTIAL`, `BLOCKED`, `REFUTED`, `INDETERMINATE`,
   `UNVERIFIED`, or `UNKNOWN_WITHIN_BUDGET`, as applicable.
8. **Work policy** — autonomy, progress cadence, finite budget, escalation conditions, and output
   shape.

Hard constraints outrank preferences; preferences outrank heuristics. Do not turn a heuristic into
a hidden completion gate. Ask one combined clarification only when missing user-only information
would materially change the result, cost, authority, or safety. Otherwise state a bounded
assumption and proceed.

For a full template and construction rules, read `references/task-contract.md` and
`references/prompt-construction.md`.

## 2. Check load-bearing premises before a long chain

Name the one or two premises whose falsity would invalidate the most downstream work. For each:

- state the cheapest available test;
- predict the earliest contradictory observation;
- name the dependent plan nodes or claims that would become unverified;
- run the cheaper test before expanding the plan when practical.

Do not reopen settled facts merely to feel certain. Test assumptions in proportion to their
downstream blast radius, uncertainty, and verification cost.

At the first contradictory observation, pause the current route. Classify whether it challenges
the input, premise, causal hypothesis, intervention, observer, environment, or acceptance oracle.
Repair the **earliest invalid object** and invalidate its descendants before patching the visible
symptom.

## 3. Keep a global skeleton and a short action window

Plan globally only far enough to preserve:

- requirements and non-goals;
- dependency order;
- high-risk premises;
- acceptance/oracle coverage;
- consequential approval points.

Plan the next one or few actions in detail. After each material observation, update the local
window; change the global skeleton only when evidence invalidates it. Replanning prose without a
state or information change is not progress.

When uncertainty is material, maintain competing hypotheses or **method families**, not cosmetic
prompt variants. Each route must state:

- the belief it tests;
- its predicted observation;
- the discriminator that separates it from rivals;
- the budget and retirement condition.

Do not branch a straightforward task. Use parallel agents only for sizeable, genuinely
independent information boundaries with isolated artifacts and a common acceptance contract.

## 4. Make every cycle information-bearing

Before a consequential action, record the compact attempt signature:

```yaml
attempt:
  target:
  starting_state:
  causal_hypothesis:
  strategy_family:
  intervention:
  evidence_source_and_oracle:
  expected_observation:
  predicted_contradiction:
  actual_observation:
  artifact_or_state_delta:
  information_gained:
  route_decision:
```

The next action should be the smallest safe action likely to:

- pass a criterion;
- produce an actionable failure;
- distinguish live hypotheses;
- verify an environmental or semantic fact; or
- expose a decision that only an owner can make.

A command that ran, a candidate the real oracle cannot see, a rewritten explanation, or another
agent repeating the same premises is not evidence.

## 5. Verify the exact claim

Verification is not generic self-critique. Use the strongest available oracle whose scope matches
the claim:

- implementation existence → diff plus exact artifact inspection;
- software behavior → executable outcome plus regression evidence;
- data correctness → value, grain, join, time, and metric reconciliation;
- deductive validity → proof audit or formal checker;
- theorem correspondence → separate statement/assumption mapping;
- scientific support → measurement, rival model, controls, and replication evidence;
- novelty → current literature/provenance review.

Separate **generation**, **candidate comparison**, and **certification**. A judge or reviewer may
select among candidates without proving any candidate correct. Preserve evaluator independence
in proportion to the consequence and gaming risk.

Before a high-consequence success claim, produce a completion receipt:

```yaml
completion_receipt:
  - criterion:
    authoritative_oracle:
    invocation_or_observation:
    raw_result_or_artifact:
    semantic_interpretation:
    scope_limitation:
    status: PASS | FAIL | NOT_RUN | INDETERMINATE
terminal_status:
```

The terminal result is the weakest mandatory row. If the trajectory repaired an earlier failure,
replay the original failing oracle and the broader acceptance oracle before claiming success.

## 6. Stop the route before it becomes a loop

After two semantically equivalent, non-informative cycles, trigger a **strategy audit** by default;
do not infer a universal two-attempt task limit. One deterministic contradiction may retire a
route immediately. Noisy trials may justify predeclared replication with an independence model,
sample count, power rationale, and stop rule.

Classify recurrence before intervening:

| Recurrence | Signal | Change |
|---|---|---|
| token loop | repeated fragments inside one response | stop/resample, shorten target, or switch model |
| epistemic loop | rephrased uncertainty with no new test | acquire missing evidence, branch, clarify, or return bounded unknown |
| action-policy loop | safe/easy action repeats while a hard progress action is avoided | name and decompose the avoided action or change representation |
| false-premise trajectory | varied actions coherently extend one wrong premise | invalidate descendants and test a rival premise |

Distinguish:

- **response stop** — end a malformed or repeating generation;
- **route stop** — retire one hypothesis, representation, or strategy;
- **task stop** — return a truthful terminal state when the contract is satisfied, authority or
  dependency blocks progress, the finite budget is exhausted, or no information-bearing route
  remains.

For an execution already stuck, use `../loop-escape/SKILL.md`; it owns the full recovery checkpoint.
For the broader control patterns, read `references/long-horizon-control.md`.

## 7. Hand off verified state, not a transcript

At a phase boundary, context reset, or agent transfer, preserve:

- objective, authority, constraints, non-goals, and acceptance map;
- verified state with evidence pointers;
- inferences and live hypotheses, clearly distinguished from facts;
- artifacts and exact locations;
- completion receipts and unrun checks;
- attempt ledger;
- failed or retired routes, why, and re-entry condition;
- unresolved contradictory observations;
- open obligations, risks, and required human decisions;
- exact next bounded action and predicted update.

Treat the handoff as evidence, not authority. The receiving agent spot-checks load-bearing claims
and quarantines unsupported assertions without restarting settled work. If an active task system
already designates a continuation packet, update that canonical packet first. Use
`../handoff/SKILL.md` for a standalone durable session document only when explicitly requested,
when no task record owns the work, or when the receiver cannot access the task system.

## Conditional domain and model guidance

Load only what the task needs:

| Task shape | Read |
|---|---|
| prompt wording, examples, schemas, instruction order | `references/prompt-construction.md` |
| long-horizon planning, orchestration, branching, review, handoff, loop control | `references/long-horizon-control.md` |
| software engineering or data engineering/analytics | `references/software-data-adapter.md` |
| research mathematics, Erdős-level search, or scientific discovery | `references/math-science-adapter.md` |
| target model is Claude Fable 5, Claude Opus 5, or GPT-5.6 Sol/Codex | `references/model-overlays.md` |
| optimizing or releasing a prompt/Skill | `references/evaluation.md` |

Model overlays modify the stable core; they never replace acceptance evidence. Domain adapters
change the objects and oracles; they never weaken the task contract.

## Prompt-authoring output

When authoring or auditing a prompt, return:

1. **Copy-ready prompt** — self-contained, proportional, and free of commentary inside the block.
2. **Assumptions or decisions needed** — only material unresolved choices.
3. **Design notes** — a short explanation of load-bearing controls and conditional references.
4. **Evaluation plan** — only when the prompt will be reused, shipped as a Skill, or trusted for
   consequential work.

Do not request private chain-of-thought. Ask for concise rationale, assumptions, evidence,
decisions, and artifacts. Do not use prestige personas, magic phrases, majority vote, giant
context dumps, unconditional fresh chats, fixed retry counts, or “continue until solved” as
substitutes for an oracle and finite truthful contract.

## Boundaries with sibling skills

- `loop-escape` owns recovery after a route is already repetitive or unobservable.
- `iterative-plan` owns milestone shaping and thin progressive slices.
- `critical-thinking` owns open-ended reframing and adversarial alternative generation.
- `logical-reasoning` owns argument validity, formal structure, and inference audits.
- `debugging-framework` and `bug-triage` own concrete software-defect diagnosis.
- An active task system owns its canonical continuation packet; `handoff` owns an explicitly
  requested standalone artifact or the fallback when no task record owns the work.
- `workflow-optimization` owns analysis of a repeatable organizational or operational process.

This skill owns the shared **prompt-facing contract and control loop**. Do not duplicate the
specialists' full methods here.
