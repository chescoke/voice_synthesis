#!/bin/bash

# MongoDB Installation Script
# Supports: macOS, Ubuntu/Debian, CentOS/RHEL, Fedora

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "\n${BOLD}${CYAN}════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   MongoDB Installation Script${NC}"
echo -e "${BOLD}${CYAN}════════════════════════════════════════${NC}\n"

# Function to check if MongoDB is already installed
check_mongodb_installed() {
    if command -v mongod &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB is already installed!${NC}"
        mongod --version | head -1
        echo ""
        read -p "Do you want to reinstall/update? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Installation cancelled.${NC}"
            exit 0
        fi
    fi
}

# Function to check if mongosh is installed
check_mongosh_installed() {
    if ! command -v mongosh &> /dev/null; then
        echo -e "${YELLOW}⚠️  MongoDB Shell (mongosh) not found${NC}"
        return 1
    else
        echo -e "${GREEN}✅ MongoDB Shell is installed${NC}"
        return 0
    fi
}

# macOS Installation
install_macos() {
    echo -e "${BLUE}🍎 Detected macOS${NC}\n"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}⚠️  Homebrew not found. Installing...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install Homebrew${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Homebrew installed${NC}\n"
    else
        echo -e "${GREEN}✅ Homebrew is installed${NC}\n"
    fi
    
    # Add MongoDB tap
    echo -e "${YELLOW}📦 Adding MongoDB tap...${NC}"
    brew tap mongodb/brew
    
    # Install MongoDB Community Edition
    echo -e "${YELLOW}📥 Installing MongoDB Community Edition...${NC}"
    brew install mongodb-community@7.0
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB installed successfully!${NC}\n"
        
        # Install mongosh if not present
        if ! check_mongosh_installed; then
            echo -e "${YELLOW}📥 Installing MongoDB Shell...${NC}"
            brew install mongosh
        fi
        
        # Start MongoDB
        echo -e "${YELLOW}🚀 Starting MongoDB service...${NC}"
        brew services start mongodb-community@7.0
        
        sleep 2
        
        # Verify installation
        if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB is running!${NC}"
        else
            echo -e "${YELLOW}⚠️  MongoDB installed but not running${NC}"
            echo -e "${YELLOW}   Start it with: brew services start mongodb-community@7.0${NC}"
        fi
        
        # Show info
        echo -e "\n${CYAN}📍 MongoDB Info:${NC}"
        echo -e "   Config: /usr/local/etc/mongod.conf"
        echo -e "   Logs: /usr/local/var/log/mongodb/"
        echo -e "   Data: /usr/local/var/mongodb/"
        
    else
        echo -e "${RED}❌ Failed to install MongoDB${NC}"
        exit 1
    fi
}

# Ubuntu/Debian Installation
install_ubuntu() {
    echo -e "${BLUE}🐧 Detected Ubuntu/Debian${NC}\n"
    
    # Update package list
    echo -e "${YELLOW}📦 Updating package list...${NC}"
    sudo apt-get update
    
    # Install prerequisites
    echo -e "${YELLOW}📦 Installing prerequisites...${NC}"
    sudo apt-get install -y gnupg curl
    
    # Import MongoDB public GPG key
    echo -e "${YELLOW}🔑 Importing MongoDB GPG key...${NC}"
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Create list file
    echo -e "${YELLOW}📝 Creating MongoDB repository list...${NC}"
    
    # Detect Ubuntu version
    UBUNTU_CODENAME=$(lsb_release -cs)
    
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package list
    echo -e "${YELLOW}📦 Updating package list...${NC}"
    sudo apt-get update
    
    # Install MongoDB
    echo -e "${YELLOW}📥 Installing MongoDB...${NC}"
    sudo apt-get install -y mongodb-org
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB installed successfully!${NC}\n"
        
        # Install mongosh if not present
        if ! check_mongosh_installed; then
            echo -e "${YELLOW}📥 Installing MongoDB Shell...${NC}"
            sudo apt-get install -y mongodb-mongosh
        fi
        
        # Start MongoDB
        echo -e "${YELLOW}🚀 Starting MongoDB service...${NC}"
        sudo systemctl start mongod
        sudo systemctl enable mongod
        
        sleep 2
        
        # Verify installation
        if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB is running!${NC}"
        else
            echo -e "${YELLOW}⚠️  MongoDB installed but not running${NC}"
            echo -e "${YELLOW}   Start it with: sudo systemctl start mongod${NC}"
        fi
        
        # Show info
        echo -e "\n${CYAN}📍 MongoDB Info:${NC}"
        echo -e "   Config: /etc/mongod.conf"
        echo -e "   Logs: /var/log/mongodb/"
        echo -e "   Data: /var/lib/mongodb/"
        
    else
        echo -e "${RED}❌ Failed to install MongoDB${NC}"
        exit 1
    fi
}

# CentOS/RHEL Installation
install_centos() {
    echo -e "${BLUE}🐧 Detected CentOS/RHEL${NC}\n"
    
    # Create MongoDB repository file
    echo -e "${YELLOW}📝 Creating MongoDB repository...${NC}"
    
    sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
    
    # Install MongoDB
    echo -e "${YELLOW}📥 Installing MongoDB...${NC}"
    sudo yum install -y mongodb-org
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB installed successfully!${NC}\n"
        
        # Install mongosh if not present
        if ! check_mongosh_installed; then
            echo -e "${YELLOW}📥 Installing MongoDB Shell...${NC}"
            sudo yum install -y mongodb-mongosh
        fi
        
        # Start MongoDB
        echo -e "${YELLOW}🚀 Starting MongoDB service...${NC}"
        sudo systemctl start mongod
        sudo systemctl enable mongod
        
        sleep 2
        
        # Verify installation
        if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB is running!${NC}"
        else
            echo -e "${YELLOW}⚠️  MongoDB installed but not running${NC}"
            echo -e "${YELLOW}   Start it with: sudo systemctl start mongod${NC}"
        fi
        
        # Show info
        echo -e "\n${CYAN}📍 MongoDB Info:${NC}"
        echo -e "   Config: /etc/mongod.conf"
        echo -e "   Logs: /var/log/mongodb/"
        echo -e "   Data: /var/lib/mongodb/"
        
    else
        echo -e "${RED}❌ Failed to install MongoDB${NC}"
        exit 1
    fi
}

# Fedora Installation
install_fedora() {
    echo -e "${BLUE}🐧 Detected Fedora${NC}\n"
    
    # Create MongoDB repository file
    echo -e "${YELLOW}📝 Creating MongoDB repository...${NC}"
    
    sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
    
    # Install MongoDB
    echo -e "${YELLOW}📥 Installing MongoDB...${NC}"
    sudo dnf install -y mongodb-org
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB installed successfully!${NC}\n"
        
        # Install mongosh if not present
        if ! check_mongosh_installed; then
            echo -e "${YELLOW}📥 Installing MongoDB Shell...${NC}"
            sudo dnf install -y mongodb-mongosh
        fi
        
        # Start MongoDB
        echo -e "${YELLOW}🚀 Starting MongoDB service...${NC}"
        sudo systemctl start mongod
        sudo systemctl enable mongod
        
        sleep 2
        
        # Verify installation
        if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB is running!${NC}"
        else
            echo -e "${YELLOW}⚠️  MongoDB installed but not running${NC}"
            echo -e "${YELLOW}   Start it with: sudo systemctl start mongod${NC}"
        fi
        
        # Show info
        echo -e "\n${CYAN}📍 MongoDB Info:${NC}"
        echo -e "   Config: /etc/mongod.conf"
        echo -e "   Logs: /var/log/mongodb/"
        echo -e "   Data: /var/lib/mongodb/"
        
    else
        echo -e "${RED}❌ Failed to install MongoDB${NC}"
        exit 1
    fi
}

# Main installation logic
main() {
    # Check if already installed
    check_mongodb_installed
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        install_macos
        
    elif [ -f /etc/os-release ]; then
        . /etc/os-release
        
        case $ID in
            ubuntu|debian)
                install_ubuntu
                ;;
            centos|rhel)
                install_centos
                ;;
            fedora)
                install_fedora
                ;;
            *)
                echo -e "${RED}❌ Unsupported Linux distribution: $ID${NC}"
                echo -e "${YELLOW}Please install MongoDB manually:${NC}"
                echo -e "   https://docs.mongodb.com/manual/installation/"
                exit 1
                ;;
        esac
    else
        echo -e "${RED}❌ Unsupported operating system${NC}"
        echo -e "${YELLOW}Please install MongoDB manually:${NC}"
        echo -e "   https://docs.mongodb.com/manual/installation/"
        exit 1
    fi
    
    # Final instructions
    echo -e "\n${BOLD}${GREEN}════════════════════════════════════════${NC}"
    echo -e "${BOLD}${GREEN}   MongoDB Installation Complete! 🎉${NC}"
    echo -e "${BOLD}${GREEN}════════════════════════════════════════${NC}\n"
    
    echo -e "${CYAN}📚 Quick Commands:${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "   Start:   ${YELLOW}brew services start mongodb-community@7.0${NC}"
        echo -e "   Stop:    ${YELLOW}brew services stop mongodb-community@7.0${NC}"
        echo -e "   Restart: ${YELLOW}brew services restart mongodb-community@7.0${NC}"
        echo -e "   Status:  ${YELLOW}brew services list | grep mongodb${NC}"
    else
        echo -e "   Start:   ${YELLOW}sudo systemctl start mongod${NC}"
        echo -e "   Stop:    ${YELLOW}sudo systemctl stop mongod${NC}"
        echo -e "   Restart: ${YELLOW}sudo systemctl restart mongod${NC}"
        echo -e "   Status:  ${YELLOW}sudo systemctl status mongod${NC}"
    fi
    
    echo -e "   Connect: ${YELLOW}mongosh${NC}"
    echo -e "   Test:    ${YELLOW}mongosh --eval 'db.adminCommand(\"ping\")'${NC}"
    
    echo -e "\n${CYAN}🚀 Next Steps:${NC}"
    echo -e "   1. Configure MongoDB (optional)"
    echo -e "   2. Run: ${YELLOW}cd backend && npm run dev:mongodb${NC}"
    echo -e "   3. Your app is ready! 🎉\n"
}

# Run main function
main