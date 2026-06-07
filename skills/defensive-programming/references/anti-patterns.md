# Anti-patterns — rationalizations and rebuttals

Authors rationalize their way into defensive bloat in predictable ways. This file lists the verbatim sentences people say AND the specific rebuttal that lands.

Use this file:
- During PR review when the author pushes back on a `silent-failure-hunter`-style critique.
- During authoring when an inner voice says "but what if…". Look the inner voice up below.
- During pair-programming when the partner is reaching for `try/except Exception:`.

---

## The rationalization table

| What gets said | What it actually means | Rebuttal |
|---|---|---|
| "Just being safe." | The author cannot articulate which specific failure they are guarding against. | "Safe against what? Name the exception class and the call site." If the answer is "I don't know," the guard does not belong. |
| "What if the caller passes `None`?" | The signature says non-None, but the author does not trust it. | "Then the signature is wrong or the check is wrong. Fix the type." See `pr-review-toolkit:type-design-analyzer`. |
| "What if the network blips?" | Author wants infinite retry. | "Then bound the retry and propagate the final failure. Unbounded retry turns a blip into an outage." See `SKILL.md § Retry/backoff/timeout`. |
| "I don't want to crash production." | Author would rather log-and-continue than surface the bug. | "Production already crashed — it just looked successful. You moved the bug downstream where it costs more to find." |
| "We can log it and figure it out later." | The log will not be looked at. | "Logs without alerts are documentation. If this matters, alert on it; if it does not, do not catch it." |
| "Defensive coding is best practice." | Author conflates "defensive" with "broad try/except." | "Defensive coding at Millis is boundary validation + fail loud + push invariants into types. The four rules. Broad catches are the opposite." |
| "We've always done it this way." | Codebase has accumulated the pattern. | "The pattern is the bug we are removing. Each PR is the place to remove one instance." |
| "What if the JSON shape changes?" | Author wants to silently accept any shape. | "If the JSON shape changes, fail loud at the parse step so we notice. Silent acceptance becomes silent data corruption." |
| "It's just a script." | Author is using the word "script" to justify skipping discipline. | "A script that runs once is exempt. A script that runs in CI / cron / a sync job is production." |
| "I'll add a TODO and fix it later." | Will not be fixed later. | "If it is worth a TODO, it is worth a five-minute fix now. If it is not worth fixing, delete the TODO and the defensive code with it." |
| "Better to swallow than to crash." | Author treats the propagated exception as the bug. | "The bug is whatever caused the exception. Swallowing hides the bug; propagating surfaces it. The crash is feedback." |
| "I'm not sure what errors this can throw." | Author does not understand the call's contract. | "Read the docs / source for that one call. Then catch only the specific classes the docs name." |
| "The library throws a generic `Exception`." | Author copies the genericism upward. | "Catch the generic class at the lowest possible layer, branch on `type(e).__name__` or `.code`, and re-raise typed wrappers. Do not propagate the genericism." |
| "Adding a type would mean a refactor." | Author wants to add a runtime check instead. | "The refactor is the right answer; the runtime check is a band-aid that has to be added in every consumer forever." |
| "Tests are passing." | Author thinks tests cover the failure mode. | "Then add a test for this failure mode. If the test would be hard to write, that is information — the defensive code is the wrong shape." |
| "It's a single edge case." | Author wants to add one more guard. | "Then it is testable. Write the test; then either the guard is justified by the test, or the test reveals the guard is wrong." |
| "Removing the catch will break the build." | Catch is load-bearing for some downstream caller. | "Then the downstream caller has a real failure mode we are hiding. Surface it; fix the downstream caller." |
| "Other code in this repo does it." | Appeal to local convention. | "Local convention can be wrong; that is why this skill exists. Fix the rest as you encounter it." |
| "I read this pattern in a tutorial." | Pattern is from a different context. | "Tutorials simplify. This is the Millis context. Apply the four rules." |
| "Christian / Emmett / a senior reviewer told me to add this." | Authority pushback. | "Re-ask them, citing `SKILL.md § Common pitfalls`. They may have given the advice for a different context that does not apply here." |
| "It's defensive for the long term." | Author imagines future failure modes. | "Add the defense when the failure mode is concrete. Speculative defense is YAGNI with extra steps and a worse signal-to-noise ratio in logs." |
| "We don't have time to do it the right way." | Sprint pressure. | "The right way is *cheaper now* — narrowing one catch takes minutes; debugging a silent failure in production takes hours." |
| "We can't just crash — that would page someone." | Author wants to swallow the error to avoid the operational consequence. | "The page IS the point. If this should not page, *it should not be at `ERROR`* — either it's actually `WARNING` (degraded but working) or it's actually a bug we should fix. Pick one." |
| "It's defensive — Code Complete says we should do this." | Author cites CC2 selectively. | "Code Complete §8.8: 'Too much defensive programming creates problems of its own.' The same chapter names broad catches and silent recovery as anti-patterns. Cite the full section." |
| "I'm just adding one more `if` — it's harmless." | Author is adding a barnacle — a special case that hides the real bug. | "Code Complete §23.3: barnacle special cases sink the code. Diagnose the root, fix the root, remove the special case. If it really is a domain rule, name it as such, document it, test it — do not smuggle it in as a bandage." |
| "Tests pass after my fix." | Author has not verified the fix addressed the cause. | "Tests pass when the symptom is suppressed AND when the cause is fixed. Reproduce the failing case, then verify the fix moves the test from red to green for the right reason." |
| "I'll suppress this compiler / linter warning — I don't have time to look it up." | Author is performing intellectual dishonesty (CC2 §33.4). | "The compiler usually knows. Read the warning. If after reading you still believe it is wrong, suppress AT that single site WITH a comment explaining why. Never project-wide." |

---

## Red flags — stop and rewrite

Self-check while authoring or reviewing. Each item below means stop and apply a rule from `SKILL.md`.

1. The diff introduces `except Exception:` / `catch (Exception)` / `catch (_)` / `.unwrap()` in library code.
2. The catch body logs and does not re-raise.
3. The catch body returns `None` / `null` / `{}` / `[]` and the function signature does not indicate the absence is part of the contract.
4. The new validation re-checks something the type signature already guarantees.
5. The new validation is inside a private helper called from one already-validated entry point.
6. The retry has no count bound, no wall-clock bound, or no jitter.
7. The retry is wrapped around a non-idempotent operation.
8. The `try/catch` wraps more than one operation that could fail for different reasons — split into one `try` per error class.
9. The `assert` is used for a boundary check or a security check.
10. The new error type does not chain its cause (`from err`, `innerException`, `cause:`, `#[source]`).
11. The new code reads `os.getenv` / `process.env` / `Environment.GetEnvironmentVariable` inside a hot path instead of from a typed config object.
12. The new code reads from a Service Bus / Event Grid / Procore webhook and treats the message as exactly-once.
13. The new code does a `SELECT *` and then accesses columns by position.
14. The new code returns a mutable internal collection from a getter.
15. The new feature flag has no plan to be turned on or removed.
16. The new code logs at `WARNING` but the failure actually requires action (use `ERROR`).
17. The new code catches `CancellationToken` / `AbortSignal` cancellation and continues.
18. The new code uses a naive `datetime` / a wall-clock `time.time()` for duration measurement.
19. The new code constructs SQL via string concatenation.
20. The new code writes a file with `mode='w'` without an atomic-rename pattern.
21. The new code suppresses a compiler / typechecker / linter warning without an inline comment explaining why.
22. The new code adds a special case (`if client == 45: …`, `if version == "v1.2.3" and tenant == "X": …`) instead of fixing the cause.
23. The new code returns `None` / `null` from a constructor (or throws inside `__init__` without a paired safe-construct pattern).
24. The new code uses `bool` for a status field that has more than 2 conceivable states.
25. The new code adds an unused parameter (or unused field on a typed model).
26. The new code carries a stringly-typed value (`"FP-2026-05"`, `"PROJ-1234"`, `"USD"`) past the entry function instead of parsing it into a typed value object.

If a PR scores yes on any of these, point at the SKILL.md rule that says no.

---

## When the author pushes back

Defensive bloat is often emotional — authors feel like they are protecting users. The right move is to align on the goal (protect users) and reframe what protection actually means.

1. **Acknowledge the goal.** "Yes, the user must not see a 500. Agreed."
2. **Name the failure mode being defended against.** Force specificity. "Which call is throwing? Which exception class?"
3. **Point at the rule.** "`SKILL.md § Error contracts` table — this is the 'expected, recoverable' row OR the 'unrecoverable bug' row. Which?"
4. **Show the do/don't pair.** "`examples.md § <relevant-section>` is the same shape; the `✅ Do` form is the suggested edit."
5. **Offer the smallest concrete edit.** Not "consider refactoring" — name the lines to change.

If the author still pushes back, escalate the *decision* to the operator in `result_notes` on the related task. Defensive trade-offs that contradict this skill are fine *when stated and reviewed* — they are not fine when smuggled in.

---

## One closing observation

Every rationalization in the table above is, secretly, the same rationalization: **"I do not want this code to be wrong in production, so I will hide the ways it could be wrong."**

The four rules invert that. Be honest in code about what can go wrong; let the runtime surface it loudly; trust the type below the boundary; verify the side-effect landed. That is the protection the user actually wants.

A second closing observation: **the defensive code itself is code.** It has bugs. It needs tests. Code Complete §8.8 names this explicitly — *"Code installed for defensive programming is not immune to defects, and you're just as likely to find a defect in defensive-programming code as in any other code — more likely, if you write the code casually."* Treat a `try/except` as scrutinizable, not as a magic shield that makes the surrounding code safer. If the defensive block is not tested, it is not proven; if it is not proven, it might be the next bug.
