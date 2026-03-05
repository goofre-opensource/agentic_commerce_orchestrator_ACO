# Goofre Integration Template

Use this template to build your own third-party integration for the Agentic Commerce Orchestrator (ACO).

> **Note:** Do not submit PRs with plugins to the Goofre core repository. Plugins should be maintained independently.

## Getting Started

1. Implement an interface from `@goofre/interfaces` (e.g., `IPaymentProvider`).
2. Publish your plugin independently.
3. Register your plugin in the `SwitchboardOrchestrator` instance.
