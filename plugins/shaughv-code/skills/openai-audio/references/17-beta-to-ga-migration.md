# 17 — Migrating from beta `realtime=v1`

If you have a beta Realtime integration, migrate to the GA interface before doing more work. The major changes:

## Header changes

| Before (beta) | Now (GA) |
|---|---|
| `OpenAI-Beta: realtime=v1` | **Drop it.** No `OpenAI-Beta` header on GA. |
| (sometimes nothing) | Add `OpenAI-Safety-Identifier` when you have end users. |

## Endpoint changes

| Capability | Before | Now |
|---|---|---|
| Ephemeral credentials | (older URL or browser-side key) | `POST /v1/realtime/client_secrets` |
| Establish a WebRTC session | older base media URL | `POST /v1/realtime/calls` |
| Continuous translation | (didn't exist as a dedicated endpoint) | `wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate` |
| SIP call lifecycle | (limited) | `/v1/realtime/calls/{call_id}/{accept,reject,refer,hangup}` |

## Session shape changes

Beta sessions had a flatter audio config. GA nests audio under `session.audio.{input,output}`:

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
    "instructions": "…",
    "tools": []
  }
}
```

Required updates:

- Add `session.type` (`realtime` for voice agents, `transcription` for transcription sessions).
- Move output audio config to `session.audio.output`.
- Move input audio + turn detection to `session.audio.input.{format,turn_detection}`.
- Use `output_modalities` explicitly (`["audio"]`, `["text"]`, or both).

## Renamed events

| Before | Now |
|---|---|
| `response.text.delta` | `response.output_text.delta` |
| `response.text.done` | `response.output_text.done` |
| `response.audio.delta` | `response.output_audio.delta` |
| `response.audio.done` | `response.output_audio.done` |
| `response.audio_transcript.delta` | `response.output_audio_transcript.delta` |
| `response.audio_transcript.done` | `response.output_audio_transcript.done` |

Audit your `switch (event.type)` blocks for the old names and rename.

## Conversation lifecycle changes

- The voice list is the GA list: `alloy`, `ash`, `ballad`, `coral`, `echo`, `sage`, `shimmer`, `verse`, `marin`, `cedar`. Older preview voices are not exposed.
- `phase` on `response.done` items (`commentary` vs `final_answer`) is `gpt-realtime-2`-specific. Older models don't emit `phase` and your UI shouldn't depend on it.
- Translation sessions use a different event prefix (`session.*` instead of `response.*`). See `references/04-translation.md`.

## Recommended migration sequence

1. **Pick a workflow**. Use the [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) guide for speech-to-speech, the [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription) guide for transcription, or the [Realtime translation](https://developers.openai.com/api/docs/guides/realtime-translation) guide for translation.
2. **Rewrite headers + endpoints.** Drop `OpenAI-Beta`. Move auth flows to `/v1/realtime/client_secrets` (for ephemeral) or `/v1/realtime/calls` (for WebRTC).
3. **Restructure session payloads.** Add `session.type`. Re-nest audio config.
4. **Rename events.** `response.output_*` everywhere.
5. **Set `reasoning.effort: "low"`** if moving to `gpt-realtime-2`.
6. **Re-audit prompts.** `gpt-realtime-2` follows instructions more literally — re-run evals. See `references/10-prompting-realtime-2.md`.
7. **Re-test interruption + truncation.** Behavior on WebRTC is now server-managed; WebSocket clients should send `conversation.item.truncate`.
8. **Run evals** comparing representative conversations before and after migration. Document intended behavior changes.

## See also

- `references/02-voice-agents.md` — current GA session shape.
- `references/09-conversation-lifecycle.md` — current event names.
- `references/10-prompting-realtime-2.md` — prompting model for the reasoning version.
