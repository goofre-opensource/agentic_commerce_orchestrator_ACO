import express, { Request, Response } from 'express';
import cors from 'cors';
import { SwitchboardOrchestrator } from './SwitchboardOrchestrator';
import { getUcpManifest } from './routes/ucp-manifest';
import { handleWebhookIngress } from './routes/webhook-ingress';
import { handleUcpCart } from './routes/ucp-cart';
import { handleUcpCatalogSku, handleUcpCatalogList } from './routes/ucp-catalog';
import { handleIdentityLink, handleIdentityStatus } from './routes/ucp-identity';
import { handleGetInsights, handleAcknowledgeInsight, handleInsightKpis } from './routes/ucp-insight';
import { handleGetFulfillment, handlePostFulfillment, handlePostReturn, handleGetReturn } from './routes/ucp-postorder';
import { createProductIdValidatorRouter } from './routes/ucp-validator';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        service: 'goofre-ucp-orchestrator',
        version: process.env.npm_package_version ?? '0.1.0',
        timestamp: new Date().toISOString(),
    });
});

// Discovery
app.get('/.well-known/ucp', getUcpManifest);

// Cart + Catalog (P0/P1)
app.post('/api/ucp/cart', handleUcpCart);
app.get('/api/ucp/catalog', handleUcpCatalogList);
app.get('/api/ucp/catalog/:sku', handleUcpCatalogSku);

// Identity Linking (P1)
app.post('/api/ucp/identity/link', handleIdentityLink);
app.get('/api/ucp/identity/status', handleIdentityStatus);

// Insights (P1)
app.get('/api/ucp/insight/kpis', handleInsightKpis);
app.get('/api/ucp/insight', handleGetInsights);
app.post('/api/ucp/insight/:id/acknowledge', handleAcknowledgeInsight);

// Webhooks
app.post('/api/webhooks/ingress', handleWebhookIngress);

// Post-Order Workflows (P2)
app.get('/api/ucp/fulfillment/:orderId', handleGetFulfillment);
app.post('/api/ucp/fulfillment', handlePostFulfillment);
app.post('/api/ucp/returns', handlePostReturn);
app.get('/api/ucp/returns/:returnId', handleGetReturn);

// Multi-Channel Product ID Validator (P2)
app.use('/api/ucp/validate', createProductIdValidatorRouter());

// Orchestrator
const orchestrator = new SwitchboardOrchestrator();
orchestrator.startEngines();

app.listen(PORT, () => {
    console.log(`🚀 Goofre UCP Orchestrator running on port ${PORT}`);
    console.log(`   Health:             GET  http://localhost:${PORT}/health`);
    console.log(`   UCP Manifest:       GET  http://localhost:${PORT}/.well-known/ucp`);
    console.log(`   UCP Cart:           POST http://localhost:${PORT}/api/ucp/cart`);
    console.log(`   UCP Catalog:        GET  http://localhost:${PORT}/api/ucp/catalog[/:sku]`);
    console.log(`   Identity Link:      POST http://localhost:${PORT}/api/ucp/identity/link`);
    console.log(`   Identity Status:    GET  http://localhost:${PORT}/api/ucp/identity/status`);
    console.log(`   Insight KPIs:       GET  http://localhost:${PORT}/api/ucp/insight/kpis`);
    console.log(`   Insights:           GET  http://localhost:${PORT}/api/ucp/insight`);
    console.log(`   Acknowledge:        POST http://localhost:${PORT}/api/ucp/insight/:id/acknowledge`);
    console.log(`   Fulfillment:        GET  http://localhost:${PORT}/api/ucp/fulfillment/:orderId`);
    console.log(`   Fulfillment Update: POST http://localhost:${PORT}/api/ucp/fulfillment`);
    console.log(`   Return Request:     POST http://localhost:${PORT}/api/ucp/returns`);
    console.log(`   Return Status:      GET  http://localhost:${PORT}/api/ucp/returns/:returnId`);
    console.log(`   Validate IDs:       POST http://localhost:${PORT}/api/ucp/validate/product-ids`);
    console.log(`   Webhooks:           POST http://localhost:${PORT}/api/webhooks/ingress`);
});
