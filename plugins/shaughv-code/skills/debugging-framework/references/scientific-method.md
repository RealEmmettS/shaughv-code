# scientific-method.md

The Code Complete §23 source material that grounds the formal protocol in `SKILL.md`. Pull this when you want the original quotes — for example, when defending the discipline to a skeptical Operator or Agent, or when the digest in SKILL.md feels too abstract.

> McConnell's prose uses "programmer" — the literal quotes below preserve that. The surrounding commentary uses **Operator** (the person driving the debug session: you or a teammate) and **Agent** (an AI coding teammate) per this skill's convention.

All page citations refer to the page-numbered Markdown extract of Steve McConnell's *Code Complete, 2nd Edition*, Chapter 23 "Debugging." Page numbers are the printed page (which matches the file naming `page-NNN/markdown.md` in the OCR processed copy).

---

## Why this matters — the 20-to-1 gap

> *"In one study, those programmers who finished fastest used the same amount of time per defect as those who finished slowest, but they were able to find their errors faster... Effective programmers find their defects in about one-twentieth the time used by ineffective programmers."* — page-574

The best programmers in the study found all defects in five minutes with zero new errors introduced. The worst missed a third of the defects and introduced 7.7 new errors per fix. **The discipline below is what closes that gap.** The 20-to-1 statistic is the headline argument for why this skill exists at all.

> *"Better debugging performance equals fewer defects found, fewer bad fixes made, lower overall cost."* — page-574

## Foundational mindset

> *"Debugging is an extraordinarily rich soil in which to plant the seeds of your own improvement... readability, design, code quality — you name it."* — page-575

A debug session is not an annoyance; it is a chance to learn the system, the team's blind spots, and the missing abstraction. Treating it as a chore is what burns out Operators AND produces low-leverage fixes.

> *"A bug in software means that a programmer made a mistake... If you don't fully understand what the program does, it means you have something to learn."* — page-573, page-574

> *"Software quality must be built in from the start... Debugging is a last resort."* — page-573

This skill assumes `defensive-programming` and the test-first habits from `superpowers:test-driven-development` are also active. The point of debugging well is to learn the lesson that lets the *next* version of you not need to debug as often.

> *"Even if an error at first appears not to be your fault, it's strongly in your interest to assume that it is... The assumption helps you debug."* — page-577

This is the character prerequisite. Assume the bug is yours. The bias toward humility makes you faster.

---

## The scientific method — five steps

> *"The effective programmers who debug in one-twentieth the time used by the ineffective programmers aren't randomly guessing... They're using the scientific method."* — page-577

McConnell's five steps map cleanly onto the seven beats in `SKILL.md` (we split McConnell's *fix* into *fix + regression-test* and add an explicit *hypothesize* beat between *locate* and *verify*).

### Step 1 — Stabilize the error

> *"If a defect doesn't occur reliably, it's almost impossible to diagnose."* — page-579

Simplify the test case until changing any one aspect changes the behavior. A bug you cannot reproduce is a bug you cannot fix — and a "fix" applied to an unstable bug is at best lucky and at worst a band-aid that makes the real bug intermittent.

### Step 2 — Locate the source

> *"Divide and conquer... divide that section... Continue until you find the defect."* — page-583

Binary search through the suspicious region. Each iteration halves the search space.

> *"You know something you didn't before — namely, that the defect is not in the area you thought it was... This narrows your search field."* — page-583

Negative results are real information. The hypothesis being wrong is progress, not a failure — it eliminates a region.

> *"Choose test cases that are different... Run them to generate more data, and use the new data to add to your list of possible hypotheses."* — page-583

> *"Make a list of things to try... move on to the next approach"* — page-583

The notepad is the load-bearing tool. Hypotheses you have already ruled out belong on it so you do not loop back.

### Step 3 — Fix the problem, not the symptom

> *"Fix the problem, not the symptom... you're fixing the underlying problem rather than wrapping it in programming duct tape."* — page-589

Fix at the layer responsible for the broken invariant, not the layer where the broken invariant surfaced. Symptom-fixes scale O(consumers) — every new consumer generates a new bug.

> *"The best way to make your life difficult is to fix problems without really understanding them."* — page-587

If you cannot articulate WHY the fix works in one sentence, you are not done debugging — you are guessing.

### Step 4 — Test the fix

> *"Rerun the whole program to check for side effects of your changes."* — page-591

The full suite, not just the new test. A fix that breaks two other tests is not a fix — it is a trade-off you have not negotiated.

### Step 5 — Look for similar errors

> *"Defects tend to occur in groups... Look for others that are similar."* — page-591

This is the highest-leverage step. The fix you just shipped is one fix; the sweep finds the three siblings before they fire. Sister entities / sister mappings / sister integrations / sister tenants are the right axes to sweep.

---

## Anti-patterns — what guarantees thrashing

### Superstitious debugging

> *"Programming by superstition"* — page-577

Assuming the compiler is broken, the framework is buggy, the library is wrong, the computer is possessed. Almost always your code; almost never theirs. When the library IS wrong, you can prove it with a minimal repro and a GitHub issue.

> *"Debugging by thinking about the problem is much more effective and interesting than debugging with an eye of a newt and the dust of a frog's ear."* — page-577

### Symptom-focused hacks

> *"Special-case makeup that changes the symptom but not the problem"* — page-575

> *"Goto bandages instead of systemic corrections"* — page-575

`if (id == 4521) return null` is the canonical example. It silences this case and guarantees a new bug the moment a sibling case surfaces.

### Trial-and-error

> *"Debugging by thinking about the problem is much more effective and interesting than debugging with an eye of a newt and the dust of a frog's ear."* — page-577

Random changes are shotgun debugging. Each change must test a stated hypothesis (step 2 → step 3 in the SKILL.md beats).

---

## Psychological barriers

The cognitive traps that explain WHY good Operators (and Agents) waste hours on bugs that take five minutes to fix when seen with fresh eyes.

### Psychological set (confirmation bias)

> *"You see what you expect to see... People expect a new phenomenon to resemble similar phenomena they've seen before."* — page-592

You read `SYSSTSTS` as `SYSTSTS` because that's what you expect. Cure: read each character. Have a teammate look. Read the line out loud.

### Debugging blindness

> *"The part of the program that contains the defect is mistakenly sliced away... You took a wrong turn at the fork in the road."* — page-592

You eliminated a region from suspicion because you "knew" it was fine, and the bug was there. Cure: be willing to re-search a region you ruled out, especially after 30+ minutes of stuck.

### Insufficient psychological distance between names

> *"`SYSTSTS` vs `SYSSTSTS` can go unnoticed for hundreds of runs"* — page-592, page-593

Names that differ by one letter or one character invite this trap. The cure is at design time — see `naming-conventions` for variable-naming rules that avoid this.

### Ego interference

> *"Your ego tells you that your code is good and doesn't have a defect even when you've seen that it has one."* — page-591

Assume the bug is yours until proven otherwise (see page-577 above). The bias toward humility is debugging speed.

---

## When to stop and reset

> *"Set a maximum time for quick and dirty debugging."* — page-597

If you exceed your time-box, escalate (Mode 1 → Mode 2) or take a break. The third hour on a bug is rarely the productive one.

> *"Take a break from the problem."* — page-597

Many veteran Operators report their best debugging happens on the walk to coffee. Distance restores perspective.

> *"Relax."* — page-597

Tension impairs judgement when fixing code. The careful fix made while exhausted is the fix that introduces three new bugs.

> *"Talk to someone else about the problem."* — page-597

Rubber duck. The act of explaining the bug — to another Operator, to the Agent in your session, to a literal duck — often surfaces the answer. Sometimes the other party spots it instantly; sometimes you spot it while phrasing the question.

---

## Tools

### Compiler / typechecker / linter warnings

> *"Set your compiler's warning level to the highest, pickiest level possible, and fix the errors it reports."* — page-594

Warnings are first-line defence. The compiler is right ~99% of the time. Suppressing a warning without reading it is the same character defect as superstitious debugging (assuming the tool is wrong).

> *"Treat warnings as errors."* — page-594

Elevates importance and forces integration checks.

### The debugger

> *"The debugger isn't a substitute for good thinking. But thinking isn't a substitute for a good debugger either. The most effective combination is good thinking and a good debugger."* — page-596

Stepping through code without a hypothesis is just slow reading. The debugger is a verification tool for hypotheses already formed, not a substitute for forming them.

---

## How this maps to SKILL.md

| Code Complete §23 step | SKILL.md beat |
|---|---|
| Stabilize the error (page-579) | Beat 1 — Stabilize |
| Locate the source (page-583) | Beat 2 — Locate |
| *(implicit in McConnell)* | Beat 3 — Hypothesize (made explicit because it is the most-skipped step under pressure) |
| *(implicit in McConnell)* | Beat 4 — Verify (made explicit so "one variable at a time" is a discrete step) |
| Fix the problem (page-589) | Beat 5 — Fix |
| Test the fix (page-591) | Beat 6 — Regression-test |
| Look for similar errors (page-591) | Beat 7 — Look for similar defects |

The cross-references in SKILL.md (e.g. `Code Complete §23, page-583`) all resolve to the quotes above.
