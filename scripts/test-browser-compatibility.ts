// Browser compatibility test
console.log("🌐 Testing browser compatibility...")

// Test if crypto replacements work in browser environment
function testBrowserEnvironment() {
  const results: Array<{ test: string; passed: boolean; details?: any }> = []

  // Test 1: Check if crypto module is NOT imported
  try {
    // This should NOT work in browser
    const crypto = require("crypto")
    results.push({
      test: "Crypto module should not be available",
      passed: false,
      details: "crypto module was imported successfully (this is bad for browser)",
    })
  } catch (error) {
    results.push({
      test: "Crypto module should not be available",
      passed: true,
      details: "crypto module correctly unavailable in browser",
    })
  }

  // Test 2: Check if Web Crypto API is available
  const webCryptoAvailable = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function"
  results.push({
    test: "Web Crypto API availability",
    passed: webCryptoAvailable,
    details: `Web Crypto API ${webCryptoAvailable ? "is" : "is not"} available`,
  })

  // Test 3: Check if our replacements work
  try {
    // Import our replacement functions
    const { simpleHash, generateRandomString } = require("../lib/security")

    const hash = simpleHash("test")
    const randomStr = generateRandomString(10)

    results.push({
      test: "Security replacement functions",
      passed: typeof hash === "string" && typeof randomStr === "string" && randomStr.length === 10,
      details: { hash, randomStr, randomStrLength: randomStr.length },
    })
  } catch (error) {
    results.push({
      test: "Security replacement functions",
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    })
  }

  // Print results
  console.log("\n📋 Browser Compatibility Results:")
  results.forEach((result) => {
    const status = result.passed ? "✅" : "❌"
    console.log(`${status} ${result.test}`)
    if (result.details) {
      console.log(`   Details: ${typeof result.details === "object" ? JSON.stringify(result.details) : result.details}`)
    }
  })

  const passedCount = results.filter((r) => r.passed).length
  console.log(`\n🎯 Browser compatibility: ${passedCount}/${results.length} tests passed`)

  return passedCount === results.length
}

// Run browser compatibility test
testBrowserEnvironment()
