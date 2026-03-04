"use client";

import { useState } from "react";
import { AlertCircle, TrendingUp, CheckCircle, ChevronDown } from "lucide-react";

type InsightType = "critical" | "optimization" | "resolution";

interface BaseInsight {
    id: string;
    type: InsightType;
    title: string;
    body: string;
}

interface CriticalInsight extends BaseInsight {
    type: "critical";
    proposal: string;
}

interface OptimizationInsight extends BaseInsight {
    type: "optimization";
}

interface ResolutionInsight extends BaseInsight {
    type: "resolution";
}

type Insight = CriticalInsight | OptimizationInsight | ResolutionInsight;

const MOCK_INSIGHTS: Insight[] = [
    {
        id: "1",
        type: "critical",
        title: "Catalog Conflict Detected",
        body: "SKU: SOCKS-STR-OS is missing a valid GTIN-14 required for UCP Google Shopping sync.",
        proposal: "Auto-generate placeholder GTIN based on manufacturer prefix.",
    },
    {
        id: "2",
        type: "optimization",
        title: "Velocity Spike: Physical Node",
        body: "Local inventory for HOODIE-GRY-L is depleting fast. Suggesting an immediate pause on Top-of-Funnel Google Ads to preserve stock for walk-ins.",
    },
    {
        id: "3",
        type: "resolution",
        title: "AI Resolution Complete",
        body: "Successfully rerouted 4 abandoned carts to the UCP checkout flow.",
    }
];

export function AgenticInsightsFeed() {
    const [filter, setFilter] = useState<"all" | "critical" | "optimizations">("all");

    const filteredInsights = MOCK_INSIGHTS.filter((insight) => {
        if (filter === "all") return true;
        if (filter === "critical") return insight.type === "critical";
        if (filter === "optimizations") return insight.type === "optimization";
        return true;
    });

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-[#0C0C0C] border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-[#E4E4E7]">Agentic Insights Feed</h3>
                    {/* Pulsing green indicator dot */}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="appearance-none bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-xs rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                        <option value="all">All</option>
                        <option value="critical">Critical</option>
                        <option value="optimizations">Optimizations</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
            </div>

            {/* Feed Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {filteredInsights.map((insight) => {
                    if (insight.type === "critical") {
                        return (
                            <div key={insight.id} className="bg-red-50 dark:bg-[#2A1215] border border-red-100 dark:border-red-900/30 rounded-lg p-4 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 text-red-600 dark:text-red-400">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">{insight.title}</h4>
                                        <p className="text-sm text-red-800 dark:text-red-400/90 mb-3 leading-relaxed">{insight.body}</p>

                                        <div className="bg-white/60 dark:bg-black/20 rounded border border-red-200/50 dark:border-red-900/40 p-3 mb-4">
                                            <span className="text-xs font-semibold text-red-900 dark:text-red-400 block mb-1">Proposed Fix:</span>
                                            <p className="text-sm text-red-800 dark:text-red-300/90">{insight.proposal}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-[#2A1215]">
                                                Approve
                                            </button>
                                            <button className="px-3 py-1.5 bg-transparent border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-[#2A1215]">
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (insight.type === "optimization") {
                        return (
                            <div key={insight.id} className="bg-blue-50 dark:bg-[#101E36] border border-blue-100 dark:border-blue-900/40 rounded-lg p-4 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">{insight.title}</h4>
                                        <p className="text-sm text-blue-800 dark:text-blue-400/90 mb-4 leading-relaxed">{insight.body}</p>

                                        <div className="flex items-center gap-2">
                                            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-[#101E36]">
                                                Execute Pause
                                            </button>
                                            <button className="px-3 py-1.5 bg-transparent border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-[#101E36]">
                                                Ignore
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (insight.type === "resolution") {
                        return (
                            <div key={insight.id} className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg p-4 opacity-80 hover:opacity-100 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 text-emerald-600 dark:text-emerald-500">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-300 mb-0.5">{insight.title}</h4>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{insight.body}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
}
