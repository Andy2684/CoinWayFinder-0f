import { securityMonitor, SecurityEventType, SecuritySeverity } from "../lib/security-monitor"

interface TestScenario {
  name: string
  description: string
  events: Array<{
    type: SecurityEventType
    severity: SecuritySeverity
    source: string
    ip: string
    userAgent: string
    details: Record<string, any>
    delay?: number
  }>
  expectedAlerts: string[]
  validation: (events: any[]) => boolean
}

class SpecificIncidentTester {
  private testResults: Array<{
    scenario: string
    passed: boolean
    details: string
    alerts: number
    events: number
  }> = []

  async runAllTests(): Promise<void> {
    console.log("🧪 Starting Specific Security Incident Tests")
    console.log("=".repeat(60))

    const scenarios = this.getTestScenarios()

    for (const scenario of scenarios) {
      await this.runTestScenario(scenario)
    }

    this.generateTestReport()
  }

  private getTestScenarios(): TestScenario[] {
    return [
      {
        name: "Advanced SQL Injection Campaign",
        description: "Simulates a sophisticated SQL injection attack with multiple vectors",
        events: [
          {
            type: SecurityEventType.SQL_INJECTION_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: "/api/users/search",
            ip: "192.168.1.100",
            userAgent: "sqlmap/1.6.12",
            details: {
              payload: "' OR '1'='1' --",
              parameter: "username",
              method: "POST",
            },
          },
          {
            type: SecurityEventType.SQL_INJECTION_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: "/api/auth/login",
            ip: "192.168.1.100",
            userAgent: "sqlmap/1.6.12",
            details: {
              payload: "'; DROP TABLE users; --",
              parameter: "password",
              method: "POST",
            },
            delay: 1000,
          },
          {
            type: SecurityEventType.SQL_INJECTION_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: "/api/products",
            ip: "192.168.1.100",
            userAgent: "sqlmap/1.6.12",
            details: {
              payload: "' UNION SELECT username, password FROM admin_users --",
              parameter: "category",
              method: "GET",
            },
            delay: 2000,
          },
          {
            type: SecurityEventType.UNAUTHORIZED_ACCESS,
            severity: SecuritySeverity.HIGH,
            source: "/admin/database",
            ip: "192.168.1.100",
            userAgent: "sqlmap/1.6.12",
            details: {
              attemptedResource: "/admin/database/export",
              authenticationFailed: true,
            },
            delay: 3000,
          },
        ],
        expectedAlerts: ["sql_injection_attempt_alert", "unauthorized_access_alert"],
        validation: (events) => events.filter((e) => e.type === SecurityEventType.SQL_INJECTION_ATTEMPT).length >= 3,
      },

      {
        name: "Cross-Site Scripting (XSS) Attack Variants",
        description: "Tests detection of various XSS attack vectors",
        events: [
          {
            type: SecurityEventType.XSS_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: "/api/comments",
            ip: "10.0.0.50",
            userAgent: "Mozilla/5.0 (AttackBot)",
            details: {
              payload: "<script>alert('XSS')</script>",
              parameter: "comment",
              method: "POST",
            },
          },
          {
            type: SecurityEventType.XSS_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: "/api/profile/update",
            ip: "10.0.0.50",
            userAgent: "Mozilla/5.0 (AttackBot)",
            details: {
              payload: "<img src=x onerror=alert(document.cookie)>",
              parameter: "bio",
              method: "PUT",
            },
            delay: 500,
          },
          {
            type: SecurityEventType.XSS_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: "/search",
            ip: "10.0.0.50",
            userAgent: "Mozilla/5.0 (AttackBot)",
            details: {
              payload: "javascript:alert('Stored XSS')",
              parameter: "query",
              method: "GET",
            },
            delay: 1000,
          },
          {
            type: SecurityEventType.CSP_VIOLATION,
            severity: SecuritySeverity.MEDIUM,
            source: "/dashboard",
            ip: "10.0.0.50",
            userAgent: "Mozilla/5.0 (AttackBot)",
            details: {
              violatedDirective: "script-src",
              blockedURI: "inline",
              documentURI: "/dashboard",
            },
            delay: 1500,
          },
        ],
        expectedAlerts: ["xss_attempt_alert", "csp_violation_alert"],
        validation: (events) => events.filter((e) => e.type === SecurityEventType.XSS_ATTEMPT).length >= 3,
      },

      {
        name: "Distributed Brute Force Attack",
        description: "Simulates a coordinated brute force attack from multiple IPs",
        events: [
          {
            type: SecurityEventType.FAILED_AUTH_ATTEMPTS,
            severity: SecuritySeverity.MEDIUM,
            source: "/api/auth/login",
            ip: "203.0.113.1",
            userAgent: "BruteForceBot/1.0",
            details: { username: "admin", attempt: 1 },
          },
          {
            type: SecurityEventType.FAILED_AUTH_ATTEMPTS,
            severity: SecuritySeverity.MEDIUM,
            source: "/api/auth/login",
            ip: "203.0.113.2",
            userAgent: "BruteForceBot/1.0",
            details: { username: "admin", attempt: 2 },
            delay: 200,
          },
          {
            type: SecurityEventType.FAILED_AUTH_ATTEMPTS,
            severity: SecuritySeverity.MEDIUM,
            source: "/api/auth/login",
            ip: "203.0.113.3",
            userAgent: "BruteForceBot/1.0",
            details: { username: "admin", attempt: 3 },
            delay: 400,
          },
          {
            type: SecurityEventType.BRUTE_FORCE_ATTACK,
            severity: SecuritySeverity.CRITICAL,
            source: "/api/auth/login",
            ip: "203.0.113.1",
            userAgent: "BruteForceBot/1.0",
            details: {
              username: "admin",
              attempts: 15,
              timeWindow: "5 minutes",
              coordinated: true,
            },
            delay: 600,
          },
          {
            type: SecurityEventType.RATE_LIMIT_EXCEEDED,
            severity: SecuritySeverity.HIGH,
            source: "/api/auth/login",
            ip: "203.0.113.1",
            userAgent: "BruteForceBot/1.0",
            details: { requestsPerMinute: 120, limit: 10 },
            delay: 800,
          },
        ],
        expectedAlerts: ["failed_authentication_alert", "brute_force_attack_alert", "rate_limit_exceeded_alert"],
        validation: (events) => events.filter((e) => e.type === SecurityEventType.BRUTE_FORCE_ATTACK).length >= 1,
      },

      {
        name: "API Abuse and Rate Limiting Bypass",
        description: "Tests detection of API abuse and rate limiting bypass attempts",
        events: [
          {
            type: SecurityEventType.RATE_LIMIT_EXCEEDED,
            severity: SecuritySeverity.MEDIUM,
            source: "/api/crypto/prices",
            ip: "172.16.0.100",
            userAgent: "ScrapingBot/2.0",
            details: { requestsPerSecond: 50, limit: 10 },
          },
          {
            type: SecurityEventType.API_ABUSE,
            severity: SecuritySeverity.HIGH,
            source: "/api/crypto/prices",
            ip: "172.16.0.100",
            userAgent: "ScrapingBot/2.0",
            details: {
              pattern: "bulk_data_extraction",
              requestsInBurst: 500,
              suspiciousHeaders: ["X-Forwarded-For", "X-Real-IP"],
            },
            delay: 1000,
          },
          {
            type: SecurityEventType.SUSPICIOUS_USER_AGENT,
            severity: SecuritySeverity.LOW,
            source: "/api/crypto/trends",
            ip: "172.16.0.101",
            userAgent: "python-requests/2.25.1",
            details: { automatedRequest: true, noJavaScript: true },
            delay: 2000,
          },
          {
            type: SecurityEventType.API_ABUSE,
            severity: SecuritySeverity.HIGH,
            source: "/api/news",
            ip: "172.16.0.102",
            userAgent: "curl/7.68.0",
            details: {
              pattern: "distributed_scraping",
              coordinatedIPs: ["172.16.0.100", "172.16.0.101", "172.16.0.102"],
            },
            delay: 3000,
          },
        ],
        expectedAlerts: ["rate_limit_exceeded_alert", "api_abuse_alert"],
        validation: (events) => events.filter((e) => e.type === SecurityEventType.API_ABUSE).length >= 2,
      },

      {
        name: "Insider Threat Simulation",
        description: "Simulates suspicious activity from authenticated users",
        events: [
          {
            type: SecurityEventType.SUSPICIOUS_LOGIN,
            severity: SecuritySeverity.HIGH,
            source: "/api/auth/login",
            ip: "192.168.1.200",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details: {
              userId: "user_123",
              username: "john.doe",
              location: "Unknown",
              timeOfDay: "03:00 AM",
              deviceFingerprint: "unknown_device",
            },
          },
          {
            type: SecurityEventType.UNAUTHORIZED_ACCESS,
            severity: SecuritySeverity.HIGH,
            source: "/api/admin/users",
            ip: "192.168.1.200",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details: {
              userId: "user_123",
              attemptedResource: "/api/admin/users/export",
              userRole: "standard_user",
              requiredRole: "admin",
            },
            delay: 1000,
          },
          {
            type: SecurityEventType.API_ABUSE,
            severity: SecuritySeverity.MEDIUM,
            source: "/api/user/data",
            ip: "192.168.1.200",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details: {
              userId: "user_123",
              pattern: "bulk_data_access",
              accessedRecords: 5000,
              normalPattern: 50,
            },
            delay: 2000,
          },
          {
            type: SecurityEventType.ADMIN_ACCESS_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: "/admin/system/config",
            ip: "192.168.1.200",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details: {
              userId: "user_123",
              attemptedAction: "modify_system_config",
              privilegeEscalation: true,
            },
            delay: 3000,
          },
        ],
        expectedAlerts: ["suspicious_login_alert", "unauthorized_access_alert", "admin_access_attempt_alert"],
        validation: (events) =>
          events.filter((e) => e.details.userId === "user_123").length >= 4 &&
          events.some((e) => e.type === SecurityEventType.ADMIN_ACCESS_ATTEMPT),
      },

      {
        name: "Advanced Persistent Threat (APT) Simulation",
        description: "Simulates a sophisticated, multi-stage APT attack",
        events: [
          {
            type: SecurityEventType.SUSPICIOUS_USER_AGENT,
            severity: SecuritySeverity.LOW,
            source: "/",
            ip: "198.51.100.50",
            userAgent: "Mozilla/5.0 (compatible; Reconnaissance/1.0)",
            details: {
              stage: "reconnaissance",
              scanType: "technology_detection",
              targetsIdentified: ["admin_panel", "api_endpoints"],
            },
          },
          {
            type: SecurityEventType.SQL_INJECTION_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: "/api/search",
            ip: "198.51.100.51",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details: {
              stage: "initial_access",
              payload: "' AND (SELECT SUBSTRING(@@version,1,1))='5' --",
              technique: "blind_sql_injection",
              dataExfiltration: true,
            },
            delay: 5000,
          },
          {
            type: SecurityEventType.UNAUTHORIZED_ACCESS,
            severity: SecuritySeverity.HIGH,
            source: "/api/internal/config",
            ip: "198.51.100.52",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details: {
              stage: "privilege_escalation",
              exploitedVulnerability: "sql_injection",
              accessedResources: ["database_config", "api_keys"],
            },
            delay: 10000,
          },
          {
            type: SecurityEventType.API_ABUSE,
            severity: SecuritySeverity.HIGH,
            source: "/api/users/export",
            ip: "198.51.100.53",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details: {
              stage: "data_exfiltration",
              dataVolume: "50MB",
              recordsAccessed: 10000,
              compressionUsed: true,
              encryptionDetected: true,
            },
            delay: 15000,
          },
          {
            type: SecurityEventType.MALICIOUS_PAYLOAD,
            severity: SecuritySeverity.CRITICAL,
            source: "/api/system/update",
            ip: "198.51.100.54",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details: {
              stage: "persistence",
              payloadType: "backdoor",
              technique: "supply_chain_compromise",
              persistenceMechanism: "scheduled_task",
            },
            delay: 20000,
          },
        ],
        expectedAlerts: [
          "sql_injection_attempt_alert",
          "unauthorized_access_alert",
          "api_abuse_alert",
          "malicious_payload_alert",
        ],
        validation: (events) => {
          const stages = events.map((e) => e.details.stage).filter(Boolean)
          return (
            stages.includes("reconnaissance") &&
            stages.includes("initial_access") &&
            stages.includes("privilege_escalation") &&
            stages.includes("data_exfiltration") &&
            stages.includes("persistence")
          )
        },
      },
    ]
  }

  private async runTestScenario(scenario: TestScenario): Promise<void> {
    console.log(`\n🎯 Running Test: ${scenario.name}`)
    console.log(`📝 Description: ${scenario.description}`)
    console.log("-".repeat(60))

    const startTime = Date.now()
    const initialEventCount = securityMonitor.getAllEvents().length
    const initialAlertCount = securityMonitor.getActiveAlerts().length

    try {
      // Execute all events in the scenario
      for (const eventData of scenario.events) {
        if (eventData.delay) {
          await this.sleep(eventData.delay)
        }

        await securityMonitor.logSecurityEvent({
          type: eventData.type,
          severity: eventData.severity,
          source: eventData.source,
          ip: eventData.ip,
          userAgent: eventData.userAgent,
          details: eventData.details,
        })

        console.log(`   ✓ Event logged: ${eventData.type} from ${eventData.ip}`)
      }

      // Wait a moment for alert processing
      await this.sleep(1000)

      // Validate results
      const finalEvents = securityMonitor.getAllEvents()
      const newEvents = finalEvents.slice(0, finalEvents.length - initialEventCount)
      const finalAlerts = securityMonitor.getActiveAlerts()
      const newAlerts = finalAlerts.length - initialAlertCount

      const validationPassed = scenario.validation(newEvents)
      const expectedAlertsTriggered = scenario.expectedAlerts.some((alertType) =>
        finalAlerts.some((alert) => alert.id.includes(alertType.replace("_alert", ""))),
      )

      const testPassed = validationPassed && (expectedAlertsTriggered || scenario.expectedAlerts.length === 0)

      const duration = Date.now() - startTime

      console.log(`\n📊 Test Results:`)
      console.log(`   Events Generated: ${scenario.events.length}`)
      console.log(`   New Alerts: ${newAlerts}`)
      console.log(`   Validation: ${validationPassed ? "PASSED" : "FAILED"}`)
      console.log(`   Alert Check: ${expectedAlertsTriggered ? "PASSED" : "FAILED"}`)
      console.log(`   Overall: ${testPassed ? "PASSED" : "FAILED"}`)
      console.log(`   Duration: ${duration}ms`)

      this.testResults.push({
        scenario: scenario.name,
        passed: testPassed,
        details: testPassed ? "All validations passed" : "Some validations failed",
        alerts: newAlerts,
        events: scenario.events.length,
      })

      if (testPassed) {
        console.log(`🎉 ${scenario.name} completed successfully!`)
      } else {
        console.log(`❌ ${scenario.name} failed validation!`)
      }
    } catch (error) {
      console.error(`❌ Test failed with error:`, error)

      this.testResults.push({
        scenario: scenario.name,
        passed: false,
        details: `Error: ${error}`,
        alerts: 0,
        events: 0,
      })
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private generateTestReport(): void {
    console.log("\n" + "=".repeat(80))
    console.log("📋 SPECIFIC INCIDENT TEST REPORT")
    console.log("=".repeat(80))

    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter((result) => result.passed).length
    const failedTests = totalTests - passedTests

    console.log(`\nSummary:`)
    console.log(`   Total Tests: ${totalTests}`)
    console.log(`   Passed: ${passedTests}`)
    console.log(`   Failed: ${failedTests}`)
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

    console.log(`\nDetailed Results:`)
    this.testResults.forEach((result, index) => {
      const status = result.passed ? "PASS" : "FAIL"
      console.log(`   ${index + 1}. ${result.scenario}: ${status}`)
      console.log(`      Events: ${result.events}, Alerts: ${result.alerts}`)
      console.log(`      Details: ${result.details}`)
    })

    // Security system statistics
    const stats = securityMonitor.getSecurityStats()
    const threatLevel = securityMonitor.calculateThreatLevel()

    console.log(`\nSecurity System Status:`)
    console.log(`   Total Events Logged: ${stats.totalEvents}`)
    console.log(`   Active Alerts: ${stats.activeAlerts}`)
    console.log(`   Current Threat Level: ${threatLevel.level.toUpperCase()}`)
    console.log(`   Threat Score: ${threatLevel.score}`)

    if (threatLevel.factors.length > 0) {
      console.log(`   Threat Factors: ${threatLevel.factors.join(", ")}`)
    }

    console.log(`\nRecommendations:`)
    console.log(`   ${threatLevel.recommendation}`)

    if (failedTests > 0) {
      console.log(`\nFailed Tests Require Attention:`)
      this.testResults
        .filter((result) => !result.passed)
        .forEach((result) => {
          console.log(`   - ${result.scenario}: ${result.details}`)
        })
    }

    console.log("\n" + "=".repeat(80))
    console.log(`🎯 Specific Incident Testing Complete!`)
    console.log("=".repeat(80))
  }

  async runSingleTest(testName: string): Promise<void> {
    const scenarios = this.getTestScenarios()
    const scenario = scenarios.find((s) => s.name.toLowerCase().includes(testName.toLowerCase()))

    if (!scenario) {
      console.error(`❌ Test scenario "${testName}" not found`)
      console.log("Available scenarios:")
      scenarios.forEach((s, index) => {
        console.log(`   ${index + 1}. ${s.name}`)
      })
      return
    }

    await this.runTestScenario(scenario)
    this.generateTestReport()
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || "all"

  const tester = new SpecificIncidentTester()

  switch (command) {
    case "all":
      await tester.runAllTests()
      break

    case "sql":
      await tester.runSingleTest("sql injection")
      break

    case "xss":
      await tester.runSingleTest("xss")
      break

    case "brute":
      await tester.runSingleTest("brute force")
      break

    case "api":
      await tester.runSingleTest("api abuse")
      break

    case "insider":
      await tester.runSingleTest("insider threat")
      break

    case "apt":
      await tester.runSingleTest("apt")
      break

    default:
      console.log("Usage:")
      console.log("  npm run test-incidents")
      console.log("  node scripts/test-specific-incidents.ts [test]")
      console.log("")
      console.log("Available tests:")
      console.log("  all      - Run all incident tests")
      console.log("  sql      - SQL injection campaign")
      console.log("  xss      - Cross-site scripting variants")
      console.log("  brute    - Distributed brute force attack")
      console.log("  api      - API abuse and rate limiting bypass")
      console.log("  insider  - Insider threat simulation")
      console.log("  apt      - Advanced persistent threat")
      break
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
