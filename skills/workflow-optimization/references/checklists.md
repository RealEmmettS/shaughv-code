# Detection Checklists

Concrete, scannable checklists for the Sweep (Step 4). Where the theory reference
files explain *why* each lens matters, this file gives the fast *what-to-look-for*
lists. Run the relevant checklist while applying each lens, and again as a final
catch-all before Converge.

Each checklist item is a yes/no probe. A "yes" is a candidate finding — record it
in the Lens Ledger.

---

## Checklist A — The 8 Wastes (Lean lens)

Mnemonic: **DOWNTIME**.

- [ ] **D**efects — work that has to be redone, corrected, or scrapped. Errors,
      rework loops, failed hand-offs.
- [ ] **O**verproduction — producing more, sooner, or faster than the next step
      or the customer needs.
- [ ] **W**aiting — idle time: work sitting in a queue, people waiting on
      approvals, information, or a prior step.
- [ ] **N**on-utilized talent — people's skills, ideas, or judgment left unused;
      experts doing work a novice could do.
- [ ] **T**ransportation — unnecessary movement of materials, files, documents,
      or data between locations or systems.
- [ ] **I**nventory — work-in-progress piling up: backlogs, unprocessed requests,
      half-finished items, stockpiles.
- [ ] **M**otion — unnecessary movement *within* a step: switching tools,
      hunting for information, excess clicks, context-switching.
- [ ] **E**xtra-processing — doing more than the customer requires: gold-plating,
      duplicate data entry, redundant checks, reports nobody reads.

## Checklist B — Bottleneck & Constraint Detection (Theory of Constraints lens)

- [ ] Where does work visibly *pile up* — the step with the longest queue in
      front of it?
- [ ] Which step has the least spare capacity relative to demand?
- [ ] Which step, if it stopped, would halt the whole workflow fastest?
- [ ] Is the constraint a piece of **equipment**, a **person/skill**, or a
      **policy** (written or unwritten rule)?
- [ ] Is the constraint **internal** (the workflow can't keep up with demand) or
      **external** (the workflow can do more than demand requires)?
- [ ] Is the current constraint being fully *exploited* — never starved, never
      idle, never working on the wrong thing?
- [ ] Has a past constraint been "broken" but the workflow still behaves as if it
      were the limit (constraint inertia)?

## Checklist C — Variation & Defects (Six Sigma lens)

- [ ] Does the workflow produce different results depending on *who* runs it?
- [ ] Does it vary by shift, day, season, or volume?
- [ ] What is the defect/error rate — and is it actually measured?
- [ ] Are there steps with no documented standard, so each person improvises?
- [ ] For each recurring defect: has the **root cause** been found (5 Whys,
      fishbone), or only the symptom treated?
- [ ] Are the Critical-To-Quality characteristics defined — do we know what
      "defect-free" even means here?
- [ ] Is there a control mechanism that catches deviations *before* they become
      defects?

## Checklist D — Non-Value-Added Work & Fragmentation (BPR lens)

- [ ] For each step: would the customer be willing to pay for it / miss it if it
      vanished?
- [ ] How many **hand-offs** between people, teams, or systems does the workflow
      contain? Each is a risk and a delay.
- [ ] Is the process fragmented across functional silos with no single owner of
      the end-to-end outcome?
- [ ] Are there steps that exist only because of an old constraint that no longer
      applies?
- [ ] Is data re-entered, re-keyed, or copied between systems?
- [ ] Are there approval or review steps that add control but not value?
- [ ] Is this workflow fundamentally outmoded — would a clean-sheet redesign beat
      any amount of incremental tuning?

## Checklist E — Quality System & Culture (TQM lens)

- [ ] Is quality everyone's responsibility, or quarantined to an
      inspection/QA step at the end?
- [ ] Is there a feedback loop from the customer back into the workflow?
- [ ] Does the workflow have a built-in continuous-improvement cadence (PDCA)?
- [ ] Are the people doing the work empowered to flag and fix problems?
- [ ] Is improvement driven by management commitment, or left to chance?
- [ ] Are problems analyzed systematically, or worked around individually?

## Checklist F — Parameters & Control (Process Optimization lens)

- [ ] **Equipment/tools:** are the tools and systems used to their full
      capability, or is capacity wasted?
- [ ] **Procedures:** do operating procedures vary widely person to person? Could
      they be standardized or automated?
- [ ] **Control:** are there feedback/control points that catch drift, or does
      the workflow run open-loop until something breaks?
- [ ] What are the *adjustable parameters* (batch sizes, timings, thresholds,
      routing rules) — and are they set well?
- [ ] Is there event-log or telemetry data that could be process-mined to find
      the real critical path?
- [ ] Could predictive analysis flag bottlenecks *before* they occur rather than
      after?

## Checklist G — Cross-cutting catch-all (run before Converge)

- [ ] Have all six lens checklists (A–F) been completed?
- [ ] Have the ten core principles each been checked?
- [ ] Is every finding recorded in the Lens Ledger?
- [ ] For each finding, do we know roughly its **impact** and the **effort** to
      fix it? (needed for the shortlist ranking)
- [ ] Has anything been found that doesn't fit any lens — a finding worth
      recording as "cross-cutting"?
- [ ] If the workflow is being *designed new*: have we checked that the design
      doesn't bake in any of the wastes/constraints above from day one?

---

## Using the checklists

The checklists are detection aids, not the analysis itself. A "yes" answer is a
*candidate* finding — confirm it against the real workflow (and with the user
where domain knowledge is needed) before recording it. The goal is not to fill the
ledger with checkboxes; it is to make sure no category of problem went unexamined.
