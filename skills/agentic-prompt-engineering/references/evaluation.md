# Prompt and Skill Evaluation

Prompt optimization is an empirical evaluation problem. A prompt is a policy for a model, task
distribution, tool harness, evidence distribution, and evaluator. A phrase that wins one benchmark
is not a universal law.

## Contents

- [Establish the harness first](#establish-the-harness-first)
- [Required baselines](#required-baselines)
- [Representative case matrix](#representative-case-matrix)
- [Grade outcomes and trajectories separately](#grade-outcomes-and-trajectories-separately)
- [Reliability](#reliability)
- [Classify failures by layer](#classify-failures-by-layer)
- [Evaluator integrity](#evaluator-integrity)
- [Optimization protocol](#optimization-protocol)
- [Evaluation receipt](#evaluation-receipt)

## Establish the harness first

Freeze:

- task identifiers, task/specification versions, target distribution, and important subgroups;
- starting repository, data, environment, and state for every case;
- model/version/date and effort settings;
- tools, permissions, context policy, and budget;
- task contracts and acceptance oracles;
- train/development/held-out partitions;
- contamination and source-access policy, including what the candidate or prompt author may see;
- whether tests, fixtures, evaluators, labels, and acceptance criteria may change; default to no;
- severe-failure definitions;
- latency and cost measurement;
- evaluator code, held-out labels, and integrity controls.

The prompt author may not inspect or silently edit held-out acceptance data.

## Required baselines

Compare:

1. current prompt or Skill;
2. capable model with only a compact task contract;
3. candidate prompt or Skill;
4. candidate minus each load-bearing rule;
5. relevant model overlays at more than one effort level.

If the compact contract performs as well, the larger Skill has not earned its complexity.

## Representative case matrix

Include:

- routine direct task where heavy process should remain dormant;
- ambiguous task where one clarification or explicit assumption is needed;
- cheap false load-bearing premise;
- early wrong choice with delayed contradictory evidence;
- persuasive false-success trajectory;
- semantically repeated strategy with different wording;
- productive iterative recurrence with real state deltas;
- unavailable oracle or external blocker;
- prompt-injected repository/tool content;
- fresh-context handoff with one unresolved error;
- software hidden regression;
- data grain/join/time/metric trap;
- mathematical known proof, false statement, open statement, quantifier trap, malformed statement,
  semantic-mismatch proof, and gameable evaluator;
- scientific attractive-but-infeasible idea, rival causal model, and negative result.

## Grade outcomes and trajectories separately

Outcome metrics:

- mandatory acceptance success;
- severe regression or destructive action;
- unsupported completion/false success;
- truthful partial/blocked/refuted/unknown handling;
- semantic correctness;
- oracle coverage.

Trajectory metrics:

- time/cost to first discriminating observation;
- load-bearing-premise detection;
- duplicate attempt signatures;
- response, route, and task stops;
- user corrections;
- unnecessary questions;
- duplicated verification passes;
- coordination overhead;
- context growth and unresolved-error preservation.
- unauthorized scope expansion;
- inaccurate progress or completion claims;
- unnecessary edits and resulting review burden;
- whether feedback changed the causal model or merely triggered another cosmetic attempt.

## Reliability

`pass@1` is not repeat-run reliability. Run equivalent:

- lexical variants;
- instruction-order variants;
- seeds/sampling variants where supported;
- representative environment variants;
- target-model and effort variants.

Report empirical success distributions and severe failures. Do not infer `pass^k` from one passing
run or hide a rare catastrophic miss behind an average.

Predeclare repetitions per case and variant. Report the distribution of terminal states, false
successes, severe failures, cost, and latency—not only the mean score or best run.

## Classify failures by layer

Before editing the prompt, locate the failure:

| Layer | Examples | Appropriate change |
|---|---|---|
| capability | model cannot perform the deduction, perception, or planning even with a sound contract | model, decomposition, or bounded human/expert escalation |
| prompt or contract | wrong objective, missing constraint, ambiguous authority, weak stop rule | surgical prompt/contract edit |
| scaffold or tool interface | missing data, bad tool description/schema, inaccessible oracle, broken handoff | repair the harness, tool, retrieval, or state interface |
| delivery or runtime | environment mismatch, timeout, permissions, deployment, serialization | repair and validate the actual runtime path |
| evaluator | proxy mismatch, leakage, gameable test, noisy or invalid judge | repair/freeze the evaluator independently before optimization |

Do not make prose absorb a capability, runtime, tool-interface, or evaluator defect.

## Evaluator integrity

Audit:

- whether the metric expresses the real outcome;
- whether the implementing trajectory can change tests, labels, fixtures, cohorts, or exclusions;
- leakage from held-out cases;
- proxy gaming and shortcut solutions;
- judge bias and order effects;
- disagreement between executable, formal, semantic, expert, and model-based oracles.

An LLM judge should not be the sole oracle for the prompt's own style or truth. Candidate comparison
is not certification.

## Optimization protocol

1. Measure headroom with the compact baseline.
2. Classify recurring failure modes.
3. Propose a small portfolio of control changes, each tied to one failure.
4. Evaluate candidates on development cases.
5. Keep a Pareto frontier across quality, severe failure, cost, and latency.
6. Run rule ablations.
7. Freeze the candidate.
8. Evaluate once on held-out cases.
9. Inspect every severe failure and false success manually.
10. Version the Skill and record migration behavior only if the gain exceeds evaluator uncertainty
    without unacceptable regressions.

Do not search indefinitely when:

- baseline headroom is absent;
- evaluator noise exceeds candidate differences;
- failures require capability, permissions, data, retrieval, or a better oracle rather than prose;
- the search is overfitting exposed cases.

Change the model, tools, contract, data, evaluator, or task formulation instead.

## Evaluation receipt

```yaml
skill_evaluation:
  task_id:
  task_and_spec_version:
  starting_repo_data_environment_state:
  hidden_or_held_out:
  contamination_and_source_access_policy:
  allowed_evaluator_or_test_changes:
  model_version_and_date:
  effort:
  core_version:
  domain_adapter:
  model_overlay:
  prompt_hash:
  tools_and_permissions:
  acceptance_oracles:
  terminal_state:
  false_success:
  loop_class:
  repeated_attempt_signatures:
  user_corrections:
  failure_layer:
  unauthorized_scope_expansion:
  inaccurate_progress_claims:
  unnecessary_edits_or_review_burden:
  feedback_changed_causal_model:
  repeat_run_terminal_distribution:
  severe_failure:
  cost:
  latency:
  evidence_paths:
```

Record limitations plainly. “Improved on this suite” is the supported claim; “best prompt” or
“works across models” requires much stronger evidence.
