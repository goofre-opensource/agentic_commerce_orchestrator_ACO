"use client";

import { useMockOrchestrator } from "../hooks/useMockOrchestrator";
import { StatusBoard } from "../components/StatusBoard";
import { TransactionLedger } from "../components/TransactionLedger";
import { AgenticInsightsFeed } from "../components/AgenticInsightsFeed";

export default function DashboardLite() {
  const { systemStatus, transactions } = useMockOrchestrator();

  return (
    <div className="h-full bg-slate-50 dark:bg-[#050505] text-zinc-900 dark:text-[#E4E4E7] font-sans selection:bg-[#34D399]/30 transition-colors duration-300">
      <main className="max-w-[1600px] mx-auto p-6 md:p-8">
        {/* Deliverable 2: Command Header / Traffic Light UI */}
        <StatusBoard systemStatus={systemStatus} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-stretch">

          {/* Deliverable 3: Live Nervous System (Left/Center 2 cols) */}
          <div className="lg:col-span-2 h-[600px] overflow-hidden">
            <TransactionLedger transactions={transactions} />
          </div>

          {/* Right Column (AgenticInsightsFeed) */}
          <div className="h-[600px] overflow-hidden">
            <AgenticInsightsFeed />
          </div>

        </div>
      </main>
    </div>
  );
}
