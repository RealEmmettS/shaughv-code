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

Three sources of truth:

1. **Mission Control task queue.** Each agent checks in with `agent_checkin`,
   announces what it's working on with `claim_task` / `agent_update`, and
   checks out at end of session. The task queue is the canonical view of
   "who is doing what."
2. **`git worktree list`.** The filesystem-level view of which worktrees
   exist and what branch each is on.
3. **`git branch -r`** and `gh pr list`. The remote-level view of which
   branches and PRs are active.

These three should agree. When they disagree, something has gone wrong
(crashed agent, manual operator action, stale state).

## The multi-agent check (Phase 2 of SKILL.md)

Before creating a new worktree, the skill MUST run this check:

### Step 1 — Check Mission Control

Query for active agents in this repo:

```
get_my_tasks() / get_available_tasks() — filter for tasks where
working_directory matches this repo
```

For each active agent (status: `working` or `blocked`):
- What branch are they on?
- When was their last update?
- Are they on the same task you're about to claim?

### Step 2 — Check filesystem

```bash
cd ~/code/myrepo
git worktree list
```

Each worktree shown is an active filesystem checkout. The branch name
tells you what's in flight.

### Step 3 — Check origin

```bash
git fetch origin --prune
git branch -r | head -50
gh pr list --limit 20 --state open
```

Branches and PRs on origin reflect "what's been touched" across all agents
and developers.

### Decision tree

| What you find | Action |
|---|---|
| No other agent active, no conflicting worktree, no conflicting branch | Proceed normally. |
| Another agent active but on a different task/branch | Proceed normally. Note their presence in `agent_update`. |
| Another agent has the EXACT branch you're trying to create | **STOP**. Don't create the worktree. Either pick a different task, or coordinate at the human level. |
| Worktree exists for the branch but no agent is checked in | Suspicious — likely a crashed agent. See "Stale worktrees" below. |
| Branch exists on origin but no local worktree and no active agent | Likely an abandoned branch. Check the PR; if closed/merged, the branch is safe to delete. |
| Same developer has 4+ active workbranches on this repo | Warn the operator — this is unusual. |

## Per-developer workbranches and cross-agent coordination

Each developer has at most ONE active workbranch per day. Multiple agents
under the same developer share that workbranch as their merge target.

When agent A and agent B are both running under "christian":
- Both branch task worktrees off `christian/wb-2026-05-19`
- Both merge their task PRs into `christian/wb-2026-05-19`
- They share the workbranch but never see each other's worktrees

When agent A is under "christian" and agent B is under "emmett":
- Agent A branches off `christian/wb-2026-05-19`
- Agent B branches off `emmett/wb-2026-05-19`
- The two workbranches don't talk to each other. They both rebase from
  `main` continuously, which keeps them implicitly aligned.

### How does the skill know which developer it's running as?

The cleanest source is the `agent_checkin` operator identity. The skill
should use that to construct the workbranch name. Fallbacks:
- `git config user.email` — the configured email's local part
- `whoami` — the OS username
- Operator-provided override at session start

If none of these are available or unambiguous, the skill should ask the
operator: "I need to know which workbranch to use. Are you christian or
emmett?"

## Stale worktrees

The most common multi-agent failure mode: an agent crashed or was killed,
leaving its worktree in place but its task in `working` state in Mission
Control.

Detection:
- Mission Control shows a task in `working` state with `last_update` >
  30 minutes ago
- A worktree exists on disk for that task's branch
- No active session corresponds to that agent

What to do:
1. Don't just blow away the worktree — it may have uncommitted work.
2. Open the worktree directory and check `git status`. If there's
   uncommitted work, surface it to the operator: "Worktree
   `~/code/myrepo-feat-csv-export-142` has uncommitted changes from a
   crashed agent. Review before cleanup."
3. If the work is salvageable, the operator can either commit it on the
   existing branch (taking over the task) or stash it and abandon.
4. After resolution, remove the worktree (`git worktree remove`) and
   update Mission Control (`update_task` with status `failed` or
   `completed`).

## Branch reservation via push-to-origin-first

The "push to origin immediately on creation" rule (non-negotiable #7) is
how agents reserve branches across sessions. The moment a branch exists
on origin:

- Other agents see it in `git branch -r` after a fetch
- Mission Control's branch-aware tools can see it
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
   agents. Announce it via Mission Control's `agent_update` with a note,
   so any concurrent agents see it.
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

`scripts/worktree-list.sh` (provided in `scripts/`) prints an augmented
view combining `git worktree list`, Mission Control, and last-update times:

```
Worktrees and agents in this repo:
  ~/code/myrepo                          main      (no agent)
  ~/code/myrepo-christian-wb-2026-05-19  workbranch (christian, owner)
  ~/code/myrepo-feat-csv-export-142      task      (agent A, working, last update 4m ago)
  ~/code/myrepo-fix-stale-cache-203      task      (agent B, blocked, last update 2h ago — STALE?)
```

Run this whenever multi-agent state is ambiguous. It's the single source
of truth for "what's actually happening right now."

## Quick reference

```bash
# Detect other active agents in this repo via Mission Control
# (Skill should call the appropriate Mission Control tool — query for
# tasks where working_directory matches the current repo)

# Detect filesystem-level activity
cd ~/code/myrepo
git worktree list

# Detect remote-level activity
git fetch origin --prune
git branch -r
gh pr list --limit 20 --state open

# Audit view (combines all three)
scripts/worktree-list.sh

# Find your own workbranch (if it exists)
git branch -r | grep "$(whoami)/wb-$(date +%Y-%m-%d)"
```
