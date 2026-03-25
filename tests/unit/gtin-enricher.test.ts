/**
 * Unit Tests: GTINEnricher
 *
 * Tests GS1 GTIN-8/12/13/14 validation and enrichment logic.
 * Run: npx jest tests/unit/gtin-enricher.test.ts --ci
 */

import {
  validateGTIN,
  enrichProductWithGTIN,
} from '../../packages/core-engine/src/enrichers/GTINEnricher';
import type { UCPProduct } from '../../packages/core-engine/src/types/ucp.schema';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMinimalProduct(overrides: Partial<UCPProduct> = {}): UCPProduct {
  return {
    ucpId: 'test::PROD-001',
    ucpVersion: '1.1',
    sourceId: 'PROD-001',
    sourcePlatform: 'test',
    normalizedAt: new Date().toISOString(),
    title: 'Test Product',
    status: 'active',
    price: { amount: 9.99, currency: 'USD' },
    inventory: { available: 5, reserved: 0, locationId: 'warehouse-a' },
    ...overrides,
  };
}

// ─── validateGTIN Tests ───────────────────────────────────────────────────────

describe('validateGTIN', () => {
  describe('valid GTINs', () => {
    it('validates a correct GTIN-12 (UPC-A)', () => {
      // Coca-Cola 12oz can — well-known public UPC
      const result = validateGTIN('049000028911');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('GTIN-12');
      expect(result.normalized).toBe('00049000028911');
    });

    it('validates a correct GTIN-13 (EAN-13)', () => {
      // Standard EAN-13 with known-valid checksum
      const result = validateGTIN('5901234123457');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('GTIN-13');
      expect(result.normalized).toBe('05901234123457');
    });

    it('validates a correct GTIN-8', () => {
      // GTIN-8 checksum: digits 0-7 alternating weights
      const result = validateGTIN('96385074');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('GTIN-8');
      expect(result.normalized).toBe('00000096385074');
    });

    it('validates a correct GTIN-14', () => {
      const result = validateGTIN('10614141000415');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('GTIN-14');
    });

    it('strips whitespace before validation', () => {
      const result = validateGTIN('  049000028911  ');
      expect(result.valid).toBe(true);
    });

    it('strips dashes before validation', () => {
      const result = validateGTIN('0-49000-02891-1');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid GTINs', () => {
    it('rejects a GTIN-12 with wrong check digit', () => {
      const result = validateGTIN('049000028910'); // last digit changed to 0
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Invalid checksum digit/);
    });

    it('rejects input with non-digit characters', () => {
      const result = validateGTIN('04900002891X');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/must contain only digits/);
    });

    it('rejects input with wrong length (e.g. 10 digits)', () => {
      const result = validateGTIN('0490000289');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Invalid GTIN length 10/);
    });
  });
});

// ─── enrichProductWithGTIN Tests ──────────────────────────────────────────────

describe('enrichProductWithGTIN', () => {
  it('returns product unchanged when no gtin is present', () => {
    const product = makeMinimalProduct();
    const enriched = enrichProductWithGTIN(product);
    expect(enriched).toEqual(product);
  });

  it('normalizes a valid GTIN to 14-digit form', () => {
    const product = makeMinimalProduct({ gtin: '049000028911' });
    const enriched = enrichProductWithGTIN(product);
    expect(enriched.gtin).toBe('00049000028911');
  });

  it('preserves all other product fields when enriching', () => {
    const product = makeMinimalProduct({
      gtin: '049000028911',
      brand: 'Coca-Cola',
      tags: ['beverage'],
    });
    const enriched = enrichProductWithGTIN(product);
    expect(enriched.brand).toBe('Coca-Cola');
    expect(enriched.tags).toContain('beverage');
    expect(enriched.title).toBe('Test Product');
  });

  it('removes invalid GTIN and adds a tag flagging the issue', () => {
    const product = makeMinimalProduct({ gtin: '049000028910' }); // bad checksum
    const enriched = enrichProductWithGTIN(product);
    expect(enriched.gtin).toBeUndefined();
    expect(enriched.tags?.some((t) => t.startsWith('gtin_invalid:'))).toBe(true);
  });

  it('does not mutate the original product object', () => {
    const product = makeMinimalProduct({ gtin: '049000028911' });
    enrichProductWithGTIN(product);
    // Original should be unchanged
    expect(product.gtin).toBe('049000028911');
  });
});
