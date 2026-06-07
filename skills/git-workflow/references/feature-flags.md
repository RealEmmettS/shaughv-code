# Feature Flags

## Why flags exist in TBD

Feature flags are how you commit half-done work to trunk without exposing it
to users. They're the mechanism that makes "always release-ready trunk"
possible even when work-in-progress exists.

Without flags, you'd either (a) keep long branches (anti-TBD), or (b) ship
broken half-features. Flags give you the third path: ship the code, hide
the behavior.

## When to add a flag

- The change is partial — you're committing milestone 1 of 3
- The change is risky — you want to be able to turn it off fast in prod
- The change is being A/B tested or rolled out gradually
- You want the code on trunk for refactoring/integration reasons but the
  feature isn't ready for users

## When NOT to add a flag

- Trivial changes (typo, minor refactor)
- Bug fixes — those should just go in
- Anything where the "off" path costs more than the change is worth

## Flag mechanism for internal tools

For a 2-person internal-tools team, you don't need LaunchDarkly or Split.
Environment variables and a simple config wrapper are enough. Pick one
of these patterns and stick with it.

### Python

```python
# config/flags.py
import os

def flag(name: str, default: bool = False) -> bool:
    val = os.environ.get(name, "").lower()
    if val in ("true", "1", "yes", "on"):
        return True
    if val in ("false", "0", "no", "off"):
        return False
    return default

# Usage
from config.flags import flag

if flag("REPORTS_CSV_EXPORT"):
    return export_csv(report)
else:
    return export_json(report)
```

### TypeScript / Node

```typescript
// config/flags.ts
export const flag = (name: string, defaultValue = false): boolean => {
  const val = (process.env[name] ?? "").toLowerCase();
  if (["true", "1", "yes", "on"].includes(val)) return true;
  if (["false", "0", "no", "off"].includes(val)) return false;
  return defaultValue;
};

// Usage
import { flag } from "./config/flags";

if (flag("REPORTS_CSV_EXPORT")) {
  return exportCsv(report);
} else {
  return exportJson(report);
}
```

### Go

```go
// config/flags.go
package config

import (
    "os"
    "strings"
)

func Flag(name string, defaultValue bool) bool {
    val := strings.ToLower(os.Getenv(name))
    switch val {
    case "true", "1", "yes", "on":
        return true
    case "false", "0", "no", "off":
        return false
    default:
        return defaultValue
    }
}

// Usage
if config.Flag("REPORTS_CSV_EXPORT", false) {
    return exportCSV(report)
} else {
    return exportJSON(report)
}
```

## Flag naming

`UPPER_SNAKE_CASE`, prefixed by the area:

- `REPORTS_CSV_EXPORT`
- `AUTH_REQUIRE_2FA`
- `BILLING_NEW_INVOICE_LAYOUT`

Not:

- `csvExport` (camelCase makes env var lookups awkward)
- `FEATURE_X` (no scope, no meaning)
- `TEST_FLAG_1` (will outlive its description)

## The TODO with a deletion date

Every flag gets a TODO comment with a deletion date:

```python
# FLAG: REPORTS_CSV_EXPORT — added 2026-05-19, remove after 2026-06-15
if flag("REPORTS_CSV_EXPORT"):
    return export_csv(report)
```

Pick a deletion date that's realistic: usually 2–4 weeks after the flag
goes live in prod. Put the date in your calendar.

## Cleanup PR

When the flag has been on in prod for ≥2 weeks with no issues, open a
cleanup PR:

```
git checkout main && git pull --ff-only --prune
git checkout -b chore/remove-reports-csv-export-flag
```

The cleanup:

1. Delete the flag check
2. Delete the old code path
3. Delete the env var from any config docs
4. Delete the TODO comment

PR title: `chore: remove REPORTS_CSV_EXPORT flag (always on)`

This is high-leverage maintenance. Skipping it accumulates the exact tech
debt Hammant and Fowler both warn about.

## Flag inventory

Keep a list of active flags somewhere obvious. A `FLAGS.md` in the repo
root works:

```markdown
# Active Feature Flags

| Flag | Added | Owner | Default | Status | Remove By |
|---|---|---|---|---|---|
| REPORTS_CSV_EXPORT | 2026-05-19 | christian | off | on in prod | 2026-06-15 |
| AUTH_REQUIRE_2FA | 2026-05-12 | teammate | off | ramping | 2026-06-09 |
```

When you add a flag, add the row. When you remove a flag, remove the row.
The PR template's checklist asks about this — don't skip.

## Runtime-switchable flags

For most internal tools, env vars require a restart to change. That's fine —
internal tools restart cheaply.

If you need to flip a flag without restart (e.g., a partner integration is
down and you need to disable it immediately), use a config file the app
re-reads, or a small admin endpoint. Don't over-engineer this until you
have a concrete need.

## Don't

- Don't nest flags inside flags. If you find yourself doing this, the
  feature should ship as one unit.
- Don't use flags for permanent configuration (timezone, locale, etc.).
  Those are config, not flags. Flags are temporary by definition.
- Don't ship a flag with no removal plan.
