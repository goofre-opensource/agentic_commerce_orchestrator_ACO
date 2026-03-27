import { z } from 'zod';

export const UcpCapability = z.enum([
    'shopping', 'checkout', 'order_management', 'local_inventory',
    'multi_item_cart', 'catalog_access', 'identity_linking', 'member_pricing',
    'post_order_fulfillment', 'return_management', 'commerce_insights',
]);
export type UcpCapabilityValue = z.infer<typeof UcpCapability>;

export const UcpEndpointsSchema = z.object({
    webhook_ingestion: z.string().url(),
    ucp_cart: z.string().url().optional(),
    ucp_catalog: z.string().url().optional(),
    identity_link: z.string().url().optional(),
    identity_status: z.string().url().optional(),
    fulfillment: z.string().url().optional(),
    returns: z.string().url().optional(),
    insights: z.string().url().optional(),
    ap2_payment: z.string().url().optional(),
});

export const UcpManifestSchema = z.object({
    version: z.string().min(1),
    goofre_version: z.string().min(1).optional(),
    merchant_id: z.string().min(1),
    generated_at: z.string().datetime().optional(),
    supported_capabilities: z.array(UcpCapability).min(1),
    identity_linking: z.object({
        oauth_scope: z.string().optional(),
        token_endpoint: z.string().url().optional(),
        status_endpoint: z.string().url().optional(),
    }).optional(),
    endpoints: UcpEndpointsSchema,
    loyalty_programs: z.array(z.object({
        program_id: z.string(),
        label: z.string(),
        currency: z.string(),
    })).optional(),
});

export type UcpManifest = z.infer<typeof UcpManifestSchema>;
