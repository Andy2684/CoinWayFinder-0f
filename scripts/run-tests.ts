import { DeploymentTester } from "./test-deployment"

async function main() {
  console.log("🚀 Starting CoinWayFinder Test Suite")
  console.log("=" + "=".repeat(50))

  // Determine the base URL
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  console.log(`🌐 Testing application at: ${baseUrl}`)

  // Initialize the tester
  const tester = new DeploymentTester(baseUrl)

  try {
    // Run all tests
    const results = await tester.runAllTests()

    // Print detailed results
    tester.printResults()

    // Exit with appropriate code
    const failed = results.filter((r) => r.status === "fail").length
    const warnings = results.filter((r) => r.status === "warning").length

    if (failed > 0) {
      console.log("\n🚨 Tests failed! Please fix the issues above.")
      process.exit(1)
    } else if (warnings > 0) {
      console.log("\n⚠️ Tests passed with warnings. Review above.")
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

// Handle command line arguments
if (process.argv.length > 2) {
  process.env.NEXT_PUBLIC_BASE_URL = process.argv[2]
}

// Run the tests
main().catch(console.error)
