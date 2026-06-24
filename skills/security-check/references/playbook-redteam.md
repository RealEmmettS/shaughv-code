# Playbook — Mode D: Adversarial Review / Red-Team Exercise

On-request attacker-mindset testing of a **specific feature or change** in
software the team is developing. Where Modes A/B *find* weaknesses by
inspection, Mode D *attempts* them: build a threat model, enumerate abuse
cases, then actively try to break the feature and document what held and what
fell. Industry anchors: **STRIDE** (threat enumeration), **OWASP ASVS** (what
"verified secure" means per control), **OWASP WSTG** (how to test each class),
abuse-case analysis (attacker user-stories).

## Rules of engagement — read first, every time

1. **Own systems only.** Your own code, your own environments. Never a
   third-party service (any external API or vendor) beyond what normal client
   credentials already permit — no probing THEIR controls.
2. **Targets: local/dev instances by default.** Staging requires explicit
   operator approval in the session. **Production is never an active-testing
   target** — production gets Modes A/B (inspection) only.
3. **No data destruction, no persistence.** Attacks that would mutate or delete
   real records run against seeded/disposable data only. Created test
   artifacts get cleaned up and logged in the report.
4. **Credentials**: use purpose-made test identities (two, for authz testing —
   see below). Never borrow a teammate's real account.
5. **Stop-and-surface**: if an attempt unexpectedly reaches production data,
   another tenant, or a third party — stop, log precisely, tell the operator
   immediately. That's an incident-shaped event, not a finding to sit on.

## Procedure

### 1. Scope card (5 min, goes in the report verbatim)

```
Feature under test: <name + branch/SHA>
Entry points in scope: <routes/triggers/tools/UI flows>
Environment: <local | dev | staging(approved by <operator> at <time>)>
Test identities: <userA (role X), userB (role Y)>
Out of bounds: <anything explicitly excluded>
```

### 2. Threat model the feature (STRIDE, kept small)

Draw the feature's data flow (entry → processing → storage → outputs) and
mark trust boundaries. Then one STRIDE row per element that crosses a boundary:

| Element | S(poof) | T(amper) | R(epudiate) | I(nfo disclosure) | D(oS)* | E(levate) |
|---|---|---|---|---|---|---|

*D column: note it for design discussion, but per `severity-and-triage.md`
DoS attempts are out of scope for findings — don't spend attack time there.

The model decides where attack time goes — highest-value assets behind the
weakest-looking boundaries first.

### 3. Abuse cases

Write attacker user-stories against the feature, 5–10, concrete:
"As a logged-in user who owns record 117, I request record 118's report by
changing the ID"; "As an outside party writing a log entry, I embed an HTML
payload that ends up in the generated PDF"; "As a user with the lowest-
privilege role, I call the admin tool directly". Each abuse case becomes an
attack to execute.

### 4. Attack execution

Two tracks, both logged attempt-by-attempt:

**Static track** — targeted code walk: run the relevant `stack-*.md`
checklists scoped to the feature's files, tracing each abuse case through the
actual code to a verdict of "blocked by X at line Y" or "reaches the sink".

**Dynamic track** — when a runnable instance exists, attempt for real
(curl/httpx/Playwright). The standard battery, mapped to WSTG so the report
can cite test IDs:

| Battery | What to attempt | WSTG |
|---|---|---|
| AuthN walk | endpoints without a token, expired token, token for the OTHER app (audience swap), `alg` tampering | ATHN-01..10 |
| AuthZ walk / IDOR | userA fetching userB's resources by ID enumeration; role-gated actions with the lesser identity; method swap (GET→POST/PUT/DELETE on same route) | ATHZ-01..04 |
| Injection battery | SQLi probes (`'`, `' OR 1=1--`, time-based) on every string param; command/path payloads (`..\\`, `%2e%2e%2f`); template probes (`{{7*7}}`, `${7*7}`) | INPV-05/11/12 |
| Scheme & content tricks | `javascript:`/`data:` URLs in any URL-valued field; HTML/script payloads in free-text fields rendered anywhere (incl. PDFs); oversized/unicode/null-byte inputs | INPV-01/02, CLNT-* |
| Workflow abuse | replay a request twice (idempotency), reorder steps, skip a step (pay-before-validate shapes), race two parallel submits of the same action | BUSL-01..09 |
| Secrets & disclosure | error bodies under malformed input (stack traces, SQL text), verbose 500s, headers leaking internals; cache/log inspection for tokens | ERRH-01/02, INFO-* |

Log EVERY attempt — payload, target, response, verdict (`blocked-by-<control>`
/ `degraded` / `broke-through`). The "survived" log is half the value: it is
the evidence base for "this feature was adversarially tested", not just
"someone looked at it".

### 5. Triage and report

Broke-through attempts become findings per `severity-and-triage.md` (these
are 0.9+ confidence by construction — you have a reproduction). Degraded
results (wrong-but-not-exploitable behavior) go to MEDIUM/LOW or the
hardening appendix. Same two-tier contract, mode tag `-redteam`:
`security-audit/<YYYY-MM-DD>-<HHmm>-redteam.md` containing the scope card,
the STRIDE table, abuse cases, the full attempt log (including survivals),
findings, and cleanup confirmation.

## ASVS anchoring (what "passed" means)

When the operator asks "is this feature secure enough to ship?", answer
against ASVS Level 2 for the controls the feature touches (authn V2, session
V3, access control V4, validation V5, error/logging V7, data protection V8,
API V13). Cite the ASVS section per verdict line in the report — "passes
V4.1.1–V4.1.3 (verified by IDOR battery, 14 attempts blocked)" reads as
engineering, not vibes.

## Anti-rationalization

| Excuse | Reality |
|---|---|
| "Static review already covered this" | Inspection finds patterns; execution finds the gap between the code you read and the system that runs. Run the battery. |
| "I don't want to spam the dev DB" | Seed data, run, clean up, log it. Skipping authz walks to keep the DB tidy is not a trade. |
| "The attack didn't land, nothing to write" | Survivals are the deliverable. An empty attempt log means the red team didn't happen. |
| "It's just an internal feature" | The threat model includes compromised internal accounts — userB IS the attacker. |
