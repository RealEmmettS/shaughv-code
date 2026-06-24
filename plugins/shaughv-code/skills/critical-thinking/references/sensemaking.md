# Information Triage / Sensemaking — the overload front door

This framework exists for the moment the *volume of inputs* is the problem — when the user
cannot even name the question yet because there is too much material between them and it.
It is a front door, not a destination: a triage session **always exits** into another
framework, a named next action, or an explicit archive. If the user already knows their
question, skip this framework entirely.

Grounding: Pirolli & Card's intelligence-analysis model (a *foraging loop* — find, filter,
schematize — feeding a *sensemaking loop* — hypotheses, decisions, with constant
backtracking), MECE issue trees, BLUF, and progressive disclosure from cognitive load
theory. You don't need the theory to run the steps; it explains why they're ordered this way.

**Not this framework:** emotional overwhelm (→ Contemplating), task/time overload
(→ personal-productivity), a clear empirical question (→ Scientific Inquiry directly).

## The two genres

| Genre | Looks like | Run |
|---|---|---|
| **The input pile** | Many artifacts — transcripts, threads, exports, 14 docs — and no single question | Steps 1–5 below |
| **The dense hand-back** | ONE dense message (often from an agent or teammate) interleaving status, lecture, insight, buried asks, work-in-flight, and constraints | The hand-back procedure below |

A pile can contain hand-backs and vice versa. When in doubt, start with the hand-back
procedure on the densest item — it's faster and often dissolves the pile.

---

## Genre A — the input pile (5 steps)

### Step 1 — Forage (build the input ledger)

Inventory before interpreting. On the canvas, one row per input:

| # | Input | Source / date | One-line gist | Keep / Park / Discard |

Sub-questions to ask while filling it:

- *"What is this, who produced it, and when?"* (provenance before content)
- *"In one line, what does it say or contain?"* (gist, not summary — pointers stay lossless)
- *"Does anything here expire — a deadline, a meeting, a budget window?"* (flag with a date)

Discard means "noted in the ledger, not carried forward" — the ledger row itself is the
receipt. Nothing silently disappears. This is the foraging loop; expect to backtrack.

### Step 2 — Frame (BLUF the pile)

- *"What decision or action could this pile possibly feed?"*
- *"Who is waiting on something from you because of this material?"*
- *"If you ignored all of it for a week, what would actually go wrong?"*

If the honest answer to all three is "nothing" — stop. Archive the ledger, close the
session with exit state **Directed: archive**. That is a successful triage.

### Step 3 — Structure (the issue tree)

Build a MECE issue tree from the frame: the framing question at the root, branches that
don't overlap and together cover it. Then **map every Kept input onto a branch.**

- An input that fits no branch is either noise (park it) or evidence the tree is missing
  a branch (fix the tree — this is the valuable kind of surprise).
- A branch with no inputs is a named information gap — it feeds the exit ramp.

The issue tree is the canonical triage visual. Render it in the canvas; escalate to an
interactive model (`visual-models/interactive.md`) when it outgrows a screen.

### Step 4 — Compress upward (progressive disclosure)

Per branch, write the three-resolution stack the skill already defines: **headline** (one
sentence), **structured** (a short paragraph or table), **full** (pointers into the ledger
— never a paraphrase replacing the source). The user reads headlines first and descends
only where needed. This is where the overload actually dissolves: the pile becomes one
screen of headlines with lossless depth behind each.

### Step 5 — Exit ramp (mandatory)

Every triage ends in exactly one of four exits, named on the canvas:

1. **A decision to make** → run Decision-Making on it (the tree's branches are options or criteria).
2. **Something broken** → run Problem-Solving.
3. **A question to test** → run Scientific Inquiry (`scientific-inquiry.md`).
4. **Nothing actionable** → archive, with the ledger as the receipt.

Plus, always: any empty tree branch becomes a named information gap — a Scientific
Inquiry question or a task in your tracker, not a vague "we should look into this."

---

## Genre B — the dense hand-back

For the single dense message read at 5:30pm after a long day. The procedure:

1. **Sort every sentence into five buckets.** Decisions needed from you · Done — FYI ·
   In flight — being handled · Coming later — heads-up only · Constraints/deadlines.
   Every sentence lands somewhere; a sentence that's pure lecture gets compressed to one
   line in the most relevant bucket with a pointer to the original (Reductionism Guard).
2. **For each decision, extract four fields:**
   - **The ask** — phrased binary if at all possible ("throttle now, yes or no?")
   - **What yes does** — effect, cost, reversibility
   - **What doing nothing does** — the default. This is the highest-value field: it tells
     an exhausted reader whether they can go home. If the sender never stated a default,
     that's a question back to the sender, not a guess.
   - **Deadline pressure** — real and dated, or none. "None — safe to answer tomorrow" is
     a finding worth stating explicitly.
3. **Order the output BLUF:** decision block first, then the four FYI buckets, then the
   one-line version of any embedded concept/lecture.
4. **Apply the 5:30pm test before presenting:** a 30-second read must answer — *what do
   they want from me, what happens if I do nothing, what's safe to ignore until tomorrow.*
   If it doesn't, the triage isn't done; compress further.

### Rendering

- In environments that render HTML (Cowork, claude.ai): use the triage-card template at
  `visual-models/html/13-triage-card.html` — decision block prominent with yes/no framing,
  bucket grid below, concept line last.
- In plain Claude Code: the identical structure as canvas markdown — decision table first,
  bucket lists after.

### Worked example (real, 2026-06-09)

An agent hand-back about a data-sync optimization: ~1,000 words interleaving PR status,
a webhook-vs-polling lecture, an insight box, one buried ask, a background research agent,
a future re-architecture proposal, and an API-budget constraint. Triage produced:

- **Decision (1):** throttle the sync polling hourly → daily now? Yes = ~96% fewer wasted
  calls, one-line reversible config. Doing nothing = stays hourly until the proper fix;
  agent explicitly won't act without a yes. Deadline pressure: none.
- **Done — FYI:** tasks 101/102 done; 103 = PR #8; 104 = PR #9 green + backend
  commit; nothing merged, all parked for the user's merge session.
- **In flight:** research agent mapping 20 entities → webhook / incremental / full-refresh,
  docs only, zero API spend.
- **Coming later:** per-entity re-architecture + ADR after research lands; new tasks, not
  hot-patches.
- **Constraints:** API budget exhausted until 19:34 UTC; agent self-throttling.
- **Concept, one line:** webhooks name the exact changed record (~1 call/change);
  the source has no change signal, so hourly polls re-pull ~14k rows to find ~3 changes.

Thirty-second read; one yes/no; nothing burns overnight. That is the standard.
