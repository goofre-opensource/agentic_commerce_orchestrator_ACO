<div align="center">

<img src="./assets/logo.jpg" alt="Goofre Logo" width="400" height="400" />

<h1>Goofre: The Agentic Commerce Orchestrator (ACO)</h1>

<img src="https://img.shields.io/github/actions/workflow/status/goofre-opensource/agentic_commerce_orchestrator_ACO/ci.yml?branch=main&style=for-the-badge" alt="Build Status" />
<img src="https://img.shields.io/badge/coverage-94%25-brightgreen.svg?style=for-the-badge" alt="Coverage" />
<img src="https://img.shields.io/badge/npm-v0.1.0--alpha-blue?style=for-the-badge" alt="NPM Version" />
<img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License" />

<br /><br />

<p>Empowering e-commerce developers to command the agentic future. <br/>
Bypass platform lock-in. Orchestrate Google's commerce stack directly for your merchants.</p>

[**Website**](https://goofre.io) · [**Quickstart (2 min)**](#-the-two-minute-quick-start) · [**Architecture**](#-how-it-works) · [**API Docs**](#-api-reference) · [**Discord**](#-community)

### Instant Deploy

Launch your independent orchestrator in under two minutes:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template?template=https://github.com/goofre-opensource/goofre)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/goofre-opensource/goofre)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/goofre-opensource/goofre)

</div>

---

## The Problem: The Agentic Shift

E-commerce is undergoing a massive, two-front disruption that is dismantling the last two decades of industry standards:

1. **The Conversational Migration:** Consumer shopping is rapidly migrating from traditional website storefronts to conversational interfaces inside Gemini, ChatGPT, Copilot, and Claude.
2. **The Platform Black Box:** Legacy e-commerce platforms are transforming into closed, fully automated black boxes to sell "convenience" directly to merchants.

This raises an existential question: **Where does the custom e-commerce developer fit when the platform becomes autonomous and the storefront becomes a chat window?**

---

## The Solution: Become the Orchestrator

Goofre elevates developers from mere integrators to true **Agentic Commerce Orchestrators**.

Acting as a high-performance switchboard, Goofre wires directly into the massive infrastructure of Google’s business and commerce solutions—the underlying foundation of the Unified Commerce Protocol (UCP). It enables you to orchestrate agentic commerce workflows without any reliance on third-party e-commerce platforms or website builders.

With Goofre, you own the infrastructure. You can bundle, optimize, and deliver AI-native commerce and marketing services directly to your merchants, entirely on your terms.

### How It Works: Harnessing the Google Stack

Google Search, Chrome, and Gemini serve billions of active users daily, making them the ultimate discovery and conversion engines. Goofre leverages this by turning Google Merchant Center (GMC) into your core Product Information Management (PIM) and orchestration hub.

- **One-Way Data Synchronization:** Goofre seamlessly syncs raw SKU and catalog data from legacy e-commerce platforms directly into GMC.
- **Intelligent Diagnostics:** The orchestrator autonomously identifies, flags, and brings your attention to critical feed issues or policy violations within GMC so you can fix them proactively.
- **Full-Spectrum Orchestration:** Beyond the catalog, Goofre orchestrates the merchant's entire agentic lifecycle—powering dynamic advertising, sales optimization, automated customer service, and real-time inventory management directly through Google's unified ecosystem.

---

## ⚡ The Two-Minute Quick Start

```bash
npx create-goofre-ucp my-commerce-layer
cd my-commerce-layer
npm start
```

_Your admin dashboard is now configured to run at `http://localhost:3000/admin`._

The setup comes with a local zero-dependency SQLite database out-of-the-box, automatically seeded with mock customers, products, and orders. Additionally, `create-goofre-ucp` registers `MockPaymentGateway` and `MockEmailSender` plugins so you can immediately begin building and testing complex Agentic Webhooks.

---

## The Goofre Manifesto: Engineering Sovereignty

We believe that e-commerce developers are the true architects of modern retail. Goofre exists to grant them absolute technical sovereignty.

1. **We build orchestrators, not platforms.** We do not dictate where your data lives; we give you the power to command it.
2. **True Independence.** We empower developers to become independent orchestrators, delivering platform-free, AI-native commerce experiences directly to their merchants.
3. **Agent-First Architecture.** The future of commerce is agentic. We provide the robust, Google-stack-powered infrastructure necessary to build systems that act, decide, and optimize autonomously.
4. **No Vendor Lock-In.** Your merchants' data, workflows, and logic belong to them, orchestrated by you.

Build without boundaries. Orchestrate the future.

---

## 📈 Visual Proof & Business Translation

Goofre doesn't just improve developer experience; it fundamentally rewrites the merchant's unit economics. When selling your Goofre-powered architecture to merchants, translate your technical stack into these immediate business outcomes:

- **Eliminate Legacy Overhead:** Stop paying the "ecosystem tax." By orchestrating commerce directly, your merchants instantly eliminate traditional platform subscription fees, bloated third-party app costs, and expensive ad-performance agency retainers.
- **Turnkey Agentic Commerce:** Future-proof merchants instantly. Goofre seamlessly orchestrates Google's powerful, natively integrated commerce stack (Search, Merchant Center, Gemini) to drive tangible, automated business results without relying on a passive website.
- **Scale Without Store-Building:** Stop wasting hundreds of development hours designing, testing, and maintaining fragile website templates. Deploy, manage, and scale intelligent agentic commerce workflows across multiple merchants directly from a single Goofre orchestrator instance.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgoofre-opensource%2Fagentic_commerce_orchestrator_ACO) [![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2Fgoofre-opensource%2Fagentic_commerce_orchestrator_ACO) [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

---

## 🏗 How It Works

```mermaid
graph TB
    subgraph "Data Sources"
        A[Google Merchant Center]
        B[Point of Sale System]
        C[Custom ERP / Webhook]
        D[Google Commerce-Centric Stack]
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

| Component                   | Role                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SwitchboardOrchestrator** | Central event bus. All data flows through here. Manages plugin registry, validates UCP schemas, emits typed events.                                                 |
| **PosSyncEngine**           | Dedicated POS inventory synchronization. Handles real-time stock updates with conflict resolution and queue deduplication.                                          |
| **WebhookProcessor**        | Validates HMAC signatures, parses vendor-specific payloads, dispatches to the Switchboard. Supports any signature algorithm.                                        |
| **UCP Schema Layer**        | TypeScript interfaces + runtime validators for `UCPProduct`, `UCPInventorySnapshot`, `UCPOrderEvent`, `UCPInsight`. The contract between raw data and AI consumers. |

---

## 🔌 Build a Plugin in 60 Seconds

Every data source is a plugin. Implement `IGoofRePlugin` — that's the entire contract:

```typescript
import { IGoofRePlugin, UCPProduct, UCPInsight } from '@goofre/core-engine';

export class MyShopPlugin implements IGoofRePlugin {
  readonly id = 'my-shop'; // Unique identifier
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

| Endpoint             | Method | Description                       |
| -------------------- | ------ | --------------------------------- |
| `/health`            | GET    | Health check                      |
| `/api/insights`      | GET    | AI-ready commerce insights array  |
| `/api/products`      | GET    | Mock UCPProduct catalog           |
| `/api/webhooks/test` | POST   | Echo endpoint for webhook testing |

### UCP Schema Types

```typescript
// See packages/core-engine/src/types/ucp.schema.ts for full definitions
UCPProduct; // Normalized product with pricing and inventory
UCPInventorySnapshot; // Point-in-time inventory state per location
UCPOrderEvent; // Order lifecycle event (created, fulfilled, refunded)
UCPInsight; // AI-generated actionable commerce intelligence
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
