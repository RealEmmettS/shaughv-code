# Chunk Types

A *chunk* is a compact unit of information or a specific sub-skill that builds toward
proficiency in a subject. Five types of chunks, each handled differently.

This reference is faithful to the user's Mental Toolbox source (Meta-Learning Research
section). Used during Kickoff (building the syllabus) and Sessions (categorizing what
gets surfaced).

## Why distinguish chunk types

Different chunk types call for different methods:

- A **fact** needs memorization (Anki, flashcards).
- A **concept** needs explanation and application (teach-back, examples).
- A **procedure** needs rehearsal (drilling, repetition).
- A **method** needs trial-and-comparison (try it, compare to alternatives).
- A **confusion** needs decomposition (break down into smaller chunks).

Mixing methods to chunk types is one of the most common reasons learning stalls. The
agent's job during chunk identification is to **tag the chunk by type** so the
appropriate method gets matched.

---

## 1. Confusion Signals

**What it is:** A new idea you don't understand yet. Anything challenging at first
glance.

**Why this is a chunk type:** Confusion is data. It means you've encountered something
above your current understanding. Recording it, instead of skipping past it, turns it
into a learning target.

### Example

> *"I've come across the concept of Color Theory, but I don't really understand it
> enough to use it when I'm painting. I need to break it down and understand the
> smaller concepts, like combining colors, color temperature, complementary colors,
> etc."*

The confusion signals "Color Theory" as a chunk that needs decomposition.

### How to handle confusion signals

1. **Record the confusion as-is.** Don't paraphrase to make it sound less confused —
   the exact wording captures the texture of the misunderstanding.
2. **Decompose.** Most confusions are aggregates of smaller chunks. *"Color Theory"*
   breaks into hue, saturation, value, complementary pairs, color temperature, etc.
3. **Add the decomposed chunks to the syllabus** as Facts, Concepts, Procedures, or
   Methods.
4. **Mark the original confusion as resolved when** the smaller chunks are understood.

> Don't try to resolve confusion directly. Decompose first. The resolution emerges
> from understanding the components.

---

## 2. Facts

**What it is:** Atomic pieces of information that can be proved true and need to be
memorized.

### Example

> *"Red, Yellow, Blue (RYB) are one set of primary colors. Red, Green, Blue (RGB), and
> Cyan, Magenta, Yellow (CMY) are also sets of colors that create an array of colors."*

Three facts. Discrete. Can be looked up. Needs memorization for fluent use.

### How to handle facts

- **Memorization tools:** flashcards, Anki, mnemonics. See
  `references/encoding-hierarchy.md`.
- **Spaced repetition** is high-yield for facts. The forgetting curve is steep for
  isolated facts.
- **Group related facts** into chunks. Three primary color systems is one chunk, not
  three separate facts.

### Pitfall

Treating concepts as facts. Facts answer *what is*. Concepts require explanation and
application. If a "fact" requires interpretation, it's actually a concept (see below).

### When facts dominate the syllabus

For domains heavy in terminology (medicine, law, languages, anatomy, music theory),
facts dominate early-stage learning. Anki is the right tool. Sessions should include
fact review as a regular phase.

---

## 3. Concepts

**What it is:** Abstract ideas that you need to be aware of, able to explain with
sufficient detail, and apply to various contexts.

### Example

> *"Complementary colors are pairs of colors that are particularly pleasant to look at
> together. Both colors in the pair enhance the intensity of the other by providing a
> high level of contrast."*

That's a concept. It has structure (pairs, contrast, enhancement), can be applied
(picking colors for a design), and requires explanation rather than just recall.

### How to handle concepts

- **Teach-back test.** Can you explain the concept to someone who doesn't know it,
  in your own words, with an example? If not, you don't have it yet.
- **Multiple examples.** A concept understood from one example is brittle. Find or
  construct 3+ examples to test the concept's edges.
- **Apply in unfamiliar contexts.** A concept that only works in the context where you
  learned it isn't a concept yet — it's a memorized example.

### The three tests for a concept

1. **Awareness** — you know the concept exists and what it's roughly about.
2. **Explanation** — you can describe it in your own words to someone who doesn't
   know it.
3. **Application** — you can use it correctly in a new context.

A concept is "yours" only when all three tests pass.

### Pitfall

Stopping at awareness. Most users know about more concepts than they can explain, and
can explain more concepts than they can apply. The Dunning-Kruger Amateur peak comes
from confusing awareness with mastery.

---

## 4. Procedures

**What it is:** An action or series of actions that must be rehearsed and honed.

### Example

> *"Mixing colors to create different tones and colors is something that takes practice
> to improve at. It involves a series of steps and decisions about which colors to use,
> and how much of each color to use."*

Mixing colors is a procedure. It has steps, requires judgment at each step, and
improves with practice.

### How to handle procedures

- **Rehearsal-based practice.** See the drill methods in
  `references/learning-loop-session.md` Phase 3.
- **Process feedback** is more valuable than outcome feedback. See
  `references/feedback-types.md`.
- **Slow before fast.** For muscle-memory procedures especially, accuracy first;
  speed second.
- **Spaced rehearsal.** Procedures degrade without use. Schedule periodic re-runs.

### Pitfall

Treating procedures as concepts. Reading about how to throw a baseball is not learning
to throw a baseball. The agent should push back when the user is studying a procedure
without practicing it.

---

## 5. Methods

**What it is:** How skills are practiced or subjects are studied. Different methods
suit different goals; being aware of multiple methods helps find what works for you.

### Example

> *"To practice color theory, some artists use a method called 'color swatching,' where
> they create small squares of mixed colors to study how different hues, tones, and
> complementary pairs interact. Another method is 'limited palette painting,' where
> they use only a few colors to mix every shade in a painting."*

Color swatching is a method. Limited palette painting is another method. Both target
the same skill (color theory) with different practice approaches.

### How to handle methods

- **Try multiple, then choose.** No method works for everyone. The user should sample
  several and pick what produces the best results for them.
- **Method evaluation is a Weekly Review job.** Methods that worked don't always keep
  working. See `references/weekly-review-session.md`.
- **Methods evolve with proficiency level.** What works at Novice differs from what
  works at Proficient. See `references/proficiency-levels.md`.

### When to swap methods

- Plateau lasting more than 2–3 weeks
- Stagnant journal entries (same chunks listed week after week without progress)
- Frustration without clear cause
- Proficiency level transition (e.g., crossing into Intermediate)

---

## How chunk types appear in the journal

In the syllabus / chunk library, organize by type:

```markdown
### Confusion signals
- [open] Modal interchange — don't understand when to use it
- [resolved 2026-04-15] Diminished chords — broke down into types

### Facts
- [x] Major scale intervals: WWHWWWH
- [ ] Circle of fifths order

### Concepts
- [explained] Functional harmony
- [in progress] Modal interchange — can recognize, can't apply yet

### Procedures
- [in progress] Voice leading between chords
- [ ] Modulation through pivot chords

### Methods
- [working] Daily 15-min Anki + 30-min keyboard practice
- [trying] Transcribing one chord progression per session
- [dropped] Reading theory textbook front-to-back — too dense
```

This structure makes the syllabus a navigable map of *what* is being learned and *how
it's being approached*.

---

## During a session, tag new chunks as they appear

When the user surfaces a new chunk during practice:

1. **Ask the type.** *"Is this a fact (memorize), concept (explain & apply), procedure
   (rehearse), method (try out), or confusion (decompose)?"*
2. **Tag it on the journal** with type and status.
3. **Match the next-step method** to the type:
   - Fact → flashcard / Anki
   - Concept → teach-back exercise
   - Procedure → drill
   - Method → schedule a trial session
   - Confusion → decompose into smaller chunks

The tagging takes seconds; mismatched methods waste hours.

---

## Pitfalls

- **Over-tagging.** Not every observation needs a tag. Reserve typing for chunks you
  intend to actually work on.
- **Wrong type.** A chunk's type can shift as understanding deepens. *"Modal
  interchange"* might start as a confusion, become a concept, and eventually need to
  be paired with a procedure (using it in a composition). Re-tag as understanding
  evolves.
- **Treating methods as fixed.** What worked yesterday may not work today. Methods
  are themselves chunks to be evaluated and adjusted.
