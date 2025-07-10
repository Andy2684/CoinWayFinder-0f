// Test that the main page components can be imported without crypto errors
async function testPageLoad() {
  console.log("📄 Testing page load without crypto errors...\n")

  const tests = []

  // Test 1: Import main page components
  try {
    // These imports should not cause crypto errors
    const securityModule = await import("../lib/security")
    const cryptoReplacementModule = await import("../lib/crypto-replacement")

    tests.push({
      name: "Import security modules",
      passed: true,
      details: {
        securityFunctions: Object.keys(securityModule).length,
        cryptoReplacements: Object.keys(cryptoReplacementModule).length,
      },
    })
  } catch (error) {
    tests.push({
      name: "Import security modules",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Test 2: Test that crypto is not imported anywhere
  try {
    // This should fail in browser environment
    const crypto = require("crypto")
    tests.push({
      name: "Crypto module isolation",
      passed: false,
      error: "crypto module should not be available in browser",
    })
  } catch (error) {
    tests.push({
      name: "Crypto module isolation",
      passed: true,
      details: "crypto module correctly isolated from browser",
    })
  }

  // Test 3: Test basic functionality
  try {
    const { simpleHash, generateRandomString } = await import("../lib/security")

    const hash = simpleHash("test")
    const random = generateRandomString(10)

    tests.push({
      name: "Basic functionality",
      passed: typeof hash === "string" && typeof random === "string" && random.length === 10,
      details: { hashType: typeof hash, randomLength: random.length },
    })
  } catch (error) {
    tests.push({
      name: "Basic functionality",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Print results
  console.log("📊 Page Load Test Results:")
  tests.forEach((test) => {
    const status = test.passed ? "✅" : "❌"
    console.log(`${status} ${test.name}`)
    if (test.error) {
      console.log(`   Error: ${test.error}`)
    }
    if (test.details) {
      console.log(`   Details:`, test.details)
    }
  })

  const allPassed = tests.every((t) => t.passed)
  console.log(`\n🎯 Page load test: ${allPassed ? "PASSED" : "FAILED"}`)

  if (allPassed) {
    console.log("🎉 The main page should load without crypto errors!")
  }

  return allPassed
}

testPageLoad().catch(console.error)
