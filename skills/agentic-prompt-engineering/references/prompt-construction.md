# Prompt Construction

Use these controls after the task contract is sound. Wording cannot rescue a false objective, weak
oracle, missing capability, or inaccessible dependency.

## Contents

- [Put instructions at the right level](#put-instructions-at-the-right-level)
- [Use structure as a parser, not a security boundary](#use-structure-as-a-parser-not-a-security-boundary)
- [Place action near governing evidence](#place-action-near-governing-evidence)
- [Positive rules plus discriminating prohibitions](#positive-rules-plus-discriminating-prohibitions)
- [Examples are executable specifications](#examples-are-executable-specifications)
- [Output schemas must preserve truth](#output-schemas-must-preserve-truth)
- [Ask for public reasoning artifacts, not private chain-of-thought](#ask-for-public-reasoning-artifacts-not-private-chain-of-thought)
- [Roles specify duties, not prestige](#roles-specify-duties-not-prestige)
- [Order priorities explicitly](#order-priorities-explicitly)
- [Clarification policy](#clarification-policy)
- [Prompting pattern selection](#prompting-pattern-selection)
- [Parameters are not prose](#parameters-are-not-prose)
- [Prompt audit](#prompt-audit)

## Put instructions at the right level

- **System/project instructions:** stable authority, safety, repository conventions, reusable
  invariants.
- **Skill or reusable prompt:** conditional method and domain behavior.
- **Task prompt:** current objective, inputs, scope, artifacts, acceptance, and output.
- **Tool call:** the smallest concrete action and typed arguments.

Do not repeat the same rule at every level. Repetition can create contradictions, drown out the
current task, and cause newer models to over-verify.

## Use structure as a parser, not a security boundary

Use descriptive headings and consistent delimiters to separate:

- instructions;
- reference material;
- examples;
- current evidence;
- required output.

Delimiters improve parsing but do not make untrusted text safe. Label retrieved content as
evidence and explicitly deny it authority over scope, permissions, or consequential actions.

## Place action near governing evidence

When a rule depends on a source, keep them adjacent:

```text
Current observed schema:
<schema>

Using only the fields above, produce...
```

Avoid a giant context dump followed by a distant, ambiguous verb. Supply only evidence needed for
the current decision; preserve stable paths to bulky material.

## Positive rules plus discriminating prohibitions

Say what to do, then prohibit the nearest plausible failure:

- “Use the installed target runtime; do not substitute a development runtime.”
- “Verify behavior through the external endpoint; do not count a local build as acceptance.”
- “Preserve the evaluator; do not edit tests or held-out cases to make the candidate pass.”

Do not accumulate a graveyard of unrelated “never” rules.

## Examples are executable specifications

Use examples when the desired boundary is hard to express or the output format must be exact.
Prefer:

- one ordinary positive example;
- one near-miss negative example;
- one edge case that teaches the boundary.

Hold the contract constant. An example must not introduce a new hidden rule. Start zero-shot;
add few-shot examples only when evaluation shows a recurring, teachable failure.

## Output schemas must preserve truth

Require fields that allow:

- unknown values;
- conflicting evidence;
- per-criterion status;
- scope limitations;
- evidence pointers;
- partial or blocked outcomes.

Do not use a schema that requires `success: true`, one final answer, or a confidence number when
the evidence may be unresolved.

## Ask for public reasoning artifacts, not private chain-of-thought

Request:

- assumptions;
- concise rationale;
- competing hypotheses;
- predictions;
- raw observations;
- decisions;
- evidence and artifact pointers;
- limitations.

Do not require hidden chain-of-thought, “show every thought,” or a universal “think step by step”
suffix.

## Roles specify duties, not prestige

Useful:

> Act as an independent proof reviewer. Check statement fidelity, identify the earliest invalid
> deduction, and return a claim/evidence table.

Weak:

> You are Paul Erdős, the greatest mathematician alive.

The first assigns operations and standards. The second asks identity language to substitute for
capability and verification.

## Order priorities explicitly

When rules can conflict, state the order. A common order is:

1. goal integrity and safety;
2. semantic correctness;
3. preservation invariants;
4. acceptance evidence;
5. scope and cost;
6. style and presentation.

Do not leave the model to infer whether brevity outranks completeness or whether cleanup outranks
preservation.

## Clarification policy

Do not choose between “always ask” and “never ask.” Ask only when:

- the answer is user-only or authority-bearing;
- alternatives materially change outcome, cost, risk, or irreversible effects;
- a reasonable default is unavailable or likely to diverge from intent.

Otherwise state the assumption, choose the safest in-scope default, and act.

## Prompting pattern selection

| Bottleneck | Pattern |
|---|---|
| clear, directly verifiable request | direct instruction/action |
| output boundary is repeatedly missed | contrastive few-shot examples |
| dependencies hide the first step | least-to-most decomposition |
| long task needs global coherence | plan-and-solve with receding horizon |
| representation is wrong | step-back abstraction or representation switch |
| calculations or formal manipulation dominate | program/tool-assisted reasoning |
| action and observation must alternate | ReAct-style action/observation loop |
| sparse search has distinct method families | bounded tree/graph search |
| stochastic solution exists and verifier is sound | independent sampling or oracle-gated resampling |
| candidate needs localized repair | diagnosis, then bounded refinement |
| proof validity is central | formal reasoning plus semantic audit |

Do not stack patterns by default. Each added pattern must address an observed failure mode and
earn its cost in evaluation.

## Parameters are not prose

Temperature, effort, reasoning mode, tool permissions, context limits, and visible output length
are separate controls. Do not try to simulate a runtime parameter with theatrical wording.

When the model supports an effort control:

- hold the task contract and visible output shape constant;
- test more than one effort level on the target task class;
- measure outcome, severe failures, false success, latency, and cost.

## Prompt audit

Classify each line as one of:

- authority;
- task contract;
- evidence;
- method;
- output;
- conditional overlay;
- redundant;
- contradictory;
- untestable;
- security theater.

Delete or condition the last five categories unless they serve a measured need. Prompt precision
is the density of decision-relevant constraints, not token count.
