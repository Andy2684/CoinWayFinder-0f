#!/bin/bash

# CoinWayFinder Quick Test Runner
# This script runs essential tests quickly for development

set -e

echo "⚡ CoinWayFinder Quick Test Suite"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${1}${2}${NC}"
}

# Get base URL
BASE_URL=${1:-${NEXT_PUBLIC_BASE_URL:-"http://localhost:3000"}}
print_status $BLUE "🌐 Testing: $BASE_URL"

# Test counters
TESTS=0
PASSED=0
FAILED=0

run_quick_test() {
    local name=$1
    local command=$2
    
    TESTS=$((TESTS + 1))
    print_status $BLUE "🧪 $name..."
    
    if eval $command > /dev/null 2>&1; then
        print_status $GREEN "✅ $name"
        PASSED=$((PASSED + 1))
    else
        print_status $RED "❌ $name"
        FAILED=$((FAILED + 1))
    fi
}

# Essential tests
print_status $BLUE "\n🚀 Running Essential Tests..."

run_quick_test "Health Check" "curl -f -s $BASE_URL/api/health"
run_quick_test "Home Page" "curl -f -s $BASE_URL"
run_quick_test "Dashboard" "curl -f -s $BASE_URL/dashboard"
run_quick_test "API Test" "curl -f -s $BASE_URL/api/test"
run_quick_test "TypeScript Check" "npx tsc --noEmit"

# Results
echo ""
echo "================================"
print_status $BLUE "📊 Quick Test Results"
echo "================================"
print_status $BLUE "Total: $TESTS"
print_status $GREEN "Passed: $PASSED"
print_status $RED "Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
    print_status $GREEN "🎉 All quick tests passed!"
    exit 0
else
    print_status $RED "❌ $FAILED test(s) failed"
    print_status $YELLOW "💡 Run './scripts/run-all-tests.sh' for detailed analysis"
    exit 1
fi
