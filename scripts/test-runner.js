const https = require("https")
const http = require("http")
const { URL } = require("url")

class TestRunner {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
    this.results = []
  }

  async makeRequest(path, options = {}) {
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
          "User-Agent": "CoinWayFinder-TestRunner/1.0",
          ...options.headers,
        },
      }

      const req = client.request(requestOptions, (res) => {
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

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

      req.on("error", (error) => {
        reject(error)
      })

      if (options.body) {
        req.write(JSON.stringify(options.body))
      }

      req.end()
    })
  }

  async runTest(name, testFn) {
    const startTime = Date.now()
    console.log(`🧪 Testing: ${name}`)

    try {
      await testFn()
      const duration = Date.now() - startTime
      const result = {
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
      const message = error.message || "Unknown error"
      const result = {
        name,
        status: "fail",
        message,
        duration,
        error: error,
      }
      console.log(`❌ ${name} - FAILED (${duration}ms): ${message}`)
      this.results.push(result)
      return result
    }
  }

  async testHealthEndpoint() {
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

  async testStaticPages() {
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

    const results = []

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

  async testAPIEndpoints() {
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

    const results = []

    for (const endpoint of endpoints) {
      const result = await this.runTest(`API Endpoint: ${endpoint.path}`, async () => {
        const options = {
          method: endpoint.method,
        }

        if (endpoint.body) {
          options.body = endpoint.body
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

  async runAllTests() {
    console.log(`🌐 Testing application at: ${this.baseUrl}`)
    console.log("=" + "=".repeat(50))

    await this.testHealthEndpoint()
    await this.testStaticPages()
    await this.testAPIEndpoints()

    return this.results
  }

  printResults() {
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

    console.log("\n" + "=".repeat(50))

    if (failed === 0) {
      console.log("🎉 All tests passed! Your application is working perfectly.")
    } else {
      console.log(`⚠️ ${failed} test(s) failed. Please review the issues above.`)
    }
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const runner = new TestRunner(baseUrl)

  try {
    await runner.runAllTests()
    runner.printResults()

    const failed = runner.results.filter((r) => r.status === "fail").length
    process.exit(failed > 0 ? 1 : 0)
  } catch (error) {
    console.error("❌ Test execution failed:", error)
    process.exit(1)
  }
}

// Handle command line arguments
if (process.argv.length > 2) {
  process.env.NEXT_PUBLIC_BASE_URL = process.argv[2]
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { TestRunner }
