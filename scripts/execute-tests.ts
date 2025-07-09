async function runTestSuite() {
  console.log("🚀 CoinWayFinder Deployment Test Suite")
  console.log("====================================")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  console.log(`🌐 Base URL: ${baseUrl}`)

  // Test 1: Basic connectivity
  console.log("\n1️⃣ Testing Basic Connectivity...")
  try {
    const response = await fetch(`${baseUrl}/api/health`)
    const data = await response.json()

    if (response.ok) {
      console.log("✅ Application is responding")
      console.log(`   Status: ${data.status}`)
      console.log(`   Environment: ${data.environment}`)
      console.log(`   Uptime: ${data.uptime}s`)
    } else {
      console.log("❌ Health check failed")
      console.log(`   Status: ${response.status}`)
    }
  } catch (error) {
    console.log("❌ Cannot connect to application")
    console.log(`   Error: ${error.message}`)
    return
  }

  // Test 2: Comprehensive system check
  console.log("\n2️⃣ Running Comprehensive System Check...")
  try {
    const response = await fetch(`${baseUrl}/api/test`)
    const data = await response.json()

    console.log(`📊 System Status: ${data.status}`)
    console.log(`📈 Test Results: ${data.summary.healthy}/${data.summary.total} healthy`)

    if (data.tests) {
      console.log("\n   Component Status:")
      data.tests.forEach((test: any) => {
        const icon = test.status === "healthy" ? "✅" : test.status === "warning" ? "⚠️" : "❌"
        console.log(`   ${icon} ${test.name}: ${test.message}`)
      })
    }
  } catch (error) {
    console.log("❌ System check failed")
    console.log(`   Error: ${error.message}`)
  }

  // Test 3: Static pages
  console.log("\n3️⃣ Testing Static Pages...")
  const pages = ["/", "/dashboard", "/bots", "/subscription", "/api-docs"]

  for (const page of pages) {
    try {
      const response = await fetch(`${baseUrl}${page}`)
      if (response.ok) {
        console.log(`✅ ${page} - OK`)
      } else {
        console.log(`❌ ${page} - Failed (${response.status})`)
      }
    } catch (error) {
      console.log(`❌ ${page} - Error: ${error.message}`)
    }
  }

  // Test 4: API endpoints
  console.log("\n4️⃣ Testing API Endpoints...")
  const apiTests = [
    { path: "/api/crypto/prices", expected: [200, 503] },
    { path: "/api/crypto/trends", expected: [200, 503] },
    { path: "/api/bots", expected: [200, 401] },
    { path: "/api/subscription", expected: [200, 401] },
  ]

  for (const test of apiTests) {
    try {
      const response = await fetch(`${baseUrl}${test.path}`)
      if (test.expected.includes(response.status)) {
        console.log(`✅ ${test.path} - OK (${response.status})`)
      } else {
        console.log(`❌ ${test.path} - Unexpected status (${response.status})`)
      }
    } catch (error) {
      console.log(`❌ ${test.path} - Error: ${error.message}`)
    }
  }

  // Test 5: Authentication flow
  console.log("\n5️⃣ Testing Authentication Flow...")
  try {
    const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpass123",
        name: "Test User",
      }),
    })

    if (signupResponse.status === 201) {
      console.log("✅ Signup endpoint - OK (new user)")
    } else if (signupResponse.status === 400) {
      console.log("✅ Signup endpoint - OK (user exists)")
    } else {
      console.log(`❌ Signup endpoint - Unexpected status (${signupResponse.status})`)
    }
  } catch (error) {
    console.log(`❌ Signup test failed: ${error.message}`)
  }

  // Test 6: Performance check
  console.log("\n6️⃣ Running Performance Check...")
  const performanceTests = [
    { name: "Home Page", url: `${baseUrl}/` },
    { name: "Dashboard", url: `${baseUrl}/dashboard` },
    { name: "API Health", url: `${baseUrl}/api/health` },
  ]

  for (const test of performanceTests) {
    try {
      const start = Date.now()
      const response = await fetch(test.url)
      const duration = Date.now() - start

      if (response.ok) {
        const status = duration < 1000 ? "✅" : duration < 3000 ? "⚠️" : "❌"
        console.log(`${status} ${test.name}: ${duration}ms`)
      } else {
        console.log(`❌ ${test.name}: Failed (${response.status})`)
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`)
    }
  }

  console.log("\n🎉 Test suite completed!")
  console.log("\n💡 Notes:")
  console.log("   • 401 errors on protected routes are expected")
  console.log("   • 503 errors on external APIs are normal without keys")
  console.log("   • Visit /api/test for detailed component status")
}

// Execute the test suite
runTestSuite().catch(console.error)
