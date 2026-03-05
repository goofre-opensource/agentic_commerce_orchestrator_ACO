# Claude Setup Guide

## Integrating Claude with Goofre

Goofre provides a native `.claude/skills/architecture.md` file shipped in the root of the repository.

### Instructions

1. Ensure you have the [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) CLI installed or are using Claude within your IDE.
2. When you start an Agent session in the Goofre repository, Claude will automatically read the `.claude/skills/architecture.md` file.
3. This file provides Claude with strict context on the Event-Driven architecture, ensuring that it generates code that adheres to the `SwitchboardOrchestrator` EventBus rather than point-to-point connections.

### Best Practices for Prompts

When asking Claude to build a new plugin, use a prompt like:

> "Claude, build a new plugin for [Platform Name] that implements the `IGoofRePlugin` interface. Make sure all parsing functions are pure and emit events to the local SwitchboardOrchestrator."
