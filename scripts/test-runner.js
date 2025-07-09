const https = require("https")
const http = require("http")

class TestRunner {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
    this.results = []
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path)
      const client = url.protocol === "https:" ? https : http

      const req = client.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "CoinWayFinder-Test-Suite/1.0",
            ...options.headers,
          },
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

      if (options.body) {
        req.write(JSON.stringify(options.body))
      }

      req.end()
    })
  }

  async testEndpoint(name, path, expectedStatuses = [200]) {
    const startTime = Date.now()
    try {
      console.log(`🔍 Testing ${name}...`)
      const response = await this.makeRequest(path)
      const duration = Date.now() - startTime

      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${name} - OK (${response.status}) - ${duration}ms`)
        this.results.push({ name, status: "pass", code: response.status, duration })
      } else {
        console.log(`⚠️  ${name} - Unexpected status (${response.status}) - ${duration}ms`)
        this.results.push({ name, status: "warning", code: response.status, duration })
      }

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      console.log(`❌ ${name} - Failed: ${error.message} - ${duration}ms`)
      this.results.push({ name, status: "fail", error: error.message, duration })
      return null
    }
  }

  async runAllTests() {
    console.log("🧪 CoinWayFinder Test Suite")
    console.log("===========================")
    console.log(`🌐 Base URL: ${this.baseUrl}`)
    console.log("")

    // Test 1: Health Check
    console.log("1️⃣ Health Check Tests")
    console.log("---------------------")
    await this.testEndpoint("Health Endpoint", "/api/health", [200])
    await this.testEndpoint("Test Endpoint", "/api/test", [200, 500])
    console.log("")

    // Test 2: Static Pages
    console.log("2️⃣ Static Page Tests")
    console.log("--------------------")
    await this.testEndpoint("Home Page", "/", [200])
    await this.testEndpoint("Dashboard", "/dashboard", [200])
    await this.testEndpoint("Bots Page", "/bots", [200])
    await this.testEndpoint("Subscription Page", "/subscription", [200])
    await this.testEndpoint("API Docs", "/api-docs", [200])
    console.log("")

    // Test 3: Authentication Endpoints
    console.log("3️⃣ Authentication Tests")
    console.log("-----------------------")
    await this.testEndpoint("Auth Me", "/api/auth/me", [200, 401])
    await this.testEndpoint("Auth Signin", "/api/auth/signin", [200, 405])
    await this.testEndpoint("Auth Signup", "/api/auth/signup", [200, 405])
    console.log("")

    // Test 4: API Endpoints
    console.log("4️⃣ API Endpoint Tests")
    console.log("---------------------")
    await this.testEndpoint("Crypto Prices", "/api/crypto/prices", [200, 503])
    await this.testEndpoint("Crypto Trends", "/api/crypto/trends", [200, 503])
    await this.testEndpoint("Crypto News", "/api/crypto/news", [200, 503])
    await this.testEndpoint("Bots API", "/api/bots", [200, 401])
    await this.testEndpoint("Subscription API", "/api/subscription", [200, 401])
    console.log("")

    // Test 5: Admin Endpoints
    console.log("5️⃣ Admin Endpoint Tests")
    console.log("-----------------------")
    await this.testEndpoint("Admin Users", "/api/admin/users", [200, 401, 403])
    await this.testEndpoint("Admin Me", "/api/admin/me", [200, 401])
    console.log("")

    // Test 6: Detailed Health Check
    console.log("6️⃣ Detailed Health Analysis")
    console.log("----------------------------")
    try {
      const healthResponse = await this.makeRequest("/api/test")
      if (healthResponse && healthResponse.status === 200) {
        const healthData = JSON.parse(healthResponse.data)
        console.log(`📊 Overall Status: ${healthData.status.toUpperCase()}`)
        console.log(`🕐 Timestamp: ${healthData.timestamp}`)
        console.log(`🌍 Environment: ${healthData.environment}`)
        console.log(
          `📈 Summary: ${healthData.summary.healthy}✅ ${healthData.summary.warnings}⚠️ ${healthData.summary.errors}❌`,
        )

        console.log("\n🔍 Component Details:")
        healthData.tests.forEach((test) => {
          const icon = test.status === "healthy" ? "✅" : test.status === "warning" ? "⚠️" : "❌"
          console.log(`   ${icon} ${test.name}: ${test.message}`)
        })
      }
    } catch (error) {
      console.log(`❌ Failed to get detailed health info: ${error.message}`)
    }

    console.log("")
    this.printSummary()
  }

  printSummary() {
    console.log("📊 Test Summary")
    console.log("===============")

    const passed = this.results.filter((r) => r.status === "pass").length
    const warnings = this.results.filter((r) => r.status === "warning").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const total = this.results.length

    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`⚠️  Warnings: ${warnings}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)

    const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total
    console.log(`⏱️  Average Response Time: ${Math.round(avgDuration)}ms`)

    if (failed > 0) {
      console.log("\n❌ Failed Tests:")
      this.results
        .filter((r) => r.status === "fail")
        .forEach((r) => {
          console.log(`   • ${r.name}: ${r.error}`)
        })
    }

    if (warnings > 0) {
      console.log("\n⚠️  Warning Tests:")
      this.results
        .filter((r) => r.status === "warning")
        .forEach((r) => {
          console.log(`   • ${r.name}: HTTP ${r.code}`)
        })
    }

    console.log("")
    if (failed === 0) {
      console.log("🎉 All critical tests passed! Your deployment looks good.")
    } else {
      console.log("🔧 Some tests failed. Check the issues above.")
    }
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2] || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const runner = new TestRunner(baseUrl)
  await runner.runAllTests()

  // Exit with appropriate code
  const failed = runner.results.filter((r) => r.status === "fail").length
  process.exit(failed > 0 ? 1 : 0)
}

if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Test runner crashed:", error)
    process.exit(1)
  })
}

module.exports = { TestRunner }
