"use client";

import React from "react";

interface FeedItem {
    id: string;
    emoji: string;
    text: string;
    time: string;
    type: "value" | "alert" | "info";
}

const FEED: FeedItem[] = [
    {
        id: "f1",
        emoji: "✨",
        text: "Your agency's Goofre AI automatically fixed 12 missing barcodes overnight, keeping your top sellers active on Google Shopping.",
        time: "6:14 AM",
        type: "value",
    },
    {
        id: "f2",
        emoji: "📈",
        text: "A customer bought the last 'Mens Size 10 Boot' locally. We instantly updated your Google profile to prevent online overselling.",
        time: "7:02 AM",
        type: "alert",
    },
    {
        id: "f3",
        emoji: "🎯",
        text: "Automatically routed 45 recent buyers into your Google Wallet Loyalty program.",
        time: "7:30 AM",
        type: "value",
    },
    {
        id: "f4",
        emoji: "🛒",
        text: "3 new products detected from your latest Shopify import. UCP schema generated and submitted to Google Merchant Center.",
        time: "8:15 AM",
        type: "info",
    },
    {
        id: "f5",
        emoji: "📍",
        text: "Your 'Curbside Pickup' attribute was automatically turned ON after detecting stock above threshold at your Cambridge store.",
        time: "9:01 AM",
        type: "value",
    },
    {
        id: "f6",
        emoji: "🤖",
        text: "Agency paused PMax spend on 'Neon Belt Pack' — it was costing $85 per conversion. Budget reallocated to top-performing Running Shoes.",
        time: "10:44 AM",
        type: "alert",
    },
];

const TYPE_STYLES: Record<FeedItem["type"], string> = {
    value: "bg-emerald-50 text-emerald-900",
    alert: "bg-amber-50 text-amber-900",
    info: "bg-blue-50 text-blue-900",
};

export function PlainEnglishFeed() {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-base font-bold text-slate-800">What We Did For You</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Your agency in plain English, updated hourly</p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                </span>
            </div>

            {/* iMessage-style thread */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {FEED.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start">
                        {/* Emoji avatar */}
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                            {item.emoji}
                        </div>

                        {/* Bubble */}
                        <div className="flex-1">
                            <div className={`rounded-[20px] rounded-tl-sm px-4 py-3 ${TYPE_STYLES[item.type]} text-sm leading-relaxed font-medium shadow-sm`}>
                                {item.text}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 ml-1">{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
