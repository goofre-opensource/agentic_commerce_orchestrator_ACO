/**
 * UCP (Unified Commerce Protocol) Schema Definitions v1.0
 *
 * These are the canonical, strictly-typed data schemas designed natively for
 * AI agent consumption (Gemini, GPT-4, Claude, etc.).
 *
 * ARCHITECTURE RULE: ALL data leaving the SwitchboardOrchestrator MUST conform
 * to one of these types. No raw platform-specific types may be emitted.
 */

// ─── Shared Primitives ────────────────────────────────────────────────────────

export interface UCPMonetaryValue {
    /** ISO 4217 currency code, e.g. "USD" */
    currency: string;
    /** Numeric amount — always use string-safe storage for financial precision */
    amount: number;
}

export interface UCPTimestamp {
    /** ISO 8601 timestamp: "2026-03-04T10:15:00Z" */
    iso8601: string;
    /** Unix epoch milliseconds */
    epochMs: number;
}

export interface UCPMetadata {
    /** Protocol version for forward-compatibility */
    ucpVersion: '1.0' | '1.1';
    /** When this record was normalized through the ACO pipeline */
    normalizedAt: string;
    /** Source platform identifier (e.g. "google-merchant", "shopify", "square") */
    sourcePlatform: string;
    /** Raw platform-native ID before normalization */
    sourceId: string;
    /** Stable ACO-generated composite ID: "{platform}::{sourceId}" */
    ucpId: string;
}

// ─── UCPProduct ───────────────────────────────────────────────────────────────

export interface UCPInventoryLevel {
    /** Available quantity (not reserved) */
    available: number;
    /** Reserved quantity (orders in processing) */
    reserved: number;
    /** Total on-hand: available + reserved */
    total?: number;
    /** Location identifier for multi-location inventory */
    locationId: string;
    /** Human-readable location name */
    locationName?: string;
}

export interface UCPProductVariant {
    variantId: string;
    title: string;
    price: UCPMonetaryValue;
    sku?: string;
    barcode?: string;
    inventory: UCPInventoryLevel;
    attributes: Record<string, string>; // e.g. { color: "red", size: "M" }
}

/**
 * The canonical product entity for the UCP.
 * Maps to any e-commerce platform's product concept.
 */
export interface UCPProduct extends UCPMetadata {
    title: string;
    description?: string;
    brand?: string;
    category?: string[];
    status: 'active' | 'inactive' | 'archived';
    price: UCPMonetaryValue;
    compareAtPrice?: UCPMonetaryValue;
    inventory: UCPInventoryLevel;
    variants?: UCPProductVariant[];
    imageUrls?: string[];
    tags?: string[];
    gtin?: string; // Global Trade Item Number (UPC, EAN, etc.)
    mpn?: string;  // Manufacturer Part Number
}

// ─── UCPInventorySnapshot ─────────────────────────────────────────────────────

/**
 * A point-in-time inventory state capture.
 * Emitted by the PosSyncEngine when stock levels change.
 */
export interface UCPInventorySnapshot extends UCPMetadata {
    productUcpId: string;
    variantId?: string;
    snapshot: UCPInventoryLevel;
    previousSnapshot?: UCPInventoryLevel;
    /** Change delta: positive = stock added, negative = stock removed */
    delta: number;
    reason: 'sale' | 'restock' | 'adjustment' | 'transfer' | 'damage' | 'return';
    capturedAt: UCPTimestamp;
}

// ─── UCPOrderEvent ────────────────────────────────────────────────────────────

export type UCPOrderEventType =
    | 'order.created'
    | 'order.paid'
    | 'order.fulfilled'
    | 'order.cancelled'
    | 'order.refunded'
    | 'order.partially_refunded';

export interface UCPOrderLineItem {
    productUcpId: string;
    variantId?: string;
    title: string;
    quantity: number;
    unitPrice: UCPMonetaryValue;
    totalPrice: UCPMonetaryValue;
}

/**
 * An order lifecycle event flowing through the ACO pipeline.
 */
export interface UCPOrderEvent extends UCPMetadata {
    orderId: string;
    eventType: UCPOrderEventType;
    customerId?: string;
    lineItems: UCPOrderLineItem[];
    subtotal: UCPMonetaryValue;
    tax?: UCPMonetaryValue;
    shipping?: UCPMonetaryValue;
    total: UCPMonetaryValue;
    currency: string;
    occurredAt: UCPTimestamp;
}

// ─── UCPInsight ───────────────────────────────────────────────────────────────

export type UCPInsightType =
    | 'inventory_anomaly'
    | 'ad_spend_opportunity'
    | 'pricing_anomaly'
    | 'demand_spike'
    | 'stockout_risk'
    | 'overstock_risk'
    | 'conversion_drop'
    | 'margin_compression';

export type UCPInsightSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface UCPInsightRecommendedAction {
    action: string;
    confidence: number; // 0.0 - 1.0
    estimatedImpact?: string;
}

/**
 * An AI-generated, actionable commerce intelligence event.
 * This is the primary output consumed by the Merchant Dashboard Voice Agent.
 *
 * DESIGN INTENT: These are designed to be read aloud by a voice AI to a merchant,
 * triggering a human-in-the-loop approval workflow.
 */
export interface UCPInsight extends UCPMetadata {
    insightId: string;
    type: UCPInsightType;
    severity: UCPInsightSeverity;
    /** Human-readable summary. Optimized for voice delivery (<= 280 chars). */
    message: string;
    /** Detailed explanation for dashboard display */
    detail?: string;
    /** Affected product IDs */
    affectedProductUcpIds?: string[];
    /** Quantified business impact */
    impactValue?: UCPMonetaryValue;
    recommendedActions: UCPInsightRecommendedAction[];
    /** Whether merchant has acknowledged this insight */
    acknowledged: boolean;
    generatedAt: UCPTimestamp;
    expiresAt?: UCPTimestamp;
}

// ─── Plugin Interface ─────────────────────────────────────────────────────────

/**
 * The contract every Goofre plugin must implement.
 * Implement this interface to add a new commerce platform data source.
 */
export interface IGoofRePlugin {
    /** Unique, stable plugin identifier (kebab-case, e.g. "google-merchant") */
    readonly id: string;
    /** Semantic version of this plugin */
    readonly version: string;
    /** Called once when the plugin is registered with the Switchboard */
    onRegister?: (orchestrator: unknown) => Promise<void>;
    /** Transform raw platform product data into a UCPProduct */
    normalizeProduct?: (raw: unknown) => Promise<UCPProduct>;
    /** Transform raw inventory data into a UCPInventorySnapshot */
    normalizeInventory?: (raw: unknown) => Promise<UCPInventorySnapshot>;
    /** Transform raw order webhook payload into a UCPOrderEvent */
    normalizeOrder?: (raw: unknown) => Promise<UCPOrderEvent>;
    /** Optional: validate the HMAC signature of an incoming webhook */
    validateWebhookSignature?: (payload: Buffer, signature: string, secret: string) => boolean;
}

// ─── Event Types ──────────────────────────────────────────────────────────────

export type UCPEvent = UCPProduct | UCPInventorySnapshot | UCPOrderEvent | UCPInsight;

export type UCPEventType = 'product' | 'inventory' | 'order' | 'insight';

export interface UCPEventEnvelope {
    eventType: UCPEventType;
    payload: UCPEvent;
    pluginId: string;
    processedAt: string;
}
