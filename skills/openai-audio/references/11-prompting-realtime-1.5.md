# 11 — Prompting `gpt-realtime-1.5` (legacy)

Use this when you're maintaining an app on `gpt-realtime-1.5` or the `gpt-realtime` alias and don't want to migrate to the newer reasoning model. For new builds, prefer `gpt-realtime-2` and `references/10-prompting-realtime-2.md`.

`gpt-realtime-1.5` is a non-reasoning speech-to-speech model. Compared to earlier preview snapshots, it has stronger instruction following, more reliable tool calling, better voice quality, and a more natural feel. Prompt techniques that work here are similar to GPT-4.1 style.

## General tips

- **Iterate relentlessly.** Small wording changes matter.
- **Prefer bullets over paragraphs.** Easier for the model to find rules.
- **Guide with examples.** The model follows sample phrases closely.
- **Be precise.** Conflicting instructions degrade performance.
- **Control language.** Pin output language explicitly to prevent drift.
- **Reduce repetition.** Add a Variety rule if responses sound robotic.
- **Capitalize key rules** for emphasis.
- **Convert non-text rules to text.** Instead of `IF x > 3 THEN ESCALATE`, write "IF MORE THAN THREE FAILURES THEN ESCALATE".

## Prompt skeleton

```
# Role & Objective
# Personality & Tone
# Context
# Reference Pronunciations
# Tools
# Instructions / Rules
# Conversation Flow
# Safety & Escalation
```

## Role & Objective

```text
# Role & Objective
You are a Quebecois French-speaking customer service bot. Your task is to answer the user's question.
```

The 1.5 model adheres well to role/persona instructions. Don't hide the role behind vague language ("an assistant"); state it directly.

## Personality & Tone

```text
# Personality & Tone

## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Pacing
- Deliver your audio response fast, but do not sound rushed.
- Do not modify the content of your response, only increase speaking speed.

## Language
- The conversation will be only in English.
- Do not respond in any other language even if the user asks.
- If the user speaks another language, politely explain that support is limited to English.

## Variety
- Do not repeat the same sentence twice.
- Vary your responses so they don't sound robotic.
```

## Reference pronunciations

```text
# Reference Pronunciations
When voicing these words, use the respective pronunciations:
- Pronounce "SQL" as "sequel."
- Pronounce "PostgreSQL" as "post-gress."
- Pronounce "Kyiv" as "KEE-iv."
- Pronounce "Huawei" as "HWAH-way."
```

For alphanumeric strings:

```text
# Instructions/Rules
- When reading numbers or codes, speak each character separately, separated by hyphens (e.g., 4-1-5).
- Repeat EXACTLY the provided number; do not omit any digits.
```

## No / unclear audio

```text
## Unclear audio
- Always respond in the same language the user is speaking in, if unintelligible.
- Only respond to clear audio or text.
- If the user's audio is not clear (ambiguous, background noise, silent, unintelligible) or you did not fully hear or understand, ask for clarification.
```

## Background sounds

```text
# Instructions/Rules
- Do not include any sound effects or onomatopoeic expressions in your responses.
```

## Tools

```text
# Tools

## lookup_account(email_or_phone)
Use when: verifying identity or accessing billing.
Do NOT use when: caller refuses to identify after second request.

## check_outage(address)
Use when: caller reports failed connection or speed below 10 Mbps.
Do NOT use when: purely billing.

## refund_credit(account_id, minutes) — CONFIRMATION FIRST
Use when: confirmed outage > 240 minutes in the last 7 days.
Confirmation phrase: "I can issue a credit for this outage—would you like me to go ahead?"

## schedule_technician(account_id, window) — CONFIRMATION FIRST
Use when: reboot + line checks fail AND outage=false.
Windows: "10am–12pm ET" or "2pm–4pm ET".
Confirmation phrase: "I can schedule a technician to visit—should I book that for you?"
```

Tool-call preambles to mask latency:

```text
# Tools
- Before any tool call, say one short line like "I'm checking that now." Then call the tool immediately.
```

For tools that should not be confirmed:

```text
# Tools
- When calling a tool, do not ask for any user confirmation. Be proactive.
```

For mixed eagerness, tag tools:

```text
# TOOLS
- For tools marked PROACTIVE: do not ask for confirmation and do not output a preamble.
- For tools marked CONFIRMATION FIRST: always ask for confirmation to the user.
- For tools marked PREAMBLES: say a short line like "I'm checking that now." then call the tool.
```

### Common tools you can expose by name

`gpt-realtime-1.5` is trained on names like `answer`, `escalate_to_human`, `finish_session`. Use these where the semantics match:

```text
# answer(question: string)
Call this when the customer asks a question outside your direct knowledge.

# escalate_to_human()
Call when the customer asks for escalation or expresses dissatisfaction.

# finish_session()
Call when the customer says they're done or doesn't want to continue.
```

### Responder–thinker (supervisor) pattern

Pair the realtime model with a stronger text model that does the planning:

```text
# Tools
## getNextResponseFromSupervisor(relevantContextFromLastUserMessage: string)

When to call:
- Any factual, policy, account, or process question.
- Any action that might require internal lookups or system changes.

When not to call:
- Simple greetings.
- Requests to repeat or clarify.
- Collecting parameters for later supervisor calls.

Usage:
1. Say a neutral filler ("One moment.", "Let me check.", "Just a second."), then call immediately.
2. relevantContextFromLastUserMessage is a one-line summary of the latest user message.
3. After the tool returns, apply Rephrase Supervisor and send your reply.

### Rephrase Supervisor
- Start with a brief conversational opener ("Thanks for waiting—", "Just finished checking that.").
- Keep it short: no more than 2 sentences.
- Read numbers naturally ("forty-five dollars and twenty cents"); phone numbers 3-3-4.
```

## Conversation flow (state machine)

```json
[
  {
    "id": "1_greeting",
    "description": "Begin with a warm greeting and identify the service.",
    "instructions": [
      "Use the company name and provide a warm welcome.",
      "Let them know upfront that for any account-specific assistance, you'll need verification details."
    ],
    "examples": [
      "Hello, this is Snowy Peak Boards. Thanks for reaching out! How can I help you today?"
    ],
    "transitions": [
      { "next_step": "2_get_first_name", "condition": "Once greeting is complete." },
      { "next_step": "3_get_and_verify_phone", "condition": "If the user provides their first name." }
    ]
  },
  {
    "id": "3_get_and_verify_phone",
    "description": "Request phone number and verify by repeating it back.",
    "instructions": [
      "Politely request the user's phone number.",
      "Once provided, confirm by repeating each digit and ask if it's correct.",
      "If the user corrects you, confirm AGAIN."
    ],
    "examples": [
      "I'll need some more information to access your account if that's okay. May I have your phone number, please?",
      "You said 0-2-1-5-5-5-1-2-3-4, correct?"
    ],
    "transitions": [
      { "next_step": "4_authentication_DOB", "condition": "Once phone number is confirmed" }
    ]
  }
]
```

## Dynamic conversation flow

For complex workflows, swap the system prompt + tool list at runtime via `session.update`:

```python
INSTRUCTIONS_BY_STATE = {
    "verify": "# Role\nVerify identity to access the account.\n…",
    "resolve": "# Role\nApply a fix by booking a technician.\n…",
}

TOOLS_BY_STATE = { … }

def session_update_for(state):
    return {
        "type": "session.update",
        "session": {
            "instructions": INSTRUCTIONS_BY_STATE[state],
            "tools": TOOLS_BY_STATE[state] + [transition_tool(state)],
        },
    }
```

This narrows the model's working surface and improves reliability.

## Safety & escalation

```text
# Safety & Escalation
When to escalate (no extra troubleshooting):
- Safety risk (self-harm, threats, harassment)
- User explicitly asks for a human
- Severe dissatisfaction (repeated complaints, profanity)
- 2 failed tool attempts OR 3 consecutive no-match/no-input events
- Out-of-scope or restricted (real-time news, financial/legal/medical advice)

What to say at the same time as calling escalate_to_human (MANDATORY):
- "Thanks for your patience—I'm connecting you with a specialist now."
- Then call the tool: escalate_to_human
```

## See also

- `references/10-prompting-realtime-2.md` — preferred guide for new builds.
- `references/12-tools-and-mcp.md` — function tool patterns.
- `examples/prompt-templates/voice-agent-support.md` — production prompt example.
