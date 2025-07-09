interface TestResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  duration: number
  details?: any
}

export class DeploymentTester {
  private baseUrl: string
  private results: TestResult[] = []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
  }

  private async makeRequest(
    path: string,
    options: RequestInit = {},
  ): Promise<{ status: number; data: any; headers: Headers }> {
    const url = `${this.baseUrl}${path}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    let data: any
    try {
      const text = await response.text()
      data = text.startsWith("{") || text.startsWith("[") ? JSON.parse(text) : text
    } catch {
      data = await response.text()
    }

    return {
      status: response.status,
      data,
      headers: response.headers,
    }
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
        details: error,
      }
      console.log(`❌ ${name} - FAILED (${duration}ms): ${message}`)
      this.results.push(result)
      return result
    }
  }

  async testHealthEndpoint(): Promise<TestResult> {
    return this.runTest("Health Endpoint", async () => {
      const response = await this.makeRequest("/api/health")

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`)
      }

      if (typeof response.data !== "object" || !response.data.status) {
        throw new Error("Health response missing status field")
      }

      console.log(`   📊 Status: ${response.data.status}`)
      console.log(`   🌍 Environment: ${response.data.environment || "unknown"}`)
      console.log(`   ⏱️ Uptime: ${response.data.uptime || 0}s`)
    })
  }

  async testComprehensiveEndpoint(): Promise<TestResult> {
    return this.runTest("Comprehensive Test Endpoint", async () => {
      const response = await this.makeRequest("/api/test")

      if (response.status !== 200 && response.status !== 500) {
        throw new Error(`Expected 200 or 500, got ${response.status}`)
      }

      if (typeof response.data !== "object" || !Array.isArray(response.data.tests)) {
        throw new Error("Test response missing tests array")
      }

      console.log(`   📊 Found ${response.data.tests.length} component tests`)
      console.log(`   📈 Overall status: ${response.data.status}`)

      response.data.tests.forEach((test: any) => {
        const icon = test.status === "healthy" ? "✅" : test.status === "warning" ? "⚠️" : "❌"
        console.log(`   ${icon} ${test.name}: ${test.message}`)
      })

      if (response.data.summary) {
        console.log(`   📊 Summary: ${response.data.summary.healthy}/${response.data.summary.total} healthy`)
      }
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

        if (response.status !== 200) {
          throw new Error(`Expected 200, got ${response.status}`)
        }

        const content = typeof response.data === "string" ? response.data : JSON.stringify(response.data)

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
      {
        path: "/api/news",
        method: "GET",
        expectStatus: [200, 401, 503],
      },
      {
        path: "/api/whales",
        method: "GET",
        expectStatus: [200, 401, 503],
      },
    ]

    const results: TestResult[] = []

    for (const endpoint of endpoints) {
      const result = await this.runTest(`API Endpoint: ${endpoint.path}`, async () => {
        const options: RequestInit = {
          method: endpoint.method,
        }

        if (endpoint.body) {
          options.body = JSON.stringify(endpoint.body)
        }

        const response = await this.makeRequest(endpoint.path, options)

        if (!endpoint.expectStatus.includes(response.status)) {
          throw new Error(`Expected ${endpoint.expectStatus.join(" or ")}, got ${response.status}`)
        }

        console.log(`   📡 Status: ${response.status} (expected)`)

        if (typeof response.data === "object" && response.data.message) {
          console.log(`   💬 Message: ${response.data.message}`)
        }
      })
      results.push(result)
    }

    return results
  }

  async testPerformance(): Promise<TestResult[]> {
    const performanceTests = [
      { name: "Home Page Load Time", path: "/" },
      { name: "Dashboard Load Time", path: "/dashboard" },
      { name: "API Health Response", path: "/api/health" },
      { name: "API Test Response", path: "/api/test" },
    ]

    const results: TestResult[] = []

    for (const test of performanceTests) {
      const result = await this.runTest(`Performance: ${test.name}`, async () => {
        const start = Date.now()
        const response = await this.makeRequest(test.path)
        const duration = Date.now() - start

        if (response.status !== 200 && response.status !== 500) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        let status: "pass" | "warning" | "fail" = "pass"
        let message = `Response time: ${duration}ms`

        if (duration > 5000) {
          status = "fail"
          message += " (too slow)"
        } else if (duration > 2000) {
          status = "warning"
          message += " (slow)"
        } else {
          message += " (good)"
        }

        console.log(`   ⚡ ${message}`)

        if (status === "fail") {
          throw new Error(message)
        }
      })
      results.push(result)
    }

    return results
  }

  async testDatabaseConnectivity(): Promise<TestResult> {
    return this.runTest("Database Connectivity", async () => {
      // Test if we can reach any database-dependent endpoint
      const response = await this.makeRequest("/api/test")

      if (response.status !== 200 && response.status !== 500) {
        throw new Error(`Test endpoint unreachable: ${response.status}`)
      }

      if (typeof response.data === "object" && response.data.tests) {
        const dbTest = response.data.tests.find(
          (t: any) => t.name.toLowerCase().includes("database") || t.name.toLowerCase().includes("mongodb"),
        )

        if (dbTest) {
          console.log(`   🗄️ Database status: ${dbTest.status}`)
          console.log(`   💬 Message: ${dbTest.message}`)

          if (dbTest.status === "error") {
            throw new Error(`Database connection failed: ${dbTest.message}`)
          }
        } else {
          console.log(`   🗄️ Database test not found in response`)
        }
      }
    })
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log(`🌐 Testing application at: ${this.baseUrl}`)
    console.log("=" + "=".repeat(50))

    // Run all test categories
    await this.testHealthEndpoint()
    await this.testComprehensiveEndpoint()
    await this.testDatabaseConnectivity()

    const staticResults = await this.testStaticPages()
    const apiResults = await this.testAPIEndpoints()
    const performanceResults = await this.testPerformance()

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

    if (warnings > 0) {
      console.log("\n⚠️ WARNINGS:")
      this.results
        .filter((r) => r.status === "warning")
        .forEach((result) => {
          console.log(`   • ${result.name}: ${result.message}`)
        })
    }

    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total
    console.log(`\n⏱️ Average response time: ${Math.round(avgDuration)}ms`)

    const slowTests = this.results.filter((r) => r.duration > 2000)
    if (slowTests.length > 0) {
      console.log(`\n🐌 Slow tests (>2s):`)
      slowTests.forEach((test) => {
        console.log(`   • ${test.name}: ${test.duration}ms`)
      })
    }

    console.log("\n" + "=".repeat(50))

    if (failed === 0 && warnings === 0) {
      console.log("🎉 All tests passed! Your application is working perfectly.")
    } else if (failed === 0) {
      console.log("✅ All tests passed with some warnings. Review above.")
    } else {
      console.log(`⚠️ ${failed} test(s) failed. Please review the issues above.`)
    }

    console.log("\n💡 Next Steps:")
    if (failed > 0) {
      console.log("   1. Fix the failed tests")
      console.log("   2. Check environment variables")
      console.log("   3. Verify database connections")
    }
    console.log("   • Visit /api/health for basic status")
    console.log("   • Visit /api/test for detailed component status")
    console.log("   • Check Vercel deployment logs for errors")
  }
}
