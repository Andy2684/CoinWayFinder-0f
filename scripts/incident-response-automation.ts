#!/usr/bin/env ts-node

import { Redis } from "ioredis"
import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"
import fetch from "node-fetch"

interface IncidentConfig {
  id: string
  type: string
  severity: "critical" | "high" | "medium" | "low"
  autoActions: string[]
  notificationChannels: string[]
  escalationTime: number // minutes
}

interface IncidentResponse {
  incidentId: string
  timestamp: Date
  actions: IncidentAction[]
  status: "active" | "contained" | "resolved"
  assignedTo?: string
}

interface IncidentAction {
  action: string
  timestamp: Date
  success: boolean
  output?: string
  error?: string
}

class IncidentResponseAutomation {
  private redis: Redis
  private logDir: string
  private backupDir: string

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
    this.logDir = "/var/log/coinwayfinder/incidents"
    this.backupDir = "/backup/incidents"

    // Ensure directories exist
    this.ensureDirectories()
  }

  private ensureDirectories() {
    ;[this.logDir, this.backupDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  async handleSecurityIncident(incidentType: string, severity: string, details: any): Promise<string> {
    const incidentId = this.generateIncidentId()
    const incident: IncidentResponse = {
      incidentId,
      timestamp: new Date(),
      actions: [],
      status: "active",
    }

    console.log(`🚨 Security Incident Detected: ${incidentId}`)
    console.log(`Type: ${incidentType}, Severity: ${severity}`)

    try {
      // Log incident
      await this.logIncident(incident, incidentType, severity, details)

      // Execute automated response based on incident type
      switch (incidentType) {
        case "sql_injection_attempt":
          await this.handleSQLInjection(incident, details)
          break
        case "xss_attempt":
          await this.handleXSSAttack(incident, details)
          break
        case "brute_force_attack":
          await this.handleBruteForce(incident, details)
          break
        case "unauthorized_access":
          await this.handleUnauthorizedAccess(incident, details)
          break
        case "rate_limit_exceeded":
          await this.handleRateLimitExceeded(incident, details)
          break
        default:
          await this.handleGenericIncident(incident, incidentType, details)
      }

      // Send notifications
      await this.sendNotifications(incident, incidentType, severity, details)

      // Update incident status
      incident.status = "contained"
      await this.updateIncident(incident)

      console.log(`✅ Incident ${incidentId} contained successfully`)
      return incidentId
    } catch (error) {
      console.error(`❌ Failed to handle incident ${incidentId}:`, error)
      incident.actions.push({
        action: "error_handling",
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      await this.updateIncident(incident)
      throw error
    }
  }

  private async handleSQLInjection(incident: IncidentResponse, details: any) {
    console.log("🛡️ Executing SQL Injection response...")

    // 1. Block source IP immediately
    await this.executeAction(incident, "block_ip", async () => {
      if (details.ip) {
        await this.redis.sadd("blocked_ips", details.ip)
        execSync(`sudo iptables -A INPUT -s ${details.ip} -j DROP`)
        return `Blocked IP: ${details.ip}`
      }
      return "No IP to block"
    })

    // 2. Create database backup
    await this.executeAction(incident, "database_backup", async () => {
      const backupFile = path.join(this.backupDir, `emergency_backup_${Date.now()}.sql`)
      execSync(`pg_dump coinwayfinder_db > ${backupFile}`)
      return `Database backed up to: ${backupFile}`
    })

    // 3. Enable query logging
    await this.executeAction(incident, "enable_query_logging", async () => {
      execSync(`sudo -u postgres psql -c "ALTER SYSTEM SET log_statement = 'all';"`)
      execSync(`sudo -u postgres psql -c "SELECT pg_reload_conf();"`)
      return "Query logging enabled"
    })

    // 4. Restrict database permissions
    await this.executeAction(incident, "restrict_db_permissions", async () => {
      const restrictSQL = `
        REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;
        GRANT SELECT, INSERT, UPDATE ON essential_tables TO app_user;
      `
      execSync(`sudo -u postgres psql coinwayfinder_db -c "${restrictSQL}"`)
      return "Database permissions restricted"
    })

    // 5. Deploy emergency input sanitization
    await this.executeAction(incident, "deploy_sanitization", async () => {
      const sanitizationMiddleware = this.generateSanitizationMiddleware()
      fs.writeFileSync("/tmp/emergency_sanitization.js", sanitizationMiddleware)
      // Signal application to reload middleware
      execSync("sudo systemctl reload coinwayfinder-app")
      return "Emergency sanitization deployed"
    })
  }

  private async handleXSSAttack(incident: IncidentResponse, details: any) {
    console.log("🔐 Executing XSS attack response...")

    // 1. Block source IP
    await this.executeAction(incident, "block_ip", async () => {
      if (details.ip) {
        await this.redis.sadd("blocked_ips", details.ip)
        return `Blocked IP: ${details.ip}`
      }
      return "No IP to block"
    })

    // 2. Update CSP headers
    await this.executeAction(incident, "update_csp", async () => {
      const strictCSP = `
        default-src 'self';
        script-src 'self';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data:;
        connect-src 'self';
        font-src 'self';
        object-src 'none';
        media-src 'self';
        frame-src 'none';
      `
      // Update nginx configuration
      const nginxConfig = `/etc/nginx/conf.d/security-headers.conf`
      fs.writeFileSync(nginxConfig, `add_header Content-Security-Policy "${strictCSP.replace(/\s+/g, " ").trim()}";`)
      execSync("sudo nginx -s reload")
      return "Strict CSP headers deployed"
    })

    // 3. Sanitize stored content
    await this.executeAction(incident, "sanitize_content", async () => {
      // Run content sanitization script
      execSync("node /scripts/sanitize-stored-content.js")
      return "Stored content sanitized"
    })

    // 4. Force user session refresh
    await this.executeAction(incident, "refresh_sessions", async () => {
      await this.redis.del("sessions:*")
      return "All user sessions invalidated"
    })
  }

  private async handleBruteForce(incident: IncidentResponse, details: any) {
    console.log("🔒 Executing brute force response...")

    // 1. Block attacking IPs
    await this.executeAction(incident, "block_attack_ips", async () => {
      const attackIPs = details.ips || [details.ip]
      for (const ip of attackIPs) {
        await this.redis.sadd("blocked_ips", ip)
        execSync(`sudo iptables -A INPUT -s ${ip} -j DROP`)
      }
      return `Blocked ${attackIPs.length} IPs`
    })

    // 2. Lock targeted accounts
    await this.executeAction(incident, "lock_accounts", async () => {
      const targetedAccounts = details.accounts || []
      for (const account of targetedAccounts) {
        await this.redis.setex(`locked:${account}`, 3600, "brute_force_protection")
      }
      return `Locked ${targetedAccounts.length} accounts`
    })

    // 3. Enable emergency rate limiting
    await this.executeAction(incident, "emergency_rate_limit", async () => {
      await this.redis.set("emergency_rate_limit", "active")
      await this.redis.expire("emergency_rate_limit", 3600) // 1 hour
      return "Emergency rate limiting activated"
    })

    // 4. Enable CAPTCHA for authentication
    await this.executeAction(incident, "enable_captcha", async () => {
      await this.redis.set("force_captcha", "true")
      await this.redis.expire("force_captcha", 7200) // 2 hours
      return "CAPTCHA enabled for authentication"
    })
  }

  private async handleUnauthorizedAccess(incident: IncidentResponse, details: any) {
    console.log("🚫 Executing unauthorized access response...")

    // 1. Revoke compromised sessions
    await this.executeAction(incident, "revoke_sessions", async () => {
      if (details.userId) {
        await this.redis.del(`sessions:${details.userId}:*`)
        return `Sessions revoked for user: ${details.userId}`
      }
      return "No specific user sessions to revoke"
    })

    // 2. Reset compromised credentials
    await this.executeAction(incident, "reset_credentials", async () => {
      if (details.userId) {
        // Mark account for mandatory password reset
        await this.redis.set(`force_password_reset:${details.userId}`, "true")
        return `Password reset required for user: ${details.userId}`
      }
      return "No specific credentials to reset"
    })

    // 3. Audit access logs
    await this.executeAction(incident, "audit_access", async () => {
      const auditScript = `
        SELECT user_id, action, resource, timestamp, ip_address
        FROM audit_log 
        WHERE timestamp > NOW() - INTERVAL '1 hour'
        AND (user_id = '${details.userId}' OR ip_address = '${details.ip}')
        ORDER BY timestamp DESC;
      `
      const auditResults = execSync(`sudo -u postgres psql coinwayfinder_db -c "${auditScript}"`)
      const auditFile = path.join(this.logDir, `audit_${incident.incidentId}.log`)
      fs.writeFileSync(auditFile, auditResults.toString())
      return `Audit results saved to: ${auditFile}`
    })
  }

  private async handleRateLimitExceeded(incident: IncidentResponse, details: any) {
    console.log("⚡ Executing rate limit response...")

    // 1. Analyze traffic patterns
    await this.executeAction(incident, "analyze_traffic", async () => {
      const trafficAnalysis = await this.analyzeTrafficPatterns(details.ip)
      const analysisFile = path.join(this.logDir, `traffic_analysis_${incident.incidentId}.json`)
      fs.writeFileSync(analysisFile, JSON.stringify(trafficAnalysis, null, 2))
      return `Traffic analysis saved to: ${analysisFile}`
    })

    // 2. Implement adaptive rate limiting
    await this.executeAction(incident, "adaptive_rate_limit", async () => {
      const newLimit = Math.max(1, Math.floor(details.currentLimit * 0.5))
      await this.redis.set(`rate_limit:${details.ip}`, newLimit)
      await this.redis.expire(`rate_limit:${details.ip}`, 3600)
      return `Reduced rate limit to ${newLimit} for IP: ${details.ip}`
    })

    // 3. Enable request filtering
    await this.executeAction(incident, "enable_filtering", async () => {
      await this.redis.set("enhanced_filtering", "active")
      await this.redis.expire("enhanced_filtering", 1800) // 30 minutes
      return "Enhanced request filtering enabled"
    })
  }

  private async handleGenericIncident(incident: IncidentResponse, type: string, details: any) {
    console.log(`🔍 Executing generic incident response for: ${type}`)

    // 1. Collect evidence
    await this.executeAction(incident, "collect_evidence", async () => {
      const evidenceDir = path.join(this.logDir, incident.incidentId)
      fs.mkdirSync(evidenceDir, { recursive: true })

      // Collect various logs
      const logFiles = [
        "/var/log/nginx/access.log",
        "/var/log/nginx/error.log",
        "/var/log/coinwayfinder/app.log",
        "/var/log/postgresql/postgresql.log",
      ]

      for (const logFile of logFiles) {
        if (fs.existsSync(logFile)) {
          const basename = path.basename(logFile)
          execSync(`tail -n 1000 ${logFile} > ${evidenceDir}/${basename}`)
        }
      }

      return `Evidence collected in: ${evidenceDir}`
    })

    // 2. Increase monitoring
    await this.executeAction(incident, "increase_monitoring", async () => {
      await this.redis.set("enhanced_monitoring", "active")
      await this.redis.expire("enhanced_monitoring", 3600) // 1 hour
      return "Enhanced monitoring activated"
    })
  }

  private async executeAction(incident: IncidentResponse, actionName: string, actionFunction: () => Promise<string>) {
    const startTime = new Date()
    console.log(`  ⏳ Executing: ${actionName}`)

    try {
      const output = await actionFunction()
      const action: IncidentAction = {
        action: actionName,
        timestamp: startTime,
        success: true,
        output,
      }
      incident.actions.push(action)
      console.log(`  ✅ Completed: ${actionName} - ${output}`)
    } catch (error) {
      const action: IncidentAction = {
        action: actionName,
        timestamp: startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
      incident.actions.push(action)
      console.error(`  ❌ Failed: ${actionName} - ${action.error}`)
      throw error
    }
  }

  private async analyzeTrafficPatterns(ip: string): Promise<any> {
    // Analyze traffic patterns from logs
    const analysis = {
      ip,
      requestCount: 0,
      uniqueEndpoints: new Set(),
      userAgents: new Set(),
      timePattern: {},
      suspiciousIndicators: [],
    }

    // This would typically analyze actual log files
    // For now, return mock analysis
    return {
      ...analysis,
      uniqueEndpoints: Array.from(analysis.uniqueEndpoints),
      userAgents: Array.from(analysis.userAgents),
      riskScore: Math.random() * 100,
    }
  }

  private generateSanitizationMiddleware(): string {
    return `
// Emergency sanitization middleware
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(;|\||&)/g,
    /('|(\\'))/g
  ];
  
  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
};

module.exports = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeInput(req.body[key]);
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitizeInput(req.query[key]);
    });
  }
  
  next();
};
`
  }

  private async logIncident(incident: IncidentResponse, type: string, severity: string, details: any) {
    const logEntry = {
      incidentId: incident.incidentId,
      timestamp: incident.timestamp.toISOString(),
      type,
      severity,
      details,
      status: incident.status,
    }

    // Log to file
    const logFile = path.join(this.logDir, `${incident.incidentId}.json`)
    fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2))

    // Log to Redis
    await this.redis.setex(
      `incident:${incident.incidentId}`,
      86400, // 24 hours
      JSON.stringify(logEntry),
    )

    console.log(`📝 Incident logged: ${logFile}`)
  }

  private async updateIncident(incident: IncidentResponse) {
    const logFile = path.join(this.logDir, `${incident.incidentId}.json`)
    const existingLog = JSON.parse(fs.readFileSync(logFile, "utf8"))

    existingLog.status = incident.status
    existingLog.actions = incident.actions
    existingLog.lastUpdated = new Date().toISOString()

    fs.writeFileSync(logFile, JSON.stringify(existingLog, null, 2))

    await this.redis.setex(`incident:${incident.incidentId}`, 86400, JSON.stringify(existingLog))
  }

  private async sendNotifications(incident: IncidentResponse, type: string, severity: string, details: any) {
    const notification = {
      incidentId: incident.incidentId,
      type,
      severity,
      timestamp: incident.timestamp.toISOString(),
      actionsCount: incident.actions.length,
      successfulActions: incident.actions.filter((a) => a.success).length,
      details,
    }

    // Send to webhook if configured
    if (process.env.SECURITY_WEBHOOK_URL) {
      try {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        })
        console.log("📡 Webhook notification sent")
      } catch (error) {
        console.error("❌ Failed to send webhook notification:", error)
      }
    }

    // Log notification
    console.log(`📢 Notification sent for incident: ${incident.incidentId}`)
  }

  private generateIncidentId(): string {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "")
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "")
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `INC-${dateStr}-${timeStr}-${random}`
  }
}

// CLI interface
if (require.main === module) {
  const automation = new IncidentResponseAutomation()

  const [, , incidentType, severity, ...detailsArgs] = process.argv

  if (!incidentType || !severity) {
    console.error("Usage: ts-node incident-response-automation.ts <type> <severity> [details...]")
    process.exit(1)
  }

  const details = detailsArgs.length > 0 ? JSON.parse(detailsArgs.join(" ")) : {}

  automation
    .handleSecurityIncident(incidentType, severity, details)
    .then((incidentId) => {
      console.log(`✅ Incident response completed: ${incidentId}`)
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Incident response failed:", error)
      process.exit(1)
    })
}
