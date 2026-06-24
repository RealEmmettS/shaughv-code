# Mistral API — authentication, base URL, SDKs, key flow

Read this for the complete API-key lifecycle (discover → prompt → save), the base
URL, SDK setup, and the error/rate-limit envelope.

Canonical docs: https://docs.mistral.ai/getting-started/quickstart ·
Spec: https://docs.mistral.ai/openapi.yaml (bundled at [openapi.yaml](openapi.yaml))

## Base URL & auth

- **Base URL:** `https://api.mistral.ai`
- **Security scheme:** HTTP Bearer (`ApiKey` in the spec). Every endpoint requires:
  ```
  Authorization: Bearer <MISTRAL_API_KEY>
  ```
- **Env var:** `MISTRAL_API_KEY` (the convention used by both official SDKs).
- **Get a key:** https://console.mistral.ai (La Plateforme). Keys are shown once —
  store them in an env var or a secret manager, never in source control.

## The key flow: discover → prompt → save

### 1. Discover (every invocation)
Check, in order:
1. **Environment** — `MISTRAL_API_KEY` (`$env:MISTRAL_API_KEY` in PowerShell,
   `os.environ["MISTRAL_API_KEY"]` in Python).
2. **Repo** — a git-ignored `.env`, `.mistral.env`, or `.env.local` in the current
   working directory or any parent up to the filesystem root, containing
   `MISTRAL_API_KEY=...`.

One command does both and reports the source without printing the secret:
```bash
python scripts/mistral_key.py --check          # exit 0 = found, 2 = missing
python scripts/mistral_key.py --check --json    # {"found":true,"source":"env",...}
```

### 2. Prompt (only if missing)
If neither the environment nor a `.env` has it, **ask the user for their key**
(from https://console.mistral.ai). Do not fabricate or guess a key, and do not
print the value back once you have it.

### 3. Save (per the user's choice)
After the user provides a key, persist it the way they want. If they just say
"save it," **ask which target(s)** — system and/or repo.

| Target | Command | Effect |
|--------|---------|--------|
| **System** (per-user, all future shells) | `python scripts/mistral_key.py --set-system <key>` | Windows: `[Environment]::SetEnvironmentVariable('MISTRAL_API_KEY','<key>','User')`. POSIX: appends `export MISTRAL_API_KEY=…` to `~/.zshrc`/`~/.bashrc`. |
| **Repo** (git-ignored `.env`) | `python scripts/mistral_key.py --set-repo <key>` | Writes `MISTRAL_API_KEY=<key>` to `./.env` (override path with `--env-file`) and adds `.env` to `.gitignore`. |
| **Session only** | `$env:MISTRAL_API_KEY = '<key>'` (PowerShell) / `export MISTRAL_API_KEY=…` (bash) | Lasts until the shell closes. |

After `--set-system` on Windows, hydrate the **current** shell (new env vars only
reach *new* shells):
```powershell
$env:MISTRAL_API_KEY = [Environment]::GetEnvironmentVariable('MISTRAL_API_KEY','User')
```

### Manual setup (equivalents, no script)
```bash
# macOS/Linux (session)
export MISTRAL_API_KEY="your-key-here"
```
```powershell
# Windows PowerShell (persisted, per-user)
[Environment]::SetEnvironmentVariable('MISTRAL_API_KEY','your-key-here','User')
# Windows PowerShell (session only)
$env:MISTRAL_API_KEY = 'your-key-here'
```

### Security rules
- Never echo, log, or commit the key. Mask it (`sk-…last4`) if you must reference it.
- Saving to a repo means a **git-ignored** file only; verify `.gitignore` covers it.
- When baking Mistral into a project as a tool, ask how the *project* should source
  the key (its own env var / secrets manager) — don't embed a personal key in code.

## SDK setup

```bash
pip install mistralai            # Python
npm install @mistralai/mistralai # TypeScript/JS
```
```python
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
```
```typescript
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
```

The bundled `scripts/*.py` need **no** SDK — they call the REST API with the
standard library. Install the SDK only to run the SDK code samples in these refs.

## Errors & rate limits

Errors return a JSON body with an HTTP status. Common ones:

| Status | Meaning | Action |
|--------|---------|--------|
| 401 | Missing/invalid/revoked key | Re-check `MISTRAL_API_KEY`; regenerate in the console |
| 403 | Not entitled to the model/feature | Verify plan/model access |
| 404 | Unknown model or resource id | Check the id with `GET /v1/models` |
| 422 | Validation error (`HTTPValidationError`) | Fix the request body per the field detail |
| 429 | Rate / quota limit | Back off and retry (the bundled client retries 429/5xx with backoff) |
| 5xx | Server error | Retry with exponential backoff |

The bundled `_client.py` automatically retries `429, 500, 502, 503, 504` with
increasing delays. For your own code, respect any `Retry-After` header and use
exponential backoff.
