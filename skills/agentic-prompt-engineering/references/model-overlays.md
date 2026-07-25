# Model Overlays: Claude Fable 5, Claude Opus 5, and GPT-5.6 Sol

This is a **24 July 2026 snapshot** of current first-party guidance, not a timeless model law.
Recheck the target model's current documentation and evaluate on the real workload after a model
or harness change.

Primary guidance:

- [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5)
- [Prompting Claude Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)
- [Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Prompting guidance for GPT-5.6 Sol](https://developers.openai.com/api/docs/guides/prompt-guidance-gpt-5p6.md)
- [Upgrading to GPT-5.6 Sol](https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p6-sol.md)

## Contents

- [Stable common core](#stable-common-core)
- [Fable 5 overlay](#fable-5-overlay)
- [Opus 5 overlay](#opus-5-overlay)
- [GPT-5.6 Sol and Codex overlay](#gpt-56-sol-and-codex-overlay)
- [Effort and output length](#effort-and-output-length)
- [Opus 5 with thinking disabled](#opus-5-with-thinking-disabled)

## Stable common core

Across these models:

```text
OBJECTIVE
State the semantic result and why it matters.

ACCEPTANCE
List observable criteria and the authoritative oracle for each.

SCOPE AND AUTHORITY
Name allowed changes, non-goals, preservation invariants, and approval boundaries.

EVIDENCE
Ground progress and completion in current observations. Mark unrun, failed, inferred, and
indeterminate checks exactly.

EXECUTION
Act once enough information exists. Do not reopen settled decisions without contradictory
evidence.

OUTPUT
Specify artifacts, visible answer length, progress cadence, completion receipt, and truthful
terminal states.
```

This is the evaluation baseline. Add an overlay only when target-model results justify it.

## Fable 5 overlay

Current guidance emphasizes strong instruction following, long-running difficult work, explicit
scope, evidence-grounded progress, and fresh-context verification at consequential boundaries.

```text
FABLE 5 LONG-HORIZON OVERLAY

Apply this overlay only within governing runtime/system/developer and designated project
instructions.

Treat the stated scope as an authority boundary. Do not add unrelated features, cleanup,
refactors, abstractions, backups, or defensive work unless an acceptance criterion requires them.

Act when enough information is available. Do not end on a promise, proposed tool call, or request
for permission when the remaining action is already authorized, reversible, and in scope.

Subject to explicit approval boundaries, pause only for an irreversible/destructive action, a
material scope change, missing user-only information, unavailable authority, or an external-state
blocker.

Ground every material progress and completion claim in an observation from this run. Distinguish:
COMPLETED_AND_VERIFIED / COMPLETED_NOT_VERIFIED / ATTEMPTED / SKIPPED / FAILED / BLOCKED.

For a long run, establish fresh-context review at consequential phase boundaries. Give the
reviewer the immutable contract, current artifact, and raw evidence—not the implementing
trajectory's confidence.

Delegate sizeable independent tracks and keep working while they run; communicate
asynchronously and intervene if a branch loses relevant context or goes off route. Do not
delegate short sequential work or overlapping edits.

Return concise rationale, assumptions, evidence, decisions, and artifacts, not private
chain-of-thought.

Before ending, inspect the final paragraph. If it only promises an authorized action, perform the
action. If incomplete, report the exact blocker or truthful bounded state.
```

Boundaries:

- fresh context reduces anchoring; it does not create a sound oracle;
- periodic review is not permission to relitigate settled facts;
- narrow authority matters because strong instruction following can amplify over-prescriptive
  legacy prompts;
- effort controls reasoning depth, not visible answer length;
- higher effort may increase unnecessary investigation, refactoring, and explanation.

## Opus 5 overlay

Current guidance recommends a complete difficult-task specification up front and warns that legacy
generic verification reminders may cause expensive redundant checks because Opus 5 self-verifies
more by default.

```text
OPUS 5 LONG-HORIZON OVERLAY

Apply this overlay only within governing runtime/system/developer and designated project
instructions.

Treat the complete objective, constraints, scope, inputs, acceptance evidence, and output contract
as the task. Work end to end within that boundary.

Do not add redundant verification passes. Produce the required acceptance evidence once at the
correct layer. Repeat a check only after a material change, contradictory observation, or
identified residual risk.

Delegate only sizeable, independent work whose expected information value exceeds coordination
cost. Do not create a verifier merely to repeat the same analysis in different prose.

Do not expand into adjacent features, broad refactors, cleanup, or speculative abstractions.

For review, first gather candidate defects with evidence; then filter by severity, confidence, and
scope. Do not use an early “only severe findings” instruction that suppresses discovery.

Keep the conversational response concise and outcome-first. Written artifacts may be exhaustive
when requested but should not duplicate summaries or boilerplate.
```

Removing redundant verification does **not** mean trusting unobserved completion. Executable,
formal, semantic, physical, or expert acceptance evidence remains mandatory. Remove duplicate
rituals, not the oracle.

## GPT-5.6 Sol and Codex overlay

Current OpenAI guidance favors lean, outcome-first prompts: preserve the user-visible result,
success and stop conditions, evidence and permission constraints, tool routing that actually
depends on context, required output, and validation. Remove repeated process instructions,
examples, or tools only through representative evaluation.

```text
GPT-5.6 SOL / CODEX LONG-HORIZON OVERLAY

State the user-visible outcome, mandatory success evidence, scope, autonomy and approval
boundaries, required output, and truthful stop states. Leave room to choose an efficient path.

Continue safe, authorized, in-scope local work without a permission pause. Stop before external
writes, destructive or costly actions, or a material scope expansion unless separately authorized.
Do not silently move from research to implementation, review, or external coordination.

Use the fewest useful tool loops, but never let loop minimization outrank correctness, required
evidence, calculations, citations, or validation. After each result, decide whether the core
request is supported; otherwise name the missing fact and take the smallest useful fallback.

For a multi-step run, give one short preamble before tools. Update only at major phase changes or
when a finding changes the plan; state the concrete outcome and next step rather than narrating
routine calls.

Before changing a working prompt, freeze representative evaluations and the current reasoning
effort. Run the current prompt first. Remove or edit one instruction group at a time and rerun the
same cases. Add only the smallest targeted instruction that repairs a measured failure.

Validate the final claim at the required layer. If validation cannot run, say why and return the
next-best check plus an unverified or bounded terminal state.
```

Boundaries:

- lean means removing instructions that do not change behavior, not deleting the contract or
  oracle;
- absolute words belong to true invariants; use decision rules for contextual judgment;
- preserve explicit user values and use criteria, not keyword maps or universal defaults, for
  implicit choices;
- a new model alone does not justify a wholesale prompt rewrite, new tools, multi-agent behavior,
  Programmatic Tool Calling, persisted reasoning, or other optional features;
- keep visible response length separate from reasoning effort; use task-specific output
  priorities, and use runtime verbosity controls where available and evaluated.

## Effort and output length

Evaluate separately:

- effort/reasoning depth;
- visible response length;
- number and independence of verification passes;
- delegation;
- tool budget.

Current starting points—not permanent laws:

| Model | Starting point |
|---|---|
| Fable 5 | `high` for most work; `xhigh` for the most capability-sensitive hard problems; `medium` or `low` for routine work |
| Opus 5 | start coding and agentic evaluations at `xhigh`; use `low` or `medium` where evaluations preserve quality and reduce cost |
| GPT-5.6 Sol | preserve the current or old effective effort as the baseline; then test the same level and one lower. Use `medium` as a balanced new-workload start and raise it only for measured quality gains |

For each target workflow, hold the task contract and visible output constant and test at least two
effort levels. Measure success, severe failure, false success, loop incidence, duplicated checks,
latency, and cost.

## Opus 5 with thinking disabled

Keep thinking enabled when possible and control cost with lower effort. When an integration must
disable thinking, Opus 5 can occasionally print a tool call as text instead of issuing it, or leak
internal XML-like tags. Do not prompt it not to think or reason. Use one general instruction:

```text
When you use a tool, you may say a brief sentence first. If no tool can express the request, say
so instead of guessing. Do not include internal or system XML tags in the response.
```

Do not persist a model overlay in model-neutral task records or handoffs. Record the model/version,
date, effort, and overlay in the evaluation receipt.
