# 04 — Translation (live speech-to-speech)

**Model:** `gpt-realtime-translate` — this is the only model on the dedicated translation endpoint.

**Endpoint:** `/v1/realtime/translations` (different from `/v1/realtime`).

A translation session is **continuous** — the client streams source audio in, and the service streams translated audio plus transcript deltas out for as long as you're connected. There is no conversation, no `response.create`, and no turn lifecycle.

## How translation differs from voice agents

| Voice-agent session | Translation session |
|---|---|
| Connects to `/v1/realtime` | Connects to `/v1/realtime/translations` |
| Acts as an assistant | Acts as an interpreter |
| Uses conversation + response lifecycle | Streams continuously |
| Can call tools, produce assistant turns | Produces translated audio + transcript |
| `response.create` triggers a reply | **Never** call `response.create` |
| Events: `input_audio_buffer.*`, `response.*` | Events: `session.input_audio_buffer.*`, `session.output_audio.*`, `session.output_transcript.*`, `session.input_transcript.*`, `session.close`, `session.closed` |

**The most common bug** is copy-pasting voice-agent event names into a translation session. Translation has a `session.` prefix on the input/output audio buffer events and uses a different lifecycle. Mix them and the session will silently drop messages.

## Pick a transport

| Transport | Use when |
|---|---|
| **WebRTC** | Browser captures or plays audio. Source audio sent as a media track; translated audio received as a remote audio track. No manual resampling. |
| **WebSocket** | Server already has raw audio (Twilio Media Streams, SIP media, broadcast ingest, batch worker). Send base64-encoded 24 kHz PCM16; play translated audio deltas yourself. |

## WebSocket session — quick start

```javascript
import WebSocket from "ws";

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
  {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": "hashed-user-id",
    },
  }
);

ws.on("open", () => {
  // Configure the target language
  ws.send(JSON.stringify({
    type: "session.update",
    session: {
      audio: {
        output: { language: "es" }  // ISO 639-1 target
      }
    }
  }));
});

ws.on("message", (data) => {
  const event = JSON.parse(data);
  switch (event.type) {
    case "session.output_audio.delta":
      // Base64-encoded translated PCM16 — play it.
      playPcm16(event.delta);
      break;
    case "session.output_transcript.delta":
      // Streaming translated text. Append to caption UI.
      process.stdout.write(event.delta);
      break;
    case "session.input_transcript.delta":
      // Streaming source-language transcript (what the speaker said).
      updateSourceCaption(event.delta);
      break;
    case "session.closed":
      ws.close();
      break;
  }
});

// Stream source audio as it arrives.
function pushAudio(base64Pcm16) {
  ws.send(JSON.stringify({
    type: "session.input_audio_buffer.append",
    audio: base64Pcm16
  }));
}
```

### Session config

The only field you typically need is `audio.output.language`. It controls the target language. The source language is auto-detected from the audio.

Pass an ISO 639-1 code (`en`, `es`, `fr`, `de`, `ja`, `zh`, etc.). For more granular control, consult the docs.

### Closing gracefully

When your source stream ends, send `session.close` and **wait** for `session.closed` before closing the WebSocket:

```javascript
ws.send(JSON.stringify({ type: "session.close" }));
// Continue reading events. When you receive session.closed:
//   ws.close();
```

Closing the socket immediately drops translated audio that's still draining. The `session.close` event is **only** supported in translation sessions — it doesn't exist on voice-agent sessions.

## Translation architectures

### Listen-along (one-way)

Source speaker → translation session → audience hears translated audio + reads subtitles. Examples: livestreams, conference talks, webinars, lectures, earnings calls.

```
source audio → translation session (en→es) → translated audio + subtitles
            → translation session (en→fr) → translated audio + subtitles
            → translation session (en→ja) → translated audio + subtitles
```

**Create one session per target language.** A single source in English, output in three languages, means three concurrent translation sessions.

For browser-side listen-along, capture tab audio with `getDisplayMedia()`, send over WebRTC, and play the remote translated audio track. For production broadcasts, run translation in a server media worker and publish translated audio tracks (or captions) to listeners over your existing CDN.

### Conversational (two-way or multi-party)

Two or more participants speak across languages. Examples: support calls, sales calls, tutoring, multilingual video rooms.

For a two-person call, create one session per **direction**:

```
Caller A audio → translate into Caller B's language → play to Caller B
Caller B audio → translate into Caller A's language → play to Caller A
```

For group rooms, the rough formula is:

```
sessions ≈ active_speaker_tracks × distinct_target_languages
```

Keep speaker audio tracks **separate**. Mixing speakers into one stream makes speaker identity, captions, and overlapping speech much harder to handle downstream.

## WebRTC source audio

For browser source audio, use the same WebRTC pattern from `references/06-transport-webrtc.md` but POST to `https://api.openai.com/v1/realtime/calls?model=gpt-realtime-translate` instead of the standard `/v1/realtime/calls`. The remote audio track delivered by the peer connection is the translated audio.

## Test for quality

Automated metrics catch some issues; bilingual review catches the rest. Build a golden set covering:

- Language-pair quality (each source/target combination).
- Names, numbers, dates, currency, phone numbers.
- Domain terms (legal, medical, finance).
- Code-switching and mixed-language conversation.
- Accents, fast speech, overlapping speech.
- First-translated-audio latency.
- End-of-utterance latency.
- Subtitle timing.
- Voice consistency.
- Reconnect behavior.

If your use case depends on exact names or domain terms, build the golden set **before** launch and review failures manually. See `references/18-evals-and-testing.md`.

## Production checklist

- [ ] Choose WebRTC for browser media, WebSocket for server media.
- [ ] Use the dedicated `/v1/realtime/translations` endpoint with `gpt-realtime-translate`.
- [ ] Stream audio continuously, including silence between phrases.
- [ ] Use `session.close` and wait for `session.closed` before closing a WebSocket session.
- [ ] Keep speaker tracks separate for conversational translation.
- [ ] Use one session per output language.
- [ ] Render both source and target transcripts where useful.
- [ ] Expose controls for original audio, translated audio, subtitles, mute, and volume.
- [ ] Surface reconnecting, delayed, and unavailable states.
- [ ] Track latency apart from translation quality.

## Common mistakes

- **Calling `response.create`.** It's an assistant API — translation is an interpreter. Don't.
- **Using the voice-agent endpoint.** `gpt-realtime-translate` only works on `/v1/realtime/translations`.
- **Mixing event names.** Translation has the `session.` prefix on input/output audio buffer events. Voice-agent shapes won't match.
- **Closing the WebSocket without `session.close`.** Translated audio mid-flight is dropped.
- **Mixing speakers into one input track.** Caption + speaker ID accuracy collapses.
- **Trying to use VAD config from voice agents.** Translation streams continuously — there's no turn detection knob.

## See also

- `examples/translation-session.py` — full Python WebSocket session.
- `examples/translation-session.ts` — same in TypeScript.
- `references/06-transport-webrtc.md` — browser-source listen-along.
- `references/18-evals-and-testing.md` — translation quality eval framework.
