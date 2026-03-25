/**
 * UCP (Unified Commerce Protocol) Schema Definitions v1.1
 *
 * Aligned with:
 *   - Google Universal Commerce Protocol (NRF launch Jan 2026, updated Mar 2026)
 *   - Google Merchant API v1 (GA August 2025)
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
 * Loyalty / member pricing program.
 * Added: GMC Merchant API v1 (July 2025 member pricing policy)
 * and UCP Identity Linking (March 2026).
 */
export interface UCPLoyaltyProgram {
  /** Name of the loyalty program, e.g. "MyBrand Rewards" */
  programLabel: string;
  /** Tier within the program, e.g. "Gold" */
  tierLabel?: string;
  /** Member-exclusive price. If set, loyalty members pay this price. */
  price?: UCPMonetaryValue;
  /** Member-exclusive cashback or points per unit */
  loyaltyPoints?: number;
}

/**
 * Sustainability incentive for the product.
 * Added: GMC Merchant API v1 (December 2024 sustainability_incentives field)
 */
export interface UCPSustainability {
  /** Incentive type, e.g. "tax_credit", "rebate", "trade_in" */
  incentiveType: string;
  /** Human-readable description, e.g. "Federal EV Tax Credit up to $7,500" */
  description?: string;
  /** Monetary value of the incentive */
  value?: UCPMonetaryValue;
}

/**
 * UCP checkout eligibility flags.
 * Added: GMC Merchant API v1 FREE_LISTINGS_UCP_CHECKOUT reporting context.
 */
export interface UCPCheckoutEligibility {
  /** Whether this product is eligible for UCP agentic checkout (GMC FREE_LISTINGS_UCP_CHECKOUT) */
  ucpCheckout: boolean;
  /** Reason code if ineligible, for merchant diagnostics */
  ineligibilityReason?: string;
}

/**
 * The canonical product entity for the UCP.
 * Maps to any e-commerce platform's product concept.
 *
 * v1.1 additions (aligned with GMC Merchant API v1 + UCP Mar 2026):
 *   - channel: online/local/omnichannel (GMC multi-channel rules March 2026)
 *   - loyaltyProgram: member pricing (GMC July 2025)
 *   - sustainability: sustainability incentives (GMC December 2024)
 *   - maximumRetailPrice: India MRP field (GMC June 2025)
 *   - ucpEligibility: UCP checkout eligibility flag
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
  mpn?: string; // Manufacturer Part Number

  /**
   * Sales channel: "online" (web), "local" (in-store), "omnichannel" (both).
   * GMC March 2026: online attributes are the default; create distinct product
   * IDs when online and in-store values differ.
   */
  channel?: 'online' | 'local' | 'omnichannel';

  /** Loyalty / member pricing program data (GMC July 2025) */
  loyaltyProgram?: UCPLoyaltyProgram;

  /** Sustainability incentive (GMC December 2024 sustainability_incentives field) */
  sustainability?: UCPSustainability;

  /**
   * Maximum Retail Price — required for India market (GMC June 2025).
   * AI agents must display MRP alongside selling price in IN locale.
   */
  maximumRetailPrice?: UCPMonetaryValue;

  /** UCP agentic checkout eligibility (GMC FREE_LISTINGS_UCP_CHECKOUT context) */
  ucpEligibility?: UCPCheckoutEligibility;
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
  | 'order.partially_refunded'
  | 'order.return_requested' // UCP post-order workflow (Mar 2026 roadmap)
  | 'order.return_completed'; // UCP post-order workflow (Mar 2026 roadmap)

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

// ─── UCPCartEvent ─────────────────────────────────────────────────────────────

export type UCPCartAction =
  | 'cart.created'
  | 'cart.item_added'
  | 'cart.item_removed'
  | 'cart.item_updated'
  | 'cart.saved'
  | 'cart.abandoned'
  | 'cart.checkout_initiated';

export interface UCPCartLineItem {
  productUcpId: string;
  variantId?: string;
  title: string;
  quantity: number;
  unitPrice: UCPMonetaryValue;
  /** True if this item is eligible for UCP agentic checkout */
  ucpCheckoutEligible?: boolean;
}

/**
 * A shopping cart event — multi-item cart management.
 *
 * Added: UCP Cart API (March 2026 update).
 * AI agents can now add, save, and modify multi-item carts directly via UCP.
 * This type carries the normalized cart state after each agent action.
 */
export interface UCPCartEvent extends UCPMetadata {
  cartId: string;
  action: UCPCartAction;
  customerId?: string;
  /** Anonymized session ID for unauthenticated carts */
  sessionId?: string;
  lineItems: UCPCartLineItem[];
  subtotal: UCPMonetaryValue;
  currency: string;
  occurredAt: UCPTimestamp;
  /** Whether this cart is eligible for one-click UCP checkout */
  ucpCheckoutEligible: boolean;
}

// ─── UCPFulfillmentUpdate ─────────────────────────────────────────────────────

export type UCPFulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'returned';

/**
 * A shipping / fulfillment lifecycle update for a placed order.
 *
 * Added: UCP post-order workflow (UCP roadmap, partially live March 2026).
 * Allows AI agents to report order status, tracking, and delivery confirmation.
 */
export interface UCPFulfillmentUpdate extends UCPMetadata {
  orderId: string;
  fulfillmentId: string;
  status: UCPFulfillmentStatus;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: UCPTimestamp;
  deliveredAt?: UCPTimestamp;
  updatedAt: UCPTimestamp;
  lineItemIds?: string[]; // subset of order line items in this fulfillment
}

// ─── UCPReturnEvent ───────────────────────────────────────────────────────────

export type UCPReturnReason =
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'no_longer_needed'
  | 'arrived_late'
  | 'damaged_in_shipping'
  | 'other';

export type UCPReturnStatus =
  | 'requested'
  | 'approved'
  | 'denied'
  | 'items_received'
  | 'refund_issued'
  | 'exchange_issued';

/**
 * A return or refund request event.
 *
 * Added: UCP post-order workflow (UCP roadmap, March 2026).
 */
export interface UCPReturnEvent extends UCPMetadata {
  returnId: string;
  orderId: string;
  status: UCPReturnStatus;
  reason: UCPReturnReason;
  customerId?: string;
  lineItems: UCPOrderLineItem[];
  refundAmount?: UCPMonetaryValue;
  requestedAt: UCPTimestamp;
  resolvedAt?: UCPTimestamp;
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
  | 'margin_compression'
  | 'feed_quality_issue' // Maps to GMC Issue Resolution API diagnostic content
  | 'ucp_eligibility_blocked'; // Product blocked from UCP checkout — actionable fix available

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
 *
 * v1.1: Added `feed_quality_issue` and `ucp_eligibility_blocked` insight types
 * to expose GMC Issue Resolution API diagnostic content via the UCP schema.
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
 *
 * v1.1: Added normalizeCart() and normalizeFulfillment() for UCP Mar 2026 events.
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
  /**
   * Transform raw cart event payload into a UCPCartEvent.
   * Added: UCP Cart API (March 2026)
   */
  normalizeCart?: (raw: unknown) => Promise<UCPCartEvent>;
  /**
   * Transform raw fulfillment update into a UCPFulfillmentUpdate.
   * Added: UCP post-order workflow (March 2026 roadmap)
   */
  normalizeFulfillment?: (raw: unknown) => Promise<UCPFulfillmentUpdate>;
  /** Optional: validate the HMAC signature of an incoming webhook */
  validateWebhookSignature?: (payload: Buffer, signature: string, secret: string) => boolean;
}

// ─── Event Types ──────────────────────────────────────────────────────────────

export type UCPEvent =
  | UCPProduct
  | UCPInventorySnapshot
  | UCPOrderEvent
  | UCPCartEvent
  | UCPFulfillmentUpdate
  | UCPReturnEvent
  | UCPInsight;

export type UCPEventType =
  | 'product'
  | 'inventory'
  | 'order'
  | 'cart'
  | 'fulfillment'
  | 'return'
  | 'insight';

export interface UCPEventEnvelope {
  eventType: UCPEventType;
  payload: UCPEvent;
  pluginId: string;
  processedAt: string;
}
