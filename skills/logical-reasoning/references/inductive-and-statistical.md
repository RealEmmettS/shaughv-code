# Inductive, Analogical & Statistical Reasoning

Deduction guarantees its conclusion if the premises hold; **induction** does not. Inductive
arguments are **ampliative** (the conclusion says more than the premises) and **defeasible**
(new evidence can overturn them). The right question is never "valid or invalid?" but "how
*strong*, and is it *cogent* (strong + true premises)?"

## 1. Inductive generalization

From features of a **sample** to a claim about a **population**. Strength depends on:
- **Representativeness** — does the sample mirror the population's relevant variety? A biased
  sample (e.g., polling only landlines) ruins the inference regardless of size.
- **Size** — enough instances to make a chance pattern unlikely. Too few → **hasty
  generalization** (see `fallacies.md`).
- **Randomness** — every member should have a fair chance of selection; convenience samples
  invite bias.
- **Margin/qualification** — a modest conclusion ("most," "about 60%") is easier to support
  than a universal one ("all").

A well-drawn, adequately sized, representative sample legitimately supports a generalization
— this is the engine of empirical knowledge, not a fallacy.

## 2. Analogical reasoning

Structure: X and Y share features a, b, c; X also has feature d; therefore Y probably has d.
Strength criteria:
1. **Number of relevant similarities** between the analogues.
2. **Relevance** of those similarities to the inferred feature d — the decisive criterion (a
   hundred irrelevant similarities add nothing).
3. **Number of analogues / instances** the pattern holds across.
4. **Diversity** of the instances — variety strengthens.
5. **Disanalogies** — relevant *differences* weaken; a single relevant disanalogy can break
   the argument.
6. **Modesty of the conclusion** — the more the conclusion claims, the more support it needs.
A **weak/false analogy** (fallacy) is one where the similarities are too few, irrelevant, or
outweighed by relevant differences.

## 3. Statistical reasoning

- **Base rates** — the background frequency of a condition. Ignoring them is **base-rate
  neglect**: a 99%-accurate test for a disease that affects 1 in 10,000 still yields mostly
  false positives, because positives are dominated by the huge healthy population. Always ask
  for the base rate before reading a conditional probability.
- **Conditional probability** — P(A given B) is not P(B given A). Confusing them is the
  **prosecutor's fallacy** (P(evidence | innocent) ≠ P(innocent | evidence)).
- **Correlation vs. causation** — covariation alone never establishes cause (see Post Hoc,
  `fallacies.md`); look for confounders and check direction.

## 4. Causal reasoning — Mill's methods

Tools for isolating a cause from circumstances:
- **Agreement:** if all cases of an effect share one antecedent factor, that factor is
  implicated.
- **Difference:** a case with the effect and a similar case without it differ in one factor —
  that factor is implicated. (The logic of a controlled experiment.)
- **Joint method:** agreement + difference combined.
- **Residues:** subtract the known causes of parts of a complex effect; the remainder is the
  cause of what's left.
- **Concomitant variation:** when one factor varies, the effect varies in step → a causal
  link (dose-response).

## 5. Common statistical / probabilistic errors

- **Conjunction fallacy** — judging P(A ∧ B) > P(A); a conjunction can never be more probable
  than its conjunct.
- **Gambler's fallacy** — expecting independent trials to "balance out" ("red is due").
- **Regression to the mean** — extreme measurements tend to be followed by less extreme ones
  by chance alone; mistaking this for an effect (e.g., crediting a treatment given to the
  worst cases).
- **Confounding / Simpson's paradox** — an association can reverse when a lurking variable is
  accounted for; aggregate and subgroup trends can disagree.
- **Survivorship / selection bias** — drawing conclusions from a sample that systematically
  excludes failures.

## 6. Calibrating and reporting strength

Match the conclusion's confidence to the evidence: a representative sample and controlled
comparison support "strongly"; a single anecdote or uncontrolled correlation supports
"weakly, pending more data." State the defeating conditions — what new evidence *would*
overturn the conclusion. Honest induction names its own fragility.
