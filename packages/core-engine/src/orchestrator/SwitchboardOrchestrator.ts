import { EventEmitter } from 'events';
import type {
  IGoofRePlugin,
  UCPEvent,
  UCPEventEnvelope,
  UCPEventType,
} from '../types/ucp.schema.js';

// Re-export RawEvent locally
export interface RawEvent {
  /** The registered plugin ID that owns this event */
  pluginId: string;
  /** The type of UCP event to normalize this into */
  eventType: UCPEventType;
  /** The raw, unvalidated platform payload */
  payload: unknown;
}

export interface OrchestratorConfig {
  /** Enable verbose debug logging */
  debug?: boolean;
  /** Maximum number of plugins that can be registered */
  maxPlugins?: number;
  /** Milliseconds before a plugin normalization call times out */
  pluginTimeoutMs?: number;
}

const DEFAULT_CONFIG: Required<OrchestratorConfig> = {
  debug: false,
  maxPlugins: 50,
  pluginTimeoutMs: 10_000,
};

/**
 * SwitchboardOrchestrator — The Central Hub of the Goofre ACO
 *
 * ALL commerce data flows through this class. It manages the plugin registry,
 * validates that output conforms to UCP schema types, and emits typed events
 * for downstream consumers (AI agents, dashboards, analytics systems).
 *
 * ARCHITECTURE RULE: No data may be emitted from the Switchboard without
 * passing through a registered plugin's normalizer. Raw platform data
 * must never be emitted downstream.
 *
 * @example
 * ```typescript
 * const orchestrator = new SwitchboardOrchestrator({ debug: true });
 * orchestrator.registerPlugin(new GoogleMerchantPlugin());
 * orchestrator.on('product', (product) => console.log(product));
 *
 * await orchestrator.process({
 *   pluginId: 'google-merchant',
 *   eventType: 'product',
 *   payload: rawGMCProductData,
 * });
 * ```
 */
export class SwitchboardOrchestrator extends EventEmitter {
  private readonly plugins = new Map<string, IGoofRePlugin>();
  private readonly config: Required<OrchestratorConfig>;
  private processedCount = 0;

  constructor(config: OrchestratorConfig = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a plugin with the Switchboard.
   * The plugin's `onRegister` lifecycle hook is called asynchronously.
   *
   * @throws {Error} If a plugin with the same `id` is already registered
   * @throws {Error} If the plugin registry is at capacity
   */
  registerPlugin(plugin: IGoofRePlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(
        `[Switchboard] Plugin "${plugin.id}" is already registered. ` +
          `Deregister it first or use a unique plugin.id.`
      );
    }

    if (this.plugins.size >= this.config.maxPlugins) {
      throw new Error(
        `[Switchboard] Plugin registry is at capacity (${this.config.maxPlugins}). ` +
          `Increase maxPlugins in OrchestratorConfig.`
      );
    }

    this.plugins.set(plugin.id, plugin);
    this.debugLog(`Plugin registered: ${plugin.id}@${plugin.version}`);

    // Fire-and-forget the lifecycle hook
    if (plugin.onRegister) {
      void plugin.onRegister(this).catch((err: unknown) => {
        console.error(`[Switchboard] Plugin "${plugin.id}" onRegister failed:`, err);
      });
    }

    this.emit('plugin:registered', { pluginId: plugin.id, version: plugin.version });
  }

  /**
   * Deregister a plugin by its ID.
   */
  deregisterPlugin(pluginId: string): boolean {
    const removed = this.plugins.delete(pluginId);
    if (removed) {
      this.debugLog(`Plugin deregistered: ${pluginId}`);
      this.emit('plugin:deregistered', { pluginId });
    }
    return removed;
  }

  /**
   * Process a raw platform event through the UCP normalization pipeline.
   *
   * 1. Finds the registered plugin for `event.pluginId`
   * 2. Calls the appropriate normalizer method on the plugin
   * 3. Validates the output is a valid UCP schema type
   * 4. Wraps in a UCPEventEnvelope and emits on the typed channel
   *
   * @throws {Error} If no plugin is registered for the given pluginId
   * @throws {Error} If the plugin does not support the requested eventType
   * @throws {Error} If normalization times out
   */
  async process(event: RawEvent): Promise<UCPEvent> {
    const plugin = this.plugins.get(event.pluginId);

    if (!plugin) {
      throw new Error(
        `[Switchboard] No plugin registered for pluginId: "${event.pluginId}". ` +
          `Available plugins: [${Array.from(this.plugins.keys()).join(', ')}]`
      );
    }

    this.debugLog(`Processing ${event.eventType} from plugin "${event.pluginId}"`);

    const normalized = await this.runWithTimeout(
      this.callPluginNormalizer(plugin, event),
      this.config.pluginTimeoutMs,
      `Plugin "${event.pluginId}" normalization timed out after ${this.config.pluginTimeoutMs}ms`
    );

    this.processedCount++;

    const envelope: UCPEventEnvelope = {
      eventType: event.eventType,
      payload: normalized,
      pluginId: event.pluginId,
      processedAt: new Date().toISOString(),
    };

    // Emit on the typed channel (e.g. 'product', 'inventory', 'order', 'insight')
    this.emit(event.eventType, normalized);
    // Also emit a catch-all envelope for cross-cutting concerns (logging, analytics)
    this.emit('ucp:event', envelope);

    return normalized;
  }

  /**
   * Get a snapshot of the current registry state.
   */
  getRegisteredPlugins(): Array<{ id: string; version: string }> {
    return Array.from(this.plugins.values()).map((p) => ({
      id: p.id,
      version: p.version,
    }));
  }

  /**
   * Total number of events successfully processed since instantiation.
   */
  getProcessedCount(): number {
    return this.processedCount;
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private async callPluginNormalizer(plugin: IGoofRePlugin, event: RawEvent): Promise<UCPEvent> {
    switch (event.eventType) {
      case 'product': {
        if (!plugin.normalizeProduct) {
          throw new Error(`Plugin "${plugin.id}" does not implement normalizeProduct()`);
        }
        return plugin.normalizeProduct(event.payload);
      }
      case 'inventory': {
        if (!plugin.normalizeInventory) {
          throw new Error(`Plugin "${plugin.id}" does not implement normalizeInventory()`);
        }
        return plugin.normalizeInventory(event.payload);
      }
      case 'order': {
        if (!plugin.normalizeOrder) {
          throw new Error(`Plugin "${plugin.id}" does not implement normalizeOrder()`);
        }
        return plugin.normalizeOrder(event.payload);
      }
      case 'cart': {
        if (!plugin.normalizeCart) {
          throw new Error(
            `Plugin "${plugin.id}" does not implement normalizeCart(). ` +
              `Add normalizeCart() to handle UCP Cart API events.`
          );
        }
        return plugin.normalizeCart(event.payload);
      }
      case 'fulfillment': {
        if (!plugin.normalizeFulfillment) {
          throw new Error(
            `Plugin "${plugin.id}" does not implement normalizeFulfillment(). ` +
              `Add normalizeFulfillment() to handle UCP post-order tracking events.`
          );
        }
        return plugin.normalizeFulfillment(event.payload);
      }
      case 'return': {
        // Returns are typically generated by the ACO from order events,
        // not normalized from raw data. Plugins may implement this if
        // their platform sends explicit return webhooks (e.g. Shopify Returns API).
        throw new Error(
          `[Switchboard] UCPReturnEvent routing is handled by the ACO pipeline. ` +
            `Emit 'order.return_requested' via normalizeOrder() instead.`
        );
      }
      case 'insight': {
        throw new Error(
          `[Switchboard] Insights are generated by the ACO pipeline — they are not ` +
            `normalized from raw data. Use the InsightEngine instead.`
        );
      }
      default: {
        const _exhaustive: never = event.eventType;
        throw new Error(`[Switchboard] Unknown eventType: ${String(_exhaustive)}`);
      }
    }
  }

  private async runWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    message: string
  ): Promise<T> {
    let timer: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timer!);
      return result;
    } catch (err) {
      clearTimeout(timer!);
      throw err;
    }
  }

  private debugLog(message: string): void {
    if (this.config.debug) {
      console.info(`[Switchboard] ${message}`);
    }
  }
}
