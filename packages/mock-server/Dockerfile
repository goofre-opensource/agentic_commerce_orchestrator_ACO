FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* tsconfig.json* ./
RUN npm install --omit=dev

# Copy source
COPY src ./src

# ─── Final Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install ts-node for running TypeScript directly (lightweight for demo)
RUN npm install -g ts-node typescript

COPY --from=builder /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["ts-node", "--transpile-only", "src/server.ts"]
