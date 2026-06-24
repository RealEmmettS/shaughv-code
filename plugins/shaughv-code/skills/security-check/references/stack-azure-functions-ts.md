# Stack Surface — Azure Functions (TypeScript, v4 model)

Applies when the stack includes Azure Functions — v4 HTTP triggers in
TypeScript, zod where validation exists, `mssql` for Azure SQL, fronted either
directly or by a Static Web App. The recurring failure shapes: a trigger that
skips the validation its siblings use, trust in SWA-injected headers from
non-SWA traffic, and string-built SQL beside parameterized SQL.

## Surface map

| Where | What can go wrong |
|---|---|
| `app.http(...)` registrations | `authLevel: 'anonymous'` on endpoints that assume auth happened |
| Request parsing | `request.json()` / `request.query` used without schema validation |
| Identity | `x-ms-client-principal` parsed and trusted (see `stack-auth-entra.md`) |
| Data layer | `mssql` template strings vs `.input()` bindings |
| Outbound calls | URLs built from request data (SSRF), third-party token forwarding |
| Responses | stack traces / driver errors returned to the client |
| Bindings & config | connection strings in app settings vs Key Vault refs; `local.settings.json` tracked |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| F1 | trigger inventory + auth level | `rg -n "app\.(http|get|post|put|patch|deleteRequest)\(" -tts` and `rg -n "authLevel" -tts` |
| F2 | unvalidated body/query use | `rg -n "request\.(json|text|query|params)" -tts` then check distance to a `parse(`/`safeParse(` |
| F3 | SQL string building | `rg -n "query\(\s*\`|query\(\s*['\"].*\$\{|\+\s*req" -tts` |
| F4 | mssql raw vs bound | `rg -n "\.input\(|sql\.(NVarChar|Int|Bit|DateTime)" -tts` (absence near F3 hits = finding) |
| F5 | SSRF candidates | `rg -n "fetch\(\s*[^'\"\`]|fetch\(\s*\`[^\`]*\$\{" -tts` |
| F6 | client-principal trust | `rg -in "x-ms-client-principal" -tts` |
| F7 | secrets in function config | `rg -n "AccountKey=|Password=|connectionString" --glob '!node_modules' -g '*.{json,ts}'` |
| F8 | error leakage | `rg -n "catch.*\{[\s\S]{0,120}(err(or)?\.(stack|message)|String\(e)" -U -tts` — which ones flow into the HTTP response? |
| F9 | CORS | check `host.json` / SWA config for `"*"` origins with credentials |

## Checklist

1. **Build the route table first** (F1): every registered route, its
   `authLevel`, and what auth it actually enforces in-code. `anonymous` +
   no in-code token validation + non-public data = `auth_bypass` (HIGH).
   `function`/`admin` key levels: keys in client-side code or repo = `secret_exposure`.
2. **Validation parity** (F2): repos here use zod when they validate. A handler
   consuming `request.json()` without a schema, in a repo where siblings use
   zod, is the deviation signal — finding if the unvalidated fields reach SQL,
   URLs, or file paths; otherwise hardening note.
3. **SQL discipline** (F3+F4): every dynamic value must go through `.input()`
   binding or the `mssql` tagged-template literal (which parameterizes).
   String concatenation or `${}` interpolation of request data into the query
   text = `sql_injection` (HIGH+). Identifier interpolation (column/table from
   request) can't be parameterized — require an allow-list map; its absence is
   the same finding.
4. **SSRF** (F5): user data controlling host or protocol of an outbound fetch
   = `ssrf` (path-only control is excluded per the precedents). Functions run
   with a managed identity — IMDS (`169.254.169.254`) reachability makes SSRF
   credential-bearing: MEDIUM → HIGH.
5. **Header trust** (F6): `x-ms-client-principal` is only trustworthy when the
   Function is ONLY reachable through SWA/App Service Auth. If the Function
   app has a public hostname accepting direct traffic, the header is
   attacker-suppliable = `header_trust` (HIGH). Verify the network path before
   reporting — this is the classic SWA-fronted-Functions finding both ways.
6. **Response hygiene** (F8): driver errors (`RequestError`, stack traces,
   query fragments) returned in the body = `data_exposure` (LOW–MEDIUM;
   MEDIUM when the error echoes query text).

## Example

```ts
// BAD — interpolated request data; authLevel anonymous; error echoed
app.http("getProject", {
  authLevel: "anonymous",
  handler: async (req) => {
    const id = req.query.get("projectId");
    const result = await pool.query(`SELECT * FROM projects WHERE id = '${id}'`);
    return { jsonBody: result.recordset };
  },
});

// GOOD — schema-validated, parameterized, scoped columns
const Params = z.object({ projectId: z.string().regex(/^\d+$/) });
app.http("getProject", {
  authLevel: "anonymous", // SWA enforces auth upstream — verified direct traffic is blocked
  handler: async (req) => {
    const parsed = Params.safeParse(Object.fromEntries(req.query));
    if (!parsed.success) return { status: 400 };
    const r = await pool.request()
      .input("id", sql.Int, Number(parsed.data.projectId))
      .query("SELECT id, name, status FROM projects WHERE id = @id");
    return { jsonBody: r.recordset };
  },
});
```

## False-positive notes

- `authLevel: 'anonymous'` is CORRECT for SWA-fronted functions (SWA strips
  function keys); the finding only exists if direct traffic isn't blocked.
- `mssql` tagged templates (``pool.query`SELECT … WHERE id = ${id}` ``) DO
  parameterize — don't confuse them with string templates passed as plain
  strings. Check whether `query` receives a template literal directly (safe)
  or a pre-built string (unsafe).
- Timer/queue triggers consume trusted input (precedent: env/infra is
  trusted) — skip injection analysis unless the queue message originates from
  user-facing intake (then trace the producer).
