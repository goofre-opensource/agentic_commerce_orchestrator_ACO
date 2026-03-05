import { useState, useEffect } from 'react';

export type NodeState = 'healthy' | 'warning' | 'critical';

export interface SystemStatus {
  core: {
    gmc: NodeState;
    wallet: NodeState;
  };
  surfaces: {
    shopping: NodeState;
    gbp: NodeState;
  };
  intelligence: {
    gsc: NodeState;
    ga4: NodeState;
  };
  engine: {
    gads: NodeState;
    studio: NodeState;
  };
}

export interface Transaction {
  id: string;
  timestamp: Date;
  eventType: 'order.completed' | 'inventory.updated' | 'loyalty.issued';
  channelRoute: 'ONLINE' | 'PHYSICAL';
  baseSku: string;
  ucpIdSplit: string;
}

const INITIAL_STATUS: SystemStatus = {
  core: { gmc: 'healthy', wallet: 'healthy' },
  surfaces: { shopping: 'healthy', gbp: 'healthy' },
  intelligence: { gsc: 'healthy', ga4: 'healthy' },
  engine: { gads: 'healthy', studio: 'healthy' },
};

const SAMPLE_SKUS = ['TSHIRT-BLK-M', 'MUG-WHT-01', 'HOODIE-GRY-L', 'SOCKS-STR-OS'];

function generateMockTransaction(): Transaction {
  const isOnline = Math.random() > 0.5;
  const baseSku = SAMPLE_SKUS[Math.floor(Math.random() * SAMPLE_SKUS.length)];
  const storeCode = ['NY-01', 'SF-02', 'LDN-03'][Math.floor(Math.random() * 3)];

  const ucpIdSplit = isOnline ? `online:en:US:${baseSku}` : `local:${storeCode}:${baseSku}`;

  const eventTypes: Transaction['eventType'][] = [
    'order.completed',
    'inventory.updated',
    'loyalty.issued',
  ];

  return {
    id: `evt_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date(),
    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    channelRoute: isOnline ? 'ONLINE' : 'PHYSICAL',
    baseSku,
    ucpIdSplit,
  };
}

export function useMockOrchestrator(): { systemStatus: SystemStatus; transactions: Transaction[] } {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(INITIAL_STATUS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Simulate incoming webhooks that mutate state
  useEffect(() => {
    // Generate initial payload of transactions
    setTransactions(Array.from({ length: 5 }, generateMockTransaction));

    const intervalId = setInterval(() => {
      // 30% chance to flip a random node's status
      if (Math.random() < 0.3) {
        setSystemStatus((prev) => {
          const next = { ...prev };
          const clusters = Object.keys(next) as (keyof SystemStatus)[];
          const randomCluster = clusters[Math.floor(Math.random() * clusters.length)];
          const nodes = Object.keys(
            next[randomCluster]
          ) as (keyof (typeof next)[typeof randomCluster])[];
          const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

          const states: NodeState[] = ['healthy', 'warning', 'critical'];
          // Heavily weight towards returning to healthy
          const newState =
            Math.random() > 0.7 ? states[Math.floor(Math.random() * states.length)] : 'healthy';

          (next[randomCluster] as Record<string, NodeState>)[randomNode as string] = newState;
          return next;
        });
      }

      // Add a new transaction every cycle, keep max length 50
      setTransactions((prev) => {
        const next = [generateMockTransaction(), ...prev];
        return next.slice(0, 50);
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return { systemStatus, transactions };
}
