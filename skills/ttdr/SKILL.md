---
name: ttdr
description: >-
  Use when anyone asks for a "TT;DR" (also "TTDR" or a "too tired didn't read" summary), or whenever
  you're about to hand back a status update, progress report, decision, commit or PR description,
  incident write-up, or any long or detailed answer and want to open it with a short skim-summary for
  a busy or tired reader. A TT;DR is a short (1–3 sentence), plain-English, high-level lead that sits
  on top of the detailed information rather than replacing it — the full answer still follows beneath
  it. Covers what a TT;DR is, how to write one for the context at hand, and how it differs from a
  TL;DR, a technical overview, or a tech spec. Trigger phrases: "TT;DR", "TTDR", "give me a TT;DR",
  "too tired didn't read", "lead with a summary", "high-level summary first", "skim summary", "what
  does TT;DR mean", "TL;DR vs TT;DR".
---

# TT;DR

## What it is

**TT;DR = "Too Tired; Didn't Read."** A short (1–3 sentence), plain-English, high-level summary that lets a competent reader who is tired or overloaded grok *what's going on and where it stands* in one glance — without wading through the detail.

It's a deliberate riff on **TL;DR**, but with the opposite spirit.

**A TT;DR accompanies the detail — it never replaces it.** It's the soft-landing lead on *top* of the full answer. You still give the reader everything else; the TT;DR just goes first, so someone who's slammed can read three sentences and stop there if that's all they need, or read on for the specifics.

## TL;DR vs TT;DR — same shape, opposite spirit

| | TL;DR | TT;DR |
|---|---|---|
| Expands to | Too Long; Didn't Read | Too Tired; Didn't Read |
| Assumes the reader is | Lazy / skipping | Competent, but tired or overloaded |
| The vibe | "I couldn't be bothered to read it" | "Give me signal-dense triage" |
| Shape | A short summary | A short, plain-English, high-level lead — *same shape, opposite spirit* |

A TT;DR never assumes the reader is lazy or unskilled. It assumes a sharp reader who is busy, tired, or scanning a wall of things at once and needs the gist *fast*.

## Where to use it

Anywhere dense detail needs a skim-layer on top:

- **Status / progress updates** — what you're doing and whether it's moving, stuck, or done.
- **Commit messages & PR descriptions** — the plain-English gist above the technical body.
- **Incident & bug write-ups** — what broke and where it stands, above the forensic detail.
- **Long docs, reports, research findings** — a one-glance lead before the deep dive.
- **Tickets, hand-offs, and any place a busy reader scans many items at once.**

If the thing you're writing has a detailed body and a reader who might be too busy to read all of it, it wants a TT;DR.

## How to write one

There's **no rigid formula.** A TT;DR is a high-level overview that lets a tired or overloaded reader understand *what's going on* and *whether anything is needed from them*, written for the context at hand. A few things hold across all of them:

- **Short — 1–3 sentences.** If it runs to a paragraph, it isn't a TT;DR.
- **Plain English, jargon-free.** No variable names, file paths, line numbers, IDs, commands, or table/column names — those live in the detail *below* the TT;DR, never inside it.
- **High-level, not a mini tech spec.** The "what" and "where it stands," not the mechanics.
- **It leads; it doesn't replace.** The full detail still follows underneath.

**What to include is context-dependent.** Generally: what's happening, where it stands, and — *when it applies* — anything needed from the reader (a blocker, a decision, a follow-up). That last part is conditional. On a pure observation surface — say, agents posting status for people to watch — there's usually nothing needed from the reader, so you just give the what and the where-it-stands. A hand-off or a question, by contrast, should lead with what's needed. Read the room: who's reading this, and what would they need to grok at a glance?

**The test:** could a smart non-engineer read it and know what's happening and whether it's moving, stuck, or done? If yes, it's a TT;DR. If they'd have to decode an identifier or a path, it's detail wearing a TT;DR label.

## Format & placement

- **Label it** — open with `TT;DR:` so the reader knows the skim-layer is there.
- **Put it first** — it's the lead: top of the message, the PR body, the doc, the field.
- **Separate it from the detail** — a blank line (or the rest of the document) below it; the TT;DR is visually its own thing.
- **One-liner surfaces** — when the field or message is a single line, the TT;DR *is* that line: write the one-liner as the plain-English summary.

## How it differs from a technical overview / tech spec

A TT;DR is **not** a small tech spec. They serve different readers and different purposes:

| | TT;DR | Technical overview / tech spec |
|---|---|---|
| Written for | A reader scanning many things, possibly tired | An engineer who will build, review, or debug it |
| Purpose | Triage at a glance | Full, precise understanding |
| Length | 1–3 sentences | As long as it needs to be (paragraphs to pages) |
| Language | Plain English | Precise technical vocabulary |
| Includes | The "what" + "where it stands" + any blocker/decision | Paths, identifiers, APIs, data models, commands, trade-offs |
| Excludes | Variable names, paths, line numbers, IDs, commands | Nothing relevant — it's exhaustive by design |
| Stands alone? | No — it's a *lead*; the detail follows it | Yes — it *is* the detail |
| Spirit | Skim because you're competent and busy | Study because you need precision |

If you catch yourself writing identifiers, file paths, or step-by-step mechanics, you've drifted into a technical overview. Pull that down into the detail block and keep the TT;DR high-level.

## Example

✅ **A real TT;DR, leading a detailed update:**
> **TT;DR:** Reworking how project status is tracked. The staging changes are done and tested; holding on production until we pick a maintenance window.
>
> Detail: renamed the status field across the affected modules, drafted the backfill migration, tests green locally. Next — run it against staging, then schedule the production window.

❌ **Detail wearing a TT;DR label:**
> **TT;DR:** Renamed sync_status → status_at in 3 files; migration 0042 set to nullable + backfill.

The ❌ version is the *detail* — accurate, but it forces the reader to decode column names and a migration ID. That belongs *below* the TT;DR, not in it.

For a full bank of before/after examples — status updates, commit & PR descriptions, incident write-ups, and edge cases like one-line fields and multi-section reports — see [references/examples.md](references/examples.md).

## When someone asks for a TT;DR

They want the plain-English, high-level summary **first** — not a tech spec, not a bullet list of internals. Lead with the 1–3 sentence gist, then **still include the full detailed answer underneath**, clearly separated. A TT;DR request means "put a soft landing on top," not "replace the detail with a summary." Never answer "give me a TT;DR" with a wall of technical specifics — and don't drop the detail entirely either; the TT;DR rides on top of it.

## Common mistakes

| Mistake | Fix |
|---|---|
| Packing it with jargon (paths, IDs, var names, commands) | Pull every identifier down into the detail block; keep the TT;DR plain-English. |
| Letting it run to a paragraph | Cut to 1–3 sentences. If it won't fit, you're writing the overview, not the lead. |
| Making it *replace* the detail | The TT;DR leads; the full answer still follows beneath it. |
| Burying it below the detail | It's the lead — it goes first, at the top. |
| Dropping the `TT;DR:` label | Label it so the reader knows the skim-layer is there. |
| Just restating the title | The title says *what it is*; the TT;DR says *what's going on and where it stands*. |
| Forcing a "blocker/decision" when none applies | Include what's-needed-from-the-reader only when it actually applies; on observation surfaces, often nothing is. |
