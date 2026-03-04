"use client";

import React from "react";
import { ConversationalSearch } from "@/components/merchant/ConversationalSearch";
import { MorningRitualCards } from "@/components/merchant/MorningRitualCards";
import { HeroZombieMatrix } from "@/components/merchant/HeroZombieMatrix";
import { PlainEnglishFeed } from "@/components/merchant/PlainEnglishFeed";

export default function MerchantDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* ── HEADER ─────────────────────────────── */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Merchant branding */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">Apex Hardware</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Powered by Goofre Agency</p>
                        </div>
                    </div>

                    {/* Conversational AI Omnibar */}
                    <div className="flex-1 max-w-lg mx-8">
                        <ConversationalSearch />
                    </div>

                    {/* Agent pulse */}
                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-600">Agents Active</span>
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT ──────────────────────────── */}
            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Greeting */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Good morning, Sarah. ☀️</h1>
                    <p className="text-slate-500 mt-1">
                        Here's your store on{" "}
                        <span className="font-semibold text-slate-700">
                            Saturday, March 1
                        </span>
                        . Everything looks great.
                    </p>
                </div>

                {/* Row 1: Morning Ritual KPIs */}
                <section aria-label="Key Performance Indicators">
                    <MorningRitualCards />
                </section>

                {/* Row 2: Matrix + Feed (side by side) */}
                <section aria-label="Insights" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Scatter Matrix (3/5) */}
                    <div className="lg:col-span-3">
                        <HeroZombieMatrix />
                    </div>

                    {/* Plain English Feed (2/5) */}
                    <div className="lg:col-span-2">
                        <PlainEnglishFeed />
                    </div>
                </section>
            </main>

            {/* ── FOOTER ─────────────────────────────── */}
            <footer className="mt-16 pb-8">
                <div className="max-w-5xl mx-auto px-6">
                    <p className="text-center text-xs text-slate-300 font-medium">
                        Powered by <span className="text-slate-400 font-semibold">Goofre</span> — Agentic Commerce Orchestrator
                    </p>
                </div>
            </footer>
        </div>
    );
}
