# Stack Surface — Azure SQL / Data Layer

Applies when the stack reaches Azure SQL — commonly three ways: `pyodbc`
(Python), the `mssql` Node driver (TypeScript), and occasionally
`sqlx`/`tiberius` (Rust). When raw parameterized T-SQL is the pattern and
there is no ORM to hide behind, injection discipline is enforced by convention
— and convention drift is exactly what audits catch. The data behind this
surface is often the most sensitive the org holds.

## Surface map

| Where | What can go wrong |
|---|---|
| Query construction | interpolation drift (f-strings, template literals, format!) |
| Identifiers | ORDER BY / column / table names from request data — unparameterizable |
| Dynamic IN lists | values joined into the string instead of per-element placeholders |
| Stored procs / `EXEC` | `EXEC('...' + @var)` second-order injection inside T-SQL itself |
| Connection auth | SQL auth w/ password in settings vs managed identity / Entra auth |
| Connection strings | `TrustServerCertificate=yes`, `Encrypt=no` in prod configs |
| Least privilege | app login owning `db_owner` when it reads five tables |
| Migrations | destructive DDL shipped alongside code that still reads the old shape |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| S1 | interpolated SQL — Python | `rg -n "(execute|executemany)\(\s*f['\"]" -tpy` |
| S2 | interpolated SQL — TS | `rg -n "\.query\(\s*\`[^\`]*\$\{|\.query\(\s*['\"][^'\"]*['\"]\s*\+" -tts` |
| S3 | parameterization presence | `rg -n "\.input\(|cursor\.execute\(.*,\s*\(|\.bind\(" ` — absence near S1/S2 hits confirms |
| S4 | dynamic identifiers | `rg -in "ORDER BY\s*['\"]?\s*(\+|\$\{|f['\"]|%s|\{)" ` |
| S5 | EXEC injection in T-SQL | `rg -in "EXEC\s*\(\s*@|EXEC\s*\(\s*'.*'\s*\+|sp_executesql.*\+" -g '*.sql' -tpy -tts` |
| S6 | connection security | `rg -in "TrustServerCertificate\s*=\s*(yes|true)|Encrypt\s*=\s*(no|false)|trustServerCertificate:\s*true|encrypt:\s*false" ` |
| S7 | SQL auth credentials | `rg -in "(Password|Pwd)=" -g '*.{json,ts,py,env.example,bicep,yaml,yml}'` — where does the value come from? |
| S8 | destructive DDL | `rg -in "\b(DROP\s+(TABLE|COLUMN)|TRUNCATE|DELETE\s+FROM\s+\w+\s*(;|$))" -g '*.sql'` |
| S9 | SELECT * on sensitive tables | `rg -n "SELECT\s+\*\s+FROM" -i` (pairs with data-security.md D8) |

## Checklist

1. **Walk every S1/S2 hit** with the same rule as the language references:
   values → placeholders (`?`, `@p`, `.input()`, `.bind()`), identifiers →
   allow-list maps. An f-string interpolating only compile-time constants is
   style, not a finding; one runtime variable in the query text is `sql_injection`.
2. **Dynamic IN lists**: the correct house pattern generates one placeholder
   per element (`",".join("?" * len(ids))`). Values `.join()`-ed into the
   string = `sql_injection` even when "they're just ints from our API" —
   trace whether the type is actually enforced upstream.
3. **Second-order T-SQL** (S5): `EXEC('SELECT … ' + @userVal)` inside a proc
   re-opens injection even when the app layer parameterized perfectly — check
   any `.sql` files and migration scripts for proc bodies. Use
   `sp_executesql` with typed parameters as the fix.
4. **Connection posture** (S6/S7): prod connection strings must have
   `Encrypt=yes` + `TrustServerCertificate=no` (Azure SQL default). SQL-auth
   passwords: in Key Vault / app settings = fine (note in posture); in tracked
   files = `secret_exposure` + history check. Managed identity / Entra auth
   (`Authentication=ActiveDirectoryMsi`) is the preferred posture — record
   which mode each app uses in the posture overview.
5. **Least privilege** (read the IaC/migrations, can't grep app code): what
   role does the app login hold? Prefer a narrow custom role (e.g. a
   `role_db_operator` scoped to what the app actually does) —
   an app connecting as server admin or `db_owner` for read-mostly work =
   `config_insecure` (MEDIUM, HIGH if the same login is shared across apps —
   blast-radius multiplier).
6. **Migrations** (S8): destructive DDL is reviewed under Mode C
   (`impact-assessment.md` owns the breaking-change verdict); the SECURITY
   angle here is data destruction reachable from CI — who can trigger the
   migration pipeline, and does it run with more privilege than the app?
7. **Error surfaces**: driver exceptions (`pyodbc.ProgrammingError`,
   `RequestError`) echoing SQL text into HTTP responses = `data_exposure`
   (MEDIUM — leaks schema + query shape to exactly the person probing for
   injection).

## Example

```ts
// BAD — dynamic IN list joined into the text; "they're ints" is unverified
const ids = req.query.get("ids").split(",");
const r = await pool.request().query(
  `SELECT project_cd, amount FROM commitments WHERE id IN (${ids.join(",")})`
);

// GOOD — one named parameter per element
const ids = Params.parse(req.query.get("ids")); // zod: array of ints
const request = pool.request();
const marks = ids.map((v, i) => { request.input(`id${i}`, sql.Int, v); return `@id${i}`; });
const r = await request.query(
  `SELECT project_cd, amount FROM commitments WHERE id IN (${marks.join(",")})`
);
```

## False-positive notes

- `pyodbc` `?` placeholders and `mssql` tagged-template queries are SAFE
  (precedent 7) — do not flag a query for *containing* user-named columns in
  comments or aliases.
- `TrustServerCertificate=yes` in `local.settings.json`/dev compose files —
  dev convenience, not a finding (flag only prod-bound config).
- DATETIMEOFFSET struct-unpacking and driver version pins are reliability
  topics (debugging-framework), not security findings.
- Read-only view/parity layers expose only what the underlying source
  exposes — schema breadth questions go to the posture overview, not findings.
