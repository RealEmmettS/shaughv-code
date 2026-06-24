#!/usr/bin/env bash
# secret-scan.sh — scan for hardcoded secrets
#
# MODES:
#   --full   (DEFAULT) Scan the ENTIRE working tree. This is what the
#            git-workflow Tier-1 gate T1.5 requires. A secret anywhere in
#            the repo is a failure, regardless of which commit introduced it.
#   --diff   Scan only the diff vs origin/main. This is a WEAKER check and
#            does NOT satisfy T1.5. Provided only for quick local spot-checks.
#
# Exit codes:
#   0 — no findings
#   1 — at least one potential secret found
#
# T1.5 reminder: a hit on this scan is a Tier-1 failure. It cannot be
# downgraded to "PASS WITH NOTES" or written into a PR body and merged.
# Only the operator may accept it, via an explicit logged decision.

set -uo pipefail

MODE="full"
case "${1:-}" in
  --diff) MODE="diff" ;;
  --full|"") MODE="full" ;;
  *) echo "Usage: $0 [--full|--diff]" >&2; exit 2 ;;
esac

echo "Secret scan mode: $MODE"
if [[ "$MODE" == "diff" ]]; then
  echo "⚠️  --diff mode is a weaker check and does NOT satisfy Tier-1 gate T1.5."
  echo "    Run with --full (or no argument) for the gate-compliant scan."
fi

# ---------------------------------------------------------------------------
# Preferred scanners
# ---------------------------------------------------------------------------
if command -v gitleaks >/dev/null 2>&1; then
  echo "Using gitleaks..."
  if [[ "$MODE" == "full" ]]; then
    # detect scans the full repo (working tree + history)
    gitleaks detect --source . --no-banner --redact
    exit $?
  else
    gitleaks protect --staged --no-banner --redact
    exit $?
  fi
fi

if command -v trufflehog >/dev/null 2>&1; then
  echo "Using trufflehog..."
  if [[ "$MODE" == "full" ]]; then
    trufflehog filesystem . --only-verified --fail
    exit $?
  else
    git fetch origin --quiet 2>/dev/null || true
    trufflehog git "file://$(pwd)" \
      --since-commit "$(git merge-base HEAD origin/main 2>/dev/null || echo HEAD~10)" \
      --only-verified --fail
    exit $?
  fi
fi

# ---------------------------------------------------------------------------
# Fallback: regex pass
# ---------------------------------------------------------------------------
echo "Using fallback regex scan (install gitleaks for stronger coverage)..."

if [[ "$MODE" == "full" ]]; then
  # Scan all git-tracked files plus untracked-not-ignored files.
  CONTENT="$(git ls-files -z --cached --others --exclude-standard \
    | xargs -0 grep -nHE '.' 2>/dev/null || true)"
else
  git fetch origin --quiet 2>/dev/null || true
  BASE="$(git merge-base HEAD origin/main 2>/dev/null || git rev-parse HEAD~5)"
  CONTENT="$(git diff "$BASE"...HEAD 2>/dev/null || true)"
fi

if [[ -z "$CONTENT" ]]; then
  echo "Nothing to scan."
  exit 0
fi

FAIL=0
hit() {
  echo "⚠️  Potential secret: $1" >&2
  FAIL=1
}

# AWS Access Key ID
echo "$CONTENT" | grep -qE '\bAKIA[0-9A-Z]{16}\b' \
  && hit "AWS Access Key ID (AKIA...)"

# AWS Secret Access Key
echo "$CONTENT" | grep -qiE 'aws[_-]?secret.{0,30}["'\''][A-Za-z0-9/+=]{40}["'\'']' \
  && hit "AWS Secret Access Key"

# GitHub tokens
echo "$CONTENT" | grep -qE '\bgh[pousr]_[A-Za-z0-9]{36,}\b' \
  && hit "GitHub token (ghp_/gho_/ghu_/ghs_/ghr_)"

# Cloudflare API tokens (e.g. Workers AI tokens — cfut_ and related prefixes)
echo "$CONTENT" | grep -qE '\bcf[a-z]{0,4}_[A-Za-z0-9_-]{30,}\b' \
  && hit "Cloudflare API token (cf*_...)"

# Slack tokens
echo "$CONTENT" | grep -qE '\bxox[abps]-[A-Za-z0-9-]{10,}\b' \
  && hit "Slack token (xox[abps]-...)"

# Stripe live secret keys
echo "$CONTENT" | grep -qE '\bsk_live_[A-Za-z0-9]{20,}\b' \
  && hit "Stripe live secret key (sk_live_...)"

# Google API key
echo "$CONTENT" | grep -qE '\bAIza[0-9A-Za-z_-]{35}\b' \
  && hit "Google API key (AIza...)"

# Private key blocks
echo "$CONTENT" | grep -qE -- '-----BEGIN (RSA|EC|DSA|OPENSSH|PGP)? ?PRIVATE KEY-----' \
  && hit "Private key block (-----BEGIN ... PRIVATE KEY-----)"

# Generic high-entropy credential assignment
if echo "$CONTENT" | grep -qiE '(api[_-]?key|secret|password|passwd|token|auth|bearer)[[:space:]]*[=:][[:space:]]*["'\''][A-Za-z0-9_\-]{24,}["'\'']'; then
  if ! echo "$CONTENT" \
    | grep -iE '(api[_-]?key|secret|password|passwd|token|auth|bearer)[[:space:]]*[=:][[:space:]]*["'\''][A-Za-z0-9_\-]{24,}["'\'']' \
    | grep -qiE '(example|placeholder|your[_-]|xxx|todo|fixme|dummy|sample|<.*>)'; then
    hit "High-entropy value assigned to a credential-like name"
  fi
fi

# 32-hex-character account/key IDs sitting next to a token-like name
echo "$CONTENT" | grep -qiE '(account[_-]?id|client[_-]?id)[[:space:]]*[=:][[:space:]]*["'\''][0-9a-f]{32}["'\'']' \
  && hit "32-hex account/client ID (often paired with an API token)"

echo
if (( FAIL == 0 )); then
  echo "✓ Secret scan ($MODE): no findings."
  [[ "$MODE" == "diff" ]] && echo "  (Reminder: --diff does not satisfy Tier-1 gate T1.5.)"
  echo "  Note: regex fallback is basic. Install gitleaks for stronger coverage:"
  echo "  brew install gitleaks"
  exit 0
else
  echo "SECRET SCAN FAILED ($MODE) — this is a Tier-1 gate failure (T1.5)."
  echo
  echo "Required handling (per references/pre-pr-gates.md):"
  echo "  1. HALT — no PR create, no merge, no commits on top."
  echo "  2. Warn the operator loudly and directly — not in a PR body."
  echo "  3. The agent may NOT downgrade this to PASS WITH NOTES."
  echo "  4. Remediation: remove the secret, then ROTATE/REVOKE it at the"
  echo "     provider (the value in git history is dead only once revoked),"
  echo "     then move it to an env var or secret manager."
  echo "  5. Only the operator may accept this finding, via a logged decision."
  exit 1
fi
