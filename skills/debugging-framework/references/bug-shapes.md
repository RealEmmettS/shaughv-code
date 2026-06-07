# bug-shapes.md

The durable, reusable core of this skill — the vocabulary of bug archetypes that recur across stacks. **Pattern-matching to a known shape collapses the Mode 2 *locate* beat from hours to minutes.** When debugging, ask "which shape does this look like?" before tracing data flow byte by byte.

The SKILL.md has a 12-row summary table; this file has the long form. Each archetype: **symptom, where it tends to live, the diagnostic question that resolves it, and a real or composite example**. This file is expected to grow — when a new shape surfaces during debugging, add it here and reference it from your postmortem so the vocabulary spreads.

---

## Silent data-pipeline gap

**Symptom.** A column / field / property is `NULL`, empty, or missing in a downstream consumer. The upstream source has the data. No error fires. The consumer treats absence as a domain answer ("no owner assigned") instead of a pipeline failure ("we didn't load the owner").

**Where it tends to live.**
- ETL projection lists (`SELECT a, b, c` from a table that has `a, b, c, d` — `d` silently drops).
- Data-pipeline field mappings (a source field exists but the projected column list passed downstream omits it).
- View / refresh SQL definitions.
- API entity field lists (entity definition diverged from the underlying table).
- Typed models (Pydantic / dataclass / DTO) that don't include a field the schema has.
- TypeScript interface declarations that don't include a property the API returns.

**Diagnostic question.** "Does the field exist at every layer between source and consumer, AND is it mapped at each hop?"

**How to test.**
1. List the layers between source and consumer.
2. At each layer, query whether the field is present AND populated.
3. The first layer where it's missing is the gap.

**Real example (composite).** A `ProjectReport.owner` column was `NULL` for one tenant. The upstream source (`project_summary.Contact`) had the value. The ETL field-mapping config did not project `Contact`, so the integrated `projects.contact` column was `NULL`, so the report column was `NULL`. A separate report built on a different mapping DID surface the field, proving the data existed at the source.

**Why this shape is endemic.** Pipelines compose source extracts → integrated views → API entities → consumer dashboards. Each composition step is a manual mapping that can silently omit a field. Until "schema agreement" is automated (which is itself a `defensive-programming` candidate), this shape keeps recurring.

---

## Silent type-coercion gap

**Symptom.** Wrong value, wrong shape, or a confusing 4xx/5xx, when a value crosses a layer boundary. The original value is correct; one layer silently coerces it to the wrong type and downstream layers compare it against the *expected* type.

**Where it tends to live.**
- UI filter → URL state → API parameter bind → SQL comparison (the data-explorer class of bugs).
- JSON document → typed model (string-vs-int, ISO-string-vs-`datetime`).
- Queue message body → handler payload (every field is a `str` after a JSON round-trip).
- A third-party field where the SDK declares `int` and the API returns `string` (or vice versa).
- An API where the schema declares a type and the runtime returns a different one.
- JavaScript / TypeScript `number` vs `BigInt` when a 64-bit ID flows through `JSON.parse`.

**Diagnostic question.** "At which boundary did the type silently change, AND which boundary lost the type discriminator?"

**How to test.**
1. At each boundary, log the value AND its type (`type(x)` in Python, `typeof x` in TS, `x.GetType()` in C#).
2. The first boundary where the type doesn't match the next boundary's expectation is the gap.
3. The fix is usually at the boundary that *should* have a discriminator (a typed model, a parameterized query, a Zod / Pydantic parse) but doesn't.

**Real example (composite).** A data-explorer's filter pipeline (filter UI → URL → API → SQL) had silent coercion gaps across 11+ column types. Two distinct surface failures (a stale `tenant` filter → `400 Unknown column`; an epoch-ms string on a datetime column → `500 Failed to fetch`) shared the same shape. **Structural fix:** classify generic 500s into structured 400s with `filter_index` + correlation ID, AND harden per-type coercion (e.g. `"true"|"false"` → `0|1` for boolean, epoch-ms → ISO-8601 for datetime). See `worked-examples.md` Example 2 for the full beat-by-beat.

**Why this shape is endemic.** A typical stack spans many type systems (TypeScript ↔ JSON ↔ a backend language ↔ SQL ↔ a document store). Each transition is an implicit coercion. Until every transition has a typed model at the boundary (a `defensive-programming` rule), this shape keeps firing.

---

## Config ↔ schema drift

**Symptom.** A tool or query returns columns the config declares but the data layer doesn't expose (or vice versa). Symptoms range from `null` values to "Unknown column" errors to silently-missing rows when a filter references a column that doesn't actually exist in the data layer.

**Where it tends to live.**
- An entity/query config (YAML / JSON) vs the underlying view or table it reads from.
- A SQL view that fronts the entity, if one exists.
- Any two config surfaces that describe the same data and are edited independently.

**Diagnostic question.** "Are the config's declared columns and the data layer's actual columns byte-equal? When was each last edited?"

**How to test.**
1. Dump the config's declared column list.
2. Dump the data layer's actual column list (introspect the view/table, or read the config that defines it).
3. Diff. Mismatched entries are the bugs.
4. Check `git blame` / the data layer's audit log for the most recent edit to each — one was likely edited without the other.

**Real example (composite).** Following an entity rename, a `read_records` tool returned 0 rows for a query that should have matched ~400. Cause: the entity's primary filter column was renamed in the entity config but not in the underlying view. The query's `where` clause referenced the new name, which didn't exist in the data layer, which returned an empty result set with no error (the query engine treated an unknown filter column as a no-match, not an error).

**Why this shape is endemic.** The config and the underlying data layer are two separate surfaces, often maintained by different people (or different sessions). A naming change in one without the other is silent. A pre-deploy validator that diffs the two is the prevention side.

---

## Third-party response shape drift

**Symptom.** A field that used to be populated is now `null`, or returns the wrong type, or has a renamed key. The response still parses. The vendor changed something.

**Where it tends to live.**
- SDK responses (v1.0 vs v1.1 vs v2.0 endpoint differences).
- REST / OData responses after a vendor-side customization deploy.
- Webhook payloads after a vendor release.
- Any externally-owned response whose layout can change without your knowledge.

**Diagnostic question.** "When did the vendor last ship? Capture a response today and compare to one captured before the symptom started."

**How to test.**
1. Find a stored / logged response from before the bug.
2. Capture a response today with the same inputs.
3. Diff. The delta is the vendor change.
4. Check the vendor's changelog / release notes for the dates spanning before-symptom to now.

**Real example (composite).** A `projects/{id}/meetings` endpoint added a `meeting_topics_count` field in v1.1, removing the need for a follow-up call. Sync code written against v1.0 was still making the follow-up call AND ignoring the new field. The new field was `0` on every meeting where the follow-up call had reported topics, because v1.1 returned the count *before* topics had been linked to meetings via a new association table.

**Why this shape is endemic.** Any integration with a third-party API inherits the vendor's release cadence. Vendors ship without your knowledge. Until every external boundary has a contract test (a `defensive-programming` rule extension), this shape keeps firing.

---

## Idempotency replay

**Symptom.** Counts off by N (usually N is small, e.g. 2 or 3, matching the redelivery count). Duplicate rows. A write that landed twice. An aggregate that climbs over time.

**Where it tends to live.**
- At-least-once queue handlers (delivery is guaranteed once-or-more, not exactly-once).
- Webhook handlers (most providers replay on a 5xx).
- Serverless / function triggers with retry policies.
- Any scheduled job that doesn't have an idempotency key.
- Manual re-runs of "the sync script" because the first run "looked stuck".

**Diagnostic question.** "Is there an idempotency key on the write? Are duplicate inputs collapsed at insert (upsert), or relied on at read (deduplication)?"

**How to test.**
1. Look at the duplicated rows. Are they identical except for the auto-generated primary key + timestamps? → idempotency replay.
2. Find the write code. Is there an idempotency key? Is it the natural key, or a generated one? Is it actually used (e.g. as the primary key, or in a `WHERE` clause on the insert)?
3. Look at the source — is the input being delivered more than once? The dead-letter queue, the webhook logs, and the scheduler logs all answer this.

**Real example (composite).** A queue handler that sync'd record updates was writing each update as a new row in `record_history`. After a broker outage, the queue replayed ~2400 messages, producing ~2400 duplicate history rows. Fix: change the write to `INSERT ... ON CONFLICT (record_id, updated_at) DO NOTHING` — the natural key was `(record_id, updated_at)`, which uniquely identifies one update.

**Why this shape is endemic.** Most stacks have several at-least-once delivery surfaces (queues, webhooks, function retries). Every write that reaches one of those surfaces must be idempotent. `defensive-programming` § Idempotency is the prevention side.

---

## Timezone naivety

**Symptom.** A row appears in two days' rollups, or is skipped on a DST transition day. "Yesterday" off by one. A scheduled job that says it runs at 02:00 actually runs at 01:00 or 03:00 on DST days.

**Where it tends to live.**
- `datetime.now()` without `tz=UTC` in Python.
- `new Date()` in JS / TS without an explicit timezone.
- `DATETIME` columns without offset (a `DATETIMEOFFSET` / `timestamptz` type is the typed alternative).
- Cron expressions in local time on a server whose local time is unclear or DST-respecting.
- BI tool "today" filters that respect the viewer's locale rather than UTC.

**Diagnostic question.** "Is the timestamp tz-aware UTC end-to-end? Where does a naive datetime enter the pipeline?"

**How to test.**
1. At each timestamp boundary (write to DB, read from DB, compare in code, render in UI), check the tz-awareness.
2. Naive timestamps anywhere in the pipeline mean the pipeline silently assumes a timezone — usually the server's local — and that assumption breaks at DST or when the server moves.

**Real example (composite).** A daily report refresh ran at 02:00 server local time. The server was in `America/New_York`. On the spring DST transition, the 02:00 hour didn't exist — the refresh skipped that day. On the fall DST transition, the 02:00 hour ran twice, producing two refresh writes with the same natural key. **Fix:** schedule in UTC; convert to local time in the UI only.

**Why this shape is endemic.** Work that spans time zones, daily reporting, and DST all coexist. `defensive-programming` § Time and date pitfalls is the prevention side.

---

## Read-after-write inconsistency

**Symptom.** Just-written row is absent from a follow-up read. UI shows stale data immediately after a save. A test that writes then reads is intermittently flaky.

**Where it tends to live.**
- Cross-region database reads after a primary-region write.
- Read-replica reads (read-scale-out / always-on replicas).
- CDN cache reads after origin write.
- Globally-distributed key-value stores (eventually consistent by default).
- Any system with a primary/replica or write-through-cache architecture.

**Diagnostic question.** "Did the write and the read hit the same replica? Is there a read-your-writes guarantee on this path?"

**How to test.**
1. Confirm the write actually committed (check the underlying store, not just the API return).
2. Confirm the read is hitting the same store/replica/region as the write.
3. If not: either route the read to the primary (sacrificing read scale), use a strongly-consistent read mode, or accept eventual consistency and design the UI for it.

**Real example (composite).** A user saved a config and the UI immediately re-rendered showing the old values. The save went to the primary; the re-render read from a nearby replica that hadn't caught up. The 200ms eventual-consistency window was longer than the UI's optimistic-update polling interval. Fix: use strong consistency for the immediate re-read; relax to eventual for the next dashboard load.

**Why this shape is endemic.** Eventually-consistent stores are a common default for read-heavy persistence paths. `defensive-programming` § Distributed systems names this as an "unromantic truth" — read-after-write consistency is not free.

---

## Optional-chaining-as-skip

**Symptom.** Downstream code treats "we don't know" the same as "no value". The UI shows blank or `0` instead of an error or a loading state. The aggregate is wrong.

**Where it tends to live.**
- TypeScript / JavaScript: `entity?.contact?.email`, `data?.results?.length ?? 0`.
- Python: `getattr(entity, "contact", None)`, `(entity or {}).get("contact", {}).get("email")`.
- C# null-conditional: `entity?.Contact?.Email`.
- SQL: `ISNULL(col, 0)` or `COALESCE(col, '')` without distinguishing "real zero" from "missing".

**Diagnostic question.** "Does an absent value here mean *absence* (the domain answer) or *we failed to load this* (a pipeline failure)? Are they distinguishable downstream?"

**How to test.**
1. Find the optional-chain.
2. Construct an input that would return `undefined` / `None` / `null` at that chain.
3. Trace what downstream code does. If it treats the result as a domain value, the bug is silent.

**Real example (composite).** A dashboard section rendered "Total open items: 0" for a record that actually had 14 open items. The pipeline `data?.items?.filter(r => r?.status === "open")?.length ?? 0` had a `?.` between `data` and `items` — the `items` field hadn't loaded yet because the parallel fetch was still in flight. The fix: distinguish the loading state from the loaded-and-empty state; render a skeleton until loaded.

**Why this shape is endemic.** Optional chaining is everywhere in modern code. It is a load-bearing language feature for safe data access AND a silent-failure trap when the Operator (or Agent) writing the code treats it as "skip if missing". `pr-review-toolkit:silent-failure-hunter` flags this; the prevention side is `defensive-programming` § Null / undefined checks.

---

## Dead feature flag

**Symptom.** Code path is silently never executed. The bug is "it never worked", not "it broke". Discovered when someone tries to exercise the feature and notices nothing happens.

**Where it tends to live.**
- Old kill-switches that defaulted off.
- Per-tenant flags that flipped off for everyone during a migration and were never re-enabled.
- `if (DEBUG)` / `if (settings.ENV == "dev")` blocks shipped to prod.
- Long-lived flags whose definition has been moved or renamed, leaving the consuming code reading the wrong key (which evaluates `undefined` → falsy → off).

**Diagnostic question.** "Was this path ever actually exercised in prod? When was the flag last evaluated `true`?"

**How to test.**
1. Find the flag definition. Where is the default? Who can override?
2. Find every consumer. Is it being read correctly?
3. Check production logs / your observability tool — has the branch behind the flag ever logged anything since deploy?

**Real example (composite).** A "use new pricing engine" flag was wired into the pricing pipeline. The flag defaulted off in dev (correct, for safety) AND in prod (incorrect — should have been on for the canary tenants). Six weeks of "the new pricing isn't applying" reports were resolved by a one-line config change. **Lesson:** dead flags accumulate; the fix is the flag-lifecycle discipline in `defensive-programming` § Feature flags (kill-switch + plan to remove the flag once at 100%).

**Why this shape is endemic.** Feature flags are a load-bearing pattern for safe deploys; they are also a debt-magnet. Every flag has a half-life — after it has been at 100% for a month, it is dead code masquerading as live code.

---

## Schema drift between layers

**Symptom.** DB column exists but the model doesn't see it. Or the model has a field but the DB column was dropped. Or the migration ran on staging but not prod. Or the type changed (`int` → `bigint`) but the model still expects `int`.

**Where it tends to live.**
- Typed model / DTO definitions vs the live DB schema.
- ORM migrations not run on all envs (`alembic upgrade head` on staging, forgotten on prod).
- Document-store containers where the document shape diverged across writes.
- A TypeScript interface that mirrors a SQL view, where the view was edited and the interface was not.

**Diagnostic question.** "Run a fresh introspection of the live schema. Diff against the model. What is different?"

**How to test.**
1. For SQL: an `INFORMATION_SCHEMA.COLUMNS` query, diffed against the typed model's field list.
2. For a document store: sample 100 documents, schema-infer, diff against the model.
3. For migrations: `git log -- migrations/` vs the migration history table in each env.

**Real example (composite).** A new `created_by_user_id` column was added to a `records` table via migration `0042`. The migration ran on dev and staging. The deploy to prod skipped the migration step because the deploy script had a typo. For two weeks, the prod app threw `column "created_by_user_id" does not exist` on every record write that included it. Fix: run the migration; add a deploy gate that fails if migrations are pending.

**Why this shape is endemic.** Most projects have multiple envs (dev / staging / prod) and multiple persistence stores. Schema drift between any two surfaces silently breaks the consuming code. `defensive-programming` § Hard defaults names the boundary parse as the canonical defense.

---

## Lock-conflict masquerading as bug

**Symptom.** Intermittent failure that "works on retry". The error message names a constraint, a deadlock, or a timeout — but the user perceives the behavior as a normal-looking bug.

**Where it tends to live.**
- Database lock conflicts (especially during overnight batch windows).
- Database contention under load.
- Rate-limit (429) responses from a database or third-party API.
- File-system locks (file-in-use errors).

**Diagnostic question.** "Is the retry path swallowing the lock conflict as success? Or is the bug masquerading as transient?"

**How to test.**
1. Capture the error from the failing path — is it a lock / contention / rate-limit error, or a logic error?
2. If lock: confirm the retry policy is bounded (count + wall clock), and the retried operation is idempotent.
3. If retry is unbounded or the operation is non-idempotent: the lock conflict is the SURFACE bug; the deeper bug is the retry strategy.
4. If retries succeed but the data is wrong: the original write WAS partially committed before the lock fired, and the retry duplicated it.

**Real example (composite).** A nightly report refresh occasionally produced duplicate rows. The retry path on a 429 was double-writing because the first attempt had succeeded server-side but the client timed out before receiving the ack. **Fix:** add an idempotency key (the natural key of the refresh row) AND use upsert. The lock-conflict was a separate-but-related fix (raise the throughput ceiling).

**Why this shape is endemic.** Overnight batch windows compete for the same resources. Retries are everywhere. `defensive-programming` § Retry / backoff / timeout AND § Idempotency are the prevention pair.

---

## CI ≠ local env

**Symptom.** Test passes locally, fails in CI (or vice versa). A "works on my machine" bug.

**Where it tends to live.**
- Working directory differences (`./fixtures/data.json` vs `tests/fixtures/data.json`).
- Env var availability (CI has `CI=true`; local doesn't; some test branches on this).
- Time-of-day dependence (test relies on `datetime.now().date()` and crosses midnight).
- File-system case sensitivity (Windows / macOS are case-insensitive; Linux CI is case-sensitive).
- Locale differences (`en_US.UTF-8` vs `C` — affects number / date formatting and string sort order).
- Network availability (test makes an HTTP call; CI runner has no outbound network).
- Test runner version differences (a minor bump changed snapshot serialization).
- Parallel test execution (CI runs tests in parallel; local runs serially — test pollution surfaces).

**Diagnostic question.** "What is in this env that is NOT in the other env? Diff `env`, OS, runner image, CWD, locale, runner version."

**How to test.**
1. Reproduce the CI env locally as closely as possible — `docker run` the same image, same env vars, same working directory.
2. If the bug reproduces: it's a real env-dependent bug.
3. If the bug does NOT reproduce: it's parallel-execution pollution. Run the test suite in CI's parallel mode locally to surface.

**Real example (composite).** A snapshot test passed locally and failed in CI. The diff was a trailing newline. Cause: the local dev's editor configured `files.insertFinalNewline: true`; the snapshot file on disk had a trailing newline. CI's runner regenerated the snapshot in memory without the trailing newline. **Fix:** normalize the snapshot serializer to ignore trailing newlines.

**Why this shape is endemic.** Cross-platform development is the norm (Windows / macOS dev machines, Linux CI). Env divergence is inevitable. The discipline is to keep the divergence small and named.

---

## How to add a new shape

When you encounter a bug that doesn't pattern-match any existing shape, AND the bug is structural (not one-off), add a new entry:

1. **Name it.** Three to five words, descriptive. Mirror the existing entries' tone.
2. **Symptom paragraph.** What does the Operator (or Agent) see? What do they not see?
3. **Where it tends to live.** Which surfaces in your stack produce this shape?
4. **Diagnostic question.** The single question that, once answered, locates the bug.
5. **Real or composite example.** Anonymized if needed. The point is that the next teammate (Operator or Agent) recognizes the shape.
6. **Why this shape is endemic.** What system property allows it? Often this is also a candidate for a `defensive-programming` rule extension.

Add the entry to BOTH this file AND the summary table in `SKILL.md`. Keep them in sync.
