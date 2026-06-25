# board-server.mjs — the live localhost board + maintenance hooks

`board-server.mjs` ships in `skills/tasks-start/assets/` and is copied into `.tasks/`
by `/tasks-start`. It is the single source of truth for how the live board runs and how
the board-maintenance hooks are wired into a target repo. **`/tasks-start` and
`/tasks-remove` must follow this file verbatim** so the install string and the teardown
match string never drift apart.

It uses **only Node built-ins** — no `npm install`, no build step. It requires `node` on
PATH; if Node is absent, fall back to the legacy `file://` dashboard flow (open
`dashboard.html` from a file browser and use the Select-file pickers).

## Subcommands

Run from the repo root (the `.tasks/` folder is a child of it):

| Command | What it does |
|---|---|
| `node .tasks/board-server.mjs serve [--open] [--port N]` | Start the server in the foreground. `--open` opens the browser once it's listening. |
| `node .tasks/board-server.mjs ensure [--open]` | Start the server **detached** (survives the calling process) only if it isn't already running. Used by the relaunch path and by hooks. |
| `node .tasks/board-server.mjs hook <EVENT>` | Ensure the server is up, then print the right board-maintenance nudge for `<EVENT>`. Reads the hook's JSON payload from stdin. |
| `node .tasks/board-server.mjs stop` | Stop a running server and clear its state files. |
| `node .tasks/board-server.mjs status` | Print `{port,pid,...}` if running, else `{"running":false}`. |

To launch + open the board (what `/tasks-start` does): `node .tasks/board-server.mjs ensure --open`.

## How it serves and live-syncs

- Default port **4317**; if busy it picks the next free port and records the choice in
  `.tasks/.board-server.json` (`{port, pid, startedAt}`). "Is it running?" is verified by
  hitting the `/api/ping` health endpoint (returns `shaughv-task-board`), not just a
  PID-alive check — so a dead/reused PID never fools it.
- HTTP API (the server stays **dumb** about markdown — the browser keeps all parse/serialize):
  - `GET /` → serves `dashboard.html`.
  - `GET /api/tasks` → raw `TASKS.md`; response carries `X-Board-Mtime`.
  - `POST /api/tasks` → atomic write. Send `X-Base-Mtime` (the mtime you loaded); if the
    file changed underneath you the server returns **409** with the latest content, so an
    agent's write is never silently stomped.
  - `GET /api/events` → **SSE**; a `change` event fires when `TASKS.md` (or `memory/`)
    changes on disk, so the browser updates live. Implemented with `fs.watchFile` on
    `TASKS.md` (reliable cross-platform) plus a best-effort recursive `fs.watch`.
  - `GET|POST /api/memory/tree`, `/api/memory/file?path=` → memory tab; writes are
    path-guarded to `CLAUDE.md` or `*.md` under `memory/` (traversal / absolute / non-`.md`
    / symlink-escape all rejected).
  - `GET|POST|DELETE /api/task?id=<id>` → a task's rich detail file at `.tasks/tasks/<id>.md`
    (the description + activity log behind the dashboard's task modal). `id` is validated
    `^[0-9a-z]{2,8}$` (the task's trailing `#id`). GET returns the raw markdown (empty string
    if the file doesn't exist yet — detail files are lazy/optional); POST atomically writes it;
    **DELETE removes it** (the dashboard calls DELETE when a task is deleted, so a reused id
    can't inherit stale detail). All three set `lastSelfWrite` so the write doesn't echo back
    over SSE.
- `dashboard.html` auto-detects: over `http(s)` it uses this API + SSE; over `file://` it
  uses the legacy File System Access API. One file, both modes.
- Auto-open is **only** on the explicit `/tasks-start` launch (`ensure --open`). Hooks call
  `ensure` **without** `--open`, so they revive the server silently and never pop a browser
  tab every session.

## The board-maintenance hooks (written into the TARGET repo)

`/tasks-start` offers (ask once, suggest yes) to merge this block into the target repo's
`.claude/settings.local.json` (default — personal, gitignored, matches `.tasks/` being
local scaffolding) or `.claude/settings.json` (only if the user committed `.tasks/` and
wants the reminder shared with collaborators):

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "node .tasks/board-server.mjs hook SessionStart" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Bash|ExitPlanMode", "hooks": [ { "type": "command", "command": "node .tasks/board-server.mjs hook PostToolUse" } ] }
    ],
    "SubagentStart": [
      { "hooks": [ { "type": "command", "command": "node .tasks/board-server.mjs hook SubagentStart" } ] }
    ],
    "SubagentStop": [
      { "hooks": [ { "type": "command", "command": "node .tasks/board-server.mjs hook SubagentStop" } ] }
    ]
  }
}
```

What fires when (verified against the Claude Code hooks doc):
- **SessionStart** (no matcher → also re-fires on resume / `/clear` / after compaction):
  ensures the board is alive and injects the standing "keep `.tasks/TASKS.md` current"
  reminder. Plain stdout is injected as agent-visible context for this event.
- **PostToolUse** `Bash|ExitPlanMode`: matchers filter on **tool name only**, so the script
  reads `tool_input.command` from stdin and nudges (agent-visible `additionalContext`) ONLY
  on `git commit` / `git push`; an `ExitPlanMode` tool call triggers the "mirror the plan"
  nudge. Any other Bash command produces no output.
- **SubagentStart / SubagentStop** (match all agent types): nudge when a subagent spawns /
  finishes, via `additionalContext`.

Nudges are de-duped **per semantic type** (`commit`, `push`, `plan`, `subagent-start`,
`subagent-stop`) with a 30s cooldown — so a commit nudge never swallows a later push nudge,
and a subagent fan-out can't spam. `SessionStart` is never cooled down.

The command path is **relative** (`.tasks/board-server.mjs`) on purpose: it's shell-agnostic
(no env-var expansion that would differ between Git Bash and PowerShell) and resolves when
the hook runs from the repo root (Claude Code's default). If a hook ever fires from another
directory, `node` simply won't find the script and the hook no-ops — a safe implicit gate.
The script also hard-gates on `.tasks/dashboard.html` existing before doing anything.

### Merge rule (install)

Read the settings file if it exists (else start from `{}`), **preserve every existing key
and hook**, and append only the entries above (create each event array if absent). Never
clobber unrelated hooks.

### Teardown match (used by /tasks-remove)

Every command we add contains the stable marker **`board-server.mjs hook`**. To remove the
hooks, delete from `.claude/settings.local.json` (and `.claude/settings.json` — check both)
ONLY the hook entries whose `command` contains that marker; prune any array that becomes
empty, then `hooks` if it becomes empty, then the file if it becomes `{}`. Never remove a
hook you can't positively identify by the marker. Also run `node .tasks/board-server.mjs
stop` to kill the running server before deleting `.tasks/`.

## TASKS.md format contract (server ↔ dashboard must agree)

The dashboard parses/serializes this exact shape; the server only moves the bytes:

```markdown
# Tasks

## Backlog

## To-Do
- [ ] **Task title** - optional note (needs #b2c) #a3f
  - [x] subtask

## Active
- [ ] **Other task** #b2c

## Done
- [x] **Done task** #x9z
```

- `## Section` headers (optional `**bold**`); section id = lowercased, non-alnum → `-`.
  Default columns are **Backlog → To-Do → Active → Done** (file order = column order).
- Task lines: `- [ ]` / `- [x]`, a **bold** title, optional ` - note`, optional
  ` (needs #id, #id)` prerequisites, then the task's own short base-36 ` #id` LAST.
- A task with an unfinished prerequisite is **blocked** (badge + can't move into Active).
  Every task gets an id automatically; missing ids are backfilled on load.
- Subtasks: 2-space-indented `  - [ ]` lines, plain text.
- Serialize always emits `[x]`/`[ ]`, bold titles, `(needs …)` before the trailing `#id`,
  and `## Section` headers without bold.

## Per-task detail files (`.tasks/tasks/<id>.md`)

`TASKS.md` is the one-line-per-task index; a task's **rich detail** lives in
`.tasks/tasks/<id>.md` (keyed by the task's trailing `#id`), served via `/api/task`. The
dashboard's task modal reads/writes it. Format = a TT;DR-led markdown description, optionally
followed by a `## Activity` section of `- ` log lines:

```markdown
TT;DR: plain-English one-or-two-sentence summary (rendered as a callout).

Full plan — markdown is rendered (headings, lists, code, **bold**, _italic_, `code`, links).

## Activity
- 2026-06-25 14:02 — created
- 2026-06-25 15:10 — moved To-Do → Active
```

- The browser splits on the first `^## Activity$` (case-insensitive): everything above is the
  description, the `- ` lines below are the activity log (rendered newest-first in the modal).
- Files are **lazy/optional** — a task with no detail file shows an empty description. They're
  created on first write and **deleted when the task is deleted** (the modal's delete fires
  `DELETE /api/task?id=`). Agents editing `TASKS.md` by hand should mirror that: remove
  `.tasks/tasks/<id>.md` when they remove a task.
