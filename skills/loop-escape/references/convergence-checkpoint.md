# Convergence Checkpoint

Use this canvas when a task is stuck, repetitive, or too broad to validate. Keep it inline
for a short recovery; save it beside the project's planning/evidence artifacts when the
session is long-running or must survive handoff.

## The information-gain rule

Every execution cycle must end with at least one of:

- a criterion passed
- an actionable failure observation
- a narrower hypothesis
- a verified environmental/runtime fact
- a deliberate operator decision about an owned gate

A staged-but-unseen candidate, a silent failure, or another identical observation does
not create information.

## Attempt signature

Compare attempts on the dimensions that can affect the deciding observation:

| Field | Attempt A | Attempt B | Material delta? |
|---|---|---|---|
| Candidate / revision seen by the oracle | | | |
| Relevant starting state and inputs | | | |
| Runtime, permissions, and environment | | | |
| Tool / intervention / command | | | |
| Observers or competing processes | | | |
| Prediction stated before the attempt | | | |
| Raw observation / payload | | | |
| Information gained | | | |

Classify the pair:

- **New evidence:** a material delta produced an observation that distinguishes live
  hypotheses or settles a criterion.
- **Valid replication:** the repeat is intentionally independent or estimates noise;
  prediction, sample count, and stop rule were declared before repeating.
- **Duplicate cycle:** no material delta and no new information.

## Recovery canvas

```markdown
# Convergence checkpoint — <topic>

**Date:** YYYY-MM-DD
**Elapsed / cycle count:** <known value or unknown>

## Objective
<The unchanged end goal.>

## Success bars
- **Basic functional bar:** <smallest end-to-end proof that it works>
- **Required qualification:** <proof required before the real release/close>
- **Optional evidence:** <expensive or nonessential proof, owner, disposition>

## Last known-good state
- Candidate/revision:
- Verified behavior:
- Oracle/runtime that verified it:
- Evidence:

## Attempt ledger
| # | Starting state | Intervention | Observation | Information gained | Verdict |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |

## Failure of observability
- Can the deciding oracle see the current candidate?
- Does failure preserve the raw payload/output?
- Is this the actual target runtime and privilege boundary?
- Are observers or competing processes contaminating the result?

## Recovery lens
- **Primary lens:** strategy | scope | evidence | defect
- **Action applied here:**
- **Optional deeper skill:** critical-thinking | iterative-plan | logical-reasoning | debugging-framework | none
- **Why deeper guidance is or is not needed:**

## Smallest working rung
<The next thin end-to-end slice. Preserve the final goal.>

## Next discriminating action
- Action:
- H1 predicts:
- H2 predicts:
- Safety/reversibility:
- Stop or redirect when:

## Gate ownership
| Gate | Essential to basic function? | Owner | Cost | Decision / dated waiver / backlog |
|---|---|---|---|---|
| | | | | |
```

## Re-entry check

Resume execution only when:

- the next attempt differs materially or is declared valid replication
- the deciding system can observe the candidate and preserve a useful result
- the smallest working rung has a binary/demoable gate
- any expensive nonessential gate has an owner and explicit disposition
