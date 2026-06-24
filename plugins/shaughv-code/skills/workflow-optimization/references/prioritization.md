# Prioritizing Improvements

This file supports **Step 5 (Converge)** — turning the Lens Ledger's findings into
a ranked shortlist of improvement opportunities.

## The neutrality rule

The shortlist is **ranked, but neutral**. That is not a contradiction. The skill's
job is to:

1. Surface **every** improvement opportunity found in the Sweep — drop nothing,
   pre-decide nothing.
2. Organize them by **transparent criteria the user can see and overrule.**
3. Let the **user** make the final priority call.

A ranking is a *structuring aid*, not a verdict. Always show the criteria and the
scores openly, so the user can disagree with a placement and re-rank. Never
collapse the list to "just do this one" — present the whole field, ordered, with
the reasoning visible. The user owns the decision; the skill owns the analysis.

## The default ranking method — Impact / Effort

Use this unless the user asks for something else. For each improvement
opportunity, rate two dimensions, simply (High / Medium / Low is enough — false
precision helps no one):

- **Impact** — how much this would improve the workflow against its goal
  (throughput, cost, quality, speed, customer satisfaction). Tie it to the
  workflow's actual goal from Step 1.
- **Effort** — how much work, cost, disruption, and risk the change requires.

This yields the classic four quadrants:

| | Low Effort | High Effort |
|---|---|---|
| **High Impact** | **Quick Wins** — do first | **Major Projects** — plan deliberately |
| **Low Impact** | **Fill-ins** — do if convenient | **Thankless** — usually skip |

Present the shortlist grouped by quadrant, Quick Wins first. This is the same idea
as Six Sigma's **Pick chart** (Possible / Implement / Challenge / Kill).

## Additional lenses on priority — offer these where relevant

The impact/effort grid is the default. These sharpen it; bring them in when the
findings call for it:

- **The constraint test (Theory of Constraints).** Does the improvement act on the
  workflow's *constraint*? An improvement to a non-constraint produces little
  system-level gain no matter how cheap it is. Flag, for each item, whether it
  targets the constraint. This often reshuffles the ranking — and it is the single
  most important cross-check. Present it as TOC's strong input, not as an override.
- **Pareto / 80-20 (Six Sigma).** Do a small number of the findings account for
  most of the workflow's lost time or defects? If so, those "vital few" rise.
- **Cost of delay.** What does it cost to *not* fix this, per week or month it goes
  unaddressed? A high cost of delay can lift an item even if its raw impact looks
  moderate. Useful for sequencing.
- **Criticality / risk.** Does the finding touch safety, compliance, legal
  obligations, or a single point of failure? Necessary conditions (safety, legal)
  come before optimization — they are not traded off against impact.
- **ROI.** Where impact and effort can be quantified in money or time, a simple
  return-on-investment estimate makes the ranking concrete.
- **Radical vs. incremental (BPR).** If the BPR lens concluded the workflow is
  fundamentally outmoded, note that incremental items may be partly moot — a
  redesign could supersede them. Surface this honestly so the user is not
  optimizing a process they are about to replace.

## Producing the shortlist

1. List **every** finding from the completed Lens Ledger. Group obvious duplicates
   (the same issue caught by several lenses) into one item — and note which lenses
   flagged it, since multi-lens agreement is itself a signal of importance.
2. Rate each on Impact and Effort.
3. Add the constraint test: mark which items act on the constraint.
4. Apply any other priority lens that the findings warrant (Pareto, cost of delay,
   criticality, ROI).
5. Present the shortlist as a table — every item, its scores, the lenses that
   found it, and a one-line "why." Order it (Quick Wins → Major Projects → Fill-ins
   → skip), but keep every item visible.
6. State the criteria you used out loud, and invite the user to re-rank. Make clear
   the ranking is theirs to change.

### Suggested shortlist format

```
## Improvement Shortlist — <workflow name>

| # | Improvement | Found by (lenses) | Impact | Effort | On constraint? | Why it matters |
|---|-------------|-------------------|--------|--------|----------------|----------------|
| 1 | ...         | Lean, TOC         | High   | Low    | Yes            | ...            |
| 2 | ...         | Six Sigma         | High   | High   | No             | ...            |
| ... |

Ranking criteria used: Impact (vs. the workflow's goal), Effort (work + cost +
risk), and the constraint test. This ordering is a starting point — tell me if
you'd weight anything differently and I'll re-rank.
```

## Watch-outs

- Do not let the ranking quietly bury a finding. Low-impact items still appear on
  the list — labelled low — so the user sees the full picture and decides.
- Impact/Effort is a judgment call. Keep ratings coarse (High/Med/Low), show the
  reasoning, and treat them as discussable, not final.
- If the workflow is being *designed new* rather than fixed, the "shortlist"
  becomes a list of design choices to get right from the start — same method,
  framed as "build it this way" rather than "change this."
