import { Request, Response } from 'express';

let insights = [
    { id: 'ins_001', severity: 'critical', category: 'feed_quality', title: 'Missing GTINs on 23 products', description: '23 products in your active feed are missing GTINs. Google requires GTINs for branded products. These items risk disapproval under March 2026 enforcement.', fix: 'Add GTIN/UPC to each product. Use the Goofre Catalog API to enrich GTINs automatically.', acknowledged: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'ins_002', severity: 'critical', category: 'ucp_eligibility', title: 'UCP checkout blocked on 8 products', description: '8 products fail UCP checkout eligibility. Primary cause: price mismatch between your GMC feed and your Shopify storefront.', fix: 'Sync Shopify prices to GMC within $0.01. Use POST /api/ucp/validate/product-ids to identify conflicts.', acknowledged: false, created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'ins_003', severity: 'high', category: 'identity_linking', title: 'Identity link rate 34% — below benchmark', description: 'Only 34% of AI cart sessions this week linked a loyalty identity. Industry benchmark is 60%+. Unlinked sessions forgo member pricing, reducing conversion.', fix: 'Surface the loyalty link prompt earlier in the AI shopping flow. Offer a discount incentive for first-time linking.', acknowledged: false, created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'ins_004', severity: 'high', category: 'feed_quality', title: 'Feed sync latency: 4.2 hours behind', description: 'Your last successful feed sync was 4.2 hours ago. Google recommends syncing at least every 2 hours for AI shopping eligibility.', fix: 'Check webhook delivery logs. Increase the sync frequency or set up a fallback polling mechanism.', acknowledged: false, created_at: new Date(Date.now() - 1 * 3600000).toISOString() },
    { id: 'ins_005', severity: 'medium', category: 'returns', title: '3 AI-initiated returns pending approval', description: '3 return requests submitted via the Goofre UCP returns API are awaiting merchant approval for over 24 hours.', fix: 'Review pending returns at GET /api/ucp/returns. Approve or reject within 48h to maintain UCP merchant score.', acknowledged: false, created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
    { id: 'ins_006', severity: 'medium', category: 'ucp_eligibility', title: 'Local inventory not synced for 12 SKUs', description: '12 SKUs with local inventory data in your POS have not synced to GMC Local Products inventory. These are ineligible for "available nearby" placement.', fix: 'Enable local inventory sync in the Goofre webhook ingress settings.', acknowledged: false, created_at: new Date(Date.now() - 12 * 3600000).toISOString() },
    { id: 'ins_007', severity: 'low', category: 'performance', title: 'AI cart conversion up 12% this week', description: 'UCP AI cart-to-checkout conversion improved 12% week-over-week. Identity linking and member pricing are the primary drivers.', fix: 'No action needed. Continue monitoring.', acknowledged: false, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
    { id: 'ins_008', severity: 'low', category: 'feed_quality', title: 'Product Studio optimisations available', description: 'Google Product Studio has generated improved titles and descriptions for 47 of your products. Accepting these can improve shopping ad CTR by an estimated 8%.', fix: 'Review and apply Product Studio suggestions in GMC. Access via Goofre Dashboard > Feed Quality.', acknowledged: false, created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
];

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export const handleGetInsights = (req: Request, res: Response) => {
    const { severity, category, unacknowledged } = req.query as Record<string, string>;
    let filtered = [...insights];
    if (severity) filtered = filtered.filter(i => i.severity === severity);
    if (category) filtered = filtered.filter(i => i.category === category);
    if (unacknowledged === 'true') filtered = filtered.filter(i => !i.acknowledged);
    filtered.sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]);
    return res.status(200).json({ count: filtered.length, insights: filtered, generated_at: new Date().toISOString() });
};

export const handleInsightKpis = (_req: Request, res: Response) => {
    return res.status(200).json({
        kpis: [
            { id: 'ucp_eligible_products', label: 'UCP Eligible Products', value: 147, total: 155, unit: 'products', status: 'warning', trend: '+3 this week' },
            { id: 'ai_cart_conversion', label: 'AI Cart Conversion', value: 6.8, unit: '%', status: 'good', trend: '+12% WoW' },
            { id: 'identity_link_rate', label: 'Identity Link Rate', value: 34, unit: '%', status: 'warning', trend: '-2% WoW', benchmark: '60%' },
            { id: 'feed_health_score', label: 'Feed Health Score', value: 78, unit: '/100', status: 'warning', trend: '-5 this week' },
            { id: 'open_insights', label: 'Open Insights', value: insights.filter(i => !i.acknowledged).length, unit: 'items', status: insights.filter(i => i.severity === 'critical' && !i.acknowledged).length > 0 ? 'critical' : 'ok' },
        ],
        generated_at: new Date().toISOString(),
    });
};

export const handleAcknowledgeInsight = (req: Request, res: Response) => {
    const { id } = req.params;
    const insight = insights.find(i => i.id === id);
    if (!insight) return res.status(404).json({ error: `Insight "${id}" not found.` });
    insight.acknowledged = true;
    return res.status(200).json({ acknowledged: true, insight_id: id, message: `Insight "${insight.title}" acknowledged.` });
};
