# 15 — Audio in Chat Completions (`gpt-audio`)

If you have an existing Chat Completions app and want to add audio input or output without rewriting around the Realtime API, use `gpt-audio` with `modalities: ["text", "audio"]`. This is a **request/response** path — not streaming, not low-latency, not the right tool for live voice agents.

For new voice products, prefer `gpt-realtime-2` and `references/02-voice-agents.md`.

**The Responses API does not currently support audio in/out.** Use Chat Completions for this pattern.

## Audio output from text

```python
import base64
from openai import OpenAI

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-audio",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[{
        "role": "user",
        "content": "Is a golden retriever a good family dog?",
    }],
)

wav = base64.b64decode(completion.choices[0].message.audio.data)
with open("dog.wav", "wb") as f:
    f.write(wav)
```

```javascript
import { writeFileSync } from "node:fs";
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.chat.completions.create({
  model: "gpt-audio",
  modalities: ["text", "audio"],
  audio: { voice: "alloy", format: "wav" },
  messages: [{ role: "user", content: "Is a golden retriever a good family dog?" }],
  store: true,
});

writeFileSync(
  "dog.wav",
  Buffer.from(response.choices[0].message.audio.data, "base64"),
);
```

The response includes both the text reply (`choices[0].message.content`) and audio (`choices[0].message.audio.data`, base64 in the format you requested).

## Audio input

```python
import base64, requests
from openai import OpenAI

client = OpenAI()

audio = requests.get("https://cdn.openai.com/API/docs/audio/alloy.wav").content
b64 = base64.b64encode(audio).decode("utf-8")

completion = client.chat.completions.create(
    model="gpt-audio",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What is in this recording?"},
            {"type": "input_audio", "input_audio": {"data": b64, "format": "wav"}},
        ],
    }],
)

print(completion.choices[0].message)
```

```javascript
const url = "https://cdn.openai.com/API/docs/audio/alloy.wav";
const audioBuffer = await (await fetch(url)).arrayBuffer();
const b64 = Buffer.from(audioBuffer).toString("base64");

const response = await client.chat.completions.create({
  model: "gpt-audio",
  modalities: ["text", "audio"],
  audio: { voice: "alloy", format: "wav" },
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "What is in this recording?" },
      { type: "input_audio", input_audio: { data: b64, format: "wav" } },
    ],
  }],
});

console.log(response.choices[0].message);
```

## Supported audio formats

For input and output, `wav`, `mp3`, and other common compressed audio formats are accepted. Pass the format string in `audio.format` for output, and in each `input_audio.format` field for input parts.

## When to use this vs. Realtime

| Use Chat Completions audio | Use Realtime |
|---|---|
| You have an existing Chat Completions integration. | You're starting fresh. |
| The interaction is request → response (single turn). | The interaction is streaming. |
| Latency tolerance is in the multi-second range. | Latency needs to feel like a conversation. |
| You're processing recorded audio. | The user is speaking live. |
| You don't need tool calls during audio interactions. | You need tool calls or MCP. |

## See also

- `references/02-voice-agents.md` — the Realtime alternative for live voice.
- `references/05-text-to-speech.md` — dedicated TTS endpoint for cheaper, narrower workloads.
- `references/03-transcription.md` — dedicated speech-to-text endpoint.
