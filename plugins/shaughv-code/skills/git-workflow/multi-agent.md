# Multi-agent coordination

This file covers what to do when multiple Claude Code agents are active in
the same repo. The workflow is designed for this case — worktrees give
each agent its own filesystem, workbranches scope each developer's work —
but a few coordination rules need to be explicit.

## The default assumption

**Multiple agents in the same repo is the normal case, not the exception.**
The skill should expect this and behave accordingly. Don't assume you're
the only agent until you've checked.

## Where the coordination happens

Coordination is **git-native** — there is no separate task tracker. Every
signal an agent needs comes from git itself, which means it survives
crashes, works across machines, and never drifts out of sync with reality.

Two sources of truth:

1. **`git worktree list`.** The filesystem-level view of which worktrees
   exist locally and what branch each is on.
2. **`git branch -r`** and `gh pr list`. The remote-level view of which
   branches and PRs are active across all agents and developers.

The key discipline that makes this work is **strong default #7: push every
new branch to origin immediately on creation**. Because branches appear on
origin from minute zero, any agent can see what every other agent is doing
with a single `git fetch`. Branch names are the coordination protocol.

When the filesystem view and the remote view disagree, something has gone
wrong (crashed agent, manual operator action, stale state).

## The multi-agent check (Phase 2 of SKILL.md)

Before creating a new worktree, the skill MUST run this check:

### Step 1 — Check the filesystem

```bash
cd ~/code/myrepo
git worktree list
```

Each worktree shown is an active filesystem checkout. The branch name
tells you what's in flight locally. A branch checked out in a worktree
is, by git's own rule, owned by whoever is working in that worktree —
it can't be checked out twice.

### Step 2 — Check origin

```bash
git fetch origin --prune
git branch -r | head -50
gh pr list --limit 20 --state open
```

Branches and PRs on origin reflect "what's been touched" across all agents
and developers. Because of the push-on-creation rule, a branch on origin
with recent commits means another agent is (or recently was) on it. Use
the last-commit time to gauge activity:

```bash
# When was the most recent commit on a given branch?
git log -1 --format=%cr origin/<branch>
```

### Decision tree

| What you find | Action |
|---|---|
| No conflicting worktree, no conflicting branch on origin | Proceed normally. |
| Another branch active but distinct from the one you're creating | Proceed normally — your worktrees won't collide. |
| A branch with the EXACT name you're trying to create already exists on origin (recent commits) | **STOP**. Another agent has reserved it. Pick a different task, or coordinate at the human level. |
| Worktree exists locally for the branch but it looks abandoned | Suspicious — likely a crashed agent. See "Stale worktrees" below. |
| Branch exists on origin but no local worktree and no recent commits | Likely an abandoned branch. Check the PR; if closed/merged, the branch is safe to delete. |
| Same developer has 4+ active workbranches on this repo | Warn the operator — this is unusual. |

## Per-developer workbranches and cross-agent coordination

Each developer has at most ONE active workbranch per day. Multiple agents
under the same developer share that workbranch as their merge target.

When agent A and agent B are both running under "taylor":
- Both branch task worktrees off `taylor/wb-2026-05-19`
- Both merge their task PRs into `taylor/wb-2026-05-19`
- They share the workbranch but never see each other's worktrees

When agent A is under "taylor" and agent B is under "emmett":
- Agent A branches off `taylor/wb-2026-05-19`
- Agent B branches off `emmett/wb-2026-05-19`
- The two workbranches don't talk to each other. They both rebase from
  `main` continuously, which keeps them implicitly aligned.

### How does the skill know which developer it's running as?

The workbranch name is derived from the developer's identity, in order of
preference:
- `git config user.email` — the configured email's local part
- `whoami` — the OS username
- Operator-provided override at session start

If none of these are available or unambiguous, the skill should ask the
operator: "I need to know which workbranch to use. Which developer are
you?"

## Stale worktrees

The most common multi-agent failure mode: an agent crashed or was killed,
leaving its worktree in place with no one actively working in it.

Detection (all git-native):
- A worktree exists on disk for a task branch
- Its branch's last commit is well in the past (e.g. `git log -1
  --format=%cr` on the branch shows hours ago), yet the task was supposed
  to be in progress
- No active session corresponds to that worktree

What to do:
1. Don't just blow away the worktree — it may have uncommitted work.
2. Open the worktree directory and check `git status`. If there's
   uncommitted work, surface it to the operator: "Worktree
   `~/code/myrepo-feat-csv-export-142` has uncommitted changes from a
   crashed agent. Review before cleanup."
3. If the work is salvageable, the operator can either commit it on the
   existing branch (taking over the task) or stash it and abandon.
4. After resolution, remove the worktree (`git worktree remove`). If the
   task is being abandoned, also delete its branch locally and on origin
   so it stops showing up as in-flight.

## Branch reservation via push-to-origin-first

The "push to origin immediately on creation" rule (strong default #7) is
how agents reserve branches across sessions. The moment a branch exists
on origin:

- Other agents see it in `git branch -r` after a fetch
- If the agent crashes, the branch survives and is recoverable

Without this rule, two agents could simultaneously create the same branch
name locally and only discover the collision at push time, by which point
each has its own divergent history.

## Coordinating workbranch rebase

The continuous workbranch rebase moves the workbranch's tip. Any active
task worktree branched off the workbranch needs to rebase itself onto the
new tip afterward.

Coordination protocol:

1. **Before rebasing the workbranch**, check for active task worktrees
   under this workbranch:
   ```bash
   git worktree list | grep -v "main"
   ```
2. **If active worktrees exist**, the rebase will move ground under those
   agents. Make it visible by pushing the rebased workbranch to origin
   right away, so any concurrent agents pick up the new tip on their next
   fetch.
3. **Perform the rebase** in the main checkout.
4. **Active worktrees should rebase onto the new workbranch tip** when
   they next refresh. The skill's "refresh every 2h" cadence handles this
   naturally — agents will pick up the new tip on their next planned
   refresh.

The rebase doesn't break running work directly; it just means the next
push from a task worktree will need `--force-with-lease` and may have
new conflicts to resolve.

## What about coordinating with humans?

Humans editing the repo at the same time as agents are a real case. A
human in their editor opens a file, makes a change, saves. They may not
be running through this skill at all.

Defenses:

- The human typically works in the main checkout on `main`, or on a
  branch they've personally checked out.
- Worktrees give the agents their own filesystem state, so a human's
  uncommitted edits in the main checkout don't show up in agent worktrees.
- If a human commits to `main` directly (typically discouraged but
  occasionally happens), the active workbranches pick it up via continuous
  rebase.

The risk case is a human and an agent both editing files in the SAME
worktree. The skill should detect this:

- If `git status` in the agent's worktree shows files modified that the
  agent didn't modify, something else has touched the worktree. Stop and
  surface to the operator.

## The audit view

`worktree-list.sh` prints a view combining `git worktree list` with branch
classification (workbranch / task / hotfix) and branch age, inferring
ownership from branch naming:

```
Worktrees in this repo (filesystem + git view):
  ~/code/myrepo                          main      main checkout
  ~/code/myrepo-taylor-wb-2026-05-19     taylor/wb-2026-05-19   workbranch (taylor) — age 4h
  ~/code/myrepo-feat-csv-export-142      feat/csv-export-142    task — age 1h
  ~/code/myrepo-fix-stale-cache-203      fix/stale-cache-203    task — age 26h OVER CAP
```

Run this whenever multi-agent state is ambiguous. Combined with last-commit
times on origin, it's the single source of truth for "what's actually
happening right now."

## Quick reference

```bash
# Detect filesystem-level activity (who has what checked out locally)
cd ~/code/myrepo
git worktree list

# Detect remote-level activity (what every agent has pushed)
git fetch origin --prune
git branch -r
gh pr list --limit 20 --state open

# Gauge how active a given branch is
git log -1 --format=%cr origin/<branch>

# Audit view (worktrees + classification + age)
./worktree-list.sh

# Find your own workbranch (if it exists)
git branch -r | grep "$(whoami)/wb-$(date +%Y-%m-%d)"
```
