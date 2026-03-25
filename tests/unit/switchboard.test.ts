/**
 * Unit Tests: SwitchboardOrchestrator
 *
 * Tests the actual compiled source at packages/core-engine/src/orchestrator/SwitchboardOrchestrator.ts
 * These are real unit tests — not mocks of the subject under test.
 *
 * Run: npx jest tests/unit/ --ci
 */

import { SwitchboardOrchestrator } from '../../packages/core-engine/src/orchestrator/SwitchboardOrchestrator.js';
import type { IGoofRePlugin, UCPProduct } from '../../packages/core-engine/src/types/ucp.schema.js';
import type { RawEvent } from '../../packages/core-engine/src/orchestrator/SwitchboardOrchestrator.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Factory: create a minimal valid UCPProduct */
function makeUCPProduct(overrides: Partial<UCPProduct> = {}): UCPProduct {
  return {
    ucpId: 'test::PROD-001',
    ucpVersion: '1.0',
    sourceId: 'PROD-001',
    sourcePlatform: 'test',
    normalizedAt: new Date().toISOString(),
    title: 'Test Widget',
    status: 'active',
    price: { amount: 19.99, currency: 'USD' },
    inventory: { available: 10, reserved: 0, total: 10, locationId: 'warehouse-a' },
    ...overrides,
  };
}

/** Factory: create a minimal IGoofRePlugin implementation */
function makePlugin(id = 'test-plugin', overrides: Partial<IGoofRePlugin> = {}): IGoofRePlugin {
  return {
    id,
    version: '1.0.0',
    normalizeProduct: async () => makeUCPProduct({ ucpId: `${id}::PROD-001`, sourcePlatform: id }),
    ...overrides,
  };
}

// ─── SwitchboardOrchestrator Unit Tests ──────────────────────────────────────

describe('SwitchboardOrchestrator', () => {
  // ── Plugin Registry ──────────────────────────────────────────────────────

  describe('registerPlugin', () => {
    it('registers a plugin and lists it in getRegisteredPlugins()', () => {
      const orchestrator = new SwitchboardOrchestrator();
      const plugin = makePlugin('shopify');
      orchestrator.registerPlugin(plugin);

      const registered = orchestrator.getRegisteredPlugins();
      expect(registered).toHaveLength(1);
      expect(registered[0]).toMatchObject({ id: 'shopify', version: '1.0.0' });
    });

    it('throws if the same plugin id is registered twice', () => {
      const orchestrator = new SwitchboardOrchestrator();
      const plugin = makePlugin('duplicate-plugin');
      orchestrator.registerPlugin(plugin);

      expect(() => orchestrator.registerPlugin(plugin)).toThrow(/already registered/);
    });

    it('throws if plugin registry exceeds maxPlugins', () => {
      const orchestrator = new SwitchboardOrchestrator({ maxPlugins: 2 });
      orchestrator.registerPlugin(makePlugin('plugin-a'));
      orchestrator.registerPlugin(makePlugin('plugin-b'));

      expect(() => orchestrator.registerPlugin(makePlugin('plugin-c'))).toThrow(/capacity/);
    });

    it('fires the plugin:registered event after successful registration', () => {
      const orchestrator = new SwitchboardOrchestrator();
      const events: unknown[] = [];
      orchestrator.on('plugin:registered', (e) => events.push(e));

      orchestrator.registerPlugin(makePlugin('gmc'));

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ pluginId: 'gmc', version: '1.0.0' });
    });

    it('calls plugin.onRegister lifecycle hook if defined', async () => {
      const orchestrator = new SwitchboardOrchestrator();
      let hookCalled = false;

      const plugin = makePlugin('lifecycle-plugin', {
        onRegister: async () => {
          hookCalled = true;
        },
      });

      orchestrator.registerPlugin(plugin);
      // onRegister is fire-and-forget — wait a tick
      await new Promise((r) => setImmediate(r));

      expect(hookCalled).toBe(true);
    });
  });

  describe('deregisterPlugin', () => {
    it('removes a registered plugin and returns true', () => {
      const orchestrator = new SwitchboardOrchestrator();
      orchestrator.registerPlugin(makePlugin('remove-me'));

      const removed = orchestrator.deregisterPlugin('remove-me');

      expect(removed).toBe(true);
      expect(orchestrator.getRegisteredPlugins()).toHaveLength(0);
    });

    it('returns false when attempting to deregister an unknown plugin', () => {
      const orchestrator = new SwitchboardOrchestrator();
      const removed = orchestrator.deregisterPlugin('not-registered');
      expect(removed).toBe(false);
    });

    it('fires plugin:deregistered event', () => {
      const orchestrator = new SwitchboardOrchestrator();
      const events: unknown[] = [];
      orchestrator.on('plugin:deregistered', (e) => events.push(e));

      orchestrator.registerPlugin(makePlugin('byebye'));
      orchestrator.deregisterPlugin('byebye');

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ pluginId: 'byebye' });
    });
  });

  // ── process() ────────────────────────────────────────────────────────────

  describe('process()', () => {
    it('normalizes a raw event and returns a UCPProduct', async () => {
      const orchestrator = new SwitchboardOrchestrator();
      orchestrator.registerPlugin(makePlugin('gmc'));

      const rawEvent: RawEvent = {
        pluginId: 'gmc',
        eventType: 'product',
        payload: { id: 'PROD-001', name: 'Widget', price: '9.99' },
      };

      const result = (await orchestrator.process(rawEvent)) as UCPProduct;

      expect(result.ucpId).toBe('gmc::PROD-001');
      expect(result.sourcePlatform).toBe('gmc');
    });

    it('throws if pluginId is not registered', async () => {
      const orchestrator = new SwitchboardOrchestrator();

      await expect(
        orchestrator.process({ pluginId: 'unknown', eventType: 'product', payload: {} })
      ).rejects.toThrow(/No plugin registered for pluginId: "unknown"/);
    });

    it('throws if plugin does not implement the requested normalizer', async () => {
      const orchestrator = new SwitchboardOrchestrator();
      // Plugin with only normalizeProduct — no normalizeOrder
      orchestrator.registerPlugin(makePlugin('partial-plugin'));

      await expect(
        orchestrator.process({ pluginId: 'partial-plugin', eventType: 'order', payload: {} })
      ).rejects.toThrow(/does not implement normalizeOrder/);
    });

    it('emits typed event on the correct channel', async () => {
      const orchestrator = new SwitchboardOrchestrator();
      orchestrator.registerPlugin(makePlugin('emitter-plugin'));

      const received: unknown[] = [];
      orchestrator.on('product', (p) => received.push(p));

      await orchestrator.process({
        pluginId: 'emitter-plugin',
        eventType: 'product',
        payload: {},
      });

      expect(received).toHaveLength(1);
      expect((received[0] as UCPProduct).ucpId).toBe('emitter-plugin::PROD-001');
    });

    it('emits ucp:event catch-all envelope for every processed event', async () => {
      const orchestrator = new SwitchboardOrchestrator();
      orchestrator.registerPlugin(makePlugin('envelope-plugin'));

      const envelopes: unknown[] = [];
      orchestrator.on('ucp:event', (e) => envelopes.push(e));

      await orchestrator.process({
        pluginId: 'envelope-plugin',
        eventType: 'product',
        payload: {},
      });

      expect(envelopes).toHaveLength(1);
      expect(envelopes[0]).toMatchObject({
        eventType: 'product',
        pluginId: 'envelope-plugin',
      });
    });

    it('increments getProcessedCount() after each successful process()', async () => {
      const orchestrator = new SwitchboardOrchestrator();
      orchestrator.registerPlugin(makePlugin('counter-plugin'));

      expect(orchestrator.getProcessedCount()).toBe(0);

      await orchestrator.process({ pluginId: 'counter-plugin', eventType: 'product', payload: {} });
      await orchestrator.process({ pluginId: 'counter-plugin', eventType: 'product', payload: {} });

      expect(orchestrator.getProcessedCount()).toBe(2);
    });

    it('times out if plugin normalization exceeds pluginTimeoutMs', async () => {
      const orchestrator = new SwitchboardOrchestrator({ pluginTimeoutMs: 50 });

      const slowPlugin = makePlugin('slow-plugin', {
        normalizeProduct: async () => {
          await new Promise((r) => setTimeout(r, 200)); // 200ms > 50ms timeout
          return makeUCPProduct();
        },
      });
      orchestrator.registerPlugin(slowPlugin);

      await expect(
        orchestrator.process({ pluginId: 'slow-plugin', eventType: 'product', payload: {} })
      ).rejects.toThrow(/timed out/);
    });

    it('throws a clear error when insight eventType is used (insights are ACO-generated)', async () => {
      const orchestrator = new SwitchboardOrchestrator();
      orchestrator.registerPlugin(makePlugin('gmc'));

      await expect(
        orchestrator.process({ pluginId: 'gmc', eventType: 'insight', payload: {} })
      ).rejects.toThrow(/InsightEngine/);
    });
  });
});
