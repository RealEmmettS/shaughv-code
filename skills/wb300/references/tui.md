# wb300 — the interactive TUI

Running bare `wb300` (no `agent` subcommand) launches a **full-screen live
terminal UI** on an alternate screen with a filesystem watcher. It runs until
the user quits with `q`.

> **For you, the agent: do not launch the bare `wb300` TUI from a tool shell.**
> It takes over the terminal and blocks until a human presses `q` — a
> non-interactive shell will hang. When you need data, use `wb300 agent` (see
> `agent-json.md`), which prints JSON and exits. Only *tell the human* to run
> `wb300` themselves when they want the live visual cockpit. The material below
> is so you can explain the TUI, its keys, and its symbols accurately.

## The model

Git's rule: a branch can be checked out in at most one worktree. So the real
shape of parallel agent work is a branch tree, and that tree is exactly what
wb300 shows:

```
repo
├─ main                     the integration trunk
└─ emmett/wb-2026-06-10     a daily workbranch (lives ≤ 1 day)
   ├─ feat/csv-export-1        a task branch — its own worktree, one agent
   └─ fix/login-2
```

**One agent = one branch = one worktree.** The worktree is the folder on disk
where a branch is checked out; the agent is the process running inside it.
Branches with no worktree are plain refs and appear dimmed (or hidden in the
default active-only view). Git is the source of truth; filesystem, process, and
remote signals are live hints layered on top.

Run it **inside a repo** for that repo's view, or **outside a repo / with
`--home`** for the machine-wide view (one repo node per active repository; press
`Enter` to step into a repo, `q` to return home).

## Top-level invocation & flags

| Command | Effect |
|---|---|
| `wb300` | Launch the TUI (repo view inside a repo, else home view) |
| `wb300 --repo <path>` | Open the console for a specific repository |
| `wb300 --home` | Machine-wide view of every actively-worked-on repo |
| `wb300 --no-live` | Static snapshot — no live file watching |
| `wb300 --no-alt-screen` | Fallback inline renderer (no alternate screen) |
| `wb300 --no-color` | Disable color |
| `wb300 --no-notify` | Disable OS notifications for this run |
| `wb300 --help` | Full CLI documentation |
| `wb300 help` | The full terminal manual (every view, key, symbol) |

## Tabs / views

| # | View | Shows |
|---|---|---|
| 1 | **Branches** | The main view: the branch hierarchy. Each row shows its agent, lifecycle stage, and `⌂` worktree path, and expands into the files currently changed on it. Header strip keeps totals (branches / worktrees / agents / uncommitted / risk) + data freshness visible |
| 2 | **Processes** | Every OS process mapped into a worktree (agents highlighted) |
| 3 | **Merge Risk** | Files changed on 2+ branches — what will conflict at merge time, ranked by file risk (lockfiles and migrations critical; docs low) |
| 4 | **Cleanup** | Which worktrees are safe to remove (merged, pushed, no agent) |
| 5 | **Timeline** | Recorded history: branches committed / pushed / merged, worktrees created / removed, conflict risks discovered |

## Lifecycle stages

`editing` (its worktree's files are being written right now) · `uncommitted`
(uncommitted changes — row holds yellow) · `committed` (clean, work not yet on
the remote — `↑N` badge) · `pushed` (clean and fully on a live remote — `✓`) ·
`merged` (contained in its parent — done) · `fresh` (just cut from its parent,
no work yet).

Note: a squash-merged branch keeps reading `committed` until it is deleted —
squash merges are invisible in the commit graph.

## Indicators

| Symbol | Meaning |
|---|---|
| `◆` | a file is being saved right now (blue pulse) |
| yellow row | the branch has uncommitted changes |
| magenta row | flash: a commit just landed |
| green row | flash: work just reached the remote |
| `✚` / `⌫` | a worktree just appeared / was just removed |
| `⌂ path` | where the branch's worktree lives on disk |
| `● claude` | the agent process attached to the branch's worktree |
| `↑N` / `↓N` | commits ahead / behind the upstream |
| `⇣N vs parent` | the parent moved on — the branch needs a rebase |
| `⚠ N` | merge-conflict risks involving this branch |
| `~ + - ? !` | per-file change kind: modified, added, deleted, untracked, conflicted |
| dimmed | inactive: no worktree, no agent, no unmerged work |
| `(detached)` | a worktree with no branch checked out |

## Keybindings (inside the TUI)

| Key | Action |
|---|---|
| `q` | Quit (Esc backs out of overlays/filters first) |
| `Tab` / `1`–`6` | Switch tab |
| `j` / `k` | Move selection |
| `l` / `h` | Expand / collapse the selected node (vim-style) |
| `Enter` | Toggle expansion (home view: open the repo) |
| `a` | Show active branches only ⇄ all branches |
| `r` | Refresh now |
| `f` | Fetch from remotes (**never runs automatically** — the only network access) |
| `/` | Filter branches by name |
| `:` | Command palette |
| `x` | Remove the selected branch's **worktree** (branch + commits are kept; dirty worktrees get a rescue snapshot first; **type the branch name to confirm**) |
| `K` | Kill the attached agent / selected process (**type the PID to confirm**) |
| `p` | Prune stale worktree bookkeeping |
| `?` | In-app key overlay |

> The destructive keys (`x`, `K`, `p`) live in the per-repo view, are
> type-to-confirm, and are **human actions**. Don't try to drive them — and you
> can't, since you shouldn't be launching the TUI. To remove a worktree
> programmatically, use git directly (and mind the Windows dev-server file-lock
> quirk in `install.md`).

## Notifications

wb300 sends native OS notifications for exactly three things:

- a branch got new commits
- a branch's work reached its remote
- two branches started changing the same file

Never for anything else (no agent-exit or idle nagging). Bursts coalesce ("3
branches pushed") and repeats are suppressed for 30s per branch. Disable per run
with `--no-notify`, or permanently in config:

```toml
# ~/.config/wb300/config.toml   (Windows: %LOCALAPPDATA%\wb300\config.toml)
[notifications]
enabled = true
commit = true
push = true
conflict_risk = true
cooldown_secs = 30
```

On Windows, toasts identify as WB-300 via a per-user registry entry; if that
registration fails they may display as "Windows PowerShell".

## Files on disk

| Path | Contents |
|---|---|
| `<repo>/.git/wb300/` | per-repo event log (`events.jsonl`), rescue snapshots, per-repo debug log |
| `%LOCALAPPDATA%\wb300\` | machine-wide log + `config.toml` (Windows) |
| `~/.local/state/wb300/` | machine-wide log (Linux/macOS) |
| `~/.config/wb300/` | `config.toml` (Linux/macOS) |

## Troubleshooting banners

| Banner | Meaning |
|---|---|
| `⚠ stale` | the last Git capture failed; the board shows the previous good data. Check the log in the state dir |
| `◐ poll-only` | the filesystem watcher could not start; wb300 falls back to polling. Everything works, slightly less instantly |
| `~approximate` | branch parentage could not be fully derived (very large off-trunk history or an old git); parents degrade to trunk |
| No toasts on Windows | check Focus Assist / Do Not Disturb; toasts still land in the Action Center even when suppressed |
