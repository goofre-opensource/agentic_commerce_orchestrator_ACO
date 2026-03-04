"use client";

// Maps to analyticsService.ts GA4 Predictive Churn / Retention data
export function RetentionGauge() {
    const repeatRate = 24.5;
    const churnRisk = 4.2;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                GA4 Predictive Analytics
            </h2>

            <div className="grid grid-cols-2 gap-6">
                {/* Repeat Purchase Rate */}
                <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-24 h-24 mb-2">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" className="stroke-zinc-800 stroke-[8px] fill-transparent" />
                            <circle
                                cx="48" cy="48" r="40"
                                className="stroke-pink-500 stroke-[8px] fill-transparent stroke-dasharray-[251.2] transition-all duration-1000 ease-out"
                                style={{ strokeDashoffset: 251.2 - (251.2 * repeatRate) / 100, strokeLinecap: 'round' }}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-xl font-bold text-zinc-100">{repeatRate}%</span>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-zinc-400 text-center">90-Day Repeat<br />Purchase Rate</span>
                </div>

                {/* Churn Risk */}
                <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-24 h-24 mb-2">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" className="stroke-zinc-800 stroke-[8px] fill-transparent" />
                            <circle
                                cx="48" cy="48" r="40"
                                className="stroke-amber-500 stroke-[8px] fill-transparent stroke-dasharray-[251.2] transition-all duration-1000 ease-out"
                                style={{ strokeDashoffset: 251.2 - (251.2 * churnRisk) / 100, strokeLinecap: 'round' }}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-xl font-bold text-zinc-100">{churnRisk}%</span>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-zinc-400 text-center">Predictive<br />Churn Risk</span>
                </div>
            </div>
        </div>
    );
}
