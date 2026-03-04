/**
 * @goofre/mock-server — Hackathon & CI Mock API Server
 *
 * Lightweight Express server that serves realistic UCP-compliant payloads
 * without requiring any live API keys. Perfect for:
 * - Hackathon demos
 * - CI/CD integration test environments
 * - PWA frontend development (Repo B — Merchant Dashboard)
 *
 * Endpoints:
 *   GET  /health               → Service health check
 *   GET  /api/insights         → UCPInsight array (voice agent feed)
 *   GET  /api/products         → UCPProduct array (catalog mock)
 *   POST /api/webhooks/test    → Echo endpoint for webhook integration tests
 *   POST /api/insights/:id/ack → Mark an insight as acknowledged
 *
 * Start: npm start  (or: docker compose up mock-server)
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = process.env.PORT ?? 3001;
const VERSION = '1.0.0';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json({ limit: '1mb' }));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.info(`[mock-server] ${req.method} ${req.path}`);
    next();
});

// ─── Load Fixtures ────────────────────────────────────────────────────────────

const insightsFixture = JSON.parse(
    readFileSync(join(__dirname, 'data', 'insights.json'), 'utf-8')
) as unknown[];

// In-memory acknowledged set (resets on server restart — intentional for demos)
const acknowledgedInsightIds = new Set<string>();

// ─── Product Fixtures (inline — small enough to not need a file) ──────────────

const productsFixture = [
    {
        ucpId: 'google-merchant::SKU-WEP-BLK',
        ucpVersion: '1.0',
        sourceId: 'SKU-WEP-BLK',
        sourcePlatform: 'google-merchant',
        normalizedAt: new Date().toISOString(),
        title: 'Wireless Earbuds Pro — Matte Black',
        brand: 'SoundCore',
        category: ['Electronics', 'Audio', 'Earbuds'],
        status: 'inactive',
        price: { amount: 79.99, currency: 'USD' },
        inventory: { available: 0, reserved: 0, total: 0, locationId: 'warehouse-main' },
        tags: ['wireless', 'audio', 'bluetooth'],
    },
    {
        ucpId: 'google-merchant::SKU-OCT-NAT',
        ucpVersion: '1.0',
        sourceId: 'SKU-OCT-NAT',
        sourcePlatform: 'google-merchant',
        normalizedAt: new Date().toISOString(),
        title: 'Organic Cotton T-Shirt — Natural',
        brand: 'EcoWear',
        category: ['Apparel', 'T-Shirts'],
        status: 'active',
        price: { amount: 34.99, currency: 'USD' },
        inventory: { available: 312, reserved: 14, total: 326, locationId: 'warehouse-main' },
        tags: ['organic', 'sustainable', 'cotton'],
    },
    {
        ucpId: 'google-merchant::SKU-RS-SZ10',
        ucpVersion: '1.0',
        sourceId: 'SKU-RS-SZ10',
        sourcePlatform: 'google-merchant',
        normalizedAt: new Date().toISOString(),
        title: 'Performance Running Shoes — Size 10',
        brand: 'StrideMax',
        category: ['Footwear', 'Athletic'],
        status: 'active',
        price: { amount: 119.99, currency: 'USD' },
        inventory: { available: 47, reserved: 6, total: 53, locationId: 'warehouse-main' },
        tags: ['running', 'athletic', 'footwear'],
    },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/** Health check — used by docker-compose healthcheck and CI wait scripts */
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        mode: 'mock',
        version: VERSION,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

/**
 * GET /api/insights
 * Returns the array of UCPInsight objects enriched with live acknowledged state.
 * This is the primary feed consumed by the PWA Voice Agent.
 */
app.get('/api/insights', (_req: Request, res: Response) => {
    const insights = (insightsFixture as Array<Record<string, unknown>>).map((insight) => ({
        ...insight,
        acknowledged: acknowledgedInsightIds.has(insight['insightId'] as string),
    }));

    res.json(insights);
});

/**
 * POST /api/insights/:id/ack
 * Human-in-the-loop: Merchant acknowledges an insight via the Voice Agent.
 */
app.post('/api/insights/:id/ack', (req: Request, res: Response) => {
    const { id } = req.params;
    acknowledgedInsightIds.add(id);
    console.info(`[mock-server] Insight acknowledged: ${id}`);
    res.json({ success: true, insightId: id, acknowledgedAt: new Date().toISOString() });
});

/**
 * GET /api/products
 * Returns the mock UCPProduct catalog.
 */
app.get('/api/products', (_req: Request, res: Response) => {
    res.json(productsFixture);
});

/**
 * POST /api/webhooks/test
 * Echo endpoint for webhook integration testing and development.
 * Useful for testing your WebhookProcessor + SwitchboardOrchestrator pipeline.
 */
app.post('/api/webhooks/test', (req: Request, res: Response) => {
    const received = {
        receivedAt: new Date().toISOString(),
        headers: req.headers,
        body: req.body as unknown,
    };
    console.info('[mock-server] Webhook received:', JSON.stringify(received, null, 2));
    res.status(200).json({ echo: received });
});

/** 404 handler */
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found', hint: 'Available: GET /health, GET /api/insights, GET /api/products, POST /api/webhooks/test' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.info(`
╔═══════════════════════════════════════════════════════╗
║       Goofre ACO Mock Server v${VERSION}                  ║
║  Mode: MOCK — No API keys required                    ║
╠═══════════════════════════════════════════════════════╣
║  GET  http://localhost:${PORT}/health                   ║
║  GET  http://localhost:${PORT}/api/insights             ║
║  GET  http://localhost:${PORT}/api/products             ║
║  POST http://localhost:${PORT}/api/webhooks/test        ║
╚═══════════════════════════════════════════════════════╝
`);
});

export default app;
