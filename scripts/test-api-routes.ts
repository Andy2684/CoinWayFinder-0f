// Test script to verify key API routes functionality
async function testApiRoutes() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const testUserId = "test-user-123"

  console.log("🧪 Testing API Routes...\n")

  // Test 1: Health check
  try {
    console.log("1. Testing health check...")
    const response = await fetch(`${baseUrl}/api/health`)
    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      console.log("   ✅ Health check passed")
    } else {
      console.log("   ❌ Health check failed")
    }
  } catch (error) {
    console.log("   ❌ Health check error:", error)
  }

  // Test 2: User authentication
  try {
    console.log("\n2. Testing user authentication...")
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Cookie: "auth-token=test-token",
      },
    })
    console.log(`   Status: ${response.status}`)
    const data = await response.json()
    console.log("   Response:", data)
  } catch (error) {
    console.log("   ❌ Auth test error:", error)
  }

  // Test 3: Subscription status
  try {
    console.log("\n3. Testing subscription API...")
    const response = await fetch(`${baseUrl}/api/subscription?userId=${testUserId}`)
    console.log(`   Status: ${response.status}`)
    const data = await response.json()
    console.log("   Response:", data)
  } catch (error) {
    console.log("   ❌ Subscription test error:", error)
  }

  // Test 4: Bots API
  try {
    console.log("\n4. Testing bots API...")
    const response = await fetch(`${baseUrl}/api/bots`, {
      headers: {
        "x-user-id": testUserId,
      },
    })
    console.log(`   Status: ${response.status}`)
    const data = await response.json()
    console.log("   Response:", data)
  } catch (error) {
    console.log("   ❌ Bots API test error:", error)
  }

  // Test 5: Integration test
  try {
    console.log("\n5. Testing integration connection...")
    const response = await fetch(`${baseUrl}/api/integrations/test-connection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exchangeId: "binance",
        credentials: {
          apiKey: "test-key",
          secretKey: "test-secret",
        },
        testnet: true,
      }),
    })
    console.log(`   Status: ${response.status}`)
    const data = await response.json()
    console.log("   Response:", data)
  } catch (error) {
    console.log("   ❌ Integration test error:", error)
  }

  // Test 6: Crypto prices API
  try {
    console.log("\n6. Testing crypto prices API...")
    const response = await fetch(`${baseUrl}/api/crypto/prices`)
    console.log(`   Status: ${response.status}`)
    const data = await response.json()
    console.log("   Response sample:", JSON.stringify(data).slice(0, 200) + "...")
  } catch (error) {
    console.log("   ❌ Crypto prices test error:", error)
  }

  console.log("\n✅ API testing completed!")
}

// Run tests if this file is executed directly
if (require.main === module) {
  testApiRoutes().catch(console.error)
}

export { testApiRoutes }
