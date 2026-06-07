#!/usr/bin/env bash
# worktree-list.sh — augmented worktree audit view
#
# Combines `git worktree list` with branch classification and best-effort
# Mission Control ownership data. For the agent ownership column, the
# skill itself should call Mission Control's task-listing tools and overlay
# the data; this script provides the filesystem + git half.

set -uo pipefail

REPO_DIR="$(git rev-parse --show-toplevel 2>/dev/null)"
if [[ -z "$REPO_DIR" ]]; then
  echo "Not in a git repo." >&2
  exit 1
fi

DEV="$(git config user.email 2>/dev/null | cut -d@ -f1 || whoami)"
TODAY="$(date +%Y-%m-%d)"

echo "Worktrees in this repo (filesystem + git view):"
echo

git fetch origin --quiet 2>/dev/null || true

printf "  %-60s %-40s %s\n" "PATH" "BRANCH" "CLASSIFICATION"
printf "  %-60s %-40s %s\n" "------------------------------------------------------------" "----------------------------------------" "-----------"

while read -r line; do
  PATH_PART="$(echo "$line" | awk '{print $1}')"
  BRANCH_PART="$(echo "$line" | grep -oE '\[[^]]+\]' | tr -d '[]')"

  # Classify the branch
  if [[ "$BRANCH_PART" == "main" || "$BRANCH_PART" == "master" ]]; then
    CLASS="main checkout"
  elif [[ "$BRANCH_PART" =~ ^[a-z0-9._-]+/wb-[0-9]{4}-[0-9]{2}-[0-9]{2}(-[a-z0-9]+)?$ ]]; then
    OWNER="${BRANCH_PART%%/*}"
    CLASS="workbranch ($OWNER)"
  elif [[ "$BRANCH_PART" =~ ^(feat|fix|refactor|chore|docs|test)/ ]]; then
    CLASS="task"
  elif [[ "$BRANCH_PART" =~ ^hotfix/ ]]; then
    CLASS="hotfix"
  else
    CLASS="other"
  fi

  # Check age
  AGE_NOTE=""
  if [[ "$CLASS" != "main checkout" ]]; then
    FIRST_TS="$(git log --reverse --pretty=format:%ct "$BRANCH_PART" "^origin/main" 2>/dev/null | head -1 || true)"
    if [[ -n "${FIRST_TS:-}" ]]; then
      AGE_HOURS=$(( ( $(date +%s) - FIRST_TS ) / 3600 ))
      CAP=48
      [[ "$CLASS" == workbranch* ]] && CAP=24
      AGE_NOTE=" — age ${AGE_HOURS}h"
      if (( AGE_HOURS > CAP )); then
        AGE_NOTE="$AGE_NOTE OVER CAP"
      fi
    fi
  fi

  printf "  %-60s %-40s %s%s\n" "$PATH_PART" "$BRANCH_PART" "$CLASS" "$AGE_NOTE"
done < <(git worktree list)

echo
echo "Note: Agent ownership data lives in Mission Control. The skill should"
echo "      query MC to overlay 'who is working in each worktree' on top of"
echo "      this view."
