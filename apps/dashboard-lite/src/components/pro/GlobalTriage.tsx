"use client";

import React from "react";

// Mock Data
const ALERTS = [
    {
        id: "al-1",
        priority: 1,
        status: "critical",
        merchant: "Merchant A",
        origin: "Shopify Origin",
        title: "UCP Webhook Connection Lost",
        desc: "Checkout failing.",
        icon: "🚨",
    },
    {
        id: "al-2",
        priority: 2,
        status: "critical",
        merchant: "Merchant D",
        origin: "Magento Origin",
        title: "GBP Sync Failed",
        desc: "Store hours mismatch.",
        icon: "🚨",
    },
    {
        id: "al-3",
        priority: 3,
        status: "opportunity",
        merchant: "Merchant C",
        origin: "Square Origin",
        title: "15 GTIN Paradoxes detected",
        desc: "1-Click Agentic Resolution ready.",
        icon: "✨",
    }
];

export function GlobalTriage() {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">Global Triage Inbox</h2>
                    <p className="text-[10px] font-mono-data text-zinc-500 mt-0.5">EXCEPTIONS & AUTONOMOUS DISCOVERIES ACROSS ALL NODES</p>
                </div>
                <span className="text-[10px] font-mono-data text-zinc-600 px-2 py-0.5 border border-zinc-800 rounded bg-zinc-900/50">
                    3 ACTIVE ALERTS
                </span>
            </div>

            <div className="space-y-3">
                {ALERTS.map((alert) => {
                    const isCritical = alert.status === "critical";
                    const bgColor = isCritical ? "bg-rose-500/10" : "bg-amber-400/10";
                    const textColor = isCritical ? "text-rose-500" : "text-amber-400";
                    const borderColor = isCritical ? "border-rose-500/20" : "border-amber-400/20";
                    const hoverBorder = isCritical ? "hover:border-rose-500/40" : "hover:border-amber-400/40";
                    const btnClass = isCritical
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                        : "bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20";

                    return (
                        <div
                            key={alert.id}
                            className={`flex items-center justify-between px-5 py-3.5 rounded-lg border backdrop-blur-xl transition-colors ${bgColor} ${borderColor} ${hoverBorder} text-sm`}
                        >
                            <div className="flex items-start gap-4 flex-1">
                                <span className="text-base select-none mt-0.5">{alert.icon}</span>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-zinc-100">{alert.merchant}</span>
                                        <span className="text-[10px] font-mono-data text-zinc-500">[{alert.origin}]</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${textColor}`}>
                                            {alert.title}.
                                        </span>
                                        <span className="text-zinc-400">{alert.desc}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className={`px-4 py-1.5 text-xs font-semibold rounded shrink-0 transition-colors ${btnClass}`}>
                                Resolve
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
