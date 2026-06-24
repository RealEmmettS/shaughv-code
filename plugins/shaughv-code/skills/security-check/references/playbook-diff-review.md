# Playbook — Mode B: Branch / Diff Security Review

The pre-push / pre-merge path. Scope is ONLY what this branch changes —
existing security debt is out of scope (note it in one line if you trip over
it, don't review it). The bar is high-confidence (≥0.8) findings only: this
review runs often, so it must be quiet, fast, and trustworthy.

Mode B **always ends with the Mode C impact verdict** (`impact-assessment.md`)
— a security-clean diff can still be a breaking one, and the operator deciding
"merge now or stage it" needs both answers together.

## Procedure

### 1. Establish the diff

```bash
git fetch origin --quiet
BASE=$(git merge-base HEAD origin/main)
git diff --stat  $BASE...HEAD     # shape of the change
git diff         $BASE...HEAD     # the content under review
git log --oneline $BASE..HEAD     # intent, from commit messages
```

Dirty working tree? Review it too (`git diff $BASE`) — "can I push this"
includes what's on disk.

### 2. Context pass (don't review the diff blind)

For each file in the diff, establish: what surface is it (use the repo
fingerprint if one exists from a prior audit, else fingerprint just the
touched dirs)? What are the existing security patterns in the SURROUNDING
code — validation library, parameterization style, auth middleware? New code
that **deviates from an established safe pattern** in the same repo is the
single highest-yield review signal.

### 3. Diff-scoped sweeps

```bash
python <skill-path>/scripts/secret_scan.py --repo . --mode diff --base origin/main
```

Then run the Greppable-sweep rows from the applicable `stack-*.md` files,
restricted to changed files (`rg <pattern> $(git diff --name-only $BASE...HEAD)`).

### 4. Trace the new data flows

For every NEW or MODIFIED entry point (route, trigger, MCP tool, exported
function), trace attacker-controlled input through the change: entry →
validation → use. Specifically hunt:

- New input that skips the validation layer its siblings use
- Auth/authz checks weakened, reordered, or conditionally bypassed by the diff
- New string building feeding SQL, shell, HTML, templates, file paths, URLs
- New trust placed in client-supplied values (IDs, role claims, redirect targets, headers)
- Error handling that now swallows or leaks (stack traces, internal URLs, query text)
- Dependency additions: new packages get the `stack-supply-chain.md` new-package check

### 5. Verify, then report

Each candidate gets the adversarial pass from `severity-and-triage.md`. Report
only ≥0.8 confidence, MEDIUM and above. LOW/hardening notes go in one short
appendix line each, or are dropped.

### 6. Impact verdict (mandatory tail)

Run `scripts/impact_stats.py`, apply `impact-assessment.md`, and append the
impact verdict block to the report. The chat summary leads with BOTH verdicts:
security (clean / findings) and impact (patch-like / moderate / major).

## Report

Same two-tier contract as Mode A: chat summary + exhaustive doc at
`security-audit/<YYYY-MM-DD>-<HHmm>-diff-review.md` containing: branch + SHA
range reviewed, findings (standard format), the sweep log, and the full impact
verdict block. A finding-free review still produces the doc — "reviewed,
clean, here's what was checked" is the artifact that makes the next reviewer's
diff smaller.

## What this mode is NOT

- Not a full audit (don't expand scope past the diff; recommend Mode A when
  the diff reveals systemic debt).
- Not a general code review (correctness, style, tests → `code-review` /
  pr-review-toolkit).
- Not the secrets PR gate — if your workflow has a fast pre-PR secrets gate
  (e.g. via `git-workflow`), it still runs there; this mode's diff scan is the
  audit-grade complement.
