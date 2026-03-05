# Migrating via the Strangler Fig Pattern

Don't rip-and-replace your existing commerce stack. The safest way to adopt Goofre ACO is the **Strangler Fig Pattern**.

## Step 1: Establish the Event Bus

Deploy the Goofre Orchestrator alongside your existing monolithic platform (e.g., Shopify, Magento).

## Step 2: Configure Webhook Ingestion

Point your legacy platform's webhooks (e.g., `orders/create`, `products/update`) to the `WebhookProcessor` endpoint.
The `WebhookProcessor` transforms those proprietary webhooks into standard `UCPOrderEvent` and `UCPProduct` events.

## Step 3: Divert AI & Read Traffic

Direct your LLM Agents and new frontend components (like your Next.js storefront) to read directly from the Goofre Orchestrator.

## Step 4: Strangle the Monolith

Gradually move business logic (like complex pricing engines or inventory allocation) into specialized Goofre plugins. Over time, the legacy monolith is reduced to a simple data-entry terminal, while Goofre handles all real-time intelligence and AI interactions.
