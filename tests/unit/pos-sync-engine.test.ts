/**
 * Unit Tests: PosSyncEngine
 *
 * Tests the actual compiled source at packages/core-engine/src/orchestrator/PosSyncEngine.ts
 *
 * Run: npx jest tests/unit/ --ci
 */

import { PosSyncEngine } from '../../packages/core-engine/src/orchestrator/PosSyncEngine.js';
import type { PosRawInventoryEvent } from '../../packages/core-engine/src/orchestrator/PosSyncEngine.js';
import type { UCPInventorySnapshot } from '../../packages/core-engine/src/types/ucp.schema.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makePosEvent(overrides: Partial<PosRawInventoryEvent> = {}): PosRawInventoryEvent {
  return {
    productId: 'PROD-001',
    platform: 'shopify',
    quantityOnHand: 100,
    quantityReserved: 5,
    locationId: 'warehouse-a',
    occurredAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── PosSyncEngine Unit Tests ─────────────────────────────────────────────────

describe('PosSyncEngine', () => {
  // ── Queue Management ─────────────────────────────────────────────────────

  describe('ingest() and getQueueSize()', () => {
    it('increments the queue size on each unique product+location event', () => {
      const engine = new PosSyncEngine();
      expect(engine.getQueueSize()).toBe(0);

      engine.ingest(makePosEvent({ productId: 'P1', locationId: 'loc-a' }));
      engine.ingest(makePosEvent({ productId: 'P2', locationId: 'loc-a' }));

      expect(engine.getQueueSize()).toBe(2);
    });

    it('deduplicates events — same productId+locationId keeps only the latest', () => {
      const engine = new PosSyncEngine();

      engine.ingest(makePosEvent({ productId: 'P1', locationId: 'loc-a', quantityOnHand: 50 }));
      engine.ingest(makePosEvent({ productId: 'P1', locationId: 'loc-a', quantityOnHand: 75 })); // override

      expect(engine.getQueueSize()).toBe(1); // deduplicated to 1
    });
  });

  // ── flush() ──────────────────────────────────────────────────────────────

  describe('flush()', () => {
    it('returns an empty array when the queue is empty', async () => {
      const engine = new PosSyncEngine();
      const result = await engine.flush();
      expect(result).toHaveLength(0);
    });

    it('normalizes a POS event into a valid UCPInventorySnapshot', async () => {
      const engine = new PosSyncEngine();

      engine.ingest(
        makePosEvent({
          productId: 'SKU-001',
          platform: 'shopify',
          quantityOnHand: 100,
          quantityReserved: 10,
          locationId: 'warehouse-a',
        })
      );

      const snapshots = await engine.flush();
      expect(snapshots).toHaveLength(1);

      const snapshot = snapshots[0] as UCPInventorySnapshot;
      expect(snapshot.ucpId).toBe('shopify::SKU-001');
      expect(snapshot.ucpVersion).toBe('1.0');
      expect(snapshot.sourcePlatform).toBe('shopify');
      expect(snapshot.snapshot.available).toBe(90); // 100 - 10 reserved
      expect(snapshot.snapshot.reserved).toBe(10);
      expect(snapshot.snapshot.total).toBe(100);
      expect(snapshot.snapshot.locationId).toBe('warehouse-a');
    });

    it('calculates delta correctly on successive events for the same product', async () => {
      const engine = new PosSyncEngine();

      // First flush: available = 80
      engine.ingest(
        makePosEvent({
          productId: 'P1',
          locationId: 'loc-a',
          quantityOnHand: 80,
          quantityReserved: 0,
        })
      );
      const [first] = await engine.flush();

      expect(first!.delta).toBe(80); // 80 - 0 (no prior snapshot)

      // Second flush: available = 60 → delta = -20
      engine.ingest(
        makePosEvent({
          productId: 'P1',
          locationId: 'loc-a',
          quantityOnHand: 60,
          quantityReserved: 0,
        })
      );
      const [second] = await engine.flush();

      expect(second!.delta).toBe(-20); // 60 - 80 = -20
    });

    it('clears the queue after flushing', async () => {
      const engine = new PosSyncEngine();
      engine.ingest(makePosEvent());
      await engine.flush();

      expect(engine.getQueueSize()).toBe(0);
    });

    it('calls the onFlush callback with the normalized snapshots', async () => {
      const engine = new PosSyncEngine();
      const received: UCPInventorySnapshot[][] = [];

      engine.onFlush((snapshots) => {
        received.push(snapshots);
      });

      engine.ingest(makePosEvent({ productId: 'P1', locationId: 'loc-a' }));
      engine.ingest(makePosEvent({ productId: 'P2', locationId: 'loc-a' }));
      await engine.flush();

      expect(received).toHaveLength(1);
      expect(received[0]).toHaveLength(2);
    });
  });

  // ── Batch Size Trigger ────────────────────────────────────────────────────

  describe('automatic batch flush on batchSize reached', () => {
    it('auto-flushes when queue reaches batchSize', async () => {
      const flushedBatches: UCPInventorySnapshot[][] = [];
      const engine = new PosSyncEngine({ batchSize: 3 });

      engine.onFlush((snapshots) => flushedBatches.push(snapshots));

      engine.ingest(makePosEvent({ productId: 'P1', locationId: 'loc-a' }));
      engine.ingest(makePosEvent({ productId: 'P2', locationId: 'loc-a' }));
      engine.ingest(makePosEvent({ productId: 'P3', locationId: 'loc-a' })); // triggers auto-flush

      // Give the async flush a tick to complete
      await new Promise((r) => setImmediate(r));

      expect(flushedBatches).toHaveLength(1);
      expect(flushedBatches[0]).toHaveLength(3);
    });
  });

  // ── Start / Stop Lifecycle ────────────────────────────────────────────────

  describe('start() and stop()', () => {
    it('stop() performs a final flush of pending events', async () => {
      const engine = new PosSyncEngine({ flushIntervalMs: 60_000 }); // very long interval
      const received: UCPInventorySnapshot[][] = [];

      engine.onFlush((s) => received.push(s));
      engine.start();

      engine.ingest(makePosEvent({ productId: 'P1', locationId: 'loc-a' }));

      await engine.stop(); // final flush happens here

      expect(received).toHaveLength(1);
      expect(received[0]).toHaveLength(1);
    });

    it('start() is idempotent — calling it twice does not duplicate flush intervals', async () => {
      const engine = new PosSyncEngine({ flushIntervalMs: 60_000 });
      engine.start();
      engine.start(); // second call should be a no-op
      await engine.stop();
      // If not idempotent, this would throw or cause timer leaks — test passes if no errors
    });
  });
});
