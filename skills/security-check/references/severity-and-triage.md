# Severity, Confidence, and False-Positive Discipline

Shared doctrine for all four modes. The skill's credibility lives or dies here:
a report padded with theoretical findings trains the team to ignore reports. A
finding you publish is a claim you are staking your reputation on.

## Severity ladder

| Severity | Meaning | Examples |
|---|---|---|
| **CRITICAL** | Exploitable now, externally, with catastrophic blast radius | Unauthenticated RCE; SQL injection on an internet-facing endpoint; live secret committed to a repo with external collaborators |
| **HIGH** | Directly exploitable, leads to RCE, data breach, or auth bypass | JWT signature not verified; injection reachable from user input; stored XSS via `dangerouslySetInnerHTML`; Easy Auth header trusted from direct traffic |
| **MEDIUM** | Real impact but requires specific conditions or an inside position | Authz check missing on one endpoint behind SSO; overly broad OAuth scopes; SAS token with year-long expiry; secrets in build logs |
| **LOW** | Defense-in-depth gap with no concrete exploit path | Missing security headers; verbose error responses; debug flag plumbed but off |
| **INFO** | Worth knowing, not a vulnerability | Outdated-but-unexploitable dependency; TODO comments naming security work |

Local-network-only exploitability does NOT cap severity at MEDIUM — internal
tools often hold the most financial and PII data; an attacker on the internal
network or a compromised teammate account is in the threat model.

## Confidence scoring — report bar

Score every candidate finding 0.0–1.0 before it reaches a report:

| Score | Meaning |
|---|---|
| 0.9–1.0 | Exploit path traced end-to-end through the actual code; you could write the PoC |
| 0.8–0.9 | Clear vulnerable pattern with known exploitation method; no mitigating control found |
| 0.7–0.8 | Suspicious pattern; exploitation requires conditions you could not confirm |
| < 0.7 | Speculation |

**Mode B (diff review): report only ≥ 0.8.** Pre-merge reviews must be quiet
and precise — a noisy gate gets bypassed.
**Mode A (full audit): report ≥ 0.7**, but findings in the 0.7–0.8 band go in a
separate "Needs verification" section, never mixed with confirmed findings.

## Hard exclusions — never report these

1. Denial-of-service / resource exhaustion / rate limiting (including regex DoS).
2. Secrets on local disk that are otherwise secured (`.env` outside the repo,
   `local.settings.json` gitignored). Secrets **tracked in git** are findings.
3. Memory-safety claims in memory-safe languages (Rust outside `unsafe`, TS, Python).
4. Vulnerabilities in test-only files and fixtures.
5. Log spoofing / unsanitized input written to logs (unless the logged value is
   a secret or PII — then it's a data-exposure finding, not a logging one).
6. SSRF controlling only the path, never host or protocol.
7. User content included in LLM prompts (prompt injection is reported under
   `stack-llm-mcp.md` rules only when a tool boundary or output sink makes it exploitable).
8. Missing hardening with no concrete vulnerability ("could add CSP" is advice,
   not a finding — put it in the report's "Hardening opportunities" appendix).
9. Theoretical race conditions / timing attacks without a practical exploitation path.
10. Outdated third-party libraries with no reachable vulnerable code path
    (list them in the dependency appendix instead).
11. Findings in documentation files.

## Precedents — resolve recurring judgment calls consistently

1. Environment variables and CLI flags are trusted. An attack requiring control
   of an env var is invalid.
2. UUIDs are unguessable; no validation finding.
3. Client-side JS/TS lacking permission checks is NOT a finding — the server
   owns enforcement. The finding, if any, is the missing **server-side** check.
4. React/Angular escape by default. XSS findings in `.tsx` require
   `dangerouslySetInnerHTML`, `bypassSecurityTrustHtml`, direct DOM writes, or
   `href`/`src` built from user input with `javascript:`/`data:` reachable.
5. Logging non-PII business data is fine. Logging secrets, tokens, or PII is a finding.
6. GitHub Actions findings need a concrete trigger path from untrusted input
   (see `stack-supply-chain.md`); style complaints about workflows are not findings.
7. Parameterized queries via `pyodbc` `?` placeholders or `mssql` `.input()`
   bindings are safe — do not flag the SQL string for containing user-named
   columns unless identifiers are interpolated (see `stack-azure-sql.md`).
8. A secret that ever reached git history is burned even if since deleted —
   severity by what it unlocks, remediation is rotation (history rewrite optional).

## Adversarial verification — kill findings before they ship

Every finding above the report bar gets one deliberate refutation pass before
publication. Ask, in order:

1. **Reachability** — can attacker-controlled input actually reach this code?
   Trace the entry point; name it in the finding.
2. **Mitigations** — is there a control upstream (auth middleware, validation
   schema, parameterization, framework escaping) that already neutralizes it?
3. **Trust boundary** — is the "attacker" in this scenario actually someone we
   already trust (operator, env var, CI)?
4. **Precedent check** — does a hard exclusion or precedent above kill it?

In orchestrated audits, run this as a separate verification subagent per
finding, prompted to REFUTE (not confirm). A finding that survives a genuine
refutation attempt is worth the operator's time.

## Finding format — both report tiers use this

```markdown
### [SEV-N] <category>: <one-line title> — `path/to/file.ts:42`
* **Severity:** High | **Confidence:** 0.85
* **Surface:** <which stack reference / sweep found it>
* **Description:** what the code does and why it's vulnerable (2–4 sentences)
* **Exploit scenario:** concrete attacker story — who, from where, doing what,
  getting what
* **Fix:** the specific change, idiomatic for this codebase (point at an
  existing safe pattern in the same repo when one exists)
```

Categories (use these tokens): `sql_injection`, `xss`, `command_injection`,
`path_traversal`, `ssrf`, `auth_bypass`, `authz_missing`, `jwt_validation`,
`header_trust`, `secret_exposure`, `crypto_weak`, `deserialization`,
`template_injection`, `prompt_injection`, `supply_chain`, `data_exposure`,
`config_insecure`, `cors_misconfig`, `open_redirect`, `unsafe_rust`.

## Red flags — you are about to write a bad report

| Thought | Reality |
|---|---|
| "Better to include it just in case" | Noise teaches readers to skim. Cut it or move to Needs-verification. |
| "This pattern is usually bad" | Usually ≠ here. Trace this code's actual data flow. |
| "I found nothing, so I'll report hardening tips as findings" | A clean result IS the result. Hardening goes in the appendix, clearly labeled. |
| "The tool flagged it" | Tools don't read context. You verify, then you report. |
| "It's HIGH because the category sounds scary" | Severity comes from the exploit scenario you actually wrote, not the category name. |
