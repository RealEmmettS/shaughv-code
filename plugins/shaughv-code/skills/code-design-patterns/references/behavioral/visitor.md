# Visitor

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/visitor](https://refactoring.guru/design-patterns/visitor)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Separate an algorithm from the object structure it operates on. You can add new operations to an existing class hierarchy without modifying the classes themselves.

## Problem
You have a stable hierarchy of element types — AST nodes, shapes, line items in a quote (labor, equipment, material, subcontract) — and you need to keep adding new operations across all of them: render, validate, price, export to JSON, estimate carbon footprint. Stuffing every new operation into every class breaks the open/closed principle (one new op edits N classes) and crams unrelated concerns into the element types. You want to add an operation in *one* new file.

## Structure
```
Element (interface)
  accept(visitor)            # double-dispatch entry point

ConcreteElementA/B/C
  accept(v) -> v.visitA(this)

Visitor (interface)
  visitA(a), visitB(b), visitC(c)

ConcreteVisitor1, ConcreteVisitor2   # one per new operation
```
The trick is **double dispatch**: `element.accept(visitor)` -> `visitor.visitX(self)`. The element picks the right `visitX` method by its own type; the visitor supplies the operation.

## Code example — Python
```python
from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol

class Visitor(Protocol):
    def visit_labor(self, e: "Labor") -> float: ...
    def visit_material(self, e: "Material") -> float: ...

@dataclass
class Labor:
    hours: float
    rate: float
    def accept(self, v: Visitor) -> float: return v.visit_labor(self)

@dataclass
class Material:
    qty: float
    unit_cost: float
    markup: float
    def accept(self, v: Visitor) -> float: return v.visit_material(self)

class CostVisitor:
    def visit_labor(self, e: Labor) -> float:    return e.hours * e.rate
    def visit_material(self, e: Material) -> float:
        return e.qty * e.unit_cost * (1 + e.markup)

class HoursVisitor:
    def visit_labor(self, e: Labor) -> float:    return e.hours
    def visit_material(self, e: Material) -> float: return 0.0

items = [Labor(40, 75), Material(100, 5, 0.15)]
cost = sum(i.accept(CostVisitor())  for i in items)
hours = sum(i.accept(HoursVisitor()) for i in items)
print(cost, hours)   # 3575.0  40.0
```

## Code example — TypeScript
```typescript
interface Visitor<R> {
  visitLabor(e: Labor): R;
  visitMaterial(e: Material): R;
}

interface LineItem { accept<R>(v: Visitor<R>): R; }

class Labor implements LineItem {
  constructor(public hours: number, public rate: number) {}
  accept<R>(v: Visitor<R>) { return v.visitLabor(this); }
}
class Material implements LineItem {
  constructor(public qty: number, public unitCost: number, public markup: number) {}
  accept<R>(v: Visitor<R>) { return v.visitMaterial(this); }
}

class CostVisitor implements Visitor<number> {
  visitLabor(e: Labor)       { return e.hours * e.rate; }
  visitMaterial(e: Material) { return e.qty * e.unitCost * (1 + e.markup); }
}

const items: LineItem[] = [new Labor(40, 75), new Material(100, 5, 0.15)];
const cost = items.reduce((s, i) => s + i.accept(new CostVisitor()), 0);
console.log(cost); // 3575
```

## SQL / data analogue
Less common in pure SQL. The closest analogue is a function library that takes a tagged-union row type (a row with a `kind` column plus per-kind fields) and dispatches on `kind`. Or: a set of `fn_cost_of_<kind>` UDFs all returning the same shape, called via a CASE on `kind`. In practice, when this shape shows up in a data platform you usually denormalize per kind into different tables, which dodges the pattern.

## When to use it
- You have a stable hierarchy of element types and an *expanding* set of operations.
- The operations don't belong in the element classes (export to JSON, render to PDF, compute carbon).
- You need to walk a tree (AST, scene graph) applying different analyses.

## When NOT to use it
- The element hierarchy itself changes often — adding a new element forces you to edit every visitor.
- You have one or two operations — put them on the elements directly (regular polymorphism).
- Your language has good pattern matching (Python 3.10 `match`, TS discriminated unions) and the operations are simple — a `match` statement is clearer than Visitor's double-dispatch ceremony.

## Related patterns
- **Strategy** — **often confused with Strategy** because both encapsulate an operation. The distinction: Strategy swaps one operation *within one class*; Visitor adds an operation *across a class hierarchy* via double dispatch.
- **Iterator** — pair them: iterate a Composite, apply a Visitor to each element.
- **Composite** — Visitor's classic use case is walking a Composite tree.
- **Often confused with pattern matching / `match` statements** — both dispatch on type. The difference is open/closed: Visitor lets you add operations in new files; a `match` statement is the same dispatch, just less indirection.

## Anti-patterns it resolves
- Element classes that grow a `to_json`, `to_pdf`, `to_csv`, `cost`, `validate` method each — pull operations out into visitors.
- `isinstance` / `instanceof` chains scattered across the codebase doing per-type logic — centralize in a visitor.

## Real examples in your codebase
> _To be populated as you find them._
