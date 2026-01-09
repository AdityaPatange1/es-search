#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# 🔥 ELECTRIC SAFAI - Build Script
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         ⚡ ELECTRIC SAFAI - Build ⚡                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}🔨 Cleaning previous build...${NC}"
rm -rf dist/

echo -e "${YELLOW}🔨 Compiling TypeScript...${NC}"
npx tsc

echo -e "${YELLOW}🔨 Making CLI executable...${NC}"
chmod +x dist/cli.js 2>/dev/null || true

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo -e "${CYAN}Output: dist/${NC}"
ls -la dist/
