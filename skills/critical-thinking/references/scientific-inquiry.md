# Scientific Inquiry framework (6 steps)

For empirical questions — *"why is X happening?"*, *"is it true that…?"*, *"what's
actually going on in this system / data / process?"* — where the answer should come from
evidence gathered and hypotheses tested, not from opinions weighed. The cycle:
**Observe/Question → Research → Hypothesize → Experiment → Analyze → Report.**

**Boundaries.** A code defect in your codebase → hand off to `debugging-framework`
(it owns hypothesis-driven debugging end to end; this framework is for everything that
isn't a code bug). A purely external, multi-source web research report → the
`deep-research` skill can serve as this framework's Step 2 or replace it entirely.
End-user tool reports → `bug-triage` intake first.

Run it like every other framework here: ask the sub-questions, batch 2–4 per message,
canvas every turn, confidence bands on every finding.

## Step 1 — Observe / Question

Turn a vague unease into one falsifiable question.

- *"What exactly did you observe? Quote the number, the message, the behavior — verbatim."*
- *"When and where, and how was it measured? Would a second observer see the same thing?"*
- *"Surprising relative to what expectation? What did you expect instead, and why?"*
- *"Phrase the question so an observation could prove it wrong."* ("Is it true that the
  records endpoint ignores `updated_at` filters?" — falsifiable. "Is our sync bad?" — not.)

If no observation could settle it, it isn't an inquiry — reframe, or route to
Decision-Making (it's probably a values/priorities question wearing a lab coat).

## Step 2 — Research

The foraging loop, explicitly dual-source. Timebox it — a timeboxed spike beats a plan to
investigate (see `iterative-plan`).

- **Internal:** the repo and its history; internal databases / the data warehouse; team
  docs and wikis; your issue/task tracker history; the actual config/code in question.
- **External:** vendor docs, the web (WebSearch/fetch), standards, changelogs.

Sub-questions: *"What single source, if it exists, would settle this outright?"* · *"What
does the system of record say, as opposed to what people remember?"* · *"What's the date
on this evidence — could it be stale?"*

Every finding lands on the canvas with **source, date, and a confidence band** (the 1A
source-pass and Analytic Confidence disciplines apply in full). Backtracking is normal.

## Step 3 — Hypothesize

Minimum **two** competing hypotheses — always include the boring one (misread data, stale
cache, config drift, coincidence). For each:

- *"What does this hypothesis predict we'd see?"*
- *"What observation would falsify it?"* (No falsifier → it's not a hypothesis, it's a belief.)
- *"What's its prior — how often is this the answer in our world?"*

Lay them into the Hypothesis Testing matrix (`visual-models/causality.md`) — hypotheses
as columns, evidence as rows. Do not fall in love with H1; the matrix exists to protect
you from your favorite.

## Step 4 — Experiment

Design the cheapest decisive test, and write down the predictions **before** running it.

- *"What's the smallest test that tells H1 and H2 apart?"* (Diagnostic beats thorough.)
- *"Is it safe — non-destructive, reversible, within budget/rate limits? If not, what's
  the read-only version?"*
- *"What will we see if H1 is true? If H2 is true? If neither?"* — committed in advance,
  on the canvas, so the result can't be rationalized after the fact.
- *"What's the timebox?"* An experiment that needs a project plan is a milestone, not a
  test — route it to `iterative-plan`.
- *"What changed from the last experiment?"* Record the relevant starting state,
  intervention, observation, and information gained. If none changed materially, stop
  and use `loop-escape` rather than relabeling a retry as a new experiment.

An intentional repeat is valid replication only when it estimates noise or
reproducibility, the trials are meaningfully independent, predictions are written first,
the repeat count is bounded, and the stop rule is explicit. Re-running the same operation
against the same state because the first result was inconvenient is blind retrying, not
replication.

## Step 5 — Analyze

- Fill the matrix: each piece of evidence scored against each hypothesis — consistent,
  inconsistent, or diagnostic (distinguishes between them).
- The standard is Popperian: the winner is the hypothesis with the **least inconsistent
  evidence**, not the most confirming. Evidence consistent with everything is decoration.
- Do not count correlated or duplicate trials as independent support. One observation
  repeated through the same state and mechanism is still one evidential source.
- *"What confidence band does the surviving hypothesis earn — and what single observation
  would change the conclusion?"*

## Step 6 — Report

Close on the canvas, in the skill's standard closing shape:

- **Conclusion** — the surviving hypothesis, stated plainly, with its confidence band.
- **Falsifiers still open** — what hasn't been ruled out and what it would take.
- **Next experiment** — if confidence is too low to act, the next cheapest decisive test.
- **Exit state** — Decided / Directed / Blocked-on-named-information, like every session.

## Worked micro-example

Observation: the sync job fetches ~14,000 rows per hourly run; ~3 rows actually
change. Question: *"Why does the sync re-pull the full window instead of only
changed records?"* Hypotheses: H1 — the endpoint doesn't support `updated_at` filtering
(full pull unavoidable); H2 — it supports it and our query just doesn't use it; H3 — a
date-window bug fetches all history instead of a recent window. Research: the vendor's API
docs (external) + our sync worker's query construction (internal). Experiment: one
filtered call against the endpoint after the rate-limit window resets — predicted results
written down per hypothesis first. Analyze: filtered call returns correctly scoped rows →
H1 falsified, H2/H3 live; code shows no `updated_at` param → H2 confirmed as proximate
cause. Report: medium-high confidence; fix is an incremental watermark poll; H3 checked
separately against the window math. Exit: Directed — file the fix task.
