"use client";

import React from "react";

export interface MerchantData {
    id: string;
    name: string;
    origin: "Shopify" | "WooCommerce" | "Square" | "Magento";
    healthScore: number;
    activeEnrichments: number;
    gmv: string;
}

interface PortfolioGridProps {
    merchants: MerchantData[];
    selectedIds: string[];
    onToggleSelection: (id: string) => void;
    onToggleAll: () => void;
}

export function PortfolioGrid({ merchants, selectedIds, onToggleSelection, onToggleAll }: PortfolioGridProps) {
    const allSelected = merchants.length > 0 && selectedIds.length === merchants.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden relative">
            {/* Table Header */}
            <div className="grid grid-cols-[48px_1.5fr_1fr_1fr_1fr_1fr] items-center px-4 py-3 border-b border-white/10 bg-[#0A0A0A]/50 text-[10px] font-mono-data text-zinc-500 tracking-widest uppercase">
                <div className="flex items-center justify-center">
                    <button
                        onClick={onToggleAll}
                        className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${allSelected ? "bg-indigo-500 border-indigo-500 text-white" : someSelected ? "bg-indigo-500/50 border-indigo-500 text-transparent" : "border-zinc-700 bg-transparent"}`}
                    >
                        {allSelected && <span className="text-[10px]">✓</span>}
                        {someSelected && <span className="w-2 h-0.5 bg-white rounded-full"></span>}
                    </button>
                </div>
                <div>Client Name</div>
                <div>Origin Node</div>
                <div>UCP Health Score</div>
                <div>Active AI Enrichments</div>
                <div className="text-right pr-4">30-Day Orchestrated GMV</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
                {merchants.map((merchant) => {
                    const isSelected = selectedIds.includes(merchant.id);
                    const isHealthy = merchant.healthScore >= 95;

                    return (
                        <div
                            key={merchant.id}
                            className={`grid grid-cols-[48px_1.5fr_1fr_1fr_1fr_1fr] items-center px-4 py-4 transition-all hover:bg-white/[0.02] cursor-default
                ${isHealthy ? "opacity-60 hover:opacity-100" : "bg-red-500/[0.02]"}
                ${isSelected ? "bg-indigo-500/[0.08]" : ""}
              `}
                        >
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={() => onToggleSelection(merchant.id)}
                                    className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${isSelected ? "bg-indigo-500 border-indigo-500 text-white" : "border-zinc-700 bg-transparent hover:border-zinc-500"}`}
                                >
                                    {isSelected && <span className="text-[10px]">✓</span>}
                                </button>
                            </div>

                            <div className="font-medium text-zinc-200 text-sm">{merchant.name}</div>

                            <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-data border bg-zinc-900 border-zinc-800 text-zinc-400">
                                    {merchant.origin}
                                </span>
                            </div>

                            {/* Health Score Ring */}
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                                        <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${isHealthy ? 'text-emerald-500' : merchant.healthScore > 80 ? 'text-amber-400' : 'text-rose-500'}`} strokeWidth="3" strokeDasharray={`${merchant.healthScore}, 100`} strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute text-[10px] font-mono-data text-zinc-300">{merchant.healthScore}</span>
                                </div>
                                {!isHealthy && <span className="text-[10px] font-mono-data text-rose-500/80 bg-rose-500/10 px-1.5 py-0.5 rounded tracking-wide">ACTION_REQ</span>}
                            </div>

                            <div className="font-mono-data text-xs text-zinc-300">
                                <span className="text-zinc-500 mr-1.5 opacity-50">✨</span>
                                {merchant.activeEnrichments} RULES
                            </div>

                            <div className="font-mono-data text-xs text-zinc-200 text-right pr-4">
                                {merchant.gmv}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
