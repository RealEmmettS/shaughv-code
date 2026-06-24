#!/usr/bin/env python3
"""secret_scan.py — secrets sweep for the security-check skill.

Cross-platform (Python stdlib) secrets detection for audits. Prefers gitleaks
when installed; falls back to a curated regex + entropy pass. This is the
AUDIT-side scanner — `git-workflow/scripts/secret-scan.sh` remains the
canonical Tier-1 pre-PR gate; the two share rule philosophy but this one adds
git-history scanning (secrets committed then "removed" are still in history
and still burned).

Usage:
    python secret_scan.py [--repo PATH] [--mode files|diff|history] [--base REF]
                          [--gate] [--json]

    --mode files    scan all tracked files at HEAD (default)
    --mode diff     scan only lines added relative to --base (default origin/main)
    --mode history  scan every commit's added lines across full history (slow but
                    exhaustive — finds secrets later deleted)
    --gate          exit 1 if any finding (default: always exit 0, informational)
    --json          JSON output only

Output masks matched values (first 4 + last 4 chars) — the report itself must
never become a secrets exfiltration vector.
"""

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import PurePosixPath

RULES = [
    ("aws-access-key-id",        re.compile(r"\b(AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("github-token",             re.compile(r"\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b|github_pat_[A-Za-z0-9_]{40,}")),
    ("slack-token",              re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("stripe-live-key",          re.compile(r"\b[rs]k_live_[A-Za-z0-9]{20,}\b")),
    ("google-api-key",           re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("anthropic-api-key",        re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b")),
    ("openai-api-key",           re.compile(r"\bsk-(proj-)?[A-Za-z0-9_-]{32,}\b")),
    ("azure-storage-account-key",re.compile(r"AccountKey=[A-Za-z0-9+/=]{60,}")),
    ("azure-sas-token",          re.compile(r"[?&]sig=[A-Za-z0-9%+/=]{30,}")),
    ("azure-client-secret-ish",  re.compile(r"\b[A-Za-z0-9~._-]{3}8Q~[A-Za-z0-9~._-]{30,}\b")),
    ("private-key-block",        re.compile(r"-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY( BLOCK)?-----")),
    ("jwt-literal",              re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
    ("npm-auth-token",           re.compile(r"_authToken\s*=\s*\S{16,}")),
    ("connection-string-pwd",    re.compile(r"(?i)(Password|Pwd)\s*=\s*[^;'\"\s]{8,}\s*(;|$)")),
    ("generic-assigned-secret",  re.compile(r"(?i)\b(api[_-]?key|secret|token|password|passwd|client[_-]?secret)\b\s*[:=]\s*['\"]([^'\"]{12,})['\"]")),
]

# Substrings that mark a value as a placeholder, not a live secret.
ALLOWLIST_HINTS = (
    "example", "sample", "placeholder", "changeme", "change-me", "your-", "your_",
    "<", "xxx", "dummy", "fake", "test-", "redacted", "todo", "fixme", "insert",
    "secret_name", "keyvault", "@microsoft.keyvault", "process.env", "os.environ",
    "env(", "${", "%s", "{0}", "lorem",
)

SKIP_EXT = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".zip", ".skill", ".woff",
    ".woff2", ".ttf", ".mp4", ".lock", ".lockb", ".map", ".min.js", ".svg",
}
SKIP_PATH_HINTS = ("node_modules/", "dist/", "build/", ".git/", "vendor/", "target/")


def shannon_entropy(s):
    if not s:
        return 0.0
    freq = {c: s.count(c) for c in set(s)}
    return -sum((n / len(s)) * math.log2(n / len(s)) for n in freq.values())


def run_git(repo, *args):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True,
                       text=True, encoding="utf-8", errors="replace")
    return r.returncode, r.stdout


def mask(value):
    v = value.strip("'\"")
    if len(v) <= 10:
        return v[:2] + "…" + v[-2:]
    return v[:4] + "…" + v[-4:] + f" (len {len(v)})"


def is_allowlisted(line, value):
    low = (line + " " + value).lower()
    return any(h in low for h in ALLOWLIST_HINTS)


def scan_line(path, lineno, line, origin):
    findings = []
    if len(line) > 2000:  # minified bundles; entropy soup, not source
        return findings
    for rule, rx in RULES:
        m = rx.search(line)
        if not m:
            continue
        value = m.group(2) if rule == "generic-assigned-secret" else m.group(0)
        if is_allowlisted(line, value):
            continue
        if rule == "generic-assigned-secret" and shannon_entropy(value) < 3.2:
            continue  # low-entropy strings like 'administrator' are config, not secrets
        findings.append({
            "rule": rule, "file": path, "line": lineno,
            "match": mask(value), "origin": origin,
        })
    return findings


def scan_files(repo):
    _, out = run_git(repo, "ls-files")
    findings = []
    for f in out.splitlines():
        pf = PurePosixPath(f)
        if pf.suffix.lower() in SKIP_EXT or any(h in f for h in SKIP_PATH_HINTS):
            continue
        code, content = run_git(repo, "show", f"HEAD:{f}")
        if code != 0:
            continue
        for i, line in enumerate(content.splitlines(), 1):
            findings.extend(scan_line(f, i, line, "HEAD"))
    return findings


def scan_diff(repo, base):
    _, out = run_git(repo, "diff", f"{base}...HEAD")
    return _scan_patch(out, origin=f"diff vs {base}")


def scan_history(repo):
    _, out = run_git(repo, "log", "-p", "--all", "--unified=0", "--diff-filter=AM")
    return _scan_patch(out, origin="history")


def _scan_patch(patch_text, origin):
    findings, current = [], "?"
    for line in patch_text.splitlines():
        if line.startswith("+++ b/"):
            current = line[6:]
            continue
        if not line.startswith("+") or line.startswith("+++"):
            continue
        if any(h in current for h in SKIP_PATH_HINTS):
            continue
        findings.extend(scan_line(current, 0, line[1:], origin))
    # History mode re-reports the same secret per commit; dedup on (rule,file,match)
    seen, deduped = set(), []
    for f in findings:
        key = (f["rule"], f["file"], f["match"])
        if key not in seen:
            seen.add(key)
            deduped.append(f)
    return deduped


def try_gitleaks(repo, mode, base):
    if not shutil.which("gitleaks"):
        return None
    args = ["gitleaks", "detect", "--no-banner", "--report-format", "json",
            "--report-path", "-", "--source", repo, "--exit-code", "0"]
    if mode == "diff":
        args += ["--log-opts", f"{base}...HEAD"]
    elif mode == "files":
        args += ["--no-git"]
    r = subprocess.run(args, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    try:
        raw = json.loads(r.stdout or "[]")
    except json.JSONDecodeError:
        return None
    return [{"rule": f.get("RuleID", "gitleaks"), "file": f.get("File", "?"),
             "line": f.get("StartLine", 0), "match": mask(f.get("Secret", "")),
             "origin": f"gitleaks:{mode}"} for f in raw]


def main():
    if hasattr(sys.stdout, "reconfigure"):  # Windows consoles default to cp1252
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=".")
    ap.add_argument("--mode", choices=["files", "diff", "history"], default="files")
    ap.add_argument("--base", default="origin/main")
    ap.add_argument("--gate", action="store_true")
    ap.add_argument("--json", action="store_true", dest="json_only")
    args = ap.parse_args()

    engine = "gitleaks"
    findings = try_gitleaks(args.repo, args.mode, args.base)
    if findings is None:
        engine = "builtin-regex"
        if args.mode == "files":
            findings = scan_files(args.repo)
        elif args.mode == "diff":
            findings = scan_diff(args.repo, args.base)
        else:
            findings = scan_history(args.repo)

    report = {"engine": engine, "mode": args.mode, "findings": findings,
              "count": len(findings)}
    if args.json_only:
        print(json.dumps(report, indent=2))
    else:
        print(f"secret_scan: engine={engine} mode={args.mode} findings={len(findings)}")
        for f in findings:
            print(f"  [{f['rule']}] {f['file']}:{f['line']} -> {f['match']} ({f['origin']})")
        if findings and args.mode == "history":
            print("  NOTE: history findings are burned even if the file no longer "
                  "contains them — rotate the credential; rewriting history is optional.")
    return 1 if (args.gate and findings) else 0


if __name__ == "__main__":
    sys.exit(main())
