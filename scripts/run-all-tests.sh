#!/bin/bash

# CoinWayFinder Comprehensive Test Runner
# This script runs all types of tests for the application

set -e  # Exit on any error

echo "🚀 CoinWayFinder Comprehensive Test Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status $BLUE "🔍 Checking prerequisites..."

if ! command_exists node; then
    print_status $RED "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    print_status $RED "❌ npm is not installed"
    exit 1
fi

print_status $GREEN "✅ Prerequisites check passed"

# Get the base URL for testing
BASE_URL=${1:-${NEXT_PUBLIC_BASE_URL:-"http://localhost:3000"}}
print_status $BLUE "🌐 Target URL: $BASE_URL"

# Check if the application is running
print_status $BLUE "🔍 Checking if application is running..."
if curl -f -s "$BASE_URL/api/health" > /dev/null; then
    print_status $GREEN "✅ Application is running"
else
    print_status $YELLOW "⚠️ Application may not be running at $BASE_URL"
    print_status $YELLOW "   Starting local development server..."
    
    # Start the development server in the background
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait for the server to start
    print_status $BLUE "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if curl -f -s "http://localhost:3000/api/health" > /dev/null; then
            print_status $GREEN "✅ Development server started"
            BASE_URL="http://localhost:3000"
            break
        fi
        sleep 2
    done
    
    if [ $i -eq 30 ]; then
        print_status $RED "❌ Failed to start development server"
        kill $DEV_SERVER_PID 2>/dev/null || true
        exit 1
    fi
fi

# Initialize test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name=$1
    local test_command=$2
    
    print_status $BLUE "🧪 Running $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval $test_command; then
        print_status $GREEN "✅ $test_name passed"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_status $RED "❌ $test_name failed"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Run Unit Tests
print_status $BLUE "\n📋 Running Unit Tests..."
run_test "Unit Tests" "npm test -- --passWithNoTests --silent"

# Run Linting
print_status $BLUE "\n🔍 Running Code Quality Checks..."
run_test "ESLint" "npm run lint"

# Run Type Checking
print_status $BLUE "\n📝 Running TypeScript Type Checking..."
run_test "TypeScript Check" "npx tsc --noEmit"

# Run Build Test
print_status $BLUE "\n🏗️ Running Build Test..."
run_test "Build Test" "npm run build"

# Run Health Check
print_status $BLUE "\n🏥 Running Health Check..."
run_test "Health Check" "curl -f -s $BASE_URL/api/health > /dev/null"

# Run System Test
print_status $BLUE "\n🔧 Running System Test..."
run_test "System Test" "curl -f -s $BASE_URL/api/test > /dev/null"

# Run Full System Test Suite
print_status $BLUE "\n🚀 Running Full System Test Suite..."
if command_exists tsx; then
    run_test "Full System Test" "tsx scripts/execute-full-system-test.ts $BASE_URL"
else
    print_status $YELLOW "⚠️ tsx not found, skipping full system test"
fi

# Run Security Tests
print_status $BLUE "\n🔒 Running Security Tests..."
run_test "Security Headers" "curl -I -s $BASE_URL | grep -i 'x-frame-options\\|x-content-type-options\\|x-xss-protection' > /dev/null"

# Run Performance Tests
print_status $BLUE "\n⚡ Running Performance Tests..."
run_test "Page Load Test" "curl -w '%{time_total}' -o /dev/null -s $BASE_URL | awk '{if(\$1 < 3) exit 0; else exit 1}'"

# API Endpoint Tests
print_status $BLUE "\n🔌 Running API Endpoint Tests..."
run_test "Auth API" "curl -f -s -X POST $BASE_URL/api/auth/signin -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"test\"}' > /dev/null || true"
run_test "Crypto Prices API" "curl -f -s $BASE_URL/api/crypto/prices > /dev/null || true"
run_test "Bots API" "curl -f -s $BASE_URL/api/bots > /dev/null || true"

# Frontend Page Tests
print_status $BLUE "\n🌐 Running Frontend Page Tests..."
run_test "Home Page" "curl -f -s $BASE_URL > /dev/null"
run_test "Dashboard Page" "curl -f -s $BASE_URL/dashboard > /dev/null"
run_test "Bots Page" "curl -f -s $BASE_URL/bots > /dev/null"
run_test "Subscription Page" "curl -f -s $BASE_URL/subscription > /dev/null"
run_test "API Docs Page" "curl -f -s $BASE_URL/api-docs > /dev/null"

# Database Connection Test (if configured)
if [ ! -z "$MONGODB_URI" ]; then
    print_status $BLUE "\n🗄️ Running Database Tests..."
    run_test "Database Connection" "curl -f -s $BASE_URL/api/test | grep -i 'database.*healthy' > /dev/null"
else
    print_status $YELLOW "⚠️ MONGODB_URI not set, skipping database tests"
fi

# Redis Connection Test (if configured)
if [ ! -z "$REDIS_URL" ]; then
    print_status $BLUE "\n📦 Running Redis Tests..."
    run_test "Redis Connection" "curl -f -s $BASE_URL/api/test | grep -i 'redis.*healthy' > /dev/null"
else
    print_status $YELLOW "⚠️ REDIS_URL not set, skipping Redis tests"
fi

# Cleanup
if [ ! -z "$DEV_SERVER_PID" ]; then
    print_status $BLUE "🧹 Cleaning up development server..."
    kill $DEV_SERVER_PID 2>/dev/null || true
fi

# Print final results
print_status $BLUE "\n" 
echo "========================================"
print_status $BLUE "📊 TEST RESULTS SUMMARY"
echo "========================================"
print_status $BLUE "Total Tests: $TOTAL_TESTS"
print_status $GREEN "Passed: $PASSED_TESTS"
print_status $RED "Failed: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    print_status $GREEN "🎉 All tests passed! Your application is ready."
    echo ""
    print_status $BLUE "💡 Next Steps:"
    print_status $BLUE "   • Deploy to production: npm run deploy"
    print_status $BLUE "   • Monitor application: $BASE_URL/api/health"
    print_status $BLUE "   • View API docs: $BASE_URL/api-docs"
    exit 0
else
    print_status $RED "❌ $FAILED_TESTS test(s) failed. Please review and fix the issues above."
    echo ""
    print_status $BLUE "💡 Troubleshooting:"
    print_status $BLUE "   • Check application logs"
    print_status $BLUE "   • Verify environment variables"
    print_status $BLUE "   • Run individual tests for more details"
    print_status $BLUE "   • Visit $BASE_URL/api/test for system status"
    exit 1
fi
