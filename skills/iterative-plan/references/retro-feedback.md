# The Retro / Feedback meta-loop

This is the step that makes `iterative-plan` *learn*. It runs **after the gate, before the re-plan** — the moment the slice's work is validated (or failed) and known-good, but before you reshape the spine and scope the next slice. That timing is deliberate: the slice is fresh, the surprises are still vivid, and the cost of capturing them is lowest. Wait until the milestone is over and the detail is already gone.

The reason this matters is structural, not bureaucratic. A later milestone repeated an earlier milestone's exact mistakes three days after the fix was written down — because nothing in the ritual *forced* the lesson from where it was learned (execution) back to where it was needed (the next plan). A rule in a file is passive; it waits to be read. This loop is the obligation that makes the lesson active. Skipping it is how you re-learn the same thing every milestone.

---

## Two depths — match the depth to the cadence

Running a full post-mortem after every thin slice would become its own anti-pattern: ceremony the team quietly stops doing. So there are two depths, and you pick based on what just happened:

- **Per-slice (lightweight, ~2–4 min).** The default at every gate. Three quick questions, one per feedback type. Capture, don't solve. Feeds the immediate re-plan.
- **Per-milestone (full post-mortem, ~15–30 min).** At milestone close, or any time a slice went badly enough to warrant it (a failed gate, a stop-the-line halt, a slice that took 3× expected). The full structure below.

When in doubt, run the lightweight version. A captured one-liner beats a skipped post-mortem.

---

## The three kinds of feedback (gather all three, keep them separate)

The discipline here is **separation**. These three are gathered as distinct passes because they fail in different ways, and mixing them lets the loudest one crowd out the others. Gather first; do not solve while gathering (see the firewall below).

### 1. Informational feedback — *what was off, NOT what to do about it*

This pass names what went wrong and stops there. It deliberately does **not** propose the question that should have been asked, the check that should have run, or the change to make. That restraint is the whole point: premature solutioning ("we should have asked about rate limits") skips past *other* things that were also off, because the first plausible fix feels like closure. Name every way the plan diverged from reality first; convert to solutions later, in the re-plan.

Prompts:
- Where did the plan and reality diverge? (List them. Don't fix them yet.)
- What did the slice scope assume that turned out false?
- What surfaced during dispatch that the plan didn't account for?
- Did any task's success criterion turn out to be unverifiable or wrong?

The output is a *list of divergences*, flatly stated. Resist every urge to append "...so next time we should." That's the re-plan's job.

### 2. Internal feedback — *intuition and perspective*

This is the signal that lives in the operators' heads, not in any log. It's the "I had a bad feeling about that slice size before we started" and the "this felt harder than it should have." Tacit knowledge is real data; it's often the earliest warning, and it evaporates fastest, so capture it explicitly.

Prompts:
- What felt off before or during this slice, even if you couldn't name why at the time?
- Was the slice the right size? Too big, too small? What's your gut say now?
- Where did you feel overloaded, lost, or unsure what was verified-working? (That's a stop-the-line signal worth recording even if you pushed through.)
- If you ran this slice again tomorrow, what would you do differently on instinct?

Capture the operator's *exact words* where they carry specific meaning — "it felt like I was holding too much" is more useful raw than paraphrased into "context overload."

### 3. External feedback — *what the system told you*

The objective record: error codes, failed deploys, stack traces, the API 429, the false-red freshness tile, the data-quality check that flagged, the test that failed, the merge conflict. This is the least biased of the three and the easiest to lose, because logs scroll away. Pull it from the actual artifacts, not from memory.

Prompts:
- What errors, failures, or warnings did the system actually emit? (Quote them — real codes, real messages.)
- What did the gate's validation reveal that we didn't expect to see?
- Did anything in the standing-checks list (auth, rate limits, grant ordering, freshness) bite — and was it on the list or a new one?
- What did the data/metrics say vs. what we predicted? (If there was a baseline, how did we move against it?)

---

## The gather/solve firewall

Gather all three passes **before** proposing a single fix. This is the single most important discipline in the loop, borrowed from the retrospective tradition (Derby & Larsen's "Gather Data" stage is held separate from "Generate Insights" for exactly this reason). Mixing them produces *satisficing* — you grab the first fix and stop looking, missing the divergences that fix doesn't address.

Concretely: complete the informational list, the internal list, and the external list. Only then move to the re-plan, where solutions are allowed.

---

## The full per-milestone post-mortem structure

Use this at milestone close or after a bad slice. It wraps the three feedback passes in a post-mortem on the *whole* planning chain — was the plan right, were the tasks right, did execution succeed?

Open with Kerth's Prime Directive to keep it blameless: *everyone did the best they could with what they knew at the time.* The point is the system, not the person.

1. **Outcome.** Did the milestone/slice meet its demoable success criterion? Binary. If partial, what shipped vs. what didn't.
2. **The plan.** Was the spine right? Did slices land in the order that made sense, or did we reshape mid-flight (and was the reshape cheap or expensive)? Did the first slice turn out to be the right thinnest cut?
3. **The tasks.** Did the tasks created actually map to the work? Were any unverifiable, mis-scoped, mis-routed (wrong executor), or never needed? How many tasks were added/cancelled vs. the first pass — and was that healthy discovery or scope inflation? (The milestone-inflation receipt: 50→107 was the tell.)
4. **The execution.** Where did dispatch reveal what planning missed? How long did the loop take from scope to validated gate? Did we have to stop the line? Did the git posture hold (one workbranch) or pile up (the multi-branch batch tell)?
5. **The three feedback passes** — informational, internal, external (above), each as its own list.
6. **Promotion decisions.** Now — and only now — convert. For each captured item, decide: is this a one-off (log it and move on), or has it recurred ~2–3 times and earned promotion into a skill? Recurring items become a new standing check (`standing-checks.md`), a new anti-pattern (`anti-patterns.md`), a splitting pattern, or an edit to `iterative-plan` itself (the success-criterion section) or a sibling skill like `git-workflow` — whichever owns it. **Name the promotion as an action with an owner**, not a someday-maybe. This is the arrow that was missing when one milestone repeated another's mistakes.

---

## What "done" looks like for this phase

You've run the retro well when: all three feedback passes are captured as separate lists, no solution was proposed before gathering finished, and every recurring item has either been logged or assigned a promotion. Then — and only then — proceed to the re-plan with the divergences in hand. The re-plan is where informational divergences become the questions the *next* slice's scope will answer.
