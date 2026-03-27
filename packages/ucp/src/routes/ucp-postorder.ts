import { Request, Response } from 'express';
import { z } from 'zod';

const MOCK_FULFILLMENTS: Record<string, object> = {
    'ord_a1b2c3': { fulfillment_id: 'ful_001', order_id: 'ord_a1b2c3', status: 'shipped', carrier: 'FedEx', tracking_number: '798765432100', tracking_url: 'https://www.fedex.com/fedextrack/?trknbr=798765432100', estimated_delivery: new Date(Date.now() + 2 * 86400000).toISOString(), shipped_at: new Date(Date.now() - 86400000).toISOString(), items: [{ sku: 'SHOE-001', quantity: 1 }], voice_status: 'Your order with 1 item shipped yesterday via FedEx and is expected to arrive in 2 days.' },
    'ord_d4e5f6': { fulfillment_id: 'ful_002', order_id: 'ord_d4e5f6', status: 'out_for_delivery', carrier: 'USPS', tracking_number: '9400111899223456789012', tracking_url: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223456789012', estimated_delivery: new Date().toISOString(), items: [{ sku: 'SHIRT-002', quantity: 2 }, { sku: 'HAT-003', quantity: 1 }], voice_status: 'Your order is out for delivery today with USPS.' },
};

const MOCK_RETURNS: Record<string, object> = {};

const ReturnRequestSchema = z.object({
    order_id: z.string().min(1),
    reason: z.enum(['not_as_described', 'defective', 'wrong_item', 'changed_mind', 'other']),
    line_items: z.array(z.object({ sku: z.string(), quantity: z.number().int().positive(), unit_price: z.number().positive() })).min(1),
    customer_notes: z.string().max(500).optional(),
});

const FulfillmentUpdateSchema = z.object({
    order_id: z.string().min(1),
    status: z.enum(['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'failed']),
    carrier: z.string().optional(),
    tracking_number: z.string().optional(),
    tracking_url: z.string().url().optional(),
});

export const handleGetFulfillment = (req: Request, res: Response) => {
    const { orderId } = req.params;
    const fulfillment = MOCK_FULFILLMENTS[orderId];
    if (!fulfillment) return res.status(404).json({ error: `No fulfillment found for order "${orderId}".`, hint: 'Try ord_a1b2c3 or ord_d4e5f6 for mock data.' });
    return res.status(200).json({ order_id: orderId, fulfillment_count: 1, fulfillments: [fulfillment] });
};

export const handlePostFulfillment = (req: Request, res: Response) => {
    const parse = FulfillmentUpdateSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Invalid fulfillment update.', issues: parse.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) });
    MOCK_FULFILLMENTS[parse.data.order_id] = { ...parse.data, updated_at: new Date().toISOString() };
    return res.status(200).json({ updated: true, order_id: parse.data.order_id, status: parse.data.status });
};

export const handlePostReturn = (req: Request, res: Response) => {
    const parse = ReturnRequestSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Invalid return request.', issues: parse.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) });
    const { order_id, reason, line_items, customer_notes } = parse.data;
    const returnId = `ret_${Date.now().toString(36)}`;
    const refundTotal = line_items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const returnObj = { return_id: returnId, order_id, status: 'pending_approval', reason, line_items, customer_notes: customer_notes ?? null, refund_amount: parseFloat(refundTotal.toFixed(2)), currency: 'USD', created_at: new Date().toISOString(), next_steps: `You'll receive a return shipping label by email once approved. Keep your items until then.` };
    MOCK_RETURNS[returnId] = returnObj;
    return res.status(201).json(returnObj);
};

export const handleGetReturn = (req: Request, res: Response) => {
    const { returnId } = req.params;
    const ret = MOCK_RETURNS[returnId];
    if (!ret) return res.status(404).json({ error: `Return "${returnId}" not found.` });
    return res.status(200).json(ret);
};
