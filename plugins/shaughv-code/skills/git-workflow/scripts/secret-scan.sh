#!/usr/bin/env bash
# secret-scan.sh — scan the diff (vs origin/main) for common secret patterns
#
# Prefers gitleaks or trufflehog if installed. Falls back to a regex pass.
#
# Exit codes:
#   0 — no findings
#   1 — at least one potential secret found
#   2 — scan could not run (missing fetch base, etc.)

set -uo pipefail

# Prefer gitleaks if available
if command -v gitleaks >/dev/null 2>&1; then
  echo "Using gitleaks..."
  gitleaks protect --staged --verbose --redact
  exit $?
fi

# Otherwise trufflehog
if command -v trufflehog >/dev/null 2>&1; then
  echo "Using trufflehog..."
  trufflehog git file://. --since-commit "$(git merge-base HEAD origin/main 2>/dev/null || echo HEAD~10)" --only-verified
  exit $?
fi

# Fallback: regex pass
echo "Using fallback regex scan (install gitleaks for better coverage)..."

# Get the diff vs origin/main
git fetch origin --quiet 2>/dev/null || true
BASE="$(git merge-base HEAD origin/main 2>/dev/null || git rev-parse HEAD~5)"
DIFF="$(git diff "$BASE"...HEAD 2>/dev/null)"

if [[ -z "$DIFF" ]]; then
  echo "No diff to scan."
  exit 0
fi

FAIL=0
hit() {
  echo "⚠️  Potential secret found: $1" >&2
  FAIL=1
}

# AWS Access Key
if echo "$DIFF" | grep -qE '\bAKIA[0-9A-Z]{16}\b'; then
  hit "AWS Access Key ID pattern (AKIA...)"
fi

# AWS Secret Key (rough — high-entropy 40-char string assigned to aws_secret-y name)
if echo "$DIFF" | grep -qiE 'aws[_-]?secret.{0,30}["\047][A-Za-z0-9/+=]{40}["\047]'; then
  hit "AWS Secret Access Key pattern"
fi

# GitHub tokens
if echo "$DIFF" | grep -qE '\bgh[pousr]_[A-Za-z0-9]{36,}\b'; then
  hit "GitHub token pattern (ghp_/gho_/ghu_/ghs_/ghr_)"
fi

# Generic high-entropy strings (likely tokens) after assignment to suspicious names
if echo "$DIFF" | grep -qiE '(api[_-]?key|secret|password|passwd|token|auth)[[:space:]]*[=:][[:space:]]*["\047][A-Za-z0-9_\-]{24,}["\047]'; then
  # Filter out obvious test/placeholder values
  if ! echo "$DIFF" | grep -iE '(api[_-]?key|secret|password|passwd|token|auth)[[:space:]]*[=:][[:space:]]*["\047][A-Za-z0-9_\-]{24,}["\047]' | grep -qiE '(example|placeholder|your[_-]|xxx|todo|fixme|test)'; then
    hit "Possible credential assignment with high-entropy value"
  fi
fi

# Private keys
if echo "$DIFF" | grep -qE -- '-----BEGIN (RSA|EC|DSA|OPENSSH|PGP)? ?PRIVATE KEY-----'; then
  hit "Private key block (-----BEGIN ... PRIVATE KEY-----)"
fi

# Slack tokens
if echo "$DIFF" | grep -qE '\bxox[abps]-[A-Za-z0-9-]{10,}\b'; then
  hit "Slack token pattern (xoxa-/xoxb-/xoxp-/xoxs-)"
fi

# Stripe live keys
if echo "$DIFF" | grep -qE '\bsk_live_[A-Za-z0-9]{20,}\b'; then
  hit "Stripe live secret key pattern (sk_live_...)"
fi

# Google API key
if echo "$DIFF" | grep -qE '\bAIza[0-9A-Za-z_-]{35}\b'; then
  hit "Google API key pattern (AIza...)"
fi

# .env content patterns (multiline KEY=VALUE blocks suggest leaked .env)
if echo "$DIFF" | grep -cE '^\+[A-Z_]{3,}=[A-Za-z0-9_\-./:@]{8,}$' | head -1 | awk '{ if ($1 > 5) exit 0; else exit 1; }'; then
  hit "Multiple env-style KEY=VALUE additions (possible leaked .env content)"
fi

if (( FAIL == 0 )); then
  echo "✓ Fallback secret scan: no findings."
  echo "  Note: this is a basic regex scan. Install gitleaks for stronger coverage:"
  echo "  brew install gitleaks  # or see https://github.com/gitleaks/gitleaks"
  exit 0
else
  echo
  echo "Secret scan found potential issues. Review carefully:"
  echo "  1. If a finding is a false positive, document why and proceed"
  echo "  2. If a real secret is in the diff:"
  echo "     a. Remove it from the diff"
  echo "     b. Rotate the secret immediately (it should be treated as leaked)"
  echo "     c. If the secret is already in git history, the rotation is even more urgent"
  exit 1
fi
