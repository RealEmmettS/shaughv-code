# Do / Don't examples — defensive-programming

Concrete do/don't pairs. Six sections, organized so that the underlying rule lands once before the language-specific renderings start.

For each pair: setup paragraph, `❌ Don't`, `✅ Do`, **Why** (one sentence).

---

## §0 — Cross-language anti-patterns

These four patterns surface in every language. The fix is shape-identical regardless of stack — Section 1+ shows the concrete renderings.

### 0.1 Validate at the boundary, not in the middle

**Setup.** A function that takes an `Order` object and computes its summary. The `Order` was already validated when it came off the wire at the HTTP / RPC / queue boundary. Re-checking inside is duplication.

```text
❌ Don't

def summarize_order(order):
    # Defensive re-validation at every layer
    if order is None:
        return None
    if not hasattr(order, "id"):
        log.warning("order missing id")
        return None
    if order.id is None or order.id == "":
        return None
    if not hasattr(order, "line_items"):
        return None
    ...
```

```text
✅ Do

def summarize_order(order: Order) -> OrderSummary:
    # Trust the type. If order.id can be None, fix the type.
    return OrderSummary.from_order(order)

# Validation lives at the boundary:
def post_order(request: HttpRequest) -> HttpResponse:
    order = Order.model_validate(request.json())  # Pydantic — raises on bad shape
    return ok(summarize_order(order))
```

**Why.** The first version hides which layer is actually wrong; the second makes the shape-contract enforced exactly once, at the only place untrusted data crosses the trust line.

---

### 0.2 Catch what is expected; let the rest fly

**Setup.** A function that pulls a document from a data store. The expected failure is "item not found." Anything else is a bug or an outage — surfacing it is the point.

```text
❌ Don't

def get_order(order_id):
    try:
        return store.read_item(order_id)
    except Exception as e:
        log.error(f"failed to read order: {e}")
        return None
```

```text
✅ Do

def get_order(order_id: str) -> Order | None:
    try:
        return store.read_item(order_id)
    except ItemNotFoundError:
        return None  # Expected — the caller distinguishes "absent" from "broken"
    # Network errors, auth errors, throttling, partition exhaustion — all propagate.
```

**Why.** A broad catch suppresses the unrelated failures that should page someone; the narrow catch encodes the expected absence as a domain value and lets the unexpected ones travel.

---

### 0.3 Log-and-continue is silent failure with extra steps

**Setup.** A sync job processes a batch of records. One record fails to parse. A defensive author skips it and continues. The job reports success. The bad record silently disappears from downstream tables until someone notices.

```text
❌ Don't

for record in batch:
    try:
        save(parse(record))
    except Exception as e:
        log.warning(f"skipped record: {e}")
        continue
return {"status": "ok", "processed": len(batch)}
```

```text
✅ Do

errors: list[RecordFailure] = []
saved = 0
for record in batch:
    try:
        save(parse(record))
        saved += 1
    except RecordParseError as e:
        errors.append(RecordFailure(record_id=record.id, reason=str(e)))
return {"status": "partial" if errors else "ok",
        "processed": saved,
        "failed": [e.model_dump() for e in errors]}
```

**Why.** The first version pretends success; the second returns a structured report and lets the caller act on the failures (DLQ, alert, retry queue, ticket).

---

### 0.4 Bound every retry

**Setup.** Calling a third-party API. It can return 429 (rate limit) or 503 (transient). Retry is correct here — *unbounded* retry is not.

```text
❌ Don't

def fetch_orders(customer_id):
    while True:
        try:
            return api.get(f"/customers/{customer_id}/orders")
        except (RateLimitError, ServerError):
            time.sleep(2)  # Try forever
```

```text
✅ Do

def fetch_orders(customer_id: str) -> list[Order]:
    deadline = time.monotonic() + 60   # Wall-clock bound
    delay = 0.5
    for attempt in range(1, 6):        # Count bound
        try:
            return api.get(f"/customers/{customer_id}/orders", timeout=10)
        except (RateLimitError, ServerError) as e:
            if time.monotonic() >= deadline:
                log.error("order fetch exhausted",
                          extra={"customer_id": customer_id,
                                 "attempts": attempt,
                                 "error_type": type(e).__name__})
                raise
            time.sleep(min(delay + random.random() * 0.5, 5))  # Jitter, capped
            delay *= 2
    raise RuntimeError("unreachable")
```

**Why.** Unbounded retry turns a downstream blip into a held-hostage worker; bounded-with-jitter retry recovers from transients without becoming the outage's cause.

---

### 0.5 Convert input to a typed value at the boundary — never carry stringly-typed data inward

**Setup.** A handler receives a string `"2026-05"` representing a billing period. The lazy default is to pass the string around and `.split("-")` it wherever needed. The defensive default is to parse it into a `BillingPeriod` value object once.

```python
# ❌ Don't
def summarize_order(order_id: str, period: str) -> OrderSummary:
    parts = period.split("-")              # Parse #1
    year = int(parts[0])
    month = int(parts[1])
    ...

def render_header(period: str) -> str:
    parts = period.split("-")              # Parse #2
    return f"Year {parts[0]} Month {parts[1]}"
```

```python
# ✅ Do
from dataclasses import dataclass
import re

@dataclass(frozen=True)
class BillingPeriod:
    year: int
    month: int

    @classmethod
    def parse(cls, s: str) -> "BillingPeriod":
        m = re.fullmatch(r"(\d{4})-(\d{2})", s)
        if not m:
            raise ValueError(f"invalid BillingPeriod {s!r} (expected 'YYYY-MM')")
        return cls(year=int(m[1]), month=int(m[2]))

def summarize_order(order_id: str, period: BillingPeriod) -> OrderSummary:
    # period.year, period.month — typed, no re-parsing
    ...

def render_header(period: BillingPeriod) -> str:
    return f"Year {period.year} Month {period.month:02d}"
```

**Why.** Re-parsing the same string in five places is five chances to disagree on the format. One typed value object is one source of truth. (Code Complete §8.5: *"Convert input data to the proper type at input time."*)

---

## §1 — Python

### 1.1 Pydantic at the RPC / tool entry; trust inside

**Setup.** An RPC / tool handler that reads an entity from a data store. The function signature has been re-validated at every internal call. The fix is to validate once at the entry, then trust the typed model.

```python
# ❌ Don't
def read_record(args: dict) -> dict:
    entity = args.get("entity")
    if not entity:
        return {"error": "entity required"}
    if not isinstance(entity, str):
        return {"error": "entity must be string"}
    record_id = args.get("id")
    if record_id is None:
        return {"error": "id required"}
    # ... continues for 30 lines, then helpers re-validate the same fields
    return _do_read(entity, record_id)

def _do_read(entity, record_id):
    if not entity:                       # Re-check
        raise ValueError("entity required")
    if not isinstance(record_id, str):   # Re-check
        record_id = str(record_id)
    ...
```

```python
# ✅ Do
from pydantic import BaseModel, Field

class ReadRecordArgs(BaseModel):
    entity: str = Field(min_length=1, max_length=64)
    id: str = Field(min_length=1)

def read_record(args: dict) -> ReadRecordResult:
    parsed = ReadRecordArgs.model_validate(args)  # Boundary — raises on bad shape
    return _do_read(parsed)

def _do_read(args: ReadRecordArgs) -> ReadRecordResult:
    # No re-validation. The type IS the contract.
    return store.read(args.entity, args.id)
```

**Why.** Pydantic crashes loudly with a useful message on bad input; the interior code is small, fast, and trustable.

---

### 1.2 `assert` for invariants; `raise` for caller-producible conditions

**Setup.** A helper that computes a percentage from two ints. Negative inputs are an internal invariant violation (the caller should never pass them); a zero denominator is something the caller might legitimately encounter.

```python
# ❌ Don't
def percentage(numerator: int, denominator: int) -> float:
    if numerator < 0 or denominator < 0:
        return 0.0                         # Silently mask the bug
    if denominator == 0:
        return 0.0                         # Silently mask the input
    return (numerator / denominator) * 100
```

```python
# ✅ Do
def percentage(numerator: int, denominator: int) -> float:
    assert numerator >= 0, f"numerator must be non-negative, got {numerator}"
    assert denominator >= 0, f"denominator must be non-negative, got {denominator}"
    if denominator == 0:
        raise ZeroDenominatorError("cannot compute percentage with zero denominator")
    return (numerator / denominator) * 100
```

**Why.** `assert` documents the author's invariant and crashes in dev; `raise ZeroDenominatorError` is a domain condition the caller can catch and handle. Returning `0.0` for both is the silent-failure trap.

**Gotcha.** Production deployments that run `python -O` strip the asserts. Use `assert` for dev-time invariants only; never for boundary validation or security.

---

### 1.3 Chain causes with `raise ... from err`

**Setup.** A sync wrapper around a third-party SDK. The wrapper wants to add domain-specific context to errors without losing the original cause.

```python
# ❌ Don't
def sync_orders(customer_id: str) -> int:
    try:
        return api.get_orders(customer_id)
    except Exception as e:
        raise RuntimeError(f"sync failed: {e}")   # Original cause lost in str()
```

```python
# ✅ Do
def sync_orders(customer_id: str) -> int:
    try:
        return api.get_orders(customer_id)
    except ApiError as e:
        raise OrderSyncError(
            f"order fetch failed for customer_id={customer_id}",
        ) from e   # Original traceback + type preserved
```

**Why.** `from e` preserves the original exception so a debugger or log handler can walk the chain; the bare `f"{e}"` throws away the cause's type and stack trace.

---

### 1.4 Library code re-raises; never silently swallows

**Setup.** A reusable helper in `mypackage/utils.py` — code that other modules import. It must not decide error policy for its callers.

```python
# ❌ Don't  (file: mypackage/utils.py)
def fetch_json(url: str) -> dict:
    try:
        resp = requests.get(url, timeout=10)
        return resp.json()
    except Exception as e:
        logger.warning(f"fetch failed: {e}")
        return {}                          # Callers see a successful empty dict
```

```python
# ✅ Do  (file: mypackage/utils.py)
def fetch_json(url: str) -> dict:
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except (requests.Timeout, requests.ConnectionError) as e:
        raise TransientFetchError(f"network error fetching {url}") from e
    except requests.HTTPError as e:
        raise HttpFetchError(
            f"HTTP {e.response.status_code} fetching {url}",
            status=e.response.status_code,
        ) from e
    # JSON decode errors propagate as-is — callers see ValueError
```

**Why.** The first version is the worst kind of library code: every caller now has to guess whether `{}` means "the API returned an empty document" or "something is on fire." The second gives callers typed errors they can branch on.

---

### 1.5 Domain primitives — make `Money`, `ProjectId`, `BillingPeriod` distinct types

**Setup.** Many "wrong-value-passed-to-the-wrong-parameter" bugs trace back to primitive-obsession — using `int` for everything from `project_id` to `record_count` to `amount_cents`.

```python
# ❌ Don't
def adjust_balance(project_id: int, delta: int) -> int:
    ...

adjust_balance(amount_cents, project_id)  # Compiles. Wrong order. Silent disaster.
```

```python
# ✅ Do
from typing import NewType

ProjectId = NewType("ProjectId", int)
Cents = NewType("Cents", int)

def adjust_balance(project_id: ProjectId, delta: Cents) -> Cents:
    ...

adjust_balance(amount_cents, project_id)  # Type error at mypy / pyright.
```

**Why.** A `NewType` is free at runtime and catches the misorder at type-check time. (Code Complete §24.2 "A primitive data type is overloaded.")

**Other-language equivalents:**
- **TS:** branded types — `type ProjectId = number & { __brand: "ProjectId" }`.
- **Rust:** `struct ProjectId(u64);` newtype, with `#[derive(Copy, Clone, Eq, PartialEq, Hash)]`.
- **C#:** `readonly record struct ProjectId(long Value);`.

---

## §2 — TypeScript / JavaScript / Node

These three share a runtime story (V8 + async). Examples are written in TypeScript but flag where the JS / Node differences matter.

### 2.1 Zod at the HTTP / edge boundary; trust the type inside

**Setup.** An HTTP / edge `fetch` handler that accepts a JSON body. The body is untrusted; the handler validates with Zod and passes a typed model into the business logic.

```typescript
// ❌ Don't
export default {
  async fetch(request: Request): Promise<Response> {
    const body = await request.json() as any;     // `any` defeats the type checker
    if (!body) return new Response("missing body", { status: 400 });
    if (!body.orderId) return new Response("missing orderId", { status: 400 });
    return handleOrder(body);                       // handleOrder re-checks everything
  },
};
```

```typescript
// ✅ Do
import { z } from "zod";

const OrderRequest = z.object({
  orderId: z.string().min(1),
  periodId: z.string().regex(/^\d{4}-\d{2}$/),
});
type OrderRequest = z.infer<typeof OrderRequest>;

export default {
  async fetch(request: Request): Promise<Response> {
    const parsed = OrderRequest.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    return handleOrder(parsed.data);   // handleOrder takes OrderRequest — typed
  },
};

function handleOrder(req: OrderRequest): Response {
  // No re-validation. parsed.data is the contract.
  ...
}
```

**Why.** `as any` is a lie that propagates downstream; `safeParse` is a runtime check with a typed payload that the rest of the code can rely on.

---

### 2.2 Always `await` (or `.catch`) — unhandled rejection is silent failure

**Setup.** A handler that kicks off a background log-write. The author thinks "fire and forget" is fine. Node's behavior on unhandled rejections has historically been quiet; recent versions crash the process — both outcomes are wrong.

```typescript
// ❌ Don't
function handleRequest(req: Request) {
  saveAuditLog(req);                   // Returns a Promise — never awaited, never .catch'd
  return Response.json({ ok: true });
}
```

```typescript
// ✅ Do
async function handleRequest(req: Request): Promise<Response> {
  // Option A — wait for it
  await saveAuditLog(req);
  return Response.json({ ok: true });

  // Option B — fire-and-forget but with explicit error handling
  // saveAuditLog(req).catch(err =>
  //   logger.error("audit log write failed", { error_type: err.name, request_id: req.headers.get("x-request-id") })
  // );
}
```

**Why.** A naked `Promise` that rejects vanishes — the audit log silently stops working and no one notices until an auditor asks.

**Node-specific.** Stream `'error'` events behave the same way. An EventEmitter that emits `'error'` with no listener crashes the process; an `'error'` listener that logs and continues is a silent failure. Treat stream errors like any other narrow catch — handle the specific case, propagate the rest.

---

### 2.3 `catch (e: unknown)` — never `catch (e: any)`

**Setup.** A function that wraps an `await` call. TypeScript 4.4+ allows `unknown` in catch — use it.

```typescript
// ❌ Don't
try {
  await readEntity(id);
} catch (e: any) {
  log.error(e.message);              // What if e has no .message? What if e isn't an Error?
}
```

```typescript
// ✅ Do
try {
  await readEntity(id);
} catch (e: unknown) {
  if (e instanceof NotFoundError) {
    return null;                     // Expected absence
  }
  if (e instanceof Error) {
    log.error("readEntity failed", { error_type: e.constructor.name, message: e.message, stack: e.stack });
    throw e;                          // Library code — propagate
  }
  log.error("readEntity failed with non-Error throw", { value: String(e) });
  throw e;
}
```

**Why.** `any` lets the catch body lie about the value; `unknown` forces a narrowing check that catches the case where someone `throw "string"`-ed.

---

### 2.4 `Result<T, E>` discriminated union — narrow once at the call site

**Setup.** A repo helper that may fail. Returning a discriminated union forces the caller to handle both arms; throwing scatters error handling.

```typescript
// ❌ Don't
async function fetchOrder(id: string): Promise<Order | null> {
  try {
    return await api.get(`/orders/${id}`);
  } catch {
    return null;                     // Caller can't tell "absent" from "broke"
  }
}
```

```typescript
// ✅ Do
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

type OrderError =
  | { kind: "not_found" }
  | { kind: "unauthorized" }
  | { kind: "upstream"; status: number }
  | { kind: "network"; cause: unknown };

async function fetchOrder(id: string): Promise<Result<Order, OrderError>> {
  try {
    return { ok: true, value: await api.get(`/orders/${id}`) };
  } catch (e: unknown) {
    if (e instanceof HttpError && e.status === 404) return { ok: false, error: { kind: "not_found" } };
    if (e instanceof HttpError && e.status === 401) return { ok: false, error: { kind: "unauthorized" } };
    if (e instanceof HttpError)                     return { ok: false, error: { kind: "upstream", status: e.status } };
    return { ok: false, error: { kind: "network", cause: e } };
  }
}

// Caller — exhaustiveness check from the compiler
const r = await fetchOrder(id);
if (!r.ok) {
  switch (r.error.kind) {
    case "not_found":    return render404();
    case "unauthorized": return render401();
    case "upstream":     return render502(r.error.status);
    case "network":      return render503();
  }
}
return renderOrder(r.value);
```

**Why.** A discriminated union makes "every error class is handled" a compile-time guarantee; `null` collapses every failure mode into "I don't know."

---

## §3 — Rust

Rust's type system already prevents most of the defensive-programming mistakes other languages make. The remaining traps are about `unwrap()`, `panic!`, and library-code discipline.

### 3.1 `Result<T, E>` + `?` propagation in library code; never `.unwrap()`

**Setup.** A library function that parses a third-party JSON response. The application binary can decide to crash; library code must not.

```rust
// ❌ Don't
pub fn parse_order(blob: &str) -> Order {
    let v: Value = serde_json::from_str(blob).unwrap();        // Panics on bad input
    let id = v["id"].as_str().unwrap().to_string();             // Panics if missing
    let title = v["title"].as_str().unwrap_or("").to_string();  // Silently empty
    Order { id, title }
}
```

```rust
// ✅ Do
use thiserror::Error;

#[derive(Error, Debug)]
pub enum OrderParseError {
    #[error("invalid JSON: {0}")]
    Json(#[from] serde_json::Error),
    #[error("missing required field: {0}")]
    MissingField(&'static str),
}

pub fn parse_order(blob: &str) -> Result<Order, OrderParseError> {
    let v: Value = serde_json::from_str(blob)?;                                  // Propagates with type
    let id = v["id"].as_str().ok_or(OrderParseError::MissingField("id"))?.to_string();
    let title = v["title"].as_str().ok_or(OrderParseError::MissingField("title"))?.to_string();
    Ok(Order { id, title })
}
```

**Why.** A panic in library code is not recoverable; a typed `Err` is. The `thiserror` macro makes the error enum cheap.

---

### 3.2 `panic!` for unreachable; `Err` for everything else

**Setup.** A function that takes a `Status` enum and returns a display string. If a new variant is added and this function is not updated, the compiler should catch it — and at runtime the impossible should panic.

```rust
// ❌ Don't
fn display(status: Status) -> &'static str {
    match status {
        Status::Active => "Active",
        Status::Archived => "Archived",
        _ => "",                                       // Silently swallows new variants
    }
}
```

```rust
// ✅ Do
fn display(status: Status) -> &'static str {
    match status {
        Status::Active => "Active",
        Status::Archived => "Archived",
        Status::Pending => "Pending",
        // No `_` arm — compiler errors when a new variant is added,
        // which is the point. The author updates this function instead of silently missing.
    }
}

// And when something truly cannot happen at runtime:
fn first_char(s: &str) -> char {
    assert!(!s.is_empty(), "first_char called with empty string — invariant violated");
    s.chars().next().expect("non-empty per assert above")
}
```

**Why.** A `_ => ""` arm hides the new variant from the compiler; an exhaustive match makes the type drive the correctness check.

---

### 3.3 Custom error enums with `thiserror` and `#[source]`

**Setup.** A repository module that wraps multiple lower-level errors. Each source must be preserved so the caller can introspect.

```rust
// ❌ Don't
pub fn load_project(id: &str) -> Result<Project, String> {
    let row = db::fetch(id).map_err(|e| format!("db: {}", e))?;        // String loses type
    let project = parse(row).map_err(|e| format!("parse: {}", e))?;
    Ok(project)
}
```

```rust
// ✅ Do
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ProjectLoadError {
    #[error("database error")]
    Db(#[source] db::DbError),
    #[error("parse error")]
    Parse(#[source] ParseError),
    #[error("project not found: {0}")]
    NotFound(String),
}

pub fn load_project(id: &str) -> Result<Project, ProjectLoadError> {
    let row = db::fetch(id).map_err(ProjectLoadError::Db)?;
    let project = parse(row).map_err(ProjectLoadError::Parse)?;
    Ok(project)
}
```

**Why.** A typed enum lets callers `match` on the failure mode; `String` collapses everything into "something went wrong" and loses the original cause for debugging.

---

## §4 — C# / .NET

### 4.1 Specific exception types — not `catch (Exception)` — in library code

**Setup.** A repository method that calls a remote data store over HTTP. The two expected failures are an `ApiException` with `StatusCode == NotFound` and a transient `StatusCode == TooManyRequests`. Anything else is propagated.

```csharp
// ❌ Don't
public async Task<Order?> GetOrderAsync(string id)
{
    try
    {
        return await _client.ReadItemAsync<Order>(id);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "failed to read order");
        return null;
    }
}
```

```csharp
// ✅ Do
public async Task<Order?> GetOrderAsync(string id, CancellationToken ct)
{
    try
    {
        var resp = await _client.ReadItemAsync<Order>(id, cancellationToken: ct);
        return resp.Resource;
    }
    catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
    {
        return null;                          // Expected — caller distinguishes
    }
    catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
    {
        _logger.LogWarning(ex, "store throttled, propagating to retry policy");
        throw;                                // Let the retry policy handle it
    }
    // Network, auth, deserialization errors propagate.
}
```

**Why.** `when` clauses keep each catch narrow and named; a bare `catch (Exception)` would swallow auth failures and not-found errors that should page someone.

---

### 4.2 `using` for cleanup; never trust the finalizer

**Setup.** A method that opens a `HttpClient` (well — uses `IHttpClientFactory`, but the same `using` rule applies for streams, transactions, etc.). On any code path, the resource must be released.

```csharp
// ❌ Don't
public async Task<string> DownloadAsync(string url)
{
    var stream = await _http.GetStreamAsync(url);
    var reader = new StreamReader(stream);
    return await reader.ReadToEndAsync();        // Leaks on any failure
}
```

```csharp
// ✅ Do
public async Task<string> DownloadAsync(string url, CancellationToken ct)
{
    await using var stream = await _http.GetStreamAsync(url, ct);
    using var reader = new StreamReader(stream);
    return await reader.ReadToEndAsync(ct);
}
```

**Why.** `using` (and `await using` for async-disposable) guarantees `Dispose` is called on the failure path too; relying on the finalizer is a memory leak waiting for the next GC pressure spike.

---

### 4.3 `ArgumentNullException` at the boundary; nullable reference types inside

**Setup.** A public method on a service. The boundary check is `ArgumentNullException`; once past it, the type system carries the contract.

```csharp
// ❌ Don't
public OrderSummary Build(Order order, BillingPeriod period)
{
    if (order == null) return null;                       // Returns null on bad input — silent
    if (period == null) return null;
    if (order.Id == null) return null;
    if (order.Name == null) order.Name = "(missing)";     // Mutating + defaulting
    ...
}
```

```csharp
// ✅ Do
#nullable enable
public OrderSummary Build(Order order, BillingPeriod period)
{
    ArgumentNullException.ThrowIfNull(order);
    ArgumentNullException.ThrowIfNull(period);
    // Order and BillingPeriod are non-nullable from here on — compiler enforces.
    return new OrderSummary(order, period);
}
```

**Why.** `ArgumentNullException.ThrowIfNull` is the .NET 6+ idiom; nullable reference types push the contract into the compiler so interior code stops having to guard.

---

## §5 — SQL (T-SQL flavor)

SQL is mostly a boundary layer. The examples cover the most common defensive failures: string concatenation, bare multi-statement writes, and unbounded input length. (T-SQL shown; the same discipline applies in any SQL dialect.)

### 5.1 Parameterize — always

**Setup.** A stored procedure that filters projects by status. The status string comes from user-supplied filter UI.

```sql
-- ❌ Don't  (this is also a SQL injection)
DECLARE @sql NVARCHAR(MAX) = N'SELECT * FROM projects WHERE status = ''' + @status + N''';';
EXEC sp_executesql @sql;
```

```sql
-- ✅ Do
SELECT project_id, name, status_at, status_reason
FROM   projects
WHERE  status = @status;
-- @status is bound by the caller via sp_executesql with @params, never concatenated.
```

**Why.** Parameter binding is the boundary; string concatenation lets the input become code, which is the original injection vulnerability AND a silent type-coercion trap (a numeric status might be stringified or vice versa).

---

### 5.2 `TRY ... CATCH ... THROW` around multi-statement writes (with nested-tx discipline)

**Setup.** A write that updates two tables and inserts an audit row. If any one fails, all three must roll back AND the error must propagate to the caller — not be logged and swallowed. The procedure may also be called from inside a caller-owned transaction, so it must respect `@@TRANCOUNT` rather than unconditionally `BEGIN TRANSACTION`.

```sql
-- ❌ Don't
BEGIN TRANSACTION;
    UPDATE projects      SET status = @status WHERE project_id = @id;
    UPDATE project_cache SET dirty  = 1       WHERE project_id = @id;
    INSERT INTO audit (project_id, action, actor) VALUES (@id, 'status_change', @actor);
COMMIT;
-- No CATCH. On failure, the partial state is left around and the connection error is silent.
-- Worse: if called inside a caller-owned transaction, `COMMIT` only decrements @@TRANCOUNT;
-- a later caller ROLLBACK then unwinds work this proc thought it committed.
```

```sql
-- ✅ Do
SET XACT_ABORT ON;                       -- Runtime errors auto-abort the transaction.

DECLARE @outer_trancount INT = @@TRANCOUNT;
DECLARE @savepoint sysname = N'sp_update_project_status';

BEGIN TRY
    IF @outer_trancount = 0
        BEGIN TRANSACTION;                -- We own the transaction.
    ELSE
        SAVE TRANSACTION @savepoint;      -- Caller owns it; we get a savepoint to roll back to.

    UPDATE projects      SET status = @status WHERE project_id = @id;
    UPDATE project_cache SET dirty  = 1       WHERE project_id = @id;
    INSERT INTO audit (project_id, action, actor) VALUES (@id, 'status_change', @actor);

    IF @outer_trancount = 0
        COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @outer_trancount = 0
        ROLLBACK TRANSACTION;             -- We own it; full unwind.
    ELSE IF XACT_STATE() <> -1            -- Caller's tx still recoverable
        ROLLBACK TRANSACTION @savepoint;  -- Unwind only OUR work.
    THROW;   -- Re-raises with original ERROR_NUMBER, ERROR_MESSAGE, ERROR_LINE.
END CATCH;
```

**Why.** `BEGIN TRY ... THROW` is the T-SQL equivalent of `try / catch / raise`; the `@@TRANCOUNT` / `SAVE TRANSACTION` pattern keeps the procedure composable so it does not silently roll back work the caller is still depending on. `SET XACT_ABORT ON` covers the class of errors that otherwise leave the transaction in a doomed state.

---

### 5.3 Bound the input length at the boundary

**Setup.** A stored procedure takes a free-form reason string. The interface declares `NVARCHAR(MAX)`. Without a length cap, a 2 GB payload is a real DoS vector — and the column it gets written to may not even support that.

```sql
-- ❌ Don't
CREATE OR ALTER PROCEDURE dbo.usp_record_status_change
    @project_id INT,
    @status NVARCHAR(50),
    @reason NVARCHAR(MAX)        -- Unbounded — caller can pass 2 GB.
AS
BEGIN
    INSERT INTO project_status_log (project_id, status, reason)
    VALUES (@project_id, @status, @reason);
END;
```

```sql
-- ✅ Do
CREATE OR ALTER PROCEDURE dbo.usp_record_status_change
    @project_id INT,
    @status NVARCHAR(50),
    @reason NVARCHAR(1000) = NULL    -- Length is the boundary contract.
AS
BEGIN
    SET NOCOUNT ON;

    IF @project_id IS NULL OR @project_id <= 0
        THROW 50001, 'project_id must be a positive integer', 1;
    IF @status IS NULL OR LEN(@status) = 0
        THROW 50002, 'status is required', 1;

    INSERT INTO project_status_log (project_id, status, reason)
    VALUES (@project_id, @status, @reason);
END;
```

**Why.** `NVARCHAR(MAX)` is the SQL equivalent of `any` in TypeScript — it accepts everything, including the things that crash the system downstream. The right boundary contract is a typed length that matches what the column / business rule actually expects, with an explicit `THROW` on out-of-band input.

---

## Notes on selecting examples for a PR

When citing this file in a PR review:

1. Link to the specific example (`examples.md §1.3` not "examples.md").
2. State the rule from SKILL.md the example proves (e.g., "Rule 2 — fail loud, not silent").
3. Offer the `✅ Do` form as a concrete edit, not as a vague "consider refactoring."

The examples are deliberately minimal — they exist to ground a rule, not to be lifted verbatim. Adapt them to the actual code under review.
