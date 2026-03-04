import { createHmac, timingSafeEqual } from 'crypto';
import type { IGoofRePlugin } from '../types/ucp.schema.js';

export interface WebhookProcessorConfig {
    /** Default HMAC algorithm if not specified per-plugin (default: sha256) */
    defaultAlgorithm?: string;
    /** Maximum webhook payload size in bytes (default: 1MB) */
    maxPayloadSizeBytes?: number;
    /** Enable debug logging */
    debug?: boolean;
}

export interface WebhookValidationResult {
    valid: boolean;
    pluginId: string;
    reason?: string | undefined;
}

export interface ParsedWebhookPayload {
    pluginId: string;
    raw: unknown;
    receivedAt: string;
    signatureValid: boolean;
}

const DEFAULT_CONFIG: Required<WebhookProcessorConfig> = {
    defaultAlgorithm: 'sha256',
    maxPayloadSizeBytes: 1_048_576, // 1MB
    debug: false,
};

/**
 * WebhookProcessor — Unified Webhook Validation & Dispatch
 *
 * Handles inbound webhooks from any registered plugin's platform.
 * Responsibilities:
 * 1. HMAC signature validation (timing-safe comparison)
 * 2. Payload size enforcement
 * 3. JSON parsing and type-safe extraction
 * 4. Routing to the appropriate plugin-specific normalizer
 *
 * Each plugin may optionally provide its own `validateWebhookSignature()`
 * method. If not provided, a standard HMAC-SHA256 check is used.
 *
 * @example
 * ```typescript
 * const processor = new WebhookProcessor();
 * processor.registerPluginSecret('shopify', process.env.SHOPIFY_WEBHOOK_SECRET!);
 *
 * // In your Express route handler:
 * app.post('/webhooks/:pluginId', async (req, res) => {
 *   const result = await processor.validate(
 *     req.params.pluginId,
 *     req.rawBody,
 *     req.headers['x-webhook-signature'] as string
 *   );
 *   if (!result.valid) return res.status(401).json({ error: result.reason });
 *
 *   const parsed = processor.parse(req.params.pluginId, req.rawBody);
 *   // → dispatch parsed.raw to orchestrator.process(...)
 * });
 * ```
 */
export class WebhookProcessor {
    private readonly config: Required<WebhookProcessorConfig>;
    /** pluginId → HMAC secret */
    private readonly secrets = new Map<string, string>();
    /** pluginId → plugin instance (for custom signature validators) */
    private readonly plugins = new Map<string, IGoofRePlugin>();

    constructor(config: WebhookProcessorConfig = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Register an HMAC secret for a given plugin's webhook endpoint.
     * This secret must match what the platform uses to sign its payloads.
     */
    registerPluginSecret(pluginId: string, secret: string): void {
        this.secrets.set(pluginId, secret);
        this.debugLog(`Registered webhook secret for plugin: ${pluginId}`);
    }

    /**
     * Attach a plugin instance for custom signature validation support.
     */
    attachPlugin(plugin: IGoofRePlugin): void {
        this.plugins.set(plugin.id, plugin);
    }

    /**
     * Validate the HMAC signature of an incoming webhook payload.
     * Uses timing-safe comparison to prevent timing attacks.
     *
     * @param pluginId - The plugin that owns this webhook endpoint
     * @param rawPayload - The raw request body Buffer (before any parsing)
     * @param signature - The signature header from the platform (e.g. "sha256=abc123…")
     */
    validate(
        pluginId: string,
        rawPayload: Buffer,
        signature: string
    ): WebhookValidationResult {
        // Payload size guard
        if (rawPayload.length > this.config.maxPayloadSizeBytes) {
            return {
                valid: false,
                pluginId,
                reason: `Payload size ${rawPayload.length} bytes exceeds limit of ${this.config.maxPayloadSizeBytes} bytes`,
            };
        }

        const secret = this.secrets.get(pluginId);
        if (!secret) {
            return {
                valid: false,
                pluginId,
                reason: `No webhook secret registered for plugin "${pluginId}"`,
            };
        }

        // Use plugin's custom validator if available
        const plugin = this.plugins.get(pluginId);
        if (plugin?.validateWebhookSignature) {
            const isValid = plugin.validateWebhookSignature(rawPayload, signature, secret);
            return {
                valid: isValid,
                pluginId,
                reason: isValid ? undefined : 'Custom plugin signature validation failed',
            };
        }

        // Default: HMAC-SHA256 validation
        // Strip common prefixes like "sha256=", "v0=", etc.
        const cleanSig = signature.includes('=') ? signature.split('=').slice(1).join('=') : signature;

        try {
            const expectedSig = createHmac(this.config.defaultAlgorithm, secret)
                .update(rawPayload)
                .digest('hex');

            const expectedBuf = Buffer.from(expectedSig, 'utf8');
            const receivedBuf = Buffer.from(cleanSig, 'utf8');

            // Timing-safe comparison — prevent HMAC oracle attacks
            if (expectedBuf.length !== receivedBuf.length) {
                return { valid: false, pluginId, reason: 'Signature length mismatch' };
            }

            const isValid = timingSafeEqual(expectedBuf, receivedBuf);
            return {
                valid: isValid,
                pluginId,
                reason: isValid ? undefined : 'HMAC signature mismatch',
            };
        } catch (err) {
            return {
                valid: false,
                pluginId,
                reason: `Signature validation error: ${err instanceof Error ? err.message : 'unknown'}`,
            };
        }
    }

    /**
     * Parse a raw webhook payload Buffer into a typed structure.
     * Call this after `validate()` confirms the signature is valid.
     *
     * @throws {Error} If the payload is not valid JSON
     */
    parse(pluginId: string, rawPayload: Buffer, signatureValid = false): ParsedWebhookPayload {
        let parsed: unknown;

        try {
            parsed = JSON.parse(rawPayload.toString('utf8')) as unknown;
        } catch {
            throw new Error(
                `[WebhookProcessor] Failed to parse JSON payload from plugin "${pluginId}"`
            );
        }

        return {
            pluginId,
            raw: parsed,
            receivedAt: new Date().toISOString(),
            signatureValid,
        };
    }

    /**
     * All-in-one: validate and parse in a single call.
     * @throws {Error} if signature is invalid (strict mode)
     */
    validateAndParse(
        pluginId: string,
        rawPayload: Buffer,
        signature: string
    ): ParsedWebhookPayload {
        const validation = this.validate(pluginId, rawPayload, signature);

        if (!validation.valid) {
            throw new Error(
                `[WebhookProcessor] Webhook rejected for plugin "${pluginId}": ${validation.reason}`
            );
        }

        return this.parse(pluginId, rawPayload, true);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private debugLog(message: string): void {
        if (this.config.debug) {
            console.info(`[WebhookProcessor] ${message}`);
        }
    }
}
