# Propositional Logic — the deductive core ("Inference & Equivalence")

The heart of the skill. Propositional logic treats whole simple sentences as units joined
by truth-functional connectives, and asks whether conclusions follow *by form alone*.

## 1. Truth-functional semantics

Each connective is fully defined by how it maps the truth values of its parts:

| P | Q | ¬P | P∧Q | P∨Q | P→Q | P↔Q |
|---|---|----|-----|-----|-----|-----|
| T | T | F  | T   | T   | T   | T   |
| T | F | F  | F   | T   | F   | F   |
| F | T | T  | F   | T   | T   | F   |
| F | F | T  | F   | F   | T   | T   |

Note the conditional: `P → Q` is false in **exactly one** case, P true and Q false. A
false antecedent makes the whole conditional true ("vacuously true").

**Key semantic definitions.**
- **Tautology:** true under every assignment (e.g., `P ∨ ¬P`). **Contradiction:** false
  under every assignment (`P ∧ ¬P`). **Contingent:** true under some, false under others.
- **Logical equivalence:** two formulas with identical truth-table columns (`P → Q` ≡
  `¬P ∨ Q`).
- **Consistency:** a set of formulas is consistent if some single assignment makes them all
  true.
- **Validity (the target):** an argument is valid iff there is **no** assignment on which
  all premises are true and the conclusion false. Validity is about form, not truth of
  premises; **soundness** = valid *and* all premises actually true.

## 2. Testing validity (semantic methods)

- **Full truth table.** Build a row per assignment; the argument is valid iff every row
  with all-true premises has a true conclusion. A single counterexample row = invalid (and
  *is* the counterexample to report).
- **Short (indirect) truth-table method.** Faster: *assume* the conclusion false and all
  premises true, then propagate forced values. If you reach a contradiction, no such row
  exists → valid. If you complete a consistent assignment → invalid, and that assignment is
  the counterexample.
- **Truth-trees (semantic tableaux).** Decompose premises + negated conclusion by branching
  rules; if every branch closes (hits `A` and `¬A`), the set is unsatisfiable → valid. Open
  branches give counterexamples. Useful when tables get large.

## 3. Natural deduction — the Nine Rules of Inference

These are **argument forms**: from lines matching the pattern, you may write the
conclusion. They apply to **whole lines only** and in **one direction**.

| Rule | Modern form | Traditional | Plain English |
|---|---|---|---|
| Modus Ponens (MP) | `P→Q, P ⊢ Q` | `P⊃Q, P ∴ Q` | affirm the antecedent → get consequent |
| Modus Tollens (MT) | `P→Q, ¬Q ⊢ ¬P` | `P⊃Q, ~Q ∴ ~P` | deny consequent → deny antecedent |
| Hypothetical Syllogism (HS) | `P→Q, Q→R ⊢ P→R` | `P⊃Q, Q⊃R ∴ P⊃R` | chain conditionals |
| Disjunctive Syllogism (DS) | `P∨Q, ¬P ⊢ Q` | `P∨Q, ~P ∴ Q` | rule out one disjunct |
| Constructive Dilemma (CD) | `(P→Q)∧(R→S), P∨R ⊢ Q∨S` | … | two conditionals + a disjunction |
| Simplification (Simp) | `P∧Q ⊢ P` | `P•Q ∴ P` | pull a conjunct |
| Conjunction (Conj) | `P, Q ⊢ P∧Q` | `P, Q ∴ P•Q` | combine into a conjunction |
| Addition (Add) | `P ⊢ P∨Q` | `P ∴ P∨Q` | weaken to a disjunction |
| Absorption (Abs) | `P→Q ⊢ P→(P∧Q)` | `P⊃Q ∴ P⊃(P•Q)` | absorb antecedent into consequent |

## 4. The Ten Rules of Replacement (Equivalence)

These are **equivalences** (`⟺`): either side may be swapped for the other, and — unlike
inference rules — they apply to a **whole line or any subformula within it**, in **either
direction**. This is the "Equivalence" half of "Inference and Equivalence."

| Rule | Equivalence(s), modern |
|---|---|
| De Morgan's (DeM) | `¬(P∧Q) ⟺ (¬P∨¬Q)` ; `¬(P∨Q) ⟺ (¬P∧¬Q)` |
| Commutation (Comm) | `(P∨Q) ⟺ (Q∨P)` ; `(P∧Q) ⟺ (Q∧P)` |
| Association (Assoc) | `[P∨(Q∨R)] ⟺ [(P∨Q)∨R]` ; same for ∧ |
| Distribution (Dist) | `[P∧(Q∨R)] ⟺ [(P∧Q)∨(P∧R)]` ; `[P∨(Q∧R)] ⟺ [(P∨Q)∧(P∨R)]` |
| Double Negation (DN) | `P ⟺ ¬¬P` |
| Transposition (Trans) | `(P→Q) ⟺ (¬Q→¬P)` |
| Material Implication (Impl) | `(P→Q) ⟺ (¬P∨Q)` |
| Material Equivalence (Equiv) | `(P↔Q) ⟺ [(P→Q)∧(Q→P)]` ; `(P↔Q) ⟺ [(P∧Q)∨(¬P∧¬Q)]` |
| Exportation (Exp) | `[(P∧Q)→R] ⟺ [P→(Q→R)]` |
| Tautology (Taut) | `P ⟺ (P∨P)` ; `P ⟺ (P∧P)` |

**The crucial distinction:** inference rules are one-directional and whole-line only;
replacement rules are bidirectional and can rewrite a piece of a line. Misapplying an
inference rule to a *part* of a line is a common silent error.

## 5. Proof format and conditional/indirect proof

Number each line; the justification column cites the rule and the line numbers used.

**Conditional Proof (CP):** to prove `P → Q`, *assume* `P` (open an indented subproof),
derive `Q`, then discharge: write `P → Q` citing the assumed range. The assumption is
"used up" — nothing inside the subproof may be cited after it closes.

**Indirect Proof (IP / reductio ad absurdum):** to prove `P`, assume `¬P`, derive a
contradiction `Q ∧ ¬Q`, then discharge to conclude `P`. Best when a direct route stalls or
the goal is a negation.

## 6. Strategy heuristics

- Work **backward** from the goal: what rule could yield it? A `→` goal → try CP. A
  negation or hard goal → try IP.
- Work **forward** from premises: simplify conjunctions, break down with DS/MP what you
  can.
- Use replacement rules to *reshape* lines into the patterns inference rules need (e.g.,
  Impl to turn `¬P ∨ Q` into `P → Q` for HS).

## 7. Worked proof

Prove `A → C` from (1) `A → B` and (2) `B → C`.
```
 1. A → B            Premise
 2. B → C            Premise
 3. A → C            1, 2, HS
```
Harder — prove `¬P` from (1) `P → Q` and (2) `¬Q`:
```
 1. P → Q            Premise
 2. ¬Q               Premise
 3. ¬P               1, 2, MT
```
With CP — prove `(A ∧ B) → C` from `A → (B → C)`:
```
 1. A → (B → C)      Premise
 2. | A ∧ B          Assumption (CP)
 3. | A              2, Simp
 4. | B              2, Simp
 5. | B → C          1, 3, MP
 6. | C              5, 4, MP
 7. (A ∧ B) → C      2–6, CP
```

## 8. Debugging a stuck proof
- Have you used every premise? Unused premises usually hold the key.
- Reshape with replacement rules (Impl, DeM, Trans) to expose an inference pattern.
- Switch strategy: if forward chaining stalls, try CP/IP from the goal.
- Re-check that each inference-rule application is to a *whole line*, not a fragment.
