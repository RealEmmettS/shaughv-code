# 09 — Conversation lifecycle and events

A Realtime session is stateful. The server tracks:

- **Session** — model, voice, tools, instructions, modalities.
- **Conversation** — ordered items (user messages, model messages, function calls, function outputs).
- **Responses** — model outputs (audio + text + tool calls) generated from the conversation.

You drive the session by sending **client events**; the server emits **server events** describing what's happening. Both are JSON. Over WebRTC, events travel on the data channel; over WebSocket, they travel on the socket itself.

This reference focuses on **voice-agent and transcription sessions** (`/v1/realtime`). For translation, see `references/04-translation.md` — the event surface is different (`session.` prefix).

## Session lifecycle

```
session.created          (server, on connect — session ready)
   ↓
session.update           (client, configure model / voice / tools / instructions)
   ↓
session.updated          (server, ack with new state)
   ↓
(repeat session.update any time, with the voice-immutable-after-audio caveat)
   ↓
…interaction happens (input audio → response → tool calls → response → …)
   ↓
(connection closes when client disconnects or session times out at 60 min)
```

The maximum session duration is **60 minutes**.

### Configuring the session

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
    "instructions": "Speak clearly and briefly.",
    "tools": [],
    "tool_choice": "auto"
  }
}
```

You can also reference a stored prompt:

```json
"prompt": { "id": "pmpt_123", "version": "89", "variables": { "city": "Paris" } }
```

## Input audio

| Client event | Purpose |
|---|---|
| `input_audio_buffer.append` | Push base64 PCM chunk into the buffer. |
| `input_audio_buffer.commit` | Manually commit. Used when VAD is disabled. |
| `input_audio_buffer.clear` | Drop the current buffer before recording new audio. |

| Server event | Purpose |
|---|---|
| `input_audio_buffer.speech_started` | VAD detected speech start. Stop playback if you're handling interruption manually. |
| `input_audio_buffer.speech_stopped` | VAD detected end-of-turn. |
| `input_audio_buffer.committed` | The buffer was committed (manually or by VAD). The next response will be generated from it. |

WebRTC doesn't require you to send `input_audio_buffer.append` for mic audio — the audio track carries the audio for you. WebSocket requires explicit appends.

## Text input and items

| Client event | Purpose |
|---|---|
| `conversation.item.create` | Add an item (user message, function output, image, full audio recording). |
| `conversation.item.truncate` | Trim a previous assistant audio item to the played boundary on interruption (WebSocket only). |
| `conversation.item.delete` | Remove an item. Useful for manual context management — see `references/14-costs-and-rate-limits.md`. |

| Server event | Purpose |
|---|---|
| `conversation.item.added` | An item has been appended to the conversation. |
| `conversation.item.done` | A previously-added item is fully processed (e.g., transcription completed). |

A user text message looks like:

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [{ "type": "input_text", "text": "What's the weather in Paris?" }]
  }
}
```

A user audio item (full recording):

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [{ "type": "input_audio", "audio": "<base64 PCM16>" }]
  }
}
```

A user image (vision input, `gpt-realtime-2`):

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [{ "type": "input_image", "image_url": "data:image/jpeg;base64,/9j/4..." }]
  }
}
```

A function call output (after running a tool):

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_sHlR7iaFwQ2YQOqm",
    "output": "{\"horoscope\":\"You will soon meet a new friend.\"}"
  }
}
```

## Response lifecycle

```
response.create           (client; or auto-fires from VAD)
   ↓
response.created          (server, response object opened)
   ↓
response.output_item.added         (one or more output items)
   ↓
response.content_part.added        (text or audio part begins)
   ↓
response.output_text.delta         (text streaming)
response.output_audio.delta        (audio streaming, base64)
response.output_audio_transcript.delta (transcript of the model's audio)
response.function_call_arguments.delta (if calling a function)
   ↓
response.{output_text,output_audio,output_audio_transcript,function_call_arguments}.done
response.content_part.done
response.output_item.done
   ↓
response.done             (server; includes usage)
rate_limits.updated
```

**`response.done` does not contain the audio bytes.** Audio is delivered via `response.output_audio.delta` events. The `done` event contains the final transcript and usage stats.

Cancel an in-progress response:

```json
{ "type": "response.cancel" }
```

The server replies with `response.cancelled`.

## Tool calling lifecycle

For function tools:

```
response.function_call_arguments.delta   (streamed argument JSON)
response.function_call_arguments.done    (final arguments string)
response.output_item.done                (item with type=function_call, name, call_id, arguments)
   ↓ (you execute the function on your client/server)
conversation.item.create  (you send back: type=function_call_output, call_id, output)
response.create           (you ask the model to continue)
```

For MCP tools the API runs them for you — see `references/12-tools-and-mcp.md` for the `mcp_*` event family (`mcp_list_tools.in_progress`, `…completed`, `…failed`, `mcp_approval_request`, `mcp_approval_response`, `response.mcp_call.in_progress`, `response.mcp_call.failed`, `response.mcp_call_arguments.delta`/`.done`).

## Out-of-band responses

Generate a response that does **not** join the default conversation history. Useful for moderation, classification, RAG retrieval, or a system-internal step:

```json
{
  "type": "response.create",
  "response": {
    "conversation": "none",
    "metadata": { "topic": "classification" },
    "output_modalities": ["text"],
    "instructions": "Classify the last user message as one of: support, sales, other."
  }
}
```

In the `response.done` event, match against your `metadata` to know which logical task finished:

```javascript
if (event.type === "response.done" && event.response.metadata?.topic === "classification") {
  handleClassification(event.response.output);
}
```

You can also build a custom context for an OOB response by passing `input: [...]` directly:

```json
{
  "type": "response.create",
  "response": {
    "conversation": "none",
    "input": [
      { "type": "item_reference", "id": "item_42" },
      { "type": "message", "role": "user", "content": [{ "type": "input_text", "text": "Summarize." }] }
    ]
  }
}
```

To force the model to ignore context entirely (e.g., for a fixed line):

```json
{
  "type": "response.create",
  "response": {
    "input": [],
    "instructions": "Say exactly: 'Goodbye. Have a great day.'"
  }
}
```

## Voice activity detection (VAD)

| Mode | Behavior |
|---|---|
| `server_vad` (default) | Server detects speech boundaries and auto-creates responses. Config: `threshold`, `prefix_padding_ms`, `silence_duration_ms`, `interrupt_response`, `create_response`. |
| `semantic_vad` | Uses model context to detect end-of-thought. Better for conversational flow. |
| `null` | Disabled. Client commits + creates responses manually. |

To keep VAD on but suppress automatic response creation (useful for moderation / RAG):

```json
"turn_detection": {
  "type": "server_vad",
  "interrupt_response": false,
  "create_response": false
}
```

## Errors

```json
{
  "type": "error",
  "code": "invalid_value",
  "message": "Invalid value: 'scooby.dooby.doo' for type",
  "param": "type",
  "event_id": "my_awesome_event"
}
```

Set a unique `event_id` on every client-sent event so you can correlate errors to their cause. Errors are emitted async — they may not arrive immediately after the offending message.

## Voice-agent event cheat sheet

Lifecycle order, with the events you'll typically dispatch in your client code:

| Phase | Server events |
|---|---|
| Session start | `session.created`, `session.updated` |
| User audio (streaming) | `input_audio_buffer.speech_started`, `.speech_stopped`, `.committed` |
| Response start | `response.created`, `response.output_item.added`, `response.content_part.added` |
| Streaming output | `response.output_text.delta`, `response.output_audio.delta`, `response.output_audio_transcript.delta`, `response.function_call_arguments.delta` |
| Per-output close | `response.output_text.done`, `response.output_audio.done`, `response.output_audio_transcript.done`, `response.function_call_arguments.done`, `response.content_part.done`, `response.output_item.done` |
| Response close | `response.done` (with `usage`) |
| Rate-limit info | `rate_limits.updated` |
| Cancellation | `response.cancelled` |
| Errors | `error` |

## Transcription session event cheat sheet

| Phase | Server events |
|---|---|
| Session start | `session.created`, `session.updated` |
| Input | `input_audio_buffer.committed` |
| Transcript | `conversation.item.input_audio_transcription.delta`, `conversation.item.input_audio_transcription.completed` |
| Errors | `error` |

Transcription sessions do **not** emit `response.*` events because there are no model responses to speak.

## Translation session event cheat sheet (`session.` prefix!)

See `references/04-translation.md` for full details. In short:

- `session.input_audio_buffer.append` (client)
- `session.output_audio.delta` (server, translated audio)
- `session.output_transcript.delta` (server, translated text)
- `session.input_transcript.delta` (server, source-language transcript)
- `session.close` (client, request graceful shutdown)
- `session.closed` (server, ack)

Do **not** call `response.create` in a translation session.

## See also

- `references/02-voice-agents.md` — session config and behavior.
- `references/04-translation.md` — translation-specific event names.
- `references/12-tools-and-mcp.md` — full tool-call event flow.
- `examples/websocket-voice-agent.py` — concrete event handlers.
