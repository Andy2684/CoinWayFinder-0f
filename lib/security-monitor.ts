import { generateRandomString } from "./security"
import { database } from "./database"

export enum SecurityEventType {
  FAILED_AUTH_ATTEMPTS = "failed_authentication",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SQL_INJECTION_ATTEMPT = "sql_injection_attempt",
  XSS_ATTEMPT = "xss_attempt",
  SUSPICIOUS_LOGIN = "suspicious_login",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  BRUTE_FORCE_ATTACK = "brute_force_attack",
  API_ABUSE = "api_abuse",
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
  source: string
  ip?: string
  userAgent?: string
  userId?: string
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
}

export interface SecurityAlert {
  id: string
  eventType: SecurityEventType
  threshold: number
  timeWindow: number // minutes
  currentCount: number
  triggered: boolean
  lastTriggered?: Date
  actions: string[]
}

export interface ThreatLevel {
  level: "low" | "medium" | "high" | "critical"
  score: number
  factors: string[]
  recommendation: string
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical"
  message: string
  details: {
    eventRate: number
    threatLevel: string
    activeAlerts: number
    systemLoad: number
  }
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private alerts: Map<string, SecurityAlert> = new Map()
  private maxEvents = 10000 // Keep last 10k events in memory
  private alertThresholds: Map<SecurityEventType, { threshold: number; timeWindow: number }> = new Map()

  constructor() {
    this.initializeAlertThresholds()
    this.startCleanupInterval()
  }

  private initializeAlertThresholds() {
    // Define alert thresholds for different event types
    this.alertThresholds.set(SecurityEventType.FAILED_AUTH_ATTEMPTS, { threshold: 5, timeWindow: 15 })
    this.alertThresholds.set(SecurityEventType.RATE_LIMIT_EXCEEDED, { threshold: 10, timeWindow: 5 })
    this.alertThresholds.set(SecurityEventType.SQL_INJECTION_ATTEMPT, { threshold: 1, timeWindow: 1 })
    this.alertThresholds.set(SecurityEventType.XSS_ATTEMPT, { threshold: 1, timeWindow: 1 })
    this.alertThresholds.set(SecurityEventType.BRUTE_FORCE_ATTACK, { threshold: 3, timeWindow: 10 })
    this.alertThresholds.set(SecurityEventType.UNAUTHORIZED_ACCESS, { threshold: 3, timeWindow: 5 })
    this.alertThresholds.set(SecurityEventType.API_ABUSE, { threshold: 20, timeWindow: 10 })
    this.alertThresholds.set(SecurityEventType.ADMIN_ACCESS_ATTEMPT, { threshold: 2, timeWindow: 5 })
    this.alertThresholds.set(SecurityEventType.SUSPICIOUS_LOGIN, { threshold: 5, timeWindow: 30 })
    this.alertThresholds.set(SecurityEventType.CSP_VIOLATION, { threshold: 50, timeWindow: 60 })
    this.alertThresholds.set(SecurityEventType.SUSPICIOUS_USER_AGENT, { threshold: 10, timeWindow: 15 })
    this.alertThresholds.set(SecurityEventType.MALICIOUS_PAYLOAD, { threshold: 1, timeWindow: 1 })
  }

  async logSecurityEvent(eventData: {
    type: SecurityEventType
    severity: SecuritySeverity
    source: string
    ip?: string
    userAgent?: string
    userId?: string
    details: Record<string, any>
  }): Promise<void> {
    const event: SecurityEvent = {
      id: generateRandomString(16),
      ...eventData,
      timestamp: new Date(),
      resolved: false,
    }

    // Add to in-memory storage
    this.events.unshift(event)

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    // Store in database
    await database.createSecurityEvent({
      type: event.type,
      severity: event.severity,
      message: `Security event: ${event.type}`,
      details: event.details,
      ip: event.ip,
      userAgent: event.userAgent,
      userId: event.userId,
    })

    // Check for alert conditions
    await this.checkAlertConditions(event)

    // Log to console for immediate visibility
    this.logToConsole(event)
  }

  private async checkAlertConditions(event: SecurityEvent): Promise<void> {
    const threshold = this.alertThresholds.get(event.type)
    if (!threshold) return

    const alertId = `${event.type}_alert`
    let alert = this.alerts.get(alertId)

    if (!alert) {
      alert = {
        id: alertId,
        eventType: event.type,
        threshold: threshold.threshold,
        timeWindow: threshold.timeWindow,
        currentCount: 0,
        triggered: false,
        actions: this.getAlertActions(event.type),
      }
      this.alerts.set(alertId, alert)
    }

    // Count events in the time window
    const windowStart = new Date(Date.now() - threshold.timeWindow * 60 * 1000)
    const recentEvents = this.events.filter(
      (e) => e.type === event.type && e.timestamp > windowStart && (!event.ip || e.ip === event.ip),
    )

    alert.currentCount = recentEvents.length

    // Trigger alert if threshold exceeded
    if (alert.currentCount >= alert.threshold && !alert.triggered) {
      alert.triggered = true
      alert.lastTriggered = new Date()
      await this.triggerAlert(alert, event)
    }

    // Reset alert if count drops below threshold
    if (alert.currentCount < alert.threshold && alert.triggered) {
      alert.triggered = false
    }
  }

  private getAlertActions(eventType: SecurityEventType): string[] {
    const actionMap: Record<SecurityEventType, string[]> = {
      [SecurityEventType.FAILED_AUTH_ATTEMPTS]: ["block_ip", "notify_admin", "increase_monitoring"],
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: ["throttle_requests", "temporary_block"],
      [SecurityEventType.SQL_INJECTION_ATTEMPT]: ["block_ip", "alert_security_team", "log_payload"],
      [SecurityEventType.XSS_ATTEMPT]: ["block_ip", "alert_security_team", "sanitize_input"],
      [SecurityEventType.BRUTE_FORCE_ATTACK]: ["block_ip", "notify_admin", "increase_security"],
      [SecurityEventType.UNAUTHORIZED_ACCESS]: ["block_access", "alert_admin", "audit_permissions"],
      [SecurityEventType.API_ABUSE]: ["rate_limit", "require_auth", "monitor_usage"],
      [SecurityEventType.ADMIN_ACCESS_ATTEMPT]: ["block_ip", "alert_admin", "require_2fa"],
      [SecurityEventType.SUSPICIOUS_LOGIN]: ["require_verification", "notify_user", "log_location"],
      [SecurityEventType.CSP_VIOLATION]: ["log_violation", "review_policy", "block_resource"],
      [SecurityEventType.SUSPICIOUS_USER_AGENT]: ["flag_requests", "increase_monitoring"],
      [SecurityEventType.MALICIOUS_PAYLOAD]: ["block_ip", "alert_security_team", "quarantine_request"],
    }

    return actionMap[eventType] || ["log_event", "monitor"]
  }

  private async triggerAlert(alert: SecurityAlert, triggeringEvent: SecurityEvent): Promise<void> {
    console.warn(`🚨 SECURITY ALERT TRIGGERED: ${alert.eventType}`)
    console.warn(`   Threshold: ${alert.currentCount}/${alert.threshold} events in ${alert.timeWindow} minutes`)
    console.warn(`   Source IP: ${triggeringEvent.ip || "unknown"}`)
    console.warn(`   Actions: ${alert.actions.join(", ")}`)

    // Execute alert actions
    for (const action of alert.actions) {
      await this.executeAlertAction(action, triggeringEvent)
    }

    // Store alert in database
    await database.createSecurityEvent({
      type: "security_alert" as SecurityEventType,
      severity: SecuritySeverity.HIGH,
      message: `Security alert triggered: ${alert.eventType}`,
      details: {
        alertId: alert.id,
        threshold: alert.threshold,
        currentCount: alert.currentCount,
        timeWindow: alert.timeWindow,
        triggeringEvent: triggeringEvent.id,
        actions: alert.actions,
      },
      ip: triggeringEvent.ip,
      userAgent: triggeringEvent.userAgent,
    })
  }

  private async executeAlertAction(action: string, event: SecurityEvent): Promise<void> {
    switch (action) {
      case "block_ip":
        console.log(`🚫 Blocking IP: ${event.ip}`)
        // In a real implementation, this would add the IP to a blocklist
        break

      case "notify_admin":
      case "alert_admin":
        console.log(`📧 Notifying admin about security event: ${event.type}`)
        // In a real implementation, this would send an email/notification
        break

      case "alert_security_team":
        console.log(`🚨 Alerting security team about: ${event.type}`)
        // In a real implementation, this would trigger security team alerts
        break

      case "throttle_requests":
      case "rate_limit":
        console.log(`⏱️ Applying rate limiting to: ${event.ip}`)
        // In a real implementation, this would apply rate limiting
        break

      case "log_payload":
        console.log(`📝 Logging malicious payload from: ${event.ip}`)
        // Additional logging is already handled
        break

      case "increase_monitoring":
        console.log(`👁️ Increasing monitoring for: ${event.ip}`)
        // In a real implementation, this would increase monitoring sensitivity
        break

      default:
        console.log(`🔧 Executing action: ${action}`)
        break
    }
  }

  private logToConsole(event: SecurityEvent): void {
    const severityEmoji = {
      [SecuritySeverity.LOW]: "ℹ️",
      [SecuritySeverity.MEDIUM]: "⚠️",
      [SecuritySeverity.HIGH]: "🚨",
      [SecuritySeverity.CRITICAL]: "🔥",
    }

    console.log(
      `${severityEmoji[event.severity]} Security Event: ${event.type} | ${event.severity.toUpperCase()} | ${event.source} | ${event.ip || "unknown"}`,
    )

    if (event.details && Object.keys(event.details).length > 0) {
      console.log(`   Details:`, event.details)
    }
  }

  getAllEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(0, limit)
  }

  getEventsByType(type: SecurityEventType, limit = 50): SecurityEvent[] {
    return this.events.filter((event) => event.type === type).slice(0, limit)
  }

  getEventsBySeverity(severity: SecuritySeverity, limit = 50): SecurityEvent[] {
    return this.events.filter((event) => event.severity === severity).slice(0, limit)
  }

  getRecentEvents(timeWindowMs: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindowMs)
    return this.events.filter((event) => event.timestamp > cutoff)
  }

  getEventsByIP(ip: string, limit = 50): SecurityEvent[] {
    return this.events.filter((event) => event.ip === ip).slice(0, limit)
  }

  getActiveAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.triggered)
  }

  getAllAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values())
  }

  calculateThreatLevel(): ThreatLevel {
    const recentEvents = this.getRecentEvents(60 * 60 * 1000) // Last hour
    const criticalEvents = recentEvents.filter((e) => e.severity === SecuritySeverity.CRITICAL).length
    const highEvents = recentEvents.filter((e) => e.severity === SecuritySeverity.HIGH).length
    const mediumEvents = recentEvents.filter((e) => e.severity === SecuritySeverity.MEDIUM).length
    const activeAlerts = this.getActiveAlerts().length

    let score = 0
    const factors: string[] = []

    // Calculate threat score
    score += criticalEvents * 10
    score += highEvents * 5
    score += mediumEvents * 2
    score += activeAlerts * 3

    if (criticalEvents > 0) factors.push(`${criticalEvents} critical events`)
    if (highEvents > 0) factors.push(`${highEvents} high severity events`)
    if (mediumEvents > 0) factors.push(`${mediumEvents} medium severity events`)
    if (activeAlerts > 0) factors.push(`${activeAlerts} active alerts`)

    // Determine threat level
    let level: "low" | "medium" | "high" | "critical"
    let recommendation: string

    if (score >= 50) {
      level = "critical"
      recommendation = "Immediate action required. Multiple critical security events detected."
    } else if (score >= 20) {
      level = "high"
      recommendation = "High threat level. Review security events and take preventive measures."
    } else if (score >= 10) {
      level = "medium"
      recommendation = "Moderate threat level. Monitor closely and review security policies."
    } else {
      level = "low"
      recommendation = "Low threat level. Continue normal monitoring."
    }

    return { level, score, factors, recommendation }
  }

  getSecurityStats(): {
    totalEvents: number
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
    threatLevel: string
    activeAlerts: number
    eventsLastHour: number
    eventsLast24Hours: number
  } {
    const threatLevel = this.calculateThreatLevel()
    const lastHour = this.getRecentEvents(60 * 60 * 1000)
    const last24Hours = this.getRecentEvents(24 * 60 * 60 * 1000)

    const eventsByType: Record<string, number> = {}
    const eventsBySeverity: Record<string, number> = {}

    this.events.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
    })

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      threatLevel: threatLevel.level,
      activeAlerts: this.getActiveAlerts().length,
      eventsLastHour: lastHour.length,
      eventsLast24Hours: last24Hours.length,
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const stats = this.getSecurityStats()
    const threatLevel = this.calculateThreatLevel()
    const activeAlerts = this.getActiveAlerts().length

    let status: "healthy" | "warning" | "critical"
    let message: string

    if (threatLevel.level === "critical" || activeAlerts >= 5) {
      status = "critical"
      message = "System under active threat. Immediate attention required."
    } else if (threatLevel.level === "high" || activeAlerts >= 2) {
      status = "warning"
      message = "Elevated threat level detected. Monitor closely."
    } else {
      status = "healthy"
      message = "System operating normally. No immediate threats detected."
    }

    return {
      status,
      message,
      details: {
        eventRate: stats.eventsLastHour,
        threatLevel: threatLevel.level,
        activeAlerts,
        systemLoad: Math.min(100, (stats.eventsLastHour / 10) * 100), // Simple load calculation
      },
    }
  }

  async resolveEvent(eventId: string): Promise<boolean> {
    const event = this.events.find((e) => e.id === eventId)
    if (event) {
      event.resolved = true
      return true
    }
    return false
  }

  async cleanup(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanMs)
    const initialCount = this.events.length

    this.events = this.events.filter((event) => event.timestamp > cutoff)

    return initialCount - this.events.length
  }

  private startCleanupInterval(): void {
    // Clean up old events every hour
    setInterval(
      () => {
        this.cleanup(7 * 24 * 60 * 60 * 1000) // Keep 7 days of events
      },
      60 * 60 * 1000,
    )
  }

  // Export events for analysis
  exportEvents(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = ["id", "type", "severity", "source", "ip", "timestamp", "resolved"]
      const rows = this.events.map((event) => [
        event.id,
        event.type,
        event.severity,
        event.source,
        event.ip || "",
        event.timestamp.toISOString(),
        event.resolved.toString(),
      ])

      return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    }

    return JSON.stringify(this.events, null, 2)
  }

  // Import events from backup
  importEvents(eventsData: SecurityEvent[]): void {
    this.events = [...eventsData, ...this.events].slice(0, this.maxEvents)
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor()

// Export the class for testing
export { SecurityMonitor }
