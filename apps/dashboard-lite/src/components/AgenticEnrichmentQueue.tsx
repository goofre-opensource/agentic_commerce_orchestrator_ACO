"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export interface EnrichmentItem {
    id: string;
    field: string;
    originValue: string;
    optimizedValue: string;
    reasoning: string;
    originSource: string;
}

interface AgenticEnrichmentQueueProps {
    items: EnrichmentItem[];
    onApprove: (id: string, automate: boolean) => void;
    onRevert: (id: string) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export function AgenticEnrichmentQueue({
    items,
    onApprove,
    onRevert,
}: AgenticEnrichmentQueueProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [automateRule, setAutomateRule] = useState(false);

    const activeItem = items[activeIndex];

    // ── Keyboard Shortcuts ────────────────────────────────────────────────────

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!activeItem) return;

            const key = e.key.toLowerCase();
            if (key === "a") {
                onApprove(activeItem.id, automateRule);
                if (activeIndex < items.length - 1) {
                    // Keep index same if item is removed from parent state, 
                    // but for UI safety we just let the parent handle the transition.
                }
            } else if (key === "r") {
                onRevert(activeItem.id);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeItem, automateRule, onApprove, onRevert, activeIndex, items.length]);

    if (items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-green-900/10 border border-green-500/20 flex items-center justify-center text-green-500/40">
                    ✓
                </div>
                <div className="text-xs font-mono-data text-zinc-600 uppercase tracking-widest">
                    Queue Cleared
                </div>
                <p className="text-[10px] text-zinc-700 max-w-[200px]">
                    All AI enrichments have been processed. The orchestrator is running autonomously.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#09090B]">
            {/* ── Active Enrichment Card ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-data text-zinc-500 tracking-wider">
                        ENRICHMENT {activeIndex + 1} OF {items.length}
                    </span>
                    <div className="flex gap-1">
                        {items.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 w-4 rounded-full transition-colors ${i === activeIndex ? "bg-[#22C55E]" : "bg-zinc-800"}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Left: Origin */}
                    <div className="space-y-2">
                        <span className="text-[9px] font-mono-data text-zinc-600 uppercase tracking-widest">
                            Origin Sync — {activeItem.originSource}
                        </span>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4 h-full min-h-[100px]">
                            <div className="text-[10px] font-mono-data text-zinc-500 mb-2 truncate uppercase">
                                {activeItem.field}
                            </div>
                            <div className="text-xs text-zinc-400 font-mono-data leading-relaxed">
                                {activeItem.originValue}
                            </div>
                        </div>
                    </div>

                    {/* Right: UCP Optimized */}
                    <div className="space-y-2">
                        <span className="text-[9px] font-mono-data text-[#22C55E] uppercase tracking-widest">
                            UCP Optimized
                        </span>
                        <div className="bg-green-900/10 border border-green-500/30 rounded p-4 h-full min-h-[100px] relative overflow-hidden group">
                            {/* Subtle glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-50" />

                            <div className="relative z-10">
                                <div className="text-[10px] font-mono-data text-green-500/60 mb-2 truncate uppercase">
                                    {activeItem.field}
                                </div>
                                <div className="text-xs text-green-400 font-mono-data leading-relaxed">
                                    {activeItem.optimizedValue}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gemini Reasoning */}
                <div className="bg-[#0C0C0F] border border-[#1C1C21] rounded p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[#D946EF] text-xs">✨</span>
                        <span className="text-[9px] font-mono-data text-zinc-500 uppercase tracking-widest">
                            Gemini Reasoning
                        </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                        "{activeItem.reasoning}"
                    </p>
                </div>

                {/* Automation Macro */}
                <div className="flex items-center justify-between p-4 bg-[#0C0C0F] border border-[#1C1C21] rounded">
                    <div className="space-y-1">
                        <div className="text-xs text-zinc-300 font-medium">Automate this rule</div>
                        <div className="text-[10px] font-mono-data text-zinc-600">
                            Always apply semantic {activeItem.field} enrichment for {activeItem.originSource}
                        </div>
                    </div>
                    <button
                        onClick={() => setAutomateRule(!automateRule)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ${automateRule ? "border-[#22C55E] bg-[#22C55E]/20" : "border-[#1C1C21] bg-[#131316]"
                            }`}
                    >
                        <span
                            className={`inline-block h-3 w-3 rounded-full transition-transform duration-200 ${automateRule ? "translate-x-4 bg-[#22C55E]" : "translate-x-0.5 bg-zinc-600"
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* ── Footer Controls ─────────────────────────────────────────────────── */}
            <div className="p-4 bg-[#0C0C0F] border-t border-[#1C1C21] grid grid-cols-2 gap-3 mt-auto">
                <button
                    onClick={() => onRevert(activeItem.id)}
                    className="flex flex-col items-center justify-center py-3 border border-[#1C1C21] rounded hover:bg-zinc-900 transition-all group"
                >
                    <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        Revert to Origin
                    </span>
                    <span className="text-[9px] font-mono-data text-zinc-600 mt-1 uppercase tracking-tighter">
                        Shortcut: [ R ]
                    </span>
                </button>

                <button
                    onClick={() => onApprove(activeItem.id, automateRule)}
                    className="flex flex-col items-center justify-center py-3 border border-[#22C55E]/20 rounded bg-[#22C55E]/5 hover:bg-[#22C55E]/10 transition-all group"
                >
                    <span className="text-xs font-semibold text-[#22C55E] group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all">
                        Approve UCP Data
                    </span>
                    <span className="text-[9px] font-mono-data text-green-500/50 mt-1 uppercase tracking-tighter">
                        Shortcut: [ A ]
                    </span>
                </button>
            </div>
        </div>
    );
}
