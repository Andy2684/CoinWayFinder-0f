import { DeploymentTester } from "./test-deployment"

async function runTests() {
  console.log("🚀 Starting CoinWayFinder Test Suite")
  console.log("==================================")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  console.log(`🌐 Testing URL: ${baseUrl}`)

  const tester = new DeploymentTester(baseUrl)

  try {
    const results = await tester.runAllTests()
    tester.printResults()

    const failed = results.filter((r) => r.status === "fail").length
    const warnings = results.filter((r) => r.status === "warning").length

    if (failed > 0) {
      console.log("\n❌ Some tests failed. Please check the issues above.")
      process.exit(1)
    } else if (warnings > 0) {
      console.log("\n⚠️ Tests passed with warnings. Review the issues above.")
      process.exit(0)
    } else {
      console.log("\n✅ All tests passed! Your application is ready.")
      process.exit(0)
    }
  } catch (error) {
    console.error("💥 Test execution failed:", error)
    process.exit(1)
  }
}

runTests()
