import { Redis } from "ioredis"

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: SecuritySeverity
  timestamp: Date
  source: string
  details: Record<string, any>
  userAgent?: string
  ip?: string
  userId?: string
}

export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SUSPICIOUS_LOGIN = "suspicious_login",
  FAILED_AUTH_ATTEMPTS = "failed_auth_attempts",
  CSP_VIOLATION = "csp_violation",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  SQL_INJECTION_ATTEMPT = "sql_injection_attempt",
  XSS_ATTEMPT = "xss_attempt",
  ADMIN_ACCESS = "admin_access",
  API_ABUSE = "api_abuse",
  UNUSUAL_TRAFFIC = "unusual_traffic",
  SECURITY_HEADER_MISSING = "security_header_missing",
  CORS_VIOLATION = "cors_violation",
}

export enum SecuritySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface AlertConfig {
  enabled: boolean
  threshold: number
  timeWindow: number // in minutes
  channels: AlertChannel[]
}

export enum AlertChannel {
  EMAIL = "email",
  SLACK = "slack",
  WEBHOOK = "webhook",
  SMS = "sms",
}

export class SecurityMonitor {
  private redis: Redis
  private alertConfigs: Map<SecurityEventType, AlertConfig>

  constructor() {
    this.redis = new Redis(process.env.Redis_URL || "redis://localhost:6379")
    this.alertConfigs = this.initializeAlertConfigs()
  }

  private initializeAlertConfigs(): Map<SecurityEventType, AlertConfig> {
    const configs = new Map<SecurityEventType, AlertConfig>()

    // Critical alerts
    configs.set(SecurityEventType.SQL_INJECTION_ATTEMPT, {
      enabled: true,
      threshold: 1,
      timeWindow: 1,
      channels: [AlertChannel.EMAIL, AlertChannel.SLACK, AlertChannel.SMS],
    })

    configs.set(SecurityEventType.XSS_ATTEMPT, {
      enabled: true,
      threshold: 1,
      timeWindow: 1,
      channels: [AlertChannel.EMAIL, AlertChannel.SLACK],
    })

    configs.set(SecurityEventType.UNAUTHORIZED_ACCESS, {
      enabled: true,
      threshold: 3,
      timeWindow: 5,
      channels: [AlertChannel.EMAIL, AlertChannel.SLACK],
    })

    // High priority alerts
    configs.set(SecurityEventType.FAILED_AUTH_ATTEMPTS, {
      enabled: true,
      threshold: 5,
      timeWindow: 15,
      channels: [AlertChannel.EMAIL],
    })

    configs.set(SecurityEventType.RATE_LIMIT_EXCEEDED, {
      enabled: true,
      threshold: 10,
      timeWindow: 5,
      channels: [AlertChannel.SLACK],
    })

    configs.set(SecurityEventType.API_ABUSE, {
      enabled: true,
      threshold: 5,
      timeWindow: 10,
      channels: [AlertChannel.EMAIL, AlertChannel.SLACK],
    })

    // Medium priority alerts
    configs.set(SecurityEventType.CSP_VIOLATION, {
      enabled: true,
      threshold: 10,
      timeWindow: 30,
      channels: [AlertChannel.SLACK],
    })

    configs.set(SecurityEventType.SUSPICIOUS_LOGIN, {
      enabled: true,
      threshold: 3,
      timeWindow: 60,
      channels: [AlertChannel.EMAIL],
    })

    return configs
  }

  async logSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp">): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
    }

    try {
      // Store event in Redis
      await this.storeEvent(securityEvent)

      // Check if alert should be triggered
      await this.checkAndTriggerAlert(securityEvent)

      // Log to console for development
      console.log(`[SECURITY] ${securityEvent.type}:`, securityEvent)
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }

  private async storeEvent(event: SecurityEvent): Promise<void> {
    const key = `security:events:${event.type}`
    const eventData = JSON.stringify(event)

    // Store in sorted set with timestamp as score
    await this.redis.zadd(key, event.timestamp.getTime(), eventData)

    // Keep only last 1000 events per type
    await this.redis.zremrangebyrank(key, 0, -1001)

    // Store in general events list
    await this.redis.lpush("security:events:all", eventData)
    await this.redis.ltrim("security:events:all", 0, 9999)
  }

  private async checkAndTriggerAlert(event: SecurityEvent): Promise<void> {
    const config = this.alertConfigs.get(event.type)
    if (!config || !config.enabled) return

    const key = `security:events:${event.type}`
    const timeWindow = config.timeWindow * 60 * 1000 // Convert to milliseconds
    const cutoffTime = Date.now() - timeWindow

    // Count events in time window
    const eventCount = await this.redis.zcount(key, cutoffTime, Date.now())

    if (eventCount >= config.threshold) {
      await this.triggerAlert(event, eventCount, config)
    }
  }

  private async triggerAlert(event: SecurityEvent, count: number, config: AlertConfig): Promise<void> {
    const alertKey = `security:alert:${event.type}:${Math.floor(Date.now() / (config.timeWindow * 60 * 1000))}`

    // Check if alert already sent for this time window
    const alreadySent = await this.redis.get(alertKey)
    if (alreadySent) return

    // Mark alert as sent
    await this.redis.setex(alertKey, config.timeWindow * 60, "sent")

    const alertData = {
      eventType: event.type,
      severity: this.getSeverityForEventType(event.type),
      count,
      timeWindow: config.timeWindow,
      timestamp: new Date().toISOString(),
      details: event.details,
      source: event.source,
      ip: event.ip,
      userAgent: event.userAgent,
    }

    // Send alerts through configured channels
    for (const channel of config.channels) {
      try {
        await this.sendAlert(channel, alertData)
      } catch (error) {
        console.error(`Failed to send alert via ${channel}:`, error)
      }
    }
  }

  private async sendAlert(channel: AlertChannel, alertData: any): Promise<void> {
    switch (channel) {
      case AlertChannel.EMAIL:
        await this.sendEmailAlert(alertData)
        break
      case AlertChannel.SLACK:
        await this.sendSlackAlert(alertData)
        break
      case AlertChannel.WEBHOOK:
        await this.sendWebhookAlert(alertData)
        break
      case AlertChannel.SMS:
        await this.sendSMSAlert(alertData)
        break
    }
  }

  private async sendEmailAlert(alertData: any): Promise<void> {
    // Email alert implementation
    const emailBody = `
      🚨 SECURITY ALERT - ${alertData.severity.toUpperCase()}

      Event Type: ${alertData.eventType}
      Count: ${alertData.count} events in ${alertData.timeWindow} minutes
      Timestamp: ${alertData.timestamp}
      Source: ${alertData.source}
      IP Address: ${alertData.ip || "Unknown"}
      User Agent: ${alertData.userAgent || "Unknown"}

      Details: ${JSON.stringify(alertData.details, null, 2)}

      Please investigate immediately.
    `

    console.log("[EMAIL ALERT]", emailBody)
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  }

  private async sendSlackAlert(alertData: any): Promise<void> {
    const slackMessage = {
      text: `🚨 Security Alert: ${alertData.eventType}`,
      attachments: [
        {
          color: this.getSlackColorForSeverity(alertData.severity),
          fields: [
            { title: "Event Type", value: alertData.eventType, short: true },
            { title: "Severity", value: alertData.severity.toUpperCase(), short: true },
            { title: "Count", value: `${alertData.count} events`, short: true },
            { title: "Time Window", value: `${alertData.timeWindow} minutes`, short: true },
            { title: "Source", value: alertData.source, short: true },
            { title: "IP Address", value: alertData.ip || "Unknown", short: true },
          ],
          timestamp: Math.floor(Date.now() / 1000),
        },
      ],
    }

    console.log("[SLACK ALERT]", JSON.stringify(slackMessage, null, 2))
    // TODO: Send to Slack webhook
  }

  private async sendWebhookAlert(alertData: any): Promise<void> {
    const webhookUrl = process.env.SECURITY_WEBHOOK_URL
    if (!webhookUrl) return

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }
    } catch (error) {
      console.error("Webhook alert failed:", error)
    }
  }

  private async sendSMSAlert(alertData: any): Promise<void> {
    const message = `🚨 SECURITY ALERT: ${alertData.eventType} - ${alertData.count} events detected. Check dashboard immediately.`
    console.log("[SMS ALERT]", message)
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  }

  private getSeverityForEventType(eventType: SecurityEventType): SecuritySeverity {
    const severityMap: Record<SecurityEventType, SecuritySeverity> = {
      [SecurityEventType.SQL_INJECTION_ATTEMPT]: SecuritySeverity.CRITICAL,
      [SecurityEventType.XSS_ATTEMPT]: SecuritySeverity.CRITICAL,
      [SecurityEventType.UNAUTHORIZED_ACCESS]: SecuritySeverity.HIGH,
      [SecurityEventType.API_ABUSE]: SecuritySeverity.HIGH,
      [SecurityEventType.FAILED_AUTH_ATTEMPTS]: SecuritySeverity.MEDIUM,
      [SecurityEventType.SUSPICIOUS_LOGIN]: SecuritySeverity.MEDIUM,
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: SecuritySeverity.MEDIUM,
      [SecurityEventType.CSP_VIOLATION]: SecuritySeverity.LOW,
      [SecurityEventType.ADMIN_ACCESS]: SecuritySeverity.MEDIUM,
      [SecurityEventType.UNUSUAL_TRAFFIC]: SecuritySeverity.MEDIUM,
      [SecurityEventType.SECURITY_HEADER_MISSING]: SecuritySeverity.LOW,
      [SecurityEventType.CORS_VIOLATION]: SecuritySeverity.MEDIUM,
    }

    return severityMap[eventType] || SecuritySeverity.LOW
  }

  private getSlackColorForSeverity(severity: SecuritySeverity): string {
    const colorMap: Record<SecuritySeverity, string> = {
      [SecuritySeverity.CRITICAL]: "#ff0000",
      [SecuritySeverity.HIGH]: "#ff8800",
      [SecuritySeverity.MEDIUM]: "#ffaa00",
      [SecuritySeverity.LOW]: "#00aa00",
    }

    return colorMap[severity] || "#808080"
  }

  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async getSecurityEvents(eventType?: SecurityEventType, limit = 100): Promise<SecurityEvent[]> {
    try {
      let events: string[]

      if (eventType) {
        const key = `security:events:${eventType}`
        events = await this.redis.zrevrange(key, 0, limit - 1)
      } else {
        events = await this.redis.lrange("security:events:all", 0, limit - 1)
      }

      return events.map((eventData) => JSON.parse(eventData))
    } catch (error) {
      console.error("Failed to get security events:", error)
      return []
    }
  }

  async getSecurityStats(): Promise<any> {
    try {
      const stats = {
        totalEvents: await this.redis.llen("security:events:all"),
        eventsByType: {} as Record<string, number>,
        recentEvents: await this.getSecurityEvents(undefined, 10),
        alertsTriggered: 0,
      }

      // Get counts by event type
      for (const eventType of Object.values(SecurityEventType)) {
        const key = `security:events:${eventType}`
        const count = await this.redis.zcard(key)
        stats.eventsByType[eventType] = count
      }

      return stats
    } catch (error) {
      console.error("Failed to get security stats:", error)
      return null
    }
  }
}

export const securityMonitor = new SecurityMonitor()
