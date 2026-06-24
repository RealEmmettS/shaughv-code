# Worktrees

This file is the canonical reference for worktree mechanics. Every git
operation that involves a branch other than `main` involves a worktree.

## The model

Git worktrees let one repository have multiple working directories, each
on its own branch, sharing one `.git` object store. They are git's native
answer to "I need to work on two branches at once."

In this team's workflow, **every branch lives in its own worktree.** The
main checkout (e.g. `~/code/myrepo/`) is reserved for being on `main`. Task
branches and workbranches all get sibling worktree directories.

## Layout convention

Sibling layout, never nested:

```
~/code/myrepo/                              ← main checkout, always on main
~/code/myrepo-taylor-wb-2026-05-19/         ← workbranch worktree
~/code/myrepo-feat-add-csv-export-142/      ← task worktree
~/code/myrepo-fix-login-bug-156/            ← task worktree
```

**Worktree directory name = repo dirname + `-` + branch name (slashes →
hyphens).**

Examples:
- `feat/add-csv-export-142` → `myrepo-feat-add-csv-export-142`
- `taylor/wb-2026-05-19` → `myrepo-taylor-wb-2026-05-19`
- `hotfix/prod-crash` → `myrepo-hotfix-prod-crash`

Slashes in branch names become hyphens because filesystem paths can't
contain unescaped slashes. The branch name itself remains `feat/add-csv-...`
in git.

## Creating a worktree

```bash
cd ~/code/myrepo                            # must start from main checkout
git fetch origin --quiet
git worktree add ../myrepo-<dirname> -b <branch-name> <base-branch>
cd ../myrepo-<dirname>
git push -u origin <branch-name>            # push to origin immediately
```

Examples:

```bash
# Task worktree off today's workbranch
git worktree add ../myrepo-feat-csv-export-142 \
  -b feat/csv-export-142 \
  origin/taylor/wb-2026-05-19

# Workbranch worktree off main
# (Note: workbranches are normally created via `git checkout -b` in the
# main checkout. Use a worktree for the workbranch only if you want to
# leave main checkout on main while actively working on the workbranch.)
git worktree add ../myrepo-taylor-wb-2026-05-19 \
  -b taylor/wb-2026-05-19 \
  origin/main

# Hotfix worktree off main
git worktree add ../myrepo-hotfix-prod-crash \
  -b hotfix/prod-crash \
  main
```

The `-b` creates a new branch. To worktree-an-existing-branch (rare —
usually used for resuming someone else's branch):

```bash
git worktree add ../myrepo-<dirname> origin/<existing-branch>
```

## Bootstrapping a worktree

A freshly created worktree has the source code but is missing:
- `.env` files (usually `.gitignore`d, so don't carry across)
- `node_modules` / `__pycache__` / `target/` / build artifacts
- Symlinked or generated config

The skill should run a bootstrap step after creating the worktree. If the
repo has a `.worktree-init.sh` at its root, run that:

```bash
[ -f ../myrepo/.worktree-init.sh ] && bash ../myrepo/.worktree-init.sh
```

Otherwise, common per-language patterns:

### Node.js / TypeScript

```bash
# Copy env
[ -f ../myrepo/.env ] && cp ../myrepo/.env .env

# Install — pnpm with content-addressable store is much faster than npm
# across worktrees; if the project uses pnpm, installs take seconds
pnpm install
# or: npm install
# or: yarn install

# Build if the project expects it
[ -f package.json ] && grep -q '"build"' package.json && npm run build
```

### Python

```bash
# Copy env
[ -f ../myrepo/.env ] && cp ../myrepo/.env .env

# If using venv per-worktree (common):
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# or if using poetry: poetry install
# or uv: uv sync
```

### Go

Most Go projects need no per-worktree setup beyond:

```bash
[ -f ../myrepo/.env ] && cp ../myrepo/.env .env
go mod download
```

### Rust

```bash
[ -f ../myrepo/.env ] && cp ../myrepo/.env .env
# cargo handles per-directory target/ automatically; first build is slow
cargo build
```

## The recommended `.worktree-init.sh` pattern

Each repo can have a `.worktree-init.sh` at its root that encodes the
bootstrap. Example:

```bash
#!/usr/bin/env bash
# .worktree-init.sh — runs in the new worktree dir, with the main checkout
# at "../<repo-name>"

set -euo pipefail

# Find the main checkout (the repo's primary working tree)
MAIN_DIR="$(git worktree list --porcelain | awk '/^worktree / { print $2; exit }')"

# Copy .env
if [ -f "$MAIN_DIR/.env" ]; then
  cp "$MAIN_DIR/.env" .env
  echo "Copied .env from $MAIN_DIR"
fi

# Pick a port offset to avoid collisions with sibling worktrees
WORKTREE_COUNT=$(git worktree list | wc -l)
PORT_OFFSET=$(( WORKTREE_COUNT * 10 ))
echo "PORT=$(( 3000 + PORT_OFFSET ))" >> .env
echo "Picked port $(( 3000 + PORT_OFFSET ))"

# Install
if [ -f package.json ]; then
  pnpm install
fi

# Project-specific setup
# e.g. seed local DB, run codegen, etc.
```

Commit `.worktree-init.sh` to the repo. Worktree creation will pick it up
automatically.

## Removing a worktree

After a task is merged (or abandoned):

```bash
cd ~/code/myrepo                            # always return to main checkout
git worktree remove ../myrepo-<dirname>
```

`git worktree remove` refuses if the worktree has uncommitted changes —
this is a safety net. If you've confirmed the merge happened on origin
and the worktree is safe to delete:

```bash
git worktree remove --force ../myrepo-<dirname>
```

Don't `rm -rf` a worktree directory directly. Git keeps internal tracking
in `.git/worktrees/`; bypassing the remove command leaves dangling state.
If you accidentally `rm -rf` first:

```bash
git worktree prune
```

This cleans up the dangling internal entries.

## Listing worktrees

```bash
git worktree list
```

Output looks like:

```
~/code/myrepo                            abc1234 [main]
~/code/myrepo-taylor-wb-2026-05-19       def5678 [taylor/wb-2026-05-19]
~/code/myrepo-feat-csv-export-142        9abcdef [feat/csv-export-142]
```

For an augmented view that classifies each branch (workbranch / task /
hotfix) and reports branch age, use `worktree-list.sh`.

## Common errors and fixes

### "fatal: '<branch>' is already checked out at '<path>'"

You're trying to check out a branch that's already in another worktree.
This is a safety feature. Either:
- Work in the worktree that already has the branch checked out
- Remove the other worktree first (`git worktree remove`)

This is actually a good thing — it prevents two agents from corrupting
the same branch.

### "fatal: '<path>' already exists"

The directory you're trying to create the worktree at already exists. Did
a previous worktree fail to clean up? Check:

```bash
git worktree list
# If the path isn't listed, it's an orphan — safe to remove the directory
# If it IS listed, run git worktree remove first
```

### "fatal: working tree not clean"

You're trying to `git worktree remove` a worktree with uncommitted changes.
Either commit/stash them or use `--force` if you're sure the merge happened.

### Worktree's branch has been deleted on origin (after merge)

Common scenario: `gh pr merge --delete-branch` deleted the remote, but
the worktree directory still exists locally.

```bash
cd ~/code/myrepo
git worktree remove --force ../myrepo-<dirname>
git fetch --prune
```

The local branch reference is now also gone. Clean state.

### `git status` in a worktree shows weird "added" files

Usually means `.gitignore` patterns aren't matching, often because the
init script created files (`.env`, `node_modules`) that should be ignored
but somehow aren't. Check `.gitignore` includes those patterns. Update
upstream if the project's `.gitignore` is missing entries.

## Worktrees and IDEs

Most IDEs handle worktrees fine — each one looks like a normal git repo
to the IDE. A few gotchas:

- **VS Code workspaces**: open the worktree directory directly, not the
  main checkout. The IDE will pick up that branch's state.
- **JetBrains IDEs**: same — open the worktree as its own project.
- **File watchers**: each worktree has its own filesystem state, so each
  one needs its own watcher. Not a problem for most IDEs.
- **Search across worktrees**: doesn't work natively — each IDE window
  searches only its own worktree. To search across, use shell tools like
  `rg` from `~/code/`.

## Worktrees and dev servers

Two worktrees both trying to run `npm run dev` on port 3000 will collide.

Solutions, in order of preference:

1. **Don't run dev servers in worktrees.** Agents don't need them. The
   operator runs the dev server in the main checkout on `main`. Agent
   work is exercised via test commands.
2. **Per-worktree port via `.worktree-init.sh`** (see example above).
   Sets `PORT=3010`, `PORT=3020`, etc.
3. **Per-worktree compose stack**, if you're already docker-based.

For internal-tools repos, option 1 covers most cases.

## Worktrees and local databases

A single Postgres on localhost is shared by all worktrees. Migrations in
one worktree affect the runtime in another.

Solutions:

1. **One agent runs migrations at a time.** Other agents rebase after.
   Sufficient for most internal tools.
2. **Per-worktree DB schema** (`SET search_path` or per-schema namespacing).
3. **Per-worktree Docker compose Postgres** on different ports. Heavyweight.

Option 1 is fine for a 2-person team. Option 3 only if you have a specific
reason.

## Why worktrees over multiple clones

Worktrees beat full clones for our context because:

- Single `git fetch` updates everything.
- One disk footprint for the object store (large savings on big repos).
- `git worktree list` is a single source of truth for what's active.
- Branches can only be checked out once across all worktrees — built-in
  safety against the "two agents on same branch" failure mode.

The only case where a full clone wins: when you need *complete* isolation
including the `.git` directory itself (e.g., experimenting with `git
filter-repo`, or working on a branch that should be invisible to other
sessions). That's rare; default to worktrees.
