#!/bin/bash

# Quick Test Runner for CoinWayFinder
# Runs essential tests quickly

set -e

echo "⚡ CoinWayFinder Quick Test"
echo "========================="

BASE_URL=${1:-${NEXT_PUBLIC_BASE_URL:-"http://localhost:3000"}}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${1}${2}${NC}"
}

# Quick health check
print_status $BLUE "🏥 Health Check..."
if curl -f -s "$BASE_URL/api/health" > /dev/null; then
    print_status $GREEN "✅ Application is healthy"
else
    print_status $RED "❌ Application health check failed"
    exit 1
fi

# Quick system test
print_status $BLUE "🔧 System Test..."
if curl -f -s "$BASE_URL/api/test" > /dev/null; then
    print_status $GREEN "✅ System test passed"
else
    print_status $RED "❌ System test failed"
    exit 1
fi

# Quick page tests
print_status $BLUE "🌐 Page Tests..."
pages=("/" "/dashboard" "/bots" "/subscription")
for page in "${pages[@]}"; do
    if curl -f -s "$BASE_URL$page" > /dev/null; then
        print_status $GREEN "✅ $page"
    else
        print_status $RED "❌ $page"
        exit 1
    fi
done

print_status $GREEN "🎉 Quick test completed successfully!"
print_status $BLUE "💡 Run 'npm run test:system' for comprehensive testing"
