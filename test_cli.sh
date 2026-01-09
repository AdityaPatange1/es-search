#!/bin/bash

# Electric Safai - CLI Test Commands
# These examples assume Elasticsearch is running on localhost:9200
# Run ./docker_spin_up.sh first to start Elasticsearch with test data

set -e

ES_HOST="http://localhost:9200"
INDEX="test-index"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

run_test() {
    local name="$1"
    local cmd="$2"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$name${NC}"
    echo -e "${GREEN}$ $cmd${NC}"
    echo ""
    eval "$cmd" 2>&1 || true
    echo ""
}

echo ""
echo "=== Electric Safai CLI Test Suite ==="
echo ""

# Check if Elasticsearch is running
if ! curl -s "$ES_HOST" > /dev/null 2>&1; then
    echo "❌ Elasticsearch is not running at $ES_HOST"
    echo "   Run ./docker_spin_up.sh first"
    exit 1
fi

echo "✅ Elasticsearch is running"
echo ""

# 1. Basic query - find all documents
run_test "1. Basic query (match all)" \
    "npm run cli -- -d \"$ES_HOST/$INDEX/_search\" -q '{\"match_all\":{}}' --q2 --no-banner"

# 2. Query with size limit
run_test "2. Query with size limit (2 results)" \
    "npm run cli -- -d \"$ES_HOST/$INDEX/_search\" -q '{\"match_all\":{}}' -s 2 --q2 --no-banner"

# 3. Query specific fields only
run_test "3. Query with specific fields (_source)" \
    "npm run cli -- -d \"$ES_HOST/$INDEX/_search\" -q '{\"match_all\":{}}' --source \"title,status\" --q2 --no-banner"

# 4. Query with sorting
run_test "4. Query with sorting (timestamp desc)" \
    "npm run cli -- -d \"$ES_HOST/$INDEX/_search\" -q '{\"match_all\":{}}' --sort \"timestamp:desc\" --q2 --no-banner"

# 5. Term query - exact match
run_test "5. Term query (status=active)" \
    "npm run cli -- -d \"$ES_HOST/$INDEX/_search\" -q '{\"term\":{\"status\":\"active\"}}' --q2 --no-banner"

# 6. Verbose/debug output
run_test "6. Verbose output" \
    "npm run cli -- -d \"$ES_HOST/$INDEX/_search\" -q '{\"match_all\":{}}' -s 1 --q2 --verbose --no-banner"

# 7. Show help
run_test "7. Show help" \
    "npm run cli -- --help"

# 8. Show version
run_test "8. Show version" \
    "npm run cli -- --version"

echo "=== All tests completed ==="
