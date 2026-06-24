# agent-assisted-debugging.md

The Mode 2 formal protocol describes the Operator's (or autonomous Agent's) debugging discipline. Often the Operator is **debugging alongside an Agent** (Claude Code is the default coding-Agent runtime, also GitHub Copilot, Cursor, Aider, ChatGPT). This file is the Agent-collaboration adaptation — what changes about each beat when an Agent is in the loop, what new failure modes emerge, and what to invoke when.

> **Vocabulary.** **Operators** are the people driving the debug session (you or a teammate) and **Agents** are AI coding teammates. Both can run the Mode 2 protocol. This file describes the most common configuration — one Operator paired with one Agent — beat-by-beat.

## The five operating principles

1. **The Agent accelerates spotting problems, but Operator judgment decides the fix.** The Agent is a pair programmer, not an autopilot. The Operator signs off on every change; the Agent proposes and reasons.
2. **"Fix this" is the fastest way to hallucinate.** Context determines quality. Always gather context before suggesting solutions. A short, vague prompt invites the Agent to invent a plausible-looking fix that addresses a plausible-looking bug — neither of which is real.
3. **Symptom fixes are not root-cause fixes.** The Agent is biased toward producing code that "makes the error go away" because that is the visible success signal. The Operator is responsible for pushing past that to *why*.
4. **Two failed attempts = change approach.** After two Agent fix proposals that didn't work, STOP accepting code suggestions. Pivot to manual investigation: instrument, log, run with a debugger, write a minimal repro, check git history.
5. **Every fix must be explainable.** If the Operator can't explain the fix to another teammate in one sentence, it's not ready to ship.

These map cleanly onto the Mode 2 beats — they are not a separate protocol, they are the Agent-collaboration discipline layered on top.

## Bug classification — by Agent diagnostic value

Different bug shapes have different Agent ROI. Knowing which category you're in before you start determines how to work with the Agent.

| Category | Symptom | Agent diagnostic value | How to work with the Agent |
|---|---|---|---|
| **Clear error with stack trace** | Exception + stack + line number + error code | **High.** The Agent usually identifies the cause from the error signature alone. | Paste the FULL stack trace + the file at the offending line + recent git diff. Ask for interpretation, then the most targeted fix with reasoning. |
| **Logic bug in a single function/module** | Wrong output for known input; no error | **Good.** The Agent can step through and surface the divergence between intent and behavior. | Ask the Agent to walk through what the code DOES; the Operator walks through what the code SHOULD do. The diff is the bug. Use Socratic mode. |
| **Behavioral bug with no error** | "It just doesn't work as expected." Often UI / async / state-management. | **Moderate.** The Agent can help write targeted tests and logging to surface the failure. | Don't ask for a fix yet. Ask the Agent to suggest targeted log statements or test cases that would expose the divergence. Run them; bring the data back. |
| **Multi-system / distributed bug** | Failure crosses process / service / network boundaries | **Lower.** The Agent can only see what you show it; cross-system reasoning requires the Operator to be the integrator. | Ask the Agent to help map the components, generate hypotheses, and write instrumentation. Be honest with the Agent (and yourself): it cannot see your network, your queues, and your databases simultaneously. |
| **Intermittent / race condition** | "Works most of the time"; reproduces 1 in N runs | **Lowest** for direct fixes. | Ask the Agent for stabilization strategies (more aggressive logging, deterministic test inputs, concurrency-pattern analysis). Do NOT ask for a fix until you can reproduce reliably. |
| **Performance issue** | Correct output, but too slow / too much memory / too many queries | **Moderate.** The Agent can suggest profiling strategy, identify hot paths, propose measurement. | Profile FIRST. Bring the profiler output to the Agent. Without the profile, Agent suggestions are guesses about what's slow, which are almost always wrong. |

**When in doubt, classify out loud.** Tell the Agent which category you think this is. Its response will be calibrated to that category; if you're wrong about the category, the response will be wrong-shaped in a way that signals the misclassification.

## The Agent-Operator beat-by-beat

Each Mode 2 beat with the Agent-collaboration motion that applies. The Operator drives; the Agent assists.

### Beat 1 — Stabilize

**Operator's job:** identify the failing scenario.
**Agent's job:** help construct a minimal repro. Ask "what's the smallest input that reproduces this?"

**Anti-pattern:** asking the Agent to fix the bug before stabilization. The Agent will happily propose a fix to a *description* of a bug — and that fix will be a guess. Until you can show the Agent the actual failure (paste the stack trace; paste the failing output; share the repro command), every Agent proposal is theatre.

### Beat 2 — Locate

**Operator's job:** decide WHICH binary search axis (code, data, time, layer) is most likely to narrow scope.
**Agent's job:** propose specific log statements / specific git-bisect markers / specific test cases that execute the binary search.

**Use the Agent for:** "Given this stack trace and this recent diff, which lines in the diff are most likely the cause? Rank them."

**Don't use the Agent for:** "Find the bug." That's a request to hallucinate. The Agent doesn't know which layer to suspect without your evidence.

### Beat 3 — Hypothesize

**Operator's job:** state the hypothesis. The Agent's hypothesis becomes the Operator's hypothesis only after the Operator endorses it (or modifies it).
**Agent's job:** generate 2–3 hypotheses, ranked by likelihood, each with a specific way to confirm or rule out.

**The confidence-calibration habit.** When the Agent proposes a hypothesis, ask for a confidence: "How confident are you in this — high / medium / low?" Well-calibrated Agents will say "70% — if this is wrong, the next thing I'd check is X." Poorly-calibrated Agents will say "very confident" about everything; that itself is signal that you should weight that hypothesis lower.

### Beat 4 — Verify

**Operator's job:** run the experiment. Read the result with the Agent in the loop.
**Agent's job:** interpret the result — does it support, contradict, or partially support the hypothesis?

**Critical move:** when the Agent claims the experiment supported the hypothesis, ask "what would a contradicting result have looked like?" If the Agent can't articulate a falsifying outcome, the "experiment" wasn't an experiment — it was a search for confirmation.

### Beat 5 — Fix

**Operator's job:** read the proposed fix. Confirm you can explain it in one sentence. Confirm it's at the source layer, not the consuming layer.
**Agent's job:** propose the fix WITH the reasoning. Never accept "change X to Y" without "because Z."

**The explainability test.** Before accepting the fix, write a one-sentence explanation in your own words. If you cannot — if you have to copy the Agent's reasoning back verbatim — you don't understand the fix yet. Keep asking the Agent questions until you do.

**The symptom-vs-cause check.** Ask the Agent: "Is this a root-cause fix or a symptom fix?" A well-calibrated Agent will say: "This addresses the immediate symptom; the deeper question is why X is null in the first place. You may want to investigate Y to find the root cause." If the Agent claims root-cause and the fix looks like a band-aid, push back.

### Beat 6 — Regression-test

**Operator's job:** ensure the failing test is written FIRST. Run it RED. Apply the fix. Run it GREEN.
**Agent's job:** generate the test (when asked), run the suite, report results.

**Don't let the Agent skip TDD because "the fix is obvious."** The Agent's bias toward speed will produce a fix without a test if you don't insist. The test is the regression guarantee; the fix without the test will be re-broken in three months.

### Beat 7 — Look for similar defects

**Operator's job:** define the search predicate (the bug shape) and the search scope (which directories, which entities, which integrations).
**Agent's job:** run the search. Grep the codebase. Read sibling modules. Report findings.

**This is one of the highest-leverage Agent uses.** The Agent can grep 200 files in seconds; the Operator can't. Define the pattern precisely ("any function that reads from the integrated `projects` table's `contact` column without first checking the field-mapping config's projected column list"), then let the Agent search.

## When to frame the session explicitly

It's worth giving the Agent an explicit debugging frame (assume a senior-debugging-advisor role, walk through context-gathering → classification → hypothesis → fix → verification) when:

- The Operator wants to **start a debugging session from scratch** with a clear protocol rather than firing off ad-hoc prompts.
- The Operator is **handing off** to another Operator who hasn't been part of the debug session — an explicit frame lets them pick up cleanly.
- The bug is **complex enough** to warrant the full structured walk and the Operator doesn't want to remember the discipline beat by beat.

In a normal Claude Code session, the `debugging-framework` skill (this skill) plus this file are usually enough — the skill carries the protocol, this file carries the Agent-collaboration discipline. The explicit frame is most useful for handoffs between Operators, or when you want the full Socratic interrogation.

## The output structure (when the Agent is reporting)

A five-section response format keeps an Agent's debug report disciplined:

- **Analysis** — what the Agent observes from the information provided. Facts only, no speculation.
- **Hypothesis** — best assessment of cause, with confidence and reasoning. (May be multiple, ranked.)
- **Suggested fix** — specific change with explanation. Flagged as root-cause OR symptom.
- **Verification** — how to confirm the fix works (test case, manual check, log assertion).
- **Caveats** — uncertainty, limitations, deeper issues worth investigating.

Use this structure when reporting on a complex debug step to the Operator; skip it when the response is trivial. The point is *each section is a separate cognitive object* — analysis must not contaminate hypothesis must not contaminate fix.

## Anti-patterns specific to Agent-assisted debugging

| Anti-pattern | What it looks like | What to do instead |
|---|---|---|
| **"Fix this" prompting** | One-line prompt pointing at a file. The Agent proposes a plausible fix without seeing the actual failure. | Paste the full stack trace, the failing output, the repro command. The Agent's quality is bounded by the context you provide. |
| **Accepting unexplained fixes** | "This should work" / "Try this" with no reasoning. | Refuse. Demand the reasoning. If the Agent can't explain WHY the fix works, the fix is a guess — and a guess from the Agent is no better than a guess from you. |
| **Chaining 4+ Agent fix proposals** | First fix doesn't work, ask for another, doesn't work, ask again, etc. | After TWO failed proposals, stop. Pivot to instrumentation. The next proposal will be a guess on top of two wrong guesses. |
| **Letting the Agent skip TDD** | "Here's the fix" — no test. | Insist on the failing test FIRST. The Agent's speed bias will skip TDD if you let it. |
| **Treating Agent confidence as truth** | The Agent says "very confident" — the Operator ships without verification. | Calibrate. Ask the Agent for the confidence level. Weight low-confidence proposals as hypotheses, not conclusions. |
| **Overloading context** | Pasting the entire codebase / 30 files into the prompt. | Be selective. The Agent's attention degrades with context bloat; the most-relevant 200 lines beat the most-comprehensive 20,000. |
| **Asking the Agent to debug what it cannot see** | Asking about prod behavior the Agent has no access to. | The Agent sees only what you show it. For prod bugs: paste the prod log, paste the prod query result. Don't ask it to imagine prod. |
| **Treating the Agent as the Operator** | Letting the Agent sign off on the fix; the Operator not reading the diff before commit. | The Operator is responsible for every line that ships. Agent-proposed = Operator-reviewed = Operator-accountable. |
| **Skipping the postmortem because "the Agent fixed it"** | Bug gone, no write-up. | Same protocol applies. The fact that the Agent proposed the fix doesn't change the postmortem warrant. Record what shape the bug was, what allowed it, and any skill-update candidates. |
| **Autonomous Agent acting without an Operator review gate** | An Agent ships a non-trivial fix to main without an Operator sign-off. | For non-trivial fixes, the Agent posts the hypothesis + proposed fix as a CONTEXT / QUESTION / OPTIONS write-up and waits for Operator sign-off — the equivalent of "please review this diff." See § "When the Agent is debugging autonomously" below. |

## A worked Agent-assisted Mode 2 example

> **Bug.** A query against the `ProjectReport` table returns 0 rows for a filter that should match ~120.
>
> **Beat 1 — Stabilize.** Operator pastes the exact query into the Agent. Agent: "Can you confirm this query worked yesterday? Can you paste a query against a related entity to confirm the connection is alive?" Operator runs the related-entity query — returns rows. So the connection is fine; the entity-specific query is the failure. Stable.
>
> **Beat 2 — Locate.** Operator: "What's most likely to cause an empty result set with no error on an entity that worked yesterday?" Agent proposes three hypotheses ranked by likelihood: (a) the entity config was edited and now references a column that doesn't exist in the underlying view (silent no-match); (b) the view was edited and dropped a column the entity depends on; (c) the entity's filter clause was edited.
>
> **Beat 3 — Hypothesize.** Operator pulls up `git log` on the entity config. Agent: "The most recent commit renamed `tenant_id` to `tenant_code`. Is the underlying view's column also renamed?" Hypothesis: "The entity references `tenant_code` but the view still exposes `tenant_id`." Confidence: 80%.
>
> **Beat 4 — Verify.** Operator dumps the view's column list. `tenant_id` is still there; `tenant_code` is not. Hypothesis confirmed.
>
> **Beat 5 — Fix.** Agent proposes: "Rename the view column to `tenant_code` AND verify all other consumers of `tenant_id` are updated." Operator: "Wait — that would break the other consumers. Is the right fix to revert the entity rename, or to also rename the view?" Agent: "If `tenant_code` is the intended canonical name, rename the view and all consumers. If the entity rename was premature, revert it. Which canonical name does the team prefer? — that's a design decision, not a debugging decision." Operator makes the call: rename the view and audit consumers.
>
> **Beat 6 — Regression-test.** Operator writes a test that asserts the entity returns ≥1 row for a known-good filter. Runs it RED before the fix. Applies the fix. Runs it GREEN. Runs the full test suite.
>
> **Beat 7 — Sweep.** Operator: "Grep the entity-definitions directory for any other column reference that doesn't exist in the underlying view." Agent runs the grep, finds two more — same shape, same root cause, same fix. All three ship as one commit.
>
> **Postmortem.** Operator (or Agent — whoever wrote the trail): "Bug shape: config ↔ schema drift. What allowed it: the entity config and the view definition are two separate surfaces with no schema-agreement check between them. A rename in one without the other is silent. Sweep found 2 sibling cases, fixed in the same PR. Skill-update candidate: codify a schema-agreement check as a `defensive-programming` rule, OR ship a pre-deploy validator that diffs entity column lists against the view's columns."

The Agent's contribution was: structuring the hypotheses, running the grep, surfacing the design question disguised as a debugging question. The Operator's contribution was: pasting context, picking the canonical name, signing off on the fix, writing the test, recording the postmortem. **Pair programmer, not autopilot.**

## When the Agent is debugging autonomously

When an Agent is debugging without an Operator actively at the keyboard, the protocol is the same — but the **review gate moves to a written check-in**.

- The Agent runs the Mode 2 beats end-to-end as normal.
- For non-trivial fixes (anything that would qualify as Mode 2 in the first place), the Agent **posts a check-in** before applying the fix, with a CONTEXT / QUESTION / OPTIONS format:
  ```
  CONTEXT: <one paragraph — what was investigated, what was found>
  QUESTION: <should I apply this fix?>
  OPTIONS: A) apply as proposed; B) modify <specific way>; C) different approach
  ```
- The Agent waits for Operator response before applying. This is the autonomous-Agent equivalent of "please review this diff."
- For Mode 1 trivial fixes (typo, missing import, single-character correction), the Agent applies, then reports the result. No pre-approval needed.

This protects the codebase from speed-biased autonomous fixes while preserving the Agent's ability to do the up-front investigation independently.
