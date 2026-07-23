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

The skill has three layers, used in this order every session:

1. **Pre-flight** — inspect inputs, choose a mode, choose a framework, set the working
   canvas at the right scale
2. **Run the framework** — load the relevant reference file and work the actual
   sub-questions, keeping the canvas current every turn
3. **Close** — sanity-check, wrap up, structured artifact

Six cross-cutting disciplines apply throughout:

- **Assumption & Bias Discipline** — surface, test, steel-man, check for motivated reasoning
- **Convergence/Divergence Discipline** — name which mode each move is in, push for breadth
  before narrowing
- **Externalization Discipline** — when content gets thick, reach for a visual model
  (`references/visual-models/`) instead of more prose
- **Cognitive Scaffolds** — use chunks, analogies, metaphors, active recall
  (`references/cognitive-scaffolds.md`) to keep a handle on the canvas
- **Stagnation & Escape Discipline** — after two materially identical cycles, stop,
  compare attempt signatures, and change the information-producing strategy
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

The working canvas is the lossless ledger of the session. **It scales to stakes:**

- **Quick self-check** — keep the structured reasoning inline in your response. No file;
  the discipline still applies (assumptions tagged, confidence banded, sanity check run).
- **High-stakes, long-running, or auditable work** — create a canvas *file* the operator
  can open, watch, and audit — also whenever a future session will need to resume the
  thinking.
- **Human-facilitated sessions** — the canvas file is mandatory, as always.

When you create a file, propose a path. Default: ask the operator where they want it.
When working inside a repo, suggest `<project-root>/docs/thinking/<YYYY-MM-DD>-<topic>.md`;
otherwise something like `~/critical-thinking-sessions/<YYYY-MM-DD>-<topic>.md`.

Create the canvas with the pre-flight findings (inputs, mode, framework selected) as its
first content. Update it every turn — append-only, never overwrite. The canvas is the
territory; the chat is the conversation about the territory. See
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

### 3A. Sanity check (mandatory — before anything is reported)

Before reporting a conclusion or writing the artifact, perform a sanity check on it. This
is the one step that is never optional, in any mode. Ask:

- Does this result make intuitive sense?
- Does anything feel off, even if I can't articulate why?
- Does the conclusion follow from the evidence and reasoning surfaced, or is it a leap?
- What would I expect to be true if this conclusion is right? Is that actually true?

If the sanity check fails, don't paper over it. Surface it. Sometimes the right move is to
loop back to an earlier step.

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
- **Next steps** — concrete actions, owners, and timeframes when applicable
- **Open questions** — anything unresolved
- **Steel-manned dissent** — strongest opposing view considered, and how it was handled
- **Spaced revisit** — if the decision plays out over time, when to revisit (date)

For formal deliverables (executive briefings, project docs), generate a separate document
using the `docx` skill. For working reasoning, the canvas markdown — or the inline block —
is enough.

---

## Cross-cutting: Assumption & Bias Discipline

Apply in every framework, every session. Don't wait for the framework to prompt it.

### Surface assumptions

For any claim:

- *"How do I know this is true?"*
- *"Is this a fact, an assumption, or an interpretation?"*
- *"What evidence would change my mind?"*
- *"Is this thought illogical, extreme, or inflexible?"*

Write assumptions on the canvas (or in the inline reasoning block). Tag each as `open` /
`tested` / `dismissed`. Even dismissed assumptions stay on the record — they don't
disappear.

### Test claims

When you — or the operator — are evaluating an article, document, or argument:

- Which claims are evidence-supported? How good is the evidence?
- Which claims are rhetorically supported (well-written, intuitively appealing, but not
  actually demonstrated)?
- Are cited references real, and do they say what the article claims they say?
- Is this generalizing from anecdote? Cherry-picking? Conflating correlation and causation?
- Is the strongest opposing view fairly represented, or strawmanned?

When competing explanations or hypotheses are in play, reach for the **Hypothesis Testing**
matrix (`references/visual-models/causality.md`). Rank by which has the *least inconsistent*
evidence — Popperian falsification, not confirmation.

### Steel-man dissent

Before accepting or rejecting any argument — the operator's, a source's, or your own:

1. State the strongest version of the opposing view, charitably.
2. Identify what would have to be true for the opposing view to be correct.
3. Ask: *"What's the best version of the case against the current position?"*
4. Decide whether the original survives, gets modified, or gets rejected.

For more rigorous adversarial analysis, use the formal **Devil's Advocacy** procedure
(`references/devils-advocacy.md`).

### Bias check

At least once per session:

- *"What do I — or does the operator — want to be true here, and is that wanting
  distorting the reading?"*
- *"What's the most uncomfortable thing this analysis might surface?"*
- *"Whose perspective is missing from this account?"*
- *"Am I satisficing — settling for the first satisfactory answer instead of the best one?"*
- (Silently, to yourself): *"Am I agreeing because the operator — or my own earlier
  draft — wants this to be right, or because it actually is?"*

If you disagree, say so — kindly and with reasoning. Sycophancy is a failure mode of this
skill, not a feature. So is its self-directed twin.

---

## Cross-cutting: Convergence/Divergence Discipline

Every analytical move is either *narrowing* (convergence) or *broadening* (divergence).
The default failure is convergence — picking the first plausible answer. Effective
analysis requires both, used at the right moments.

**At every step transition, name the mode:**

- *"We're diverging here — pushing for breadth. Don't pick yet."*
- *"We're converging now — narrowing toward a choice."*

**Where divergence is most often missing:**

- Decision-Making Step 4 (Generate Options) — push for at least 5 options, including
  unconventional ones, before any evaluation
- Design Step 4 (Ideate) — same; brainstorm "the worst possible idea" to spark creativity
- Problem-Solving Step 1.6 (Reframe) — push for multiple problem statements before picking
  one
- Problem-Solving Step 3 (Brainstorm Solutions) — generate without judgment first
- Strategic (Aims & Options facet) — generate indirect moves via the 36 Stratagems before
  settling on a line

**The Four Commandments of Divergent Thinking** (from Morgan Jones):

1. The more ideas, the better. Quantity over quality.
2. Build one idea on another. Spontaneity allows interaction.
3. Wacky ideas are okay. Unconventional ideas reduce fear of judgment.
4. Don't evaluate ideas (yet). The Golden Rule.

Communicate the mode shift explicitly when you make it. The operator gets whiplash if you
flip from "more ideas!" to "let's pick one" without naming the transition — and a
self-check that never names the mode usually never actually diverged.

---

## Cross-cutting: Stagnation & Escape Discipline

Two consecutive attempts with the same relevant starting state, intervention, and
observation trigger a forced checkpoint. Do not call the third repetition persistence.
Compare the attempt signatures and state what information, if any, the second produced.

Intentional replication is the exception, not a loophole. Repetition is valid when it is
declared in advance to estimate noise or reproducibility, the trials are meaningfully
independent, a prediction and sample count are recorded, and a stop rule is set. Otherwise
an unchanged signature is a duplicate cycle.

When the cycle is duplicate, route through `loop-escape` and diverge across **strategy
families**, not cosmetic variations of the same tactic:

- repair reporting or observability before changing behavior again
- restore and prove the last known-good state
- build a smaller end-to-end prototype or walking skeleton
- test on the actual target runtime or through a different capable tool
- inspect a working sibling/reference implementation
- remove observers, competing processes, or environmental contamination before measuring

The next move must state its material delta, prediction, and stop/redirect condition. If
none of those can be named, it is not a new attempt.

---

## Cross-cutting: Externalization Discipline

When the canvas content for a step is getting dense — more than ~5 facts, ~3 assumptions,
or ~3 options being weighed — **stop writing prose and reach for a visual model**.

Externalization isn't compression. It doesn't reduce information. It moves information
from working memory into an external structure so relationships that couldn't be held in
the head simultaneously — yours or the operator's — become visible.

This is the core insight of Morgan Jones's *The Thinker's Toolkit*: the value of a 2×2
matrix isn't simplicity, it's that it makes structure visible.

### When to reach for what

| Cognitive job | Tool | Reference |
|---|---|---|
| Compare options on multiple criteria | Weighted Ranking, Pros-Cons-and-Fixes, Matrix, 2×2 | `references/visual-models/comparison.md` |
| Organize information for visibility | Sorting, Chronology, Timeline, Scenario Tree, Concept Map | `references/visual-models/structure.md` |
| Trace causes, test explanations | Causal Flow Diagram, Fishbone, Hypothesis Testing | `references/visual-models/causality.md` |
| Assess scenarios under uncertainty | Probability Tree, Utility Tree, Utility Matrix | `references/visual-models/probability.md` |
| Map actors and moves under an adaptive opponent | Actor/Force Map, Move-Countermove Timeline, Decision Branch | `references/strategic.md` + `references/visual-models/structure.md` |
| The human is overloaded and a *static* model still isn't landing | **Interactive** version of any of the above | `references/visual-models/interactive.md` |

When you choose one, render it as markdown directly in the working canvas (or the inline
reasoning block), not just in passing. The canvas is where structure lives. Chat is where
you talk about it.

If a static markdown model still isn't breaking through — the session is long, the
operator is fried, and they keep asking the same question because they can't hold all the
moving parts at once — escalate to a **built interactive visualization**. That's the next
section.

---

## Cross-cutting: Interactive Externalization (mental compacting for the human)

This is a move you make **for the operator** — the answer to the worst kind of overload:
the **6-plus-hour session** where a question that *isn't actually that complex* has become
impossible to answer, because the human can no longer keep all the pieces in play at the
same time. Their working memory has run out. Compaction is the move — but a lossy prose
summary is exactly the wrong move here, because it throws away the very pieces the human
needs. The right move is to offload the structure **and the computation** into something
the human can poke at.

Think of it as *mental compacting for the human*: the same way a long agent session gets
compacted to free up context, a built interactive visualization frees up the human's working
memory by externalizing not just the layout (a static matrix does that) but the **live model**
underneath it — the weights, the probabilities, the tipping points — so the human stops
re-deriving numbers in their head and starts *seeing* the answer move as they change an input.

### The escalation ladder

Reach for the cheapest rung that works. Escalate only when the current rung stops landing.

1. **Prose** in chat / canvas — fine for a few facts and one comparison.
2. **Static markdown model** in the working canvas (`comparison.md`, `structure.md`,
   `causality.md`, `probability.md`) — when content is dense but stable. This externalizes
   *layout*: relationships become visible.
3. **Built interactive visualization** (`references/visual-models/interactive.md`) — when even
   the static model isn't enough, because the hard part isn't seeing the layout, it's *running
   the model in your head*. This externalizes the *computation*: the human moves a slider and
   the recommendation re-ranks itself in front of them.

### When to escalate to interactive (the overload signals)

- The session has run long and the operator says some version of *"I can't hold all this,"*
  *"wait, which option wins again?,"* or asks the same question twice.
- The decision hinges on a number nobody can compute by eye — a weighted ranking with five
  criteria, an expected-utility crossover, a probability chain.
- The argument keeps going in circles because two people are picturing different weights or
  probabilities and can't see each other's model.
- A "simple" question ("do we ship the 90% now?") is stuck because the pieces are
  *individually* simple but there are too many of them at once.

### When overload signals fire — invert the defaults

The moment any overload signal above appears, two defaults flip for the rest of the
session (cognitive-load reasoning: working memory is saturated; the visual channel still
has capacity — use both channels, dual-coded, instead of more prose):

- **Visual-first.** Lead each turn with the structure — table, tree, matrix, triage card —
  and put the prose after it. Until now visuals were an escalation; under overload they
  are the opening move.
- **One-screen rule.** Each turn carries at most one structure and at most three
  questions. No walls of text at exactly the moment the operator can't process them.
- **Checkpoints auto-upgrade.** The status snapshot (settled / open / blocked / next)
  renders as a compact table at every checkpoint — no longer opt-in while overload lasts.

### What a good interactive visualization is

- **One self-contained artifact.** A single HTML file (or one panel per model) the human opens
  and reads top-to-bottom. Built with the `frontend-design` skill for legibility. No build step,
  no external calls, all state in memory.
- **Grounded in the real situation,** not a toy. Use the actual options, the actual numbers,
  the actual decision on the table. (The worked exemplar ships every one of the 12 Toolkit
  models against a real software milestone — see `interactive.md`.)
- **Driven by a live model the human can perturb.** Sliders for weights and probabilities,
  toggles for assumptions, clickable cells. The point is the human tests *"what if the cap
  applies?"* by dragging, not by re-running arithmetic.
- **Carries a one-paragraph "reading" per model** — *what it surfaces* — so the artifact
  compacts to a decision, not just a pretty chart. A visualization that doesn't end in
  *"therefore, the next move is X"* hasn't done its job.

### The non-negotiable discipline: the model must match the reading

The fastest way to destroy trust in an interactive artifact is for the on-screen numbers to
contradict the prose conclusion sitting next to them. If the reading says *"B leads until the
probability of the cap passes ~45%,"* the live model must actually produce that crossover.
Before you ship one: verify each model's output against its written reading, fix whichever is
wrong, and re-verify. This is the interactive analogue of the Closing **sanity check** — and it
is mandatory. `interactive.md` covers the verification recipe.

Full build pattern, the 12-model catalog, and the worked example:
`references/visual-models/interactive.md`.

---

## Cross-cutting: Cognitive Scaffolds

When the canvas accumulates beyond what can be held easily — by you or by the operator —
reach for cognitive tools. See `references/cognitive-scaffolds.md` for the full set.

Brief reminders:

- **Chunking** — group related items under a single named chunk. ("The three sycophancy
  claims" rather than restating each.)
- **Analogies** — when introducing complexity, find an analogy to something already
  known.
- **Metaphors** — when an emotional or structural quality matters, use a metaphor.
- **Active recall** (opt-in, facilitation) — at operator-requested checkpoints, ask them
  to summarize *without looking* what's been established. The gap is itself a signal.
- **Teaching test** — *"Could this conclusion be explained to a colleague who wasn't in
  this conversation?"* If not, there is no conclusion yet — in any mode.

---

## Cross-cutting: Checkpoints

Two kinds, by mode.

**Self-imposed (self-check mode).** Before reporting — and at any natural seam in long
work — produce the status snapshot yourself: what's settled / open / deferred / in
tension. It's the batch-level forced pause, applied at session scale. Don't let a long
self-check run end-to-end without one.

**Operator-directed (facilitation mode).** The operator sets the cadence. Default offer
at session start:

> *"I'll keep the working canvas updated every turn. Tell me when you want a checkpoint —
> I won't insert them on my own unless you signal overwhelm."*

**Checkpoint signals (explicit or behavioral):**

- "checkpoint", "pause", "where are we", "summarize so far"
- "I'm losing the thread", "this is a lot", "I'm overwhelmed"
- Long silence followed by a terse response, or asking the same question twice
- The operator asking for a recap at a transition

**A checkpoint produces, in this order:**

1. **Status snapshot** — what's settled / open / deferred / in tension. Short. Pointers
   to canvas sections, not content rewrites.
2. **Active recall prompt (opt-in, facilitation)** — *"Before I show you the canvas, what
   do you remember as the key things we've established?"* Offer it; the operator accepts
   or skips.
3. **Visual model recommendation** — if the canvas is dense in a particular section,
   suggest externalizing it as a matrix, tree, or other model.

**Resolution toggle** — any topic can be asked for at three resolutions:

- **Headline** — one sentence
- **Structured** — paragraph or checkpoint-card density
- **Full** — the working canvas section, uncompressed

Default at transitions: structured.

---

## Cross-cutting: Reductionism Guard

When checkpointing, summarizing, or transitioning, **never throw away** these things —
they are the load-bearing content, not residue:

- **Emotional charge** ("I'm dreading X")
- **Uncertainty markers** ("60% confident")
- **Minority reports** (assumptions flagged but not yet confirmed)
- **The original wording** — the operator's, or the source's — where it carried specific
  meaning
- **Tacit reasoning** ("I just have a bad feeling")
- **Connective tissue** (why a constraint matters, not just that it does)

If a summary would drop any of these, produce a structured snapshot with a pointer to the
canvas section instead. The canvas is lossless by design — never replace it with a
compressed paraphrase.

A summary that's shorter than the original *is* lossy compression. That's fine when the
compression is acknowledged, and the lossless version is still available. It's a
reductionist mistake when the compression is treated as the original.

---

## Cross-cutting: Analytic Confidence

The more a conclusion depends on judgment vs. facts, the higher the error rate — even
though confidence usually doesn't drop to match. Calibrate explicitly.

Every claim, finding, or conclusion on the working canvas gets a confidence band:

- **High** — directly supported by clear evidence; would be reproducible
- **Medium** — supported by reasoning + partial evidence; defensible but contestable
- **Low** — judgment-driven, weak evidence, or significant uncertainty
- **Speculation** — not yet substantiated; useful to consider but not to act on

Communicate the confidence band when surfacing the claim, not just at session end.

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
