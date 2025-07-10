export interface SecurityEvent {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  details: Record<string, any>
  timestamp: Date
  ip?: string
  userAgent?: string
  userId?: string
}

export interface SecurityStats {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  recentEvents: SecurityEvent[]
  threatLevel: "low" | "medium" | "high" | "critical"
}

export class SecurityMonitor {
  private events: SecurityEvent[] = []
  private alertThresholds = {
    failedAuth: 5,
    bruteForce: 10,
    rateLimitExceeded: 20,
  }

  async logSecurityEvent(
    type: string,
    severity: "low" | "medium" | "high" | "critical",
    message: string,
    details: Record<string, any> = {},
    ip?: string,
    userAgent?: string,
    userId?: string,
  ): Promise<void> {
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      details,
      timestamp: new Date(),
      ip,
      userAgent,
      userId,
    }

    this.events.push(event)

    // Store in database if available
    try {
      // You can implement database storage here
      console.log(`Security Event: [${severity.toUpperCase()}] ${type} - ${message}`)
    } catch (error) {
      console.error("Failed to store security event:", error)
    }

    // Check for alert conditions
    await this.checkAlertConditions(event)
  }

  private async checkAlertConditions(event: SecurityEvent): Promise<void> {
    const recentEvents = this.getRecentEvents(15 * 60 * 1000) // Last 15 minutes

    // Check for brute force attacks
    if (event.type === "failed_authentication") {
      const failedAuthEvents = recentEvents.filter((e) => e.type === "failed_authentication" && e.ip === event.ip)

      if (failedAuthEvents.length >= this.alertThresholds.failedAuth) {
        await this.triggerAlert("brute_force_detected", {
          ip: event.ip,
          attempts: failedAuthEvents.length,
          timeWindow: "15 minutes",
        })
      }
    }

    // Check for rate limit violations
    if (event.type === "rate_limit_exceeded") {
      const rateLimitEvents = recentEvents.filter((e) => e.type === "rate_limit_exceeded" && e.ip === event.ip)

      if (rateLimitEvents.length >= this.alertThresholds.rateLimitExceeded) {
        await this.triggerAlert("excessive_rate_limiting", {
          ip: event.ip,
          violations: rateLimitEvents.length,
        })
      }
    }
  }

  private async triggerAlert(alertType: string, details: Record<string, any>): Promise<void> {
    console.log(`🚨 SECURITY ALERT: ${alertType}`, details)

    // You can implement webhook notifications here
    if (process.env.SECURITY_WEBHOOK_URL) {
      try {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alert: alertType,
            details,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (error) {
        console.error("Failed to send security alert webhook:", error)
      }
    }
  }

  getRecentEvents(timeWindowMs: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindowMs)
    return this.events.filter((event) => event.timestamp > cutoff)
  }

  getAllEvents(limit = 100): SecurityEvent[] {
    return this.events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
  }

  getEventsByType(type: string, limit = 50): SecurityEvent[] {
    return this.events
      .filter((event) => event.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  getSecurityStats(): SecurityStats {
    const eventsByType: Record<string, number> = {}
    const eventsBySeverity: Record<string, number> = {}

    this.events.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
    })

    // Calculate threat level
    const criticalEvents = eventsBySeverity.critical || 0
    const highEvents = eventsBySeverity.high || 0
    const mediumEvents = eventsBySeverity.medium || 0

    let threatLevel: "low" | "medium" | "high" | "critical" = "low"
    if (criticalEvents > 0) threatLevel = "critical"
    else if (highEvents > 5) threatLevel = "high"
    else if (mediumEvents > 10) threatLevel = "medium"

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      recentEvents: this.getRecentEvents(60 * 60 * 1000), // Last hour
      threatLevel,
    }
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical"
    message: string
    details: Record<string, any>
  }> {
    const stats = this.getSecurityStats()
    const recentCritical = this.getRecentEvents(60 * 60 * 1000).filter((e) => e.severity === "critical").length

    if (recentCritical > 0) {
      return {
        status: "critical",
        message: `${recentCritical} critical security events in the last hour`,
        details: { criticalEvents: recentCritical, threatLevel: stats.threatLevel },
      }
    }

    if (stats.threatLevel === "high") {
      return {
        status: "warning",
        message: "High threat level detected",
        details: { threatLevel: stats.threatLevel, totalEvents: stats.totalEvents },
      }
    }

    return {
      status: "healthy",
      message: "Security monitoring operational",
      details: { threatLevel: stats.threatLevel, totalEvents: stats.totalEvents },
    }
  }

  async cleanup(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = new Date(Date.now() - maxAge)
    const initialCount = this.events.length
    this.events = this.events.filter((event) => event.timestamp > cutoff)
    const removedCount = initialCount - this.events.length

    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old security events`)
    }
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor()

// Helper functions for common security events
export async function logFailedAuthentication(ip?: string, userAgent?: string, details: Record<string, any> = {}) {
  await securityMonitor.logSecurityEvent(
    "failed_authentication",
    "medium",
    "Failed authentication attempt",
    details,
    ip,
    userAgent,
  )
}

export async function logSuspiciousActivity(
  type: string,
  message: string,
  ip?: string,
  userAgent?: string,
  details: Record<string, any> = {},
) {
  await securityMonitor.logSecurityEvent(type, "high", message, details, ip, userAgent)
}

export async function logCriticalSecurityEvent(
  type: string,
  message: string,
  ip?: string,
  userAgent?: string,
  details: Record<string, any> = {},
) {
  await securityMonitor.logSecurityEvent(type, "critical", message, details, ip, userAgent)
}

export async function logRateLimitExceeded(ip?: string, endpoint?: string, details: Record<string, any> = {}) {
  await securityMonitor.logSecurityEvent(
    "rate_limit_exceeded",
    "medium",
    `Rate limit exceeded for ${endpoint || "unknown endpoint"}`,
    { endpoint, ...details },
    ip,
  )
}
