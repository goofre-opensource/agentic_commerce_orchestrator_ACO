"use client";

import { Transaction } from "../hooks/useMockOrchestrator";

// Simple unstyled table primitives to match shadcn/ui minimal structure
// In a full app these would be imported from @/components/ui/table
const Table = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
);
const TableHeader = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <thead className={`[&_tr]:border-b border-[#27272A] ${className}`}>{children}</thead>
);
const TableBody = ({ children }: { children: React.ReactNode }) => (
    <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);
const TableRow = ({ children }: { children: React.ReactNode }) => (
    <tr className="border-b border-zinc-200 dark:border-white/10 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5">
        {children}
    </tr>
);
const TableHead = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <th className={`h-12 px-4 text-left align-middle font-medium text-zinc-500 dark:text-[#A1A1AA] uppercase tracking-wider text-xs ${className}`}>
        {children}
    </th>
);
const TableCell = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <td className={`p-4 align-middle ${className}`}>{children}</td>
);

const HighlightSplit = ({ ucpId }: { ucpId: string }) => {
    // e.g. "online:en:US:SKU-123" OR "local:STORE-A:SKU-123"
    const parts = ucpId.split(':');
    if (parts.length < 3) return <span>{ucpId}</span>;

    // The last part is the base SKU, everything else is the UCP prefix
    const sku = parts.pop();
    const prefix = parts.join(':') + ':';

    return (
        <span className="font-mono">
            <span className="text-emerald-700 dark:text-[#34D399] bg-emerald-100 dark:bg-[#064E3B]/30 px-1 py-0.5 rounded mr-1">
                {prefix}
            </span>
            <span className="text-zinc-900 dark:text-[#E4E4E7]">{sku}</span>
        </span>
    );
};

export function TransactionLedger({ transactions }: { transactions: Transaction[] }) {
    if (transactions.length === 0) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-[#27272A] rounded-md font-mono text-sm text-[#71717A]">
                <div>WAITING FOR INCOMING UCP EVENTS...</div>
                <div className="mt-2 text-xs opacity-50">listening on channel :4000</div>
            </div>
        );
    }

    return (
        <div className="w-full border border-zinc-200 dark:border-white/10 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-xl transition-colors font-mono text-sm flex flex-col h-full min-h-[460px] shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center shrink-0">
                <h3 className="font-semibold text-zinc-900 dark:text-white tracking-tight font-sans">Live Event Ledger</h3>
                <span className="text-xs text-zinc-500 dark:text-[#71717A]">Showing last {transactions.length} events</span>
            </div>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-[#3F3F46]">
                <Table>
                    <TableHeader className="sticky top-0 bg-zinc-50 dark:bg-[#050505]/95 backdrop-blur-xl z-10 shadow-sm dark:shadow-[0_1px_0_rgba(255,255,255,0.1)]">
                        <TableRow>
                            <TableHead className="w-[120px]">TIMESTAMP</TableHead>
                            <TableHead>EVENT TYPE</TableHead>
                            <TableHead>CHANNEL</TableHead>
                            <TableHead>ID SPLIT EXECUTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell className="text-zinc-500 dark:text-[#A1A1AA]">
                                    {tx.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </TableCell>
                                <TableCell className="text-zinc-900 dark:text-[#E4E4E7]">{tx.eventType}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs ${tx.channelRoute === 'ONLINE'
                                        ? 'bg-[#1E1B4B] text-[#818CF8]'
                                        : 'bg-[#422006] text-[#FBBF24]'
                                        }`}>
                                        {tx.channelRoute}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <HighlightSplit ucpId={tx.ucpIdSplit} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
