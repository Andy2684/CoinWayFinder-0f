import https from "https"
import http from "http"

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

  private async makeRequest(path: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path)
      const client = url.protocol === "https:" ? https : http

      const requestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "CoinWayFinder-DeploymentTest/1.0",
          ...options.headers,
        },
        timeout: 10000,
      }

      const req = client.request(requestOptions, (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          try {
            const parsedData = data.startsWith("{") || data.startsWith("[") ? JSON.parse(data) : data
            resolve({
              status: res.statusCode,
              data: parsedData,
              headers: res.headers,
            })
          } catch (error) {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers,
            })
          }
        })
      })

      req.on("error", reject)
      req.on("timeout", () => reject(new Error("Request timeout")))

      if (options.body) {
        req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body))
      }

      req.end()
    })
  }

  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now()

    try {
      const result = await testFn()
      const duration = Date.now() - startTime

      const testResult: TestResult = {
        name,
        status: result.status || "pass",
        message: result.message || "Test completed successfully",
        duration,
        details: result.details,
      }

      this.results.push(testResult)
      return testResult
    } catch (error) {
      const duration = Date.now() - startTime
      const message = error instanceof Error ? error.message : "Unknown error"

      const testResult: TestResult = {
        name,
        status: "fail",
        message,
        duration,
        details: { error: message },
      }

      this.results.push(testResult)
      return testResult
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

      return {
        status: "pass",
        message: `Server is ${response.data.status}`,
        details: response.data,
      }
    })
  }

  async testSystemEndpoint(): Promise<TestResult> {
    return this.runTest("System Test Endpoint", async () => {
      const response = await this.makeRequest("/api/test")

      if (response.status !== 200 && response.status !== 500) {
        throw new Error(`Expected 200 or 500, got ${response.status}`)
      }

      if (!response.data.tests || !Array.isArray(response.data.tests)) {
        throw new Error("Test response missing tests array")
      }

      const healthyTests = response.data.tests.filter((t: any) => t.status === "healthy").length
      const totalTests = response.data.tests.length

      return {
        status: healthyTests === totalTests ? "pass" : healthyTests > 0 ? "warning" : "fail",
        message: `${healthyTests}/${totalTests} system components healthy`,
        details: response.data,
      }
    })
  }

  async testFrontendPages(): Promise<TestResult[]> {
    const pages = [
      { path: "/", name: "Home Page" },
      { path: "/dashboard", name: "Dashboard" },
      { path: "/bots", name: "Bots Page" },
      { path: "/subscription", name: "Subscription Page" },
      { path: "/api-docs", name: "API Documentation" },
    ]

    const results: TestResult[] = []

    for (const page of pages) {
      const result = await this.runTest(page.name, async () => {
        const response = await this.makeRequest(page.path)

        if (response.status !== 200) {
          throw new Error(`Expected 200, got ${response.status}`)
        }

        const content = typeof response.data === "string" ? response.data : JSON.stringify(response.data)

        if (!content.includes("<!DOCTYPE html>") && !content.includes("<html")) {
          throw new Error("Response does not appear to be HTML")
        }

        return {
          status: "pass",
          message: "Page loads correctly",
          details: {
            statusCode: response.status,
            contentLength: content.length,
          },
        }
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
        body: { email: "test@example.com", password: "testpass" },
        expectedStatuses: [400, 401, 422],
        name: "Auth Signin API",
      },
      {
        path: "/api/crypto/prices",
        method: "GET",
        expectedStatuses: [200, 401, 503],
        name: "Crypto Prices API",
      },
      {
        path: "/api/bots",
        method: "GET",
        expectedStatuses: [200, 401],
        name: "Bots API",
      },
      {
        path: "/api/subscription",
        method: "GET",
        expectedStatuses: [200, 401],
        name: "Subscription API",
      },
    ]

    const results: TestResult[] = []

    for (const endpoint of endpoints) {
      const result = await this.runTest(endpoint.name, async () => {
        const options: any = { method: endpoint.method }
        if (endpoint.body) {
          options.body = endpoint.body
        }

        const response = await this.makeRequest(endpoint.path, options)

        if (!endpoint.expectedStatuses.includes(response.status)) {
          throw new Error(`Expected ${endpoint.expectedStatuses.join(" or ")}, got ${response.status}`)
        }

        return {
          status: "pass",
          message: `API responds correctly (${response.status})`,
          details: {
            statusCode: response.status,
            expectedStatuses: endpoint.expectedStatuses,
          },
        }
      })

      results.push(result)
    }

    return results
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log(`🌐 Testing deployment at: ${this.baseUrl}`)
    console.log("=".repeat(50))

    // Run all test categories
    await this.testHealthEndpoint()
    await this.testSystemEndpoint()
    await this.testFrontendPages()
    await this.testAPIEndpoints()

    return this.results
  }

  printResults(): void {
    console.log("\n" + "=".repeat(50))
    console.log("📊 DEPLOYMENT TEST RESULTS")
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

    console.log("\n" + "=".repeat(50))

    if (failed === 0 && warnings === 0) {
      console.log("🎉 All tests passed! Deployment is healthy.")
    } else if (failed === 0) {
      console.log("✅ Deployment is functional with some warnings.")
    } else {
      console.log("🚨 Deployment has critical issues that need attention.")
    }
  }
}
