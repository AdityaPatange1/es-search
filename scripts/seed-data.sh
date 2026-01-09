#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# 🔥 ELECTRIC SAFAI - Data Seeding Script
#═══════════════════════════════════════════════════════════════════════════════
# Seeds dummy data into Elasticsearch for testing and development
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Banner
echo -e "${MAGENTA}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         ⚡ ELECTRIC SAFAI - Data Seeder ⚡                    ║"
echo "║         🌱 Populate Elasticsearch with Test Data             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
ES_HOST="${ES_HOST:-localhost}"
ES_PORT="${ES_PORT:-9200}"
ES_URL="http://${ES_HOST}:${ES_PORT}"
INDEX_NAME="${INDEX_NAME:-electric-safai-test}"
DOC_TYPE="${DOC_TYPE:-_doc}"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Elasticsearch: ${ES_URL}"
echo "   Index: ${INDEX_NAME}"
echo ""

# Check connection
if ! curl -s "${ES_URL}" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to Elasticsearch at ${ES_URL}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connected to Elasticsearch${NC}"
echo ""

# Categories for random data
CATEGORIES=("technology" "science" "business" "health" "education" "entertainment")
TAGS=("featured" "trending" "archived" "draft" "published" "urgent")

# Function to generate random data (single-line JSON for bulk API)
generate_document() {
    local id=$1
    local category=${CATEGORIES[$((RANDOM % ${#CATEGORIES[@]}))]}
    local tag1=${TAGS[$((RANDOM % ${#TAGS[@]}))]}
    local tag2=${TAGS[$((RANDOM % ${#TAGS[@]}))]}
    local priority=$((RANDOM % 10 + 1))
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    echo "{\"title\":\"Document ${id}: Electric Safai Test Entry\",\"description\":\"Test document ${id} for Electric Safai.\",\"category\":\"${category}\",\"tags\":[\"${tag1}\",\"${tag2}\"],\"priority\":${priority},\"timestamp\":\"${timestamp}\",\"metadata\":{\"created_by\":\"electric-safai-seeder\",\"version\":\"1.0.0\",\"monk_style\":\"rinzai\"}}"
}

# Function to create index if not exists
create_index_if_needed() {
    # Check if index exists
    if ! curl -s --head "${ES_URL}/${INDEX_NAME}" | grep -q "200 OK"; then
        echo -e "${YELLOW}📦 Creating index ${INDEX_NAME}...${NC}"
        curl -s -X PUT "${ES_URL}/${INDEX_NAME}" \
            -H 'Content-Type: application/json' \
            -d '{
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                }
            }' > /dev/null
        echo -e "${GREEN}✅ Index created!${NC}"
    fi
}

# Function to seed documents
seed_documents() {
    local count=${1:-100}

    # Create index first
    create_index_if_needed

    echo -e "${YELLOW}🌱 Seeding ${count} documents...${NC}"
    echo ""

    for i in $(seq 1 $count); do
        doc=$(generate_document $i)

        response=$(curl -s -X POST "${ES_URL}/${INDEX_NAME}/${DOC_TYPE}" \
            -H 'Content-Type: application/json' \
            -d "${doc}")

        # Progress indicator
        if (( i % 10 == 0 )); then
            echo -e "${CYAN}   📝 Seeded ${i}/${count} documents...${NC}"
        fi
    done

    # Refresh index to make documents searchable immediately
    curl -s -X POST "${ES_URL}/${INDEX_NAME}/_refresh" > /dev/null

    echo ""
    echo -e "${GREEN}✅ Successfully seeded ${count} documents!${NC}"
}

# Function to seed bulk data (faster)
seed_bulk() {
    local count=${1:-100}

    # Create index first
    create_index_if_needed

    echo -e "${YELLOW}🚀 Bulk seeding ${count} documents...${NC}"
    echo ""

    # Create temp file for bulk data
    local bulk_file=$(mktemp)
    trap "rm -f $bulk_file" EXIT

    for i in $(seq 1 $count); do
        echo '{"index":{"_index":"'${INDEX_NAME}'"}}' >> "$bulk_file"
        generate_document $i >> "$bulk_file"
    done

    local response=$(curl -s -X POST "${ES_URL}/_bulk" \
        -H 'Content-Type: application/x-ndjson' \
        --data-binary @"$bulk_file")

    rm -f "$bulk_file"

    # Check for errors
    if echo "$response" | grep -q '"errors":true'; then
        echo -e "${RED}⚠️  Some documents failed to index${NC}"
        echo "$response" | python3 -m json.tool 2>/dev/null | head -50
    else
        echo -e "${GREEN}✅ Bulk seeded ${count} documents!${NC}"
    fi

    # Refresh index to make documents searchable immediately
    curl -s -X POST "${ES_URL}/${INDEX_NAME}/_refresh" > /dev/null
}

# Function to show stats
show_stats() {
    echo -e "\n${BLUE}📊 Index Statistics:${NC}"
    curl -s "${ES_URL}/${INDEX_NAME}/_count" | python3 -m json.tool 2>/dev/null || \
        curl -s "${ES_URL}/${INDEX_NAME}/_count"
}

# Function to clear index
clear_index() {
    echo -e "${YELLOW}🗑️  Clearing all documents from ${INDEX_NAME}...${NC}"
    curl -s -X POST "${ES_URL}/${INDEX_NAME}/_delete_by_query" \
        -H 'Content-Type: application/json' \
        -d '{"query": {"match_all": {}}}' > /dev/null
    echo -e "${GREEN}✅ Index cleared!${NC}"
}

# Main
main() {
    case "${1:-}" in
        --seed)
            seed_documents ${2:-100}
            show_stats
            ;;
        --bulk)
            seed_bulk ${2:-100}
            show_stats
            ;;
        --clear)
            clear_index
            ;;
        --stats)
            show_stats
            ;;
        *)
            echo -e "${CYAN}Usage:${NC}"
            echo "  ./seed-data.sh --seed [count]   Seed documents one by one (default: 100)"
            echo "  ./seed-data.sh --bulk [count]   Bulk seed documents (faster)"
            echo "  ./seed-data.sh --clear          Clear all documents"
            echo "  ./seed-data.sh --stats          Show index statistics"
            echo ""
            echo -e "${CYAN}Environment variables:${NC}"
            echo "  ES_HOST       Elasticsearch host (default: localhost)"
            echo "  ES_PORT       Elasticsearch port (default: 9200)"
            echo "  INDEX_NAME    Index name (default: electric-safai-test)"
            ;;
    esac
}

main "$@"
