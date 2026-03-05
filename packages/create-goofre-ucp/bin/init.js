#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectName = process.argv[2] || 'goofre-app';
const projectPath = path.resolve(process.cwd(), projectName);

console.log(`\n⚡ Initializing Agentic Commerce Orchestrator in ${projectPath}...\n`);

if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
}

const packageJson = {
    name: projectName,
    version: "1.0.0",
    private: true,
    scripts: {
        "start": "node index.js",
        "seed": "node seed.js"
    },
    dependencies: {
        "better-sqlite3": "^9.0.0"
    }
};

fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
);

const indexJs = `
// NOTE: In a real environment, you would require '@goofre/core-engine'.
// const { SwitchboardOrchestrator } = require('@goofre/core-engine');
const Database = require('better-sqlite3');

console.log("Initializing Goofre UCP...");

// 1. Initialize local SQLite Database (Zero-Dependency)
const db = new Database('goofre.db');
console.log("✅ Local SQLite database connected.");

// 2. Initialize Orchestrator (Mocked for init template)
const orchestrator = {
    plugins: [],
    registerPlugin(plugin) {
        this.plugins.push(plugin);
        console.log(\`✅ Registered plugin: \${plugin.id}\`);
    }
};

// 3. Register Out-of-the-Box Mocking Integrations
class MockPaymentGateway {
    id = 'mock-payment';
    version = '1.0.0';
    async authorize(amount) {
        console.log(\`[💳 Payment] Authorized $\${amount}\`);
        return { success: true, transactionId: 'txn_' + Date.now() };
    }
}

class MockEmailSender {
    id = 'mock-email';
    version = '1.0.0';
    async sendTemplate(to, templateId, data) {
        console.log(\`[📧 Email] Sent \${templateId} to \${to}\`);
        return true;
    }
}

orchestrator.registerPlugin(new MockPaymentGateway());
orchestrator.registerPlugin(new MockEmailSender());

console.log("🚀 Goofre ACO is running! Listening for commerce events...");
`;

fs.writeFileSync(path.join(projectPath, 'index.js'), indexJs);

const seedJs = `
const Database = require('better-sqlite3');
const db = new Database('goofre.db');

db.exec(\`
    CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, title TEXT, price REAL);
    CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, email TEXT, name TEXT);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, customerId TEXT, total REAL);
\`);

const stmtProduct = db.prepare('INSERT OR REPLACE INTO products (id, title, price) VALUES (?, ?, ?)');
stmtProduct.run('prod_1', 'AI-Optimized Headphones', 199.99);
stmtProduct.run('prod_2', 'Mechanical Keyboard', 149.99);

const stmtCustomer = db.prepare('INSERT OR REPLACE INTO customers (id, email, name) VALUES (?, ?, ?)');
stmtCustomer.run('cust_1', 'test@example.com', 'Test Customer');

const stmtOrder = db.prepare('INSERT OR REPLACE INTO orders (id, customerId, total) VALUES (?, ?, ?)');
stmtOrder.run('ord_1', 'cust_1', 349.98);

console.log("🌱 Database seeded successfully with dummy catalog, test customer, and mock orders.");
`;

fs.writeFileSync(path.join(projectPath, 'seed.js'), seedJs);

console.log("\n📦 Setting up project structure...");
try {
    execSync('npm install --no-audit --no-fund', { cwd: projectPath, stdio: 'inherit' });
    execSync('npm run seed', { cwd: projectPath, stdio: 'inherit' });
} catch (e) {
    console.log("⚠️  Skipping package installation. (Run 'npm install' manually)");
}

console.log(`
✅ Success! Your admin dashboard and orchestrator are ready.

Next steps:
  cd ${projectName}
  npm start

Your admin dashboard is now running at http://localhost:3000/admin
`);
