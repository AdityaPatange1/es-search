# ⚡ Electric Safai ⚡

```
███████╗██╗     ███████╗ ██████╗████████╗██████╗ ██╗ ██████╗    ███████╗ █████╗ ███████╗ █████╗ ██╗
██╔════╝██║     ██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝    ██╔════╝██╔══██╗██╔════╝██╔══██╗██║
█████╗  ██║     █████╗  ██║        ██║   ██████╔╝██║██║         ███████╗███████║█████╗  ███████║██║
██╔══╝  ██║     ██╔══╝  ██║        ██║   ██╔══██╗██║██║         ╚════██║██╔══██║██╔══╝  ██╔══██║██║
███████╗███████╗███████╗╚██████╗   ██║   ██║  ██║██║╚██████╗    ███████║██║  ██║██║     ██║  ██║██║
╚══════╝╚══════╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚═╝ ╚═════╝    ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝
```

<div align="center">

[![npm version](https://img.shields.io/npm/v/electric-safai.svg?style=flat-square)](https://www.npmjs.com/package/electric-safai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js->=16-green.svg?style=flat-square)](https://nodejs.org/)

**🔥 Saf** (Certain Arsenic Fire) + **🧠 AI** (Artificial Intelligence)

*A blazing-fast Elasticsearch CLI tool for the modern data warrior*

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Features](#-features) •
[Documentation](#-documentation) •
[Contributing](#-contributing)

</div>

---

## 📿 Dedication

> *"This project is dedicated to the **Indian Para SF Rinzai Monks** to learn Search Techniques — combining Special Forces precision with Zen mastery of data."*

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| ⚡ **Lightning Fast** | Optimized for speed with async operations |
| 🔄 **Scroll API** | Handle massive datasets with ease |
| 🗑️ **Bulk Delete** | Remove documents matching your query |
| 📊 **Aggregations** | Terms aggregation support built-in |
| 🎨 **Beautiful Output** | Colored, formatted CLI output |
| 🔧 **ES 1.x & 5.x+** | Compatible with multiple ES versions |
| 📦 **TypeScript** | Fully typed for modern development |

---

## 📦 Installation

```bash
# Global installation (recommended)
npm install -g electric-safai

# Or use npx
npx electric-safai --help

# Local installation
npm install electric-safai
```

---

## 🚀 Quick Start

### Basic Search

```bash
es-search -d http://localhost:9200/my-index/_search -q '{"match_all":{}}'
```

### Search with Options

```bash
es-search \
  -d http://localhost:9200/products/_search \
  -q '{"term":{"category":"electronics"}}' \
  -s 50 \
  --source "name,price,description" \
  --sort "price:asc"
```

### Scroll Through Large Datasets

```bash
es-search \
  -d http://localhost:9200/logs/_search \
  -q '{"range":{"timestamp":{"gte":"now-1d"}}}' \
  --scroll \
  2>> output.jsonl
```

### Delete Matching Documents

```bash
es-search \
  -d http://localhost:9200/temp/_search \
  -q '{"term":{"status":"obsolete"}}' \
  --delete yes
```

### Aggregations

```bash
es-search \
  -d http://localhost:9200/orders/_search \
  -q '{"match_all":{}}' \
  --aggs-terms category
```

---

## 🔧 CLI Options

```
Usage: es-search [options]

Options:
  -V, --version            output the version number
  -d, --database <url>     Elasticsearch endpoint (must end with /_search)
  -q, --query <json>       Query in JSON format
  -f, --from [index]       Starting index for pagination
  -s, --size [number]      Results per batch (default: 10)
  --source [fields]        Comma-separated fields to return
  --sort [field:order]     Sort by field (e.g., timestamp:desc)
  --scroll                 Use scroll API for large datasets
  --delete [yes/Y]         Delete all matching documents
  --extend [json]          Merge additional JSON into request
  --q2                     Use ES 2.x/5.x+ query syntax
  --aggs-terms [field]     Perform terms aggregation
  --verbose                Enable debug output
  --no-banner              Disable banner display
  -h, --help               display help for command
```

---

## 📜 npm Scripts

### Build & Development

```bash
npm run build          # 🔨 Compile TypeScript
npm run build:watch    # 👀 Watch mode
npm run dev            # 🚀 Run with ts-node
npm run cli            # ▶️ Run compiled CLI
```

### Testing

```bash
npm test               # 🧪 Run all tests
npm run test:unit      # 🔬 Unit tests only
npm run test:integration # 🐳 Integration tests (requires Docker)
npm run test:coverage  # 📊 With coverage report
npm run test:watch     # 👀 Watch mode
```

> **Note:** Integration tests require Elasticsearch running via `./docker_spin_up.sh`

### Linting & Formatting

```bash
npm run lint           # 🔍 Run ESLint + Prettier
npm run lint:check     # ✅ Check without fixing
npm run format         # 💅 Format code
npm run typecheck      # 📝 Type checking
```

### Database & Seeding

```bash
npm run db:setup       # 🔌 Check Elasticsearch connection
npm run db:create-index # 📦 Create test index
npm run db:list        # 📋 List all indices
npm run seed           # 🌱 Seed test data
npm run seed:bulk      # 🚀 Bulk seed (faster)
npm run seed:clear     # 🗑️ Clear test data
npm run seed:stats     # 📊 Show index stats
```

---

## 📁 Project Structure

```
electric-safai/
├── 📂 src/                    # TypeScript source
│   ├── index.ts              # Main entry & exports
│   ├── cli.ts                # CLI interface
│   ├── elasticsearch.ts      # ES client functions
│   ├── logger.ts             # Logging utilities
│   └── types.ts              # Type definitions
├── 📂 tests/                  # Test suite
│   ├── setup.ts              # Test configuration
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests (Docker)
├── 📂 scripts/                # Shell scripts
│   ├── build.sh              # Build script
│   ├── lint.sh               # Linting script
│   ├── test.sh               # Test runner
│   ├── setup-elasticsearch.sh # ES setup
│   ├── seed-data.sh          # Data seeding
│   └── run-cli.sh            # CLI runner
├── 📂 docs/                   # Documentation
│   ├── ELECTRIC_SAFAI.md     # Philosophy & vision
│   ├── API.md                # API reference
│   └── CONTRIBUTING.md       # Contribution guide
├── 📂 bin/                    # CLI executable
│   └── search                # Entry point
├── docker_spin_up.sh         # 🐳 Docker ES setup
├── test_cli.sh               # 🧪 CLI test examples
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
├── jest.config.js            # Jest config
└── README.md                 # You are here!
```

---

## 💻 Programmatic Usage

```typescript
import { queryData, scrollFetch, createLogger } from 'electric-safai';

const logger = createLogger('my-app');

// Simple query
const results = await queryData({
  database: 'http://localhost:9200/index/_search',
  query: '{"match_all":{}}',
  size: 100
}, logger);

console.log(`Found ${results.length} documents`);

// Scroll through all results
await scrollFetch(
  'http://localhost:9200/index/_search',
  false,
  (hit) => console.log(hit._id),
  logger
);
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [⚡ Electric Safai](./docs/ELECTRIC_SAFAI.md) | Philosophy & vision |
| [📚 API Reference](./docs/API.md) | Complete API documentation |
| [🤝 Contributing](./docs/CONTRIBUTING.md) | How to contribute |

---

## 🐳 Docker Quick Start

The fastest way to get started with a local Elasticsearch instance:

```bash
# Spin up Elasticsearch with test data
./docker_spin_up.sh

# Run a test query
npm run cli -- -d "http://localhost:9200/test-index/_search" -q '{"match_all":{}}' --q2

# Stop and remove when done
docker stop electric-safai-es && docker rm electric-safai-es
```

The `docker_spin_up.sh` script will:
- Start Elasticsearch 8.11.0 in a container
- Wait for it to be ready
- Create a `test-index` with sample documents
- Show you a ready-to-run test command

---

## 🛠️ Development Setup

```bash
# Clone the repository
git clone https://github.com/lusionx/es-search.git
cd es-search

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start Elasticsearch with Docker (recommended)
./docker_spin_up.sh

# Or manually start Elasticsearch
docker run -d --name electric-safai-es \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.11.0

# Create test index and seed data
npm run db:create-index
npm run seed:bulk 100
```

---

## ⚠️ Disclaimer

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ⚠️  IMPORTANT DISCLAIMER ⚠️                                                ║
║                                                                              ║
║   This tool performs operations on Elasticsearch clusters.                   ║
║   The --delete option will PERMANENTLY DELETE documents.                     ║
║                                                                              ║
║   🔴 ALWAYS test on non-production data first                               ║
║   🔴 ALWAYS backup important data before bulk operations                    ║
║   🔴 ALWAYS verify your query before using --delete                         ║
║                                                                              ║
║   The authors are not responsible for data loss or damage.                   ║
║   Use at your own risk.                                                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 📿 The Rinzai Way

> *"What is the essence of search?"*
> *"Finding nothing, you find everything."*
> — Electric Safai Koan

This project embraces the Rinzai Zen philosophy:
- **Direct insight** into data
- **Sudden awakening** to patterns
- **No-mind** in query execution

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

```bash
# Fork, clone, and create a branch
git checkout -b feature/amazing-feature

# Make your changes and test
npm test

# Push and create a PR
git push origin feature/amazing-feature
```

---

## 📄 License

MIT License — Free as the wind, powerful as thunder.

---

## 🙏 Acknowledgments

- Original author: **Liu Xing**
- Inspired by the Elasticsearch community
- Dedicated to all data warriors worldwide

---

<div align="center">

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   "In the ocean of data, Electric Safai is your lighthouse."   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**⚡ Electric Safai ⚡** — *Search with the power of lightning*

Made with 🔥 by the Electric Safai Team

</div>
