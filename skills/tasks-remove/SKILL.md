---
name: tasks-remove
description: >
  Decommission the tasks-* system in a repo and flatten its useful parts back into the
  repository itself. Use whenever the user says /tasks-remove, "remove the task system", "tear
  down tasks", "uninstall the task system", "flatten my tasks into the repo", "promote my
  memory", "I'm done with the dashboard", or otherwise wants the `.tasks/` scaffolding gone
  with its knowledge preserved. Merges `.tasks/CLAUDE.md` working memory into the repo's root
  `CLAUDE.md`, moves `.tasks/memory/` into a repo-level `memory/`, optionally preserves open
  tasks, then deletes `.tasks/` (dashboard included). Destructive — always confirm and show
  the migration plan first. The inverse of /tasks-start.
argument-hint: "[--keep-tasks] [--dry-run]"
---

# /tasks-remove

Take down the `.tasks/` system **without losing what it learned.** The working memory and
deep memory get promoted into the repo's own `CLAUDE.md` and `memory/` so the repo keeps the
context permanently; then `.tasks/` is deleted. This is the inverse of `/tasks-start`.

This is **destructive** (it deletes a folder). Always show the migration plan and get an
explicit "yes" before deleting anything. `--dry-run` shows the plan and stops.

## 1. Confirm the system exists

If there's no `.tasks/` in the current working directory, say so and stop — nothing to
remove.

Read everything first: `.tasks/CLAUDE.md`, `.tasks/memory/**`, `.tasks/TASKS.md`.

## 2. Present the migration plan

Show the user exactly what will happen before touching anything:

```
/tasks-remove plan for <repo>:

  board server          →  stopped (node .tasks/board-server.mjs stop)
  .claude/settings*.json →  board-maintenance hooks removed (other hooks/keys kept)
  .tasks/CLAUDE.md      →  merge into ./CLAUDE.md  (## Memory section)
  .tasks/memory/        →  merge into ./memory/    (glossary.md, people/, projects/, context/)
  .tasks/TASKS.md       →  3 open items → ## Open threads in ./CLAUDE.md; Done items archived
  .tasks/dashboard.html, board-server.mjs → deleted
  .tasks/               →  deleted after migration

Proceed? (or /tasks-remove --keep-tasks to leave a TASKS.md at the repo root)
```

Wait for confirmation. If `--dry-run`, stop here.

## 3. Promote working memory → repo `CLAUDE.md`

Merge `.tasks/CLAUDE.md` into the repo's root `CLAUDE.md`:

- **If root `CLAUDE.md` doesn't exist:** create it. Put the migrated content under a clear
  `# Memory` (or `## Workplace memory`) section so it reads as project memory Claude Code
  auto-loads.
- **If it exists:** merge, don't clobber. Append the people / terms / projects / preferences
  under a `## Workplace memory` section. De-duplicate against anything already there; if a
  fact conflicts, keep the repo's existing line and note the alternate rather than
  overwriting.
- Preserve the table formats from `tasks-memory` so the promoted memory stays scannable.

## 4. Promote deep memory → repo `memory/`

Move `.tasks/memory/` into a repo-level `memory/` directory:

- **If `./memory/` doesn't exist:** move the whole tree (`glossary.md`, `people/`,
  `projects/`, `context/`) up to `./memory/`.
- **If it exists:** merge file-by-file. For `glossary.md`, append new rows and de-dupe. For
  `people/` and `projects/`, copy in files that don't exist; for collisions, merge the two
  files (union of sections) rather than overwriting — and tell the user which ones you
  merged.
- Keep kebab-case filenames; fix any that drifted (per Emmett's naming conventions).

If the repo has a different established memory convention (e.g. `.claude/memory/` or a
repo-level memory skill), target that instead — match the repo, don't impose `memory/`.

## 5. Handle open tasks

Tasks aren't "memory", so by default they don't survive teardown — but don't silently drop
open work:

- **Default:** summarize remaining **Active** and **Waiting On** items into an `## Open
  threads` list at the bottom of the repo's `CLAUDE.md` (or a short `TODO` note), so nothing
  in flight is lost. Drop the `Done`/`Someday` archive unless asked to keep it.
- **`--keep-tasks`:** instead, move `.tasks/TASKS.md` to the repo root as `TASKS.md` (or
  append to an existing one) and leave it tracked.

## 6. Stop the board, remove the hooks, delete `.tasks/`

Before deleting, tear down what `/tasks-start` set up **outside** `.tasks/`:

- **Stop the live server:** run `node .tasks/board-server.mjs stop` (kills the server via its
  recorded PID and clears its state files). Harmless if it isn't running.
- **Remove the board-maintenance hooks:** open `.claude/settings.local.json` (and
  `.claude/settings.json` — check both). In each, delete ONLY the hook entries whose
  `command` contains the marker **`board-server.mjs hook`** (across `SessionStart`,
  `PostToolUse`, `SubagentStart`, `SubagentStop`). Prune any hook array that becomes empty,
  then `hooks` if it empties, then the file itself if it becomes `{}`. **Never remove a hook
  you can't positively identify by that marker** — every other hook and key stays untouched.

Then delete the `.tasks/` folder, including `dashboard.html` and `board-server.mjs`. Deleting
files from a Cowork workspace requires permission — if a delete fails with "Operation not
permitted", request it (the `allow_cowork_file_delete` flow) rather than telling the user it's
impossible.

Remove any `.tasks/` line you added to `.gitignore` during `/tasks-start`.

## 7. Report

```
Task system removed. Migrated into <repo>:
- ./CLAUDE.md      ← working memory (X people, X terms, X projects) + 3 open threads
- ./memory/        ← glossary, X people, X projects, company context
- board server     ← stopped; board-maintenance hooks removed from .claude/settings*.json
- .tasks/          ← deleted (dashboard + board-server.mjs included)

Your repo now carries the context directly. Re-run /tasks-start anytime to spin the
live board back up.
```

## Safety

- **Never delete before the migration files are written and verified.** Read back the merged
  `CLAUDE.md` / `memory/` to confirm the content landed, then delete `.tasks/`.
- **Merge, don't overwrite.** The repo's existing memory always wins on conflict; surface
  conflicts instead of silently resolving them.
- **Remove hooks by marker, never by position.** The board hooks are identified by the
  `board-server.mjs hook` string in their command — an unrelated `SessionStart` /
  `PostToolUse` / subagent hook in the same settings file is never touched.
- If anything is ambiguous (where repo-level memory should live, whether to keep tasks), ask
  once rather than guessing — this step is hard to undo.
- If the repo is version-controlled, this is a natural commit point — defer to the
  `git-workflow` skill for how to land it.
