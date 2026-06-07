# Branch Naming Convention

There are two kinds of branches in this workflow: **task branches** (the
main case — feature work) and **workbranches** (daily per-developer
integration layers).

## Workbranches

```
<developer>/wb-<YYYY-MM-DD>[-<suffix>]
```

Examples:
- `taylor/wb-2026-05-19`
- `emmett/wb-2026-05-19`
- `taylor/wb-2026-05-19-pm` (a second workbranch the same day)
- `taylor/wb-2026-05-19-2` (alternative second-workbranch naming)

The `wb-` prefix marks the branch as a workbranch. The date is for human
readability. Workbranches live ≤24h and merge to `main` via the full
pre-PR gate flow.

See `references/workbranches.md` for the full workbranch model.

## Task branches

```
<type>/<short-kebab-description>[-<ticket-id>]
```

Task branches live in worktrees (per `references/worktrees.md`) and merge
into the developer's workbranch via the lightweight gate flow. They live
≤2 days.

## Type prefixes

| Type | When to use | Example |
|---|---|---|
| `feat` | New user-facing or API capability | `feat/add-csv-export-142` |
| `fix` | Bug fix, behavior correction | `fix/null-pointer-on-empty-cart-89` |
| `refactor` | Internal change, no behavior change | `refactor/extract-pdf-generator` |
| `chore` | Tooling, deps, build, config | `chore/upgrade-node-to-22` |
| `docs` | Documentation only | `docs/clarify-deploy-runbook` |
| `test` | Test-only additions or fixes | `test/add-auth-edge-cases` |
| `hotfix` | Emergency production fix from last released SHA — branches off `main`, NOT off a workbranch | `hotfix/login-crash-prod` |

## The description part

- 3–6 words
- Kebab-case (lowercase, words separated by hyphens)
- Imperative or descriptive — both fine
- Specific enough that you'd recognize the branch a week later
- Avoid generic words: "stuff", "thing", "update", "changes", "wip"

## The ticket suffix

- Append the ticket/issue number if one exists
- Use the bare number (`-142`), not `#142` (branch names can't have `#`)
- Omit if there's no tracker

## Good examples

- `feat/parse-iso8601-dates-in-csv-upload-203`
- `fix/timezone-offset-wrong-in-reports-198`
- `refactor/move-auth-into-middleware`
- `chore/pin-postgres-driver-to-3-2`
- `docs/add-onboarding-checklist`
- `hotfix/prod-emails-not-sending-301`

## Bad examples (warn the user)

| Branch | Problem |
|---|---|
| `dev` | No description, no scope |
| `wip` | "Work in progress" is implied — name what it does |
| `feature/big-thing` | Generic; "big" suggests >2 days |
| `taylor/improvements` | Developer-name branches encourage ownership and long life |
| `update` | What kind? What's being updated? |
| `temp-branch` | Branches aren't temp — they're short-lived. Name the work. |
| `main-v2` / `develop` / `staging` | Long-lived environment branches — not TBD |
| `feature/refactor-everything` | "Everything" can't be done in 2 days |
| `FEAT/Add-Thing` | Wrong case, mixed case |

## Edge cases

### Multiple tickets in one branch

Don't. One branch = one logical change = one ticket (or no ticket). If you
find yourself wanting to fold ticket #142 and #156 into one branch, the
branch is too big — make them two PRs.

### No ticket exists

Omit the suffix. `refactor/extract-pdf-generator` is fine. If you find
yourself making lots of these, consider whether you'd benefit from a tracker.

### Multiple branches for the same ticket

Allowed. If ticket #142 is "build CSV export" and it naturally splits into
3 PRs (the parser, the endpoint, the UI button), you can have:

- `refactor/extract-csv-builder-142`
- `feat/add-csv-export-endpoint-142`
- `feat/add-csv-export-ui-button-142`

Each is a separate short-lived branch with its own PR.

### Continuing someone else's work

Don't push to a teammate's branch. If they're stuck and you need to help,
either:

1. Pair with them on their machine
2. They abandon the branch, you start fresh from `main` with a new branch
   (cherry-pick their commits if useful)

The "one developer per branch" rule is firm.
