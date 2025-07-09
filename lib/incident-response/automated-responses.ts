import { securityMonitor, SecurityEventType, type SecuritySeverity } from "../security-monitor"
import { Redis } from "ioredis"

interface IncidentResponse {
  id: string
  eventType: SecurityEventType
  severity: SecuritySeverity
  timestamp: Date
  actions: ResponseAction[]
  status: "initiated" | "in_progress" | "completed" | "failed"
  metadata: Record<string, any>
}

interface ResponseAction {
  id: string
  type: "block_ip" | "rate_limit" | "alert_team" | "quarantine_user" | "emergency_lockdown"
  status: "pending" | "executing" | "completed" | "failed"
  timestamp: Date
  details: Record<string, any>
  result?: any
}

export class AutomatedIncidentResponse {
  private redis: Redis
  private responses: Map<string, IncidentResponse> = new Map()

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
    this.initializeAutomatedResponses()
  }

  private initializeAutomatedResponses() {
    // Set up automated response triggers
    this.setupCriticalEventResponses()
    this.setupHighSeverityResponses()
    this.setupMediumSeverityResponses()
  }

  private setupCriticalEventResponses() {
    // SQL Injection - Immediate lockdown
    this.registerResponse(SecurityEventType.SQL_INJECTION_ATTEMPT, async (event) => {
      const response = await this.createIncidentResponse(event, [
        { type: "block_ip", details: { ip: event.ip, duration: 3600 } },
        { type: "alert_team", details: { severity: "critical", channel: "security" } },
        { type: "emergency_lockdown", details: { scope: "database" } },
      ])

      await this.executeResponse(response)
      return response
    })

    // XSS Attempt - Content filtering
    this.registerResponse(SecurityEventType.XSS_ATTEMPT, async (event) => {
      const response = await this.createIncidentResponse(event, [
        { type: "block_ip", details: { ip: event.ip, duration: 1800 } },
        { type: "alert_team", details: { severity: "critical", channel: "security" } },
        { type: "rate_limit", details: { ip: event.ip, limit: 1 } },
      ])

      await this.executeResponse(response)
      return response
    })

    // Brute Force - Progressive blocking
    this.registerResponse(SecurityEventType.BRUTE_FORCE_ATTACK, async (event) => {
      const response = await this.createIncidentResponse(event, [
        { type: "block_ip", details: { ip: event.ip, duration: 7200 } },
        { type: "quarantine_user", details: { userId: event.userId } },
        { type: "alert_team", details: { severity: "high", channel: "security" } },
      ])

      await this.executeResponse(response)
      return response
    })
  }

  private setupHighSeverityResponses() {
    // Unauthorized Access - Account protection
    this.registerResponse(SecurityEventType.UNAUTHORIZED_ACCESS, async (event) => {
      const response = await this.createIncidentResponse(event, [
        { type: "block_ip", details: { ip: event.ip, duration: 1800 } },
        { type: "alert_team", details: { severity: "high", channel: "security" } },
      ])

      await this.executeResponse(response)
      return response
    })

    // Admin Access Attempt - Enhanced monitoring
    this.registerResponse(SecurityEventType.ADMIN_ACCESS_ATTEMPT, async (event) => {
      const response = await this.createIncidentResponse(event, [
        { type: "alert_team", details: { severity: "high", channel: "admin" } },
        { type: "rate_limit", details: { ip: event.ip, limit: 5 } },
      ])

      await this.executeResponse(response)
      return response
    })
  }

  private setupMediumSeverityResponses() {
    // Rate Limit Exceeded - Temporary throttling
    this.registerResponse(SecurityEventType.RATE_LIMIT_EXCEEDED, async (event) => {
      const response = await this.createIncidentResponse(event, [
        { type: "rate_limit", details: { ip: event.ip, limit: 10, duration: 300 } },
      ])

      await this.executeResponse(response)
      return response
    })

    // Failed Auth Attempts - Progressive restrictions
    this.registerResponse(SecurityEventType.FAILED_AUTH_ATTEMPTS, async (event) => {
      const attemptCount = await this.getRecentAttemptCount(event.ip || "unknown")

      if (attemptCount > 10) {
        const response = await this.createIncidentResponse(event, [
          { type: "block_ip", details: { ip: event.ip, duration: 900 } },
          { type: "alert_team", details: { severity: "medium", channel: "security" } },
        ])

        await this.executeResponse(response)
        return response
      }

      return null
    })
  }

  private responseHandlers = new Map<SecurityEventType, (event: any) => Promise<IncidentResponse | null>>()

  private registerResponse(eventType: SecurityEventType, handler: (event: any) => Promise<IncidentResponse | null>) {
    this.responseHandlers.set(eventType, handler)
  }

  async handleSecurityEvent(event: any): Promise<IncidentResponse | null> {
    const handler = this.responseHandlers.get(event.type)
    if (!handler) return null

    try {
      console.log(`🤖 Automated response triggered for ${event.type}`)
      const response = await handler(event)

      if (response) {
        await this.logResponse(response)
        await this.notifyTeam(response)
      }

      return response
    } catch (error) {
      console.error(`❌ Automated response failed for ${event.type}:`, error)
      await this.alertFailure(event, error)
      return null
    }
  }

  private async createIncidentResponse(
    event: any,
    actionTemplates: Array<{ type: string; details: Record<string, any> }>,
  ): Promise<IncidentResponse> {
    const response: IncidentResponse = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: event.type,
      severity: event.severity,
      timestamp: new Date(),
      status: "initiated",
      metadata: {
        sourceEvent: event.id,
        sourceIP: event.ip,
        userAgent: event.userAgent,
      },
      actions: actionTemplates.map((template, index) => ({
        id: `action_${index}_${Date.now()}`,
        type: template.type as any,
        status: "pending",
        timestamp: new Date(),
        details: template.details,
      })),
    }

    this.responses.set(response.id, response)
    return response
  }

  private async executeResponse(response: IncidentResponse): Promise<void> {
    response.status = "in_progress"

    try {
      for (const action of response.actions) {
        await this.executeAction(action)
      }

      response.status = "completed"
      console.log(`✅ Automated response ${response.id} completed successfully`)
    } catch (error) {
      response.status = "failed"
      console.error(`❌ Automated response ${response.id} failed:`, error)
      throw error
    }
  }

  private async executeAction(action: ResponseAction): Promise<void> {
    action.status = "executing"

    try {
      switch (action.type) {
        case "block_ip":
          await this.blockIP(action.details.ip, action.details.duration)
          break

        case "rate_limit":
          await this.applyRateLimit(action.details.ip, action.details.limit, action.details.duration)
          break

        case "alert_team":
          await this.alertTeam(action.details.severity, action.details.channel, action.details.message)
          break

        case "quarantine_user":
          await this.quarantineUser(action.details.userId)
          break

        case "emergency_lockdown":
          await this.emergencyLockdown(action.details.scope)
          break

        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }

      action.status = "completed"
      console.log(`✅ Action ${action.type} completed`)
    } catch (error) {
      action.status = "failed"
      action.result = { error: error.message }
      console.error(`❌ Action ${action.type} failed:`, error)
      throw error
    }
  }

  private async blockIP(ip: string, duration: number): Promise<void> {
    if (!ip || ip === "unknown") return

    // Store in Redis for application-level blocking
    await this.redis.setex(
      `blocked_ip:${ip}`,
      duration,
      JSON.stringify({
        blockedAt: new Date().toISOString(),
        duration,
        reason: "automated_security_response",
      }),
    )

    // Log the blocking action
    console.log(`🚫 IP ${ip} blocked for ${duration} seconds`)

    // If running on a system with iptables access, could add:
    // exec(`iptables -A INPUT -s ${ip} -j DROP`)
    // setTimeout(() => exec(`iptables -D INPUT -s ${ip} -j DROP`), duration * 1000)
  }

  private async applyRateLimit(ip: string, limit: number, duration = 300): Promise<void> {
    if (!ip || ip === "unknown") return

    await this.redis.setex(
      `rate_limit:${ip}`,
      duration,
      JSON.stringify({
        limit,
        appliedAt: new Date().toISOString(),
        duration,
      }),
    )

    console.log(`⚡ Rate limit applied to ${ip}: ${limit} requests per window`)
  }

  private async alertTeam(severity: string, channel: string, customMessage?: string): Promise<void> {
    const message = customMessage || `🚨 Automated security response triggered - ${severity.toUpperCase()} severity`

    // Send to webhook if configured
    if (process.env.SECURITY_WEBHOOK_URL) {
      await fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "automated_response_alert",
          severity,
          channel,
          message,
          timestamp: new Date().toISOString(),
        }),
      })
    }

    console.log(`📢 Team alerted via ${channel}: ${message}`)
  }

  private async quarantineUser(userId: string): Promise<void> {
    if (!userId) return

    await this.redis.setex(
      `quarantined_user:${userId}`,
      3600,
      JSON.stringify({
        quarantinedAt: new Date().toISOString(),
        reason: "automated_security_response",
      }),
    )

    console.log(`🔒 User ${userId} quarantined`)
  }

  private async emergencyLockdown(scope: string): Promise<void> {
    const lockdownKey = `emergency_lockdown:${scope}`
    await this.redis.setex(
      lockdownKey,
      1800,
      JSON.stringify({
        initiatedAt: new Date().toISOString(),
        scope,
        reason: "automated_security_response",
      }),
    )

    console.log(`🚨 Emergency lockdown initiated for scope: ${scope}`)

    // Send critical alert
    await this.alertTeam("critical", "security", `🚨 EMERGENCY LOCKDOWN: ${scope} scope locked down automatically`)
  }

  private async getRecentAttemptCount(ip: string): Promise<number> {
    const key = `attempt_count:${ip}`
    const count = await this.redis.get(key)
    return count ? Number.parseInt(count) : 0
  }

  private async logResponse(response: IncidentResponse): Promise<void> {
    await this.redis.zadd("incident_responses", Date.now(), JSON.stringify(response))
    await this.redis.expire("incident_responses", 7 * 24 * 60 * 60) // Keep for 7 days
  }

  private async notifyTeam(response: IncidentResponse): Promise<void> {
    const notification = {
      type: "automated_incident_response",
      responseId: response.id,
      eventType: response.eventType,
      severity: response.severity,
      actionsCount: response.actions.length,
      status: response.status,
      timestamp: response.timestamp.toISOString(),
    }

    if (process.env.SECURITY_WEBHOOK_URL) {
      await fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      })
    }
  }

  private async alertFailure(event: any, error: any): Promise<void> {
    const failureAlert = {
      type: "automated_response_failure",
      eventType: event.type,
      eventId: event.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    }

    if (process.env.SECURITY_WEBHOOK_URL) {
      await fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(failureAlert),
      })
    }

    console.error(`❌ Automated response failure for ${event.type}:`, error)
  }

  async getResponseHistory(limit = 50): Promise<IncidentResponse[]> {
    try {
      const responses = await this.redis.zrevrange("incident_responses", 0, limit - 1)
      return responses.map((responseStr) => JSON.parse(responseStr))
    } catch (error) {
      console.error("Failed to get response history:", error)
      return []
    }
  }

  async isIPBlocked(ip: string): Promise<boolean> {
    const blocked = await this.redis.get(`blocked_ip:${ip}`)
    return !!blocked
  }

  async isUserQuarantined(userId: string): Promise<boolean> {
    const quarantined = await this.redis.get(`quarantined_user:${userId}`)
    return !!quarantined
  }

  async isEmergencyLockdownActive(scope: string): Promise<boolean> {
    const lockdown = await this.redis.get(`emergency_lockdown:${scope}`)
    return !!lockdown
  }
}

// Create singleton instance
export const automatedIncidentResponse = new AutomatedIncidentResponse()

// Integration with security monitor
export async function initializeAutomatedResponses() {
  console.log("🤖 Initializing automated incident response system...")

  // Hook into security event logging
  const originalLogEvent = securityMonitor.logSecurityEvent.bind(securityMonitor)

  securityMonitor.logSecurityEvent = async (eventData) => {
    // Call original logging
    await originalLogEvent(eventData)

    // Trigger automated response if applicable
    const event = {
      ...eventData,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    await automatedIncidentResponse.handleSecurityEvent(event)
  }

  console.log("✅ Automated incident response system initialized")
}
