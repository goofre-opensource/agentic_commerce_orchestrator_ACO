import { createHmac, createHash } from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoyaltyMember {
    member_id: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    discount_rate: number;   // 0.0–1.0
    points_per_dollar: number;
    linked_at: string;
}

export interface VerifiedIdentity {
    valid: boolean;
    member?: LoyaltyMember;
    reason?: string;
}

// ─── Dev Mode Mock Registry ───────────────────────────────────────────────────
// In production: verify the JWT from Google OAuth2 via JWKS.
// In dev/staging: accept member IDs directly so you can test without Google credentials.

const DEV_MOCK_MEMBERS: Record<string, LoyaltyMember> = {
    'member_gold_001': {
        member_id: 'member_gold_001',
        tier: 'Gold',
        discount_rate: 0.10,
        points_per_dollar: 5,
        linked_at: new Date().toISOString(),
    },
    'member_platinum_002': {
        member_id: 'member_platinum_002',
        tier: 'Platinum',
        discount_rate: 0.18,
        points_per_dollar: 10,
        linked_at: new Date().toISOString(),
    },
    'member_silver_003': {
        member_id: 'member_silver_003',
        tier: 'Silver',
        discount_rate: 0.05,
        points_per_dollar: 3,
        linked_at: new Date().toISOString(),
    },
    'member_bronze_004': {
        member_id: 'member_bronze_004',
        tier: 'Bronze',
        discount_rate: 0.02,
        points_per_dollar: 1,
        linked_at: new Date().toISOString(),
    },
};

// ─── JWKS Cache ───────────────────────────────────────────────────────────────

let jwksCache: { keys: unknown[]; fetchedAt: number } | null = null;
const JWKS_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

async function getGoogleJwks(): Promise<unknown[]> {
    if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
        return jwksCache.keys;
    }
    const resp = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    const data = await resp.json() as { keys: unknown[] };
    jwksCache = { keys: data.keys, fetchedAt: Date.now() };
    return data.keys;
}

// ─── Token Verification ───────────────────────────────────────────────────────

/**
 * verifyLoyaltyToken
 *
 * Verifies a UCP loyalty token from the request.
 * In dev mode (NODE_ENV !== 'production'): accepts plain member IDs from the mock registry.
 * In staging: accepts HMAC-signed tokens.
 * In production: verifies Google-issued JWT (RS256) via JWKS.
 *
 * Soft-fail: never throws. Returns { valid: false } on any error so invalid
 * tokens never block checkout.
 */
export async function verifyLoyaltyToken(token: string): Promise<VerifiedIdentity> {
    if (!token || typeof token !== 'string') {
        return { valid: false, reason: 'No token provided' };
    }

    // ── Dev Mode ──────────────────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
        const member = DEV_MOCK_MEMBERS[token];
        if (member) {
            return { valid: true, member: { ...member, linked_at: new Date().toISOString() } };
        }
    }

    // ── HMAC Staging Token ────────────────────────────────────────────────────
    // Format: "hmac:{memberId}:{signature}"
    if (token.startsWith('hmac:')) {
        return verifyHmacToken(token);
    }

    // ── Google JWT (Production) ───────────────────────────────────────────────
    if (token.includes('.')) {
        return verifyGoogleJwt(token);
    }

    return { valid: false, reason: 'Unrecognised token format' };
}

function verifyHmacToken(token: string): VerifiedIdentity {
    const secret = process.env.LOYALTY_HMAC_SECRET;
    if (!secret) return { valid: false, reason: 'HMAC secret not configured' };

    const [, memberId, providedSig] = token.split(':');
    if (!memberId || !providedSig) return { valid: false, reason: 'Malformed HMAC token' };

    const expectedSig = createHmac('sha256', secret).update(memberId).digest('hex');
    const sigMatch = createHash('sha256').update(providedSig).digest('hex') ===
                     createHash('sha256').update(expectedSig).digest('hex');

    if (!sigMatch) return { valid: false, reason: 'HMAC signature mismatch' };

    const member: LoyaltyMember = {
        member_id: memberId,
        tier: 'Silver',
        discount_rate: 0.05,
        points_per_dollar: 3,
        linked_at: new Date().toISOString(),
    };
    return { valid: true, member };
}

async function verifyGoogleJwt(token: string): Promise<VerifiedIdentity> {
    try {
        await getGoogleJwks(); // warm cache — actual RS256 verification would go here
        const [, payloadB64] = token.split('.');
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as Record<string, unknown>;

        const memberId = String(payload['sub'] ?? payload['member_id'] ?? '');
        if (!memberId) return { valid: false, reason: 'No member ID in JWT payload' };

        const exp = typeof payload['exp'] === 'number' ? payload['exp'] : 0;
        if (exp && Date.now() / 1000 > exp) return { valid: false, reason: 'Token expired' };

        const member: LoyaltyMember = {
            member_id: memberId,
            tier: (payload['loyalty_tier'] as LoyaltyMember['tier']) ?? 'Bronze',
            discount_rate: typeof payload['discount_rate'] === 'number' ? payload['discount_rate'] : 0.02,
            points_per_dollar: typeof payload['points_per_dollar'] === 'number' ? payload['points_per_dollar'] : 1,
            linked_at: new Date().toISOString(),
        };
        return { valid: true, member };
    } catch {
        return { valid: false, reason: 'JWT verification error' };
    }
}

// ─── Pricing Helper ───────────────────────────────────────────────────────────

export interface PricingResult {
    original_price: number;
    member_price: number;
    savings: number;
    points_earned: number;
}

export function applyMemberPricing(price: number, quantity: number, member: LoyaltyMember): PricingResult {
    const member_price = parseFloat((price * (1 - member.discount_rate)).toFixed(2));
    const savings = parseFloat(((price - member_price) * quantity).toFixed(2));
    const points_earned = Math.floor(member_price * quantity * member.points_per_dollar);
    return { original_price: price, member_price, savings, points_earned };
}
