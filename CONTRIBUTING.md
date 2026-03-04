# Contributing to Goofre ACO

Thank you for your interest in contributing to the **Agentic Commerce Orchestrator** — the open-source "Nervous System" for Agentic Commerce.

## Core Architectural Constraint

> **All contributions must be headless.** This repository contains zero UI code and zero proprietary dashboard logic. Every module must implement or extend the UCP (Unified Commerce Protocol) schema layer.

---

## How to Contribute

### 1. Plugin Development (Most Impactful)
The fastest way to add value is building a new data source plugin.

A plugin maps third-party commerce data to a canonical UCP schema type:

```typescript
import { IGoofRePlugin, UCPProduct } from '@goofre/core-engine';

export class MyPlugin implements IGoofRePlugin {
  readonly id = 'my-platform';
  readonly version = '1.0.0';

  async normalizeProduct(raw: unknown): Promise<UCPProduct> {
    // Transform raw platform data into UCP-compliant schema
  }
}
```

**Supported target schemas:** `UCPProduct` | `UCPInventorySnapshot` | `UCPOrderEvent` | `UCPInsight`

### 2. Core Engine Improvements
- Bug fixes to SwitchboardOrchestrator routing logic
- Performance improvements to PosSyncEngine queue processing
- New WebhookProcessor HMAC signature strategies

---

## Development Setup

```bash
git clone https://github.com/goofre-oss/agentic_commerce_orchestrator_ACO
cd agentic_commerce_orchestrator_ACO
npm install
npm run build
npm test
```

---

## Code Standards

| Rule | Requirement |
|------|-------------|
| TypeScript | Strict mode, no `any` types — use UCP schema types |
| Tests | All new features require a Jest unit test |
| Linting | `npm run lint` must pass before submitting |
| Commits | Follow [Conventional Commits](https://www.conventionalcommits.org/) |
| Docs | JSDoc on all exported public APIs |

---

## Pull Request Checklist

- [ ] My plugin/feature implements the correct `IGoofRePlugin` interface
- [ ] All output data conforms to a UCP schema type — no raw `object` or `any`
- [ ] I've added/updated JSDoc comments on exported APIs
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] No UI code, no dashboard-specific logic in this PR

---

## Commit Convention

```
feat(plugins): add Shopify product normalization plugin
fix(orchestrator): resolve race condition in concurrent event processing
docs(readme): add plugin development quickstart
test(webhooks): add HMAC validation edge case coverage
```

---

## Security Vulnerabilities

Please do not file public issues for security bugs. See [SECURITY.md](./SECURITY.md).
