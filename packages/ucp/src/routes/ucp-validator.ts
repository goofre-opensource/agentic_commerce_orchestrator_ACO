import { Router } from 'express';
import { z } from 'zod';

interface ConflictIssue {
    sku: string;
    conflict_type: 'id_mismatch' | 'gtin_conflict' | 'sku_format_incompatible' | 'duplicate_across_channels';
    channels_affected: string[];
    details: string;
    fix_suggestion: string;
    severity: 'critical' | 'high' | 'medium';
}

const ProductIdCheckSchema = z.object({
    products: z.array(z.object({
        sku: z.string().min(1),
        gmc_gtin: z.string().optional(),
        shopify_barcode: z.string().optional(),
        pos_product_id: z.string().optional(),
        gmc_mpn: z.string().optional(),
        pos_mpn: z.string().optional(),
        shopify_product_id: z.string().optional(),
        bigcommerce_product_id: z.string().optional(),
    })).min(1),
    include_warnings: z.boolean().optional(),
});

type ProductInput = z.infer<typeof ProductIdCheckSchema>['products'][number];

function validateProduct(product: ProductInput, includeWarnings: boolean): ConflictIssue[] {
    const issues: ConflictIssue[] = [];
    if (product.gmc_gtin && product.shopify_barcode) {
        const norm = (s: string) => s.replace(/\D/g, '').replace(/^0+/, '');
        if (norm(product.gmc_gtin) !== norm(product.shopify_barcode)) {
            issues.push({ sku: product.sku, conflict_type: 'gtin_conflict', channels_affected: ['Google Merchant Center', 'Shopify'], severity: 'critical', details: `GMC GTIN "${product.gmc_gtin}" does not match Shopify barcode "${product.shopify_barcode}". Google's March 2026 Product ID Integrity enforcement will disapprove this product.`, fix_suggestion: `Update the Shopify variant barcode to match your GMC GTIN: "${product.gmc_gtin}". Choose one source of truth.` });
        }
    }
    if (product.gmc_mpn && product.pos_mpn && product.gmc_mpn.trim().toLowerCase() !== product.pos_mpn.trim().toLowerCase()) {
        issues.push({ sku: product.sku, conflict_type: 'id_mismatch', channels_affected: ['Google Merchant Center', 'POS'], severity: 'high', details: `MPN in GMC feed ("${product.gmc_mpn}") doesn't match POS/ERP MPN ("${product.pos_mpn}"). This can cause deduplication failures in local inventory ads.`, fix_suggestion: 'Standardise on one MPN. Use the manufacturer\'s official MPN from the product packaging.' });
    }
    if (includeWarnings) {
        if (product.shopify_product_id && product.bigcommerce_product_id) {
            issues.push({ sku: product.sku, conflict_type: 'duplicate_across_channels', channels_affected: ['Shopify', 'BigCommerce'], severity: 'medium', details: `Product "${product.sku}" exists on both Shopify and BigCommerce. If submitted to GMC from both platforms, this may create duplicate listings.`, fix_suggestion: 'Submit to GMC from only one platform. Use the other as a supplemental feed with the same GTIN to merge.' });
        }
        if (/[^a-zA-Z0-9\-_.]/.test(product.sku)) {
            issues.push({ sku: product.sku, conflict_type: 'sku_format_incompatible', channels_affected: ['Google Merchant Center'], severity: 'medium', details: `SKU "${product.sku}" contains characters that may be rejected by some GMC feed validators.`, fix_suggestion: `Standardise to alphanumeric with hyphens or underscores (e.g., "${product.sku.replace(/[^a-zA-Z0-9\-_.]/g, '-')}")` });
        }
    }
    return issues;
}

export function createProductIdValidatorRouter(): Router {
    const router = Router();
    router.post('/product-ids', (req, res) => {
        const parse = ProductIdCheckSchema.safeParse(req.body);
        if (!parse.success) return res.status(400).json({ error: 'Invalid validation request.', issues: parse.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) });
        const { products, include_warnings = false } = parse.data;
        const allConflicts: ConflictIssue[] = [];
        for (const p of products) allConflicts.push(...validateProduct(p, include_warnings));
        const criticalCount = allConflicts.filter(c => c.severity === 'critical').length;
        const summaryMessage = allConflicts.length === 0
            ? `All ${products.length} product${products.length > 1 ? 's' : ''} passed the cross-channel ID check.`
            : criticalCount > 0
                ? `Found ${criticalCount} critical ID conflict${criticalCount > 1 ? 's' : ''} that will cause GMC disapproval under March 2026 enforcement. Fix before your next feed sync.`
                : `Found ${allConflicts.length} ID issue${allConflicts.length > 1 ? 's' : ''}. No immediate disapprovals expected but resolve before scaling ads.`;
        return res.status(200).json({ scanned_skus: products.length, conflicts_found: allConflicts.length, clean: allConflicts.length === 0, conflicts: allConflicts.sort((a, b) => ({ critical: 0, high: 1, medium: 2 }[a.severity] - { critical: 0, high: 1, medium: 2 }[b.severity])), summary_message: summaryMessage, generated_at: new Date().toISOString() });
    });
    router.get('/product-ids/rules', (_req, res) => {
        return res.status(200).json({ validator_version: '1.1.0', spec_reference: 'Google Merchant Center Product ID Integrity — March 2026', rules: [{ rule_id: 'GTIN_CHANNEL_MATCH', severity: 'critical', check: 'GMC GTIN vs Shopify barcode', requires: ['gmc_gtin', 'shopify_barcode'] }, { rule_id: 'MPN_CHANNEL_MATCH', severity: 'high', check: 'GMC MPN vs POS/ERP MPN', requires: ['gmc_mpn', 'pos_mpn'] }, { rule_id: 'DUAL_CHANNEL_DUPLICATE', severity: 'medium', check: 'Product on Shopify AND BigCommerce', optional: true }, { rule_id: 'SKU_FORMAT', severity: 'medium', check: 'SKU character format', optional: true }] });
    });
    return router;
}
