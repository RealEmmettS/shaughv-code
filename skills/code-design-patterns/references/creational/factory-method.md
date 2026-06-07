# Factory Method

**Family:** Creational
**Source:** [refactoring.guru/design-patterns/factory-method](https://refactoring.guru/design-patterns/factory-method)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Define an interface for creating an object, but let subclasses decide which concrete class to instantiate. Factory Method lets a class defer instantiation to subclasses.

## Problem
You have code that operates on a family of related objects — say, an import pipeline that pulls records from a "source." Initially there's only one source (a CSV file), so you `new CsvSource()` everywhere. Then a REST API arrives, then a database. Every `new` call becomes a branch on source type, scattered across the codebase. Adding a fourth source means hunting down every conditional. The construction code is tightly coupled to the concrete classes, and the high-level pipeline can no longer be tested without standing up real sources.

## Structure
```
Creator (abstract)
  + factoryMethod() -> Product   <-- subclasses override
  + operation()                  <-- calls factoryMethod()
       |
       +-- ConcreteCreatorA --> ConcreteProductA
       +-- ConcreteCreatorB --> ConcreteProductB

Product (interface) <-- ConcreteProductA, ConcreteProductB
```
The Creator's `operation()` works against the `Product` interface; only the subclass knows which concrete Product to build.

## Code example — Python
```python
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class Record:
    id: str
    payload: dict

class Source(ABC):
    @abstractmethod
    def fetch(self) -> list[Record]: ...

class CsvSource(Source):
    def fetch(self) -> list[Record]:
        return [Record("row-1", {"amount": 100})]

class ApiSource(Source):
    def fetch(self) -> list[Record]:
        return [Record("rec-9", {"status": "open"})]

class ImportJob(ABC):
    @abstractmethod
    def make_source(self) -> Source: ...        # factory method

    def run(self) -> int:                       # template uses the factory
        records = self.make_source().fetch()
        return len(records)

class CsvImportJob(ImportJob):
    def make_source(self) -> Source: return CsvSource()

class ApiImportJob(ImportJob):
    def make_source(self) -> Source: return ApiSource()

print(CsvImportJob().run(), ApiImportJob().run())
```

## Code example — TypeScript
```typescript
interface Record { id: string; payload: Record<string, unknown>; }

interface Source { fetch(): Record[]; }

class CsvSource implements Source {
  fetch(): Record[] { return [{ id: "row-1", payload: { amount: 100 } }]; }
}
class ApiSource implements Source {
  fetch(): Record[] { return [{ id: "rec-9", payload: { status: "open" } }]; }
}

abstract class ImportJob {
  protected abstract makeSource(): Source;     // factory method
  run(): number { return this.makeSource().fetch().length; }
}

class CsvImportJob extends ImportJob {
  protected makeSource(): Source { return new CsvSource(); }
}
class ApiImportJob extends ImportJob {
  protected makeSource(): Source { return new ApiSource(); }
}

console.log(new CsvImportJob().run(), new ApiImportJob().run());
```

## SQL / data analogue
No direct data analogue — pure object pattern. The closest cousin is a stored procedure that branches on a `source_type` parameter to call source-specific logic, but that's a `switch`, not subclass polymorphism.

## When to use it
- You don't know in advance which concrete class your code needs to produce, but you do know the abstract interface.
- You want to let users of your framework extend its internal components (override `makeX()` in a subclass).
- A class has a "default" object it creates, and you want subclasses to swap that default without rewriting the orchestration code.

## When NOT to use it
- There's exactly one Product type and no reasonable expectation of a second. Just call the constructor.
- The variation point is data, not behavior — a config-driven switch is simpler than a class hierarchy.
- You actually need a **family** of related products that vary together (use Abstract Factory instead).

## Related patterns
- **Abstract Factory** — a step up. Abstract Factory uses Factory Methods to build whole families of products that must be consistent with each other.
- **Template Method** — Factory Method is often *a* Template Method whose "step" is "create the object I'll operate on."
- **Often confused with Simple Factory** (a plain `create(type)` static function) because both centralize construction; the distinction is that Factory Method uses *inheritance and polymorphism* to vary creation, while Simple Factory uses a `switch`.

## Anti-patterns it resolves
- **Scattered `new` calls** — every place that constructs the concrete type becomes a maintenance trap; Factory Method funnels construction through one overridable hook.
- **Constructor branching (`if type == "csv"`)** — replaces conditional dispatch with polymorphism.

## Real examples in your codebase
> _To be populated as you find them._
