# Observer

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/observer](https://refactoring.guru/design-patterns/observer)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Define a one-to-many dependency so that when one object (the subject) changes state, all its dependents (observers) are notified and updated automatically.

## Problem
One object owns state that several others care about — a price feed, a config change, an upload completing, a row being written. Polling is wasteful and laggy; having the subject hard-call every interested party couples them tightly and breaks the moment a new listener appears. You want the subject to announce "this happened" and let any number of unrelated parties react, with the subject knowing nothing about them.

## Structure
```
Subject  ----notify()---->  Observer1
   |                        Observer2
   |                        Observer3
attach(o)  detach(o)
```
Participants: `Subject` (maintains a list of observers, exposes `attach/detach`), `Observer` (interface with `update(event)`), `ConcreteObserver` (reacts however it wants).

## Code example — Python
```python
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Callable

@dataclass
class EventBus:
    listeners: list[Callable[[dict], None]] = field(default_factory=list)
    def subscribe(self, fn: Callable[[dict], None]) -> Callable[[], None]:
        self.listeners.append(fn)
        return lambda: self.listeners.remove(fn)   # unsubscribe handle
    def emit(self, event: dict) -> None:
        for fn in list(self.listeners):            # copy: listeners may unsubscribe
            fn(event)

class InvoiceService:
    def __init__(self, bus: EventBus) -> None: self.bus = bus
    def approve(self, id: int) -> None:
        # ... do the work ...
        self.bus.emit({"type": "invoice.approved", "id": id})

bus = EventBus()
bus.subscribe(lambda e: print("audit:", e))
bus.subscribe(lambda e: print("email:", e))
InvoiceService(bus).approve(42)
```

## Code example — TypeScript
```typescript
type Listener<E> = (event: E) => void;

class EventBus<E> {
  private listeners: Listener<E>[] = [];
  subscribe(fn: Listener<E>): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }
  emit(event: E) { for (const fn of [...this.listeners]) fn(event); }
}

type InvoiceEvent = { type: "invoice.approved"; id: number };

class InvoiceService {
  constructor(private bus: EventBus<InvoiceEvent>) {}
  approve(id: number) {
    // ... do the work ...
    this.bus.emit({ type: "invoice.approved", id });
  }
}

const bus = new EventBus<InvoiceEvent>();
bus.subscribe(e => console.log("audit:", e));
bus.subscribe(e => console.log("email:", e));
new InvoiceService(bus).approve(42);
```

## SQL / data analogue
Database triggers (`AFTER INSERT/UPDATE/DELETE`) are the textbook implementation — the table is the subject, triggers are observers. Change-data-capture (CDC), Debezium, Azure SQL change tracking, and pub/sub on outbox tables are all Observer scaled to infrastructure. The pattern says: "tell me when this changes," not "let me ask repeatedly."

## When to use it
- A change in one place must trigger reactions in many independent places.
- The list of reactors changes at runtime (plugins, feature flags, user subscriptions).
- The subject must remain ignorant of who is listening (otherwise it's just a method call).

## When NOT to use it
- **Don't roll your own classes for this.** In Python an event emitter / callback list / `asyncio` queue is plenty; in TS use `EventTarget`, RxJS, or a 10-line emitter. The pattern is "one-to-many notification," not "you must write `class Subject(ABC)`."
- Only one observer ever — that's a direct call.
- You need a *response* from observers — Observer is fire-and-forget; for request/response use a different mechanism.
- Notification ordering matters strictly — Observer makes no ordering guarantees; reach for a queue or workflow engine.
- Observers form long synchronous chains where one slow observer blocks the rest — make it async or queue events.

## Related patterns
- **Mediator** — **often confused with Mediator** because both decouple objects through an intermediary; the distinction is that Observer is one-to-many *broadcast* (subject doesn't know subscribers), while Mediator is many-to-many *coordination* through a hub that knows everyone.
- **Command** — Commands are often what gets emitted as the event payload.
- **Chain of Responsibility** — CoR routes one request through ordered handlers; Observer fans one event out to many independent listeners.

## Anti-patterns it resolves
- Polling loops checking "did it change yet?" — push instead of pull.
- Service A imports Service B imports Service C just to notify them — invert the dependency.
- "Change one feature, edit eight call sites" — let them subscribe and stay quiet.

## Real examples in your codebase
> _To be populated as you find them._
