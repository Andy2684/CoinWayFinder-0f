interface SystemTestConfig {
  baseUrl: string
  timeout: number
  retries: number
  verbose: boolean
}

interface SystemTestResult {
  category: string
  tests: Array<{
    name: string
    status: "pass" | "fail" | "warning"
    message: string
    duration: number
    details?: any
  }>
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
}

class FullSystemTester {
  private config: SystemTestConfig
  private results: SystemTestResult[] = []

  constructor(baseUrl?: string) {
    this.config = {
      baseUrl: baseUrl || this.determineBaseUrl(),
      timeout: 30000,
      retries: 3,
      verbose: true,
    }
  }

  private determineBaseUrl(): string {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL
    }
    return "http://localhost:3000"
  }

  private async makeRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.config.baseUrl}${path}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "User-Agent": "CoinWayFinder-SystemTest/1.0",
          Accept: "application/json",
          ...options.headers,
        },
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private async runTestCategory(
    categoryName: string,
    testFunctions: Array<() => Promise<any>>,
  ): Promise<SystemTestResult> {
    console.log(`\n🧪 Running ${categoryName} Tests`)
    console.log("=".repeat(50))

    const tests: SystemTestResult["tests"] = []

    for (const testFn of testFunctions) {
      const startTime = Date.now()
      try {
        const result = await testFn()
        const duration = Date.now() - startTime

        tests.push({
          name: result.name,
          status: result.status || "pass",
          message: result.message || "Test completed successfully",
          duration,
          details: result.details,
        })

        const icon = result.status === "pass" ? "✅" : result.status === "warning" ? "⚠️" : "❌"
        console.log(`${icon} ${result.name} (${duration}ms)`)
        if (this.config.verbose && result.details) {
          console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
        }
      } catch (error) {
        const duration = Date.now() - startTime
        const message = error instanceof Error ? error.message : "Unknown error"

        tests.push({
          name: "Unknown Test",
          status: "fail",
          message,
          duration,
          details: { error: message },
        })

        console.log(`❌ Test failed (${duration}ms): ${message}`)
      }
    }

    const summary = {
      total: tests.length,
      passed: tests.filter((t) => t.status === "pass").length,
      failed: tests.filter((t) => t.status === "fail").length,
      warnings: tests.filter((t) => t.status === "warning").length,
    }

    const result: SystemTestResult = {
      category: categoryName,
      tests,
      summary,
    }

    this.results.push(result)

    console.log(
      `📊 ${categoryName} Summary: ${summary.passed}/${summary.total} passed, ${summary.warnings} warnings, ${summary.failed} failed`,
    )

    return result
  }

  // Infrastructure Tests
  private async testServerHealth() {
    const response = await this.makeRequest("/api/health")
    const data = await response.json()

    return {
      name: "Server Health Check",
      status: response.ok ? "pass" : "fail",
      message: response.ok ? `Server is ${data.status}` : `Server health check failed (${response.status})`,
      details: data,
    }
  }

  private async testDatabaseConnection() {
    const response = await this.makeRequest("/api/test")
    const data = await response.json()

    const dbTest = data.tests?.find((t: any) => t.name.toLowerCase().includes("database"))

    return {
      name: "Database Connection",
      status: dbTest?.status === "healthy" ? "pass" : dbTest?.status === "warning" ? "warning" : "fail",
      message: dbTest?.message || "Database test not found",
      details: dbTest?.details,
    }
  }

  private async testRedisConnection() {
    const response = await this.makeRequest("/api/test")
    const data = await response.json()

    const redisTest = data.tests?.find((t: any) => t.name.toLowerCase().includes("redis"))

    return {
      name: "Redis Connection",
      status: redisTest?.status === "healthy" ? "pass" : redisTest?.status === "warning" ? "warning" : "fail",
      message: redisTest?.message || "Redis test not found",
      details: redisTest?.details,
    }
  }

  private async testEnvironmentVariables() {
    const response = await this.makeRequest("/api/test")
    const data = await response.json()

    const envTest = data.tests?.find((t: any) => t.name.toLowerCase().includes("environment"))

    return {
      name: "Environment Variables",
      status: envTest?.status === "healthy" ? "pass" : envTest?.status === "warning" ? "warning" : "fail",
      message: envTest?.message || "Environment test not found",
      details: envTest?.details,
    }
  }

  // Frontend Tests
  private async testHomePage() {
    const response = await this.makeRequest("/")
    const content = await response.text()

    const hasTitle = content.includes("CoinWayFinder") || content.includes("Crypto Trading")
    const hasNavigation = content.includes("nav") || content.includes("Navigation")
    const hasFooter = content.includes("footer") || content.includes("Footer")

    return {
      name: "Home Page",
      status: response.ok && hasTitle ? "pass" : "fail",
      message: response.ok ? "Home page loads correctly" : `Failed to load (${response.status})`,
      details: {
        statusCode: response.status,
        hasTitle,
        hasNavigation,
        hasFooter,
        contentLength: content.length,
      },
    }
  }

  private async testDashboardPage() {
    const response = await this.makeRequest("/dashboard")
    const content = await response.text()

    return {
      name: "Dashboard Page",
      status: response.ok ? "pass" : "fail",
      message: response.ok ? "Dashboard page loads correctly" : `Failed to load (${response.status})`,
      details: {
        statusCode: response.status,
        contentLength: content.length,
        hasReactRoot: content.includes("__next") || content.includes("react"),
      },
    }
  }

  private async testBotsPage() {
    const response = await this.makeRequest("/bots")
    const content = await response.text()

    return {
      name: "Bots Page",
      status: response.ok ? "pass" : "fail",
      message: response.ok ? "Bots page loads correctly" : `Failed to load (${response.status})`,
      details: {
        statusCode: response.status,
        contentLength: content.length,
      },
    }
  }

  private async testSubscriptionPage() {
    const response = await this.makeRequest("/subscription")
    const content = await response.text()

    return {
      name: "Subscription Page",
      status: response.ok ? "pass" : "fail",
      message: response.ok ? "Subscription page loads correctly" : `Failed to load (${response.status})`,
      details: {
        statusCode: response.status,
        contentLength: content.length,
      },
    }
  }

  private async testAPIDocsPage() {
    const response = await this.makeRequest("/api-docs")
    const content = await response.text()

    return {
      name: "API Documentation Page",
      status: response.ok ? "pass" : "fail",
      message: response.ok ? "API docs page loads correctly" : `Failed to load (${response.status})`,
      details: {
        statusCode: response.status,
        contentLength: content.length,
      },
    }
  }

  // API Tests
  private async testAuthSignupAPI() {
    const response = await this.makeRequest("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpass123",
        username: "testuser",
      }),
    })

    const expectedStatuses = [201, 400, 409, 422] // Created, Bad Request, Conflict, Validation Error
    const isExpected = expectedStatuses.includes(response.status)

    return {
      name: "Auth Signup API",
      status: isExpected ? "pass" : "fail",
      message: isExpected ? `API responds correctly (${response.status})` : `Unexpected status (${response.status})`,
      details: {
        statusCode: response.status,
        expectedStatuses,
      },
    }
  }

  private async testAuthSigninAPI() {
    const response = await this.makeRequest("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpass123",
      }),
    })

    const expectedStatuses = [200, 400, 401, 422] // OK, Bad Request, Unauthorized, Validation Error
    const isExpected = expectedStatuses.includes(response.status)

    return {
      name: "Auth Signin API",
      status: isExpected ? "pass" : "fail",
      message: isExpected ? `API responds correctly (${response.status})` : `Unexpected status (${response.status})`,
      details: {
        statusCode: response.status,
        expectedStatuses,
      },
    }
  }

  private async testCryptoPricesAPI() {
    const response = await this.makeRequest("/api/crypto/prices")

    const expectedStatuses = [200, 401, 503] // OK, Unauthorized, Service Unavailable
    const isExpected = expectedStatuses.includes(response.status)

    return {
      name: "Crypto Prices API",
      status: isExpected ? "pass" : "fail",
      message: isExpected ? `API responds correctly (${response.status})` : `Unexpected status (${response.status})`,
      details: {
        statusCode: response.status,
        expectedStatuses,
      },
    }
  }

  private async testCryptoTrendsAPI() {
    const response = await this.makeRequest("/api/crypto/trends")

    const expectedStatuses = [200, 401, 503] // OK, Unauthorized, Service Unavailable
    const isExpected = expectedStatuses.includes(response.status)

    return {
      name: "Crypto Trends API",
      status: isExpected ? "pass" : "fail",
      message: isExpected ? `API responds correctly (${response.status})` : `Unexpected status (${response.status})`,
      details: {
        statusCode: response.status,
        expectedStatuses,
      },
    }
  }

  private async testBotsAPI() {
    const response = await this.makeRequest("/api/bots")

    const expectedStatuses = [200, 401] // OK, Unauthorized
    const isExpected = expectedStatuses.includes(response.status)

    return {
      name: "Bots API",
      status: isExpected ? "pass" : "fail",
      message: isExpected ? `API responds correctly (${response.status})` : `Unexpected status (${response.status})`,
      details: {
        statusCode: response.status,
        expectedStatuses,
      },
    }
  }

  private async testSubscriptionAPI() {
    const response = await this.makeRequest("/api/subscription")

    const expectedStatuses = [200, 401] // OK, Unauthorized
    const isExpected = expectedStatuses.includes(response.status)

    return {
      name: "Subscription API",
      status: isExpected ? "pass" : "fail",
      message: isExpected ? `API responds correctly (${response.status})` : `Unexpected status (${response.status})`,
      details: {
        statusCode: response.status,
        expectedStatuses,
      },
    }
  }

  private async testNewsAPI() {
    const response = await this.makeRequest("/api/news")

    const expectedStatuses = [200, 401, 503] // OK, Unauthorized, Service Unavailable
    const isExpected = expectedStatuses.includes(response.status)

    return {
      name: "News API",
      status: isExpected ? "pass" : "fail",
      message: isExpected ? `API responds correctly (${response.status})` : `Unexpected status (${response.status})`,
      details: {
        statusCode: response.status,
        expectedStatuses,
      },
    }
  }

  private async testWhalesAPI() {
    const response = await this.makeRequest("/api/whales")

    const expectedStatuses = [200, 401, 503] // OK, Unauthorized, Service Unavailable
    const isExpected = expectedStatuses.includes(response.status)

    return {
      name: "Whale Alerts API",
      status: isExpected ? "pass" : "fail",
      message: isExpected ? `API responds correctly (${response.status})` : `Unexpected status (${response.status})`,
      details: {
        statusCode: response.status,
        expectedStatuses,
      },
    }
  }

  // Performance Tests
  private async testPageLoadTimes() {
    const pages = ["/", "/dashboard", "/bots", "/subscription"]
    const results = []

    for (const page of pages) {
      const startTime = Date.now()
      const response = await this.makeRequest(page)
      const loadTime = Date.now() - startTime

      results.push({
        page,
        loadTime,
        status: response.status,
      })
    }

    const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length
    const slowPages = results.filter((r) => r.loadTime > 3000)

    return {
      name: "Page Load Performance",
      status: avgLoadTime < 2000 ? "pass" : avgLoadTime < 5000 ? "warning" : "fail",
      message: `Average load time: ${Math.round(avgLoadTime)}ms`,
      details: {
        averageLoadTime: avgLoadTime,
        results,
        slowPages,
      },
    }
  }

  private async testAPIResponseTimes() {
    const endpoints = ["/api/health", "/api/test", "/api/crypto/prices", "/api/bots"]
    const results = []

    for (const endpoint of endpoints) {
      const startTime = Date.now()
      try {
        const response = await this.makeRequest(endpoint)
        const responseTime = Date.now() - startTime

        results.push({
          endpoint,
          responseTime,
          status: response.status,
        })
      } catch (error) {
        results.push({
          endpoint,
          responseTime: Date.now() - startTime,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
    const slowEndpoints = results.filter((r) => r.responseTime > 2000)

    return {
      name: "API Response Performance",
      status: avgResponseTime < 1000 ? "pass" : avgResponseTime < 3000 ? "warning" : "fail",
      message: `Average response time: ${Math.round(avgResponseTime)}ms`,
      details: {
        averageResponseTime: avgResponseTime,
        results,
        slowEndpoints,
      },
    }
  }

  // Security Tests
  private async testSecurityHeaders() {
    const response = await this.makeRequest("/")
    const headers = response.headers

    const securityHeaders = {
      "x-frame-options": headers.get("x-frame-options"),
      "x-content-type-options": headers.get("x-content-type-options"),
      "x-xss-protection": headers.get("x-xss-protection"),
      "strict-transport-security": headers.get("strict-transport-security"),
      "content-security-policy": headers.get("content-security-policy"),
    }

    const presentHeaders = Object.entries(securityHeaders).filter(([_, value]) => value !== null)
    const missingHeaders = Object.entries(securityHeaders).filter(([_, value]) => value === null)

    return {
      name: "Security Headers",
      status: presentHeaders.length >= 3 ? "pass" : presentHeaders.length >= 1 ? "warning" : "fail",
      message: `${presentHeaders.length}/5 security headers present`,
      details: {
        presentHeaders: Object.fromEntries(presentHeaders),
        missingHeaders: missingHeaders.map(([key]) => key),
      },
    }
  }

  private async testRateLimiting() {
    // Test rate limiting by making multiple rapid requests
    const requests = []
    const endpoint = "/api/health"

    for (let i = 0; i < 10; i++) {
      requests.push(this.makeRequest(endpoint))
    }

    const responses = await Promise.all(requests)
    const rateLimited = responses.some((r) => r.status === 429)
    const allSuccessful = responses.every((r) => r.ok)

    return {
      name: "Rate Limiting",
      status: rateLimited ? "pass" : allSuccessful ? "warning" : "fail",
      message: rateLimited
        ? "Rate limiting is active"
        : allSuccessful
          ? "No rate limiting detected"
          : "Some requests failed",
      details: {
        totalRequests: requests.length,
        successfulRequests: responses.filter((r) => r.ok).length,
        rateLimitedRequests: responses.filter((r) => r.status === 429).length,
        statusCodes: responses.map((r) => r.status),
      },
    }
  }

  // Integration Tests
  private async testExternalAPIConnectivity() {
    const externalAPIs = [
      { name: "CoinGecko", url: "https://api.coingecko.com/api/v3/ping" },
      { name: "CoinMarketCap", url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest" },
    ]

    const results = []

    for (const api of externalAPIs) {
      try {
        const startTime = Date.now()
        const response = await fetch(api.url, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        })
        const responseTime = Date.now() - startTime

        results.push({
          name: api.name,
          status: response.ok ? "pass" : "warning",
          responseTime,
          statusCode: response.status,
        })
      } catch (error) {
        results.push({
          name: api.name,
          status: "fail",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const workingAPIs = results.filter((r) => r.status === "pass").length
    const totalAPIs = results.length

    return {
      name: "External API Connectivity",
      status: workingAPIs === totalAPIs ? "pass" : workingAPIs > 0 ? "warning" : "fail",
      message: `${workingAPIs}/${totalAPIs} external APIs accessible`,
      details: { results },
    }
  }

  // Main test execution
  async runFullSystemTest(): Promise<void> {
    console.log("🚀 CoinWayFinder Full System Test Suite")
    console.log("=" + "=".repeat(50))
    console.log(`🌐 Target URL: ${this.config.baseUrl}`)
    console.log(`⏱️ Timeout: ${this.config.timeout}ms`)
    console.log(`🔄 Retries: ${this.config.retries}`)
    console.log("=" + "=".repeat(50))

    const startTime = Date.now()

    try {
      // Run all test categories
      await this.runTestCategory("Infrastructure", [
        () => this.testServerHealth(),
        () => this.testDatabaseConnection(),
        () => this.testRedisConnection(),
        () => this.testEnvironmentVariables(),
      ])

      await this.runTestCategory("Frontend Pages", [
        () => this.testHomePage(),
        () => this.testDashboardPage(),
        () => this.testBotsPage(),
        () => this.testSubscriptionPage(),
        () => this.testAPIDocsPage(),
      ])

      await this.runTestCategory("API Endpoints", [
        () => this.testAuthSignupAPI(),
        () => this.testAuthSigninAPI(),
        () => this.testCryptoPricesAPI(),
        () => this.testCryptoTrendsAPI(),
        () => this.testBotsAPI(),
        () => this.testSubscriptionAPI(),
        () => this.testNewsAPI(),
        () => this.testWhalesAPI(),
      ])

      await this.runTestCategory("Performance", [() => this.testPageLoadTimes(), () => this.testAPIResponseTimes()])

      await this.runTestCategory("Security", [() => this.testSecurityHeaders(), () => this.testRateLimiting()])

      await this.runTestCategory("Integration", [() => this.testExternalAPIConnectivity()])

      // Print final results
      this.printFinalResults(Date.now() - startTime)
    } catch (error) {
      console.error("❌ System test execution failed:", error)
      process.exit(1)
    }
  }

  private printFinalResults(totalDuration: number): void {
    console.log("\n" + "=".repeat(70))
    console.log("📊 FULL SYSTEM TEST RESULTS")
    console.log("=".repeat(70))

    let totalTests = 0
    let totalPassed = 0
    let totalFailed = 0
    let totalWarnings = 0

    this.results.forEach((category) => {
      totalTests += category.summary.total
      totalPassed += category.summary.passed
      totalFailed += category.summary.failed
      totalWarnings += category.summary.warnings

      const status = category.summary.failed > 0 ? "❌" : category.summary.warnings > 0 ? "⚠️" : "✅"
      console.log(`${status} ${category.category}: ${category.summary.passed}/${category.summary.total} passed`)
    })

    console.log("\n" + "-".repeat(70))
    console.log(`📈 OVERALL SUMMARY`)
    console.log(`   Total Tests: ${totalTests}`)
    console.log(`   ✅ Passed: ${totalPassed} (${Math.round((totalPassed / totalTests) * 100)}%)`)
    console.log(`   ⚠️ Warnings: ${totalWarnings} (${Math.round((totalWarnings / totalTests) * 100)}%)`)
    console.log(`   ❌ Failed: ${totalFailed} (${Math.round((totalFailed / totalTests) * 100)}%)`)
    console.log(`   ⏱️ Total Duration: ${Math.round(totalDuration / 1000)}s`)

    if (totalFailed > 0) {
      console.log("\n❌ CRITICAL ISSUES:")
      this.results.forEach((category) => {
        const failedTests = category.tests.filter((t) => t.status === "fail")
        failedTests.forEach((test) => {
          console.log(`   • ${category.category} - ${test.name}: ${test.message}`)
        })
      })
    }

    if (totalWarnings > 0) {
      console.log("\n⚠️ WARNINGS:")
      this.results.forEach((category) => {
        const warningTests = category.tests.filter((t) => t.status === "warning")
        warningTests.forEach((test) => {
          console.log(`   • ${category.category} - ${test.name}: ${test.message}`)
        })
      })
    }

    console.log("\n💡 RECOMMENDATIONS:")
    if (totalFailed === 0 && totalWarnings === 0) {
      console.log("   🎉 Excellent! Your application is fully functional and ready for production.")
      console.log("   📊 Consider setting up monitoring and analytics for ongoing health checks.")
    } else if (totalFailed === 0) {
      console.log("   ✅ Your application is functional with some minor improvements needed.")
      console.log("   🔧 Address the warnings above to optimize performance and security.")
    } else {
      console.log("   🚨 Critical issues detected. Fix failed tests before deploying to production.")
      console.log("   🔧 Address failed tests first, then warnings for optimal performance.")
    }

    console.log("\n📋 NEXT STEPS:")
    console.log("   1. Review detailed test results above")
    console.log("   2. Fix any critical failures")
    console.log("   3. Address warnings for better performance")
    console.log("   4. Run tests again to verify fixes")
    console.log("   5. Deploy to production when all tests pass")

    console.log("\n🔗 USEFUL LINKS:")
    console.log(`   • Health Check: ${this.config.baseUrl}/api/health`)
    console.log(`   • System Test: ${this.config.baseUrl}/api/test`)
    console.log(`   • API Documentation: ${this.config.baseUrl}/api-docs`)

    console.log("\n" + "=".repeat(70))

    // Exit with appropriate code
    if (totalFailed > 0) {
      console.log("🚨 System test completed with failures.")
      process.exit(1)
    } else if (totalWarnings > 0) {
      console.log("⚠️ System test completed with warnings.")
      process.exit(0)
    } else {
      console.log("🎉 System test completed successfully!")
      process.exit(0)
    }
  }
}

// Execute the full system test
async function main() {
  const baseUrl = process.argv[2]
  const tester = new FullSystemTester(baseUrl)
  await tester.runFullSystemTest()
}

if (require.main === module) {
  main().catch(console.error)
}

export { FullSystemTester }
