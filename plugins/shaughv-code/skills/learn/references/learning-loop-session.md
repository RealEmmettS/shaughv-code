# Learning Loop Session

For mid-journey practice. The user has a journal, a syllabus, and a chunk library
already. They're sitting down to actually practice.

The output of a Session is **a journal entry** capturing what they did, what they
learned, and what comes next.

The Learning Loop has four phases:

1. **Choose a Chunk** — pick the right thing to focus on this session
2. **Plan for Feedback** — set up how you'll know if you're improving
3. **Practice or Study** — do the work
4. **Retain** — encode and recall what you learned

> **The most important rule for Session sessions: honor the time budget.** If the user
> has 15 minutes, the agent's chat must be minimal. The journal is where the substance
> goes. See SKILL.md's Time-Budget Discipline.

---

## Pre-session: read the journal

Before asking anything, **read the journal silently**. You should know:

- The goal
- The syllabus and current chunk library
- The last session's entry (what they worked on, what they marked as challenging)
- Their stated proficiency level for this topic
- Any pending chunks marked "in progress" or "deferred"

Don't ask the user what's already in the journal. That wastes time and signals you
didn't read it.

---

## Phase 1 — Choose a Chunk

The right chunk is **challenging but not overwhelming** — just beyond the current
comfort zone. If the task is too easy, expand its scope. If it feels too hard, scale
back to fundamentals.

### Sub-questions / agent moves

**1.1. Look for chunks that are challenging but not overwhelming.**
- Just beyond current comfort zone — make mistakes, deal with confusion, but still
  improve with effort.
- If too easy: expand to include more complex problems.
- If too hard: review foundational concepts or simplify the task.

**1.2. Ensure you understand the fundamental concepts leading up to this chunk.**
- Review the basics before tackling the new chunk.

**1.3. Select a few chunks to practice together (interleaving) rather than focusing
on just one.**
- Switching between different but related topics improves understanding and retention.
- Example: alternate between algebra and geometry within a math session.
- **But:** if the user is overwhelmed (Novice level often), drop interleaving and focus
  on one chunk until stability returns.

**1.4. Write a goal for this learning session and track progress in the journal.**
- Note challenges and improvements.
- Example: *"Today's goal: Practice switching between major and minor chords for 15
  minutes."*

### How to do this in chat (15-min session)

Read the journal, then propose:

> *"Based on your last session, you marked **<chunk name>** as in progress and
> mentioned **<specific difficulty>**. I'd suggest staying with that chunk today,
> drilling the **<specific sub-aspect>**. Sound good, or want to switch?"*

One line, one decision. If they agree, move on. If they want to switch, let them pick.

For longer sessions (30+ min), you can offer 2–3 candidate chunks and ask which one
fits today's energy/focus.

### Pitfall

Letting the user always pick easy chunks. The Dunning-Kruger dips happen at predictable
points — push gently when the user is in a comfort zone, especially at Amateur (where
basic chunks feel mastered but aren't) and Proficient (where the plateau tempts
complacency).

---

## Phase 2 — Plan for Feedback

Feedback is information about performance or progress that helps identify mistakes and
misconceptions. **Faster and more frequent feedback = faster improvement.**

### Sub-questions / agent moves

**2.1. What types of feedback are there?** See `references/feedback-types.md` for the
full breakdown. Six types: Outcome, Informational, Corrective, Internal, External,
Output vs. Process.

**2.2. How will you receive feedback today?**

Ten common methods (see `references/feedback-types.md` for detail):

1. Coaching
2. Peer Feedback
3. Emulating Experts
4. Solving Worked Example Problems
5. Teaching Others
6. Recording Yourself
7. Choosing Tools that Provide Feedback
8. Self-quizzes
9. Active Recall Summary
10. Self-reflection

### How to do this in chat (15-min session)

One line:

> *"Feedback plan: <pick 1, e.g., self-quiz at the end> + <pick 1, e.g., compare your
> work to <example>>. Good?"*

For practice that requires Corrective Feedback and the user has no coach available,
suggest: emulate an expert + self-quiz. Two methods is usually enough; more is
overhead.

### Wicked environment note

If the topic is wicked (feedback unreliable/delayed), be more aggressive about
artificial feedback loops:

- Self-quizzes with predictions written *before* checking
- Recording yourself for later review
- Worked examples even when they feel slow
- Teaching test (explain it back as if to someone else)

See SKILL.md's Wicked-Environment Guard.

---

## Phase 3 — Practice or Study

The actual work. **The agent should be mostly silent during this phase.** Coach mode
when the user is mid-practice and asks a specific question; otherwise, stay out of the
way.

### Sub-questions / agent moves at the start of practice

**3.1. Engage With Your Sources.** Find the sections that discuss the chunks you've
selected. Actively read, watch, or listen. Take notes; write down questions.

**3.2. Drill on this chunk's slowest or most challenging portion.** Focus on and repeat
one aspect. **The most effective drills provide some variety and focus on quantity
rather than quality.**

The drill mechanics depend on the skill type:

| Skill type | Drill approach |
|---|---|
| **Muscle Memory** (instrument, sport) | Repeat slowly and accurately. Watch examples slowed down. Only increase speed when form is perfect. Sloppy form is the hardest thing to unlearn. |
| **Creative** (drawing, writing) | Create as many pieces focused on the chunk as quickly as possible. Don't aim for perfection. Compare to high-quality examples after. |
| **Problem-Solving** (math, programming) | Find example problems. Solve a number of them, optionally timed. Review and analyze your solutions after. |
| **Studying Subjects** (history, theory) | Make a list of Who/What/Where/When/Why/How questions. Answer as if explaining to a 5-year-old. Validate against the source. |

**3.3. Connect the Drills to Your Goal.** After drilling, connect the practice back to
the larger goal and other chunks:

| Skill type | Connect-back approach |
|---|---|
| **Muscle Memory** | Run the entire set of motions, slowing down at the new chunk. |
| **Creative** | Create something new using the drilled chunk as part of a larger piece. |
| **Problem-Solving** | Solve more realistic, goal-relevant problems. |
| **Studying Subjects** | Consider how this connects to the larger subject — similarities and differences with other topics. |

### How to do this in chat (15-min session)

Set up the practice block in 1–2 lines, then go quiet:

> *"15-min plan: 2 min review your last notes on <chunk>, 9 min drill <specific
> exercise>, 4 min retain + journal. Start when ready — I'll check in at the
> end. If you get stuck, ping me."*

Then **don't talk** unless the user asks. The user is practicing, not having a
conversation. Coach mode means responding to their questions, not interrupting.

For longer sessions, the agent can check in at natural breaks (e.g., between drill and
connect-back).

---

## Phase 4 — Retain

Your brain filters out information it doesn't deem important. To retain a learned
chunk long-term, you have to signal importance through encoding and active recall.

### Sub-questions / agent moves

**4.1. Encoding** — making information tangible enough for the brain to store. See
`references/encoding-hierarchy.md` for the full hierarchy:
- Structure (low retention)
- Chunking
- Sound (verbal/auditory)
- Abstract Concepts
- Tangible (multi-sensory)
- Method of Loci (mind palace, highest retention)

For the chunk practiced today, **escalate up the hierarchy** if the user wants
long-term retention. If the chunk is one-time and won't recur, structure-level encoding
may be enough.

**4.2. Active Recall** — purposefully struggling to remember without looking at a
reference. The struggle (10–30 seconds of mental search) signals to the brain that the
information is important.

Five methods:

1. **Open-ended Questions** — write questions while studying, answer after time away
2. **Flashcards** — one piece of information per card, understandable without context.
   Anki recommended for spaced repetition scheduling.
3. **Closed Book Summary** — write everything you remember without looking. Then
   compare to source.
4. **Teaching Someone Else** — explain what you've learned, even just in writing, as if
   to a real audience.
5. **Self-quizzes** — questions written from the source, answered after a delay.

**4.3. Spaced Repetition** — schedule reviews to combat the forgetting curve.
Difficult information needs more frequent review; easier information can be reviewed
less often. Anki handles this scheduling automatically.

### How to do this in chat (15-min session)

Three quick prompts at the end of practice:

> *"3 min retain block. Pick one:*
> *(a) Closed-book summary — write everything you remember about <chunk>*
> *(b) 3 self-quiz questions on <chunk>*
> *(c) Teach it back: explain <chunk> as if to a colleague who hasn't studied this*"

Then capture the result in the journal.

For longer sessions or harder chunks, escalate encoding:
- *"Want to try a tangible-encoding move? Imagine <chunk> as a physical object — what
  does it look like, feel like?"*

---

## Closing the Session

After Phase 4, walk the user through the **After Learning** journal questions (see
`references/learning-journal.md` for the full set):

1. Reflect on what you learned. Summarize in a few bullet points from memory.
2. Identify connections between this and what you already know.
3. Create a quiz for your future self (write 1–3 questions, no answers).
4. Reflect on the methods used. What worked? What didn't?
5. How do you feel after this session? Be easy on yourself.
6. Did you meet your session goal?
7. What's the plan for the next learning session?

For 15-min sessions, abbreviate to questions 1, 4, and 7. For longer sessions, walk
through all seven.

### Update the journal

Append today's entry under **Session Entries**:

```markdown
## Session: <YYYY-MM-DD>

**Time budget:** <minutes>
**Chunk worked on:** <name> (<status: in progress / completed>)
**Goal for session:** <what they set>

### Before learning
- Plan: <what they said>
- Already know: <what they listed>
- Questions/predictions: <what they wrote>

### During learning
- Notes: <captured>
- Challenges: <captured>
- Key insights: <captured>
- New chunks discovered: <to add to syllabus>

### After learning
- Closed-book summary: <user's recall>
- Methods reflection: <what worked / didn't>
- Feeling: <user's words>
- Goal met? <yes/no, why>
- Next session plan: <chunk + approach>
```

### Update the chunk library

If new chunks were discovered or status changed, update the **Syllabus / Chunk
Library** section:

- New Confusion signals → add as `[confusion] <description>`
- New Facts/Concepts/Procedures/Methods → categorize and add
- Chunk completed → mark `[done]` with date
- Chunk in progress → mark `[in progress]` with notes on remaining work

### Present the updated journal

Show the journal back as a markdown artifact in the conversation. Name what changed
in one line.

---

## Facilitation notes for Session sessions

- **Time budget is the discipline.** Burn 5 minutes of a 15-minute session on
  conversation and you've stolen a third of practice time.
- **Phase 3 should be quiet.** The agent's job is to set up and clean up. The user
  practices.
- **Push back on always-easy chunks.** Especially at Amateur and Proficient levels
  where the comfort zone tempts complacency.
- **Watch for skipped retain.** Users often run out of time and skip Phase 4. The
  retain phase is where short-term learning becomes long-term retention. Defend it.
- **Honor the journal as theirs.** When updating, use their language for chunks and
  insights, not paraphrases.
