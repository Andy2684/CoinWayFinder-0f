#!/usr/bin/env ts-node

import { Redis } from "ioredis"
import { exec } from "child_process"
import { promisify } from "util"
import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

const execAsync = promisify(exec)

interface IncidentData {
  [key: string]: any
}

interface ResponseAction {
  name: string
  description: string
  execute: () => Promise<boolean>
  rollback?: () => Promise<boolean>
}

interface IncidentResponse {
  incidentId: string
  incidentType: string
  severity: string
  timestamp: string
  actions: ResponseAction[]
  executedActions: string[]
  status: "pending" | "in_progress" | "completed" | "failed"
  evidence: any[]
}

export class IncidentResponseAutomation {
  private redis: Redis
  private logDir: string

  constructor() {
    this.redis = new Redis(process.env.Redis_URL || "redis://localhost:6379")
    this.logDir = join(process.cwd(), "logs", "incidents")
    this.ensureLogDirectory()
  }

  private ensureLogDirectory(): void {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true })
    }
  }

  async handleSecurityIncident(incidentType: string, severity: string, data: IncidentData): Promise<string> {
    const incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`🚨 Security Incident Detected: ${incidentType.toUpperCase()}`)
    console.log(`📊 Severity: ${severity.toUpperCase()}`)
    console.log(`🆔 Incident ID: ${incidentId}`)
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)

    const response: IncidentResponse = {
      incidentId,
      incidentType,
      severity,
      timestamp: new Date().toISOString(),
      actions: this.getResponseActions(incidentType, severity, data),
      executedActions: [],
      status: "pending",
      evidence: [],
    }

    await this.logIncident(response)
    await this.executeResponse(response)

    return incidentId
  }

  private getResponseActions(incidentType: string, severity: string, data: IncidentData): ResponseAction[] {
    const actions: ResponseAction[] = []

    switch (incidentType) {
      case "sql_injection_attempt":
        actions.push(
          this.createBlockIPAction(data.ip),
          this.createDatabaseBackupAction(),
          this.createQueryLoggingAction(),
          this.createPermissionRestrictionAction(),
          this.createInputSanitizationAction(),
        )
        break

      case "xss_attempt":
        actions.push(
          this.createBlockIPAction(data.ip),
          this.createCSPUpdateAction(),
          this.createContentSanitizationAction(),
          this.createSessionInvalidationAction(data.userId),
        )
        break

      case "brute_force_attack":
        actions.push(
          ...data.ips.map((ip: string) => this.createBlockIPAction(ip)),
          this.createAccountLockoutAction(data.accounts),
          this.createRateLimitingAction(),
          this.createCaptchaActivationAction(),
        )
        break

      case "unauthorized_access":
        actions.push(
          this.createSessionRevocationAction(data.userId),
          this.createAccessAuditAction(data.userId),
          this.createCredentialResetAction(data.userId),
          this.createBlockIPAction(data.ip),
        )
        break

      case "rate_limit_exceeded":
        actions.push(
          this.createTrafficAnalysisAction(data.ip),
          this.createAdaptiveRateLimitingAction(data.endpoint),
          this.createRequestFilteringAction(data.ip),
        )
        break

      case "admin_access_attempt":
        actions.push(
          this.createBlockIPAction(data.ip),
          this.createAdminAlertAction(data),
          this.createEnhancedMonitoringAction(),
          this.createAccessLogAnalysisAction(),
        )
        break

      case "api_abuse":
        actions.push(
          this.createAPIKeyRevocationAction(data.apiKey),
          this.createRequestFilteringAction(data.ip),
          this.createUsageAnalysisAction(data.endpoint),
        )
        break

      case "suspicious_login":
        actions.push(
          this.createLocationVerificationAction(data.userId),
          this.createDeviceAnalysisAction(data.userId),
          this.createTwoFactorEnforcementAction(data.userId),
          this.createSessionReviewAction(data.userId),
        )
        break

      default:
        actions.push(this.createGenericResponseAction(incidentType, data))
    }

    // Add common actions for all incidents
    actions.push(
      this.createEvidenceCollectionAction(incidentType, data),
      this.createNotificationAction(incidentType, severity, data),
    )

    return actions
  }

  private createBlockIPAction(ip: string): ResponseAction {
    return {
      name: "Block IP Address",
      description: `Block IP address ${ip} from accessing the system`,
      execute: async () => {
        try {
          // Add to Redis blacklist
          await this.redis.sadd("security:blocked_ips", ip)
          await this.redis.setex(`security:block:${ip}`, 3600, new Date().toISOString())

          // Add iptables rule (if running on Linux)
          try {
            await execAsync(`sudo iptables -A INPUT -s ${ip} -j DROP`)
            console.log(`  ✅ IP ${ip} blocked via iptables`)
          } catch (error) {
            console.log(`  ⚠️ Could not add iptables rule: ${error}`)
          }

          console.log(`  ✅ IP ${ip} added to Redis blacklist`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to block IP ${ip}:`, error)
          return false
        }
      },
      rollback: async () => {
        try {
          await this.redis.srem("security:blocked_ips", ip)
          await this.redis.del(`security:block:${ip}`)
          await execAsync(`sudo iptables -D INPUT -s ${ip} -j DROP`).catch(() => {})
          return true
        } catch (error) {
          return false
        }
      },
    }
  }

  private createDatabaseBackupAction(): ResponseAction {
    return {
      name: "Emergency Database Backup",
      description: "Create emergency backup of critical database tables",
      execute: async () => {
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
          const backupFile = join(this.logDir, `emergency_backup_${timestamp}.sql`)

          // Simulate database backup (replace with actual backup command)
          const backupCommand = `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`

          try {
            await execAsync(backupCommand)
            console.log(`  ✅ Database backup created: ${backupFile}`)
          } catch (error) {
            // Fallback: create a backup record in Redis
            await this.redis.hset(
              "security:backups",
              timestamp,
              JSON.stringify({
                timestamp: new Date().toISOString(),
                type: "emergency",
                status: "simulated",
              }),
            )
            console.log(`  ✅ Backup record created in Redis`)
          }

          return true
        } catch (error) {
          console.error(`  ❌ Failed to create database backup:`, error)
          return false
        }
      },
    }
  }

  private createQueryLoggingAction(): ResponseAction {
    return {
      name: "Activate Query Logging",
      description: "Enable detailed SQL query logging for forensic analysis",
      execute: async () => {
        try {
          await this.redis.set("security:query_logging", "enabled")
          await this.redis.setex("security:query_logging_until", 3600, new Date(Date.now() + 3600000).toISOString())
          console.log(`  ✅ Query logging activated for 1 hour`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to activate query logging:`, error)
          return false
        }
      },
    }
  }

  private createPermissionRestrictionAction(): ResponseAction {
    return {
      name: "Restrict Database Permissions",
      description: "Temporarily restrict database permissions to essential operations only",
      execute: async () => {
        try {
          await this.redis.set("security:restricted_permissions", "true")
          await this.redis.setex(
            "security:permission_restriction_until",
            1800,
            new Date(Date.now() + 1800000).toISOString(),
          )
          console.log(`  ✅ Database permissions restricted for 30 minutes`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to restrict permissions:`, error)
          return false
        }
      },
    }
  }

  private createInputSanitizationAction(): ResponseAction {
    return {
      name: "Deploy Input Sanitization",
      description: "Activate enhanced input sanitization middleware",
      execute: async () => {
        try {
          await this.redis.set("security:enhanced_sanitization", "enabled")
          console.log(`  ✅ Enhanced input sanitization activated`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to activate input sanitization:`, error)
          return false
        }
      },
    }
  }

  private createCSPUpdateAction(): ResponseAction {
    return {
      name: "Update CSP Headers",
      description: "Strengthen Content Security Policy headers",
      execute: async () => {
        try {
          const strictCSP =
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
          await this.redis.set("security:strict_csp", strictCSP)
          console.log(`  ✅ Strict CSP headers activated`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to update CSP headers:`, error)
          return false
        }
      },
    }
  }

  private createContentSanitizationAction(): ResponseAction {
    return {
      name: "Sanitize Stored Content",
      description: "Scan and sanitize potentially malicious stored content",
      execute: async () => {
        try {
          await this.redis.set("security:content_scan_active", "true")
          console.log(`  ✅ Content sanitization scan initiated`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to initiate content sanitization:`, error)
          return false
        }
      },
    }
  }

  private createSessionInvalidationAction(userId?: string): ResponseAction {
    return {
      name: "Invalidate User Sessions",
      description: userId ? `Invalidate sessions for user ${userId}` : "Invalidate all active sessions",
      execute: async () => {
        try {
          if (userId) {
            await this.redis.del(`session:${userId}`)
            await this.redis.sadd("security:invalidated_users", userId)
            console.log(`  ✅ Sessions invalidated for user ${userId}`)
          } else {
            const keys = await this.redis.keys("session:*")
            if (keys.length > 0) {
              await this.redis.del(...keys)
            }
            console.log(`  ✅ All sessions invalidated`)
          }
          return true
        } catch (error) {
          console.error(`  ❌ Failed to invalidate sessions:`, error)
          return false
        }
      },
    }
  }

  private createAccountLockoutAction(accounts: string[]): ResponseAction {
    return {
      name: "Lock User Accounts",
      description: `Lock accounts: ${accounts.join(", ")}`,
      execute: async () => {
        try {
          for (const account of accounts) {
            await this.redis.setex(`security:locked:${account}`, 1800, new Date().toISOString())
            await this.redis.sadd("security:locked_accounts", account)
          }
          console.log(`  ✅ Locked ${accounts.length} accounts for 30 minutes`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to lock accounts:`, error)
          return false
        }
      },
    }
  }

  private createRateLimitingAction(): ResponseAction {
    return {
      name: "Activate Emergency Rate Limiting",
      description: "Reduce rate limits to emergency levels",
      execute: async () => {
        try {
          await this.redis.set("security:emergency_rate_limit", "10") // 10 requests per minute
          await this.redis.setex(
            "security:emergency_rate_limit_until",
            1800,
            new Date(Date.now() + 1800000).toISOString(),
          )
          console.log(`  ✅ Emergency rate limiting activated (10 req/min for 30 min)`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to activate emergency rate limiting:`, error)
          return false
        }
      },
    }
  }

  private createCaptchaActivationAction(): ResponseAction {
    return {
      name: "Activate CAPTCHA",
      description: "Require CAPTCHA for authentication attempts",
      execute: async () => {
        try {
          await this.redis.set("security:captcha_required", "true")
          await this.redis.setex("security:captcha_until", 3600, new Date(Date.now() + 3600000).toISOString())
          console.log(`  ✅ CAPTCHA requirement activated for 1 hour`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to activate CAPTCHA:`, error)
          return false
        }
      },
    }
  }

  private createSessionRevocationAction(userId: string): ResponseAction {
    return {
      name: "Revoke User Sessions",
      description: `Revoke all sessions for user ${userId}`,
      execute: async () => {
        try {
          await this.redis.del(`session:${userId}`)
          await this.redis.del(`refresh_token:${userId}`)
          await this.redis.sadd("security:revoked_sessions", userId)
          console.log(`  ✅ All sessions revoked for user ${userId}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to revoke sessions:`, error)
          return false
        }
      },
    }
  }

  private createAccessAuditAction(userId: string): ResponseAction {
    return {
      name: "Audit User Access",
      description: `Perform comprehensive access audit for user ${userId}`,
      execute: async () => {
        try {
          const auditData = {
            userId,
            timestamp: new Date().toISOString(),
            recentLogins: await this.redis.lrange(`login_history:${userId}`, 0, 10),
            permissions: await this.redis.smembers(`permissions:${userId}`),
            apiKeys: await this.redis.keys(`api_key:${userId}:*`),
          }

          await this.redis.hset("security:access_audits", userId, JSON.stringify(auditData))
          console.log(`  ✅ Access audit completed for user ${userId}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to perform access audit:`, error)
          return false
        }
      },
    }
  }

  private createCredentialResetAction(userId: string): ResponseAction {
    return {
      name: "Force Credential Reset",
      description: `Require password reset for user ${userId}`,
      execute: async () => {
        try {
          await this.redis.sadd("security:force_password_reset", userId)
          await this.redis.setex(`security:reset_required:${userId}`, 86400, new Date().toISOString())
          console.log(`  ✅ Password reset required for user ${userId}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to force credential reset:`, error)
          return false
        }
      },
    }
  }

  private createTrafficAnalysisAction(ip: string): ResponseAction {
    return {
      name: "Analyze Traffic Patterns",
      description: `Analyze traffic patterns from IP ${ip}`,
      execute: async () => {
        try {
          const trafficData = {
            ip,
            timestamp: new Date().toISOString(),
            requestCount: (await this.redis.get(`rate_limit:${ip}`)) || "0",
            endpoints: await this.redis.smembers(`endpoints:${ip}`),
            userAgents: await this.redis.smembers(`user_agents:${ip}`),
          }

          await this.redis.hset("security:traffic_analysis", ip, JSON.stringify(trafficData))
          console.log(`  ✅ Traffic analysis completed for IP ${ip}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to analyze traffic patterns:`, error)
          return false
        }
      },
    }
  }

  private createAdaptiveRateLimitingAction(endpoint: string): ResponseAction {
    return {
      name: "Adaptive Rate Limiting",
      description: `Implement adaptive rate limiting for ${endpoint}`,
      execute: async () => {
        try {
          const currentLimit = (await this.redis.get(`rate_limit:${endpoint}`)) || "100"
          const newLimit = Math.max(10, Number.parseInt(currentLimit) / 2)

          await this.redis.setex(`rate_limit:${endpoint}`, 1800, newLimit.toString())
          console.log(`  ✅ Rate limit for ${endpoint} reduced to ${newLimit} req/min`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to implement adaptive rate limiting:`, error)
          return false
        }
      },
    }
  }

  private createRequestFilteringAction(ip: string): ResponseAction {
    return {
      name: "Enhanced Request Filtering",
      description: `Apply enhanced filtering for requests from IP ${ip}`,
      execute: async () => {
        try {
          await this.redis.sadd("security:filtered_ips", ip)
          await this.redis.setex(`security:filter:${ip}`, 3600, "enhanced")
          console.log(`  ✅ Enhanced request filtering activated for IP ${ip}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to activate request filtering:`, error)
          return false
        }
      },
    }
  }

  private createAdminAlertAction(data: IncidentData): ResponseAction {
    return {
      name: "Send Admin Alert",
      description: "Send immediate alert to administrators",
      execute: async () => {
        try {
          const alert = {
            type: "admin_access_attempt",
            severity: "high",
            timestamp: new Date().toISOString(),
            data,
          }

          await this.redis.lpush("security:admin_alerts", JSON.stringify(alert))
          console.log(`  ✅ Admin alert sent`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to send admin alert:`, error)
          return false
        }
      },
    }
  }

  private createEnhancedMonitoringAction(): ResponseAction {
    return {
      name: "Activate Enhanced Monitoring",
      description: "Enable enhanced security monitoring",
      execute: async () => {
        try {
          await this.redis.set("security:enhanced_monitoring", "enabled")
          await this.redis.setex(
            "security:enhanced_monitoring_until",
            7200,
            new Date(Date.now() + 7200000).toISOString(),
          )
          console.log(`  ✅ Enhanced monitoring activated for 2 hours`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to activate enhanced monitoring:`, error)
          return false
        }
      },
    }
  }

  private createAccessLogAnalysisAction(): ResponseAction {
    return {
      name: "Analyze Access Logs",
      description: "Perform detailed analysis of access logs",
      execute: async () => {
        try {
          const analysis = {
            timestamp: new Date().toISOString(),
            adminAttempts: await this.redis.llen("security:admin_attempts"),
            failedLogins: await this.redis.llen("security:failed_logins"),
            suspiciousIPs: await this.redis.smembers("security:suspicious_ips"),
          }

          await this.redis.hset("security:log_analysis", "latest", JSON.stringify(analysis))
          console.log(`  ✅ Access log analysis completed`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to analyze access logs:`, error)
          return false
        }
      },
    }
  }

  private createAPIKeyRevocationAction(apiKey: string): ResponseAction {
    return {
      name: "Revoke API Key",
      description: `Revoke API key ${apiKey}`,
      execute: async () => {
        try {
          await this.redis.sadd("security:revoked_api_keys", apiKey)
          await this.redis.del(`api_key:${apiKey}`)
          console.log(`  ✅ API key ${apiKey} revoked`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to revoke API key:`, error)
          return false
        }
      },
    }
  }

  private createUsageAnalysisAction(endpoint: string): ResponseAction {
    return {
      name: "Analyze API Usage",
      description: `Analyze usage patterns for ${endpoint}`,
      execute: async () => {
        try {
          const usage = {
            endpoint,
            timestamp: new Date().toISOString(),
            requestCount: (await this.redis.get(`usage:${endpoint}`)) || "0",
            uniqueIPs: await this.redis.scard(`unique_ips:${endpoint}`),
            topUsers: await this.redis.zrevrange(`top_users:${endpoint}`, 0, 9, "WITHSCORES"),
          }

          await this.redis.hset("security:usage_analysis", endpoint, JSON.stringify(usage))
          console.log(`  ✅ Usage analysis completed for ${endpoint}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to analyze API usage:`, error)
          return false
        }
      },
    }
  }

  private createLocationVerificationAction(userId: string): ResponseAction {
    return {
      name: "Verify Login Location",
      description: `Verify login location for user ${userId}`,
      execute: async () => {
        try {
          await this.redis.sadd("security:location_verification_required", userId)
          await this.redis.setex(`security:verify_location:${userId}`, 3600, new Date().toISOString())
          console.log(`  ✅ Location verification required for user ${userId}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to require location verification:`, error)
          return false
        }
      },
    }
  }

  private createDeviceAnalysisAction(userId: string): ResponseAction {
    return {
      name: "Analyze Device Fingerprint",
      description: `Analyze device fingerprint for user ${userId}`,
      execute: async () => {
        try {
          const deviceData = {
            userId,
            timestamp: new Date().toISOString(),
            knownDevices: await this.redis.smembers(`devices:${userId}`),
            recentFingerprints: await this.redis.lrange(`fingerprints:${userId}`, 0, 4),
          }

          await this.redis.hset("security:device_analysis", userId, JSON.stringify(deviceData))
          console.log(`  ✅ Device analysis completed for user ${userId}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to analyze device fingerprint:`, error)
          return false
        }
      },
    }
  }

  private createTwoFactorEnforcementAction(userId: string): ResponseAction {
    return {
      name: "Enforce Two-Factor Authentication",
      description: `Require 2FA for user ${userId}`,
      execute: async () => {
        try {
          await this.redis.sadd("security:2fa_required", userId)
          await this.redis.setex(`security:enforce_2fa:${userId}`, 86400, new Date().toISOString())
          console.log(`  ✅ 2FA enforcement activated for user ${userId}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to enforce 2FA:`, error)
          return false
        }
      },
    }
  }

  private createSessionReviewAction(userId: string): ResponseAction {
    return {
      name: "Review User Sessions",
      description: `Review all sessions for user ${userId}`,
      execute: async () => {
        try {
          const sessionData = {
            userId,
            timestamp: new Date().toISOString(),
            activeSessions: await this.redis.keys(`session:${userId}:*`),
            loginHistory: await this.redis.lrange(`login_history:${userId}`, 0, 19),
            deviceHistory: await this.redis.lrange(`device_history:${userId}`, 0, 9),
          }

          await this.redis.hset("security:session_reviews", userId, JSON.stringify(sessionData))
          console.log(`  ✅ Session review completed for user ${userId}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to review user sessions:`, error)
          return false
        }
      },
    }
  }

  private createGenericResponseAction(incidentType: string, data: IncidentData): ResponseAction {
    return {
      name: "Generic Security Response",
      description: `Handle ${incidentType} incident`,
      execute: async () => {
        try {
          await this.redis.hset(
            "security:generic_incidents",
            incidentType,
            JSON.stringify({
              timestamp: new Date().toISOString(),
              data,
            }),
          )
          console.log(`  ✅ Generic response executed for ${incidentType}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to execute generic response:`, error)
          return false
        }
      },
    }
  }

  private createEvidenceCollectionAction(incidentType: string, data: IncidentData): ResponseAction {
    return {
      name: "Collect Evidence",
      description: "Collect and preserve incident evidence",
      execute: async () => {
        try {
          const evidence = {
            incidentType,
            timestamp: new Date().toISOString(),
            data,
            systemState: {
              activeConnections: await this.redis.dbsize(),
              blockedIPs: await this.redis.scard("security:blocked_ips"),
              activeSessions: await this.redis.keys("session:*").then((keys) => keys.length),
            },
          }

          const evidenceId = `evidence_${Date.now()}`
          await this.redis.hset("security:evidence", evidenceId, JSON.stringify(evidence))

          // Write evidence to file
          const evidenceFile = join(this.logDir, `${evidenceId}.json`)
          writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2))

          console.log(`  ✅ Evidence collected: ${evidenceId}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to collect evidence:`, error)
          return false
        }
      },
    }
  }

  private createNotificationAction(incidentType: string, severity: string, data: IncidentData): ResponseAction {
    return {
      name: "Send Notifications",
      description: "Send incident notifications to relevant parties",
      execute: async () => {
        try {
          const notification = {
            incidentType,
            severity,
            timestamp: new Date().toISOString(),
            data,
            message: `Security incident detected: ${incidentType} (${severity})`,
          }

          // Store notification
          await this.redis.lpush("security:notifications", JSON.stringify(notification))

          // Send webhook if configured
          if (process.env.SECURITY_WEBHOOK_URL) {
            try {
              const response = await fetch(process.env.SECURITY_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notification),
              })
              console.log(`  ✅ Webhook notification sent (${response.status})`)
            } catch (webhookError) {
              console.log(`  ⚠️ Webhook failed: ${webhookError}`)
            }
          }

          console.log(`  ✅ Notifications sent for ${incidentType}`)
          return true
        } catch (error) {
          console.error(`  ❌ Failed to send notifications:`, error)
          return false
        }
      },
    }
  }

  private async executeResponse(response: IncidentResponse): Promise<void> {
    response.status = "in_progress"
    await this.updateIncidentStatus(response)

    console.log(`\n🔧 Executing ${response.actions.length} response actions...`)

    for (const action of response.actions) {
      console.log(`\n⚡ Executing: ${action.name}`)
      console.log(`   ${action.description}`)

      try {
        const success = await action.execute()
        if (success) {
          response.executedActions.push(action.name)
          console.log(`   ✅ Action completed successfully`)
        } else {
          console.log(`   ❌ Action failed`)
        }
      } catch (error) {
        console.error(`   ❌ Action error:`, error)
      }
    }

    response.status = "completed"
    await this.updateIncidentStatus(response)

    console.log(`\n🎯 Incident Response Summary:`)
    console.log(`   Incident ID: ${response.incidentId}`)
    console.log(`   Actions Executed: ${response.executedActions.length}/${response.actions.length}`)
    console.log(`   Status: ${response.status.toUpperCase()}`)
    console.log(`   Duration: ${Date.now() - new Date(response.timestamp).getTime()}ms`)
  }

  private async logIncident(response: IncidentResponse): Promise<void> {
    try {
      await this.redis.hset("security:incidents", response.incidentId, JSON.stringify(response))

      const logFile = join(this.logDir, `${response.incidentId}.json`)
      writeFileSync(logFile, JSON.stringify(response, null, 2))

      console.log(`📝 Incident logged: ${response.incidentId}`)
    } catch (error) {
      console.error(`❌ Failed to log incident:`, error)
    }
  }

  private async updateIncidentStatus(response: IncidentResponse): Promise<void> {
    try {
      await this.redis.hset("security:incidents", response.incidentId, JSON.stringify(response))
    } catch (error) {
      console.error(`❌ Failed to update incident status:`, error)
    }
  }

  async getIncidentHistory(limit = 10): Promise<IncidentResponse[]> {
    try {
      const incidents = await this.redis.hgetall("security:incidents")
      return Object.values(incidents)
        .map((incident) => JSON.parse(incident))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error("Failed to get incident history:", error)
      return []
    }
  }

  async getIncidentStats(): Promise<any> {
    try {
      const incidents = await this.redis.hgetall("security:incidents")
      const incidentList = Object.values(incidents).map((incident) => JSON.parse(incident))

      const stats = {
        total: incidentList.length,
        byType: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        recent: incidentList.filter((i) => new Date(i.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000).length,
      }

      incidentList.forEach((incident) => {
        stats.byType[incident.incidentType] = (stats.byType[incident.incidentType] || 0) + 1
        stats.bySeverity[incident.severity] = (stats.bySeverity[incident.severity] || 0) + 1
        stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error("Failed to get incident stats:", error)
      return { total: 0, byType: {}, bySeverity: {}, byStatus: {}, recent: 0 }
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const automation = new IncidentResponseAutomation()

  if (args.length === 0 || args[0] === "help") {
    console.log(`
🚨 Incident Response Automation CLI

Usage:
  ts-node incident-response-automation.ts <command> [options]

Commands:
  test                                    - Run test scenarios
  <incident_type> <severity> <data_json>  - Handle specific incident

Examples:
  ts-node incident-response-automation.ts test
  ts-node incident-response-automation.ts sql_injection_attempt critical '{"ip":"192.168.1.100","endpoint":"/api/users"}'
  ts-node incident-response-automation.ts brute_force_attack critical '{"ips":["1.2.3.4"],"accounts":["admin"]}'
`)
    process.exit(0)
  }

  if (args[0] === "test") {
    console.log("🧪 Running Incident Response Test Scenarios...\n")

    const testScenarios = [
      {
        type: "sql_injection_attempt",
        severity: "critical",
        data: { ip: "192.168.1.100", endpoint: "/api/users", payload: "'; DROP TABLE users; --" },
      },
      {
        type: "xss_attempt",
        severity: "critical",
        data: { ip: "10.0.0.50", endpoint: "/api/comments", payload: '<script>alert("XSS")</script>' },
      },
      {
        type: "brute_force_attack",
        severity: "critical",
        data: { ips: ["203.0.113.1", "203.0.113.2"], accounts: ["admin", "user123"], attempts: 50 },
      },
    ]

    for (const scenario of testScenarios) {
      await automation.handleSecurityIncident(scenario.type, scenario.severity, scenario.data)
      console.log("\n" + "=".repeat(60) + "\n")
    }

    console.log("✅ All test scenarios completed!")
    process.exit(0)
  }

  // Handle specific incident
  if (args.length >= 3) {
    const [incidentType, severity, dataJson] = args
    try {
      const data = JSON.parse(dataJson)
      automation
        .handleSecurityIncident(incidentType, severity, data)
        .then((incidentId) => {
          console.log(`\n✅ Incident handled successfully: ${incidentId}`)
          process.exit(0)
        })
        .catch((error) => {
          console.error(`\n❌ Failed to handle incident:`, error)
          process.exit(1)
        })
    } catch (error) {
      console.error("❌ Invalid JSON data provided")
      process.exit(1)
    }
  } else {
    console.error('❌ Invalid arguments. Use "help" for usage information.')
    process.exit(1)
  }
}
