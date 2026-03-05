---
name: Goofre Architecture and Developer Rules
description: Enforces Goofre architecture guidelines and AI-native patterns.
---

# Goofre Architecture Guidelines

1. **Event Driven:** Always dispatch events to the `SwitchboardOrchestrator` EventBus instead of calling other services directly.
2. **Interfaces First:** All third-party integrations must implement abstract classes defined in `packages/interfaces` to maintain the Bring Your Own Integration philosophy.
3. **Immutability:** State changes to commerce entities must produce immutable event payloads using the UCP schemas.
4. **No Side Effects in Parsers:** UCP Schema normalization methods must be executed as pure functions without side effects.
5. **Self-Healing Messages:** Always provide actionable, human-readable instructions in error messages rather than raw stack traces.
