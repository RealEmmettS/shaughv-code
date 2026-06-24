# Stack Surface — LLM Integrations & MCP Servers

Applies when the stack calls an LLM (Anthropic, OpenAI, etc.) or exposes an
MCP server. Common shapes: a backend that synthesizes narratives or runs chat
agents over third-party data (e.g. logs and tickets authored outside your org
— third-party-authored text!), rendering output into UI and PDFs; or a service
that IS an MCP server (e.g. FastAPI + OAuth 2.1 PKCE). The threat model is
specific: **LLM output is attacker-influenceable whenever any prompt input
is** — treat model output with exactly the trust you'd give the least-trusted
prompt source.

## Surface map

| Where | What can go wrong |
|---|---|
| Prompt assembly | third-party text (external logs, ticket titles, vendor names) concatenated into prompts — injection vector |
| Output sinks | LLM text → HTML/PDF/SQL/shell/tool args without the sink's escaping |
| Tool/agent loops | model-chosen tool calls with side effects; over-broad tool surface for the task |
| MCP server authn | tools callable without a validated identity; session handling on /mcp |
| MCP tool authz | per-tool permission gaps — every tool is an API endpoint; same IDOR rules |
| API keys | `ANTHROPIC_API_KEY` handling; keys in client-side code |
| Data egress | what data classes leave for the model API (pairs with data-security.md D6) |
| Logging | full prompts/completions logged (they contain the business data) |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| L1 | prompt assembly sites | `rg -n "(system|user|prompt|messages)\s*[:=].{0,60}(f['\"]|\$\{|\+\s*\w|\.format\(|template)" -i -tpy -tts` |
| L2 | output sinks | `rg -n "(completion|response|\.content|message\.text|narrative|answer)\b.{0,80}(innerHTML|dangerouslySetInnerHTML|render|HTML\(|execute|subprocess|query\()" -i -tpy -tts` |
| L3 | API key handling | `rg -n "ANTHROPIC_API_KEY|sk-ant-|x-api-key" ` — env-sourced server-side only? |
| L4 | client-side LLM calls | `rg -n "anthropic|api\.openai" -tweb --glob 'client/**' --glob 'src/**'` — browser code holding model keys |
| L5 | MCP tool registry | `rg -n "@(mcp|server)\.(tool|resource)|Tool\(|list_tools" -tpy -tts` — inventory every tool |
| L6 | MCP authn wiring | `rg -in "(verify|validate).{0,20}(token|jwt|principal)" ` near the MCP transport setup |
| L7 | prompt/completion logging | `rg -in "(log|logger|print)\w*\(.{0,80}(prompt|completion|messages|response\.content)" -tpy -tts` |

## Checklist

1. **Map prompt inputs** (L1): for each assembly site, classify every
   interpolated source: app-controlled (fine), user-controlled, or
   third-party-controlled (external text — the easily-forgotten one: an
   outside party writes a log entry, it lands in the prompt). Record
   the map in the posture overview.
2. **Then judge by the SINKS** (L2), not the prompts: per the hard
   exclusions, user content in prompts is NOT itself a finding. It becomes
   `prompt_injection` when model output reaches a sink that acts: HTML/PDF
   render without escaping (→ XSS / WeasyPrint SSRF beacons — pairs with
   `stack-python-fastapi.md` P9), SQL/shell/file paths (→ the corresponding
   injection class), or a tool call with side effects. A safety
   pipeline that filters before persist/render is the mitigating control —
   verify every output path routes through it, and say so in the report.
3. **Tool loops**: for agentic flows, list the tools the model can invoke
   and their side effects. Injection-influenceable tool choice + a
   destructive/exfiltrating tool (send email, write DB, fetch URL) =
   `prompt_injection` finding at the tool boundary; severity by the worst
   reachable tool. Read-only tool surface = posture note.
4. **MCP server authn** (L5/L6): every MCP tool is an unauthenticated API
   endpoint unless the transport enforces identity. A strong
   pattern — OAuth 2.1 + PKCE with Entra (or other IdP) JWT validation on
   /mcp — is the baseline. Tools reachable without a validated principal =
   `auth_bypass` (HIGH; these tools often write or mutate state). Check
   session-id handling: session IDs are capability tokens — unguessable (UUID
   precedent ok), not logged.
5. **MCP tool authz**: same authn-≠-authz rule as REST — does a validated
   caller get ALL tools (including destructive ones: delete_record,
   archive)? Per-tool or per-role gating absent on destructive tools =
   `authz_missing` (MEDIUM+, by tool blast radius).
6. **Keys** (L3/L4): model API keys are server-side env/KV material. Any
   key in browser-delivered code (`VITE_*` bake-in — pairs with
   `stack-react-spa.md` R5) = `secret_exposure` HIGH (metered, abusable,
   and rate-limit DoS on YOUR account). Proxy-through-backend is the fix.
7. **Egress + logging** (L7): full prompts/completions in logs replicate the
   business data into the logging system at lower protection = `data_exposure`
   (MEDIUM when prompts carry financials/PII). Truncated/structured logging
   (model, token counts, latency) = correct pattern.

## Example

```python
# BAD — third-party log text into the prompt, output straight into PDF HTML
narrative = client.messages.create(
    model=MODEL,
    messages=[{"role": "user", "content": f"Summarize: {daily_log_text}"}],
).content[0].text
html = f"<section>{narrative}</section>"          # attacker text -> WeasyPrint
pdf = weasyprint.HTML(string=html).write_pdf()    # <img src=//attacker/beacon>

# GOOD — same prompt risk, but the SINK is defended (escape + fetch policy)
import html as htmllib
safe = htmllib.escape(safety_pipeline(narrative))   # house filter + escaping
pdf = weasyprint.HTML(string=f"<section>{safe}</section>",
                      url_fetcher=deny_external_fetcher).write_pdf()
```

## False-positive notes

- User/third-party content in prompts with **read-only, escaped sinks** —
  not a finding (hard exclusion 7). The sink analysis decides, always.
- System prompts stored as code constants — not secrets; don't flag their
  "exposure".
- Anthropic SDK retries/timeouts/model pinning — reliability, not security.
- "The model could be jailbroken" without a concrete sink/tool consequence —
  speculation; exclude.
- MCP servers bound to localhost for personal/dev use — the authn bar applies
  to network-reachable deployments, not local stdio servers.
