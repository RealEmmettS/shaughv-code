# Chain of Responsibility

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/chain-of-responsibility](https://refactoring.guru/design-patterns/chain-of-responsibility)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Pass a request along a chain of handlers. Each handler decides either to process the request or to forward it to the next handler in the chain.

## Problem
You have a request (an HTTP call, a validation, an authorization check, a data record) and several pieces of logic that may need to act on it — authenticate, log, rate-limit, validate, dispatch. Hard-coding `if/elif` ladders or stuffing every step into one function couples unrelated concerns and makes it painful to reorder, skip, or insert new steps. You want each step to be independently testable and the order of steps to be configurable at runtime.

## Structure
```
Client -> Handler1 -> Handler2 -> Handler3 -> ...
            |          |          |
         handle()   handle()   handle()
            \_ each may short-circuit or pass on
```
Participants: `Handler` (interface with `handle()` and a `next` link), `ConcreteHandler` (does its work then calls `next.handle()`), `Client` (builds the chain and kicks it off).

## Code example — Python
```python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class Request:
    user: str | None
    payload: dict

class Handler(ABC):
    def __init__(self) -> None:
        self._next: Handler | None = None

    def set_next(self, h: "Handler") -> "Handler":
        self._next = h
        return h

    def handle(self, req: Request) -> str | None:
        return self._next.handle(req) if self._next else None

class AuthHandler(Handler):
    def handle(self, req: Request) -> str | None:
        if not req.user:
            return "401 unauthenticated"
        return super().handle(req)

class ValidateHandler(Handler):
    def handle(self, req: Request) -> str | None:
        if "project_id" not in req.payload:
            return "400 missing project_id"
        return super().handle(req)

class DispatchHandler(Handler):
    def handle(self, req: Request) -> str:
        return f"200 processed for {req.user}"

chain = AuthHandler()
chain.set_next(ValidateHandler()).set_next(DispatchHandler())
print(chain.handle(Request(user="cadleta", payload={"project_id": 42})))
```

## Code example — TypeScript
```typescript
interface Request { user?: string; payload: Record<string, unknown>; }

abstract class Handler {
  private next?: Handler;
  setNext(h: Handler): Handler { this.next = h; return h; }
  handle(req: Request): string | undefined {
    return this.next?.handle(req);
  }
}

class AuthHandler extends Handler {
  handle(req: Request) {
    if (!req.user) return "401 unauthenticated";
    return super.handle(req);
  }
}
class ValidateHandler extends Handler {
  handle(req: Request) {
    if (!("project_id" in req.payload)) return "400 missing project_id";
    return super.handle(req);
  }
}
class DispatchHandler extends Handler {
  handle(req: Request) { return `200 processed for ${req.user}`; }
}

const chain = new AuthHandler();
chain.setNext(new ValidateHandler()).setNext(new DispatchHandler());
console.log(chain.handle({ user: "cadleta", payload: { project_id: 42 } }));
```

## SQL / data analogue
A pipeline of view layers (Bronze -> Silver -> Gold). Each layer applies its transform and passes rows on; a layer may filter rows out (short-circuit). Express middleware and Python WSGI/ASGI middleware are the canonical runtime analogs.

## When to use it
- Several handlers may process a request and the set/order is known only at runtime.
- You want to add, remove, or reorder steps without touching the others.
- Each step has a single, narrow responsibility (auth, validation, rate-limit, logging).

## When NOT to use it
- Exactly one handler will ever apply — use a direct call or polymorphism.
- The chain is fixed and tiny (two steps) — a plain function composition is clearer.
- A handler in the middle silently dropping a request makes bugs hard to trace; if every request must reach the end, you don't have a chain, you have a pipeline.

## Related patterns
- **Decorator** — also wraps and forwards, but decorators *augment* behavior; CoR handlers *decide* whether to handle at all.
- **Command** — often the *thing being passed* through a chain; CoR is the routing, Command is the payload.
- **Often confused with Pipeline** because both pass data through stages; the distinction is that CoR handlers may stop the chain, while a pipeline always runs every stage.

## Anti-patterns it resolves
- Giant `if/elif` ladders that grow with every new rule — each branch becomes its own handler.
- "God" controllers/services that mix auth, validation, and business logic — split along the chain.

## Real examples in our codebase
> _To be populated as the team finds them._
