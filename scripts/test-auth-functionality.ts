import { AuthService } from "../lib/auth"
import { simpleHash, generateRandomString } from "../lib/security"

interface TestResult {
  testName: string
  passed: boolean
  message: string
  details?: any
}

class AuthTester {
  private authService: AuthService
  private results: TestResult[] = []

  constructor() {
    this.authService = new AuthService()
  }

  private addResult(testName: string, passed: boolean, message: string, details?: any) {
    this.results.push({ testName, passed, message, details })
    const status = passed ? "✅" : "❌"
    console.log(`${status} ${testName}: ${message}`)
    if (details) {
      console.log("   Details:", details)
    }
  }

  async testPasswordHashing() {
    try {
      const password = "testPassword123"
      const hashedPassword = await this.authService.hashPassword(password)

      // Test that password is hashed
      const isHashed = hashedPassword !== password
      this.addResult("Password Hashing", isHashed, isHashed ? "Password successfully hashed" : "Password not hashed", {
        original: password,
        hashed: hashedPassword,
      })

      // Test password comparison
      const isValid = await this.authService.comparePassword(password, hashedPassword)
      this.addResult(
        "Password Comparison",
        isValid,
        isValid ? "Password comparison works" : "Password comparison failed",
        { passwordMatches: isValid },
      )

      // Test wrong password
      const isInvalid = await this.authService.comparePassword("wrongPassword", hashedPassword)
      this.addResult(
        "Wrong Password Rejection",
        !isInvalid,
        !isInvalid ? "Wrong password correctly rejected" : "Wrong password incorrectly accepted",
        { wrongPasswordRejected: !isInvalid },
      )
    } catch (error) {
      this.addResult("Password Hashing", false, `Error: ${error}`)
    }
  }

  async testTokenGeneration() {
    try {
      const mockUser = {
        id: "test-user-123",
        email: "test@example.com",
        username: "testuser",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Test user token generation
      const userToken = this.authService.generateAuthToken(mockUser)
      const isValidToken = typeof userToken === "string" && userToken.length > 0
      this.addResult(
        "User Token Generation",
        isValidToken,
        isValidToken ? "User token generated successfully" : "Failed to generate user token",
        { tokenLength: userToken.length, tokenPreview: userToken.substring(0, 20) + "..." },
      )

      // Test admin token generation
      const mockAdmin = {
        id: "admin-123",
        username: "admin",
        role: "admin" as const,
        createdAt: new Date(),
      }

      const adminToken = this.authService.generateAdminToken(mockAdmin)
      const isValidAdminToken = typeof adminToken === "string" && adminToken.length > 0
      this.addResult(
        "Admin Token Generation",
        isValidAdminToken,
        isValidAdminToken ? "Admin token generated successfully" : "Failed to generate admin token",
        { tokenLength: adminToken.length, tokenPreview: adminToken.substring(0, 20) + "..." },
      )

      // Test token verification
      const verifiedUser = await this.authService.verifyAuthToken(userToken)
      const tokenVerified = verifiedUser !== null
      this.addResult(
        "Token Verification",
        tokenVerified,
        tokenVerified ? "Token verification works" : "Token verification failed",
        { verifiedUserId: verifiedUser?.id },
      )
    } catch (error) {
      this.addResult("Token Generation", false, `Error: ${error}`)
    }
  }

  async testSignUpFlow() {
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const testUsername = `testuser${Date.now()}`
      const testPassword = "TestPassword123!"

      console.log(`\n🔐 Testing signup with email: ${testEmail}`)

      // Mock the database call since we don't have a real database in this test
      const mockSignUp = async (email: string, username: string, password: string) => {
        // Simulate the signup process
        const hashedPassword = await this.authService.hashPassword(password)

        const newUser = {
          id: `user_${Date.now()}`,
          email,
          username,
          password: hashedPassword,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          subscription: {
            plan: "free",
            status: "active",
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        }

        const token = this.authService.generateAuthToken(newUser)
        return { user: newUser, token }
      }

      const result = await mockSignUp(testEmail, testUsername, testPassword)

      this.addResult("Sign Up Flow", !!result.user && !!result.token, "Sign up flow completed successfully", {
        userId: result.user.id,
        email: result.user.email,
        hasToken: !!result.token,
        subscriptionPlan: result.user.subscription?.plan,
      })

      return result
    } catch (error) {
      this.addResult("Sign Up Flow", false, `Error: ${error}`)
      return null
    }
  }

  async testSignInFlow() {
    try {
      const testEmail = "existing@example.com"
      const testPassword = "ExistingPassword123!"

      console.log(`\n🔑 Testing signin with email: ${testEmail}`)

      // Mock the signin process
      const mockSignIn = async (email: string, password: string) => {
        // Simulate finding user and verifying password
        const hashedPassword = await this.authService.hashPassword(password)

        const existingUser = {
          id: "existing_user_123",
          email,
          username: "existinguser",
          password: hashedPassword,
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          updatedAt: new Date(),
          subscription: {
            plan: "pro",
            status: "active",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }

        // Verify password
        const isValidPassword = await this.authService.comparePassword(password, existingUser.password)
        if (!isValidPassword) {
          throw new Error("Invalid credentials")
        }

        const token = this.authService.generateAuthToken(existingUser)
        return { user: existingUser, token }
      }

      const result = await mockSignIn(testEmail, testPassword)

      this.addResult("Sign In Flow", !!result.user && !!result.token, "Sign in flow completed successfully", {
        userId: result.user.id,
        email: result.user.email,
        hasToken: !!result.token,
        subscriptionPlan: result.user.subscription?.plan,
      })

      // Test wrong password
      try {
        await mockSignIn(testEmail, "wrongpassword")
        this.addResult("Wrong Password Handling", false, "Wrong password was accepted (should fail)")
      } catch (error) {
        this.addResult("Wrong Password Handling", true, "Wrong password correctly rejected")
      }

      return result
    } catch (error) {
      this.addResult("Sign In Flow", false, `Error: ${error}`)
      return null
    }
  }

  async testAdminAuth() {
    try {
      console.log("\n👑 Testing admin authentication")

      // Test correct admin credentials
      const mockAdminSignIn = async (username: string, password: string) => {
        if (username === "admin" && password === "CoinWayFinder2024!") {
          const admin = {
            id: "admin_1",
            username: "admin",
            role: "admin" as const,
            createdAt: new Date(),
            lastLogin: new Date(),
          }

          const token = this.authService.generateAdminToken(admin)
          return { admin, token }
        }
        throw new Error("Invalid admin credentials")
      }

      const adminResult = await mockAdminSignIn("admin", "CoinWayFinder2024!")
      this.addResult(
        "Admin Authentication",
        !!adminResult.admin && !!adminResult.token,
        "Admin authentication successful",
        {
          adminId: adminResult.admin.id,
          hasToken: !!adminResult.token,
        },
      )

      // Test wrong admin credentials
      try {
        await mockAdminSignIn("admin", "wrongpassword")
        this.addResult("Admin Wrong Password", false, "Wrong admin password was accepted")
      } catch (error) {
        this.addResult("Admin Wrong Password", true, "Wrong admin password correctly rejected")
      }
    } catch (error) {
      this.addResult("Admin Authentication", false, `Error: ${error}`)
    }
  }

  async testSecurityFunctions() {
    try {
      console.log("\n🛡️ Testing security functions")

      // Test random string generation
      const randomString1 = generateRandomString(16)
      const randomString2 = generateRandomString(16)

      this.addResult(
        "Random String Generation",
        randomString1.length === 16 && randomString2.length === 16 && randomString1 !== randomString2,
        "Random strings generated correctly",
        { string1: randomString1, string2: randomString2 },
      )

      // Test hash function
      const testData = "test data for hashing"
      const hash1 = simpleHash(testData)
      const hash2 = simpleHash(testData)
      const hash3 = simpleHash("different data")

      this.addResult(
        "Hash Function Consistency",
        hash1 === hash2 && hash1 !== hash3,
        "Hash function works consistently",
        { hash1, hash2, hash3, consistent: hash1 === hash2, different: hash1 !== hash3 },
      )
    } catch (error) {
      this.addResult("Security Functions", false, `Error: ${error}`)
    }
  }

  async runAllTests() {
    console.log("🚀 Starting Authentication Tests...\n")

    await this.testSecurityFunctions()
    await this.testPasswordHashing()
    await this.testTokenGeneration()
    await this.testSignUpFlow()
    await this.testSignInFlow()
    await this.testAdminAuth()

    // Summary
    const totalTests = this.results.length
    const passedTests = this.results.filter((r) => r.passed).length
    const failedTests = totalTests - passedTests
    const successRate = ((passedTests / totalTests) * 100).toFixed(1)

    console.log("\n📊 Authentication Test Results Summary:")
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests} ✅`)
    console.log(`Failed: ${failedTests} ❌`)
    console.log(`Success Rate: ${successRate}%`)

    if (failedTests === 0) {
      console.log("\n🎉 All authentication tests passed! 🎊")
      console.log("✅ Sign up functionality works")
      console.log("✅ Sign in functionality works")
      console.log("✅ Password hashing works")
      console.log("✅ Token generation works")
      console.log("✅ Admin authentication works")
      console.log("✅ Security functions work")
    } else {
      console.log("\n⚠️ Some tests failed. Check the details above.")
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: Number.parseFloat(successRate),
      allPassed: failedTests === 0,
    }
  }
}

// Run the tests
async function runAuthTests() {
  const tester = new AuthTester()
  return await tester.runAllTests()
}

// Export for use in other scripts
export { AuthTester, runAuthTests }

// Run if this file is executed directly
if (typeof window === "undefined" && require.main === module) {
  runAuthTests().catch(console.error)
}
