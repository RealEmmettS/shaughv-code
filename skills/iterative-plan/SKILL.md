---
name: iterative-plan
description: >-
  Use when planning a milestone — the work between a request (demo feedback, a
  status update, a discovery transcript) and what you hand back — or when authoring
  the milestone itself: sketching the 2–5 milestones for a new project, writing or
  rewriting a success criterion, flipping a milestone to "in flight," or stuck on what
  "done" means. Walks Profile, Clarify, Spine, and the Slice loop, and owns the
  binary/demoable success-criterion gate. Trigger on "plan this milestone," "scope this
  out," "help me write the tasks," "what's our first slice," vague criteria like "works
  well" / "is ready" / "Foundation complete," asks for more than 5 milestones, tasks
  generated from a criterion that isn't observable in 5 minutes, or mid-flight "is this
  slice too big" / "do a post-mortem." Applies to any milestone-shaped chunk of work
  (Jira epics, Notion briefs, roadmaps, Markdown plans). Fights overplanning and
  Waterfall.
---

# Iterative Plan

This is the planning loop for the gap between **a request and what you hand back** — a demo's feedback, a periodic status update, a discovery transcript, a "can you also…" from a stakeholder. It exists because the most expensive mistakes happen *here*, in how you plan, not in how you code.

## When this applies

Trigger on "plan this milestone," "scope this out," "help me write the tasks," "what's our first slice," "turn this transcript into a plan" — and mid-flight: "help me cut slices," "is this slice too big," "do a post-mortem on this milestone." You can resume from any phase. The retro/meta-feedback loop after each gate gathers informational, internal, and external feedback before solving. This skill soft-gates the three classic dispatch anti-patterns (milestone-sized batch, no baseline, slices too large).

It also triggers on the **milestone-authoring** moments: drafting a new project's 2–5 milestones from scratch; reviewing a milestone before flipping it from `pending` to `in_flight`; a teammate handing you a vague criterion ("works well," "is ready," "Foundation complete," "X is done," "improve Y") and asking for tasks; a milestone stuck at the same progress reading for two or more reviews when someone wants to "just move the dot"; a request for more than 5 milestones, or milestones "fast" with no shaping; and milestone-shaped chunks in any tool (a Jira epic, a Notion plan, a customer-facing roadmap, a Markdown brief). This skill owns both the planning **loop** and the success **criterion** — the binary/demoable gate (see **The success criterion** below).

Skip it for pure chit-chat, one-line tweaks to an already-binary criterion, or marking an in-flight milestone done after the demo has actually happened.

## The one idea

> **A plan is a hypothesis, and a scoped slice is a smaller hypothesis. Neither survives contact with the real system unchanged — so plan the smallest amount that lets you make contact, then let what you learn rewrite the rest.**

This is Dave Thomas's loop (*find where you are → take a small step → adjust → repeat*) applied to a project → milestone → task hierarchy. The failure that keeps repeating is **Waterfall in disguise**: a long planning day that scopes the whole milestone, a long execution run that dispatches it all at once, and a plan too large and too committed to adjust when reality bites three days later. The fix is not a better upfront plan. It is a *faster loop*.

The receipts for why this matters live in `references/anti-patterns.md` — the milestone-sized batch that collapsed, and the milestone that inflated 50→107 tasks. Read it when you want the evidence; the soft-gates below encode its lessons.

## The four phases (and the 5-turn budget)

The whole loop should fit in **about five turns of conversation**. If it's taking longer, you're overplanning — which is itself the anti-pattern. The phases:

| Phase | The question it answers | Output | Turn |
|---|---|---|---|
| **0 · Clarify** | What is actually being asked, and what does "done" mean? | A short requirements list the requester would confirm | ~1 |
| **A · Profile** | What does the real system actually do? | Written findings + a baseline number (if optimizing) | ~1–2 |
| **B · Spine** | What are the 3–6 demoable slices, and which is first? | Named slices, slice 1 scoped only | ~2–3 |
| **C · Slice loop** | What are the tasks for *this* slice? | 1–5 tasks; dispatch; gate; **retro**; re-plan | ~3–5, repeating |

Phase C's loop is *scope → dispatch → gate → retro → re-plan*. The **retro** sub-step (gather feedback on how the planning went, before re-planning) is what makes this skill self-improving — it's detailed in Phase C below and in `references/retro-feedback.md`.

**Resume anywhere.** The user will often drop in mid-process: "I'm working through the spine, help me cut slices" or "write the tasks for this one slice." Detect the phase from what they say and the files they share, confirm it in one line, and start there. Do not re-run earlier phases they've already done — ask only for the artifact you need (the requirements list, the profile findings, the spine).

---

## Phase 0 — Clarify the requirements (before any plan)

This is the step that's often missing. Between the request and the spine, lock what's being asked — but do it as a **conversation, not a gate**. (A Definition-of-Ready used as a pass/fail gate just recreates Waterfall; the value is the shared understanding, not the checklist. See `references/agile-patterns.md`.)

Produce a short list the requester would nod at:

- **Who** is this for and what will they *do* with it? (A teammate updating a record field; a PM downloading a report.)
- **What's the demoable end-state** — the thing you'll show that proves it's done? (One sentence, in their terms.)
- **What's explicitly *not* in this milestone?** Non-goals are the cheapest scope control you have.
- **What do we not yet know** that the plan depends on? (These become Profile questions, not assumptions.)

If the requester isn't in the room, infer the list from the transcript/feedback and **mark each item as confirmed vs. assumed** — the assumed ones are the first things Profile or the demo should test.

Soft-gate: if you can't write the demoable end-state in one sentence, you don't have a milestone yet — you have a theme. Say so, and help narrow it before continuing. The sentence must pass the **binary/demoable test** — the full gate, the number test, worked examples, and the criterion anti-patterns live in **The success criterion** section below. This skill owns both the loop and the criterion; run the gate before anything downstream.

---

## Phase A — Profile (the minimum real contact)

Get just enough real information to plan against — and **no more**. The discipline here:

> One engineer spent 45 minutes having an agent write an elaborate plan to investigate an unfamiliar third-party API. A colleague opened a fresh session, pasted the API keys and a few endpoint paths, and said "go find me what these return." In 20 minutes they had real data to question — and got three follow-up questions answered in the time the *plan* was still being written.

The lesson, now a rule of thumb: **a timeboxed spike beats a plan to investigate.** When the unknown is "what does this system/API/schema actually do," the fastest path is to *touch it*, not to plan touching it.

Profile outputs:

- **Findings** — what the system actually does, in writing. Real identifiers, real field names, real row counts.
- **A baseline number** — mandatory if the milestone claims an improvement ("faster," "fewer calls," "more reliable"). Measure the *before* state. A milestone that couldn't prove its value to a stakeholder because nobody measured the API-call baseline first is a recurring failure. No baseline → no provable win.

Soft-gates for this phase:

- **Profiling must not become its own project.** If your profile step is sprouting tasks, a plan, and a dependency graph, stop — that's the 45-minute-plan anti-pattern. A profile is a spike: timebox it (an hour, not a day), point it at the real thing, and accept a scrappy answer you can question over a polished one you waited for.
- **Touch the code layer, not just the runtime layer.** Looking at a dashboard or running a query verifies the runtime; it does not verify the migration, the grant, the auth model. The recurring dispatch-time surprises live in `references/standing-checks.md` — skim it during Profile so you surface auth/identity, rate-limits, schema/grant ordering, and freshness/observability *now*, not at hour three of execution.

---

## Phase B — Spine (high-level, change-absorbing, not detailed)

The spine is how you hold the **whole milestone in view without planning all of it**. Name 3–6 slices, each a one-line *demoable outcome* in sequence. This is Jeff Patton's story-map backbone: the spine is the journey; each slice is a thin vertical cut through it that ships something observable.

The spine's job is to **absorb future change cheaply**. Because later slices are one-liners, not scoped tasks, reshaping them after slice 1 teaches you something costs a sentence, not a re-plan. That is the entire point — it's what makes the plan fluid.

Then **scope only slice 1**. Detailing slices 2–6 now is waste: they will be wrong by the time you reach them, because slice 1 will change your understanding. (This is also why pre-scoping a whole milestone — 27 tasks generated in 16 minutes — is a soft-gated anti-pattern: it manufactures detail that's about to be invalidated.)

### Finding the first slice — go thinner than feels right

The highest-leverage move in this whole skill: **the first slice is almost always too big on the first try.** Push for the thinnest vertical cut that still teaches you something real, end to end.

A worked receipt: the first slice was framed as "full manual sync of all 20 tables into the warehouse." On reflection that was far too large. The real first slice was **one table, one API call (projects), one slice of data landing in the warehouse** — which de-risks the auth, the schema pattern, and the sync shape for all 20 that follow, in a fraction of the work. The team only found it by *challenging itself to find a smaller slice.* So challenge it every time:

> "What's the smallest version of this that still goes end-to-end and teaches us something we can't learn by thinking?"

A good first slice is a **walking skeleton**: thin, but it touches every layer (auth → fetch → store → see it), so it proves the whole pipeline works before you widen it. Splitting patterns for when a slice is still too big — by workflow step, by data variation, simple-before-complex, defer-performance, CRUD-create-first — are in `references/agile-patterns.md`.

---

## Phase C — The slice loop (scope → dispatch → gate → re-plan)

For the current slice only:

1. **Scope** it into 1–5 tasks. Each task is verb-first, passes the new-hire test (a fresh agent can run it from the description), and carries a verifiable success criterion. Treat the slice's scope as a hypothesis — note what you expect to be true and what would change the plan. The full task-authoring discipline (grounding prompts in code, no hedges, one owner per cross-task action, the contradiction check) is in **The milestone→task hand-off** below.
2. **Dispatch** against the git posture: one daily workbranch, one worktree per task, slice-only context. (Defer to `git-workflow`; the multi-branch merge pileup in the batch-dispatch failure was a violation of it, caused by dispatching more than one slice's worth at once.)
3. **Gate** — the slice ends in a demoable output the operator validates by looking at it or running it. Merge to the workbranch; that's a known-good state.
4. **Retro** — gather feedback on *how the planning went* before you touch the next plan. This is the meta-feedback step, run after the gate and before the re-plan, while the slice is still fresh. Gather three kinds of feedback — kept separate, and **captured without solving** — then decide what gets promoted into the skills. Full question sets and the post-mortem structure are in `references/retro-feedback.md`; the short version:
   - **Informational** — what diverged from reality, stated flatly. *Not* what we should have asked or should change — naming the fix here makes you stop looking for other divergences. Just the list.
   - **Internal** — your own intuition: what felt off, was the slice the right size, where did you feel overloaded (a stop-the-line signal worth recording even if you pushed through).
   - **External** — what the system actually emitted: error codes, failed deploys, the 429, the false-red tile, the data-trust flag. Quote the real messages.

   Gather all three *before* proposing any fix (the gather/solve firewall — mixing them makes you grab the first fix and miss the rest). Run this lightweight (~3 questions) at every gate; run the full post-mortem at milestone close or after a bad slice.
5. **Re-plan** — 5 minutes. Now solutions are allowed. Turn the retro's informational divergences into the questions the *next* slice's scope will answer; reshape the spine explicitly; promote any recurring surprise into the skills (the meta-loop below). *This is where the loop earns its keep* — the plan adjusts at slice speed, not milestone speed.

Two standing rules keep the loop stable (full reasoning in `references/anti-patterns.md`):

- **Stop the line.** If neither operator can state what is currently verified-working, stop dispatching until a gate restores a known-good state. Overload is a stop condition, not a push-through condition.
- **WIP limit — one slice in flight per operator.** The constraint is operator validation attention, not agent output. Work is pulled at the pace you can validate, never pushed at the pace agents can produce.

---

## The success criterion

A milestone is the unit of demoable progress, and it has exactly one job: **be the thing whose criterion you would point at to call it done.** That criterion has to be checkable by someone who is not you in under five minutes, without judgment calls. Everything else — progress reading, appetite, tasks, demo format — is downstream of that one sentence. Get the sentence right first; the rest follows for free. Get the sentence wrong and every downstream artifact inherits the vagueness. This is why a sound process rejects "Foundation complete" or "OCR pipeline works well" no matter who wrote it: a sentence the team cannot check is a sentence the team cannot ship against.

Scoping the criterion happens **before** any task is generated, any progress reading is set, or any appetite is locked. If the criterion fails the gate below, **stop**. Do not generate tasks. Do not update the progress reading. Do not extend the appetite. Rewrite the criterion. It is a sentence, not a redesign.

### The binary/demoable test (the gate)

Apply these three questions, in order. If any answer is no, the criterion fails. Rewrite before continuing.

1. **One sentence?** If you need two, you have two milestones. Split.
2. **Binary?** A stakeholder who is not you, looking at the output in five minutes, can call it done or not-done without a judgment call. No percents. No "mostly." No "works well." If a vague word slips in, run the **number test**: replace it with a number or a proper noun. "Fast" → "under 2 s." "Real data" → "the Northwind sample database." "Users" → "the two named reviewers." "Reliable" → "passes the 50-invoice fixture set with zero failures." "Observable" / "monitored" → name the surface: "emits to the logging backend and shows a green tile on the status dashboard." A criterion that says a system is "reliable," "monitored," or "production-ready" without naming the observability surface is hiding the monitoring work — the number test drags it back into scope.
3. **Demoable?** A non-technical stakeholder can be shown the result and nod. Internal-only deliverables (a migration, a CI change, a refactor) demo by **consequence** — show the thing the change enables, not the change itself.

If you cannot point at the output and call it done in five minutes, the criterion has failed. Stop, rewrite, retest.

### Invariants you do not get to negotiate

These are enforced by the methodology (and, where a tracking tool is involved, by the tooling). Working around them produces the failures the methodology is specifically designed to prevent.

- **2–5 milestones per project.** Fewer than 2 is just the project. More than 5 means some are tasks (route them as tasks under the appropriate milestone, not as milestones themselves). If a teammate asks for "9 milestones, fast," produce 3–5 with binary criteria and list the rest as candidate task-grain work under the relevant milestone. **Do not produce both versions.** The non-compliant version becomes a live option once it is written down; that is the loss.
- **One milestone in flight per project.** When you flip the next milestone to in-flight, the previous one is already done. Every roll-up view ("where are we?") anchors on the current milestone — two in-flight forces every view to guess.
- **Progress reading uses discrete anchors, not a continuous slider.** Use a small set of named anchors (e.g. early / mid / "I can see all the remaining work" / late / nearly-done) rather than a free-floating percentage. The "I can see all the remaining work" anchor specifically means exactly that. A milestone stuck at the same anchor for three reviews is the dashboard working correctly — it is telling you the milestone is stuck. Moving the dot does not unstick the milestone; it falsifies the most-trusted signal in the review ritual.
- **Appetite is a time budget, not an estimate.** If the criterion overruns the appetite, reshape or drop — do not extend silently.

### Worked examples — good vs. bad

| Bad criterion | Good rewrite | Why the bad fails |
|---|---|---|
| "OCR pipeline works well." | "On the 50-invoice fixture set, line-item extraction reaches ≥95% field-level accuracy and one previously-unseen invoice demos end-to-end in <8 seconds." | "Works well" is unbounded; no fixture, no threshold, no demo path. |
| "Foundation complete." | "Click 'Generate Report' produces a real PDF end-to-end for one real project (Northwind). No reviewer step, no scheduler, no notifications. Just click → wait → PDF." | "Complete" is a judgment call. No observable demo. |
| "Field app syncs offline edits." | "A user edits 3 records offline in the mobile app, returns to network, and sees all 3 reflected in the web app within 30 seconds with no merge conflicts on the demo dataset." | No count, no time bound, no conflict semantics. |
| "Show cloud costs in dashboard." | "A single page loads in <2 s and displays current-month cloud spend by resource group with last-30-day trend lines, refreshed every 6 hours from the billing export." | No latency, no breakdown, no freshness — the three things a stakeholder asks at demo. |
| "Secure the API." | "Every API endpoint rejects requests without a valid auth token with a 401 in CI integration tests; demo shows one rejected call and one accepted call against staging." | "Secure" is unbounded; no observable test path. |

### The milestone→task hand-off

When the milestone flips to in-flight, generate the tasks. When the criterion passes:

- Tasks are verb-first ("Wire up PDF generation service," not "PDF generation service").
- Each task passes the new-hire test (a fresh agent can execute from the description alone).
- Each task is bounded by **executor context**, not time. (Resist a blanket "≤2 days" rule — bound by what fits in one execution context instead.)
- Each task declares which milestone and project it belongs to so it rolls up correctly.
- Do not pre-plan tasks for later milestones — they will be wrong by the time you get there.
- **Ground task prompts in the code, not just the docs.** Before writing any task prompt that contains SQL DDL, a shell/CLI command, or a deploy-ordering instruction, open the precedent file *and* the target file. Quote real identifiers and line numbers. Inspecting the live system (a dashboard, a schema browser) verifies the *runtime* layer but not the *code* layer; both have to be checked, and precedent copied from the wrong context is how an ordering bug enters a prompt that the dependency graph says is correct.
- **No hedges survive to the queue.** A parenthetical hedge in a prompt or criterion — "(or X)", "if … later", "likely …", "one per entity-or-entity-project" — means the author is guessing. Either verify the fact now or convert the guess into an explicit verification step owned by exactly one task. A hedge is a defect marker, not acceptable tolerance.
- **One owner per cross-task action.** When an action (an identity binding, a migration deployed later than it is authored, a deferred grant) spans two tasks, name one task as its sole owner in the prompt; the other task explicitly states the action is "not done here." Never let two tasks both gesture at it.

**Run a contradiction check before the queue is persisted.** For each task, confirm the prompt does not require an ordering or precondition that the `depends_on` graph forbids. Any "deploy this before X" where X is an upstream dependency is an automatic fail — fix the prompt or the graph before any task is added. This check is what catches a defect that a sizing-and-coverage review misses: the dependency graph can be correct while the prompts contradict it.

**Hard rule:** if the milestone's criterion fails the gate above, you do not generate tasks. The task-level new-hire test is downstream of the milestone's binary/demoable test — a vague criterion produces vague tasks. The point of writing a binary criterion first is so the task output is binary too. Skipping this gate is the most common silent failure in planning.

### Criterion anti-patterns — what you might tell yourself

These are the rationalizations agents and operators use when they slip. Each one means **stop and rewrite the criterion** before doing anything else.

| You are thinking… | Reality |
|---|---|
| "The criterion is not binary, but the deadline is real — I'll generate the tasks and add a side task to fix the criterion." | A non-binary criterion is a *milestone* problem, not a *task* problem. Generating tasks from a vibe does not move the deadline closer; it guarantees a demo argument. Rewrite the sentence first. It takes 60 seconds. Putting the rewrite in the task queue defers the cost; it does not pay it. |
| "They asked for 9 milestones — I'll give them both 9 and 5 and let them choose." | The 9-version is the loss. Once it is written down, it is a live option, easier to defend than to drop. Decline to produce it. Produce 3–5 with binary criteria; list the rest as candidate task-grain work under the appropriate milestone. |
| "A senior teammate already wrote it. I should not rewrite their criterion." | Proposing a rewrite is not overruling; it is doing your job. The criterion is the contract; the contract has to be checkable. Offer the rewrite and ask the author to confirm — that is a 60-second message, not a redesign. |
| "The milestone has been at the same reading for three weeks — just move it forward so the dashboard moves." | The reading is not a progress bar; it is a confidence signal. A stuck reading is the dashboard telling you the milestone is stuck. The fix is to walk the success criterion: is it actually binary? Can you enumerate the remaining tasks? If yes, you have genuinely progressed. If not, you have not — and the honest signal is what the team needs. |
| "I'll mitigate the vague criterion with an operator task to lock it before demo." | The criterion is a precondition for everything downstream — task generation, progress reading, demo, status update. It is not a task. Operator tasks track work; this is an unmet precondition. |
| "Eight milestones is fine, they're small ones." | Smallness is the signal that some are tasks. Roll them up under 2–5 real milestones; the small ones become task-grain work generated at the right moment. |
| "Horizontal slice as milestone: 'DB schema done.'" | Not demoable to a non-technical stakeholder. Roll it into a vertical slice that ends in an observable behavior — the schema plus the read path plus the screen that uses it. |
| "Spike-as-milestone: 'Investigate X.'" | Use other splitting patterns before resorting to a spike. If a spike is genuinely needed, scope it to a one-sentence demoable outcome ("we have a written recommendation with cost and risk, signed off by the lead"). |
| "The dependency graph is right, so the ordering is fine — I'll let the executor read the precedent file." | The graph being right does not make the prompts right. A prompt that says "deploy before X" while X is its own upstream dependency contradicts the graph regardless. Open the precedent and target files at scoping time and run the contradiction check before persisting. A real defect — a `CREATE USER ... FROM EXTERNAL PROVIDER` migration ordered before the task that creates the identity — survived three revisions because the planner verified the dashboard but never opened the migration script. |
| "Monitoring is obviously needed, the executor will add it." | "Obviously needed" is exactly the work that goes missing. If the criterion implies a system is reliable or production-ready, the observability surface (logging wiring, the dashboard tile, the health-check) is part of the milestone — name it in the criterion via the number test, and scope explicit tasks for it. A real milestone had to add data-trust integration and a monitoring extension as explicit tasks in a later revision because the first pass left them implicit. |

### Outside a tracking tool

The binary/demoable test is identical for Jira epics, Notion plans, customer-facing roadmaps, and Markdown briefs. The shape changes (no progress-reading enum, no milestone-order integer, no anchor invariant) but the criterion-writing discipline does not. Apply the gate universally, including the number test. The 2–5-per-project invariant translates: if a Jira epic has nine "sub-epics," some of them are stories — collapse.

### Worked end-to-end example (the gate in action)

A teammate says: *"OK, sketching the PM Report Tool. First milestone is 'Foundation' — Foundation is done when the basics are in place."*

Walk the three questions:

- **One sentence?** "The basics are in place" is one sentence. ✓
- **Binary?** "Basics in place" is a judgment call; "in place" could mean "code compiles" or "PMs use it weekly." Fails.
- **Demoable?** "Basics" is not something a stakeholder can be shown. Fails.

Propose a rewrite: *"Click 'Generate Report' produces a real PDF end-to-end for one real project (Northwind). No reviewer step, no scheduler, no notifications. Just click → wait → PDF."*

Re-walk:
- One sentence. ✓
- Binary. (The PDF appears or it doesn't.) ✓
- Demoable. (Show the PDF on the stakeholder's screen.) ✓

Confirm with the teammate. **Do not generate tasks yet** — that happens when the milestone flips `pending` → `in_flight`. Leave the progress reading unset (pending milestones do not have one). Appetite lives on the project, not the milestone.

If the teammate pushes back on the rewrite ("we don't know which project yet"), the criterion you rewrite reflects that: *"Click 'Generate Report' produces a real PDF end-to-end for one operator-selected real project. Project selection is locked one working day before the milestone closes."* The rewrite stays binary and demoable; the openness is encoded as a one-day lead time, not a vague word.

---

## Soft-gating: how to push back without blocking

This skill *soft-gates* anti-patterns — it names them, explains the cost, offers the smaller path, and lets the user override with a stated reason. It never hard-blocks; the user owns the call. The tone is a teammate flagging a risk, not a linter throwing an error. Pattern:

> "Heads up — scoping all six slices now is the milestone-sized batch pattern; last time that made the plan impossible to adjust when the webhook issue surfaced. I'd scope just slice 1 and leave the rest as spine one-liners. Want me to do that, or is there a reason to scope it all now?"

When you catch yourself or the user reaching for one of these, surface it:

| Anti-pattern | The tell | The smaller path |
|---|---|---|
| Milestone-sized batch | Scoping/dispatching the whole milestone at once | Spine + scope slice 1 only |
| No baseline | Optimizing without measuring the before-state | One profiling task that outputs a number |
| Slice too large | First slice touches many tables/views/screens | Challenge for the thinnest end-to-end cut |
| Profiling-as-project | The investigation grows a plan and a task graph | Timeboxed spike, point it at the real thing |
| Overplanning | >5 turns and still no contact with the system | Ship the spine, start slice 1, learn |
| Decision-not-a-task | "We'll figure out X when we get there" | Make X a decision task now, with a binary/demoable outcome (run the criterion gate on it) |

---

## The meta-loop — feed lessons back into the skills

This skill is meant to **improve as you use it**. The reason a later milestone repeated an earlier one's pattern is that lessons learned at dispatch never made it back into the planning ritual — a rule in a file is passive until something forces it into use. So close the loop:

The mechanism is the **Retro sub-step** in Phase C (`references/retro-feedback.md`): after the gate, you gather informational / internal / external feedback, and at milestone close you run the full post-mortem on the whole milestone.

What gets promoted, and where:

- **A divergence that recurred across two or more slices** -> a new soft-gate row or standing check. Recurring dispatch-time surprises go to `references/standing-checks.md`; planning-shape failures go to the anti-pattern table above and `references/anti-patterns.md`.
- **A receipt worth keeping** (a real incident with a real cost) -> `references/anti-patterns.md`, written the way the existing receipts are: what happened, what it cost, the rule it taught.
- **A lesson that belongs to a sibling skill** (a git posture violation, a naming miss) -> flag it to the owning skill (`git-workflow`, `naming-conventions`) rather than duplicating the rule here. A success-criterion miss belongs to *this* skill now — promote it into the criterion anti-pattern table above.

Promotion is a content change to this plugin — per the repo's lockstep rules it ships with a version bump and changelog entries in the same commit. If you can't ship the skill edit now, file a tracked task so the lesson isn't lost. A lesson that lives only in a chat transcript is the failure mode this section exists to prevent.

## Boundaries with sibling skills

- **The success criterion lives here.** The binary/demoable gate, the number test, the invariants, and the task hand-off discipline are owned by this skill.
- **`git-workflow`** owns the dispatch posture (workbranches, worktrees, gates). Phase C step 2 defers to it entirely.
- **`critical-thinking`** and **`logical-reasoning`** own structured decision-making and argument-testing when a clarify-phase question turns into a genuine decision or a claim that needs scrutiny. Hand off to them rather than reinventing the framework here.
- **`critical-thinking`** (its Strategic / Adversarial framework) also owns the higher-altitude "should we do this at all / what's the sequencing across projects" framing that sits above a single milestone.

## Reference index

- `references/anti-patterns.md` -- the receipts: the milestone-sized batch, the 50->107 task inflation, the 27-tasks-in-16-minutes pre-scope, and the rules they taught
- `references/agile-patterns.md` -- slice-splitting patterns (by workflow step, by data variation, simple-before-complex, defer-performance, CRUD-create-first), Definition-of-Ready as a conversation, the story-map spine
- `references/retro-feedback.md` -- full question sets for the three feedback kinds, the gather/solve firewall, and the milestone post-mortem structure
- `references/standing-checks.md` -- the recurring dispatch-time surprises to surface during Profile: auth/identity, rate limits, schema/grant ordering, freshness/observability
