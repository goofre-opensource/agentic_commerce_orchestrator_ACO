# Contributing to Goofre

Welcome! 🎉 Whether you're fixing a typo, improving docs, or building a new plugin — we're glad you're here. Goofre is built by and for e-commerce developers.

## Ways to Contribute (Pick Your Lane)

### 🟢 No-Code Contributions (Start here!)

Perfect for knowledge workers and developers new to the project:

- Improve documentation and guides
- Report bugs with clear, reproducible steps
- Answer questions in [GitHub Discussions](https://github.com/goofre-opensource/agentic_commerce_orchestrator_ACO/discussions)
- Share your Goofre-powered project in the Showcase

### 🟡 Plugin Development

The best way to extend Goofre — without touching the core:

- Build source plugins (Shopify, WooCommerce, Magento, BigCommerce, Square, Wix) in **your own repo**
- Use `templates/goofre-integration-template` as your starting point
- List your plugin in our [Community Plugins directory](#) so others can discover it

> Goofre is a _pure orchestrator_. We do **not** accept PRs that add third-party platform plugins directly into the core engine.

### 🔴 Core Engine Contributions

The core engine has strict quality standards to protect stability for everyone:

- All changes go through **Pull Requests** — no direct commits to `main`
- PRs must pass CI: tests, TypeScript checks, linting
- One peer approval required before merge

**Before you push:** Run `npm run validate` locally to simulate the CI pipeline.

---

## Quick Dev Setup

```bash
git clone https://github.com/Goofre-Agentic-Commerce-Orchestrator/agentic_commerce_orchestrator_ACO.git
cd agentic_commerce_orchestrator_ACO
npm install
npm run dev
```

The project uses `husky` + `lint-staged` — Git hooks will catch type errors and linting issues before you can even commit. This is a safety net, not a barrier.

---

## First Time? Check These Issues

Look for issues labelled [`good first issue`](https://github.com/goofre-opensource/agentic_commerce_orchestrator_ACO/labels/good%20first%20issue) — these are scoped, well-documented, and a great way to learn the codebase.

---

## Code of Conduct

Be kind. We're all here to build something useful together.

Questions? Open a [Discussion](https://github.com/goofre-opensource/agentic_commerce_orchestrator_ACO/discussions) or join [Discord](https://discord.gg/goofre).
