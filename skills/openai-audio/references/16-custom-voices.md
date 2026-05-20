# 16 — Custom voices

Custom voices let you mint a unique voice for your product. Once created, the voice can be used in `/v1/audio/speech` and in Realtime sessions exactly like a built-in voice.

**Eligibility:** custom voices are available to approved customers. Contact OpenAI sales to get the feature turned on for your org.

**Per-org limit:** 20 voices.

## High-level flow

1. **Consent recording.** Voice actor records a fixed consent phrase (per-language).
2. **Sample recording.** Voice actor reads a 30-second or shorter sample.
3. **Upload consent** to `/v1/audio/voice_consents`, get back a `consent` ID.
4. **Upload sample** to `/v1/audio/voices`, referencing the `consent` ID, get back a `voice_id`.
5. **Use the `voice_id`** anywhere a built-in voice name would go.

## Consent phrases

The consent recording **must** read exactly one of the approved phrases (no improvisation):

| Language | Phrase |
|---|---|
| `de` | Ich bin der Eigentümer dieser Stimme und bin damit einverstanden, dass OpenAI diese Stimme zur Erstellung eines synthetischen Stimmmodells verwendet. |
| `en` | I am the owner of this voice and I consent to OpenAI using this voice to create a synthetic voice model. |
| `es` | Soy el propietario de esta voz y doy mi consentimiento para que OpenAI la utilice para crear un modelo de voz sintética. |
| `fr` | Je suis le propriétaire de cette voix et j'autorise OpenAI à utiliser cette voix pour créer un modèle de voix synthétique. |
| `hi` | मैं इस आवाज का मालिक हूं और मैं सिंथेटिक आवाज मॉडल बनाने के लिए OpenAI को इस आवाज का उपयोग करने की सहमति देता हूं |
| `id` | Saya adalah pemilik suara ini dan saya memberikan persetujuan kepada OpenAI untuk menggunakan suara ini guna membuat model suara sintetis. |
| `it` | Sono il proprietario di questa voce e acconsento che OpenAI la utilizzi per creare un modello di voce sintetica. |
| `ja` | 私はこの音声の所有者であり、OpenAIがこの音声を使用して音声合成 モデルを作成することを承認します。 |
| `ko` | 나는 이 음성의 소유자이며 OpenAI가 이 음성을 사용하여 음성 합성 모델을 생성할 것을 허용합니다. |
| `nl` | Ik ben de eigenaar van deze stem en ik geef OpenAI toestemming om deze stem te gebruiken om een synthetisch stemmodel te maken. |
| `pl` | Jestem właścicielem tego głosu i wyrażam zgodę na wykorzystanie go przez OpenAI w celu utworzenia syntetycznego modelu głosu. |
| `pt` | Eu sou o proprietário desta voz e autorizo o OpenAI a usá-la para criar um modelo de voz sintética. |
| `ru` | Я являюсь владельцем этого голоса и даю согласие OpenAI на использование этого голоса для создания модели синтетического голоса. |
| `uk` | Я є власником цього голосу і даю згоду OpenAI використовувати цей голос для створення синтетичної голосової моделі. |
| `vi` | Tôi là chủ sở hữu giọng nói này và tôi đồng ý cho OpenAI sử dụng giọng nói này để tạo mô hình giọng nói tổng hợp. |
| `zh` | 我是此声音的拥有者并授权OpenAI使用此声音创建语音合成模型 |

Any divergence from the script causes the upload to fail.

A single consent recording can back multiple voice creations if the same actor is creating multiple voices.

## Upload consent

```bash
curl https://api.openai.com/v1/audio/voice_consents \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "name=test_consent" \
  -F "language=en" \
  -F "recording=@$HOME/tmp/voice/consent.wav;type=audio/x-wav"
```

The response contains a `consent` ID (`cons_…`).

## Sample recording requirements

- ≤ 30 seconds.
- Allowed formats: `mpeg`, `wav`, `ogg`, `aac`, `flac`, `webm`, `mp4`.
- Quiet room, minimal echo.
- Professional XLR microphone recommended.
- 7–8 inches from the mic with a pop filter, constant distance.
- The model copies the recording **exactly** — tone, cadence, energy, pauses, habits. Record the voice you want.
- Small variations matter. Try multiple samples to find the best fit.

## Upload sample → create voice

```bash
curl https://api.openai.com/v1/audio/voices \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "name=test_voice" \
  -F "audio_sample=@$HOME/tmp/voice/sample.wav;type=audio/x-wav" \
  -F "consent=cons_123abc"
```

The response contains a `voice_id` like `voice_123abc`. The new voice also appears under [platform.openai.com/audio/voices](https://platform.openai.com/audio/voices).

## Use the voice — TTS

```bash
curl https://api.openai.com/v1/audio/speech \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "voice": { "id": "voice_123abc" },
    "input": "Maple est le meilleur golden retriever du monde entier.",
    "language": "fr",
    "format": "wav"
  }' \
  --output sample.wav
```

## Use the voice — Realtime

In a Realtime session config:

```javascript
{
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: {
      output: {
        voice: { id: "voice_123abc" }
      }
    }
  }
}
```

Same immutability rule — once audio has been emitted in the session, you can't change the voice.

## Compliance

OpenAI's usage policies require a clear AI disclosure to end users that the voice is synthetic. If you're producing voice content that could be confused with a real person, additional safeguards may apply — review the Text-to-Speech Supplemental Agreement that accompanies access.

## See also

- `references/05-text-to-speech.md` — the broader TTS surface.
- `references/02-voice-agents.md` — using the custom voice in Realtime.
