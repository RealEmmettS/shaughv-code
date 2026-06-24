#!/usr/bin/env bash
# branch-age.sh — print the age of the current branch in hours
#
# Usage:
#   ./scripts/branch-age.sh             # current branch
#   ./scripts/branch-age.sh <branch>    # specific branch

set -euo pipefail

BRANCH="${1:-$(git branch --show-current)}"

if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
  echo "main is the trunk — not subject to the branch-age cap."
  exit 0
fi

FIRST_COMMIT_TS="$(git log --reverse --pretty=format:%ct "$BRANCH" "^origin/main" 2>/dev/null | head -1 || true)"

if [[ -z "${FIRST_COMMIT_TS:-}" ]]; then
  echo "Branch '$BRANCH' has no commits ahead of origin/main yet."
  exit 0
fi

NOW_TS="$(date +%s)"
AGE_HOURS=$(( (NOW_TS - FIRST_COMMIT_TS) / 3600 ))
AGE_DAYS=$(( AGE_HOURS / 24 ))
REMAINDER_HOURS=$(( AGE_HOURS % 24 ))

echo "Branch:  $BRANCH"
echo "Age:     ${AGE_HOURS} hours (${AGE_DAYS}d ${REMAINDER_HOURS}h)"
echo "Cap:     48 hours"

if (( AGE_HOURS > 48 )); then
  echo "Status:  OVER CAP — slice the work or land behind a flag"
  exit 1
elif (( AGE_HOURS > 36 )); then
  echo "Status:  approaching cap — plan to land soon"
else
  echo "Status:  ok"
fi
