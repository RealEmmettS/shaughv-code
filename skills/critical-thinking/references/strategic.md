# Strategic / Adversarial — the seventh framework

The framework for a **contest**: a negotiation, a competitor or rival, a positioning
bet, a campaign, a game — any situation with an **adaptive opponent** who reacts to
what you do. Most often you run it on the strategic situation in front of you:
**war-game the opponent yourself**, build a clear picture of the ground, pull the
right strategic knowledge at the right moment, and converge on a line — plus the
conditions under which to change it — that you surface to the operator. In
facilitation mode you work the same situation *with* a human across turns.

One discipline sits above the whole thing: **the value of a strategic principle is
the *question* it implies, not the quotation.** Ask the question against the real
situation; skip "Sun Tzu says…" — and defend each principle on its present-day
merits, adapting or dropping any pre-modern military idea that doesn't transfer.

## The three moving parts (keep them distinct)

- **Five facets** — the *information* model. What the Strategic Picture is made of:
  Standing, Drift, Aims & Options, Depth, Principles.
- **Four lenses** — the *knowledge sources* the facets pull from, used as high-level
  principle sets (not move-catalogs): Art of War, 36 Stratagems, Five Rings, Game
  Theory & Mental Levels. Each lives in a file under `references/strategic/`.
- **A right-sized procedure** — the *actions*: triage the situation, read the
  constraint, fill the picture, converge. Light for simple situations, full for hard
  ones.

## Two directives (above the procedure)

- **Understand first, prescribe later.** The opening move is never "here's what to
  do." It's the objective, the other side, and the ground. A strategy built on a
  misread situation is worse than none — it's confident and wrong.
- **The constraint is the read.** Everything downstream multiplies by the accuracy
  of the *objective* and the *opponent read*. Concentrate effort there; don't polish
  a clever move while the objective is still fuzzy.

## The triage gate (set the dials to the stakes)

Read the situation on four quick dimensions — **stakes** (how much rides on this),
**reversibility** (can a wrong move be undone), **adversariality** (a real thinking
opponent, or mostly fixed constraints/conditions), **time** (minutes, or room to
think) — and set the dials accordingly:

| Dial | Range |
|---|---|
| **Path** | fast path (low-stakes / reversible / fast) ↔ full path |
| **Depth** | one key question ↔ all five facets, all four lenses |
| **Mode** | per §1B — Self-check (default) · Facilitate · Provoke / war-game (play the opponent) · Recommend |
| **Externalization** | inline reasoning ↔ a canvas file (scale per §1D) |
| **# alternatives** | how many lines to surface at convergence |

## Fast path (right-sized for simple, reversible, low-stakes)

Don't build the full picture. Find the **real objective**, ask the **single
highest-leverage question** — often *"do you even need to win this?"* — settle on a
line, name one trigger to rethink, done. Expand to the full path only if that opening
question doesn't resolve it.

## Full path — the procedure

The steps and the lens order are a **default, not a dependency**. Strategy loops: if
filling the picture shows the objective was mis-stated or the opponent mis-read, go
back up before converging. Execution insight (Five Rings) often exposes a positioning
error (Art of War) — let it send you back.

### Step 1 — Read the constraint (do this first, invest here)

Pin the two things everything depends on:

- **The real objective.** Not the tactic ("undercut their price") but the end it
  serves ("this account, profitably, for two years"). *Stop rule:* ladder up only to
  the objective you'd actually trade other things for — don't chase an infinite
  regress of "but why do you *really* want that."
- **The opponent read.** Who they are, what they want, what they must protect, and —
  via the Depth facet — *how deep they're actually reasoning*. Model them at
  **realistic competence**: not a strawman (flatters the plan), not omniscient
  (dooms every plan). War-game them yourself — become the opponent and argue their
  best play.

In facilitation, reflect the picture back in a few sentences and **have the operator
confirm it before you sweep** — this gate protects the constraint from bad input. In
autonomous self-application there is no one to confirm it, so flag the opponent read
as the **weakest-evidenced, highest-leverage assumption** and confidence-band it hard:
it is the input most likely to be wrong and most costly if it is.

### Step 2 — Fill the Strategic Picture across the five facets

Work the facets, pulling the lens each one calls for (table below). Cover all five,
but let the situation drive the order — pull the lens the situation is *begging* for
(see Signal → lens). Record each facet's read in the Lens Ledger.

### Step 3 — Residual-angle check

Before converging, ask explicitly: *what do none of the four lenses capture here?*
Common residuals: coalition / third-party dynamics, base rates (how these usually
go), your own incentives and biases. Add any live one to the ledger. Complete rows
mean broad coverage, not proof nothing was missed — the residual row is the guard.

### Step 4 — Converge (through the definition of done)

1. **Recommended line** — one or two plain sentences, reasoning visible. Default to
   the least-costly path to the objective; see the Win-Without-Fighting bias for when
   to abandon that default for decisive action.
2. **The opponent's counter** — their most likely response (realistic competence)
   and your answer to it, at least one move deep.
3. **Alternatives** — every other viable line the sweep surfaced, including
   *don't-engage* and *walk-away*, ranked by transparent, overridable criteria
   (success odds, cost, reversibility, downside, ethical exposure). The ranking
   organizes the choice; it doesn't make it.
4. **Assumptions & triggers** — what the line depends on (flag the opponent read —
   usually the weakest-evidenced part), and the signals that should force a change of
   course.

**Definition of done** — converge only when the line is: tied to the real objective ·
survives the opponent's likely counter · carries named triggers-to-rethink · and has
the key reads confidence-banded. If any fail, loop back to Step 2. What you surface to
the operator is exactly this: the line, its counter, the ranked alternatives, and the
triggers.

## The five facets (the Strategic Picture)

The picture is built from these five. Each has an opening question and a lens it
pulls from.

| Facet | The question it asks | Pulls from |
|---|---|---|
| **Standing** | Where does each side stand — strengths, weaknesses, yours and theirs? | Art of War (know-both, five fundamentals, strength vs. weakness) |
| **Drift** | Which way is the board moving on its own, whatever either side does? | Art of War (terrain & timing; momentum) |
| **Aims & Options** | What does each side want, how badly — and what can each *do* about it? | objective stop-rule + 36 Stratagems (to generate non-obvious options) |
| **Depth** | How many moves ahead is each side really thinking — can I sit one level above? | Game Theory & Mental Levels (level-k) + Five Rings ("become the enemy") |
| **Principles** | Zero- or positive-sum? One-shot or repeated? Any dominant move or classic pattern? | Game Theory & Mental Levels + all three classics |

Render the picture as markdown that fills in as you work:

```
## Strategic Picture — <situation>
- **Objective:** <the real end, not the tactic>   **Stage:** before / mid / reviewing
- **Standing:** <each side's strengths & exposures>
- **Drift:** <which way the board is shifting on its own>
- **Aims & Options:** <each side's weighted aims; the option set>
- **Depth:** <each side's reasoning level; the move one above theirs>
- **Principles:** <zero/positive-sum; one-shot/repeated; dominant move; patterns>
- **Residual:** <anything outside the four lenses>
- **Confidence:** <what's known vs. assumed — flag the opponent read>
```

## Signal → lens routing (pull, don't march)

Let what the situation presents pull the lens, rather than running a fixed 1-2-3:

| When the situation signals… | Pull |
|---|---|
| "stuck / blocked / out of options" | **36 Stratagems** — find the indirect move |
| "should I even do this? / outmatched" | **Art of War** — positioning; maybe don't fight |
| "I know *what*, not *when* or *how*" | **Five Rings** — timing, rhythm, initiative |
| "what will they do? / how deep are they? / we'll face them again" | **Game Theory & Mental Levels** — structure and depth |

Cover all five facets regardless; the routing decides *order and emphasis*, not
whether a facet is worked.

## The Lens Ledger (a section of the working canvas)

The completeness artifact — **not a separate mandatory file**, but a section of the
scaled working canvas (`references/working-canvas.md`): reason it inline for quick
self-checks; give it a canvas file for high-stakes / long / auditable work, per §1D.

```
## Lens Ledger — <situation>
| Facet / Lens | Status | Findings |
|---|---|---|
| Standing (Art of War)              | pending | |
| Drift (Art of War)                 | pending | |
| Aims & Options (36 Stratagems)     | pending | |
| Depth (Game Theory + Five Rings)   | pending | |
| Principles (Game Theory + classics)| pending | |
| Residual angle                     | pending | |
```

Flip each to `complete` with its concrete read (or "no new findings"). Complete rows
mean broad coverage, not proof nothing was missed — the residual row is the guard.

## Cross-cutting disciplines

**Model the other side — every turn.** Strategy is interaction. Hold the opponent's
perspective continuously: what they want, fear, and will do next. In Provoke /
war-game mode, *become* them and argue their best play, at realistic competence,
stated. A plan that only works if they stay still isn't a strategy. (This is the
Depth facet, run continuously.)

**Win-Without-Fighting bias — and its defeaters.** The oldest principle here: the
highest victory avoids the costly fight (thwart their plan, change the ground,
secure the aim so the contest never happens). Ask whether the battle is worth
fighting before optimizing how to win it. But this is a *default, not a law* — when
speed, surprise, first-mover advantage, deterrence, or a closing window favor
decisive early action, *initiative beats patience* (the Five Rings counterweight).
Name which one *this* situation rewards; don't default to "don't fight" blindly.

**Ethics & Proportionality guard.** This framework helps with *legitimate* strategy:
competition, negotiation, career and business positioning, sport, games, debate,
navigating conflict. It does **not** help plan deception that defrauds, manipulates
vulnerable people, coerces, breaks the law, or harms others — a stratagem that
depends on someone trusting you so you can hurt them is a liability and a wrong.
When a move shades from competitive positioning (out-preparing, controlling what
you're entitled to control, shaping a fair negotiation) into manipulation or harm
(lying to someone who relies on you, exploiting a vulnerability, deceiving where
good faith is owed), name the line and redirect to a legitimate line for the same
objective. Keep two reasons distinct: it's *wrong*, and it's *usually imprudent* —
in repeated games and relationships, exposed deception destroys the trust the rest
of the strategy needs. The prudential point is a strong tendency, not a law.

**Externalize when complex.** Several actors or branches → reach for a visual model —
an actor / force map or a move-countermove timeline (`references/visual-models/structure.md`) —
instead of more prose. Band the key reads per the parent skill's Analytic Confidence,
especially the opponent read.

## The review loop (across sessions)

Strategy is a plan *plus* the conditions for changing it. When a strategy plays out,
the highest-value follow-up is to compare the opponent's *actual* move to the read —
the gap calibrates the next opponent read. If the situation is in the "reviewing"
stage, run this; it's the only thing that makes the framework learn.

## Lens quick reference

- **The Art of War** — know yourself and the other across the five fundamentals; win
  first then fight; subdue without fighting where you can; avoid strength, strike
  weakness; use the ground.
- **The 36 Stratagems** — six families of indirect moves (attack what they must
  defend; change the ground; let it ripen; trade small for large; misdirect; the
  honorable exit), distilled from the full canonical thirty-six.
- **The Book of Five Rings** — timing and rhythm (find theirs, break it); perceive
  the deep intention; no fixed stance; take the initiative; act from a clear mind.
- **Game Theory & Mental Levels** — map the game; zero- vs positive-sum; dominant
  moves and equilibria; aim one mental level above your opponent; commitment and
  credible signaling; one-shot vs. repeated.

## Reference index

- `references/strategic/art-of-war.md` — positioning lens (Sun Tzu): five fundamentals,
  win-without-fighting, win-first-then-fight, strength vs. weakness, terrain, economy
  of force, with detection questions.
- `references/strategic/thirty-six-stratagems.md` — move-finding lens: the full canonical
  36 in their six traditional chapters (with ethics flags) plus six functional families
  and the ethics line.
- `references/strategic/book-of-five-rings.md` — execution lens (Musashi): the five books,
  timing & rhythm, initiative, no-fixed-stance adaptability, perception vs. sight.
- `references/strategic/game-theory-and-mental-levels.md` — structure-and-depth lens:
  mapping the game, zero/positive-sum, equilibria and the cooperation trap, level-k
  depth calibration, commitment & signaling, repeated games.

## Optional full-text annexes

The four lenses under `references/strategic/` are purpose-built working distillations —
that's the layer you reason with. Full public-domain **source texts** live under
`references/strategic/annexes/` for reference only; currently the complete Lionel Giles
translation of *The Art of War* (`references/strategic/annexes/art-of-war-full.md`),
backing `references/strategic/art-of-war.md`. Reach for an annex only to check a
distillation against the source — don't run the framework out of it.
