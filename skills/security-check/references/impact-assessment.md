# Mode C — Merge-Impact Assessment

Answers the operator's question before a push or merge: **how much of the repo
does this change actually touch, and is it several small changes or a major,
possibly-breaking one?** Runs standalone, and as the mandatory tail of every
Mode B review.

## Step 1 — Run the script

```bash
python <skill-path>/scripts/impact_stats.py --repo <repo>
```

It computes, against `merge-base(HEAD, origin/main)`:

- **Breadth** — % of tracked files touched; % of total LOC changed
- **Concentration** — churn per top-level directory (one module vs everywhere)
- **Breaking-change signals** — named, from two detectors:
  - *Path signals:* dependency manifests/lockfiles, DB schema/migrations,
    CI/CD pipelines, Dockerfiles/IaC, app config
  - *Content signals:* removed/modified exported symbols (`export
    function|const|class…`, `pub fn`, `def`/`class`), HTTP route changes,
    destructive SQL DDL (`DROP`/`ALTER TABLE`/`TRUNCATE`), dependency version
    line changes inside manifests
- A **suggested band** (see Step 2) — a suggestion; you finalize

Dirty working tree → it reports a second "including uncommitted" pass; use
that one when the question is "if we push the current changes".

## Step 2 — Apply the bands, then apply judgment

| Band | Numeric shape | Verdict line |
|---|---|---|
| **patch-like** | <2% LOC, <5% files, 0 signals | "Several small changes — low merge risk" |
| **moderate** | between the bands, 0 signals | "Meaningful but contained change — normal review" |
| **major-possibly-breaking** | ≥10% LOC, or ≥20% files, or ≥1 signal | "Major change — possibly breaking; signals listed below" |

The script can't see semantics. Override it both directions, and say you did:

- **Upgrade** a numerically-small diff when it changes behavior behind a stable
  signature: auth logic, money/financial calculations, query predicates, data
  serialization formats, anything callers depend on by behavior. A 3-line change
  to a WHERE clause in a financial view is major; the script will call it patch-like.
- **Downgrade** a numerically-large diff that is mechanically safe: generated
  code, lockfile-only churn from a clean install, formatting-only sweeps,
  vendored assets, mass renames verified by tests. Say what evidence justifies
  the downgrade (e.g. "9,000 of 9,200 changed lines are `package-lock.json`").

Per-signal judgment:

| Signal | Usually means | Breaking unless… |
|---|---|---|
| dependency-manifest | dep added/bumped | the bump is patch/minor AND lockfile-consistent; major bumps = check the changelog |
| db-schema-or-migration | schema evolves | migration is purely additive (new nullable column, new table) AND deploys before the code that needs it |
| exported-api-changed | public surface moved | all callers live in this same diff (grep for the symbol to prove it) |
| http-route-changed | endpoint contract moved | route is new, not renamed/removed; clients unaffected |
| sql-destructive-ddl | data-destroying DDL | it targets a temp/staging object — otherwise this is the headline |
| ci-cd-pipeline / container-or-iac | deploy behavior changes | change is comment/cosmetic; otherwise flag "deploy path changed — verify in staging" |
| app-config | runtime behavior changes | new key with safe default; changed/removed keys need a consumer check |

## Step 3 — The verdict block

Append to the report (and lead the chat summary with the bolded verdict):

```markdown
## Merge-impact verdict
**<patch-like | moderate | major-possibly-breaking>** — <one-sentence verdict>

| Metric | Value |
|---|---|
| Files touched | N / total (X%) |
| LOC changed | N (+a/−d) of total (Y%) |
| Churn concentration | <top dirs and their share> |
| Breaking signals | <named list, or "none detected"> |

**Signals examined:** <per signal: 1 line — what it is, breaking or defused, why>
**Band override:** <"none" | upgraded/downgraded from script suggestion because …>
**Recommendation:** <merge normally | merge with staged deploy | split the branch | hold for X>
```

## Edge cases

- **No `origin/main`** — script falls back to `main`/`origin/master`/`master`;
  if none exist, say impact can't be computed against a trunk and name what's missing.
- **Branch already merged / zero diff** — report "nothing to merge" rather than 0%.
- **Squash-vs-merge** — impact is identical either way; don't condition the verdict on merge strategy.
- **Multiple stacked branches** — assess against `origin/main`, not the parent
  branch: the operator's question is about landing on trunk.
