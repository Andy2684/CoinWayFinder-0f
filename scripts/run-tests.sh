#!/bin/bash

echo "🧪 Running CoinWayFinder Tests"
echo "=============================="

# Set default URL if not provided
BASE_URL=${1:-"http://localhost:3000"}

echo "🌐 Testing URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed (HTTP $HEALTH_RESPONSE)"
fi

# Test 2: Comprehensive Test
echo ""
echo "2️⃣ Running Comprehensive Tests..."
TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/test")
if [ "$TEST_RESPONSE" = "200" ] || [ "$TEST_RESPONSE" = "500" ]; then
    echo "✅ Test endpoint accessible"
    echo "📊 Fetching detailed results..."
    curl -s "$BASE_URL/api/test" | jq '.' 2>/dev/null || echo "⚠️ jq not installed, raw response above"
else
    echo "❌ Test endpoint failed (HTTP $TEST_RESPONSE)"
fi

# Test 3: Static Pages
echo ""
echo "3️⃣ Testing Static Pages..."
PAGES=("/" "/dashboard" "/bots" "/subscription" "/api-docs")

for page in "${PAGES[@]}"; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
    if [ "$RESPONSE" = "200" ]; then
        echo "✅ $page - OK"
    else
        echo "❌ $page - Failed (HTTP $RESPONSE)"
    fi
done

# Test 4: API Endpoints
echo ""
echo "4️⃣ Testing API Endpoints..."
API_ENDPOINTS=("/api/crypto/prices" "/api/crypto/trends" "/api/bots" "/api/subscription")

for endpoint in "${API_ENDPOINTS[@]}"; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "503" ]; then
        echo "✅ $endpoint - Accessible"
    else
        echo "❌ $endpoint - Failed (HTTP $RESPONSE)"
    fi
done

echo ""
echo "🎉 Test run completed!"
echo ""
echo "💡 Tips:"
echo "   - HTTP 401 on protected endpoints is expected"
echo "   - HTTP 503 on external API calls is normal without API keys"
echo "   - Check /api/test for detailed component status"
