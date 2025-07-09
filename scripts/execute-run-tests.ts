#!/usr/bin/env tsx

import { spawn } from "child_process"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { DeploymentTester } from "./test-deployment"

interface TestExecutionConfig {
  baseUrl: string
  timeout: number
  retries: number
  verbose: boolean
}

class TestExecutor {
  private config: TestExecutionConfig
  private tester: DeploymentTester

  constructor(config: Partial<TestExecutionConfig> = {}) {
    this.config = {
      baseUrl: this.determineBaseUrl(),
      timeout: 30000,
      retries: 3,
      verbose: true,
      ...config,
    }

    this.tester = new DeploymentTester(this.config.baseUrl)
  }

  private determineBaseUrl(): string {
    // Priority order: command line arg > VERCEL_URL > NEXT_PUBLIC_BASE_URL > localhost
    if (process.argv.length > 2) {
      return process.argv[2]
    }

    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }

    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL
    }

    return "http://localhost:3000"
  }

  private async waitForApplication(maxAttempts = 10): Promise<boolean> {
    console.log("🔍 Checking if application is accessible...")

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/health`, {
          method: "GET",
          headers: {
            "User-Agent": "CoinWayFinder-TestExecutor/1.0",
          },
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          console.log(`✅ Application is accessible (attempt ${attempt}/${maxAttempts})`)
          return true
        }

        console.log(`⏳ Attempt ${attempt}/${maxAttempts} failed with status ${response.status}`)
      } catch (error) {
        console.log(
          `⏳ Attempt ${attempt}/${maxAttempts} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }

      if (attempt < maxAttempts) {
        console.log("   Waiting 3 seconds before retry...")
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }

    console.log("❌ Application is not accessible after maximum attempts")
    return false
  }

  private async preFlightChecks(): Promise<boolean> {
    console.log("🚀 Running pre-flight checks...")

    // Check if URL is valid
    try {
      new URL(this.config.baseUrl)
    } catch (error) {
      console.error(`❌ Invalid base URL: ${this.config.baseUrl}`)
      return false
    }

    // Check if application is accessible
    const isAccessible = await this.waitForApplication()
    if (!isAccessible) {
      return false
    }

    // Check environment
    const environment = process.env.NODE_ENV || "development"
    console.log(`🌍 Environment: ${environment}`)

    if (this.config.baseUrl.includes("localhost")) {
      console.log("🏠 Testing local development server")
    } else if (this.config.baseUrl.includes("vercel.app")) {
      console.log("☁️ Testing Vercel deployment")
    } else {
      console.log("🌐 Testing custom deployment")
    }

    return true
  }

  private async runTestSuite(): Promise<void> {
    console.log("\n🧪 Starting comprehensive test suite...")
    console.log("=" + "=".repeat(60))

    const startTime = Date.now()

    try {
      // Run all tests
      const results = await this.tester.runAllTests()

      const endTime = Date.now()
      const totalDuration = endTime - startTime

      console.log(`\n⏱️ Total execution time: ${totalDuration}ms`)

      // Print results
      this.tester.printResults()

      // Analyze results
      this.analyzeResults(results)
    } catch (error) {
      console.error("❌ Test suite execution failed:", error)
      throw error
    }
  }

  private analyzeResults(results: any[]): void {
    const passed = results.filter((r) => r.status === "pass").length
    const failed = results.filter((r) => r.status === "fail").length
    const warnings = results.filter((r) => r.status === "warning").length

    console.log("\n📊 ANALYSIS & RECOMMENDATIONS")
    console.log("=" + "=".repeat(40))

    if (failed === 0 && warnings === 0) {
      console.log("🎉 EXCELLENT! Your application is fully functional.")
      console.log("\n✅ Ready for:")
      console.log("   • Production deployment")
      console.log("   • User registration")
      console.log("   • Trading bot operations")
      console.log("   • Payment processing")
      console.log("   • API access")
    } else if (failed === 0) {
      console.log("✅ GOOD! Your application is working with minor issues.")
      console.log("\n⚠️ Recommendations:")
      console.log("   • Review warning messages above")
      console.log("   • Configure optional services for full functionality")
      console.log("   • Monitor performance in production")
    } else {
      console.log("🚨 ISSUES DETECTED! Your application has critical problems.")
      console.log("\n🔧 Required Actions:")
      console.log("   • Fix all failed tests before deployment")
      console.log("   • Check environment variable configuration")
      console.log("   • Verify database and external service connections")
      console.log("   • Review application logs for errors")
    }

    // Performance analysis
    const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length
    if (avgResponseTime > 2000) {
      console.log("\n🐌 PERFORMANCE WARNING:")
      console.log(`   Average response time: ${Math.round(avgResponseTime)}ms`)
      console.log("   Consider optimizing slow endpoints")
    }

    // Specific recommendations based on failures
    const failedTests = results.filter((r) => r.status === "fail")
    if (failedTests.length > 0) {
      console.log("\n🎯 SPECIFIC ISSUES TO FIX:")
      failedTests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.name}: ${test.message}`)
      })
    }
  }

  private generateReport(results: any[]): void {
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.config.baseUrl,
      environment: process.env.NODE_ENV || "development",
      summary: {
        total: results.length,
        passed: results.filter((r) => r.status === "pass").length,
        failed: results.filter((r) => r.status === "fail").length,
        warnings: results.filter((r) => r.status === "warning").length,
      },
      results: results,
      recommendations: this.generateRecommendations(results),
    }

    // Save report to file (optional)
    try {
      const fs = require("fs")
      const reportPath = `test-report-${Date.now()}.json`
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      console.log(`\n📄 Detailed report saved to: ${reportPath}`)
    } catch (error) {
      console.log("\n📄 Report generation skipped (file system not available)")
    }
  }

  private generateRecommendations(results: any[]): string[] {
    const recommendations: string[] = []
    const failed = results.filter((r) => r.status === "fail")
    const warnings = results.filter((r) => r.status === "warning")

    if (failed.length > 0) {
      recommendations.push("Fix all failing tests before production deployment")
      recommendations.push("Check environment variables in Vercel dashboard")
      recommendations.push("Verify database connection strings")
    }

    if (warnings.length > 0) {
      recommendations.push("Configure optional services for full functionality")
      recommendations.push("Review warning messages for optimization opportunities")
    }

    const slowTests = results.filter((r) => r.duration > 2000)
    if (slowTests.length > 0) {
      recommendations.push("Optimize slow endpoints for better user experience")
    }

    if (recommendations.length === 0) {
      recommendations.push("Your application is ready for production!")
      recommendations.push("Consider setting up monitoring and analytics")
      recommendations.push("Implement automated testing in CI/CD pipeline")
    }

    return recommendations
  }

  async execute(): Promise<void> {
    console.log("🚀 CoinWayFinder Test Execution Engine")
    console.log("=" + "=".repeat(50))
    console.log(`🌐 Target URL: ${this.config.baseUrl}`)
    console.log(`⏱️ Timeout: ${this.config.timeout}ms`)
    console.log(`🔄 Retries: ${this.config.retries}`)

    try {
      // Pre-flight checks
      const preFlightPassed = await this.preFlightChecks()
      if (!preFlightPassed) {
        throw new Error("Pre-flight checks failed")
      }

      // Run test suite
      await this.runTestSuite()

      // Generate report
      this.generateReport(this.tester.results || [])

      // Determine exit code
      const failed = (this.tester.results || []).filter((r) => r.status === "fail").length
      const warnings = (this.tester.results || []).filter((r) => r.status === "warning").length

      if (failed > 0) {
        console.log("\n🚨 EXECUTION FAILED - Critical issues detected")
        process.exit(1)
      } else if (warnings > 0) {
        console.log("\n⚠️ EXECUTION COMPLETED - With warnings")
        process.exit(0)
      } else {
        console.log("\n🎉 EXECUTION SUCCESSFUL - All tests passed")
        process.exit(0)
      }
    } catch (error) {
      console.error("\n❌ EXECUTION FAILED:", error instanceof Error ? error.message : "Unknown error")
      console.error("\n🔧 Troubleshooting:")
      console.error("   • Ensure the application is running")
      console.error("   • Check network connectivity")
      console.error("   • Verify environment variables")
      console.error("   • Review application logs")
      process.exit(1)
    }
  }
}

// Main execution
async function executeRunTests() {
  console.log("🔧 CoinWayFinder Test Suite Executor")
  console.log("=" + "=".repeat(50))

  const baseUrl = process.argv[2] || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  console.log(`🌐 Target URL: ${baseUrl}`)
  console.log("🚀 Executing comprehensive test suite...\n")

  // Execute the bash script
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const scriptPath = join(__dirname, "run-all-tests.sh")

  const child = spawn("bash", [scriptPath, baseUrl], {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_BASE_URL: baseUrl,
    },
  })

  child.on("close", (code) => {
    if (code === 0) {
      console.log("\n🎉 All tests completed successfully!")
    } else {
      console.log(`\n❌ Tests failed with exit code ${code}`)
      process.exit(code)
    }
  })

  child.on("error", (error) => {
    console.error("❌ Failed to execute test script:", error)
    process.exit(1)
  })
}

if (require.main === module) {
  executeRunTests().catch(console.error)
}

export { TestExecutor }
