"use client";

import React, { useState } from "react";
import { GlobalTriage } from "@/components/pro/GlobalTriage";
import { PortfolioGrid, MerchantData } from "@/components/pro/PortfolioGrid";
import { MassActionBar } from "@/components/pro/MassActionBar";

const MOCK_MERCHANTS: MerchantData[] = [
    { id: "m-1", name: "Apex Hardware", origin: "Shopify", healthScore: 98, activeEnrichments: 42, gmv: "$124,500" },
    { id: "m-2", name: "Lumina Lighting", origin: "WooCommerce", healthScore: 72, activeEnrichments: 18, gmv: "$89,200" },
    { id: "m-3", name: "Vertex Fitness", origin: "Square", healthScore: 96, activeEnrichments: 55, gmv: "$210,000" },
    { id: "m-4", name: "Nova Apparel", origin: "Magento", healthScore: 84, activeEnrichments: 31, gmv: "$156,750" },
    { id: "m-5", name: "Zenith Kitchenware", origin: "Shopify", healthScore: 100, activeEnrichments: 60, gmv: "$345,000" },
    { id: "m-6", name: "Pinnacle Outdoor", origin: "WooCommerce", healthScore: 65, activeEnrichments: 12, gmv: "$45,900" },
    { id: "m-7", name: "Aria Cosmetics", origin: "Shopify", healthScore: 92, activeEnrichments: 28, gmv: "$112,400" },
    { id: "m-8", name: "Summit Electronics", origin: "Magento", healthScore: 88, activeEnrichments: 45, gmv: "$280,500" },
];

export default function ProDashboardPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleToggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleToggleAll = () => {
        if (selectedIds.length === MOCK_MERCHANTS.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(MOCK_MERCHANTS.map(m => m.id));
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden">
            {/* Liquid Glass / Deep Space Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Faint purple/blue glow (The Brain) */}
                <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-8 py-8 h-screen flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between mb-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400">
                            G
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight">Goofre <span className="text-zinc-400 font-normal">Pro Command Center</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono-data text-zinc-500 bg-white/5 px-2.5 py-1 rounded border border-white/10 backdrop-blur-md">
                            MULTI-TENANT LAYER
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-[10px] font-mono-data text-emerald-500/80 tracking-widest uppercase">
                                AGENCY UPLINK SECURE
                            </span>
                        </div>
                    </div>
                </header>

                {/* Global Triage Inbox (Top) */}
                <div className="shrink-0 mb-4 z-20">
                    <GlobalTriage />
                </div>

                {/* Portfolio Grid (Lower 2/3) */}
                <div className="flex-1 min-h-0 z-10 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">Multi-Tenant Portfolio</h3>
                        <p className="text-[10px] font-mono-data text-zinc-500 mt-0.5">8 ACTIVE MERCHANTS MANAGED</p>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <PortfolioGrid
                            merchants={MOCK_MERCHANTS}
                            selectedIds={selectedIds}
                            onToggleSelection={handleToggleSelection}
                            onToggleAll={handleToggleAll}
                        />
                    </div>
                </div>
            </div>

            {/* Mass Action Command Bar */}
            <MassActionBar selectedCount={selectedIds.length} />
        </div>
    );
}
