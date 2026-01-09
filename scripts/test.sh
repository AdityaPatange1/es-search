#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# 🔥 ELECTRIC SAFAI - Test Runner Script
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         ⚡ ELECTRIC SAFAI - Test Suite ⚡                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Run different test suites based on arguments
case "${1:-}" in
    --unit)
        echo -e "${YELLOW}🧪 Running unit tests...${NC}"
        npx jest --testPathPattern=unit
        ;;
    --integration)
        echo -e "${YELLOW}🧪 Running integration tests...${NC}"
        npx jest --testPathPattern=integration
        ;;
    --coverage)
        echo -e "${YELLOW}🧪 Running tests with coverage...${NC}"
        npx jest --coverage
        ;;
    --watch)
        echo -e "${YELLOW}👀 Running tests in watch mode...${NC}"
        npx jest --watch
        ;;
    *)
        echo -e "${YELLOW}🧪 Running all tests...${NC}"
        npx jest
        ;;
esac

echo -e "${GREEN}✅ Tests complete!${NC}"
