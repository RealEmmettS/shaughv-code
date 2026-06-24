# Checklist — defensive-programming

Copy-paste into a PR template, run before committing, or paste at the top of a code-review comment when a diff has new error-handling code.

Each item links to its SKILL.md or supporting-file source.

---

## Pre-commit (author runs solo, before `git commit`)

### Boundary discipline

- [ ] **Every external input has a typed model at the boundary.** Pydantic / Zod / DTO / `serde` — not a raw `dict` / `any` / `object`. (`SKILL.md § Boundary vs interior`, `by-stack-layer.md`)
- [ ] **No interior code re-validates a shape the type signature already guarantees.** Found one? Either the type is wrong or the check is wrong. Fix the type. (`SKILL.md § Null / undefined checks`)
- [ ] **Every external call has a timeout.** No `requests.get(url)` / `await fetch(url)` / `HttpClient.GetAsync(url)` without a deadline. (`SKILL.md § Retry/backoff/timeout`)
- [ ] **External input is converted to a typed value at the boundary, not carried as a string inward.** No `period.split("-")` reachable from two functions; parse to `BillingPeriod` once. (`SKILL.md § Boundary vs interior`, `examples.md §0.5`)
- [ ] **The "garbage in" response is explicit — one of: nothing out, error message out, or no garbage allowed in.** Never "garbage in, garbage out." (`SKILL.md § Input-handling response matrix`)

### Error handling

- [ ] **Every catch is specific.** No `except Exception:` / `catch (Exception)` / `catch (_)` / `.unwrap()` in library code. (`SKILL.md § Hard defaults`)
- [ ] **Every catch either re-raises, wraps with `from err`, or handles a specific recoverable case.** No log-and-continue. (`SKILL.md § Library code rule`)
- [ ] **Every new exception class chains its cause.** Python `raise X from err`; C# `throw new X(msg, innerException)`; TS `new Error(msg, { cause: err })`; Rust `#[source]`; T-SQL `THROW;`. (`SKILL.md § Exception design`)
- [ ] **`assert` only for dev-time invariants — never for boundary or security checks.** `python -O` strips them. (`SKILL.md § Assert vs raise`)
- [ ] **No exception thrown from a constructor / `__init__` / class constructor** without a paired safe-construct pattern. (`SKILL.md § Exception design`)
- [ ] **For library code: every external SDK exception class the wrapper can encounter is named** in the wrapper's docstring / header comment AND mapped to a typed error. No `except Exception` to paper over "I don't know what this throws." (`SKILL.md § Exception design`)
- [ ] **The module declares whether it favors correctness or robustness** when the two would conflict. (`SKILL.md § Robustness vs correctness`)
- [ ] **User-facing message ≠ developer log message.** Internal class names, stack frames, and SQL fragments do not leak to the user. (`SKILL.md § Exception design`)

### Retry / timeout / idempotency

- [ ] **Every retry has both a count bound and a wall-clock bound.** (`SKILL.md § Retry/backoff/timeout`)
- [ ] **Retry only idempotent operations.** A retried non-idempotent POST is a duplicate write. (`SKILL.md § Idempotency`)
- [ ] **Retry only transient error classes.** No retry on `400` / `401` / `403` / `404` / `422` / schema errors. (`SKILL.md § Retry/backoff/timeout`)
- [ ] **Every queue / message receiver is safe to call twice with the same message.** (`SKILL.md § Idempotency`, `by-stack-layer.md § Queue / message handler`)
- [ ] **Every external-call return value is either checked OR has a one-line comment justifying why the result is safe to discard.** (Code Complete §8.3.)

### Logging

- [ ] **Logged errors include `error_type`, `entity_id`, and `operation` as structured fields** — not f-string interpolations into a single `msg`. (`SKILL.md § Structured logging`)
- [ ] **No `WARNING` for failures that require action.** Use `ERROR` and pair with a re-raise or a return that propagates. (`SKILL.md § Log levels`)
- [ ] **No secret values in logs.** Log the secret *name* or version hash when one is required.

### Types / cleanup

- [ ] **No mutable internal collection returned from a getter** without an explicit copy or read-only view. (`SKILL.md § Defensive copying`)
- [ ] **Resources released on the failure path.** `with` / `using` / `try/finally` / `defer` / `Drop`. (`SKILL.md § Resource cleanup`)
- [ ] **Times are tz-aware UTC; durations use a monotonic clock.** (`SKILL.md § Time and date pitfalls`)

### Feature flags

- [ ] **Every new feature flag has a documented plan to enable and remove it.** Dead flags get deleted, not preserved. (`SKILL.md § Feature flags`)

### Offensive programming / debug-only checks

- [ ] **Exhaustive `match` / `switch` arms either fail-hard in dev (and log + DLQ in prod) or have an `_` arm explicitly justified.** No silent fall-through. (`SKILL.md § Offensive programming`)
- [ ] **Expensive integrity checks are gated on environment** so they run in dev / CI but not in prod. (`SKILL.md § Debug-only checks`)
- [ ] **`assert` is used only for invariants that can be stripped without changing prod behavior.** Boundary / security / load-bearing checks use `raise`. (`SKILL.md § Assert vs raise`)

### Verification

- [ ] **Every write logs the identifier of what was written** so the next session can verify. (`SKILL.md § Hard defaults`)
- [ ] **Confidence the change works comes from a test or a manual end-to-end run** — not from "the diff looks right." (Cross-ref `superpowers:verification-before-completion`.)

---

## Pre-PR (reviewer runs against the diff)

### Diff scan

- [ ] **Search the diff for `except Exception`, `catch (Exception)`, `catch (_)`, `unwrap()`, `expect(`, `as any`.** Any hit gets a comment.
- [ ] **Search the diff for `if .* is None:` / `if (!.*) return null;` / `if (.* == null)`.** Each is a candidate for "fix the type instead."
- [ ] **Search the diff for `while True:` / `while (true)` / `loop {` inside retry code.** Bound it.
- [ ] **Search the diff for `SELECT *`.** Replace with explicit columns.
- [ ] **Search the diff for new feature flags.** Demand the enable / remove plan in the PR description.

### Contracts

- [ ] **For every new function, is the return type strong enough to express success and known failure modes?** A `Project | None` collapses two cases; `Result<Project, NotFound | Unauthorized | Upstream>` keeps them. (`examples.md § 2.4`)
- [ ] **For every new external API call, has the response been parsed into a typed model?** (`SKILL.md § Hard defaults`, `by-stack-layer.md § Third-party API call`)
- [ ] **For every new write, is there an idempotency key OR is the operation provably idempotent?** (`SKILL.md § Idempotency`)

### Logs an operator would want

- [ ] **If this fails at 3 AM, can the operator find this incident in the error tracker / log aggregator?** The log line should include `entity_id`, `operation`, `error_type`, and the correlation id.
- [ ] **If the operator pages someone, will they have enough to start debugging?** No "sync failed" — that is not actionable.

### Test coverage

- [ ] **Every catch arm has a test that exercises it.** Catch arms without tests are dead code OR untested error paths — both bad.
- [ ] **Every retry path has a test that exercises both the transient-success and the exhausted-failure outcome.**
- [ ] **The test suite has at least one "dirty" test per "clean" test on each new boundary** — failure-mode tests, not just happy-path. (Code Complete §22.2 — mature teams have 5 dirty tests per clean test.)
- [ ] **Each numeric / length boundary has the three boundary tests** (`< max - 1`, `== max`, `> max + 1`). Off-by-one is the most common defect class. (Code Complete §22.3.)
- [ ] **Each new boundary has tests for each applicable "class of bad data"** — too little, too much, wrong kind, wrong size, uninitialized. (Code Complete §22.3.)

---

## Mini-checklists by layer

Pull the relevant one when reviewing a diff scoped to that layer.

### HTTP / REST handler diff

- [ ] Body parsed via Pydantic / Zod / model-binding at the route.
- [ ] No `body.field` access deeper than the entry function.
- [ ] 4xx for bad input; 5xx only for genuinely unexpected server failures.
- [ ] Auth produces a typed `Principal`; no raw `Authorization` header reads downstream.

### MCP tool diff

- [ ] Args parsed via Pydantic at the tool entry.
- [ ] Return type is a typed result, not a free-form dict.
- [ ] Error returns include a `code` field clients can branch on.

### Serverless function / queue / message handler diff

- [ ] Trigger payload parsed at the top of the function into a typed message class.
- [ ] Function is idempotent (safe to invoke twice with the same payload).
- [ ] On unrecoverable parse error, message routes to DLQ — not silently completed.

### Third-party API call diff

- [ ] Outbound: timeout, `User-Agent`, parameterized URL.
- [ ] Inbound: response parsed into a typed model.
- [ ] `429` honors `Retry-After`; `4xx` is not retried.

### Database (SQL) diff

- [ ] Explicit column list — no `SELECT *`.
- [ ] Multi-statement writes wrapped in `TRY / TRAN / CATCH / THROW`.
- [ ] `XACT_ABORT ON` if the procedure modifies multiple tables.
- [ ] Idempotency key on writes that may be retried.

### NoSQL document store diff

- [ ] Partition key supplied on every read.
- [ ] SDK exceptions branch on the status code — not caught broadly.
- [ ] ETag / `If-Match` on writes with concurrency requirements.

### Config / secret manager diff

- [ ] Single config model loaded at startup; required values fail loud if missing.
- [ ] No `os.getenv` / `process.env` reads in business logic.
- [ ] Secrets cached for the process lifetime (or refreshed on `401` / `403`); never logged.

### CLI script diff

- [ ] Required args declared on the parser; types declared.
- [ ] Exit code non-zero on any failure.
- [ ] Script-vs-library distinction respected: helpers in the script do not catch-and-swallow.

### Front-end input diff

- [ ] Server-side re-validation (client-side is UX only).
- [ ] File uploads sniffed by content, not by extension.
- [ ] User-supplied HTML constructed via a `SafeHtml` newtype that goes through the sanitizer.

---

## Self-audit script (10 minutes)

When taking over a module:

1. `grep -n "except Exception" <module>` — count occurrences; budget zero new ones.
2. `grep -n "unwrap\|expect\|as any\|catch (_" <module>` — same.
3. `grep -n "while True\|while (true)\|loop {" <module>` — find retries; verify bounds.
4. `grep -n "SELECT \*" <module>` — flag for explicit-column refactor.
5. `grep -n "os.getenv\|process.env\|Environment.GetEnvironmentVariable" <module>` — flag for config-object refactor.
6. Read the boundary functions; confirm each has a typed input model.
7. Read the public API; confirm each function's return type can express known failure modes.
8. Read the catch blocks; for each, name the specific failure being handled. "I don't know" means delete-and-let-fly.
9. `grep -n "TODO\|FIXME\|HACK" <module>` — count occurrences; surface them in the audit notes. Each is either a fix-now item or a flag-to-delete item; "leave it alone forever" is not a valid third option.
10. `grep -n "# type: ignore\|@ts-ignore\|@ts-nocheck\|#\[allow(\|pragma warning disable" <module>` — every suppressed type / lint check needs a comment justifying why. Bare suppressions become permanent over time.
11. Read the module's docstring / header: does it state which error-handling regime applies (correctness vs robustness) AND which 4xx / 5xx / domain exceptions it can produce? If not, write that paragraph; future readers will need it.

Record the result somewhere durable — the PR description or the module's audit notes.
