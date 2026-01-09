#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# 🔥 ELECTRIC SAFAI - Lint Script
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
echo "║         ⚡ ELECTRIC SAFAI - Linter ⚡                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}🔍 Running ESLint...${NC}"
npx eslint src/ --ext .ts --fix

echo -e "${YELLOW}🔍 Running Prettier...${NC}"
npx prettier --write "src/**/*.ts"

echo -e "${GREEN}✅ Linting complete!${NC}"
