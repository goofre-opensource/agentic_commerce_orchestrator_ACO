/**
 * Unit Tests: GoofReMCPServer
 *
 * Tests MCP tool discovery and routing via the GoofReMCPServer adapter.
 * Run: npx jest tests/unit/mcp-server.test.ts --ci
 */

import { GoofReMCPServer } from '../../packages/mcp-server/src/GoofReMCPServer';

// ─── Mock Orchestrator ────────────────────────────────────────────────────────

function makeMockOrchestrator(processResult: unknown = { ucpId: 'gmc::P1' }): {
  process: jest.Mock;
  getRegisteredPlugins: jest.Mock;
} {
  return {
    process: jest.fn().mockResolvedValue(processResult),
    getRegisteredPlugins: jest.fn().mockReturnValue([{ id: 'google-merchant', version: '2.0.0' }]),
  };
}

// ─── GoofReMCPServer Tests ────────────────────────────────────────────────────

describe('GoofReMCPServer', () => {
  describe('listTools()', () => {
    it('returns exactly 4 tools', () => {
      const server = new GoofReMCPServer(makeMockOrchestrator(), {
        defaultPluginId: 'google-merchant',
      });
      const tools = server.listTools();
      expect(tools).toHaveLength(4);
    });

    it('includes goofre_get_product with required payload field', () => {
      const server = new GoofReMCPServer(makeMockOrchestrator(), {
        defaultPluginId: 'google-merchant',
      });
      const tools = server.listTools();
      const productTool = tools.find((t) => t.name === 'goofre_get_product');
      expect(productTool).toBeDefined();
      expect(productTool?.inputSchema.required).toContain('payload');
    });

    it('includes goofre_process_cart tool', () => {
      const server = new GoofReMCPServer(makeMockOrchestrator(), {
        defaultPluginId: 'google-merchant',
      });
      const tools = server.listTools();
      expect(tools.map((t) => t.name)).toContain('goofre_process_cart');
    });
  });

  describe('callTool()', () => {
    it('routes goofre_get_product to orchestrator.process with eventType=product', async () => {
      const mockOrchestrator = makeMockOrchestrator({ ucpId: 'gmc::P1', title: 'Widget' });
      const server = new GoofReMCPServer(mockOrchestrator, { defaultPluginId: 'google-merchant' });

      const result = await server.callTool('goofre_get_product', {
        payload: {
          offerId: 'P1',
          title: 'Widget',
          price: { value: '9.99', currency: 'USD' },
          availability: 'in_stock',
        },
      });

      expect(mockOrchestrator.process).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'product', pluginId: 'google-merchant' })
      );
      expect(result.isError).toBeFalsy();
      expect(result.content[0]?.text).toContain('gmc::P1');
    });

    it('uses pluginId from args when provided, overriding the default', async () => {
      const mockOrchestrator = makeMockOrchestrator();
      const server = new GoofReMCPServer(mockOrchestrator, { defaultPluginId: 'google-merchant' });

      await server.callTool('goofre_get_product', {
        pluginId: 'shopify',
        payload: {},
      });

      expect(mockOrchestrator.process).toHaveBeenCalledWith(
        expect.objectContaining({ pluginId: 'shopify' })
      );
    });

    it('returns isError=true for unknown tool name', async () => {
      const server = new GoofReMCPServer(makeMockOrchestrator(), {
        defaultPluginId: 'google-merchant',
      });
      const result = await server.callTool('goofre_unknown_tool', { payload: {} });
      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toMatch(/Unknown tool/);
    });

    it('returns isError=true and error message when orchestrator throws', async () => {
      const mockOrchestrator = {
        process: jest.fn().mockRejectedValue(new Error('Plugin not registered')),
        getRegisteredPlugins: jest.fn().mockReturnValue([]),
      };
      const server = new GoofReMCPServer(mockOrchestrator, { defaultPluginId: 'google-merchant' });

      const result = await server.callTool('goofre_get_product', { payload: {} });
      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain('Plugin not registered');
    });
  });

  describe('getServerInfo()', () => {
    it('returns server name and registered plugins', () => {
      const server = new GoofReMCPServer(makeMockOrchestrator(), {
        defaultPluginId: 'google-merchant',
      });
      const info = server.getServerInfo();
      expect(info.name).toBe('GoofRe ACO MCP Server');
      expect(info.plugins).toHaveLength(1);
      expect(info.plugins[0]?.id).toBe('google-merchant');
    });
  });
});
