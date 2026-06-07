# Iterator

**Family:** Behavioral
**Source:** [refactoring.guru/design-patterns/iterator](https://refactoring.guru/design-patterns/iterator)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Provide a way to traverse the elements of a collection without exposing its underlying representation (list, tree, graph, paginated API, infinite stream).

## Problem
Different collections — a list, a tree, a paginated REST API, a SQL cursor, a generator over a 10 GB file — all need to be walked one element at a time. Forcing every consumer to know the collection's internals (indices, pointers, page tokens, cursor handles) couples them to the storage choice. You want one verb — "give me the next element" — that hides the rest.

## Structure
```
Client -> Iterable.iterator() -> Iterator { next(), hasNext() }
                                    |
                              walks Aggregate internals
```
Participants: `Iterable/Aggregate` (the collection, knows how to produce iterators), `Iterator` (cursor state + `next()`), `Client` (only knows the Iterator interface).

## Code example — Python
```python
from __future__ import annotations
from dataclasses import dataclass
from typing import Iterator as TIterator

@dataclass
class PagedAPI:
    """Pretend each page is a remote call returning up to `size` rows."""
    rows: list[int]
    size: int = 3

    def __iter__(self) -> TIterator[int]:
        # Python's iterator protocol — generator gives us next() + StopIteration
        for start in range(0, len(self.rows), self.size):
            page = self.rows[start:start + self.size]   # "fetch page"
            yield from page

# Caller doesn't know about pages, indices, or page tokens.
api = PagedAPI(rows=list(range(10)), size=3)
for row in api:
    print(row)

# Composes with everything that consumes iterables.
total = sum(api)
print(total)  # 45
```

## Code example — TypeScript
```typescript
class PagedAPI implements Iterable<number> {
  constructor(private rows: number[], private size = 3) {}

  *[Symbol.iterator](): IterableIterator<number> {
    for (let start = 0; start < this.rows.length; start += this.size) {
      const page = this.rows.slice(start, start + this.size); // "fetch page"
      for (const row of page) yield row;
    }
  }
}

const api = new PagedAPI([0,1,2,3,4,5,6,7,8,9], 3);
for (const row of api) console.log(row);

const total = [...api].reduce((a, b) => a + b, 0);
console.log(total); // 45
```

## SQL / data analogue
SQL cursors are the textbook example: `DECLARE CURSOR ... FETCH NEXT FROM ...` is `next()`. Server-side pagination (`OFFSET/FETCH` or keyset pagination with `WHERE id > @last_id`), and streaming result sets (PEP 249 cursor, ODBC, async iterators over query results) are all the Iterator pattern in disguise. Any job that walks a paginated REST or OData feed page-by-page is using Iterator.

## When to use it
- The collection's structure (paged API, tree, cursor) should stay private.
- You want consumers to be usable with `for ... in ...`, `map`, `filter`, `sum`, etc.
- The data is too large to materialize at once — lazy evaluation matters.

## When NOT to use it
- The collection is a small in-memory list — just iterate it directly.
- You need random access (`arr[i]`) — Iterator is sequential by design.
- The language already gives you idiomatic iteration (Python generators, TS `Symbol.iterator`) — use the language feature, don't reinvent the interface.

## Related patterns
- **Composite** — Iterator is the standard way to traverse a Composite tree.
- **Visitor** — pair with Iterator to apply an operation to every element.
- **Often confused with Generator/Stream** because the language constructs *are* iterators under the hood; the pattern is the same, the syntax is sweeter.

## Anti-patterns it resolves
- Callers passing around indices, page tokens, or cursor handles — hide them.
- Loading entire datasets into memory just to walk them once — go lazy.
- Two collections, two completely different traversal APIs — unify them.

## Real examples in your codebase
> _To be populated as you find them._
