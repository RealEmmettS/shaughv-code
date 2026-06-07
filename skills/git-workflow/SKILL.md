---
name: git-workflow
description: >
  Our team's official git workflow and committing strategy — the standard
  for ALL git work across ALL repos. Use this skill any time anything
  git-related comes up: branches, worktrees, workbranches, commits,
  commit messages, PRs, pull requests, pushing, pulling, rebasing,
  merging, deleting branches, merge conflicts, hotfixes, feature flags,
  multi-agent coordination, or being asked "what branch should I use",
  "how do I ship this", "how do we do git here", "what's our workflow",
  "how should I commit this", "where should I work", or "another agent
  is on this repo". Also trigger on any mention of "main", "trunk",
  "workbranch", "the branch is old", "stale branch", "force-push",
  or any phrase about getting code into production. The skill encodes
  the full policy and the exact git CLI commands; it enforces a
  worktrees-always, daily-workbranch, gated-PR model derived from
  Trunk-Based Development for small multi-agent teams. When in doubt —
  trigger. This skill applies to every repo this team owns.
---

# Git Workflow — Team Standard

This is the team's official git workflow. It applies to every repo we own.
The strategy is **Trunk-Based Development with daily workbranches**, adapted
for our context: a small team working on internal tools with multiple
Claude Code agents running in parallel against the same repo, deploying to
production directly from `main` via CI/CD.

Every piece of git work goes through this skill. When in doubt about a branch,
a worktree, a commit, a PR, or any git command — consult this skill before
acting.

## The mental model

We use a **three-tier branch hierarchy**:

```
main (trunk)
 └── christian/wb-2026-05-19 (workbranch, ≤24h, rebases onto main continuously)
      ├── feat/csv-export-142 (worktree, ≤2d, one agent)
      ├── fix/auth-bug-156 (worktree, ≤2d, one agent)
      └── refactor/pdf-gen-203 (worktree, ≤2d, one agent)
```

Each developer (Christian, Emmett) runs their own workbranch. Workbranches
are isolated from each other but both rebase onto `main` continuously, which
keeps them implicitly aligned. Task worktrees branch from the workbranch
and merge back into it. At end of day (or end of batch), the workbranch
goes through the full pre-PR gate flow and merges to `main`.

**Worktrees-always.** Every branch lives in its own physical directory via
`git worktree`. The main checkout is reserved for being on `main`. Task
worktrees are sibling directories: `~/code/myrepo/`, `~/code/myrepo-feat-csv-export/`,
`~/code/myrepo-fix-auth-bug/`. This is non-negotiable — see
`references/worktrees.md` for the full mental model.

## The non-negotiables

1. **One trunk.** `main` is the only globally long-lived branch. Workbranches
   live ≤24h. Task branches live ≤2 days.
2. **Worktrees-always.** Every branch lives in its own worktree directory.
   The main checkout is reserved for `main`. No `git checkout -b` in place
   for task work.
3. **Per-developer workbranches.** Each developer has at most one active
   workbranch at a time, named `<developer>/wb-<YYYY-MM-DD>`. Workbranches
   never merge into each other — they only meet on `main`.
4. **Continuous rebase.** Workbranches MUST rebase onto `origin/main` at
   least every 2 hours of active work. Task worktrees rebase onto their
   parent workbranch with the same frequency.
5. **Branches live ≤2 days, workbranches ≤1 day.** If approaching the cap,
   the work is too big and needs slicing or shipping.
6. **One agent per worktree.** Two if pair-programming. Worktrees are
   never shared as collaboration spaces between agents.
7. **Push to origin before starting.** Every new branch (workbranch or task)
   gets pushed to `origin` immediately on creation, before any work is done,
   so other agents and Mission Control can see it exists.
8. **A worktree must be verified runnable before agent work starts.**
   A fresh worktree is missing `.env*`, `node_modules`, generated files, and
   other `.gitignore`d state. Bootstrap copies these in; verify proves the
   worktree can run. Don't start coding in a worktree where verify failed.
9. **Trunk and workbranch are always green and releasable.** Every merge
   triggers checks. Half-done work hides behind feature flags.
10. **Rebase, don't merge.** Branches catch up via rebase. This keeps history
    linear and bisectable.
11. **Two PR moments, both gated.** Task worktree → workbranch is a
    lightweight gate (tests, lint, type, console, security agent, sign-off).
    Workbranch → main is the full pre-PR gate walk in
    `references/pre-pr-gates.md`.
12. **No direct pushes to `main` or to another developer's workbranch.**
    Workbranches are personal but PR-protected; `main` is universal and
    PR-protected.
13. **Delete worktrees and branches immediately after merge.** Local and remote.
14. **No force-push without `--force-with-lease`.** Never plain `--force`.

## Operating mode: warn loudly, allow override

When the user asks you to do something that violates the policy, or when a
gate fails:

1. State plainly which rule is being violated.
2. Explain the specific risk in this situation.
3. Offer the compliant alternative as the default path.
4. Ask the user to either take the alternative OR state a reason for the
   override.
5. If they override, log the reason verbatim ("Override logged: <reason>")
   and proceed.

Never proceed with a violation without an explicit, stated override reason.
"Just do it" is not a reason. "It's urgent" is not a reason. A reason names
what is being traded off and why.

### What "loudly" concretely means

"Warn loudly" is not satisfied by mentioning the problem somewhere. It has
a specific, testable meaning:

- The warning is the **primary content of a chat message to the operator**,
  not a line inside a PR body, a commit message, a collapsed `<details>`
  section, or a status footer.
- The warning **stops the workflow**. It is followed by waiting for the
  operator, not by the next git command. A warning that appears in the
  same turn as the action it was warning about is not a warning — it is a
  caption on a decision already made.
- The operator gets a **genuine decision moment**: a clear statement of
  the problem and an explicit ask. "Do you want to (a) fix it or (b)
  override with a reason?" The agent does not answer this question on the
  operator's behalf.

The test: could the operator have missed it? If the warning was bundled
into a merge, a PR body, or a wall of other output, the answer is yes,
and it was not loud. A loud warning is one the operator must respond to
before anything else happens.

### The agent never decides an override for the operator

The agent surfaces; the operator decides. The agent must not infer that a
violation is "probably fine," supply the override reason itself, or treat
operator silence as consent. If the operator is unavailable, the correct
state is **blocked** — not "proceeded because the reason seemed obvious."

This applies with full force to security findings. A failed secret scan,
a security-agent FAIL verdict, or any Tier-1 failure is surfaced and
handed to the operator. It is never downgraded, re-scoped, or shipped on
top of by agent initiative. See `references/pre-pr-gates.md`,
"The agent may not reclassify a gate."

## The lifecycle — exact commands

Every session follows this sequence. The phases are: **start the day**
(workbranch), **start a task** (worktree off workbranch), **work and
refresh**, **finish the task** (worktree → workbranch), **ship the day**
(workbranch → main).

### Phase 0 — Prepare the main checkout

The main checkout (e.g. `~/code/myrepo/`) is reserved for being on `main`.
It is NOT where work happens. Start every day by getting it fresh:

```bash
cd ~/code/myrepo
git checkout main
git pull --ff-only --prune
```

`--ff-only` refuses to merge if local `main` has diverged — investigate if
that fails. `--prune` removes references to branches deleted on origin
(e.g. yesterday's merged workbranches).

If `git status` shows anything modified in this checkout, something is
wrong (work shouldn't happen here). Stash or investigate before continuing.

### Phase 1 — Create or resume today's workbranch

The workbranch is the daily integration layer for one developer. Name format:

```
<developer>/wb-<YYYY-MM-DD>
```

Examples:
- `christian/wb-2026-05-19`
- `emmett/wb-2026-05-19`

**Check if today's workbranch already exists** (you may have created it
earlier today):

```bash
git fetch origin --quiet
git show-ref --verify --quiet refs/remotes/origin/christian/wb-2026-05-19 \
  && echo "Workbranch exists on origin — will resume" \
  || echo "Workbranch does not exist — will create"
```

**If creating** (start of day):

```bash
# Still in ~/code/myrepo on main
git checkout -b christian/wb-2026-05-19
git push -u origin christian/wb-2026-05-19
# Workbranch now exists on origin — other agents and Mission Control can see it
git checkout main  # leave main checkout on main
```

**If resuming** (mid-day, workbranch already exists on origin):

No new action needed — the workbranch exists. You'll branch task worktrees
off it shortly.

**Workbranch age check.** Before doing anything else, verify the workbranch
is under 24h old:

```bash
git log --reverse --pretty=format:%ct christian/wb-2026-05-19 ^main | head -1
# Compare result to current epoch — if > 86400 seconds, the workbranch is over cap
```

If over cap: STOP. The workbranch must ship today before any new work
starts. Skip to Phase 5 (workbranch → main). Then start a fresh workbranch
for the new day.

### Phase 2 — Create the task worktree

Task worktrees branch FROM the workbranch, not from main. They merge BACK
INTO the workbranch when complete.

**Branch naming** (unchanged from before):

```
<type>/<short-kebab-description>-<ticket-or-id>
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `hotfix`.

**Examples:**
- `feat/add-csv-export-to-reports-142`
- `fix/login-fails-on-empty-password-156`

See `references/branch-naming.md` for full convention.

**Multi-agent check.** Before creating the worktree, check if another agent
is already on this branch or working in this repo:

```bash
# List active agents and their working directories via Mission Control
# (the skill should invoke get_my_tasks or similar — see
# references/multi-agent.md)
```

If another agent has claimed this exact branch: refuse to create the
worktree, redirect the human.
If another agent has another active task in this repo: warn (they're
sharing a workbranch parent), proceed.

**Create the worktree:**

```bash
# Worktree dirname = repo dirname + "-" + branch with / replaced by -
# e.g. myrepo + feat/add-csv-export-142 → myrepo-feat-add-csv-export-142

cd ~/code/myrepo
git fetch origin --quiet
git worktree add ../myrepo-feat-add-csv-export-142 \
  -b feat/add-csv-export-142 \
  origin/christian/wb-2026-05-19
cd ../myrepo-feat-add-csv-export-142
```

The `-b` flag creates a new branch off the workbranch tip. The worktree
directory is a real, full working tree with its own `HEAD`, its own index,
and its own filesystem state. It shares the `.git` object store with the
main checkout — disk-cheap, fast to create.

**Push the branch to origin immediately:**

```bash
git push -u origin feat/add-csv-export-142
```

The branch now exists on origin from minute zero, with no commits yet.
Other agents can see it. Mission Control can see it. If your machine dies,
the branch is recoverable.

**Bootstrap the worktree — the worktree starts broken.**

A fresh worktree contains only files tracked in git. It is missing
**`.env*` files, `node_modules`, generated code, local config, and any
other `.gitignore`d state the app needs to run.** The worktree directory
will look complete, but the app will not run until bootstrap brings the
local state in.

The bootstrap is a state transition with three steps:

1. **Copy local state in.** ALL `.env*` files (not just `.env` — `.env.local`,
   `.env.development`, etc. all matter), plus any other `.gitignore`d files
   the project needs.
2. **Install dependencies.** `npm install` / `pnpm install` / `poetry install`
   / `go mod download` / `cargo build` — whatever the project uses.
3. **Verify the worktree is runnable.** Run the project's test or check
   command. If it fails, the worktree is created but flagged as NOT yet
   runnable; investigate before agent work starts.

**Use `scripts/worktree-add.sh` to handle all of this automatically:**

```bash
cd ~/code/myrepo
./scripts/worktree-add.sh feat/add-csv-export-142
# (the script creates the worktree, pushes to origin, copies .env*, runs
#  install, runs verify, and reports RUNNABLE / NOT YET RUNNABLE)
```

If running manually instead:

```bash
# 1. Copy ALL .env* files (not just .env)
for envfile in ../myrepo/.env*; do
  [ -f "$envfile" ] && cp "$envfile" "$(basename "$envfile")"
done

# 2. If a worktree-init hook exists for this repo, run it (it handles
#    install + verify per the team's convention)
[ -f ../myrepo/.worktree-init.sh ] && bash ../myrepo/.worktree-init.sh

# 3. Otherwise install + verify manually
# npm install && npm test
# poetry install && poetry run pytest
# go mod download && go test ./...
```

**Do NOT start agent work on a worktree where verify failed.** A failed
verify is a signal that the bootstrap missed something — usually an env
var, a missing local DB, or a generated file. Investigate first.

See `references/worktrees.md` for the full bootstrap guidance, common
missing-state cases (auth files, codegen, local-only scripts), and the
recommended `.worktree-init.sh` pattern your team should commit to each
repo.

### Phase 3 — Work, commit, refresh

Inside the worktree, work normally. Commit early and often.

**Commit message format** (Conventional Commits):

```
<type>(<scope>): <imperative summary under 72 chars>

<optional body explaining why, not what>

<optional footer: refs #142, BREAKING CHANGE:, etc.>
```

**Commit command:**

```bash
git add -p                          # stage in hunks
git commit -m "feat(reports): add CSV export endpoint"
```

**Refresh from the workbranch at least every 2 hours of active work:**

```bash
git fetch origin
git rebase origin/christian/wb-2026-05-19
```

Note: rebase onto the **workbranch**, not main. The workbranch is your
parent. The workbranch's own continuous-rebase-onto-main keeps it aligned
with main — your worktree gets `main`'s changes transitively.

**Continuous rebase of the workbranch onto main** is a separate operation —
done in the main checkout, not in the worktree. The skill should perform
this on a cadence (at task starts and every ~2h):

```bash
# In the main checkout
cd ~/code/myrepo
git fetch origin --quiet
git checkout christian/wb-2026-05-19
git rebase origin/main
git push --force-with-lease origin christian/wb-2026-05-19
git checkout main  # return main checkout to main
```

After this rebase, active worktrees branched off the workbranch need to
rebase onto it themselves (their parent moved). The skill should announce
when it has rebased the workbranch so any running agents know to refresh.

If conflicts come up during any rebase: resolve them, `git add`,
`git rebase --continue`. See `references/conflict-resolution.md` for the
full guide.

**After a rebase, force-with-lease the worktree's branch:**

```bash
git push --force-with-lease origin feat/add-csv-export-142
```

### Phase 4 — Finish the task (worktree → workbranch)

When a task is complete:

#### 4a — Run the lightweight gate flow for worktree → workbranch

This is a lighter-weight version of the full pre-PR gates, since the
workbranch is a staging area, not prod. See `references/pre-pr-gates.md`
section "Worktree → workbranch gates" for the full list. Summary:

**Tier 1 hard gates (must pass):**
- Tests pass locally
- Type-check passes
- Linter passes
- Formatter has run
- Secret scan passes
- No junk files in diff
- Branch state valid
- PR body filled out
- **Security agent review** complete (PASS / PASS WITH NOTES)
- **Chrome DevTools console** inspected (when diff touches UI)
- **Operator sign-off** with the phrase: `I have reviewed the diff and approve`

**Tier 2 warn-override gates:**
- Operator personally exercised the change
- Tests added for new behavior
- Diff size sane
- Branch age under cap
- No debug statements
- Feature flag wired if partial/risky
- Commit messages meaningful
- Risk level stated

#### 4b — Open the PR (worktree → workbranch)

```bash
gh pr create \
  --base christian/wb-2026-05-19 \
  --head feat/add-csv-export-142 \
  --title "feat(reports): add CSV export endpoint" \
  --body "$(cat <<'EOF'
## What
[1-2 sentences]

## Why
[ticket link or reason]

## How to test
[concrete steps]

## Local verification
- Tests: X passed, 0 failed
- Typecheck: clean
- Lint: clean
- Format: clean
- Secret scan: no findings
- Operator exercised locally: yes

## Security review
[PASS / PASS WITH NOTES — notes inline]

## Console output
[Baseline: clean | After: any new warnings/errors with classification]

## Risk
Low / Medium / High — [justification]
EOF
)"
```

#### 4c — Merge into the workbranch

When approved (which may be your teammate, or yourself in a 2-person team
where you've reviewed your own diff — the security agent and operator
sign-off are the real gates), squash-merge:

```bash
gh pr merge --squash --delete-branch
```

`--delete-branch` deletes the remote branch automatically.

#### 4d — Clean up the worktree

```bash
cd ~/code/myrepo
git worktree remove ../myrepo-feat-add-csv-export-142
# If that refuses because of "untracked files" or similar after a successful
# merge, use --force (the merge is confirmed):
# git worktree remove --force ../myrepo-feat-add-csv-export-142
```

`git worktree remove` cleans up both the directory and git's internal
tracking. The branch was already deleted by `gh pr merge --delete-branch`.

### Phase 5 — Ship the day (workbranch → main)

At end of day (or when the workbranch has accumulated a meaningful batch
of completed work), ship the workbranch to main via the full pre-PR gate
flow.

#### 5a — Final rebase of the workbranch onto main

```bash
cd ~/code/myrepo
git fetch origin --quiet
git checkout christian/wb-2026-05-19
git rebase origin/main
# Resolve any conflicts, then:
git push --force-with-lease origin christian/wb-2026-05-19
```

If continuous rebase has been happening as required, this should be a
no-op or trivial.

#### 5b — Walk the FULL pre-PR gates

This is the gate flow defined in `references/pre-pr-gates.md` — the same
one we built for branch-to-main. The workbranch is treated as one logical
PR's worth of changes. All Tier 1 gates must pass. Tier 2 gates warn
with override. Tier 3 gets recorded.

#### 5c — Open the workbranch → main PR

```bash
gh pr create \
  --base main \
  --head christian/wb-2026-05-19 \
  --title "Ship: christian's batch for 2026-05-19" \
  --body "$(cat <<'EOF'
## Batch summary
This PR ships today's accumulated work from christian/wb-2026-05-19.

## Tasks included
- feat(reports): add CSV export endpoint (#142)
- fix(auth): reject empty passwords at validator (#156)
- refactor(pdf): extract pdf-generator into its own module

## Local verification (workbranch as a whole)
- Tests: X passed, 0 failed
- Typecheck: clean
- Lint: clean
- Format: clean
- Secret scan: no findings
- Operator exercised the integrated workbranch end-to-end: yes

## Security review
[PASS / PASS WITH NOTES on the cumulative diff]

## Console output
[Baseline vs after, on the integrated workbranch]

## Risk
[Aggregate risk for the batch]

## Feature flags introduced
- REPORTS_CSV_EXPORT (default off, see #142)

## Notes for the next day
[Anything the team should know going into tomorrow]
EOF
)"
```

#### 5d — Merge to main

When the gates pass and the operator has signed off:

```bash
gh pr merge --merge --delete-branch
```

For workbranch → main, prefer **`--merge`** (a merge commit) over `--squash`,
because the individual task commits on the workbranch each tell a useful
story and you want them preserved in `main`'s history. The merge commit
itself is the "ship the day" marker.

`--delete-branch` deletes the workbranch from origin.

#### 5e — Clean up locally

```bash
cd ~/code/myrepo
git checkout main
git pull --ff-only --prune
git branch -d christian/wb-2026-05-19
```

The workbranch is now gone — locally, on origin, and from your day. Start
fresh tomorrow with a new workbranch.

## Feature flags

Partial work goes behind a feature flag. The mechanism can be simple — env
vars work fine for internal tools. See `references/feature-flags.md` for
patterns in Python, TypeScript, and Go, plus the cleanup discipline.

When the user asks "should I open a PR even though this isn't done?" — the
answer is yes, behind a feature flag. That's the answer at both PR moments
(worktree → workbranch and workbranch → main).

## Hotfix path (exception, not default)

Hotfixes do NOT follow the workbranch flow. They branch directly off the
last released commit on `main`, merge directly to `main`, deploy via normal
CI/CD.

```bash
cd ~/code/myrepo
git checkout main
git pull --ff-only --prune
git worktree add ../myrepo-hotfix-prod-crash -b hotfix/prod-crash main
cd ../myrepo-hotfix-prod-crash
# Make the minimal fix
git add -p && git commit -m "hotfix: fix prod login crash"
git push -u origin hotfix/prod-crash
gh pr create --base main --title "hotfix: prod login crash" --label urgent
```

After merge, the fix flows to prod via normal CI/CD. The hotfix bypasses
the workbranch because it's an emergency that can't wait for the daily
ship cycle. Still goes through PR review (smallest possible change, paired
eyes, even if quick).

After the hotfix lands on `main`, the active workbranch needs to rebase
onto the new `main` to pick up the fix:

```bash
cd ~/code/myrepo
git fetch origin --quiet
git checkout christian/wb-2026-05-19
git rebase origin/main
git push --force-with-lease origin christian/wb-2026-05-19
```

## Common situations and what to do

### "The worktree was created but the app won't run / tests fail with missing env vars"

The worktree starts broken — see Phase 2's bootstrap section and
`references/worktrees.md`. The most common cause is that `.env` or other
`.env*` files weren't copied across because they're `.gitignore`d.

Fix:
```bash
# In the worktree, copy ALL .env* files from the main checkout
for envfile in ../<repo-name>/.env*; do
  [ -f "$envfile" ] && cp "$envfile" "$(basename "$envfile")"
done
```

Then re-run the verify command. If it still fails, check for other
missing local state: generated code (run codegen), local DB connection
config, project-specific local files. If your team commits a
`.worktree-init.sh`, this should be automatic — if you keep hitting
this, update the team's `.worktree-init.sh` so the next worktree handles
it without manual intervention.

### "I'm starting fresh — no workbranch exists yet today"

Phase 0 → Phase 1 (create workbranch) → Phase 2 (create first task worktree).

### "I have an existing workbranch from earlier today and want to start a new task"

Phase 0 (refresh main checkout) → Phase 2 (create task worktree off the
existing workbranch). Skip Phase 1.

### "The workbranch is 26 hours old"

Over cap. Phase 5 (ship to main) immediately, before starting any new
work. Then Phase 1 to create today's fresh workbranch.

### "Emmett pushed to his workbranch and I want to see his changes"

You don't — workbranches don't talk to each other. Wait for his workbranch
to merge to main, then your continuous-rebase will pull it in.

If you need to see his code right now (he's blocking you), look at his
branch on GitHub directly: `gh pr view <emmett's PR>`. Don't merge or
rebase his workbranch into yours.

### "My task depends on a task that's still in another worktree (not merged to workbranch yet)"

Three options:

1. **Wait** for the parent task to merge to workbranch, then start.
2. **Stacked branches**: create your worktree off the in-flight task branch
   (not the workbranch). When the parent lands, rebase yours onto the
   workbranch. More complex but lets you work in parallel.
3. **Pair-program** on the parent task to get it shipped faster.

Default: option 1 if you can wait, option 3 if you can't.

### "Another agent is in this repo already"

The multi-agent check in Phase 2 detects this. If they're on a different
task, proceed — your worktrees won't collide. If they're on the same task,
stop and resolve at the human level.

### "My branch is way behind workbranch and rebase is a nightmare"

See `references/conflict-resolution.md`. The fast escape is: cherry-pick
your commits onto a fresh worktree off the current workbranch, abandon
the old worktree.

### "CI failed on main"

Trunk is broken. Highest priority. No new workbranches start, no
workbranches ship, until `main` is green. Hotfix or revert.

### "CI failed on my workbranch"

The workbranch is broken. Highest priority for YOU (other agents on other
workbranches are unaffected). Find the offending task, revert its merge
commit on the workbranch, or fix-forward immediately. Don't start new
tasks on a broken workbranch.

### "I want to commit directly to main or to the workbranch (not via PR)"

Don't. PR-gated merges at both levels. If a change is truly trivial (typo
in a README), open the PR anyway — it takes 30 seconds and CI runs.

Override possible (e.g., the README typo), but log the reason.

## Quick reference card

```bash
# === Start of day ===
cd ~/code/myrepo
git checkout main && git pull --ff-only --prune
git checkout -b christian/wb-2026-05-19
git push -u origin christian/wb-2026-05-19
git checkout main

# === Start a task (off the workbranch) ===
git fetch origin --quiet
git worktree add ../myrepo-feat-csv-export -b feat/csv-export-142 \
    origin/christian/wb-2026-05-19
cd ../myrepo-feat-csv-export
git push -u origin feat/csv-export-142
# Then bootstrap (cp .env, npm install, etc.)

# === While working: refresh ===
# Workbranch onto main (every ~2h, done in main checkout)
cd ~/code/myrepo
git checkout christian/wb-2026-05-19 && git fetch origin
git rebase origin/main && git push --force-with-lease
git checkout main

# Task worktree onto workbranch (every ~2h, done in worktree)
cd ../myrepo-feat-csv-export
git fetch origin && git rebase origin/christian/wb-2026-05-19
git push --force-with-lease origin feat/csv-export-142

# === Finish a task (worktree → workbranch) ===
gh pr create --base christian/wb-2026-05-19 --head feat/csv-export-142 \
    --title "..." --body "..."
gh pr merge --squash --delete-branch

cd ~/code/myrepo
git worktree remove ../myrepo-feat-csv-export

# === Ship the day (workbranch → main) ===
cd ~/code/myrepo
git checkout christian/wb-2026-05-19
git fetch origin && git rebase origin/main
git push --force-with-lease

# Walk full pre-PR gates, then:
gh pr create --base main --head christian/wb-2026-05-19 --title "..." --body "..."
gh pr merge --merge --delete-branch

git checkout main && git pull --ff-only --prune
git branch -d christian/wb-2026-05-19
```

## When to read the references

- **`references/worktrees.md`** — REQUIRED for any worktree operation. Full
  mental model, layout convention, bootstrap hooks, troubleshooting (stale
  worktrees, locked worktrees, the same-branch-twice error).
- **`references/workbranches.md`** — REQUIRED for understanding the daily
  workbranch. Naming, lifecycle, the continuous-rebase cadence, what to do
  when the workbranch goes wrong.
- **`references/multi-agent.md`** — REQUIRED when multiple agents are
  active in the same repo. The detection protocol, coordination via Mission
  Control, what to do when worktree state is ambiguous.
- **`references/pre-pr-gates.md`** — REQUIRED reading before any `gh pr create`
  call. The canonical pre-PR gate list, with two sections: gates for
  worktree → workbranch (lighter) and gates for workbranch → main (full).
- `references/branch-naming.md` — full naming convention (task branches and
  workbranches).
- `references/pr-template.md` — copy-paste PR templates for both PR moments.
- `references/feature-flags.md` — flag patterns and cleanup checklist.
- `references/conflict-resolution.md` — step-by-step rebase conflict recovery.
- `references/policy-violations.md` — full list of policy checks and the
  warning/override flow.

## When to run the scripts

- `scripts/check-branch.sh` — run before any push, validates branch name,
  age, worktree status. Designed for pre-push hook.
- `scripts/branch-age.sh` — quick age check on a branch.
- `scripts/secret-scan.sh` — Tier 1 gate; prefers gitleaks/trufflehog, falls
  back to a regex pass.
- `scripts/worktree-add.sh` — wrapper for `git worktree add` that handles
  bootstrap (copy .env, run install hook, push to origin).
- `scripts/worktree-list.sh` — audit view of worktrees and their owners
  via Mission Control.
- `scripts/workbranch-status.sh` — shows today's workbranch state: age,
  active task worktrees, drift from main, pending merges.

## Important behavioral notes for Claude Code

- **Always check workbranch state first.** Before any branch operation,
  know which workbranch is active today and whether it's under cap.
- **Always check for other agents.** Before creating a worktree, run the
  multi-agent check (see `references/multi-agent.md`).
- **Always push branches to origin immediately on creation.** Workbranches
  AND task branches. The branch must exist on origin before work begins.
- **The two PR moments are different.** Worktree → workbranch is light
  gates. Workbranch → main is full gates. Don't conflate them.
- **State the rule, not just "policy says no."** "Workbranch is 26 hours
  old, cap is 24" is useful. "Policy violation" is not.
- **Suggest the compliant alternative before asking for an override.** The
  override is a last resort.
- **Log overrides verbatim.** When the user gives a reason, repeat it back.
- **The main checkout is sacred.** It stays on `main`. No work happens
  there. Every other branch lives in a worktree.
- **Continuous rebase is not optional.** The model only works if workbranches
  pull from main continuously. If you've been working for more than ~2 hours
  without a rebase, do one before continuing.
