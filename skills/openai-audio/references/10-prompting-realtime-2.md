# 10 — Prompting `gpt-realtime-2`

`gpt-realtime-2` is a reasoning voice model. It follows instructions more literally than earlier realtime models, and it can reason internally before speaking or calling tools. **Prompt it like a reasoning voice agent, not like a basic voice bot.**

Start simple. Write a minimal prompt. Run evals. Add structure only for the behaviors that fail in testing.

## What changed in Realtime 2

| Change | Implication |
|---|---|
| Reasoning is internal | Configure `reasoning.effort` and use preambles to mask latency. |
| Prompt precision matters more | Replace "be helpful" with explicit triggers/actions/exceptions. |
| Conflicts are costlier | Remove overlapping `always`/`never`/`only`/`must`. Define priority when rules compete. |
| Tool behavior is more steerable | Specify when to act, ask, confirm, retry, escalate. |
| Preambles are first-class | The model may speak short updates during tool/reasoning. Steer them. |
| Context window expanded to 128k | Long sessions are practical; structure long context explicitly. |

Preambles are short spoken updates ("I'll check that order now.") — **not** chain-of-thought. Don't ask the model to reveal private reasoning.

## Recommended section skeleton

Use labeled sections. Add only the ones your product needs.

```
# Role and Objective

# Personality and Tone

# Language

# Reasoning

# Message Channels

# Preambles

# Verbosity

# Tools

# Unclear Audio

# Entity Capture

# Long Context Behavior

# Escalation
```

## `reasoning.effort` settings

| Effort | Use when | Example tasks |
|---|---|---|
| `minimal` | Lowest latency matters most, task is simple. | Smart-home commands, timers, basic calendar checks. |
| `low` | **Production default.** Responsive + basic reasoning. | Customer support, order lookup, policy Q&A. |
| `medium` | Multi-step tasks. | Technical support, diagnostics, complex routing. |
| `high` | Higher accuracy materially improves outcomes. | High-precision workflows, escalation decisions. |
| `xhigh` | Maximum reasoning worth added latency and cost. | Complex planning, critical triage, high-stakes tool orchestration. |

Pair the API setting with steering text:

```text
## Reasoning

- For direct answers, simple lookups, and short confirmations, respond quickly and do not reason.
- For multi-step tasks, tool decisions, troubleshooting, or escalation, reason before acting.
- Do not perform extended reasoning when the user's audio is unclear; ask for clarification instead.
```

## Preambles

Default behavior generates preambles. Test default first. If it doesn't match your UX, override.

```text
## Preambles

Use short preambles only when they help the user understand that work is happening.

### When to use a preamble

Use a preamble when:
- you are about to call a tool that may take noticeable time;
- you need to reason through a multi-step request;
- you are checking records, availability, account state, or policy details;
- you are preparing an escalation or handoff;
- silence would make the assistant feel unresponsive.

When a preamble is needed, output it immediately before substantive reasoning or tool use.

### When not to use a preamble

Do not use a preamble when:
- the answer is direct and can be given immediately;
- the user is only confirming, correcting, or declining something;
- the audio is unclear and you need clarification;
- the latest audio is silence, background noise, hold music, TV audio, or side conversation;
- the tool call is lightweight and the user would not benefit from an update.

### Preamble style

- Keep it natural, calm, and concise.
- Vary the wording across turns.
- Describe the action, not the internal reasoning.
- Avoid filler.

Avoid:
- "Let me think..."
- "Hmm..."
- "One moment while I process that..."
- "I am now going to access the tool..."

### Preamble length

Use one short sentence. Do not exceed two short sentences unless the user needs an explanation before a high-impact action.

### Prefer

- "I'll check that order now."
- "I'll look up your appointment details."
- "I'll verify that before we make any changes."
- "I'll check the policy and then give you the next step."

### Avoid

- "Let me think about that for a second."
- "Please wait while I process your request."
- "I'm going to use my tools now."
- "Interesting question. I will reason through this carefully."
```

## Verbosity

`gpt-realtime-2` follows length guidance better when you specify "concise" per **task type**, not as a global rule:

```text
## Verbosity

- Direct answers: 1–2 short sentences.
- Clarifying questions: one question at a time.
- Tool results: summarize the result first, then give the next useful action.
- Product or option comparisons: include key differences, tradeoffs, and who each option fits.
- Troubleshooting: one step at a time unless the user asks for the full procedure.
- Escalations: briefly explain why escalation is needed and what will happen next.
```

## Tools

Tool eagerness is the central knob. Read-only tools should fire when intent is clear. Write tools should require confirmation. Identifiers should be confirmed before any tool that depends on exact matches.

```text
## Tools

Use only the tools explicitly provided in the current tool list. Do not invent, assume, simulate, or rename tools.

For read-only tools:
- Call the tool when the user's intent is clear and all required fields are available.
- Do not ask for confirmation unless the lookup depends on a high-precision identifier or there is meaningful risk of using the wrong record.
- Ask a clarification question only if a required field is missing, ambiguous, or conflicting.

For write tools or external actions:
- Summarize the intended action before calling the tool.
- Include the key consequence (what will be changed, sent, canceled, ordered, or charged).
- Ask for confirmation.
- Do not call the tool until the user clearly confirms.

For exact identifiers:
- Treat order IDs, tracking numbers, account numbers, confirmation codes, phone numbers, and email addresses as high precision.
- Normalize only when the field type is clear.
- Confirm the final value before account-specific lookups, validation, or write actions.

After tool calls:
- Only say an action was completed after the tool call succeeds.
- If the tool fails, explain the failure briefly, avoid raw errors, and give the user a clear next step.
```

### Tool failures

```text
## Tool Failures

If a tool call fails:
1. Briefly explain what failed in user-friendly language.
2. Do not blame the user or expose raw tool errors.
3. If the failure may be due to an exact identifier, read back the value used and ask the user to correct it.
4. If the failure may be temporary, offer to retry once.
5. If the same failure happens repeatedly, offer an alternate path or escalation.

Do not repeatedly call the same tool with the same arguments after failure.
Do not ask for a different identifier until you have first checked whether the captured value was correct.
```

### Tool availability

```text
## Tool Availability

Use only the tools that are explicitly provided in the current tool list.

Do not invent, assume, or simulate tools. If a tool is mentioned in the instructions but is not present in the tool list, treat it as unavailable.

If the user requests an action that requires an unavailable tool:
1. Do not pretend to complete the action.
2. Briefly explain that the tool is not available.
3. Offer the closest supported next step.

Only say an action was completed after the relevant tool call succeeds.
```

## Silence and background noise

Voice agents tend to respond by default. Don't let them. Use a no-op `wait_for_user` tool:

```json
{
  "name": "wait_for_user",
  "description": "Call this when the latest audio does not need a spoken response, such as silence, background noise, hold music, TV audio, side conversation, or speech not addressed to the assistant. This tool helps end the turn without a spoken reply.",
  "parameters": { "type": "object", "properties": {}, "required": [] }
}
```

```text
## Handling Silence and Background Noise

If the latest audio is silence, background noise, hold music, TV audio, side conversation, or speech not addressed to you, call `wait_for_user`.

Do not respond conversationally after calling this tool.
Do not say "I'm here," "I didn't catch that," "Take your time," or "Let me know when you're ready."

Resume normal responses only when the user clearly addresses you or asks for help.
```

## Unclear audio

```text
## Unclear Audio

- Only respond to clear audio or text.
- If the user's audio is not clear, ask for clarification using a short English phrase such as "Sorry, could you repeat that clearly?"
- Don't repeat the same unclear-audio clarification twice.
- Treat audio as unclear if it is ambiguous, noisy, silent, unintelligible, partially cut off, or if you are unsure of the exact words the user said.
- Do not guess what the user meant from unclear audio.
- Do not reason when the audio is unclear.
- Do not provide a preamble or call tools in the commentary channel when the audio is unclear.
```

## Entity capture

Voice IDs are hard. Users speak quickly, group numbers in different ways, correct themselves mid-turn. Capture conservatively.

```text
## Entity Capture

Collect required values one at a time.

- Ask for only the next missing value.
- Do not ask for multiple values in the same turn.
- Before asking, check whether the value was already provided earlier in the conversation or the session.
- If a possible value already exists, confirm it with the user before using it.

Spelled-out characters:
- "A B C one two three" → "ABC123"
- "B C dash nine eight seven" → "BC-987"
- "J O H N at example dot com" → "john@example.com"
- Do not insert spaces between spelled characters unless explicitly stated.

Spoken numbers:
- "one two three four" → "1234"
- "one twenty three" → "123"
- "nine thousand nine hundred eleven" → "9911"
- If ambiguous (e.g., "one nineteen" could be 119 or 1-19), ask for clarification.

Confirmation:
- Read numeric identifiers back digit by digit ("8... 3... 5... 2... 1. Is that right?").
- Email addresses: ask the user to spell, then confirm character by character.
- If the user corrects any character, repeat the full corrected value before calling the tool.
- Never call a lookup, account, or write tool with guessed, partial, ambiguous, or unconfirmed values.
```

## Long-session context template

```text
## Context

### Current State
- Current task: [current task]
- Latest known state: [current value]
- Next safe step: [what the assistant should do next]

### Authoritative Sources
- Fact or record: [fact]
- Source: [tool result / active policy / verified record]
- Status: current
- Retrieved: [date/time]

### Historical or Background Sources
- Older fact: [fact]
- Source: [prior conversation / older record / summary]
- Status: stale or background
- Note: Do not use for current decisions if it conflicts with a current source.

### Relevant Policy or Rules
- [decision rule or constraint]

### Other Context
- [potentially useful but non-authoritative background]
```

## Language and accent

Control them **separately**. Don't tell the model to "mirror the user" — it may interpret accent as a language hint and switch unexpectedly.

```text
## Language

English is the default response language.

- Do not infer language from accent alone.
- Ignore short filler sounds, backchannels, and isolated foreign words for language detection.
- Only switch languages if the user explicitly asks or provides a substantive utterance in another language.
- If language confidence is low, ask a short clarification instead of guessing.
- Keep preambles, spoken bridges, tool-related messages, and final answers in the same language.
- Accent adaptation must not change the response language.
```

```text
## Accent

Speak English with a light Australian accent.

- Keep the accent stable from the first word to the last.
- Use natural Australian vowel shaping, but keep speech easy to understand.
- Do not exaggerate the accent.
- Do not change response language based on the user's accent.
```

## Avoid literal-instruction traps

`gpt-realtime-2` follows the literal text of an instruction. Be careful with `always`, `never`, `only`, `must`.

Bad (too broad):
```text
Always ask for confirmation before doing anything.
```
Triggers confirmations on harmless read-only lookups.

Good (scoped):
```text
For write actions that modify user data, ask for confirmation before calling the tool.
```

Bad (too narrow):
```text
When a confirmation code is provided, repeat it verbatim and wait for a clear yes.
```
Won't fire when the user provides an *order ID* instead of a confirmation code.

Good (covers the class):
```text
When the user provides an exact identifier, including confirmation codes, order IDs, ticket IDs, reset PINs, claim numbers, tracking numbers, or account numbers, repeat the captured value and wait for confirmation before using it in a tool call.
```

## Migration from earlier realtime models

1. Restructure the prompt around this guide (use a strong reasoning model to do the lift).
2. Set `reasoning.effort` to `low` initially. Increase only when evals justify.
3. Audit tool names, parameters, enums, and JSON schemas — make sure they still match what the model thinks they do.
4. Remove stale examples. Add short examples for happy paths, ambiguity, interruptions, tool calls, fallback behavior.
5. Compare representative conversations before/after migration. Watch for regressions.
6. Document the intended behavior changes.

## See also

- `references/11-prompting-realtime-1.5.md` — legacy 1.5 prompting (use only for migration work).
- `references/12-tools-and-mcp.md` — function tool design.
- `references/02-voice-agents.md` — session config that pairs with this prompting model.
- `examples/prompt-templates/voice-agent-support.md` — production support-agent system prompt.
