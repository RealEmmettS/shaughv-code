# Cross-Cutting Disciplines

Use these playbooks across all seven critical-thinking frameworks. The core skill carries
the routing and minimum requirements; load the relevant section here when the work needs
the detailed procedure.

## Contents

- [Assumption and bias discipline](#assumption-and-bias-discipline)
- [Convergence and divergence discipline](#convergence-and-divergence-discipline)
- [Stagnation and escape discipline](#stagnation-and-escape-discipline)
- [Externalization discipline](#externalization-discipline)
- [Interactive externalization](#interactive-externalization-mental-compacting-for-the-human)
- [Cognitive scaffolds](#cognitive-scaffolds)
- [Checkpoints](#checkpoints)
- [Reductionism guard](#reductionism-guard)
- [Analytic confidence](#analytic-confidence)

## Assumption and bias discipline

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

## Convergence and divergence discipline

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

## Stagnation and escape discipline

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

## Externalization discipline

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

## Interactive externalization (mental compacting for the human)

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

## Cognitive scaffolds

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

## Checkpoints

Two kinds, by mode.

**Self-imposed (self-check mode).** Before reporting — and at any natural seam in long
work — produce the status snapshot yourself: what's settled / open / deferred / in
tension. It's the batch-level forced pause, applied at session scale. Don't let a long
self-check run end-to-end without one.

**Operator-directed (facilitation mode).** The operator sets the cadence. Default offer
at session start:

> *"I'll update the working canvas after material evidence, decisions, routes, or obligations
> change, and at natural checkpoints. Ask for a checkpoint whenever you want one."*

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

## Reductionism guard

When checkpointing, summarizing, or transitioning, preserve these things in the active packet or
lossless archive with an exact pointer — they are load-bearing content, not residue:

- **Emotional charge** ("I'm dreading X")
- **Uncertainty markers** ("60% confident")
- **Minority reports** (assumptions flagged but not yet confirmed)
- **The original wording** — the operator's, or the source's — where it carried specific
  meaning
- **Tacit reasoning** ("I just have a bad feeling")
- **Connective tissue** (why a constraint matters, not just that it does)

If a compact packet omits one of these from active context, preserve it in the cold archive and
link the exact section. Compression is expected; silent deletion or treating a summary as the raw
source is the error. Retrieve archived detail only for a named live question.

## Analytic confidence

The more a conclusion depends on judgment vs. facts, the higher the error rate — even
though confidence usually doesn't drop to match. Calibrate explicitly.

Every claim, finding, or conclusion on the working canvas gets a confidence band:

- **High** — directly supported by clear evidence; would be reproducible
- **Medium** — supported by reasoning + partial evidence; defensible but contestable
- **Low** — judgment-driven, weak evidence, or significant uncertainty
- **Speculation** — not yet substantiated; useful to consider but not to act on

Communicate the confidence band when surfacing the claim, not just at session end.
