"use client";

import { useMockOrchestrator, NodeState } from "../hooks/useMockOrchestrator";

const StateDot = ({ state }: { state: NodeState }) => {
    const colorMap = {
        healthy: "bg-emerald-500 dark:bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        warning: "bg-amber-500 dark:bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse",
        critical: "bg-red-500 dark:bg-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse"
    };

    return (
        <div className={`w-2.5 h-2.5 rounded-full ${colorMap[state]} transition-all duration-300`} />
    );
};

const Cluster = ({ title, nodes }: { title: string, nodes: { name: string, state: NodeState }[] }) => {
    return (
        <div className="flex flex-col gap-3 p-4 border border-zinc-200 dark:border-[#27272A] bg-white dark:bg-[#09090B] rounded-md min-w-[200px] transition-colors duration-300">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-[#A1A1AA] uppercase tracking-wider">{title}</h3>
            <div className="flex flex-col gap-2">
                {nodes.map(node => (
                    <div key={node.name} className="flex items-center justify-between">
                        <span className="font-mono text-sm text-zinc-900 dark:text-[#E4E4E7]">{node.name}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono uppercase tracking-widest ${node.state === 'healthy' ? 'text-emerald-600 dark:text-[#22C55E]' :
                                node.state === 'warning' ? 'text-amber-600 dark:text-[#F59E0B]' : 'text-red-600 dark:text-[#EF4444]'
                                }`}>
                                {node.state}
                            </span>
                            <StateDot state={node.state} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function StatusBoard({ systemStatus }: { systemStatus: ReturnType<typeof useMockOrchestrator>["systemStatus"] }) {
    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight transition-colors duration-300">Active UCP Topology</h2>
                    <p className="text-sm text-zinc-500 dark:text-[#A1A1AA] transition-colors duration-300">Monitoring 8 Google graph nodes in real-time</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-[#22C55E] transition-colors duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#22C55E] animate-pulse" />
                    SYSTEM.ONLINE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Cluster
                    title="Core"
                    nodes={[
                        { name: "Merchant Center", state: systemStatus.core.gmc },
                        { name: "Google Wallet", state: systemStatus.core.wallet }
                    ]}
                />
                <Cluster
                    title="Surfaces"
                    nodes={[
                        { name: "Shopping", state: systemStatus.surfaces.shopping },
                        { name: "Business Profile", state: systemStatus.surfaces.gbp }
                    ]}
                />
                <Cluster
                    title="Intelligence"
                    nodes={[
                        { name: "Search Console", state: systemStatus.intelligence.gsc },
                        { name: "Analytics (GA4)", state: systemStatus.intelligence.ga4 }
                    ]}
                />
                <Cluster
                    title="Engine"
                    nodes={[
                        { name: "Google Ads", state: systemStatus.engine.gads },
                        { name: "Merchant Studio", state: systemStatus.engine.studio }
                    ]}
                />
            </div>
        </div>
    );
}
