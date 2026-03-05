# Contributing to Goofre

Thank you for your interest in Goofre!

## The Goofre Quality Standard (Mainline Lockdown)

Goofre enforces an elite, zero-tolerance standard for code quality, built by Antigravity.
The `main` branch is **strictly locked**.

- **NO direct commits to `main` are allowed.**
- All changes **MUST** go through a Pull Request.
- PRs **MUST** pass all CI/CD integration tests, type checks, and linting rules.
- You **MUST** have at least one peer approval before merging.

### Shift-Left Quality (Pre-commit)

We employ `husky` and `lint-staged` to catch errors locally. You should not physically be able to commit code that fails strict type checking and linting.
If you want to simulate our GitHub Actions pipeline locally before pushing, simply run:

```bash
npm run validate
```

---

## Architectural Principle

Goofre is a _pure orchestrator_. We do **NOT** accept Pull Requests adding third-party plugins (e.g., Stripe, Shopify, Magento) directly into the core engine repository.

If you want to build an integration, please use the `templates/goofre-integration-template` and release it independently in your own repository or package.

We gladly welcome non-code contributions, including:

- Documentation improvements
- Issue triaging
- Bug reports with reproducible steps
- Community support on Discord
