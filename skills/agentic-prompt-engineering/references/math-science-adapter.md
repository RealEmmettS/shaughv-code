# Mathematics and Science Adapter

This adapter aims for an **Erdős-level behavior profile**: semantic precision, representation
choice, broad but governed search, obstruction harvesting, proof discipline, and honest epistemic
status. It does not claim that a persona or prompt creates mathematical genius.

## Contents

- [Research mathematics](#research-mathematics)
  - [Gate zero: statement fidelity](#gate-zero-statement-fidelity)
  - [Render the quantifier game and nearest misses](#render-the-quantifier-game-and-nearest-misses)
  - [Permit prove, refute, or repair](#permit-prove-refute-or-repair)
  - [Separate theorem completion from run exit](#separate-theorem-completion-from-run-exit)
  - [Normalize into objects](#normalize-into-objects)
  - [Require representation parity](#require-representation-parity)
  - [Use examples as structure discovery](#use-examples-as-structure-discovery)
  - [Run a counterexample engine](#run-a-counterexample-engine)
  - [Search by method family](#search-by-method-family)
  - [Use probabilistic dual certificates when the structure permits](#use-probabilistic-dual-certificates-when-the-structure-permits)
  - [Maintain a proof-obligation DAG](#maintain-a-proof-obligation-dag)
  - [Audit first-move loss](#audit-first-move-loss)
  - [Separate three mathematical statuses](#separate-three-mathematical-statuses)
  - [Digest the mechanism after success](#digest-the-mechanism-after-success)
  - [Executable evolutionary search](#executable-evolutionary-search)
  - [Bounded proof digestion](#bounded-proof-digestion)
  - [Bare-statement control](#bare-statement-control)
- [Scientific discovery](#scientific-discovery)
  - [Specify the scientific decision](#specify-the-scientific-decision)
  - [Force ideas through an execution gate](#force-ideas-through-an-execution-gate)
  - [Diversify by research move](#diversify-by-research-move)
  - [Sequence search before experiment](#sequence-search-before-experiment)
  - [Make actions and observations typed](#make-actions-and-observations-typed)
  - [Stage gates](#stage-gates)
  - [Scientific completion evidence](#scientific-completion-evidence)

## Research mathematics

### Gate zero: statement fidelity

Before searching for a proof, freeze a semantic checksum:

- exact statement and source;
- definitions and conventions;
- quantifier order and domains;
- assumptions and allowed axioms;
- target conclusion;
- edge cases and degenerate objects;
- equivalence maps for any reformulation;
- known/open/false/malformed status if established;
- provenance and date.

Restate the statement in formal or near-formal form and map each symbol back to the original.
Test witness stability under the quantifiers. A valid deduction about a nearby theorem is not
success.

### Render the quantifier game and nearest misses

Do not merely list quantifiers. Make choice order, permitted dependence, witness stability,
uniformity, and full-sequence versus subsequence requirements explicit:

```yaml
quantifier_game:
  choices:
    - variable:
      quantifier:
      chosen_before:
      may_depend_on:
  witness_must_be_fixed_across:
  uniformity_domain:
  full_sequence_or_subsequence:
  target_scale:
  maximum_tolerable_error:
```

Write the exact negation as a second game. Then maintain a problem-specific
`non_solution_register`:

```yaml
non_solution_register:
  - tempting_result:
    why_it_does_not_discharge_the_target:
    detection_test:
    reusable_partial_value:
```

Include likely near misses: restricted object classes, scale-dependent witnesses, subsequence or
almost-everywhere results, expectation without deterministic existence, finite computation without
an asymptotic bridge, an unbounded relaxation gap, or a reduction to an equivalent-strength open
claim.

### Permit prove, refute, or repair

The search contract must allow:

- `PROVED`;
- `REFUTED_BY_COUNTEREXAMPLE`;
- `REPAIRED_STATEMENT_WITH_PROOF_OR_EVIDENCE`;
- `PARTIAL_LEMMAS`;
- `OPEN_OBLIGATIONS`;
- `INDETERMINATE`;
- `UNKNOWN_WITHIN_BUDGET`.

Do not force a proof of a false or open statement.

### Separate theorem completion from run exit

Keep two contracts:

```yaml
target_completion:
  affirmative:
  negative:
run_exit:
  - verified_proof
  - verified_counterexample
  - proved_partial_result
  - exact_obstruction
  - malformed_or_semantically_refuted
  - unknown_within_budget
```

Never weaken theorem completion to satisfy a run deadline. Never delete the run-exit contract to
pressure the model into closure. Declare wall-clock, compute, tool, and branch budgets before a
frontier search; at exhaustion, return the strongest supported run-exit state with the exact open
obligations and preserved artifacts.

### Normalize into objects

Translate the problem into explicit objects and relations:

- graph, hypergraph, matroid, group, ring, measure, category, game, dynamical system, program,
  finite construction, or other fitting representation;
- invariants and monotone quantities;
- symmetries and quotient structures;
- local/global constraints;
- extremal or minimal counterexample forms;
- constructive versus existential obligations.

Record which properties survive each representation change.

### Require representation parity

Before searching inside a transformed problem, prove or expose its relationship to the original:

```yaml
representation_parity:
  forward_map:
  image_constraint:
  reverse_or_recovery_map:
  exact_or_lossy:
  preserved_quantifiers:
  preserved_objective_and_scale:
  preserved_boundary_and_degenerate_cases:
  relaxation_or_integrality_gap:
  equivalence_proof_status:
```

A theorem about arbitrary target-side objects is not a theorem about the original objects when
only a structured subclass lies in the image. Treat an unproved equivalence, limit interchange,
compactness step, or expectation-to-existence conversion as its own proof obligation.

### Use examples as structure discovery

Build:

- smallest valid examples;
- boundary and degenerate cases;
- random instances;
- adversarial instances;
- examples satisfying all but one assumption;
- known theorem neighborhoods.

Use computation to discover patterns and falsify conjectures. Do not infer a universal theorem from
finite evidence.

### Run a counterexample engine

For every conjectured lemma:

1. state exact quantifiers;
2. search smallest finite cases;
3. test boundary parameter values;
4. negate one assumption at a time;
5. attempt constructions from known obstructions;
6. preserve counterexamples and failed conjectures as first-class results.

A failed lemma may reveal the missing invariant or the right repaired statement.

### Search by method family

Generate a bounded portfolio from genuinely different families, such as:

- extremal/minimal-counterexample;
- probabilistic;
- algebraic or spectral;
- topological/geometric;
- combinatorial decomposition;
- duality/compactness;
- induction or discharging;
- computational construction;
- formal deduction;
- reduction to a known theorem neighborhood.

For each family, state:

- target obstruction;
- predicted leverage;
- first discriminating move;
- expected structural gain or loss;
- retirement and re-entry conditions.

Allocate independent agents by method family only when isolation is real. Synthesis compares
obligations and evidence; it does not vote.

### Use probabilistic dual certificates when the structure permits

For posets, packings, flows/cuts, forbidden-intersection systems, and related weighted-counting
problems, search for a paired artifact:

- a primal construction, feasible family, flow, packing, or extremal witness;
- a dual weighting, random experiment, charging scheme, cut, or inequality certificate that
  bounds every admissible object.

Audit the certificate before trusting the bound:

- **coverage** — every required object/configuration is counted or charged;
- **normalization** — weights, probabilities, capacities, and total mass use one consistent scale;
- **boundary** — diagonal, degenerate, endpoint, zero-mass, and finite/infinite cases are included;
- **saturation** — equality conditions and the candidate extremizer actually match;
- **gap** — any fractional/integer, local/global, or relaxed/image constraint is explicit.

Keep the certificate externally checkable. A beautiful randomized argument is not an upper bound
until coverage and normalization close; a matching value is not optimality until saturation and
representation parity close.

### Maintain a proof-obligation DAG

Track:

- claim identifier;
- exact statement;
- dependencies;
- status: untested / supported / proved / refuted / blocked;
- proof or counterexample pointer;
- assumptions consumed;
- reviewer status;
- downstream claims invalidated by failure.

When a premise fails, invalidate descendants. Do not leave polished prose attached to a dead
branch.

### Audit first-move loss

Some approaches lose the target invariant in their first transformation. For every major route:

1. name the target invariant or constant;
2. record the target asymptotic scale, maximum tolerable error, and required uniformity when
   applicable;
3. calculate what the first move preserves and loses, including boundary/floor terms, escaped
   mass, full-sequence versus subsequence status, and any relaxation gap;
4. identify whether the loss is recoverable downstream;
5. retire the representation early if the target is structurally unreachable;
6. search for an invariant-compatible representation.

This is stronger than asking for another proof attempt inside the same lossy frame.

### Separate three mathematical statuses

1. **Deductive correctness** — do the steps follow from the assumptions?
2. **Semantic correspondence** — is this the intended theorem with equivalent definitions and
   assumptions?
3. **Novelty/provenance** — is the result new, known, independently derived, or contaminated?

A proof assistant can strongly support the first under its encoded statement. It does not by
itself establish the second or third.

### Digest the mechanism after success

After deductive correctness and semantic correspondence pass, create a mechanism digest distinct
from literature digestion:

- minimum assumptions actually consumed;
- invariant, extremal principle, or dual certificate doing the work;
- where slack disappears and equality/saturation occurs;
- earlier results recovered as special cases;
- proved generalizations, separated from plausible conjectures;
- failure boundary and smallest counterexamples beyond it;
- shortest accurate human exposition that preserves the key dependency.

Do this after certification so explanatory elegance cannot edit the theorem. Literature digestion
asks how prior work relates; mechanism digestion asks what the successful argument reveals.

### Executable evolutionary search

Use only when candidates are programs, finite constructions, or other cheaply scorable objects and
the evaluator expresses the intended target well.

Freeze:

- statement and constraints;
- external evaluator and held-out cases;
- editable candidate region;
- resource budget;
- novelty and validity checks.

Then:

1. seed diverse candidate-generating programs;
2. execute and score externally;
3. preserve a population or Pareto frontier;
4. mutate programs or representations, not truth claims;
5. rerun held-out and adversarial cases;
6. audit surprising improvements for evaluator exploits;
7. subject the best candidate to semantic and proof review.

The implementing trajectory may not silently modify the evaluator.

### Bounded proof digestion

When using papers or prior proofs:

- extract definitions and theorem dependencies;
- reconstruct one key argument independently;
- map assumptions to the current statement;
- isolate reusable lemmas;
- record gaps, hidden conventions, and unverifiable steps;
- stop loading more literature when no live obligation needs it.

Use stable pointers to full papers; keep the active packet obligation-specific.

### Bare-statement control

For an elaborate mathematical scaffold, compare three arms at matched model, effort, compute,
tools, and source-access policy:

1. **A — bare statement**;
2. **B — statement plus semantic checksum and compact honest contract**;
3. **C — full scaffold with method portfolio, ledgers, reviewers, and domain controls**.

Measure:

- statement fidelity;
- correctness;
- proof completeness;
- correspondence;
- novelty-selection reliability;
- severe false-positive proofs;
- cost and latency.

Report A→B and B→C effects separately. Without all three controls, an impressive result cannot
show whether the gain came from basic task integrity or from the elaborate scaffold.

## Scientific discovery

### Specify the scientific decision

State what the result will decide:

- which hypothesis to advance;
- which experiment to run;
- which mechanism to reject;
- which intervention to optimize;
- whether evidence is sufficient for a claim.

An interesting idea without a decision interface is not a research plan.

### Force ideas through an execution gate

For every attractive proposal, require:

- causal mechanism;
- rival explanation;
- measurable prediction that differs from the rival;
- data/materials/instrument availability;
- protocol and control;
- baseline and strongest alternative;
- sample or power rationale;
- resource/time/safety constraints;
- analysis and decision rule;
- expected failure modes;
- negative-result value.

Reject or repair infeasible ideas before ranking them highly.

### Diversify by research move

Branch by:

- mechanism generation;
- measurement design;
- anomaly/negative-result explanation;
- causal identification;
- model construction;
- experiment design;
- literature contradiction;
- replication.

Do not generate many phrasings of one mechanism.

### Sequence search before experiment

For a broad idea search:

1. generate independent candidates without exposing sibling rankings;
2. run evidence, feasibility, and negative-result review;
3. triage with pairwise comparisons in both presentation orders;
4. evolve only candidates with a concrete repair path while preserving materially distinct
   branches;
5. send frozen survivors to fresh review;
6. execute the smallest experiment that discriminates the primary mechanism from its rival.

Ranking allocates attention; only observation and measurement update scientific belief.

### Make actions and observations typed

```yaml
scientific_step:
  claim_or_decision:
  causal_hypothesis:
  rival_model:
  intervention_or_measurement:
  predicted_observation_if_primary:
  predicted_observation_if_rival:
  actual_observation:
  validity_or_reliability_limits:
  claim_graph_update:
  next_decision:
```

Keep an auditable claim graph linking observations, transformations, assumptions, and conclusions.

### Stage gates

1. semantic question and decision;
2. feasibility and measurement validity;
3. baseline and controls;
4. pilot execution;
5. analysis with rival explanations;
6. replication/robustness;
7. claim and provenance review.

At each gate, permit null, negative, invalid, or inconclusive outcomes. A negative result that
eliminates a mechanism or measurement path is progress.

### Scientific completion evidence

A plausible mechanism is not support. Require:

- raw measurement or stable data pointer;
- reliability and validity evidence;
- control and baseline outcomes;
- rival-model comparison;
- exclusions and deviations;
- replication or explicit lack of replication;
- scope of the supported claim;
- remaining uncertainty.
