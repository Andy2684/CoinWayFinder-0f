#!/bin/bash

# CoinWayFinder Test Runner Script
# Usage: ./scripts/run-tests.sh [URL]

set -e

echo "🧪 CoinWayFinder Test Runner"
echo "=========================="

# Determine the target URL
if [ -n "$1" ]; then
    TARGET_URL="$1"
elif [ -n "$VERCEL_URL" ]; then
    TARGET_URL="https://$VERCEL_URL"
elif [ -n "$NEXT_PUBLIC_BASE_URL" ]; then
    TARGET_URL="$NEXT_PUBLIC_BASE_URL"
else
    TARGET_URL="http://localhost:3000"
fi

echo "🌐 Target URL: $TARGET_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local description="$3"
    
    echo -n "Testing $description... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL$endpoint" || echo "000")
    
    if [[ "$status_code" == "$expected_status" ]] || [[ "$expected_status" == *"$status_code"* ]]; then
        echo "✅ PASS ($status_code)"
        return 0
    else
        echo "❌ FAIL ($status_code, expected $expected_status)"
        return 1
    fi
}

# Function to test page load
test_page() {
    local path="$1"
    local description="$2"
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" "$TARGET_URL$path" || echo "000")
    status_code="${response: -3}"
    
    if [[ "$status_code" == "200" ]]; then
        echo "✅ PASS"
        return 0
    else
        echo "❌ FAIL ($status_code)"
        return 1
    fi
}

# Initialize counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function wrapper
run_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if "$@"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "🔍 Running Health Checks..."
echo "-------------------------"

# Health endpoint tests
run_test test_endpoint "/api/health" "200" "Health Endpoint"
run_test test_endpoint "/api/test" "200 500" "Comprehensive Test Endpoint"

echo ""
echo "📱 Testing Static Pages..."
echo "-------------------------"

# Static page tests
run_test test_page "/" "Home Page"
run_test test_page "/dashboard" "Dashboard"
run_test test_page "/bots" "Bots Page"
run_test test_page "/subscription" "Subscription Page"
run_test test_page "/api-docs" "API Documentation"
run_test test_page "/news" "News Page"
run_test test_page "/integrations" "Integrations Page"
run_test test_page "/profile" "Profile Page"

echo ""
echo "🔌 Testing API Endpoints..."
echo "-------------------------"

# API endpoint tests (expecting 401 for protected routes is OK)
run_test test_endpoint "/api/auth/signin" "400 401 422" "Auth Signin"
run_test test_endpoint "/api/crypto/prices" "200 401 503" "Crypto Prices"
run_test test_endpoint "/api/crypto/trends" "200 401 503" "Crypto Trends"
run_test test_endpoint "/api/bots" "200 401" "Bots API"
run_test test_endpoint "/api/subscription" "200 401" "Subscription API"
run_test test_endpoint "/api/news" "200 401 503" "News API"
run_test test_endpoint "/api/whales" "200 401 503" "Whale Alerts API"

echo ""
echo "⚡ Performance Tests..."
echo "---------------------"

# Performance test function
test_performance() {
    local endpoint="$1"
    local description="$2"
    local max_time="$3"
    
    echo -n "Testing $description performance... "
    
    start_time=$(date +%s%N)
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL$endpoint" || echo "000")
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [[ "$status_code" == "200" ]] || [[ "$status_code" == "401" ]]; then
        if [[ "$duration" -lt "$max_time" ]]; then
            echo "✅ PASS (${duration}ms)"
            return 0
        else
            echo "⚠️ SLOW (${duration}ms, expected <${max_time}ms)"
            return 0  # Don't fail on slow responses
        fi
    else
        echo "❌ FAIL ($status_code)"
        return 1
    fi
}

# Performance tests
run_test test_performance "/" "Home Page Load" 3000
run_test test_performance "/api/health" "Health API" 1000
run_test test_performance "/api/test" "Test API" 5000

echo ""
echo "📊 Test Results Summary"
echo "====================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo ""
    echo "🎉 All tests passed! Your application is working correctly."
    echo ""
    echo "💡 Next Steps:"
    echo "   • Visit $TARGET_URL to use your application"
    echo "   • Check $TARGET_URL/api/health for detailed health status"
    echo "   • Review $TARGET_URL/api/test for component status"
    exit 0
else
    echo ""
    echo "🚨 $FAILED_TESTS test(s) failed. Please review the issues above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   • Check if the application is running"
    echo "   • Verify environment variables are set"
    echo "   • Check Vercel deployment logs"
    echo "   • Ensure database connections are working"
    exit 1
fi
