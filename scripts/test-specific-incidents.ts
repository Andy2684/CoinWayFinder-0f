import { securityMonitor, SecurityEventType, SecuritySeverity } from "../lib/security-monitor"

export class SpecificIncidentTester {
  async testAdvancedSQLInjection(): Promise<void> {
    console.log("🔍 Testing Advanced SQL Injection Scenarios...")

    const sqlPayloads = [
      {
        name: "Union-based injection",
        payload: "' UNION SELECT username, password FROM users--",
        severity: SecuritySeverity.CRITICAL,
      },
      {
        name: "Time-based blind injection",
        payload: "'; WAITFOR DELAY '00:00:05'--",
        severity: SecuritySeverity.CRITICAL,
      },
      {
        name: "Boolean-based blind injection",
        payload: "' AND (SELECT COUNT(*) FROM users) > 0--",
        severity: SecuritySeverity.HIGH,
      },
      {
        name: "Second-order injection",
        payload: "admin'; DROP TABLE logs; --",
        severity: SecuritySeverity.CRITICAL,
      },
    ]

    for (const [index, attack] of sqlPayloads.entries()) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.SQL_INJECTION_ATTEMPT,
        severity: attack.severity,
        source: `/api/users/search`,
        ip: `192.168.1.${100 + index}`,
        userAgent: "SQLMap/1.0",
        details: {
          attackType: attack.name,
          payload: attack.payload,
          parameter: "search",
          method: "POST",
        },
      })

      console.log(`  ✅ ${attack.name} - ${attack.payload}`)
    }
  }

  async testXSSVariants(): Promise<void> {
    console.log("🔍 Testing XSS Attack Variants...")

    const xssPayloads = [
      {
        name: "Stored XSS",
        payload: '<script>document.cookie="stolen="+document.cookie</script>',
        severity: SecuritySeverity.CRITICAL,
      },
      {
        name: "Reflected XSS",
        payload: '<img src=x onerror=alert("XSS")>',
        severity: SecuritySeverity.HIGH,
      },
      {
        name: "DOM-based XSS",
        payload: 'javascript:alert("DOM XSS")',
        severity: SecuritySeverity.HIGH,
      },
      {
        name: "Filter evasion XSS",
        payload: "<svg/onload=alert(String.fromCharCode(88,83,83))>",
        severity: SecuritySeverity.CRITICAL,
      },
    ]

    for (const [index, attack] of xssPayloads.entries()) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.XSS_ATTEMPT,
        severity: attack.severity,
        source: `/api/comments`,
        ip: `10.0.0.${50 + index}`,
        userAgent: "Mozilla/5.0 (XSS Scanner)",
        details: {
          attackType: attack.name,
          payload: attack.payload,
          parameter: "comment",
          method: "POST",
        },
      })

      console.log(`  ✅ ${attack.name} - ${attack.payload}`)
    }
  }

  async testDistributedAttacks(): Promise<void> {
    console.log("🔍 Testing Distributed Attack Scenarios...")

    // Simulate DDoS attack from multiple IPs
    const attackIPs = ["203.0.113.1", "203.0.113.2", "203.0.113.3", "203.0.113.4", "203.0.113.5"]

    for (const ip of attackIPs) {
      // Multiple rate limit violations from each IP
      for (let i = 0; i < 25; i++) {
        await securityMonitor.logSecurityEvent({
          type: SecurityEventType.RATE_LIMIT_EXCEEDED,
          severity: SecuritySeverity.MEDIUM,
          source: `/api/login`,
          ip: ip,
          userAgent: "AttackBot/2.0",
          details: {
            endpoint: "/api/login",
            requestCount: i + 1,
            timeWindow: "1 minute",
          },
        })
      }
      console.log(`  ✅ Simulated DDoS from ${ip} (25 requests)`)
    }

    // Coordinated brute force attack
    const targetAccounts = ["admin", "administrator", "root", "user", "test"]
    for (const account of targetAccounts) {
      for (const ip of attackIPs.slice(0, 3)) {
        await securityMonitor.logSecurityEvent({
          type: SecurityEventType.BRUTE_FORCE_ATTACK,
          severity: SecuritySeverity.CRITICAL,
          source: `/api/auth/login`,
          ip: ip,
          userAgent: "BruteForcer/1.0",
          details: {
            targetAccount: account,
            attempts: 50,
            coordinated: true,
          },
        })
      }
      console.log(`  ✅ Coordinated brute force on account: ${account}`)
    }
  }

  async testInsiderThreats(): Promise<void> {
    console.log("🔍 Testing Insider Threat Scenarios...")

    const insiderScenarios = [
      {
        name: "Privilege escalation attempt",
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        severity: SecuritySeverity.HIGH,
        details: {
          userId: "emp_12345",
          attemptedResource: "/admin/users",
          currentRole: "user",
          attemptedRole: "admin",
        },
      },
      {
        name: "Data exfiltration attempt",
        type: SecurityEventType.SUSPICIOUS_LOGIN,
        severity: SecuritySeverity.CRITICAL,
        details: {
          userId: "emp_67890",
          dataAccessed: "customer_database",
          downloadSize: "500MB",
          timeOfDay: "2:30 AM",
        },
      },
      {
        name: "System manipulation",
        type: SecurityEventType.ADMIN_ACCESS_ATTEMPT,
        severity: SecuritySeverity.CRITICAL,
        details: {
          userId: "emp_54321",
          action: "modify_audit_logs",
          systemComponent: "logging_service",
        },
      },
    ]

    for (const [index, scenario] of insiderScenarios.entries()) {
      await securityMonitor.logSecurityEvent({
        type: scenario.type,
        severity: scenario.severity,
        source: `/internal/system`,
        ip: `192.168.10.${10 + index}`,
        userAgent: "Internal System",
        userId: scenario.details.userId,
        details: {
          threatType: "insider",
          scenario: scenario.name,
          ...scenario.details,
        },
      })

      console.log(`  ✅ ${scenario.name}`)
    }
  }

  async testAPTSimulation(): Promise<void> {
    console.log("🔍 Testing Advanced Persistent Threat (APT) Simulation...")

    // Phase 1: Initial compromise
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_LOGIN,
      severity: SecuritySeverity.HIGH,
      source: `/api/auth/login`,
      ip: "tor-exit-node.onion", // Simulated Tor exit node
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      details: {
        phase: "initial_compromise",
        method: "spear_phishing",
        targetUser: "finance_manager",
        location: "Unknown (Tor)",
      },
    })

    // Phase 2: Lateral movement
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: SecuritySeverity.CRITICAL,
      source: `/internal/network`,
      ip: "192.168.1.150",
      userAgent: "Internal Scanner",
      details: {
        phase: "lateral_movement",
        method: "credential_dumping",
        targetSystems: ["file_server", "database_server", "backup_server"],
        toolsUsed: ["mimikatz", "psexec"],
      },
    })

    // Phase 3: Data exfiltration
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.API_ABUSE,
      severity: SecuritySeverity.CRITICAL,
      source: `/api/data/export`,
      ip: "192.168.1.150",
      userAgent: "Custom Exfiltration Tool",
      details: {
        phase: "data_exfiltration",
        method: "api_abuse",
        dataTypes: ["customer_records", "financial_data", "trade_secrets"],
        volumeGB: 2.5,
        destination: "external_server",
      },
    })

    console.log("  ✅ APT Phase 1: Initial compromise via spear phishing")
    console.log("  ✅ APT Phase 2: Lateral movement and credential dumping")
    console.log("  ✅ APT Phase 3: Data exfiltration via API abuse")
  }

  async runAllTests(): Promise<void> {
    console.log("🚀 Running All Specific Incident Tests")
    console.log("=".repeat(50))

    try {
      await this.testAdvancedSQLInjection()
      console.log()

      await this.testXSSVariants()
      console.log()

      await this.testDistributedAttacks()
      console.log()

      await this.testInsiderThreats()
      console.log()

      await this.testAPTSimulation()
      console.log()

      console.log("✅ All specific incident tests completed successfully!")
    } catch (error) {
      console.error("❌ Specific incident tests failed:", error)
      throw error
    }
  }
}

// CLI interface
if (require.main === module) {
  const tester = new SpecificIncidentTester()

  tester
    .runAllTests()
    .then(() => {
      console.log("✅ All tests completed!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Tests failed:", error)
      process.exit(1)
    })
}
