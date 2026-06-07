# State

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/state](https://refactoring.guru/design-patterns/state)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Let an object alter its behavior when its internal state changes. The object appears to change its class as transitions happen.

## Problem
You have an entity — an invoice, a project, a build job, a document — that responds differently to the same operations depending on its current status. The straightforward implementation is a switch on a `status` field inside every method: `if status == "draft": ... elif status == "approved": ...`. This duplicates the status check across every method, hides which transitions are legal, and grows quadratically as you add states and operations.

## Structure
```
Context --has--> State (interface)
                  ^
                  |
        Draft, Approved, Paid, Voided (concrete states)

Context.request() delegates to current State.
States return (or set on Context) the next State.
```
Participants: `Context` (holds a reference to the current State), `State` (interface defining state-dependent operations), `ConcreteState` (implements behavior + knows valid transitions).

## Code example — Python
```python
from __future__ import annotations
from typing import Protocol

class InvoiceState(Protocol):
    def approve(self, ctx: "Invoice") -> None: ...
    def pay(self, ctx: "Invoice") -> None: ...

class Draft:
    def approve(self, ctx): ctx.state = Approved(); print("approved")
    def pay(self, ctx):     raise RuntimeError("can't pay a draft")

class Approved:
    def approve(self, ctx): raise RuntimeError("already approved")
    def pay(self, ctx):     ctx.state = Paid(); print("paid")

class Paid:
    def approve(self, ctx): raise RuntimeError("already paid")
    def pay(self, ctx):     raise RuntimeError("already paid")

class Invoice:
    def __init__(self) -> None: self.state: InvoiceState = Draft()
    def approve(self) -> None: self.state.approve(self)
    def pay(self)     -> None: self.state.pay(self)

inv = Invoice()
inv.approve()   # approved
inv.pay()       # paid
# inv.pay()     # RuntimeError
```

## Code example — TypeScript
```typescript
interface InvoiceState {
  approve(ctx: Invoice): void;
  pay(ctx: Invoice): void;
}

class Draft implements InvoiceState {
  approve(ctx: Invoice) { ctx.state = new Approved(); console.log("approved"); }
  pay()                 { throw new Error("can't pay a draft"); }
}
class Approved implements InvoiceState {
  approve()             { throw new Error("already approved"); }
  pay(ctx: Invoice)     { ctx.state = new Paid(); console.log("paid"); }
}
class Paid implements InvoiceState {
  approve()             { throw new Error("already paid"); }
  pay()                 { throw new Error("already paid"); }
}

class Invoice {
  state: InvoiceState = new Draft();
  approve() { this.state.approve(this); }
  pay()     { this.state.pay(this); }
}

const inv = new Invoice();
inv.approve(); inv.pay();
```

## SQL / data analogue
A `status` column governed by a CHECK constraint plus a transition-rules table (or trigger) that enforces which `from_status -> to_status` pairs are legal. Example:
```sql
CREATE TABLE invoice_transition (
  from_status varchar(20),
  to_status   varchar(20),
  PRIMARY KEY (from_status, to_status)
);
-- Trigger on UPDATE rejects any change not present in invoice_transition.
```
Workflow engines (Camunda, Temporal, Azure Durable Functions) are State writ large.

## When to use it
- Behavior depends on a status field and the `if status ==` ladder is duplicated across many methods.
- The legal transitions are non-trivial and worth making explicit.
- New states get added regularly and you want to add one without editing every other state.

## When NOT to use it
- Two or three states with one transition — a status enum and a guard clause is fine.
- States have no behavior, only data — you have an enum, not a state machine.
- A workflow engine already runs the transitions — don't reinvent it in code.

## Related patterns
- **Strategy** — **often confused with Strategy** because both delegate to a swappable object. The distinction: in Strategy the *client* picks the algorithm and strategies are independent of each other; in State the *object's own state* picks the behavior, and states often know about each other (each one decides the next).
- **Memento** — pair with State to snapshot/restore at state-transition points.
- **Often confused with a plain enum-driven switch** — State is worth it once the switch shows up in three or more methods or once transition rules get hairy.

## Anti-patterns it resolves
- Status-switch sprawl: `if status == ... elif status == ...` in every method.
- Illegal transitions slipping through (paying a voided invoice) — make them impossible by construction.
- Hidden state machines — a State implementation *is* the diagram, readable in one file.

## Real examples in our codebase
> _To be populated as the team finds them._
