#!/usr/bin/env bash
# worktree-add.sh — create a task worktree with bootstrap and origin push
#
# Usage:
#   ./scripts/worktree-add.sh <branch-name> [<base-branch>]
#
# Examples:
#   ./scripts/worktree-add.sh feat/add-csv-export-142
#   ./scripts/worktree-add.sh feat/add-csv-export-142 origin/taylor/wb-2026-05-19
#   ./scripts/worktree-add.sh hotfix/prod-crash main
#
# If <base-branch> is omitted, defaults to origin/<developer>/wb-<today>
# (today's workbranch for the current user).

set -euo pipefail

BRANCH="${1:-}"
BASE="${2:-}"

if [[ -z "$BRANCH" ]]; then
  echo "Usage: $0 <branch-name> [<base-branch>]" >&2
  exit 2
fi

# Determine repo info
REPO_DIR="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_DIR")"
PARENT_DIR="$(dirname "$REPO_DIR")"

# Determine base branch if not provided
if [[ -z "$BASE" ]]; then
  DEV="$(git config user.email 2>/dev/null | cut -d@ -f1 || whoami)"
  TODAY="$(date +%Y-%m-%d)"
  BASE="origin/${DEV}/wb-${TODAY}"
  echo "No base branch given; defaulting to ${BASE}"
fi

# Verify the base exists
git fetch origin --quiet
if ! git rev-parse --verify "$BASE" >/dev/null 2>&1; then
  echo "Error: base branch '$BASE' does not exist." >&2
  echo "Hint: create the workbranch first via 'git checkout -b $BASE'" >&2
  exit 1
fi

# Compute worktree directory name (replace / with -)
DIRNAME="${REPO_NAME}-${BRANCH//\//-}"
WORKTREE_PATH="${PARENT_DIR}/${DIRNAME}"

if [[ -e "$WORKTREE_PATH" ]]; then
  echo "Error: '$WORKTREE_PATH' already exists." >&2
  echo "If it's a stale worktree, run 'git worktree remove $WORKTREE_PATH' first." >&2
  exit 1
fi

# Check if branch already exists in another worktree
if git worktree list | grep -qF "[$BRANCH]"; then
  echo "Error: branch '$BRANCH' is already checked out in another worktree." >&2
  git worktree list | grep -F "[$BRANCH]" >&2
  exit 1
fi

# Create the worktree
echo "Creating worktree: $WORKTREE_PATH on $BRANCH (off $BASE)"
git worktree add "$WORKTREE_PATH" -b "$BRANCH" "$BASE"

# Push the branch to origin immediately (per strong default #7)
cd "$WORKTREE_PATH"
echo "Pushing $BRANCH to origin..."
git push -u origin "$BRANCH"

# Run bootstrap if a hook is present in the main repo
INIT_HOOK="${REPO_DIR}/.worktree-init.sh"
if [[ -f "$INIT_HOOK" ]]; then
  echo "Running bootstrap from ${INIT_HOOK}..."
  bash "$INIT_HOOK"
else
  echo "No .worktree-init.sh found. Manual bootstrap may be needed."
  echo "Common next steps:"
  echo "  - Copy .env from $REPO_DIR if needed: cp $REPO_DIR/.env ."
  if [[ -f package.json ]]; then
    if command -v pnpm >/dev/null 2>&1; then
      echo "  - pnpm install"
    else
      echo "  - npm install"
    fi
  fi
  [[ -f requirements.txt ]] && echo "  - pip install -r requirements.txt"
  [[ -f pyproject.toml ]] && echo "  - poetry install   # or: uv sync"
  [[ -f go.mod ]] && echo "  - go mod download"
  [[ -f Cargo.toml ]] && echo "  - cargo build"
fi

echo
echo "Worktree ready: $WORKTREE_PATH"
echo "Branch '$BRANCH' is pushed to origin."
echo "cd $WORKTREE_PATH to start work."
