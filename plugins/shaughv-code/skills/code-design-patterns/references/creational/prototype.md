# Prototype

**Family:** Creational
**Source:** [refactoring.guru/design-patterns/prototype](https://refactoring.guru/design-patterns/prototype)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Specify the kinds of objects to create using a prototypical instance, and create new objects by *copying* that prototype. The new object delegates "how to copy me" to the original, so the client doesn't need to know the concrete class.

## Problem
You have a fully configured object — say, a `ReportTemplate` with two dozen formatting rules, layout settings, and computed fields — and you need a near-duplicate that differs in one or two ways. Reconstructing it from scratch requires knowing every setting, which the caller often can't access (private state, registered handlers, derived caches). Worse, the concrete class might be a subclass the caller doesn't know about. You don't want callers writing `new ConcreteThing(...)` at all — you want them to say "give me one like this, but with X changed."

## Structure
```
Prototype (interface)
  + clone() -> Prototype

ConcretePrototypeA (implements clone)
ConcretePrototypeB (implements clone)

Client                 PrototypeRegistry (optional)
  | clone()              + register(name, proto)
  v                      + get(name) -> Prototype
new object
```
Optionally, a registry holds named prototypes so callers say `registry.get("monthly-report").clone()`.

## Code example — Python
```python
from __future__ import annotations
import copy
from dataclasses import dataclass, field

@dataclass
class ReportTemplate:
    name: str
    columns: list[str] = field(default_factory=list)
    filters: dict[str, str] = field(default_factory=dict)
    formatting: dict[str, str] = field(default_factory=dict)

    def clone(self) -> "ReportTemplate":
        return copy.deepcopy(self)             # deep copy = safe defaults

class PrototypeRegistry:
    def __init__(self): self._protos: dict[str, ReportTemplate] = {}
    def register(self, key: str, proto: ReportTemplate): self._protos[key] = proto
    def get(self, key: str) -> ReportTemplate: return self._protos[key].clone()

base = ReportTemplate("monthly-wip",
                     columns=["project", "revenue", "gm"],
                     filters={"status": "active"},
                     formatting={"currency": "USD"})

registry = PrototypeRegistry()
registry.register("monthly-wip", base)

variant = registry.get("monthly-wip")
variant.name = "monthly-wip-region-west"
variant.filters["region"] = "west"
# base is untouched
```

## Code example — TypeScript
```typescript
interface Prototype<T> { clone(): T; }

class ReportTemplate implements Prototype<ReportTemplate> {
  constructor(
    public name: string,
    public columns: string[] = [],
    public filters: Record<string, string> = {},
    public formatting: Record<string, string> = {},
  ) {}

  clone(): ReportTemplate {
    return new ReportTemplate(
      this.name,
      [...this.columns],
      { ...this.filters },
      { ...this.formatting },
    );
  }
}

class PrototypeRegistry {
  private protos = new Map<string, ReportTemplate>();
  register(key: string, p: ReportTemplate) { this.protos.set(key, p); }
  get(key: string): ReportTemplate {
    const p = this.protos.get(key);
    if (!p) throw new Error(`unknown prototype ${key}`);
    return p.clone();
  }
}

const base = new ReportTemplate("monthly-wip",
  ["project", "revenue", "gm"], { status: "active" }, { currency: "USD" });
const registry = new PrototypeRegistry();
registry.register("monthly-wip", base);

const variant = registry.get("monthly-wip");
variant.filters.region = "west";
```

## SQL / data analogue
**`INSERT INTO t SELECT FROM t`** and **`CREATE TABLE new LIKE old`** — copy an existing row or table structure as the starting point for a variant. Common in data-platform work: clone a tenant's config rows for a new tenant, then tweak; snapshot a fact table's schema into a `*_archive` table. The "prototype" is the existing row/table, and the SQL is the `clone()`.

## SQL / data analogue (extended)
Also: most ORMs expose a `.copy()` or `.clone()` on records for the same reason — duplicate a known-good row, change two fields, save.

## When to use it
- The object is expensive or awkward to construct from scratch (lots of dependencies, async setup, computed state).
- You want callers to start from a "known-good baseline" and override a few fields, rather than reasoning about all defaults.
- The concrete class shouldn't be known to the caller — they only have a reference to an existing instance.
- You need many similar objects (test fixtures, report variants, config presets).

## When NOT to use it
- The object is cheap to build with a normal constructor. Just construct.
- The object has external resources (open file handles, DB connections, sockets) that don't survive a shallow copy and are dangerous to deep-copy. Use a Factory.
- Immutability + a `with`-style "copy with changes" method (Python `dataclasses.replace`, TS spread) is simpler and clearer for plain data.

## Related patterns
- **Factory Method / Abstract Factory** — alternatives when you *do* want to centralize construction logic. Prototype trades centralization for flexibility: any instance is a factory for its kind.
- **Memento** — both involve snapshotting object state; Memento is for undo/restore, Prototype is for spawning new instances.
- **Often confused with deep-copy utilities** (`copy.deepcopy`, `structuredClone`) because they're the *mechanism*; the Prototype *pattern* is the discipline of using a `clone()` method on a `Prototype` interface so callers don't depend on concrete classes.

## Anti-patterns it resolves
- **Constructor parameter explosion for variants** — instead of `new Thing(everything, with, region="west")`, callers say `base.clone()` and mutate.
- **Leaking concrete classes** — callers stop importing `ConcreteReportSubclass` just to make a copy.
- **Stale defaults in test fixtures** — one canonical prototype per fixture; tests clone and tweak.

## Real examples in your codebase
> _To be populated as you find them._
