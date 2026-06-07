# Singleton

**Family:** Creational
**Source:** [refactoring.guru/design-patterns/singleton](https://refactoring.guru/design-patterns/singleton)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Ensure a class has only one instance, and provide a global point of access to it. Both parts matter — uniqueness *and* the global access point — and both parts are why this pattern is controversial.

## Problem
Some resources should logically exist only once per process: a connection pool, a config registry, an in-memory cache, a metrics collector. If two instances are created accidentally, you get subtle bugs — two pools competing for the same DB DTUs, two caches drifting out of sync, two metrics collectors double-counting. You want the language/framework to *guarantee* a single instance, and you want any code anywhere to be able to reach it without threading it through every function signature.

That second want is the trap. "Reachable from anywhere" means **global mutable state**, and global mutable state is what makes Singletons rightly hated.

## Structure
```
Singleton
  - instance: Singleton            <-- private, static
  - __init__()                     <-- private/protected
  + getInstance() -> Singleton     <-- the only way in
  + businessOperation()
```
First call to `getInstance()` lazily constructs the instance; subsequent calls return the same one. Thread-safe variants add locking around the construction.

## Code example — Python
```python
import threading

class ConfigRegistry:
    _instance: "ConfigRegistry | None" = None
    _lock = threading.Lock()

    def __new__(cls) -> "ConfigRegistry":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:           # double-checked
                    inst = super().__new__(cls)
                    inst._values: dict[str, str] = {}
                    cls._instance = inst
        return cls._instance

    def set(self, k: str, v: str): self._values[k] = v
    def get(self, k: str) -> str | None: return self._values.get(k)

a = ConfigRegistry(); a.set("tenant", "acme")
b = ConfigRegistry()
assert a is b and b.get("tenant") == "acme"

# Pythonic alternative: just use a module. Modules ARE singletons.
# config.py:  _values: dict[str, str] = {}; def set(...): ...; def get(...): ...
```

## Code example — TypeScript
```typescript
class ConfigRegistry {
  private static instance: ConfigRegistry | null = null;
  private values = new Map<string, string>();

  private constructor() {}                          // block `new`

  static getInstance(): ConfigRegistry {
    if (!ConfigRegistry.instance) {
      ConfigRegistry.instance = new ConfigRegistry();
    }
    return ConfigRegistry.instance;
  }

  set(k: string, v: string) { this.values.set(k, v); }
  get(k: string): string | undefined { return this.values.get(k); }
}

const a = ConfigRegistry.getInstance(); a.set("tenant", "acme");
const b = ConfigRegistry.getInstance();
console.log(a === b, b.get("tenant"));              // true "acme"

// Modern TS alternative: `export const config = new ConfigRegistry()` from a
// module. The module system enforces single instantiation per import graph.
```

## SQL / data analogue
**Unique constraint + advisory locks.** A `UNIQUE` constraint on a "config" or "current_period" table guarantees one row of a kind. **`pg_advisory_lock(key)`** / `sp_getapplock` in SQL Server gives you a process-wide singleton lock — exactly one worker can hold it, so exactly one is "the leader" for a job. Leader-election in distributed systems (etcd, Zookeeper) is the multi-process generalization of the same idea.

## When to use it
- A resource is genuinely expensive to construct *and* must be shared (connection pool, thread pool, in-memory cache that must be coherent).
- An external constraint requires uniqueness (one writer to a file, one holder of a lock, one consumer of a queue partition).
- You're modeling a true singleton in the domain (the current process's logger, the OS clock).

## When NOT to use it
- **Anything you'd want to mock in a test.** Global Singletons are a testability nightmare — tests leak state into each other and you end up writing `resetForTesting()` methods. Prefer **dependency injection**: pass the instance in, and the test passes a fake.
- **Configuration that varies per request / per tenant.** A Singleton flattens context that should be scoped. Use a request-scoped or tenant-scoped object instead.
- **"It's just easier to import it everywhere."** That's the global-state anti-pattern wearing a pattern's clothes. The ease is borrowed — paid back in coupling, hidden dependencies, and surprise mutations.
- **Concurrency in disguise.** Multi-process workers, serverless, and horizontal scaling break Singleton guarantees: each process has its own. If you need *cluster-wide* uniqueness, you need a distributed lock, not a Singleton.

## Related patterns
- **Dependency Injection** — the modern alternative. Construct the "single instance" once at the composition root and inject it. You keep uniqueness; you lose the global access point (which is the part you should want to lose).
- **Monostate** — many instances, one shared state (static fields). Same downsides, less obvious.
- **Often confused with module-level constants/objects** in Python and TypeScript because they're also "one per process." That's true and usually preferable — but the module is just a convenient single instance, not a guarantee that no one can call the constructor again. If guarantee matters, use Singleton or hide the constructor.

## Anti-patterns it resolves
- **Multiple connection pools in one process** — quietly exhausting your 5-DTU Azure SQL budget because two libraries each constructed their own pool.
- **Inconsistent in-process caches** — two `Cache()` instances drifting because both were created "just to be safe."

## Anti-patterns it *creates* (be honest)
- **Hidden coupling** — every function that touches the Singleton has an invisible dependency.
- **Test pollution** — state from one test leaks into the next.
- **Resurrection bugs** — code holds a reference; you reset; the held reference is now a zombie disconnected from "the" instance.
- **Concurrency myths** — `getInstance()` is thread-safe; *operations on the instance* often aren't, and Singleton encourages forgetting that.

## Real examples in our codebase
> _To be populated as the team finds them._
