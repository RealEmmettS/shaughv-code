# By stack layer — what counts as a boundary at Millis

The four rules in `SKILL.md` apply everywhere; the *implementation* of boundary validation depends on the layer. This file enumerates the layers Millis code actually touches, names what counts as "the boundary" at each, and shows what validation belongs there.

For each layer, four things:

1. **What counts as the boundary.** The specific function / event / API surface where untrusted data first lands.
2. **What validates at the boundary.** The libraries, schemas, or runtime checks that belong there.
3. **What does NOT belong inside.** Defensive bloat patterns common at this layer.
4. **Common pitfall.** The mistake most often made when implementing this layer at Millis.

---

## HTTP / REST handler

Includes Flask, FastAPI, ASP.NET Core controllers, Cloudflare Worker `fetch()`, AWS Lambda HTTP integrations.

**Boundary.** The handler function called with the request object. Everything before the handler is framework; everything after is internal business logic.

**Validates at the boundary.**
- **FastAPI:** Pydantic models declared on the route signature (`def endpoint(body: ScorecardRequest)`).
- **Flask:** Pydantic / Marshmallow at the top of the view function.
- **ASP.NET Core:** Model binding + `[ApiController]` validation attributes + `ProblemDetails` for 4xx.
- **Cloudflare Worker:** Zod `safeParse` on `await request.json()` inside `fetch()`.
- Per-route auth: middleware that produces a typed `Principal`. Below the handler, code receives `Principal`, never `Request.headers.get("Authorization")`.

**What does NOT belong inside.**
- Re-checking `body.field is not None` after the model said `field: str`.
- Re-parsing the JSON body inside helpers.
- Re-validating the auth token deep in the call stack.

**Common pitfall.** Returning `200` with `{"error": "..."}` instead of a proper 4xx/5xx. The status code is part of the contract; clients use it for branching, monitoring, retry policy. Encode failures in the status code AND a structured body.

---

## MCP tool entry

The decorated tool function in an MCP server. The entry receives an arguments dict from the MCP runtime; below the entry is internal logic that should never re-parse that dict.

**Boundary.** The function annotated with the MCP `@tool` (or equivalent) decorator.

**Validates at the boundary.**
- Pydantic model for the args dict, declared per tool.
- One `ToolResult`-shaped return type — discriminated union of success vs error — so the caller (Claude) gets structured feedback.
- Permission checks (which operator can call this tool) at the entry, never deeper.

**What does NOT belong inside.**
- `args.get("field")` inside helper functions.
- Inline string formatting of error messages — emit a typed `ToolError`.

**Common pitfall.** Returning `{"error": "something went wrong"}` instead of `{"error": {"code": "RATE_LIMIT", "message": "...", "retry_after_seconds": 30}}`. The caller can pattern-match on a code; it cannot reliably pattern-match on a free-form string.

---

## Azure Function trigger

HTTP triggers, Timer triggers, Queue triggers, Service Bus triggers, Event Grid triggers, Blob triggers.

**Boundary.** The decorated trigger function. For Timer triggers the "input" is the schedule fire; for everything else there is a payload that must be validated.

**Validates at the boundary.**
- For HTTP triggers: same rules as HTTP handlers above.
- For Queue / Service Bus / Event Grid: parse the payload into a typed message class at the top of the function. Treat the binding as untrusted — the message may have been authored by a previous version of the producer.
- For Blob triggers: validate the blob's metadata AND its first read — a "JSON blob" may be empty, partial, or someone else's format.
- For Timer triggers: validate config / state read at the start of each invocation, not at module import time. Config can change between invocations.

**What does NOT belong inside.**
- `os.getenv("…")` calls scattered through the function body. Load once at entry, fail fast if missing.
- Assuming the trigger payload's shape is whatever the producer last shipped.

**Common pitfall.** Treating a Service Bus message as exactly-once. Service Bus is *at-least-once*. Build idempotency into the receiver (see `SKILL.md § Idempotency`); the trigger function must be safe to call twice with the same message.

---

## Cloudflare Worker fetch / cron handler

**Boundary.** `export default { fetch(request, env, ctx) }` for HTTP, `scheduled(event, env, ctx)` for cron.

**Validates at the boundary.**
- `env` is the binding object — read it once at the top and assign to typed locals. Never read `env.SOME_VAR` 30 calls deep.
- `request` is untrusted. Use Zod on `await request.json()` or `request.formData()`.
- For `scheduled`, validate any state read from KV / D1 / R2 — those are external systems whose schema can drift.

**What does NOT belong inside.**
- `as any` on the request body.
- Unhandled `await`-less Promises — Workers terminate when the handler returns, and pending Promises are killed. Always `await` or pass to `ctx.waitUntil()`.

**Common pitfall.** Forgetting `ctx.waitUntil()` for fire-and-forget work (logging, analytics). The work *appears* to start, then dies when the response is returned. Either `await` it or `ctx.waitUntil(promise)` it.

---

## Service Bus / Event Grid message handler

Whether triggered by Azure Functions, a Worker, or a standalone consumer.

**Boundary.** The first function that receives the deserialized message.

**Validates at the boundary.**
- Parse the message body into a typed model. Tag the schema with a version (`v1`, `v2`) so producers and consumers can evolve.
- Reject malformed messages explicitly. Dead-letter them with a structured error — do not silently re-queue or silently drop.
- Honor the lock — finish before the lock duration, or renew it explicitly.

**What does NOT belong inside.**
- Assuming message order. Service Bus sessions give order; topics and queues do not.
- Assuming exactly-once. See "Common pitfall" under Azure Function trigger.

**Common pitfall.** Logging the failure and `complete()`-ing the message anyway, so it disappears from the queue. The DLQ exists for a reason — let failed messages route there so they can be inspected and replayed.

---

## Procore / Acumatica / external SaaS API call

Every external HTTP call to a vendor whose backend Millis does not own.

**Boundary.** The HTTP request boundary AND the response parse. Both sides are untrusted.

**Validates at the boundary.**
- **Outbound:** Construct the request with parameterized URL builders, never string concatenation; include a `User-Agent` that identifies Millis; set a timeout (10s default for synchronous, 60s for background); include retry headers Procore expects (`Procore-Company-Id`, etc.).
- **Inbound:** Parse the response into a typed model even if the vendor's docs promise a shape. The shape can change in a minor version bump; parsing into Pydantic / Zod / `serde` catches the drift loudly.

**What does NOT belong inside.**
- `response.json()` followed by `["field"]` indexing — that is implicit trust of an external contract.
- Retrying on `4xx`. `400`, `401`, `403`, `404`, `422` are not transient; retrying just multiplies the failure (and may trip rate limits).
- Catching the SDK's generic `ApiException` / `HttpError` and re-throwing it as `Exception` — the wrapper module must enumerate the specific subclasses the SDK can raise (Code Complete §8.4: *"Know the exceptions your library code throws"*) and re-raise them as typed Millis errors. If the SDK doesn't document its exceptions, write a 30-line probe script and find out.

**Common pitfall.** Not handling the rate-limit response (`429`) explicitly. Procore publishes `Retry-After`; honor it. A retry that ignores `Retry-After` and immediately backs off-and-retries is more polite than infinite hammering but still wrong.

---

## Azure SQL row hydration (read)

Reading rows from Azure SQL into Python / TypeScript / C# / Rust application memory.

**Boundary.** The mapping function that turns a row tuple / `dict` / `DataReader` into a typed model.

**Validates at the boundary.**
- Pydantic / dataclass / typed interface for every table or view the application reads.
- Explicit column list in the `SELECT` — never `SELECT *`. The column list is the contract.
- Type assertions in the mapping (e.g., timestamps come back tz-aware UTC; decimals come back as `Decimal`, not `float`).

**What does NOT belong inside.**
- Positional row access (`row[3]`). Name the columns.
- `if row[3] is None` checks scattered through business logic — fix the model so the column is `Optional[…]` if it is genuinely nullable, then trust the type below.

**Common pitfall.** Hydrating a row in one place and a slightly different shape in another. Each query has its own ad-hoc dict. The fix is one model per logical entity (or one per query if the queries are genuinely different) — never an untyped dict floating between functions.

---

## Azure SQL write (transaction)

Inserts, updates, deletes — especially multi-statement writes.

**Boundary.** The application function that issues the write, plus the SQL transaction inside.

**Validates at the boundary.**
- The values to be written come from typed models, not user-supplied dicts.
- Multi-statement writes are wrapped in `BEGIN TRY / BEGIN TRAN / COMMIT / ROLLBACK / THROW`.
- After the write, read back the identifier (or use `OUTPUT`) and log it at `INFO` so verification has something to look up.

**What does NOT belong inside.**
- Bare `BEGIN TRAN` with no `CATCH` (partial state on failure).
- Catching SQL exceptions in application code and discarding the cause.
- Retrying a non-idempotent write without an idempotency key.
- Unconditional `BEGIN TRANSACTION` inside a procedure that may be called from a caller-owned transaction. Inspect `@@TRANCOUNT` at entry; use `SAVE TRANSACTION` to create a savepoint when nested, and `ROLLBACK TRANSACTION <savepoint>` to unwind only this procedure's work on failure. See `examples.md §5.2`.
- Variable-length parameters typed as `NVARCHAR(MAX)` / `VARBINARY(MAX)` without a documented business reason — the length is part of the boundary contract. See `examples.md §5.3`.

**Common pitfall.** Forgetting to set `XACT_ABORT ON`. Without it, certain errors leave the transaction open but in an unusable state; the next operation hangs. The second-most common pitfall is unconditional `BEGIN TRANSACTION` from a callee, which silently breaks the caller's atomicity.

---

## Cosmos DB read / write

**Boundary.** The repository function that calls the SDK.

**Validates at the boundary.**
- The partition key is supplied on every read. If the partition key is wrong, Cosmos cross-partitions, which is slow and expensive — not a silent failure but an operational one.
- Documents parse into a typed model on read; raw `dict` access is the antipattern.
- Writes specify the ETag / `IfMatchEtag` if optimistic concurrency matters.

**What does NOT belong inside.**
- Catching `CosmosException` broadly. Branch on `StatusCode` — `404` is expected absence, `429` is throttle (let Polly / retry policy handle), `412` is precondition failed (concurrency conflict — handle explicitly).

**Common pitfall.** Reading a document without a partition key by relying on the SDK's `CrossPartitionQuery`. It works in dev (small data) and fails-by-cost in prod.

---

## CLI argument parse

Scripts, one-shot operator tools, ad-hoc CDP backfills.

**Boundary.** The `argparse` / `click` / `typer` / `clap` / `commander` parser at the top of the script.

**Validates at the boundary.**
- Required args are required at parse time. No "if not args.foo: print(error); exit(1)" inside the script body.
- Types are declared (`type=int`, `--count INT`, etc.) so the parser produces typed values.
- Subcommands have their own typed args, declared on the subcommand.

**What does NOT belong inside.**
- Reading `sys.argv` directly after the parser has already run.
- Re-parsing string flags into ints inside the script body.

**Common pitfall.** Building a CLI that *prints* help on bad input but exits 0. CLIs must exit non-zero on bad input — pipelines depend on the exit code.

---

## Config / environment variable load

Application startup; reads from `.env`, environment, Azure App Config, Key Vault.

**Boundary.** The single function that loads all config at process start.

**Validates at the boundary.**
- One config model (Pydantic `BaseSettings`, Zod, `IOptions<T>`). One source of truth.
- Required values fail loud at startup if missing. The process must not start without them.
- Defaults are explicit and named (e.g., `RETRY_MAX: int = 3`), not implicit (silently `None` if missing).
- Secrets come from Key Vault or a secret manager — never from `os.getenv` against a plain string named `..._SECRET`.

**What does NOT belong inside.**
- `os.getenv("FOO")` scattered through business logic.
- Reading config inside hot loops.

**Common pitfall.** Loading config at module import time so the test harness can't substitute a fake. Load at the top of `main()` (or its equivalent), pass the config object down explicitly.

---

## Secret read (Key Vault)

**Boundary.** The function that reads from Key Vault and hydrates the config / credential.

**Validates at the boundary.**
- Read at startup; cache for the process lifetime if rotation is not in scope.
- If rotation IS in scope, refresh on a schedule (e.g., every 6h) and on `401` / `403` from the consuming API call.
- Fail loud at startup if a required secret is missing — never start the process with a placeholder.

**What does NOT belong inside.**
- Logging the secret value (even at `DEBUG`). Log the secret *name* or a hash of the version.
- Catching the Key Vault `ResourceNotFoundError` and substituting an empty string.

**Common pitfall.** Using a managed identity in prod but a personal credential locally, with no clear separation. Use the credential chain (`DefaultAzureCredential`) and document which credential is expected in each environment.

---

## Scheduled job tick (Timer trigger, cron, Workers cron)

**Boundary.** The function fired by the scheduler. The "input" is the fire time + any state read from a checkpoint table.

**Validates at the boundary.**
- Read the checkpoint state at the start of every invocation; do not rely on in-memory state across ticks (scheduler may run on a different worker).
- Treat overlapping invocations as possible — use a lock table, lease, or `singleton` binding.
- Validate that the wall-clock fire time is plausible (occasionally a scheduler will fire late by hours after a degradation; the job's logic should detect this).

**What does NOT belong inside.**
- Stateful counters that assume the worker process survives between ticks.
- Side-effects without idempotency keys.

**Common pitfall.** Long-running ticks that exceed the next scheduled fire, producing overlapping concurrent invocations. Either set a singleton lock OR ensure the work is short relative to the interval.

---

## File I/O

Reading from / writing to local disk, mounted volumes, blob storage.

**Boundary.** The function that opens the file.

**Validates at the boundary.**
- Encoding is declared explicitly. Default to UTF-8 with explicit BOM handling for files from Excel / Windows.
- Writes are atomic via temp-file + rename, not by writing into the final path and hoping nothing crashes mid-write.
- File size is bounded before reading into memory (don't `read()` a multi-GB file into a string).

**What does NOT belong inside.**
- Catching `IOError` to swallow a "file not found." Either the file is required (raise) or it is optional (handle the absence explicitly with a domain value).

**Common pitfall.** Writing the file with `mode='w'`, the process crashes between the open and the close, and the file is now empty / partial. Atomic-write pattern: write to `path.tmp`, fsync, rename to `path`.

---

## Static site / front-end user input

Forms, search boxes, URL params, drag-and-drop, file uploads.

**Boundary.** The form submission handler / URL parser / drop handler.

**Validates at the boundary.**
- Client-side validation is UX; never security. Repeat the validation on the server.
- File uploads: validate type, size, AND content (a `.png` may not be a PNG). Use a sniffer (magic bytes), not the file extension.
- URL params: parse and reject malformed early; do not `parseInt(window.location.hash.slice(1))` deep inside a render function.
- **Security boundary checks:** every external-input boundary explicitly defends against the OWASP / Code Complete §8.8 attack vectors that are in-scope for the layer:
  - Buffer / length overflows (NVARCHAR(MAX) without a cap, JSON body without `Content-Length` bound).
  - SQL injection (parameterize; never string-concatenate).
  - HTML / script injection (output-encode; never `innerHTML` user-supplied strings).
  - Integer overflow (Python is bigint-safe; TS / C# / Rust need an explicit `i64` / `BigInt` decision).
  - Path traversal (`../../etc/passwd` for upload paths).
  - Open-redirect (untrusted URL in a 302 Location header).
  - XML / XXE for any XML input (Acumatica).

  The check is *which of these apply to this layer* — not whether all of them apply. The layer's documentation must answer the question.

**What does NOT belong inside.**
- Re-validation in every React component down the tree.
- Trusting that "the form" already validated — server-side is the boundary that matters.

**Common pitfall.** Storing user-supplied HTML and rendering it without sanitization. Use a typed `SafeHtml` newtype that can only be constructed via the sanitizer, so the type system enforces the boundary.

---

## SignalR / WebSocket message

**Boundary.** The hub method (SignalR) or message handler (raw WebSocket).

**Validates at the boundary.**
- Authenticate the connection on `OnConnectedAsync`; bind a typed `Principal` to the connection context.
- Validate each message body with a schema. Discriminated union on a `type` field works well.
- Rate-limit per connection — a misbehaving client should not be able to spam the hub.

**What does NOT belong inside.**
- Trusting the `groupName` / `userId` the client sent over the wire — derive them server-side from the authenticated principal.

**Common pitfall.** Forgetting that WebSocket reconnects produce a new connection ID; per-connection in-memory state is lost. Persist anything that must survive reconnect.

---

## Summary table

| Layer | Validate | Do not |
|---|---|---|
| HTTP / REST | Pydantic / Zod / model-binding on the route | Re-check `body.field` deeper down |
| MCP tool | Pydantic on args, typed `ToolResult` return | Free-form error strings |
| Azure Function trigger | Typed message at the trigger boundary | Assume exactly-once delivery |
| Cloudflare Worker | Zod on body, `await` or `waitUntil()` everything | Read `env` 30 calls deep |
| Service Bus / Event Grid | Parse to typed model, version the schema | Silently drop bad messages |
| External SaaS API | Parse response into typed model; retry only transients | Trust the raw dict |
| Azure SQL read | One model per entity, explicit column list | `SELECT *` + positional access |
| Azure SQL write | TRY / TRAN / CATCH / THROW; idempotency key | Bare `BEGIN TRAN` |
| Cosmos DB | Supply partition key, branch on `StatusCode` | Cross-partition by accident |
| CLI parse | Required args at parser, typed values | Re-parse `sys.argv` mid-script |
| Config / env | One model, fail loud on missing | `os.getenv` scattered |
| Key Vault | Cache by lifetime; fail loud at start | Log the secret value |
| Scheduled job | Read checkpoint each tick; lock against overlap | Stateful in-memory across ticks |
| File I/O | Encoding declared; atomic writes | Swallow "file not found" |
| Front-end input | Re-validate server-side; sniff file content | Trust client validation alone |
| SignalR / WebSocket | Auth on connect; schema per message; rate-limit | Trust client-supplied identity |
| Domain primitives (Money, ProjectId, FinPeriod) | Newtype / branded / wrapped struct at the boundary | Pass naked `int` / `str` across module boundaries |

Every row reads the same way: the boundary is *here*, not *there*. Inside, trust the type.
