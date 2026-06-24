# Predicate (First-Order) Logic

Propositional logic can't see inside a sentence. "All men are mortal; Socrates is a man; so
Socrates is mortal" is valid, but propositionally it's just `P, Q ∴ R` — invalid-looking.
Predicate logic exposes the inner structure: predicates, individuals, and quantifiers.

## 1. The vocabulary

- **Predicates** (capitals): `Mx` = "x is mortal", `Lxy` = "x loves y" (relations take more
  than one argument).
- **Constants / names** (lowercase a–u): `s` = Socrates. **Variables** (x, y, z): placeholders
  bound by quantifiers.
- **Domain of discourse:** the set of things the quantifiers range over. State it; validity
  can depend on it.

## 2. Quantifiers and the standard translations

- **Universal** `∀x` (traditional `(x)`): "for every x". Pairs with **→**.
- **Existential** `∃x` (traditional `(∃x)`): "for at least one x". Pairs with **∧**.

| English | Symbolization |
|---|---|
| All S are P | `∀x(Sx → Px)` |
| No S are P | `∀x(Sx → ¬Px)` |
| Some S are P | `∃x(Sx ∧ Px)` |
| Some S are not P | `∃x(Sx ∧ ¬Px)` |

The classic errors: `∀x(Sx ∧ Px)` for "all S are P" (says everything is S and P), and
`∃x(Sx → Px)` for "some S are P" (a near-trivial conditional). Universal→conditional,
existential→conjunction.

## 3. Quantifier negation (interdefinition)

- `¬∀x Px ⟺ ∃x ¬Px` ("not everything is P" = "something isn't P")
- `¬∃x Px ⟺ ∀x ¬Px` ("nothing is P" = "everything is not-P")

Push negations inward by flipping the quantifier and negating the body.

## 4. The four quantifier rules (and their restrictions)

These extend natural deduction to quantified formulas. The **restrictions are where silent
errors live** — they exist to block invalid moves.

- **Universal Instantiation (UI):** from `∀x φx` infer `φa` for *any* name `a`. (Always
  safe — what holds of all holds of each.)
- **Existential Instantiation (EI):** from `∃x φx` infer `φa` — but **a must be a brand-new
  name** not occurring earlier in the proof. (Otherwise you'd illicitly identify the
  "something" with an already-named thing.) **Do EI before UI** when both are available, so
  the new EI name can then be instantiated to by UI.
- **Universal Generalization (UG):** from `φa` infer `∀x φx` — only if `a` is **arbitrary**:
  it was not introduced by EI and is not free in any undischarged assumption. (Otherwise
  you'd generalize from a special case.)
- **Existential Generalization (EG):** from `φa` infer `∃x φx` for any name `a`. (Always
  safe — what holds of something holds of *some*thing.)

The canonical syllogism, proved:
```
 1. ∀x(Mx → Lx)     Premise   ("all men are mortal")
 2. Ms               Premise   ("Socrates is a man")
 3. Ms → Ls          1, UI
 4. Ls               3, 2, MP  ("Socrates is mortal")
```

## 5. Multiple quantifiers, order, and relations

Order matters: `∀x∃y Lxy` ("everyone loves someone — possibly different someones") differs
from `∃y∀x Lxy` ("someone is loved by everyone"). With relations, track which argument
place each quantifier binds. Mixed-quantifier proofs must respect EI's new-name rule
strictly.

## 6. Identity

`=` lets us say "the same object." `a = b` means a and b are one thing. Rules:
- **Reflexivity (=I):** `⊢ a = a`.
- **Substitution / Leibniz's Law (=E):** from `a = b` and `φa`, infer `φb` (substitute
  equals). Enables "at least/at most/exactly n" and definite descriptions: "exactly one P"
  = `∃x(Px ∧ ∀y(Py → y = x))`.

## 7. Showing invalidity — countermodels

You can't prove an invalid argument; you exhibit a **countermodel**: a small domain with an
interpretation making the premises true and conclusion false. E.g., to refute
"`∃x Fx, ∃x Gx ∴ ∃x(Fx ∧ Gx)`," take domain {1, 2}, `F` = {1}, `G` = {2}: both premises
true, conclusion false. One countermodel settles invalidity.
