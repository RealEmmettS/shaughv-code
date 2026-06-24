# Learning Journal

The Learning Journal is the durable artifact of every `/learn` session. It outlives any
single conversation. Sessions update the journal; the journal accumulates knowledge,
patterns, and progress over time.

This is the analog of `/critical-thinking`'s working canvas — same lossless append-only
discipline, structured for the rhythm of learning rather than analytical thinking.

## The principle

A learning journal is more than note-taking. It's a **meta-cognitive practice** —
being aware of, regulating, and understanding your own thought process. Meta-cognition
is what turns hours of practice into actual learning. Without it, the same hours
produce shallow repetition.

## How the journal lives

Three modes for journal handling:

- **Inline mode (default)** — the agent creates and updates the journal as a markdown
  artifact in the conversation. The user copies, saves, or manages it as they prefer.
- **Filesystem mode** — when the agent has filesystem access and the user has named a
  path, the agent reads/updates the file directly.
- **Uploaded-journal mode** — the user uploads their existing journal at session start;
  the agent reads it, updates it, and presents the updated version back as a markdown
  artifact in the conversation.

In all modes, **the user owns the journal**. The agent is a steward, not the author.

## The journal is append-only

New entries don't overwrite old ones. Earlier session entries, earlier reviews, earlier
versions of the goal — all stay visible. When chunks change status (e.g., from "in
progress" to "done"), the new status is appended with a date, not replacing the old
record.

This matters because:

- Patterns become visible only across multiple sessions
- Earlier confusions are valuable signals when revisited
- The Dunning-Kruger curve is only legible in retrospect
- Goal evolution is itself important information

## Journal template

```markdown
# Learning Journal: <topic>

**Started:** <YYYY-MM-DD>
**Current proficiency level:** <Aware / Novice / Amateur / Intermediate / Proficient / Competitive / Expert>
**Notebook medium:** <Inline (this file) | Physical | Digital + path>

---

## Goal

### Current compiled goal
<the present-tense, positive-language goal from Goal Setting Step 10.4>

### Target performance level
<level + reasoning>

### Implementation Intentions
<when, where, how the user practices — Step 10.3>

### Goal history
- <YYYY-MM-DD> — Original: <text>
- <YYYY-MM-DD> — Refined to: <text> — Reason: <what changed>

---

## Syllabus / Chunk Library

### Confusion signals
- [open] <description>
- [resolved <date>] <description> — note: <how it resolved>

### Facts
- [ ] <fact>
- [x] <fact> — encoded <date>

### Concepts
- [ ] <concept>
- [in progress] <concept> — last touched <date>
- [x] <concept> — taught back successfully <date>

### Procedures
- [ ] <procedure>
- [in progress] <procedure> — current accuracy: <description>
- [x] <procedure> — fluent <date>

### Methods
- [trying] <method> — first session <date>
- [working] <method> — adopted <date>
- [dropped] <method> — date — reason

### Concept map
<ASCII diagram or list of node-edge relationships if relevant; see
references/visual-models/structure.md from /critical-thinking>

---

## Session Entries

### Session: <YYYY-MM-DD> — <topic of session>

**Time budget:** <minutes>
**Chunk(s) worked on:** <list>
**Goal for session:** <what user set>
**Mode used:** <Facilitate / Coach / Spar / Recall>

#### Before Learning
- **Plan:** <what specific chunks; what user hopes to do>
- **What I already know:** <prior knowledge brought into the session>
- **Questions / predictions:** <what the user wonders, what they expect to learn>

#### During Learning
- **Notes / observations:** <captured during practice>
- **Why is this true? How does it connect?** <user's own challenge questions>
- **Challenges faced:** <difficult parts>
- **Key insights:** <what surfaced>
- **New chunks discovered:** <to add to library>

#### After Learning
- **Closed-book recall (key points):** <user's summary from memory>
- **What I missed in recall:** <gaps surfaced when comparing to notes/source>
- **Connections to prior knowledge:** <how this fits>
- **Quiz for future self:** <questions written without answers>
- **Methods reflection:** <what worked, what didn't, what to try next>
- **How I feel:** <user's words; emotional check>
- **Goal met?** <yes/no, why>
- **Plan for next session:** <chunk + approach + when>

---

### Session: <YYYY-MM-DD> — ...
(continued for each session)

---

## Weekly Reviews

### Weekly Review: <YYYY-MM-DD>

**Period reviewed:** <start> to <end>

#### Sessions this period
- <date>: <chunk> — <result>

#### Patterns surfaced
- <pattern>

#### Pace check
- <on pace / behind / ahead> — <reasoning>
- Goal still right? <yes / refined to: ...>

#### Friction diagnosed
- <what's slowing progress>

#### Method adjustments
- Continuing: <list>
- Trying: <list>
- Dropping: <list>

#### Plan for next period
- Chunks: <list>
- Sessions: <count, schedule>
- Spaced reviews due: <list>

---

## Course-Correction Notes

Used when the user re-assesses methods, scope, or proficiency level outside the regular
weekly review.

### <YYYY-MM-DD> — <what changed>
- **Trigger:** <what prompted the re-assessment>
- **Re-assessed level:** <if changed>
- **Method swap:** <old → new>
- **Goal revision:** <if any>
- **Reasoning:** <why>

---

## Spaced Repetition Schedule

Material to review on a schedule (separate from active practice).

| Chunk | Last reviewed | Next review | Difficulty |
|---|---|---|---|
| <name> | YYYY-MM-DD | YYYY-MM-DD | Easy / Medium / Hard |

Standard intervals (Anki-like):
- New material: review same day
- Then: 1 day, 3 days, 1 week, 2 weeks, 1 month, 2 months
- Difficult material: shorten intervals
- Easy material: extend intervals
```

---

## The journaling rhythm (Before / During / After)

For Session sessions, the journaling questions follow a three-phase rhythm. Use these
exact questions; don't paraphrase.

### Before Learning

**1.1.** Plan your goals for the learning session. What specific chunks are you
focusing on? What do you hope to be able to do during the session?

**1.2.** Before diving into new territory, what do you already know? Writing down what
you already know about a subject or topic primes your mind to connect the new
information with what you already know.

**1.3.** Write down the questions you have and make predictions about what you'll learn
next.

> The "predictions" sub-question is underused but powerful. Predictions create a
> learning trap that captures attention — once you've predicted, you're motivated to
> find out if you were right.

### During Learning

**2.1.** Take notes. Draw diagrams. Record what you are taking in while practicing or
studying.

**2.2.** As you learn, challenge yourself with questions like *"Why is this true?"* and
*"How does this relate to what I already know?"* to deepen your understanding.

**2.3.** Record the challenges you are facing. What is the most difficult part of this
new sub-skill or new subject?

**2.4.** Take note of the key insights you make. How did learning this key component
help you better see or interact with the larger subject or skill?

**2.5.** Make a quick note of any new concepts, facts, or procedures you discover to
explore them more later.

### After Learning

**3.1. Reflect on what you learned.** Put away your notes and summarize the key points
of what you learned in a few short bullet points from memory. Alternatively, explain
how the sub-skill or concept works. Then, review your notes and mark the areas you
didn't mention or couldn't explain.

> This is the **active recall summary** move. The gap between what you can recall and
> what's in the notes is the data.

**3.2.** Identify connections between what you've learned and what you already know.
How does this component fit into the larger puzzle of the subject or topic?

**3.3. Create a quiz for your future self.** Write down a few questions without
answers in an easy-to-see spot. As you review your journal, try to answer these
questions to help retain what you've learned long-term.

**3.4. Reflect on the methods and activities you used for learning.** What worked
well? What didn't? How can you apply this going forward?

**3.5. How do you feel after taking the time to learn?** How did it feel when you
faced confusion and challenges? Be easy on yourself. The most difficult part of
learning happens when you have unrealistic expectations for yourself. Simply starting
to learn and dedicating time is enough right now.

**3.6. Did you meet the goal that you had set for this session?**
- If yes: reflect on how it feels to have set and achieved a goal.
- If no: reflect on whether it was more complicated than envisioned, or other factors
  that made it difficult to reach.
- Whether or not you met your goal, taking time to focus on your learning is enough.

**3.7.** What is your plan for your next learning session? What questions do you still
have to answer? What chunks do you still have to learn?

---

## Choosing a journal medium

The user chooses one. The agent honors the choice.

### Physical notebook

- **Pros:** handwriting enhances retention; allows doodling and diagrams; helps slow
  down and think more thoroughly.
- **Cons:** harder to search; harder to share with the agent.
- **When best:** for skills where slowing down to think matters more than speed
  (philosophy, writing, design).

### Digital notetaking app

- **Pros:** portable; saves links; templates; automatic timestamps.
- **Cons:** distractions (other tabs/apps); feels less deliberate.
- **When best:** for digital topics where copy-paste matters; when on-the-go capture
  is needed.

### Hybrid

Many users do this — physical for deep thinking, digital for capture. The agent should
support both. When the user does hybrid, ask which one is the source of truth for any
given session.

### Inline (this conversation)

The default for `/learn` sessions. The agent maintains the journal as a markdown
artifact within the conversation. The user copies it to wherever they keep it.

---

## Regular review

The journal isn't useful if it's never re-read. Three review cadences:

- **End of session** — re-read just-captured After-Learning section. Is the
  closed-book summary actually accurate? Are the quiz questions answerable?
- **End of week (Weekly Review)** — re-read all session entries. See
  `references/weekly-review-session.md`.
- **End of month / phase** — re-read the goal, syllabus evolution, and chunk library
  status. Bigger-picture pattern recognition.

> Without regular review, the journal becomes a write-only artifact. Schedule the
> review explicitly in the Implementation Intentions.

---

## Reductionism guard for the journal

When updating the journal, never throw away:

- The user's exact wording for chunks ("modal interchange" not "key changes")
- Confusion signals — even when resolved, keep the original confusion as a record
- Emotional charge ("I hate this part" / "this finally clicked")
- Uncertainty markers ("I sort of get it but couldn't explain")
- The "feeling" question (Step 3.5) — these accumulate into a pattern over weeks

Compressed paraphrase is a reductionist mistake. The journal is the lossless artifact
for the user's learning journey.

---

## How journals compose

A user can have many journals — one per learning topic. Strategy, harmonic theory,
Spanish, chess, etc. Each is independent.

When the user invokes `/learn` for an existing topic, they should attach (or reference)
the relevant journal. The agent reads that journal, not all of them.

If the user attaches multiple journals or refers to multiple topics in one session,
the agent should clarify which one is the focus.
