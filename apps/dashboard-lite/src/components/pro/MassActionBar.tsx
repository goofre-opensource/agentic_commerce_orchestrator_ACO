"use client";

import React from "react";

interface MassActionBarProps {
    selectedCount: number;
}

export function MassActionBar({ selectedCount }: MassActionBarProps) {
    const [selectedAction, setSelectedAction] = React.useState<string>("audit");

    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-4 px-4 py-3 bg-white/5 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] rounded-full">

                {/* Count Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[11px] font-mono-data text-indigo-400 font-semibold tracking-wide">
                        {selectedCount} SELECTED
                    </span>
                </div>

                {/* Action Dropdown */}
                <div className="relative">
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="appearance-none bg-black/40 border border-white/10 hover:border-white/20 text-zinc-300 text-xs font-medium py-2 pl-4 pr-10 rounded-full focus:outline-none transition-colors cursor-pointer"
                    >
                        <option value="audit">Audit All Schema Markup</option>
                        <option value="loyalty">Deploy Wallet Loyalty Updates</option>
                        <option value="locks">Enforce Strict Mutability Locks</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>

                {/* Execute Button */}
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold py-2 px-5 rounded-full transition-all shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]">
                    <span>Execute</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono-data">{selectedCount}</span>
                </button>

            </div>
        </div>
    );
}
