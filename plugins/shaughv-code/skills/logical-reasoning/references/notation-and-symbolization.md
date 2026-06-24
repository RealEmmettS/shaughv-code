# Notation & Symbolization

Symbolizing is the first discipline: most reasoning errors hide in vague prose and become
visible the moment the argument is written in symbols. Translate faithfully, then reason on
the symbols.

## The connective legend (canonical)

| Operator | Traditional | Modern | Plain English | Truth behavior |
|---|---|---|---|---|
| Negation | `~P` | `¬P` | "not P" | flips truth value |
| Conjunction | `P • Q` | `P ∧ Q` | "P and Q" | true only if both true |
| Disjunction | `P ∨ Q` | `P ∨ Q` | "P or Q (or both)" | false only if both false |
| Conditional | `P ⊃ Q` | `P → Q` | "if P then Q" | false only when P true, Q false |
| Biconditional | `P ≡ Q` | `P ↔ Q` | "P if and only if Q" | true when both sides match |

Working rule (from SKILL.md): catalogs show traditional + modern; live work uses one
canonical set (default modern) plus a plain-English reading of the result.

## Precedence and grouping

Binding strength, tightest first: **¬ , ∧ , ∨ , → , ↔**. So `¬P ∧ Q → R` reads
`((¬P) ∧ Q) → R`. When in doubt, parenthesize — ambiguity in grouping is a frequent silent
error. `→` is right-associative (`P→Q→R` means `P→(Q→R)`), but prefer explicit parentheses.

## Building a dictionary

Assign each *atomic* (non-compound, declarative) sentence a capital letter, mapped to a
full English sentence — not a topic. Good: `R = "it is raining"`. Bad: `R = "rain"`. Keep
the same letter for the same proposition throughout; never reuse a letter for two
propositions.

## Natural language → symbols: the keyword map

- **"and / but / however / although / moreover / yet"** → `∧` (the contrast words are
  still truth-functional conjunctions: "P but Q" = `P ∧ Q`).
- **"or"** → `∨` (inclusive by default). Exclusive "or" ("either P or Q but not both") =
  `(P ∨ Q) ∧ ¬(P ∧ Q)`.
- **"if P then Q" / "P implies Q"** → `P → Q`.
- **"P only if Q"** → `P → Q` (only-if marks the *consequent*: P's truth requires Q).
- **"P if Q"** → `Q → P` (bare "if" marks the *antecedent*).
- **"P unless Q"** → `¬Q → P`, equivalently `P ∨ Q`.
- **"P provided that / given that Q"** → `Q → P`.
- **"P is necessary for Q"** → `Q → P`. **"P is sufficient for Q"** → `P → Q`.
- **"not both P and Q"** → `¬(P ∧ Q)`. **"neither P nor Q"** → `¬(P ∨ Q)` = `¬P ∧ ¬Q`.
- **"P if and only if Q"** → `P ↔ Q`.

The two that trip people: *only if* points at the consequent; *unless* means *if not*.

## Quantified statements (preview; full treatment in deductive-predicate.md)

- **"All S are P"** → `∀x(Sx → Px)` — universal pairs with the conditional.
- **"Some S are P"** → `∃x(Sx ∧ Px)` — existential pairs with the conjunction.
- **"No S are P"** → `∀x(Sx → ¬Px)`.
- **"Some S are not P"** → `∃x(Sx ∧ ¬Px)`.

A common error is `∀x(Sx ∧ Px)` for "all S are P" — that says *everything* is both S and P.

## Scope and ambiguity to flag

- **"All that glitters is not gold."** Surface reading `∀x(Gx → ¬Au x)` ("nothing that
  glitters is gold") vs. intended `¬∀x(Gx → Au x)` ("not all glittering things are gold").
  Flag and pick the intended reading.
- **Quantifier order.** "Everyone loves someone" `∀x∃y Lxy` ≠ "there's someone everyone
  loves" `∃y∀x Lxy`.
- **Inclusive vs. exclusive "or"**, and **collective vs. distributive** "and" ("Tom and
  Jia carried the piano" — together or each?).

## Checking a translation

Test it against truth conditions: list the cases that make the English true and false, and
confirm the symbolic form agrees. If a case diverges, the translation is wrong. For
conditionals especially, verify the *only* false case is antecedent-true/consequent-false.

## Worked example

"You can have dessert only if you finish your vegetables, but you won't finish them unless
you stop talking."
Dictionary: `D` = "you have dessert"; `F` = "you finish your vegetables"; `S` = "you stop
talking". Translation: `(D → F) ∧ (¬S → ¬F)`. Reading: dessert requires finishing; not
stopping talking means not finishing.
