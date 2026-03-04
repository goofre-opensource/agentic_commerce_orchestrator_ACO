import type { IGoofRePlugin, UCPProduct, UCPInventorySnapshot } from '@goofre/core-engine';

// ─── Google Merchant Center Raw Types ────────────────────────────────────────

interface GMCProduct {
    id: string;
    title: string;
    description?: string;
    brand?: string;
    link?: string;
    imageLink?: string;
    availability: 'in stock' | 'out of stock' | 'preorder';
    price: { value: string; currency: string };
    salePrice?: { value: string; currency: string };
    gtin?: string;
    mpn?: string;
    productTypes?: string[];
    customLabels?: Record<string, string>;
}

interface GMCInventoryUpdate {
    productId: string;
    storeCode: string;
    quantity: number;
    price?: { value: string; currency: string };
}

// ─── Google Merchant Plugin ───────────────────────────────────────────────────

/**
 * GoogleMerchantPlugin — Reference plugin for Google Merchant Center integration.
 *
 * Transforms raw Google Content API (Shopping) product and inventory data
 * into UCP-compliant schema types. Use this plugin as the canonical example
 * when building your own Goofre plugin.
 *
 * @example
 * ```typescript
 * import { SwitchboardOrchestrator } from '@goofre/core-engine';
 * import { GoogleMerchantPlugin } from '@goofre/plugins';
 *
 * const orchestrator = new SwitchboardOrchestrator();
 * orchestrator.registerPlugin(new GoogleMerchantPlugin({ merchantId: '12345678' }));
 *
 * const ucpProduct = await orchestrator.process({
 *   pluginId: 'google-merchant',
 *   eventType: 'product',
 *   payload: rawGMCProductFromAPI,
 * });
 * ```
 */
export class GoogleMerchantPlugin implements IGoofRePlugin {
    readonly id = 'google-merchant';
    readonly version = '1.0.0';

    private readonly merchantId: string;

    constructor(config: { merchantId: string }) {
        this.merchantId = config.merchantId;
    }

    async onRegister(): Promise<void> {
        console.info(
            `[GoogleMerchantPlugin] Registered for Merchant ID: ${this.merchantId}`
        );
    }

    /**
     * Transforms a raw GMC product into a UCPProduct.
     *
     * Field mapping:
     * - GMC `id` → UCPProduct `sourceId` / `ucpId`
     * - GMC `price.value` (string) → UCPProduct `price.amount` (number)
     * - GMC `availability` → UCPProduct `status` + inventory
     * - GMC `productTypes` → UCPProduct `category`
     */
    async normalizeProduct(raw: unknown): Promise<UCPProduct> {
        const gmc = raw as GMCProduct;

        const isAvailable = gmc.availability === 'in stock';
        const priceAmount = parseFloat(gmc.price.value);
        const salePriceAmount = gmc.salePrice ? parseFloat(gmc.salePrice.value) : undefined;

        return {
            ucpId: `google-merchant::${gmc.id}`,
            ucpVersion: '1.0',
            sourceId: gmc.id,
            sourcePlatform: 'google-merchant',
            normalizedAt: new Date().toISOString(),

            title: gmc.title,
            description: gmc.description,
            brand: gmc.brand,
            category: gmc.productTypes,
            status: isAvailable ? 'active' : 'inactive',

            price: {
                amount: priceAmount,
                currency: gmc.price.currency,
            },
            ...(salePriceAmount !== undefined && {
                compareAtPrice: {
                    amount: priceAmount,
                    currency: gmc.price.currency,
                },
                price: {
                    amount: salePriceAmount,
                    currency: gmc.salePrice!.currency,
                },
            }),

            inventory: {
                // GMC product feed doesn't include exact quantities — default to 0/1 based on availability
                available: isAvailable ? 1 : 0,
                reserved: 0,
                locationId: `merchant::${this.merchantId}`,
            },

            imageUrls: gmc.imageLink ? [gmc.imageLink] : undefined,
            gtin: gmc.gtin,
            mpn: gmc.mpn,
        };
    }

    /**
     * Transforms a GMC regional inventory update into a UCPInventorySnapshot.
     * Use this for local inventory ads (LIA) data.
     */
    async normalizeInventory(raw: unknown): Promise<UCPInventorySnapshot> {
        const update = raw as GMCInventoryUpdate;
        const now = new Date();

        return {
            ucpId: `google-merchant::${update.productId}`,
            ucpVersion: '1.0',
            sourceId: update.productId,
            sourcePlatform: 'google-merchant',
            normalizedAt: now.toISOString(),

            productUcpId: `google-merchant::${update.productId}`,
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
     * Optional: validate Google Pub/Sub push subscription HMAC signature.
     * Google signs webhooks using HMAC-SHA1 with the subscription's push token.
     */
    validateWebhookSignature(payload: Buffer, signature: string, secret: string): boolean {
        const { createHmac } = require('crypto') as typeof import('crypto');
        const expected = createHmac('sha1', secret).update(payload).digest('base64');
        return expected === signature;
    }
}
