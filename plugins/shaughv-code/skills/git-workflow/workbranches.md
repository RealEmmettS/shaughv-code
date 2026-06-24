# Workbranches

The workbranch is the daily integration layer for one developer's batch of
completed tasks. It is the new piece that this team's git workflow adds to
plain TBD.

## What a workbranch is

A workbranch is a short-lived (≤24h) branch off `main`, owned by one
developer, into which that developer's completed task worktrees merge.
At end of day, the workbranch goes through the full pre-PR gate flow and
merges into `main`.

```
main
 └── taylor/wb-2026-05-19         ← Taylor's daily workbranch
      ├── feat/csv-export-142     ← worktree task
      ├── fix/auth-bug-156        ← worktree task
      └── refactor/pdf-gen-203    ← worktree task
```

Workbranches enable:
- **Multiple agents** running parallel tasks for one developer without
  hammering `main` with N small PRs per hour.
- **Batched review** at day-end — one focused review session covering the
  day's output, rather than scattered context-switching.
- **A staging area** where work can be exercised together before going to
  `main`, in case tasks have implicit interactions.

What workbranches do NOT do:
- They don't merge into each other. Taylor's and Emmett's workbranches
  never touch; they only meet on `main`.
- They don't live longer than 24 hours, ever. If a batch isn't ready to
  ship in a day, it ships incomplete (behind flags) or gets sliced.
- They aren't a place to hide unreviewed work. Every task worktree → workbranch
  merge goes through the lightweight gate flow first.

## Workbranch naming

```
<developer>/wb-<YYYY-MM-DD>
```

The `wb-` prefix makes workbranches distinct from any other personal branch.
The date is for human readability and forensic value. Examples:

- `taylor/wb-2026-05-19`
- `emmett/wb-2026-05-19`
- `taylor/wb-2026-05-20`

If you happen to create a second workbranch in the same day (rare —
typically because you shipped the first one at lunch and started fresh
for the afternoon), append `-pm` or `-2`:

- `taylor/wb-2026-05-19-pm`
- `taylor/wb-2026-05-19-2`

## Workbranch lifecycle

### Creating

In the main checkout, on `main`:

```bash
cd ~/code/myrepo
git checkout main
git pull --ff-only --prune
git checkout -b taylor/wb-2026-05-19
git push -u origin taylor/wb-2026-05-19
git checkout main           # return main checkout to main
```

The branch is now on origin from minute zero. Task worktrees can be branched
off `origin/taylor/wb-2026-05-19` immediately.

### Working on it (via task worktrees)

You never `git checkout` the workbranch in the main checkout for normal
work. Task worktrees do the work. The workbranch only sees merges, never
direct commits (except possibly the continuous-rebase, which doesn't add
commits — it replays them).

### Continuous rebase from main

The most important workbranch mechanic. The workbranch MUST rebase onto
`origin/main` at least every 2 hours of active development. This prevents
the workbranch from drifting away from `main`.

```bash
cd ~/code/myrepo
git checkout taylor/wb-2026-05-19
git fetch origin
git rebase origin/main
git push --force-with-lease origin taylor/wb-2026-05-19
git checkout main           # return to main on main checkout
```

After this rebase, any active task worktrees branched off the workbranch
need to rebase themselves onto the new workbranch tip — their parent moved.

The skill should:
- Run this rebase at start of every new task
- Run this rebase at start of every PR merge (worktree → workbranch)
- Run this rebase on a 2-hour cadence during long sessions
- Announce when it has rebased the workbranch so any running agents know
  to refresh

### Merging task worktrees in

See `SKILL.md` Phase 4. Squash-merge for clean workbranch history.

### Shipping to main

See `SKILL.md` Phase 5. Merge commit (not squash) to preserve the per-task
history on `main`.

### Cleanup

After the workbranch merges to `main`:

```bash
cd ~/code/myrepo
git checkout main
git pull --ff-only --prune
git branch -d taylor/wb-2026-05-19   # local cleanup
# The remote was deleted by `gh pr merge --delete-branch`
```

The next day, start a fresh workbranch.

## Workbranch age cap: 24 hours

A workbranch that lives longer than 24 hours starts behaving like GitFlow's
`develop` branch — accumulating divergence from `main`, hiding integration
problems until merge time. This is the failure mode the model is designed
to prevent.

**At 18 hours of age**: the skill warns. "Workbranch is 18h old, cap is
24h. Plan to ship soon."

**At 22 hours of age**: the skill blocks creation of new task worktrees
off this workbranch. Existing in-flight tasks can complete and merge in,
but no new work starts.

**At 24+ hours**: the skill refuses anything except the workbranch → main
merge flow. The workbranch must ship before any new work begins. If the
batch isn't ready, ship it with feature flags off and continue tomorrow.

## What if the workbranch is broken (CI red)?

A broken workbranch blocks merging new tasks in (they'd compound the
break) and blocks shipping to main (you can't merge red work into a green
trunk).

When this happens:

1. **Stop merging new tasks in.** Don't pile on.
2. **Identify the offending merge.** `git log --merges --oneline` on the
   workbranch shows recent merges; the most recent one before CI went red
   is the suspect.
3. **Revert it on the workbranch** OR fix-forward immediately:
   ```bash
   # Revert
   git checkout taylor/wb-2026-05-19
   git revert -m 1 <merge-commit-sha>
   git push origin taylor/wb-2026-05-19
   ```
4. **Communicate** with anyone whose task worktree was branched off the
   workbranch — their base just moved.

If the workbranch is unrecoverable (e.g., bad enough that revert is
worse than starting over): abandon the workbranch and cherry-pick the
salvageable work onto a fresh workbranch off `main`. Yesterday's lessons
become tomorrow's checklist.

## What if I ship multiple times a day?

That's fine — encouraged, even. The workbranch isn't required to live the
full 24h. If by 2pm you have a coherent batch ready to ship:

1. Phase 5 (ship workbranch to main).
2. Delete the workbranch.
3. Phase 1 again (create a new workbranch for the afternoon).
4. New task worktrees branch off the new workbranch.

The naming for the afternoon workbranch can be `taylor/wb-2026-05-19-pm`
or `taylor/wb-2026-05-19-2`. Either is fine.

The 24h cap is a maximum, not a target. Smaller batches are better.

## Multi-developer workbranches

Each developer has their own workbranch. They never merge into each other.
They both rebase onto `main` continuously, which keeps them implicitly in
sync (whatever lands on `main` lands on both workbranches within ~2h via
the rebase).

Conflict scenarios:

**Taylor and Emmett both touch the same file in their workbranches.**
Whichever workbranch lands on `main` first wins. The second one rebases
onto the new `main` (which now includes the first one's changes) and
resolves conflicts at that point.

**Taylor and Emmett's tasks have a semantic dependency.** E.g., Emmett's
task adds a new function that Taylor's task calls. Resolution depends
on which lands first:
- If Emmett's lands first, Taylor's continuous rebase picks up the new
  function; Taylor's task continues normally.
- If Taylor's lands first, that task is calling a function that doesn't
  exist yet, which means the test gate caught it before merge — or didn't,
  and `main` is now broken (revert immediately).

Best practice: when you know your task depends on another developer's
in-flight work, **wait for theirs to land first**. Or coordinate at the
human level.

## When NOT to use the workbranch flow

There are cases where the workbranch is the wrong tool:

- **Hotfixes.** Branch directly off `main`, merge directly to `main`. The
  workbranch is for planned work; hotfixes are emergencies.
- **Single-task days.** If you'll only do one task today, the workbranch
  adds friction without benefit. Override-allow direct branch-to-main is
  acceptable here with a stated reason. (The skill will warn.)
- **Trivial doc fixes.** Same logic.

Don't optimize for the edge case at the cost of the common path. The
common path is "multiple tasks per day per developer, multiple agents in
parallel" — that's what the workbranch is for.

## Why workbranches don't talk to each other

Tempting alternative: "let workbranches merge into each other so we can
share in-flight work."

Don't. Reasons:

- It makes the cross-developer dependency explicit, which means BOTH
  workbranches have to be on a synchronized merge schedule. You lose the
  per-developer autonomy that's the whole point.
- It creates a third integration point with its own conflict surface.
- It's a slide toward the GitFlow-style `develop` branch that TBD was
  designed against.

If you need to share in-flight work, the patterns are:

- **Land it to main faster.** Ship the small piece you need to share,
  then both workbranches see it via continuous rebase.
- **Stacked branches.** One developer's task worktree branches off the
  other developer's task branch (not their workbranch). Rare but works.
- **Pair-program.** One agent or one developer at a time, two heads
  thinking. Bypasses the question entirely.

## Workbranch quick reference

```bash
# Start of day — create workbranch
cd ~/code/myrepo
git checkout main && git pull --ff-only --prune
git checkout -b $(whoami)/wb-$(date +%Y-%m-%d)
git push -u origin HEAD
git checkout main

# Rebase workbranch onto main (every ~2h)
git checkout $(whoami)/wb-$(date +%Y-%m-%d)
git fetch origin && git rebase origin/main
git push --force-with-lease
git checkout main

# Ship workbranch (Phase 5)
git checkout $(whoami)/wb-$(date +%Y-%m-%d)
git fetch origin && git rebase origin/main
# Walk full pre-PR gates...
gh pr create --base main --head $(whoami)/wb-$(date +%Y-%m-%d) --title "..." --body "..."
gh pr merge --merge --delete-branch

# Post-ship cleanup
git checkout main && git pull --ff-only --prune
git branch -d $(whoami)/wb-$(date +%Y-%m-%d)
```
