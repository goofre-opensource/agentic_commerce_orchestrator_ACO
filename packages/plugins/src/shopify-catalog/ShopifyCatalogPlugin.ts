import type {
  IGoofRePlugin,
  UCPProduct,
  UCPInventorySnapshot,
  UCPOrderEvent,
  UCPCartEvent,
} from '../../core-engine/src/types/ucp.schema.js';

// ─── Shopify API Types ─────────────────────────────────────────────────────────
// Subset of the Shopify Admin REST API product response we care about.

interface ShopifyImage {
  src: string;
}

interface ShopifyVariant {
  id: number;
  sku: string;
  price: string;
  inventory_quantity: number;
  barcode?: string;
  option1?: string; // size
  option2?: string; // color
  option3?: string; // material
}

interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
}

interface ShopifyProduct {
  id: number;
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  status: 'active' | 'archived' | 'draft';
  published_scope?: 'web' | 'global';
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  metafields?: ShopifyMetafield[];
}

// ─── Shopify REST API Client ───────────────────────────────────────────────────

async function shopifyFetch<T>(
  shop: string,
  accessToken: string,
  path: string,
  signal?: AbortSignal
): Promise<T> {
  const url = `https://${shop}/admin/api/2024-10${path}`;
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    ...(signal != null ? { signal } : {}),
  });

  if (!res.ok) {
    throw new Error(`Shopify API error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

// ─── Normalization Helpers ─────────────────────────────────────────────────────

function ucpId(shop: string, resourceId: number | string): string {
  return `shopify::${shop}::${resourceId}`;
}

function normalizeStatus(status: ShopifyProduct['status']): UCPProduct['status'] {
  if (status === 'active') return 'active';
  if (status === 'archived') return 'archived';
  return 'inactive'; // draft → inactive
}

/**
 * Determine UCP checkout eligibility.
 * A product is UCP-checkout eligible if:
 *   1. Status is active
 *   2. Published scope is 'web' or 'global'
 *   3. At least one variant has inventory > 0
 */
function computeUcpEligibility(product: ShopifyProduct): UCPProduct['ucpEligibility'] {
  if (product.status !== 'active') {
    return { ucpCheckout: false, ineligibilityReason: 'Product is not active' };
  }
  if (product.published_scope !== 'web' && product.published_scope !== 'global') {
    return {
      ucpCheckout: false,
      ineligibilityReason: 'Product is not published to the web channel',
    };
  }
  const hasStock = product.variants.some((v) => v.inventory_quantity > 0);
  if (!hasStock) {
    return { ucpCheckout: false, ineligibilityReason: 'All variants are out of stock' };
  }
  return { ucpCheckout: true };
}

/**
 * Extract loyalty program data from Shopify metafields.
 * Expected metafield namespace: "goofre_loyalty"
 * Keys: program_label, tier_label, member_price, loyalty_points
 */
function extractLoyaltyProgram(
  metafields?: ShopifyMetafield[]
): UCPProduct['loyaltyProgram'] | undefined {
  if (!metafields?.length) return undefined;

  const get = (key: string): string | undefined =>
    metafields.find((m) => m.namespace === 'goofre_loyalty' && m.key === key)?.value;

  const programLabel = get('program_label');
  if (!programLabel) return undefined;

  const memberPriceStr = get('member_price');
  return {
    programLabel,
    tierLabel: get('tier_label'),
    price: memberPriceStr ? { currency: 'USD', amount: parseFloat(memberPriceStr) } : undefined,
    loyaltyPoints: get('loyalty_points') ? parseInt(get('loyalty_points')!) : undefined,
  };
}

// ─── Plugin Class ──────────────────────────────────────────────────────────────

/**
 * ShopifyCatalogPlugin
 *
 * Implements the IGoofRePlugin interface for Shopify stores.
 * Normalizes Shopify Admin API product data → UCPProduct.
 *
 * Configuration (required env vars):
 *   SHOPIFY_SHOP_DOMAIN   — e.g. "mystore.myshopify.com"
 *   SHOPIFY_ACCESS_TOKEN  — Private app admin access token
 *
 * Activated by: CATALOG_PROVIDER=shopify
 */
export class ShopifyCatalogPlugin implements IGoofRePlugin {
  readonly id = 'shopify-catalog';
  readonly version = '1.0.0';

  private readonly shop: string;
  private readonly accessToken: string;

  constructor() {
    const shop = process.env.SHOPIFY_SHOP_DOMAIN;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shop || !token) {
      throw new Error(
        '[ShopifyCatalogPlugin] Missing required env vars: ' +
          'SHOPIFY_SHOP_DOMAIN and SHOPIFY_ACCESS_TOKEN must be set when CATALOG_PROVIDER=shopify.'
      );
    }

    this.shop = shop;
    this.accessToken = token;
  }

  async onRegister(): Promise<void> {
    console.info(`[ShopifyCatalogPlugin] Registered for shop: ${this.shop}`);
  }

  /**
   * Normalizes a raw Shopify product object to UCPProduct.
   * Also fetches metafields if not included in the raw payload.
   */
  async normalizeProduct(raw: unknown): Promise<UCPProduct> {
    const product = raw as ShopifyProduct;
    const shop = this.shop;

    // Aggregate inventory across all variants
    const totalAvailable = product.variants.reduce(
      (sum, v) => sum + Math.max(0, v.inventory_quantity),
      0
    );
    const primaryVariant = product.variants[0];

    return {
      // UCPMetadata
      ucpVersion: '1.1',
      normalizedAt: new Date().toISOString(),
      sourcePlatform: 'shopify',
      sourceId: String(product.id),
      ucpId: ucpId(shop, product.id),

      // Core fields
      title: product.title,
      description: product.body_html?.replace(/<[^>]+>/g, '') ?? undefined,
      brand: product.vendor ?? undefined,
      category: product.product_type ? [product.product_type] : undefined,
      status: normalizeStatus(product.status),
      tags:
        product.tags
          ?.split(',')
          .map((t) => t.trim())
          .filter(Boolean) ?? undefined,

      price: {
        currency: 'USD',
        amount: parseFloat(primaryVariant?.price ?? '0'),
      },

      inventory: {
        available: totalAvailable,
        reserved: 0, // Shopify doesn't surface this in basic product endpoint
        total: totalAvailable,
        locationId: 'default',
      },

      variants: product.variants.map((v) => ({
        variantId: String(v.id),
        title: [v.option1, v.option2, v.option3].filter(Boolean).join(' / ') || 'Default',
        price: { currency: 'USD', amount: parseFloat(v.price) },
        sku: v.sku ?? undefined,
        barcode: v.barcode ?? undefined,
        inventory: {
          available: Math.max(0, v.inventory_quantity),
          reserved: 0,
          total: Math.max(0, v.inventory_quantity),
          locationId: 'default',
        },
        attributes: {
          ...(v.option1 ? { size: v.option1 } : {}),
          ...(v.option2 ? { color: v.option2 } : {}),
          ...(v.option3 ? { material: v.option3 } : {}),
        },
      })),

      imageUrls: product.images.map((i) => i.src),
      channel: product.published_scope === 'global' ? 'omnichannel' : 'online',

      loyaltyProgram: extractLoyaltyProgram(product.metafields),
      ucpEligibility: computeUcpEligibility(product),
    };
  }

  /**
   * Fetch a single product by SKU from the Shopify Admin API.
   * Uses the variant SKU search endpoint.
   */
  async getProductBySku(sku: string): Promise<UCPProduct | null> {
    try {
      const data = await shopifyFetch<{ variants: ShopifyVariant[] }>(
        this.shop,
        this.accessToken,
        `/variants.json?sku=${encodeURIComponent(sku)}&limit=1`,
        AbortSignal.timeout(6000)
      );

      if (!data.variants.length) return null;

      const variantId = data.variants[0].id;
      const productData = await shopifyFetch<{ product: ShopifyProduct }>(
        this.shop,
        this.accessToken,
        `/products.json?variant_id=${variantId}`,
        AbortSignal.timeout(6000)
      );

      if (!productData.product) return null;

      return this.normalizeProduct(productData.product);
    } catch (err) {
      console.error(`[ShopifyCatalogPlugin] getProductBySku(${sku}) failed:`, err);
      return null;
    }
  }

  /**
   * Fetch the first page of published products from Shopify.
   * Returns all as UCPProduct[].
   */
  async listProducts(): Promise<UCPProduct[]> {
    try {
      const data = await shopifyFetch<{ products: ShopifyProduct[] }>(
        this.shop,
        this.accessToken,
        '/products.json?status=active&limit=50',
        AbortSignal.timeout(8000)
      );

      return Promise.all(data.products.map((p) => this.normalizeProduct(p)));
    } catch (err) {
      console.error('[ShopifyCatalogPlugin] listProducts() failed:', err);
      return [];
    }
  }

  // Stubs for methods we don't implement in this plugin
  async normalizeInventory(_raw: unknown): Promise<UCPInventorySnapshot> {
    throw new Error(
      '[ShopifyCatalogPlugin] Use the Shopify InventorySync plugin for inventory normalization.'
    );
  }

  async normalizeOrder(_raw: unknown): Promise<UCPOrderEvent> {
    throw new Error(
      '[ShopifyCatalogPlugin] Use the Shopify Order Webhook plugin for order normalization.'
    );
  }

  async normalizeCart(_raw: unknown): Promise<UCPCartEvent> {
    throw new Error(
      '[ShopifyCatalogPlugin] Cart normalization routes through the UCP Cart API directly.'
    );
  }
}
