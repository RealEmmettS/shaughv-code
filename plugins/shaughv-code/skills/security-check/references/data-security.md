# Cross-Cutting — Data Security & Privacy Posture

Applied in EVERY Mode A audit regardless of fingerprint (and in Mode B when
the diff touches data handling). This is the "data sense" of security: not
"can an attacker get in" but **what data lives here, where does it flow, who
can see it, and what happens to it on the way**. Many repos move financials,
vendor commitments, employee names, client contacts, and photos —
business-sensitive and PII even when no regulation names it.

## The four questions (the posture section of the report)

Every audit answers these in the report's **Security posture overview**, even
when the answer is "none found":

1. **What sensitive data does this repo touch?** Classify: PII (names, emails,
   phones, addresses), financial (budgets, costs, margins, payroll), credentials
   (tokens, keys), business-confidential (bids, client lists), media (photos
   can contain people and sites).
2. **Where does it flow?** Entry (API, DB, third-party pull) → processing →
   storage → exit (responses, files, LLM prompts, emails, logs, third parties).
   Draw the path for each class found.
3. **Who can reach it?** Which roles/identities, enforced where, and is the
   minimum-needed principle visible (column exclusion, row scoping, role checks)?
4. **Where does it leak by accident?** Logs, error messages, analytics,
   generated documents, caches, git history, LLM context.

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| D1 | PII-shaped fields | `rg -in "\b(ssn|social_security|date_of_birth|dob|home_address|personal_email|phone_number|salary|payroll)\b" -g '!node_modules'` |
| D2 | sensitive data into logs | `rg -n "(console\.(log|error|info)|logger\.\w+|logging\.\w+|print)\(.{0,80}(token|password|secret|authorization|email|salary|account)" -i` |
| D3 | plaintext transport | `rg -n "http://(?!localhost|127\.0\.0\.1|schemas\.|www\.w3\.org)" -g '*.{ts,tsx,js,py,rs,json,toml,cfg,env.example}'` |
| D4 | TLS verification disabled | `rg -in "TrustServerCertificate\s*=\s*(yes|true)|verify\s*=\s*False|rejectUnauthorized:\s*false|InsecureSkipVerify|DANGER_ACCEPT_INVALID" ` |
| D5 | weak / homemade crypto | `rg -in "\b(md5|sha1)\b.{0,40}(password|token|secret)|createCipher\(|Math\.random\(\).{0,40}(token|secret|id)|random\.random\(\).{0,40}(token|key)"` |
| D6 | sensitive data to third parties | `rg -n "(fetch|httpx|requests|axios)\.(get|post|put)?\(?.{0,100}(anthropic|openai|api\.)" -i` then check payload contents |
| D7 | data dumps in repo | `rg --files -g '*.{csv,xlsx,sqlite,db,bak,dump}' -g '!node_modules'` — exported business data committed to git |
| D8 | broad SELECTs on sensitive tables | `rg -n "SELECT\s+\*\s+FROM" -i` — cross-check against any column-exclusion discipline (where code deliberately strips sensitive columns, `SELECT *` defeats that pattern) |

## Checklist

1. **Build the sensitive-data map** (the four questions). This is reading +
   asking "what tables/endpoints/files hold class X". The map IS the
   deliverable — findings hang off it.
2. **D2 hits**: a log line carrying tokens/passwords/PII = `data_exposure`.
   Severity: secrets HIGH, PII MEDIUM, business data LOW-MEDIUM by sensitivity.
   Check both app logs and Application Insights custom events/traces.
3. **D3/D4 hits**: production transport must be TLS with verification ON.
   `TrustServerCertificate=yes` against Azure SQL in prod config = `crypto_weak`
   (MEDIUM — enables MITM on the financial pipe). Local-dev configs: not a finding.
4. **D5 hits**: `Math.random()`/`random.random()` for anything security-bearing
   (tokens, reset codes, IDs standing in for capability URLs) = `crypto_weak`
   (HIGH if guessable token gates access). Password hashing outside
   bcrypt/scrypt/argon2 = HIGH (when an external IdP like Entra owns passwords
   this is rare — so if you find ANY password hashing, first ask why it exists
   at all).
5. **D6 + LLM flows**: what data classes enter prompts to Anthropic/OpenAI?
   Sending PII or financials to an LLM is a *posture statement* for the report
   (and `stack-llm-mcp.md` owns prompt-side risks) — flag as a finding only if
   it contradicts a stated policy or sends credentials.
6. **D7 hits**: committed data exports are findings (`data_exposure`) —
   severity by content; git history check applies (a deleted dump is still in
   history; same rotation logic as secrets, except data can't be rotated —
   that's a disclosure event to surface to the operator plainly).
7. **Retention & backups** (read, not grep): does anything in the repo write
   sensitive data to blob/local paths with no cleanup (generated PDFs with
   financials, photo caches, debug snapshots)? Unbounded accumulation of
   sensitive artifacts = posture note; world-readable or SAS-exposed = finding
   (route to `stack-azure-platform.md` for the SAS analysis).
8. **At-rest encryption**: Azure SQL TDE and Storage encryption are on by
   default — do NOT report their absence in code. Only report at-rest gaps for
   data leaving Azure-managed storage (local files, third-party stores).

## Example

```python
# BAD — PII + financials into a telemetry trace, and SELECT *
rows = cursor.execute("SELECT * FROM project_financials WHERE owner_email = ?", email)
logger.info(f"financial data for {email}: {rows.fetchall()}")

# GOOD — explicit columns (exclusion discipline), no payload in the log
rows = cursor.execute(
    "SELECT project_cd, period, pct_complete FROM project_financials WHERE owner_email = ?",
    email,
)
logger.info("financial data fetched", extra={"project_count": len(rows)})
```

## False-positive notes

- Test fixtures with fake PII — not findings (verify the data is actually fake:
  realistic-looking emails/names with a real client's domain are not fake).
- `http://` in XML namespaces, schema URLs, and localhost — never findings (the
  D3 pattern excludes most; ignore stragglers).
- Logging row COUNTS, IDs, project codes — fine (precedent 5: non-PII business
  data may be logged).
- Azure-managed encryption (TDE, SSE) — assume on; absence-of-config is not a finding.
