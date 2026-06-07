# Abstract Factory

**Family:** Creational
**Source:** [refactoring.guru/design-patterns/abstract-factory](https://refactoring.guru/design-patterns/abstract-factory)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Provide an interface for creating *families* of related or dependent objects without specifying their concrete classes. Clients work entirely against the abstract interfaces, and the choice of family happens in one place.

## Problem
You're building a multi-tenant data platform where each tenant (general contractor) uses a different ERP. For tenant A you need an `AcumaticaClient`, an `AcumaticaSchemaMapper`, and an `AcumaticaWriter`; for tenant B you need the Procore trio. These three objects must be *consistent with each other* — you can't pair a Procore client with an Acumatica schema mapper or you get garbage at runtime. If construction is left to callers, nothing stops them from mixing families. You want one place that says: "for this tenant, here is the matched set."

## Structure
```
AbstractFactory
  + createClient()   -> AbstractClient
  + createMapper()   -> AbstractMapper
  + createWriter()   -> AbstractWriter
       |
       +-- AcumaticaFactory -> {AcumaticaClient, AcumaticaMapper, AcumaticaWriter}
       +-- ProcoreFactory   -> {ProcoreClient,   ProcoreMapper,   ProcoreWriter}

Client code depends only on AbstractFactory + Abstract* products.
```

## Code example — Python
```python
from abc import ABC, abstractmethod

class Client(ABC):
    @abstractmethod
    def pull(self) -> list[dict]: ...

class Writer(ABC):
    @abstractmethod
    def write(self, rows: list[dict]) -> int: ...

class AcumaticaClient(Client):
    def pull(self): return [{"src": "acu", "id": 1}]
class AcumaticaWriter(Writer):
    def write(self, rows): return len(rows)

class ProcoreClient(Client):
    def pull(self): return [{"src": "pcr", "id": 1}]
class ProcoreWriter(Writer):
    def write(self, rows): return len(rows)

class ERPFactory(ABC):
    @abstractmethod
    def client(self) -> Client: ...
    @abstractmethod
    def writer(self) -> Writer: ...

class AcumaticaFactory(ERPFactory):
    def client(self): return AcumaticaClient()
    def writer(self): return AcumaticaWriter()

class ProcoreFactory(ERPFactory):
    def client(self): return ProcoreClient()
    def writer(self): return ProcoreWriter()

def sync(f: ERPFactory) -> int:
    return f.writer().write(f.client().pull())

print(sync(AcumaticaFactory()), sync(ProcoreFactory()))
```

## Code example — TypeScript
```typescript
interface Client { pull(): Array<Record<string, unknown>>; }
interface Writer { write(rows: Array<Record<string, unknown>>): number; }

class AcumaticaClient implements Client { pull() { return [{ src: "acu" }]; } }
class AcumaticaWriter implements Writer { write(r: object[]) { return r.length; } }
class ProcoreClient   implements Client { pull() { return [{ src: "pcr" }]; } }
class ProcoreWriter   implements Writer { write(r: object[]) { return r.length; } }

interface ERPFactory {
  client(): Client;
  writer(): Writer;
}

class AcumaticaFactory implements ERPFactory {
  client() { return new AcumaticaClient(); }
  writer() { return new AcumaticaWriter(); }
}
class ProcoreFactory implements ERPFactory {
  client() { return new ProcoreClient(); }
  writer() { return new ProcoreWriter(); }
}

const sync = (f: ERPFactory) => f.writer().write(f.client().pull());
console.log(sync(new AcumaticaFactory()), sync(new ProcoreFactory()));
```

## SQL / data analogue
**Tenant-specific schema factories.** A CDP onboarding routine that, given a tenant code, provisions a matched set of objects in one transaction — `{tenant}_raw`, `{tenant}_staging`, `{tenant}_marts` schemas plus the role grants and sync-pipeline rows that go with them. The "family" is the cluster of schema + roles + pipeline rows that only make sense together. Mixing pieces from two tenants would corrupt the platform.

## When to use it
- Your code must work with multiple **families** of related products, and one product from family A should never be paired with another from family B.
- You want to swap the entire family in one place (constructor injection of the factory).
- You're building a cross-platform or multi-tenant or multi-vendor system where each "platform" has a coherent set of components.

## When NOT to use it
- You only have *one* product, not a family. Use Factory Method.
- The "family" has only one member today and adding more is speculative. You're inventing a hierarchy for a problem you don't have.
- The variation is per-call, not per-deployment — you'll just be passing the factory around as a parameter for no benefit.

## Related patterns
- **Factory Method** — Abstract Factory is typically implemented as a class with several Factory Methods, one per product type in the family.
- **Builder** — Builder constructs *one* complex object step by step; Abstract Factory constructs *families* of objects in one call. Often confused because both hide `new`; the distinction is "complex single object" vs. "matched set."
- **Often confused with Service Locator / DI container** because both wire up object graphs; the distinction is that Abstract Factory is a typed, narrow interface ("give me the ERP set"), while a DI container is a generic untyped registry.

## Anti-patterns it resolves
- **Mismatched product families** — preventing the runtime "wrong client + wrong mapper" combo via the type system.
- **Tenant-branching spaghetti** — replaces `if tenant == "X": ... elif tenant == "Y": ...` repeated across the codebase with a single factory lookup at the edge.

## Real examples in our codebase
> _To be populated as the team finds them._
