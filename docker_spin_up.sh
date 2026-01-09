#!/bin/bash

# Electric Safai - Docker Elasticsearch Setup

ES_CONTAINER="electric-safai-es"
ES_PORT=9200
ES_VERSION="8.11.0"

echo ""
echo "  ⚡ Electric Safai - Docker Elasticsearch Setup ⚡"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${ES_CONTAINER}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^${ES_CONTAINER}$"; then
        echo "✅ Elasticsearch container is already running"
        echo "   URL: http://localhost:${ES_PORT}"
        exit 0
    else
        echo "🔄 Starting existing container..."
        docker start ${ES_CONTAINER}
    fi
else
    echo "🚀 Creating new Elasticsearch container..."
    docker run -d \
        --name ${ES_CONTAINER} \
        -p ${ES_PORT}:9200 \
        -e "discovery.type=single-node" \
        -e "xpack.security.enabled=false" \
        -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
        elasticsearch:${ES_VERSION}
fi

# Wait for Elasticsearch to be ready
echo "⏳ Waiting for Elasticsearch to start..."
for i in {1..30}; do
    if curl -s "http://localhost:${ES_PORT}/_cluster/health" > /dev/null 2>&1; then
        echo ""
        echo "✅ Elasticsearch is ready!"
        echo ""
        echo "   URL: http://localhost:${ES_PORT}"
        echo "   Container: ${ES_CONTAINER}"
        echo ""

        # Create test index
        echo "📦 Creating test-index..."
        curl -s -X PUT "http://localhost:${ES_PORT}/test-index" \
            -H "Content-Type: application/json" \
            -d '{"settings":{"number_of_shards":1,"number_of_replicas":0}}' > /dev/null

        # Add sample documents
        echo "📝 Adding sample documents..."
        curl -s -X POST "http://localhost:${ES_PORT}/test-index/_doc/1" \
            -H "Content-Type: application/json" \
            -d '{"title":"Hello World","status":"active","category":"tech","timestamp":"2024-01-01T00:00:00Z"}' > /dev/null

        curl -s -X POST "http://localhost:${ES_PORT}/test-index/_doc/2" \
            -H "Content-Type: application/json" \
            -d '{"title":"Electric Safai","status":"active","category":"tools","timestamp":"2024-01-02T00:00:00Z"}' > /dev/null

        curl -s -X POST "http://localhost:${ES_PORT}/test-index/_doc/3" \
            -H "Content-Type: application/json" \
            -d '{"title":"Search Engine","status":"inactive","category":"tech","timestamp":"2024-01-03T00:00:00Z"}' > /dev/null

        # Refresh index
        curl -s -X POST "http://localhost:${ES_PORT}/test-index/_refresh" > /dev/null

        echo ""
        echo "✅ Setup complete! Try running:"
        echo ""
        echo "   npm run cli -- -d \"http://localhost:${ES_PORT}/test-index/_search\" -q '{\"match_all\":{}}' --q2"
        echo ""
        exit 0
    fi
    printf "."
    sleep 1
done

echo ""
echo "❌ Elasticsearch failed to start. Check logs with:"
echo "   docker logs ${ES_CONTAINER}"
exit 1
