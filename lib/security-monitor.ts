export enum SecurityEventType {
  FAILED_AUTH_ATTEMPTS = "failed_auth_attempts",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SQL_INJECTION_ATTEMPT = "sql_injection_attempt",
  XSS_ATTEMPT = "xss_attempt",
  SUSPICIOUS_LOGIN = "suspicious_login",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  API_ABUSE = "api_abuse",
  BRUTE_FORCE_ATTACK = "brute_force_attack",
  CSP_VIOLATION = "csp_violation",
  ADMIN_ACCESS_ATTEMPT = "admin_access_attempt",
  SUSPICIOUS_USER_AGENT = "suspicious_user_agent",
  MALICIOUS_PAYLOAD = "malicious_payload",
}

export enum SecuritySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
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
  alertTriggered: boolean
}

export interface SecurityAlert {
  id: string
  eventId: string
  type: SecurityEventType
  severity: SecuritySeverity
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  actions: string[]
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
  private events: Map<string, SecurityEvent> = new Map()
  private alerts: Map<string, SecurityAlert> = new Map()
  private alertThresholds: Map<SecurityEventType, { count: number; timeWindow: number }> = new Map()

  constructor() {
    this.initializeAlertThresholds()
  }

  private initializeAlertThresholds(): void {
    // Set alert thresholds for different event types
    this.alertThresholds.set(SecurityEventType.FAILED_AUTH_ATTEMPTS, { count: 5, timeWindow: 15 * 60 * 1000 }) // 5 in 15 minutes
    this.alertThresholds.set(SecurityEventType.RATE_LIMIT_EXCEEDED, { count: 10, timeWindow: 5 * 60 * 1000 }) // 10 in 5 minutes
    this.alertThresholds.set(SecurityEventType.SQL_INJECTION_ATTEMPT, { count: 1, timeWindow: 60 * 1000 }) // 1 in 1 minute
    this.alertThresholds.set(SecurityEventType.XSS_ATTEMPT, { count: 1, timeWindow: 60 * 1000 }) // 1 in 1 minute
    this.alertThresholds.set(SecurityEventType.BRUTE_FORCE_ATTACK, { count: 1, timeWindow: 60 * 1000 }) // 1 in 1 minute
    this.alertThresholds.set(SecurityEventType.UNAUTHORIZED_ACCESS, { count: 3, timeWindow: 10 * 60 * 1000 }) // 3 in 10 minutes
    this.alertThresholds.set(SecurityEventType.API_ABUSE, { count: 20, timeWindow: 5 * 60 * 1000 }) // 20 in 5 minutes
    this.alertThresholds.set(SecurityEventType.SUSPICIOUS_LOGIN, { count: 3, timeWindow: 30 * 60 * 1000 }) // 3 in 30 minutes
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  async logSecurityEvent(eventData: {
    type: SecurityEventType
    severity: SecuritySeverity
    source: string
    ip?: string
    userAgent?: string
    userId?: string
    details?: Record<string, any>
  }): Promise<SecurityEvent> {
    const event: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      resolved: false,
      alertTriggered: false,
      details: {},
      ...eventData,
    }

    this.events.set(event.id, event)

    // Check if this event should trigger an alert
    await this.checkAlertThresholds(event)

    // Log to console for immediate visibility
    console.log(`🔒 Security Event: ${event.type} (${event.severity}) from ${event.ip || "unknown"} at ${event.source}`)

    return event
  }

  private async checkAlertThresholds(event: SecurityEvent): Promise<void> {
    const threshold = this.alertThresholds.get(event.type)
    if (!threshold) return

    const now = Date.now()
    const windowStart = now - threshold.timeWindow

    // Count recent events of the same type
    const recentEvents = Array.from(this.events.values()).filter(
      (e) => e.type === event.type && e.timestamp.getTime() >= windowStart && (event.ip ? e.ip === event.ip : true),
    )

    if (recentEvents.length >= threshold.count) {
      await this.createAlert(
        event,
        `${event.type} threshold exceeded: ${recentEvents.length} events in ${threshold.timeWindow / 1000}s`,
      )
    }
  }

  private async createAlert(event: SecurityEvent, message: string): Promise<SecurityAlert> {
    const alert: SecurityAlert = {
      id: this.generateId(),
      eventId: event.id,
      type: event.type,
      severity: event.severity,
      message,
      timestamp: new Date(),
      resolved: false,
      actions: [],
    }

    this.alerts.set(alert.id, alert)

    // Mark the event as having triggered an alert
    event.alertTriggered = true
    this.events.set(event.id, event)

    console.log(`🚨 Security Alert: ${alert.message}`)

    return alert
  }

  async resolveAlert(alertId: string, resolvedBy?: string): Promise<boolean> {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    alert.resolved = true
    alert.resolvedAt = new Date()
    alert.resolvedBy = resolvedBy

    this.alerts.set(alertId, alert)
    return true
  }

  getSecurityStats(): SecurityStats {
    const events = Array.from(this.events.values())
    const alerts = Array.from(this.alerts.values())

    // Count events by type
    const eventsByType = {} as Record<SecurityEventType, number>
    Object.values(SecurityEventType).forEach((type) => {
      eventsByType[type] = events.filter((e) => e.type === type).length
    })

    // Count events by severity
    const eventsBySeverity = {} as Record<SecuritySeverity, number>
    Object.values(SecuritySeverity).forEach((severity) => {
      eventsBySeverity[severity] = events.filter((e) => e.severity === severity).length
    })

    // Get recent events (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const recentEvents = events
      .filter((e) => e.timestamp.getTime() >= oneDayAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50)

    // Get active alerts
    const activeAlerts = alerts.filter((a) => !a.resolved)

    // Calculate threat level
    const threatLevel = this.calculateThreatLevel(eventsBySeverity, activeAlerts)

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      recentEvents,
      activeAlerts,
      threatLevel,
    }
  }

  private calculateThreatLevel(
    eventsBySeverity: Record<SecuritySeverity, number>,
    activeAlerts: SecurityAlert[],
  ): "low" | "medium" | "high" | "critical" {
    const criticalEvents = eventsBySeverity[SecuritySeverity.CRITICAL] || 0
    const highEvents = eventsBySeverity[SecuritySeverity.HIGH] || 0
    const criticalAlerts = activeAlerts.filter((a) => a.severity === SecuritySeverity.CRITICAL).length
    const highAlerts = activeAlerts.filter((a) => a.severity === SecuritySeverity.HIGH).length

    if (criticalEvents > 0 || criticalAlerts > 0) {
      return "critical"
    } else if (highEvents > 5 || highAlerts > 2) {
      return "high"
    } else if (highEvents > 0 || activeAlerts.length > 0) {
      return "medium"
    } else {
      return "low"
    }
  }

  getAllEvents(limit = 100): SecurityEvent[] {
    return Array.from(this.events.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  getEventsByType(type: SecurityEventType, limit = 50): SecurityEvent[] {
    return Array.from(this.events.values())
      .filter((e) => e.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  getRecentEvents(timeWindow = 60 * 60 * 1000): SecurityEvent[] {
    const cutoff = Date.now() - timeWindow
    return Array.from(this.events.values())
      .filter((e) => e.timestamp.getTime() >= cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async getSecurityEvents(type?: SecurityEventType, limit = 100): Promise<SecurityEvent[]> {
    let events = Array.from(this.events.values())

    if (type) {
      events = events.filter((e) => e.type === type)
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical"
    message: string
    details: Record<string, any>
  }> {
    const stats = this.getSecurityStats()
    const recentCriticalEvents = stats.recentEvents.filter(
      (e) => e.severity === SecuritySeverity.CRITICAL && e.timestamp.getTime() > Date.now() - 60 * 60 * 1000, // Last hour
    ).length

    if (recentCriticalEvents > 5) {
      return {
        status: "critical",
        message: "Multiple critical security events detected",
        details: {
          criticalEvents: recentCriticalEvents,
          activeAlerts: stats.activeAlerts.length,
          threatLevel: stats.threatLevel,
        },
      }
    } else if (stats.activeAlerts.length > 3) {
      return {
        status: "warning",
        message: "Multiple active security alerts",
        details: {
          activeAlerts: stats.activeAlerts.length,
          threatLevel: stats.threatLevel,
        },
      }
    } else {
      return {
        status: "healthy",
        message: "Security monitoring system operational",
        details: {
          totalEvents: stats.totalEvents,
          threatLevel: stats.threatLevel,
        },
      }
    }
  }

  async cleanup(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = Date.now() - maxAge
    let cleanedCount = 0

    // Clean up old events
    for (const [id, event] of this.events.entries()) {
      if (event.timestamp.getTime() < cutoff && event.resolved) {
        this.events.delete(id)
        cleanedCount++
      }
    }

    // Clean up old resolved alerts
    for (const [id, alert] of this.alerts.entries()) {
      if (alert.timestamp.getTime() < cutoff && alert.resolved) {
        this.alerts.delete(id)
      }
    }

    return cleanedCount
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor()
