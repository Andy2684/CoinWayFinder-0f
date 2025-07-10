// Test specific functionality that was causing crypto errors
import { simpleHash, generateRandomString, getNonce } from "../lib/security"
import { randomBytes, createHash } from "../lib/crypto-replacement"

async function testSpecificFunctionality() {
  console.log("🔧 Testing specific functionality that was causing errors...\n")

  const tests = []

  // Test 1: Hash generation (was using crypto.createHash)
  try {
    const hash1 = simpleHash("test password")
    const hash2 = createHash().update("test password").digest("hex")
    tests.push({
      name: "Hash generation",
      passed: typeof hash1 === "string" && typeof hash2 === "string",
      details: { simpleHash: hash1, createHash: hash2 },
    })
  } catch (error) {
    tests.push({
      name: "Hash generation",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Test 2: Random generation (was using crypto.randomBytes)
  try {
    const random1 = generateRandomString(16)
    const random2 = randomBytes(16)
    tests.push({
      name: "Random generation",
      passed: random1.length === 16 && random2.length === 16,
      details: {
        randomString: random1,
        randomBytes: Array.from(random2).slice(0, 5) + "...",
        lengths: { string: random1.length, bytes: random2.length },
      },
    })
  } catch (error) {
    tests.push({
      name: "Random generation",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Test 3: Nonce generation (was causing CSP issues)
  try {
    const nonce = await getNonce()
    tests.push({
      name: "Nonce generation",
      passed: typeof nonce === "string" && nonce.length > 0,
      details: { nonce, length: nonce.length },
    })
  } catch (error) {
    tests.push({
      name: "Nonce generation",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Test 4: Password hashing simulation
  try {
    const password = "testpassword123"
    const salt = generateRandomString(16)
    const hashedPassword = simpleHash(password + salt)

    // Verify password
    const verifyHash = simpleHash(password + salt)
    const isValid = hashedPassword === verifyHash

    tests.push({
      name: "Password hashing",
      passed: typeof hashedPassword === "string" && isValid,
      details: {
        hashedPassword: hashedPassword.substring(0, 10) + "...",
        salt: salt.substring(0, 8) + "...",
        verification: isValid,
      },
    })
  } catch (error) {
    tests.push({
      name: "Password hashing",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Test 5: JWT-like token generation
  try {
    const header = { alg: "HS256", typ: "JWT" }
    const payload = { userId: "123", exp: Date.now() + 3600000 }
    const secret = "test-secret"

    const headerEncoded = btoa(JSON.stringify(header))
    const payloadEncoded = btoa(JSON.stringify(payload))
    const signature = simpleHash(headerEncoded + "." + payloadEncoded + secret)

    const token = `${headerEncoded}.${payloadEncoded}.${signature}`

    tests.push({
      name: "JWT-like token generation",
      passed: token.split(".").length === 3,
      details: {
        tokenParts: token.split(".").length,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + "...",
      },
    })
  } catch (error) {
    tests.push({
      name: "JWT-like token generation",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Print results
  console.log("📊 Specific Functionality Test Results:")
  console.log("=".repeat(50))

  tests.forEach((test) => {
    const status = test.passed ? "✅" : "❌"
    console.log(`${status} ${test.name}`)

    if (test.error) {
      console.log(`   ❌ Error: ${test.error}`)
    }

    if (test.details && test.passed) {
      console.log(`   📋 Details:`, test.details)
    }
  })

  const passedCount = tests.filter((t) => t.passed).length
  const totalCount = tests.length

  console.log(
    `\n🎯 Results: ${passedCount}/${totalCount} tests passed (${((passedCount / totalCount) * 100).toFixed(1)}%)`,
  )

  if (passedCount === totalCount) {
    console.log("🎉 All specific functionality tests passed!")
    console.log("✨ The crypto error should be completely resolved.")
  } else {
    console.log("⚠️ Some functionality tests failed. Review the errors above.")
  }

  return passedCount === totalCount
}

// Run the specific functionality tests
testSpecificFunctionality().catch(console.error)
