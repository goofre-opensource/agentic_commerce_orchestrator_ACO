/**
 * @goofre/core-engine — Public API
 *
 * The Goofre Unified Commerce Protocol (UCP) orchestration engine.
 *
 * ARCHITECTURE RULE: Only import from this barrel file.
 * Never import directly from internal module paths.
 */

// UCP Schema Types — The Protocol Contract
export type {
    UCPProduct,
    UCPProductVariant,
    UCPInventorySnapshot,
    UCPInventoryLevel,
    UCPOrderEvent,
    UCPOrderEventType,
    UCPOrderLineItem,
    UCPInsight,
    UCPInsightType,
    UCPInsightSeverity,
    UCPInsightRecommendedAction,
    UCPMonetaryValue,
    UCPTimestamp,
    UCPMetadata,
    UCPEvent,
    UCPEventType,
    UCPEventEnvelope,
    IGoofRePlugin,
} from './types/ucp.schema.js';

// Orchestration Engine
export { SwitchboardOrchestrator } from './orchestrator/SwitchboardOrchestrator.js';
export type { OrchestratorConfig, RawEvent } from './orchestrator/SwitchboardOrchestrator.js';

// POS Sync Engine
export { PosSyncEngine } from './orchestrator/PosSyncEngine.js';
export type {
    PosSyncEngineConfig,
    PosRawInventoryEvent,
} from './orchestrator/PosSyncEngine.js';

// Webhook Processor
export { WebhookProcessor } from './webhooks/WebhookProcessor.js';
export type {
    WebhookProcessorConfig,
    WebhookValidationResult,
    ParsedWebhookPayload,
} from './webhooks/WebhookProcessor.js';
