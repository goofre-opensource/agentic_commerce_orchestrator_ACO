"use client";

import { useEffect, useState } from "react";

type Alert = {
    id: string;
    customerId: string;
    productTarget: string;
    probability: number;
    timeframe: string;
};

export function PredictiveReplenishAlert() {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        // Simulated mapping to GA4 purchaseProbability service
        setTimeout(() => {
            setAlerts([
                { id: "1", customerId: "CUS-8921", productTarget: "Acme Coffee Pods (120ct)", probability: 89, timeframe: "Next 48H" },
                { id: "2", customerId: "CUS-3342", productTarget: "Organic Face Cleanser", probability: 76, timeframe: "Next 7 Days" },
                { id: "3", customerId: "CUS-9102", productTarget: "Performance Protein 5lb", probability: 64, timeframe: "Next 14 Days" },
            ]);
        }, 800);
    }, []);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Predictive Restocking Alerts
            </h2>

            <p className="text-sm text-zinc-400 mb-4">Customers actively targeted by Gemini based on unified consumption patterns.</p>

            <div className="flex-1 space-y-3 overflow-y-auto">
                {alerts.length === 0 ? (
                    <div className="animate-pulse flex flex-col gap-3">
                        <div className="h-16 bg-zinc-800/50 rounded-lg"></div>
                        <div className="h-16 bg-zinc-800/50 rounded-lg"></div>
                    </div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                            <div>
                                <div className="text-zinc-200 font-medium text-sm">{alert.productTarget}</div>
                                <div className="text-zinc-500 text-xs mt-1">{alert.customerId} · Expected: <span className="text-zinc-400">{alert.timeframe}</span></div>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold font-mono ${alert.probability >= 80 ? 'text-emerald-400' : alert.probability >= 70 ? 'text-amber-400' : 'text-zinc-400'}`}>
                                    {alert.probability}%
                                </div>
                                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">Prob</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
