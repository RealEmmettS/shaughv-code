# Template Method

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/template-method](https://refactoring.guru/design-patterns/template-method)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Define the skeleton of an algorithm in a base class, deferring some specific steps to subclasses. Subclasses redefine certain steps without changing the algorithm's overall structure.

## Problem
Several classes follow the same multi-step procedure with small per-class variations: "open the source, read the data, transform it, write it out, close the source." Every importer (CSV, JSON, OData, Excel) does these five steps; only step 2 and step 3 differ. If each importer reimplements all five, you duplicate the skeleton and risk drift — one of them forgets to close the source.

## Structure
```
AbstractClass
  templateMethod():        # the fixed skeleton; final/non-overridable
    step1()
    step2()                # abstract — subclass must provide
    hook()                 # optional — subclass may override
    step4()

ConcreteSubclassA, ConcreteSubclassB  -- override step2(), optionally hook()
```
Participants: `AbstractClass` (owns the `templateMethod` and the invariant steps), `ConcreteClass` (overrides the variable steps).

## Code example — Python
```python
from __future__ import annotations
from abc import ABC, abstractmethod

class DataSync(ABC):
    def run(self) -> None:                      # the template method
        self._open()
        rows = self._extract()
        rows = self._transform(rows)
        self._load(rows)
        self._close()

    # Invariant steps shared by all syncs
    def _open(self) -> None:  print(f"opening {self.__class__.__name__}")
    def _close(self) -> None: print("closing")

    # Hook with a default — subclasses may override
    def _transform(self, rows: list[dict]) -> list[dict]: return rows

    # Mandatory step — subclasses must override
    @abstractmethod
    def _extract(self) -> list[dict]: ...
    @abstractmethod
    def _load(self, rows: list[dict]) -> None: ...

class OdataSync(DataSync):
    def _extract(self) -> list[dict]: return [{"id": 1}, {"id": 2}]
    def _load(self, rows): print(f"upserted {len(rows)} rows")

class CsvSync(DataSync):
    def _extract(self): return [{"id": 9}]
    def _transform(self, rows): return [{**r, "src": "csv"} for r in rows]
    def _load(self, rows): print(f"wrote {rows}")

OdataSync().run()
CsvSync().run()
```

## Code example — TypeScript
```typescript
abstract class DataSync {
  run(): void {                  // the template method
    this.open();
    let rows = this.extract();
    rows = this.transform(rows);
    this.load(rows);
    this.close();
  }
  protected open()  { console.log(`opening ${this.constructor.name}`); }
  protected close() { console.log("closing"); }
  protected transform(rows: any[]): any[] { return rows; }   // hook
  protected abstract extract(): any[];
  protected abstract load(rows: any[]): void;
}

class OdataSync extends DataSync {
  protected extract() { return [{ id: 1 }, { id: 2 }]; }
  protected load(rows: any[]) { console.log(`upserted ${rows.length}`); }
}
class CsvSync extends DataSync {
  protected extract() { return [{ id: 9 }]; }
  protected transform(rows: any[]) { return rows.map(r => ({ ...r, src: "csv" })); }
  protected load(rows: any[]) { console.log(`wrote`, rows); }
}

new OdataSync().run();
new CsvSync().run();
```

## SQL / data analogue
A stored procedure that runs a fixed sequence and calls "hook" procs (or dynamic SQL with a configurable proc name) for the variable steps. ELT job runners that follow `pre_hook -> sql -> post_hook` (dbt is the famous example) are Template Method. In our CDP, a base sync runner that always does `truncate-stage / merge / log / snapshot` and lets each entity inject its own staging query is Template Method.

## When to use it
- The same algorithm skeleton repeats with small variations.
- You want to lock the order of steps so subclasses can't reorder them.
- A few specific steps need per-subclass behavior, and the rest must stay identical.

## When NOT to use it
- You only have one or two implementations — just write a function with a callback (Strategy).
- The variations are large enough that subclasses end up overriding most steps — the skeleton isn't actually shared.
- You'd rather compose than inherit (often the right call in Python/TS) — use Strategy with injected functions.

## Related patterns
- **Strategy** — **often confused with Strategy** because both let you vary behavior. The distinction: **Template Method uses inheritance** (override hooks in a subclass); **Strategy uses composition** (inject a callable/object). Template Method locks the skeleton; Strategy swaps the whole algorithm. Prefer Strategy in dynamic languages unless the skeleton is genuinely invariant.
- **Factory Method** — itself a specialization of Template Method (one of the hook steps is "create the product").
- **Hollywood Principle** — "don't call us, we'll call you" — is the Template Method principle.

## Anti-patterns it resolves
- Duplicated procedural skeletons across sibling classes (the open/read/close drift).
- Subclasses that forget a cleanup step — the base class enforces it.
- Copy-pasted "almost the same function" with two lines different — extract a hook.

## Real examples in our codebase
> _To be populated as the team finds them._
