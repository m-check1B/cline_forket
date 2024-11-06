#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting build process for Cline extension...${NC}"

# Step 1: Install dependencies
echo -e "\n${GREEN}Installing dependencies...${NC}"
npm install
cd webview-ui && npm install && cd ..

# Step 2: Build the extension
echo -e "\n${GREEN}Building extension...${NC}"
npm run build:vsix

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Build successful! The .vsix file has been created.${NC}"
    echo -e "\nTo install the extension, run:"
    echo -e "${GREEN}code --install-extension claude-dev-2.1.3.vsix${NC}"
else
    echo -e "\n${RED}Build failed. Please check the error messages above.${NC}"
    exit 1
fi
