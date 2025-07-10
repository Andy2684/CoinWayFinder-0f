import { runAuthTests } from "./test-auth-functionality"
import { testAuthAPIEndpoints } from "./test-api-auth-endpoints"

async function runCompleteAuthTests() {
  console.log("🎯 Running Complete Authentication Test Suite\n")
  console.log("=".repeat(60))

  try {
    // Run functionality tests
    console.log("PHASE 1: Testing Authentication Logic")
    console.log("=".repeat(60))
    const functionalityResults = await runAuthTests()

    console.log("\n" + "=".repeat(60))
    console.log("PHASE 2: Testing API Endpoints")
    console.log("=".repeat(60))
    const apiResults = await testAuthAPIEndpoints()

    // Overall summary
    console.log("\n" + "=".repeat(60))
    console.log("🏆 COMPLETE TEST RESULTS SUMMARY")
    console.log("=".repeat(60))

    console.log("\n📋 Functionality Tests:")
    console.log(`   Total: ${functionalityResults.totalTests}`)
    console.log(`   Passed: ${functionalityResults.passedTests} ✅`)
    console.log(`   Failed: ${functionalityResults.failedTests} ❌`)
    console.log(`   Success Rate: ${functionalityResults.successRate}%`)

    console.log("\n🌐 API Endpoint Tests:")
    const apiSuccessful = apiResults.filter((r) => !r.error && (r.status < 400 || r.success)).length
    console.log(`   Total: ${apiResults.length}`)
    console.log(`   Successful: ${apiSuccessful} ✅`)
    console.log(`   Failed: ${apiResults.length - apiSuccessful} ❌`)
    console.log(`   Success Rate: ${((apiSuccessful / apiResults.length) * 100).toFixed(1)}%`)

    const overallSuccess = functionalityResults.allPassed && apiSuccessful === apiResults.length

    if (overallSuccess) {
      console.log("\n🎉 ALL AUTHENTICATION TESTS PASSED! 🎊")
      console.log("✅ Your authentication system is working perfectly!")
      console.log("✅ Crypto errors have been resolved!")
      console.log("✅ Sign up and sign in functionality is operational!")
      console.log("✅ API endpoints are responding correctly!")
      console.log("✅ Security functions are working!")
      console.log("\n🚀 Ready for production deployment!")
    } else {
      console.log("\n⚠️ Some tests failed. Please review the details above.")

      if (!functionalityResults.allPassed) {
        console.log("❌ Functionality tests have issues")
      }

      if (apiSuccessful !== apiResults.length) {
        console.log("❌ API endpoint tests have issues")
      }
    }

    return {
      functionality: functionalityResults,
      api: apiResults,
      overallSuccess,
    }
  } catch (error) {
    console.error("❌ Error running authentication tests:", error)
    return {
      error: error.toString(),
      overallSuccess: false,
    }
  }
}

// Export for use in other scripts
export { runCompleteAuthTests }

// Run if this file is executed directly
if (typeof window === "undefined" && require.main === module) {
  runCompleteAuthTests()
    .then((results) => {
      process.exit(results.overallSuccess ? 0 : 1)
    })
    .catch((error) => {
      console.error("Fatal error:", error)
      process.exit(1)
    })
}
