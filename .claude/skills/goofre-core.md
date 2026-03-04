---
name: Goofre ACO — Core Architecture Skill
description: Architectural rules for Claude when building on or extending the Goofre Agentic Commerce Orchestrator (ACO)
---

# Goofre ACO — AI Coding Rules for Claude

You are working inside the **Goofre Agentic Commerce Orchestrator (ACO)** — an open-source, headless TypeScript engine that normalizes commerce data into the **Unified Commerce Protocol (UCP)** for AI agent consumption.

## Core Architectural Rules

### Rule 1: No Data Leaves Without a UCP Schema Type
**Every function that emits data MUST return one of the canonical UCP types:**
- `UCPProduct` — for product catalog data
- `UCPInventorySnapshot` — for inventory state changes
- `UCPOrderEvent` — for order lifecycle events
- `UCPInsight` — for AI-generated commerce intelligence

```typescript
// ✅ CORRECT — returns typed UCPProduct
async normalizeProduct(raw: unknown): Promise<UCPProduct> { ... }

// ❌ WRONG — never return `any` or untyped objects
async normalizeProduct(raw: any): Promise<any> { ... }
```

### Rule 2: All Data Flows Through SwitchboardOrchestrator
Never emit data directly — all events must go through `orchestrator.process()`:

```typescript
// ✅ CORRECT
const result = await orchestrator.process({
  pluginId: 'my-plugin',
  eventType: 'product',
  payload: rawData,
});

// ❌ WRONG — bypasses validation pipeline
myConsumer.emit(rawData);
```

### Rule 3: Plugins Implement IGoofRePlugin
Every data source integration MUST implement the `IGoofRePlugin` interface. No other extension pattern is acceptable:

```typescript
import type { IGoofRePlugin, UCPProduct } from '@goofre/core-engine';

export class MyPlugin implements IGoofRePlugin {
  readonly id = 'my-platform';   // unique, kebab-case
  readonly version = '1.0.0';   // semver

  async normalizeProduct(raw: unknown): Promise<UCPProduct> {
    // Transform raw platform data → UCPProduct
    // Never pass raw data through unchanged
  }
}
```

### Rule 4: Zero UI Code
This repository is **headless**. Never generate:
- React/Vue/Angular components
- HTML templates
- CSS/Tailwind styles
- Dashboard-specific logic

All UI belongs in Repo B (Merchant Dashboard PWA).

### Rule 5: UCP Field Rules
When generating UCP schema instances:
- `ucpId` MUST follow the format: `"{pluginId}::{sourceId}"` (e.g., `"google-merchant::SKU-001"`)
- `sourcePlatform` MUST match the plugin's `id` field
- `ucpVersion` MUST be `"1.0"` or `"1.1"`
- `normalizedAt` MUST be an ISO 8601 string: `new Date().toISOString()`
- `price.amount` MUST be a `number`, never a string

### Rule 6: Strict TypeScript — No `any`
The ESLint config enforces `@typescript-eslint/no-explicit-any: error`. Use `unknown` for untyped inputs and validate/cast:

```typescript
// ✅ Use unknown + type assertion with runtime guard
async normalizeProduct(raw: unknown): Promise<UCPProduct> {
  const product = raw as MyPlatformProduct; // safe when controlled from plugin registry
  return { title: product.name, ... };
}
```

## File Layout Rules

```
packages/
├── core-engine/src/
│   ├── types/ucp.schema.ts         ← SINGLE SOURCE OF TRUTH for UCP types
│   ├── orchestrator/               ← SwitchboardOrchestrator + PosSyncEngine
│   ├── webhooks/                   ← WebhookProcessor
│   └── index.ts                    ← Barrel export — ONLY import from here
├── plugins/src/
│   ├── {platform}/                 ← One directory per plugin
│   └── index.ts                    ← Re-export all plugins
└── mock-server/src/
    ├── server.ts                   ← Express app — mock only, no real API calls
    └── data/                       ← JSON fixtures
```

## Generating a New Plugin

When asked to "create a plugin for [Platform]":

1. Create `packages/plugins/src/{platform}/{PlatformName}Plugin.ts`
2. Implement `IGoofRePlugin` interface
3. Map the platform's fields to UCPProduct/UCPInventorySnapshot/UCPOrderEvent
4. Export from `packages/plugins/src/index.ts`
5. Write a unit test in `tests/` that asserts the output matches the UCP schema

## Key Imports

```typescript
// Core engine types and classes — ALWAYS import from this path
import type { IGoofRePlugin, UCPProduct, UCPInventorySnapshot } from '@goofre/core-engine';
import { SwitchboardOrchestrator, PosSyncEngine, WebhookProcessor } from '@goofre/core-engine';

// Official plugins
import { GoogleMerchantPlugin } from '@goofre/plugins';
```

## Mock Server Contract

The mock server at `packages/mock-server/src/server.ts` MUST:
- Serve only synthetic data — no real API calls, ever
- Return arrays of valid UCP schema objects
- Expose `GET /health` and `GET /api/insights` at minimum
- Run on port 3001 by default
