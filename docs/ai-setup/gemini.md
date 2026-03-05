# Gemini Setup Guide

## Integrating Gemini with Goofre

Gemini's massive context window enables deep reasoning over the entire UCP Schema. To expose the schema to Gemini securely:

### 1. Direct Schema Context

When querying Gemini via API or Google AI Studio, include `/packages/core-engine/src/types/ucp.schema.ts` in your initial prompt context.

### 2. Live Data Querying

For live data insights (like "Analyze stock anomalies"), configure Gemini Function Calling (or an MCP tool) to hit the `/api/insights` endpoint provided by the Goofre Orchestrator.

Because the `UCPInsight` schema is strictly typed, Gemini naturally understands the response and can produce precise business translations immediately without trial-and-error JSON parsing.
