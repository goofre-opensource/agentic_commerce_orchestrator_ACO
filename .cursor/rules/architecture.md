---
description: Goofre Architecture and Developer Rules
---

# Goofre Architecture Guidelines

1. **Event Driven:** Always dispatch events to the `SwitchboardOrchestrator` EventBus instead of calling other services directly.
2. **Interfaces First:** All third-party integrations must implement abstract classes defined in `packages/interfaces`.
3. **Immutability:** State changes to commerce entities must produce immutable event payloads.
4. **No Side Effects in Parsers:** UCP Schema normalization methods must be pure functions.
5. **Self-Healing Messages:** Always provide actionable human-readable fixes in error messages rather than raw stack traces.
