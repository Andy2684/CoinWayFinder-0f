import fetch from "node-fetch"

export interface TestResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  duration: number
  details?: any
}

export class DeploymentTester {
  private baseUrl: string
  public results: TestResult[] = []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
  }

  private async makeRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${path}`
    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "CoinWayFinder-TestSuite/1.0",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    })
    return response
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now()
    console.log(`🧪 Testing: ${name}`)

    try {
      await testFn()
      const duration = Date.now() - startTime
      const result: TestResult = {
        name,
        status: "pass",
        message: "Test passed successfully",
        duration,
      }
      console.log(`✅ ${name} - PASSED (${duration}ms)`)
      this.results.push(result)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const message = error instanceof Error ? error.message : "Unknown error"
      const result: TestResult = {
        name,
        status: "fail",
        message,
        duration,
      }
      console.log(`❌ ${name} - FAILED (${duration}ms): ${message}`)
      this.results.push(result)
      return result
    }
  }

  async testHealthEndpoint(): Promise<TestResult> {
    return this.runTest("Health Endpoint", async () => {
      const response = await this.makeRequest("/api/health")

      if (!response.ok) {
        throw new Error(`Expected 200, got ${response.status}`)
      }

      const data = await response.json()
      if (!data || typeof data !== "object" || !data.status) {
        throw new Error("Health response missing status field")
      }

      console.log(`   📊 Status: ${data.status}`)
      console.log(`   🌍 Environment: ${data.environment || "unknown"}`)
      console.log(`   ⏱️ Uptime: ${data.uptime || 0}s`)
    })
  }

  async testComprehensiveEndpoint(): Promise<TestResult> {
    return this.runTest("Comprehensive Test Endpoint", async () => {
      const response = await this.makeRequest("/api/test")

      if (response.status !== 200 && response.status !== 500) {
        throw new Error(`Expected 200 or 500, got ${response.status}`)
      }

      const data = await response.json()
      if (!data || typeof data !== "object" || !Array.isArray(data.tests)) {
        throw new Error("Test response missing tests array")
      }

      console.log(`   📊 Found ${data.tests.length} component tests`)
      data.tests.forEach((test: any) => {
        const icon = test.status === "healthy" ? "✅" : test.status === "warning" ? "⚠️" : "❌"
        console.log(`   ${icon} ${test.name}: ${test.message}`)
      })
    })
  }

  async testStaticPages(): Promise<TestResult[]> {
    const pages = [
      { path: "/", name: "Home Page" },
      { path: "/dashboard", name: "Dashboard" },
      { path: "/bots", name: "Bots Page" },
      { path: "/subscription", name: "Subscription Page" },
      { path: "/api-docs", name: "API Documentation" },
      { path: "/news", name: "News Page" },
      { path: "/integrations", name: "Integrations Page" },
      { path: "/profile", name: "Profile Page" },
    ]

    const results: TestResult[] = []

    for (const page of pages) {
      const result = await this.runTest(`Static Page: ${page.name}`, async () => {
        const response = await this.makeRequest(page.path)

        if (!response.ok) {
          throw new Error(`Expected 200, got ${response.status}`)
        }

        const content = await response.text()
        if (!content.includes("<!DOCTYPE html>") && !content.includes("<html")) {
          throw new Error("Response does not appear to be HTML")
        }

        console.log(`   📄 Content length: ${content.length} characters`)
      })
      results.push(result)
    }

    return results
  }

  async testAPIEndpoints(): Promise<TestResult[]> {
    const endpoints = [
      {
        path: "/api/auth/signin",
        method: "POST",
        expectStatus: [400, 401, 422],
        body: { email: "test@example.com", password: "testpass" },
      },
      {
        path: "/api/crypto/prices",
        method: "GET",
        expectStatus: [200, 401, 503],
      },
      {
        path: "/api/crypto/trends",
        method: "GET",
        expectStatus: [200, 401, 503],
      },
      {
        path: "/api/bots",
        method: "GET",
        expectStatus: [200, 401],
      },
      {
        path: "/api/subscription",
        method: "GET",
        expectStatus: [200, 401],
      },
    ]

    const results: TestResult[] = []

    for (const endpoint of endpoints) {
      const result = await this.runTest(`API Endpoint: ${endpoint.path}`, async () => {
        const options: RequestInit = {
          method: endpoint.method,
        }

        if (endpoint.body) {
          options.headers = {
            "Content-Type": "application/json",
          }
          options.body = JSON.stringify(endpoint.body)
        }

        const response = await this.makeRequest(endpoint.path, options)

        if (!endpoint.expectStatus.includes(response.status)) {
          throw new Error(`Expected ${endpoint.expectStatus.join(" or ")}, got ${response.status}`)
        }

        console.log(`   📡 Status: ${response.status} (expected)`)
      })
      results.push(result)
    }

    return results
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log(`🌐 Testing application at: ${this.baseUrl}`)
    console.log("=" + "=".repeat(50))

    await this.testHealthEndpoint()
    await this.testComprehensiveEndpoint()
    await this.testStaticPages()
    await this.testAPIEndpoints()

    return this.results
  }

  printResults(): void {
    console.log("\n" + "=".repeat(50))
    console.log("📈 DETAILED TEST RESULTS")
    console.log("=".repeat(50))

    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length
    const total = this.results.length

    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`⚠️ Warnings: ${warnings}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)

    if (failed > 0) {
      console.log("\n❌ FAILED TESTS:")
      this.results
        .filter((r) => r.status === "fail")
        .forEach((result) => {
          console.log(`   • ${result.name}: ${result.message}`)
        })
    }

    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total
    console.log(`\n⏱️ Average response time: ${Math.round(avgDuration)}ms`)

    if (failed === 0) {
      console.log("\n🎉 All tests passed! Your application is working correctly.")
    } else {
      console.log(`\n⚠️ ${failed} test(s) failed. Please review the issues above.`)
    }
  }
}
