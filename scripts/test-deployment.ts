interface TestResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  duration: number
}

class DeploymentTester {
  private baseUrl: string
  private results: TestResult[] = []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now()
    try {
      await testFn()
      this.results.push({
        name,
        status: "pass",
        message: "Test passed successfully",
        duration: Date.now() - startTime,
      })
    } catch (error) {
      this.results.push({
        name,
        status: "fail",
        message: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
      })
    }
  }

  async testHealthEndpoint(): Promise<void> {
    await this.runTest("Health Endpoint", async () => {
      const response = await fetch(`${this.baseUrl}/api/health`)
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      const data = await response.json()
      if (data.status !== "healthy" && data.status !== "warning") {
        throw new Error(`Unhealthy status: ${data.status}`)
      }
    })
  }

  async testAuthEndpoints(): Promise<void> {
    await this.runTest("Auth Endpoints", async () => {
      // Test signup endpoint
      const signupResponse = await fetch(`${this.baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "testpassword123",
          name: "Test User",
        }),
      })

      if (signupResponse.status !== 201 && signupResponse.status !== 400) {
        throw new Error(`Signup endpoint error: ${signupResponse.status}`)
      }

      // Test signin endpoint
      const signinResponse = await fetch(`${this.baseUrl}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "testpassword123",
        }),
      })

      if (signinResponse.status !== 200 && signinResponse.status !== 401) {
        throw new Error(`Signin endpoint error: ${signinResponse.status}`)
      }
    })
  }

  async testCryptoEndpoints(): Promise<void> {
    await this.runTest("Crypto Data Endpoints", async () => {
      const endpoints = ["/api/crypto/prices", "/api/crypto/trends", "/api/crypto/news"]

      for (const endpoint of endpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`)
        if (!response.ok && response.status !== 503) {
          throw new Error(`${endpoint} failed: ${response.status}`)
        }
      }
    })
  }

  async testBotEndpoints(): Promise<void> {
    await this.runTest("Bot Management Endpoints", async () => {
      const response = await fetch(`${this.baseUrl}/api/bots`)
      if (!response.ok && response.status !== 401) {
        throw new Error(`Bots endpoint failed: ${response.status}`)
      }
    })
  }

  async testSubscriptionEndpoints(): Promise<void> {
    await this.runTest("Subscription Endpoints", async () => {
      const response = await fetch(`${this.baseUrl}/api/subscription`)
      if (!response.ok && response.status !== 401) {
        throw new Error(`Subscription endpoint failed: ${response.status}`)
      }
    })
  }

  async testStaticPages(): Promise<void> {
    await this.runTest("Static Pages", async () => {
      const pages = ["/", "/dashboard", "/bots", "/subscription", "/api-docs"]

      for (const page of pages) {
        const response = await fetch(`${this.baseUrl}${page}`)
        if (!response.ok) {
          throw new Error(`Page ${page} failed: ${response.status}`)
        }
      }
    })
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log(`🧪 Starting deployment tests for ${this.baseUrl}`)

    await this.testHealthEndpoint()
    await this.testStaticPages()
    await this.testAuthEndpoints()
    await this.testCryptoEndpoints()
    await this.testBotEndpoints()
    await this.testSubscriptionEndpoints()

    return this.results
  }

  printResults(): void {
    console.log("\n📊 Test Results:")
    console.log("================")

    let passed = 0
    let failed = 0
    let warnings = 0

    this.results.forEach((result) => {
      const icon = result.status === "pass" ? "✅" : result.status === "warning" ? "⚠️" : "❌"
      console.log(`${icon} ${result.name}: ${result.message} (${result.duration}ms)`)

      if (result.status === "pass") passed++
      else if (result.status === "fail") failed++
      else warnings++
    })

    console.log("\n📈 Summary:")
    console.log(`✅ Passed: ${passed}`)
    console.log(`⚠️ Warnings: ${warnings}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📊 Total: ${this.results.length}`)
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const tester = new DeploymentTester(baseUrl)

  try {
    await tester.runAllTests()
    tester.printResults()
  } catch (error) {
    console.error("❌ Test execution failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { DeploymentTester }
