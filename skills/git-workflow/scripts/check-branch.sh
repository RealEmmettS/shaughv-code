#!/usr/bin/env bash
# check-branch.sh — validate the current branch against TBD policy
#
# Exit codes:
#   0 — all checks pass
#   1 — at least one check failed (warnings printed to stderr)
#
# Designed to be wired as a pre-push git hook, or run manually:
#   ./scripts/check-branch.sh

set -uo pipefail

FAIL=0
warn() {
  echo "⚠️  $*" >&2
  FAIL=1
}
ok() {
  echo "✓ $*"
}

# 1. Not on main
BRANCH="$(git branch --show-current)"
if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
  warn "You are on '$BRANCH'. Direct work on the trunk branch is not allowed."
  echo "   Create a feature branch: git checkout -b feat/<description>-<id>" >&2
  exit 1
fi
ok "On branch '$BRANCH' (not trunk)"

# 2. Branch name convention
NAME_REGEX='^(feat|fix|refactor|chore|docs|test|hotfix)/[a-z0-9][a-z0-9-]*$'
if [[ ! "$BRANCH" =~ $NAME_REGEX ]]; then
  warn "Branch name '$BRANCH' does not match convention."
  echo "   Expected: <type>/<short-kebab-description>[-<ticket-id>]" >&2
  echo "   Types: feat, fix, refactor, chore, docs, test, hotfix" >&2
  echo "   Examples: feat/add-csv-export-142, fix/login-crash-89" >&2
else
  ok "Branch name matches convention"
fi

# 3. Branch age (≤ 48 hours)
FIRST_COMMIT_TS="$(git log --reverse --pretty=format:%ct "$BRANCH" "^origin/main" 2>/dev/null | head -1)"
if [[ -n "${FIRST_COMMIT_TS:-}" ]]; then
  NOW_TS="$(date +%s)"
  AGE_HOURS=$(( (NOW_TS - FIRST_COMMIT_TS) / 3600 ))
  if (( AGE_HOURS > 48 )); then
    warn "Branch is $AGE_HOURS hours old (cap: 48 hours)."
    echo "   Consider landing what you have behind a feature flag," >&2
    echo "   or slicing remaining work into a new branch off fresh main." >&2
  else
    ok "Branch age: $AGE_HOURS hours (within 48h cap)"
  fi
else
  ok "Branch age: new (no commits ahead of main yet)"
fi

# 4. Single developer (or pair) on this branch
AUTHOR_COUNT="$(git log --format='%ae' "$BRANCH" "^origin/main" 2>/dev/null | sort -u | wc -l | tr -d ' ')"
if (( AUTHOR_COUNT > 2 )); then
  warn "Branch has commits from $AUTHOR_COUNT distinct authors (cap: 1, or 2 if pair-programming)."
  echo "   Branches should not be shared as collaboration spaces." >&2
elif (( AUTHOR_COUNT == 2 )); then
  ok "Branch has 2 authors (acceptable if pair-programming; confirm this is intentional)"
elif (( AUTHOR_COUNT == 1 )); then
  ok "Branch has 1 author"
fi

# 5. Up to date with main
git fetch origin --quiet 2>/dev/null || true
BEHIND_COUNT="$(git rev-list --count "$BRANCH..origin/main" 2>/dev/null || echo 0)"
if (( BEHIND_COUNT > 0 )); then
  warn "Branch is $BEHIND_COUNT commits behind origin/main."
  echo "   Run: git fetch origin && git rebase origin/main" >&2
else
  ok "Branch is up to date with origin/main"
fi

# 6. Trunk is green (best-effort; requires gh CLI)
if command -v gh >/dev/null 2>&1; then
  LAST_MAIN_STATUS="$(gh run list --branch main --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null || echo unknown)"
  case "$LAST_MAIN_STATUS" in
    success)
      ok "Trunk (main) is green"
      ;;
    failure|cancelled|timed_out)
      warn "Trunk (main) is not green (last CI run: $LAST_MAIN_STATUS)."
      echo "   Highest priority is to get main green. Consider reverting or fixing forward." >&2
      ;;
    *)
      # unknown/in-progress/no runs — don't warn
      ok "Trunk status: $LAST_MAIN_STATUS (skipping check)"
      ;;
  esac
fi

# Summary
echo
if (( FAIL == 0 )); then
  echo "All TBD checks passed."
  exit 0
else
  echo "One or more TBD checks failed. Review the warnings above."
  echo "If you intend to proceed anyway, document the override reason in the PR or commit."
  exit 1
fi
