import type { UCPInventorySnapshot, UCPTimestamp } from '../types/ucp.schema.js';

export interface PosRawInventoryEvent {
  /** Platform-native product ID */
  productId: string;
  /** Platform identifier */
  platform: string;
  /** Current stock quantity at the POS */
  quantityOnHand: number;
  /** Reserved quantity (open orders not yet fulfilled) */
  quantityReserved?: number;
  /** Location/store identifier */
  locationId: string;
  locationName?: string;
  /** Reason for the stock change */
  changeReason?: UCPInventorySnapshot['reason'];
  /** Platform-native timestamp */
  occurredAt: string;
}

export interface PosSyncEngineConfig {
  /** Max events held in the internal queue before flushing */
  batchSize?: number;
  /** Milliseconds between automatic queue flushes */
  flushIntervalMs?: number;
  /** Enable debug logging */
  debug?: boolean;
}

const DEFAULT_CONFIG: Required<PosSyncEngineConfig> = {
  batchSize: 50,
  flushIntervalMs: 5_000,
  debug: false,
};

/**
 * PosSyncEngine — Dedicated Point-of-Sale Inventory Synchronization
 *
 * Manages real-time inventory synchronization from POS systems.
 * Normalizes raw POS events into UCPInventorySnapshot records, handles
 * queue deduplication (last-write-wins per product+location), and supports
 * batch flushing for high-throughput scenarios.
 *
 * ARCHITECTURE: PosSyncEngine sits upstream of the SwitchboardOrchestrator.
 * It produces UCPInventorySnapshot events that are then fed into the Switchboard
 * for emission to downstream consumers.
 *
 * @example
 * ```typescript
 * const posSync = new PosSyncEngine({ batchSize: 20, flushIntervalMs: 2000 });
 * posSync.onFlush((snapshots) => {
 *   snapshots.forEach((s) => orchestrator.emit('inventory', s));
 * });
 * posSync.start();
 *
 * // Ingest raw POS events
 * posSync.ingest({ productId: 'SKU-001', ... });
 * ```
 */
export class PosSyncEngine {
  private readonly config: Required<PosSyncEngineConfig>;
  /** Deduplication map: key = "{productId}::{locationId}" → latest event */
  private readonly dedupeMap = new Map<string, PosRawInventoryEvent>();
  /** Previous snapshots for delta calculation */
  private readonly snapshotHistory = new Map<string, UCPInventorySnapshot>();
  private flushTimer: NodeJS.Timeout | undefined;
  private flushCallback?: (snapshots: UCPInventorySnapshot[]) => void | Promise<void>;
  private running = false;

  constructor(config: PosSyncEngineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a callback that's called each time the queue is flushed.
   */
  onFlush(callback: (snapshots: UCPInventorySnapshot[]) => void | Promise<void>): void {
    this.flushCallback = callback;
  }

  /**
   * Start the automatic flush interval.
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.scheduleFlush();
    this.debugLog('PosSyncEngine started');
  }

  /**
   * Stop the engine and perform a final flush of any queued events.
   */
  async stop(): Promise<void> {
    this.running = false;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
    await this.flush();
    this.debugLog('PosSyncEngine stopped');
  }

  /**
   * Ingest a raw POS inventory event.
   *
   * Uses last-write-wins deduplication: if multiple events arrive for the
   * same product+location before a flush, only the latest is kept.
   * This prevents phantom stock fluctuations from rapid POS updates.
   *
   * If the queue reaches `batchSize`, an immediate flush is triggered.
   */
  ingest(event: PosRawInventoryEvent): void {
    const key = `${event.productId}::${event.locationId}`;
    this.dedupeMap.set(key, event);
    this.debugLog(`Ingested POS event for ${key} (queue size: ${this.dedupeMap.size})`);

    if (this.dedupeMap.size >= this.config.batchSize) {
      this.debugLog('Batch size reached — triggering immediate flush');
      void this.flush();
    }
  }

  /**
   * Immediately normalize and flush all queued POS events.
   * Resets the deduplication map after flushing.
   */
  async flush(): Promise<UCPInventorySnapshot[]> {
    if (this.dedupeMap.size === 0) return [];

    const events = Array.from(this.dedupeMap.values());
    this.dedupeMap.clear();

    const snapshots = events.map((event) => this.normalizeToSnapshot(event));

    if (this.flushCallback) {
      await Promise.resolve(this.flushCallback(snapshots));
    }

    this.debugLog(`Flushed ${snapshots.length} inventory snapshots`);
    return snapshots;
  }

  /**
   * Current number of queued (unflushed) POS events.
   */
  getQueueSize(): number {
    return this.dedupeMap.size;
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private normalizeToSnapshot(event: PosRawInventoryEvent): UCPInventorySnapshot {
    const ucpId = `${event.platform}::${event.productId}`;
    const key = `${event.productId}::${event.locationId}`;
    const previousSnapshot = this.snapshotHistory.get(key);

    const currentAvailable = event.quantityOnHand - (event.quantityReserved ?? 0);
    const previousAvailable = previousSnapshot?.snapshot.available ?? 0;
    const delta = currentAvailable - previousAvailable;

    const now = new Date();
    const capturedAt: UCPTimestamp = {
      iso8601: now.toISOString(),
      epochMs: now.getTime(),
    };

    const snapshot: UCPInventorySnapshot = {
      ucpId,
      ucpVersion: '1.0',
      sourcePlatform: event.platform,
      sourceId: event.productId,
      normalizedAt: now.toISOString(),
      productUcpId: ucpId,
      snapshot: {
        available: currentAvailable,
        reserved: event.quantityReserved ?? 0,
        total: event.quantityOnHand,
        locationId: event.locationId,
        ...(event.locationName ? { locationName: event.locationName } : {}),
      },
      ...(previousSnapshot?.snapshot ? { previousSnapshot: previousSnapshot.snapshot } : {}),
      delta,
      reason: event.changeReason ?? 'adjustment',
      capturedAt,
    };

    // Update history for next delta calculation
    this.snapshotHistory.set(key, snapshot);

    return snapshot;
  }

  private scheduleFlush(): void {
    if (!this.running) return;
    this.flushTimer = setTimeout((): void => {
      void (async () => {
        await this.flush();
        this.scheduleFlush();
      })();
    }, this.config.flushIntervalMs);
  }

  private debugLog(message: string): void {
    if (this.config.debug) {
      console.info(`[PosSyncEngine] ${message}`);
    }
  }
}
