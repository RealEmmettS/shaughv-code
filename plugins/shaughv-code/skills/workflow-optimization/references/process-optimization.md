# Process Optimization

**Lens question this theory answers:** *Are the adjustable parameters and controls
of this workflow tuned for the best possible performance?*

---

## Origin and core philosophy

Process optimization is the discipline of **adjusting a process to make the best
or most effective use of a specified set of parameters, without violating any
constraint.** It is one of the major quantitative tools of industrial
decision-making, with roots in operations research and mathematical optimization
(linear programming, scheduling theory).

Where the other five lenses are *management philosophies*, process optimization is
more *engineering and analytical*. Common goals: minimize cost, maximize
throughput, maximize efficiency — while keeping every other specification within
its constraints. You maximize one or more targets while holding the rest inside
their limits.

The modern, software-driven version of this lens is **process mining**: using a
tool to reconstruct the *actual* process from event-log data, discover the
critical activities and bottlenecks, and act only on them.

## The three optimization levers

Process optimization adjusts three things to affect performance:

1. **Equipment / tools** — First verify the existing equipment (or, for an
   information workflow, the existing tools and systems) is used to its fullest.
   Examine operating data to find where equipment or tooling is the bottleneck.
2. **Operating procedures** — Procedures vary widely from person to person and
   shift to shift. This inconsistency degrades performance. Standardization and
   automation help — but automation is useless if operators override it and run
   things manually anyway.
3. **Control** — A process runs below optimum if its control loops are poorly
   designed or tuned. In a complex process there are many control points; each
   should catch deviation and correct it. (Industrially, over a third of control
   loops are documented to have problems.) Continuously monitoring and tuning the
   whole system is sometimes called *performance supervision*.

## The modern toolkit

- **Process mining** — discover the *real* process (not the assumed one) from
  event logs; surface the true critical path and bottlenecks.
- **Process simulation** — model the workflow and test changes before making them.
- **Predictive analytics** — forecast process completion times and *anticipate
  bottlenecks before they occur*, rather than reacting after the fact. (Predictive
  approaches have been shown to cut process cycle times meaningfully by preventing
  bottlenecks pre-emptively.)
- **Telemetry / instrumentation** — capturing detailed data on every workflow
  execution, which is the raw material every other technique above needs.
- **Automation / RPA** — automating structured, repetitive, rule-based steps so
  human effort goes to judgment-heavy work.

## How Process Optimization identifies and prioritizes improvement

- **Identify:** Examine operating data. Find equipment/tool bottlenecks, procedural
  inconsistency, and untuned or missing control loops. Use process mining to
  locate the real critical activities. (Checklist F.)
- **Prioritize:** The discipline says explicitly — *discover the critical
  activities and bottlenecks, and act only on them.* Effort goes to the parameters
  and control points that actually move the target metric, not to everything.

## Applying the Process Optimization lens in the Sweep

For the workflow under review, ask (run Checklist F alongside):

1. **Equipment/tools** — are the tools and systems used to full capability, or is
   capacity idle or misapplied? Is a tool the bottleneck?
2. **Procedures** — do operating procedures vary widely person to person? Could
   they be standardized or automated? Where might people be overriding automation?
3. **Control** — are there feedback/control points that catch drift early, or does
   the workflow run open-loop until something breaks?
4. **Parameters** — what are the *adjustable* parameters of this workflow — batch
   sizes, timings, thresholds, routing rules, sequencing? Are they set well?
5. **Data** — is there event-log or telemetry data that could be process-mined to
   find the real critical path? If not, is instrumentation itself the first
   recommendation?
6. **Prediction** — could the workflow's bottlenecks be predicted and prevented
   before they occur, rather than discovered after?

Record parameter/control findings in the Lens Ledger.

## Relationship to the other lenses

Process Optimization overlaps with TOC on "bottlenecks" — but its framing is
different and worth a separate pass. TOC treats the bottleneck as *the* focusing
mechanism for managing the whole system; Process Optimization treats it as one of
several *parameters* to be measured and tuned with quantitative tools. TOC asks
"what is the constraint and is everything subordinated to it?"; Process
Optimization asks "are the knobs set right, and do we have the data and control
loops to keep them set right?" Run both — they catch different things.

This is also the lens where **AI and modern tooling** are most relevant: process
mining, predictive bottleneck detection, simulation, and automation all live here.
When the workflow could benefit from these, this is the lens that surfaces it.
