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

## Backlog

## To-Do

## Active

## Done
```

### Columns (the Kanban flow)

The four sections are a left-to-right flow — read them to know the state of the work:

- **Backlog** — captured but not committed yet (someday / maybe / not now).
- **To-Do** — queued and ready; *what to pick up next*.
- **Active** — being worked on *right now* (keep this short).
- **Done** — completed; recent history, cleared after a while.

Move a task rightward as it progresses. A task can't enter **Active** while it still has an
unfinished prerequisite (see IDs & prerequisites below).

### Task format

- `- [ ] **Task title** - context, for whom, due date #a3f`
- Sub-bullets (indented `- [ ]`) for subtasks
- Completed: `- [x] **Task** - ... (done YYYY-MM-DD) #a3f`

The dashboard parses `## Section` headings into columns and `- [ ] **Bold**` into cards, so
keep titles bold and one task per line. Keep the `#id` LAST on the line.

### IDs & prerequisites

- **Every task has a short id** — a random base-36 tag like `#a3f` at the end of the line.
  It's assigned automatically (the dashboard backfills any task missing one). When you
  create a task, append a fresh `#xxx` that isn't already used in the file.
- **Prerequisites** go in `(needs #b2c, #d4e)` just before the id:
  `- [ ] **Deploy to prod** #a3f (needs #b2c, #d4e)`. A task whose prerequisites aren't all
  done is **blocked** — the board shows a 🔒 badge and refuses to move it into Active until
  they're checked off. This is how "waiting on" works now: a task waits on whatever it
  depends on, anywhere on the board (no dedicated column needed).
- **When creating a task that depends on others:** if those prerequisite tasks don't exist
  yet, create them first (each gets an id), then reference their ids in the new task's
  `(needs …)`. Link by id, not by title.

## How to interact

**"What's on my plate" / "my tasks":** read `.tasks/TASKS.md`, summarize Active and To-Do,
and **lead with anything overdue or due today** before the rest.

**"Add a task" / "remind me to":** add to To-Do as `- [ ] **Task** … #id` with a fresh id
and context (who it's for, due date). If it depends on other tasks, add `(needs #…)` —
creating any missing prerequisite tasks first so you can reference their ids. Move it to
Active when work actually starts.

**"Done with X" / "finished X":** find it, flip `[ ]`→`[x]`, append `(done YYYY-MM-DD)`,
move to Done.

**"What's next" / "my queue":** read To-Do (queued-up work) and surface the next items to
pull into Active. Park not-now ideas in Backlog.

## Conventions

- **Bold** the task title for scannability.
- Include `for [person]` when it's a commitment to someone.
- Include `due [date]` for deadlines and `since [date]` to track how long something's parked.
- Sub-bullets for extra context.
- Keep Done for ~1 week, then clear old items (or let `/tasks-update` triage them).

## Surfacing what matters (light prioritization)

When asked what to focus on, don't just dump the list — triage it:

- **Overdue** (due date in the past) and **due today** come first.
- **Commitments to others** (`for [person]`) outrank private todos at equal urgency.
- Flag tasks sitting in Active 30+ days with no movement — they're candidates to drop,
  defer to Backlog, or break down.

When the user is overloaded or stuck choosing, hand off to the `personal-productivity`
skill (finite-attention frameworks) rather than just reordering the list. For breaking a
fuzzy task into a demoable next step, use `iterative-plan`.

## Extracting tasks

When summarizing meetings or threads, offer to add extracted items — commitments the user
made ("I'll send that over"), action items assigned to them, follow-ups. **Ask before
adding; never auto-add without confirmation.**
