---
name: defensive-programming
description: Use when writing or reviewing Millis code at a system boundary (HTTP handler, MCP tool entry, Procore call, SQL row hydration, Service Bus message, Azure Function trigger, Cloudflare Worker fetch, CLI parse, config load), when authoring or critiquing a try-except block, when designing an error contract, when adding retry-backoff or timeout logic, when adding a feature flag as a safety net, when reviewing a diff that introduces null-checks or AssertionErrors, or when a code review surfaces broad exception swallowing, silent fallback behavior, or validation duplicated across internal layers. Tightens what "defensive" means at Millis so the codebase gets the safety without the noise.
---

# defensive-programming

## Overview

Defensive programming at Millis means **validate at the boundary, fail loud not silent, push invariants into types**. It does NOT mean broad `try/except`, null-checks for impossible nulls, log-and-continue fallback chains, or validating the same shape in every internal layer. The first kind of code prevents bugs; the second kind hides them and bloats diffs.

This skill is the Millis-calibrated guide. It is the authoring mirror of the `silent-failure-hunter` review agent: same stance, applied before the code is written instead of after.

Defensive programming is the *second* line of defense. The first is not inserting the bug — TDD, types that make illegal states unrepresentable, code review, and pseudocode-first authoring catch more bugs than defensive code ever will. Code Complete 2e §8.1 puts it bluntly: *"The best form of defensive coding is not inserting errors in the first place."* This skill assumes that line of defense is also active; defensive programming closes the gaps the first line leaves open.

## When this skill applies

Invoke this skill (or follow its rules from memory) at any of these moments:

- Writing code at a **system boundary** — HTTP handler, MCP tool entry, Procore API call, Azure SQL row hydration, Cosmos DB write, Cloudflare Worker fetch, Service Bus or Event Grid message, Azure Function trigger, CLI argument parse, config/env load.
- Authoring or reviewing a **`try`/`except`** (Python), **`try`/`catch`** (TS, C#, JS), **`Result<T,E>` `?`** (Rust), or **`TRY ... CATCH ... THROW`** (T-SQL) block.
- Designing an **error contract** for a function, module, or API.
- Adding **retry / backoff / timeout** logic.
- Adding a **feature flag** as a safety net.
- Reviewing a diff that introduces **null-checks**, `AssertionError`s, or new validation logic.
- A code review surfaces **broad exception swallowing**, silent fallback, or duplicated validation.
- Anything `silent-failure-hunter` would flag — write the right code the first time.

Skip this skill for: throwaway scripts that will never run again; one-off data inspections; pure UI styling work with no I/O.

## The four rules

These are the load-bearing principles. Every other section restates one of them in a more specific shape.

| # | Rule | Why it matters |
|---|---|---|
| 1 | **Validate at the boundary, not in the middle.** | External input is hostile until proven typed; internal callers are trusted by contract. Validating the same shape in six layers hides which layer is actually wrong and bloats diffs. |
| 2 | **Fail loud, not silent.** | A broad `except Exception:` that logs and returns `None` is a debugging trap. Either handle a *specific, expected* error or let it propagate. |
| 3 | **Make illegal states unrepresentable.** | A type that cannot be wrong is stronger than a runtime check that pretends to handle it. See `pr-review-toolkit:type-design-analyzer` for the review-side mirror. |
| 4 | **Verify the side-effect actually landed.** | Defensive code does not replace verification. A write that returned `200` is not a write that was committed; a queue `send()` that returned is not a message that was processed. See `superpowers:verification-before-completion`. |

**Violating the letter of these rules is violating the spirit.** "I caught a narrower-than-Exception class so the rule does not apply" is a rationalization — see `references/anti-patterns.md`.

## Hard defaults

These apply to every Millis change unless explicitly overridden in the task description or PR. Explicit overrides win; defaults are the starting point.

- **Every external input gets a typed model at the boundary.** Pydantic in Python, Zod in TypeScript, `serde` in Rust, DTOs in C#, parameterized queries in SQL.
- **Every external call gets a timeout.** No exceptions. Network calls without a deadline are how production systems get held hostage by a slow third party.
- **Every retry has a bound** — count AND total wall-clock — and logs the final failure at `ERROR`.
- **Every catch is specific.** Bare `except:`, `except Exception:`, `catch (Exception)`, `catch (Throwable)`, `catch (_)` are forbidden in library code unless followed by a re-raise.
- **Every library-code catch re-raises or wraps.** Code that will be imported never decides policy for its caller.
- **Every write returns or logs the identifier of what was written**, so verification has something to look up.
- **Logging passes context as fields**, not as f-string interpolations into a `msg`. Structured logs are searchable; concatenated strings are not.

## Input-handling response matrix

When external data is malformed, there are four canonical responses (Code Complete §8.1). Pick deliberately; do not default to the first one that comes to mind.

| Response | When it applies | Example at Millis |
|---|---|---|
| **Garbage in, garbage out** | Never. Mark of a sloppy, nonsecure program. | — |
| **Garbage in, nothing out** | The caller can interpret "no result" as a domain-meaningful absence. | `read_record(entity, id)` returns `None` for "not found." |
| **Garbage in, error message out** | User-facing input; the user can correct it. | HTTP 422 with a typed body; MCP `ToolResult.error` with a `code`. |
| **No garbage allowed in** | Validate at the boundary and reject before any processing happens. | Pydantic / Zod / DTO parse-and-raise at the entry function. |

The Millis default is **no garbage allowed in** — parse-and-raise at every boundary. The other two are exceptions, used only when the contract is explicit. "Garbage in, garbage out" is never acceptable.

## Boundary vs interior — where validation belongs

A boundary is any place data crosses a trust line. Interior is everything that stays inside an already-validated trust line.

| Layer | Treat as | What goes here |
|---|---|---|
| HTTP / API handler entry | Boundary | Parse + type-check + reject malformed early. Return 4xx with an actionable message. |
| MCP tool entry function | Boundary | Same as HTTP — validate the args dict against a Pydantic/Zod schema before doing anything. |
| Azure Function trigger | Boundary | The trigger payload is external. Validate before passing into any internal helper. |
| Cloudflare Worker `fetch()` handler | Boundary | Same as HTTP. |
| Service Bus / Event Grid handler | Boundary | The message is from another process and may be malformed, replayed, or out-of-order. Validate, then process. |
| Procore / Acumatica / external SaaS response | Boundary | Untrusted. Even a `200` may have a wrong shape. Parse into a typed model. |
| Azure SQL row → typed model | Boundary | The schema can drift. Hydrate into a dataclass/interface that asserts the shape. |
| Config / env var load | Boundary | Validate at process start and crash loud if a required value is missing. Never silently default. |
| Secret read (Key Vault) | Boundary | Same as config — fail fast at start. |
| Private helper inside a service | **Interior** | Trust the typed inputs. No null-checks for `None`-impossible-by-contract. |
| Internal module-to-module call | **Interior** | Same — the type signature is the contract. If it lies, fix the type. |

See `references/by-stack-layer.md` for the full Millis stack and per-layer validation patterns.

## Error contracts

Decide what each error *means* before choosing how to handle it.

| Situation | Use | Do not use |
|---|---|---|
| Expected, recoverable failure (network 503, lock conflict, rate limit) | Narrow `except SpecificError:` with bounded retry + final-failure log at `ERROR` | Bare `except:` / `except Exception:` |
| Impossible-given-contract condition (internal invariant violated) | `assert` (dev-time) or raise `AssertionError` / a custom invariant error | Returning `None` and hoping a downstream caller notices |
| Unrecoverable bug (data corrupt, invariant broken) | Raise; let it bubble to the top-level handler that logs to Sentry / App Insights | Swallow + continue |
| User-facing input is bad | Raise a domain `ValueError` with an *actionable* message; return 4xx at the boundary | 500 with a raw stack trace; silent default |
| Third-party API returns success but with a wrong shape | Parse into typed model; on parse failure raise a wrapping error with context | Treat the raw dict as truth |
| The write may have partially succeeded | Verify by reading back, or use an idempotency key and retry | Assume success because the call returned |

## Robustness vs correctness

Two competing design priorities (Code Complete §8.3). Naming which one a given module favors is a *project-level* decision, not a per-routine one.

| Priority | Meaning | When to favor it |
|---|---|---|
| **Correctness** | Never return a wrong answer. Returning *no* answer is better than returning a wrong one. | Procore meeting sync, financial calculations, scorecard math, anything that becomes a system of record. |
| **Robustness** | Always keep operating. An approximate answer is better than no answer. | Status dashboards, log render, UI auto-refresh, anything where a momentary glitch is preferable to a blank screen. |

The radiation-machine example (Code Complete §8.3) is the canonical correctness case: a wrong dosage is catastrophically worse than no dosage. The word-processor example is the canonical robustness case: a fraction of a stray line is better than the editor crashing mid-paragraph.

**Millis default:** correctness for write paths, robustness for read-only render paths. Document the choice in the module's docstring / header comment when it deviates.

## Exception design

- **Specific types over flag fields.** `RateLimitError` and `ValidationError` are easier to catch narrowly than `ApiError(kind="rate_limit")`.
- **Chain causes.** Python: `raise WrapperError("context") from original`. C#: pass `innerException`. JS: `new Error("context", { cause: original })`. Rust: `thiserror` with `#[source]`. SQL: `THROW` propagates the original `ERROR_NUMBER()`.
- **Include the operation and identifiers in the message.** `"Procore meeting sync failed for project_id=4521, meeting_id=2024-XX"` beats `"Sync failed"`.
- **No empty catch blocks. Ever.** If catching to suppress is intentional, document the specific reason in a one-line comment AND log at `WARNING` AND limit the suppressed type as narrowly as possible.
- **No exceptions thrown from constructors / `__init__` / class constructors** without a paired safe-construct pattern (Code Complete §8.4). C# constructor exceptions skip `Dispose`; Python `__init__` exceptions skip `__del__`; TS class constructor exceptions skip the new object's setup. Construct cheaply; do the work in an `initialize()` / `start()` method that can be wrapped in `try/finally`.
- **One project-scoped exception base class.** Each Millis service has a `MillisError` (or `<Service>Error`) base so the top-level handler catches and logs uniformly without `except Exception`. The base carries the standard structured fields (`correlation_id`, `operation`, `entity_type`, `entity_id`); subclasses add domain context.
- **Library-code wrapper documents its exception types.** When adopting a new external library (Procore SDK, Acumatica client, a fresh Cosmos SDK release), the wrapper module names the specific exception classes the library can raise — in a one-paragraph header comment AND in the typed re-raise. "I don't know what this throws" gets resolved by prototyping, not by `except Exception` (Code Complete §8.4: *"Know the exceptions your library code throws"*).
- **User-facing message ≠ developer-facing message.** The exception's `message` is for the developer log; the user-facing string is constructed at the outermost layer, localized, and never leaks internal class names or stack frames (Code Complete §8.7).
- **Application code handles locally when it can; library code propagates.** A handler at the top of a request can catch a typed error, log it, and render an error page. The repository function it called must not — that decision belongs to the handler.

## Assert vs raise

| Use | When |
|---|---|
| `assert` | Internal invariant the *author* believes can never fail. Dev-time safety net. |
| Raise a domain error | The *caller* might legitimately produce this condition. Production-load-bearing. |

**Gotcha:** `python -O` strips `assert` statements. Never use `assert` for:
- Security checks
- Boundary validation
- Anything the production runtime depends on

For those, raise.

### Asserts must crash

Code Complete §8.6: *"Make sure asserts abort the program. Don't allow programmers to get into the habit of just hitting the Enter key to bypass a known problem."*

In Python this is the default. In C# / TS, never wrap `Debug.Assert` / `console.assert` in a try/catch that swallows it. In code review, an assert that is recovered-from by the caller is the assert being misused as error handling — convert it to a `raise`.

### Belt and suspenders — when both are warranted

Code Complete §8.2 makes the case for highly robust, long-lived code: *assert* the invariant AND *handle* the error if the assert fails anyway. The reasoning: large codebases evolve over years, contributors come and go, parts of the system get rewritten under deadline pressure, and the assumption encoded today may not hold next quarter.

Apply this pattern in Millis code when:
- The invariant is load-bearing for a sync operation that runs unattended (Procore sync, scorecard recompute, CDP rollups).
- The code path is rarely-exercised — annual fiscal close, year-end Procore reset, schema migration.
- The cost of a wrong answer in production is high *and* there is a sensible degraded behavior available.

Skip it for hot paths where the assert-and-handle pair would add measurable cost.

## Null / undefined checks

Only at the boundary, only for genuinely optional fields. Inside, trust the type.

- ❌ Checking a parameter is `not None` immediately before the type signature says `str` — the signature is a lie or the check is a lie. Fix the type.
- ❌ Optional-chaining (`?.`) the same path five times in one function — pull the `None` check up to one place, narrow the type, then trust it below.
- ✅ Validating at the boundary that an optional field has a value before treating it as required.
- ✅ Using a discriminated union / `Result` / `Optional[T]` and pattern-matching once at the entry point.

Prefer types that cannot be wrong. See `pr-review-toolkit:type-design-analyzer`.

## Log levels — what each one means

| Level | Means | Pair with |
|---|---|---|
| `DEBUG` | For the author during local dev. Never load-bearing. | — |
| `INFO` | Normal operation milestones an operator might audit. | The identifier of what was touched. |
| `WARNING` | Degraded but functioning. Humans do not need to act *right now*. | The degraded path being taken and why. |
| `ERROR` | Something failed that an operator must see. | A re-raise OR a return that propagates the failure. Never an `ERROR` log followed by silent recovery. |
| `CRITICAL` | System integrity at stake (data loss imminent, sync broken, queue dead-lettered). | A page or a Sentry / App Insights alert. |

**A log line is not a substitute for surfacing the error.** Logging-and-continuing is silent failure with extra steps.

## Offensive programming

Code Complete §8.6 (citing Howard and LeBlanc 2003): *"Sometimes the best defense is a good offense. Fail hard during development so that you can fail softer during production."*

The dev / prod regimes are different, and the difference is design, not accident:

| Regime | Behavior on detected anomaly |
|---|---|
| **Dev / CI / staging** | Crash loudly. Assert. Halt the test suite. Refuse to start. Page the developer. |
| **Prod** | Surface the failure to the operator — log at `ERROR`, dead-letter the message, return 5xx with a correlation id — *without* taking the whole system down for other users / tenants / requests. |

Practical applications at Millis:
- **Switch / match exhaustiveness:** in dev, the `default:` arm asserts. In prod, it logs at `ERROR` and routes the work to a DLQ.
- **Schema mismatch on a Procore response:** in dev, raises and halts. In prod, the offending record is logged with full payload and the batch continues with the rest (only if the module favors *robustness*; see § Robustness vs correctness).
- **Internal invariant checks:** assert in dev (stripped or no-op in prod). For invariants that *must* hold in prod, raise — never both-default-and-continue.

The mistake to avoid: a single setting that softens everything in prod, including failures that should still surface loudly. Soften the *response* (don't crash the worker), not the *detection* (do still log + surface).

## Debug-only checks

Some defensive code belongs in dev and should be stripped, disabled, or no-op'd in production (Code Complete §8.6 — §8.7).

| Check | Dev | Prod |
|---|---|---|
| Cheap invariant (`assert x > 0`) | On | On (Python keeps; Rust `debug_assert!` strips in release) |
| Expensive integrity loop ("walk the whole graph every tick") | On | Off — measure and gate behind a flag |
| Crash-on-unknown-variant in a `match` | On (crash) | Off (log + DLQ; see § Offensive programming) |
| "Pretty-print the whole document on every keystroke" trace | On | Off |
| Structured-logging breadcrumb (`logger.info("step complete", extra=...)`) | On | **On** — these aid prod debugging |
| Graceful-crash code (catches an unrecoverable error, drains queues, logs final state, exits) | On | **On** — Mars Pathfinder case (Code Complete §8.7) |

Implementation in the Millis stack:
- **Python:** gate expensive checks on `if settings.environment != "prod":` or on a feature flag.
- **TS:** gate on `process.env.NODE_ENV !== "production"`.
- **Rust:** use `debug_assert!` for invariants stripped in release.
- **C#:** use `Debug.Assert` (compiled out in Release) for stripped invariants; use `Trace.Assert` for kept-in-prod invariants.

The lifecycle discipline is the same as feature flags: every debug-only check has a stated reason. If the reason no longer holds, remove the check rather than leaving it on indefinitely.

## Structured logging

Always log as structured fields, not interpolated strings:

- ❌ `logger.error(f"sync failed for {project_id}: {err}")`
- ✅ `logger.error("sync failed", extra={"project_id": project_id, "error_type": type(err).__name__, "error_msg": str(err)})`

The standard Millis log envelope includes: `operation`, `entity_type`, `entity_id`, `correlation_id`, `attempt`, `duration_ms`, `error_type` (when applicable).

## Retry / backoff / timeout

Defense, not denial. Rules:

1. **Retry only idempotent operations.** A non-idempotent `POST` retried after a timeout may have committed and is now duplicated.
2. **Retry only transient classes.** Network errors, lock conflicts, rate limits, 5xx — yes. `400`, `401`, `403`, `404`, `422`, schema errors — no, the next attempt fails the same way.
3. **Bound retries by count AND total wall clock.** "Three retries" without a wall-clock bound can hang for an hour if each attempt takes 20 minutes.
4. **Jitter the backoff.** Synchronized clients retrying on the same multiplier create a thundering herd.
5. **Log the final failure at `ERROR`.** Silent give-ups are silent failures.
6. **Every external call gets a timeout.** No call without a deadline. Default: 10s for synchronous user-facing paths, 60s for background jobs, never `None`.
7. **Cancellation propagates.** Use `CancellationToken` in C#, `AbortSignal` in TS/JS, `asyncio.timeout()` in Python, `tokio::select!` in Rust. Do not catch the cancellation and swallow it.
8. **Consider a circuit breaker** when a dependency is sustained-down — retrying forever amplifies the outage. Open the circuit, return a typed `DependencyDown` error, log, and let upstream decide.

## Idempotency

At-least-once delivery is the rule, not the exception. Service Bus, Event Grid, SQS, Procore webhooks — all redeliver. Design every write to be replayable.

- **Idempotency key:** include a stable key in the write (event id, correlation id, hash of the inputs). On duplicate, check-and-skip.
- **Upsert over insert** when the natural key is known.
- **Mark-then-act:** mark the work as `in_progress` in a transaction, then act, then mark `done`. On retry, skip work already marked `done` and resume work marked `in_progress`.

## Concurrency

- **Race conditions are silent failures by default.** If two writers can touch the same row, optimistic concurrency (compare-and-set, version column) beats a `SELECT then UPDATE`.
- **Pessimistic locks** for narrow critical sections only. Hold them as briefly as possible. Always set a lock timeout.
- **No shared mutable state across threads / tasks without a primitive.** `asyncio.Lock`, `tokio::sync::Mutex`, `lock` in C#, `SemaphoreSlim` for bounded concurrency.
- **Deadlock avoidance:** always acquire locks in the same global order; release in reverse.

## Resource cleanup

Cleanup happens on the failure path too, or it does not happen.

| Language | Pattern |
|---|---|
| Python | `with ... as ...:` (context manager) or `try/finally` |
| TS / JS | `try/finally`; for async resources, `using` (TC39 stage 4) or explicit close-in-finally |
| Node | Same as JS, plus stream `'error'` handlers — un-handled stream errors crash the process |
| C# | `using` declaration; `IAsyncDisposable` for async |
| Rust | `Drop` is automatic — design types so cleanup is in `Drop` |
| Go | `defer` immediately after acquisition |
| SQL | Wrap multi-statement writes in `BEGIN TRAN / COMMIT / ROLLBACK` inside `TRY/CATCH` |

## Feature flags — defense or fig leaf?

| Use case | Verdict |
|---|---|
| Kill-switch for a risky path so it can be turned off in seconds | ✅ Defense |
| Canary / dark-launch a query rewrite or new sync path | ✅ Defense |
| Per-tenant disable for a feature that is broken in one customer's data | ✅ Defense |
| Wrapping unfinished code so it can ship "off" — but it is untested under load | ⚠ Conditional — only if there is a plan to turn it on and remove the flag |
| Wrapping code that has no spec, no tests, and may never be enabled | ❌ Fig leaf. Delete the code; do not flag it. |
| Long-lived flag that has been on for everyone for 6 months | ❌ Delete the flag. Dead flags accumulate; each one is a branch in everyone's mental model. |

## Library code rule

Code that *will be imported* never swallows exceptions silently. If it catches, it re-raises or wraps with a chained cause. The caller decides policy.

- Python: `raise WrapperError("context") from original`
- C#: `throw new WrapperException("context", innerException);`
- TS / JS: `throw new Error("context", { cause: original });`
- Rust: return `Err(WrapperError::from(original))` or `?` to propagate
- SQL: `THROW;` inside `CATCH` to re-raise the active error

A library that logs and returns `None` on error pretends to succeed. Callers cannot tell the difference between "no result" and "something blew up." See `references/anti-patterns.md` for the rationalizations this rule kills.

## Defensive copying

Returning a reference to a mutable internal collection means a caller can mutate the inside of the object holding it. If immutability is intended:

- Python: return a `tuple` (not `list`), `frozenset` (not `set`), or copy via `list(...)`
- C#: return `IReadOnlyList<T>` / `ImmutableArray<T>`
- TS: type as `readonly T[]` and freeze with `Object.freeze` if cross-realm
- Rust: pass by `&[T]` (slice) rather than `Vec<T>`

Most Millis bugs in this category come from accidentally-shared dicts/lists. The fix is at the type, not at the consumer.

## Time and date pitfalls

- **Always use `datetime` with `tzinfo=UTC`.** Naive datetimes are a silent failure waiting for DST.
- **Compare durations with a monotonic clock.** `time.monotonic()` (Python), `Stopwatch` (C#), `performance.now()` (TS), `Instant` (Rust). Wall clock can move backwards (NTP correction).
- **Persist times as UTC ISO-8601 with offset.** Local-time strings in DB columns are a contract violation.
- **Schedule windows respect DST.** "Every day at 02:00 America/New_York" is two-or-zero-or-one occurrences on DST transition days. Decide explicitly.

## Distributed systems — the unromantic truths

- The network is not reliable. Plan for partial failure (the call returned an error and the write also committed).
- Clocks are not in sync. Do not order events by client timestamp.
- "Exactly-once" delivery does not exist at the transport layer — build idempotency into the receiver.
- A retry that arrives at a different replica may see stale state. Read-after-write consistency is not free.

These are not paranoia — they are the assumptions Azure SQL, Service Bus, Cosmos DB, Procore, and Cloudflare's edge already publish about themselves. Coding against them is defensive; coding *as if* they did not exist is the actual exposure.

## Common pitfalls

| Mistake | Fix |
|---|---|
| `except Exception:` that logs and returns `None` | Narrow the type; on the broad case, re-raise. |
| `try/except` in library code that suppresses without re-raising | Re-raise with `from err` or wrap and re-raise. Library code does not decide policy for its caller. |
| Validating the same shape in three internal layers | Validate once at the boundary; trust the type below. |
| `assert` used for boundary or security checks | Raise instead. `python -O` strips asserts. |
| Logging an error then continuing with a default | Surface or re-raise. Log + continue = silent failure. |
| Retry without a wall-clock bound | Add a max total duration. |
| Retry on a `400` / `404` / `422` | Those are not transient; retrying just multiplies the failure. |
| `try/catch` that catches `Exception` then re-throws as a `RuntimeException` losing the cause | Preserve the cause: `throw new X(msg, cause)`. |
| Returning a mutable internal list from a getter | Return a copy or a read-only view. |
| Naive datetimes / local timestamps in DB columns | Always tz-aware UTC. |
| Feature flag wrapping unfinished code with no enable plan | Delete the code; ship when ready. |
| `Promise` rejection swallowed by missing `.catch` / `await` | Always `await` (or chain `.catch`). Unhandled rejections are silent failures. |
| `catch (e: any)` in TypeScript | Use `catch (e: unknown)`; narrow with `instanceof` before using. |
| `.unwrap()` / `.expect()` in Rust library code | Return `Result<T, E>` and propagate with `?`. |
| `SELECT *` followed by positional row access | Name the columns; let SQL schema drift fail loud. |
| Procore (or any external) response trusted without parsing | Parse into a typed model; fail on shape mismatch. |
| Bare `BEGIN TRAN` with no `TRY/CATCH/ROLLBACK` | Wrap; on error `ROLLBACK` then `THROW`. |
| Dead feature flag (on for everyone for months) | Delete it. |
| Null-check immediately following a parameter typed non-nullable | Either the type or the check is a lie. Fix the type. |
| Catch + log without including `error_type` and `entity_id` as structured fields | Add the fields. Stringified errors are unsearchable. |
| Function return value is ignored — caller doesn't check for error | Either check OR add a one-line comment justifying why the result is safe to discard (Code Complete §8.3: *"check it anyway"*). |
| Status field is `bool` (`is_synced`) when the domain has three+ states | Use an enum / discriminated union. Booleans turn into bugs the moment a third state appears (Code Complete §5.3 "Status variables"). |
| `assert some_function_with_side_effects()` — stripped asserts strip the side effect | Run the function first, assign the result, then assert the variable (Code Complete §8.2). |
| Exception thrown from a constructor / `__init__` / TS class constructor without local catch | Construct cheaply; raise from a separate `initialize()` / async factory method. |
| New parameter (or new field on a typed model) is unused | Remove it. Unused parameters correlate with higher error rates (Code Complete §7.5, citing Card et al. 1986). |
| Compiler / typechecker / linter warning suppressed without an inline comment | Read it. The compiler usually knows. If the suppression stands, document why at the site (Code Complete §33.4). |
| Internal error class name leaks to the user (`"InternalError: KeyError 'project_id'"`) | Map to a user-facing message at the outermost layer; log the internal name + stack for the developer. |
| Stringly-typed value (`"FP-2026-05"`, `"PROJ-1234"`, `"USD"`) carried past the entry function | Parse to a typed value object once at the boundary (Code Complete §8.5). See `examples.md §0.5`. |

## Reference files

For depth, examples, and self-review tools:

- **`references/examples.md`** — Do/don't code pairs across Python, TypeScript / JavaScript / Node, Rust, C# / .NET, SQL, plus cross-language pseudo-code. Pull when implementing in a specific language.
- **`references/by-stack-layer.md`** — Per-Millis-layer boundary rules (HTTP, MCP, Azure Function, Cloudflare Worker, Service Bus, Procore call, Azure SQL row, Cosmos DB, config, secret). Pull when designing a new boundary surface.
- **`references/anti-patterns.md`** — The rationalization gallery. Two-column table: what authors say to justify defensive bloat, and the rebuttal. Pull during PR review or when an author pushes back on a defensive-programming critique.
- **`references/checklist.md`** — Pre-commit (author) and pre-PR (reviewer) self-review checklist, copy-pasteable into a PR template.

## Cross-references

- `pr-review-toolkit:silent-failure-hunter` — the review-side mirror of this skill. Same stance, applied after the diff is open.
- `pr-review-toolkit:type-design-analyzer` — push invariants into types so the runtime check becomes unnecessary.
- `pr-review-toolkit:code-reviewer` — general code review; this skill scopes to defensive-programming concerns.
- `superpowers:systematic-debugging` — what to do *when* something fails loudly. Defensive design surfaces the failure; debugging methodology finds the root cause.
- `superpowers:verification-before-completion` — defensive code does not replace verifying the side-effect landed.
- `superpowers:test-driven-development` — the strongest defense against regressions is a failing test before the fix.
- `mission-control-checkins` — log a deliberate non-defensive trade-off (e.g., "skipped retry on this one-shot script") in `result_notes` so the call is recoverable later.
- `naming-conventions` (DT-28) — error class names follow the Millis naming standard.
- `millis-data-access-patterns` (DT-41) — for data-access-specific defensive rules (CDP MCP vs direct SQL, verify-after-write checklist). This skill links there rather than duplicating.

## Sign-off

This skill exists because Millis code historically over-defended (broad catches, log-and-continue, redundant validation) and that pattern hid the bugs it was meant to prevent. Tightening the meaning of "defensive" — boundary validation, fail-loud, types-not-runtime-checks, verify-after-write — is how the codebase gets the safety without the noise.

When a defensive choice contradicts a rule here, document it in the PR description AND in `result_notes` on the related Mission Control task. The rules above are the default; deliberate exceptions are fine when stated and reviewed.

**Error-handling policy is a project-level decision, not a per-routine one** (Code Complete §8.3). A Millis service that mixes raise-and-let-fly with return-error-codes with log-and-continue is a service no one can debug. Each repo's `CLAUDE.md` (or `README.md`) should pin the convention: which kinds of failure raise, which return a typed result, which return `None`, which log and continue. The rules above are the *default* convention; deliberate deviations are fine when stated.

**Character prerequisite.** Fail-loud defensive coding requires intellectual honesty (Code Complete §33.4). Refusing to suppress a compiler warning without understanding it, refusing to "just compile and see if it works," and refusing to silently swallow an exception are character habits, not technical skills. The skill teaches the techniques; the habits are what make the techniques stick.

— Authored under DT-29, DevOps Training milestone 2 (Millis Dev Skill Library). Talos.
