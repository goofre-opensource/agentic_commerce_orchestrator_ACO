import type {
  IGoofRePlugin,
  UCPProduct,
  UCPInventorySnapshot,
  UCPCartEvent,
  UCPFulfillmentUpdate,
} from '@goofre/core-engine';
import { createHmac } from 'crypto';

// ─── Merchant API v1 Raw Types ────────────────────────────────────────────────
// Reference: https://developers.google.com/merchant/api/reference/rest/v1/accounts.products
// Replaces the deprecated Content API for Shopping (deprecated 2025-08-18, shutdown 2026-08-18)

interface MerchantAPIProduct {
  /** Merchant-defined unique product identifier */
  offerId: string;
  title: string;
  description?: string;
  brand?: string;
  link?: string;
  mobileLink?: string;
  imageLink?: string;
  additionalImageLinks?: string[];
  /**
   * Merchant API v1 expands availability values.
   * Note: underscore format replaces space format from Content API.
   */
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  price: { value: string; currency: string };
  salePrice?: { value: string; currency: string };
  gtin?: string;
  mpn?: string;
  productTypes?: string[];
  customLabels?: Record<string, string>;
  /**
   * Sales channel — added in GMC multi-channel rules (March 2026).
   * "online" = web-only, "local" = in-store, "local_and_online" = both.
   */
  channel?: 'online' | 'local' | 'local_and_online';
  /**
   * Loyalty programs — GMC Merchant API v1 (July 2025 member pricing policy).
   */
  loyaltyPrograms?: Array<{
    programLabel: string;
    tierLabel?: string;
    price?: { value: string; currency: string };
    loyaltyPoints?: number;
  }>;
  /**
   * Sustainability incentives — GMC Merchant API v1 (December 2024).
   */
  sustainabilityIncentives?: Array<{
    type: string;
    percentage?: number;
  }>;
  /**
   * Maximum Retail Price — GMC Merchant API v1 (June 2025, India market).
   */
  maximumRetailPrice?: { value: string; currency: string };
  /**
   * UCP checkout eligibility — FREE_LISTINGS_UCP_CHECKOUT reporting context.
   */
  freeListingsUcpCheckout?: boolean;
}

interface MerchantAPIRegionalInventory {
  /** Corresponds to Merchant API regionCode e.g. "US-CA" */
  regionCode: string;
  price?: { value: string; currency: string };
  salePrice?: { value: string; currency: string };
  availability?: MerchantAPIProduct['availability'];
  /** Quantity currently in stock at this region */
  quantity?: number;
}

interface MerchantAPILocalInventory {
  /** GMC store code */
  storeCode: string;
  quantity: number;
  price?: { value: string; currency: string };
  salePrice?: { value: string; currency: string };
  availability?: MerchantAPIProduct['availability'];
}

// ─── Google Merchant Plugin v2.0 ─────────────────────────────────────────────

/**
 * GoogleMerchantPlugin v2.0 — Reference plugin for Google Merchant Center.
 *
 * ⚠️  v1.x targeted the deprecated Content API for Shopping.
 *     This v2.0 release migrates to the **Merchant API v1** (GA August 2025).
 *
 * Content API Shutdown: August 18, 2026.
 *
 * API Reference: https://developers.google.com/merchant/api
 *
 * @example
 * ```typescript
 * import { SwitchboardOrchestrator } from '@goofre/core-engine';
 * import { GoogleMerchantPlugin } from '@goofre/plugins';
 *
 * const orchestrator = new SwitchboardOrchestrator();
 * orchestrator.registerPlugin(new GoogleMerchantPlugin({ merchantId: '12345678' }));
 *
 * // Process a product from Merchant API v1 response
 * const ucpProduct = await orchestrator.process({
 *   pluginId: 'google-merchant',
 *   eventType: 'product',
 *   payload: merchantApiV1ProductResponse,
 * });
 * ```
 */
export class GoogleMerchantPlugin implements IGoofRePlugin {
  readonly id = 'google-merchant';
  readonly version = '2.0.0';

  private readonly merchantId: string;

  constructor(config: { merchantId: string }) {
    this.merchantId = config.merchantId;
  }

  async onRegister(): Promise<void> {
    console.info(
      `[GoogleMerchantPlugin v2.0] Registered for Merchant ID: ${this.merchantId}. ` +
        `Using Merchant API v1 (Content API deprecated 2025-08-18).`
    );
  }

  /**
   * Transforms a Merchant API v1 product resource into a UCPProduct.
   *
   * Field mapping (Merchant API v1 → UCP v1.1):
   * - `offerId`               → sourceId / ucpId
   * - `price.value` (string)  → price.amount (number)
   * - `availability`          → status + inventory
   * - `productTypes`          → category
   * - `channel`               → channel (online/local/omnichannel)
   * - `loyaltyPrograms[0]`    → loyaltyProgram
   * - `sustainabilityIncentives[0]` → sustainability
   * - `maximumRetailPrice`    → maximumRetailPrice
   * - `freeListingsUcpCheckout` → ucpEligibility.ucpCheckout
   */
  async normalizeProduct(raw: unknown): Promise<UCPProduct> {
    const product = raw as MerchantAPIProduct;

    const isAvailable = product.availability === 'in_stock';
    const priceAmount = parseFloat(product.price.value);
    const salePriceAmount = product.salePrice ? parseFloat(product.salePrice.value) : undefined;

    // Normalize channel: Merchant API "local_and_online" → UCP "omnichannel"
    const channel =
      product.channel === 'local_and_online' ? 'omnichannel' : (product.channel ?? 'online');

    // Loyalty: map first loyalty program (primary)
    const loyaltyProgram = product.loyaltyPrograms?.[0]
      ? {
          programLabel: product.loyaltyPrograms[0].programLabel,
          ...(product.loyaltyPrograms[0].tierLabel !== undefined && {
            tierLabel: product.loyaltyPrograms[0].tierLabel,
          }),
          ...(product.loyaltyPrograms[0].price !== undefined && {
            price: {
              amount: parseFloat(product.loyaltyPrograms[0].price.value),
              currency: product.loyaltyPrograms[0].price.currency,
            },
          }),
          ...(product.loyaltyPrograms[0].loyaltyPoints !== undefined && {
            loyaltyPoints: product.loyaltyPrograms[0].loyaltyPoints,
          }),
        }
      : undefined;

    // Sustainability: map first incentive
    const sustainability = product.sustainabilityIncentives?.[0]
      ? { incentiveType: product.sustainabilityIncentives[0].type }
      : undefined;

    return {
      ucpId: `google-merchant::${product.offerId}`,
      ucpVersion: '1.1',
      sourceId: product.offerId,
      sourcePlatform: 'google-merchant',
      normalizedAt: new Date().toISOString(),

      title: product.title,
      ...(product.description !== undefined && { description: product.description }),
      ...(product.brand !== undefined && { brand: product.brand }),
      ...(product.productTypes !== undefined && { category: product.productTypes }),
      status: isAvailable
        ? 'active'
        : product.availability === 'preorder'
          ? 'inactive'
          : 'inactive',

      price: {
        amount: salePriceAmount ?? priceAmount,
        currency: (product.salePrice ?? product.price).currency,
      },
      ...(salePriceAmount !== undefined && {
        compareAtPrice: {
          amount: priceAmount,
          currency: product.price.currency,
        },
      }),

      inventory: {
        // Merchant API product feed does not include store-level quantities.
        // Use regional/local inventory endpoints for precise stock levels.
        available: isAvailable ? 1 : 0,
        reserved: 0,
        locationId: `merchant::${this.merchantId}`,
      },

      imageUrls: [
        ...(product.imageLink ? [product.imageLink] : []),
        ...(product.additionalImageLinks ?? []),
      ].filter(Boolean),

      ...(product.gtin !== undefined && { gtin: product.gtin }),
      ...(product.mpn !== undefined && { mpn: product.mpn }),
      channel,
      ...(loyaltyProgram !== undefined && { loyaltyProgram }),
      ...(sustainability !== undefined && { sustainability }),
      ...(product.maximumRetailPrice !== undefined && {
        maximumRetailPrice: {
          amount: parseFloat(product.maximumRetailPrice.value),
          currency: product.maximumRetailPrice.currency,
        },
      }),
      ...(product.freeListingsUcpCheckout !== undefined && {
        ucpEligibility: { ucpCheckout: product.freeListingsUcpCheckout },
      }),
    } satisfies UCPProduct;
  }

  /**
   * Transforms a Merchant API v1 localInventory resource into a UCPInventorySnapshot.
   * Use this for Local Inventory Ads (LIA) data from the Merchant API v1 localInventories endpoint.
   *
   * Merchant API endpoint: GET accounts/{account}/products/{product}/localInventories
   */
  async normalizeInventory(raw: unknown): Promise<UCPInventorySnapshot> {
    const update = raw as MerchantAPILocalInventory;
    const now = new Date();

    return {
      ucpId: `google-merchant::local::${update.storeCode}`,
      ucpVersion: '1.1',
      sourceId: update.storeCode,
      sourcePlatform: 'google-merchant',
      normalizedAt: now.toISOString(),

      productUcpId: `google-merchant::${update.storeCode}`,
      snapshot: {
        available: update.quantity,
        reserved: 0,
        total: update.quantity,
        locationId: update.storeCode,
      },
      delta: 0, // Delta resolved by PosSyncEngine — unknown at plugin boundary
      reason: 'adjustment',

      capturedAt: {
        iso8601: now.toISOString(),
        epochMs: now.getTime(),
      },
    };
  }

  /**
   * Normalize a Merchant API regionalInventory update into a UCPInventorySnapshot.
   * Useful for region-scoped pricing/availability (e.g. US-CA, US-TX).
   *
   * Merchant API endpoint: GET accounts/{account}/products/{product}/regionalInventories
   */
  normalizeRegionalInventory(
    raw: MerchantAPIRegionalInventory,
    productOfferId: string
  ): UCPInventorySnapshot {
    const now = new Date();
    return {
      ucpId: `google-merchant::regional::${raw.regionCode}::${productOfferId}`,
      ucpVersion: '1.1',
      sourceId: `${raw.regionCode}::${productOfferId}`,
      sourcePlatform: 'google-merchant',
      normalizedAt: now.toISOString(),
      productUcpId: `google-merchant::${productOfferId}`,
      snapshot: {
        available: raw.availability === 'in_stock' ? 1 : 0,
        reserved: 0,
        locationId: raw.regionCode,
      },
      delta: 0,
      reason: 'adjustment',
      capturedAt: { iso8601: now.toISOString(), epochMs: now.getTime() },
    };
  }

  /**
   * Normalize a UCP Cart payload (UCP Cart API, March 2026).
   * Called when an AI agent adds items to a cart via the UCP protocol.
   */
  async normalizeCart(raw: unknown): Promise<UCPCartEvent> {
    // Cart events from Google UCP arrive as structured JSON payloads.
    // This normalizer maps the UCP wire format to our internal UCPCartEvent type.
    const cart = raw as {
      cartId: string;
      action: string;
      customerId?: string;
      sessionId?: string;
      items: Array<{
        productId: string;
        variantId?: string;
        title: string;
        quantity: number;
        price: { value: string; currency: string };
        ucpCheckoutEligible?: boolean;
      }>;
      currency: string;
    };

    const now = new Date();
    const lineItems = cart.items.map((item) => ({
      productUcpId: `google-merchant::${item.productId}`,
      ...(item.variantId !== undefined && { variantId: item.variantId }),
      title: item.title,
      quantity: item.quantity,
      unitPrice: {
        amount: parseFloat(item.price.value),
        currency: item.price.currency,
      },
      ...(item.ucpCheckoutEligible !== undefined && {
        ucpCheckoutEligible: item.ucpCheckoutEligible,
      }),
    }));

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.unitPrice.amount * item.quantity,
      0
    );

    return {
      ucpId: `google-merchant::cart::${cart.cartId}`,
      ucpVersion: '1.1',
      sourceId: cart.cartId,
      sourcePlatform: 'google-merchant',
      normalizedAt: now.toISOString(),
      cartId: cart.cartId,
      action: cart.action as UCPCartEvent['action'],
      ...(cart.customerId !== undefined && { customerId: cart.customerId }),
      ...(cart.sessionId !== undefined && { sessionId: cart.sessionId }),
      lineItems,
      subtotal: { amount: subtotal, currency: cart.currency },
      currency: cart.currency,
      occurredAt: { iso8601: now.toISOString(), epochMs: now.getTime() },
      ucpCheckoutEligible: lineItems.every((i) => i.ucpCheckoutEligible !== false),
    };
  }

  /**
   * Normalize a fulfillment update from the Merchant API order tracking endpoint.
   * Added: UCP post-order workflow (March 2026 roadmap).
   */
  async normalizeFulfillment(raw: unknown): Promise<UCPFulfillmentUpdate> {
    const update = raw as {
      orderId: string;
      fulfillmentId: string;
      status: string;
      carrier?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      estimatedDeliveryDate?: string;
    };
    const now = new Date();
    return {
      ucpId: `google-merchant::fulfillment::${update.fulfillmentId}`,
      ucpVersion: '1.1',
      sourceId: update.fulfillmentId,
      sourcePlatform: 'google-merchant',
      normalizedAt: now.toISOString(),
      orderId: update.orderId,
      fulfillmentId: update.fulfillmentId,
      status: update.status as UCPFulfillmentUpdate['status'],
      ...(update.carrier !== undefined && { carrier: update.carrier }),
      ...(update.trackingNumber !== undefined && { trackingNumber: update.trackingNumber }),
      ...(update.trackingUrl !== undefined && { trackingUrl: update.trackingUrl }),
      ...(update.estimatedDeliveryDate !== undefined && {
        estimatedDelivery: {
          iso8601: update.estimatedDeliveryDate,
          epochMs: new Date(update.estimatedDeliveryDate).getTime(),
        },
      }),
      updatedAt: { iso8601: now.toISOString(), epochMs: now.getTime() },
    };
  }

  /**
   * Validate Google Cloud Pub/Sub push subscription HMAC-SHA1 signature.
   * This is unchanged in Merchant API v1 — Google still signs push messages
   * using HMAC-SHA1 with the subscription's push token.
   *
   * Merchant API Pub/Sub docs:
   * https://developers.google.com/merchant/api/guides/products/notifications
   */
  validateWebhookSignature(payload: Buffer, signature: string, secret: string): boolean {
    const expected = createHmac('sha1', secret).update(payload).digest('base64');
    return expected === signature;
  }
}
