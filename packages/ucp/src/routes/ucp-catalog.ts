import { Request, Response } from 'express';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatalogProduct {
    sku: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    stock: number;
    available: boolean;
    native_commerce: boolean;
    gtin?: string;
    brand?: string;
    image_url?: string;
    member_price?: number;
    variants?: Array<{ variant_id: string; attributes: Record<string, string>; price: number; stock: number; sku: string }>;
    last_updated: string;
}

interface ICatalogProvider {
    getProduct(sku: string): Promise<CatalogProduct | null>;
    listProducts(): Promise<CatalogProduct[]>;
}

// ─── Mock Provider ────────────────────────────────────────────────────────────

class MockCatalogProvider implements ICatalogProvider {
    private products: CatalogProduct[] = [
        { sku: 'SHOE-001', title: 'Runner Pro X1', description: 'Lightweight running shoe with responsive foam midsole.', price: 89.99, currency: 'USD', stock: 42, available: true, native_commerce: true, gtin: '00012345600012', brand: 'SpeedStride', member_price: 80.99, last_updated: new Date().toISOString() },
        { sku: 'SHIRT-002', title: 'Goofre Classic Tee', description: 'Everyday cotton T-shirt, pre-shrunk.', price: 34.99, currency: 'USD', stock: 150, available: true, native_commerce: true, gtin: '00012345600029', brand: 'Goofre Apparel', member_price: 31.49, last_updated: new Date().toISOString() },
        { sku: 'HAT-003', title: 'Mesh Cap', description: 'Breathable mesh cap with adjustable strap.', price: 24.99, currency: 'USD', stock: 0, available: false, native_commerce: false, gtin: '00012345600036', brand: 'Goofre Apparel', last_updated: new Date().toISOString() },
        { sku: 'JACKET-007', title: 'Denim Jacket', description: 'Classic mid-weight denim jacket, stonewash finish.', price: 129.99, currency: 'USD', stock: 28, available: true, native_commerce: true, gtin: '00012345600074', brand: 'SpeedStride', member_price: 116.99, last_updated: new Date().toISOString() },
    ];
    async getProduct(sku: string): Promise<CatalogProduct | null> {
        return this.products.find(p => p.sku.toUpperCase() === sku.toUpperCase()) ?? null;
    }
    async listProducts(): Promise<CatalogProduct[]> { return this.products; }
}

// ─── Provider Factory ─────────────────────────────────────────────────────────

function createCatalogProvider(): ICatalogProvider {
    const providerName = process.env.CATALOG_PROVIDER ?? 'mock';
    if (providerName === 'shopify') {
        try {
            const { ShopifyCatalogPlugin } = require('../../plugins/ShopifyCatalogPlugin');
            const plugin = new ShopifyCatalogPlugin();
            return {
                async getProduct(sku: string) { return plugin.getProductBySku(sku); },
                async listProducts() { return plugin.listProducts(); },
            };
        } catch {
            console.warn('[UCP Catalog] Shopify plugin not available — falling back to mock provider.');
        }
    }
    return new MockCatalogProvider();
}

const catalogProvider = createCatalogProvider();

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handleUcpCatalogSku = async (req: Request, res: Response) => {
    const { sku } = req.params;
    const product = await catalogProvider.getProduct(sku);
    if (!product) return res.status(404).json({ error: `SKU "${sku}" not found.`, hint: 'Try SHOE-001, SHIRT-002, HAT-003, or JACKET-007.' });
    return res.status(200).json(product);
};

export const handleUcpCatalogList = async (req: Request, res: Response) => {
    const eligibleOnly = req.query['eligible_only'] === 'true';
    let products = await catalogProvider.listProducts();
    if (eligibleOnly) products = products.filter(p => p.native_commerce && p.available);
    return res.status(200).json({ count: products.length, eligible_only: eligibleOnly, products });
};
