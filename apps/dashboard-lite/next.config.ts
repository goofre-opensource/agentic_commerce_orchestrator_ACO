import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Pins Turbopack root to this app directory, preventing Next.js from
  // traversing up the tree and misidentifying a parent lockfile as the root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
