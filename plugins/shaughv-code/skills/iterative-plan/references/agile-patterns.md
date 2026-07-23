# Agile patterns this skill stands on

`iterative-plan` is not inventing a method — it's applying a handful of well-established agile patterns to a project → milestone → task hierarchy. This file is the *why* behind each phase, so you can explain the reasoning rather than recite rules. When a teammate asks "why are we doing it this way," the answer is here.

The umbrella idea is **Dave Thomas's four verbs** (the "Agile is Dead / long live agility" 2014 keynote): *Find out where you are. Take a small step toward your goal. Adjust your understanding based on what you learned. Repeat.* Every phase of this skill is one of those verbs. Profile = find out where you are. Slice = small step. Re-plan = adjust. The loop = repeat.

---

## Vertical slicing & the walking skeleton (Jeff Patton; Alistair Cockburn)

A **vertical slice** cuts through every layer of the system — UI, logic, data, integration — to deliver one thin piece of observable value, rather than building one whole layer at a time (a *horizontal* slice like "the schema" or "the API client," which demos to nobody).

A **walking skeleton** (Cockburn) is the first vertical slice: the thinnest possible end-to-end implementation that exercises the whole pipeline. It walks before it's strong. For a data-sync source: *one table, one API call, data visibly landing* — that touches auth, fetch, store, and see-it, proving the pipeline shape before you widen it to 20 tables.

Why it matters here: the spine (Phase B) is Patton's story-map backbone, and slice 1 is the walking skeleton. The discipline of "thinnest cut that still teaches you something end-to-end" is what de-risks everything downstream. The sync receipt — "full manual sync of 20 tables" reduced to "one table, one call" — is exactly this move.

### Walking skeleton as recovery, not just a starting technique

When a large slice is already stuck, do not keep pushing horizontally through the same
pile. Return to the last known-good state and rebuild the route as three visible rungs:

1. the smallest end-to-end functional skeleton
2. separately demoable integration and hardening increments
3. the remaining qualification/evidence needed for the true end goal

This is not permission to lower the milestone criterion. It shortens the feedback loop so
basic function is proved before expensive breadth and proof are layered back in.

## Story splitting — SPIDR and friends (Richard Lawrence; Bill Wake's INVEST)

When a slice is still too big, these are the cuts that keep it vertical (never split into horizontal layers):

- **Workflow steps** — ship one step of the user journey first.
- **Business-rule variations** — handle the common rule first, edge rules later.
- **Simple / complex** — the happy path before the hard cases.
- **Data variations** — one division / one tenant / one project before all.
- **Data-entry methods** — one input path (API) before others (CSV, form).
- **Defer performance** — ugly-but-working first; optimize as its own later slice.
- **CRUD: create first** — read/create before edit/delete.
- **Break out a spike** — when the unknown is blocking, timebox an investigation as its own thing.

INVEST is the quality check on the resulting slice/task: **I**ndependent, **N**egotiable, **V**aluable, **E**stimable, **S**mall, **T**estable. "Small" and "Independent" are the two that fight the milestone-batch anti-pattern hardest.

## The spike (XP) — answer to "don't let profiling become a project"

A **spike** is a timeboxed investigation whose only deliverable is *an answer* — enough knowledge to plan or estimate the real work. It is explicitly allowed to be throwaway and scrappy. The point is to buy down uncertainty fast.

This is the pattern behind Phase A's hard rule. When the unknown is "what does this API/system/schema actually do," a spike (touch the real thing, timeboxed) beats a plan-to-investigate every time — because the plan is itself built on the unknowns you haven't resolved yet. The 45-minutes-of-planning vs. 20-minutes-of-doing story (in SKILL.md's Phase A) is a spike beating a mini-Waterfall.

## Dual-track agile & continuous discovery (Marty Cagan; Teresa Torres)

Discovery (figuring out *what* to build) and delivery (building it right) run as **parallel tracks that feed each other**, not as sequential phases. Profiling and requirements-clarification are the discovery track; the slice loop is the delivery track. The re-plan step is the seam where delivery feeds discovery back — what slice 1 taught reshapes what slices 2–6 should be.

The trap dual-track avoids is treating discovery as a one-time upfront phase (Waterfall). Discovery never stops; it just gets cheaper per question as the system becomes real.

## Definition of Ready as conversation, NOT gate (contested — and why we use the soft version)

A **Definition of Ready** lists what a work item needs before it's worked. Used as a pass/fail *gate*, it quietly recreates Waterfall — work piles up waiting to be "ready enough," and the welcome-change stance dies. Respected voices (including Scrum.org staff) push back on DoR-as-gate for exactly this reason.

So Phase 0 (Clarify) produces a requirements *conversation*, not a gate: a short list the requester confirms, with unknowns flagged as Profile questions rather than blockers. The goal is shared understanding, not a checklist someone signs.

## Definition of Done — layered, and it tightens over time

**DoD** is the quality bar an increment must meet. It layers:

- **Slice/story level** — success criterion met, verified by looking/running, merged to workbranch.
- **Milestone level** — demoable end-to-end, no regressions, observability in place.
- **Release level** — deployable, secrets handled, alerting wired.

DoD is mandatory (unlike DoR). Phase C's gate is the slice-level DoD in action. The milestone's success criterion (owned by this skill's success-criterion section) is the milestone-level DoD.

## Burnup over burndown — see scope change honestly

A **burndown** hides scope growth (a flat line could be "doing nothing" or "finishing work while adding equal work"). A **burnup** plots completed work against a moving total-scope line, so scope growth is visible as the gap. The milestone-inflation receipt — a milestone that grew from 50 to 107 tasks — would have shown that inflation as it happened on a burnup. When tracking a milestone's progress, prefer the burnup framing — and treat a rising scope line as a signal to re-examine the spine, not just to work harder.

## Why "outcomes over outputs" sits under all of this

Feature factories measure outputs (tasks shipped). The slice loop measures outcomes (something demoable a stakeholder can use). The gate is an outcome check, not an output count — which is why "27 tasks created" is not progress, but "one table's data visible in the warehouse" is.
