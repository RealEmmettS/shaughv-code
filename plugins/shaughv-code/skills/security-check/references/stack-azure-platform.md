# Stack Surface — Azure Platform (SWA, Bicep/IaC, Key Vault, Storage, Container Apps)

Applies when the stack includes Azure platform resources — Bicep (main,
app-insights, kv-rbac, static-web-app) + `staticwebapp.config.json`, Container
Apps with Blob storage, containerized jobs with managed identity, and similar.
This reference audits what the REPO declares about the platform —
live-subscription auditing (RBAC drift, expired secrets, orphaned resources)
is out of scope here and belongs to your cloud provider's own auditing tools.

## Surface map

| Where | What can go wrong |
|---|---|
| `staticwebapp.config.json` | routes left `anonymous` that should be `authenticated`; missing `*` fallback rule; navigation fallback exposing the API |
| Easy Auth trust | `x-ms-client-principal` consumed by backends also reachable directly (see `stack-auth-entra.md`) |
| Bicep params | secrets as plain `string` params instead of `@secure()`; secret values in `.bicepparam`/parameter JSON committed |
| Bicep outputs | `output connectionString` / keys — outputs land in deployment history readable by Reader role |
| Key Vault wiring | app settings using literal secrets instead of `@Microsoft.KeyVault(...)` references |
| Storage | SAS tokens minted long-lived in code; containers with public access; account keys in config |
| Container Apps / Dockerfiles | secrets via build args or baked layers; containers running as root |
| RBAC declarations | role assignments in Bicep granting Contributor/Owner where a narrow role exists |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| A1 | SWA route protection | read `staticwebapp.config.json` — every route: `allowedRoles`? Is there a `"route": "/*"` catch-all? `/api/*` covered? |
| A2 | insecure Bicep params | `rg -n "param\s+\w*(password|secret|key|token)\w*\s+string" -i -g '*.bicep'` missing `@secure()` on the line above |
| A3 | secret-bearing outputs | `rg -in "output\s+\w+.{0,60}(listKeys|connectionString|primaryKey|password)" -g '*.bicep'` |
| A4 | literal secrets in params/settings | `rg -in "(password|secret|key|token)\"?\s*[:=]" -g '*.{bicepparam,parameters.json}' -g 'appsettings*.json'` |
| A5 | Key Vault references used | `rg -n "@Microsoft\.KeyVault\(" -g '*.{json,bicep}'` (presence = good posture; absence where A4 hits = finding) |
| A6 | storage public access | `rg -in "allowBlobPublicAccess\s*[:=]\s*true|publicAccess\s*[:=]\s*'?(blob|container)" -g '*.{bicep,json,ts,py}'` |
| A7 | SAS minting | `rg -in "generate.*sas|sas.*token|SharedAccessSignature" -tts -tpy` — check expiry + permissions + IP scoping |
| A8 | account keys in code paths | `rg -n "AccountKey=|StorageSharedKeyCredential|from_connection_string" -tts -tpy` (vs `DefaultAzureCredential`) |
| A9 | Dockerfile hygiene | `rg -n "^(USER|ARG|ENV|ADD|COPY --from)" -g 'Dockerfile*'` — root user? secrets via ARG/ENV? |
| A10 | broad RBAC in IaC | `rg -in "roleDefinitionId.{0,120}(b24988ac|8e3af657)" -g '*.bicep'` (Contributor / Owner GUIDs) |

## Checklist

1. **SWA config** (A1): build the route table. The dangerous default: SWA
   serves everything anonymously unless a rule says otherwise — an app whose
   README says "Entra-protected" but whose config only protects `/admin/*`
   leaves `/api/*` open = `auth_bypass` (HIGH). Check `responseOverrides` for
   401→login redirect (posture) and that `navigationFallback` excludes `/api`.
2. **Bicep secrets** (A2–A4): `@secure()` params don't echo in deployment
   logs; plain string secrets do = `secret_exposure` (MEDIUM as exposure is
   to subscription readers). Secret-bearing OUTPUTS (A3) persist in deployment
   history = same category; fix is `listKeys()` at reference time or KV refs.
   Literal secret VALUES committed in parameter files = treat as committed
   secret (history check + rotation).
3. **Key Vault posture** (A5): app settings resolving via
   `@Microsoft.KeyVault(SecretUri=…)` = the good pattern (a DB password
   sourced from a Key Vault reference rather than a literal). Record per-app
   in the posture overview which settings are KV-backed vs literal.
4. **Storage** (A6–A8): `allowBlobPublicAccess: true` or container-level
   public ACLs on buckets holding business data = `data_exposure` (HIGH).
   SAS minted in code: expiry over ~24h, account-scoped instead of
   container/blob-scoped, or write perms where read suffices = `config_insecure`
   (MEDIUM). Account-key auth where `DefaultAzureCredential` (managed
   identity) is available = posture note; key IN the repo = `secret_exposure`.
5. **Containers** (A9): no `USER` directive (runs as root) = hardening note
   (a dedicated non-root user is the good example). Secrets passed as
   build `ARG`s bake into image layers = `secret_exposure` (MEDIUM) — runtime
   env/secret mounts are the fix. `ADD` from URLs = supply-chain flag.
6. **RBAC in IaC** (A10): Contributor where a scoped role exists (prefer
   narrow custom roles over broad built-ins) = `config_insecure`
   (MEDIUM). Live-tenant role assignments beyond what the repo declares →
   out of scope, use your cloud provider's RBAC auditing tools.

## Example

```bicep
// BAD — secret as plain param, echoed to deployment history via output
param dbPassword string
output connString string = 'Server=${srv};Password=${dbPassword};'

// GOOD — secure param, KV reference in app settings, no secret outputs
@secure()
param dbPassword string
resource kvSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: '${kv.name}/app-db-password'
  properties: { value: dbPassword }
}
// app setting: DB_PASSWORD = @Microsoft.KeyVault(SecretUri=...)
```

## False-positive notes

- `local.settings.json` UNtracked (gitignored) holding dev secrets — by
  design, not a finding. TRACKED in git → committed-secret rules apply.
- SWA `staticwebapp.config.json` `"allowedRoles": ["anonymous"]` on genuinely
  public assets (login page, static brand files) — correct, skip.
- Bicep `listKeys()` used inline to wire an app setting (never surfaced as an
  output) — acceptable pattern; don't flag the function itself.
- Deployment-token (`repositoryToken`) handled by the SWA/GitHub integration —
  managed secret, not a repo finding unless the literal token is committed.
- Live-subscription drift (expired KV secrets, orphaned resources, actual
  RBAC assignments) — NOT this skill's scope; point the operator to their
  cloud provider's compliance / RBAC auditing tools.
