import { DeploymentTester } from "./test-deployment"

interface TestConfig {
  baseUrl: string
  timeout: number
  retries: number
}

class TestExecutor {
  private config: TestConfig
  private tester: DeploymentTester

  constructor(baseUrl?: string) {
    this.config = {
      baseUrl: baseUrl || this.determineBaseUrl(),
      timeout: 30000,
      retries: 3,
    }
    this.tester = new DeploymentTester(this.config.baseUrl)
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

  async execute(): Promise<void> {
    console.log("🚀 Starting CoinWayFinder Test Execution")
    console.log("=" + "=".repeat(50))
    console.log(`🌐 Target URL: ${this.config.baseUrl}`)

    try {
      const results = await this.tester.runAllTests()
      this.tester.printResults()

      const failed = results.filter((r) => r.status === "fail").length
      const warnings = results.filter((r) => r.status === "warning").length

      if (failed > 0) {
        console.log("\n🚨 Tests failed! Please fix the issues above.")
        process.exit(1)
      } else if (warnings > 0) {
        console.log("\n⚠️ Tests passed with warnings.")
        process.exit(0)
      } else {
        console.log("\n🎉 All tests passed successfully!")
        process.exit(0)
      }
    } catch (error) {
      console.error("❌ Test execution failed:", error)
      process.exit(1)
    }
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2]
  const executor = new TestExecutor(baseUrl)
  await executor.execute()
}

if (require.main === module) {
  main().catch(console.error)
}

export { TestExecutor }
