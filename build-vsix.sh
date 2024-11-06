#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting build process for Cline VSIX...${NC}"

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Build webview UI
echo -e "${GREEN}Building webview UI...${NC}"
cd webview-ui
npm install
npm run build
cd ..

# Compile TypeScript
echo -e "${GREEN}Compiling TypeScript...${NC}"
npx tsc -p ./

# Package VSIX
echo -e "${GREEN}Packaging VSIX...${NC}"
npx vsce package

echo -e "${GREEN}Build complete!${NC}"
