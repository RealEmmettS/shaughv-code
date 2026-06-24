# Modal & Advanced Logic (survey level)

Classical logic handles "P is true." Modal logic handles *how* P is true — necessarily,
possibly, obligatorily, known to be. This file is a working survey, deliberately bounded
(see SKILL.md "Scope boundaries"): enough to reason with the basics and recognize the
landscape, not a full proof system.

## 1. The modal operators

- **`□P`** — "necessarily P" (true no matter how things could have been).
- **`◇P`** — "possibly P" (true in at least one way things could be).

**Interdefinition:** `□P ⟺ ¬◇¬P` ("necessary" = "not possibly not"); `◇P ⟺ ¬□¬P`
("possible" = "not necessarily not"). Each operator is definable from the other plus
negation, exactly as ∀ and ∃ interdefine.

## 2. Possible-worlds semantics (intuition)

Picture a set of possible worlds with an **accessibility** relation between them. Then:
`□P` is true at a world w iff P is true in *every* world accessible from w; `◇P` iff P is
true in *some* accessible world. The properties of the accessibility relation determine
which modal principles hold — that's what separates the systems.

## 3. The standard systems (named and sketched)

Each adds axioms to the base:
- **K** (base): `□(P→Q) → (□P→□Q)` (necessity distributes over the conditional). Holds
  everywhere; assumes nothing about accessibility.
- **T**: adds `□P → P` (what's necessary is actual). Accessibility is **reflexive**.
- **S4**: adds `□P → □□P` (necessity iterates). Accessibility is **transitive**.
- **S5**: adds `◇P → □◇P` (possibility is itself necessary). Accessibility is an
  **equivalence relation** — the strongest common system, where iterated modalities collapse
  (`□□P ⟺ □P`).

## 4. The modal scope fallacy (high-value)

Distinguish the **necessity of the consequence** from the **necessity of the consequent**:
`□(P → Q)` ("necessarily, if P then Q") does **not** give `P → □Q` ("if P, then necessarily
Q"). The classic error: "Necessarily, if he's a bachelor he's unmarried; he's a bachelor;
therefore he's necessarily unmarried." The necessity attaches to the *link*, not to his
marital status. Watch scope of `□`/`◇` over conditionals.

**De dicto vs. de re:** `□∀x(Px → Qx)` (of the *proposition*) differs from
`∀x(Px → □Qx)` (of each *thing*, that it necessarily Q's). Many modal confusions are scope
ambiguities of this kind.

## 5. Other modalities (brief)

- **Deontic** (obligation `O`, permission `P`, prohibition `F`): "ought" logic. Note `OP`
  does *not* entail `P` — obligations are often unmet — so the T axiom fails here.
- **Epistemic / doxastic** (knows `K`, believes `B`): `KP → P` (knowledge is factive);
  belief is not.
- **Temporal** (always/eventually, "will"/"was"): operators over times instead of worlds.

## 6. Non-classical logics (one-line tours)

- **Intuitionistic:** rejects the law of excluded middle (`P ∨ ¬P`) and double-negation
  elimination as universally valid; truth = constructive provability.
- **Many-valued:** more than two truth values (e.g., true/false/indeterminate) for vagueness
  or future contingents.
- **Paraconsistent:** tolerates some contradictions without **explosion** (classically,
  `P ∧ ¬P ⊢ Q` — anything follows from a contradiction; paraconsistent logics block this).

## 7. Out of scope (extension points)

Full modal proof systems, metalogic (soundness/completeness for these systems),
higher-order logic, and formal probability/Bayesian logic are noted but not developed here.
