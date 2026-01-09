#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# 🔥 ELECTRIC SAFAI - CLI Runner
#═══════════════════════════════════════════════════════════════════════════════

# Colors
CYAN='\033[0;36m'
NC='\033[0m'

# Check if built
if [ ! -f "dist/cli.js" ]; then
    echo -e "${CYAN}Building first...${NC}"
    npm run build
fi

# Run the CLI
node dist/cli.js "$@"
