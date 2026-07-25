---
name: critical-thinking
description: >-
  Seven agent-first thinking frameworks plus input inspection: Contemplating, Decision-Making,
  Design, Problem-Solving, Information Triage / Sensemaking, Scientific Inquiry, and Strategic /
  Adversarial (Art of War, 36 Stratagems, Five Rings, game theory). Use to slow down and audit
  your OWN work or facilitate a human. Trigger on "think through this", "make a decision", "I'm
  stuck", "challenge my assumptions", "try a different approach", "what's my play",
  "war-game this", "red-team my plan", or when a stalled approach needs reframing across
  genuinely different strategy families. Adds forced pause, divergence before convergence,
  sanity checks, assumption/bias discipline, steel-manning, and a lossless canvas. For repeated
  same-result/no-new-evidence execution cycles, start with loop-escape and use this skill to
  reframe; for oversized scope use iterative-plan; for formal evidence audits use
  logical-reasoning; for code defects use debugging-framework.
---

# Critical Thinking Skill

This skill's default job is to make an agent — you — slow down and reason through your
**own** in-progress work: pick the right framework, ask its sub-questions of your own
reasoning, record assumptions, conclusions, and confidence, and surface them to the
operator. Its secondary job is the original one: facilitating a human through the same
seven frameworks. Either way you maintain a lossless working canvas (scaled to stakes),
deploy visual models when content gets thick, and respect the pacing — the operator's,
or the forced pauses you impose on yourself. Same frameworks, same rigor; the only thing
that changes between modes is who answers the questions.

The most common failure modes of this skill are:

1. Launching into a framework without inspecting the inputs and choosing a mode
2. Summarizing the framework's sub-questions instead of actually asking them — of your
   own reasoning, or of the operator in facilitation mode
3. Compressing context with lossy summaries when the reasoning outgrows working memory,
   instead of externalizing the structure
4. Converging on an answer without explicit divergence first
5. Treating agreement as validation — sycophancy toward the operator, or its quieter
   twin, nodding along with your own earlier reasoning
6. Facilitating a thinking framework at someone who just needs the pile sorted — when
   the inputs overflow, run Information Triage (`references/sensemaking.md`) first
7. Skipping straight to the answer without the forced pause, the divergence, and the
   sanity check — the self-check discipline is the point, not overhead
8. Mistaking persistence for progress — repeating a materially identical attempt without
   stating what changed, what it tests, or what information it can produce

Don't do those.

---

## How to use this skill

The skill has three logical layers; scale their visible ceremony to stakes. A routine decision
may express all three in a few sentences, while a long, risky, or auditable decision earns a
working canvas and explicit checkpoints:

1. **Pre-flight** — inspect inputs, choose a mode, choose a framework, set the working
   canvas at the right scale
2. **Run the framework** — load the relevant reference file and work the actual
   sub-questions; update the canvas after material evidence, decisions, routes, or
   obligations change, and at natural checkpoints or the operator's request
3. **Close** — sanity-check, wrap up, structured artifact

Six cross-cutting disciplines are available throughout; activate each when its failure mode is
material rather than emitting every record on every turn:

- **Assumption & Bias Discipline** — surface, test, steel-man, check for motivated reasoning
- **Convergence/Divergence Discipline** — name which mode each move is in, push for breadth
  before narrowing
- **Externalization Discipline** — when content gets thick, reach for a visual model
  (`references/visual-models/`) instead of more prose
- **Cognitive Scaffolds** — use chunks, analogies, metaphors, active recall
  (`references/cognitive-scaffolds.md`) to keep a handle on the canvas
- **Stagnation & Escape Discipline** — after two materially identical, non-informative
  cycles, pause that route for an attempt audit and change the information-producing strategy;
  a declared independent replication may continue under its own bounded stop rule
- **Stacking** — when invoked alongside other skills (e.g. `logical-reasoning`), follow
  the stacking rules below

---

## Layer 1: Pre-Flight

Run pre-flight at the start of every session. Be brief — usually one message, sometimes two.

### 1A. Inspect the inputs

Before running any framework, take stock of what you've actually been handed — by the
operator, by another agent, or by your own prior work.

| Input shape | What to check |
|---|---|
| **External artifact** (article, study, blog post, transcript, document) | Source credibility, author stake, evidence vs. rhetoric, missing counter-evidence, completeness |
| **Internal artifact** (code, spec, design doc, BRIEF.md, audit, journal) | Recency, authorship, provenance, what's already been decided vs. what's still open |
| **Situation description** (the operator — or the task itself — describing something in prose) | What's stated as fact vs. assumption, what's being left out, what emotional charge is loaded into the framing |
| **Input pile / dense hand-back** (many artifacts and no single question, or one dense status message interleaving asks, FYIs, and lectures) | Don't pick a framework yet — route to **Information Triage** (`references/sensemaking.md`) |
| **No inputs — pure thinking** | Skip 1A. Go to 1B. |

When the inputs include an external artifact, do a real source pass. Ask:

- What kind of source is this? (Peer-reviewed research, journalism, opinion essay, marketing,
  forum post, anonymous blog?)
- What's the author's stake or position?
- Are the claims that matter most evidence-supported, or rhetorically supported?
- What's missing that a fair version of this would include?
- Is there a strong opposing view that deserves to be steel-manned?

Don't assume the artifact is correct just because it was handed to you. Don't assume it's
wrong, either. Treat it as one input among several.

When the inputs include an internal artifact, ask:

- How old is this? Has anything changed since?
- Who wrote it and for what purpose?
- What in here is decided vs. what's still open?
- What's already committed to that we're not going to revisit?

When there's only a situation description, run the assumption discipline on its framing —
the operator's, or your own — before picking a framework.

**Output of 1A:** a short reflection — two or three sentences — about what you noticed in
the inputs. In facilitation, say it back to the operator; in self-check, record it before
proceeding. Not a lecture. Just naming what's there and what's missing.

### 1B. Choose a mode

- **Self-check (default)** — you run the framework on your own in-progress work: ask the
  sub-questions of your own reasoning, answer them honestly, and don't proceed past a
  step until it has actually been worked. The facilitation machinery below turns inward
  as discipline — batches become forced pause points, transitions become checks that the
  last step really finished, and the closing sanity check is mandatory before you report.
- **Facilitate (human, secondary)** — slow, patient, batched questions posed to the
  operator. Default when a human brings an emotional or open-ended situation, design
  exploration, or personal reflection.
- **Provoke** — sparring partner mode. Challenge framing, surface assumptions, steel-man
  dissent, push back — against the operator's position when they ask ("provoke me",
  "challenge my assumptions", "push back"), or against your own position when you're
  self-checking a plan you're suspiciously fond of.
- **Recommend** — the thinking is done, constraints are documented, and a call is needed
  under time pressure. State the recommendation, show the reasoning, offer to deepen.

When a human is in the loop and the mode is unclear: *"Do you want me to walk this
through slowly with you, or push hard on your framing first?"*

### 1C. Choose a framework

| Signal | Framework | Reference |
|---|---|---|
| Emotionally overwhelming or uncertain personal situations; anxiety, perfectionism, or feeling stuck in life circumstances; needs clarity and peace more than optimization | **Contemplating With Wisdom and Joy** | `references/contemplating.md` |
| A specific choice between options; comparing paths; "should I do X or Y?"; needs to pick a direction | **Decision-Making** | `references/decision-making.md` |
| Building, creating, or designing something — a product, system, process, or experience; needs to go from problem to crafted solution | **Design** | `references/design.md` |
| Something is broken, wrong, or not working; a gap between what is and what should be; needs to diagnose root causes and find fixes | **Problem-Solving** | `references/problem-solving.md` |
| Drowning in inputs — a pile of docs/transcripts/exports with no clear question yet, or a dense agent/teammate hand-back with a buried decision; the information must be processed before any thinking can start | **Information Triage / Sensemaking** | `references/sensemaking.md` |
| An empirical question — "why is X happening", "is it true that…", "what's actually going on in this system/data"; needs evidence gathered and hypotheses tested, not opinions weighed | **Scientific Inquiry** | `references/scientific-inquiry.md` |
| A contest — a negotiation, competitor, rival, positioning bet, or any adaptive opponent who reacts to what you do; "what's my play", "war-game this", "red-team my plan", "should I fight this", "I'm outmatched" | **Strategic / Adversarial** | `references/strategic.md` |

**Overlap is normal.** A problem might turn into a decision. A design challenge might
surface emotional overwhelm. Pivot or blend as needed. Information Triage is a front door,
not a destination — it always exits into another framework, a named next action, or an
explicit archive. Scientific Inquiry hands code defects to `debugging-framework`.
Strategic hands a clean underlying choice to Decision-Making; Decision-Making escalates to
Strategic the moment a real opponent will react to the choice.

### 1D. Set up the working canvas

The working canvas has two layers: a compact typed packet for the live decision and a lossless
cold archive for material that may need retrieval. **It scales to stakes:**

- **Quick self-check** — keep the structured reasoning inline in your response. No file;
  the discipline still applies (assumptions tagged, confidence banded, sanity check run).
- **High-stakes, long-running, or auditable work** — create a canvas *file* the operator
  can open, watch, and audit — also whenever a future session will need to resume the
  thinking. Keep the active top section limited to objective, verified facts and evidence
  pointers, live assumptions/hypotheses, decisions, unresolved contradictions, and next action.
  Store raw chronology and bulky source material below or at stable pointers.
- **Human-facilitated sessions** — the canvas file is mandatory, as always.

When you create a file, use the repository's existing convention when one exists. Otherwise
default to `<project-root>/docs/thinking/<YYYY-MM-DD>-<topic>.md` inside a repo or an available
workspace artifact directory outside one. Ask only when location materially changes visibility,
sharing, authority, or the requested deliverable.

Create the canvas with the typed active packet first, followed by the pre-flight findings (inputs,
mode, framework selected). Append raw history rather than erasing it, but update the active packet
in place after material evidence, decisions, routes, or obligations change, and at natural
checkpoints or the operator's request. Do not create per-turn busywork when nothing material
changed. The archive preserves provenance; the packet drives the next decision. See
`references/working-canvas.md` for the full spec and template.

---

## Layer 2: Run the Framework

Once you've picked the framework, **load the reference file**. Each one contains the full
step-by-step with the actual sub-questions the framework specifies. Ask those
sub-questions — of your own reasoning by default, of the operator in facilitation mode.
Don't paraphrase past them.

### Run the framework, don't summarize it

Open the reference file. Find the current step. Read its sub-questions. **Work those
sub-questions** — answer each one concretely, in writing, before moving on. Don't move to
the next step until the current one has actually been worked.

The framework's power is in the sub-questions. If you skip them, the thinking is lost,
not just the structure.

### Pacing as discipline: batching, checking, transitioning

The facilitation machinery doubles as the self-check discipline. Same moves, turned
inward:

- **Batches are forced pause points.** In facilitation: 2–4 related sub-questions per
  message, grouped naturally. In self-check: work the same small batches — stop after
  each one and check the answers before continuing, instead of racing the step in one
  pass.
- **Active listening becomes answer-checking.** In facilitation: acknowledge → notice
  what's missing → probe. In self-check: re-read your answer → notice what it
  conveniently skipped → probe that.
- **Transitions close the step.** Before the next step, summarize the current one in 2–3
  sentences and confirm it actually finished — then bridge to the next and open the first
  batch.
- **Pacing:** some steps take multiple passes, others a quick confirmation. Adapt — but
  never skip the pause.

### Receiving pushback

When the operator pushes back hard mid-session:

1. Stop. Don't defend. Don't immediately re-explain.
2. Repeat their pushback in your own words.
3. Acknowledge what was wrong with your prior framing.
4. Then redesign from their corrected framing — don't just patch.

Pushback is a gift. It means the operator is engaged enough to correct you.

---

## Layer 3: Closing

### 3A. Sanity check (mandatory plausibility screen — before anything is reported)

Before reporting a conclusion or writing the artifact, perform a sanity check on it. This
is the one step that is never optional, in any mode. Ask:

- Does this result make intuitive sense?
- Does anything feel off, even if I can't articulate why?
- Does the conclusion follow from the evidence and reasoning surfaced, or is it a leap?
- What would I expect to be true if this conclusion is right? Is that actually true?

If the sanity check fails, don't paper over it. Surface it. Sometimes the right move is to
loop back to an earlier step.

This is a correlated same-context **plausibility screen**, not acceptance evidence. It can catch
an obvious leap but cannot certify software behavior, data semantics, proof validity, scientific
support, or any other claim that has a task-specific oracle. Run the relevant external,
executable, formal, semantic, or expert check before making that stronger claim.

### 3B. Verbal wrap-up

A short summary — in chat, or at the top of what you surface to the operator:

- The key insights surfaced
- The decision, conclusion, or design (even if tentative)
- The next 1–3 concrete actions
- Any open questions worth revisiting
- The sanity-check result
- The exit state: Decided / Directed / Blocked-on-named-information (see 3C)

### 3C. Structured artifact

In a quick self-check, the artifact is the structured reasoning block itself —
conclusions, assumptions, confidence, next actions — surfaced to the operator. When a
canvas file exists, the artifact is the canvas, finalized: that file already contains the
full session in lossless form. Either way, close with:

- **Decision / Conclusion** — what was decided or where things landed
- **Exit state** — exactly one of: **Decided** (the call is made), **Directed** (not
  decidable yet, but the next concrete action is named), or **Blocked-on-named-information**
  (the missing information stated precisely — and routed: it becomes a Scientific Inquiry
  question or a task in the tracker, never a vague "look into it"). No session closes
  without one; this is what turns an overwhelmed session that can't reach a decision into
  one that still produces motion.
- **Sanity check** — did the result pass, and any caveats
- **Confidence** — overall confidence band on the conclusion (low/medium/high)

These are local framework-session direction labels, not replacements for an owning task or
agentic contract's terminal state. Report the owning state separately when it uses
`PARTIAL`, `REFUTED`, `INDETERMINATE`, `UNVERIFIED`, `UNKNOWN_WITHIN_BUDGET`, or another declared
vocabulary. `Decided` or `Directed` never upgrades insufficient evidence to success, and
`Blocked-on-named-information` becomes contract-level `BLOCKED` only when the named dependency
actually satisfies that contract's blocker rule.
- **Next steps** — concrete actions, owners, and timeframes when applicable
- **Open questions** — anything unresolved
- **Steel-manned dissent** — strongest opposing view considered, and how it was handled
- **Spaced revisit** — if the decision plays out over time, when to revisit (date)

For formal deliverables (executive briefings, project docs), generate a separate document
using the `docx` skill. For working reasoning, the canvas markdown — or the inline block —
is enough.

---

## Cross-cutting disciplines

Scale these defaults to the decision's stakes and failure modes:

- surface and test assumptions when the conclusion depends on them; steel-man when bias,
  disagreement, or asymmetric cost is material
- diverge before converging when option-space error matters; name modes only when it prevents
  premature narrowing or helps coordinate collaborators
- route duplicate, non-informative attempt signatures through `loop-escape`; declared independent
  replication and evidence-changing trials remain valid
- externalize comparisons, causes, probabilities, or actor/move structures when prose is dense
- checkpoint at natural seams for long-running, multi-party, or auditable work, and on operator
  request; do not create per-turn canvas busywork
- preserve load-bearing wording, uncertainty, and confidence bands when later readers or decisions
  depend on them; keep routine outputs compact

Load [the cross-cutting disciplines](references/cross-cutting-disciplines.md) for the detailed
playbooks. Read the relevant section when the work is high-stakes, long-running, stalled,
information-dense, adversarial, or needs a formal confidence/checkpoint record. For overloaded
human facilitation, load its interactive-externalization section immediately.

---

## Stacking with other skills

When `/critical-thinking` is invoked alongside other skills:

- **`loop-escape`** — when execution has repeated without information gain or the work is
  too broad to validate. Loop-escape owns the checkpoint and routing; critical-thinking
  owns reframing assumptions and generating genuinely different strategy families.
- **`logical-reasoning`** — when a decision or design hinges on an argument's validity.
  Use critical-thinking for structure, logical-reasoning to test the argument and expose
  fallacies.
- **`workflow-optimization`** — when the "situation" is really a repeatable process, its
  multi-lens sweep fits better. If the Strategic framework yields a process to run, hand
  off.
- **`personal-productivity`** — when the crux is really finite time and attention (what to
  drop, defer, or delegate).
- **`iterative-plan`** — when a conclusion needs to become a scoped, demoable plan; hand it
  off for milestone scoping and slicing.
- **`debugging-framework`** — when a Scientific Inquiry question turns out to be a code
  defect, hand off; it owns hypothesis-driven debugging end to end.
- **`deep-research`** (if installed) — for purely external, multi-source web research.
  Scientific Inquiry keeps the question, hypotheses, and conclusion; deep-research can
  serve as its Research step when the evidence all lives on the web.
- **Multiple skills at once** — don't run them sequentially as separate sessions. Blend
  them into a single coherent response. Name which skill is informing which part if it
  helps the operator follow.

(Adversarial and competitive situations no longer stack out to a separate skill — they
route to the Strategic / Adversarial framework in §1C.)

---

## Important behavioral notes

- **Run the framework, don't summarize it.** The reference files contain the actual
  sub-questions. Ask them — of yourself, or of the operator.
- **Don't lecture.** In facilitation you are a facilitator (or sparring partner), not a
  professor. Keep your own contributions brief; focus the conversation on the operator's
  situation.
- **Normalize imperfection.** Especially in Contemplating: there is no perfect answer —
  only the next most necessary and right thing.
- **Respect emotional weight.** Some situations are heavy. Be warm. Don't rush past
  feelings to get to "the analytical part."
- **The operator is the expert on their situation.** You bring structure; they bring
  context — and their ground truth outranks your model of it.
- **Disagree when you disagree — including with yourself.** Self-sycophancy (nodding along
  with your own earlier reasoning) is the same failure mode as flattering the operator,
  and catching it is the reason self-check mode exists.
- **The canvas is the deliverable when one exists.** When in doubt about what to capture,
  capture more, not less — inline or on the canvas, per the §1D scaling rule.

---

## Framework quick reference

For quick scanning — read the reference files for the full step-by-step:

- **Contemplating With Wisdom and Joy** (7 steps): Establish Clarity → Gain Perspective →
  Acceptance → Serenity Timing → Define "Enough" → Be Open to Change → Trust the Process.
- **Decision-Making** (7 steps): Get Clarity → Gather Information → Identify Constraints →
  Generate Options → Evaluate Options → Make the Decision → Reflect.
- **Design** (8 steps): Empathize → Define the Problem → Research → Ideate → Prototype →
  Test → Refine → Release.
- **Problem-Solving** (4 steps): Define the Problem → Analyze the Problem → Brainstorm
  Solutions → Evaluate and Select a Solution.
- **Information Triage / Sensemaking** (5 steps): Forage → Frame → Structure → Compress
  Upward → Exit Ramp — plus the dense hand-back procedure and the 30-second "5:30pm test."
  Always exits into another framework, a named next action, or an explicit archive.
- **Scientific Inquiry** (6 steps): Observe/Question → Research → Hypothesize → Experiment →
  Analyze → Report. Evidence over opinion; falsification over confirmation.
- **Strategic / Adversarial** (triage + 4 steps): Triage the stakes → Read the Constraint
  (real objective + opponent read at realistic competence) → Fill the Strategic Picture
  (five facets, pulling four lenses) → Residual-Angle Check → Converge on a line, its
  counter, ranked alternatives, and triggers-to-rethink. Win-without-fighting by default;
  initiative when the window rewards it; the ethics & proportionality guard is
  load-bearing.

## Reference index

- `references/contemplating.md` — Contemplating framework (7 steps)
- `references/decision-making.md` — Decision-Making framework (7 steps)
- `references/design.md` — Design framework (8 steps)
- `references/problem-solving.md` — Problem-Solving framework (4 steps, with 5 problem
  restatement techniques)
- `references/sensemaking.md` — Information Triage framework (input-pile steps, the dense
  hand-back procedure with the four decision fields and the 5:30pm test, worked example)
- `references/scientific-inquiry.md` — Scientific Inquiry framework (6 steps, ACH matrix,
  falsification discipline, worked micro-example)
- `references/strategic.md` — Strategic / Adversarial framework (triage gate, five facets,
  signal → lens routing, the Lens Ledger, win-without-fighting and its defeaters, the
  ethics & proportionality guard, the review loop)
- `references/strategic/art-of-war.md` — positioning lens (Sun Tzu): five fundamentals,
  win-without-fighting, strength vs. weakness, terrain, with detection questions
- `references/strategic/thirty-six-stratagems.md` — move-finding lens: the canonical 36 in
  six chapters (with ethics flags) plus six functional families
- `references/strategic/book-of-five-rings.md` — execution & timing lens (Musashi): rhythm,
  initiative, no-fixed-stance adaptability
- `references/strategic/game-theory-and-mental-levels.md` — structure-and-depth lens: game
  mapping, zero/positive-sum, level-k depth, commitment & signaling
- `references/strategic/annexes/art-of-war-full.md` — the complete Lionel Giles translation
  (public domain), backing the Art of War lens; reference-only — the distillation is the
  working layer
- `references/working-canvas.md` — the lossless ledger spec and template
- [Cross-cutting disciplines](references/cross-cutting-disciplines.md) — detailed assumption,
  divergence, stagnation, externalization, checkpoint, reductionism, and confidence playbooks
- `references/cognitive-scaffolds.md` — chunking, encoding, analogies, active recall, etc.
- `references/devils-advocacy.md` — formal adversarial analysis procedure
- `references/visual-models/comparison.md` — matrix, weighted ranking, pros-cons-and-fixes,
  force-field analysis
- `references/visual-models/structure.md` — sorting, chronology, scenario tree, concept map
- `references/visual-models/causality.md` — causal flow, fishbone, hypothesis testing
- `references/visual-models/probability.md` — probability tree, utility tree, utility matrix
- `references/visual-models/interactive.md` — when and how to escalate any static model to a
  built interactive visualization for an overloaded human ("mental compacting"); 12-model
  catalog + the model-matches-reading verification discipline + worked example
- `references/visual-models/html/` — twelve standalone, ready-to-use interactive HTML templates,
  one per mental model (`01-pros-cons-fixes.html` … `12-advanced-utility.html`); see
  `html/README.md` for the index
