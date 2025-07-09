import { DeploymentTester } from "./test-deployment"

async function runTests() {
  console.log("🚀 Starting CoinWayFinder Test Suite")
  console.log("=====================================")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  console.log(`🌐 Testing URL: ${baseUrl}`)

  const tester = new DeploymentTester(baseUrl)

  try {
    const results = await tester.runAllTests()
    tester.printResults()

    // Check if we should exit with error code
    const hasFailures = results.some((r) => r.status === "fail")
    if (hasFailures) {
      console.log("\n❌ Some tests failed. Check the results above.")
      process.exit(1)
    } else {
      console.log("\n🎉 All tests passed successfully!")
      process.exit(0)
    }
  } catch (error) {
    console.error("💥 Test execution failed:", error)
    process.exit(1)
  }
}

runTests()
