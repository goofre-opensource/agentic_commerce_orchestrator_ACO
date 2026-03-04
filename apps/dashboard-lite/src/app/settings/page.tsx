"use client";

import { useState } from "react";

// Simple UI primitives for the mock settings page
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-6 border border-[#27272A] rounded-md bg-[#09090B] flex flex-col gap-4 ${className}`}>
        {children}
    </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-sm font-medium text-[#E4E4E7]">{children}</label>
);

const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-[#10B981]' : 'bg-[#27272A]'}`}
    >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
);

export default function SettingsPage() {
    const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const runDiagnostics = async () => {
        setIsRunning(true);
        setDiagnosticsLogs([]);

        const nodes = [
            { name: "Google Merchant Center", ms: 45 + Math.random() * 20 },
            { name: "Google Wallet API", ms: 80 + Math.random() * 30 },
            { name: "Google Shopping Graph", ms: 30 + Math.random() * 15 },
            { name: "Google Business Profile", ms: 120 + Math.random() * 50 },
            { name: "Google Search Console", ms: 50 + Math.random() * 20 },
            { name: "Google Analytics (GA4)", ms: 40 + Math.random() * 10 },
            { name: "Google Ads API", ms: 90 + Math.random() * 40 },
            { name: "Merchant Studio", ms: 25 + Math.random() * 15 },
        ];

        setDiagnosticsLogs(["[SYSTEM] Initiating UCP topology payload ping..."]);

        for (let i = 0; i < nodes.length; i++) {
            await new Promise(r => setTimeout(r, 400));
            setDiagnosticsLogs(prev => [...prev, `[PING] ${nodes[i].name.padEnd(25, '.')} ${nodes[i].ms.toFixed(1)}ms \t[OK]`]);
        }

        await new Promise(r => setTimeout(r, 600));
        setDiagnosticsLogs(prev => [...prev, "[SYSTEM] Diagnostics complete. All 8 nodes responsive."]);
        setIsRunning(false);
    };

    return (
        <div className="max-w-[1200px] mx-auto p-6 md:p-8 flex flex-col gap-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Quick Integrations</h2>
                <p className="text-sm text-[#A1A1AA] mt-1">Configure your orchestration endpoints and mutability locks.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Panel A: Google Cloud Orchestration */}
                <Card>
                    <div>
                        <h3 className="text-lg font-medium text-white mb-1">Google Cloud Orchestration</h3>
                        <p className="text-sm text-[#71717A]">Authenticate to provision the 8-node API cluster.</p>
                    </div>

                    <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-md font-mono text-xs text-[#A1A1AA]">
                        <div className="mb-2 text-[#E4E4E7] font-semibold">Required Scopes:</div>
                        <ul className="list-disc list-inside space-y-1">
                            <li>https://www.googleapis.com/auth/content</li>
                            <li>https://www.googleapis.com/auth/wallet_object.issuer</li>
                            <li>https://www.googleapis.com/auth/business.manage</li>
                            <li>https://www.googleapis.com/auth/webmasters</li>
                            <li>https://www.googleapis.com/auth/analytics.edit</li>
                            <li>https://www.googleapis.com/auth/adwords</li>
                        </ul>
                    </div>

                    <button className="mt-2 w-full py-2.5 bg-white text-black font-semibold rounded-md hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Authenticate Merchant Account
                    </button>
                </Card>

                {/* Panel B: Ingestion Sources */}
                <Card>
                    <div>
                        <h3 className="text-lg font-medium text-white mb-1">Ingestion Source</h3>
                        <p className="text-sm text-[#71717A]">Configure your legacy e-commerce sync.</p>
                    </div>

                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label>Platform</Label>
                            <select className="w-full h-10 px-3 bg-[#18181B] border border-[#27272A] rounded-md text-sm text-[#E4E4E7] focus:outline-none focus:ring-1 focus:ring-[#10B981]">
                                <option value="shopify">Shopify</option>
                                <option value="woocommerce">WooCommerce</option>
                                <option value="square">Square</option>
                                <option value="custom">Custom API</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Webhook Payload Secret</Label>
                            <input
                                type="password"
                                defaultValue="whsec_8f9a2b4c6e8d1f0a3b"
                                className="w-full h-10 px-3 flex items-center bg-[#18181B] border border-[#27272A] rounded-md text-sm text-[#E4E4E7] font-mono focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                            />
                            <p className="text-xs text-[#71717A]">Used to verify incoming requests from the platform.</p>
                        </div>
                    </div>
                </Card>

                {/* Panel C: PoS Integration */}
                <Card className="lg:col-span-1">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-1">Point of Sale (PoS) Integration</h3>
                        <p className="text-sm text-[#71717A]">Sync local inventory from physical stores.</p>
                    </div>

                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label>PoS System</Label>
                            <select className="w-full h-10 px-3 bg-[#18181B] border border-[#27272A] rounded-md text-sm text-[#E4E4E7] focus:outline-none focus:ring-1 focus:ring-[#10B981]">
                                <option value="micros">Oracle MICROS</option>
                                <option value="square">Square POS</option>
                                <option value="clover">Clover</option>
                                <option value="lightspeed">Lightspeed</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Polling Interval (Minutes)</Label>
                            <input
                                type="number"
                                defaultValue="15"
                                min="1"
                                max="60"
                                className="w-full h-10 px-3 flex items-center bg-[#18181B] border border-[#27272A] rounded-md text-sm text-[#E4E4E7] font-mono focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                            />
                        </div>
                        <p className="text-xs text-[#10B981] flex items-center gap-1.5 mt-2 bg-[#10B981]/10 p-2 rounded border border-[#10B981]/20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h.01" /><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m9 15 2 2 4-4" /></svg>
                            Data Mutability Locks enabled by default to protect optimized UCP state.
                        </p>
                    </div>
                </Card>

                {/* Panel D: Diagnostics Terminal */}
                <Card className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-medium text-white mb-1">Routing Diagnostics</h3>
                            <p className="text-sm text-[#71717A]">Verify Switchboard connectivity.</p>
                        </div>
                        <button
                            onClick={runDiagnostics}
                            disabled={isRunning}
                            className={`px-3 py-1.5 text-xs font-mono rounded-md border ${isRunning ? 'bg-[#27272A] text-[#71717A] border-[#3F3F46]' : 'bg-[#18181B] text-[#10B981] border-[#10B981]/50 hover:bg-[#10B981]/10'} transition-colors`}
                        >
                            [ RUN DIAGNOSTICS ]
                        </button>
                    </div>

                    <div className="w-full h-[200px] bg-[#000000] border border-[#27272A] rounded-md p-4 font-mono text-[13px] leading-relaxed overflow-y-auto text-[#E4E4E7]">
                        {diagnosticsLogs.length === 0 && !isRunning && (
                            <span className="text-[#71717A]">Awaiting diagnostic execution...</span>
                        )}
                        {diagnosticsLogs.map((log, i) => (
                            <div key={i} className={
                                log.includes('SYSTEM') ? 'text-[#A1A1AA]' :
                                    log.includes('OK') ? 'text-[#34D399]' : ''
                            }>
                                {log}
                            </div>
                        ))}
                        {isRunning && (
                            <div className="animate-pulse w-2 h-4 bg-[#71717A] mt-1" />
                        )}
                    </div>
                </Card>

            </div>
        </div>
    );
}
