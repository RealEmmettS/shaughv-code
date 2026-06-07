# worked-examples.md

Full long-form walkthroughs of two real Millis bugs, one beat at a time through the Mode 2 formal protocol. The condensed versions are in `SKILL.md` § Worked examples; this file shows the diagnostic motion at each beat — the actual MCP queries, SQL, commit refs — so the next debugger can pattern-match faster.

Both examples are sourced from Mission Control tasks (CDP-27 and CDP-30.1.17) — fetch the live task descriptions via `mcp__claude_ai_Millis_CDP__get_task` if you want the canonical record.

---

## Example 1 — CDP-27: NULL `project_manager` in ProjectScorecard

> **MC task:** CDP-27 — *Fix NULL project_manager in ProjectScorecard (MDC Dallas confirmed, possibly global)*
> **Millis bug shape:** Silent data-pipeline gap
> **What allowed it:** the pipeline has no schema-agreement check between source field availability and target column existence. A source field that is missing or unmapped silently becomes a `NULL` at the consumer, with no error fired anywhere.

### Beat 1 — Stabilize

**Goal:** make the bug reproducible from a known input.

**Action:** open Theia MCP query session against the CDP read-side.

```
mcp__claude_ai_Millis_CDP__read_records \
  entity=ProjectScorecard \
  filter='{"branch": "MDC_Dallas"}' \
  limit=100
```

**Observation:** every returned record has `"project_manager": null`. The repro is stable across the 100-row sample — the column is `NULL` for the entire branch, not intermittently.

**Decision:** stable enough to proceed to *locate*. No further stabilization needed.

### Beat 2 — Locate

**Goal:** trace data flow backward from symptom to source layer.

**Action:** walk the layers between ProjectScorecard and Acumatica.

| Layer | Field name | Value for MDC Dallas |
|---|---|---|
| ProjectScorecard view | `project_manager` | `NULL` |
| IntegratedProjects | `contact` | `NULL` |
| CDP-PMProject-Thin GI (exposed columns) | *(no Contact field)* | — |
| acumatica.project_summary | `Contact` | *populated for MDC Dallas projects* |

**Cross-check:** does another GI expose this same source field successfully?

```
# Dan's OData skill — separate GI, separate code path
PMProjectsDJ.ProjectManager  →  populated for MDC Dallas projects
```

**Diagnosis:** the field exists at the source (`acumatica.project_summary.Contact`) AND is successfully exposed via a sister GI (`PMProjectsDJ`), but the CDP-PMProject-Thin GI's column list does NOT include it. Downstream `IntegratedProjects.contact` is therefore always `NULL`, and downstream `ProjectScorecard.project_manager` is therefore always `NULL`.

**Source layer:** the thin GI definition (specifically, its exposed column list). The bug is one layer down from where it first becomes visible.

### Beat 3 — Hypothesize

> "I think the CDP-PMProject-Thin GI's column-list configuration is missing the `Contact` column. The field exists in Acumatica's `project_summary` and is being read correctly by a sister GI (`PMProjectsDJ.ProjectManager`), so the data is available; the gap is structural at the thin-GI mapping layer."

The hypothesis names a single source-layer fact and an experiment that would confirm it.

### Beat 4 — Verify

**Experiment:** add `Contact` to the CDP-PMProject-Thin GI's column list in a staging environment; re-run the IntegratedProjects refresh; re-run the ProjectScorecard refresh; re-query.

```
mcp__claude_ai_Millis_CDP__read_records \
  entity=ProjectScorecard \
  filter='{"branch": "MDC_Dallas"}' \
  limit=10
```

**Result:** `project_manager` populated for every record.

**Hypothesis confirmed.** Proceed to fix.

### Beat 5 — Fix

**Source-layer change:**
- Add `Contact` (and `ProjectManager` if available) to the CDP-PMProject-Thin GI column list.
- Update the `IntegratedProjects` mapping to read from the new GI field.
- Update the `ProjectScorecard` refresh SQL if it references the column directly.

**Not the fix:** a `COALESCE(project_manager, 'Unknown')` in the consuming view. That is symptom-hacking — it would silence the visible-NULL but leave the data wrong.

**Commit discipline:** one PR for the GI change; the IntegratedProjects + ProjectScorecard refresh re-runs are deploy-time operations, not code changes.

### Beat 6 — Regression-test

- Re-query `ProjectScorecard` for `MDC_Dallas` — every row has a populated PM.
- Re-query for ALL branches — every row has a populated PM where one is assigned in Acumatica; rows where Acumatica has no Contact are correctly empty (distinguishable from the "data didn't load" failure mode if we treat empty-from-source as a typed absence).
- Run the CDP data-trust check on `ProjectScorecard` — pass.
- Re-run the next overnight ProjectScorecard refresh — populated cleanly.

### Beat 7 — Look for similar defects

**The McConnell sweep.** This bug shape is "thin GI column list omits a source field"; the question is what siblings have the same structural gap.

- **Other branches with the same root cause.** Likely (and confirmed) — the column was `NULL` everywhere, not just MDC Dallas. The MDC Dallas symptom was the most-visible because Dan was actively looking at that branch.
- **Other PM-derived columns.** Check every column in `ProjectScorecard` that is sourced from Acumatica's `project_summary.Contact` or any cross-table join through it. Each is a potential same-shape sibling.
- **Other thin GIs.** Audit every thin GI for fields that exist at source but are NOT in the GI's column list. The CDP-PMProject-Thin was missing `Contact`; how many other thin GIs are missing a column they should expose?
- **Other consumers of CDP-PMProject-Thin.** Anyone else reading from this GI's `IntegratedProjects` row should be checked for the same blind spot.

Record sweep results in MC `result_notes` (signed `— <your agent name>`) so the audit trail exists.

### Postmortem entry (for MC `result_notes`)

```
What happened: ProjectScorecard.project_manager was NULL for every MDC Dallas project (and likely every other branch).
Root cause: the CDP-PMProject-Thin GI's exposed column list omitted Contact. The field existed in Acumatica's project_summary and was readable via a sister GI (PMProjectsDJ.ProjectManager), but never flowed into IntegratedProjects.contact.
Fix: added Contact to the thin GI's column list; refreshed IntegratedProjects mapping; re-ran ProjectScorecard refresh.
Bug shape: silent data-pipeline gap (a thin-GI mapping omission).
What allowed it: the pipeline has no schema-agreement check between source field availability and target column existence. A missing field silently becomes NULL at the consumer.
Sweep: confirmed every branch was affected; audited adjacent PM-derived columns (none others affected); flagged a follow-up to audit every thin GI for source-field omissions.
Skill update: codified this shape as "Silent data-pipeline gap" in millis-bug-shapes.md so the next debugger pattern-matches in seconds.
— <your agent name>
```

---

## Example 2 — CDP-30.1.17: View-inspector type-mismatch hardening

> **MC task:** CDP-30.1.17 — *Inspector Filter — Type-Mismatch Hardening & Richer Error UX*
> **Millis bug shape:** Silent type-coercion gap (and a structural error-surface upgrade)
> **What allowed it:** the generic `500 Failed to fetch object data` error surface gave the user no way to identify which filter caused the failure, AND each type's coercion path between the shadcn filter UI → URL → API → SQL Server was implicit rather than declared.

### Beat 1 — Stabilize

**Two distinct failures triggered the fix.**

**Failure A — stale URL filter on object switch.**
1. Navigate to `https://data.theiaconstruct.com/inspector?object=ProjectsView&filters=[{"col":"source_tenant","op":"eq","val":"MDC"}]`
2. Switch the `object` selector to `RFIsView` (which has no `source_tenant` column).
3. The `source_tenant` filter persists in the URL.
4. Response: `400 Unknown column in filter "source_tenant"`.

**Failure B — type-mismatch on datetime filter.**
1. Navigate to `inspector?object=ProjectsView&filters=[{"col":"created_at","op":"gte","val":"1772344800000"}]` (epoch-ms string).
2. Response: `500 Failed to fetch object data`. (No correlation ID, no filter index, no actionable hint.)

Both are stable single-input repros.

### Beat 2 — Locate

**Layer binary search through the filter pipeline:**

| Layer | Failure A — `source_tenant` | Failure B — `created_at` epoch-ms |
|---|---|---|
| shadcn filter UI | Filter persists across object switch | Accepts arbitrary string input |
| URL state (querystring) | `[{"col":"source_tenant",...}]` | `[{"col":"created_at","op":"gte","val":"1772344800000"}]` |
| API parameter bind | Passes through as-is | Passes through as-is |
| SQL Server comparison | `WHERE source_tenant = 'MDC'` → `Msg 207: Invalid column name 'source_tenant'` | `WHERE created_at >= '1772344800000'` → `Msg 245: Conversion failed when converting the varchar value to type datetime` |
| Error surface | Generic 500 (no classification) | Generic 500 (no classification) |

**Two distinct root causes, one shared structural weakness:**

1. **Stale filter on object switch.** The UI doesn't prune filters against the new object's schema. The URL is the source of truth, but no layer validates it against the current object before binding.
2. **Type-coercion gap on datetime.** The API parameter bind passes the epoch-ms string through to SQL Server, which has no implicit coercion from `varchar('1772344800000')` to `datetime`. (And the same shape exists across 11+ SQL types: time, bit, bigint, decimal, uniqueidentifier, text/ntext, xml, hierarchyid, etc.)
3. **Structural amplifier.** The error surface returns generic 500s without a `filter_index` or correlation ID, so the user cannot identify WHICH filter is bad. Even when they remove the offending filter manually, they have no signal which one to remove.

### Beat 3 — Hypothesize

Two hypotheses, addressed as a single fix because they share the error-surface upgrade:

> **H1:** "Each of the 11+ SQL types accepting filter input has a silent coercion gap at one or more of the three boundaries (client coercion, API bind, SQL compare). The fix requires per-type hardening at each boundary AND a typed-error surface that names the boundary that rejected."
>
> **H2:** "The generic 500 error surface is the structural amplifier. Classifying SQL errors (245, 8114, 402, etc.) into structured 400s with `filter_index` + correlation ID + actionable hint converts the bug from 'mystery failure' to 'this filter is bad, click to remove'."

### Beat 4 — Verify

**Per-type failure enumeration.** Reproduce one bad input per type; capture the SQL error number and the API response. Build a per-type matrix:

| SQL type | Bad input | SQL error | Fix variant |
|---|---|---|---|
| `bit` | `"on"` instead of `0|1|true|false` | 245 | coerce `"true"|"false"` → `0|1` |
| `bigint` | `"abc"` | 8114 | reject non-numeric at bind |
| `decimal` | `"1.0.0"` | 8114 | reject malformed at bind |
| `datetime` | epoch-ms string | 245 | coerce epoch-ms → ISO-8601 |
| `uniqueidentifier` | `"abc"` | 8169 | reject non-GUID at bind; whitelist ops to eq/ne/is_null |
| … | … | … | … |

**Error-classification check.** Wrap the SQL call and map each known SQL error number to a structured 400 with the filter index.

Both hypotheses verified.

### Beat 5 — Fix

**Two-part ship.**

**Part 1 — Error infrastructure.**
- Classify SQL errors (245, 8114, 402, 207, …) into structured 400s with: `filter_index`, `column`, `op`, `val_preview`, `correlation_id`, `hint`.
- Rewrite the error surface — `<ErrorState>` component shows: error message, hint, correlation ID, and a "Remove this filter" action that prunes the offending filter from the URL.

**Part 2 — Per-type hardening.**
- Each of the 11+ types gets a dedicated coercion path at the API bind (e.g. `"true"|"false"` → `0|1` for bit; epoch-ms → ISO-8601 for datetime).
- Each gets an operator whitelist (e.g. GUID restricted to `eq`/`ne`/`is_null`; text restricted to `eq`/`like`).
- Client-side coercion preview in the UI so the user sees what value will be sent.

**Commit:** `b41e6d3`, shipped 2026-04-15.

### Beat 6 — Regression-test

- 44/44 vitest unit tests pass (per-type coercion, per-operator whitelist, per-error-classification mapping).
- Full CI gating green.
- Manual exercise of both original repros: Failure A and Failure B now return structured 400s with "Remove this filter" action.
- Live verification at https://data.theiaconstruct.com/inspector.

### Beat 7 — Look for similar defects

- **Other filter consumers.** Are there other UI surfaces that build URL filters → API → SQL? (Table view, inspector v2, scorecard filter chips, PSR section filters.) Each is a candidate for the same shape AND the same structural fix.
- **Other URL-state → SQL paths.** Outside of filters — sorting, pagination, group-by. Each has a similar "user input → URL → API → SQL" path with implicit coercion.
- **Other generic 500s in the codebase.** Audit for any wrapped SQL call that returns 500 on a classifiable error number. Each is a candidate for structured 400 + correlation ID.

### Postmortem entry (for MC `result_notes`)

```
What happened: View-inspector filters silently failed across 11+ SQL types with generic 500 errors that gave users no way to identify the offending filter. Two surface failures triggered the fix: stale source_tenant filter on object switch (400 "Unknown column"); epoch-ms datetime string (500 "Failed to fetch").
Root cause: silent type-coercion gaps at three boundaries (client coercion, API bind, SQL compare) — amplified by a generic 500 surface that lost the filter index.
Fix: classify SQL errors (245/8114/402/207/…) into structured 400s with filter index + correlation ID + "Remove this filter" action; harden per-type coercion at the API bind; operator whitelists per type.
Bug shape: silent type-coercion gap (and a structural error-surface upgrade that makes the next similar bug self-diagnosing).
What allowed it: generic 500 error surface hid which filter fired; each type's coercion was implicit rather than declared.
Sweep: flagged table view, inspector v2, sort/pagination URL paths, and every wrapped SQL call returning generic 500s as same-shape audit candidates.
Skill update: codified this shape as "Silent type-coercion gap" in millis-bug-shapes.md.
— <your agent name>
```

---

## What both examples share

Read together, CDP-27 and CDP-30.1.17 are the two canonical Millis bug shapes:

- **Both were silent.** Neither bug fired an explicit error at the actual cause layer. CDP-27 fired no error at all — the symptom was the wrong value. CDP-30.1.17 fired errors but at the wrong layer (the consumer surface) without enough context to locate the actual fault.
- **Both fixes were at the source layer.** CDP-27 was fixed by adding the field to the thin GI (the source-layer omission), not by `COALESCE`-ing the NULL at the consumer. CDP-30.1.17 was fixed by hardening the API bind AND classifying the error AT the SQL boundary, not by re-rendering the 500 with prettier text.
- **Both had structural amplifiers.** CDP-27's amplifier was the missing schema-agreement check between source and target. CDP-30.1.17's amplifier was the generic 500 surface. Naming the amplifier separately from the immediate bug is what made the fix worth twice as much as the bug it solved.
- **Both shipped a vocabulary contribution.** Each one's archetype (silent data-pipeline gap; silent type-coercion gap) is now a named row in `millis-bug-shapes.md`. The next bug of either shape gets pattern-matched in seconds instead of hours.

When debugging at Millis, ask: which shape does this look like? Then run the diagnostic question from that row of the vocabulary. The locate beat collapses dramatically.

---

— Authored under DT-22, DevOps Training milestone 2 (Millis Dev Skill Library). Talos.
