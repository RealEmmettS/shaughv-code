# Memento

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/memento](https://refactoring.guru/design-patterns/memento)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Capture and externalize an object's internal state so it can be restored later — without violating that object's encapsulation.

## Problem
You want undo, point-in-time recovery, "rewind to the start of this transaction," or a snapshot before a risky operation. The naive approach — make every private field public so the caretaker can copy it — destroys encapsulation and lets callers corrupt the object's invariants. You need a way to ship a state blob *out and back in* without exposing what's inside it.

## Structure
```
Originator --creates--> Memento (opaque to others)
                          ^
                          |
                       Caretaker (stores it, never inspects)

Originator.save()   -> Memento
Originator.restore(Memento) -> reapplies state
```
Participants: `Originator` (the object whose state matters), `Memento` (opaque snapshot), `Caretaker` (holds mementos but doesn't peek inside).

## Code example — Python
```python
from __future__ import annotations
from dataclasses import dataclass, field, replace

@dataclass(frozen=True)
class _DocSnapshot:        # opaque to anyone outside Document
    body: str
    cursor: int

@dataclass
class Document:
    body: str = ""
    cursor: int = 0
    def type(self, s: str) -> None:
        self.body = self.body[:self.cursor] + s + self.body[self.cursor:]
        self.cursor += len(s)
    def save(self) -> _DocSnapshot:
        return _DocSnapshot(self.body, self.cursor)
    def restore(self, snap: _DocSnapshot) -> None:
        self.body, self.cursor = snap.body, snap.cursor

@dataclass
class History:
    stack: list[_DocSnapshot] = field(default_factory=list)
    def push(self, snap: _DocSnapshot) -> None: self.stack.append(snap)
    def pop(self) -> _DocSnapshot | None:
        return self.stack.pop() if self.stack else None

doc, hist = Document(), History()
hist.push(doc.save()); doc.type("Hello, ")
hist.push(doc.save()); doc.type("world!")
print(doc.body)               # Hello, world!
doc.restore(hist.pop()); print(doc.body)  # Hello,
```

## Code example — TypeScript
```typescript
class DocSnapshot {  // opaque marker — only Document reads its fields
  constructor(readonly body: string, readonly cursor: number) {}
}

class Document {
  body = ""; cursor = 0;
  type(s: string) {
    this.body = this.body.slice(0, this.cursor) + s + this.body.slice(this.cursor);
    this.cursor += s.length;
  }
  save(): DocSnapshot { return new DocSnapshot(this.body, this.cursor); }
  restore(snap: DocSnapshot) { this.body = snap.body; this.cursor = snap.cursor; }
}

class History {
  private stack: DocSnapshot[] = [];
  push(s: DocSnapshot) { this.stack.push(s); }
  pop(): DocSnapshot | undefined { return this.stack.pop(); }
}

const doc = new Document(), hist = new History();
hist.push(doc.save()); doc.type("Hello, ");
hist.push(doc.save()); doc.type("world!");
console.log(doc.body);                          // Hello, world!
doc.restore(hist.pop()!); console.log(doc.body); // Hello,
```

## SQL / data analogue
Snapshot tables — the CDP literally implements this. A `<entity>_snapshot` table captures the state of a row (or a query) at a point in time; the original table is the Originator, the snapshot table is the Memento, and the workflow that writes/restores is the Caretaker. Database point-in-time restore, temporal tables (`FOR SYSTEM_TIME AS OF`), and event-sourced state rebuild are all this pattern at infrastructure scale.

## When to use it
- You need undo/redo, branching history, or "rewind to last good state."
- You need defensive snapshots before risky operations (migrations, bulk updates).
- The object's state has invariants you don't want callers to bypass.

## When NOT to use it
- The object is small, immutable, and cheap to recreate — just clone it.
- Snapshots are huge and frequent — consider event sourcing (replay commands) or copy-on-write.
- You'd be tempted to make the Memento mutable and editable — that's no longer Memento.

## Related patterns
- **Command** — pair with Memento for undoable commands: snapshot before `execute()`, restore on `undo()`.
- **Prototype** — both produce a copy of state, but Prototype's copy is a *new live object*; Memento's is an *opaque archive*.
- **Often confused with serialization** because both externalize state; the distinction is intent: Memento preserves encapsulation (only the Originator reads it back); serialization is for transport and is read by anyone.

## Anti-patterns it resolves
- Making private fields public "just so we can save them" — wrecks invariants.
- Reimplementing "deep clone for backup" in every class — name the snapshot type.
- Lossy undo (only some fields restored) — Memento captures the full state contract.

## Real examples in our codebase
> _To be populated as the team finds them._
