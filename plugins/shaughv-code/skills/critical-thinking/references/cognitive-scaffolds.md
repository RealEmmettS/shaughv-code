# Cognitive Scaffolds

Tools for managing cognitive load during a critical thinking session. When the canvas
accumulates beyond what working memory can hold — yours, mid-task, or the operator's when
you're facilitating — reach for these scaffolds.

This material is drawn from the *Mental Toolbox* — the Learning chapter and Meta-Learning
Research sections — adapted for use on your own reasoning mid-task, and for live
facilitation.

## The principle

Reductionism is not the answer to overwhelm. Externalization (visual models) plus
cognitive scaffolds (chunks, analogies, encoding, active recall) are. The goal is not to
make the information smaller — it is to make the *handle* on the information bigger,
yours or the operator's.

---

## Chunking

When the canvas has accumulated more than ~5 facts, ~3 assumptions, or ~3 options,
**chunk** by grouping related items under a single named handle.

### How to chunk during a session

1. Identify items that pattern together — same source, same theme, same direction of
   pull.
2. Give the chunk a name short enough to use in conversation. In facilitation, use the
   operator's own vocabulary if possible; in self-check, use whatever term you'll
   actually reuse.
3. Reference the chunk by name in chat from then on. Keep the underlying items on the
   canvas, unchunked, for retrieval.

### Examples

- *"The three sycophancy claims"* (rather than restating: AI is 50% more agreeable than
  humans, AI-literate users overestimate performance, longer AI explanations boost
  confidence regardless of correctness)
- *"The cross-domain failure mode"* (rather than restating the colleague-building-a-data-
  system anecdote in detail every time)
- *"The Q2 launch priorities"* (rather than enumerating: the security audit, the
  dashboard rewrite, the May 11 deadline)

### When chunking goes wrong

A chunk that loses important detail when you reference it has compressed too far. If
*"the sycophancy claims"* gets used to mean *"AI agrees too much,"* the chunk has lost
the specific evidence it was supposed to package. Chunk names are pointers to the
canvas; they're not substitutes for it.

---

## The encoding hierarchy

From the Mental Toolbox: ways to make information stick, in order of effectiveness.

| Level | Effort | Retention | When to use |
|---|---|---|---|
| **Structure alone** | Low | Low | Default — but recognize it doesn't stick |
| **Chunking** | Low | Medium | When 5+ items accumulate |
| **Sound (verbal)** | Medium | Medium-High | When introducing new terminology, say it aloud yourself, or have the operator say it, in facilitation |
| **Abstract concept** | Medium | Medium-High | When the idea has structure but no obvious sensory hook |
| **Tangible (multi-sensory)** | Higher | High | When the idea is complex and needs to survive across sessions, yours or the operator's |
| **Method of Loci** | High | Very High | For multi-session retention of a complex framework — anchor each part to a physical location you know, or the operator knows, in facilitation |

### Practical move

When introducing a complex concept in a session, escalate up the hierarchy:

1. State it (structure)
2. Give it a name you can repeat — or the operator can, in facilitation (sound +
   chunking)
3. Connect it to a tangible image or scenario (tangible)
4. Optionally, anchor it to a place you know, or the operator knows in facilitation
   (Method of Loci), for multi-session retention

---

## Analogies

When introducing a complex idea, find an analogy to something already known — to you,
or to the operator you're facilitating. Analogies don't simplify the idea — they give a
known structure to map the new idea onto, which costs much less working memory than
learning the new structure from scratch.

### How to construct a useful analogy

1. **Find a similarity in structure**, not just surface. *"This decision is like a fork
   in the river"* is structural (irreversibility, branching). *"This decision is like a
   restaurant menu"* is surface (lots of options).
2. **Name the limit of the analogy.** Every analogy breaks somewhere. State where, so
   whoever's using it — you, or the operator — knows when to drop it.
3. **Use your domain knowledge, or the operator's.** A construction analogy works for
   someone in construction; a software analogy works for an engineer.

### Examples

- *"Output-competence decoupling is to professional work what auto-tune is to vocal
  performance: the output sounds like skill, but it isn't necessarily."* (Limit: auto-tune
  is honest about being a tool; AI-generated work often isn't.)
- *"This decision is a fork in a river, not a doorway."* (You can't easily walk back.
  Limit: rivers have only one direction; some decisions can be revised at cost.)
- *"The canvas is a kitchen prep station, not a recipe."* (Working state, not finished
  output.)

### When analogies go wrong

Watch for reasoning that has started to follow the analogy's structure rather than the
actual situation — yours, or the operator's, in facilitation. The analogy has been
accepted too literally. When that happens, drop the analogy and return to the situation
directly.

---

## Metaphors

When the *emotional* or *structural* quality of a thing matters more than its mechanics,
use a metaphor. Metaphors carry feeling and shape; analogies carry structure.

### Examples

- *"This project has been a rolling boil for three weeks."* (Sustained intensity, not
  just busy.)
- *"You're not at a crossroads — you're at the edge of a cliff with three rope bridges."*
  (The decisions are not equivalent in risk; one is much more dangerous.)
- *"This codebase feels like a house of cards right now."* (Structurally fragile, small
  things can collapse it.)

Metaphors are useful in **Contemplating** sessions especially — they let you, or the
operator you're facilitating, name felt experiences that resist analytical decomposition.

---

## Active Recall (opt-in)

The single most effective technique for retention. From the Mental Toolbox: actively
struggling to remember something, without looking, signals to the brain that the
information is important. This scaffold needs two roles — one posing the prompt, one
searching memory without peeking at the canvas. Facilitation only, not self-check.

### How to use during a session

At a checkpoint (operator-requested or at a major transition), offer:

> *"Before I show you the canvas, what do you remember as the key things we've
> established so far?"*

The operator accepts or skips. If they accept:

1. Wait for them to recall (10–30 seconds of mental search is the sweet spot).
2. Do not interrupt with hints.
3. Compare what they recalled to the canvas.
4. **The gap is the signal:**
   - Items they remembered easily are well-encoded.
   - Items they forgot are either unimportant (and can be deferred) or important but
     poorly encoded (and need a better chunk, analogy, or metaphor).

### When to skip active recall

- The operator explicitly declines.
- The session is short or moving fast.
- The operator is in distress (Contemplating mode, especially) — recall under emotional
  load produces frustration, not retention.

---

## Closed-book summary

A more demanding variant of active recall, used at session end.

> *"Without looking at the canvas, write a 5-bullet summary of what we decided and why."*

Then compare to the canvas. Anything missing is either:

- Genuinely unimportant (good — drop it)
- Important but not retained (revisit how it was framed and chunked)

This is one of the strongest signals for whether the session actually produced something
that's owned — by you, or by the operator — vs. something that lives in the canvas but
not in the head that needs it.

---

## Teaching test

> *"Could you explain this conclusion to a colleague who wasn't in this conversation?"*

If the answer is "no," we don't have a conclusion yet. We have an artifact that looks
like a conclusion. The teaching test is the strongest single check for whether
externalization succeeded — in self-check as much as in facilitation.

The variant (facilitation): *"Could you write a 3-sentence Slack message to <name>
explaining what we decided?"* — and then have them actually draft it. Watching them draft
surfaces gaps faster than asking abstractly.

---

## The five chunk types

From the *Meta-Learning Research* section, useful for tagging items on the canvas.

| Chunk type | What it is | Example |
|---|---|---|
| **Confusion signal** | New idea you don't understand yet | *"What does 'output-competence decoupling' mean exactly?"* |
| **Fact** | Atomic piece that can be proved true | *"Anthropic's content policy was updated 2025-09-15."* |
| **Concept** | Abstract idea you need to be aware of, explain, and apply | *"Steel-manning"* |
| **Procedure** | Sequence of actions that must be rehearsed | *"The 9-step weighted ranking protocol"* |
| **Method** | A way of practicing or studying | *"Pair-ranking criteria before evaluating items"* |

When the canvas accumulates lots of items, tag each by chunk type. Different types call
for different handling:

- **Confusion signals** → break down into smaller components, escalate encoding
- **Facts** → memorize via flashcard-like format if multi-session
- **Concepts** → explain in your own words; teach back
- **Procedures** → walk through step-by-step; practice
- **Methods** → name them; switch between them deliberately

---

## Spaced repetition (multi-session work)

When a session's conclusions need to persist across weeks or months, schedule revisits.

From the Mental Toolbox: the forgetting curve drops to ~21% retention after one month
without review. Each review pushes the curve up.

### Practical move at session close

Add to the canvas's "Spaced revisit" field:

- **First revisit:** within 1–3 days. Quick read of the canvas.
- **Second revisit:** within 1 week. Active recall summary.
- **Third revisit:** within 1 month. Teaching-test variant — explain to someone (or
  pretend to).
- **Triggered revisit:** when <specific event> happens — e.g., when the decision plays
  out, when the deadline hits, when the assumption gets tested.

This session can't enforce these — a future you, reopening the canvas, or the operator
does. But naming them on the canvas makes them more likely to happen.

---

## Concept maps (for relationships, not hierarchy)

When the surfaced ideas have non-hierarchical relationships — networks rather than trees
— a concept map is more useful than a list.

A concept map is just a node-and-edge diagram in markdown:

```
              Sycophancy
              /        \
       AI agrees     User overconfidence
            \           /
         Output-competence decoupling
              |
        Workplace slop
```

When a session's canvas section is dense with cross-references between items, suggest
externalizing as a concept map. See `references/visual-models/structure.md`.

---

## When to deploy which scaffold

| Symptom | Reach for |
|---|---|
| You notice — or the operator says — *"I'm losing the thread"* | Checkpoint card + active recall offer |
| Canvas has 5+ items in one section | Chunk them under a named handle |
| Introducing a complex new idea | Analogy from your domain, or the operator's |
| Emotional weight matters | Metaphor in your wording, or the operator's |
| Multi-session topic | Method of Loci anchor + spaced revisit schedule |
| You — or the operator — can't articulate the conclusion | Teaching test |
| Canvas is dense with cross-refs | Concept map |
| Decision was made but feels vague | Closed-book summary |
