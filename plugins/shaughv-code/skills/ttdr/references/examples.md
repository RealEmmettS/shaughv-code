# TT;DR — worked examples & recipes

A bank of before/after TT;DRs, per-medium placement recipes, and edge cases. Pull this in when you're actually writing one. Every ✅ leads with a plain-English summary and keeps the full detail beneath it; every ❌ is "detail wearing a TT;DR label" — accurate, but it forces a tired reader to decode identifiers, paths, or mechanics they shouldn't have to.

The throughline: **the TT;DR rides on top of the detail, it doesn't replace it.** None of the ✅ examples drop the technical body — they just put a soft landing in front of it.

---

## 1. Status / progress updates

The most common use. A reader scanning many updates at once needs to know, per item: what is this, and is it moving, stuck, or done?

### ✅ Good — in flight, nothing needed from the reader
> **TT;DR:** Reworking how project status is tracked so we can see when and why it last changed. The code change is done and tested locally; next I'm trying it against staging.
>
> Detail: renamed the status field across the three affected modules, drafted the backfill migration, all tests green locally. Next — apply it to the staging database, then schedule the production window.

*Why it works:* plain-English what + where-it-stands. It's a pure progress note, so it asks nothing of the reader — and that's correct for this context.

### ❌ Bad — detail wearing the label
> **TT;DR:** Renamed sync_status → status_at across 3 modules; backfill migration drafted at 0042; tests green.

*Why it drifts:* column names and a migration ID. A tired reader can't triage this at a glance. **Fix:** the sentence above *is* the fix — those identifiers move into the "Detail:" line.

### ✅ Good — blocked, something IS needed
> **TT;DR:** The status-tracking change is code-complete and tested on staging. I need a call on whether to apply it to production now or wait for the weekend maintenance window before I go further.
>
> Detail: staging migration ran in ~1.2s on 47k rows; production is ~10× that. Running during business hours means a brief table lock; waiting means zero risk to live reads. Holding here until you pick.

*Why it works:* because a decision is genuinely needed, the TT;DR leads with it. Contrast with the first example, where nothing was needed and the TT;DR didn't manufacture a fake "next decision."

### ✅ Good — done
> **TT;DR:** The status-tracking change is shipped and verified — no action needed.
>
> Detail: merged, migration applied to production during the Saturday window, post-apply checks green, feature flag removed.

---

## 2. Commit messages & PR descriptions

A reviewer opening a PR is the tired reader. The TT;DR is the first thing in the body, above the technical "what changed / how to test."

### ✅ Good — PR description
> **TT;DR:** Adds CSV export to the reports page so people can pull the numbers into a spreadsheet instead of copying them by hand. Behind a flag, off by default, safe to merge.
>
> ## What
> New `GET /reports/:id/export.csv` endpoint + a download button on the report view.
> ## Why
> Closes the top request from last month's feedback round.
> ## How to test
> Flip `REPORTS_CSV_EXPORT=on`, open any report, click Export, diff the file against the on-screen table.
> ## Risk
> Low — additive, flagged off, no change to existing reads.

*Why it works:* a reviewer who only reads the TT;DR already knows what it is, that it's low-risk, and that it's mergeable. The structured detail is right there for when they review properly.

### ❌ Bad — TT;DR is just the diff stat
> **TT;DR:** +312/−4 across 6 files; new route in reports_controller, button in ReportView.tsx, flag in config.

*Why it drifts:* file names and line counts are detail, not triage. **Fix:** say what the change *does for a person* ("adds CSV export"), put the file list in the "What" section.

### ✅ Good — commit body
A commit subject is already a one-liner; when the body is long, lead the body with a TT;DR:
> ```
> feat(reports): add CSV export endpoint
>
> TT;DR: lets people download a report as a spreadsheet; flagged off by default.
>
> Adds GET /reports/:id/export.csv streaming the same rows the table renders,
> gated behind REPORTS_CSV_EXPORT. No change to existing endpoints.
> ```

---

## 3. Incident & bug write-ups, long docs

The reader here is often stressed and time-poor (an on-call engineer, a teammate triaging a report, a stakeholder skimming a report). Lead with what happened and where it stands; the forensic detail follows.

### ✅ Good — incident note
> **TT;DR:** Logins were failing for about 20 minutes this morning; it's fixed and everyone can sign in again. Root cause was a bad config push; we've added a check so it can't happen the same way again.
>
> Timeline: 09:02 deploy went out, 09:04 error rate spiked, 09:11 paged, 09:23 rolled back, recovery confirmed 09:24. Cause: the deploy shipped an empty auth secret because the env file wasn't templated for the new region. Follow-up: validation gate on non-empty secrets (tracked separately).

*Why it works:* a manager or teammate reads two sentences and knows the user impact, that it's resolved, and that there's a prevention. The engineer reads on for the timeline and cause.

### ❌ Bad — detail wearing the label
> **TT;DR:** AUTH_SECRET resolved to "" after the us-west cutover because .env.us-west wasn't run through envsubst; rolled back deploy 8f2a1c.

*Why it drifts:* secret names, region slugs, a commit SHA. **Fix:** "a config push shipped an empty auth secret" in the TT;DR; the names and SHA go in the timeline below.

### ✅ Good — bug report
> **TT;DR:** The export button produces an empty file when a report has zero rows — it should download a header-only file or show "nothing to export." Low severity, easy repro, no data at risk.
>
> Repro: open an empty report → Export → 0-byte file. Expected: header row, or a friendly empty-state. Likely the writer returns early before the header is written.

### ✅ Good — long doc / report
A multi-page document gets **one** TT;DR at the very top, not one per section:
> **TT;DR:** We looked at three ways to speed up the nightly batch. Recommendation: option B (incremental processing) — biggest win for the least risk. Options A and C and the full trade-off analysis are below.
>
> [sections follow…]

---

## Per-medium placement recipes

| Medium | Where the TT;DR goes | Separation from detail |
|---|---|---|
| Status / progress update | First line of the field or message | Blank line, then the detail; sign-off (if any) last |
| One-line status field | The field *is* the TT;DR — write the one-liner as the summary | n/a — there's no separate detail line |
| PR description | First line of the PR body, above the `## What` sections | Blank line, then the structured body |
| Commit | Subject is its own one-liner; if the body is long, lead the body with a `TT;DR:` line | Blank line between subject, TT;DR, and body |
| Incident / bug write-up | Top of the note | Blank line, then timeline / repro / cause |
| Long doc, report, research finding | Very top, once | The rest of the document is the detail |
| Chat / email update | First line | The specifics follow in the same message |

---

## Edge cases

- **One-line surfaces.** When the field or message is a single line, the TT;DR *is* that line — there's no separate detail to carry. Write the one-liner as a plain-English summary, not a compressed dump of identifiers.
- **Very short detail.** Even when the body is two sentences, still lead with the gist if the reader is scanning. A TT;DR isn't only for long things — it's for *busy readers*, regardless of length.
- **Multi-section reports.** One TT;DR at the top covering the whole thing. Don't sprinkle a TT;DR onto every section — that defeats the "one glance" purpose. (If a section is itself a long sub-document a reader might jump straight to, a short lead on that section is fine — but the top-level TT;DR covers the document.)
- **Nothing is needed from the reader.** Common on observation surfaces (status feeds, progress logs people watch). Don't manufacture a fake decision or next-step just to fill a slot — give the what and the where-it-stands and stop.
- **Something is urgently needed.** Lead with it. If the single most important thing is "I'm blocked on X" or "I need you to decide Y," that goes in sentence one, not buried after a status recap.
- **How long is too long?** If you're past three sentences, or you've reached for a semicolon to cram in a second clause of detail, you've crossed from lead into overview. Cut it back and push the rest down.

---

## The one-line test

Read your TT;DR as if you're tired and scanning twenty other things. Do you know, in one pass, **what this is** and **whether it's moving, stuck, or done** — and, if it matters here, **whether anything is needed from you**? If yes, ship it. If you had to decode an identifier or a path, you wrote detail — move it down and try again.
