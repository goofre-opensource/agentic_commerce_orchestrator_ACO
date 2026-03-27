import { Request, Response } from 'express';
import { z } from 'zod';
import { verifyLoyaltyToken, applyMemberPricing } from '../services/identity-linking';

// ─── Schemas ───────────────────────────────────────────────────────────────────

const CartItemSchema = z.object({
    sku: z.string().min(1),
    quantity: z.number().int().positive(),
    variant_id: z.string().optional(),
});

const CartRequestSchema = z.object({
    items: z.array(CartItemSchema).min(1),
    currency: z.string().length(3).default('USD'),
    loyalty_token: z.string().optional(),
    customer_id: z.string().optional(),
    session_id: z.string().optional(),
});

// ─── Mock Catalog ──────────────────────────────────────────────────────────────

const CATALOG: Record<string, { title: string; price: number; stock: number; available: boolean }> = {
    'SHOE-001': { title: 'Runner Pro X1', price: 89.99, stock: 42, available: true },
    'SHIRT-002': { title: 'Goofre Classic Tee', price: 34.99, stock: 150, available: true },
    'HAT-003': { title: 'Mesh Cap', price: 24.99, stock: 0, available: false },
    'JACKET-007': { title: 'Denim Jacket', price: 129.99, stock: 28, available: true },
};

// ─── Handler ──────────────────────────────────────────────────────────────────

export const handleUcpCart = async (req: Request, res: Response) => {
    const parseResult = CartRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid cart request.',
            issues: parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
            hint: 'Each item needs a SKU and a positive quantity.',
        });
    }

    const { items, currency, loyalty_token, customer_id, session_id } = parseResult.data;

    // ── Identity Linking ──────────────────────────────────────────────────────
    const identity = loyalty_token ? await verifyLoyaltyToken(loyalty_token) : { valid: false };
    const member = identity.valid && identity.member ? identity.member : null;
    if (loyalty_token && !identity.valid) {
        console.warn(`[UCP Cart] Invalid loyalty token — soft fail. Reason: ${identity.reason}`);
    } else if (member) {
        console.log(`[UCP Cart] Identity Linking: ${member.tier} member, savings $${(member.discount_rate * 10 * 20).toFixed(1)}`);
    }

    // ── Process Items ─────────────────────────────────────────────────────────
    const accepted: unknown[] = [];
    const rejected: unknown[] = [];
    let subtotal = 0;
    let totalSavings = 0;
    let totalPoints = 0;

    for (const item of items) {
        const product = CATALOG[item.sku.toUpperCase()];
        if (!product) {
            rejected.push({ sku: item.sku, reason: `SKU "${item.sku}" not found in catalog.`, fix: 'Verify this SKU exists in your GMC feed and is synced to Goofre.' });
            continue;
        }
        if (!product.available || product.stock < item.quantity) {
            rejected.push({ sku: item.sku, title: product.title, reason: product.stock === 0 ? 'Out of stock.' : `Only ${product.stock} units available.` });
            continue;
        }

        if (member) {
            const pricing = applyMemberPricing(product.price, item.quantity, member);
            subtotal += pricing.member_price * item.quantity;
            totalSavings += pricing.savings;
            totalPoints += pricing.points_earned;
            accepted.push({ sku: item.sku, title: product.title, quantity: item.quantity, unit_price: product.price, member_price: pricing.member_price, savings_per_unit: parseFloat((product.price - pricing.member_price).toFixed(2)), line_total: parseFloat((pricing.member_price * item.quantity).toFixed(2)), currency });
        } else {
            subtotal += product.price * item.quantity;
            accepted.push({ sku: item.sku, title: product.title, quantity: item.quantity, unit_price: product.price, line_total: parseFloat((product.price * item.quantity).toFixed(2)), currency });
        }
    }

    if (accepted.length === 0) {
        return res.status(422).json({ error: 'No items could be added to the cart.', rejected, hint: 'All requested items were rejected. Check stock levels and SKUs.' });
    }

    const cartId = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const response: Record<string, unknown> = {
        cart_id: cartId,
        status: rejected.length > 0 ? 'partial' : 'accepted',
        accepted_items: accepted,
        rejected_items: rejected,
        item_count: accepted.length,
        subtotal: parseFloat(subtotal.toFixed(2)),
        currency,
        ...(customer_id && { customer_id }),
        ...(session_id && { session_id }),
        checkout_url: `https://${process.env.PRIMARY_DOMAIN || 'localhost:8080'}/checkout/${cartId}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
    };

    if (member) {
        response.loyalty_member_tier = member.tier;
        response.loyalty_savings = parseFloat(totalSavings.toFixed(2));
        response.loyalty_points_earned = totalPoints;
        response.message = `Welcome back, ${member.tier} member! You saved $${totalSavings.toFixed(2)} and earned ${totalPoints} points on this order.`;
    }

    return res.status(200).json(response);
};
