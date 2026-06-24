# Conflict Resolution

Rebasing onto fresh `main` is where conflicts surface. Here's how to handle
them without losing work.

## The rebase, step by step

```bash
git fetch origin
git rebase origin/main
```

If there are no conflicts, you're done. If there are, git stops at the first
conflicted commit and tells you so:

```
CONFLICT (content): Merge conflict in src/reports.py
error: could not apply 1a2b3c4... feat(reports): add CSV export endpoint
```

## Inspecting conflicts

```bash
git status
```

Shows which files have conflicts. Open each one — git has marked the
conflict regions:

```python
<<<<<<< HEAD
def export(report):
    return jsonify(report.data)
=======
def export(report, format="json"):
    if format == "csv":
        return csv_response(report)
    return jsonify(report.data)
>>>>>>> 1a2b3c4 (feat(reports): add CSV export endpoint)
```

`HEAD` is what's currently on the branch being rebased onto (i.e., the
new `main`). The bottom section is your commit. Decide what the merged
version should look like, delete the conflict markers, save.

## Continuing or aborting

After fixing all conflicts in a step:

```bash
git add <fixed-files>
git rebase --continue
```

Git will move to the next commit. If there are more conflicts, repeat.

If a single commit has multiple files with conflicts, fix all of them
before `--continue`.

If you've made a mess and want to start over:

```bash
git rebase --abort
```

This restores the branch to exactly where it was before the rebase. It is
**safe** to abort — nothing is lost.

## Strategies for nasty conflicts

### Strategy 1: skip a problem commit

If one of your commits is causing all the trouble and you can rewrite it
later:

```bash
git rebase --skip
```

This drops the current commit and continues. Use carefully — you'll need
to redo whatever that commit was doing.

### Strategy 2: keep their version or yours wholesale for a file

```bash
# Take main's version of this file entirely
git checkout --theirs path/to/file.py
git add path/to/file.py
git rebase --continue

# Take your branch's version of this file entirely
git checkout --ours path/to/file.py
git add path/to/file.py
git rebase --continue
```

Note: in a rebase, "ours" and "theirs" are flipped from what you might
expect — "ours" is `main` (the branch you're rebasing onto), "theirs" is
your branch. This is a known git confusion. Verify with `git diff` after.

### Strategy 3: abort and cherry-pick

If the rebase is fighting you and the branch is old enough that conflicts
are pervasive, abort and cherry-pick onto a fresh branch:

```bash
git rebase --abort
git log --oneline    # note your SHAs
git checkout main
git pull --ff-only --prune
git checkout -b feat/<new-name>
git cherry-pick <sha1> <sha2> <sha3>
```

Resolve any conflicts during cherry-pick the same way. This often works
better when only a couple of commits actually matter.

## After a successful rebase

The branch has been rewritten — every commit has a new SHA. The remote
copy doesn't know about this. Force-push with lease:

```bash
git push --force-with-lease origin <branch-name>
```

If `--force-with-lease` is rejected, that means the remote has commits you
don't have. Fetch and check:

```bash
git fetch origin
git log HEAD..origin/<branch-name> --oneline
```

If those are commits you don't recognize, **stop**. Either your teammate
pushed to your branch (violation — talk to them) or something else odd
is happening. Don't blow them away with `--force`.

## Conflicts during a `git pull` on main

This shouldn't happen if you always use `--ff-only`:

```bash
git pull --ff-only --prune
```

If `--ff-only` fails, your local `main` has commits that origin doesn't.
Investigate:

```bash
git log origin/main..main --oneline
```

If you accidentally committed to `main`:

1. Branch off your local main to save the work: `git checkout -b <fix-name>`
2. Reset local main: `git checkout main && git reset --hard origin/main`
3. Open a PR for `<fix-name>` as normal

## Semantic conflicts

The hardest conflicts aren't textual — they're when the code merges cleanly
but the behavior is wrong. Example: you rename a function on your branch,
your teammate adds a new call to the old name on theirs. Git won't flag it.

Defense:

- Run tests after every rebase. `pytest` / `npm test` / etc. before pushing.
- Run the app locally for a moment to smoke-test.
- If you renamed something or changed a signature, mention it in the PR
  body so the reviewer looks for callers.

## When to ask for help

- The rebase has been open for more than 30 minutes
- You've aborted twice and still don't have a plan
- You're about to use `--force` without `--lease`

In all three cases: stop, ask your teammate. Rebase conflicts are easier
to talk through together than to fight alone.
