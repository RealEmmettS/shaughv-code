# Visual Models — Interactive (mental compacting for the human)

The other four files in this folder externalize **layout**: a matrix, a tree, a timeline makes
relationships visible so the human can see them all at once instead of holding them in working
memory. This file is about the next rung up — externalizing the **computation** as well, into a
**built interactive visualization** the human can poke at.

Reach for this when a static markdown model still isn't landing: the session has run long, the
human is fried, and a question that *isn't actually that complex* has become unanswerable because
there are too many moving parts to hold at once. This is the most common failure point of long
(6-plus-hour) working sessions — the human's working memory is full, simple answers to complex
questions stop coming, and the temptation is to "just summarize." A lossy summary is the wrong
move: it throws away the exact pieces the human needs. Instead, **compact the situation into
something the human can manipulate** — the analogue of compacting an agent session to free up
context, except here we are freeing up the *human's* working memory.

This file covers:

- The escalation ladder and the overload signals that trigger it
- The build pattern for a good interactive visualization
- The non-negotiable verification discipline (the model must match the reading)
- The 12-model catalog — what the interactive version adds over the static one, and what the
  human perturbs
- A worked example (a real software-delivery milestone)
- Pitfalls

---

## The escalation ladder

Use the cheapest rung that works. Escalate only when the current rung stops landing.

1. **Prose** — a few facts, one comparison.
2. **Static markdown model** (the other four files) — dense but stable content; externalizes
   layout.
3. **Built interactive visualization** (this file) — when the hard part isn't *seeing* the
   layout, it's *running the model in your head*. Externalizes computation: the human moves an
   input and the conclusion re-ranks itself in front of them.

Do not skip to rung 3 by default. An interactive artifact is more work to build and more work to
trust (see the verification discipline below). It earns its place only when a static model has
actually failed to break through, or when the decision genuinely hinges on a number no one can
compute by eye.

### Overload signals (when to escalate to interactive)

- The human says some version of *"I can't hold all this,"* *"wait, which one wins again?,"* or
  asks the same question twice within a session.
- The decision hinges on a computation no one can do by eye — a five-criterion weighted ranking,
  an expected-utility crossover, a multi-stage probability chain.
- The argument keeps circling because two people are silently picturing different weights or
  probabilities and can't see each other's model.
- A "simple" question is stuck because the pieces are individually simple but there are too many
  of them at once.

---

## The build pattern

Build it with the `frontend-design` skill so it's legible, not generic. Then:

- **One self-contained artifact.** A single HTML file the human opens and reads top to bottom.
  No build step, no external network calls, all state in memory (no `localStorage`). If you are
  covering many models, use a left-nav rail and switch panels; if one, a single panel.
- **Grounded in the real situation.** Use the actual options, actual numbers, actual decision on
  the table — never a toy dataset. The point is to compact *this* situation, not to teach the
  technique in the abstract.
- **A live model the human can perturb.** Sliders for weights and probabilities, toggles for
  assumptions, clickable cells. The human should be able to test *"what if the cap applies?"* by
  dragging a slider, not by re-running arithmetic. The recommendation must visibly recompute as
  they do.
- **A one-paragraph "reading" per model.** Every model carries a short *what it surfaces* note
  that ends in a move — *"therefore the next action is X."* A visualization that doesn't resolve
  to a decision is decoration. The reading is the compaction; the chart is just how the human
  checks it.
- **Honest structure, not persuasion.** Empty cells stay empty (they're a finding). Unfixable
  cons stay unfixed. Low-confidence inputs are visibly marked. The artifact is a thinking aid,
  not a sales deck for a preferred answer.

---

## The non-negotiable discipline: the model must match the reading

The fastest way to destroy trust in an interactive artifact is for the on-screen numbers to
contradict the prose conclusion next to them. If the reading says *"B leads until the probability
of the cap passes ~45%,"* the live model must actually produce a B→A crossover at ~0.45 — not
0.30, not "B always wins."

This is the interactive analogue of the Closing **sanity check**, and it is mandatory. Treat the
reading as a claim and the model as the evidence; reconcile them before shipping.

**Verification recipe:**

1. **Extract every model** (the scoring functions, the weights, the probabilities) and run it in
   isolation — a quick script, not the rendered page.
2. **For each model, compute the result at the default inputs and at the edges** (e.g. probability
   = 0 and = 1, or each weight maxed). Write down which option wins where, and where the crossovers
   land.
3. **Read each model's written "reading" as a falsifiable claim.** Does the computed behavior
   actually match it — the winner at defaults, the direction of the effect, the crossover point?
4. **Where they disagree, fix whichever is wrong.** Usually the model's constants drifted from the
   narrative; sometimes the reading overstates. Edit one, never fudge both to meet in the middle.
5. **Re-run and confirm.** Then check the artifact has no runtime errors (no `NaN`, balanced
   markup, clean syntax check on the script).

If you cannot make a model produce its reading honestly, the reading is wrong — change the
conclusion, don't torture the numbers.

---

## The 12-model catalog

All twelve are the Morgan Jones *Thinker's Toolkit* techniques documented statically in the sibling
files. Below is only what the **interactive** version adds, and the input the human perturbs. For
the technique itself, follow the cross-reference.

| # | Model | Static home | What interactive adds | Human perturbs |
|---|-------|-------------|-----------------------|----------------|
| 1 | **Pros / Cons / Fixes** | `comparison.md` | Toggle each con between "fixable" and "unfixable" and watch the surviving-con comparison rebuild live | Which cons are truly unfixable |
| 2 | **Sorting / Chronologies / Timelines** | `structure.md` | Re-sort the same items by status, owner, priority, or time with one click; a real timeline lane the eye can scan | The sort key / lens |
| 3 | **Causal Flow Diagramming** | `causality.md` | Walk the chain node-by-node; highlight the link where the fix is inserted, so cause→effect is traced, not asserted | Which node to inspect |
| 4 | **The Matrix (2×2 / N×M)** | `comparison.md` | Drop items into quadrants and re-place the ambiguous ones; empty cells stay visibly empty | Item placement / the two axes |
| 5 | **The Decision / Event Tree** | `structure.md` | Expand and collapse branches; mark the chosen path; show parallel decisions side by side | Which branch is taken |
| 6 | **Weighted Ranking** | `comparison.md` | **Live weight sliders** — the ranking re-sorts as the human moves a criterion's weight, exposing how sensitive the winner is to the weighting | Criterion weights |
| 7 | **Hypothesis Testing** | `causality.md` | Click each evidence×hypothesis cell through Consistent / Inconsistent / N-A; the "least-inconsistent" survivor updates live (Popperian, not confirmatory) | Each evidence verdict |
| 8 | **Devil's Advocacy** | `devils-advocacy.md` | Surface the load-bearing assumption and let the human "crack" it to see which conclusions survive the attack | Which assumption is challenged |
| 9 | **The Probability Tree** | `probability.md` | A multiplied chain of stage probabilities, each on a slider, with the end-to-end probability recomputing as any stage changes | Each stage's probability |
| 10 | **The Utility Tree** | `probability.md` | Leaf utilities and the rolled-up expected utility per option, recomputing as utilities are edited | Leaf utility values |
| 11 | **The Utility Matrix** | `probability.md` | Options × states of the world with a **probability-of-state slider**; expected utility per option and the crossover point move live | P(state of the world) |
| 12 | **Advanced Utility Analysis** | `probability.md` | Multi-attribute utility plus a **one-way sensitivity tornado** — which single uncertainty most changes the recommendation, and where the recommended option becomes fragile | The driving uncertainty |

The high-value three for a fried human are usually **6 (Weighted Ranking)**, **11 (Utility
Matrix)**, and **12 (Advanced Utility)** — because those are the ones where the answer hinges on a
computation the human cannot do in their head, which is exactly the overload that triggered the
escalation.

---

## Worked example: a software-delivery milestone

The reference build for this skill is a single interactive HTML gallery of all twelve models, each
grounded in one real decision from a software milestone (a data-platform ingestion overhaul). Rather
than twelve toy datasets, every model points at the *same* live situation, so the human sees the
whole milestone from twelve angles:

- **Pros/Cons/Fixes** — the webhook-scope decision (one company-wide hook vs. ~105 per-project
  hooks vs. ship-the-simple-part-now), with cons toggled fixable/unfixable.
- **Sorting/Timeline** — all the milestone's tasks re-sortable by stage, owner, status, priority,
  plus a deploy-day timeline.
- **Causal Flow** — a real dead-letter-queue failure loop traced node by node to the one-line fix.
- **Matrix** — remaining actions placed on production-impact × reversibility.
- **Decision/Event Tree** — a permissions blocker with three resolution branches and the chosen
  path marked.
- **Weighted Ranking** — the three webhook options scored on five criteria with live weight sliders.
- **Hypothesis Testing** — five competing explanations for why nine messages dead-lettered, scored
  by least-inconsistent evidence.
- **Devil's Advocacy** — the case *against* retiring the nightly batch job, cracking the assumption
  that one signal was driven by the new path.
- **Probability Tree** — the end-to-end probability that a live edit shows up within the freshness
  target, as a multiplied chain.
- **Utility Tree / Utility Matrix / Advanced Utility** — the same three options under the unresolved
  question *"does an API cap apply?,"* with a P(cap) slider and a sensitivity tornado showing the
  recommended option is also the most cap-sensitive — which converts the whole debate into one
  testable next action: probe the cap.

The lesson the example encodes: twelve views of one real situation, each ending in a concrete move,
each with its model verified against its reading. That is what "mental compacting for the human"
looks like in practice — the human stops trying to hold the milestone in their head and starts
reading it off the screen.

---

## Ready-to-use HTML templates

You don't have to build each model from scratch. The `html/` folder next to this file holds a
standalone, self-contained interactive template for **every one of the twelve models** —
`html/01-pros-cons-fixes.html` through `html/12-advanced-utility.html` — plus
`html/13-triage-card.html`, the sensemaking triage card for dense hand-backs (decision block
with the do-nothing default up front, FYI buckets below; see `../sensemaking.md`). See
`html/README.md` for the full index. Each is dark-mode aware, dependency-free, all-in-memory, opens with a *when to
use* line and a dashed note saying exactly what to swap, and ends in a *reading*.

Workflow: pick the model that fits the cognitive job (use the table above), open its template, and
replace the example dataset at the top of its script with the real situation. The quantitative
ones (weighted ranking, probability tree, utility tree/matrix, advanced utility) already carry the
scoring logic — you only change the inputs. Then run the verification discipline above before
showing it to anyone: confirm the live numbers match the reading, fix whichever is wrong.

## Pitfalls

- **Building interactive when static would have worked.** The ladder exists for a reason. Don't
  reach for HTML to show a three-row comparison.
- **Shipping a model that contradicts its reading.** The single worst failure. Always verify.
- **A chart with no reading.** If it doesn't end in *"therefore X,"* it's decoration, and a fried
  human gets no compaction from it.
- **Toy numbers.** Ungrounded sliders teach the technique but don't compact *this* decision, which
  was the whole point.
- **Persuasion instead of thinking.** Hiding empty cells, pre-fixing every con, burying the
  low-confidence inputs. The artifact must stay honest or it stops being a thinking aid.
- **Over-precision.** Sliders down to two decimals on a judgment-driven probability imply a rigor
  that isn't there. Mark low-confidence inputs as such; calibrate to the underlying analytic
  confidence.
