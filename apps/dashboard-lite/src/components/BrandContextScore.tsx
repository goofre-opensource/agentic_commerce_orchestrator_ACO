"use client";

import { useEffect, useState } from "react";

export function BrandContextScore() {
    const [score, setScore] = useState<number>(0);
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        // Simulated fetching Semantic Context scoring from orchestrator manifest
        setTimeout(() => setScore(42), 600);
    }, []);

    useEffect(() => {
        if (score > 0) {
            let interval = setInterval(() => {
                setAnimatedScore((prev) => {
                    if (prev < score) return prev + 1;
                    clearInterval(interval);
                    return score;
                });
            }, 20);
            return () => clearInterval(interval);
        }
    }, [score]);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Brand Context & Richness
            </h2>

            <div className="flex items-center gap-6">
                <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" className="stroke-zinc-800 stroke-[8px] fill-transparent" />
                        <circle
                            cx="48" cy="48" r="40"
                            className={`stroke-[8px] fill-transparent stroke-dasharray-[251.2] transition-all duration-300 ease-out ${score < 50 ? 'stroke-rose-500' : 'stroke-emerald-500'}`}
                            style={{ strokeDashoffset: 251.2 - (251.2 * animatedScore) / 100, strokeLinecap: 'round' }}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-zinc-100">{animatedScore}%</span>
                    </div>
                </div>

                <div className="flex-1">
                    {score < 50 ? (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-sm">
                            <span className="font-bold text-rose-400 block mb-1">⚠️ Low Semantic Data</span>
                            <p className="text-zinc-400">AI agents currently view your catalog as a commodity warehouse. Add <span className="text-zinc-300 font-semibold">Warranty</span> and <span className="text-zinc-300 font-semibold">Material Claims</span> to improve Brand Advocacy.</p>
                        </div>
                    ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm">
                            <span className="font-bold text-emerald-400 block mb-1">✓ High Semantic Resonance</span>
                            <p className="text-zinc-400">Your brand context allows AI agents to justify premium price points over competitors.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
