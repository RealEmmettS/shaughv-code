# 02 — Voice agents (speech-to-speech)

**Model:** `gpt-realtime-2` — switch to `gpt-realtime-1.5` (or the `gpt-realtime` alias) when the workflow is simple, latency-critical, and doesn't need reasoning.

**Endpoint:** `/v1/realtime` over **WebRTC**, **WebSocket**, or **SIP**.

A voice-agent session is a stateful conversation between a connected client and the model. The model can listen, reason, speak, and call tools in one low-latency loop. The session lifecycle is identical across transports — only the way audio frames travel differs.

## Session payload (GA shape)

Send a `session.update` to configure the session:

```json
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "model": "gpt-realtime-2",
    "output_modalities": ["audio"],
    "audio": {
      "input": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "turn_detection": { "type": "semantic_vad" }
      },
      "output": {
        "format": { "type": "audio/pcm" },
        "voice": "marin"
      }
    },
    "instructions": "Speak clearly and briefly. Confirm understanding before taking actions.",
    "tools": [],
    "tool_choice": "auto"
  }
}
```

For a stored prompt (managed in the OpenAI dashboard), use `prompt` instead of `instructions`:

```json
"prompt": {
  "id": "pmpt_123",
  "version": "89",
  "variables": { "city": "Paris" }
}
```

If both `prompt` and `instructions` are sent, direct session fields override prompt fields where they overlap.

### Field reference

| Field | Type | Notes |
|---|---|---|
| `type` | `"realtime"` | Required for voice-agent sessions. Use `"transcription"` for transcription-only sessions. |
| `model` | string | `gpt-realtime-2` (default), `gpt-realtime-1.5`, or `gpt-realtime` (alias). |
| `output_modalities` | `["audio"]` \| `["text"]` \| `["audio","text"]` | What the model produces. `["audio"]` is the typical voice-agent setting. |
| `audio.input.format` | object | `{"type":"audio/pcm","rate":24000}` for raw PCM; `{"type":"audio/pcmu"}` for μ-law (telephony). |
| `audio.input.turn_detection` | object \| null | `server_vad`, `semantic_vad`, or `null` to disable VAD (push-to-talk). |
| `audio.output.format` | object | `audio/pcm` (recommended), `audio/pcmu`, `audio/pcma`. |
| `audio.output.voice` | string | See voice list below. **Immutable once audio has been emitted in the session.** |
| `prompt` | object | Reference a server-stored prompt by `id`. |
| `instructions` | string | Inline system prompt. Overrides `prompt.instructions` if both are set. |
| `tools` | array | Function tools, MCP tools (`type:"mcp"`), or connectors. See `references/12-tools-and-mcp.md`. |
| `tool_choice` | `"auto"` \| `"required"` \| `"none"` \| `{"type":"function","function":{"name":"..."}}` | Eagerness lever. |
| `reasoning.effort` | `"minimal"` \| `"low"` \| `"medium"` \| `"high"` \| `"xhigh"` | `gpt-realtime-2` only. Default `medium`. Start at `low` for production. |
| `truncation` | `"auto"` \| `"disabled"` \| `{"type":"retention_ratio","retention_ratio":0.8,"token_limits":{"post_instructions":8000}}` | See `references/14-costs-and-rate-limits.md`. |
| `include` | array | Request optional output like `["item.input_audio_transcription.logprobs"]`. |

## Voices

Available voices: `alloy`, `ash`, `ballad`, `coral`, `echo`, `sage`, `shimmer`, `verse`, `marin`, `cedar`. The docs flag `marin` and `cedar` as best quality. `fable`, `nova`, `onyx` are available on the TTS endpoint but only the list above is current for Realtime.

**Voice is immutable after the first audio is emitted.** Set it correctly in the initial session, or in a `session.update` before any audio output has started.

Custom voices configured via `/v1/audio/voices` are passed as `audio.output.voice: { "id": "voice_123abc" }`. See `references/16-custom-voices.md`.

## Reasoning effort

`gpt-realtime-2` can reason internally before speaking. Pick the lowest effort that still meets quality requirements:

| Effort | When to use |
|---|---|
| `minimal` | Lowest latency, simple commands (timers, smart-home, basic lookups). |
| `low` | **Default for production voice agents.** Responsive + basic reasoning (customer support, order lookup, policy Q&A). |
| `medium` | Multi-step tasks, technical support, diagnostics, complex routing. |
| `high` | High-precision workflows, escalation decisions, constrained tasks. |
| `xhigh` | Maximum reasoning. Critical triage, high-stakes tool orchestration. Accept the extra latency. |

Steer reasoning intent in the prompt too — see `references/10-prompting-realtime-2.md`.

## Preambles and message channels

`gpt-realtime-2` can emit short spoken updates ("I'll check that order now.") in the **commentary** channel while it reasons or calls tools, before delivering the **final_answer** in the same response. The channel is exposed as `phase` on each output item in `response.done`:

```json
{
  "type": "response.done",
  "response": {
    "output": [
      {
        "phase": "commentary",
        "content": [{ "type": "output_audio", "transcript": "Let me check that now." }]
      },
      {
        "phase": "final_answer",
        "content": [{ "type": "output_audio", "transcript": "Your order ships tomorrow." }]
      }
    ]
  }
}
```

Use `phase` in your client to render the commentary as a temporary "thinking" indicator and the final_answer as the persisted response.

## VAD modes

| Mode | Behavior |
|---|---|
| `server_vad` (default) | Server detects speech start/stop and creates a response automatically. Configurable: `threshold`, `prefix_padding_ms`, `silence_duration_ms`, `interrupt_response`, `create_response`. |
| `semantic_vad` | Semantic turn detection — uses model context to decide when the user has finished a thought. Good for natural conversation. |
| `null` (push-to-talk) | Client manually commits the input buffer and triggers responses. |

Disable automatic response creation while keeping VAD by setting `turn_detection.interrupt_response` and `turn_detection.create_response` to `false`. Useful for moderation or RAG patterns.

## Push-to-talk

### WebSocket variant

1. Set `turn_detection: null`.
2. On push down, start recording audio client-side.
   - If a response is in progress, send `{ "type": "response.cancel" }`.
   - If audio is playing back, stop playback and send `conversation.item.truncate` with the played offset.
3. On push up, send `{ "type": "input_audio_buffer.append", "audio": "<base64 PCM16>" }`, then `{ "type": "input_audio_buffer.commit" }`, then `{ "type": "response.create" }`.

### WebRTC / SIP variant

1. Set `turn_detection: null`.
2. On push down, send `{ "type": "input_audio_buffer.clear" }` to drop any previous input.
   - If a response is in progress, send `{ "type": "response.cancel" }`.
   - If audio is playing, send `{ "type": "output_audio_buffer.clear" }` to truncate the playing audio.
3. On push up, send `{ "type": "input_audio_buffer.commit" }` then `{ "type": "response.create" }`.

`output_audio_buffer.clear` only exists on WebRTC and SIP — the server holds the output buffer for you on those transports.

## Interruption + truncation

When the user starts speaking mid-response, the server emits `input_audio_buffer.speech_started`. The Realtime API will cancel the in-progress response and emit `response.cancelled`.

**On WebRTC and SIP**, the server tracks how much audio was played, automatically truncates the conversation history at the playback boundary, and your client only has to handle the new turn.

**On WebSocket**, your client must:

1. Stop playback immediately.
2. Note how many milliseconds of the last audio item you actually played.
3. Send `conversation.item.truncate` with that offset:

```json
{
  "type": "conversation.item.truncate",
  "item_id": "item_1234",
  "content_index": 0,
  "audio_end_ms": 1500
}
```

This trims the conversation so the next turn understands what the user actually heard. The transcript for the unplayed portion is also dropped.

## Image inputs

`gpt-realtime-2` accepts image content parts in user messages:

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      { "type": "input_image", "image_url": "data:image/jpeg;base64,/9j/4AAQ..." }
    ]
  }
}
```

Useful for "look at this screenshot and walk me through it" voice workflows.

## Sessions are 60 minutes max

Realtime sessions auto-close at 60 minutes. Plan for reconnect + state rehydration if you need longer conversations. Use `truncation` and manual `conversation.item.delete`/`.create` to keep token usage manageable inside that window — see `references/14-costs-and-rate-limits.md`.

## Common mistakes to avoid

- Setting `voice` after the first audio has been emitted. Set it at session creation.
- Using `gpt-realtime-2` on `/v1/realtime/translations` — that endpoint is for `gpt-realtime-translate` only.
- Forgetting `output_modalities`. Default behavior varies by model. Be explicit.
- Setting `turn_detection: null` but not sending `response.create` manually — the model never speaks.
- Using `OpenAI-Beta: realtime=v1` header on GA. Drop it.

## See also

- `references/06-transport-webrtc.md` — set up a browser session.
- `references/07-transport-websocket.md` — server-side WebSocket session.
- `references/09-conversation-lifecycle.md` — full event reference.
- `references/10-prompting-realtime-2.md` — production prompting playbook.
- `references/12-tools-and-mcp.md` — function tools and MCP servers.
- `examples/websocket-voice-agent.py` — end-to-end Python example.
- `examples/webrtc-browser-voice-agent/` — end-to-end browser example.
