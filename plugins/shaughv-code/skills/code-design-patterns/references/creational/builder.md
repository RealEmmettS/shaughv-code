# Builder

**Family:** Creational
**Source:** [refactoring.guru/design-patterns/builder](https://refactoring.guru/design-patterns/builder)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Separate the construction of a complex object from its representation, so the same construction process can produce different representations. Build the object step by step, only setting the parts you care about, and get a finished object at the end.

## Problem
You have a class with many optional fields — a `SyncJobConfig` with a tenant, a source, a schedule, retry policy, filters, transformations, observability hooks, and a dozen flags. The constructor balloons to twenty positional parameters, or worse, becomes a "telescoping constructor" where every combination needs its own overload. Callers pass `None` for things they don't care about. Required-vs-optional is invisible at the call site. And you can't enforce invariants like "if you set a retry policy, you must also set a dead-letter queue" — by the time the object exists, both fields are already set.

## Structure
```
Director (optional)
  + construct(builder)        <-- orchestrates a known recipe

Builder (interface)
  + reset()
  + buildPartA()
  + buildPartB()
  + getResult() -> Product

ConcreteBuilder --> Product
```
The Director knows *which* steps to call; the Builder knows *how* each step assembles the product. Clients can skip the Director and drive the Builder themselves (the fluent style most modern codebases use).

## Code example — Python
```python
from dataclasses import dataclass, field

@dataclass(frozen=True)
class SyncJobConfig:
    tenant: str
    source: str
    schedule_cron: str = "0 * * * *"
    retries: int = 0
    dead_letter: str | None = None
    filters: tuple[str, ...] = ()

class SyncJobBuilder:
    def __init__(self, tenant: str, source: str):
        self._tenant, self._source = tenant, source
        self._schedule = "0 * * * *"
        self._retries = 0
        self._dlq: str | None = None
        self._filters: list[str] = []

    def hourly(self):       self._schedule = "0 * * * *"; return self
    def daily(self):        self._schedule = "0 3 * * *"; return self
    def retry(self, n, dlq):self._retries, self._dlq = n, dlq; return self
    def filter(self, expr): self._filters.append(expr); return self

    def build(self) -> SyncJobConfig:
        if self._retries > 0 and not self._dlq:
            raise ValueError("retries require a dead-letter queue")
        return SyncJobConfig(self._tenant, self._source, self._schedule,
                             self._retries, self._dlq, tuple(self._filters))

cfg = (SyncJobBuilder("acme", "postgres")
       .daily().retry(3, "dlq-acme").filter("amount > 0").build())
```

## Code example — TypeScript
```typescript
interface SyncJobConfig {
  tenant: string; source: string; scheduleCron: string;
  retries: number; deadLetter?: string; filters: readonly string[];
}

class SyncJobBuilder {
  private scheduleCron = "0 * * * *";
  private retries = 0;
  private deadLetter?: string;
  private filters: string[] = [];

  constructor(private tenant: string, private source: string) {}

  hourly(): this { this.scheduleCron = "0 * * * *"; return this; }
  daily(): this  { this.scheduleCron = "0 3 * * *"; return this; }
  retry(n: number, dlq: string): this { this.retries = n; this.deadLetter = dlq; return this; }
  filter(expr: string): this { this.filters.push(expr); return this; }

  build(): SyncJobConfig {
    if (this.retries > 0 && !this.deadLetter)
      throw new Error("retries require a dead-letter queue");
    return { tenant: this.tenant, source: this.source,
             scheduleCron: this.scheduleCron, retries: this.retries,
             deadLetter: this.deadLetter, filters: [...this.filters] };
  }
}

const cfg = new SyncJobBuilder("acme", "postgres")
  .daily().retry(3, "dlq-acme").filter("amount > 0").build();
```

## SQL / data analogue
**Query builders.** SQLAlchemy's `Query`, Knex, Drizzle, and Kysely all implement Builder: `db.select().from("t").where(...).orderBy(...).limit(10)` accumulates clauses and emits SQL at `.toSQL()` / execution time. Same shape, same purpose — many optional parts, build incrementally, finalize once. Many XML/JSON query DSLs are Builder-shaped too: you compose entity + relation + field + filter pieces, then emit the document.

## When to use it
- A constructor would need more than ~4 parameters, most of them optional.
- The construction order matters or steps have interdependencies you want to validate at `build()`.
- The same construction process should produce variants (e.g., the same builder produces both a SQL string and a query plan).
- You want a fluent, readable API at call sites.

## When NOT to use it
- The object is small (2–3 fields). Use a constructor or dataclass.
- All fields are required and order-independent. A keyword-argument constructor (Python) or object-literal (TS) is simpler.
- You're tempted to build a Builder for a struct you'll only construct in one place. YAGNI.

## Related patterns
- **Abstract Factory** — Abstract Factory builds *families* of objects in one call; Builder builds *one* complex object in many calls. Often confused; the distinction is "matched set" vs. "step-by-step assembly."
- **Fluent interface** — a common *implementation style* for Builder (each step returns `self`), but a fluent API isn't necessarily a Builder.
- **Composite** — Builder is frequently used to construct Composite trees (e.g., building a nested AST).

## Anti-patterns it resolves
- **Telescoping constructor** — `__init__(a, b=None, c=None, d=None, ...)` with twelve optionals.
- **Mutable half-built objects passed around** — Builder localizes mutation to the builder, returning an immutable product.
- **Invariant violations at use time** — `build()` is a single point to enforce cross-field rules before the object exists.

## Real examples in your codebase
> _To be populated as you find them._
