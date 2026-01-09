# ⚡ Electric Safai - API Reference

## 📦 Installation

```bash
npm install -g electric-safai
```

## 🚀 Quick Start

```bash
# Basic search
es-search -d http://localhost:9200/my-index/_search -q '{"match_all":{}}'

# With size limit
es-search -d http://localhost:9200/my-index/_search -q '{"term":{"status":"active"}}' -s 100

# Scroll through all results
es-search -d http://localhost:9200/my-index/_search -q '{"match_all":{}}' --scroll
```

---

## 🔧 CLI Options

### Required Options

| Option | Description | Example |
|--------|-------------|---------|
| `-d, --database <url>` | Elasticsearch endpoint (must end with `/_search`) | `http://localhost:9200/index/_search` |
| `-q, --query <json>` | Query in JSON format | `'{"match_all":{}}'` |

### Pagination Options

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --from [index]` | Starting index for pagination | `0` |
| `-s, --size [number]` | Results per batch | `10` |
| `--scroll` | Use scroll API for large datasets | `false` |

### Field Selection & Sorting

| Option | Description | Example |
|--------|-------------|---------|
| `--source [fields]` | Comma-separated fields to return | `title,description,timestamp` |
| `--sort [field:order]` | Sort by field | `timestamp:desc` |

### Advanced Options

| Option | Description |
|--------|-------------|
| `--q2` | Use ES 2.x/5.x+ query syntax |
| `--extend [json]` | Merge additional JSON into request |
| `--aggs-terms [field]` | Perform terms aggregation |
| `--delete [yes/Y]` | Delete all matching documents |
| `--verbose` | Enable debug output |
| `--no-banner` | Disable banner display |

---

## 📚 Programmatic Usage

### Basic Import

```typescript
import { queryData, scrollFetch, createLogger } from 'electric-safai';

const logger = createLogger('my-app');

// Execute a query
const results = await queryData({
  database: 'http://localhost:9200/my-index/_search',
  query: '{"match_all":{}}',
  size: 50
}, logger);

console.log(`Found ${results.length} results`);
```

### Scroll API

```typescript
import { queryData, scrollFetch, createLogger } from 'electric-safai';

const logger = createLogger('my-app');

// Initialize scroll
await queryData({
  database: 'http://localhost:9200/my-index/_search',
  query: '{"match_all":{}}',
  scroll: true
}, logger);

// Process all results
await scrollFetch(
  'http://localhost:9200/my-index/_search',
  false,
  (hit) => {
    console.log('Processing:', hit._id);
  },
  logger
);
```

### Bulk Delete

```typescript
import { queryData, deleteDocuments, createLogger } from 'electric-safai';

const logger = createLogger('my-app');

// Find documents to delete
const results = await queryData({
  database: 'http://localhost:9200/my-index/_search',
  query: '{"term":{"status":"obsolete"}}'
}, logger);

// Delete them
await deleteDocuments(
  'http://localhost:9200/my-index/_search',
  results,
  logger,
  10 // concurrency limit
);
```

---

## 🔌 TypeScript Types

```typescript
interface ElasticsearchHit {
  _index: string;
  _type: string;
  _id: string;
  _score?: number;
  _source?: Record<string, unknown>;
}

interface QueryOptions {
  database: string;
  query: string;
  from?: number;
  size?: number;
  source?: string;
  sort?: string;
  scroll?: boolean;
  delete?: string;
  extend?: string;
  q2?: boolean;
  aggsTerms?: string;
}

interface SearchConfig {
  endpoint: string;
  scrollTimeout: string;
  concurrencyLimit: number;
}
```

---

## 🎨 Logger API

```typescript
import { createLogger, setLogLevel, getLogLevel } from 'electric-safai';

// Create a named logger
const logger = createLogger('my-component');

// Log messages
logger.debug('Debug info: %j', { data: 123 });
logger.info('Processing %d items', 100);
logger.warn('Warning: %s', 'something');
logger.error('Error occurred: %s', error.message);

// Set global log level
setLogLevel('debug'); // 'debug' | 'info' | 'warn' | 'error'

// Get current level
const level = getLogLevel();
```

---

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ES_HOST` | Elasticsearch host | `localhost` |
| `ES_PORT` | Elasticsearch port | `9200` |
| `INDEX_NAME` | Default index name | `electric-safai-test` |

---

## 📖 Examples

### Search with Aggregations

```bash
es-search \
  -d http://localhost:9200/logs/_search \
  -q '{"range":{"timestamp":{"gte":"now-1h"}}}' \
  --aggs-terms category
```

### Export All Documents

```bash
es-search \
  -d http://localhost:9200/products/_search \
  -q '{"match_all":{}}' \
  --scroll \
  2>> products.jsonl
```

### Delete Old Records

```bash
es-search \
  -d http://localhost:9200/logs/_search \
  -q '{"range":{"timestamp":{"lt":"now-30d"}}}' \
  --delete yes
```

### ES 5.x+ Query Syntax

```bash
es-search \
  -d http://localhost:9200/data/_search \
  -q '{"term":{"status":"active"}}' \
  --q2
```

---

⚡ **Electric Safai** — *Search with the power of lightning*
