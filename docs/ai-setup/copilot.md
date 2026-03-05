# Copilot Setup Guide

## Integrating GitHub Copilot with Goofre

### Workspace Guidelines

To ensure Copilot suggests code that aligns with the Agentic Commerce Orchestrator (ACO) architecture, we recommend utilizing Copilot Chat with the `@workspace` context.

1. Create a `.github/copilot-instructions.md` file (or refer Copilot to `.cursor/rules/architecture.md`).
2. Include the following core prompt in your IDE's Copilot settings:

> "You are an expert operating within the Goofre Agentic Commerce Orchestrator codebase. Always favor immutable events via the SwitchboardOrchestrator. All third-party integrations MUST implement interfaces from `@goofre/interfaces`."

### Inline Completions

Because Goofre relies heavily on strict TypeScript typing (e.g., `UCPProduct`, `UCPInventorySnapshot`), Copilot will automatically infer the required fields for plugins. Always keep `packages/interfaces/src/index.ts` open in a background tab to improve Copilot's contextual completion accuracy.
