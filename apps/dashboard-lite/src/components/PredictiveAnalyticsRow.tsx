"use client";

import { useEffect, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface RetentionData {
    repeatPurchaseRate: number;
    isHealthy: boolean;
}

interface PredictiveCohort {
    channelGroup: string;
    purchaseProbability: number;
    churnProbability: number;
}

// ── Component ───────────────────────────────────────────────────────────────

export function PredictiveAnalyticsRow() {
    const [retention, setRetention] = useState<RetentionData | null>(null);
    const [cohorts, setCohorts] = useState<PredictiveCohort[]>([]);

    useEffect(() => {
        // Simulate fetching from analyticsService.ts
        const timer = setTimeout(() => {
            setRetention({
                repeatPurchaseRate: 24.5,
                isHealthy: true, //  24.5% > 15% threshold
            });

            setCohorts([
                { channelGroup: "Organic Search", purchaseProbability: 12.8, churnProbability: 4.2 },
                { channelGroup: "Paid Social", purchaseProbability: 8.1, churnProbability: 11.4 },
                { channelGroup: "Direct", purchaseProbability: 19.3, churnProbability: 2.1 },
                { channelGroup: "Email", purchaseProbability: 22.7, churnProbability: 3.8 },
            ]);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // SVG gauge constants
    const RADIUS = 38;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    // Threshold color logic
    const rprColor =
        retention && retention.repeatPurchaseRate < 15
            ? "text-[#F59E0B]"         // Cybernetic Amber — below threshold
            : "text-[#22C55E]";        // Neon Green — healthy
    const rprStroke =
        retention && retention.repeatPurchaseRate < 15
            ? "#F59E0B"
            : "#22C55E";
    const rprGlow =
        retention && retention.repeatPurchaseRate < 15
            ? "animate-glow-amber"
            : "";

    return (
        <div className="bg-[#0F0F12] border border-[#1C1C21] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1C1C21]">
                <div className="flex items-center gap-2">
                    <span className="text-[#D946EF]">◈</span>
                    <span className="text-[10px] font-mono-data text-zinc-600 tracking-wider uppercase">
                        Predictive Intelligence — GA4 Machine Learning
                    </span>
                </div>
                <span className="text-[9px] font-mono-data text-zinc-700">
                    Source: GA4 Audiences API
                </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-5 divide-x divide-[#1C1C21] p-0">
                {/* ── Retention Gauge ──────────────────────────────────────── */}
                <div className={`col-span-1 flex flex-col items-center justify-center py-6 ${rprGlow}`}>
                    {retention ? (
                        <>
                            <div className="relative w-24 h-24 mb-3">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                                    <circle
                                        cx="48" cy="48" r={RADIUS}
                                        fill="transparent"
                                        stroke="#1C1C21"
                                        strokeWidth="6"
                                    />
                                    <circle
                                        cx="48" cy="48" r={RADIUS}
                                        fill="transparent"
                                        stroke={rprStroke}
                                        strokeWidth="6"
                                        strokeDasharray={CIRCUMFERENCE}
                                        strokeDashoffset={CIRCUMFERENCE - (CIRCUMFERENCE * retention.repeatPurchaseRate) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-xl font-bold font-mono-data ${rprColor}`}>
                                        {retention.repeatPurchaseRate}%
                                    </span>
                                </div>
                            </div>
                            <span className="text-[10px] text-zinc-500 text-center leading-tight">
                                90-Day Repeat<br />Purchase Rate
                            </span>
                            {!retention.isHealthy && (
                                <span className="mt-2 text-[9px] font-mono-data text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                                    ⚠ BELOW 15% THRESHOLD
                                </span>
                            )}
                        </>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-[#131316] animate-pulse" />
                    )}
                </div>

                {/* ── Agentic Readiness Cohorts ─────────────────────────────── */}
                {cohorts.length > 0 ? (
                    cohorts.map((cohort) => (
                        <div key={cohort.channelGroup} className="flex flex-col py-5 px-4">
                            <span className="text-[10px] font-mono-data text-zinc-600 tracking-wider mb-3 truncate">
                                {cohort.channelGroup.toUpperCase()}
                            </span>

                            {/* Purchase Probability */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] text-zinc-600">Purchase Prob.</span>
                                    <span className="text-xs font-mono-data text-[#22C55E] font-semibold">
                                        {cohort.purchaseProbability}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-[#131316] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#22C55E] rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(cohort.purchaseProbability * 3, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Churn Probability */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] text-zinc-600">Churn Risk</span>
                                    <span className={`text-xs font-mono-data font-semibold ${cohort.churnProbability > 10
                                            ? "text-[#EF4444]"
                                            : cohort.churnProbability > 5
                                                ? "text-[#F59E0B]"
                                                : "text-zinc-400"
                                        }`}>
                                        {cohort.churnProbability}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-[#131316] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${cohort.churnProbability > 10
                                                ? "bg-[#EF4444]"
                                                : cohort.churnProbability > 5
                                                    ? "bg-[#F59E0B]"
                                                    : "bg-zinc-600"
                                            }`}
                                        style={{ width: `${Math.min(cohort.churnProbability * 5, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col py-5 px-4">
                            <div className="h-3 bg-[#131316] rounded w-20 mb-3 animate-pulse" />
                            <div className="h-1.5 bg-[#131316] rounded-full mb-3 animate-pulse" />
                            <div className="h-1.5 bg-[#131316] rounded-full animate-pulse" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
