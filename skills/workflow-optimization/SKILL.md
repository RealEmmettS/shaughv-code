---
name: workflow-optimization
description: >-
  Guided, turn-based facilitation for documenting, analyzing, and improving any workflow or
  process. Reads the workflow thoroughly, asks focused clarifying questions, renders it as a
  diagram, then runs an exhaustive multi-lens review drawn from six workflow-improvement
  theories (Lean, Six Sigma, Theory of Constraints, TQM, BPR, Process Optimization), ending in a
  ranked shortlist of improvements. Use whenever the user wants to optimize, streamline,
  improve, redesign, audit, map, or document a workflow or process; whenever they say a process
  is slow, broken, inefficient, has bottlenecks, or needs fixing; or whenever they design a new
  workflow from scratch. Trigger even when the user does not say "workflow" — any request to
  improve how a repeatable sequence of work gets done qualifies. (For Agile/Scrum methodology
  and team-process questions prefer agile; this skill maps and audits one concrete process end-
  to-end.)
---

# Workflow Optimization

## What this skill is for

This skill turns a workflow — any repeatable sequence of work, in any domain —
into three things: a clear **diagram**, an exhaustive **lens sweep** that examines
the workflow through every major improvement theory, and a neutrally-ranked
**shortlist** of concrete improvement opportunities.

The whole reason this skill exists is **completeness**. A person doing a manual
review almost always misses an angle — they spot the obvious bottleneck and stop,
or they apply the one framework they happen to know. This skill guarantees that a
workflow is examined through *every* available improvement lens before any
conclusion is drawn. "Did we miss a perspective?" must always be answerable with
"no."

This skill is **facilitative and turn-based**. It is not a paste-in, get-a-report
tool. It works *with* the user across multiple turns, because the user holds the
domain knowledge (how the work actually happens) and the skill holds the
methodology (how to interrogate it). The best results come from that exchange.

## The Prime Directive: read first, produce later

The single most common failure mode is producing a diagram or an analysis before
genuinely understanding the workflow. **Do not do that.** The highest-value
corrective feedback comes early, and it only comes if the skill has actually
*read and absorbed* what it was given.

So the procedure front-loads understanding: read everything thoroughly, gut-check
it, ask focused clarifying questions, and only *then* produce a first draft. The
diagram is an **output of an informed first draft**, never the opening move.

## The procedure — five steps

Work these steps in order. Steps 1–2 are about understanding; steps 3–5 are about
producing. Maintain the **Lens Ledger** (spec below) from Step 3 onward — it is the
visible proof that no lens was skipped.

At every step, consult `references/meta-workflow-checklist.md` — it lists exactly
what to verify before leaving each step. Treat it as a pre-flight checklist.

### Step 1 — Read & Gut-Check

Thoroughly ingest everything the user has provided: files, links, pasted text, and
their description of the workflow. Do not skim. If files are attached, read them.
If a process is described in prose, map its steps in your head.

Then gut-check what you read. Ask yourself:
- What is the workflow's actual *goal* — the output it exists to produce?
- What lifecycle stage is this? (a) **Designing** a new workflow from scratch,
  (b) **Optimizing** an existing one, or (c) **Auditing / reflecting** on a
  running system. The stage colors how you ask questions but does **not** change
  the sweep — every lens still runs.
- Where is the information ambiguous, incomplete, or self-contradictory?
- What would you need to know to draw this workflow accurately?

Produce a short reflection back to the user: what you understood, and what's
unclear. Do not produce a diagram yet.

### Step 2 — Clarify

Ask the user a **focused, minimal** round of clarifying questions, aimed squarely
at the ambiguities surfaced in Step 1. The goal is maximum ambiguity reduction,
fast. Do not ask questions whose answers you can reasonably infer. Do not ask more
than is genuinely needed — a tight round of high-value questions beats a long
survey. Batch related questions together.

Good clarifying questions target: the true start and end of the workflow, who does
each step, what triggers the workflow, hand-off points, decision branches, rough
volumes and timings, and what "good" looks like for the customer of the workflow.

Wait for the user's answers before proceeding.

### Step 3 — Capture

Using everything gathered, produce the **informed first draft**:
- A **rough workflow capture**: an ordered list of the workflow's steps, with each
  step's input, action, owner, and output noted where known. This is a working
  sketch, not the final diagram.
- **Open the Lens Ledger** (spec below) listing all six theory lenses as pending.

Share the rough capture with the user and ask them to correct it. An accurate
capture is the foundation of everything downstream — a wrong capture means a wrong
sweep.

### Step 4 — Sweep

This is the core of the skill. Run all six theory lenses across the workflow. Every
lens, every time — regardless of how small or simple the workflow looks. Skipping a
lens because the workflow "seems fine" is the exact failure this skill exists to
prevent.

Read each theory's reference file before applying its lens — the files carry the
detection questions, the named wastes/constraints/defects, and the signature tools:

| Order | Lens | Reference file |
|-------|------|----------------|
| 1 | Lean | `references/lean.md` |
| 2 | Six Sigma | `references/six-sigma.md` |
| 3 | Theory of Constraints | `references/theory-of-constraints.md` |
| 4 | Total Quality Management | `references/total-quality-management.md` |
| 5 | Business Process Re-engineering | `references/business-process-reengineering.md` |
| 6 | Process Optimization | `references/process-optimization.md` |

**Depth wins over speed.** Each lens gets a genuine, substantive pass — apply its
detection questions to the actual workflow, with real back-and-forth where the
user's domain knowledge is needed. To keep the procedure tight, you may **group a
few adjacent lenses into one turn** (e.g. lenses 1+3+6, the flow/waste/parameter
group, then 2+4+5, the quality/redesign group) — but grouping for turn-count is
*not* a license to shorten any individual lens. If a turn would become a wall of
text, split it.

After each lens, record its findings in the Lens Ledger and mark it complete.
Overlap between theories is expected and welcome — Lean, TQM, and BPR all surface
"waste", but each frames it differently, and re-examination is the point.

Also apply `references/core-principles.md` as a cross-cutting check — ten principles
that recur across all theories — and run the detection checklists in
`references/checklists.md`.

### Step 5 — Converge

Produce the three-part deliverable:

1. **The diagram** — now generate the full, authoritative workflow diagram. The
   sweep has informed it (you now know the real bottlenecks, branches, and
   hand-offs). Follow `references/diagramming.md` for diagram-type selection and
   exact Mermaid syntax.
2. **The full lens sweep** — present the completed Lens Ledger: every theory, its
   findings, nothing omitted. This is the completeness artifact.
3. **The neutrally-ranked shortlist** — synthesize the ledger's findings into a
   ranked list of improvement opportunities, using `references/prioritization.md`.
   Rank by **transparent, user-overridable criteria** (impact, effort, risk, etc.)
   shown openly. Surface every option; do **not** substitute your own verdict for
   the user's judgment. The ranking organizes the options — it does not decide
   for the user.

## The Lens Ledger

The Lens Ledger is the running artifact that makes completeness *visible*. Open it
in Step 3 and keep it updated through Steps 4–5. Render it as a markdown table the
user can watch fill in:

```
## Lens Ledger — <workflow name>

| # | Lens | Status | Findings |
|---|------|--------|----------|
| 1 | Lean | pending | |
| 2 | Six Sigma | pending | |
| 3 | Theory of Constraints | pending | |
| 4 | Total Quality Management | pending | |
| 5 | Business Process Re-engineering | pending | |
| 6 | Process Optimization | pending | |
```

As each lens is worked, change its status to `complete` and fill the Findings cell
with the concrete observations from that pass (the specific wastes, constraints,
defects, redesign opportunities, or parameter issues found — or an explicit "no
findings" if a lens genuinely surfaces nothing). A ledger with all six rows
`complete` is the guarantee the user asked for.

## Reference index

Read the relevant file before you need it — do not work from memory.

- `references/meta-workflow-checklist.md` — what to verify at each of the five
  steps. Consult at every step transition.
- `references/core-principles.md` — the ten cross-cutting principles shared across
  all theories; a cross-cutting check applied during the Sweep.
- `references/checklists.md` — concrete detection checklists (waste, bottleneck,
  variation, non-value-added work, etc.) used during the Sweep.
- `references/diagramming.md` — diagram-type selection and exact Mermaid syntax for
  flowcharts, swimlanes, value-stream maps, and state diagrams.
- `references/prioritization.md` — the transparent ranking method and the
  prioritization frameworks (impact/effort, Pareto, cost of delay, criticality).
- `references/lean.md` — Lean / Toyota Production System.
- `references/six-sigma.md` — Six Sigma.
- `references/theory-of-constraints.md` — Theory of Constraints.
- `references/total-quality-management.md` — Total Quality Management.
- `references/business-process-reengineering.md` — Business Process Re-engineering.
- `references/process-optimization.md` — Process Optimization.

## Stacking

- **`agile`** — methodology and team-process questions (frameworks, retros, estimation).
- **`iterative-plan`** — planning a specific milestone.
- **`critical-thinking`** (Strategic / Adversarial framework) — adversarial situations; it already routes process work here.

## Behavioral notes

- **Run the procedure; don't summarize it.** The reference files contain the actual
  detection questions. Ask them against the real workflow.
- **Never skip a lens.** Even on a tiny workflow. The completeness guarantee is the
  product.
- **Stay neutral at the shortlist.** Surface everything; rank transparently; let the
  user decide. The user owns the priority call.
- **The diagram comes after understanding**, never before.
- **The ledger is the deliverable's backbone.** When in doubt, record more in it.
