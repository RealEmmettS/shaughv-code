# Working Canvas

The working canvas combines a compact **active decision packet** with a lossless **cold
archive**. It is a practice before it is a file: confidence-banded reasoning kept inline for
quick self-checks, or as a markdown file the operator can watch during the session and revisit.

## Contents

- [The principle](#the-principle)
- [Scale to stakes (when the canvas is a file)](#scale-to-stakes-when-the-canvas-is-a-file)
- [Where the canvas file lives](#where-the-canvas-file-lives)
- [Canvas template](#canvas-template)
- [What must never be lost when updating the canvas](#what-must-never-be-lost-when-updating-the-canvas)
- [Canvas update rules](#canvas-update-rules)
- [How the canvas relates to chat](#how-the-canvas-relates-to-chat)
- [Resolution toggle](#resolution-toggle)
- [Closing the canvas](#closing-the-canvas)

## The principle

**Externalization enables useful compression.** When information accumulates, preserve raw
material and superseded states in the cold archive, then keep a typed active packet for the next
decision. The chat is the conversation. The packet is the current map. The archive preserves the
territory and provenance.

Archive entries are append-only by default. The active packet is updated in place when evidence
changes. Earlier framings stay retrievable without remaining in active reasoning context.

## Scale to stakes (when the canvas is a file)

Match the skill's §1D rule:

- **Quick self-check** — keep the canvas *inline* in your response: the same structure
  (facts, tagged assumptions, confidence bands, sanity check), no file.
- **High-stakes, long-running, or auditable work** — create the canvas as a **file** the
  operator can open, watch, and audit — and a future session can resume.
- **Human-facilitated sessions** — the canvas file is mandatory, as always.

Everything below about updating and closing the canvas applies to both forms; the path
conventions and watch-it-update behaviors apply to the file.

## Where the canvas file lives

When the canvas is a file, use the repository's existing convention. Otherwise default to
`<project-root>/docs/thinking/<date>-<topic>.md` for project work or an available workspace
artifact directory outside a repo. Ask only when path choice changes visibility, sharing,
authority, or the requested deliverable.

Update the active packet after material evidence, decisions, routes, or obligations change, and
at natural checkpoints or the operator's request. Append archival detail when it is worth
preserving. Do not create busywork updates for conversational turns that change nothing.

## Canvas template

```markdown
# Critical Thinking Session — <topic>

**Date:** YYYY-MM-DD
**Framework:** <Contemplating | Decision-Making | Design | Problem-Solving | Information Triage | Scientific Inquiry | Strategic / Adversarial>
**Mode:** <Self-check | Facilitate | Provoke | Recommend>
**Stacked skills:** <none | logical-reasoning | ...>

---

## Active Decision Packet

- Objective / decision:
- Governing constraints and non-goals:
- Verified facts and exact evidence pointers:
- Live assumptions / hypotheses:
- Unresolved contradiction:
- Current decision:
- Next bounded action and predicted observation:
- Archive sections needed for that action:

---

## Pre-Flight: Inputs Inspected

### Inputs brought to the session
- <input 1>: <type — external artifact, internal artifact, situation description>
- <input 2>: ...

### Source pass findings
- <what was noticed about credibility, stake, evidence vs. rhetoric, missing
  counter-evidence>

### What's already decided (not revisiting)
- <commitment 1>
- <commitment 2>

---

## Working Sections

### Facts
Append-only. Each fact tagged with confidence band.

| Fact | Confidence | Source / surfaced at |
|---|---|---|
| <fact> | High / Medium / Low | <step or input> |

### Assumptions
Append-only. Each assumption tagged with status.

| Assumption | Status | Surfaced at | Notes |
|---|---|---|---|
| <assumption> | open / tested / dismissed | <step> | <why dismissed, evidence> |

### Constraints
- <constraint>: <why it matters, who set it>

### Open questions
- <question>: <when it needs answering>

### Tensions
Two surfaced items pulling against each other and not yet reconciled.
- <item A> vs. <item B>: <why this matters>

### Deferred items
Things flagged but parked. Not lost.
- <item>: <why parked, when to revisit>

### Attempt ledger (use when work repeats or stalls)
Compare execution cycles without pretending repetition is progress.

| # | Relevant starting state | Intervention | Observation | Information gained | Verdict |
|---|---|---|---|---|---|
| 1 | <candidate/runtime/inputs> | <action> | <raw result> | <criterion, narrower hypothesis, or none> | new evidence / valid replication / duplicate cycle |

### Connections
Analogies, links to prior projects, chunks of related knowledge.
- <connection>

---

## Framework Steps

### Step 1: <step name>
**Sub-questions asked:** <list>
**Responses:** <the answers — the operator's, in their own words where possible, or your
own worked answers in self-check>
**Insights:** <what surfaced>
**Mode:** Convergent / Divergent

### Step 2: <step name>
...

(continued for each step worked)

---

## Visual Models In Play

When a visual model gets used in this session, embed it here as markdown.

### <Model name> — for <which step>

<table | matrix | tree as markdown>

---

## Steel-Manned Dissent

Strongest opposing view considered, and how it was handled.

- **The case against:** <strongest argument>
- **What would have to be true for it to be correct:** <conditions>
- **How it was handled:** <accepted | modified original | rejected>
- **Confidence in the rejection (if rejected):** <band>

---

## Closing

### Sanity check
- Does the result make intuitive sense? <yes / no / uncertain — explain>
- What would I expect to be true if this conclusion is right? Is that actually true?
  <answer>

### Decision / Conclusion
<what was decided or where things landed>

### Confidence band on the conclusion
<High | Medium | Low | Speculation> — <reasoning>

### Next steps
- <action>: <owner>, <by when>

### Open questions
<things unresolved that need future attention>

### Spaced revisit
- **Revisit on:** <YYYY-MM-DD>
- **Why:** <what we expect to know by then>
- **Trigger:** <what event or signal should prompt earlier revisit>
```

## What must never be lost when updating the canvas

When updating the canvas mid-session, **preserve these things in their original form**:

- **Emotional charge** — *"I'm dreading X"*. Never paraphrase to *"concerns about X."*
- **Uncertainty markers** — *"I'm 60% confident."* Don't drop the percentage.
- **The original wording** — the operator's, or the source's — where it carried specific
  meaning. If the operator calls it *"the conduit problem,"* keep that phrase, don't
  translate to *"the routing issue."*
- **Tacit reasoning** — *"I just have a bad feeling about this."* Capture it as written.
  Don't translate to *"the operator has identified risk factors."*
- **Connective tissue** — *why* a constraint matters, not just *that* it does. Keep the
  reasoning, not just the conclusion.

## Canvas update rules

1. **Update the packet; append the archive.** If an archived fact later turns out to be wrong,
   mark it `dismissed` with a note rather than deleting provenance. Replace it in the active packet
   with the current supported state.
2. **Status tags are open vocabulary.** Common ones: `open`, `tested`, `confirmed`,
   `dismissed`, `deferred`, `revisit`. Use whatever fits.
3. **Confidence bands are required** on every fact, finding, and conclusion.
   `High / Medium / Low / Speculation`. Don't ship a claim without a band.
4. **Mode tags on each step** — note whether a step's work was Convergent or Divergent.
   Helps later when reviewing whether divergence was sufficient.
5. **Surfaced-at field** — when a fact, assumption, or insight is captured, note which
   step or input surfaced it. Provenance matters for revisits.
6. **Visual models embed inline.** When a 2×2 or matrix gets built, paste it as markdown
   into the "Visual Models In Play" section, not just into chat.
7. **Repeated attempts get ledger rows.** After two materially identical, non-informative
   cycles, pause that route, classify the pair, and audit through `loop-escape`; this is not a
   universal task limit. Preserve a valid replication's prediction, independence rationale,
   bounded repeat count, and stop rule.

## How the canvas relates to chat

- **Chat is the conversation.** Brief, in-the-moment, responsive.
- **Active packet is the current map.** Compact, typed, and updated when evidence changes.
- **Archive is the territory record.** Lossless, append-oriented, and navigable later.

Do not replace the archive with a summary or treat the summary as raw evidence. If the operator
asks "where are we?", return the active packet or a checkpoint card with exact archive pointers.

## Resolution toggle

Any topic can be asked for at three resolutions:

- **Headline** — one sentence summary of where things stand on that topic
- **Structured** — checkpoint-card density: a paragraph with key points
- **Full** — the canvas section, uncompressed

Default at transitions: structured. The full version is always one click away (just open
the canvas file).

## Closing the canvas

At session end, the canvas is finalized by:

1. Adding the closing sections (sanity check, decision, confidence, next steps, open
   questions, spaced revisit)
2. Tagging final status on all open assumptions and questions
3. (Optional) Generating a separate executive summary document if formal deliverable
   is needed — but the canvas itself is the durable artifact.

The canvas lives. The operator revisits it; future sessions on related topics start by
reading the relevant prior canvases — that's how knowledge compounds across sessions.
