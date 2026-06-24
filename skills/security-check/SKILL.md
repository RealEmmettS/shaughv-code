---
name: security-check
description: >-
  Use for any security work on a repo or branch — "security check", "security
  audit", "security review", "check for vulnerabilities", "is this safe to
  push/merge/ship", "scan for secrets", "OWASP", "PII or data exposure" — a
  pre-merge impact read: "how big is this change", "will this break main",
  "breaking change", "blast radius" — or adversarial testing: "red-team
  this", "try to break this", "pen-test". Four modes: full-repo audit
  (comprehensive report: vulns, auth posture, sensitive-data map, supply
  chain), branch/diff security review, merge-impact assessment (% repo
  affected + breaking signals), and on-request red-team (STRIDE + WSTG
  attack battery). Stack-aware — if your stack includes React/Vite, Azure
  Functions, FastAPI, Rust, Azure SQL, MSAL/Entra, SWA/Bicep/Key Vault,
  LLM/MCP, or CI/Docker, it fingerprints the repo and loads only the matching
  references. Output: chat summary + dated report in security-audit/. When in
  doubt before a push/merge, trigger.
---

# Security Check

Run a thorough, evidence-based security assessment of any repo, adapting to
whatever stack it detects. Four modes share one engine: fingerprint the repo,
load only the references that match, sweep mechanically before reading deeply,
verify findings adversarially before reporting, and always deliver two tiers —

1. **Chat**: a one-screen summary the operator can act on (verdict, counts by
   severity, top findings, impact classification).
2. **Repo doc**: the comprehensive report at
   `<repo>/security-audit/<YYYY-MM-DD>-<HHmm>-<mode>.md` (create
   `security-audit/` if missing; date AND time in the filename). Every
   finding with file:line, severity, confidence, exploit scenario, fix; the
   posture overview; the sweep log proving coverage.

This skill is the review/audit layer. It does NOT own prevention-side design
(`defensive-programming`) or user-facing bug intake (`bug-triage`). It audits
what the REPO declares; live cloud-tenant posture (RBAC drift, expired
secrets, orphaned resources) is a separate concern handled by your cloud
provider's own auditing tools.

## Mode selector

| Mode | When | Playbook |
|---|---|---|
| **A — Full repo audit** | "security check/audit this repo", periodic posture review, pre-launch, post-incident | `references/playbook-audit.md` |
| **B — Branch/diff review** | "review this branch/PR for security", "safe to push?", pre-merge | `references/playbook-diff-review.md` |
| **C — Merge-impact assessment** | "how big is this change", "will this break main", "small changes or major?" | `references/impact-assessment.md` |
| **D — Adversarial review / red team** | "red-team this feature", "try to break this", "pen-test this change", "attack-test before we ship" | `references/playbook-redteam.md` |

Mode B **always ends with Mode C's verdict** — the operator deciding
merge-now-or-stage needs the security answer and the blast-radius answer
together. Mode C also runs standalone. If the ask is ambiguous
("check this repo over"), default to Mode A and say so.

**Mode D is the active attacker pass** — STRIDE threat model, abuse cases,
then an executed WSTG-mapped attack battery against a *specific feature*, with
findings backed by reproductions and an ASVS verdict. It is on-request (the
operator asks to red-team / break / pen-test something), needs explicit
rules-of-engagement (own systems, dev/local by default, never active-test
production), and pairs naturally after Mode B for a new feature. Read its
"Rules of engagement" section before touching anything.

Before starting any mode, read `references/severity-and-triage.md` — the
severity ladder, the ≥0.8/≥0.7 confidence report bars, the hard exclusions,
and the adversarial verification pass are non-negotiable across all modes.

## Phase 0 — Fingerprint (always first)

Detect surfaces from manifests, not vibes. Run:

```bash
ls; git ls-files | head -50
fd -HI -d 3 "package.json|Cargo.toml|pyproject.toml|requirements*.txt|host.json|staticwebapp.config.json|*.bicep|*.tf|Dockerfile*|*.csproj|go.mod" --exclude node_modules
rg -l "app\.http\(|@app\.(get|post)|fastapi|mcp|anthropic|openai" --max-count 1 -g '!node_modules' | head -20
```

Then mark each row that matches. **The marked rows define the audit's
coverage — record this table in the report.**

| Detect | Signal | Load |
|---|---|---|
| React SPA | `react` in package.json deps; `vite.config.*`; `.tsx` files | `references/stack-react-spa.md` |
| Azure Functions (TS) | `@azure/functions` dep; `host.json` + TS sources | `references/stack-azure-functions-ts.md` |
| Python backend | `fastapi`/`pydantic` in pyproject/requirements; `function_app.py`; `@app.` routes | `references/stack-python-fastapi.md` |
| Rust | `Cargo.toml` | `references/stack-rust.md` |
| SQL data layer | `pyodbc`/`mssql`/`tedious`/`sqlx`/`tiberius` deps; `.sql` files; connection strings | `references/stack-azure-sql.md` |
| Azure platform/IaC | `.bicep`/`.tf`; `staticwebapp.config.json`; Dockerfiles; ARM JSON | `references/stack-azure-platform.md` |
| Auth surface | `@azure/msal-*`, `jsonwebtoken`, `PyJWT`, `jwks`, `x-ms-client-principal` hits | `references/stack-auth-entra.md` |
| LLM / MCP | `@anthropic-ai/sdk`, `anthropic`, `openai`, `mcp` deps; prompt assembly hits | `references/stack-llm-mcp.md` |
| CI / dependencies / Docker | `.github/workflows/`; lockfiles; Dockerfiles — **always applies if any exist** | `references/stack-supply-chain.md` |
| Data security | **always applies, every repo** | `references/data-security.md` |

Surfaces NOT detected go in the report's "Out of scope" line — an audit that
silently skipped a surface reads as having covered it. Unfamiliar stack with
no reference (e.g. Go, PHP)? Audit it from first principles using the closest
reference's section structure, and flag the gap so a `stack-*.md` can be added.

## Routing — sweep tables and scripts

Every `stack-*.md` has the same five sections: **Surface map → Greppable
sweep → Checklist → Example → False-positive notes**. The sweep tables are
ready-to-run `rg` commands: run them verbatim in Phase 1 (Mode A) or
diff-scoped (Mode B), collect hits without judging, then work the checklist
against the hits plus an actual read of entry points. The FP notes are
binding — they encode the precedents that keep reports quiet.

Bundled scripts (Python, stdlib-only, always exit 0 — except `secret_scan.py
--gate`, which exits 1 on findings):

| Script | Purpose | Typical call |
|---|---|---|
| `scripts/secret_scan.py` | Secrets sweep — gitleaks if installed, regex fallback; `files`/`diff`/`history` modes; masked output | `python scripts/secret_scan.py --repo . --mode history` |
| `scripts/impact_stats.py` | Mode C numbers — % files/LOC changed vs merge-base, churn concentration, breaking-change signals, suggested band | `python scripts/impact_stats.py --repo .` |

(`<skill-path>` = this skill's directory; both scripts also run fine copied
into a scratch dir. If your workflow already has a fast pre-PR secrets gate,
`secret_scan.py` is the audit-grade complement that adds git-history mode.)

## Orchestration — scaling the exhaustive audit

Small repo (≤ ~15k LOC): single pass, ordered auth → data layer → entry
points → frontend → supply chain.

Large repo or "exhaustive/comprehensive" ask: **fan out one subagent per
detected surface** (Phase 2 of the audit playbook). Each subagent gets: the
fingerprint facts, exactly one `stack-*.md`, its Phase-1 hits, and the
finding format from `severity-and-triage.md`. Then a verification wave:
one refuter subagent per candidate finding, prompted to kill it
(reachability, mitigations, trust boundary, precedents). Dedup and
synthesize in the main context. This maps directly onto a find → verify →
synthesize pipeline if you have one.

Never parallelize the POSTURE work (trust boundaries, sensitive-data map) —
it needs one context that sees the whole repo; it anchors the report.

## Severity & confidence quick card

CRITICAL exploitable-now/catastrophic · HIGH direct RCE/breach/auth-bypass ·
MEDIUM conditional but real · LOW defense-in-depth · INFO awareness.
Report bar: **Mode B ≥0.8 confidence, MEDIUM+only; Mode A ≥0.7 with the
0.7–0.8 band quarantined in "Needs verification".** Hard exclusions (DoS,
theoretical races, unreachable CVEs, React-XSS-without-escape-hatch, …) and
precedents (env vars trusted, parameterized = safe, client-side checks not
findings, …) live in `references/severity-and-triage.md` — apply them
verbatim; they are what keeps this skill's reports trusted.

## Impact quick card (Mode C)

`impact_stats.py` supplies breadth (% files, % LOC), concentration, and named
breaking signals (dependency manifests, schema/migrations, exported-API
changes, route changes, destructive DDL, CI/IaC/config). Bands: **patch-like**
(<2% LOC, no signals — "several small changes") · **moderate** ·
**major-possibly-breaking** (≥10% LOC or ≥20% files or any signal). You may
override the band both directions with stated evidence — semantic risk
upgrades a tiny diff (auth logic, financial calcs, query predicates);
mechanical churn downgrades a huge one (lockfiles, formatting, generated
code). Full signal-by-signal judgment table and the verdict block template:
`references/impact-assessment.md`.

## Red flags — stop and correct course

| Thought | Reality |
|---|---|
| "Grep came back clean, the repo is clean" | Grep finds patterns. IDOR, authz gaps, and logic flaws need the checklist read of entry points. |
| "I'll skip the fingerprint, I know this repo" | The fingerprint table IS the coverage claim in the report. Run it. |
| "More findings = better report" | The report bar exists so findings get fixed. Quarantine the speculative ones. |
| "It's internal, so lower severity" | Internal tools often hold the most sensitive data. Compromised-insider is in the threat model. |
| "The diff is small, skip impact" | Mode C is three commands. A 3-line WHERE-clause change in a sensitive query is a major change. |
| "Secrets scan found one, but it's been deleted" | History = burned. Rotation is the remediation; say so plainly. |
| "I'll put the report only in chat" | Both tiers, always. The repo doc is the durable artifact the next audit diffs against. |

## Cross-references

- `defensive-programming` — prevention-side mirror: boundary validation,
  error contracts. Fix recommendations should point at its patterns.
- `git-workflow` — if a pre-PR secrets gate runs there, this skill's findings
  feed its security review verdict; `secret_scan.py` is the audit-grade
  complement that adds history mode.
- `bug-triage` — a vulnerability reported by an end user enters there;
  hand the investigation here.
- `debugging-framework` — when an audit finding turns out to be a defect,
  not a vulnerability.
- Live cloud-tenant posture (RBAC drift, expired secrets, orphaned
  resources) — out of scope here. This skill audits what the REPO declares;
  use your cloud provider's own auditing tools for what the SUBSCRIPTION runs.
- `code-review` / `pr-review-toolkit` — correctness/quality review;
  security findings from there can seed Mode B.
