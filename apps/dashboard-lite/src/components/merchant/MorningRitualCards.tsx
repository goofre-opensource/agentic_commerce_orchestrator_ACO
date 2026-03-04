"use client";

import React from "react";

interface KPICardProps {
    label: string;
    value: string;
    subtext: string;
    icon: string;
    accentColor: string;
    bgColor: string;
    textColor: string;
}

function KPICard({ label, value, subtext, icon, accentColor, bgColor, textColor }: KPICardProps) {
    return (
        <div className={`${bgColor} rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[180px] relative overflow-hidden`}>
            {/* Soft background blob */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${accentColor} opacity-20 blur-xl`} />

            <div className="flex items-start justify-between relative">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
                <span className="text-2xl">{icon}</span>
            </div>

            <div className="relative mt-2">
                <p className={`text-5xl font-black tracking-tight ${textColor} leading-none`}>{value}</p>
                <p className="text-sm font-medium text-slate-500 mt-2">{subtext}</p>
            </div>
        </div>
    );
}

export function MorningRitualCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <KPICard
                label="Total Sales"
                value="$12,480"
                subtext="↑ 12% from last week"
                icon="💚"
                bgColor="bg-emerald-50"
                accentColor="bg-emerald-400"
                textColor="text-emerald-700"
            />
            <KPICard
                label="Active Google Agents"
                value="1,024"
                subtext="products live for AI discovery"
                icon="✨"
                bgColor="bg-blue-50"
                accentColor="bg-blue-400"
                textColor="text-blue-700"
            />
            <KPICard
                label="Local Traffic Value"
                value="$3,210"
                subtext="driven via Local Inventory Ads & Maps"
                icon="📍"
                bgColor="bg-violet-50"
                accentColor="bg-violet-400"
                textColor="text-violet-700"
            />
        </div>
    );
}
