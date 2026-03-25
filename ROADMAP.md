# Goofre Roadmap

We manage our roadmap transparently in public. This file gives you the high-level milestones. For the live task board, visit our [Public GitHub Projects Board](https://github.com/orgs/goofre-opensource/projects/1).

> **Want to influence the roadmap?** [Open a feature request →](https://github.com/goofre-opensource/agentic_commerce_orchestrator_ACO/issues/new?template=feature_request.yml)

---

## ✅ Now — v1.x (Shipped)

The foundational orchestration layer is live and production-ready.

| Feature                                  | Status     | Notes                                                               |
| ---------------------------------------- | ---------- | ------------------------------------------------------------------- |
| `SwitchboardOrchestrator` core event bus | ✅ Shipped | Plugin registry, typed events, timeout enforcement                  |
| `PosSyncEngine` — POS inventory sync     | ✅ Shipped | Batch dedup, delta calculation, flush callbacks                     |
| `WebhookProcessor` — HMAC validation     | ✅ Shipped | Supports any HMAC algorithm                                         |
| UCP Schema v1.0 types                    | ✅ Shipped | `UCPProduct`, `UCPInventorySnapshot`, `UCPOrderEvent`, `UCPInsight` |
| Google Merchant Center plugin            | ✅ Shipped | Reference integration for `@goofre/plugins`                         |
| Mock server for local dev                | ✅ Shipped | Zero API keys required, Docker + standalone                         |
| `npx create-goofre-ucp` scaffolding      | ✅ Shipped | 2-minute project bootstrap                                          |
| Docker Compose dev environment           | ✅ Shipped | Single command to start everything                                  |
| CI/CD pipeline                           | ✅ Shipped | Lint, typecheck, integration tests, OpenSSF Scorecard               |
| Plugin interface (`IGoofRePlugin`)       | ✅ Shipped | Minimal contract — implement in 60 seconds                          |

---

## 🔥 Next — v2.x (Q2–Q3 2026)

These are the highest-impact items being actively worked or planned. Community contributions welcome.

### Multi-LLM Compatibility

Swap between Gemini, GPT-4o, Claude, and Llama as your AI backbone without changing your ACO logic. Goofre orchestrates commerce — your choice of brain powers the intelligence.

- [ ] `LLMAdapterInterface` — standardized model invocation contract
- [ ] Gemini adapter (first-class, ships with core)
- [ ] OpenAI / Anthropic adapters (community-built, listed in registry)

### Community Source Plugins

The most-requested integrations from the community. Build these in your own repo and list in the Community Plugins directory.

- [ ] **Shopify** source plugin (OAuth + Admin API v2024)
- [ ] **WooCommerce** source plugin (REST API v3)
- [ ] **Magento 2** source plugin
- [ ] **BigCommerce** source plugin
- [ ] **Square POS** source plugin

### Real-Time Webhook Sync

Move beyond polling to event-driven data flows.

- [ ] WebSocket-based live inventory push
- [ ] Shopify topic webhook → UCPOrderEvent pipeline
- [ ] WooCommerce order webhook → UCPOrderEvent pipeline

### UCPInsight Engine v1

AI-powered feed diagnostics with Gemini.

- [ ] GMC feed error classification (policy flags, data quality gaps)
- [ ] Actionable fix suggestions with one-click apply
- [ ] `UCPInsight` severity scoring (critical / high / medium / low)

---

## 🔮 Future — v3.x (H2 2026 and Beyond)

Longer-horizon items. These are candidates — not commitments.

| Feature                             | Why It Matters                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| **MCP Server protocol**             | Expose your orchestrator as a tool callable by any AI agent (Claude Desktop, Copilot, etc.) |
| **Multi-merchant tenant isolation** | Manage 50+ merchants from one Goofre instance — with strict data partitioning               |
| **Client dashboard reference app**  | Open-source Next.js dashboard — inventory alerts, feed health, AI insights                  |
| **Voice agent integration**         | Gemini Live-powered voice interface for merchant briefings                                  |
| **GA4 / GSC signal ingestion**      | Feed behavioural signals into `UCPInsight` for dynamic pricing recommendations              |
| **Edge deployment**                 | Cloudflare Workers / Deno Deploy runtime target                                             |

---

## 📬 How to Contribute to the Roadmap

1. **Vote** on existing feature requests with 👍
2. **Open a feature request** using the [feature_request template](https://github.com/goofre-opensource/agentic_commerce_orchestrator_ACO/issues/new?template=feature_request.yml)
3. **Build it** — see [CONTRIBUTING.md](./CONTRIBUTING.md) for the plugin development guide

Community-built plugins that follow the `IGoofRePlugin` interface are listed in the [Community Plugins Registry](#) — your work ships to every Goofre user.
