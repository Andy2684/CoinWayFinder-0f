#!/usr/bin/env tsx

import { DeploymentTester } from "./test-deployment"

async function main() {
  console.log("🚀 CoinWayFinder Deployment Test Executor")
  console.log("=" + "=".repeat(50))

  // Get base URL from command line or environment
  const baseUrl =
    process.argv[2] || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  console.log(`🎯 Target: ${baseUrl}`)
  console.log("🔍 Running deployment tests...\n")

  try {
    const tester = new DeploymentTester(baseUrl)
    const results = await tester.runAllTests()

    tester.printResults()

    // Exit with appropriate code
    const failed = results.filter((r) => r.status === "fail").length
    const warnings = results.filter((r) => r.status === "warning").length

    if (failed > 0) {
      console.log("\n🚨 Deployment tests failed!")
      process.exit(1)
    } else if (warnings > 0) {
      console.log("\n⚠️ Deployment tests passed with warnings.")
      process.exit(0)
    } else {
      console.log("\n🎉 All deployment tests passed!")
      process.exit(0)
    }
  } catch (error) {
    console.error("❌ Test execution failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}
