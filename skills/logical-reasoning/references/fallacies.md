# Fallacies

A fallacy is a mistake in reasoning — an argument whose premises do not actually support
its conclusion, yet which tends to look persuasive anyway. The persuasive pull is what
makes fallacies dangerous: a plainly bad argument convinces no one, but a fallacy slips
past because it mimics a good one.

This file is built for two jobs, and the second matters as much as the first:

1. **Audit a source.** Someone else's argument (an article, a claim, a debate) — find
   where the support breaks.
2. **Audit yourself.** Your own argument *before* you commit to it. The hardest fallacies
   to catch are the ones in reasoning you already believe.

## How to use this file

**The source-audit loop.** Reconstruct the argument in standard form (see
`argument-analysis.md`), find the conclusion, then ask of each premise: *does this
actually bear on the truth of the conclusion, and does it bear on it the way the arguer
needs?* Where the answer is no, match the gap to a named fallacy below.

**The self-audit loop.** Run the checklist at the end of this file on your own argument.
Name the fallacy you're most tempted by given the conclusion you want to reach — motivated
reasoning steers toward specific fallacies (wanting a conclusion true → begging the
question, suppressed evidence; wanting an opponent wrong → ad hominem, straw man).

**Naming a fallacy well — the standard.** Don't just label. A good diagnosis states (a)
the fallacy's name, (b) the specific move in *this* argument that commits it, (c) why that
move fails to support the conclusion, and where relevant (d) the legitimate cousin — many
fallacies are corruptions of a valid form, and saying so prevents over-eager labeling
(see "Not every appeal is a fallacy" below).

**Per-entry format:** *What* (definition) · *Pattern* · *Tell* (the diagnostic question
that exposes it) · *Example* · *Why it fails* · *Legit cousin / repair* (where one exists).

---

## Part 1 — Formal fallacies (invalid by structure)

These are defective in *form*: the conclusion does not follow no matter what the content
is. Detect them by symbolizing (see `deductive-propositional.md`, `categorical-logic.md`).

**Affirming the Consequent.** *What:* treating a conditional's consequent as if it
guaranteed the antecedent. *Pattern:* `P → Q, Q ∴ P`. *Tell:* "Is the thing affirmed the
*then*-part, with the *if*-part concluded?" *Example:* "If it rained, the street is wet.
The street is wet, so it rained." (A burst hydrant also wets it.) *Why it fails:* Q can be
true by some other route. *Legit cousin:* modus ponens (`P→Q, P ∴ Q`) and modus tollens
(`P→Q, ¬Q ∴ ¬P`) are valid; this is neither.

**Denying the Antecedent.** *What:* inferring the consequent is false because the
antecedent is. *Pattern:* `P → Q, ¬P ∴ ¬Q`. *Tell:* "Is the *if*-part denied, with the
*then*-part denied as a result?" *Example:* "If you're a CEO you're rich. You're not a
CEO, so you're not rich." *Why it fails:* the conditional says P suffices for Q, not that
it's necessary.

**Undistributed Middle.** *What:* a categorical syllogism whose middle term is never
distributed (never taken universally). *Pattern:* "All P are M; all S are M; ∴ all S are
P." *Tell:* "Does the shared middle term cover *all* of its class in at least one premise?"
*Example:* "All dogs are mammals; all cats are mammals; so all cats are dogs." *Why it
fails:* sharing a property with a class doesn't put two things in the same subclass.

**Illicit Major / Illicit Minor.** *What:* a term distributed in the conclusion but not in
the premise it came from. *Tell:* "Is any term taken universally in the conclusion that
was only partial in its premise?" See `categorical-logic.md` for distribution.

**Affirming a Disjunct.** *What:* with inclusive "or," concluding one disjunct is false
because the other is true. *Pattern:* `P ∨ Q, P ∴ ¬Q`. *Tell:* "Could both disjuncts be
true?" *Example:* "She's smart or hardworking; she's smart, so she's not hardworking."
*Why it fails:* inclusive "or" allows both. *Legit cousin:* disjunctive syllogism
(`P∨Q, ¬P ∴ Q`) is valid.

**Fallacy of Four Terms (quaternio terminorum).** *What:* a syllogism that appears to have
three terms but really has four, usually because one term shifts meaning. Often a formal
mask over equivocation (see Part 6).

---

## Part 2 — Subjectivist fallacies

The common root: a *subjective state* — the mere fact that someone believes, wants, fears,
or feels something — is offered as evidence for the *truth* of a proposition. But what
people believe or feel is not, by itself, evidence about what is so. Objectivity requires
reasons that connect to the fact, not to our attitude toward it.

**Subjectivism.** *What:* using the bare fact of having a belief or desire as evidence
that the corresponding proposition is true. *Pattern:* "I believe / feel / want it to be
that P, therefore P." *Tell:* "Strip out the speaker's attitude — is there any reason left
that bears on whether P is *true*?" *Example:* "I just know in my heart he's innocent, so
he is." *Why it fails:* the strength of a conviction is a fact about the person, not about
the world. *Legit cousin:* reporting a feeling as a feeling ("I feel uneasy") is fine; the
fallacy is converting it into evidence about external fact.

**Appeal to Majority (ad populum / bandwagon).** *What:* treating widespread belief or
popularity as proof of truth. *Pattern:* "Most people believe P, therefore P." *Tell:*
"Would the claim be any more true if *fewer* people believed it?" *Example:* "Everyone
knows the diet works, so it works." *Why it fails:* majorities have been wrong about
nearly everything at some point; popularity tracks many things besides truth. *Legit
cousin:* consensus *among qualified experts who examined the evidence* carries weight — but
that's an appeal to expert judgment, not to numbers (see Appeal to Authority).

**Appeal to Emotion (ad passiones; incl. ad misericordiam, appeal to pity).** *What:*
substituting an emotional response — pity, fear, pride, outrage — for evidence. *Pattern:*
"This makes you feel strongly, therefore the conclusion is true / you should act." *Tell:*
"If the feeling were removed, does any reason for the conclusion remain?" *Example:* "Think
of the children — therefore the policy is sound." *Why it fails:* a feeling can be
appropriate while the conclusion is false; emotion isn't a truth-tracking faculty. *Legit
cousin:* emotions can rightly motivate *action* once the facts are settled; the fallacy is
using them to settle the facts.

**Appeal to Force (ad baculum).** *What:* backing a conclusion with a threat (of harm,
penalty, social cost) instead of a reason. *Pattern:* "Accept P, or else." *Tell:* "Is the
'reason' a consequence of *disbelieving*, rather than evidence *for*?" *Example:* "You'll
agree if you want to keep your job." *Why it fails:* coercion can change behavior but
cannot make a proposition true. *Legit cousin:* a genuine prudential warning ("touch that
and you'll be burned") is a factual causal claim, not a threat used as a premise.

---

## Part 3 — Fallacies of relevance and credibility

The premise is true and even interesting, but it does not bear on the conclusion the way
the argument needs.

**Appeal to Authority (ad verecundiam).** *What:* citing an authority whose endorsement
doesn't actually support the claim. *Pattern:* "Authority A says P, therefore P." *Tell:*
run the legitimacy test: (1) Is A a *genuine expert in the specific field*? (2) Is the
claim *within* that expertise? (3) Do experts in the field broadly *agree*? (4) Is A free
of distorting bias? *Example:* a celebrated physicist endorsing a health supplement. *Why
it fails:* expertise doesn't transfer across domains, and a lone authority can be wrong or
biased. *Legit cousin:* deferring to qualified, consensus expert testimony within a field
is *reasonable inductive support*, not a fallacy — most of what anyone knows rests on it.
The fallacy is the *misplaced* or *misrepresented* appeal.

**Ad Hominem (against the person).** *What:* rejecting a claim by attacking its source
rather than its content. *Varieties:* **abusive** (attack character), **circumstantial**
(dismiss because of the arguer's situation/interest), **tu quoque** ("you do it too").
*Pattern:* "A is [bad / biased / hypocritical], therefore A's claim P is false." *Tell:*
"Does the attack change whether P is *true*, or only how we feel about A?" *Example:* "He's
a convicted fraud, so his argument about tax policy is wrong." *Why it fails:* even a liar
can state a truth; the argument stands or falls on its premises. *Legit cousin:* when the
issue *is* the person's credibility as a witness — assessing testimony, conflict of
interest, or track record — relevance to reliability is fair game. Attacking testimony's
source differs from attacking an argument's source.

**Appeal to Ignorance (ad ignorantiam).** *What:* concluding a proposition is true because
it hasn't been proven false, or false because not proven true. *Pattern:* "No proof of ¬P,
therefore P." *Tell:* "Is absence of evidence being treated as evidence of absence — and
has anyone actually looked?" *Example:* "No one has disproven ghosts, so they exist." *Why
it fails:* not finding something is only telling if a competent search would have found it.
*Legit cousins:* (1) a thorough, well-designed search that *would* have turned up X licenses
"probably no X" (this is valid inductive reasoning, not the fallacy); (2) institutional
presumptions like "innocent until proven guilty" are procedural rules about burden of
proof, not claims that the unproven is false.

**Diversion (red herring).** *What:* changing the subject to something superficially
related, then treating the new point as if it addressed the original. *Tell:* "Did the
response answer the question asked, or a different, easier one?" *Example:* asked about
budget overruns, a manager talks at length about team morale. *Why it fails:* the original
claim is left unaddressed. *Key species:* **Straw Man** — distorting the opponent's
position into a weaker one and refuting *that*; the tell is "would the opponent recognize
this as their view?" The repair is the **steel man**: address the strongest honest version.

**Genetic Fallacy.** *What:* judging a claim solely by its origin or history rather than
its current merits. *Tell:* "Does where this idea *came from* settle whether it's true
now?"

---

## Part 4 — Fallacies of weak induction and causation

Here there is *some* relevant support, but far too little to carry the conclusion.

**Hasty Generalization.** *What:* generalizing from a sample too small, unrepresentative,
or biased to support the conclusion. *Pattern:* "These few F's are G, therefore all/most
F's are G." *Tell:* "Is the sample big enough *and* representative of the whole population?"
*Example:* "Two rude tourists from that country — they're all rude." *Why it fails:* small
or skewed samples don't fix population proportions. *Legit cousin:* a properly sized,
representative, randomly drawn sample *does* support a generalization (see
`inductive-and-statistical.md`). The fallacy is the leap, not generalization itself.

**Post Hoc (post hoc ergo propter hoc) and False Cause.** *What:* inferring causation from
mere succession or correlation. *Pattern:* "B followed A (or B correlates with A),
therefore A caused B." *Tell:* "Could this be coincidence, reverse causation, or a common
third cause?" *Example:* "I wore my lucky socks and we won, so the socks did it." *Why it
fails:* temporal order and correlation are necessary but nowhere near sufficient for cause.
*Related:* **cum hoc** (correlation→cause without sequence), **confounding** (a lurking
common cause). *Repair:* apply Mill's methods and control for confounders
(`inductive-and-statistical.md`).

**Weak / False Analogy.** *What:* resting a conclusion on an analogy whose similarities are
too few, irrelevant, or swamped by relevant differences. *Tell:* "Are the shared features
the ones that matter to the conclusion, and do the differences undercut it?" See the
analogy criteria in `inductive-and-statistical.md`.

**Slippery Slope.** *What:* claiming one step will inevitably cascade to an extreme outcome
without supporting each link. *Pattern:* "Allow A and we'll inevitably end at Z." *Tell:*
"Is each step from A to Z actually probable, or just asserted?" *Legit cousin:* a slope
argument with *real evidence* for each transition is a legitimate causal/inductive
argument.

---

## Part 5 — Fallacies of presumption and context

The argument smuggles in something it hasn't earned, or drops context that would change
the verdict.

**False Alternative (false dilemma / either-or).** *What:* presenting two (or few) options
as exhaustive when others exist. *Pattern:* "Either P or Q; not P; therefore Q" — where P
and Q aren't the only options. *Tell:* "Is there a third option being hidden, or a middle
ground?" *Example:* "Either we cut all funding or we go bankrupt." *Why it fails:* the
disjunction is false, so the valid-looking disjunctive syllogism rests on a bad premise.
*Legit cousin:* a *genuine* dichotomy (P ∨ ¬P) is exhaustive; the fallacy is faking
exhaustiveness.

**Begging the Question (petitio principii).** *What:* assuming the conclusion among the
premises — the argument's support depends on what it's trying to prove. *Pattern:* "P,
therefore P" (often disguised by restatement). *Tell:* "Would someone who doubts the
conclusion already have to accept this premise? If accepting the premise *requires*
accepting the conclusion, it begs the question." *Example:* "The Bible is true because it's
the word of God, and we know that because the Bible says so." *Why it fails:* it persuades
no one not already convinced; it's circular. *Relatives:* **circular reasoning** (a loop of
mutual support), and **complex / loaded question** ("Have you stopped cheating?") which
presupposes an unestablished claim inside the question itself.

**Suppressed Evidence.** *What:* ignoring known evidence that would undermine the
conclusion — true premises, but a rigged selection. *Tell:* "What relevant fact is being
left out that would change the verdict?" This is the inductive analog of an invalid
omission: the argument can be "strong" only because contrary data was hidden.

---

## Part 6 — Fallacies of ambiguity

The argument trades on a shift or unclarity in meaning. Detect by holding each key term to
a single fixed sense throughout.

**Equivocation.** *What:* using one word in two different senses within the argument, so
the premises only connect verbally. *Pattern:* "All P are M₁; X is M₂; ∴ X is P," where M
shifts sense. *Tell:* "Does any key term mean the same thing in every premise?" *Example:*
"The end of a thing is its perfection; death is the end of life; so death is life's
perfection." ("end" = goal vs. termination.) *Why it fails:* with the meanings pinned down,
the middle term no longer links the premises.

**Amphiboly.** *What:* ambiguity from grammar/sentence structure rather than a single word.
*Example:* "I saw the man with the telescope" — who has the telescope? *Tell:* "Could the
sentence's structure be parsed more than one way, and does the argument lean on the
unintended parse?"

**Composition.** *What:* inferring that the whole has a property because its parts do.
*Pattern:* "Each part is F, therefore the whole is F." *Tell:* "Does this property transfer
from parts to wholes?" *Example:* "Every player is excellent, so the team is excellent."
(Coordination can fail.) *Why it fails:* some properties are emergent, not additive.

**Division.** *What:* the reverse — inferring a part has a property because the whole does.
*Pattern:* "The whole is F, therefore each part is F." *Tell:* same transfer question, run
downward. *Example:* "The machine is heavy, so this screw is heavy." *Note:* composition
and division are sometimes valid (the wall is brick → bricks are brick); the fallacy is
assuming the transfer *always* holds.

---

## Part 7 — Self-audit checklist

Run this on your *own* argument before you rely on it. For each, a "no" is a warning.

1. **Evidence vs. attitude.** Have I anywhere used the fact that I (or others) *believe*,
   *want*, or *feel* P as if it were evidence for P? (Part 2)
2. **Relevance.** Does every premise actually bear on the *truth* of the conclusion, or am
   I leaning on an authority, the crowd, an emotion, or an attack on a person? (Parts 2–3)
3. **Circularity.** Does any premise secretly assume the conclusion? Would a doubter accept
   it without already granting the conclusion? (Begging the question)
4. **Completeness of options.** Where I've framed an either/or, are those really the only
   options? (False alternative)
5. **Sample and cause.** Am I generalizing from too little, or reading cause into mere
   correlation/sequence? (Part 4)
6. **Fixed meanings.** Does each key term keep one sense throughout? (Equivocation)
7. **Suppressed evidence.** What contrary evidence do I know of that I haven't accounted
   for? (Part 5)
8. **Charity check (for criticism).** Am I refuting the strongest version of the opposing
   view, or a straw man? (Part 3)

A clean pass doesn't make an argument sound — it only means it isn't *fallaciously* unsound.
Validity/strength and the truth of the premises still have to be checked separately.

## Cross-references
- Formal fallacies → `deductive-propositional.md`, `categorical-logic.md`
- Distribution of terms → `categorical-logic.md`
- Sample quality, analogy criteria, Mill's methods → `inductive-and-statistical.md`
- Standard-form reconstruction, steel-manning → `argument-analysis.md`
