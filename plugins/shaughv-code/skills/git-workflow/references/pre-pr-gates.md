# Pre-PR Gates — The Standard

Before this skill opens a PR, every applicable gate below must pass or be
explicitly overridden. This document is the canonical list. The skill MUST
walk it in order; it MUST NOT skip ahead to `gh pr create` without
completing it.

## How the tiers work

| Tier | Behavior |
|---|---|
| **Tier 1 — Hard gate** | If the check fails, the skill pauses before creating the PR and shows the specific failure. Only the operator may accept it, through a clear decision made after disclosure. |
| **Tier 2 — Warn + override** | If the check fails, the skill explains the risk and recommends the fix. A clear owner instruction to proceed is enough; no justification or magic phrase is required. |
| **Tier 3 — Soft check** | The skill notes the result in its output and in the PR body, but does not block or require an override. |

## Scaling to diff size

Gates SHOULD scale to the size and nature of the change. Specifically:

- Diffs under 50 lines and touching no UI files MAY skip the browser test gate
- Diffs that are documentation-only (only `.md` files) MAY skip type-check,
  linter, formatter, and console-warning gates
- Hotfixes follow the full Tier 1 list but MAY have a relaxed Tier 2 list
  if production is actively broken; note the incident when known

The skill should announce when it's scaling gates ("docs-only change, skipping
type-check") so the operator knows what's being skipped and why.

---

## Tier 1 — Hard gates

These are checks the skill MUST verify before opening a PR. Failure of any
hard gate pauses `gh pr create` until the issue is fixed or the operator
explicitly accepts that disclosed failure.

### T1.1 — All tests pass locally

Claude runs the project's test command and captures the output. The test
output (pass count, fail count, duration) is included in the PR body under
"How to test."

If tests fail: surface the failure to the operator. Don't proceed.

If the project's test command isn't known: ask the operator. Don't guess.

### T1.2 — Type-check passes

Run the project's type-check command. Examples:

- TypeScript: `tsc --noEmit` or `npm run typecheck`
- Python: `mypy .` or `pyright`
- Go: `go vet ./...`
- Rust: `cargo check`

Capture output. Block on any type error.

### T1.3 — Linter passes

Run the project's linter. Examples:

- JS/TS: `eslint .` or `npm run lint`
- Python: `ruff check .` or `flake8`
- Go: `golangci-lint run`
- Rust: `cargo clippy -- -D warnings`

New lint errors block. Pre-existing lint errors that are unchanged by the
diff are noted but don't block (don't make the operator clean up unrelated
mess as a condition of their PR).

### T1.4 — Formatter has run

Run the project's formatter in check mode. Examples:

- `prettier --check .`
- `black --check .`
- `gofmt -l .`
- `cargo fmt --check`

If formatting issues exist: offer to run the formatter and re-stage the
changes. Don't open the PR with formatting drift.

### T1.5 — Secret scan passes

Run a secret-scan pass on the staged diff. The skill ships with a basic
regex set covering the most common cases (AWS keys, GitHub tokens, generic
high-entropy strings, `.env` content, common API key prefixes). See
`scripts/secret-scan.sh`.

If `gitleaks` or `trufflehog` is installed, prefer those.

**Any hit on this gate is treated as severe.** Don't just block — instruct
the operator to (a) remove the secret from the diff, (b) rotate the leaked
credential immediately, (c) consider whether the secret has been in git
history at all (if yes, the cleanup is more involved).

### T1.6 — No build artifacts or junk files in diff

Block the diff if it includes any of:

- `node_modules/`, `.next/`, `dist/`, `build/`, `target/`
- `__pycache__/`, `*.pyc`, `.pytest_cache/`
- `.DS_Store`, `Thumbs.db`
- `*.log` files outside an `examples/` or `fixtures/` directory
- Files matching the project's `.gitignore` patterns that snuck in anyway

Offer to update `.gitignore` and unstage.

### T1.7 — Branch state is valid

All of:

- Branch name matches convention (see `references/branch-naming.md`)
- Branch is rebased onto current `origin/main` (no behind-count)
- Working tree is clean (everything intended is committed; nothing
  unintended is uncommitted)

Run `scripts/check-branch.sh` for the mechanical version.

### T1.8 — PR body is filled out

The PR body MUST cover What, Why, How to test, Risk, Checklist. A blank
body, a one-liner, or just a copy of the branch name is a fail.

Specifically, the PR body must contain:

- A "What" section with at least 1 substantive sentence
- A "Why" section (link to a ticket counts, but a sentence is better)
- A "How to test" section with at least one concrete step
- A "Risk" line with Low / Medium / High and one-sentence justification
- The test/typecheck/lint/format results pasted in

### T1.9 — Security agent review

A security review subagent MUST run on the diff before the PR is opened.

**How the skill invokes it:**

The skill spawns a security-review subagent with this prompt template:

```
You are a security review agent. Review the following git diff for security
issues. Specifically check for:

1. Hard-coded secrets, credentials, API keys, tokens
2. SQL injection vectors (string-concatenated queries, unparameterized SQL)
3. Command injection vectors (shell calls with user-controlled input)
4. Path traversal vulnerabilities (file ops on user-controlled paths)
5. Insecure deserialization
6. Authentication / authorization bypass
7. Cryptographic mistakes (weak algorithms, hardcoded IVs, predictable RNG)
8. Sensitive data in logs (PII, secrets, tokens)
9. CORS misconfigurations
10. Dependency additions with known CVEs
11. Eval / dynamic code execution on untrusted input
12. Missing input validation on user-facing endpoints

For each finding, return:
  - Severity: Critical | High | Medium | Low | Info
  - Category: (from the list above or "Other")
  - File and line range
  - Description: what's wrong
  - Suggested fix

End with a verdict: PASS, PASS WITH NOTES, or FAIL.

Diff to review:
<paste git diff main...HEAD here>
```

**Verdict handling:**

- **PASS** → gate clears
- **PASS WITH NOTES** → gate clears, but the findings are appended to the
  PR body in a "Security review notes" section so the human reviewer sees them
- **FAIL** (any Critical or High finding) → gate pauses. The skill summarizes
  the findings and waits for remediation or a specific operator acceptance
  after disclosure. A brief explicit acceptance is sufficient and is recorded
  in the PR body when one exists.

The full security-review output gets attached to the PR body in a collapsed
section so reviewers have it on the record.

### T1.10 — Chrome DevTools console inspection (when applicable)

**Applies when:** the diff touches any of `.tsx`, `.jsx`, `.vue`, `.svelte`,
`.html`, `.css`, public JS/TS, templates, or any file under a `web/`,
`frontend/`, `client/`, or `ui/` directory. Skip otherwise.

**What the skill does:**

1. Start the app locally (or confirm it's already running)
2. Open Chrome via Claude in Chrome
3. Navigate to the page the change affects
4. Open DevTools console
5. **Capture baseline console output** before exercising the new code path
6. Exercise the change (click the new button, submit the new form, navigate
   to the new route, etc.)
7. **Capture console output after** exercising the change
8. Diff baseline vs. after

**Findings handling:**

| Found | Action |
|---|---|
| No new warnings or errors | Gate passes. Note "Console clean" in PR body. |
| New warnings | Gate passes but each new warning is listed in the PR body under "Console output introduced," with one of three labels: <br>• **Avoidable** — should be fixed before merging<br>• **Acceptable** — understood and accepted (with reason)<br>• **Pre-existing** — was already there, surfaced now (with link/note) |
| New errors | Gate blocks. Errors are not allowed to ship without explicit override. If the operator believes an error is unavoidable (third-party library, known browser quirk), they must override with a reason and the error must be documented in the PR body. |

**The PR body MUST include a "Console output" section** when this gate runs,
even if the result is "clean."

Example PR body addition:

```markdown
## Console output
**Baseline:** clean
**After exercising new feature:** 1 new warning, 0 new errors

### New warnings
- `[Vue warn]: Avoid mutating a prop directly` at `ReportTable.vue:142`
  — **Acceptable**. Pre-existing pattern across the codebase; fixing in
  scope here would balloon the diff. Tracked separately in #218.
```

### T1.11 — Operator sign-off

The operator must clearly authorize opening the PR. Any unambiguous approval
counts, including "approved," "go," "open the PR when ready," or "I have
reviewed the diff and approve." No exact phrase is required.

Before asking for sign-off, the skill MUST:

1. Print a summary of the diff: files changed, +/- lines, files touched
2. Print the output of every other Tier 1 check (so the operator sees the
   state)
3. Run `git diff main...HEAD --stat` and include the result
4. Ask for approval only if the operator has not already given an advance
   delivery directive.

An earlier instruction such as "open the PR when ready" remains valid once all
checks pass. Do not ask again solely because the diff and results are now
available. If a check failed after that instruction, surface the failure and
obtain a new decision about that failure.

If the operator wants to abort instead of approving, they can say so freely.

---

## Tier 2 — Warn + override

Each failure prints a warning, explains the risk, and recommends the fix. A
clear operator instruction to proceed is sufficient; acknowledge it and
continue without demanding a reason or prescribed wording.

### T2.1 — Operator has personally exercised the change

Ask the operator: "Have you personally run this code locally end-to-end
(not just trusted the test output)?"

If yes: record their answer and proceed.

If no: warn. "Tests passing isn't the same as the feature actually working.
For changes more than a typo, exercising it yourself catches things tests
don't. Do you want to do that first?"

Optional context example: "Pure refactor with no behavior change; existing
tests cover it."

### T2.2 — New tests added for new behavior

If the diff adds new functions, endpoints, or branches and contains zero
new or modified test files: warn.

Optional context example: "Refactor only — no new behavior, existing tests
cover the surface area."

### T2.3 — Diff size is sane

Warn if:

- More than 400 lines changed (additions + deletions)
- More than 20 files touched

These are proxies for "this change is hard to review well." Suggest slicing
if possible.

Optional context example: "Generated migration file inflates line count;
hand-written changes are ~80 lines."

### T2.4 — CI is currently green on `main`

Check the most recent CI run on `main`. If it's failing: warn.

Recommended fix: revert the breaking commit or fix-forward on `main` before
piling on new PRs.

Optional context example: "Known CI flake — last 3 runs show the same test
flakes intermittently, fix is in #203."

### T2.5 — Branch is under 48h age cap

Already enforced in the broader workflow. Re-check here as a final reminder.

### T2.6 — No debug statements in diff

Grep the diff for:

- JavaScript/TypeScript: `console.log`, `console.debug`, `debugger;`
- Python: `print(`, `breakpoint()`, `pdb.set_trace()`, `import pdb`
- Rust: `dbg!`, `eprintln!`
- Go: `fmt.Println` in non-CLI code

If found: list them. Ask the operator if they're intentional (some are —
e.g., production logging via `console.log` in some Node setups; surfaces
in CLI tools).

Optional context example: "console.log in CLI tool — intentional output to
user."

### T2.7 — Feature flag wired if change is partial/risky

If the operator self-reports the change as Medium or High risk in the PR
body, OR the change adds a new endpoint/feature, ask: "Is this behind a
feature flag?"

If not: warn. Recommend wrapping the new behavior in a flag per
`references/feature-flags.md`.

Optional context example: "Internal admin endpoint, auth-gated, not exposed
to users."

### T2.8 — Commit messages are meaningful

Scan commit messages for: `wip`, `fix`, `stuff`, `update`, `changes`,
`asdf`, single-character commits, or anything under 10 chars.

If found: offer to interactive-rebase to clean them up
(`git rebase -i origin/main`).

Optional context example: "Squash merge will replace these anyway."

### T2.9 — Risk level explicitly stated in PR body

The "Risk" line in the PR body must be Low, Medium, or High with a
one-sentence justification. If just "Low" with no justification, warn.

If Medium or High with no mitigation plan, warn.

### T2.10 — Console warnings have been triaged

(Companion to T1.10.) Even when the console-inspection gate passes (only
warnings, no errors), the operator should explicitly classify each new
warning as Avoidable / Acceptable / Pre-existing. If any new warning is
unclassified in the PR body, warn.

---

## Tier 3 — Soft checks (record only)

These get noted in the skill's output and in the PR body's "Checklist"
section, but don't block.

- T3.1 — README / docs updated if behavior or API changed
- T3.2 — CHANGELOG entry added (if the project maintains one)
- T3.3 — Migration files surfaced explicitly (if any DB migration is in
  the diff)
- T3.4 — Logging or metrics added for new code paths
- T3.5 — Dependency audit (`npm audit` / `pip-audit`) — note any new high
  or critical advisories

---

## The gate-walking script (mental model)

When the operator says "open a PR," the skill performs this sequence:

```
1. Determine diff scope:
   - Files changed, lines changed
   - Does it touch UI? Backend? Docs only? Tests only?
   - This decides which gates apply.

2. Run Tier 1 gates in order. If any fails, stop and report.
   - T1.1 Tests
   - T1.2 Typecheck
   - T1.3 Lint
   - T1.4 Format
   - T1.5 Secret scan
   - T1.6 No junk files
   - T1.7 Branch state
   - T1.8 PR body drafted (skill can draft this from commits + diff, but
          operator should confirm or revise before sign-off)
   - T1.9 Security agent (runs on the diff; the skill summarizes findings)
   - T1.10 Console inspection (if UI files touched)
   - T1.11 Operator sign-off (LAST — comes after everything else is in place)

3. Run Tier 2 gates in order. Each failure → warn and recommend. A clear
   operator instruction to proceed is enough; acknowledge it once.

4. Note Tier 3 results in PR body.

5. Only after T1.11 passes: run `gh pr create`.

6. After PR is created, paste the URL and summarize what got logged
   (overrides taken, gates skipped due to scope, Tier 3 notes).
```

---

## What the operator sees

A typical "open a PR" run looks like this:

```
Walking pre-PR gates for branch feat/add-csv-export-142...

Scope: 8 files changed, +183 / -42 lines. UI files touched: yes.

Tier 1:
  T1.1  Tests        ✓ 142 passed, 0 failed, 12.3s
  T1.2  Typecheck    ✓ no errors
  T1.3  Lint         ✓ no new issues (3 pre-existing, unchanged)
  T1.4  Format       ✓ prettier check passed
  T1.5  Secret scan  ✓ no findings
  T1.6  Junk files   ✓ none
  T1.7  Branch state ✓ rebased, working tree clean
  T1.8  PR body      ✓ drafted (review below before sign-off)
  T1.9  Security     ✓ PASS WITH NOTES (1 medium finding, added to PR body)
  T1.10 Console      ⚠ 1 new warning introduced — classify before sign-off

Tier 2:
  T2.1  Exercised locally?   asking operator...
  T2.2  New tests added      ✓ 3 new test cases
  T2.3  Diff size            ✓ within limits
  T2.4  CI green on main     ✓
  T2.5  Branch age           ✓ 18 hours
  T2.6  No debug statements  ✓
  T2.7  Feature flag wired   ✓ REPORTS_CSV_EXPORT (default off)
  T2.8  Commit messages      ✓
  T2.9  Risk stated          ✓ Low (new endpoint, auth-gated, flagged off)
  T2.10 Console triaged      pending (see T1.10)

[Draft PR body printed here]

[Diff summary printed here]

Open questions before sign-off:
1. T2.1: Have you personally run this locally end-to-end?
2. T1.10/T2.10: One new console warning introduced. Please classify it
   (Avoidable / Acceptable / Pre-existing) with a one-line reason.

Once those are answered and the PR body looks right, give any clear approval
to proceed with `gh pr create`. If you already said "open the PR when ready"
and every check is green, no additional sign-off is needed.
```

This is the standard. The skill should follow it consistently.
