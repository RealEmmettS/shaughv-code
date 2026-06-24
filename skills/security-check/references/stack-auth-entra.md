# Stack Surface — Auth (Entra ID, MSAL, JWT validation, Easy Auth)

Applies when apps authenticate against Microsoft Entra ID. Three patterns
recur: MSAL in the browser, hand-rolled bearer validation against Entra JWKS
(e.g. a PyJWT-based identity service), and SWA Easy Auth header injection
(`x-ms-client-principal`). OAuth client-credentials flows often hold service
secrets for third-party APIs. Auth is the gate in front of the sensitive data
— findings here are HIGH by default.

## Surface map

| Where | What can go wrong |
|---|---|
| JWT validation | signature/issuer/audience/expiry — any leg skipped; `alg` not pinned |
| JWKS handling | keys fetched over the wrong issuer; cache never refreshed (or refreshed from a user-supplied `jku`) |
| Easy Auth headers | `x-ms-client-principal` trusted on directly-reachable backends |
| Authz (vs authn) | valid-token-implies-allowed; missing resource-level checks (IDOR) |
| MSAL client config | tokens leaking to logs/URLs; scopes broader than needed |
| Client-credentials flows | secrets in config; tokens cached insecurely; scope `read write` where `read` suffices |
| Session fallback paths | dev bypasses (`if not token and DEBUG: user = "admin"`) reaching prod |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| E1 | decode without verify | `rg -n "jwt\.decode\(.{0,120}(verify\s*=\s*False|options=\{[^}]*verify_signature[^}]*False)|decode\(.*\{\s*complete" -tpy -tts` |
| E2 | validation legs present | `rg -n "jwt\.decode\(|jwtVerify\(|verify\(" -tpy -tts` then per hit: `algorithms=`? `audience=`? `issuer=`? |
| E3 | alg confusion | `rg -in "algorithms?\s*[:=].{0,40}(none|HS256.*RS256|RS256.*HS256)\b" -tpy -tts` |
| E4 | client-principal parsing | `rg -in "x-ms-client-principal" ` — every consumer, then trace network reachability |
| E5 | dev bypasses | `rg -in "(bypass|skip|disable).{0,20}(auth|token)|if.{0,30}(DEBUG|dev).{0,60}(user|principal|role)\s*=" -tpy -tts` |
| E6 | tokens in logs/URLs | `rg -in "(log|print|console)\w*\(.{0,80}(access_token|id_token|bearer|authorization)|[?&](token|access_token)=" -tpy -tts` |
| E7 | role/claim checks | `rg -in "(roles?|groups|scp|appid|oid)\b.{0,30}(claim|payload|principal)" -tpy -tts` — what authz actually keys on |
| E8 | client secrets handling | `rg -in "client_secret|CLIENT_SECRET" -tpy -tts -g '*.json'` — env-sourced (fine) vs literal (finding) |

## Checklist

1. **The four legs, per validation site** (E2): signature (against the
   tenant's JWKS), `iss` (the exact tenant), `aud` (this app's client ID),
   `exp`. Any leg missing = `jwt_validation`; missing signature or audience =
   HIGH (audience-less acceptance means any token from the tenant — e.g. for
   a different app — works here; that's a cross-app bypass inside the tenant).
   An RS256 + JWKS-with-hourly-cache validator is a solid baseline —
   compare other validators against it.
2. **Alg pinning** (E1/E3): `algorithms` must be pinned to `["RS256"]` (Entra).
   Accepting `HS256` alongside RS256 enables key-confusion (HMAC with the
   public key as secret) = `jwt_validation` HIGH. `verify_signature: False`
   anywhere outside tests = CRITICAL-track.
3. **JWKS hygiene**: keys must come from the well-known endpoint of the PINNED
   issuer — never from the token's own `jku`/`x5u` header. Cache refresh on
   unknown `kid` is correct (key rotation); refresh URL derived from the
   token = HIGH.
4. **Easy Auth trust boundary** (E4) — a recurring finding: the
   `x-ms-client-principal` header is forge-proof ONLY when the platform
   (SWA/App Service Auth) is the sole network path. For each consumer,
   answer: can the backend be reached directly (Function app default
   hostname, ACA ingress)? If yes and the header is honored = `header_trust`
   HIGH. The strong pattern — bearer validation primary,
   client-principal as SWA fallback — is acceptable only if the fallback also
   can't be reached directly.
5. **Authn ≠ authz** (E7): a valid Entra token proves identity, not
   permission. For every resource-scoped route (record, report, task):
   is there a check binding THIS user to THIS resource (an owner/role-level
   access check)? Token-only access to other users' resources =
   `authz_missing` (HIGH — IDOR). This is the highest-yield
   manual check in the whole skill; grep can't find it, read the routes.
6. **Dev bypasses** (E5): any auth bypass keyed on env/DEBUG flags — per the
   env-trusted precedent the env var itself isn't the attack, so score on the
   chance the flag ships enabled (deploy config in repo says which) — found
   enabled in prod config = `auth_bypass` HIGH; present but provably off =
   hardening note with a "remove before it bites" recommendation.
7. **MSAL + tokens at rest in the browser** (E6): MSAL's own cache choice is
   config, not a finding (R6 in `stack-react-spa.md`). Tokens in URLs,
   logged, or posted to third parties = `data_exposure` HIGH.
8. **Service-to-service** (E8): client-credentials secrets must be
   env/KV-sourced; check scope width (a `read write` scope where the app only
   reads = `config_insecure` MEDIUM — blast-radius reduction) and that tokens
   aren't persisted to disk/logs.

## Example

```python
# BAD — no audience pin; any tenant token for ANY app passes
payload = jwt.decode(token, key=jwks_key, algorithms=["RS256"])

# GOOD — all four legs + pinned alg
payload = jwt.decode(
    token,
    key=jwks_key_for(unverified_kid),       # JWKS from the PINNED issuer
    algorithms=["RS256"],
    audience=settings.ENTRA_CLIENT_ID,
    issuer=f"https://login.microsoftonline.com/{settings.TENANT_ID}/v2.0",
)
```

## False-positive notes

- `jwt.decode(..., options={"verify_signature": False})` used ONLY to read the
  `kid`/claims before real verification (two-step pattern) — safe IF the
  second, verifying decode gates the request; trace which result object the
  handler actually uses.
- Client-side MSAL holding tokens in `localStorage` — framework-supported
  config; do not report absent concrete exfiltration (an XSS finding upgrades
  this; alone it's nothing).
- Group/role checks against Entra group GUIDs hardcoded in source — fine
  (they're identifiers, not secrets).
- `X-MS-CLIENT-PRINCIPAL` parsing in code paths verified unreachable except
  via SWA (checked: no direct ingress, IP restrictions, or easyauth-only) —
  posture note, not a finding. Name the verification you did.
