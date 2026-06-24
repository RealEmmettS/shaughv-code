# The receipts — anti-patterns this skill exists to prevent

These are the named planning failures this skill is built to catch. They are the evidence behind every soft-gate in the skill. Cite them by name when pushing back — "this is the milestone-sized batch pattern" carries more weight than an abstract warning, because it points at a concrete failure shape with a concrete cost.

Each entry: **signature** (how to spot it), **what it cost**, **recovery** (mid-flight), **prevention** (the planning move that would have caught it).

---

## 1. Milestone-sized dispatch batch

**Signature.** The milestone is planned soundly, then the *entire* task queue is prepared and dispatched into execution at once — often with a full-milestone "dry run" or pre-generation of all files first. Multiple worktrees/workbranches accumulate in parallel.

**What it cost.** Three days in — a full planning day, a full dry-run day, then executing the whole milestone's changes at once — and neither operator could say whether it worked, worked better than before, or anything. Both stopped early from cognitive overload. The webhook/queue blocker surfaced ~5 slices of work later than a sliced dispatch would have shown it ("found it five times slower"). An agent ended up merging multiple workbranches in dependency order, running SQL between merges — a git anti-pattern that only existed because the batch exceeded one daily workbranch. And no API-call baseline was taken, so the optimization's value was unprovable to the stakeholder.

**Root cause.** The planning method governed *planning* batch size but was silent on *execution* batch size. The system constraint is operator validation attention; a milestone-sized batch floods it until it collapses. (Lean: max batch size delays feedback and lets defects travel. Theory of Constraints: the constraint was flooded.)

**Recovery (mid-flight).** Pull the operator stop-the-line — stop dispatching. Find the last cleanly-merged workbranch (known-good). Carve the *remaining* work into slices, gate the first to demoable-and-validated, resume from there. Don't debug the whole pile at once; restoring known-good and re-entering the slice loop is faster.

**Prevention.** The whole Profile → Spine → Slice loop. Profile first (with a baseline number), spine of 3–6 named slices, scope one slice at a time, gate each on operator-validated demoable output, WIP limit of one slice in flight, no milestone-wide dry runs.

---

## 2. Milestone inflation

**Signature.** A milestone keeps growing. Tasks are added faster than they close; the success criterion quietly shifts; the milestone never reaches a clean "done." A burndown looks flat-ish; a burnup would show the scope line climbing.

**What it cost.** One milestone went from a 50-task first-pass to 107 tasks across multiple weeks, with 9 cancellations and a backlog of review-stage tasks aging 7+ days. Half the eventual tasks didn't exist when the milestone started. Some of that was *healthy* discovery (a wave of work added after an audit, another after a review — those were good waves). The unhealthy part was the absence of a fixed demoable end-state: without a one-sentence criterion locked at the start, "done" kept moving.

**Root cause.** Two things: (a) no binary, demoable success criterion locked up front (Phase 0 omitted), so scope had nothing to push against; (b) the spine wasn't treated as a thing to *re-examine* when it grew — new work was absorbed silently instead of triggering an explicit "does the spine still hold?" check.

**Recovery (mid-flight).** Lock the demoable end-state now (run the success-criterion gate in SKILL.md for the sentence). Everything not on the path to that sentence becomes next-milestone seed, explicitly cancelled-with-a-note, not carried as silent WIP. A clean cancellation with a one-line "why" keeps the backlog honest.

**Prevention.** Phase 0's demoable end-state, plus the re-plan step treating scope growth as a signal to re-examine the spine (burnup thinking), not just to work harder. Note the nuance: *adding tasks from discovery is fine; letting the finish line move is not.* The spine can gain detail; the end-state shouldn't drift.

---

## 3. Slice too large

**Signature.** The proposed first slice touches many tables, views, or screens at once. It "feels like the smallest reasonable start" but actually bundles several risks together, so when it breaks you can't tell which risk bit you.

**What it cost (or nearly did).** A first slice was scoped as "full manual sync of all 20 tables into the warehouse." On reflection, far too large — it bundled auth, schema design, and sync shape for 20 entities into one undifferentiated chunk. The thinner slice — **one table, one API call (projects), one slice of data landing in the warehouse** — de-risks auth, the schema pattern, and the sync shape for *all* 20 that follow, at a fraction of the work and with a clean signal if something fails. The team only found the smaller slice by *explicitly challenging itself to find one.*

**Root cause.** First-slice scope defaults to "the first whole feature" instead of "the thinnest end-to-end cut." The smaller slice isn't obvious; it has to be hunted.

**Recovery / prevention.** Every spine, ask out loud: *"What's the smallest version that still goes end-to-end and teaches us something we can't learn by thinking?"* Then apply a SPIDR split (see `agile-patterns.md`) — usually data-variation (one tenant/table) or workflow-step. The walking-skeleton test: does the slice touch every layer (auth → fetch → store → see it) while staying thin? If yes, it's a good first slice even if it does almost nothing useful yet.

---

## 4. Profiling-as-project

**Signature.** The information-gathering step grows its own plan, its own task graph, its own dependencies. You're planning how to investigate instead of investigating.

**What it cost.** One engineer spent ~45 minutes having an agent write an elaborate plan to investigate an unfamiliar API — and it hadn't started running when, in a parallel session, a colleague pasted the API keys and a few endpoint paths, said "go find me what these return," and had real data in ~20 minutes. The plan-first path was strictly slower *and* produced nothing to question yet; the spike path produced data that generated three more good questions in the same window.

**Root cause.** Treating an unknown as something to *plan around* rather than *touch*. You can't write an accurate plan to investigate a thing you don't yet understand — the plan is built on the very unknowns it's meant to resolve.

**Recovery / prevention.** Phase A's rule: a profile is a **spike**, not a project. Timebox it (an hour, not a day), point it at the real system with real credentials, accept a scrappy answer you can interrogate over a polished plan you waited on. If the profile step starts sprouting tasks and dependencies, that *is* the anti-pattern — collapse it back to "go look at the real thing."

---

## The two structural failures underneath all four

1. **Loop latency.** The disease across the batch-dispatch failure especially: the plan couldn't adjust to reality fast enough because reality was only contacted at the very end. Batch size is the biggest driver of loop length, but even right-sized slices need a fast plan↔reality loop, because the slice scope is itself a hypothesis. *Shorten the loop* is the cure; everything else is a tactic in service of it.

2. **No feedback path into the method.** A later milestone repeated an earlier milestone's exact pattern three days after the fix was written down, because a rule in a skill file is passive — it waits to be read, and an eager planning session beats a passive rule. The meta-loop (promote recurring surprises into the skills as a named retro step) is the structural fix. Without it, every milestone re-learns the same lessons.
