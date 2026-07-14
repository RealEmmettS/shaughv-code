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
4. **Accept a clear owner decision.** "If you want to continue on this
   branch anyway, say so and I'll proceed."
5. **Acknowledge the route override once.** Do not demand a justification or
   repeat the approval prompt after an unambiguous answer.

## What counts as approval

Any clear owner/operator instruction counts:

- "I approve a push to main."
- "Push directly to the default branch when ready."
- "Proceed with this branch."
- "Override the PR route."

No magic phrase or tradeoff explanation is required, and an advance "when
ready" directive stays valid after checks finish. Silence or ambiguity does
not count.

The approval changes the delivery route, not the quality bar. Continue local
tests, lint/format/build checks, secret scanning, sync checks, and post-push CI.
If one of those checks fails, disclose that specific failure and get a fresh
decision about it; the earlier route approval does not silently accept it.

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
> If you'd rather push as-is, say so and I'll proceed after the normal checks.

### Example 2: direct commit to main

> **User:** Just commit this typo fix straight to main.
>
> **Claude:** Direct commits to `main` bypass the PR + CI gate. For a typo
> in a README this is low-risk, but the policy is PR-gated merges.
>
> Recommended: `git checkout -b docs/fix-typo-in-readme && git add ...
> && git commit && gh pr create`. The PR takes 30 seconds and CI runs.
>
> If you approve the direct push, say so and I'll proceed after the same local
> checks, then verify CI on `main`.

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
> If the teammate knows and you still want this route, confirm that coordination
> and I'll proceed.

## Things the agent may never decide on its own

These are not agent decisions. The agent halts and hands them to the
operator — it does not override, downgrade, or proceed by inference:

- **Plain `--force` to a shared branch.** Use `--force-with-lease` or stop.
  Plain `--force` can silently destroy work.
- **Pushing to someone else's branch without their knowledge.** Coordinate
  first.
- **A hardcoded secret, credential, or API key found anywhere in the repo.**
  This is Tier-1 gate T1.5. The agent does NOT get to decide it is
  acceptable. Specifically, the agent must NOT:
  - re-scope the secret scan to "diff-only" so a pre-existing secret
    stops showing up;
  - record a secret-scan hit as "PASS WITH NOTES";
  - write the finding into a PR body and merge on top of it;
  - reason "private repo / low blast radius / author intended it" and
    proceed.
  The agent halts, warns the operator clearly and directly, and waits. Only
  the operator may accept the specific disclosed finding. A brief explicit
  acceptance is enough; no essay or prescribed phrase is required. Record
  the accepted exception in the available delivery record (PR body when
  there is a PR, otherwise the commit/release notes or chat). Remediation is:
  remove the secret, rotate/revoke it at the provider, and move it to an env
  var or secret manager.
- **A security-agent FAIL verdict (Critical/High finding).** Same handling
  as above — surfaced to the operator, never downgraded by the agent.

If the operator chooses to accept one of these, that is their call to
make and to log. The agent's job is to make sure the decision is the
operator's, made knowingly, and recorded — not to make it quietly on
their behalf.
