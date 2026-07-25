---
name: debugging-framework
description: >
  Use when actively debugging a bug — an integration that drifted, a write that didn't land, a
  queued message that vanished, a 5xx with no logs, a datetime that's an hour off, an idempotency
  replay double-write, a config that silently dropped a field, a value that's NULL where data was
  expected. Triggers on phrases like "debug this", "why is X NULL / wrong / missing", "the data
  doesn't match", "this returns 500", "works locally but not in prod", "the sync is failing
  silently", "I've tried three fixes and...", "the test passes locally but fails in CI". Use this
  skill for the root-cause debug loop once something has already failed; for end-user-facing bug
  intake use bug-triage; for pre-emptive error-handling design use defensive-programming.
---

# debugging-framework

## Overview

Debugging means **establish the failure through a reproduction or strongest alternative oracle,
narrow down where it lives, identify the earliest causal boundary, make the smallest coherent
repair, verify it, then discover siblings**. Root-cause/source-layer repair is the default.
Explicit incident containment and consumer-boundary protection are legitimate when the source is
external, unowned, inaccessible, or too risky to change; label containment honestly and preserve
the causal investigation. Debugging does not mean trying edits until the symptom disappears.

This skill is a calibrated debug loop. It is the runtime mirror of the `defensive-programming` skill: same stance, applied when something has already failed instead of before. Defensive design surfaces the failure loudly; this skill finds the root cause.

The universal scientific method here is `superpowers:systematic-debugging` — its **iron law** (`NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST`) is carried forward by reference, not restated. What this skill adds is a concrete **vocabulary of recurring bug shapes** — how data-pipeline mappings silently drop a field, how a value loses its type as it crosses a layer boundary, how third-party API responses change shape without warning, how an at-least-once queue double-writes, where to put structured logging, and how to instrument each boundary of a multi-component system — so you pattern-match to a known shape instead of locating from scratch every time.

> **A note on vocabulary.** Throughout this skill, **Operator** refers to the person driving the debug session (you or a teammate) and **Agent** refers to an AI coding teammate (Claude Code, GitHub Copilot, Cursor, Aider, ChatGPT). The debug protocol applies to either, run solo or as a pair; the Agent-collaboration discipline for the common Operator-paired-with-Agent configuration is in `references/agent-assisted-debugging.md`.

## When this skill applies

Invoke this skill at any of these moments:

- Reproducing a defect — local repro, CI-only failure, production-only failure, "intermittent on Tuesdays" failure.
- Investigating an unexpected value — `NULL` where data was expected, wrong type, wrong tenant, stale row.
- Investigating a missing side-effect — `200` returned but the row was not committed; `send()` returned but no consumer ever saw the message; webhook fired but the downstream record didn't appear.
- Investigating a wrong side-effect — count off by N, duplicate rows, a write that landed twice, a write that landed under the wrong identifier.
- A 5xx, a 4xx with a misleading message, an API that returned the wrong shape, a serverless function that returns `Internal Server Error` with no logs.
- Tests pass locally but fail in CI (or vice versa).
- A fix didn't stick — the same bug came back, OR a new bug showed up in the area you "fixed".
- Another Operator or Agent hands off a debug session midway.

Skip this skill for: end-user-facing bug intake (use `bug-triage`); pre-emptive error-handling design (use `defensive-programming`); pure performance tuning with no incorrect behavior (different discipline — profile-first).

## The two modes

| | **Mode 1 — Lightweight triage** | **Mode 2 — Formal protocol** |
|---|---|---|
| Scope | Trivial, isolated, contained | Anything user-visible in prod, anything in a write path, anything systemic |
| Time budget | ≤ 5 minutes | Explicit investigation/action budget with route-stop conditions |
| Reproducibility required | One observation or strong signature | Stable repro preferred; strongest alternative oracle when exact repro is impossible |
| Test before fix | Sanity check is fine | Failing automated test when feasible; otherwise preserved regression oracle |
| Look for similar defects | Skip | **Required** |
| Postmortem note | Skip unless instructive | **Required if the bug was non-trivial** |

**Hard rule:** Escalate from Mode 1 → Mode 2 the moment ANY of these is true. Do not "just try one more thing".

- The change touches a write path (DB write, queue publish, third-party POST, external state mutation).
- The bug is user-visible in production.
- Causally equivalent Mode 1 attempts stopped changing the evidence.
- You don't fully understand why the fix would work.
- The bug crosses a process / service / network boundary.
- The bug involves money, PII, or system-of-record data (financial rollups, billing math, anything other systems treat as the source of truth).

See `references/lightweight-triage.md` for the Mode 1 loop in detail. See `references/scientific-method.md` for the McConnell §23 source material that grounds Mode 2.

## Bug classification — know the shape before you start

Before choosing a mode, classify the bug. Different shapes have different debugging tactics AND different Agent diagnostic ROI — knowing which class you're in lets you skip false starts. State the classification out loud (in your notes or to the Agent in your session) — if it's wrong, the response shape will signal the misclassification.

| Class | Symptom | Agent diagnostic value | Tactic |
|---|---|---|---|
| **Clear error + stack trace** | Exception, file, line, error code, traceback | **High** | The Agent usually identifies cause from signature; paste FULL trace + relevant file + recent diff. |
| **Logic bug in a single function/module** | Wrong output for known input; no error | **Good** | Socratic — Operator states intent; Agent walks actual behavior; divergence is the bug. |
| **Behavioral bug with no error** | "It just doesn't work as expected"; UI / async / state | **Moderate** | Don't ask for a fix yet — instrument first. Targeted log statements / test cases that surface the divergence. |
| **Multi-system / distributed** | Failure crosses process / service / network boundary | **Lower** | The Agent helps map components, generate hypotheses, write instrumentation — but can only see what you show it. |
| **Intermittent / race condition** | Works 9 of 10 times | **Lowest** for direct fixes | Stabilize or define a statistical/observability oracle first. Contain risk if authorized; do not claim a causal fix without evidence. |
| **Performance** | Correct output, too slow / too much memory / too many queries | **Moderate** | Profile FIRST. Bring profiler output to the Agent. Without the profile, Agent suggestions are guesses about what's slow — almost always wrong. |

The full Agent-collaboration discipline is in `references/agent-assisted-debugging.md`.

## Mode 1 — Lightweight triage (the 5-minute loop)

1. **Read the error literally.** Stack trace top to bottom, file path, line number, error code. Do not skim — the error often names the fix in its own text.
2. **Observe it once or preserve the strongest signature.** Prefer direct reproduction; when that
   is impossible, use authoritative logs, state inspection, a trace, a crash dump, or a bounded
   alternative oracle. Do not invent a failure you have not observed.
3. **Check the last commit.** `git log -1 --stat` and `git diff HEAD~1`. If the bug appeared after a recent change, the change is the suspect until proven otherwise.
4. **Fix the obvious thing.** Typo, off-by-one, missing await, wrong env var name. Make the smallest possible change.
5. **Verify the fix.** Re-run the failing path; confirm the original error is gone AND no new error appeared.

If any of the **escalate** conditions above are true, OR if any of the five steps gets ambiguous, STOP — switch to Mode 2. Do not bargain with yourself.

## Mode 2 — Formal protocol (seven beats)

You MUST complete each beat before moving to the next. Skipping a beat to "save time" is how Mode 2 turns into thrashing.

### 1. Stabilize (make it reproducible)

Prefer a stable reproduction: simplify inputs and environment until changing one variable changes
the behavior (Code Complete §23, page-579). Set a finite stabilization budget. If exact
reproduction remains unavailable, define the strongest alternative oracle—authoritative logs,
state/query evidence, trace correlation, statistical failure rate, or a target-environment
observation—then instrument the uncertain boundary. You may apply bounded, explicitly labeled
containment when incident risk warrants it, but do not claim causal repair from a guess.

"Stabilize" usually means one of:

- **A failing test case** (preferred — automatable, regression-proof). Use `superpowers:test-driven-development` to write it.
- **A repeatable query against your data source** with the inputs that surface the bad row.
- **A repeatable third-party API call** with the same auth + payload.
- **A repeatable queued message** (re-enqueue from the dead-letter queue or replay it).
- **A repeatable browser interaction** (record the URL state + the click sequence; for filter/view-state bugs the URL state usually carries the trigger).

### 2. Locate (narrow the scope)

Binary-search through code, data, or time until the suspicious region is small (Code Complete §23, page-583).

- **Code binary search** — comment out half; re-test; comment out half of the half. Or `git bisect` for "it used to work" bugs.
- **Data binary search** — does the bug fire for *every* row, or only some? Partition the input set; isolate the predicate that picks bad rows.
- **Time binary search** — when did it start? Cross-reference with deploys, schema migrations, third-party version bumps, feature flag flips, cron-job edits.
- **Layer binary search** — for multi-component bugs (CI → build → ship; API → service → DB; UI → URL → API bind → SQL), instrument each boundary and find which one diverges. See `superpowers:systematic-debugging` Phase 1 step 4 for the per-layer-echo pattern.

For deep stacks, **trace data flow backward to source**: where does the bad value originate? What called this with the bad value? Keep tracing up until you find the source. Fix at the source, not at the symptom. See `superpowers:systematic-debugging/root-cause-tracing.md` for the full backward-tracing technique.

### 3. Hypothesize (state it before you test it)

Write down one specific hypothesis with evidence:

> "I think X is the root cause because Y." (Code Complete §23, page-577)

Be specific, not vague. *"Maybe it's a race condition"* is not a hypothesis; *"I think `sync_topics` and `sync_details` are racing on `meetings.id`, because the duplicates correlate with overlapping scheduled runs at 02:05"* is.

Do not skip this beat. A hypothesis you have not stated is a hypothesis you cannot disprove.

### 4. Verify (smallest possible experiment)

Design ONE experiment that confirms or denies the hypothesis. **One variable at a time** (Code Complete §23, page-587). The cheaper the experiment, the better — a `print()` and a re-run usually beats a code change.

- Did the experiment **support** the hypothesis? → beat 5.
- Did the experiment **contradict** the hypothesis? → form a new hypothesis with the expanded evidence; loop back to beat 3.
- Did the experiment **partially** support it? → your hypothesis is too vague; sharpen it and loop.

Use *negative* results — the bug NOT being in the area you thought it was is real information (Code Complete §23, page-583). Keep a list of hypotheses tried and ruled out so you don't loop.

### 5. Fix (the problem, not the symptom)

Fix at the earliest owned layer responsible for the broken invariant when practical (Code Complete
§23, page-589). If the source is external, unowned, inaccessible, or a source change would widen
risk, a consumer-boundary guard can be the correct coherent repair. Record whether the result is a
root-cause repair, containment, or compatibility boundary.

- Fix at the **smallest** correct layer — the layer responsible for the invariant being broken, not the layer where the broken invariant happened to surface.
- **One causal story at a time.** No "while I'm here" cleanup or unrelated refactor. The smallest
  coherent repair may span several files or layers when the invariant genuinely crosses them.
- If the fix requires changes in several places, verify that every edit serves the same causal
  story; otherwise split it or reconsider the abstraction.

### 6. Regression-test (lock the fix in)

Before declaring the fix done:

- **A failing test or preserved alternative oracle exists** for the original defect. When a test is
  feasible, run it red without the fix and green with it.
- **Affected regression checks pass**, plus the broader suite or target oracle required by the
  claim and risk. Do not run an unrelated exhaustive suite merely as ritual; do not omit a
  required release or target-environment gate.
- **The fix actually landed** in the environment where the bug fired. A green local test does not prove a green prod; cross-ref `superpowers:verification-before-completion`. For data-pipeline fixes, this means re-running the pipeline and confirming the bad row is now correct.
- **The evaluator stayed trustworthy.** Inspect changes to tests, fixtures, exclusions, or
  acceptance criteria. Do not weaken them to make the fix pass.

### 7. Look for similar defects (the McConnell sweep)

*"Defects tend to occur in groups. Look for others that are similar."* (Code Complete §23, page-591)

The **discovery sweep** is non-optional in formal mode. Report sibling findings and their evidence.
Fix them in the same change only when they are in scope, authorized, and part of the same causal
repair; otherwise create a separate owned follow-up. Discovery is not blanket authorization.

For each fix, ask:

- **Same root cause elsewhere?** `grep` the codebase for the same pattern (same anti-pattern, same broken invariant, same missing check).
- **Sister entities?** A bug in one data entity usually has siblings in adjacent entities. A mapping/projection bug usually has siblings across the other mappings that share the pattern.
- **Sister integrations?** A field-shape bug in one third-party API usually has siblings in the same endpoint's other fields, AND in the analogous endpoint of another integration.
- **Sister consumers?** If the symptom was at a consuming layer (a dashboard column, a report section, an API result), there are usually 2–4 other consumers of the same source layer with the same blind spot.
- **Sister envs?** A bug in prod usually exists in staging too. A bug for one tenant usually exists for another. A bug in one region/partition usually exists in another.

Record the sweep in the PR description (or wherever the fix is tracked) so the next person knows what was checked.

### Completion receipt

Before claiming the defect is fixed, record:

```yaml
debug_receipt:
  original_failure_oracle:
  original_raw_failure_or_pointer:
  causal_hypothesis:
  repair_scope: root_cause | containment | compatibility_boundary
  target_check:
  regression_checks:
  evaluator_integrity_check:
  target_environment_result:
  remaining_limitation:
  status: PASS | FAIL | NOT_RUN | INDETERMINATE
```

The final claim is no stronger than the weakest mandatory row.

## Bug shapes — the vocabulary

This is the durable, reusable core of this skill. When debugging, ask which of these shapes the bug looks like — pattern-matching to a known shape collapses the locate beat from hours to minutes.

| Shape | Symptom | Where it tends to live | The diagnostic question |
|---|---|---|---|
| **Silent data-pipeline gap** | Field is `NULL` or missing in a downstream column; upstream source has the data. | ETL projection lists, view/refresh SQL, data-pipeline field mappings, API entity field lists. | "Does the field exist at every layer between source and consumer, and is it mapped at each hop?" |
| **Silent type-coercion gap** | 4xx/5xx with a misleading message, or correct response shape but wrong value, when a value crosses a layer boundary. | UI filter → URL → API bind → SQL compare; JSON → typed model; queue message body → handler payload; string-vs-int field at a third-party boundary. | "At which boundary did the type silently change, and which boundary lost the type discriminator?" |
| **Config ↔ schema drift** | A tool/query returns wrong columns / missing columns; a config surface diverged from the data layer it describes. | An entity/query config vs the underlying view or table it reads from; two config surfaces edited independently. | "Are the config's declared columns and the data layer's actual columns byte-equal? When was each last edited?" |
| **Third-party response shape drift** | Field renamed, added, or removed at the vendor side; response still parses; value is wrong or absent. | SDK responses, REST/OData responses, webhook payloads. | "When did the vendor last ship? Compare a response captured today to one captured before the symptom started." |
| **Idempotency replay** | Counts off by N, duplicate rows, write that landed twice. | At-least-once queue handlers, webhook handlers, serverless triggers with retry policies. | "Is there an idempotency key on the write? Are duplicate inputs collapsed at insert, or relied on at read?" |
| **Timezone naivety** | Row appears in two days' rollups, or skipped on DST day; "yesterday" off by one. | `datetime.now()` without `tz=UTC`; `DATETIME` columns without offset; scheduled job in local time. | "Is the timestamp tz-aware UTC end-to-end? Where does a naive datetime enter the pipeline?" |
| **Read-after-write inconsistency** | Just-written row absent from a follow-up read; eventual consistency window. | Cross-region database reads, read-replica reads, CDN/cache reads after origin write. | "Did the write and the read hit the same replica? Is there a read-your-writes guarantee on this path?" |
| **Optional-chaining-as-skip** | Downstream code treats "we don't know" as "no value"; UI shows blank instead of error. | TypeScript / JavaScript `entity?.contact?.email`; Python `getattr(entity, "contact", None)`; null-conditional `?.` chains. | "Does an absent value here mean 'absence' or 'we failed to load this'? Are they distinguishable downstream?" |
| **Dead feature flag** | Code path silently never executes; bug is "it never worked" not "it broke". | Old kill-switches that defaulted off; per-tenant flags that flipped off for everyone; `if (DEBUG)` blocks shipped to prod. | "Was this path ever actually exercised in prod? When was the flag last evaluated true?" |
| **Schema drift between layers** | DB column exists but model doesn't see it; or model has field but DB column was dropped. | Typed model / DTO definitions vs the actual DB schema; ORM migrations not run on one env. | "Run a fresh introspection of the live schema vs the model. Diff." |
| **Lock-conflict masquerading as bug** | Intermittent failure; works on retry. | Database lock contention, rate-limit (429) responses, file-system locks. | "Is the retry path swallowing the lock conflict as success? Or is it a real bug masquerading as transient?" |
| **CI ≠ local env** | Test passes locally, fails in CI (or vice versa). | Test-runner working dir, env var availability, time-of-day dependence, file-system case sensitivity, locale. | "What is in this env that is NOT in the other? Diff `env`, OS, runner image, CWD, locale." |

Each shape has a longer treatment in `references/bug-shapes.md` with a real or composite example.

## Instrumentation strategies

Where to add diagnostic signal:

- **Structured logging envelope.** Standard fields: `operation`, `entity_type`, `entity_id`, `correlation_id`, `attempt`, `duration_ms`, `error_type`. See `defensive-programming` § Structured logging — do not duplicate, use the same envelope.
- **Per-layer boundary echo.** For multi-component debugging, log what data *enters* and *exits* each component (the `superpowers:systematic-debugging` Phase 1 step 4 pattern): log at HTTP handler entry, queue handler entry, serverless trigger entry, before-and-after each third-party call, before-and-after each DB write.
- **Observability query patterns.** Your observability tool correlates a request across components. A query like `traces | where entity_id == "..." | order by timestamp asc` shows the per-request log envelope across every component that handled it.
- **A durable diagnostic log.** Append to your notes (or the PR / issue tracking the fix) at each meaningful step: hypothesis stated, experiment run, result. This is how the next teammate picks up a debug session mid-flight without re-running the locate beat.
- **Add the logs *first*, fix *second*.** When stabilization fails — the bug is intermittent or environment-specific — invest in the instrumentation pass before the fix attempt. A fix-by-guess on an unstable bug is worse than waiting one more occurrence with logs in place.

## Heuristics

- **Binary search through code, data, and time** (Code Complete §23, page-583). The single highest-leverage debugging technique.
- **Rubber duck** (Code Complete §23, page-597). Explain the bug to another Operator, to the Agent in your session, to the duck on your desk, or out loud to yourself. The act of articulating the problem often surfaces the answer.
- **Take a break** (Code Complete §23, page-597). After ~30 minutes of stuck-thrashing, tension is impairing judgement. Stand up. Tomorrow you will see it in five minutes. Many veteran engineers report their best debugging happens on the walk to coffee.
- **Time-box quick-and-dirty attempts** (Code Complete §23, page-597). Set a maximum (10–15 min). If you blow through it, switch to formal Mode 2.
- **Keep a notepad of hypotheses tried** (Code Complete §23, page-583). Writing them down prevents looping back to ones already ruled out, AND records the audit trail.
- **Generate fresh test cases** (Code Complete §23, page-583). When stuck, design inputs that you have not tried. New data → new hypotheses.
- **Use compiler / typechecker / linter warnings as first-line defence** (Code Complete §23, page-594). Read every warning. The compiler usually knows.
- **The debugger is a thinking aid, not a substitute** (Code Complete §23, page-596). Stepping through code without a hypothesis is just slow reading.

## Working with the Agent

An Operator is often debugging alongside an Agent — Claude Code is the default, also GitHub Copilot, Cursor, Aider, ChatGPT. (An Agent may also debug autonomously without an Operator at the keyboard; see § "When the Agent is debugging autonomously" in `references/agent-assisted-debugging.md` for the review-gate adjustment.) Five principles govern the Agent-Operator collaboration. They do NOT replace Mode 2 — they are the Agent discipline layered on top.

1. **The Agent accelerates investigation; authority and evidence decide the action.** It may apply
   authorized, reversible, in-scope fixes. Ask at irreversible/external actions, material scope
   changes, missing authority, or owner-only decisions.
2. **"Fix this" is the fastest way to hallucinate.** Context determines quality. Paste the FULL stack trace, the failing output, the recent diff — never a vague description. A short prompt invites a plausible-looking fix to a plausible-looking bug, neither of which is real.
3. **Symptom fixes are not root-cause fixes.** The Agent is biased toward "make the error go away" because that is the visible success signal. The Operator is responsible for pushing past that to *why*.
4. **Equivalent, non-informative Agent fix proposals = pivot to instrumentation.** When proposals share the same causal story and stop changing the evidence, freeze that route and gather discriminating evidence — targeted logs, debugger breakpoints, minimal repro, git diff. A predeclared independent replication may still be informative; another paraphrase of the same guess is not.
5. **Every fix must be explainable in one sentence.** If you cannot articulate WHY the fix works without copying the Agent's reasoning verbatim, you do not understand it yet. Keep asking until you do. The explainability test is what separates a fix from a workaround.

Full mechanics, beat-by-beat Agent-Operator motion, the autonomous-Agent review-gate rule, and the canonical worked Agent-assisted debugging example are in `references/agent-assisted-debugging.md`.

## Anti-patterns — what guarantees thrash

| Name | What it looks like | What to do instead |
|---|---|---|
| **Shotgun debugging** | Random code changes hoping one helps. | Stop. Return to Mode 2 beat 3 (hypothesize). Each change must test a stated hypothesis. |
| **Superstitious debugging** | "The compiler is broken / the framework is broken / the library is buggy." (Code Complete §23, page-577) | Exhaust your own code first. The library is wrong roughly 1 in 100 times; you are wrong roughly 99 in 100. When the library IS wrong, you can prove it with a minimal repro. |
| **Symptom-hack** | Special-case `if (entity.id == 4521) return default_value`. Hides the bug in a way that looks like a fix. (Code Complete §23, page-575) | Prefer the earliest owned invariant boundary. If the source is external/unowned, implement explicit containment or compatibility protection and preserve the causal follow-up. |
| **Fix-without-regression oracle** | "I'll verify it somehow after I confirm the fix." | Prefer a failing test first. If exact automation is impossible, preserve the strongest repeatable alternative oracle and state the limitation. |
| **Ego interference** | "My code is fine, the data is corrupt." (Code Complete §23, page-591) | Assume the bug is yours until evidence proves otherwise — the assumption helps you debug (Code Complete §23, page-577). |
| **Confirmation bias / psychological set** | Seeing what you expect to see. Reading "SYSSTSTS" as "SYSTSTS". (Code Complete §23, page-592) | Have someone else look. Read the line out loud. Get distance — take the break (heuristic above). |
| **Premature symptom fix** | Patching the visible consumer before locating the causal boundary. | Trace backward first. Repair the earliest owned layer, or explicitly justify external-source containment at the consumer boundary. |
| **"One more equivalent fix attempt"** | Repeating a causally equivalent change after that route stopped changing the evidence. | Freeze that route. Audit the premise, observer, evaluator, fix layer, architecture, and task grain; resume only with a discriminating prediction or declared independent replication. |
| **Silent-failure traps** | `try/except: pass`, log-and-continue, optional-chaining-as-skip, retry-without-bound, generic 500 instead of a structured 400. | Don't reproduce the full anti-pattern catalogue here — cross-ref `pr-review-toolkit:silent-failure-hunter` for the 12 named anti-patterns and the severity matrix. If the bug you are debugging is *itself* a silent-failure trap firing, fix the trap first (`defensive-programming`) and the underlying bug becomes loud. |
| **No-trail debugging** | Hours of debugging that no one else can see or pick up. | Record your investigation at each meaningful step (in your notes, or the PR / issue tracking the fix). If you go idle / blocked, the next Operator or Agent has context. |
| **"Fix this" prompting** | One-line prompt at the Agent pointing at a file; no error context. | Paste the full stack trace, the failing output, the repro command. Agent quality is bounded by the context you provide. See § Working with the Agent above and `references/agent-assisted-debugging.md`. |
| **Accepting unexplained Agent fixes** | "Here's the fix" / "Try this" with no reasoning. Operator ships without understanding. | Refuse. Demand the reasoning. If the Agent cannot explain WHY the fix works, the fix is a guess — and a guess from the Agent is no better than a guess from you. Apply the one-sentence explainability test. |
| **Chaining equivalent Agent fix proposals** | Each proposal renames the same causal guess without producing new evidence. | Stop that route and instrument. A genuinely different hypothesis must predict a different observation; independent replication must be declared in advance. |

## After the fix

Three beats. None of them are optional for a non-trivial bug.

1. **Regression oracle.** Prefer an automated red/green test. If exact automation is
   infeasible, preserve the strongest repeatable alternative oracle and state the limitation.
   Run the affected checks plus whatever broader suite or target-environment gate the claim,
   risk, and release contract require. Cross-ref `superpowers:test-driven-development`.
2. **Similar-defect sweep.** McConnell §23 step 5 — covered above; the section to revisit is "Look for similar defects". Sweep, then record the sweep.
3. **Surface the lesson.** Write a short, blameless postmortem in the PR description (or wherever the fix is tracked):
   - **What happened** — symptom, root cause, fix (one sentence each).
   - **Which bug shape** — name it (from the vocabulary above) so the next debugger pattern-matches faster.
   - **What allowed it** — the system property, not the person. ("Type discriminator was lost between the URL bind and the SQL compare." not "Whoever wrote this forgot.")
   - **Sweep result** — siblings checked, siblings found.
   - **Skill update?** — if the bug shape is new, propose a new row in `references/bug-shapes.md`. If a defensive-programming rule could have caught it earlier, propose a row in `defensive-programming/references/anti-patterns.md`. The skills are durable; the bugs they prevent are durable too.

## Worked examples

Two composite bugs that show the 7-beat motion end to end. The condensed walkthrough is here; the long form (with the diagnostic at each beat, sample queries, the per-type matrix) is in `references/worked-examples.md`.

### Example 1 — NULL `owner` column in a reporting view

- **Symptom.** A `ProjectReport` view's `owner` column was `NULL` for every project in one tenant.
- **Stabilize.** A repeatable query against the data source — `read ProjectReport where tenant = "acme"` → confirmed `owner IS NULL` for every row, not intermittently.
- **Locate.** Backward trace: `ProjectReport.owner` ← `projects.contact` (the integrated table) ← `source.project_summary.Contact` (the upstream system) via the ETL field-mapping config. Confirmed `Contact` was present at the source but absent at the column.
- **Hypothesize.** "The field-mapping config either does not project `Contact`, or projects it but doesn't map it into `projects.contact`."
- **Verify.** A separate report built on a different mapping DID surface `Contact` successfully — proving the data existed at the source. The ETL mapping in question did not include the field. Hypothesis confirmed.
- **Fix.** Source layer — add `Contact` to the field-mapping config; re-run the `projects` mapping; re-run the `ProjectReport` refresh.
- **Regression-test.** Re-query `ProjectReport where tenant = "acme"`; `owner` populated for every row.
- **Look for similar defects.** Other tenants? (Likely.) Other owner-derived columns? Other ETL mappings with the same structural gap (a source field that exists but is never projected)?
- **Bug shape.** Silent data-pipeline gap. **What allowed it:** the pipeline has no "schema agreement" check between source field availability and target column existence — a missing field silently becomes a `NULL`.

### Example 2 — view-filter type-mismatch hardening

- **Symptom.** Two distinct failures from the data-explorer's filter UI: (a) a stale `tenant` filter persisting in the URL when switching views → `400 Unknown column`; (b) a `created_at` filter with epoch-ms string `"1772344800000"` → `500 Failed to fetch object data`.
- **Stabilize.** Both reproduce reliably on the data-explorer page with the exact URL state.
- **Locate.** Layer binary search through the filter pipeline: filter UI → URL state → API parameter bind → SQL comparison. Each type has three boundaries where it can lose its discriminator.
- **Hypothesize.** "11+ column types each have a silent type-coercion gap at one or more of the three boundaries; the generic-500 error surface is hiding which filter fired."
- **Verify.** Enumerate per-type failure modes (time, boolean, bigint, decimal, UUID, text, JSON, etc.). Reproduce each. Confirm the database error code (conversion-failed, arithmetic-overflow, invalid-column, …) at the SQL boundary.
- **Fix.** Two-part. (1) **Error infrastructure** — classify DB errors into structured 400s with `filter_index` + correlation ID; rewrite the error surface with a context-aware error component (message + hint + correlation ID + "Remove this filter" action). (2) **Coercion bugs** — harden each type with dedicated variants, coercions (e.g. `"true"|"false"` → `0|1` for boolean; epoch-ms → ISO-8601 for datetime), and operator whitelists (e.g. UUID restricted to `eq/ne/is_null`).
- **Regression-test.** Full unit suite green (per-type coercion, per-operator whitelist, per-error-classification mapping); full CI gating.
- **Look for similar defects.** Other filter consumers (table view, a second explorer surface)? Other URL-state→SQL paths (sort, pagination)? Other generic 500s in the codebase that should be structured 400s with correlation IDs?
- **Bug shape.** Silent type-coercion gap. **What allowed it:** the generic 500 surface gave the user no way to identify the offending filter, AND each type's coercion path was implicit rather than declared. **Structural fix:** generic 500 → structured 400 + the filter index is the load-bearing change, not the per-type coercion.

## Reference files

- **`references/scientific-method.md`** — Code Complete §23 expanded with direct quotes and page citations. Pull when you want the source material rather than the digest, or when arguing for the discipline with a teammate.
- **`references/lightweight-triage.md`** — Mode 1 in detail. Five-minute loop, escalation triggers, worked micro-example contrasting a typo-class bug (90 s) with the same-symptom Mode 2 bug.
- **`references/bug-shapes.md`** — Long-form vocabulary of the recurring bug archetypes. Each archetype: symptom, where it tends to live, the diagnostic question that resolves it, a real or composite example. This file is expected to grow over time.
- **`references/worked-examples.md`** — Full long-form walkthroughs of the two worked examples with each beat of the formal protocol traced, the sample queries / SQL / per-type matrix.
- **`references/anti-patterns.md`** — Rationalization gallery, mirroring `defensive-programming/references/anti-patterns.md`. Two-column table — what the Operator (or Agent) says to justify the shortcut, the rebuttal.
- **`references/agent-assisted-debugging.md`** — The Agent-collaboration adaptation. Bug classification with Agent diagnostic value, beat-by-beat Agent-Operator motion, confidence calibration habits, the non-informative-route pivot, the explainability test, the autonomous-Agent review-gate rule, and a worked Agent-assisted Mode 2 example.

## Cross-references

- `superpowers:systematic-debugging` — the universal scientific-method foundation. This skill carries its **iron law** (`NO FIXES WITHOUT ROOT CAUSE`) forward and extends with a vocabulary of recurring bug shapes; for pattern analysis and the architectural audit after repeated non-informative fixes, read it directly.
- `superpowers:systematic-debugging/root-cause-tracing.md` — the backward-tracing technique used in beat 2.
- `superpowers:test-driven-development` — use for failing-test-before-the-fix when an automated
  red/green oracle is feasible; otherwise preserve and document the strongest repeatable
  alternative oracle.
- `superpowers:verification-before-completion` — the fix must actually land in the env where the bug fired; do not declare done based on a green local test alone.
- `pr-review-toolkit:silent-failure-hunter` — the review-side catalogue of the 12 silent-failure anti-patterns. Cross-referenced here rather than duplicated.
- `defensive-programming` — the prevention side. Prevention vs diagnosis. If a bug being debugged is a silent-failure trap firing, fix the trap there first; the underlying bug becomes loud.
- `bug-triage` — user-facing intake; produces a formal bug report. This skill takes that report and produces the fix.
- `naming-conventions` — when adding a new bug-shape row to the vocabulary, follow the naming standard.

## Sign-off

This skill exists because ad-hoc debugging is slow — every Operator and every Agent reinvents an approach, reproductions miss the underlying bug, and the wrong thing gets fixed. Naming the two modes (lightweight vs formal), naming the seven beats of the formal protocol, and naming the recurring bug shapes is how the next debug session starts from minute one with the right vocabulary instead of minute fifteen.

The skill is **partnered with `defensive-programming`** — that skill describes how to prevent failures and surface them loudly; this skill describes what to do once one has fired. Read together. When a bug being debugged would have been prevented or surfaced earlier by a defensive-programming rule, propose updating the partner skill. When a debugging beat is missing an instrumentation pattern, propose updating this one.

**Error-investigation policy is a team-level decision, not a per-bug one.** A team that mixes systematic debugging with "I'll just try this one thing" is a team where every bug takes longer than it should and a third of them get fixed at the wrong layer. The protocol above is the default; deliberate exceptions (e.g. true emergency hotfix where minutes matter more than root cause) are fine when stated and reviewed.

**Character prerequisite.** Effective debugging requires intellectual honesty (Code Complete §33.4 echoes this for code in general). Assuming the bug is yours until proven otherwise, refusing to ship a fix you cannot defend, refusing to declare done before the sweep — these are character habits, not technical skills. The skill teaches the technique; the habits are what make the technique stick.
