# Stack Surface — Python Backend (FastAPI / Azure Functions Python)

Applies when the stack includes a Python backend — common shapes are FastAPI
+ pyodbc + Jinja2/WeasyPrint + an LLM SDK, FastAPI + MCP, or Python Azure
Functions + pyodbc + a message bus. Pydantic where validation exists; when the
pattern is raw parameterized T-SQL with no ORM and JWT validation hand-rolled
against Entra JWKS, that auth part is reviewed under `stack-auth-entra.md`.

## Surface map

| Where | What can go wrong |
|---|---|
| Route handlers | params consumed without pydantic models; authz per-route gaps |
| pyodbc layer | f-string SQL beside `?`-parameterized SQL; identifier interpolation |
| Templates → PDF | Jinja2 SSTI; WeasyPrint fetching external resources; HTML injection into PDFs |
| Dangerous stdlib | `subprocess` with `shell=True`, `pickle.loads`, `yaml.load`, `eval` |
| File handling | paths built from request data; uploads written under web roots |
| Outbound HTTP | httpx/requests with user-influenced URLs (SSRF); `verify=False` |
| Async/DI | auth dependencies forgotten on individual routers |

## Greppable sweep

| # | Check | Pattern |
|---|---|---|
| P1 | route inventory | `rg -n "@(app|router)\.(get|post|put|patch|delete)\(" -tpy` |
| P2 | SQL via f-string/format/concat | `rg -n "(execute|executemany)\(\s*f['\"]|\.format\(.*(SELECT|INSERT|UPDATE|DELETE)|['\"]\s*\+\s*\w+.{0,30}(WHERE|FROM)" -i -tpy` |
| P3 | shell + dynamic input | `rg -n "subprocess\.(run|call|Popen|check_output)\(|os\.system\(" -tpy` then check `shell=True` + variable args |
| P4 | deserialization | `rg -n "pickle\.loads?\(|yaml\.load\((?!.*Safe)|marshal\.loads|shelve\." -tpy` |
| P5 | eval family | `rg -n "\beval\(|\bexec\(|__import__\(" -tpy` |
| P6 | SSTI | `rg -n "Template\(.*(request|input|param|f['\"])|render_template_string|Environment\(" -tpy` |
| P7 | path traversal | `rg -n "(open|Path|os\.path\.join|send_file|FileResponse)\(.{0,60}(request|param|filename|file_name|payload)" -i -tpy` |
| P8 | TLS off / SSRF | `rg -n "verify\s*=\s*False|httpx\.(get|post|AsyncClient)|requests\.(get|post)" -tpy` |
| P9 | WeasyPrint inputs | `rg -n "HTML\(|weasyprint" -i -tpy` — trace `base_url` and the source HTML |
| P10 | debug surfaces | `rg -n "debug\s*=\s*True|--reload|app\.add_middleware\(.*CORSMiddleware" -tpy` (check `allow_origins=[\"*\"]` + `allow_credentials=True`) |

## Checklist

1. **Route table first** (P1): for each route — pydantic model or raw
   `Request`? Auth dependency present (`Depends(verify_token)` or
   middleware)? The strong pattern is bearer validation + resource-level
   authz (an access-check layer that binds the caller to the resource); any
   route skipping the authz half while serving owner-scoped data =
   `authz_missing` (HIGH — IDOR on sensitive data). The auth-vs-authz
   distinction is THE Python finding here: token valid ≠ allowed to see
   resource X.
2. **SQL** (P2): house pattern is `?` placeholders with values as args —
   that's safe. Findings: f-string/`.format()`/concat building WHERE/IN
   clauses, and **identifier interpolation** (table/column/ORDER BY from
   request) which `?` can't fix — require allow-list mapping. Dynamic `IN
   (...)` lists must generate `?` per element, not join values.
3. **Templates/PDF** (P6, P9): SSTI = user data in the TEMPLATE (not data
   passed to a compiled template) — `Template(f"...{user}...")` or
   `render_template_string` = `template_injection` (CRITICAL in Jinja2:
   sandbox escape → RCE). WeasyPrint: HTML containing user/LLM-influenced
   content can embed `<img src="http://attacker/x">` (SSRF/exfil beacon from
   the render host) or `url(file://...)` resource reads — check
   `url_fetcher`/`base_url` restrictions; a safety pipeline that filters
   content before render is the mitigating control — verify every
   PDF path actually routes through it.
4. **Deserialization** (P4): `pickle.loads` on anything not produced and
   stored by this same service = `deserialization` RCE (CRITICAL).
   `yaml.load` without `SafeLoader` on external input = same. Internal cache
   files: downgrade per the env-is-trusted precedent.
5. **Subprocess** (P3): `shell=True` with any request-derived token =
   `command_injection` (HIGH+). List-args without shell: only flag if argv[0]
   itself is user-influenced.
6. **Files** (P7): request-derived names must be sanitized
   (`Path(name).name` or allow-list) AND anchored (`(base / name).resolve()`
   then verify `.is_relative_to(base)`). Missing either = `path_traversal`.
7. **Outbound** (P8): `verify=False` in prod code = `crypto_weak` (MEDIUM).
   User-influenced URL host/scheme = `ssrf`; container/ACA workloads can
   reach IMDS — note it in the exploit scenario.
8. **CORS** (P10): `allow_origins=["*"]` WITH `allow_credentials=True` =
   `cors_misconfig` (MEDIUM; FastAPI silently drops the combination in some
   versions — verify actual response headers before scoring HIGH).

## Example

```python
# BAD — identifier interpolation; ? can't parameterize ORDER BY
sort = request.query_params.get("sort", "period")
cursor.execute(f"SELECT project_cd, period, amount FROM financials ORDER BY {sort}")

# GOOD — allow-list map; values still bound with ?
SORTABLE = {"period": "period", "amount": "amount", "project": "project_cd"}
order_col = SORTABLE.get(sort, "period")
cursor.execute(
    f"SELECT project_cd, period, amount FROM financials WHERE pm_id = ? ORDER BY {order_col}",
    pm_id,
)
```

## False-positive notes

- f-string SQL with NO interpolated runtime values (`f"SELECT TOP ({LIMIT})"`
  where LIMIT is a module constant) — not a finding; note it as fragile style at most.
- `subprocess.run(["git", "-C", repo, ...])` with operator-supplied repo paths
  — trusted input (CLI/operator precedent).
- Pydantic models reject extra fields per config — don't report "mass
  assignment" against pydantic-validated bodies.
- `yaml.safe_load` — safe; move on.
- Uvicorn `--reload` in a dev script — not a finding; in the production
  Dockerfile CMD — `config_insecure` (LOW).
