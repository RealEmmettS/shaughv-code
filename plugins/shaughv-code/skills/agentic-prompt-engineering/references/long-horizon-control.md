# Long-Horizon Control

Use this for work with dependent phases, sparse feedback, expensive actions, multiple candidate
routes, or context/session boundaries. Long horizon means **dependency depth**, not elapsed time or
turn count.

## Contents

- [Receding-horizon planning](#receding-horizon-planning)
- [Action selection](#action-selection)
- [First contradictory signal](#first-contradictory-signal)
- [Structured attempt ledger](#structured-attempt-ledger)
- [Retry and recurrence policy](#retry-and-recurrence-policy)
- [Mechanism-matched loop audit](#mechanism-matched-loop-audit)
- [Branching and multi-agent work](#branching-and-multi-agent-work)
- [Fresh-context review](#fresh-context-review)
- [Typed handoff](#typed-handoff)
- [Completion](#completion)

## Receding-horizon planning

Maintain two layers:

- **global skeleton** — immutable goal unless the operator changes it; constraints, non-goals,
  dependencies, acceptance/oracle map, risky premises, and approval gates;
- **local window** — the next one or few actions, predictions, and stop/redirect conditions.

Audit the global skeleton once for coverage and contradictions. Reopen it only when new evidence
invalidates a premise, dependency, oracle, or scope decision.

Before promising execution, test feasibility:

- are required inputs and permissions present?
- can the deciding oracle see the candidate?
- is the target environment available?
- is any external dependency outside the run's authority?
- can a bounded partial result still be useful?

## Action selection

Prefer the action with the highest expected decision value per unit of cost and risk. A useful next
action:

- discriminates live hypotheses;
- touches the real system at the earliest uncertain boundary;
- is reversible or bounded where practical;
- produces a preserved observation;
- has a declared stop or redirect condition.

Do not optimize for visible busyness, number of tool calls, plan completeness, or prose length.

## First contradictory signal

When an observation contradicts the current route:

1. freeze the route;
2. identify the earliest premise or transition that can explain the contradiction;
3. list at least one rival cause and the observation that distinguishes it;
4. mark downstream claims and plan nodes unverified;
5. run the smallest discriminating probe;
6. patch only after evidence supports the repair target;
7. replay the original failing oracle and broader acceptance oracle.

This is a route decision, not an automatic task failure.

## Structured attempt ledger

Use a durable ledger for uncertain or repeated work:

| Field | Meaning |
|---|---|
| target obligation | criterion, proof obligation, or decision being advanced |
| starting state | candidate, inputs, environment, permissions, and known facts |
| load-bearing premise | upstream belief whose failure invalidates the route |
| causal hypothesis | why this action should change the target |
| strategy family | diagnosis, representation, proof family, tool, experiment class |
| intervention | exact action or command |
| oracle/evidence source | what will observe the effect |
| prediction | observation expected if the hypothesis is right |
| contradiction | earliest observation expected if it is wrong |
| actual observation | preserved raw result or pointer |
| state/artifact delta | what materially changed |
| information gained | belief, dependency, or boundary updated |
| verdict | advance, replicate, repair, retire, branch, block, or stop |

Compare structure before prose similarity. Differently worded attempts can be the same route.

## Retry and recurrence policy

Use a ladder:

1. **bounded transient retry** — only for a named transient mechanism;
2. **instrumented repeat** — improve observability or isolate confounders;
3. **valid replication** — predeclare independence, prediction, count, and stop rule;
4. **route change** — change premise, representation, strategy family, tool, environment, or oracle;
5. **task exit** — return the truthful bounded state.

After two equivalent non-informative cycles, default to an audit. The threshold is an early-warning
heuristic, not a universal law:

- one deterministic contradiction may be enough;
- high-variance trials may need a justified sample plan;
- productive recurrence has a real state, evidence, or proof-obligation delta.

## Mechanism-matched loop audit

```text
A. Recurrence level
TOKEN / EPISTEMIC / ACTION_POLICY / FALSE_PREMISE_TRAJECTORY / NOT_A_LOOP

B. Last two signatures
same target? causal hypothesis? strategy family? evidence source? verifier? resulting state?

C. Information value
What can another cycle add? If none, the current route is retired.

D. Mechanism-matched change
RESAMPLE / ACQUIRE EVIDENCE / DECOMPOSE AVOIDED ACTION / CHANGE REPRESENTATION /
TEST RIVAL PREMISE / CHANGE ORACLE / REQUEST DECISION / RETURN BOUNDED STATE

E. Budget and re-entry
Finite budget; evidence required before this route can reopen.
```

## Branching and multi-agent work

Use another agent only when the work can be separated by an information boundary:

- different proof or causal method families;
- independent reproduction or review;
- distinct source corpora;
- separable modules or artifacts;
- parallel, non-overlapping data investigations.

Before every dispatch, compile a branch prompt through the parent Skill. Loading the Skill in the
orchestrator does not automatically load it in the child. If the child runtime exposes
`agentic-prompt-engineering`, explicitly request **Operate** mode for the branch; otherwise embed
the equivalent contract. Use the runtime-neutral Skill name in the prose, with
`/shaughv-code:agentic-prompt-engineering` for Claude Code or
`$shaughv-code:agentic-prompt-engineering` for Codex when the dispatch surface supports explicit
invocation.

The compiled brief augments, rather than replaces, the normal repository, tool, artifact, and
environment information the orchestrator would provide:

```yaml
branch_brief:
  parent_objective_and_dependency:
  branch_objective_and_unique_role:
  authority_scope_and_approval_boundaries:
  starting_verified_state_and_evidence_pointers:
  source_precedence:
  non_goals_and_preservation_invariants:
  artifacts_paths_tools_and_environment:
  method_family_or_hypothesis:
  next_action_window:
  predicted_observation_and_contradiction:
  acceptance_criterion_and_authoritative_oracle:
  loop_budget_retirement_and_reentry:
  valid_terminal_states:
  required_evidence_and_return_receipt:
```

Each branch receives the applicable slice of the shared objective, constraints, sources of truth,
acceptance map, and output schema—not a transcript dump or every unrelated criterion. Keep branch
artifacts isolated until commitment. Require each branch to state predictions, evidence, failures,
uncertainty, information gained, and route decision. A branch may not expand authority or declare
global completion.

If a child is authorized to orchestrate, it repeats the compiler at that boundary. Otherwise the
brief does not authorize recursive delegation merely because multi-agent guidance is present.

Synthesis is not voting. Compare:

- statement/task fidelity;
- evidence strength and oracle scope;
- independence and correlated assumptions;
- failed predictions;
- cost and residual risk.

A candidate selector chooses. A task-matching oracle certifies.

## Fresh-context review

Use fresh context when independence or removal of stale trajectory commitments is worth transfer
loss:

- the implementing trajectory is strongly anchored to one premise;
- a consequential artifact needs independent review;
- context contains bulky restorable outputs but one unresolved error must be preserved;
- model-specific guidance recommends it for long-run verification.

Give the reviewer:

- immutable contract;
- candidate artifact;
- raw evidence and exact pointers;
- explicit review duties and terminal schema.

Do not give the implementer's confidence narrative as evidence. Do not start a fresh context merely
to repeat the same prompt, sources, assumptions, and weak verifier.

## Typed handoff

```markdown
# Objective and acceptance
# Authority, constraints, and non-goals
# Verified state and evidence pointers
# Inferences and live causal hypotheses
# Artifacts and exact locations
# Completion receipts and unrun checks
# Attempt ledger
# Failed or retired routes and re-entry conditions
# Unresolved contradictory observations
# Open obligations and risks
# Next bounded action and predicted observation
# Human decisions or external dependencies
```

Keep raw history at stable paths. The active packet should make the next decision possible, not
replay every conversation turn.

## Completion

Before success:

- inspect the final artifact/state, not only the narrative;
- run each mandatory oracle against the current candidate;
- verify that tests/evaluators were not weakened or contaminated;
- record raw results and semantic scope;
- replay the original failure after repair;
- return the weakest mandatory receipt row.

If no information-bearing route remains within the finite budget, preserve the unresolved failure
and return `UNKNOWN_WITHIN_BUDGET`, `INDETERMINATE`, `BLOCKED`, or `PARTIAL` rather than looping.
