---
name: workflow-optimization
description: >-
  Analyze and improve a repeatable workflow or process with proportional evidence, not mandatory
  ceremony. Use when someone asks to optimize, streamline, redesign, audit, map, document, or fix
  how work moves end to end; when a process is slow, broken, variable, wasteful, or bottlenecked;
  or when designing a new operating workflow. Offers a focused mode for one bottleneck and a
  comprehensive mode for broad/high-risk audits. Contracts the outcome, reconstructs the current
  process, measures a baseline, selects only applicable Lean, Six Sigma, Theory of Constraints,
  TQM, BPR, and Process Optimization lenses, pilots the smallest discriminating change, and
  remeasures the result. Diagramming and multi-turn clarification are conditional. For
  Agile/Scrum methodology prefer agile; for milestone shaping prefer iterative-plan.
---

# Workflow Optimization

Improve a repeatable process by connecting a **causal bottleneck hypothesis** to a bounded change
and a remeasurement oracle. The deliverable is not a long list of plausible recommendations; it is
a decision-ready map of what to change, why, how to pilot it, and what observation proves whether
it helped.

## Choose the mode

- **Focused improvement** — default for a specific pain point or ordinary workflow. Contract the
  outcome, measure the baseline, select the most informative lens or two, pilot one change, and
  remeasure.
- **Comprehensive audit** — use when the user explicitly asks for exhaustive coverage or when the
  process is high-risk, cross-functional, large, or poorly understood. Scan all six lenses for
  applicability; deeply apply only those expected to add distinct evidence.
- **Design mode** — for a new workflow. Define value, constraints, failure modes, controls, and
  measurement before optimizing nonexistent historical data.

State the selected mode and why in one line. Do not turn a small request into a multi-turn program.

## 1. Contract the workflow outcome

Capture:

- workflow's customer and intended output;
- start and end boundaries;
- target metric or observable outcome;
- current pain and cost;
- in-scope segment and non-goals;
- preservation constraints and approval boundaries;
- baseline and post-change oracle;
- valid outcomes, including inconclusive or blocked.

Ask only when missing user-only information materially changes scope, authority, safety, or what
counts as improvement. Otherwise mark assumptions and proceed.

## 2. Inventory evidence proportionally

Inventory the supplied files, links, descriptions, measures, and process artifacts. Read the
evidence needed for the current decision. Preserve stable pointers to bulky logs, transcripts, and
archives rather than loading everything into active context.

Reconstruct:

- trigger and demand;
- ordered steps and decision branches;
- inputs/outputs;
- owners and handoffs;
- queues, waits, rework, and failure paths;
- volume, timing, variation, defects, and resource constraints;
- current controls and measurement quality.

If a fact is uncertain, label it. A polished diagram of an assumed process is worse than a rough,
accurate capture.

## 3. Establish a baseline and causal hypotheses

Use the strongest available baseline:

- cycle and wait time;
- throughput and work in process;
- defect/rework/escape rate;
- variation and tail latency;
- capacity/utilization at the constraint;
- cost, effort, or failure impact;
- customer outcome or service level.

State:

- primary bottleneck or causal hypothesis;
- at least one rival explanation when uncertainty is material;
- observation expected under each;
- cheapest discriminating measurement or pilot;
- confounders and measurement limitations.

Do not optimize an unvalidated proxy merely because it is easy to count.

## 4. Select lenses by expected information value

Scan all six lenses for applicability. In focused mode, deeply apply only the lens or small
combination likely to change the decision. In comprehensive mode, record every lens as
`applied`, `not applicable`, or `overlaps with <lens>` and explain the disposition.

| Lens | Best fit | Reference |
|---|---|---|
| Lean | flow, waste, pull, handoffs, queues | `references/lean.md` |
| Six Sigma | defects, variation, measurement, capability | `references/six-sigma.md` |
| Theory of Constraints | one limiting resource or policy | `references/theory-of-constraints.md` |
| Total Quality Management | systemic quality and feedback culture | `references/total-quality-management.md` |
| Business Process Re-engineering | assumptions are obsolete; discontinuous redesign | `references/business-process-reengineering.md` |
| Process Optimization | parameters, objectives, constraints, trade-offs | `references/process-optimization.md` |

Use `references/core-principles.md` and `references/checklists.md` as cross-cutting detection aids,
not mandatory duplicate passes. Load a theory reference only when applying that lens.

Maintain a compact ledger:

```markdown
| Lens | Disposition | Distinct evidence or finding | Decision effect |
|---|---|---|---|
| Lean | applied | | |
| Six Sigma | not applicable | | |
```

Completeness means every relevant failure mechanism was considered, not that every framework
produced repetitive prose.

## 5. Choose and pilot the smallest discriminating change

Generate a bounded option set. For each serious option, state:

- causal mechanism;
- expected metric/state change;
- scope and owner;
- cost, risk, reversibility, and dependencies;
- pilot boundary;
- measurement and stop/rollback condition;
- unintended effects to watch.

Prioritize transparently with `references/prioritization.md`. Present a short decision set in the
primary response; preserve the full option ledger as an artifact when useful.

Prefer the smallest change that distinguishes the live hypotheses. Do not confuse a recommendation
with an implemented improvement.

## 6. Remeasure and close truthfully

After the pilot or authorized change:

1. run the predeclared oracle;
2. compare against the frozen baseline;
3. check quality, downstream effects, and displacement of the constraint;
4. inspect confounders and evaluator changes;
5. decide adopt, revise, rollback, expand, or remain inconclusive.

Use a receipt:

```yaml
workflow_receipt:
  objective:
  baseline:
  causal_hypothesis:
  change_or_pilot:
  oracle:
  raw_result_or_pointer:
  observed_delta:
  side_effects:
  interpretation:
  limitation:
  decision:
  status: PASS | FAIL | NOT_RUN | INDETERMINATE
```

If only analysis was authorized, return `RECOMMENDED_NOT_PILOTED` rather than implying the workflow
improved.

## Diagram condition

Use a diagram only when branching, ownership, handoffs, queues, rework, or state transitions are
materially easier to understand visually. A short linear process needs only a list or table.
When a diagram helps, choose the smallest useful form through `references/diagramming.md` and
verify that it matches the reconstructed process.

## Clarification and collaboration

Share a rough capture when the process is ambiguous or the user's domain knowledge can falsify it.
Do not require a confirmation round for facts that are already supported, low-risk, or cheaply
reversible. Surface one combined material question, continue safe read-only analysis when
possible, and preserve assumptions explicitly.

## Boundaries

- `iterative-plan` owns product milestone shaping and thin delivery slices.
- `agentic-prompt-engineering` owns the general task contract, model overlays, agent loop controls,
  and prompt evaluation.
- `critical-thinking` owns broad reframing when the workflow itself may be the wrong objective.
- `loop-escape` owns an already-repetitive execution route.
- `agile` owns Agile/Scrum framework and team-methodology questions.

## Reference index

- `references/meta-workflow-checklist.md` — proportional focused/comprehensive self-check
- `references/core-principles.md` — cross-cutting principles
- `references/checklists.md` — waste, constraint, variation, and quality detection aids
- `references/diagramming.md` — conditional visualization
- `references/prioritization.md` — transparent option ranking
- `references/lean.md`
- `references/six-sigma.md`
- `references/theory-of-constraints.md`
- `references/total-quality-management.md`
- `references/business-process-reengineering.md`
- `references/process-optimization.md`
