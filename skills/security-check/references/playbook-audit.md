# Playbook — Mode A: Full-Repo Security Audit

The exhaustive path. Budget hours, not minutes. The output contract is fixed:
a one-screen chat summary + the exhaustive report at
`<repo>/security-audit/<YYYY-MM-DD>-<HHmm>-audit.md` (create the folder if missing).

## Phase 0 — Fingerprint (always first, ~5 min)

Run the fingerprint from SKILL.md §Fingerprint. Output: the list of detected
surfaces and the matching `stack-*.md` references. Record the fingerprint table
in the report — it is the audit's coverage claim. A surface you didn't detect
is a surface you didn't audit; say so explicitly under "Out of scope".

Also capture repo facts the rest of the audit reuses: entry points (HTTP
handlers, function triggers, MCP tools, CLI mains), auth middleware locations,
the data layer module(s), and how config/secrets are loaded.

## Phase 1 — Mechanical sweeps (~15–30 min, cheap and broad)

Before reading any code deeply, run every Greppable-sweep table row from each
applicable `stack-*.md`. These are `rg` patterns — run them verbatim, log hits
to a working list. Do not triage yet; collection and judgment are separate
passes (judging while collecting biases you toward stopping early).

Also always run, regardless of fingerprint:

```bash
# Secrets — current tree AND history (history finds burned-but-deleted secrets)
python <skill-path>/scripts/secret_scan.py --repo . --mode files
python <skill-path>/scripts/secret_scan.py --repo . --mode history

# Dangerous constructs, any language
rg -n "eval\(|new Function\(|child_process|subprocess|os\.system|shell=True|pickle\.loads|yaml\.load\((?!.*SafeLoader)" --type-add 'src:*.{ts,tsx,js,py,rs}' -tsrc

# TODO/FIXME security debt the team already knows about
rg -in "(todo|fixme|hack|xxx).{0,60}(auth|secur|inject|sanitiz|escape|secret|token|permission)"
```

## Phase 2 — Domain deep-dives (the bulk of the audit)

For each detected surface, work its `stack-*.md` checklist end-to-end against
the actual code. This is reading work: trace entry point → validation → logic →
data layer → response for each route/trigger/tool.

**Always include the data-security pass** (`data-security.md`), regardless of
fingerprint — every repo touches data. It produces the sensitive-data map and
the four posture answers that anchor the report's posture overview. This is
what makes the output an overall security report rather than a vuln list.

**Fan out when the repo is big.** One subagent per detected surface, each
prompted with: the fingerprint facts from Phase 0, its single `stack-*.md`
reference, the Phase 1 hits tagged to its surface, and instructions to return
findings in the standard format with confidence scores. Cap context per agent
to its own domain — cross-domain findings (e.g. an auth gap that matters
because of a SQL surface) get flagged for the synthesis pass.

Single-pass (small repo) order: auth surface first (it gates everything),
then data layer, then entry points, then frontend, then supply chain.

## Phase 3 — Tooling sweep (~10 min, run what's installed)

Run the free scanners that exist on the machine; skip silently what doesn't:

| Tool | Command | Surface |
|---|---|---|
| npm | `npm audit --omit=dev --json` | JS dependency CVEs (prod deps; dev-dep CVEs are INFO) |
| pip-audit | `pip-audit -r requirements.txt --format json` | Python dependency CVEs |
| cargo-audit | `cargo audit --json` | Rust dependency CVEs |
| gitleaks | already wrapped by `secret_scan.py` | secrets |

Tool output is a **lead list, not a findings list** — each hit still passes
through reachability triage (is the vulnerable function actually called?)
before it becomes a finding. Unreachable CVEs go in the dependency appendix.

## Phase 4 — Adversarial triage

Run the verification pass from `severity-and-triage.md` §Adversarial
verification over every candidate. In orchestrated audits, spawn refuter
subagents (one per finding, prompted to refute). Then:

1. Dedup (same root cause across files = one finding with a location list).
2. Score severity from the written exploit scenario, not the category.
3. Sort: CRITICAL → HIGH → MEDIUM → LOW; "Needs verification" (0.7–0.8) separate.

## Phase 5 — Report

Write the exhaustive report (template below), then the chat summary
(verdict + counts + top findings + what was NOT covered — one screen).

```markdown
# Security Audit — <repo> — <YYYY-MM-DD HH:mm> (<git SHA>, branch <name>)
Mode: full audit | Skill: security-check v<plugin version> | Agent: <agent>

## Verdict
<2–4 sentences: overall posture, the one thing to fix first>

## Security posture overview
<the comprehensive-report core — write it even when there are zero findings:>
- **Trust boundaries & auth model:** who authenticates how, what enforces authz, where
- **Exposure surface:** every internet/intranet-reachable entry point, one line each
- **Sensitive-data map:** the four answers from data-security.md — what data,
  where it flows, who reaches it, where it leaks by accident
- **Encryption posture:** transport + at-rest, stated plainly
- **Dependency & supply-chain posture:** counts, pinning discipline, scanner status

## Coverage
| Surface | Detected via | Reference applied | Sweeps run | Deep-dive |
|---|---|---|---|---|
<one row per fingerprint surface — this table is the honesty contract>
Out of scope: <surfaces not detected / explicitly skipped, and why>

## Findings
<standard finding format, severity-sorted, numbered SEV-1..N>

## Needs verification
<0.7–0.8 confidence candidates with what evidence would confirm/kill each>

## Dependency & tooling appendix
<scanner outputs after triage: unreachable CVEs, dev-dep advisories>

## Hardening opportunities
<non-finding advice: headers, CSP, lifetimes, scopes — explicitly not vulnerabilities>

## Sweep log
<every grep/scan command run, hit counts — reproducibility + diffability for the next audit>
```

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "The repo looks clean after Phase 1, skip the deep-dives" | Phase 1 finds string patterns. Auth-logic bugs, IDOR, and authz gaps are invisible to grep. Phase 2 is where those live. |
| "This repo is internal-only, lower the bar" | Internal tools hold the financial data. The threat model includes compromised internal accounts. |
| "Skip history secrets scan, it's slow" | A burned credential in history is a live credential to anyone who cloned. Run it; it's one command. |
| "The previous audit covered this" | The previous audit covered the previous code. Diff since then or audit fresh. |
