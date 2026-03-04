"use client";

import { useEffect, useState } from "react";
const CORE_ENGINE_URL = process.env.NEXT_PUBLIC_CORE_ENGINE_URL ?? "http://localhost:3001";

async function checkCoreEngineHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${CORE_ENGINE_URL}/health`, { cache: "no-store" });
        return res.ok;
    } catch {
        return false;
    }
}
import { AlertTriangle, X } from "lucide-react";

export function ConnectivityPulse() {
    const [isOffline, setIsOffline] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const checkHealth = async () => {
            const isHealthy = await checkCoreEngineHealth();

            if (isMounted) {
                if (!isHealthy) {
                    setIsOffline(true);
                    setIsVisible(true);
                } else {
                    setIsOffline(false);
                    setIsVisible(false);
                }
            }
        };

        // Initial check
        checkHealth();

        // Set up polling every 30 seconds
        const intervalId = setInterval(checkHealth, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    if (!isOffline || !isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md text-red-600 dark:text-red-400 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
                <div className="bg-red-500/20 p-2 rounded-full">
                    <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold">System Offline</p>
                    <p className="text-xs opacity-90">Cannot reach UCP Orchestrator</p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-red-500/20 rounded-lg transition-colors ml-2"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
