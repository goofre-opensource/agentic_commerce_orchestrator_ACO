"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Settings, Sun, Moon, ExternalLink } from "lucide-react";

export function TopNav() {
    const pathname = usePathname();
    const [toastVisible, setToastVisible] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Navigation logic handled by Link component

    useEffect(() => {
        if (toastVisible) {
            const t = setTimeout(() => setToastVisible(false), 5000);
            return () => clearTimeout(t);
        }
    }, [toastVisible]);

    return (
        <>
            <header className="border-b border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-[#050505]/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 shrink-0 transition-colors duration-300">
                <div className="flex items-center gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img src="/goofre-logo.svg" alt="Goofre Logo" className="h-8 w-auto object-contain" />
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            href="/"
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === "/" ? "bg-zinc-100 dark:bg-[#27272A] text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/settings"
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${pathname === "/settings" ? "bg-zinc-100 dark:bg-[#27272A] text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            Quick Integrations
                        </Link>

                        <div className="h-4 w-px bg-zinc-200 dark:bg-[#27272A] mx-2" />

                        <Link
                            href="/portfolio"
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${pathname === "/portfolio" ? "bg-zinc-100 dark:bg-[#27272A] text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
                                }`}
                        >
                            <ExternalLink className="w-4 h-4" />
                            Portfolio
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {mounted && (
                        <div className="flex bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg p-0.5">
                            <button
                                onClick={() => setTheme("dark")}
                                className={`px-3 py-1.5 flex items-center gap-2 rounded-[6px] text-xs font-semibold transition-all ${theme === "dark"
                                    ? "bg-[#18181B] text-white shadow-sm border border-white/10"
                                    : "text-zinc-500 hover:text-zinc-900"
                                    }`}
                            >
                                <Moon className="w-3 h-3" />
                                Night
                            </button>
                            <button
                                onClick={() => setTheme("light")}
                                className={`px-3 py-1.5 flex items-center gap-2 rounded-[6px] text-xs font-semibold transition-all ${theme === "light"
                                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                                    : "text-[#A1A1AA] hover:text-[#E4E4E7]"
                                    }`}
                            >
                                <Sun className="w-3 h-3" />
                                Day
                            </button>
                        </div>
                    )}
                    <span className="font-mono text-xs text-zinc-400 dark:text-[#71717A]">UCP_VERSION: 1.0.0</span>
                    <div className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-[#27272A] text-xs font-medium text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-[#3F3F46] transition-colors duration-300">
                        Open-Source Node
                    </div>
                </div>
            </header>

            {/* Custom Shadcn-style Toast */}
            {toastVisible && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-white dark:bg-[#09090B] border border-zinc-200 dark:border-white/10 shadow-lg rounded-md p-4 max-w-sm flex flex-col gap-3 transition-colors duration-300">
                        <div className="flex gap-3">
                            <div className="text-[#3B82F6]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Upgrade to Cloud Pro</h4>
                                <p className="text-sm text-zinc-500 dark:text-[#A1A1AA] mt-1">Managing multiple merchants? Deploy to Goofre Cloud Pro to unlock the Global Triage Inbox, custom domains, and Mass-Action Workflows.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-1">
                            <button onClick={() => setToastVisible(false)} className="px-3 py-1.5 text-xs text-zinc-500 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white transition-colors">Dismiss</button>
                            <a href="http://localhost:3005" className="px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm text-center inline-block">[ Go to Pro Environment ]</a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
