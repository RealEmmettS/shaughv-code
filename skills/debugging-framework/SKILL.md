---
name: debugging-framework
description: >
  Use when actively debugging a Millis-stack bug — Scorecards / PSR / CDP work, MCP entity drift,
  Procore / Acumatica integration drift, Azure SQL or Cosmos write that didn't land, Service Bus
  message that vanished, Cloudflare Worker 5xx, MCP tool returning wrong shape, datetime that's
  an hour off, idempotency replay double-write, thin GI mapping that silently drops a column.
  Triggers on phrases like "debug this", "why is X NULL / wrong / missing", "the data doesn't
  match", "this returns 500", "works locally but not in prod", "the sync is failing silently",
  "I've tried three fixes and...", "the test passes locally but fails in CI". Use this skill for
  Operator-side or Agent-side debugging that needs Millis-stack vocabulary; for end-user-facing
  bug intake use bug-triage; for pre-emptive error-handling design use defensive-programming.
---

# debugging-framework

## Overview

Debugging at Millis means **prove the bug is real, narrow down where it lives, pin the cause at the source layer, fix that, verify the fix, then sweep for siblings**. It does NOT mean trying changes until the symptom goes away, blaming the compiler, or fixing at the consuming layer because the source layer is hard to reach. The first kind of work surfaces the system property that allowed the bug; the second kind hides it and guarantees a repeat.

This skill is the Millis-calibrated debug loop. It is the runtime mirror of the `defensive-programming` skill: same stance, applied when something has already failed instead of before. Defensive design surfaces the failure loudly; this skill finds the root cause.

The universal scientific method here is `superpowers:systematic-debugging` — its **iron law** (`NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST`) is carried forward by reference, not restated. What this skill adds is the **Millis-stack vocabulary**: how CDP MCP entities lie, how thin-GI mappings drift, how Procore / Acumatica responses silently change shape, where structured logging lives in our stack, how to instrument an Azure Function vs a Cloudflare Worker vs a Service Bus handler, and a vocabulary of the bug shapes that actually fire here.

> **A note on team vocabulary.** Throughout this skill, **Operator** refers to a human teammate (Christian, Emmett) and **Agent** refers to an AI teammate (Talos, Hephaestus, and the coding-tool Agents in general — Claude Code, GitHub Copilot, Cursor, Aider, ChatGPT). The debug protocol applies to either, run solo or as a pair; the Agent-collaboration discipline for the common Operator-paired-with-Agent configuration is in `references/agent-assisted-debugging.md`.

## When this skill applies

Invoke this skill at any of these moments:

- Reproducing a defect — local repro, CI-only failure, production-only failure, "intermittent on Tuesdays" failure.
- Investigating an unexpected value — `NULL` where data was expected, wrong type, wrong tenant, stale row.
- Investigating a missing side-effect — `200` returned but the row was not committed; `send()` returned but no consumer ever saw the message; webhook fired but the downstream record didn't appear.
- Investigating a wrong side-effect — count off by N, duplicate rows, a write that landed twice, a write that landed under the wrong identifier.
- A 5xx, a 4xx with a misleading message, an MCP tool that returned the wrong shape, a Cloudflare Worker that returns `Internal Server Error` with no logs.
- Tests pass locally but fail in CI (or vice versa).
- A fix didn't stick — the same bug came back, OR a new bug showed up in the area you "fixed".
- Another Operator or Agent (e.g. Hephaestus) hands off a debug session midway.

Skip this skill for: end-user-facing bug intake (use `bug-triage`); pre-emptive error-handling design (use `defensive-programming`); pure performance tuning with no incorrect behavior (different discipline — profile-first).

## The two modes

| | **Mode 1 — Lightweight triage** | **Mode 2 — Formal protocol** |
|---|---|---|
| Scope | Trivial, isolated, contained | Anything user-visible in prod, anything in a write path, anything systemic |
| Time budget | ≤ 5 minutes | As long as needed |
| Reproducibility required | One repro is fine | Stable repro required before any fix |
| Test before fix | Sanity check is fine | **Failing automated test required** |
| Look for similar defects | Skip | **Required** |
| MC `result_notes` postmortem | Skip unless instructive | **Required if the bug was non-trivial** |

**Hard rule:** Escalate from Mode 1 → Mode 2 the moment ANY of these is true. Do not "just try one more thing".

- The change touches a write path (DB write, Service Bus send, Procore POST, external state mutation).
- The bug is user-visible in production.
- The first two Mode 1 attempts didn't fix it.
- You don't fully understand why the fix would work.
- The bug crosses a process / service / network boundary.
- The bug involves money, PII, or system-of-record data (Scorecards math, PSR financials, CDP rollups, Procore sync).

See `references/lightweight-triage.md` for the Mode 1 loop in detail. See `references/scientific-method.md` for the McConnell §23 source material that grounds Mode 2.

## Bug classification — know the shape before you start

Before choosing a mode, classify the bug. Different shapes have different debugging tactics AND different Agent diagnostic ROI — knowing which class you're in lets you skip false starts. State the classification out loud (in MC `current_activity` or to the Agent in your session) — if it's wrong, the response shape will signal the misclassification.

| Class | Symptom | Agent diagnostic value | Tactic |
|---|---|---|---|
| **Clear error + stack trace** | Exception, file, line, error code, traceback | **High** | The Agent usually identifies cause from signature; paste FULL trace + relevant file + recent diff. |
| **Logic bug in a single function/module** | Wrong output for known input; no error | **Good** | Socratic — Operator states intent; Agent walks actual behavior; divergence is the bug. |
| **Behavioral bug with no error** | "It just doesn't work as expected"; UI / async / state | **Moderate** | Don't ask for a fix yet — instrument first. Targeted log statements / test cases that surface the divergence. |
| **Multi-system / distributed** | Failure crosses process / service / network boundary | **Lower** | The Agent helps map components, generate hypotheses, write instrumentation — but can only see what you show it. |
| **Intermittent / race condition** | Works 9 of 10 times | **Lowest** for direct fixes | Stabilize first. Aggressive logging, deterministic test inputs, concurrency-pattern analysis. No fix until reproducible. |
| **Performance** | Correct output, too slow / too much memory / too many queries | **Moderate** | Profile FIRST. Bring profiler output to the Agent. Without the profile, Agent suggestions are guesses about what's slow — almost always wrong. |

Drawn from the `Software Debugger Advisor` prompt by Christian (in `prompt-library`, entry 24). The full Agent-collaboration discipline is in `references/agent-assisted-debugging.md`.

## Mode 1 — Lightweight triage (the 5-minute loop)

1. **Read the error literally.** Stack trace top to bottom, file path, line number, error code. Do not skim — the error often names the fix in its own text.
2. **Reproduce it once.** A bug you have not seen is a bug you cannot fix.
3. **Check the last commit.** `git log -1 --stat` and `git diff HEAD~1`. If the bug appeared after a recent change, the change is the suspect until proven otherwise.
4. **Fix the obvious thing.** Typo, off-by-one, missing await, wrong env var name. Make the smallest possible change.
5. **Verify the fix.** Re-run the failing path; confirm the original error is gone AND no new error appeared.

If any of the **escalate** conditions above are true, OR if any of the five steps gets ambiguous, STOP — switch to Mode 2. Do not bargain with yourself.

## Mode 2 — Formal protocol (seven beats)

You MUST complete each beat before moving to the next. Skipping a beat to "save time" is how Mode 2 turns into thrashing.

### 1. Stabilize (make it reproducible)

If the bug does not reproduce reliably, you cannot fix it — you can only guess. Simplify the inputs and environment until changing any one variable changes the behavior (Code Complete §23, page-579). If you cannot stabilize after a sustained attempt: instrument first, fix second. Add diagnostic logging at the layer boundaries and *wait* for the next occurrence rather than fix-by-guess.

In the Millis stack, "stabilize" usually means one of:

- **A failing test case** (preferred — automatable, regression-proof). Use `superpowers:test-driven-development` to write it.
- **A repeatable CDP MCP query** (`mcp__claude_ai_Millis_CDP__read_records` with the inputs that surface the bad row).
- **A repeatable Procore / Acumatica API call** with the same auth + payload.
- **A repeatable Service Bus message** (re-enqueue from dead-letter or replay).
- **A repeatable browser interaction** (record the URL state + the click sequence; for Inspector-class bugs the URL state usually carries the trigger).

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

Be specific, not vague. *"Maybe it's a race condition"* is not a hypothesis; *"I think `sync_meeting_topics` and `sync_meeting_details` are racing on `procore.meetings.id`, because the duplicates correlate with overlapping cron runs at 02:05"* is.

Do not skip this beat. A hypothesis you have not stated is a hypothesis you cannot disprove.

### 4. Verify (smallest possible experiment)

Design ONE experiment that confirms or denies the hypothesis. **One variable at a time** (Code Complete §23, page-587). The cheaper the experiment, the better — a `print()` and a re-run usually beats a code change.

- Did the experiment **support** the hypothesis? → beat 5.
- Did the experiment **contradict** the hypothesis? → form a new hypothesis with the expanded evidence; loop back to beat 3.
- Did the experiment **partially** support it? → your hypothesis is too vague; sharpen it and loop.

Use *negative* results — the bug NOT being in the area you thought it was is real information (Code Complete §23, page-583). Keep a list of hypotheses tried and ruled out so you don't loop.

### 5. Fix (the problem, not the symptom)

Fix at the source layer the data-flow trace landed on. Do not fix at the consuming layer (Code Complete §23, page-589). Symptom-fixes generate a new fix every time a new consumer surfaces the same root cause.

- Fix at the **smallest** correct layer — the layer responsible for the invariant being broken, not the layer where the broken invariant happened to surface.
- **One change at a time.** No "while I'm here" cleanup, no bundled refactoring. Those are separate commits, ideally separate PRs.
- If the fix requires changes in three places, that is signal — either (a) the abstraction is wrong (consider whether the architectural question from `superpowers:systematic-debugging` Phase 4.5 applies), or (b) you found the source AND two consumer-layer band-aids that the source fix obsoletes.

### 6. Regression-test (lock the fix in)

Before declaring the fix done:

- **A failing test exists** that reproduced the bug; cross-ref `superpowers:test-driven-development`. Run it — it MUST go red without the fix.
- **The full local test suite passes** with the fix. Not just the test you wrote; the whole suite.
- **The fix actually landed** in the environment where the bug fired. A green local test does not prove a green prod; cross-ref `superpowers:verification-before-completion`. For data-pipeline fixes, this means re-running the pipeline and confirming the bad row is now correct.

### 7. Look for similar defects (the McConnell sweep)

*"Defects tend to occur in groups. Look for others that are similar."* (Code Complete §23, page-591)

This beat is non-optional. It is also the highest-leverage beat — fixing one bug typically takes minutes; finding its three siblings before they fire takes minutes too and saves three future debugging sessions.

For each fix, ask:

- **Same root cause elsewhere?** `grep` the codebase for the same pattern (same anti-pattern, same broken invariant, same missing check).
- **Sister entities?** A CDP entity bug usually has siblings in adjacent entities. A thin-GI mapping bug usually has siblings across the other thin GIs.
- **Sister integrations?** A Procore field-shape bug usually has siblings in the same Procore endpoint's other fields, AND in the analogous Acumatica endpoint.
- **Sister consumers?** If the symptom was at a consuming layer (Scorecard column, PSR section, MCP tool result), there are usually 2–4 other consumers of the same source layer with the same blind spot.
- **Sister envs?** A bug in prod usually exists in staging too. A bug in MDC Dallas usually exists in another branch. A bug in one tenant usually exists in another.

Record the sweep in MC `result_notes` (signed by the Operator or Agent doing the work) so the next teammate knows what was checked.

## Millis bug shapes — the vocabulary

This is the durable Millis-canonical content. When debugging, ask which of these shapes the bug looks like — pattern-matching to a known shape collapses the locate beat from hours to minutes.

| Shape | Symptom | Where it tends to live | The diagnostic question |
|---|---|---|---|
| **Silent data-pipeline gap** | Field is `NULL` or missing in a downstream column; upstream source has the data. | Thin-GI mappings, ETL projection lists, Scorecard refresh SQL, MCP entity field lists. | "Does the field exist at every layer between source and consumer, and is it mapped at each hop?" |
| **Silent type-coercion gap** | 4xx/5xx with a misleading message, or correct response shape but wrong value, when a value crosses a layer boundary. | UI filter → URL → API bind → SQL compare; Cosmos JSON → typed model; Service Bus message body → handler payload; Procore string-vs-int field. | "At which boundary did the type silently change, and which boundary lost the type discriminator?" |
| **MCP entity ↔ thin-GI drift** | MCP tool returns wrong columns / missing columns; the GI definition diverged from the MCP entity. | `cdp-design-pattern` repos; entity YAML / JSON config vs the actual GI in Acumatica. | "Are the MCP entity column list and the GI's exposed field list byte-equal? When was each last edited?" |
| **Procore / Acumatica response shape drift** | Field renamed, added, or removed at vendor side; response still parses; value is wrong or absent. | Procore SDK responses, Acumatica OData / Generic Inquiry responses, webhook payloads. | "When did the vendor last ship? Compare a response captured today to one captured before the symptom started." |
| **Idempotency replay** | Counts off by N, duplicate rows, write that landed twice. | Service Bus / Event Grid handlers (at-least-once delivery), Procore webhook handlers, Azure Function triggers. | "Is there an idempotency key on the write? Are duplicate inputs collapsed at insert, or relied on at read?" |
| **Timezone naivety** | Row appears in two days' rollups, or skipped on DST day; "yesterday" off by one. | `datetime.now()` without `tz=UTC`; SQL Server `DATETIME` columns without offset; cron job in local time. | "Is the timestamp tz-aware UTC end-to-end? Where does a naive datetime enter the pipeline?" |
| **Read-after-write inconsistency** | Just-written row absent from a follow-up read; eventual consistency window. | Cosmos DB cross-region reads, Azure SQL replica reads, CDN cache reads after origin write. | "Did the write and the read hit the same replica? Is there a read-your-writes guarantee on this path?" |
| **Optional-chaining-as-skip** | Downstream code treats "we don't know" as "no value"; UI shows blank instead of error. | TypeScript / JavaScript `entity?.contact?.email`; Python `getattr(entity, "contact", None)`; LINQ `?.` chains. | "Does an absent value here mean 'absence' or 'we failed to load this'? Are they distinguishable downstream?" |
| **Dead feature flag** | Code path silently never executes; bug is "it never worked" not "it broke". | Old kill-switches that defaulted off; per-tenant flags that flipped off for everyone; `if (DEBUG)` blocks shipped to prod. | "Was this path ever actually exercised in prod? When was the flag last evaluated true?" |
| **Schema drift between layers** | DB column exists but model doesn't see it; or model has field but DB column was dropped. | Pydantic / dataclass / DTO definitions vs the actual DB schema; ORM migrations not run on one env. | "Run a fresh introspection of the live schema vs the model. Diff." |
| **Lock-conflict masquerading as bug** | Intermittent failure; works on retry. | SQL Server locks, Azure SQL contention, Cosmos rate-limit (429), Procore rate limits. | "Is the retry path swallowing the lock conflict as success? Or is it a real bug masquerading as transient?" |
| **CI ≠ local env** | Test passes locally, fails in CI (or vice versa). | Test-runner working dir, env var availability, time-of-day dependence, file-system case sensitivity, locale. | "What is in this env that is NOT in the other? Diff `env`, OS, runner image, CWD, locale." |

Each shape has a longer treatment in `references/millis-bug-shapes.md` with a real or composite example.

## Instrumentation strategies

Where to add diagnostic signal in the Millis stack:

- **Structured logging envelope.** Standard fields: `operation`, `entity_type`, `entity_id`, `correlation_id`, `attempt`, `duration_ms`, `error_type`. See `defensive-programming` § Structured logging — do not duplicate, use the same envelope.
- **Per-layer boundary echo.** For multi-component debugging, log what data *enters* and *exits* each component (the `superpowers:systematic-debugging` Phase 1 step 4 pattern). At Millis: log at HTTP handler entry, MCP tool entry, Azure Function trigger entry, Service Bus handler entry, Cloudflare Worker `fetch()` entry, before-and-after Procore/Acumatica calls, before-and-after SQL writes.
- **Application Insights query patterns.** For our Azure services, App Insights has the operation and trace correlation. Sample query: `traces | where customDimensions.entity_id == "..." | order by timestamp asc` shows the per-request log envelope across all components.
- **Mission Control `result_notes` as a durable diagnostic log.** Append via `update_task` (signed by the Operator or Agent doing the work — `— Talos`, `— Hephaestus`, `— Emmett`, `— Christian`) at each meaningful step: hypothesis stated, experiment run, result. This is how the next teammate — Operator or Agent — picks up a debug session mid-flight without re-running the locate beat.
- **Add the logs *first*, fix *second*.** When stabilization fails — the bug is intermittent or environment-specific — invest in the instrumentation pass before the fix attempt. A fix-by-guess on an unstable bug is worse than waiting one more occurrence with logs in place.

## Heuristics

- **Binary search through code, data, and time** (Code Complete §23, page-583). The single highest-leverage debugging technique.
- **Rubber duck** (Code Complete §23, page-597). Explain the bug to another Operator, to an Agent (Hephaestus on a `question`-status MC update, or the Agent in your session), to the duck on your desk, or out loud to yourself. The act of articulating the problem often surfaces the answer.
- **Take a break** (Code Complete §23, page-597). After ~30 minutes of stuck-thrashing, tension is impairing judgement. Stand up. Tomorrow you will see it in five minutes. Many veteran Operators report their best debugging happens on the walk to coffee.
- **Time-box quick-and-dirty attempts** (Code Complete §23, page-597). Set a maximum (10–15 min). If you blow through it, switch to formal Mode 2.
- **Keep a notepad of hypotheses tried** (Code Complete §23, page-583). Writing them down prevents looping back to ones already ruled out. MC `result_notes` works for this AND records the audit trail.
- **Generate fresh test cases** (Code Complete §23, page-583). When stuck, design inputs that you have not tried. New data → new hypotheses.
- **Use compiler / typechecker / linter warnings as first-line defence** (Code Complete §23, page-594). Read every warning. The compiler usually knows.
- **The debugger is a thinking aid, not a substitute** (Code Complete §23, page-596). Stepping through code without a hypothesis is just slow reading.

## Working with the Agent

An Operator at Millis is almost always debugging alongside an Agent — Claude Code is the default, also GitHub Copilot, Cursor, Aider, ChatGPT. (An Agent may also debug autonomously without an Operator at the keyboard; see § "When the Agent is debugging autonomously" in `references/agent-assisted-debugging.md` for the review-gate adjustment.) Five principles govern the Agent-Operator collaboration. They do NOT replace Mode 2 — they are the Agent discipline layered on top.

1. **The Agent accelerates spotting problems, but Operator judgment decides the fix.** The Agent is a pair programmer, not an autopilot. The Operator signs off on every change.
2. **"Fix this" is the fastest way to hallucinate.** Context determines quality. Paste the FULL stack trace, the failing output, the recent diff — never a vague description. A short prompt invites a plausible-looking fix to a plausible-looking bug, neither of which is real.
3. **Symptom fixes are not root-cause fixes.** The Agent is biased toward "make the error go away" because that is the visible success signal. The Operator is responsible for pushing past that to *why*.
4. **Two failed Agent fix proposals = pivot to instrumentation.** Do NOT chain a third proposal. After two misses, stop accepting code suggestions; switch to evidence-gathering — targeted logs, debugger breakpoints, minimal repro, git diff. The next Agent proposal on top of two wrong ones is a guess raised to the third power.
5. **Every fix must be explainable in one sentence.** If you cannot articulate WHY the fix works without copying the Agent's reasoning verbatim, you do not understand it yet. Keep asking until you do. The explainability test is what separates a fix from a workaround.

Full mechanics, beat-by-beat Agent-Operator motion, the autonomous-Agent review-gate rule, and the canonical worked Agent-assisted debugging example are in `references/agent-assisted-debugging.md`. For the standalone prompt (loading into a fresh session, handing to another Operator, debugging outside Claude Code), use the `Software Debugger Advisor` prompt in `prompt-library` (entry 24, ~8,800 chars).

## Anti-patterns — what guarantees thrash

| Name | What it looks like | What to do instead |
|---|---|---|
| **Shotgun debugging** | Random code changes hoping one helps. | Stop. Return to Mode 2 beat 3 (hypothesize). Each change must test a stated hypothesis. |
| **Superstitious debugging** | "The compiler is broken / the framework is broken / the library is buggy." (Code Complete §23, page-577) | Exhaust your own code first. The library is wrong roughly 1 in 100 times; you are wrong roughly 99 in 100. When the library IS wrong, you can prove it with a minimal repro. |
| **Symptom-hack** | Special-case `if (entity.id == 4521) return default_value`. Hides the bug in a way that looks like a fix. (Code Complete §23, page-575) | Fix at the source layer. If the source layer is "out of scope", file a task to fix it AND surface the symptom with a typed error AND continue working — three things, not one band-aid. |
| **Fix-without-test** | "I'll write the test after I confirm the fix works." | Untested fixes don't stick. Write the failing test FIRST — it is also the only thing that proves you understand the bug. Cross-ref `superpowers:test-driven-development`. |
| **Ego interference** | "My code is fine, the data is corrupt." (Code Complete §23, page-591) | Assume the bug is yours until evidence proves otherwise — the assumption helps you debug (Code Complete §23, page-577). |
| **Confirmation bias / psychological set** | Seeing what you expect to see. Reading "SYSSTSTS" as "SYSTSTS". (Code Complete §23, page-592) | Have someone else look. Read the line out loud. Get distance — take the break (heuristic above). |
| **Premature symptom fix** | Fixing at the consuming layer when the source layer is the problem. | Trace data flow backward. Fix at the source. The consuming layer should not have to know. |
| **"One more fix attempt"** | After 2+ failed fix attempts, trying a third. | STOP. Three failed fixes = either the hypothesis is wrong (return to beat 3) or the architecture is wrong (`superpowers:systematic-debugging` Phase 4.5). Discuss before attempting Fix #4. |
| **Silent-failure traps** | `try/except: pass`, log-and-continue, optional-chaining-as-skip, retry-without-bound, generic 500 instead of a structured 400. | Don't reproduce the full anti-pattern catalogue here — cross-ref `pr-review-toolkit:silent-failure-hunter` for the 12 named anti-patterns and the severity matrix. If the bug you are debugging is *itself* a silent-failure trap firing, fix the trap first (`defensive-programming`) and the underlying bug becomes loud. |
| **No-MC-trail debugging** | Hours of debugging that no one else can see or pick up. | Update MC `result_notes` at each meaningful step (signed by the Operator or Agent doing the work). If you go idle / blocked, the next Operator or Agent has context. |
| **"Fix this" prompting** | One-line prompt at the Agent pointing at a file; no error context. | Paste the full stack trace, the failing output, the repro command. Agent quality is bounded by the context you provide. See § Working with the Agent above and `references/agent-assisted-debugging.md`. |
| **Accepting unexplained Agent fixes** | "Here's the fix" / "Try this" with no reasoning. Operator ships without understanding. | Refuse. Demand the reasoning. If the Agent cannot explain WHY the fix works, the fix is a guess — and a guess from the Agent is no better than a guess from you. Apply the one-sentence explainability test. |
| **Chaining 4+ Agent fix proposals** | First Agent fix didn't work, ask for another, doesn't work, ask again. | After TWO failed Agent proposals, STOP accepting code suggestions. Pivot to instrumentation. The next proposal is a guess on top of two wrong guesses. |

## After the fix

Three beats. None of them are optional for a non-trivial bug.

1. **Regression test.** Automated if possible. Run the full suite, not just the new test. Cross-ref `superpowers:test-driven-development`.
2. **Similar-defect sweep.** McConnell §23 step 5 — covered above; the section to revisit is "Look for similar defects". Sweep, then record the sweep.
3. **Surface the lesson.** Append a short, blameless postmortem to the MC task's `result_notes` (signed by the Operator or Agent doing the work):
   - **What happened** — symptom, root cause, fix (one sentence each).
   - **Which Millis bug shape** — name it (from the vocabulary above) so the next debugger pattern-matches faster.
   - **What allowed it** — the system property, not the person. ("Type discriminator was lost between the URL bind and the SQL compare." not "Whoever wrote this forgot.")
   - **Sweep result** — siblings checked, siblings found.
   - **Skill update?** — if the bug shape is new, propose a new row in `references/millis-bug-shapes.md`. If a defensive-programming rule could have caught it earlier, propose a row in `defensive-programming/references/anti-patterns.md`. The skills are durable; the bugs they prevent are durable too.

## Worked examples

Two real Millis bugs. The condensed walkthrough is here; the long form (with the diagnostic at each beat, real MCP queries, commit refs) is in `references/worked-examples.md`.

### Example 1 — CDP-27 — NULL `project_manager` in ProjectScorecard

- **Symptom.** ProjectScorecard's `project_manager` column was `NULL` for all MDC Dallas projects.
- **Stabilize.** Repeatable Theia MCP query — `read_records ProjectScorecard branch=MDC_Dallas` → confirmed `project_manager IS NULL` for every row.
- **Locate.** Backward trace: `ProjectScorecard.project_manager` ← `IntegratedProjects.contact` ← `acumatica.project_summary.Contact` via the CDP-PMProject-Thin GI. Confirmed `Contact` was present at the source but absent at the column.
- **Hypothesize.** "The thin GI either does not expose `Contact`, or exposes it but doesn't map it into `IntegratedProjects.contact`."
- **Verify.** A sister GI (`PMProjectsDJ`) DID expose `ProjectManager` and Dan's OData skill pulled it successfully — proving the data existed in Acumatica. The thin GI definition did not include the field. Hypothesis confirmed.
- **Fix.** Source layer — add `Contact` (or `ProjectManager`) to the thin GI definition; refresh the IntegratedProjects mapping; re-run the ProjectScorecard refresh SQL.
- **Regression-test.** Re-query `ProjectScorecard branch=MDC_Dallas`; PM column populated for every row.
- **Look for similar defects.** Other branches? (Likely.) Other PM-derived columns? Other thin GIs with the same structural gap (a source field that exists but is not mapped at the GI layer)?
- **Millis bug shape.** Silent data-pipeline gap. **What allowed it:** the pipeline has no "schema agreement" check between source field availability and target column existence — a missing field silently becomes a `NULL`.

### Example 2 — CDP-30.1.17 — view-inspector type-mismatch hardening

- **Symptom.** Two distinct failures: (a) a stale `source_tenant` filter persisting in the URL when switching objects → `400 Unknown column`; (b) a `created_at` filter with epoch-ms string `"1772344800000"` → `500 Failed to fetch object data`.
- **Stabilize.** Both reproduce reliably on https://data.theiaconstruct.com/inspector with the exact URL state.
- **Locate.** Layer binary search through the filter pipeline: shadcn filter UI → URL state → API parameter bind → SQL Server comparison. Each type has three boundaries where it can lose its discriminator.
- **Hypothesize.** "11+ SQL types each have a silent type-coercion gap at one or more of the three boundaries; the generic-500 error surface is hiding which filter fired."
- **Verify.** Enumerate per-type failure modes (time, bit, bigint, decimal, uniqueidentifier, text/ntext, xml, hierarchyid, etc.). Reproduce each. Confirm SQL error numbers (245, 8114, 402, …) at the SQL Server boundary.
- **Fix.** Two-part. (1) **Error infrastructure** — classify SQL errors into structured 400s with `filter_index` + correlation ID; rewrite the error surface with a context-aware `<ErrorState>` (message + hint + correlation ID + "Remove this filter" action). (2) **Translation bugs** — harden each type with dedicated variants, coercions (e.g. `"true"|"false"` → `0|1` for bit; epoch-ms → ISO-8601 for datetime), and operator whitelists (e.g. GUID restricted to `eq/ne/is_null`).
- **Regression-test.** 44/44 vitest green; full CI gating.
- **Look for similar defects.** Other filter consumers (table view, inspector v2)? Other URL-state→SQL paths? Other generic 500s in the codebase that should be structured 400s with correlation IDs?
- **Millis bug shape.** Silent type-coercion gap. **What allowed it:** the generic 500 surface gave the user no way to identify the offending filter, AND each type's coercion path was implicit rather than declared. **Structural fix:** generic 500 → structured 400 + the filter index is the load-bearing change, not the per-type coercion.

## Reference files

- **`references/scientific-method.md`** — Code Complete §23 expanded with direct quotes and page citations. Pull when you want the source material rather than the digest, or when arguing for the discipline with a teammate.
- **`references/lightweight-triage.md`** — Mode 1 in detail. Five-minute loop, escalation triggers, worked micro-example contrasting a typo-class bug (90 s) with the same-symptom Mode 2 bug.
- **`references/millis-bug-shapes.md`** — Long-form vocabulary of the recurring Millis bug archetypes. Each archetype: symptom, where it tends to live in the stack, the diagnostic question that resolves it, a real or composite example. This file is expected to grow over time.
- **`references/worked-examples.md`** — Full long-form CDP-27 + CDP-30.1.17 walkthroughs with each beat of the formal protocol traced, the actual MCP queries / SQL / commits where verifiable.
- **`references/anti-patterns.md`** — Rationalization gallery, mirroring `defensive-programming/references/anti-patterns.md`. Two-column table — what the Operator (or Agent) says to justify the shortcut, the rebuttal.
- **`references/agent-assisted-debugging.md`** — The Agent-collaboration adaptation. Bug classification with Agent diagnostic value, beat-by-beat Agent-Operator motion, confidence calibration habits, the two-failed-attempts pivot, the explainability test, the autonomous-Agent review-gate rule, and a worked Agent-assisted Mode 2 example. Distills `Software Debugger Advisor` (prompt-library entry 24) for Claude-Code-on-Millis sessions.

## Cross-references

- `superpowers:systematic-debugging` — the universal scientific-method foundation. This skill carries its **iron law** (`NO FIXES WITHOUT ROOT CAUSE`) forward and extends with Millis vocabulary; for the universal pattern-analysis and 3+-failed-fixes-architectural-problem techniques, read it directly.
- `superpowers:systematic-debugging/root-cause-tracing.md` — the backward-tracing technique used in beat 2.
- `superpowers:test-driven-development` — required for the failing-test-before-the-fix in beat 6.
- `superpowers:verification-before-completion` — the fix must actually land in the env where the bug fired; do not declare done based on a green local test alone.
- `pr-review-toolkit:silent-failure-hunter` — the review-side catalogue of the 12 silent-failure anti-patterns. Cross-referenced here rather than duplicated.
- `defensive-programming` (DT-29) — the runtime mirror's runtime mirror. Prevention vs diagnosis. If a bug being debugged is a silent-failure trap firing, fix the trap there first; the underlying bug becomes loud.
- `bug-triage` — user-facing intake; produces a formal bug report. This skill takes that report and produces the fix.
- `mission-control-checkins` — `result_notes` as the durable diagnostic log; the hand-off mechanism between any two teammates (Operator or Agent) mid-debug. Also defines the CONTEXT / QUESTION / OPTIONS format the autonomous Agent uses for its review-gate before applying a Mode 2 fix.
- `cdp-design-pattern` — for CDP-shaped bugs (thin-GI mappings, MCP entity drift, the Acumatica field-availability gap).
- `acumatica-thin-gi` — for thin-GI authorship bugs (the CDP-27 root-cause layer).
- `naming-conventions` (DT-28) — when adding a new bug-shape row to the vocabulary, follow the naming standard.
- `prompt-library` — Christian's `Software Debugger Advisor` prompt (entry 24, ~8,800 chars) is the canonical Agent-assisted debugging prompt. Use this skill for the Millis-stack vocabulary inside a Claude Code session; use the prompt directly for sessions outside Claude Code, for handoffs between Operators, or when you want the full structured Socratic walk.

## Sign-off

This skill exists because debugging at Millis was ad-hoc — every Operator and every Agent reinvented an approach, reproductions missed the underlying bug, and the wrong thing got fixed. Naming the two modes (lightweight vs formal), naming the seven beats of the formal protocol, and naming the recurring Millis bug shapes is how the next debug session starts from minute one with the right vocabulary instead of minute fifteen.

The skill is **partnered with `defensive-programming` (DT-29)** — that skill describes how to prevent failures and surface them loudly; this skill describes what to do once one has fired. Read together. When a bug being debugged would have been prevented or surfaced earlier by a defensive-programming rule, propose updating the partner skill. When a debugging beat is missing a Millis-specific instrumentation pattern, propose updating this one.

**Error-investigation policy is a team-level decision, not a per-bug one.** A team that mixes systematic debugging with "I'll just try this one thing" is a team where every bug takes longer than it should and a third of them get fixed at the wrong layer. The protocol above is the default; deliberate exceptions (e.g. true emergency hotfix where minutes matter more than root cause) are fine when stated in the MC task and reviewed.

**Character prerequisite.** Effective debugging requires intellectual honesty (Code Complete §33.4 echoes this for code in general). Assuming the bug is yours until proven otherwise, refusing to ship a fix you cannot defend, refusing to declare done before the sweep — these are character habits, not technical skills. The skill teaches the technique; the habits are what make the technique stick.

— Authored under DT-22, DevOps Training milestone 2 (Millis Dev Skill Library), integrating the bug-classification and Agent-Operator pairing principles from Christian Adleta's `Software Debugger Advisor` prompt (prompt-library entry 24). Talos.
