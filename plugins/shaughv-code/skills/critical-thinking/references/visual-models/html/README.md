# Interactive HTML references — one per mental model

Thirteen standalone, self-contained interactive HTML templates — one for each Thinker's-Toolkit
mental model, plus the sensemaking triage card (#13, for dense hand-backs — see
`../../sensemaking.md`). Each file is a reusable starting point for the **interactive externalization** move
described in `../interactive.md`: when a static markdown model still isn't breaking through for an
overloaded human, open the matching template, swap in the real situation, and let them poke at the
live model instead of re-deriving it in their head.

Each file:

- is a single `.html` with no dependencies, no build step, no network calls, and all state in
  memory — open it directly in a browser;
- is dark-mode aware (follows the OS setting) and uses a neutral example dataset;
- opens with a one-line *when to use* and a dashed *template note* saying exactly what to swap;
- ends in a *reading* — the one-paragraph "what it surfaces" that turns the visual into a decision.

| # | File | Model | What the human perturbs |
|---|------|-------|--------------------------|
| 1 | `01-pros-cons-fixes.html` | Pros / cons & fixes (side by side) | Which cons are truly unfixable |
| 2 | `02-sorting-timeline.html` | Sorting, chronologies & timelines | The sort key / lens |
| 3 | `03-causal-flow.html` | Causal flow diagram | Which node to inspect |
| 4 | `04-matrix-2x2.html` | The 2×2 matrix | Item placement |
| 5 | `05-decision-tree.html` | The decision / event tree | Which branch is committed |
| 6 | `06-weighted-ranking.html` | Weighted ranking | Criterion weights |
| 7 | `07-hypothesis-testing.html` | Hypothesis testing | Each evidence verdict |
| 8 | `08-devils-advocacy.html` | Devil's advocacy | Which assumption is cracked |
| 9 | `09-probability-tree.html` | The probability tree | Each stage's probability |
| 10 | `10-utility-tree.html` | The utility tree | Leaf weights / utilities |
| 11 | `11-utility-matrix.html` | The utility matrix | P(state of the world) |
| 12 | `12-advanced-utility.html` | Advanced utility (MAU + tornado) | The driving uncertainty |
| 13 | `13-triage-card.html` | Sensemaking triage card (dense hand-back) | Nothing — it's a read-once card; swap the DATA object |

Discipline before shipping any of these to a person (see `../interactive.md`): verify the live
model's numbers actually match the written reading next to it, and fix whichever is wrong. A
worked example wiring all twelve to one real situation lives in the conversation that produced this
skill update (the "M3 Thinker's Toolkit" gallery).
