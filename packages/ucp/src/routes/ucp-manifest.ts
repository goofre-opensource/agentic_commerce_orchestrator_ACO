import { Request, Response } from 'express';
import { UcpManifestSchema, UcpManifest } from '../../../protocols/src/schemas/ucp-manifest';

export const getUcpManifest = async (_req: Request, res: Response) => {
    try {
        const domain = process.env.PRIMARY_DOMAIN || 'localhost:8080';
        const protocol = domain.startsWith('localhost') ? 'http' : 'https';
        const base = `${protocol}://${domain}`;

        const rawManifest = {
            version: '1.1',
            goofre_version: process.env.npm_package_version ?? '0.1.0',
            merchant_id: process.env.MERCHANT_ID || 'gfe_demo_merchant',
            generated_at: new Date().toISOString(),
            supported_capabilities: [
                'shopping', 'checkout', 'order_management', 'local_inventory',
                'multi_item_cart', 'catalog_access', 'identity_linking', 'member_pricing',
                'post_order_fulfillment', 'return_management', 'commerce_insights',
            ] as UcpManifest['supported_capabilities'],
            identity_linking: {
                oauth_scope: 'openid email https://www.googleapis.com/auth/loyaltyobject',
                token_endpoint: `${base}/api/ucp/identity/link`,
                status_endpoint: `${base}/api/ucp/identity/status`,
            },
            endpoints: {
                webhook_ingestion: `${base}/api/webhooks/ingress`,
                ucp_cart: `${base}/api/ucp/cart`,
                ucp_catalog: `${base}/api/ucp/catalog`,
                identity_link: `${base}/api/ucp/identity/link`,
                identity_status: `${base}/api/ucp/identity/status`,
                fulfillment: `${base}/api/ucp/fulfillment`,
                returns: `${base}/api/ucp/returns`,
                insights: `${base}/api/ucp/insight`,
                ap2_payment: process.env.AP2_PAYMENT_URL || `${base}/api/payments/ap2`,
            },
            loyalty_programs: [{ program_id: 'goofre_rewards', label: 'Goofre Rewards', currency: 'USD' }],
        };

        const validatedManifest: UcpManifest = UcpManifestSchema.parse(rawManifest);
        return res.status(200).json(validatedManifest);
    } catch (error) {
        console.error('UCP Manifest Generation Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate a valid UCP Manifest.',
            details: error instanceof Error ? error.message : 'Schema validation failure',
        });
    }
};
