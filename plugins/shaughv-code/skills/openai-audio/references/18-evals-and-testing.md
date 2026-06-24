# 18 — Evals and testing

Realtime apps fail in ways unit tests miss. Users notice latency, drift, entity errors, voice consistency, and reconnect behavior before they notice anything you can grep for. Build an eval set early.

## What to measure (separately)

| Dimension | Why | How to measure |
|---|---|---|
| **Latency to first audio** | Determines how snappy the agent feels. | Stopwatch from `input_audio_buffer.committed` to first `response.output_audio.delta`. |
| **End-of-utterance latency** | How long after the user stops speaking before the model finishes its reply. | `speech_stopped` → final `response.output_audio.delta`. |
| **Transcript stability** | How much partial transcript shifts before final. | Diff each `…transcription.delta` against the final `.completed`. |
| **Voice consistency** | Does the model stay in character / accent? | Listen across turns; record any drift in your golden set. |
| **Entity accuracy** | Are order IDs / phone numbers / emails captured exactly? | Run scripted dialogues with known values; check final tool args. |
| **Tool selection** | Did the model pick the right tool for the intent? | Synthetic dialogues with expected tool calls. |
| **Confirmation behavior** | Does the agent confirm before writes? | Synthetic dialogues with write actions. |
| **Failure recovery** | Does the agent recover gracefully from tool errors? | Mock tools that fail intermittently. |
| **Quality vs. cost (WER, BLEU)** | Per-model accuracy metrics. | Standard transcription/translation eval scoring. |
| **Reconnect robustness** | Does the app survive a network drop? | Kill the WebSocket mid-call and confirm graceful recovery. |

Keep these separate. A change that improves WER but adds 400 ms of latency is a regression in voice UX.

## Build a golden set

Record (or synthesize) representative audio that hits the cases users hit:

- Different mics (laptop, earbuds, AirPods, lapel, phone).
- Telephony codecs (G.711, Opus).
- Accents (your real user mix).
- Code-switching (e.g., English + Spanish in one turn).
- Fast speech.
- Overlapping speech (two speakers).
- Background noise (cafe, car, kids, dog).
- Domain vocabulary (drug names, product SKUs, place names).
- Numbers, dates, currency, phone numbers, emails.
- Short clarifications and corrections.
- Long monologues.
- Silence + filler.

Each clip pairs with the **expected behavior**: transcript text, tool calls, response category. Store as a CSV/JSON manifest so you can re-run evals after every change.

## Test plans per capability

### Voice agent

Run a scripted dialogue against the WebSocket transport (deterministic, easier than browser E2E). For each scenario:

1. Connect the session with the production prompt + tools.
2. Stream the audio clip(s) for the scenario.
3. Capture all events.
4. Assert:
   - The model called the expected tool(s) with the expected args.
   - Confirmations occurred for write actions.
   - Identifier values were normalized correctly.
   - The model asked for clarification on unclear-audio scenarios instead of guessing.
   - Final spoken response satisfies the scenario rubric.

### Transcription

For each clip:

1. Send through `gpt-realtime-whisper` (or file model) per your prod config.
2. Capture `…transcription.delta` and `…transcription.completed`.
3. Assert:
   - WER vs golden transcript ≤ target.
   - Partial-to-final drift ≤ target (e.g., < 20% of tokens revised).
   - High-value entities (names, numbers) match exactly.
   - Latency to first text under target.

### Translation

For each clip:

1. Send into `gpt-realtime-translate` with the target language.
2. Capture `session.output_transcript.delta` and `session.output_audio.delta`.
3. Bilingual reviewer scores:
   - Fidelity (does the translation say what the speaker said?).
   - Name/number preservation.
   - Voice consistency.
   - Latency to first translated audio.

Automated metrics (BLEU, COMET) supplement but don't replace bilingual review.

### TTS

For each phrase:

1. Generate audio via `/v1/audio/speech` with the prod voice and instructions.
2. Assert:
   - Output file non-empty.
   - Duration roughly matches expected (≥ word count × 0.3 s).
   - Voice matches expectation (manual spot check).
   - For multilingual content, pronunciation is reasonable.

## CI pattern

Realtime evals are slower and noisier than unit tests. Run them:

- **On every prompt or tool change**: full golden set.
- **Daily on main**: smaller smoke set (5–10 scenarios) to catch upstream drift.
- **Before releases**: full set + bilingual review for translation.

Cache results so reruns only re-evaluate changed scenarios.

## What "good enough" looks like

Establish target thresholds before you start tuning. Examples (your numbers may differ):

- First-audio latency p95 < 700 ms.
- WER < 8% on golden set.
- Tool selection accuracy > 95%.
- Entity capture accuracy > 99% on confirmed identifiers.
- Zero hallucinated tool names.
- No silent failures (every tool failure surfaces a graceful response to the user).

Track thresholds in a manifest checked into the repo. Regressions block merges.

## Before swapping models

Before moving from `gpt-realtime-2` → `gpt-realtime-1.5` (or `gpt-realtime-whisper` → `gpt-4o-transcribe`, etc.):

1. Run the full eval set on the candidate model.
2. Compare numbers side-by-side with the current production model.
3. Compute the cost delta on representative sessions.
4. Have a human review 5–10 dialogues that hit a tail behavior (escalation, entity correction, unclear audio).
5. Document the decision (eval scores, cost savings, who reviewed).

## Pointer

OpenAI's Realtime eval cookbook contains a structured framework with template manifests and scoring rubrics. Search "Realtime eval guide" on the OpenAI Cookbook for the latest.

## See also

- `references/03-transcription.md` — what to expect from each transcription model.
- `references/04-translation.md` — bilingual review framework.
- `references/14-costs-and-rate-limits.md` — usage measurement basics.
- `examples/README.md` — local verification log for this skill's own examples.
