"use client";

import Link from "next/link";
import { ArrowLeft, Rocket, ShieldCheck, Zap } from "lucide-react";

export default function PortfolioBeta() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-zinc-900 dark:text-[#E4E4E7] font-sans flex flex-col items-center justify-center p-6 selection:bg-[#34D399]/30 transition-colors duration-300">
            <div className="max-w-2xl w-full bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl p-12 shadow-2xl relative overflow-hidden text-center">
                {/* Glow effect */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-pulse">
                        <Rocket className="w-8 h-8" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent">
                        Goofre Portfolio
                    </h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                        The ultimate Merchant Portfolio & Omnichannel Command Center is currently in <span className="text-emerald-500 font-semibold italic">Private Beta</span>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/20 rounded-lg border border-zinc-100 dark:border-white/5">
                            <Zap className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-sm font-semibold">Instant Triage</p>
                                <p className="text-xs text-zinc-500">Cross-merchant insight aggregation</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/20 rounded-lg border border-zinc-100 dark:border-white/5">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-sm font-semibold">Audit Ready</p>
                                <p className="text-xs text-zinc-500">Automatic compliance monitoring</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-white/90 transition-all shadow-lg hover:shadow-emerald-500/10"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to Dashboard
                        </Link>
                    </div>

                    <p className="mt-8 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                        Targeting April 2026 Production Rollout
                    </p>
                </div>
            </div>
        </div>
    );
}
