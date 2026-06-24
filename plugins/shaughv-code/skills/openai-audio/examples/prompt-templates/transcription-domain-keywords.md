# Transcription — domain keywords and prompts

Transcription models accept a `prompt` parameter (≤ 224 tokens) to steer vocabulary, formatting, and casing. This is the cheapest way to fix recurring misrecognition of domain-specific terms.

Note: `gpt-4o-transcribe-diarize` does **not** accept `prompt`. For diarized workflows, do a second-pass cleanup with `gpt-4.1` instead (see "Post-processing" below).

## Vocabulary prompt template

```text
The transcript is a conversation about {{ domain_short_description }}.

Spell the following terms exactly as shown:
- {{ Term1 }}
- {{ Term2 }}
- {{ Term3 }}
- {{ Acronym1 }} (pronounced "{{ pronunciation_guide }}")
- {{ ProductName }} (capitalized as shown)

Preserve numbers, currency, and punctuation. Use sentence case.
```

## Concrete examples

### Medical / cardiology

```text
The transcript is a clinical conversation about cardiology and medication management.

Spell the following terms exactly as shown:
- metoprolol
- atorvastatin
- A1C
- LDL
- HDL
- systolic / diastolic
- electrocardiogram
- arrhythmia

Preserve dosages (e.g., "twenty-five milligrams") and frequency (e.g., "twice daily"). Use sentence case.
```

### Software / DevOps

```text
The transcript is an engineering conversation about Kubernetes and cloud infrastructure.

Spell the following terms exactly as shown:
- Kubernetes (not "kubernetes")
- kubectl (lowercase, no space)
- Terraform
- Prometheus
- Grafana
- PostgreSQL
- gRPC
- Helm chart

Preserve command-line snippets verbatim, e.g., "kubectl get pods -n prod".
```

### Financial services

```text
The transcript is a customer-service call about a brokerage account.

Spell the following terms exactly as shown:
- 401(k)
- Roth IRA
- ACH
- FINRA
- S&P 500
- Schwab
- Vanguard

Preserve account numbers (e.g., "8-3-5-2-1") digit by digit and currency (e.g., "$2,500.00"). Use sentence case.
```

### Brand / SKU names

```text
The transcript is a customer-service call about NorthLoop products.

Spell the following terms exactly as shown:
- NorthLoop (one word, two capitals)
- NL-Pro-2026
- BlueBolt
- StreamHub Plus

Preserve order IDs (e.g., "ORD-3125B23"). Use sentence case.
```

## Post-processing with a stronger model

When `prompt` isn't enough or you're using the diarize model, post-process the transcript with `gpt-4.1`:

```python
SYSTEM_PROMPT = """
You are a helpful assistant for NorthLoop. Correct spelling and casing of
brand names, SKUs, and technical terms in the transcript. Do not change
meaning. Do not add filler. Preserve punctuation and speaker labels.

Brand/term list:
- NorthLoop, NL-Pro-2026, BlueBolt, StreamHub Plus
- Kubernetes, kubectl, Terraform, Prometheus, Grafana
"""

corrected = client.chat.completions.create(
    model="gpt-4.1",
    temperature=0,
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": raw_transcript},
    ],
).choices[0].message.content
```

Why this helps:

- `gpt-4.1` has a much wider context window than the 224-token transcription prompt budget.
- You can list dozens of terms with examples and casing rules.
- The transcript model handles audio → text; the post-processor handles knowledge.

## See also

- `references/03-transcription.md` — full transcription guide.
- `examples/transcription-file-fallback.py` — uses the `--prompt` flag.
