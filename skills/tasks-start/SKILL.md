---
name: tasks-start
description: >
  Initialize Emmett's task + workplace-memory system in the current repo or folder and
  open the SHAUGHV dashboard. Use whenever the user says /tasks-start, "set up my tasks",
  "start the task system", "set up task tracking", "bootstrap my memory", "set up the
  productivity system", or otherwise wants a place to track todos and teach Claude their
  people, projects, and shorthand. Creates a self-contained `.tasks/` folder (TASKS.md,
  CLAUDE.md working memory, memory/ deep store, and a branded dashboard.html) so nothing
  clutters the repo root, then optionally scans connected tools (Slack, Asana/Linear/Jira,
  Microsoft 365 / Google, Notion) to seed memory. Trigger even when the user doesn't say
  "tasks" but clearly wants to start tracking work or onboard Claude to their workplace
  language. Pairs with tasks-update, tasks-management, tasks-memory, and tasks-remove.
---

# /tasks-start

Stand up the task + memory system inside a single self-contained folder, then open the
dashboard. Everything the system owns lives under **`.tasks/`** in the current working
directory — nothing is scattered across the repo root.

## Why a dedicated folder

The whole system is contained in one place so it's obvious what belongs to it, easy to
point the dashboard at, and trivial to tear down later (see `/tasks-remove`). When the
user is done, `/tasks-remove` flattens the useful parts (working memory, deep memory) back
into the repo's own `CLAUDE.md` and `memory/` and deletes `.tasks/`.

```
.tasks/
  TASKS.md        ← the task list (board + list view)
  CLAUDE.md       ← working memory / hot cache (the dashboard's Memory tab reads this)
  memory/         ← deep memory
    glossary.md
    people/
    projects/
    context/
  dashboard.html  ← the SHAUGHV-branded UI, launched from here
```

> `.tasks/CLAUDE.md` is the task system's **private** working memory — distinct from any
> repo-root `CLAUDE.md`. Keeping it scoped means the system stays self-contained until the
> user explicitly promotes it with `/tasks-remove`.

## Instructions

### 1. Check what exists

Look in the current working directory for a `.tasks/` folder. If it exists, read
`.tasks/TASKS.md` and `.tasks/CLAUDE.md` + `.tasks/memory/` to load current state, then
skip to step 3 (just re-open the dashboard).

### 2. Create what's missing

Create the `.tasks/` folder and populate it:

- **`.tasks/TASKS.md`** — if absent, create with the standard template (see the
  `tasks-management` skill). 
- **`.tasks/dashboard.html`** — copy it from
  `${CLAUDE_PLUGIN_ROOT}/skills/tasks-start/assets/dashboard.html` into `.tasks/`.
- **`.tasks/CLAUDE.md` + `.tasks/memory/`** — if absent, this is a fresh setup. After
  opening the dashboard, run the memory bootstrap in step 5.

Use `.tasks/.gitignore` judgment: by default the system is local scaffolding. If the user
wants the task list and memory committed, leave it tracked; if they want it ephemeral, add
a `.tasks/` line to the repo's `.gitignore`. Ask once if it isn't obvious.

### 3. Open the dashboard

Do **not** use `open`/`xdg-open` — in Cowork the agent runs in a VM and shell open commands
won't reach the user's browser. Instead tell the user:

> Dashboard is ready at `.tasks/dashboard.html`. Open it from your file browser. In the
> dashboard, choose **Select TASKS.md** → `.tasks/TASKS.md`, and **Select Folder** →
> `.tasks/` for the Memory tab. It has a light (vintage) / dark (brutalist) theme toggle in
> the top-right.

### 4. Orient the user

If everything was already initialized:

```
Task system loaded from .tasks/. Tasks and memory are both live.
- /tasks-update           sync tasks, triage stale items, fill memory gaps
- /tasks-update --comprehensive   deep scan chat/email/calendar/docs for missed todos
- /tasks-remove           decommission and fold memory back into the repo
```

If memory hasn't been bootstrapped, continue to step 5.

### 5. Bootstrap memory (first run only)

Only if `.tasks/CLAUDE.md` and `.tasks/memory/` didn't exist. The best source of workplace
language is the user's real task list — real tasks carry real shorthand.

**Ask the user:**

```
Where do you keep your todos? A local file, or an app (Asana, Linear, Jira, Notion,
Todoist)? I'll use your tasks to learn your workplace shorthand.
```

**Once you have the list**, analyze each item for shorthand — names that might be
nicknames, acronyms/abbreviations, project references or codenames, internal jargon — and
decode interactively:

```
Task: "Send PSR to Todd re: Phoenix blockers"

A few terms I want to get right:
1. PSR    — what does this stand for?
2. Todd   — who is Todd? (full name, role)
3. Phoenix — project codename? what's it about?
```

Only ask about terms you haven't already decoded. See `tasks-memory` for the full model.

### 6. Optional comprehensive scan

After decoding the task list, offer:

```
Want me to scan your messages, email, calendar, and docs to build richer context about the
people, projects, and terms in your work? Takes longer, but the memory is much deeper.
```

If yes, gather from connected tools — chat (Slack), email/calendar (Microsoft 365 /
Google), docs (Notion / Drive), project tracker (Asana / Linear / Jira). Present findings
grouped by confidence: **Ready to add** (offer to add directly), **Needs clarification**
(ask), **Low frequency** (note for later).

### 7. Write memory files

From everything gathered, write into `.tasks/` (formats in `tasks-memory`):

- **`.tasks/CLAUDE.md`** — working memory (~50–80 lines): Me, People, Terms, Projects,
  Preferences.
- **`.tasks/memory/glossary.md`** — the full decoder ring.
- **`.tasks/memory/people/{name}.md`**, **`projects/{name}.md`**, **`context/company.md`**.

Name memory files in kebab-case (`todd-martinez.md`, `project-phoenix.md`) per Emmett's
naming conventions.

### 8. Report

```
Task system ready in .tasks/:
- Tasks:  .tasks/TASKS.md (X items)
- Memory: X people, X terms, X projects
- Dashboard: .tasks/dashboard.html

Use /tasks-update to keep it current (add --comprehensive for a deep scan), or
/tasks-remove to fold it back into the repo when you're done.
```

## Notes

- If memory is already initialized, this just re-opens the dashboard.
- Nicknames are critical — always capture how people are actually referred to.
- If a connector isn't available, skip it and note the gap; the system works fully manual.
- Memory grows organically through conversation after bootstrap.
- This system tracks finite attention as well as tasks — when the user is overloaded or
  unsure what to do first, lean on the `personal-productivity` skill.
