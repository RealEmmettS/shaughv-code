---
name: logical-reasoning
description: >-
  Master toolkit for rigorous deductive and inductive reasoning. Use whenever the task involves
  evaluating an argument, checking or building a proof, testing validity, symbolizing language
  into logical notation, spotting a fallacy (including your own), weighing inductive,
  statistical, or analogical evidence, or evaluating an explanation — or whenever a load-
  bearing, contested conclusion you are about to assert deserves formal rigor. Trigger even when
  the user never says "logic": "is this valid", "does this follow", "prove that", "symbolize
  this", "what’s the fallacy", "sound or unsound", "how strong is this evidence", or any request
  to reason carefully toward a conclusion. (For open-ended thinking facilitation prefer
  critical-thinking; this skill is for formal rigor.) When in doubt whether reasoning needs to
  be made rigorous, trigger.
---

# Logical Reasoning

A working manual for reasoning well — not a textbook to recite. The point is to reach
or test knowledge: take a claim or an argument, find out what kind of support it has,
apply the right method, show the work so it can be audited, and calibrate confidence to
the actual logical strength.

You already know what modus ponens is. This skill exists to stop the predictable
failures that come from reasoning fast instead of carefully: asserting "valid" without a
check, skipping symbolization, conflating an explanation with an argument, over-claiming
from a thin sample, drifting notation mid-proof, and missing your own fallacies. The
value here is **discipline, a shared notation, and repeatable workflows** — not facts you
lack.

## The four modes

Pick the mode that matches the task, then follow its workflow below.

| Mode | Use when | Produces |
|---|---|---|
| **Analyze** | You're handed an argument or claim to evaluate | A standard-form reconstruction + validity/strength verdict |
| **Construct / Prove** | You need to derive a conclusion from given premises | A justified natural-deduction proof (or a built sound argument) |
| **Symbolize / Translate** | You need to move between natural language and notation | A symbolization with dictionary, both notations, and a plain reading |
| **Explain** | The target is an explanation, not an argument | An explanans/explanandum breakdown + best-explanation assessment |

Modes blend. Analyzing an argument usually requires symbolizing first; constructing a
proof requires knowing the rules cold. Move between them freely.

## Notation policy

Render logic in **three registers** so it is both precise and readable:

| Connective / operator | Traditional | Modern | Plain English |
|---|---|---|---|
| Negation | `~P` | `¬P` | "not P" |
| Conjunction | `P • Q` | `P ∧ Q` | "P and Q" |
| Disjunction (inclusive) | `P ∨ Q` | `P ∨ Q` | "P or Q (or both)" |
| Conditional | `P ⊃ Q` | `P → Q` | "if P then Q" |
| Biconditional | `P ≡ Q` | `P ↔ Q` | "P if and only if Q" |
| Universal quantifier | `(x)Px` | `∀x Px` | "every x is P" |
| Existential quantifier | `(∃x)Px` | `∃x Px` | "some x is P" |
| Syntactic derivability | `⊢` | `⊢` | "…proves…" |
| Semantic entailment | `⊨` | `⊨` | "…entails / models…" |
| Necessity (modal) | `□P` | `□P` | "necessarily P" |
| Possibility (modal) | `◇P` | `◇P` | "possibly P" |

**Working rule:** in rule catalogs and the symbol legend, show traditional + modern
together. In a *live* proof or analysis, run **one** canonical set (default **modern**)
to keep it readable, and always give a plain-English reading of the load-bearing steps
and of the final symbolization dictionary. Switch canonical sets on request.

## Core discipline rules

Non-negotiable, because they are exactly the steps fast reasoning skips:

1. **Symbolize before judging.** Publish the dictionary (each letter ↦ its English
   sentence) before claiming anything about form.
2. **Never assert "valid" without a check.** A validity claim must be backed by a
   completed proof, a truth-table/short-table result, or a truth-tree — and "invalid"
   must come with an explicit counterexample (an assignment making premises true and
   conclusion false).
3. **Keep validity and truth apart.** Validity is about form; soundness adds the truth
   of the premises. Say which you're claiming.
4. **Cite every proof line.** Each derived line names its rule and the line numbers it
   draws on. No unjustified steps.
5. **Name fallacies precisely.** "Affirming the consequent," not "that seems off." If
   it's informal, say which one and why it's defective here.
6. **Surface enthymemes.** If an argument relies on an unstated premise, state the
   missing premise explicitly before evaluating.
7. **Calibrate inductive force.** Inductive and abductive conclusions get a strength
   judgment tied to the evidence (sample quality, analogy fit, base rates), never a
   bare "therefore."

## Mode workflows

### Analyze
1. Decide whether there's an argument at all (premises offered *for* a conclusion) vs.
   an explanation, report, or assertion. If explanation → switch to **Explain**.
2. **Distil it first** — step back from the wording and write your *own* summary
   (author's purpose? conclusion? evidence? why is the evidence supposed to prove it?),
   then reconstruct in standard form (premises numbered, conclusion `∴`), supplying any
   missing premise (rule 6). Procedure in `references/argument-analysis.md`. For two-sided
   material (a debate, an objection-and-reply), use that file's **debate diagramming**:
   identify the conclusions, diagram the main argument, then the counterarguments.
3. Classify the intended support: **deductive**, **inductive**, or **abductive**.
4. If deductive: symbolize, then test validity (open `references/deductive-propositional.md`
   or `…-predicate.md`/`…-categorical.md`). If inductive/abductive: open
   `references/inductive-and-statistical.md` or `references/explanation.md`.
5. Assess soundness (deductive) or cogency/strength (inductive), and scan for fallacies
   (`references/fallacies.md`).

**Output template:**
```
Argument (standard form):
  P1. …
  P2. …            [P3. <supplied missing premise>]
  ∴ C. …
Support claimed: deductive | inductive | abductive
Dictionary: P = "…"; Q = "…"
Symbolic form: <modern>      ("plain-English reading")
Validity / strength: <method> → valid | invalid (+ counterexample) | strong | weak
Soundness / cogency: <are the premises true? known / disputed / false>
Fallacies: none | <named> — <why it fails here>
Verdict: <one line>
```

### Construct / Prove
1. State the goal: `⊢ <conclusion>` and lay out the premises as numbered lines.
2. Work the proof using the 9 rules of inference and 10 rules of replacement; reach for
   **conditional proof (CP)** for `→`-conclusions and **indirect proof (IP/RAA)** when a
   direct route stalls. Full rule statements: `references/deductive-propositional.md`;
   quantified goals: `references/deductive-predicate.md`.
3. Read back the strategy in plain English (what each block of moves accomplished).

**Quick rule reference (modern notation; full forms with traditional + English in the reference):**

*Nine rules of inference:*
- MP: `P→Q, P ⊢ Q` · MT: `P→Q, ¬Q ⊢ ¬P` · HS: `P→Q, Q→R ⊢ P→R`
- DS: `P∨Q, ¬P ⊢ Q` · CD: `(P→Q)∧(R→S), P∨R ⊢ Q∨S` · Simp: `P∧Q ⊢ P`
- Conj: `P, Q ⊢ P∧Q` · Add: `P ⊢ P∨Q` · Abs: `P→Q ⊢ P→(P∧Q)`

*Ten rules of replacement (`⟺`, substitutable in either direction, even on subformulas):*
- DeM · Comm · Assoc · Dist · DN (`P ⟺ ¬¬P`) · Trans (`P→Q ⟺ ¬Q→¬P`)
- Impl (`P→Q ⟺ ¬P∨Q`) · Equiv · Exp (`(P∧Q)→R ⟺ P→(Q→R)`) · Taut

*Predicate add-ons:* UI, EI, UG, EG — with the standard instantiation/generalization
restrictions (see reference; misapplied EI/UG is a common silent error).

**Output template:**
```
Goal: ⊢ <conclusion>
Dictionary: …
 1. <premise>                 Premise
 2. <premise>                 Premise
 …
 n. <conclusion>              <RULE>, <line refs>
Reading: <plain-English account of the key moves>
```

### Symbolize / Translate
Build a dictionary, then translate. Flag scope ambiguities ("all that glitters is not
gold" — `¬∀` or `∀¬`?), quantifier order, and inclusive vs. exclusive "or." Give both
notations once and a plain reading. Reference: `references/notation-and-symbolization.md`.

### Explain
Distinguish the **explanandum** (what is explained) from the **explanans** (what does the
explaining); an explanation answers "why is this so?" not "why should I believe this?".
For competing explanations, score them on testability, scope, simplicity, conservatism,
and fit, then name the best and why (inference to the best explanation). Reference:
`references/explanation.md`.

## Reference routing

Open the file that matches the sub-task; don't load everything.

| If the task involves… | Open |
|---|---|
| Translating NL ↔ symbols, precedence, scope | `references/notation-and-symbolization.md` |
| Truth tables, the 19 rules, ND proofs, CP/IP, truth-trees | `references/deductive-propositional.md` |
| Quantifiers, multiple generality, relations, identity | `references/deductive-predicate.md` |
| Categorical claims, the square, syllogisms, Venn | `references/categorical-logic.md` |
| Necessity/possibility, possible worlds, deontic/epistemic/temporal readings | `references/modal-and-advanced.md` |
| Defining a term, kinds of definition, classification | `references/definition-and-classification.md` |
| Identifying or naming a fallacy | `references/fallacies.md` |
| Finding premises/conclusion, diagramming, validity vs. soundness | `references/argument-analysis.md` |
| Generalizing from samples, analogies, statistics, causation | `references/inductive-and-statistical.md` |
| Explanation vs. argument, IBE, scientific reasoning | `references/explanation.md` |

## Scope boundaries (v1)

**In:** classical propositional and first-order predicate logic; categorical logic;
propositional modal logic at a working level; definition/classification; formal and
informal fallacies; inductive, analogical, and statistical reasoning; explanation/IBE.

**Survey-only (orientation, not full machinery):** modal systems beyond the basics
(K/T/S4/S5 named and sketched), deontic/epistemic/temporal modalities, and a short tour
of non-classical logics (intuitionistic, many-valued, paraconsistent).

**Out:** metalogic proofs (soundness/completeness/compactness theorems), higher-order
logic, and full Bayesian/probabilistic formalism beyond base rates and basic conditional
probability. These are flagged as extension points, not gaps to hide.

