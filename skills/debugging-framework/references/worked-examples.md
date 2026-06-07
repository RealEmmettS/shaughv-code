# worked-examples.md

Full long-form walkthroughs of two composite bugs, one beat at a time through the Mode 2 formal protocol. The condensed versions are in `SKILL.md` § Worked examples; this file shows the diagnostic motion at each beat — the sample queries, SQL, and per-type matrix — so the next debugger can pattern-match faster.

Both examples are illustrative composites. The specifics (table names, queries, error codes) are invented to be realistic and instructive; the value is the beat-by-beat motion and the bug shape each one teaches.

---

## Example 1 — NULL `owner` in a reporting view

> **Bug shape:** Silent data-pipeline gap
> **What allowed it:** the pipeline has no schema-agreement check between source field availability and target column existence. A source field that is missing or unmapped silently becomes a `NULL` at the consumer, with no error fired anywhere.

### Beat 1 — Stabilize

**Goal:** make the bug reproducible from a known input.

**Action:** open a query session against the read-side of the data source.

```
read ProjectReport
  where tenant = "acme"
  limit 100
```

**Observation:** every returned record has `"owner": null`. The repro is stable across the 100-row sample — the column is `NULL` for the entire tenant, not intermittently.

**Decision:** stable enough to proceed to *locate*. No further stabilization needed.

### Beat 2 — Locate

**Goal:** trace data flow backward from symptom to source layer.

**Action:** walk the layers between `ProjectReport` and the upstream system.

| Layer | Field name | Value for tenant "acme" |
|---|---|---|
| ProjectReport view | `owner` | `NULL` |
| projects (integrated table) | `contact` | `NULL` |
| ETL field-mapping config | *(no Contact field)* | — |
| source.project_summary | `Contact` | *populated for "acme" projects* |

**Cross-check:** does a different report expose this same source field successfully?

```
# a separate report built on a different mapping
ProjectSummaryReport.owner  →  populated for "acme" projects
```

**Diagnosis:** the field exists at the source (`source.project_summary.Contact`) AND is successfully surfaced via a different mapping, but the ETL field-mapping config for `projects` does NOT include it. Downstream `projects.contact` is therefore always `NULL`, and downstream `ProjectReport.owner` is therefore always `NULL`.

**Source layer:** the ETL field-mapping config (specifically, its projected column list). The bug is one layer down from where it first becomes visible.

### Beat 3 — Hypothesize

> "I think the ETL field-mapping config for `projects` is missing the `Contact` column. The field exists in `source.project_summary` and is surfaced correctly by a separate report, so the data is available; the gap is structural at the field-mapping layer."

The hypothesis names a single source-layer fact and an experiment that would confirm it.

### Beat 4 — Verify

**Experiment:** add `Contact` to the field-mapping config in a staging environment; re-run the `projects` mapping; re-run the `ProjectReport` refresh; re-query.

```
read ProjectReport
  where tenant = "acme"
  limit 10
```

**Result:** `owner` populated for every record.

**Hypothesis confirmed.** Proceed to fix.

### Beat 5 — Fix

**Source-layer change:**
- Add `Contact` to the ETL field-mapping config for `projects`.
- Update the `projects` mapping to read from the new field.
- Update the `ProjectReport` refresh SQL if it references the column directly.

**Not the fix:** a `COALESCE(owner, 'Unknown')` in the consuming view. That is symptom-hacking — it would silence the visible-NULL but leave the data wrong.

**Commit discipline:** one PR for the mapping change; the `projects` + `ProjectReport` refresh re-runs are deploy-time operations, not code changes.

### Beat 6 — Regression-test

- Re-query `ProjectReport` for tenant "acme" — every row has a populated owner.
- Re-query for ALL tenants — every row has a populated owner where one is assigned at the source; rows where the source has no Contact are correctly empty (distinguishable from the "data didn't load" failure mode if we treat empty-from-source as a typed absence).
- Run the data-quality check on `ProjectReport` — pass.
- Re-run the next overnight `ProjectReport` refresh — populated cleanly.

### Beat 7 — Look for similar defects

**The McConnell sweep.** This bug shape is "field-mapping config omits a source field"; the question is what siblings have the same structural gap.

- **Other tenants with the same root cause.** Likely (and confirmed) — the column was `NULL` everywhere, not just "acme". The "acme" symptom was the most visible because someone was actively looking at that tenant.
- **Other owner-derived columns.** Check every column in `ProjectReport` that is sourced from `source.project_summary.Contact` or any cross-table join through it. Each is a potential same-shape sibling.
- **Other field mappings.** Audit every ETL mapping for fields that exist at source but are NOT projected. This one was missing `Contact`; how many others are missing a column they should expose?
- **Other consumers of `projects`.** Anyone else reading from the integrated `projects` row should be checked for the same blind spot.

Record sweep results in the PR description (or wherever the fix is tracked) so the audit trail exists.

### Postmortem entry

```
What happened: ProjectReport.owner was NULL for every "acme" project (and likely every other tenant).
Root cause: the ETL field-mapping config for `projects` omitted Contact. The field existed in source.project_summary and was readable via a separate report, but never flowed into projects.contact.
Fix: added Contact to the field-mapping config; re-ran the projects mapping; re-ran the ProjectReport refresh.
Bug shape: silent data-pipeline gap (a field-mapping omission).
What allowed it: the pipeline has no schema-agreement check between source field availability and target column existence. A missing field silently becomes NULL at the consumer.
Sweep: confirmed every tenant was affected; audited adjacent owner-derived columns (none others affected); flagged a follow-up to audit every field mapping for source-field omissions.
Skill update: codified this shape as "Silent data-pipeline gap" in bug-shapes.md so the next debugger pattern-matches in seconds.
```

---

## Example 2 — view-filter type-mismatch hardening

> **Bug shape:** Silent type-coercion gap (and a structural error-surface upgrade)
> **What allowed it:** the generic `500 Failed to fetch object data` error surface gave the user no way to identify which filter caused the failure, AND each type's coercion path between the filter UI → URL → API → SQL was implicit rather than declared.

### Beat 1 — Stabilize

**Two distinct failures triggered the fix.**

**Failure A — stale URL filter on view switch.**
1. Navigate to the data explorer at `?view=ProjectsView&filters=[{"col":"tenant","op":"eq","val":"acme"}]`
2. Switch the `view` selector to `TasksView` (which has no `tenant` column).
3. The `tenant` filter persists in the URL.
4. Response: `400 Unknown column in filter "tenant"`.

**Failure B — type-mismatch on datetime filter.**
1. Navigate to `?view=ProjectsView&filters=[{"col":"created_at","op":"gte","val":"1772344800000"}]` (epoch-ms string).
2. Response: `500 Failed to fetch object data`. (No correlation ID, no filter index, no actionable hint.)

Both are stable single-input repros.

### Beat 2 — Locate

**Layer binary search through the filter pipeline:**

| Layer | Failure A — `tenant` | Failure B — `created_at` epoch-ms |
|---|---|---|
| filter UI | Filter persists across view switch | Accepts arbitrary string input |
| URL state (querystring) | `[{"col":"tenant",...}]` | `[{"col":"created_at","op":"gte","val":"1772344800000"}]` |
| API parameter bind | Passes through as-is | Passes through as-is |
| SQL comparison | `WHERE tenant = 'acme'` → `Invalid column name 'tenant'` | `WHERE created_at >= '1772344800000'` → `Conversion failed converting the varchar value to datetime` |
| Error surface | Generic 500 (no classification) | Generic 500 (no classification) |

**Two distinct root causes, one shared structural weakness:**

1. **Stale filter on view switch.** The UI doesn't prune filters against the new view's schema. The URL is the source of truth, but no layer validates it against the current view before binding.
2. **Type-coercion gap on datetime.** The API parameter bind passes the epoch-ms string through to SQL, which has no implicit coercion from `varchar('1772344800000')` to a datetime type. (And the same shape exists across 11+ column types: time, boolean, bigint, decimal, UUID, text, JSON, etc.)
3. **Structural amplifier.** The error surface returns generic 500s without a `filter_index` or correlation ID, so the user cannot identify WHICH filter is bad. Even when they remove the offending filter manually, they have no signal which one to remove.

### Beat 3 — Hypothesize

Two hypotheses, addressed as a single fix because they share the error-surface upgrade:

> **H1:** "Each of the 11+ column types accepting filter input has a silent coercion gap at one or more of the three boundaries (client coercion, API bind, SQL compare). The fix requires per-type hardening at each boundary AND a typed-error surface that names the boundary that rejected."
>
> **H2:** "The generic 500 error surface is the structural amplifier. Classifying DB errors into structured 400s with `filter_index` + correlation ID + actionable hint converts the bug from 'mystery failure' to 'this filter is bad, click to remove'."

### Beat 4 — Verify

**Per-type failure enumeration.** Reproduce one bad input per type; capture the DB error and the API response. Build a per-type matrix:

| Column type | Bad input | DB error | Fix variant |
|---|---|---|---|
| `boolean` | `"on"` instead of `0|1|true|false` | conversion-failed | coerce `"true"|"false"` → `0|1` |
| `bigint` | `"abc"` | arithmetic-overflow / conversion-failed | reject non-numeric at bind |
| `decimal` | `"1.0.0"` | conversion-failed | reject malformed at bind |
| `datetime` | epoch-ms string | conversion-failed | coerce epoch-ms → ISO-8601 |
| `uuid` | `"abc"` | conversion-failed | reject non-UUID at bind; whitelist ops to eq/ne/is_null |
| … | … | … | … |

**Error-classification check.** Wrap the DB call and map each known DB error to a structured 400 with the filter index.

Both hypotheses verified.

### Beat 5 — Fix

**Two-part ship.**

**Part 1 — Error infrastructure.**
- Classify DB errors (conversion-failed, arithmetic-overflow, invalid-column, …) into structured 400s with: `filter_index`, `column`, `op`, `val_preview`, `correlation_id`, `hint`.
- Rewrite the error surface — an error component shows: error message, hint, correlation ID, and a "Remove this filter" action that prunes the offending filter from the URL.

**Part 2 — Per-type hardening.**
- Each of the 11+ types gets a dedicated coercion path at the API bind (e.g. `"true"|"false"` → `0|1` for boolean; epoch-ms → ISO-8601 for datetime).
- Each gets an operator whitelist (e.g. UUID restricted to `eq`/`ne`/`is_null`; text restricted to `eq`/`like`).
- Client-side coercion preview in the UI so the user sees what value will be sent.

### Beat 6 — Regression-test

- Full unit suite passes (per-type coercion, per-operator whitelist, per-error-classification mapping).
- Full CI gating green.
- Manual exercise of both original repros: Failure A and Failure B now return structured 400s with a "Remove this filter" action.
- Live verification on the data-explorer page.

### Beat 7 — Look for similar defects

- **Other filter consumers.** Are there other UI surfaces that build URL filters → API → SQL? (Table view, a second explorer surface, dashboard filter chips, report section filters.) Each is a candidate for the same shape AND the same structural fix.
- **Other URL-state → SQL paths.** Outside of filters — sorting, pagination, group-by. Each has a similar "user input → URL → API → SQL" path with implicit coercion.
- **Other generic 500s in the codebase.** Audit for any wrapped DB call that returns a 500 on a classifiable error. Each is a candidate for structured 400 + correlation ID.

### Postmortem entry

```
What happened: view-filter inputs silently failed across 11+ column types with generic 500 errors that gave users no way to identify the offending filter. Two surface failures triggered the fix: a stale tenant filter on view switch (400 "Unknown column"); an epoch-ms datetime string (500 "Failed to fetch").
Root cause: silent type-coercion gaps at three boundaries (client coercion, API bind, SQL compare) — amplified by a generic 500 surface that lost the filter index.
Fix: classify DB errors into structured 400s with filter index + correlation ID + "Remove this filter" action; harden per-type coercion at the API bind; operator whitelists per type.
Bug shape: silent type-coercion gap (and a structural error-surface upgrade that makes the next similar bug self-diagnosing).
What allowed it: generic 500 error surface hid which filter fired; each type's coercion was implicit rather than declared.
Sweep: flagged table view, a second explorer surface, sort/pagination URL paths, and every wrapped DB call returning generic 500s as same-shape audit candidates.
Skill update: codified this shape as "Silent type-coercion gap" in bug-shapes.md.
```

---

## What both examples share

Read together, the two examples are two canonical bug shapes:

- **Both were silent.** Neither bug fired an explicit error at the actual cause layer. Example 1 fired no error at all — the symptom was the wrong value. Example 2 fired errors but at the wrong layer (the consumer surface) without enough context to locate the actual fault.
- **Both fixes were at the source layer.** Example 1 was fixed by adding the field to the mapping (the source-layer omission), not by `COALESCE`-ing the NULL at the consumer. Example 2 was fixed by hardening the API bind AND classifying the error AT the SQL boundary, not by re-rendering the 500 with prettier text.
- **Both had structural amplifiers.** Example 1's amplifier was the missing schema-agreement check between source and target. Example 2's amplifier was the generic 500 surface. Naming the amplifier separately from the immediate bug is what made the fix worth twice as much as the bug it solved.
- **Both shipped a vocabulary contribution.** Each one's archetype (silent data-pipeline gap; silent type-coercion gap) is now a named row in `bug-shapes.md`. The next bug of either shape gets pattern-matched in seconds instead of hours.

When debugging, ask: which shape does this look like? Then run the diagnostic question from that row of the vocabulary. The locate beat collapses dramatically.
