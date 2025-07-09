import { DeploymentTester } from "./test-deployment"

async function executeTests() {
  console.log("🚀 Executing CoinWayFinder Test Suite")
  console.log("====================================")
  console.log(`📅 Started at: ${new Date().toISOString()}`)

  // Get the base URL from environment or use localhost
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"

  console.log(`🌐 Target URL: ${baseUrl}`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`)

  // Initialize the tester
  const tester = new DeploymentTester(baseUrl)

  try {
    console.log("\n🔍 Starting comprehensive test suite...")

    // Run all tests
    const results = await tester.runAllTests()

    // Print detailed results
    tester.printResults()

    // Analyze results
    const failed = results.filter((r) => r.status === "fail").length
    const warnings = results.filter((r) => r.status === "warning").length
    const passed = results.filter((r) => r.status === "pass").length

    console.log("\n📊 FINAL SUMMARY")
    console.log("================")
    console.log(`🎯 Total Tests: ${results.length}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`⚠️ Warnings: ${warnings}`)
    console.log(`❌ Failed: ${failed}`)

    // Determine exit code and final message
    if (failed > 0) {
      console.log("\n🚨 CRITICAL ISSUES DETECTED")
      console.log("Some tests failed. Your application may not work correctly.")
      console.log("Please review the failed tests above and fix the issues.")

      console.log("\n🔧 Troubleshooting Tips:")
      console.log("   • Check environment variables in Vercel dashboard")
      console.log("   • Verify database connection strings")
      console.log("   • Check API key configurations")
      console.log("   • Review Vercel deployment logs")

      process.exit(1)
    } else if (warnings > 0) {
      console.log("\n⚠️ WARNINGS DETECTED")
      console.log("Tests passed but some components have warnings.")
      console.log("Your application should work but may have limited functionality.")

      console.log("\n💡 Recommendations:")
      console.log("   • Configure missing environment variables")
      console.log("   • Set up external service integrations")
      console.log("   • Review warning messages above")

      process.exit(0)
    } else {
      console.log("\n🎉 ALL TESTS PASSED!")
      console.log("Your CoinWayFinder application is working perfectly!")
      console.log("All components are healthy and responding correctly.")

      console.log("\n🚀 Your application is ready for:")
      console.log("   ✅ User registration and authentication")
      console.log("   ✅ Cryptocurrency data fetching")
      console.log("   ✅ Trading bot management")
      console.log("   ✅ Subscription handling")
      console.log("   ✅ API access and documentation")

      process.exit(0)
    }
  } catch (error) {
    console.error("\n💥 TEST EXECUTION FAILED")
    console.error("========================")
    console.error("The test suite encountered a critical error:")
    console.error(error)

    console.log("\n🔧 Possible causes:")
    console.log("   • Application is not running")
    console.log("   • Network connectivity issues")
    console.log("   • Invalid base URL configuration")
    console.log("   • Server is overloaded or crashed")

    console.log("\n🩺 Quick diagnostics:")
    console.log(`   • Try accessing: ${baseUrl}`)
    console.log(`   • Check health: ${baseUrl}/api/health`)
    console.log("   • Review Vercel deployment status")

    process.exit(1)
  }
}

// Execute the test suite
executeTests().catch((error) => {
  console.error("Fatal error in test execution:", error)
  process.exit(1)
})
