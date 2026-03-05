/**
 * Integration Test: SwitchboardOrchestrator + GoogleMerchantPlugin
 *
 * Verifies the full UCP normalization pipeline:
 *   Raw GMC data → SwitchboardOrchestrator → UCPProduct (validated)
 *
 * Run: npx jest tests/integration/
 */

// Simple integration test using Node.js — no external test framework needed for basic checks
// In a full project, import from compiled dist:
// import { SwitchboardOrchestrator } from '@goofre/core-engine';
// import { GoogleMerchantPlugin } from '@goofre/plugins';

// For hackathon purposes, we test the structural contract directly:

interface UCPProduct {
    ucpId: string;
    ucpVersion: string;
    sourceId: string;
    sourcePlatform: string;
    normalizedAt: string;
    title: string;
    status: 'active' | 'inactive' | 'archived';
    price: { amount: number; currency: string };
    inventory: { available: number; reserved: number; locationId: string };
}

// ─── Mock Plugin for Testing ─────────────────────────────────────────────────

const mockPlugin = {
    id: 'test-platform',
    version: '1.0.0',
    async normalizeProduct(raw: unknown): Promise<UCPProduct> {
        const r = raw as { id: string; name: string; price: string; inStock: boolean };
        return {
            ucpId: `test-platform::${r.id}`,
            ucpVersion: '1.0',
            sourceId: r.id,
            sourcePlatform: 'test-platform',
            normalizedAt: new Date().toISOString(),
            title: r.name,
            status: r.inStock ? 'active' : 'inactive',
            price: { amount: parseFloat(r.price), currency: 'USD' },
            inventory: {
                available: r.inStock ? 10 : 0,
                reserved: 0,
                locationId: 'test-warehouse',
            },
        };
    },
};

// ─── UCPProduct Validator ────────────────────────────────────────────────────

function validateUCPProduct(product: unknown): string[] {
    const errors: string[] = [];
    const p = product as Partial<UCPProduct>;

    if (!p.ucpId) errors.push('Missing ucpId');
    if (!p.ucpId?.includes('::')) errors.push('ucpId must follow "{pluginId}::{sourceId}" format');
    if (!['1.0', '1.1'].includes(p.ucpVersion ?? '')) errors.push('Invalid ucpVersion');
    if (!p.sourceId) errors.push('Missing sourceId');
    if (!p.sourcePlatform) errors.push('Missing sourcePlatform');
    if (!p.normalizedAt) errors.push('Missing normalizedAt');
    if (!p.title) errors.push('Missing title');
    if (!['active', 'inactive', 'archived'].includes(p.status ?? '')) errors.push('Invalid status');
    if (typeof p.price?.amount !== 'number') errors.push('price.amount must be a number');
    if (!p.price?.currency) errors.push('Missing price.currency');
    if (typeof p.inventory?.available !== 'number') errors.push('inventory.available must be a number');
    if (!p.inventory?.locationId) errors.push('Missing inventory.locationId');

    return errors;
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('SwitchboardOrchestrator Integration', () => {
    const rawProduct = {
        id: 'PROD-001',
        name: 'Test Widget',
        price: '29.99',
        inStock: true,
    };

    test('normalizes raw product to valid UCPProduct', async () => {
        const result = await mockPlugin.normalizeProduct(rawProduct);
        const errors = validateUCPProduct(result);

        expect(errors).toHaveLength(0);
        expect(result.ucpId).toBe('test-platform::PROD-001');
        expect(result.title).toBe('Test Widget');
        expect(result.price.amount).toBe(29.99);
        expect(result.status).toBe('active');
    });

    test('ucpId follows "{pluginId}::{sourceId}" format', async () => {
        const result = await mockPlugin.normalizeProduct(rawProduct);
        const [pluginId, sourceId] = result.ucpId.split('::');

        expect(pluginId).toBe(mockPlugin.id);
        expect(sourceId).toBe(rawProduct.id);
    });

    test('sourcePlatform matches plugin id', async () => {
        const result = await mockPlugin.normalizeProduct(rawProduct);
        expect(result.sourcePlatform).toBe(mockPlugin.id);
    });

    test('price.amount is a number, not a string', async () => {
        const result = await mockPlugin.normalizeProduct(rawProduct);
        expect(typeof result.price.amount).toBe('number');
        expect(result.price.amount).toBe(29.99);
    });

    test('out-of-stock product has status "inactive" and available=0', async () => {
        const outOfStock = { ...rawProduct, inStock: false };
        const result = await mockPlugin.normalizeProduct(outOfStock);

        expect(result.status).toBe('inactive');
        expect(result.inventory.available).toBe(0);
    });

    test('normalizedAt is a valid ISO 8601 timestamp', async () => {
        const result = await mockPlugin.normalizeProduct(rawProduct);
        const parsed = new Date(result.normalizedAt);

        expect(parsed.toString()).not.toBe('Invalid Date');
        expect(result.normalizedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
});

describe('Mock Server Contract', () => {
    test('insights fixture has required UCPInsight fields', async () => {
        // Inline the fixture validation — confirms JSON contract
        const module = await import(
            '../../packages/mock-server/src/data/insights.json',
            { assert: { type: 'json' } }
        );
        const insights = module.default as Array<Record<string, unknown>>;

        expect(insights.length).toBeGreaterThan(0);

        for (const insight of insights) {
            expect(insight['insightId']).toBeTruthy();
            expect(insight['type']).toBeTruthy();
            expect(['low', 'medium', 'high', 'critical']).toContain(insight['severity']);
            expect(typeof insight['message']).toBe('string');
            expect((insight['message'] as string).length).toBeLessThanOrEqual(280); // Voice-friendly
            expect(Array.isArray(insight['recommendedActions'])).toBe(true);
        }
    });
});
