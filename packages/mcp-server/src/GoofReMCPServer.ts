/**
 * GoofReMCPServer — Expose a SwitchboardOrchestrator as an MCP tool server
 *
 * Model Context Protocol (MCP) is the open standard (introduced by Anthropic,
 * widely adopted 2025-2026) that lets AI assistants — Claude, Copilot, Gemini,
 * ChatGPT — call external tools as first-class capabilities.
 *
 * This adapter wraps any GoofRe SwitchboardOrchestrator and exposes it as
 * four MCP tools that any AI agent can discover and call:
 *
 *   - goofre_get_product       → orchestrator.process({ eventType: 'product' })
 *   - goofre_get_inventory     → orchestrator.process({ eventType: 'inventory' })
 *   - goofre_process_order     → orchestrator.process({ eventType: 'order' })
 *   - goofre_process_cart      → orchestrator.process({ eventType: 'cart' })
 *
 * Usage with Claude Desktop / Copilot (mcp_config.json):
 * ```json
 * {
 *   "mcpServers": {
 *     "goofre": {
 *       "command": "node",
 *       "args": ["./node_modules/@goofre/mcp-server/dist/index.js"],
 *       "env": { "GOOFRE_PLUGIN_ID": "google-merchant" }
 *     }
 *   }
 * }
 * ```
 *
 * MCP Spec: https://spec.modelcontextprotocol.io
 * UCP + MCP binding: Google UCP March 2026 update (MCP as a UCP transport layer)
 */

// ─── MCP Types ────────────────────────────────────────────────────────────────
// Minimal MCP type definitions — no external MCP SDK dependency required.

export interface MCPToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string; required?: boolean }>;
    required: string[];
  };
}

export interface MCPContentBlock {
  type: 'text';
  text: string;
}

export interface MCPToolResult {
  content: MCPContentBlock[];
  isError?: boolean;
}

export interface MCPToolCallArgs {
  pluginId?: string;
  payload: unknown;
}

// ─── Orchestrator interface (subset) ─────────────────────────────────────────
// Avoid a hard import dependency on @goofre/core-engine so this package
// can be used in any runtime that has a compatible orchestrator instance.

interface GoofReOrchestrator {
  process(event: { pluginId: string; eventType: string; payload: unknown }): Promise<unknown>;
  getRegisteredPlugins(): Array<{ id: string; version: string }>;
}

// ─── GoofReMCPServer ─────────────────────────────────────────────────────────

/**
 * Wraps a GoofRe SwitchboardOrchestrator and exposes it as an MCP tool server.
 *
 * @example
 * ```typescript
 * import { SwitchboardOrchestrator } from '@goofre/core-engine';
 * import { GoogleMerchantPlugin } from '@goofre/plugins';
 * import { GoofReMCPServer } from '@goofre/mcp-server';
 *
 * const orchestrator = new SwitchboardOrchestrator();
 * orchestrator.registerPlugin(new GoogleMerchantPlugin({ merchantId: '12345' }));
 *
 * const mcpServer = new GoofReMCPServer(orchestrator, {
 *   defaultPluginId: 'google-merchant',
 * });
 *
 * // In your MCP request handler:
 * const tools = mcpServer.listTools();
 * const result = await mcpServer.callTool('goofre_get_product', {
 *   payload: rawProductData,
 * });
 * ```
 */
export class GoofReMCPServer {
  private readonly orchestrator: GoofReOrchestrator;
  private readonly defaultPluginId: string;

  constructor(orchestrator: GoofReOrchestrator, config: { defaultPluginId: string }) {
    this.orchestrator = orchestrator;
    this.defaultPluginId = config.defaultPluginId;
  }

  /**
   * Returns the MCP tool manifest — the list of tools this server exposes.
   * AI assistants call this to discover what capabilities are available.
   */
  listTools(): MCPToolSchema[] {
    return [
      {
        name: 'goofre_get_product',
        description:
          'Retrieve and normalize a product from the connected commerce platform. ' +
          'Returns a UCP-compliant product object with title, price, inventory, variants, ' +
          'GTIN, channel, and loyalty program data.',
        inputSchema: {
          type: 'object',
          properties: {
            pluginId: {
              type: 'string',
              description:
                'Plugin to use (e.g. "google-merchant", "shopify"). Defaults to configured plugin.',
            },
            payload: {
              type: 'object',
              description: 'Raw product data from the source platform.',
            },
          },
          required: ['payload'],
        },
      },
      {
        name: 'goofre_get_inventory',
        description:
          'Retrieve normalized inventory levels for a product across locations. ' +
          'Returns a UCPInventorySnapshot with available/reserved quantities and delta.',
        inputSchema: {
          type: 'object',
          properties: {
            pluginId: {
              type: 'string',
              description: 'Plugin to use. Defaults to configured plugin.',
            },
            payload: {
              type: 'object',
              description: 'Raw inventory data from the source platform.',
            },
          },
          required: ['payload'],
        },
      },
      {
        name: 'goofre_process_order',
        description:
          'Process an order lifecycle event (created, paid, fulfilled, cancelled, ' +
          'return_requested, return_completed). Returns a UCPOrderEvent.',
        inputSchema: {
          type: 'object',
          properties: {
            pluginId: {
              type: 'string',
              description: 'Plugin to use. Defaults to configured plugin.',
            },
            payload: {
              type: 'object',
              description: 'Raw order webhook payload from the source platform.',
            },
          },
          required: ['payload'],
        },
      },
      {
        name: 'goofre_process_cart',
        description:
          'Process a UCP Cart API event — creating, updating, or saving a ' +
          'multi-item shopping cart for an AI agent session. Returns a UCPCartEvent.',
        inputSchema: {
          type: 'object',
          properties: {
            pluginId: {
              type: 'string',
              description: 'Plugin to use. Defaults to configured plugin.',
            },
            payload: {
              type: 'object',
              description: 'Raw cart event payload from the UCP Cart API.',
            },
          },
          required: ['payload'],
        },
      },
    ];
  }

  /**
   * Execute an MCP tool call and return a structured MCP result.
   *
   * @throws {Error} If the tool name is not recognized
   */
  async callTool(name: string, args: MCPToolCallArgs): Promise<MCPToolResult> {
    const pluginId = args.pluginId ?? this.defaultPluginId;

    const toolToEventType: Record<string, string> = {
      goofre_get_product: 'product',
      goofre_get_inventory: 'inventory',
      goofre_process_order: 'order',
      goofre_process_cart: 'cart',
    };

    const eventType = toolToEventType[name];
    if (!eventType) {
      return {
        content: [{ type: 'text', text: `Unknown tool: "${name}"` }],
        isError: true,
      };
    }

    try {
      const result = await this.orchestrator.process({
        pluginId,
        eventType,
        payload: args.payload,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text', text: `GoofRe error: ${message}` }],
        isError: true,
      };
    }
  }

  /**
   * Returns a formatted server info block for MCP server initialization.
   */
  getServerInfo(): {
    name: string;
    version: string;
    plugins: Array<{ id: string; version: string }>;
  } {
    return {
      name: 'GoofRe ACO MCP Server',
      version: '1.0.0',
      plugins: this.orchestrator.getRegisteredPlugins(),
    };
  }
}
