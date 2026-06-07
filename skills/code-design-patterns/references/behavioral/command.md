# Command

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/command](https://refactoring.guru/design-patterns/command)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Turn a request into a stand-alone object that contains all information about the request. Lets you parameterize callers, queue or log requests, and support undoable operations.

## Problem
A UI button, an HTTP endpoint, and a scheduled job all need to trigger "approve invoice." If each call site embeds the logic directly, you can't queue it, retry it, audit it, undo it, or swap the implementation. You need a single first-class object that *represents the intent to do something*, separate from *the code that does it* and *the thing that triggers it*.

## Problem (continued)
Common consequences without Command: caller and receiver are tightly coupled, retries get bolted on per-call-site, audit logs are ad-hoc strings, and there's no clean place to put `undo()`.

## Structure
```
Invoker --holds--> Command --calls--> Receiver
                     ^
                     |
                   Client (creates the Command, configures it)
```
Participants: `Command` (interface with `execute()` and optionally `undo()`), `ConcreteCommand` (binds a Receiver + parameters), `Receiver` (does the real work), `Invoker` (triggers the command, knows nothing about Receiver).

## Code example — Python
```python
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Protocol

class Command(Protocol):
    def execute(self) -> None: ...
    def undo(self) -> None: ...

class Ledger:
    def __init__(self) -> None: self.balance = 0
    def credit(self, n: int) -> None: self.balance += n
    def debit(self, n: int) -> None: self.balance -= n

@dataclass
class CreditCmd:
    ledger: Ledger
    amount: int
    def execute(self) -> None: self.ledger.credit(self.amount)
    def undo(self) -> None: self.ledger.debit(self.amount)

@dataclass
class Invoker:
    history: list[Command] = field(default_factory=list)
    def run(self, c: Command) -> None:
        c.execute(); self.history.append(c)
    def undo_last(self) -> None:
        if self.history: self.history.pop().undo()

ldg = Ledger()
inv = Invoker()
inv.run(CreditCmd(ldg, 100))
inv.run(CreditCmd(ldg, 50))
inv.undo_last()
print(ldg.balance)  # 100
```

## Code example — TypeScript
```typescript
interface Command { execute(): void; undo(): void; }

class Ledger {
  balance = 0;
  credit(n: number) { this.balance += n; }
  debit(n: number)  { this.balance -= n; }
}

class CreditCmd implements Command {
  constructor(private ledger: Ledger, private amount: number) {}
  execute() { this.ledger.credit(this.amount); }
  undo()    { this.ledger.debit(this.amount); }
}

class Invoker {
  private history: Command[] = [];
  run(c: Command)   { c.execute(); this.history.push(c); }
  undoLast()        { this.history.pop()?.undo(); }
}

const ldg = new Ledger();
const inv = new Invoker();
inv.run(new CreditCmd(ldg, 100));
inv.run(new CreditCmd(ldg, 50));
inv.undoLast();
console.log(ldg.balance); // 100
```

## SQL / data analogue
Event log / outbox tables. Each row is a serialized command: `(id, kind, payload_json, created_at, executed_at, status)`. A worker reads pending rows and executes them — that's literally the Command pattern persisted to a table. Audit trails are the same shape minus the worker.

## When to use it
- You need to queue, schedule, retry, log, or audit operations.
- You need undo/redo or transactional rollback at the operation level.
- The trigger (button, endpoint, cron) should be decoupled from the work (a service method).

## When NOT to use it
- A plain function call would do — Command adds ceremony.
- You won't queue, log, undo, or swap invokers — you're just renaming a method.
- For one-off algorithms passed to a function, a lambda or a Strategy is lighter.

## Related patterns
- **Strategy** — both encapsulate behavior in an object. **Often confused with Strategy** because both look like "object with one method"; the distinction is that Command captures a *request* (with parameters, intended to be queued / undone / logged), while Strategy captures an *algorithm* (interchangeable, called immediately by the host).
- **Chain of Responsibility** — Commands are frequently what flows through a chain.
- **Memento** — pair with Command to implement undo by snapshotting state before `execute()`.
- **Observer** — Commands often *emit* events; Observer dispatches them.

## Anti-patterns it resolves
- Hard-coded calls from UI widgets to service methods — break the coupling.
- "Log this action" sprinkled everywhere — centralize in the Invoker.
- Hand-rolled retry/queue logic per endpoint — let Commands flow through one worker.

## Real examples in your codebase
> _To be populated as you find them._
