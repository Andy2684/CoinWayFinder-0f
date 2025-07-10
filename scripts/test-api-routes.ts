const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

interface TestResult {
  endpoint: string
  method: string
  status: number
  success: boolean
  error?: string
  data?: any
}

async function testApiRoute(
  endpoint: string,
  method = "GET",
  body?: any,
  headers: Record<string, string> = {},
): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    return {
      endpoint,
      method,
      status: response.status,
      success: response.ok,
      data,
    }
  } catch (error) {
    return {
      endpoint,
      method,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function runApiTests() {
  console.log("🚀 Starting API Route Tests...\n")

  const tests: Array<{
    name: string
    endpoint: string
    method?: string
    body?: any
    headers?: Record<string, string>
  }> = [
    // Health check
    {
      name: "Health Check",
      endpoint: "/api/health",
    },

    // Auth routes
    {
      name: "Auth - Sign Up",
      endpoint: "/api/auth/signup",
      method: "POST",
      body: {
        email: "test@example.com",
        username: "testuser",
        password: "testpassword123",
      },
    },

    {
      name: "Auth - Sign In",
      endpoint: "/api/auth/signin",
      method: "POST",
      body: {
        email: "test@example.com",
        password: "testpassword123",
      },
    },

    // Subscription routes
    {
      name: "Subscription Info",
      endpoint: "/api/subscription?userId=test123",
    },

    {
      name: "Start Trial",
      endpoint: "/api/subscription/start-trial",
      method: "POST",
      body: {
        userId: "test123",
      },
    },

    // Bot routes
    {
      name: "Get Bots",
      endpoint: "/api/bots",
      headers: {
        "x-user-id": "test123",
      },
    },

    {
      name: "Create Bot",
      endpoint: "/api/bots",
      method: "POST",
      headers: {
        "x-user-id": "test123",
      },
      body: {
        name: "Test Bot",
        strategy: "dca",
        symbol: "BTC/USDT",
        config: {
          riskLevel: 30,
          investment: 1000,
        },
      },
    },

    // API Keys
    {
      name: "Get API Keys",
      endpoint: "/api/user/api-keys",
      headers: {
        "x-user-id": "test123",
      },
    },

    {
      name: "Create API Key",
      endpoint: "/api/user/api-keys",
      method: "POST",
      headers: {
        "x-user-id": "test123",
      },
      body: {
        name: "Test API Key",
      },
    },

    // Trades
    {
      name: "Get Trades",
      endpoint: "/api/trades",
      headers: {
        "x-user-id": "test123",
      },
    },

    // Crypto data
    {
      name: "Crypto Prices",
      endpoint: "/api/crypto/prices",
    },

    {
      name: "Crypto News",
      endpoint: "/api/crypto/news",
    },

    {
      name: "Market Trends",
      endpoint: "/api/crypto/trends",
    },

    // Portfolio
    {
      name: "Portfolio Data",
      endpoint: "/api/portfolio",
      headers: {
        "x-user-id": "test123",
      },
    },
  ]

  const results: TestResult[] = []

  for (const test of tests) {
    console.log(`Testing: ${test.name}`)
    const result = await testApiRoute(test.endpoint, test.method || "GET", test.body, test.headers || {})

    results.push(result)

    if (result.success) {
      console.log(`✅ ${test.name} - Status: ${result.status}`)
    } else {
      console.log(`❌ ${test.name} - Status: ${result.status} - Error: ${result.error || "API Error"}`)
      if (result.data) {
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`)
      }
    }
    console.log("")
  }

  // Summary
  const successful = results.filter((r) => r.success).length
  const total = results.length

  console.log("📊 Test Summary:")
  console.log(`✅ Successful: ${successful}/${total}`)
  console.log(`❌ Failed: ${total - successful}/${total}`)

  if (successful === total) {
    console.log("🎉 All tests passed!")
  } else {
    console.log("⚠️  Some tests failed. Check the logs above for details.")
  }

  return results
}

// Run tests if this script is executed directly
if (require.main === module) {
  runApiTests().catch(console.error)
}

export { runApiTests, testApiRoute }
