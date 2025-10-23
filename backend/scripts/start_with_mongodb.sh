#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Abi Audio Application${NC}\n"

# Function to check if MongoDB is running
check_mongodb() {
    if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start MongoDB based on OS
start_mongodb() {
    echo -e "${YELLOW}📊 Checking MongoDB status...${NC}"
    
    if check_mongodb; then
        echo -e "${GREEN}✅ MongoDB is already running${NC}\n"
        return 0
    fi
    
    echo -e "${YELLOW}⚠️  MongoDB is not running. Starting it now...${NC}"
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo -e "${YELLOW}🍎 Detected macOS - using Homebrew${NC}"
        
        # Check if brew exists
        if ! command -v brew &> /dev/null; then
            echo -e "${RED}❌ Homebrew not found. Please install it first:${NC}"
            echo -e "${YELLOW}   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
            exit 1
        fi
        
        # Try to start MongoDB
        if brew services start mongodb-community > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB started successfully${NC}"
            
            # Wait for MongoDB to be ready
            echo -e "${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
            for i in {1..30}; do
                if check_mongodb; then
                    echo -e "${GREEN}✅ MongoDB is ready!${NC}\n"
                    return 0
                fi
                sleep 1
                echo -n "."
            done
            echo -e "\n${RED}❌ MongoDB didn't start in time${NC}"
            exit 1
        else
            echo -e "${RED}❌ Failed to start MongoDB${NC}"
            echo -e "${YELLOW}💡 Try manually: brew services start mongodb-community${NC}"
            exit 1
        fi
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo -e "${YELLOW}🐧 Detected Linux${NC}"
        
        # Try systemctl (most modern Linux distros)
        if command -v systemctl &> /dev/null; then
            if sudo systemctl start mongod; then
                echo -e "${GREEN}✅ MongoDB started successfully${NC}"
                sleep 2
                if check_mongodb; then
                    echo -e "${GREEN}✅ MongoDB is ready!${NC}\n"
                    return 0
                fi
            fi
        # Try service command (older Linux distros)
        elif command -v service &> /dev/null; then
            if sudo service mongod start; then
                echo -e "${GREEN}✅ MongoDB started successfully${NC}"
                sleep 2
                if check_mongodb; then
                    echo -e "${GREEN}✅ MongoDB is ready!${NC}\n"
                    return 0
                fi
            fi
        else
            echo -e "${RED}❌ Could not find systemctl or service command${NC}"
            echo -e "${YELLOW}💡 Try manually: sudo systemctl start mongod${NC}"
            exit 1
        fi
        
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash or similar)
        echo -e "${YELLOW}🪟 Detected Windows${NC}"
        
        # Try to start MongoDB as Windows service
        if net start MongoDB > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB started successfully${NC}"
            sleep 2
            if check_mongodb; then
                echo -e "${GREEN}✅ MongoDB is ready!${NC}\n"
                return 0
            fi
        else
            echo -e "${YELLOW}⚠️  Could not start MongoDB service${NC}"
            echo -e "${YELLOW}💡 Try manually: net start MongoDB${NC}"
            echo -e "${YELLOW}💡 Or run as administrator: sc start MongoDB${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Unsupported OS: $OSTYPE${NC}"
        echo -e "${YELLOW}💡 Please start MongoDB manually${NC}"
        exit 1
    fi
}

# Start MongoDB
start_mongodb

# Start the application
echo -e "${GREEN}🚀 Starting Backend Server...${NC}\n"

# Check if we're in production or development
if [ "$NODE_ENV" = "production" ]; then
    # Production mode
    echo -e "${GREEN}🌟 Running in PRODUCTION mode${NC}\n"
    npm run build && npm start
else
    # Development mode
    echo -e "${YELLOW}🔧 Running in DEVELOPMENT mode${NC}\n"
    npm run dev
fi