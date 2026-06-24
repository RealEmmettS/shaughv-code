# Lean / Toyota Production System

**Lens question this theory answers:** *Where is this workflow wasting effort,
time, or resources on things the customer does not value?*

---

## Origin and core philosophy

Lean grew out of the Toyota Production System (TPS), developed at Toyota in the
post-war 1950s–60s by Taiichi Ohno and Shigeo Shingo, building on W. Edwards
Deming's quality teachings. The term "Lean" was coined by John Krafcik in 1988 and
defined by James Womack and Daniel Jones in *Lean Thinking* (1996).

The core philosophy: **do more and more with less and less** — less effort, less
equipment, less time, less space — while moving closer and closer to giving the
customer exactly what they want. Lean does this by relentlessly identifying and
eliminating **waste** (Japanese: *muda*) — any activity that consumes resources
but creates no value for the customer.

A foundational Lean insight: when you make work *flow* smoothly, quality problems
and waste that were previously hidden become visible. You don't hunt waste
directly so much as create the conditions (flow, pull) under which it exposes
itself.

## The five Lean principles (Womack & Jones)

Apply these in order; they form a cycle.

1. **Value** — Specify value precisely, from the *customer's* point of view, for
   each specific product or service. Value is only what the customer would pay
   for or wait for.
2. **Value Stream** — Identify the entire value stream for that product: every
   step currently required to deliver it. Expect that the large majority of steps
   (Womack/Jones say roughly nine out of ten) add no value and can be challenged.
3. **Flow** — Make the value-adding steps flow continuously, without interruption,
   queues, or batching.
4. **Pull** — Let the customer (and each downstream step) *pull* value from the
   step before it, rather than the workflow *pushing* output forward on a
   schedule. Produce only what is needed, when it is needed.
5. **Perfection** — Pursue perfection: repeat the cycle so the number of steps,
   the time, and the effort needed to serve the customer continually fall.

## The 8 wastes (the primary detection lens)

The original "seven wastes" were formulated by Shigeo Shingo. An eighth — unused
human talent — was added later. Use the **DOWNTIME** mnemonic. (Full scannable
list in `checklists.md`, Checklist A.)

- **Defects** — work redone, corrected, or scrapped.
- **Overproduction** — making more, sooner, or faster than needed. Considered the
  worst waste, because it generates the others.
- **Waiting** — idle time; work sitting in queues; people waiting on inputs or
  approvals.
- **Non-utilized talent** — people's skills, ideas, and judgment left unused.
- **Transportation** — unnecessary movement of materials, documents, or data.
- **Inventory** — work-in-progress piling up; backlogs of unprocessed items.
- **Motion** — unnecessary movement *within* a step (tool-switching, searching,
  excess clicks).
- **Extra-processing** — doing more than the customer needs (duplicate entry,
  redundant checks, gold-plating, unread reports).

## Signature tools

- **Value-Stream Mapping (VSM)** — a diagram of every step in the value stream,
  separating value-adding from non-value-adding time. Often the first thing a
  Lean effort produces. (See `diagramming.md`.)
- **5S** — workplace organization: Sort, Set in order, Shine, Standardize,
  Sustain. Creates the visual order that makes abnormalities obvious.
- **Kaizen** — continuous, incremental improvement, often via small focused
  improvement events involving the people who do the work.
- **Kanban** — a pull-signal system: downstream demand signals upstream
  replenishment, preventing overproduction.
- **Takt time** — the rate at which work must be completed to match customer
  demand; used to pace flow.
- **Just-in-Time (JIT)** — produce/deliver only what is needed, exactly when
  needed, eliminating inventory waste.
- **Poka-yoke** — mistake-proofing: designing steps so errors are impossible or
  immediately obvious.
- **Standard work** — the current best-known method for a step, documented so
  everyone performs it the same way (also reduces variation — see Six Sigma).

## How Lean identifies and prioritizes improvement

- **Identify:** Walk the value stream and tag every step as value-adding or one of
  the eight wastes. The wastes *are* the improvement opportunities.
- **Prioritize:** Eliminate before you improve; improve before you automate.
  Overproduction is treated as the highest-priority waste because it spawns the
  others. Womack/Jones note that VSM and 5S are the most common first steps.
- Improvement is incremental and continuous (kaizen) — many small fixes along the
  stream, not one big bang.

## Applying the Lean lens in the Sweep

For the workflow under review, ask:

1. From the customer's view, what is the *value* this workflow delivers? Which
   steps actually contribute to it?
2. Walk every step — which of the eight wastes is present? (Run Checklist A.)
3. Does work *flow*, or does it stop, queue, and batch? Where?
4. Is the workflow *pull* (driven by real downstream demand) or *push* (driven by
   a schedule or target)? Push usually means overproduction.
5. What could be eliminated entirely — not sped up, eliminated?
6. Are the people doing the work involved in spotting and fixing these wastes?

Record every waste found in the Lens Ledger. Note: Lean overlaps with TQM and BPR
on "waste" / "non-value-added work" — that overlap is expected; each lens framing
catches slightly different instances.

## Watch-outs

- Lean can over-focus on cutting, which risks removing slack and resilience that
  the workflow genuinely needs (a lesson from just-in-time supply-chain failures).
  Flag waste, but distinguish true waste from necessary buffering.
- Lean has no single standard recipe — it is as much a culture as a toolkit. Don't
  present Lean tools as a rigid checklist of mandatory changes.
