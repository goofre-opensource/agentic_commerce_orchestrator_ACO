import { Request, Response } from 'express';
import { verifyLoyaltyToken, LoyaltyMember } from '../services/identity-linking';

export const handleIdentityLink = async (req: Request, res: Response) => {
    const { authorization_code, redirect_uri } = req.body as { authorization_code?: string; redirect_uri?: string };
    if (!authorization_code) {
        return res.status(400).json({ error: 'authorization_code is required.', hint: 'In dev mode, pass your member ID directly as the authorization_code.' });
    }
    const identity = await verifyLoyaltyToken(authorization_code);
    if (!identity.valid || !identity.member) {
        return res.status(401).json({ error: 'Identity linking failed.', reason: identity.reason, hint: 'In dev mode, use one of: member_gold_001, member_platinum_002, member_silver_003, member_bronze_004' });
    }
    const member: LoyaltyMember = identity.member;
    return res.status(200).json({
        linked: true,
        loyalty_token: authorization_code,
        member_id: member.member_id,
        tier: member.tier,
        discount_rate: member.discount_rate,
        points_per_dollar: member.points_per_dollar,
        linked_at: new Date().toISOString(),
        message: `Successfully linked ${member.tier} member account. Use the loyalty_token in your cart requests to apply member pricing.`,
        ...(redirect_uri && { redirect_uri }),
    });
};

export const handleIdentityStatus = async (req: Request, res: Response) => {
    const token = (req.headers['x-loyalty-token'] as string) || req.query['token'] as string;
    if (!token) {
        return res.status(400).json({ linked: false, error: 'No loyalty token provided.', hint: 'Pass token via X-Loyalty-Token header or ?token= query param.' });
    }
    const identity = await verifyLoyaltyToken(token);
    if (!identity.valid || !identity.member) {
        return res.status(200).json({ linked: false, reason: identity.reason });
    }
    return res.status(200).json({ linked: true, member_id: identity.member.member_id, tier: identity.member.tier, discount_rate: identity.member.discount_rate, points_per_dollar: identity.member.points_per_dollar });
};
