// Test the actual API endpoints for authentication
async function testAuthAPIEndpoints() {
  console.log("🌐 Testing Authentication API Endpoints...\n")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const results: any[] = []

  // Test signup endpoint
  try {
    console.log("📝 Testing signup endpoint...")
    const signupData = {
      email: `test-${Date.now()}@example.com`,
      password: "TestPassword123!",
      name: "Test User",
    }

    const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    })

    const signupResult = await signupResponse.json()

    results.push({
      endpoint: "POST /api/auth/signup",
      status: signupResponse.status,
      success: signupResult.success,
      message: signupResult.message,
      hasUser: !!signupResult.user,
    })

    console.log(`✅ Signup endpoint: ${signupResponse.status} - ${signupResult.message}`)
  } catch (error) {
    console.log(`❌ Signup endpoint error: ${error}`)
    results.push({
      endpoint: "POST /api/auth/signup",
      error: error.toString(),
    })
  }

  // Test signin endpoint
  try {
    console.log("🔑 Testing signin endpoint...")
    const signinData = {
      email: "test@example.com",
      password: "TestPassword123!",
    }

    const signinResponse = await fetch(`${baseUrl}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signinData),
    })

    const signinResult = await signinResponse.json()

    results.push({
      endpoint: "POST /api/auth/signin",
      status: signinResponse.status,
      success: signinResult.success,
      message: signinResult.message,
      hasUser: !!signinResult.user,
    })

    console.log(`✅ Signin endpoint: ${signinResponse.status} - ${signinResult.message}`)
  } catch (error) {
    console.log(`❌ Signin endpoint error: ${error}`)
    results.push({
      endpoint: "POST /api/auth/signin",
      error: error.toString(),
    })
  }

  // Test me endpoint (check auth status)
  try {
    console.log("👤 Testing me endpoint...")
    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const meResult = await meResponse.json()

    results.push({
      endpoint: "GET /api/auth/me",
      status: meResponse.status,
      success: meResult.success,
      message: meResult.message,
      hasUser: !!meResult.user,
    })

    console.log(`✅ Me endpoint: ${meResponse.status} - ${meResult.message}`)
  } catch (error) {
    console.log(`❌ Me endpoint error: ${error}`)
    results.push({
      endpoint: "GET /api/auth/me",
      error: error.toString(),
    })
  }

  // Test signout endpoint
  try {
    console.log("🚪 Testing signout endpoint...")
    const signoutResponse = await fetch(`${baseUrl}/api/auth/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const signoutResult = await signoutResponse.json()

    results.push({
      endpoint: "POST /api/auth/signout",
      status: signoutResponse.status,
      success: signoutResult.success,
      message: signoutResult.message,
    })

    console.log(`✅ Signout endpoint: ${signoutResponse.status} - ${signoutResult.message}`)
  } catch (error) {
    console.log(`❌ Signout endpoint error: ${error}`)
    results.push({
      endpoint: "POST /api/auth/signout",
      error: error.toString(),
    })
  }

  // Summary
  console.log("\n📊 API Endpoint Test Results:")
  results.forEach((result) => {
    if (result.error) {
      console.log(`❌ ${result.endpoint}: ERROR - ${result.error}`)
    } else {
      console.log(`✅ ${result.endpoint}: ${result.status} - ${result.message}`)
    }
  })

  const successfulTests = results.filter((r) => !r.error && (r.status < 400 || r.success)).length
  const totalTests = results.length
  console.log(
    `\nSuccess Rate: ${successfulTests}/${totalTests} (${((successfulTests / totalTests) * 100).toFixed(1)}%)`,
  )

  return results
}

export { testAuthAPIEndpoints }

// Run if executed directly
if (typeof window === "undefined" && require.main === module) {
  testAuthAPIEndpoints().catch(console.error)
}
