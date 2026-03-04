"use client";

import React, { useState, useRef, useEffect } from "react";

// Micro sparkline SVG
function Sparkline({ values, color }: { values: number[]; color: string }) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const h = 40;
    const w = 120;
    const pts = values
        .map((v, i) => {
            const x = (i / (values.length - 1)) * w;
            const y = h - ((v - min) / (max - min + 1)) * h;
            return `${x},${y}`;
        })
        .join(" ");
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

const CANNED_RESPONSES: Record<string, { label: string; value: string; change: string; trend: number[] }> = {
    pickup: {
        label: "Local Pickup Revenue Today",
        value: "$3,240",
        change: "↑ 18% vs. yesterday",
        trend: [800, 1200, 900, 1600, 2100, 2800, 3240],
    },
    today: {
        label: "Total Sales Today",
        value: "$8,914",
        change: "↑ 12% vs. last week",
        trend: [4000, 5500, 6200, 7800, 7100, 8500, 8914],
    },
    google: {
        label: "Google Impression Value",
        value: "14,200 views",
        change: "↑ 23% via Google Shopping",
        trend: [5000, 8000, 9500, 11000, 12500, 13200, 14200],
    },
    wallet: {
        label: "Wallet Loyalty Members Added",
        value: "47 customers",
        change: "↑ 8 new since yesterday",
        trend: [10, 18, 22, 28, 35, 40, 47],
    },
};

function matchQuery(q: string): typeof CANNED_RESPONSES[string] | null {
    const s = q.toLowerCase();
    if (s.includes("pickup") || s.includes("local")) return CANNED_RESPONSES.pickup;
    if (s.includes("today") || s.includes("make") || s.includes("sales")) return CANNED_RESPONSES.today;
    if (s.includes("google") || s.includes("impression")) return CANNED_RESPONSES.google;
    if (s.includes("wallet") || s.includes("loyalty")) return CANNED_RESPONSES.wallet;
    return null;
}

export function ConversationalSearch() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<typeof CANNED_RESPONSES[string] | null>(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!query.trim()) {
            setResult(null);
            return;
        }
        setLoading(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const r = matchQuery(query);
            setResult(r);
            setLoading(false);
        }, 700);
    }, [query]);

    return (
        <div className="w-full max-w-2xl mx-auto relative z-30">
            {/* Pill Input */}
            <div className={`flex items-center gap-3 bg-white shadow-lg border transition-all duration-200 px-5 py-3.5 rounded-full ${query ? "border-blue-300 shadow-blue-100" : "border-slate-200"}`}>
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Ask your data anything... (e.g., 'How much did we make from local pickup today?')"
                    className="flex-1 bg-transparent text-slate-700 text-sm placeholder-slate-400 focus:outline-none font-medium"
                />
                {query && (
                    <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none">
                        ×
                    </button>
                )}
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">AI</span>
            </div>

            {/* Dynamic Result Dropdown */}
            {query.trim().length > 3 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all">
                    {loading ? (
                        <div className="flex items-center gap-3 px-6 py-5">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-sm text-slate-500">Analyzing your data...</span>
                        </div>
                    ) : result ? (
                        <div className="flex items-center justify-between px-6 py-5">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{result.label}</p>
                                <p className="text-4xl font-black text-slate-900">{result.value}</p>
                                <p className="text-sm text-emerald-500 font-semibold mt-1">{result.change}</p>
                            </div>
                            <Sparkline values={result.trend} color="#10B981" />
                        </div>
                    ) : (
                        <div className="px-6 py-5 text-sm text-slate-500">
                            No data found for that query. Try asking about "sales today" or "local pickup."
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
