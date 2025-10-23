#!/bin/bash

# AWS Credentials Quick Test Script
# This is a simple bash alternative to test-credentials.ts

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Load .env file
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}💡 Copy .env.example to .env and configure it${NC}"
    exit 1
fi

echo -e "\n${BOLD}${CYAN}🔍 AWS Credentials Quick Test${NC}\n"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo -e "${YELLOW}💡 Install it from: https://aws.amazon.com/cli/${NC}"
    exit 1
fi

# Configuration
echo -e "${BLUE}ℹ${NC} Configuration:"
echo "   Region: ${AWS_REGION:-not set}"
echo "   Access Key: ${AWS_ACCESS_KEY_ID:0:10}..."
echo "   S3 Bucket: ${AWS_S3_BUCKET:-not set}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Check credentials are set
echo -e "${BOLD}${CYAN}1️⃣  Checking credentials...${NC}"
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${RED}❌ Credentials not set in .env${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    exit 1
else
    echo -e "${GREEN}✅ Credentials are set${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
echo ""

# Test 2: Verify identity
echo -e "${BOLD}${CYAN}2️⃣  Testing IAM identity...${NC}"
IDENTITY=$(aws sts get-caller-identity 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Identity verified${NC}"
    echo "$IDENTITY" | grep -E "UserId|Account|Arn" | sed 's/^/   /'
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Failed to verify identity${NC}"
    echo "   Error: $IDENTITY"
    if echo "$IDENTITY" | grep -q "InvalidClientTokenId"; then
        echo -e "   ${YELLOW}💡 Your Access Key ID is invalid${NC}"
    elif echo "$IDENTITY" | grep -q "SignatureDoesNotMatch"; then
        echo -e "   ${YELLOW}💡 Your Secret Access Key is incorrect${NC}"
    fi
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 3: List S3 buckets
echo -e "${BOLD}${CYAN}3️⃣  Testing S3 access...${NC}"
BUCKETS=$(aws s3 ls 2>&1)
if [ $? -eq 0 ]; then
    BUCKET_COUNT=$(echo "$BUCKETS" | wc -l)
    echo -e "${GREEN}✅ S3 access granted - $BUCKET_COUNT bucket(s) found${NC}"
    
    if [ ! -z "$AWS_S3_BUCKET" ]; then
        if echo "$BUCKETS" | grep -q "$AWS_S3_BUCKET"; then
            echo -e "${GREEN}✅ Configured bucket '$AWS_S3_BUCKET' exists${NC}"
        else
            echo -e "${YELLOW}⚠️  Configured bucket '$AWS_S3_BUCKET' not found${NC}"
            echo -e "   ${YELLOW}💡 Create it with: aws s3 mb s3://$AWS_S3_BUCKET${NC}"
        fi
    fi
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Failed to access S3${NC}"
    echo "   Error: $BUCKETS"
    if echo "$BUCKETS" | grep -q "AccessDenied"; then
        echo -e "   ${YELLOW}💡 Your IAM user lacks S3 permissions${NC}"
    fi
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: Test S3 operations (if bucket configured)
if [ ! -z "$AWS_S3_BUCKET" ] && echo "$BUCKETS" | grep -q "$AWS_S3_BUCKET"; then
    echo -e "${BOLD}${CYAN}4️⃣  Testing S3 operations...${NC}"
    TEST_FILE="test-$(date +%s).txt"
    
    # Upload
    echo "test content" > /tmp/$TEST_FILE
    if aws s3 cp /tmp/$TEST_FILE s3://$AWS_S3_BUCKET/$TEST_FILE > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Upload successful${NC}"
        
        # Download
        if aws s3 cp s3://$AWS_S3_BUCKET/$TEST_FILE /tmp/${TEST_FILE}.download > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Download successful${NC}"
            
            # Delete
            if aws s3 rm s3://$AWS_S3_BUCKET/$TEST_FILE > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Delete successful${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo -e "${RED}❌ Delete failed${NC}"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            fi
        else
            echo -e "${RED}❌ Download failed${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "${RED}❌ Upload failed${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Cleanup
    rm -f /tmp/$TEST_FILE /tmp/${TEST_FILE}.download
    echo ""
fi

# Test 5: Test Polly
echo -e "${BOLD}${CYAN}5️⃣  Testing AWS Polly...${NC}"
VOICES=$(aws polly describe-voices --language-code es-ES 2>&1)
if [ $? -eq 0 ]; then
    VOICE_COUNT=$(echo "$VOICES" | grep -c '"Id"')
    echo -e "${GREEN}✅ Polly access granted - $VOICE_COUNT Spanish voice(s) available${NC}"
    echo "   Available voices:"
    echo "$VOICES" | grep '"Name"' | head -5 | sed 's/^/   • /'
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Failed to access Polly${NC}"
    echo "   Error: $VOICES"
    if echo "$VOICES" | grep -q "AccessDenied"; then
        echo -e "   ${YELLOW}💡 Your IAM user lacks Polly permissions${NC}"
    fi
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 6: Test Transcribe
echo -e "${BOLD}${CYAN}6️⃣  Testing AWS Transcribe...${NC}"
TRANSCRIBE=$(aws transcribe list-transcription-jobs --max-results 1 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Transcribe access granted${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Failed to access Transcribe${NC}"
    echo "   Error: $TRANSCRIBE"
    if echo "$TRANSCRIBE" | grep -q "AccessDenied"; then
        echo -e "   ${YELLOW}💡 Your IAM user lacks Transcribe permissions${NC}"
    fi
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Summary
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "${BOLD}${CYAN}📊 Test Summary${NC}"
echo ""
echo "Results: $TESTS_PASSED/$TOTAL_TESTS tests passed"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your AWS credentials are properly configured.${NC}"
    echo -e "${GREEN}You can now run the Voice Synthesis application.${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please fix the issues above.${NC}"
    echo ""
    echo -e "${BLUE}Common solutions:${NC}"
    echo "   1. Verify credentials in .env file"
    echo "   2. Check IAM user has correct policies attached"
    echo "   3. Ensure S3 bucket exists"
    echo "   4. Verify no typos in access keys"
    echo ""
    exit 1
fi