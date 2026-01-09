#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# 🔥 ELECTRIC SAFAI - Elasticsearch Setup Script
#═══════════════════════════════════════════════════════════════════════════════
# This script helps set up Elasticsearch for development and testing
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           ⚡ ELECTRIC SAFAI - ES Setup ⚡                     ║"
echo "║           🔥 Elasticsearch Configuration Tool                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
ES_HOST="${ES_HOST:-localhost}"
ES_PORT="${ES_PORT:-9200}"
ES_URL="http://${ES_HOST}:${ES_PORT}"
INDEX_NAME="${INDEX_NAME:-electric-safai-test}"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Elasticsearch URL: ${ES_URL}"
echo "   Test Index Name: ${INDEX_NAME}"
echo ""

# Function to check if Elasticsearch is running
check_elasticsearch() {
    echo -e "${YELLOW}🔍 Checking Elasticsearch connection...${NC}"

    if curl -s "${ES_URL}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Elasticsearch is running at ${ES_URL}${NC}"
        return 0
    else
        echo -e "${RED}❌ Cannot connect to Elasticsearch at ${ES_URL}${NC}"
        return 1
    fi
}

# Function to display cluster info
show_cluster_info() {
    echo -e "\n${BLUE}📊 Cluster Information:${NC}"
    curl -s "${ES_URL}" | python3 -m json.tool 2>/dev/null || curl -s "${ES_URL}"
    echo ""
}

# Function to create test index
create_test_index() {
    echo -e "\n${YELLOW}📦 Creating test index: ${INDEX_NAME}...${NC}"

    # Delete if exists
    curl -s -X DELETE "${ES_URL}/${INDEX_NAME}" > /dev/null 2>&1 || true

    # Create index with mappings
    curl -s -X PUT "${ES_URL}/${INDEX_NAME}" \
        -H 'Content-Type: application/json' \
        -d '{
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            },
            "mappings": {
                "properties": {
                    "title": { "type": "text" },
                    "description": { "type": "text" },
                    "category": { "type": "keyword" },
                    "tags": { "type": "keyword" },
                    "priority": { "type": "integer" },
                    "timestamp": { "type": "date" },
                    "metadata": { "type": "object" }
                }
            }
        }' | python3 -m json.tool 2>/dev/null || echo "Index created"

    echo -e "${GREEN}✅ Test index created successfully!${NC}"
}

# Function to list all indices
list_indices() {
    echo -e "\n${BLUE}📑 Available Indices:${NC}"
    curl -s "${ES_URL}/_cat/indices?v"
}

# Main
main() {
    if check_elasticsearch; then
        show_cluster_info

        case "${1:-}" in
            --create-index)
                create_test_index
                ;;
            --list)
                list_indices
                ;;
            *)
                echo -e "${CYAN}Available commands:${NC}"
                echo "  ./setup-elasticsearch.sh --create-index  Create test index"
                echo "  ./setup-elasticsearch.sh --list          List all indices"
                echo ""
                echo -e "${CYAN}Environment variables:${NC}"
                echo "  ES_HOST       Elasticsearch host (default: localhost)"
                echo "  ES_PORT       Elasticsearch port (default: 9200)"
                echo "  INDEX_NAME    Test index name (default: electric-safai-test)"
                ;;
        esac
    else
        echo -e "\n${YELLOW}💡 Tips to get Elasticsearch running:${NC}"
        echo ""
        echo "Using Docker:"
        echo "  docker run -d -p 9200:9200 -e 'discovery.type=single-node' elasticsearch:7.17.0"
        echo ""
        echo "Using Docker Compose:"
        echo "  docker-compose up -d elasticsearch"
        echo ""
        exit 1
    fi
}

main "$@"
