#!/bin/bash

echo "🚀 CoinWayFinder Test Execution"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the base URL
BASE_URL=${1:-${NEXT_PUBLIC_BASE_URL:-"http://localhost:3000"}}

echo -e "${BLUE}🌐 Testing URL: $BASE_URL${NC}"
echo ""

# Check if the server is running
echo -e "${BLUE}🔍 Checking server availability...${NC}"
if curl -s --head "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Server is responding${NC}"
else
    echo -e "${RED}❌ Server is not responding at $BASE_URL${NC}"
    echo "Please make sure your application is running"
    exit 1
fi

echo ""

# Run the Node.js test runner
echo -e "${BLUE}🧪 Running comprehensive tests...${NC}"
echo ""

if command -v node &> /dev/null; then
    node scripts/test-runner.js "$BASE_URL"
    TEST_EXIT_CODE=$?
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js to run tests.${NC}"
    exit 1
fi

echo ""
echo "================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo "   • Deploy to production: npm run deploy"
    echo "   • Monitor health: $BASE_URL/api/health"
    echo "   • View detailed status: $BASE_URL/api/test"
else
    echo -e "${YELLOW}⚠️  Some tests had issues. Check the output above.${NC}"
    echo ""
    echo -e "${BLUE}💡 Troubleshooting:${NC}"
    echo "   • Check environment variables"
    echo "   • Verify database connections"
    echo "   • Review API configurations"
fi

exit $TEST_EXIT_CODE
