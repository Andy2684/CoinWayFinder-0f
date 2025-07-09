import { FullSystemTester } from "./run-full-system-test"

async function runSystemTest() {
  console.log("🚀 Executing CoinWayFinder Full System Test")
  console.log("============================================")

  // Determine the base URL for testing
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"

  console.log(`🌐 Testing against: ${baseUrl}`)
  console.log("⏳ Starting comprehensive system test...\n")

  try {
    const tester = new FullSystemTester(baseUrl)
    await tester.runFullSystemTest()
  } catch (error) {
    console.error("❌ System test execution failed:", error)

    // Provide helpful debugging information
    console.log("\n🔧 Debugging Information:")
    console.log(`   • Base URL: ${baseUrl}`)
    console.log(`   • Environment: ${process.env.NODE_ENV || "development"}`)
    console.log(`   • Timestamp: ${new Date().toISOString()}`)

    if (error instanceof Error) {
      console.log(`   • Error Type: ${error.constructor.name}`)
      console.log(`   • Error Message: ${error.message}`)
      if (error.stack) {
        console.log(`   • Stack Trace: ${error.stack.split("\n").slice(0, 3).join("\n")}`)
      }
    }

    console.log("\n💡 Troubleshooting Tips:")
    console.log("   1. Ensure the application is running")
    console.log("   2. Check network connectivity")
    console.log("   3. Verify environment variables are set")
    console.log("   4. Check application logs for errors")
    console.log(`   5. Try accessing ${baseUrl}/api/health manually`)

    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  runSystemTest()
}

export { runSystemTest }
