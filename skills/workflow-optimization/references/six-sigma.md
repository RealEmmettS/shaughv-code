# Six Sigma

**Lens question this theory answers:** *Where does this workflow produce defects
or behave inconsistently — and what are the root causes?*

---

## Origin and core philosophy

Six Sigma (6σ) is a set of techniques and tools for process improvement,
introduced by engineer Bill Smith at Motorola in 1986. It spread rapidly after
Jack Welch made it central to General Electric's strategy in 1995. Motorola
attributed over $17 billion in savings to it; GE reported savings that grew past
$1 billion.

The name comes from statistics: "six sigma quality" means a process so consistent
that defects fall below **3.4 defects per million opportunities (DPMO)** — six
standard deviations fit between the process mean and the nearest specification
limit.

Core philosophy: improve quality by **identifying and removing the causes of
defects and minimizing variability**. Six Sigma is the most data-driven of the
theories — it asserts that decisions should rest on verifiable data and
statistical analysis, not assumption or guesswork. It also professionalized
quality work, with a trained "belt" hierarchy (Yellow, Green, Black, Master Black
Belt, Champion).

The implicit goal is not to push *every* process to 3.4 DPMO — it is for
management to decide an appropriate quality target for each important process and
prioritize accordingly.

## The two improvement cycles

### DMAIC — for improving an *existing* workflow

Five phases:

1. **Define** — Define the problem, the customer and their requirements (Voice of
   the Customer), and the project goals specifically.
2. **Measure** — Measure key aspects of the current process; collect data;
   calculate the "as-is" capability. You cannot improve what you have not
   measured.
3. **Analyze** — Analyze the data to find cause and effect. Verify relationships;
   seek the **root cause** of the defect, not the symptom.
4. **Improve** — Improve the process based on the analysis (e.g. design of
   experiments, mistake-proofing, standard work). Pilot the new state.
5. **Control** — Control the new process so deviations are caught before they
   become defects (control charts, statistical process control, monitoring).

(Some organizations prepend a **Recognize** step — recognizing the right problem
to work on — yielding RDMAIC.)

### DMADV / DFSS — for designing a *new* workflow

"Design For Six Sigma." Five phases: **Define** design goals → **Measure**
Critical-To-Quality characteristics and capabilities → **Analyze** to develop
design alternatives → **Design** the best alternative → **Verify** the design with
pilot runs, then hand over to the process owner.

Use DMAIC when optimizing an existing workflow; DMADV when designing a new one.

## Signature tools

- **5 Whys** — ask "why" repeatedly to drill from symptom to root cause.
- **Fishbone / Ishikawa / cause-and-effect diagram** — structures the possible
  causes of a problem into categories.
- **Pareto analysis / Pareto chart** — the 80/20 rule: identifies the "vital few"
  causes responsible for most defects. A core *prioritization* tool.
- **SIPOC** — a high-level map: Suppliers, Inputs, Process, Outputs, Customers.
  (COPIS is the customer-first variant.) Good for framing scope. See
  `diagramming.md`.
- **CTQ tree** — decomposes a customer need into measurable Critical-To-Quality
  characteristics.
- **Control charts / run charts** — track a process over time to separate normal
  variation from real signal.
- **FMEA** (Failure Mode and Effects Analysis) — systematically anticipates how
  and where a process could fail, and how severe each failure would be.
- **Design of Experiments (DOE)** — structured experimentation to find which
  factors actually drive an outcome.
- **Process capability** — quantifies how well a process stays within
  specification.
- **Pick chart** — sorts proposed improvements into Possible / Implement /
  Challenge / Kill by impact vs. effort. A core *prioritization* tool — see
  `prioritization.md`.

## How Six Sigma identifies and prioritizes improvement

- **Identify:** Measure the workflow's defect rate and variation. Use 5 Whys and
  fishbone diagrams to trace defects to root causes. Variation that depends on
  who, when, or where the work happens is itself a finding.
- **Prioritize:** Pareto analysis — focus on the vital few root causes that
  produce most of the defects. The Pick chart sorts candidate fixes by impact and
  effort. Management decides which processes warrant which quality target.

## Applying the Six Sigma lens in the Sweep

For the workflow under review, ask (run Checklist C alongside):

1. What counts as a *defect* in this workflow? Is the defect rate measured?
2. Does the workflow produce different results depending on who runs it, or when?
   Where is the variation?
3. For each recurring problem — has the **root cause** been found, or only the
   symptom patched? Apply 5 Whys.
4. Are the Critical-To-Quality characteristics defined — do we know what
   "defect-free" means here?
5. Is there a control mechanism that catches deviations before they become
   defects, or does the workflow run until something visibly fails?
6. Are decisions about this workflow based on data, or on assumption?

Record every defect source and variation source in the Lens Ledger.

## Watch-outs

- Six Sigma depends on accurate data; if the workflow has no measurement, the
  honest first finding is "this cannot be assessed without instrumentation" — that
  is itself a valuable improvement recommendation.
- The full statistical apparatus (DPMO, sigma levels, DOE) is overkill for many
  small or qualitative workflows. Use the *thinking* — measure, find root cause,
  reduce variation — without forcing the heavy machinery where it doesn't fit.
