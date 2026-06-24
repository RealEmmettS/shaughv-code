#!/usr/bin/env python3
"""impact_stats.py — merge-impact statistics for the security-check skill (Mode C).

Computes how much of a repo a branch changes relative to its merge-base with the
trunk, and scans the diff for named breaking-change signals. The script supplies
NUMBERS; the agent reading the output supplies the verdict (see
references/impact-assessment.md for the classification bands).

Stdlib only. Always exits 0 — this is an informational tool, not a gate.

Usage:
    python impact_stats.py [--repo PATH] [--base REF] [--head REF] [--json]

    --repo PATH   repo to analyze (default: cwd)
    --base REF    trunk ref (default: tries origin/main, main, origin/master, master)
    --head REF    branch tip (default: HEAD)
    --json        emit JSON only (default: markdown summary + JSON block)

If the working tree is dirty, a second "including uncommitted changes" pass is
reported automatically, since "what happens if we push this" usually means
everything currently on disk.
"""

import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import PurePosixPath

# ---------------------------------------------------------------------------
# Breaking-change signal catalog (path-based). Order matters only for display.
# ---------------------------------------------------------------------------
SIGNAL_PATTERNS = {
    "dependency-manifest": [
        r"(^|/)package\.json$", r"(^|/)package-lock\.json$", r"(^|/)pnpm-lock\.yaml$",
        r"(^|/)yarn\.lock$", r"(^|/)Cargo\.toml$", r"(^|/)Cargo\.lock$",
        r"(^|/)requirements[^/]*\.txt$", r"(^|/)pyproject\.toml$", r"(^|/)poetry\.lock$",
        r"(^|/)go\.(mod|sum)$", r"\.csproj$", r"(^|/)packages\.config$",
    ],
    "db-schema-or-migration": [
        r"migration", r"\.sql$", r"(^|/)schema[s]?(/|\.)",
    ],
    "ci-cd-pipeline": [
        r"(^|/)\.github/workflows/", r"azure-pipelines", r"(^|/)\.gitlab-ci",
    ],
    "container-or-iac": [
        r"(^|/)Dockerfile", r"docker-compose", r"\.bicep$", r"\.tf$",
        r"azuredeploy.*\.json$", r"(^|/)staticwebapp\.config\.json$", r"(^|/)host\.json$",
    ],
    "app-config": [
        r"(^|/)[^/]*\.config\.(js|ts|cjs|mjs|json)$", r"(^|/)tsconfig[^/]*\.json$",
        r"(^|/)vite\.config", r"(^|/)\.env\.example$", r"(^|/)local\.settings\.json$",
        r"(^|/)appsettings[^/]*\.json$",
    ],
}

# Diff-content signals: removed/modified lines that look like public surface.
CONTENT_SIGNALS = {
    "exported-api-changed": re.compile(
        r"^-\s*(export\s+(default\s+)?(async\s+)?(function|const|class|interface|type|enum)\b"
        r"|pub\s+(async\s+)?(fn|struct|enum|trait|mod)\b"
        r"|def\s+\w+\s*\(|class\s+\w+\b)"
    ),
    "http-route-changed": re.compile(
        r"^[-+].*(app\.(get|post|put|patch|delete|http)\s*\("
        r"|@(app|router)\.(get|post|put|patch|delete)\b"
        r"|route:\s*['\"]|\bregister\w*Route\b)",
        re.IGNORECASE,
    ),
    "sql-destructive-ddl": re.compile(
        r"^\+.*\b(DROP\s+(TABLE|COLUMN|VIEW|INDEX|PROCEDURE)|ALTER\s+TABLE|TRUNCATE\s+TABLE)\b",
        re.IGNORECASE,
    ),
    "dependency-version-changed": re.compile(
        r"^[-+]\s*[\"']?[\w@/.-]+[\"']?\s*[:=]\s*[\"']?[\^~>=<]*\d+\.\d+"
    ),
}

# Content signals only fire on code — docs/markdown quoting destructive DDL
# or route registrations as example text must not count as breaking evidence.
CODE_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".rs", ".go", ".cs",
    ".sql", ".java", ".rb", ".php", ".ps1", ".sh", ".bicep", ".tf",
}

TEXT_EXTENSIONS_SKIP = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".zip", ".skill", ".woff",
    ".woff2", ".ttf", ".eot", ".mp4", ".mov", ".pptx", ".docx", ".xlsx", ".dll",
    ".exe", ".so", ".dylib", ".wasm", ".lockb",
}


def run_git(repo, *args):
    result = subprocess.run(
        ["git", "-C", repo, *args],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    return result.returncode, result.stdout


def detect_base(repo, explicit):
    candidates = [explicit] if explicit else ["origin/main", "main", "origin/master", "master"]
    for ref in candidates:
        if ref is None:
            continue
        code, _ = run_git(repo, "rev-parse", "--verify", "--quiet", ref)
        if code == 0:
            return ref
    return None


def numstat(repo, base, head_or_worktree):
    """Return list of (added, deleted, path). head_or_worktree=None → diff to working tree."""
    args = ["diff", "--numstat", f"{base}...{head_or_worktree}"] if head_or_worktree else ["diff", "--numstat", base]
    code, out = run_git(repo, *args)
    rows = []
    for line in out.splitlines():
        parts = line.split("\t")
        if len(parts) != 3:
            continue
        added, deleted, path = parts
        rows.append((
            0 if added == "-" else int(added),
            0 if deleted == "-" else int(deleted),
            path,
        ))
    return rows


def repo_totals(repo):
    """Count tracked files and total lines of tracked text files."""
    _, out = run_git(repo, "ls-files")
    files = [f for f in out.splitlines() if f]
    total_lines = 0
    text_files = 0
    for f in files:
        if PurePosixPath(f).suffix.lower() in TEXT_EXTENSIONS_SKIP:
            continue
        code, content = run_git(repo, "show", f"HEAD:{f}")
        if code != 0:
            continue
        text_files += 1
        total_lines += content.count("\n")
    return len(files), text_files, total_lines


def path_signals(paths):
    hits = defaultdict(list)
    for sig, patterns in SIGNAL_PATTERNS.items():
        for p in paths:
            if any(re.search(rx, p) for rx in patterns):
                hits[sig].append(p)
    return hits


def content_signals(repo, base, head_or_worktree):
    args = ["diff", f"{base}...{head_or_worktree}"] if head_or_worktree else ["diff", base]
    _, out = run_git(repo, *args)
    hits = defaultdict(int)
    samples = defaultdict(list)
    current_file = None
    for line in out.splitlines():
        if line.startswith("+++ b/"):
            current_file = line[6:]
            continue
        is_code = current_file and PurePosixPath(current_file).suffix.lower() in CODE_EXTENSIONS
        for sig, rx in CONTENT_SIGNALS.items():
            # dependency-version-changed only meaningful inside manifests
            if sig == "dependency-version-changed":
                if not current_file or not re.search(
                    r"(package\.json|Cargo\.toml|pyproject\.toml|requirements.*\.txt|go\.mod|\.csproj)$",
                    current_file,
                ):
                    continue
            elif not is_code:
                continue
            if rx.search(line):
                hits[sig] += 1
                if len(samples[sig]) < 5:
                    samples[sig].append(f"{current_file}: {line[:160]}")
    return hits, samples


def untracked_rows(repo):
    """Untracked files are invisible to `git diff` but very much part of
    'what happens if we push the current changes' — count every line as added."""
    # -uall: list every untracked file; default collapses untracked dirs to one entry
    _, out = run_git(repo, "status", "--porcelain", "-uall")
    rows, lines_by_file = [], {}
    for line in out.splitlines():
        if not line.startswith("??"):
            continue
        path = line[3:].strip().strip('"')
        if PurePosixPath(path).suffix.lower() in TEXT_EXTENSIONS_SKIP:
            rows.append((0, 0, path))
            continue
        try:
            with open(f"{repo}/{path}", encoding="utf-8", errors="replace") as fh:
                content = fh.read()
            n = content.count("\n")
            rows.append((n, 0, path))
            lines_by_file[path] = content.splitlines()
        except OSError:
            rows.append((0, 0, path))
    return rows, lines_by_file


def analyze(repo, base, head, include_untracked=False):
    rows = numstat(repo, base, head)
    extra_lines = {}
    if include_untracked:
        urows, extra_lines = untracked_rows(repo)
        rows += urows
    changed_files = len(rows)
    added = sum(r[0] for r in rows)
    deleted = sum(r[1] for r in rows)

    by_dir = defaultdict(int)
    for a, d, p in rows:
        top = p.split("/", 1)[0] if "/" in p else "(root)"
        by_dir[top] += a + d

    psig = path_signals([r[2] for r in rows])
    csig, csamples = content_signals(repo, base, head)
    for path, lines in extra_lines.items():  # content signals inside untracked files
        if PurePosixPath(path).suffix.lower() not in CODE_EXTENSIONS:
            continue
        for line in lines:
            for sig, rx in CONTENT_SIGNALS.items():
                if sig == "dependency-version-changed":
                    continue  # only meaningful as a manifest *change*
                if rx.search("+" + line):
                    csig[sig] += 1
                    if len(csamples[sig]) < 5:
                        csamples[sig].append(f"{path} (untracked): {line[:160]}")

    return {
        "changed_files": changed_files,
        "lines_added": added,
        "lines_deleted": deleted,
        "lines_changed": added + deleted,
        "churn_by_top_dir": dict(sorted(by_dir.items(), key=lambda kv: -kv[1])),
        "path_signals": {k: v for k, v in psig.items()},
        "content_signals": {k: v for k, v in csig.items()},
        "content_signal_samples": {k: v for k, v in csamples.items()},
    }


def suggest_band(pct_loc, pct_files, signal_count):
    if signal_count == 0 and pct_loc < 2 and pct_files < 5:
        return "patch-like", "several small changes; low merge risk"
    if pct_loc >= 10 or pct_files >= 20 or signal_count >= 1:
        return "major-possibly-breaking", "large surface or named breaking signals; review each signal before merging"
    return "moderate", "more than trivial, no breaking signals detected; normal review"


def main():
    if hasattr(sys.stdout, "reconfigure"):  # Windows consoles default to cp1252
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=".")
    ap.add_argument("--base", default=None)
    ap.add_argument("--head", default="HEAD")
    ap.add_argument("--json", action="store_true", dest="json_only")
    args = ap.parse_args()

    code, _ = run_git(args.repo, "rev-parse", "--git-dir")
    if code != 0:
        print(json.dumps({"error": f"not a git repo: {args.repo}"}))
        return 0

    base = detect_base(args.repo, args.base)
    if base is None:
        print(json.dumps({"error": "no trunk ref found (tried origin/main, main, origin/master, master)"}))
        return 0

    run_git(args.repo, "fetch", "--quiet")
    code, mb = run_git(args.repo, "merge-base", base, args.head)
    merge_base = mb.strip() if code == 0 else None

    total_files, text_files, total_lines = repo_totals(args.repo)

    committed = analyze(args.repo, base, args.head)
    _, dirty = run_git(args.repo, "status", "--porcelain")
    with_worktree = (
        analyze(args.repo, merge_base or base, None, include_untracked=True)
        if dirty.strip() else None
    )

    def enrich(block):
        pct_files = 100.0 * block["changed_files"] / total_files if total_files else 0.0
        pct_loc = 100.0 * block["lines_changed"] / total_lines if total_lines else 0.0
        signals = set(block["path_signals"]) | set(block["content_signals"])
        band, rationale = suggest_band(pct_loc, pct_files, len(signals))
        block.update({
            "pct_files_touched": round(pct_files, 2),
            "pct_loc_changed": round(pct_loc, 2),
            "distinct_signals": sorted(signals),
            "suggested_band": band,
            "band_rationale": rationale,
        })
        return block

    report = {
        "repo": args.repo,
        "base": base,
        "merge_base": merge_base,
        "head": args.head,
        "repo_totals": {
            "tracked_files": total_files,
            "text_files_counted": text_files,
            "total_text_lines": total_lines,
        },
        "committed": enrich(committed),
        "including_uncommitted": enrich(with_worktree) if with_worktree else None,
        "note": "Bands are a suggestion only — the agent applies references/impact-assessment.md judgment, especially for signals the regexes can't see (semantic breaking changes, behavior changes behind unchanged signatures).",
    }

    if not args.json_only:
        b = report["committed"]
        print(f"## Merge-impact stats — {args.head} vs {base} (merge-base {merge_base[:9] if merge_base else '?'})\n")
        print("| Metric | Value |")
        print("|---|---|")
        print(f"| Files touched | {b['changed_files']} / {total_files} ({b['pct_files_touched']}%) |")
        print(f"| Lines changed | {b['lines_changed']} (+{b['lines_added']}/-{b['lines_deleted']}) of {total_lines} ({b['pct_loc_changed']}%) |")
        print(f"| Breaking signals | {', '.join(b['distinct_signals']) or 'none detected'} |")
        print(f"| Suggested band | **{b['suggested_band']}** — {b['band_rationale']} |")
        if report["including_uncommitted"]:
            w = report["including_uncommitted"]
            print(f"\nWorking tree is dirty — including uncommitted changes: "
                  f"{w['changed_files']} files, {w['lines_changed']} lines "
                  f"({w['pct_loc_changed']}%), band **{w['suggested_band']}**.")
        print("\n```json")
    print(json.dumps(report, indent=2))
    if not args.json_only:
        print("```")
    return 0


if __name__ == "__main__":
    sys.exit(main())
