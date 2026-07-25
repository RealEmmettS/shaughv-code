# anti-patterns.md

The rationalization gallery for debugging. Mirrors `defensive-programming/references/anti-patterns.md` in structure. Each row: the excuse an Operator (or Agent) gives to skip discipline, and the rebuttal that names what's actually being traded off.

Pull this when:
- You catch yourself making one of these excuses.
- Another teammate — Operator or Agent (the Agent in your session) — is making one.
- You are reviewing a PR whose description hints at one — "quick fix to unblock the demo", "added a defensive check", "rolled back, will investigate later".

## Contents

- [The mode-shortcut excuses (skipping Mode 2 when Mode 2 is required)](#the-mode-shortcut-excuses-skipping-mode-2-when-mode-2-is-required)
- [The fix-layer excuses (fixing at the symptom, not the cause)](#the-fix-layer-excuses-fixing-at-the-symptom-not-the-cause)
- [The oracle excuses (erasing regression evidence)](#the-oracle-excuses-erasing-regression-evidence)
- [The sweep excuses (skipping the look-for-similar-defects beat)](#the-sweep-excuses-skipping-the-look-for-similar-defects-beat)
- [The cognitive-trap excuses (where the bug is in your head, not the code)](#the-cognitive-trap-excuses-where-the-bug-is-in-your-head-not-the-code)
- [The trail excuses (skipping the debugging trail)](#the-trail-excuses-skipping-the-debugging-trail)
- [The "spirit vs letter" excuses (the meta-rationalization)](#the-spirit-vs-letter-excuses-the-meta-rationalization)
- [The Agent-collaboration excuses (specific to Agent-Operator pairs)](#the-agent-collaboration-excuses-specific-to-agent-operator-pairs)
- [The closing principle](#the-closing-principle)

---

## The mode-shortcut excuses (skipping Mode 2 when Mode 2 is required)

| Rationalization | Rebuttal |
|---|---|
| *"It's just a small bug, Mode 1 is fine."* | Mode 1 explicitly does NOT apply when the bug is user-visible in prod, touches a write path, or involves system-of-record data. Re-read `references/lightweight-triage.md` § Hard escalation triggers — if any trigger fires, the bug is Mode 2 regardless of size. |
| *"This equivalent Mode 1 attempt might work if I repeat it again."* | Once a route stops changing the evidence, freeze it. Audit the hypothesis, observer, fix layer, and architecture; repeat only under a declared replication plan or with a prediction that discriminates a new cause. |
| *"There's no time for the full protocol, the demo is in an hour."* | Systematic debugging is **faster** than guess-and-check thrashing — the McConnell 20-to-1 statistic is the headline. Under deadline pressure, the protocol is what protects you from shipping a band-aid you'll spend tomorrow morning unwrapping. |
| *"It's intermittent, I can't really repro it, so I'll just guess at the fix."* | Guessing at the fix on an intermittent bug is the worst outcome — at best lucky, at worst makes the bug less frequent without solving it (now it's hard to even know if your fix worked). **Instrument first, fix second.** See `references/bug-shapes.md` § Lock-conflict masquerading. |
| *"It works on retry, so it's transient — just add retry logic."* | Sometimes true; often a lock-conflict-masquerading bug where the retry path is masking a real problem (idempotency replay, partial write, race). Confirm the retry is correct AND the operation is idempotent before declaring it solved. |

---

## The fix-layer excuses (fixing at the symptom, not the cause)

| Rationalization | Rebuttal |
|---|---|
| *"The fix at the source is out of scope — I'll add a null check at the consumer."* | A null check at the consumer is a symptom-hack (Code Complete §23, page-575 — "special-case makeup that changes the symptom but not the problem"). It silences THIS consumer and guarantees the next consumer will hit the same root cause. Either fix at source, or fix at source AND surface the symptom loudly so future consumers fail fast — never silence without fixing source. |
| *"I'll add a `try/except: pass` around it for now and come back later."* | "Come back later" is the same character defect as TODO comments that ship to prod and outlive the Operator who wrote them. If the exception is expected and recoverable, name the type and handle it; if not, let it propagate. Bare `except: pass` is a silent-failure trap by definition. Cross-ref `pr-review-toolkit:silent-failure-hunter`. |
| *"The library is buggy, I'll work around it."* | The library is wrong roughly 1 in 100 times; you are wrong roughly 99 in 100 (Code Complete §23, page-577 — superstitious debugging). When the library IS wrong, prove it with a minimal repro. Then file a GitHub issue. Then work around it deliberately — with a comment naming the upstream issue. |
| *"This is just how the database / third-party API works — there's nothing we can do."* | Sometimes true; often a refusal to read the vendor's docs / call their support / understand their actual contract. Confirm the vendor's behavior with a minimal repro before declaring it immutable. When it IS the vendor, encapsulate the workaround in the boundary layer, not scattered through consumers. |
| *"The data is wrong, the code is fine."* | Sometimes true; usually means the code that produced the data has a bug the current code is masking. Trace upstream until you find where the bad data was written. Cross-ref `superpowers:systematic-debugging/root-cause-tracing.md`. |
| *"It's clearly an edge case, let me just special-case it."* | Special-casing has its place (truly unique inputs) and its trap (every special case is a future bug that the next consumer triggers). Ask: is this special case a domain truth (only this one tenant has this requirement) or a hack (we don't know why the value is weird, but `if (val == 'weird') return default` makes the error go away)? The first is fine; the second is the symptom-hack anti-pattern. |

---

## The oracle excuses (erasing regression evidence)

| Rationalization | Rebuttal |
|---|---|
| *"I'll write the test after I confirm the fix works."* | When an automated oracle is feasible, a red test written before the fix states what SHOULD happen and proves the test detects the defect. Prefer that sequence. When exact automation is infeasible, preserve the pre-fix failure through the strongest repeatable manual, state-based, statistical, trace, or target-environment oracle before changing code. Cross-ref `superpowers:test-driven-development`. |
| *"This bug is too hard to write a test for."* | Do not use test difficulty to erase the oracle. First try to isolate an automatable seam. If a finite attempt shows exact automation is infeasible, record why, preserve the strongest repeatable alternative oracle, and constrain the claim to what that oracle can actually prove. |
| *"It's just a config / data change, no test needed."* | Config changes break things too. Partition-key changes, env var renames, feature flag flips — all of these have shipped real outages. If the change has a runtime effect, the effect can be tested (deployment smoke test, post-deploy assertion, manual repro script). |
| *"I'll skip the regression test, the manual repro is enough."* | A repeatable manual repro can be the strongest available oracle, but it creates evidence debt because CI cannot replay it. Record the exact steps and raw result, explain why automation is infeasible, and create a follow-up when the risk warrants converting it into an automated regression check. |
| *"Tests are flaky in CI, I'll just merge."* | Flaky tests are a separate bug; treat them as Mode 2 themselves, don't paper over them. Merging through flake is how flake becomes the team's default and the test suite stops being trusted. |

---

## The sweep excuses (skipping the look-for-similar-defects beat)

| Rationalization | Rebuttal |
|---|---|
| *"This bug is unique to this one project / tenant / row."* | Usually wrong. Defects cluster (Code Complete §23, page-591). If the root cause was a field-mapping omission, every other mapping is a candidate. If the root cause was a type-coercion gap, every other URL-state → SQL path is a candidate. The sweep is 10 minutes; finding the second occurrence in prod next week is hours. |
| *"I'll do the sweep next sprint."* | "Next sprint" never comes. The sweep is part of the bug, not an enhancement. The fix isn't done until the sweep is done. Bake the sweep into the same write-up as the fix. |
| *"The sweep would touch too many files."* | Then the bug shape is structural and worth a `defensive-programming` rule (or a `references/bug-shapes.md` entry). Either fix the root structural cause OR document the shape so the next fix-it has 12 minutes of pattern-match instead of 12 hours of investigation. |
| *"Other instances might be intentional."* | They might. The sweep doesn't fix them — it FLAGS them. Each flag becomes a deliberate review decision: confirm intentional, or add to the fix scope. Both are better than silently shipping a fix that left siblings firing. |

---

## The cognitive-trap excuses (where the bug is in your head, not the code)

| Rationalization | Rebuttal |
|---|---|
| *"I've been staring at this code for an hour, the bug is NOT in this function."* | Debugging blindness (Code Complete §23, page-592). You sliced away the region with the bug because you "knew" it was fine. Cure: re-read the function letter by letter; have another Operator or Agent look; OR rubber-duck explain the code (out loud, to the duck, or to the Agent in your session). |
| *"The variable is clearly named `tenant_id`, I checked."* | Psychological set (Code Complete §23, page-592). You read what you expected to read. Cure: read each character. Diff against the schema. If two variables differ by one letter, fix the naming (`naming-conventions` skill — names should have insufficient psychological distance traps designed out). |
| *"I'll just take a five-minute break, then keep going."* | Five minutes is rarely enough. After 30+ minutes of stuck-thrashing, take a real break — 30 minutes, lunch, the walk to coffee, tomorrow morning. Many veteran engineers report their best debugging happens after distance (Code Complete §23, page-597). The careful fix made while exhausted is the fix that introduces three new bugs. |
| *"My code is fine, the bug must be in the framework."* | Almost always wrong. Ego interference (Code Complete §23, page-591). The "your code is good" default is fast in the moment and slow over the bug lifetime. Assume the bug is yours until proven otherwise (Code Complete §23, page-577 — "The assumption helps you debug."). |
| *"I don't understand WHY this fix works, but the test passes."* | Don't ship it. If you cannot explain WHY the fix works in one sentence, you have not understood the bug — you have found something that happens to make the symptom disappear. Two weeks from now, the bug will reappear or a related one will surface. Keep debugging until you can articulate the WHY. |

---

## The trail excuses (skipping the debugging trail)

| Rationalization | Rebuttal |
|---|---|
| *"I'll write up the investigation after I ship the fix."* | The trail is the diagnostic log, not the postmortem write-up. Updating it AS you debug means the next teammate (Operator or Agent) who picks up the task has the trail; updating it after means they re-derive your investigation from scratch. |
| *"The bug is small, no write-up needed."* | Mode 1 bugs (typo-class) don't need a write-up. Mode 2 bugs always do — they touched a write path, were user-visible in prod, or involved system-of-record data. The write-up IS the durable artifact; the code commit is the implementation detail. |
| *"I'll just put it all in the commit message."* | Commit messages are a code-historical artifact, not a debugging trail. They tell you WHAT changed; they don't tell you HOW you got there or what siblings you swept for. The investigation belongs in the PR description (or wherever the fix is tracked); the commit carries the diff. Both, not either. |
| *"An Agent doing the debugging doesn't need to leave a trail."* | Wrong — that's exactly when the trail matters most. It tells everyone else that someone is on the bug, lets them follow without context-switching into the Agent's terminal, and leaves a durable postmortem. Record it where the fix is tracked. |

---

## The "spirit vs letter" excuses (the meta-rationalization)

These are the second-order excuses — when an Operator (or Agent) admits they're not following the letter of the protocol but claims they're following the spirit.

| Rationalization | Rebuttal |
|---|---|
| *"I'm following the spirit of the protocol — Stabilize and Locate are the same beat for this bug."* | They answer different questions. Stabilize is "what repeatable failure or preserved signature will distinguish change?" Locate is "which layer most likely contains the cause?" Keep both answers explicit even when one experiment supplies evidence for both. |
| *"The protocol is fine in general but this bug is special."* | Almost never true. Bugs that feel special are usually bugs you don't yet understand — and the protocol's first beats (stabilize, locate, hypothesize) are designed to dissolve the feeling of specialness by producing evidence. The bug being "special" is itself the signal that the protocol applies. |
| *"This is Mode 1 because I've decided it's Mode 1."* | Mode selection is determined by the explicit hard escalation triggers in `references/lightweight-triage.md`, not by your preference. If any trigger fires, the bug is Mode 2 — your discomfort about Mode 2 taking longer is not the trigger, it's the bias the triggers exist to override. |

---

## The Agent-collaboration excuses (specific to Agent-Operator pairs)

These are the additional rationalizations that show up when an Agent is in the loop. See `references/agent-assisted-debugging.md` § Anti-patterns for the full treatment; the short rebuttal table here is enough for in-session catches.

| Rationalization | Rebuttal |
|---|---|
| *"The Agent said it should work."* | "Should work" is not a hypothesis. Demand the reasoning. If the Agent cannot articulate WHY the fix works, treat the proposal as a guess (and a guess from the Agent is no better than a guess from the Operator). |
| *"I'll just paste the file and ask the Agent to fix it."* | "Fix this" is the fastest way to hallucinate. Paste the FULL stack trace, the failing output, and the recent diff. The Agent's quality is bounded by the context you provide. |
| *"The Agent is very confident, so I'll ship it."* | Calibrate first. Ask "high / medium / low confidence — what would falsify this?" An Agent that cannot articulate a falsifying outcome is searching for confirmation, not running an experiment. Weight the proposal accordingly. |
| *"The Agent rephrased the same fix, so it counts as a new route."* | Causal equivalence, not wording or count, decides. Freeze the non-informative route and gather discriminating logs, breakpoints, a minimal repro, or a targeted diff before another proposal. |
| *"The Agent ran the tests — we're good."* | Verify the test was failing BEFORE the fix. A test that passes both before and after the fix is testing the wrong thing. Run the test against the unfixed code to confirm it actually catches the bug. |
| *(Autonomous Agent thinking)* *"This is a small enough fix that I can ignore the authority boundary."* | Mode does not grant authority. The Agent may investigate and apply authorized, reversible, in-scope changes, recording the causal story and evidence. It pauses before irreversible or external actions, material scope changes, missing-authority steps, or owner-only trade-offs, and presents the smallest blocked decision. |

---

## The closing principle

Every rationalization above ends with the same trade-off: **a few minutes saved now in exchange for a bug that lasts longer, returns, or seeds a sibling**. The skill exists because that trade-off is bad every time you make it.

When you catch yourself in one of these excuses, the move is not to delete the excuse and pretend it didn't happen — it's to **name the excuse, name the trade-off, name the alternative, and choose**. If you still choose the shortcut, log the reason where the fix is tracked so the audit trail records what you traded for what.
