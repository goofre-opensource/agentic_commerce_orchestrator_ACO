<div align="center">

<img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License" />
<img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge" alt="Build Passing" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.x" />
<img src="https://img.shields.io/badge/Node.js-20+-339933.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 20+" />
<img src="https://img.shields.io/badge/AI_Native-Gemini_Ready-4285F4.svg?style=for-the-badge&logo=google&logoColor=white" alt="Gemini Ready" />

<br /><br />

<h1>⚡ Agentic Commerce Orchestrator</h1>

<p><strong>The open-source "Nervous System" for Agentic Commerce.</strong><br/>
Stop building fragile point-to-point API integrations.<br/>
Start speaking the language AI agents actually understand.</p>

[**Quickstart (2 min)**](#-2-minute-quickstart) · [**Architecture**](#-how-it-works) · [**Build a Plugin**](#-build-a-plugin-in-60-seconds) · [**API Docs**](#-api-reference) · [**Discord**](#-community)

</div>

---

## The Problem

Every e-commerce platform speaks a different language. WooCommerce, Shopify, Square, custom ERP — each has its own product schema, inventory format, and webhook shape. Your engineering team has written *(and re-written)* dozens of brittle integrations to glue them together.

Now you want AI agents to act on this data — but Gemini, GPT-4, and Claude weren't designed to parse seven conflicting catalog formats.

**There is a better way.**

---

## The Solution: Unified Commerce Protocol (UCP)

The Agentic Commerce Orchestrator (ACO) is a **headless orchestration engine** that normalizes all your commerce data into a single, strictly-typed protocol designed natively for AI consumption.

```
Raw Platform Data (any format) → ACO Engine → UCP Schema (AI-ready) → Gemini/Any LLM
```

| Without ACO | With ACO |
|-------------|----------|
| N point-to-point integrations | One UCP pipeline |
| Inconsistent field names, types, currencies | Strict TypeScript schemas — always predictable |
| LLM agents require custom parsing per platform | Any LLM reads UCP natively — zero prompt engineering for data formatting |
| Webhook handling duplicated per vendor | Unified HMAC-validated webhook processor |
| Inventory sync breaks on schema changes | PosSyncEngine absorbs upstream changes |

---

## ⚡ 2-Minute Quickstart

### Prerequisites

- Node.js 20+
- npm 9+ (or pnpm/yarn)

### Step 1 — Clone & Install

```bash
git clone https://github.com/goofre-oss/agentic_commerce_orchestrator_ACO.git
cd agentic_commerce_orchestrator_ACO
npm install
```

### Step 2 — Configure

```bash
cp .env.example .env
# Edit .env — add your platform API keys (or leave blank for mock mode)
```

### Step 3 — Run

```bash
# Option A: Start the mock server (no API keys needed — perfect for hackathons & CI)
npm run mock

# Option B: Run the full engine with Docker
docker compose up

# Option C: Build and use as a library in your project
npm run build
```

### Step 4 — Verify

```bash
# Mock server health check
curl http://localhost:3001/health
# → { "status": "ok", "mode": "mock", "version": "1.0.0" }

# Fetch AI-ready insights
curl http://localhost:3001/api/insights
# → [{ "type": "inventory_anomaly", "severity": "high", "message": "..." }]
```

**That's it.** You now have a running UCP endpoint that any LLM can query for structured commerce intelligence.

---

## 🏗 How It Works

```mermaid
graph TB
    subgraph "Data Sources"
        A[Google Merchant Center]
        B[Point of Sale System]
        C[Custom ERP / Webhook]
        D[Your Plugin]
    end

    subgraph "ACO Core Engine"
        E[WebhookProcessor<br/>HMAC Validation]
        F[SwitchboardOrchestrator<br/>Central Router]
        G[PosSyncEngine<br/>Inventory Queue]
        H[UCP Schema Validator<br/>Strict Type Enforcement]
    end

    subgraph "UCP Protocol Output"
        I[UCPProduct]
        J[UCPInventorySnapshot]
        K[UCPOrderEvent]
        L[UCPInsight]
    end

    subgraph "AI Consumers"
        M[Gemini Agent]
        N[Merchant Dashboard PWA]
        O[Your Application]
    end

    A --> F
    B --> G --> F
    C --> E --> F
    D --> F
    F --> H
    H --> I & J & K & L
    I & J & K & L --> M & N & O

    style F fill:#4285F4,color:#fff
    style H fill:#EA4335,color:#fff
    style L fill:#34A853,color:#fff
```

### Core Components

| Component | Role |
|-----------|------|
| **SwitchboardOrchestrator** | Central event bus. All data flows through here. Manages plugin registry, validates UCP schemas, emits typed events. |
| **PosSyncEngine** | Dedicated POS inventory synchronization. Handles real-time stock updates with conflict resolution and queue deduplication. |
| **WebhookProcessor** | Validates HMAC signatures, parses vendor-specific payloads, dispatches to the Switchboard. Supports any signature algorithm. |
| **UCP Schema Layer** | TypeScript interfaces + runtime validators for `UCPProduct`, `UCPInventorySnapshot`, `UCPOrderEvent`, `UCPInsight`. The contract between raw data and AI consumers. |

---

## 🔌 Build a Plugin in 60 Seconds

Every data source is a plugin. Implement `IGoofRePlugin` — that's the entire contract:

```typescript
import { IGoofRePlugin, UCPProduct, UCPInsight } from '@goofre/core-engine';

export class MyShopPlugin implements IGoofRePlugin {
  readonly id = 'my-shop';          // Unique identifier
  readonly version = '1.0.0';

  /**
   * Transform raw platform product data into a UCP-compliant UCPProduct.
   * This is the only method required for basic product sync.
   */
  async normalizeProduct(raw: MyShopProduct): Promise<UCPProduct> {
    return {
      ucpId: `my-shop::${raw.productId}`,
      sourceId: raw.productId,
      sourcePlatform: 'my-shop',
      title: raw.name,
      description: raw.body_html,
      price: {
        amount: parseFloat(raw.price),
        currency: 'USD',
      },
      inventory: {
        available: raw.inventory_quantity,
        reserved: 0,
        locationId: 'default',
      },
      ucpVersion: '1.0',
      normalizedAt: new Date().toISOString(),
    };
  }
}

// Register with the orchestrator
import { SwitchboardOrchestrator } from '@goofre/core-engine';

const orchestrator = new SwitchboardOrchestrator();
orchestrator.registerPlugin(new MyShopPlugin());
```

---

## 📦 Package Structure

```
agentic_commerce_orchestrator_ACO/
├── packages/
│   ├── core-engine/          # @goofre/core-engine — The orchestration heart
│   │   └── src/
│   │       ├── types/        # UCP schema type definitions
│   │       ├── orchestrator/ # SwitchboardOrchestrator + PosSyncEngine
│   │       └── webhooks/     # WebhookProcessor
│   ├── plugins/              # @goofre/plugins — Reference integrations
│   │   └── src/
│   │       └── google-merchant/ # Google Merchant Center plugin
│   └── mock-server/          # @goofre/mock-server — Hackathon/CI mock APIs
├── tests/integration/        # End-to-end integration tests
└── docker-compose.yml        # Single-command local dev environment
```

---

## 📋 API Reference

### `SwitchboardOrchestrator`

```typescript
const orchestrator = new SwitchboardOrchestrator(config?: OrchestratorConfig);

// Register a data source plugin
orchestrator.registerPlugin(plugin: IGoofRePlugin): void;

// Process a raw event through the UCP pipeline
await orchestrator.process(event: RawEvent): Promise<UCPProduct | UCPInventorySnapshot | UCPOrderEvent>;

// Subscribe to normalized UCP outputs
orchestrator.on('product', (product: UCPProduct) => { ... });
orchestrator.on('inventory', (snapshot: UCPInventorySnapshot) => { ... });
orchestrator.on('order', (order: UCPOrderEvent) => { ... });
orchestrator.on('insight', (insight: UCPInsight) => { ... });
```

### Mock Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/insights` | GET | AI-ready commerce insights array |
| `/api/products` | GET | Mock UCPProduct catalog |
| `/api/webhooks/test` | POST | Echo endpoint for webhook testing |

### UCP Schema Types

```typescript
// See packages/core-engine/src/types/ucp.schema.ts for full definitions
UCPProduct           // Normalized product with pricing and inventory
UCPInventorySnapshot // Point-in-time inventory state per location
UCPOrderEvent        // Order lifecycle event (created, fulfilled, refunded)
UCPInsight           // AI-generated actionable commerce intelligence
```

---

## 🐳 Docker Quick Reference

```bash
# Start everything (mock server + core engine in watch mode)
docker compose up

# Mock server only (lightest — perfect for PWA frontend dev)
docker compose up mock-server

# Rebuild after package changes
docker compose up --build
```

---

## 🤝 Community

- **Discord:** [discord.gg/goofre](https://discord.gg/goofre)
- **GitHub Discussions:** Ask questions, share plugins
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Security:** See [SECURITY.md](./SECURITY.md)

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

Built with ❤️ by the Goofre team and open-source contributors.

> **Enterprise / Managed Cloud?** The open-source ACO is the headless engine. For the full Merchant Dashboard, Voice Agent, and managed hosting, visit [goofre.io](https://goofre.io).
