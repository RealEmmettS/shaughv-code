# Software and Data Adapter

Load this only for software engineering, data engineering, analytics, databases, pipelines, or
release work. Apply the core contract first.

## Contents

- [Software engineering](#software-engineering)
  - [Route the software mode](#route-the-software-mode)
  - [Reconstruct before editing](#reconstruct-before-editing)
  - [Separate diagnose and implement modes](#separate-diagnose-and-implement-modes)
  - [Software oracle portfolio](#software-oracle-portfolio)
  - [Software anti-loop signals](#software-anti-loop-signals)
- [Data engineering and analytics](#data-engineering-and-analytics)
  - [Route the data mode](#route-the-data-mode)
  - [Define the semantic contract before SQL](#define-the-semantic-contract-before-sql)
  - [Use bounded read-only probes](#use-bounded-read-only-probes)
  - [Validate grain and joins](#validate-grain-and-joins)
  - [Time and metric integrity](#time-and-metric-integrity)
  - [Data completion receipt](#data-completion-receipt)

## Software engineering

### Route the software mode

Choose the mode before prescribing the path:

| Mode | Contract and first discriminating artifact | Completion evidence |
|---|---|---|
| defect or incident | reproduce or define the strongest alternative oracle; localize the earliest invalid transition | original failure replay, targeted regression, and affected-boundary check |
| feature or greenfield | freeze user-visible behavior, interfaces, states, non-goals, and a thin end-to-end slice | executable slice, integration/acceptance checks, and preserved surrounding behavior |
| architecture | state quality attributes, scale, constraints, failure model, and irreversible decisions; compare materially different options | decision record, executable spike or fitness functions, dependency/migration path, and rejected-option evidence |
| behavior-preserving refactor | freeze observable behavior and characterization oracles before structural edits | behavior equivalence, targeted regressions, diff/scope audit, and any performance/resource parity |
| code or platform migration | inventory consumers, versions, schemas, compatibility windows, rollout, and rollback | representative conversion, old/new or dual-run comparison, compatibility checks, rollback proof, and cutover receipt |
| performance or reliability | freeze workload, target environment, SLO/error budget, baseline, and confounders | profile/trace evidence, repeated target-like measurement including tails, failure injection where warranted, and regression guard |
| release or deploy | freeze candidate provenance, environment, rollout gates, rollback, and platform-specific obligations | immutable artifact, staged rollout/smoke result, post-deploy observation, and explicit unqualified physical/signing/licensing gates |

Do not force a feature, architecture decision, migration, or release through the defect-repair loop.
Use the shared contract and receipt, then apply the mode-specific first artifact and oracle.

### Reconstruct before editing

Inspect:

- current worktree and user changes;
- repository instructions and active task state;
- relevant runtime/configuration;
- working sibling or precedent implementations;
- last verified state and existing failures;
- the actual target environment and oracle.

Do not attribute a symptom to a familiar cause before locating the earliest invalid transition.

### Separate diagnose and implement modes

In diagnosis mode:

1. reproduce the defect, or define the strongest alternative oracle when exact reproduction is
   impossible;
2. localize by program semantics and boundary crossings;
3. state competing causal hypotheses;
4. choose the smallest discriminating probe;
5. preserve raw failure evidence.

In implementation mode:

1. freeze the accepted diagnosis and scope;
2. make the smallest coherent change;
3. inspect the diff for accidental scope/evaluator changes;
4. run targeted checks;
5. run proportional regression checks;
6. verify in the target-matching environment;
7. replay the original failing path.

Do not modify tests, fixtures, evaluators, or acceptance criteria merely to make the candidate pass.
An evaluator change is its own explicit task with independent review.

### Software oracle portfolio

Match the claim:

| Claim | Evidence |
|---|---|
| source change exists | diff and exact file inspection |
| compiles/builds | target toolchain build |
| unit behavior | targeted test with meaningful assertions |
| integration | boundary-level execution against representative dependencies |
| UI behavior | target viewport/device interaction and visible state |
| installer/updater | installed-product path, privilege boundary, receipt/logs |
| performance | frozen workload, baseline, confound controls, repeated target-like measurement |
| release | immutable artifact provenance plus platform qualification |

CI proves only what the job actually exercised. A build does not prove physical UI, installed
behavior, signing, provenance, performance, or long-lived runtime behavior.

### Software anti-loop signals

- patch changes while the failing observation remains hidden;
- same test runs against a candidate it cannot see;
- tool/runtime substitution changes the question;
- repeated environment guesses without state inspection;
- adding code after the causal hypothesis was contradicted;
- broad refactor begins before a minimal reproduction or alternative oracle exists.

Stop the route, restore observability, and test a rival cause.

## Data engineering and analytics

### Route the data mode

| Mode | Contract and first discriminating artifact | Completion evidence |
|---|---|---|
| analytical query or report | business question, semantic grain, time basis, metric, and reconciliation source | value/grain/join/time reconciliation plus reviewed output |
| transformation or pipeline | source/target contracts, lineage, schedule, idempotency, dependency and failure semantics | representative execution, data tests, lineage/downstream checks, replay/backfill behavior, and freshness receipt |
| data incident | detection signal, blast radius, first bad partition/event, freshness/volume/schema/quality hypotheses | restored flow, repaired or quarantined partitions, replay result, downstream reconciliation, and monitoring proof |
| schema migration or backfill | old/new schema, mapping, consumer compatibility, cutover window, rollback, and historical scope | dry run or shadow comparison, row/count/value checks, resumability/idempotency, consumer validation, and rollback proof |
| streaming or incremental | event/processing time, keys, ordering, watermark, lateness, deduplication, checkpoint, and replay semantics | duplicate/out-of-order/late-event cases, restart/replay test, state/checkpoint integrity, and batch or trusted-source parity |
| performance or cost | frozen workload/data scale, correctness baseline, latency/throughput target, and budget | query/plan/profile evidence, repeated target-like measurements, correctness parity, resource/cost delta, and regression guard |

An incident restoration is not a permanent semantic fix. A successful backfill is not a safe
cutover. A faster query is not an improvement if grain, values, freshness, or downstream contracts
change.

### Define the semantic contract before SQL

Record:

- business question and decision;
- entity/value semantics;
- expected grain;
- dimensions and measures;
- join keys and cardinality;
- time basis, timezone, event/effective/as-of semantics;
- filters, exclusions, cohort, and denominator;
- freshness and completeness requirements;
- null, duplication, and late-arriving-data policy;
- trusted reconciliation source.

Schema-name similarity is a hypothesis, not proof of meaning.

### Use bounded read-only probes

Before writing a large query or pipeline change:

- sample representative rows;
- inspect uniqueness and null rates;
- measure join multiplication;
- compare date ranges and timezone conversions;
- reconcile counts and totals with a known source;
- inspect repeated schema patterns rather than deleting semantic detail;
- protect credentials and personally identifying fields.

Every probe should answer a stated semantic question.

### Validate grain and joins

For each join, state:

- left and right grain;
- expected relationship: one-to-one, one-to-many, many-to-one, or intentionally many-to-many;
- row-count expectation;
- deduplication rule;
- unmatched-row handling;
- measure behavior after the join.

Check pre/post row counts, distinct business keys, aggregate drift, and representative edge cases.

### Time and metric integrity

For every time-derived result:

- identify source timestamps and timezone;
- distinguish event time, ingestion time, effective time, and query/run time;
- define inclusive/exclusive boundaries;
- handle daylight saving and incomplete current periods;
- state snapshot or slowly changing dimension semantics.

For every metric:

- formula, units, and denominator;
- aggregation window;
- attribution and exclusion rules;
- material caveats;
- comparison baseline.

A successful SQL execution is not semantic correctness.

### Data completion receipt

Require:

```yaml
data_receipt:
  business_question:
  output_grain:
  source_tables_and_freshness:
  join_cardinality_checks:
  time_semantics:
  metric_definition:
  reconciliation_result:
  anomaly_or_exclusion_log:
  artifact_or_query_pointer:
  status: PASS | FAIL | NOT_RUN | INDETERMINATE
```

For migrations, dbt models, or pipelines, add target-environment execution, lineage, idempotency,
backfill/replay behavior, and downstream compatibility checks.

For incidents, add blast radius, first-bad/last-good boundaries, quarantined data, replay status,
post-recovery reconciliation, and the monitor that would detect recurrence. For streaming or
incremental work, add watermark/lateness, deduplication, checkpoint/restart, and batch-parity
receipts. For performance/cost work, report correctness parity before resource savings.
