const https = require("https")
const http = require("http")

class TestRunner {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.results = []
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl)
      const protocol = url.protocol === "https:" ? https : http

      const req = protocol.request(
        url,
        {
          method: options.method || "GET",
          headers: options.headers || {},
          timeout: 10000,
          ...options,
        },
        (res) => {
          let data = ""
          res.on("data", (chunk) => (data += chunk))
          res.on("end", () => {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
            })
          })
        },
      )

      req.on("error", reject)
      req.on("timeout", () => reject(new Error("Request timeout")))

      if (options.body) {
        req.write(options.body)
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
      console.log(`✅ ${name} - PASSED (${duration}ms)`)
      this.results.push({ name, status: "pass", duration })
    } catch (error) {
      const duration = Date.now() - startTime
      console.log(`❌ ${name} - FAILED (${duration}ms): ${error.message}`)
      this.results.push({ name, status: "fail", duration, error: error.message })
    }
  }

  async testHealthEndpoint() {
    await this.runTest("Health Endpoint", async () => {
      const response = await this.makeRequest("/api/health")
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`)
      }

      const data = JSON.parse(response.data)
      if (!data.status) {
        throw new Error("Health response missing status field")
      }
    })
  }

  async testComprehensiveEndpoint() {
    await this.runTest("Comprehensive Test Endpoint", async () => {
      const response = await this.makeRequest("/api/test")
      if (response.status !== 200 && response.status !== 500) {
        throw new Error(`Expected 200 or 500, got ${response.status}`)
      }

      const data = JSON.parse(response.data)
      if (!data.tests || !Array.isArray(data.tests)) {
        throw new Error("Test response missing tests array")
      }

      console.log(`   📊 Found ${data.tests.length} component tests`)
      data.tests.forEach((test) => {
        const icon = test.status === "healthy" ? "✅" : test.status === "warning" ? "⚠️" : "❌"
        console.log(`   ${icon} ${test.name}: ${test.message}`)
      })
    })
  }

  async testStaticPages() {
    const pages = ["/", "/dashboard", "/bots", "/subscription", "/api-docs"]

    for (const page of pages) {
      await this.runTest(`Page: ${page}`, async () => {
        const response = await this.makeRequest(page)
        if (response.status !== 200) {
          throw new Error(`Expected 200, got ${response.status}`)
        }

        if (!response.data.includes("<!DOCTYPE html>") && !response.data.includes("<html")) {
          throw new Error("Response does not appear to be HTML")
        }
      })
    }
  }

  async testAPIEndpoints() {
    const endpoints = [
      { path: "/api/auth/signin", method: "POST", expectStatus: [400, 401] },
      { path: "/api/crypto/prices", method: "GET", expectStatus: [200, 503] },
      { path: "/api/bots", method: "GET", expectStatus: [200, 401] },
      { path: "/api/subscription", method: "GET", expectStatus: [200, 401] },
    ]

    for (const endpoint of endpoints) {
      await this.runTest(`API: ${endpoint.path}`, async () => {
        const options = {
          method: endpoint.method,
          headers: { "Content-Type": "application/json" },
        }

        if (endpoint.method === "POST") {
          options.body = JSON.stringify({ test: "data" })
        }

        const response = await this.makeRequest(endpoint.path, options)

        if (!endpoint.expectStatus.includes(response.status)) {
          throw new Error(`Expected ${endpoint.expectStatus.join(" or ")}, got ${response.status}`)
        }
      })
    }
  }

  async runAllTests() {
    console.log(`🌐 Testing application at: ${this.baseUrl}`)
    console.log("=" + "=".repeat(50))

    await this.testHealthEndpoint()
    await this.testComprehensiveEndpoint()
    await this.testStaticPages()
    await this.testAPIEndpoints()

    this.printSummary()
  }

  printSummary() {
    console.log("\n" + "=".repeat(50))
    console.log("📈 TEST SUMMARY")
    console.log("=".repeat(50))

    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const total = this.results.length

    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)

    if (failed > 0) {
      console.log("\n❌ FAILED TESTS:")
      this.results
        .filter((r) => r.status === "fail")
        .forEach((result) => {
          console.log(`   • ${result.name}: ${result.error}`)
        })
    }

    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total
    console.log(`⏱️ Average response time: ${Math.round(avgDuration)}ms`)

    if (failed === 0) {
      console.log("\n🎉 All tests passed! Your application is working correctly.")
    } else {
      console.log(`\n⚠️ ${failed} test(s) failed. Please review the issues above.`)
    }
  }
}

// Run the tests
async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const runner = new TestRunner(baseUrl)

  try {
    await runner.runAllTests()
  } catch (error) {
    console.error("💥 Test runner failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = TestRunner
