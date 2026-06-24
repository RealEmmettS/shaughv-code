# 14 — Costs and rate limits

Realtime API costs are accrued **per Response**. Each response is billed by input + output tokens across text, audio, and image modalities. Translation and transcription sessions are billed by audio duration. Pricing varies by model — check the model pages on `platform.openai.com`.

## How tokens work in Realtime

| Modality | Rate |
|---|---|
| User audio input | 1 token per 100 ms |
| Assistant audio output | 1 token per 50 ms |
| Text | Estimate with the [OpenAI tokenizer](https://platform.openai.com/tokenizer). |
| Cached input | Much cheaper. Applied automatically when prefixes match. |

Per-message token counts include a few special tokens beyond the literal content — a "10 token" user message may show up as ~12 tokens.

The model receives the **entire conversation** for each Response. Turns later in a session have larger inputs (and higher per-turn cost) than earlier turns.

## Reading usage

Every Response emits `response.done` with a `usage` object:

```json
{
  "type": "response.done",
  "response": {
    "usage": {
      "total_tokens": 253,
      "input_tokens": 132,
      "output_tokens": 121,
      "input_token_details": {
        "text_tokens": 119,
        "audio_tokens": 13,
        "image_tokens": 0,
        "cached_tokens": 64,
        "cached_tokens_details": {
          "text_tokens": 64,
          "audio_tokens": 0,
          "image_tokens": 0
        }
      },
      "output_token_details": {
        "text_tokens": 30,
        "audio_tokens": 91
      }
    }
  }
}
```

Log this per turn for billing, capacity planning, and to spot drift after prompt changes.

## Input transcription costs

If you enable `audio.input.transcription` (so input audio also gets transcribed for the conversation history), transcription is billed separately. Transcription token counts arrive in `conversation.item.input_audio_transcription.completed`:

```json
{
  "type": "conversation.item.input_audio_transcription.completed",
  "usage": {
    "type": "tokens",
    "total_tokens": 26,
    "input_tokens": 17,
    "input_token_details": { "text_tokens": 0, "audio_tokens": 17 },
    "output_tokens": 9
  }
}
```

## Translation and transcription sessions

`gpt-realtime-translate` and `gpt-realtime-whisper` sessions are billed by audio duration, not by per-Response tokens. Confirm pricing for the model on its model page.

## Prompt caching

Realtime supports prompt caching **automatically**. When the input tokens of a Response match a previous Response's prefix, the matched tokens are served from cache at a lower price. Cache rate is best-effort, not guaranteed.

**Cache rate is structural, not a knob.** Maximize it by:

- Keeping the session's history as static as possible.
- Putting instructions and tool definitions at the start of the session and not changing them mid-session.
- Avoiding `session.update` calls that mutate the prompt or tool list once the conversation has started.

`prompt_cache_key` exists for the Responses API but doesn't apply the same way to Realtime — Realtime cache hits depend on the conversation prefix matching, not a key.

## Truncation

When the conversation exceeds the model's input window, old items are dropped (oldest first) until it fits. A 32k-context model with 4,096 max output tokens can include 28,224 tokens of input before truncation.

You can configure your own (smaller) limit to control cost:

```json
{
  "type": "session.update",
  "session": {
    "truncation": {
      "type": "retention_ratio",
      "retention_ratio": 0.8,
      "token_limits": { "post_instructions": 8000 }
    }
  }
}
```

| Field | Meaning |
|---|---|
| `retention_ratio` | After truncating, retain this fraction of the maximum window. Default `1.0` (just enough to fit). `0.8` drops 20% extra to delay the next truncation event. |
| `token_limits.post_instructions` | Maximum input tokens excluding system instructions. Set lower to keep token budgets tight. |

**Truncation busts cache near the beginning of the conversation.** If you truncate every turn, cache rate drops to ~zero. Using a smaller `retention_ratio` extends the headroom between truncations.

Disable truncation entirely if you'll manage the conversation manually:

```json
{
  "type": "session.update",
  "session": { "truncation": "disabled" }
}
```

When disabled, an oversized conversation returns an error rather than silently dropping items.

## Manual conversation editing

The conversation is a server-stored list of items you can mutate:

```javascript
// Drop a single item
ws.send(JSON.stringify({
  type: "conversation.item.delete",
  item_id: "item_CCXLecNJVIVR2HUy3ABLj",
}));

// Insert a summary placeholder
ws.send(JSON.stringify({
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "system",
    content: [{ type: "input_text", text: "Earlier in the call the caller verified their identity with order ORD-123 and reported a billing issue. The agent issued a $10 credit." }],
  },
}));
```

For long sessions, periodically summarize 10–20 old turns into one system message and `delete` the originals. You trade absolute fidelity for sustained cache hits.

## Choosing a smaller model

`gpt-realtime-1.5` is cheaper than `gpt-realtime-2`. Move from the larger to the smaller model only after evals show acceptable quality on your representative audio + tasks. Common signals to watch:

- Instruction following (especially tool eagerness).
- Entity capture accuracy (digit-by-digit confirmation).
- Tool failure recovery.
- Long-context coherence.

Don't ship a model downgrade based on offline sample audio alone.

## Rate limits

Standard OpenAI rate-limit dimensions apply: requests/minute (RPM), requests/day (RPD), tokens/minute (TPM), tokens/day (TPD). Realtime audio also tracks audio minutes per minute on streaming models. Check your tier on `platform.openai.com → Settings → Limits`.

Response headers on Realtime requests include:

| Header | Meaning |
|---|---|
| `x-ratelimit-limit-requests` | RPM cap. |
| `x-ratelimit-limit-tokens` | TPM cap. |
| `x-ratelimit-remaining-requests` | Remaining this minute. |
| `x-ratelimit-remaining-tokens` | Remaining this minute. |
| `x-ratelimit-reset-requests` | Time until counter resets. |
| `x-ratelimit-reset-tokens` | Time until counter resets. |

## Tiered usage

Spend levels graduate you automatically:

| Tier | Qualification | Monthly usage cap |
|---|---|---|
| Free | Allowed geography | $100 |
| Tier 1 | $5 paid | $100 |
| Tier 2 | $50 paid | $500 |
| Tier 3 | $100 paid | $1,000 |
| Tier 4 | $250 paid | $5,000 |
| Tier 5 | $1,000 paid | $200,000 |

Higher tiers come with higher RPM/TPM caps automatically.

## Exponential backoff for 429s

Wrap requests in retry-with-jitter. Tenacity (Python):

```python
from tenacity import retry, wait_random_exponential, stop_after_attempt

@retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(6))
def call_with_backoff(**kwargs):
    return client.responses.create(**kwargs)
```

`backoff` (Python):

```python
import backoff, openai

@backoff.on_exception(backoff.expo, openai.RateLimitError)
def call_with_backoff(**kwargs):
    return client.responses.create(**kwargs)
```

Manual implementation for full control:

```python
import random, time, openai

def retry_with_exponential_backoff(func, *, max_retries=10, base=2, jitter=True, errors=(openai.RateLimitError,)):
    def wrapper(*args, **kwargs):
        delay = 1
        for attempt in range(max_retries + 1):
            try:
                return func(*args, **kwargs)
            except errors:
                if attempt == max_retries:
                    raise
                delay *= base * (1 + jitter * random.random())
                time.sleep(delay)
    return wrapper
```

## Estimating costs for a project

The best estimate is empirical. In the Realtime Playground:

1. Mock your prompt and tools.
2. Run a representative session.
3. Sum `response.done.usage` from the session log.
4. Multiply by your tier's pricing.

Repeat for the 90th-percentile case (longer session, more tools).

## Mini-checklist

- [ ] Logging `response.done.usage` per turn.
- [ ] Cache rate looks healthy (compare `cached_tokens` to `input_tokens`).
- [ ] Truncation tuned to your latency vs. cost tradeoff.
- [ ] Exponential backoff on 429s.
- [ ] Model selection has been eval'd, not guessed.
- [ ] You have an alarm on TPM and RPM headroom.

## See also

- `references/02-voice-agents.md` — session config knobs.
- `references/09-conversation-lifecycle.md` — `conversation.item.delete`/`create` for manual editing.
- `references/18-evals-and-testing.md` — what to measure before swapping a model.
