/**
 * GTINEnricher — GS1 GTIN Validation and Normalization Utility
 *
 * Validates GTIN-8, GTIN-12 (UPC-A), GTIN-13 (EAN-13), and GTIN-14
 * format and checksum per the GS1 General Specifications.
 *
 * Why this matters for GMC:
 *   Products with valid GTINs get significantly better visibility in Google
 *   Shopping results. Missing or invalid GTINs trigger "Missing GTIN" feed
 *   quality warnings and can result in product disapproval.
 *
 * Reference: https://www.gs1.org/services/how-calculate-check-digit-manually
 */

import type { UCPProduct } from '../types/ucp.schema.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GTINFormat = 'GTIN-8' | 'GTIN-12' | 'GTIN-13' | 'GTIN-14';

export interface GTINValidationResult {
  /** Whether the GTIN is valid (correct format + correct checksum) */
  valid: boolean;
  /** The detected GTIN format if input is well-formed */
  format?: GTINFormat;
  /** The normalized, zero-padded GTIN string (14 digits) */
  normalized?: string;
  /** Human-readable error message if invalid */
  error?: string;
}

// ─── GTINEnricher ─────────────────────────────────────────────────────────────

/**
 * Validate and enrich a GTIN string per GS1 General Specifications.
 *
 * @example
 * ```typescript
 * import { validateGTIN } from '@goofre/core-engine/enrichers';
 *
 * const result = validateGTIN('012345678905');
 * // { valid: true, format: 'GTIN-12', normalized: '00012345678905' }
 *
 * const bad = validateGTIN('012345678900');
 * // { valid: false, error: 'Invalid checksum digit. Expected 5, got 0.' }
 * ```
 */
export function validateGTIN(gtin: string): GTINValidationResult {
  // Strip whitespace and dashes (common in human-entered GTINs)
  const cleaned = gtin.replace(/[\s-]/g, '');

  // Must be all digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: `GTIN must contain only digits. Got: "${gtin}"` };
  }

  // Determine format by length
  const length = cleaned.length;
  let format: GTINFormat;
  switch (length) {
    case 8:
      format = 'GTIN-8';
      break;
    case 12:
      format = 'GTIN-12';
      break;
    case 13:
      format = 'GTIN-13';
      break;
    case 14:
      format = 'GTIN-14';
      break;
    default:
      return {
        valid: false,
        error: `Invalid GTIN length ${length}. Must be 8, 12, 13, or 14 digits.`,
      };
  }

  // GS1 checksum: alternating weights 3 and 1 from the right, excluding check digit
  const digits = cleaned.split('').map(Number);
  const checkDigit = digits[digits.length - 1]!;
  const payload = digits.slice(0, -1);

  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    // Weight: 3 for odd positions from right (i.e. last payload digit = weight 3), 1 otherwise
    const weight = (payload.length - i) % 2 === 1 ? 3 : 1;
    sum += payload[i]! * weight;
  }

  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  if (expectedCheckDigit !== checkDigit) {
    return {
      valid: false,
      format,
      error: `Invalid checksum digit. Expected ${expectedCheckDigit}, got ${checkDigit}.`,
    };
  }

  // Normalize to 14-digit form (GS1 canonical)
  const normalized = cleaned.padStart(14, '0');

  return { valid: true, format, normalized };
}

/**
 * Enrich a UCPProduct with GTIN validation.
 *
 * If the product has a `gtin` field, this function validates it and:
 *   - If valid: normalizes the GTIN to 14-digit form
 *   - If invalid: sets `gtin` to undefined and adds a `feed_quality_issue` insight
 *     hint in the product tags (surfaced as a UCPInsight by the InsightEngine)
 *
 * @example
 * ```typescript
 * import { enrichProductWithGTIN } from '@goofre/core-engine/enrichers';
 *
 * const enriched = enrichProductWithGTIN(rawUCPProduct);
 * // enriched.gtin is now validated and normalized to 14-digit GTIN-14 form
 * ```
 */
export function enrichProductWithGTIN(product: UCPProduct): UCPProduct {
  if (!product.gtin) {
    return product;
  }

  const result = validateGTIN(product.gtin);

  if (result.valid && result.normalized) {
    return {
      ...product,
      gtin: result.normalized,
    };
  }

  // Invalid GTIN — remove it and tag the product for feed quality review
  const invalidGtinTag = `gtin_invalid:${result.error ?? 'unknown'}`;
  return {
    ...product,
    gtin: undefined,
    tags: [...(product.tags ?? []), invalidGtinTag],
  };
}
