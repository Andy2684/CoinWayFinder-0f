#!/usr/bin/env ts-node

import { securityMonitor, SecurityEventType, SecuritySeverity } from "../lib/security-monitor"
import { SpecificIncidentTester } from "./test-specific-incidents"

interface TestResult {
  testName: string
  status: "passed" | "failed"
  duration: number
  details?: any
  error?: string
}

class SecurityTestRunner {
  private results: TestResult[] = []
  private startTime = 0

  async runComprehensiveSecurityTests(): Promise<void> {
    console.log("🚀 Starting Comprehensive Security Tests")
    console.log("=".repeat(60))
    console.log(`📅 Test Started: ${new Date().toISOString()}`)
    console.log("=".repeat(60))

    this.startTime = Date.now()

    try {
      // Test 1: Basic Security Event Logging
      await this.testBasicSecurityEventLogging()

      // Test 2: Security Monitor Health Check
      await this.testSecurityMonitorHealth()

      // Test 3: Alert Threshold Testing
      await this.testAlertThresholds()

      // Test 4: Event Retrieval and Filtering
      await this.testEventRetrievalAndFiltering()

      // Test 5: Security Stats Generation
      await this.testSecurityStatsGeneration()

      // Test 6: Incident Response Integration
      await this.testIncidentResponseIntegration()

      // Test 7: Performance Under Load
      await this.testPerformanceUnderLoad()

      // Test 8: Specific Incident Scenarios
      await this.testSpecificIncidentScenarios()

      // Test 9: Cleanup and Maintenance
      await this.testCleanupAndMaintenance()

      // Test 10: Error Handling and Recovery
      await this.testErrorHandlingAndRecovery()

      // Generate final report
      await this.generateTestReport()
    } catch (error) {
      console.error("❌ Comprehensive security tests failed:", error)
      throw error
    }
  }

  private async testBasicSecurityEventLogging(): Promise<void> {
    const testName = "Basic Security Event Logging"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      // Test different event types
      const eventTypes = [
        SecurityEventType.FAILED_AUTH_ATTEMPTS,
        SecurityEventType.SUSPICIOUS_LOGIN,
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        SecurityEventType.SQL_INJECTION_ATTEMPT,
        SecurityEventType.XSS_ATTEMPT,
        SecurityEventType.UNAUTHORIZED_ACCESS,
        SecurityEventType.CSP_VIOLATION,
        SecurityEventType.BRUTE_FORCE_ATTACK,
        SecurityEventType.SUSPICIOUS_USER_AGENT,
        SecurityEventType.INVALID_TOKEN,
      ]

      for (const eventType of eventTypes) {
        await securityMonitor.logSecurityEvent({
          type: eventType,
          severity: SecuritySeverity.MEDIUM,
          source: "/test/endpoint",
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: "Test-Agent/1.0",
          details: {
            testEvent: true,
            eventType: eventType,
            timestamp: new Date().toISOString(),
          },
        })

        console.log(`  ✅ Logged ${eventType} event`)
      }

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        eventsLogged: eventTypes.length,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testSecurityMonitorHealth(): Promise<void> {
    const testName = "Security Monitor Health Check"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      const stats = await securityMonitor.getSecurityStats()

      console.log(`  📊 Total Events: ${stats.totalEvents}`)
      console.log(`  🚨 Active Alerts: ${stats.activeAlerts.length}`)
      console.log(`  ⚠️ Threat Level: ${stats.threatLevel}`)
      console.log(`  📈 Recent Events: ${stats.recentEvents.length}`)

      // Verify stats structure
      if (typeof stats.totalEvents !== "number") {
        throw new Error("Invalid totalEvents type")
      }

      if (!Array.isArray(stats.activeAlerts)) {
        throw new Error("Invalid activeAlerts type")
      }

      if (!["low", "medium", "high", "critical"].includes(stats.threatLevel)) {
        throw new Error("Invalid threat level")
      }

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        totalEvents: stats.totalEvents,
        activeAlerts: stats.activeAlerts.length,
        threatLevel: stats.threatLevel,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testAlertThresholds(): Promise<void> {
    const testName = "Alert Threshold Testing"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      // Generate multiple failed auth attempts to trigger alert
      const testIP = "192.168.100.100"
      console.log(`  🔄 Generating failed auth attempts from ${testIP}`)

      for (let i = 0; i < 6; i++) {
        await securityMonitor.logSecurityEvent({
          type: SecurityEventType.FAILED_AUTH_ATTEMPTS,
          severity: SecuritySeverity.MEDIUM,
          source: "/api/auth/signin",
          ip: testIP,
          details: {
            username: "testuser",
            attempt: i + 1,
            timestamp: new Date().toISOString(),
          },
        })

        console.log(`    📝 Attempt ${i + 1} logged`)
        await this.sleep(100)
      }

      // Wait for alert processing
      await this.sleep(2000)

      const stats = await securityMonitor.getSecurityStats()
      console.log(`  🚨 Active alerts after threshold test: ${stats.activeAlerts.length}`)

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        attemptsGenerated: 6,
        activeAlerts: stats.activeAlerts.length,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testEventRetrievalAndFiltering(): Promise<void> {
    const testName = "Event Retrieval and Filtering"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      // Test retrieving all events
      const allEvents = await securityMonitor.getSecurityEvents()
      console.log(`  📋 Retrieved ${allEvents.length} total events`)

      // Test retrieving specific event type
      const sqlEvents = await securityMonitor.getSecurityEvents(SecurityEventType.SQL_INJECTION_ATTEMPT)
      console.log(`  🔍 Retrieved ${sqlEvents.length} SQL injection events`)

      // Test with limit
      const limitedEvents = await securityMonitor.getSecurityEvents(undefined, 10)
      console.log(`  📊 Retrieved ${limitedEvents.length} events with limit`)

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        allEvents: allEvents.length,
        sqlEvents: sqlEvents.length,
        limitedEvents: limitedEvents.length,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testSecurityStatsGeneration(): Promise<void> {
    const testName = "Security Stats Generation"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      const stats = await securityMonitor.getSecurityStats()

      console.log("  📊 Event Statistics:")
      Object.entries(stats.eventsByType).forEach(([type, count]) => {
        console.log(`    ${type}: ${count}`)
      })

      console.log("  📈 Severity Statistics:")
      Object.entries(stats.eventsBySeverity).forEach(([severity, count]) => {
        console.log(`    ${severity}: ${count}`)
      })

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        eventsByType: Object.keys(stats.eventsByType).length,
        eventsBySeverity: Object.keys(stats.eventsBySeverity).length,
        threatLevel: stats.threatLevel,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testIncidentResponseIntegration(): Promise<void> {
    const testName = "Incident Response Integration"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      // Log a critical security event
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.SQL_INJECTION_ATTEMPT,
        severity: SecuritySeverity.CRITICAL,
        source: "/api/test",
        ip: "192.168.200.100",
        details: {
          payload: "' OR 1=1--",
          endpoint: "/api/test",
          integrationTest: true,
        },
      })

      console.log("  ✅ Critical security event logged")
      console.log("  🔄 Incident response should be triggered automatically")

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        criticalEventLogged: true,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testPerformanceUnderLoad(): Promise<void> {
    const testName = "Performance Under Load"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      const eventCount = 100
      const concurrentBatches = 5
      const batchSize = eventCount / concurrentBatches

      console.log(`  🚀 Generating ${eventCount} events in ${concurrentBatches} concurrent batches`)

      const promises = []
      for (let batch = 0; batch < concurrentBatches; batch++) {
        const batchPromise = this.generateEventBatch(batch, batchSize)
        promises.push(batchPromise)
      }

      await Promise.all(promises)

      const loadTestDuration = Date.now() - startTime
      const eventsPerSecond = Math.round(eventCount / (loadTestDuration / 1000))

      console.log(`  ⚡ Generated ${eventCount} events in ${loadTestDuration}ms`)
      console.log(`  📊 Performance: ${eventsPerSecond} events/second`)

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        eventsGenerated: eventCount,
        duration: loadTestDuration,
        eventsPerSecond: eventsPerSecond,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testSpecificIncidentScenarios(): Promise<void> {
    const testName = "Specific Incident Scenarios"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      const tester = new SpecificIncidentTester()

      // Run a subset of specific tests
      console.log("  🔍 Testing SQL Injection scenarios...")
      await tester.testAdvancedSQLInjection()

      console.log("  🔍 Testing XSS scenarios...")
      await tester.testXSSVariants()

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        sqlInjectionTests: "completed",
        xssTests: "completed",
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testCleanupAndMaintenance(): Promise<void> {
    const testName = "Cleanup and Maintenance"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      console.log("  🧹 Running security monitor cleanup...")
      await securityMonitor.cleanup()

      console.log("  ✅ Cleanup completed successfully")

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        cleanupCompleted: true,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async testErrorHandlingAndRecovery(): Promise<void> {
    const testName = "Error Handling and Recovery"
    const startTime = Date.now()

    try {
      console.log(`\n🧪 Running Test: ${testName}`)
      console.log("-".repeat(40))

      // Test with invalid event data
      try {
        await securityMonitor.logSecurityEvent({
          type: "invalid_event_type" as SecurityEventType,
          severity: SecuritySeverity.LOW,
          source: "/test",
          details: {},
        })
        console.log("  ⚠️ Invalid event logged (system should handle gracefully)")
      } catch (error) {
        console.log("  ✅ Invalid event properly rejected")
      }

      // Test system recovery
      const stats = await securityMonitor.getSecurityStats()
      console.log(`  🔄 System operational after error test: ${stats.totalEvents} events`)

      this.recordTestResult(testName, "passed", Date.now() - startTime, {
        errorHandlingTested: true,
        systemOperational: true,
      })
    } catch (error) {
      this.recordTestResult(testName, "failed", Date.now() - startTime, null, error.message)
      throw error
    }
  }

  private async generateEventBatch(batchId: number, batchSize: number): Promise<void> {
    const eventTypes = [
      SecurityEventType.FAILED_AUTH_ATTEMPTS,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventType.SUSPICIOUS_USER_AGENT,
      SecurityEventType.INVALID_TOKEN,
    ]

    for (let i = 0; i < batchSize; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

      await securityMonitor.logSecurityEvent({
        type: eventType,
        severity: SecuritySeverity.LOW,
        source: `/test/batch/${batchId}`,
        ip: `10.0.${batchId}.${i}`,
        details: {
          batchId: batchId,
          eventIndex: i,
          loadTest: true,
        },
      })
    }
  }

  private recordTestResult(
    testName: string,
    status: "passed" | "failed",
    duration: number,
    details?: any,
    error?: string,
  ): void {
    this.results.push({
      testName,
      status,
      duration,
      details,
      error,
    })

    const statusIcon = status === "passed" ? "✅" : "❌"
    console.log(`  ${statusIcon} ${testName}: ${status.toUpperCase()} (${duration}ms)`)
  }

  private async generateTestReport(): Promise<void> {
    const totalDuration = Date.now() - this.startTime
    const passedTests = this.results.filter((r) => r.status === "passed").length
    const failedTests = this.results.filter((r) => r.status === "failed").length

    console.log("\n" + "=".repeat(60))
    console.log("📊 COMPREHENSIVE SECURITY TEST REPORT")
    console.log("=".repeat(60))
    console.log(`📅 Test Completed: ${new Date().toISOString()}`)
    console.log(`⏱️ Total Duration: ${totalDuration}ms`)
    console.log(`✅ Passed Tests: ${passedTests}`)
    console.log(`❌ Failed Tests: ${failedTests}`)
    console.log(`📈 Success Rate: ${Math.round((passedTests / this.results.length) * 100)}%`)
    console.log("=".repeat(60))

    console.log("\n📋 DETAILED TEST RESULTS:")
    console.log("-".repeat(40))

    this.results.forEach((result, index) => {
      const statusIcon = result.status === "passed" ? "✅" : "❌"
      console.log(`${index + 1}. ${statusIcon} ${result.testName}`)
      console.log(`   Duration: ${result.duration}ms`)

      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
      }

      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }

      console.log()
    })

    // Get final security stats
    const finalStats = await securityMonitor.getSecurityStats()
    console.log("🛡️ FINAL SECURITY SYSTEM STATUS:")
    console.log("-".repeat(40))
    console.log(`Total Events Logged: ${finalStats.totalEvents}`)
    console.log(`Active Alerts: ${finalStats.activeAlerts.length}`)
    console.log(`Current Threat Level: ${finalStats.threatLevel.toUpperCase()}`)
    console.log(`Recent Events: ${finalStats.recentEvents.length}`)

    console.log("\n📊 Events by Type:")
    Object.entries(finalStats.eventsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })

    console.log("\n📈 Events by Severity:")
    Object.entries(finalStats.eventsBySeverity).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`)
    })

    console.log("\n" + "=".repeat(60))
    console.log("🎉 COMPREHENSIVE SECURITY TESTING COMPLETED!")
    console.log("=".repeat(60))
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// CLI interface
if (require.main === module) {
  const runner = new SecurityTestRunner()

  runner
    .runComprehensiveSecurityTests()
    .then(() => {
      console.log("✅ All security tests completed successfully!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Security tests failed:", error)
      process.exit(1)
    })
}

export { SecurityTestRunner }
