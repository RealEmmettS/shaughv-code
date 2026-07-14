#!/usr/bin/env bash
# check-branch.sh — validate the current branch against TBD + workbranch policy
#
# Exit codes:
#   0 — all checks pass
#   1 — at least one check failed (warnings printed to stderr)

set -uo pipefail

FAIL=0
warn() {
  echo "⚠️  $*" >&2
  FAIL=1
}
ok() {
  echo "✓ $*"
}

BRANCH="$(git branch --show-current)"
DEV="$(git config user.email 2>/dev/null | cut -d@ -f1 || whoami)"
TODAY="$(date +%Y-%m-%d)"

# 1. Not on main (unless this IS the main checkout intentionally)
if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
  IS_MAIN_CHECKOUT=0
  MAIN_DIR="$(git worktree list --porcelain | awk '/^worktree / { print $2; exit }')"
  CURRENT_DIR="$(pwd)"
  if [[ "$(git rev-parse --show-toplevel)" == "$MAIN_DIR" ]]; then
    IS_MAIN_CHECKOUT=1
  fi

  if (( IS_MAIN_CHECKOUT == 1 )); then
    ok "On '$BRANCH' in the main checkout (expected)"
    # If in main checkout and tree is clean, that's fine — nothing further to check
    if [[ -z "$(git status --porcelain)" ]]; then
      echo "Main checkout is clean. No work-in-progress here."
      exit 0
    else
      warn "Main checkout has uncommitted changes. Work should happen in a worktree."
    fi
  else
    warn "On '$BRANCH' but NOT in the main checkout. Work should happen in a task worktree."
    echo "   Create a task worktree: ./scripts/worktree-add.sh <branch-name>" >&2
    exit 1
  fi
fi

# 2. Classify the branch
CLASS=""
if [[ "$BRANCH" =~ ^[a-z0-9._-]+/wb-[0-9]{4}-[0-9]{2}-[0-9]{2}(-[a-z0-9]+)?$ ]]; then
  CLASS="workbranch"
elif [[ "$BRANCH" =~ ^(feat|fix|refactor|chore|docs|test)/[a-z0-9][a-z0-9-]*$ ]]; then
  CLASS="task"
elif [[ "$BRANCH" =~ ^hotfix/[a-z0-9][a-z0-9-]*$ ]]; then
  CLASS="hotfix"
fi

if [[ -z "$CLASS" ]]; then
  warn "Branch name '$BRANCH' does not match any known convention."
  echo "   Task:       <type>/<short-kebab-description>[-<id>]" >&2
  echo "   Workbranch: <developer>/wb-<YYYY-MM-DD>" >&2
  echo "   Hotfix:     hotfix/<short-kebab-description>" >&2
else
  ok "Branch class: $CLASS"
fi

# 3. Branch age check (cap depends on class)
CAP_HOURS=48
[[ "$CLASS" == "workbranch" ]] && CAP_HOURS=24

FIRST_COMMIT_TS="$(git log --reverse --pretty=format:%ct "$BRANCH" "^origin/main" 2>/dev/null | head -1 || true)"
if [[ -n "${FIRST_COMMIT_TS:-}" ]]; then
  NOW_TS="$(date +%s)"
  AGE_HOURS=$(( (NOW_TS - FIRST_COMMIT_TS) / 3600 ))
  if (( AGE_HOURS > CAP_HOURS )); then
    warn "Branch is $AGE_HOURS hours old (cap: $CAP_HOURS)."
    if [[ "$CLASS" == "workbranch" ]]; then
      echo "   Workbranch must ship to main before new work can start." >&2
    else
      echo "   Land what you have behind a feature flag, or slice the work." >&2
    fi
  else
    ok "Branch age: ${AGE_HOURS}h (cap: ${CAP_HOURS}h)"
  fi
else
  ok "Branch age: new (no commits ahead of main yet)"
fi

# 4. Single developer on this branch
AUTHOR_COUNT="$(git log --format='%ae' "$BRANCH" "^origin/main" 2>/dev/null | sort -u | wc -l | tr -d ' ')"
if (( AUTHOR_COUNT > 2 )); then
  warn "Branch has commits from $AUTHOR_COUNT distinct authors."
elif (( AUTHOR_COUNT == 2 )); then
  ok "Branch has 2 authors (acceptable if pair-programming)"
elif (( AUTHOR_COUNT == 1 )); then
  ok "Branch has 1 author"
fi

# 5. For task branches: are we in a worktree (not the main checkout)?
if [[ "$CLASS" == "task" || "$CLASS" == "hotfix" ]]; then
  MAIN_DIR="$(git worktree list --porcelain | awk '/^worktree / { print $2; exit }')"
  CURRENT_DIR="$(git rev-parse --show-toplevel)"
  if [[ "$CURRENT_DIR" == "$MAIN_DIR" ]]; then
    warn "Task branch is checked out in the MAIN checkout, not in a worktree."
    echo "   Task work must happen in a sibling worktree directory." >&2
  else
    ok "Working in a worktree (not the main checkout)"
  fi
fi

# 6. For workbranches: is today's workbranch the expected name?
if [[ "$CLASS" == "workbranch" ]]; then
  EXPECTED="${DEV}/wb-${TODAY}"
  if [[ "$BRANCH" != "$EXPECTED" && ! "$BRANCH" =~ ^${DEV}/wb-${TODAY} ]]; then
    warn "Workbranch '$BRANCH' doesn't match today's expected pattern '$EXPECTED'."
    echo "   If this is yesterday's workbranch, ship it before starting today's work." >&2
  else
    ok "Workbranch matches today's pattern for $DEV"
  fi
fi

# 7. For task branches: is the parent workbranch up to date with main?
if [[ "$CLASS" == "task" ]]; then
  # Find the parent workbranch (best-effort: today's workbranch for this dev)
  EXPECTED_WB="origin/${DEV}/wb-${TODAY}"
  if git rev-parse --verify "$EXPECTED_WB" >/dev/null 2>&1; then
    BEHIND="$(git rev-list --count "$EXPECTED_WB..origin/main" 2>/dev/null || echo 0)"
    if (( BEHIND > 0 )); then
      warn "Parent workbranch is $BEHIND commits behind main. Continuous rebase overdue."
      echo "   Rebase the workbranch: see scripts/workbranch-status.sh" >&2
    else
      ok "Parent workbranch is up to date with main"
    fi
  fi
fi

# 8. Up to date with origin
git fetch origin --quiet 2>/dev/null || true
ORIGIN_BRANCH="origin/$BRANCH"
if git rev-parse --verify "$ORIGIN_BRANCH" >/dev/null 2>&1; then
  BEHIND_ORIGIN="$(git rev-list --count "$BRANCH..$ORIGIN_BRANCH" 2>/dev/null || echo 0)"
  if (( BEHIND_ORIGIN > 0 )); then
    warn "Branch is $BEHIND_ORIGIN commits behind its origin counterpart."
    echo "   Pull or rebase before pushing." >&2
  else
    ok "Branch is up to date with origin"
  fi
else
  warn "Branch '$BRANCH' is not pushed to origin yet."
  echo "   Per strong default #7: branches should be on origin before work begins." >&2
  echo "   Run: git push -u origin $BRANCH" >&2
fi

# 9. Trunk is green
if command -v gh >/dev/null 2>&1; then
  LAST_MAIN_STATUS="$(gh run list --branch main --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null || echo unknown)"
  case "$LAST_MAIN_STATUS" in
    success) ok "Trunk (main) is green" ;;
    failure|cancelled|timed_out) warn "Trunk (main) is not green (last CI: $LAST_MAIN_STATUS)." ;;
    *) ok "Trunk status: $LAST_MAIN_STATUS (skipping)" ;;
  esac
fi

echo
if (( FAIL == 0 )); then
  echo "All TBD checks passed."
  exit 0
else
  echo "One or more checks failed. Review the warnings above."
  exit 1
fi
