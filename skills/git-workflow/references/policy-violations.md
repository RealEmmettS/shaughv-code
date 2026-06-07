# Policy Violations — Full Checklist

When Claude Code is about to perform a git operation, it should mentally walk
this list. If any check fails, follow the warn-and-override flow below.

## The checks

| # | Check | How to verify |
|---|---|---|
| 1 | Not committing directly to `main` | `git branch --show-current` ≠ `main` |
| 2 | Branch name matches convention | regex: `^(feat|fix|refactor|chore|docs|test|hotfix)/[a-z0-9-]+$` |
| 3 | Branch age ≤ 48 hours | `git log --reverse --pretty=format:%ct <branch> ^main \| head -1` |
| 4 | Only one developer on this branch | `git log --format=%ae <branch> ^main \| sort -u` returns 1 (or 2 if pair) |
| 5 | Branch is up to date with `main` | `git fetch && git log <branch>..origin/main` is empty |
| 6 | Local build/tests pass before push | run the project's test command |
| 7 | PR exists before merge attempt | `gh pr view` succeeds |
| 8 | CI is green before merge | `gh pr checks` all pass |
| 9 | Force-push uses `--force-with-lease` | never plain `--force` |
| 10 | Branch is deleted after merge | local and remote |
| 11 | Partial work is behind a feature flag | grep PR body for `flag` or `FLAG:` |
| 12 | Trunk is green before starting new work | `gh run list --branch main --limit 1` succeeds |

## Warn-and-override flow

When a check fails:

1. **Name the rule.** "Branch length cap is 48 hours; this branch was created
   72 hours ago."
2. **Explain the specific risk.** "Branches this old tend to develop merge
   conflicts with main, especially if other PRs have landed since."
3. **Offer the compliant alternative.** "I'd recommend either (a) landing what
   you have behind a feature flag and continuing on a fresh branch, or (b)
   slicing the remaining work into smaller chunks."
4. **Ask for override reason if they want to proceed.** "If you want to
   continue on this branch anyway, tell me why — I'll log the reason."
5. **Log the reason verbatim if they override.** "Override logged: <quoted reason>."

## What counts as a valid override reason

Valid reasons name a trade-off:

- "The work is one logical unit and splitting it would create more risk than
  it removes."
- "I'm an hour from done and a fresh branch costs more than the extra hour."
- "We have a customer demo tomorrow and ceremony cost isn't worth it."

Invalid reasons:

- "Just do it"
- "It's fine"
- "Trust me"
- (no reason at all)

If the user gives a non-reason, ask again: "I need a reason that names the
trade-off. What's being traded off and why?"

## Examples of warn-and-override in action

### Example 1: stale branch

> **User:** Push my changes to the `feat/big-thing-89` branch.
>
> **Claude:** That branch was created 64 hours ago, which is past our 48-hour
> cap. Branches this old often hit conflicts when they finally land, and the
> cap exists to keep merges small.
>
> Recommended path: land what's currently green behind a feature flag, open
> the PR, and continue on a fresh branch off the merged `main`. I can walk
> you through that.
>
> If you'd rather push as-is, tell me why and I'll proceed.

### Example 2: direct commit to main

> **User:** Just commit this typo fix straight to main.
>
> **Claude:** Direct commits to `main` bypass the PR + CI gate. For a typo
> in a README this is low-risk, but the policy is PR-gated merges.
>
> Recommended: `git checkout -b docs/fix-typo-in-readme && git add ...
> && git commit && gh pr create`. The PR takes 30 seconds and CI runs.
>
> If you want to bypass anyway, tell me why and I'll proceed. (Acceptable
> example reason: "Trivial doc fix, no code logic, CI on docs-only changes
> adds no value here.")

### Example 3: force-push without lease

> **User:** Force push my branch — I rebased and the push is rejected.
>
> **Claude:** I'll use `--force-with-lease` rather than plain `--force`.
> `--force-with-lease` will refuse the push if origin has commits we don't
> know about, which protects against accidentally overwriting your teammate's
> work. Plain `--force` doesn't have that safety net.
>
> Running: `git push --force-with-lease origin <branch>`.
>
> (If `--force-with-lease` is rejected, that's a signal to investigate before
> overriding — likely someone else pushed to the branch.)

### Example 4: branch shared by two devs

> **User:** Push my changes to `feat/parser-refactor-203` — that's the
> branch my teammate started.
>
> **Claude:** That branch already has commits from your teammate. The policy
> is one developer per branch (or two if pair-programming on one machine).
> Sharing a branch tends to cause force-push surprises and confuses review.
>
> Recommended: either pair on one machine, or start a fresh branch off
> current `main` and cherry-pick what you need from theirs.
>
> If you want to push to their branch anyway, tell me why.

## Things that are never overridable

These are hard refusals — no override accepted:

- **Plain `--force` to a shared branch.** Use `--force-with-lease` or stop.
  Plain `--force` can silently destroy work.
- **Pushing to someone else's branch without their knowledge.** Coordinate
  first.
- **Committing secrets, credentials, or API keys.** Stop, rotate the secret,
  use the project's secret-management approach.

If the user really wants to do one of these, they need to run the commands
themselves outside this skill.
