# Argument Analysis

Before you can evaluate reasoning you have to *find* it — extract a clean argument from
messy prose. This is the front end for every other mode.

## 1. Is it even an argument?

An **argument** offers one or more statements (premises) as *support* for another (the
conclusion). Distinguish from non-arguments that look similar:
- **Explanation** — tells *why* an accepted fact is so, not *that* it's so (see
  `explanation.md`). "The bridge failed because the bolts corroded" explains; it doesn't
  argue the bridge failed.
- **Report / description / narration** — states facts without inferential support.
- **Conditional statement** — "if P then Q" alone is not an argument (neither P nor Q is
  asserted).
- **Illustration** — examples of a claim, not evidence for it.
- **Statement of belief / opinion** — "I think taxes are too high" asserts without arguing.

The test: is any statement being *offered as a reason to accept* another?

## 2. Find the parts

**Conclusion indicators:** therefore, thus, hence, so, consequently, it follows that, which
shows that. **Premise indicators:** because, since, for, given that, as, inasmuch as.
Indicators help but aren't required — many arguments have none. Find the **main
conclusion** by asking "what is this passage ultimately trying to get me to accept?"
Everything else is either a premise or a sub-conclusion supporting it.

## 3. Distilling the argument — write your own summary statement

Indicators and underlining only get you so far. The decisive move is to **step back from
the author's wording and reconstruct the argument in your own words.** Don't work on the
text; work on a summary *you* write. Ask, in order:

1. **What is the author's basic purpose?** What are they ultimately trying to accomplish or
   get you to do or believe?
2. **What conclusion do they want you to accept?** State it as a single proposition.
3. **What evidence do they offer for it?** List the reasons actually given.
4. **Why do they think that evidence proves the case?** This exposes the *connecting
   assumption* — the often-unstated premise linking evidence to conclusion.

As you answer, **write down the propositions** — premises and conclusion — in your own
words, as you identify them. That written summary, not the original prose, is what you
evaluate.

Why this is worth the effort: (a) you cannot summarize what you don't understand, so it
forces real comprehension; (b) it strips away rhetoric, repetition, and emotional framing,
leaving the logical skeleton; (c) question 4 surfaces enthymemes — missing premises become
visible the moment you ask why the evidence is supposed to work; and (d) it gives you a
neutral target, so you evaluate the argument rather than the persuasion. The discipline:
summarize **accurately and charitably** — a summary that distorts the argument is just a
straw man you built yourself (see `fallacies.md`).

## 4. Standard form and missing parts

Once distilled, write the argument as numbered premises with the conclusion marked `∴`.
**Enthymemes** — arguments with an unstated premise or conclusion — are everywhere
("Socrates is a man, so he's mortal" omits "all men are mortal"). Supply the missing piece
**charitably**: add the premise the arguer most plausibly intended, not the most
attackable one. (Question 4 above is how you find it.)

## 5. Diagramming structure

Map how premises support the conclusion:
- **Serial:** A → B → C (a premise supports a sub-conclusion that supports the main one).
- **Linked:** premises that work *only together* (each needed; remove one and the support
  collapses). Draw them joined.
- **Convergent:** premises that *independently* support the conclusion (each is its own
  reason). Draw them separately.
- **Divergent:** one premise supporting multiple conclusions.
Knowing whether support is linked or convergent tells you whether refuting one premise sinks
the argument (linked) or only weakens it (convergent).

## 6. Diagramming debates

Most real reasoning is two-sided: a position, objections to it, and replies. A single
argument diagram isn't enough — you need to map the *dialectic*. Work in three passes:

1. **Identify the conclusions.** Pin down each side's main thesis and confirm they actually
   join issue — usually directly opposed ("we should adopt X" vs. "we should not adopt X"),
   sometimes only partly. If the two conclusions aren't really contradictory, the parties may
   be talking past each other (a verbal dispute, or a diversion).
2. **Diagram the main argument.** Distill and diagram the position under examination
   (premises → conclusion, marking linked/convergent/serial structure as in §5). This is the
   argument the rest of the debate is *about*.
3. **Diagram the counterarguments.** Map the opposing side, and — the part a plain diagram
   misses — show **what each move targets.** Distinguish:
   - **objections to a premise** (attacking a specific premise's truth) — link the objection
     to that premise;
   - **objections to the inference** (granting the premises but denying they support the
     conclusion) — link to the inferential step;
   - **counter-arguments** (independent positive arguments for the opposite conclusion);
   - **replies / rejoinders** (the first side's answers to objections) — link each reply to
     the objection it answers.

The payoff: the debate diagram makes visible whether each objection *engages* the argument
or merely talks past it, and where the live disagreement actually sits — often on a single
shared premise or on the relevance of the evidence, not on the headline conclusion.

## 7. The evaluation vocabulary (keep these straight)

For **deductive** arguments:
- **Valid** — *if* the premises were true, the conclusion would *have to* be true (form).
- **Sound** — valid *and* the premises are in fact true. Soundness is the goal; validity is
  necessary but not sufficient.

For **inductive** arguments:
- **Strong / weak** — the premises make the conclusion *probable* to a greater/lesser degree.
- **Cogent** — strong *and* the premises are true. The inductive analog of soundness.

Never call an inductive argument "valid/invalid" or a deductive one "strong/weak" — the
category mistake muddies the evaluation.

## 8. Principle of charity and the steel man

Interpret an argument in its strongest reasonable form before criticizing: resolve
ambiguities in its favor, supply the intended (not the weakest) missing premise, and refute
the **steel man** — the best version of the position — not a straw man (see `fallacies.md`).
Charity isn't softness; it makes your criticism land on the real view.

## 9. Worked decomposition

*Passage:* "We shouldn't adopt the new system. It's expensive, and our staff aren't trained
on it. Untrained staff make costly errors."

*Distilled (your own summary):* Purpose — to block adoption. Conclusion — we shouldn't adopt
the new system. Evidence — it's expensive; staff are untrained; untrained staff err.
Connecting assumption — cost and error-risk outweigh the system's benefits.
```
P1. The new system is expensive.
P2. Our staff aren't trained on it.
P3. Untrained staff make costly errors.        [P2+P3 linked → sub-conclusion]
SC. Adopting it would cause costly errors.      (from P2, P3)
∴  We shouldn't adopt the new system.           (from P1, SC — convergent cost reasons)
```
Evaluation: inductive (a practical recommendation); strength turns on whether P1 and SC
outweigh unstated benefits — flag suppressed evidence if benefits are ignored.
