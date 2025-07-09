#!/usr/bin/env node

import { FullSystemTester } from "./run-full-system-test"

async function executeFullSystemTest() {
  console.log("🔧 CoinWayFinder Full System Test Executor")
  console.log("=" + "=".repeat(50))

  // Get base URL from command line arguments or environment
  const baseUrl = process.argv[2] || process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL

  if (!baseUrl) {
    console.error("❌ Error: No base URL provided")
    console.log("Usage:")
    console.log("  npm run test:system <base-url>")
    console.log("  or set NEXT_PUBLIC_BASE_URL environment variable")
    console.log("  or set VERCEL_URL environment variable")
    console.log("")
    console.log("Examples:")
    console.log("  npm run test:system http://localhost:3000")
    console.log("  npm run test:system https://your-app.vercel.app")
    process.exit(1)
  }

  // Validate URL format
  try {
    new URL(baseUrl)
  } catch (error) {
    console.error(`❌ Error: Invalid URL format: ${baseUrl}`)
    process.exit(1)
  }

  console.log(`🎯 Target Application: ${baseUrl}`)
  console.log("🚀 Starting comprehensive system test...")
  console.log("")

  try {
    const tester = new FullSystemTester(baseUrl)
    await tester.runFullSystemTest()
  } catch (error) {
    console.error("❌ System test execution failed:", error)
    process.exit(1)
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  executeFullSystemTest().catch((error) => {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  })
}
