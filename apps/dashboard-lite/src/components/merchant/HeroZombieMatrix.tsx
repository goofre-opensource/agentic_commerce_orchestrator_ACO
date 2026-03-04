"use client";

import React, { useState } from "react";

interface Product {
    id: string;
    name: string;
    revenue: number; // 0–100
    spend: number;   // 0–100
}

const PRODUCTS: Product[] = [
    // Heroes (high rev, low spend)
    { id: "p1", name: "Running Shoes Pro", revenue: 88, spend: 35 },
    { id: "p2", name: "Wool Beanie", revenue: 75, spend: 28 },
    { id: "p3", name: "Insulated Jacket", revenue: 92, spend: 42 },
    // Zombies (low rev, high spend)
    { id: "p4", name: "Retro Sunglasses", revenue: 22, spend: 72 },
    { id: "p5", name: "Neon Belt Pack", revenue: 15, spend: 85 },
    // Sleepers (low rev, low spend)
    { id: "p6", name: "Canvas Tote Bag", revenue: 30, spend: 18 },
    { id: "p7", name: "Enamel Pin Set", revenue: 18, spend: 12 },
    // Rising (mod rev, mod spend)
    { id: "p8", name: "Trail Mix Socks", revenue: 55, spend: 48 },
    { id: "p9", name: "Merino Base Layer", revenue: 65, spend: 55 },
];

function getQuadrant(p: Product) {
    const highRev = p.revenue >= 50;
    const highSpend = p.spend >= 50;
    if (highRev && !highSpend) return "hero";
    if (!highRev && highSpend) return "zombie";
    if (!highRev && !highSpend) return "sleeper";
    return "rising";
}

const QUADRANT_STYLE = {
    hero: { dot: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]", label: "Hero ✅", action: "Agency is scaling PMax budget for this item." },
    zombie: { dot: "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]", label: "Zombie 🔴", action: "Zombie Detected: Agency algorithm has paused PMax spend for this item." },
    sleeper: { dot: "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.5)]", label: "Sleeper 💤", action: "Untapped opportunity. Agency is A/B testing a new ad creative." },
    rising: { dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]", label: "Rising ⭐", action: "Mid-tier performer. Being monitored for breakout potential." },
};

export function HeroZombieMatrix() {
    const [hovered, setHovered] = useState<Product | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    const handleMouseEnter = (p: Product, e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const parent = e.currentTarget.closest(".matrix-chart")?.getBoundingClientRect();
        if (parent) {
            setTooltipPos({ x: rect.left - parent.left + 16, y: rect.top - parent.top - 80 });
        }
        setHovered(p);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Product Performance Matrix</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Revenue vs. Ad Spend (Google PMax)</p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    {Object.entries(QUADRANT_STYLE).map(([key, s]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                            <span className="capitalize">{key}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative matrix-chart bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden" style={{ height: 300 }}>
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200" />
                </div>

                {/* Quadrant labels */}
                <div className="absolute top-3 left-3 text-[10px] font-semibold text-blue-400 tracking-wide uppercase">Sleepers</div>
                <div className="absolute top-3 right-3 text-[10px] font-semibold text-emerald-500 tracking-wide uppercase">Heroes</div>
                <div className="absolute bottom-3 left-3 text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Low Activity</div>
                <div className="absolute bottom-3 right-3 text-[10px] font-semibold text-rose-500 tracking-wide uppercase">Zombies</div>

                {/* Dots */}
                {PRODUCTS.map((p) => {
                    const q = getQuadrant(p);
                    const style = QUADRANT_STYLE[q];
                    return (
                        <button
                            key={p.id}
                            onMouseEnter={e => handleMouseEnter(p, e)}
                            onMouseLeave={() => { setHovered(null); setTooltipPos(null); }}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-150 focus:outline-none"
                            style={{ left: `${p.spend}%`, top: `${100 - p.revenue}%` }}
                            aria-label={p.name}
                        >
                            <span className={`w-4 h-4 rounded-full block ${style.dot}`} />
                        </button>
                    );
                })}

                {/* Tooltip */}
                {hovered && tooltipPos && (
                    <div
                        className="absolute z-50 pointer-events-none bg-white rounded-2xl shadow-xl border border-slate-100 p-3 max-w-[200px]"
                        style={{ left: tooltipPos.x, top: Math.max(8, tooltipPos.y) }}
                    >
                        <p className="text-xs font-bold text-slate-800 mb-0.5">{hovered.name}</p>
                        <p className={`text-[10px] font-semibold mb-1 ${getQuadrant(hovered) === "zombie" ? "text-rose-500" : getQuadrant(hovered) === "hero" ? "text-emerald-500" : "text-blue-500"}`}>
                            {QUADRANT_STYLE[getQuadrant(hovered)].label}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{QUADRANT_STYLE[getQuadrant(hovered)].action}</p>
                    </div>
                )}

                {/* Axes labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-1 pointer-events-none">
                    <span className="text-[9px] text-slate-400">Low Spend</span>
                    <span className="text-[9px] text-slate-400">High Spend</span>
                </div>
                <div className="absolute top-0 bottom-0 right-1 flex flex-col justify-between py-4 pointer-events-none">
                    <span className="text-[9px] text-slate-400">High Revenue</span>
                    <span className="text-[9px] text-slate-400">Low Revenue</span>
                </div>
            </div>
        </div>
    );
}
