# Adapter

**Family:** Structural
**Source:** [refactoring.guru/design-patterns/adapter](https://refactoring.guru/design-patterns/adapter)
**GoF book:** *Design Patterns* (Gamma et al., 1994)

## Intent
Convert the interface of an existing class into another interface that a client expects. Adapter lets classes work together that otherwise couldn't because of incompatible interfaces.

## Problem
You have working code on both sides — a client that calls a known interface, and a service (third-party SDK, legacy module, vendor API) that does the right thing but speaks a different shape. You don't want to rewrite either. Without an adapter, the incompatibility leaks into the client as conditionals, key remapping, and ad-hoc translation scattered across call sites. An adapter localizes that translation behind the interface the client already knows.

## Structure
```
Client ── uses ──> Target (interface client expects)
                       ^
                       │ implements
                   Adapter ── wraps ──> Adaptee (incompatible existing API)
```
- **Target** — the interface the client codes against.
- **Adaptee** — the existing thing with a useful implementation but the wrong shape.
- **Adapter** — implements Target, holds an Adaptee, translates calls.

## Code example — Python
```python
from typing import Protocol

class PaymentGateway(Protocol):  # Target
    def charge(self, cents: int, currency: str) -> str: ...

class LegacyStripeSDK:  # Adaptee — we don't own it
    def make_payment(self, amount_dollars: float, iso_currency: str) -> dict:
        return {"id": "ch_123", "status": "ok",
                "amount": amount_dollars, "currency": iso_currency}

class StripeAdapter:  # Adapter
    def __init__(self, sdk: LegacyStripeSDK) -> None:
        self._sdk = sdk

    def charge(self, cents: int, currency: str) -> str:
        result = self._sdk.make_payment(cents / 100, currency.upper())
        if result["status"] != "ok":
            raise RuntimeError("charge failed")
        return result["id"]

def checkout(gateway: PaymentGateway, cents: int) -> str:
    return gateway.charge(cents, "usd")

print(checkout(StripeAdapter(LegacyStripeSDK()), 4999))
```

## Code example — TypeScript
```typescript
interface PaymentGateway { // Target
  charge(cents: number, currency: string): string;
}

class LegacyStripeSDK { // Adaptee
  makePayment(dollars: number, iso: string) {
    return { id: "ch_123", status: "ok", amount: dollars, currency: iso };
  }
}

class StripeAdapter implements PaymentGateway { // Adapter
  constructor(private sdk: LegacyStripeSDK) {}
  charge(cents: number, currency: string): string {
    const r = this.sdk.makePayment(cents / 100, currency.toUpperCase());
    if (r.status !== "ok") throw new Error("charge failed");
    return r.id;
  }
}

function checkout(gateway: PaymentGateway, cents: number) {
  return gateway.charge(cents, "usd");
}

console.log(checkout(new StripeAdapter(new LegacyStripeSDK()), 4999));
```

## SQL / data analogue
**Database views that translate column names and types between systems.** An `integrated.*` view layer over a legacy table is a textbook adapter: the raw `legacy.PROJ_MSTR` table speaks a vendor's cryptic field names (`PROJ_CD`, `DESCR`, `CUST_NO`), but downstream consumers want stable, source-agnostic names (`project_code`, `project_name`, `customer_id`). The view is the adapter; the raw table is the adaptee; the reporting/BI client is the target.

## When to use it
- You need to use an existing class but its interface doesn't match what your code expects.
- You're integrating a vendor SDK and want to insulate your domain from its naming/typing choices.
- You're migrating from one library to another and want a seam to swap behind.

## When NOT to use it
- You control both sides — just change the interface.
- The translation is trivial (one renamed field) — a function or a comprehension is cheaper than a class.
- You're adapting more than two or three calls and the translation grows complex — consider Facade or an anti-corruption layer instead.

## Related patterns
- **Facade** — also wraps something messy, but defines a *new* simplified interface over a whole subsystem rather than conforming to an existing target. Adapter makes ONE interface fit another; Facade simplifies a WHOLE subsystem.
- **Bridge** — designed up front to vary two dimensions independently; Adapter is retrofit to bridge two existing incompatible interfaces.
- **Decorator** — also wraps an object, but preserves the wrapped object's interface and adds behavior. Adapter changes the interface.
- **Proxy** — wraps with the same interface to control access. Adapter wraps to change the interface.

## Anti-patterns it resolves
- **Shotgun translation** — the same `dollars * 100`, `.upper()`, `result["status"] == "ok"` checks copy-pasted at every call site. The adapter does it once.
- **Vendor lock-in by leakage** — SDK types appearing in domain code. The adapter draws the line.

## Real examples in your codebase
> _To be populated as you find them._
