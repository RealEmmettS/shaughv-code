# Categorical Logic

The Aristotelian layer: reasoning about classes ("all/some/no S are P"). Older than
symbolic logic and still the cleanest tool for syllogistic argument and for the
distribution concept that several formal fallacies depend on.

## 1. The four standard forms

| Type | Form | Name | Quantity | Quality |
|---|---|---|---|---|
| **A** | All S are P | universal affirmative | universal | affirmative |
| **E** | No S are P | universal negative | universal | negative |
| **I** | Some S are P | particular affirmative | particular | affirmative |
| **O** | Some S are not P | particular negative | particular | negative |

(The letters come from Latin *AffIrmo* / *nEgO*.)

## 2. Distribution

A term is **distributed** if the proposition says something about *every* member of its
class.

| | Subject | Predicate |
|---|---|---|
| **A** (all S are P) | distributed | undistributed |
| **E** (no S are P) | distributed | distributed |
| **I** (some S are P) | undistributed | undistributed |
| **O** (some S are not P) | undistributed | distributed |

Mnemonic: universals distribute the subject; negatives distribute the predicate.
Distribution drives the syllogism rules and the illicit-major/minor and undistributed-middle
fallacies.

## 3. The square of opposition

Relations among the four forms with the same S and P:
- **Contradictories** (opposite truth values): A ↔ O, E ↔ I. (If A is true, O is false, etc.)
- **Contraries** (can't both be true; can both be false): A and E — *traditional* reading only.
- **Subcontraries** (can't both be false; can both be true): I and O — traditional only.
- **Subalternation:** truth flows down (A→I, E→O); falsity flows up — traditional only.

**Modern vs. traditional:** the modern (Boolean) reading drops **existential import** from
universals — "all unicorns are white" can be true with no unicorns — so only the
contradictory relations survive. The traditional (Aristotelian) reading assumes the subject
class is non-empty and keeps the full square. State which reading you're using; arguments
relying on subalternation or contraries are valid only on the traditional reading.

## 4. Immediate inferences (one premise)

- **Conversion** (swap S and P): valid for **E** and **I** only. ("No S are P" ⟺ "No P are
  S".) Converting A or O is a fallacy ("all dogs are animals" ≠ "all animals are dogs").
- **Obversion** (change quality, replace P with its complement non-P): valid for **all
  four**. ("All S are P" ⟺ "No S are non-P".)
- **Contraposition** (swap *and* complement both terms): valid for **A** and **O** only.
  ("All S are P" ⟺ "All non-P are non-S".)

## 5. Categorical syllogisms

Three categorical propositions, three terms (major P, minor S, middle M). **Mood** = the
three letters (e.g., AAA); **figure** = the position of the middle term across the premises.

**The rules (a syllogism is valid iff it breaks none):**
1. The middle term must be distributed at least once. (Violation: **undistributed middle**.)
2. Any term distributed in the conclusion must be distributed in its premise. (Violation:
   **illicit major / illicit minor**.)
3. Two negative premises yield no valid conclusion. (**Exclusive premises**.)
4. A negative premise requires a negative conclusion, and vice versa.
5. (Traditional only) Two universal premises can't yield a particular conclusion without
   existential import. (**Existential fallacy** on the modern reading.)

## 6. Venn diagram test

Three overlapping circles (S, P, M). **Shade** regions a *universal* premise says are empty;
place an **×** where a *particular* premise says something exists; do universals first.
After diagramming both premises, the syllogism is valid iff the conclusion's content is
*already represented* in the diagram.

## 7. Translating into standard form

Rephrase ordinary sentences into "All/No/Some S are (not) P": "Only members enter" → "All
who enter are members"; "Whoever hesitates is lost" → "All who hesitate are lost". Watch
"only" (it reverses subject/predicate) and singular subjects ("Socrates is mortal" → treat
as universal about the unit class).
