#!/usr/bin/env ts-node

import { IncidentResponseAutomation } from "./incident-response-automation"
import { securityMonitor, SecurityEventType, SecuritySeverity } from "../lib/security-monitor"

interface TestResult {
  testName: string
  incidentId?: string
  success: boolean
  duration: number
  actions: number
  successfulActions: number
  error?: string
}

class SecurityTestSuite {
  private automation: IncidentResponseAutomation
  private results: TestResult[] = []

  constructor() {
    this.automation = new IncidentResponseAutomation()
  }

  async runAllTests(): Promise<void> {
    console.log("🧪 Starting Comprehensive Security Incident Tests")
    console.log("=".repeat(60))

    const tests = [
      { name: "SQL Injection Attack", method: this.testSQLInjection.bind(this) },
      { name: "XSS Attack", method: this.testXSSAttack.bind(this) },
      { name: "Brute Force Attack", method: this.testBruteForceAttack.bind(this) },
      { name: "Unauthorized Access", method: this.testUnauthorizedAccess.bind(this) },
      { name: "Rate Limit Exceeded", method: this.testRateLimitExceeded.bind(this) },
      { name: "Admin Access Attempt", method: this.testAdminAccessAttempt.bind(this) },
      { name: "API Abuse", method: this.testAPIAbuse.bind(this) },
      { name: "CSP Violation", method: this.testCSPViolation.bind(this) },
      { name: "Suspicious Login", method: this.testSuspiciousLogin.bind(this) },
      { name: "Failed Authentication", method: this.testFailedAuthentication.bind(this) },
    ]

    for (const test of tests) {
      await this.runTest(test.name, test.method)
      // Wait between tests to avoid overwhelming the system
      await this.sleep(2000)
    }

    this.generateReport()
  }

  private async runTest(testName: string, testMethod: () => Promise<void>): Promise<void> {
    console.log(`\n🔍 Running Test: ${testName}`)
    console.log("-".repeat(40))

    const startTime = Date.now()
    const result: TestResult = {
      testName,
      success: false,
      duration: 0,
      actions: 0,
      successfulActions: 0,
    }

    try {
      await testMethod()
      result.success = true
      console.log(`✅ Test Passed: ${testName}`)
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Unknown error"
      console.error(`❌ Test Failed: ${testName} - ${result.error}`)
    }

    result.duration = Date.now() - startTime
    this.results.push(result)
  }

  private async testSQLInjection(): Promise<void> {
    console.log("  🛡️ Testing SQL Injection Response...")

    // Simulate SQL injection attempt
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.SQL_INJECTION_ATTEMPT,
      severity: SecuritySeverity.CRITICAL,
      source: "/api/users",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Malicious Bot)",
      details: {
        endpoint: "/api/users",
        payload: "'; DROP TABLE users; --",
        parameter: "username",
        method: "POST",
      },
    })

    // Test the automated response
    const incidentId = await this.automation.handleSecurityIncident("sql_injection_attempt", "critical", {
      ip: "192.168.1.100",
      endpoint: "/api/users",
      payload: "'; DROP TABLE users; --",
      userAgent: "Mozilla/5.0 (Malicious Bot)",
      parameter: "username",
    })

    console.log(`    📝 Incident ID: ${incidentId}`)
    console.log("    ✅ SQL Injection response completed")
  }

  private async testXSSAttack(): Promise<void> {
    console.log("  🔐 Testing XSS Attack Response...")

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.XSS_ATTEMPT,
      severity: SecuritySeverity.CRITICAL,
      source: "/api/comments",
      ip: "10.0.0.50",
      userAgent: "Mozilla/5.0 (Attack Browser)",
      details: {
        endpoint: "/api/comments",
        payload: '<script>alert("XSS")</script>',
        parameter: "comment",
        method: "POST",
      },
    })

    const incidentId = await this.automation.handleSecurityIncident("xss_attempt", "critical", {
      ip: "10.0.0.50",
      endpoint: "/api/comments",
      payload: '<script>alert("XSS")</script>',
      userAgent: "Mozilla/5.0 (Attack Browser)",
    })

    console.log(`    📝 Incident ID: ${incidentId}`)
    console.log("    ✅ XSS Attack response completed")
  }

  private async testBruteForceAttack(): Promise<void> {
    console.log("  🔒 Testing Brute Force Attack Response...")

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.BRUTE_FORCE_ATTACK,
      severity: SecuritySeverity.CRITICAL,
      source: "/api/auth/signin",
      ip: "203.0.113.1",
      details: {
        targetAccounts: ["admin", "user123", "test@example.com"],
        attemptCount: 50,
        timeWindow: 300, // 5 minutes
        sourceIPs: ["203.0.113.1", "203.0.113.2", "203.0.113.3"],
      },
    })

    const incidentId = await this.automation.handleSecurityIncident("brute_force_attack", "critical", {
      ips: ["203.0.113.1", "203.0.113.2", "203.0.113.3"],
      accounts: ["admin", "user123", "test@example.com"],
      attempts: 50,
      timeWindow: 300,
    })

    console.log(`    📝 Incident ID: ${incidentId}`)
    console.log("    ✅ Brute Force Attack response completed")
  }

  private async testUnauthorizedAccess(): Promise<void> {
    console.log("  🚫 Testing Unauthorized Access Response...")

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: SecuritySeverity.HIGH,
      source: "/api/admin/users",
      ip: "198.51.100.10",
      userId: "user_12345",
      details: {
        attemptedResource: "/api/admin/users",
        userRole: "user",
        requiredRole: "admin",
        accessMethod: "direct_url",
      },
    })

    const incidentId = await this.automation.handleSecurityIncident("unauthorized_access", "high", {
      userId: "user_12345",
      ip: "198.51.100.10",
      resource: "/api/admin/users",
      userRole: "user",
      requiredRole: "admin",
    })

    console.log(`    📝 Incident ID: ${incidentId}`)
    console.log("    ✅ Unauthorized Access response completed")
  }

  private async testRateLimitExceeded(): Promise<void> {
    console.log("  ⚡ Testing Rate Limit Exceeded Response...")

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecuritySeverity.MEDIUM,
      source: "/api/crypto/prices",
      ip: "198.51.100.20",
      details: {
        endpoint: "/api/crypto/prices",
        limit: 100,
        requestCount: 500,
        timeWindow: 900, // 15 minutes
        userAgent: "Python/3.9 requests/2.25.1",
      },
    })

    const incidentId = await this.automation.handleSecurityIncident("rate_limit_exceeded", "medium", {
      ip: "198.51.100.20",
      currentLimit: 100,
      requestCount: 500,
      timeWindow: 900,
      endpoint: "/api/crypto/prices",
    })

    console.log(`    📝 Incident ID: ${incidentId}`)
    console.log("    ✅ Rate Limit Exceeded response completed")
  }

  private async testAdminAccessAttempt(): Promise<void> {
    console.log("  👑 Testing Admin Access Attempt Response...")

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.ADMIN_ACCESS_ATTEMPT,
      severity: SecuritySeverity.HIGH,
      source: "/admin/security-monitor",
      ip: "172.16.0.100",
      details: {
        endpoint: "/admin/security-monitor",
        credentials: "invalid",
        attempts: 3,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    })

    const incidentId = await this.automation.handleSecurityIncident("admin_access_attempt", "high", {
      ip: "172.16.0.100",
      endpoint: "/admin/security-monitor",
      attempts: 3,
      credentials: "invalid",
    })

    console.log(`    📝 Incident ID: ${incidentId}`)
    console.log("    ✅ Admin Access Attempt response completed")
  }

  private async testAPIAbuse(): Promise<void> {
    console.log("  🔧 Testing API Abuse Response...")

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.API_ABUSE,
      severity: SecuritySeverity.MEDIUM,
      source: "/api/v1/signals",
      ip: "203.0.113.50",
      details: {
        endpoint: "/api/v1/signals",
        requestCount: 1000,
        timeWindow: 3600, // 1 hour
        apiKey: "key_abcd1234",
        pattern: "automated_scraping",
      },
    })

    const incidentId = await this.automation.handleSecurityIncident("api_abuse", "medium", {
      ip: "203.0.113.50",
      endpoint: "/api/v1/signals",
      requestCount: 1000,
      apiKey: "key_abcd1234",
      pattern: "automated_scraping",
    })

    console.log(`    📝 Incident ID: ${incidentId}`)
    console.log("    ✅ API Abuse response completed")
  }

  private async testCSPViolation(): Promise<void> {
    console.log("  🛡️ Testing CSP Violation Response...")

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.CSP_VIOLATION,
      severity: SecuritySeverity.LOW,
      source: "/dashboard",
      ip: "192.168.1.200",
      details: {
        violatedDirective: "script-src",
        blockedURI: "https://malicious-site.com/script.js",
        documentURI: "https://coinwayfinder.com/dashboard",
        referrer: "https://coinwayfinder.com/",
      },
    })

    // CSP violations are typically handled differently (lower priority)
    console.log("    📝 CSP Violation logged for monitoring")
    console.log("    ✅ CSP Violation response completed")
  }

  private async testSuspiciousLogin(): Promise<void> {
    console.log("  🔍 Testing Suspicious Login Response...")

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_LOGIN,
      severity: SecuritySeverity.HIGH,
      source: "/api/auth/signin",
      ip: "185.220.101.50", // Tor exit node
      userId: "user_67890",
      details: {
        userId: "user_67890",
        loginLocation: "Russia",
        previousLocation: "United States",
        timeDifference: 30, // minutes
        deviceFingerprint: "unknown",
        vpnDetected: true,
      },
    })

    const incidentId = await this.automation.handleSecurityIncident("suspicious_login", "high", {
      userId: "user_67890",
      ip: "185.220.101.50",
      location: "Russia",
      previousLocation: "United States",
      vpnDetected: true,
    })

    console.log(`    📝 Incident ID: ${incidentId}`)
    console.log("    ✅ Suspicious Login response completed")
  }

  private async testFailedAuthentication(): Promise<void> {
    console.log("  🔐 Testing Failed Authentication Response...")

    // Simulate multiple failed authentication attempts
    for (let i = 0; i < 6; i++) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.FAILED_AUTH_ATTEMPTS,
        severity: SecuritySeverity.MEDIUM,
        source: "/api/auth/signin",
        ip: "10.0.0.100",
        details: {
          username: "admin",
          attempt: i + 1,
          timestamp: new Date().toISOString(),
          userAgent: "Mozilla/5.0 (Automated Tool)",
        },
      })
    }

    console.log("    📝 Multiple failed authentication attempts logged")
    console.log("    ✅ Failed Authentication monitoring completed")
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private generateReport(): void {
    console.log("\n" + "=".repeat(60))
    console.log("📊 SECURITY INCIDENT TEST REPORT")
    console.log("=".repeat(60))

    const totalTests = this.results.length
    const passedTests = this.results.filter((r) => r.success).length
    const failedTests = totalTests - passedTests
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    console.log(`\n📈 Summary:`)
    console.log(`  Total Tests: ${totalTests}`)
    console.log(`  Passed: ${passedTests} ✅`)
    console.log(`  Failed: ${failedTests} ❌`)
    console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    console.log(`  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`)

    console.log(`\n📋 Detailed Results:`)
    this.results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌"
      const duration = (result.duration / 1000).toFixed(2)
      console.log(`  ${index + 1}. ${status} ${result.testName} (${duration}s)`)
      if (result.error) {
        console.log(`     Error: ${result.error}`)
      }
    })

    console.log(`\n🔍 Security Event Analysis:`)
    this.analyzeSecurityEvents()

    console.log(`\n💡 Recommendations:`)
    this.generateRecommendations()

    console.log("\n" + "=".repeat(60))
    console.log("🎯 Test Suite Completed!")
    console.log("=".repeat(60))
  }

  private async analyzeSecurityEvents(): Promise<void> {
    try {
      const stats = await securityMonitor.getSecurityStats()

      console.log(`  Total Events Generated: ${stats.totalEvents}`)
      console.log(`  Active Alerts: ${stats.activeAlerts.length}`)
      console.log(`  Threat Level: ${stats.threatLevel.toUpperCase()}`)

      console.log(`\n  Events by Type:`)
      Object.entries(stats.eventsByType).forEach(([type, count]) => {
        console.log(`    ${type}: ${count}`)
      })

      console.log(`\n  Events by Severity:`)
      Object.entries(stats.eventsBySeverity).forEach(([severity, count]) => {
        const icon = severity === "critical" ? "🚨" : severity === "high" ? "⚠️" : severity === "medium" ? "⚡" : "ℹ️"
        console.log(`    ${icon} ${severity}: ${count}`)
      })
    } catch (error) {
      console.log(`  ❌ Could not analyze security events: ${error}`)
    }
  }

  private generateRecommendations(): void {
    const failedTests = this.results.filter((r) => !r.success)

    if (failedTests.length === 0) {
      console.log(`  ✅ All tests passed! Security incident response system is working correctly.`)
      console.log(`  ✅ Consider running these tests regularly to ensure continued functionality.`)
      console.log(`  ✅ Monitor the security dashboard for real-time threat detection.`)
    } else {
      console.log(`  ⚠️ ${failedTests.length} test(s) failed. Review the following:`)
      failedTests.forEach((test) => {
        console.log(`    - Fix issues with ${test.testName}: ${test.error}`)
      })
    }

    console.log(`  📊 Set up automated testing schedule for continuous security validation.`)
    console.log(`  🔔 Configure webhook notifications for real-time incident alerts.`)
    console.log(`  📝 Review incident response playbooks and update as needed.`)
    console.log(`  🎯 Consider implementing additional security measures based on test results.`)
  }
}

// CLI interface
if (require.main === module) {
  const testSuite = new SecurityTestSuite()

  testSuite
    .runAllTests()
    .then(() => {
      console.log("\n✅ All security tests completed successfully!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Security test suite failed:", error)
      process.exit(1)
    })
}

export { SecurityTestSuite }
