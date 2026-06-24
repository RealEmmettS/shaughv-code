# Facade

**Family:** Structural
**Source:** [refactoring.guru/design-patterns/facade](https://refactoring.guru/design-patterns/facade)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Provide a unified, higher-level interface to a set of interfaces in a subsystem. Facade defines an entry point that makes the subsystem easier to use for the 80% case, without preventing power users from reaching the underlying classes when they need to.

## Problem
You're using a subsystem — a video-encoding library, a payments stack, a cluster of third-party integrations — and every client has to know the same five classes, call them in the same order, handle the same intermediate types, and clean up the same resources. The knowledge of "how to use it correctly" gets copy-pasted across the codebase. When the subsystem changes, every caller breaks. A facade is a single class with a small, opinionated surface (`create_project()`, `sync_costs()`) that does the orchestration internally so clients depend on one thing instead of ten.

## Structure
```
Client ──> Facade ──> [SubsystemA, SubsystemB, SubsystemC, ...]
                       (clients can still reach in if needed)
```
- **Facade** — single class exposing a small, task-oriented API.
- **Subsystem classes** — the real, often complex, machinery; they don't know about the Facade.
- **Client** — talks only to the Facade for normal use.

## Code example — Python
```python
# Subsystem (pretend these are real, heavy modules)
class AuthClient:
    def token(self, user: str) -> str: return f"tok-{user}"
class ProjectRepo:
    def create(self, token: str, name: str) -> int: return 42
class CostRepo:
    def seed(self, token: str, project_id: int) -> None: pass
class Notifier:
    def announce(self, project_id: int) -> None: print(f"project {project_id} ready")

class ProjectFacade:  # Facade
    def __init__(self) -> None:
        self._auth = AuthClient()
        self._projects = ProjectRepo()
        self._costs = CostRepo()
        self._notify = Notifier()

    def create_project(self, user: str, name: str) -> int:
        token = self._auth.token(user)
        pid = self._projects.create(token, name)
        self._costs.seed(token, pid)
        self._notify.announce(pid)
        return pid

print(ProjectFacade().create_project("alice", "Tower A"))
```

## Code example — TypeScript
```typescript
class AuthClient { token(u: string) { return `tok-${u}`; } }
class ProjectRepo { create(_t: string, _n: string) { return 42; } }
class CostRepo { seed(_t: string, _id: number) {} }
class Notifier { announce(id: number) { console.log(`project ${id} ready`); } }

class ProjectFacade {
  private auth = new AuthClient();
  private projects = new ProjectRepo();
  private costs = new CostRepo();
  private notifier = new Notifier();

  createProject(user: string, name: string): number {
    const token = this.auth.token(user);
    const pid = this.projects.create(token, name);
    this.costs.seed(token, pid);
    this.notifier.announce(pid);
    return pid;
  }
}

console.log(new ProjectFacade().createProject("alice", "Tower A"));
```

## SQL / data analogue
**A single repository class that hides multi-table joins.** A `ProjectSummaryRepo.get(project_id)` method that internally joins `projects`, `tasks`, and `ledger`, applies some derived math, and returns one flat DTO — that's a facade over the database. An entity/ORM layer plays the same role: one `Project` entity facades a dozen underlying tables. Stored procedures often serve this purpose too: one `sp_GetProjectFinancials` instead of teaching every caller the joins.

## When to use it
- A subsystem has many classes and clients only use a small slice in stereotyped ways.
- You want to insulate clients from churn in a third-party library or internal subsystem.
- You're layering an application — Facade is the natural top-of-layer entry point.
- You need a single place to put orchestration, error handling, or telemetry for a common workflow.

## When NOT to use it
- The subsystem already has a clean, small surface — adding a facade just adds an indirection.
- You're tempted to put *every* operation on the facade — that's a god object, not a facade. A facade is opinionated about the common path.
- You need to *change* the subsystem's interface for one specific consumer — that's an Adapter.

## Related patterns
- **Adapter** — Adapter makes ONE interface fit another existing target; Facade defines a NEW simplified interface over a whole subsystem. Adapter conforms; Facade invents.
- **Mediator** — both centralize interactions, but a Mediator coordinates *peers* that talk through it; a Facade is a one-way simplification — the subsystem doesn't know the Facade exists.
- **Singleton** — Facades are often (not always) singletons because there's no reason to have two.
- **Abstract Factory** — sometimes used inside a Facade to construct the subsystem objects.

## Anti-patterns it resolves
- **Shotgun coupling** — every client importing the same 8 subsystem classes and repeating the same call sequence.
- **Hidden ordering bugs** — "you have to call `auth()` before `init()` before `start()`" — Facade encodes the order once.

## Real examples in your codebase
> _To be populated as you find them._
