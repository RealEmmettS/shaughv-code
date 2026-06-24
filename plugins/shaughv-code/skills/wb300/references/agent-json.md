# `wb300 agent` — JSON output (schema `wb300.agent.v2`)

`wb300 agent` prints the **entire** branch / worktree / agent state as JSON to
stdout and **exits immediately** — no TUI, no alternate screen, no live
watching. This is the interface built for programs and agents: read it once,
then orchestrate. Unlike the bare `wb300` TUI, it is safe to run from a
non-interactive shell.

## Invocation & scoping

| Command | Result |
|---|---|
| `wb300 agent` | Auto-detect: **inside a repo** → that repo (`mode: "repo"`); **elsewhere** → machine-wide (`mode: "home"`) |
| `wb300 agent --repo <path>` | Force a single repo regardless of cwd |
| `wb300 agent --home` (alias `--multi`) | Force machine-wide: every actively-worked repo on the machine |
| `wb300 agent --no-color` | Strip ANSI. The JSON is plain anyway, but pass this when piping to a parser to be safe |
| `wb300 agent --help` | Flags for this subcommand (only the three above) |

**PATH fallback.** `wb300` may not be on PATH inside sandboxed tool shells.
Fall back to the full path:
`& "C:\Program Files\wb300\bin\wb300.exe" agent` (PowerShell).

**Output size** scales with how many repos are active — often just tens of KB on
a 1–3 repo machine, but it can grow large in home mode (every repo, every
branch, every changed file). Prefer reading it from the persisted tool-result
file rather than echoing it inline. Parse instead of eyeballing:

- PowerShell: `$j = wb300 agent --no-color | ConvertFrom-Json`
- bash/jq: `wb300 agent --no-color | jq '...'`

## Top level

```jsonc
{
  "schema": "wb300.agent.v2",   // check this before trusting field names
  "wb300_version": "2.0.0",
  "generated_at": 1781155939,    // unix epoch seconds
  "mode": "home",                // "home" | "repo"
  "repo": "C:/Users/hey/git/...",// ONLY present when mode == "repo"
  "repos": [ /* ... */ ]         // ALWAYS present (1 entry in repo mode, N in home mode)
}
```

Always iterate `repos[]` — it is present in both modes. The top-level `repo`
scalar is an extra convenience that only appears in `mode: "repo"`.

## Each repo (`repos[]`)

| field | meaning |
|---|---|
| `name` | repo folder name |
| `root` | worktree root path |
| `common_git_dir` | the shared `.git` dir |
| `base` | integration base, e.g. `"origin/main"` |
| `trunk` | trunk branch, e.g. `"main"` |
| `hierarchy_approximate` | `true` if branch parentage could not be fully derived (very large off-trunk history or an old git) and parents degraded to trunk |
| `local_branches` / `remote_branches` | counts |
| `worktree_count` / `active_count` | total worktrees / those with work or an agent |
| `branches` | array — the branch hierarchy (see below) |
| `worktrees` | array — physical worktrees on disk (see below) |
| `collisions` | array — cross-branch file collisions / merge-risk forecast (see below) |

## Each branch (`branches[]`)

The branch hierarchy is the heart of the data. **One agent = one branch = one
worktree.** Parentage is derived from Git's commit graph, never guessed from
names. Use `parent` to reconstruct the tree (trunk → daily workbranch → task
branches).

**Always present:** `name`, `role`, `oid`, `lifecycle`, `ahead_of_parent`,
`merged_into_parent`, `active`, `collisions` (integer count for this branch).

**Upstream (present when the branch tracks a remote):** `upstream` (e.g.
`"origin/main"`), `ahead`, `behind`, `upstream_gone` (bool — upstream was
deleted).

**Conditional:**
- `parent` — omitted on the trunk; the parent branch name otherwise.
- `behind_parent` — how many commits the parent has moved ahead (a rebase hint); present when the branch has a parent.
- `worktree` — on-disk path; present only when the branch is checked out somewhere.
- `files` + `files_total` — present only when the branch's worktree has changes.
- `agent` — present only when a process is mapped into the branch's worktree.

### `role`
`trunk` · `standalone` · and hierarchy roles as the tree grows (the daily
workbranch / task-branch roles). Treat unknown roles gracefully.

### `lifecycle` (the pipeline stage)
`editing` (files being written right now) → `uncommitted` (dirty worktree) →
`committed` (clean, work not yet on remote, shows `↑N`) → `pushed` (clean and
fully on a live remote) → `merged` (contained in its parent) · plus `fresh`
(just cut from parent, no work yet).

> Caveat: a **squash-merged** branch keeps reading `committed` until it is
> deleted — squash merges are invisible in the commit graph, by design. Don't
> assume `committed` means "not yet merged" for squash workflows.

### `agent` object
| field | meaning |
|---|---|
| `pid` | OS process id |
| `name` | image name, e.g. `"claude.exe"`, `"codex"` |
| `label` | category: `agent` / `build` / `test` / `shell` / `editor` |
| `cmd` | full command line |
| `cpu` | CPU % |
| `memory_bytes` | RSS |
| `run_secs` | seconds the process has been running |

### `files[]` entry
`{ "path": "...", "kind": "..." }` where `kind` ∈
`modified` · `added` · `deleted` · `untracked` · `conflicted`.

## Each worktree (`worktrees[]`, per repo)

The physical view: every git worktree folder on disk (a branch maps to at most
one). Keys: `path`, `name`, `branch`, `head`, `detached` (bool), `bare` (bool),
`locked` (bool), `prunable` (bool), `status`, `collisions`, `agent`,
`processes` (array of mapped processes). A `prunable` worktree has stale
bookkeeping; a `detached` one has no branch checked out.

## Collisions (`collisions[]`, per repo)

The merge-risk forecast: files changed on **two or more** branches/worktrees —
what will conflict at merge time — including files already committed since the
shared base. Risk is ranked: lockfiles, migrations, and CI configs are the
scariest; docs are low. Each entry identifies the file path, the
branches/worktrees touching it, and a risk level.

> The exact element keys can vary by version and the array is empty when there
> are no collisions, so inspect a populated run (`... | ConvertFrom-Json` then
> look at `repos[0].collisions[0]`) to confirm field names before depending on
> them.

## Annotated example (home mode, trimmed)

```jsonc
{
  "schema": "wb300.agent.v2",
  "wb300_version": "2.0.0",
  "generated_at": 1781155939,
  "mode": "home",
  "repos": [
    {
      "name": "QubeTX_Landing",
      "root": "C:/Users/hey/git/QubeTX_Landing",
      "common_git_dir": "C:/Users/hey/git/QubeTX_Landing/.git",
      "base": "origin/main",
      "trunk": "main",
      "hierarchy_approximate": false,
      "local_branches": 2,
      "remote_branches": 14,
      "worktree_count": 1,
      "active_count": 1,
      "branches": [
        {
          "name": "main",
          "role": "trunk",
          "oid": "d01e797c...",
          "lifecycle": "pushed",
          "ahead_of_parent": 0,        // trunk has no parent → trivially 0, no "parent"/"behind_parent" keys
          "merged_into_parent": false,
          "active": true,
          "upstream": "origin/main",   // tracks a remote, so the upstream-relative trio is present:
          "ahead": 0, "behind": 0, "upstream_gone": false,
          "files_total": 0,
          "collisions": 0
        },
        {
          "name": "feature/redesign-v3",
          "role": "standalone",
          "parent": "main",            // parent-relative counts below are vs this branch
          "oid": "70a68c11...",
          "lifecycle": "committed",
          "ahead_of_parent": 3,
          "behind_parent": 0,
          "merged_into_parent": false,
          "active": true,
          "upstream_gone": false,      // NOTE: no upstream set → "upstream"/"ahead"/"behind" are absent here
          "worktree": "C:/Users/hey/git/QubeTX_Landing",
          "agent": {
            "pid": 38812, "name": "claude.exe", "label": "agent",
            "cmd": "C:\\Users\\hey\\.local\\bin\\claude.exe",
            "cpu": 0.0, "memory_bytes": 558182400, "run_secs": 2898
          },
          "files": [
            { "path": "app/page.tsx", "kind": "modified" },
            { "path": "src/components/ui/LabelPill.tsx", "kind": "added" }
            /* ... files_total of them ... */
          ],
          "collisions": 0
        }
      ],
      "worktrees": [ /* ... */ ],
      "collisions": [ /* ... */ ]
    }
  ]
}
```

## Recipes

These assume `$j = wb300 agent --no-color | ConvertFrom-Json` (PowerShell) or a
`jq` pipe. Adapt to whatever the user asked.

**Which agent is on which branch** (across all repos):
```powershell
$j.repos | ForEach-Object {
  $_.branches | Where-Object agent |
    ForEach-Object { "$($_.name)`t$($_.agent.name) pid $($_.agent.pid)  $([int]$_.agent.run_secs)s" }
}
```
```bash
wb300 agent --no-color | jq -r '.repos[].branches[] | select(.agent) | "\(.name)\t\(.agent.name) pid \(.agent.pid)"'
```

**Branches ready to review / merge** — clean, with unmerged work, no agent. Use
`pushed`, or `committed` **only when it has real unmerged work**: a squash-merged
branch keeps reading `committed` until deleted, so guard with `ahead_of_parent
> 0` and `merged_into_parent == false` to avoid surfacing already-merged
branches as "ready".
```bash
wb300 agent --no-color | jq -r '
  .repos[].branches[]
  | select((.agent|not) and (.merged_into_parent|not)
      and (.lifecycle=="pushed"
           or (.lifecycle=="committed" and (.ahead_of_parent // 0) > 0)))
  | .name'
```
A ready branch frequently leaves a `prunable` worktree behind (its work landed,
the folder lingers) — when answering "what's ready?", it's often worth also
reporting the matching `worktrees[].prunable == true` entries as safe cleanup.

**Dirty branches with unsaved work:** filter `lifecycle` ∈ {`editing`,`uncommitted`}.

**Branches that need a rebase:** `behind_parent > 0` (their parent moved on).

**Merge-risk / collisions:** iterate `repos[].collisions[]`; or per branch,
`branch.collisions > 0`.

**Stale worktrees safe to remove:** `worktrees[]` where `prunable == true`, or
branches that are `merged_into_parent` / `pushed` with no `agent`. (Removal is a
human action — see the TUI reference; don't delete worktrees yourself.)
