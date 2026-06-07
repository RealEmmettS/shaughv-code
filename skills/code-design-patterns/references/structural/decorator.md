# Decorator

**Family:** Structural
**Source:** [refactoring.guru/design-patterns/decorator](https://refactoring.guru/design-patterns/decorator)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Attach additional responsibilities to an object dynamically by wrapping it in another object with the same interface. Decorators provide a flexible alternative to subclassing for extending behavior.

## Problem
You have a core object — an HTTP client, a data source, a notification sender — and you need to layer concerns onto it: caching, retries, logging, auth, compression, rate limiting. Subclassing all combinations explodes (`LoggingCachingRetryingHttpClient`). Stuffing every concern into one class creates a god object with flags. Decorators let each concern live as its own wrapper class that takes the wrapped object and forwards calls, adding behavior before/after. You compose them at runtime: `Retrying(Logging(Caching(Http())))`.

## Structure
```
Component (interface)
   ^
   │
ConcreteComponent      Decorator ──wraps──> Component
                          ^
                          │
                     ConcreteDecoratorA / B  (add behavior, then forward)
```
- **Component** — interface shared by the real object and the wrappers.
- **ConcreteComponent** — the base object doing the real work.
- **Decorator** — abstract wrapper; holds a Component; forwards calls.
- **ConcreteDecorator** — adds behavior before/after delegating.

## Code example — Python
```python
from typing import Protocol
import time

class DataSource(Protocol):  # Component
    def read(self, key: str) -> str: ...

class FileSource:  # ConcreteComponent
    def read(self, key: str) -> str:
        time.sleep(0.01)  # pretend I/O
        return f"<contents of {key}>"

class CachingSource:  # Decorator
    def __init__(self, inner: DataSource) -> None:
        self._inner = inner
        self._cache: dict[str, str] = {}
    def read(self, key: str) -> str:
        if key not in self._cache:
            self._cache[key] = self._inner.read(key)
        return self._cache[key]

class LoggingSource:  # Decorator
    def __init__(self, inner: DataSource) -> None:
        self._inner = inner
    def read(self, key: str) -> str:
        print(f"[read] {key}")
        return self._inner.read(key)

src: DataSource = LoggingSource(CachingSource(FileSource()))
print(src.read("config.yaml"))
print(src.read("config.yaml"))  # cached
```

## Code example — TypeScript
```typescript
interface DataSource { read(key: string): string; }

class FileSource implements DataSource {
  read(key: string) { return `<contents of ${key}>`; }
}

class CachingSource implements DataSource {
  private cache = new Map<string, string>();
  constructor(private inner: DataSource) {}
  read(key: string): string {
    if (!this.cache.has(key)) this.cache.set(key, this.inner.read(key));
    return this.cache.get(key)!;
  }
}

class LoggingSource implements DataSource {
  constructor(private inner: DataSource) {}
  read(key: string): string {
    console.log(`[read] ${key}`);
    return this.inner.read(key);
  }
}

const src: DataSource = new LoggingSource(new CachingSource(new FileSource()));
console.log(src.read("config.yaml"));
console.log(src.read("config.yaml")); // cached
```

## SQL / data analogue
**Middleware chains and stacked views.** Express/Koa middleware, FastAPI dependencies, and ASP.NET filters are decorator pipelines — each layer wraps `handler(req)` to add auth, logging, compression, then forwards. In SQL, view stacking is the same shape: `analytics.project_margin` selects from `integrated.project_costs` which selects from `raw.transactions` — each view adds a concern (renaming, filtering, joining) while preserving the row-set interface so downstream consumers can treat any layer as "a table." Python decorators (`@retry`, `@cache`, `@log`) are the literal language-level expression of this pattern.

## When to use it
- You need to add cross-cutting concerns (logging, caching, retries, auth, metrics) without modifying the core object.
- You want concerns composable in any order at runtime.
- Subclass combinations would explode (`N` concerns → `2^N` subclasses).

## When NOT to use it
- The behavior is required and inseparable — it belongs in the component itself.
- You only ever need one combination — a subclass or a few lines in the base is simpler.
- The order-of-wrapping matters subtly and isn't obvious — wrapper stacks can hide bugs (e.g., cache-before-retry vs retry-before-cache behaves very differently).
- You need to change the interface — that's Adapter.

## Related patterns
- **Proxy** — both wrap an object with the same interface, but Decorator ADDS BEHAVIOR (caching, logging, formatting); Proxy CONTROLS ACCESS (lazy loading, auth checks, remote calls). If you're enhancing the call, it's a decorator; if you're gatekeeping it, it's a proxy.
- **Composite** — both compose recursively, but Composite is about a TREE of same-typed things; Decorator is a LINEAR CHAIN that wraps a single object to enhance it.
- **Adapter** — Decorator preserves the interface; Adapter changes it.
- **Chain of Responsibility** — similar shape; CoR's links can short-circuit and may not forward, decorators always forward.

## Anti-patterns it resolves
- **God object** — one class with `enable_cache`, `enable_logging`, `enable_retry` flags. Decorators split each concern into its own class.
- **Subclass explosion** — `CachedLoggingRetryingHttpClient`. Decorators compose at runtime.

## Real examples in your codebase
> _To be populated as you find them._
