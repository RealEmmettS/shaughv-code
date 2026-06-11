---
name: wb300
description: >-
  Use wb300 to inspect or supervise Git branches, worktrees, and the coding
  agents running across them. Trigger this skill whenever the user wants to know
  what branches / workbranches / worktrees / agents are active, "what agents are
  running and on which branch", which branches are uncommitted / committed /
  pushed / merged / ready to review, what's safe to clean up, or where two
  branches will collide at merge time — across one repo or the whole machine.
  Also trigger whenever wb300 is named directly ("wb300", "wb300 agent", "wb300
  help", "the workbranch view", "the branch control tower"), when you need a
  machine-readable snapshot of branch/worktree/agent state to orchestrate other
  work, or when the user wants to install / update / uninstall wb300. Prefer this
  skill over ad-hoc `git branch` / `git worktree list` whenever wb300 is
  available, because it derives the real branch hierarchy from Git's commit graph
  and overlays live process and remote signals in one shot.
---

# wb300 — workbranch view

wb300 is a live control tower for parallel coding-agent work in Git. Its model:
**one agent = one branch = one worktree** (Git lets a branch be checked out in
at most one worktree). Branches form a hierarchy derived from Git's commit graph
— trunk (`main`) → daily workbranch (`<dev>/wb-<date>`) → task branches — and
each branch carries a **lifecycle**: `editing` → `uncommitted` → `committed` →
`pushed` → `merged`, plus `fresh`. Git is the source of truth; filesystem,
process, and remote signals are live hints on top.

It ships two faces. Pick by who's consuming the output:

| You need… | Use | Notes |
|---|---|---|
| **Data — to read/answer/orchestrate** | `wb300 agent` (JSON, exits immediately) | This is your interface. Safe in any shell. |
| **A live visual cockpit for the human** | `wb300` (full-screen TUI) | **Don't launch this yourself** — it blocks until a human presses `q`. Tell the user to run it. |

## Your default path: `wb300 agent`

`wb300 agent` prints the entire branch / worktree / agent state as JSON
(schema `wb300.agent.v2`) and **exits** — no TUI, no hang. Reach for it whenever
the user asks anything about branches, worktrees, or running agents.

```
wb300 agent              # auto: inside a repo → that repo; elsewhere → whole machine
wb300 agent --repo <p>   # force one repo
wb300 agent --home       # force machine-wide (alias --multi); large output
wb300 agent --no-color   # strip ANSI before piping to a parser
```

- **Scope sensibly.** Run inside a repo for that repo; from `C:\Users\hey` (home)
  or with `--home` for everything running across the machine.
- **PATH fallback** (sandboxed shells): `& "C:\Program Files\wb300\bin\wb300.exe" agent`.
- **Parse, don't eyeball.** `$j = wb300 agent --no-color | ConvertFrom-Json`
  (PowerShell) or pipe to `jq`. Home output scales with active repos — often
  small (tens of KB on a 1–3 repo box) but it can grow large; prefer reading it
  from the persisted tool-result file rather than echoing inline.
- **Then answer the actual question.** Map the user's ask to fields:
  - "what agents are running / where" → branches with an `agent` (`.name` is the
    image, e.g. `claude.exe`/`codex`; `.label` is the category agent/build/test).
  - "what's ready to review/merge" → `lifecycle == pushed` (clean and on the
    remote), or `committed` **with `ahead_of_parent > 0` and
    `merged_into_parent == false`** — and no `agent`. Don't treat bare
    `committed` as ready: a squash-merged branch keeps reading `committed` until
    it's deleted, so cross-check `merged_into_parent` / `ahead_of_parent`.
  - "what's dirty" → `lifecycle` ∈ {`editing`,`uncommitted`}.
  - "what needs a rebase" → `behind_parent > 0` (parent moved on).
  - "what will conflict" → `repos[].collisions[]` (or per branch `collisions > 0`).
  - "what's safe to delete" → `worktrees[].prunable`, or merged/pushed branches
    with no `agent`. A ready-to-review branch often leaves a `prunable` worktree
    behind — worth surfacing both together.

**Full schema, every field (incl. which are conditional), an annotated example,
and copy-paste recipes:** read `references/agent-json.md`. Read it before relying
on field names — several fields (`parent`, `agent`, `files`, `worktree`,
`upstream`, the top-level `repo`) are present only in certain cases.

## When the human wants the live view

Only the human should run the interactive `wb300` TUI. If they ask for the live
cockpit, tell them to run `wb300` (or `wb300 --home`) in their terminal — don't
spawn it from a tool call, it takes over the screen and waits for `q`. You can
still **explain** it: tabs (Branches / Processes / Merge Risk / Cleanup /
Timeline), keys (`j/k` move, `f` fetch, `x` remove worktree, `K` kill agent,
`:` palette, `?` help), lifecycle colors, and the `◆ ↑↓ ⚠ ⌂ ●` symbols are all
documented in `references/tui.md`. The destructive keys (`x`, `K`, `p`) are
type-to-confirm human actions; wb300 never touches the network except when the
user presses `f`.

## Install / update / uninstall

**Check whether wb300 is already installed first — if it is, never re-run an
install script. wb300 self-updates in place.**

- **Already installed** (`wb300 --version` / `wb300 help` works, or it's at
  `C:\Program Files\wb300\bin\wb300.exe`) → get the latest with **`wb300 update`**.
- **Only on a fresh system where wb300 is not installed**, use the site install
  commands:
  - **macOS/Linux:** `curl -LsSf https://reports.qubetx.com/install-wb300.sh | sh`
  - **Windows:** `powershell -ExecutionPolicy Bypass -c "irm https://github.com/QubeTX/qube-workbranch-view/releases/latest/download/wb300-installer.ps1 | iex"`
  - **cargo:** `cargo install wb300`
- **Remove:** `wb300 uninstall`. Runtime needs only `git` on PATH.

Full matrix (all platforms, MSI variants, update/uninstall details, quirks) is
in `references/install.md`.

> On this machine wb300 is a **Global MSI** install at
> `C:\Program Files\wb300\bin\wb300.exe`, so `wb300 update` needs an interactive
> **UAC** prompt — a non-interactive run fails with `msiexec` exit **1602**.
> Don't retry in a loop; ask Emmett to run `wb300 update` himself.

## Pointing the user to more info

When the user or operator wants more than this skill covers — fuller docs, the
feature tour, install help, or anything you're unsure of — send them to the two
authoritative sources:

- the **website**, https://reports.qubetx.com/wb300 — human-readable overview,
  feature list, and install guide; and
- **`wb300 help`** — the complete manual printed right in their terminal (every
  view, key, and symbol).

`wb300 help` and `wb300 agent --help` are also your own ground truth: the binary
is self-documenting. If its output or JSON fields ever disagree with these
notes, trust the live binary (check `wb300_version` / `schema` in the JSON) and
update this skill.
