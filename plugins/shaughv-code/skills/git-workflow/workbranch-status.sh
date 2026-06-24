#!/usr/bin/env bash
# workbranch-status.sh — show current workbranch state
#
# Reports:
#   - Today's expected workbranch name
#   - Whether it exists (local, origin)
#   - Age in hours (vs 24h cap)
#   - Active task worktrees branched off it
#   - Drift from main (commits ahead, commits behind)
#   - Most recent rebase time (best-effort)

set -uo pipefail

DEV="$(git config user.email 2>/dev/null | cut -d@ -f1 || whoami)"
TODAY="$(date +%Y-%m-%d)"
EXPECTED_WB="${DEV}/wb-${TODAY}"

echo "Developer:        $DEV"
echo "Today:            $TODAY"
echo "Expected wb:      $EXPECTED_WB"
echo

# Check local existence
LOCAL_EXISTS=0
if git rev-parse --verify "$EXPECTED_WB" >/dev/null 2>&1; then
  LOCAL_EXISTS=1
fi

# Check origin existence
git fetch origin --quiet 2>/dev/null || true
ORIGIN_EXISTS=0
if git rev-parse --verify "origin/$EXPECTED_WB" >/dev/null 2>&1; then
  ORIGIN_EXISTS=1
fi

if (( LOCAL_EXISTS == 0 && ORIGIN_EXISTS == 0 )); then
  echo "Workbranch does not exist yet."
  echo "To create today's workbranch:"
  echo "  git checkout main && git pull --ff-only --prune"
  echo "  git checkout -b $EXPECTED_WB"
  echo "  git push -u origin $EXPECTED_WB"
  echo "  git checkout main"
  exit 0
fi

echo "Local exists:     $( ((LOCAL_EXISTS)) && echo yes || echo no )"
echo "Origin exists:    $( ((ORIGIN_EXISTS)) && echo yes || echo no )"

# Age check
REF="$EXPECTED_WB"
if (( LOCAL_EXISTS == 0 )); then
  REF="origin/$EXPECTED_WB"
fi

FIRST_COMMIT_TS="$(git log --reverse --pretty=format:%ct "$REF" "^origin/main" 2>/dev/null | head -1 || true)"
if [[ -n "${FIRST_COMMIT_TS:-}" ]]; then
  NOW_TS="$(date +%s)"
  AGE_HOURS=$(( (NOW_TS - FIRST_COMMIT_TS) / 3600 ))
  echo "Age:              ${AGE_HOURS} hours (cap: 24)"
  if (( AGE_HOURS > 24 )); then
    echo "Status:           OVER CAP — must ship before new work"
  elif (( AGE_HOURS > 22 )); then
    echo "Status:           BLOCKING NEW WORK — only existing tasks may merge in"
  elif (( AGE_HOURS > 18 )); then
    echo "Status:           approaching cap — plan to ship soon"
  else
    echo "Status:           ok"
  fi
else
  echo "Age:              0 hours (no commits yet ahead of main)"
fi

# Drift from main
AHEAD="$(git rev-list --count "origin/main..$REF" 2>/dev/null || echo 0)"
BEHIND="$(git rev-list --count "$REF..origin/main" 2>/dev/null || echo 0)"
echo "Ahead of main:    $AHEAD commits"
echo "Behind main:      $BEHIND commits"
if (( BEHIND > 0 )); then
  echo "  → Run continuous rebase:"
  echo "    git checkout $EXPECTED_WB && git rebase origin/main && git push --force-with-lease"
fi

# Active task worktrees
echo
echo "Active worktrees in this repo:"
git worktree list | while read -r line; do
  PATH_PART="$(echo "$line" | awk '{print $1}')"
  BRANCH_PART="$(echo "$line" | grep -oE '\[[^]]+\]' | tr -d '[]')"
  if [[ "$BRANCH_PART" == "$EXPECTED_WB" ]]; then
    LABEL="(workbranch)"
  elif [[ "$BRANCH_PART" == "main" || "$BRANCH_PART" == "master" ]]; then
    LABEL="(main checkout)"
  else
    # Check if it's based on the workbranch
    if git merge-base --is-ancestor "$REF" "$BRANCH_PART" 2>/dev/null; then
      LABEL="(task off workbranch)"
    else
      LABEL="(other)"
    fi
  fi
  printf "  %-60s %s\n" "$PATH_PART [$BRANCH_PART]" "$LABEL"
done

# Open PRs targeting this workbranch
if command -v gh >/dev/null 2>&1; then
  echo
  echo "Open PRs targeting $EXPECTED_WB:"
  gh pr list --base "$EXPECTED_WB" --json number,title,headRefName \
    --jq '.[] | "  #\(.number) \(.headRefName) — \(.title)"' 2>/dev/null \
    || echo "  (none or gh unavailable)"
fi
