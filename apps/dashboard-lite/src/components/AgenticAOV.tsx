"use client";

import { useEffect, useState } from "react";

export function AgenticAOV() {
    const [standardAOV, setStandardAOV] = useState(0);
    const [agenticAOV, setAgenticAOV] = useState(0);

    useEffect(() => {
        // Simulated fetching from orchestrator mapping array
        setTimeout(() => {
            setStandardAOV(64.50);
            setAgenticAOV(89.20);
        }, 600);
    }, []);

    const uplift = standardAOV > 0 ? (((agenticAOV - standardAOV) / standardAOV) * 100).toFixed(1) : 0;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Agentic AOV Impact
            </h2>

            <p className="text-sm text-zinc-400 mb-6">Measuring logical AI upselling through Semantic Bundles versus standard impulse conversions.</p>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Standard AOV</div>
                    <div className="text-2xl font-bold text-zinc-300">${standardAOV.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-1">Agentic AOV</div>
                    <div className="text-2xl font-bold text-emerald-400">${agenticAOV.toFixed(2)}</div>

                    {Number(uplift) > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded font-mono">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            {uplift}% Uplift
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
