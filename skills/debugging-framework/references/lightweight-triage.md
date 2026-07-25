# lightweight-triage.md

The Mode 1 loop from `SKILL.md` in detail. Pull this when:

- You are about to invoke Mode 1 and want the exact step list with worked micro-examples.
- You are unsure whether the bug qualifies for Mode 1 or should escalate to Mode 2.
- You finished a Mode 1 attempt that didn't work and want to know whether to try once more or escalate.

## Contents

- [When Mode 1 applies](#when-mode-1-applies)
- [The 5-minute loop](#the-5-minute-loop)
- [Hard escalation triggers (Mode 1 → Mode 2)](#hard-escalation-triggers-mode-1--mode-2)
- [Worked micro-examples](#worked-micro-examples)
- [What "lightweight" does NOT mean](#what-lightweight-does-not-mean)

## When Mode 1 applies

Mode 1 is for bugs where ALL of the following are true:

- **Scope is small and contained.** One file, one function, one config value, one typo. Not a cross-service or cross-process bug.
- **The bug is not user-visible in production.** Local repro, CI failure, dev-env behavior, internal scripts.
- **No write path is involved.** Read-only inspection bugs, view-layer bugs, type errors, build failures.
- **The "fix" is mechanical.** Off-by-one, missing `await`, typo in a key name, wrong env var name, missing import.
- **A mechanical Mode 1 retry is still informative.** If causally equivalent attempts stop
  changing the evidence, escalate the investigation to Mode 2; do not treat that as a universal
  task-stop rule.

If any of these is false, this bug is Mode 2 from the start. Skip the 5-minute attempt entirely — the cost of a wrong fix on a Mode 2 bug far exceeds the 10 minutes you'd save by treating it as Mode 1 first.

## The 5-minute loop

### Step 1 — Read the error literally (60 seconds)

- **Whole stack trace, top to bottom.** Do not stop at the top frame. The actionable frame is often 3–5 frames down.
- **File path AND line number.** Click through, look at the line.
- **Error code AND error message.** Search the codebase for the error message string — sometimes it surfaces a hand-rolled error that names the fix in its own message.
- **Adjacent log lines.** What was logged *before* the error? That is the last-known-good state.

> *"Don't skip past errors or warnings. They often contain the exact solution. Read stack traces completely. Note line numbers, file paths, error codes."* — `superpowers:systematic-debugging`, Phase 1 step 1.

### Step 2 — Reproduce once (60 seconds)

- Run the failing path. The actual command, not a description of it.
- If it reproduces: continue.
- If it does NOT reproduce on the first attempt: this is no longer a Mode 1 bug. Stabilization is now load-bearing. Escalate to Mode 2 beat 1.

### Step 3 — Check the last commit (60 seconds)

- `git log -1 --stat` — what changed in the most recent commit?
- `git diff HEAD~1 -- <file>` — what changed in the file that's failing?
- If the bug appeared after a recent change: the change is the suspect until proven otherwise. The fix usually lives in the recent diff.
- If the bug existed before the recent change: continue, but the recent change is less likely to be the answer.

### Step 4 — Fix the obvious thing (90 seconds)

- The smallest possible change that the evidence supports.
- One change. Not "while I'm here" cleanup.
- If you find yourself making more than one change, OR a change in more than one place, STOP — this is Mode 2.

### Step 5 — Verify (30 seconds)

- Re-run the failing path.
- Original error gone? Good.
- New error appeared? STOP — escalate. New errors after a "fix" are evidence that the hypothesis was incomplete.
- Test suite (if applicable) still green? Good.

If step 5 confirms the fix, you are done. Total elapsed time: ≤ 5 minutes.

## Hard escalation triggers (Mode 1 → Mode 2)

Switch to Mode 2 the moment ANY of these is true. Do not bargain.

- The 5-minute clock has elapsed.
- The fix would touch a write path (DB write, queue publish, third-party POST, file write).
- The bug is user-visible in production.
- Causally equivalent Mode 1 fixes stopped changing the evidence.
- You don't fully understand why the fix would work.
- The bug crosses a process, service, or network boundary.
- The bug involves money, PII, or system-of-record data (financial rollups, billing math, anything other systems treat as the source of truth).
- The reproduction step (Mode 1 step 2) failed first try and "worked the second time" — intermittency is a Mode 2 signal.
- Another Operator or Agent has been debugging this already (check the issue / PR history before starting).

When you escalate: state the trigger explicitly in your notes (or the PR / issue tracking the fix) so the trail records WHY you switched modes. "Escalating Mode 1 → Mode 2: bug appeared on retry, intermittency triggers stabilization beat."

## Worked micro-examples

### Example A — Typo-class bug, fixed in 90 seconds

> Test output: `KeyError: 'tenent'`
>
> 1. Stack trace points to `sync.py:142`. (15 s)
> 2. Re-run; same error. (15 s)
> 3. `git log -1 --stat sync.py` — file changed 20 minutes ago. `git diff HEAD~1 -- sync.py` — line 142 was renamed `tenent` from `tenant_id`. (20 s)
> 4. Fix: change `'tenent'` → `'tenant'`. (15 s)
> 5. Re-run; green. Full test suite (5 s on 200 tests). (5 s)
>
> Total: 70 seconds. Mode 1 succeeded. No postmortem warranted (typo-class bug).

### Example B — Same symptom, Mode 2 bug

> Test output: `KeyError: 'owner'`
>
> 1. Stack trace points to `report_refresh.py:301`. (15 s)
> 2. Re-run; same error. (15 s)
> 3. `git log -1 --stat report_refresh.py` — file unchanged for 3 weeks. The `projects.contact` column it reads from has the right name. (30 s)
> 4. **Attempted Mode 1 fix:** maybe the field is just missing from the dict — wrap in `.get("owner")`. Re-run; no longer errors, but the column is now `NULL`. The error went away but the value is wrong. (90 s)
> 5. **Escalate.** The fix made the symptom disappear without addressing the cause — this is the symptom-hack anti-pattern. Real bug is the data-pipeline gap (the Example 1 archetype in `worked-examples.md`). Switching to Mode 2.
>
> The Mode 1 attempt that "worked" was actually the worst possible outcome — it silenced the loud error while leaving the value wrong, which means downstream consumers (the report UI) will now silently render `NULL` for every owner. The 5-minute clock plus the escalation triggers ("would touch a write path" — the refresh is a write; "involves system-of-record data" — the report rollup is) should have routed this to Mode 2 from minute zero.
>
> **Lesson:** when the symptom is a `KeyError` on a *data* field (not a *code* identifier), Mode 1 is almost never the right mode. Treat it as Mode 2 from the start.

## What "lightweight" does NOT mean

Mode 1 is faster, not less rigorous. The five steps still apply:

- Reading the error literally is still required.
- A direct reproduction or strongest preserved failure signature is still required.
- The fix must still be defensible (you can explain WHY in one sentence).
- Verification is still required.

What Mode 1 omits is:

- Writing a failing test before the fix (the bug is small enough that the re-run is the verification).
- The look-for-similar-defects sweep (the bug is contained enough that the sweep would find nothing).
- The postmortem note (the bug is mundane enough that there is no lesson).

If any of those "would-be-overkill" omissions feels uncomfortable on a specific bug, that discomfort is signal — escalate.
