#!/bin/bash

echo "🚀 Installing Voice Synthesis App..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Install root dependencies
echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
npm install

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install

# Install test dependencies
echo -e "${YELLOW}🧪 Installing test dependencies...${NC}"
npm install --save-dev aws-sdk-client-mock aws-sdk-client-mock-jest

cd ..

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "Available commands:"
echo "  npm test              - Run all tests with coverage"
echo "  npm run test:unit     - Run unit tests only"
echo "  npm run test:integration - Run integration tests"
echo "  npm run dev:mongodb   - Start development server with MongoDB"
echo ""