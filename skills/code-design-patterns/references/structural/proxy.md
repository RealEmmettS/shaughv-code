# Proxy

**Family:** Structural
**Source:** [refactoring.guru/design-patterns/proxy](https://refactoring.guru/design-patterns/proxy)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Provide a surrogate or placeholder for another object to control access to it. The proxy implements the same interface as the real object, so clients can't tell the difference, but the proxy can intercept calls to lazy-load, authorize, cache, log, or forward to a remote instance.

## Problem
You need to gate access to an expensive or sensitive object. Maybe instantiating the real thing is slow (loads a 200MB ML model, opens a database connection) and you want to defer it until first use. Maybe the real object lives on another machine and you want clients to call it like a local one. Maybe you need to check permissions before every operation, or count and rate-limit calls, or cache responses. You don't want to put this logic into the real object (it's not its concern) and you don't want every client to remember to do it. A proxy implements the same interface, sits in front, and decides what to forward and when.

## Structure
```
Client ──> Subject (interface)
              ^
              │
       ┌──────┴──────┐
   RealSubject     Proxy ──holds──> RealSubject
                   (controls access)
```
- **Subject** — interface shared by RealSubject and Proxy so the client can use either interchangeably.
- **RealSubject** — the actual object that does the work.
- **Proxy** — implements Subject; manages the RealSubject's lifecycle and access.

Common variants: **Virtual Proxy** (lazy creation), **Protection Proxy** (auth checks), **Remote Proxy** (RPC stub), **Logging/Smart Proxy** (instrumentation), **Caching Proxy** (memoize results).

## Code example — Python
```python
from typing import Protocol

class Report(Protocol):  # Subject
    def render(self, project_id: int) -> str: ...

class HeavyReport:  # RealSubject — expensive to construct
    def __init__(self) -> None:
        print("loading 200MB report engine...")
        self._engine = "loaded"
    def render(self, project_id: int) -> str:
        return f"report({project_id})"

class LazyReportProxy:  # Virtual Proxy
    def __init__(self) -> None:
        self._real: HeavyReport | None = None
    def render(self, project_id: int) -> str:
        if self._real is None:
            self._real = HeavyReport()  # deferred until first call
        return self._real.render(project_id)

class AuthReportProxy:  # Protection Proxy — wraps another Subject
    def __init__(self, inner: Report, user_role: str) -> None:
        self._inner, self._role = inner, user_role
    def render(self, project_id: int) -> str:
        if self._role != "admin":
            raise PermissionError("admin only")
        return self._inner.render(project_id)

r: Report = AuthReportProxy(LazyReportProxy(), user_role="admin")
print(r.render(42))  # engine loads here, then renders
print(r.render(43))  # engine already loaded
```

## Code example — TypeScript
```typescript
interface Report { render(projectId: number): string; }

class HeavyReport implements Report {
  constructor() { console.log("loading 200MB report engine..."); }
  render(id: number) { return `report(${id})`; }
}

class LazyReportProxy implements Report {
  private real: HeavyReport | null = null;
  render(id: number): string {
    if (!this.real) this.real = new HeavyReport();
    return this.real.render(id);
  }
}

class AuthReportProxy implements Report {
  constructor(private inner: Report, private role: string) {}
  render(id: number): string {
    if (this.role !== "admin") throw new Error("admin only");
    return this.inner.render(id);
  }
}

const r: Report = new AuthReportProxy(new LazyReportProxy(), "admin");
console.log(r.render(42));
console.log(r.render(43));
```

## SQL / data analogue
**Materialized views, lazy-loaded ORM relationships, and connection poolers.** A materialized view is a Caching Proxy in front of the query that defines it — same interface (a relation you can `SELECT` from), but reads are served from precomputed storage. SQLAlchemy's `lazy="select"` relationships are Virtual Proxies — the collection looks like a list but the query doesn't fire until you iterate. PgBouncer, ProxySQL, and Azure SQL's gateway are Remote/Smart Proxies — your client speaks the wire protocol of the real server but a proxy in front pools connections, routes reads to replicas, and enforces limits. Even row-level security policies are a flavor of Protection Proxy at the data layer.

## When to use it
- The real object is expensive to create and you don't always need it (virtual proxy).
- You need to control access — auth, rate limits, audit logging — without polluting the real object.
- The real object lives elsewhere — network, subprocess, sandboxed runtime (remote proxy).
- You want to cache or memoize results transparently to callers.

## When NOT to use it
- The "control" you'd add is the real object's actual responsibility — put it there.
- You want to ADD new behavior to results (formatting, retry policy) — that's a Decorator. Proxy is for gatekeeping access to the same behavior.
- A simple function wrapper or `functools.lru_cache` does the job — don't build a class.
- Lazy loading introduces ordering / threading bugs that outweigh the construction cost — eager init is often fine.

## Related patterns
- **Decorator** — both wrap an object with the same interface. Proxy CONTROLS ACCESS (lazy creation, auth, caching, remoting); Decorator ADDS BEHAVIOR (logging, transformation, retries). The line is fuzzy — a caching proxy and a memoizing decorator do similar things. Ask: am I gating/managing the real call, or enhancing its result?
- **Adapter** — Adapter changes the interface; Proxy keeps it identical.
- **Facade** — Facade simplifies a whole subsystem with a new interface; Proxy fronts a single object with the same interface.
- **Flyweight** — sometimes a proxy hands out shared flyweights.

## Anti-patterns it resolves
- **Eager loading of expensive resources** — engines, models, connections constructed up front "just in case".
- **Auth/logging copy-paste** — every method on the real object starting with the same `if not user.is_admin: raise` guard.
- **Leaky remoting** — clients writing HTTP calls inline instead of speaking a normal object interface.

## Real examples in our codebase
> _To be populated as the team finds them._
