---
name: tasks-management
description: >
  How Claude reads, writes, and reasons about the task list in `.tasks/TASKS.md`. Reference
  this whenever the user asks about their tasks, wants to add or complete tasks, asks
  "what's on my plate", "what am I waiting on", "what's due", or wants commitments tracked —
  inside a repo that uses the tasks-* system. Defines the TASKS.md format, the interaction
  verbs, and how to surface overdue / due-today / priority items. Set up by /tasks-start and
  kept current by /tasks-update.
user-invocable: false
---

# Task Management

Tasks live in **`.tasks/TASKS.md`** — a plain-markdown file both Claude and the user (and
the dashboard) read and write. The dashboard board/list views read and write this exact
file and auto-save.

## File location

**Always use `.tasks/TASKS.md` in the current working directory.** If `.tasks/` doesn't
exist yet, run `/tasks-start` first (it scaffolds the folder and the dashboard). If the
file is missing but `.tasks/` exists, create it from the template below.

## Format & template

A fresh `TASKS.md` (no example tasks):

```markdown
# Tasks

## Active

## Waiting On

## Someday

## Done
```

Task format:

- `- [ ] **Task title** - context, for whom, due date`
- Sub-bullets (indented `- [ ]`) for subtasks
- Completed: `- [x] **Task** - ... (done YYYY-MM-DD)`

The dashboard parses `## Section` headings into columns and `- [ ] **Bold**` into cards, so
keep titles bold and one task per line.

## How to interact

**"What's on my plate" / "my tasks":** read `.tasks/TASKS.md`, summarize Active and Waiting
On, and **lead with anything overdue or due today** before the rest.

**"Add a task" / "remind me to":** add to Active as `- [ ] **Task**` with context (who it's
for, due date) when provided.

**"Done with X" / "finished X":** find it, flip `[ ]`→`[x]`, append `(done YYYY-MM-DD)`,
move to Done.

**"What am I waiting on":** read Waiting On; note how long each has waited (`since DATE`).

## Conventions

- **Bold** the task title for scannability.
- Include `for [person]` when it's a commitment to someone.
- Include `due [date]` for deadlines and `since [date]` for waiting items.
- Sub-bullets for extra context.
- Keep Done for ~1 week, then clear old items (or let `/tasks-update` triage them).

## Surfacing what matters (light prioritization)

When asked what to focus on, don't just dump the list — triage it:

- **Overdue** (due date in the past) and **due today** come first.
- **Commitments to others** (`for [person]`) outrank private todos at equal urgency.
- Flag tasks sitting in Active 30+ days with no movement — they're candidates to drop,
  defer to Someday, or break down.

When the user is overloaded or stuck choosing, hand off to the `personal-productivity`
skill (finite-attention frameworks) rather than just reordering the list. For breaking a
fuzzy task into a demoable next step, use `iterative-plan`.

## Extracting tasks

When summarizing meetings or threads, offer to add extracted items — commitments the user
made ("I'll send that over"), action items assigned to them, follow-ups. **Ask before
adding; never auto-add without confirmation.**
