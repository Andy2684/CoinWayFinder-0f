import { Redis } from "ioredis"

export enum SecurityEventType {
  FAILED_AUTH_ATTEMPTS = "failed_auth_attempts",
  SUSPICIOUS_LOGIN = "suspicious_login",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SQL_INJECTION_ATTEMPT = "sql_injection_attempt",
  XSS_ATTEMPT = "xss_attempt",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  CSP_VIOLATION = "csp_violation",
  BRUTE_FORCE_ATTACK = "brute_force_attack",
  SUSPICIOUS_USER_AGENT = "suspicious_user_agent",
  INVALID_TOKEN = "invalid_token",
  ADMIN_ACCESS_ATTEMPT = "admin_access_attempt",
  API_ABUSE = "api_abuse",
}

export enum SecuritySeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: SecuritySeverity
  timestamp: Date
  source: string
  ip?: string
  userAgent?: string
  userId?: string
  details: Record<string, any>
  resolved: boolean
}

export interface SecurityAlert {
  id: string
  type: SecurityEventType
  severity: SecuritySeverity
  count: number
  firstOccurrence: Date
  lastOccurrence: Date
  threshold: number
  timeWindow: number
  active: boolean
  notificationsSent: string[]
}

export interface SecurityStats {
  totalEvents: number
  eventsByType: Record<SecurityEventType, number>
  eventsBySeverity: Record<SecuritySeverity, number>
  recentEvents: SecurityEvent[]
  activeAlerts: SecurityAlert[]
  threatLevel: "low" | "medium" | "high" | "critical"
}

class SecurityMonitor {
  private redis: Redis | null = null
  private alertThresholds: Record<SecurityEventType, { count: number; timeWindow: number }> = {
    [SecurityEventType.FAILED_AUTH_ATTEMPTS]: { count: 5, timeWindow: 15 * 60 * 1000 }, // 5 in 15 minutes
    [SecurityEventType.SUSPICIOUS_LOGIN]: { count: 3, timeWindow: 10 * 60 * 1000 }, // 3 in 10 minutes
    [SecurityEventType.RATE_LIMIT_EXCEEDED]: { count: 10, timeWindow: 5 * 60 * 1000 }, // 10 in 5 minutes
    [SecurityEventType.SQL_INJECTION_ATTEMPT]: { count: 1, timeWindow: 1 * 60 * 1000 }, // 1 immediately
    [SecurityEventType.XSS_ATTEMPT]: { count: 1, timeWindow: 1 * 60 * 1000 }, // 1 immediately
    [SecurityEventType.UNAUTHORIZED_ACCESS]: { count: 3, timeWindow: 5 * 60 * 1000 }, // 3 in 5 minutes
    [SecurityEventType.CSP_VIOLATION]: { count: 5, timeWindow: 30 * 60 * 1000 }, // 5 in 30 minutes
    [SecurityEventType.BRUTE_FORCE_ATTACK]: { count: 1, timeWindow: 1 * 60 * 1000 }, // 1 immediately
    [SecurityEventType.SUSPICIOUS_USER_AGENT]: { count: 10, timeWindow: 60 * 60 * 1000 }, // 10 in 1 hour
    [SecurityEventType.INVALID_TOKEN]: { count: 10, timeWindow: 15 * 60 * 1000 }, // 10 in 15 minutes
    [SecurityEventType.ADMIN_ACCESS_ATTEMPT]: { count: 3, timeWindow: 10 * 60 * 1000 }, // 3 in 10 minutes
    [SecurityEventType.API_ABUSE]: { count: 20, timeWindow: 30 * 60 * 1000 }, // 20 in 30 minutes
  }

  constructor() {
    this.initializeRedis()
  }

  private async initializeRedis() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL)
        console.log("✅ Security Monitor: Redis connected")
      } catch (error) {
        console.error("❌ Security Monitor: Redis connection failed:", error)
      }
    } else {
      console.warn("⚠️ Security Monitor: Redis URL not configured, using memory storage")
    }
  }

  async logSecurityEvent(eventData: Omit<SecurityEvent, "id" | "timestamp" | "resolved">): Promise<void> {
    const event: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...eventData,
    }

    try {
      // Store in Redis if available
      if (this.redis) {
        const key = `security:events:${event.type}`
        await this.redis.zadd(key, Date.now(), JSON.stringify(event))
        await this.redis.expire(key, 7 * 24 * 60 * 60) // Keep for 7 days

        // Store in general events list
        await this.redis.zadd("security:events:all", Date.now(), JSON.stringify(event))
        await this.redis.expire("security:events:all", 7 * 24 * 60 * 60)
      }

      // Check if this should trigger an alert
      await this.checkForAlerts(event.type)

      // Log to console for immediate visibility
      const severityIcon = this.getSeverityIcon(event.severity)
      console.log(
        `${severityIcon} Security Event: ${event.type} | ${event.severity.toUpperCase()} | ${event.source} | IP: ${event.ip || "unknown"}`,
      )

      // Send immediate notifications for critical events
      if (event.severity === SecuritySeverity.CRITICAL) {
        await this.sendImmediateAlert(event)
      }
    } catch (error) {
      console.error("❌ Failed to log security event:", error)
    }
  }

  private getSeverityIcon(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
        return "🚨"
      case SecuritySeverity.HIGH:
        return "⚠️"
      case SecuritySeverity.MEDIUM:
        return "⚡"
      case SecuritySeverity.LOW:
        return "ℹ️"
      default:
        return "📝"
    }
  }

  private async checkForAlerts(eventType: SecurityEventType): Promise<void> {
    if (!this.redis) return

    const threshold = this.alertThresholds[eventType]
    if (!threshold) return

    const now = Date.now()
    const windowStart = now - threshold.timeWindow

    try {
      // Get events in the time window
      const events = await this.redis.zrangebyscore(`security:events:${eventType}`, windowStart, now)

      if (events.length >= threshold.count) {
        // Check if we already have an active alert for this
        const existingAlert = await this.redis.get(`security:alert:${eventType}`)

        if (!existingAlert) {
          // Create new alert
          const alert: SecurityAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: eventType,
            severity: this.getEventSeverity(eventType),
            count: events.length,
            firstOccurrence: new Date(JSON.parse(events[0]).timestamp),
            lastOccurrence: new Date(),
            threshold: threshold.count,
            timeWindow: threshold.timeWindow,
            active: true,
            notificationsSent: [],
          }

          // Store alert
          await this.redis.setex(`security:alert:${eventType}`, 60 * 60, JSON.stringify(alert)) // 1 hour

          // Send alert notifications
          await this.sendAlert(alert)
        }
      }
    } catch (error) {
      console.error("❌ Failed to check for alerts:", error)
    }
  }

  private getEventSeverity(eventType: SecurityEventType): SecuritySeverity {
    switch (eventType) {
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
      case SecurityEventType.XSS_ATTEMPT:
      case SecurityEventType.BRUTE_FORCE_ATTACK:
        return SecuritySeverity.CRITICAL
      case SecurityEventType.UNAUTHORIZED_ACCESS:
      case SecurityEventType.ADMIN_ACCESS_ATTEMPT:
      case SecurityEventType.SUSPICIOUS_LOGIN:
        return SecuritySeverity.HIGH
      case SecurityEventType.FAILED_AUTH_ATTEMPTS:
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
      case SecurityEventType.API_ABUSE:
        return SecuritySeverity.MEDIUM
      default:
        return SecuritySeverity.LOW
    }
  }

  private async sendImmediateAlert(event: SecurityEvent): Promise<void> {
    try {
      // Send to webhook if configured
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "security_event",
            severity: event.severity,
            event: event,
            timestamp: new Date().toISOString(),
          }),
        })
      }

      // Log for immediate attention
      console.error(`🚨 CRITICAL SECURITY EVENT: ${event.type} from ${event.ip || "unknown IP"}`)
    } catch (error) {
      console.error("❌ Failed to send immediate alert:", error)
    }
  }

  private async sendAlert(alert: SecurityAlert): Promise<void> {
    try {
      const message =
        `🚨 Security Alert: ${alert.type}\n` +
        `Severity: ${alert.severity.toUpperCase()}\n` +
        `Count: ${alert.count} events in ${Math.round(alert.timeWindow / 60000)} minutes\n` +
        `Threshold: ${alert.threshold}\n` +
        `Time: ${alert.lastOccurrence.toISOString()}`

      // Send to webhook
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "security_alert",
            alert: alert,
            message: message,
            timestamp: new Date().toISOString(),
          }),
        })
      }

      console.warn(`⚠️ Security Alert Sent: ${alert.type} (${alert.count} events)`)
    } catch (error) {
      console.error("❌ Failed to send alert:", error)
    }
  }

  async getSecurityStats(): Promise<SecurityStats> {
    const stats: SecurityStats = {
      totalEvents: 0,
      eventsByType: {} as Record<SecurityEventType, number>,
      eventsBySeverity: {} as Record<SecuritySeverity, number>,
      recentEvents: [],
      activeAlerts: [],
      threatLevel: "low",
    }

    try {
      if (this.redis) {
        // Get recent events (last 24 hours)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
        const recentEventsData = await this.redis.zrangebyscore("security:events:all", oneDayAgo, Date.now())

        stats.recentEvents = recentEventsData
          .map((eventStr) => {
            try {
              return JSON.parse(eventStr) as SecurityEvent
            } catch {
              return null
            }
          })
          .filter((event): event is SecurityEvent => event !== null)
          .slice(-50) // Last 50 events

        stats.totalEvents = stats.recentEvents.length

        // Count by type and severity
        stats.recentEvents.forEach((event) => {
          stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1
          stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1
        })

        // Get active alerts
        const alertKeys = await this.redis.keys("security:alert:*")
        for (const key of alertKeys) {
          const alertData = await this.redis.get(key)
          if (alertData) {
            try {
              const alert = JSON.parse(alertData) as SecurityAlert
              if (alert.active) {
                stats.activeAlerts.push(alert)
              }
            } catch {
              // Invalid alert data, skip
            }
          }
        }

        // Calculate threat level
        stats.threatLevel = this.calculateThreatLevel(stats)
      }
    } catch (error) {
      console.error("❌ Failed to get security stats:", error)
    }

    return stats
  }

  private calculateThreatLevel(stats: SecurityStats): "low" | "medium" | "high" | "critical" {
    const criticalEvents = stats.eventsBySeverity[SecuritySeverity.CRITICAL] || 0
    const highEvents = stats.eventsBySeverity[SecuritySeverity.HIGH] || 0
    const activeAlerts = stats.activeAlerts.length

    if (criticalEvents > 0 || activeAlerts > 3) {
      return "critical"
    } else if (highEvents > 5 || activeAlerts > 1) {
      return "high"
    } else if (stats.totalEvents > 20 || activeAlerts > 0) {
      return "medium"
    } else {
      return "low"
    }
  }

  async getSecurityEvents(type?: SecurityEventType, limit = 50): Promise<SecurityEvent[]> {
    if (!this.redis) return []

    try {
      const key = type ? `security:events:${type}` : "security:events:all"
      const eventsData = await this.redis.zrevrange(key, 0, limit - 1)

      return eventsData
        .map((eventStr) => {
          try {
            return JSON.parse(eventStr) as SecurityEvent
          } catch {
            return null
          }
        })
        .filter((event): event is SecurityEvent => event !== null)
    } catch (error) {
      console.error("❌ Failed to get security events:", error)
      return []
    }
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      const alertKeys = await this.redis.keys("security:alert:*")
      for (const key of alertKeys) {
        const alertData = await this.redis.get(key)
        if (alertData) {
          const alert = JSON.parse(alertData) as SecurityAlert
          if (alert.id === alertId) {
            alert.active = false
            await this.redis.setex(key, 60 * 60, JSON.stringify(alert))
            return true
          }
        }
      }
    } catch (error) {
      console.error("❌ Failed to resolve alert:", error)
    }

    return false
  }

  async cleanup(): Promise<void> {
    if (this.redis) {
      try {
        // Clean up old events (older than 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        await this.redis.zremrangebyscore("security:events:all", 0, sevenDaysAgo)

        // Clean up old alerts (older than 24 hours)
        const alertKeys = await this.redis.keys("security:alert:*")
        for (const key of alertKeys) {
          const alertData = await this.redis.get(key)
          if (alertData) {
            const alert = JSON.parse(alertData) as SecurityAlert
            const alertAge = Date.now() - alert.lastOccurrence.getTime()
            if (alertAge > 24 * 60 * 60 * 1000) {
              await this.redis.del(key)
            }
          }
        }

        console.log("✅ Security Monitor: Cleanup completed")
      } catch (error) {
        console.error("❌ Security Monitor: Cleanup failed:", error)
      }
    }
  }
}

// Create singleton instance
export const securityMonitor = new SecurityMonitor()

// Cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      securityMonitor.cleanup()
    },
    60 * 60 * 1000,
  ) // 1 hour
}
