# Audio fixtures

The two WAV files in this directory are short, deterministic test fixtures
used by the transcription, translation, and voice-agent examples. They were
synthesized via `gpt-4o-mini-tts` so future runs of the examples produce
predictable, reviewable outputs.

| File | Source text | Voice | Approx. length |
|---|---|---|---|
| `sample-en.wav` | "Hello. My order number is one two three four five. Can you tell me the shipping status?" | `marin` | ~6 s |
| `sample-es.wav` | "Hola, soy Maria. Vivo en Madrid y trabajo como ingeniera de software." | `cedar` | ~5 s |

## Regenerating

```bash
export OPENAI_API_KEY=sk-...

# English sample
python ../tts-streaming.py \
  "Hello. My order number is one two three four five. Can you tell me the shipping status?" \
  sample-en.wav

# Spanish sample (uses cedar voice — edit tts-streaming.py voice param,
# or call the API directly with PowerShell/curl)
```

You can also drop in your own audio. Any common format (`mp3`, `wav`, `mp4`,
`m4a`, `flac`, `webm`, `ogg`) works for the file-based transcription example.
For the streaming examples, prefer WAV so `soundfile` and `wavefile` can read
it without extra dependencies.
