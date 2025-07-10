import { generateRandomString } from "./security"

export enum SecurityEventType {
  LOGIN_ATTEMPT = "login_attempt",
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILURE = "login_failure",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  API_KEY_USAGE = "api_key_usage",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  DATA_BREACH_ATTEMPT = "data_breach_attempt",
  SYSTEM_ERROR = "system_error",
  ADMIN_ACTION = "admin_action",
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
  message: string
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  timestamp: Date
  metadata?: Record<string, any>
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export interface SecurityAlert {
  id: string
  eventId: string
  title: string
  description: string
  severity: SecuritySeverity
  status: "active" | "acknowledged" | "resolved"
  createdAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  assignedTo?: string
}

export interface ThreatIntelligence {
  ip: string
  country?: string
  isMalicious: boolean
  threatLevel: number
  lastSeen: Date
  sources: string[]
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private alerts: SecurityAlert[] = []
  private threatIntel: Map<string, ThreatIntelligence> = new Map()
  private suspiciousIPs: Set<string> = new Set()
  private rateLimitViolations: Map<string, number> = new Map()

  constructor() {
    this.initializeThreatIntelligence()
    this.startMonitoring()
  }

  private initializeThreatIntelligence() {
    // Initialize with some known malicious IPs (mock data)
    const maliciousIPs = ["192.168.1.100", "10.0.0.50", "172.16.0.25"]

    maliciousIPs.forEach((ip) => {
      this.threatIntel.set(ip, {
        ip,
        country: "Unknown",
        isMalicious: true,
        threatLevel: 8,
        lastSeen: new Date(),
        sources: ["internal_blacklist"],
      })
    })
  }

  private startMonitoring() {
    // Clean up old events every hour
    setInterval(
      () => {
        this.cleanupOldEvents()
      },
      60 * 60 * 1000,
    )

    // Reset rate limit violations every 15 minutes
    setInterval(
      () => {
        this.rateLimitViolations.clear()
      },
      15 * 60 * 1000,
    )
  }

  private cleanupOldEvents() {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    this.events = this.events.filter((event) => event.timestamp > cutoffDate)
  }

  logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    message: string,
    metadata?: {
      userId?: string
      ip?: string
      userAgent?: string
      endpoint?: string
      [key: string]: any
    },
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: generateRandomString(16),
      type,
      severity,
      message,
      userId: metadata?.userId,
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
      endpoint: metadata?.endpoint,
      timestamp: new Date(),
      metadata,
      resolved: false,
    }

    this.events.push(event)

    // Check if this event should trigger an alert
    this.checkForAlerts(event)

    // Update threat intelligence
    if (event.ip) {
      this.updateThreatIntelligence(event.ip, event)
    }

    console.log(`Security Event: ${type} - ${message}`)

    return event
  }

  private checkForAlerts(event: SecurityEvent) {
    let shouldAlert = false
    let alertTitle = ""
    let alertDescription = ""

    switch (event.type) {
      case SecurityEventType.LOGIN_FAILURE:
        // Alert on multiple failed login attempts
        const recentFailures = this.events.filter(
          (e) =>
            e.type === SecurityEventType.LOGIN_FAILURE &&
            e.ip === event.ip &&
            e.timestamp > new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        )

        if (recentFailures.length >= 5) {
          shouldAlert = true
          alertTitle = "Multiple Failed Login Attempts"
          alertDescription = `${recentFailures.length} failed login attempts from IP ${event.ip}`
        }
        break

      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        shouldAlert = true
        alertTitle = "Rate Limit Exceeded"
        alertDescription = `Rate limit exceeded from IP ${event.ip}`
        break

      case SecurityEventType.UNAUTHORIZED_ACCESS:
      case SecurityEventType.DATA_BREACH_ATTEMPT:
        shouldAlert = true
        alertTitle = "Security Breach Attempt"
        alertDescription = event.message
        break

      case SecurityEventType.SUSPICIOUS_ACTIVITY:
        if (event.severity === SecuritySeverity.HIGH || event.severity === SecuritySeverity.CRITICAL) {
          shouldAlert = true
          alertTitle = "Suspicious Activity Detected"
          alertDescription = event.message
        }
        break
    }

    if (shouldAlert) {
      this.createAlert(event.id, alertTitle, alertDescription, event.severity)
    }
  }

  private createAlert(eventId: string, title: string, description: string, severity: SecuritySeverity): SecurityAlert {
    const alert: SecurityAlert = {
      id: generateRandomString(16),
      eventId,
      title,
      description,
      severity,
      status: "active",
      createdAt: new Date(),
    }

    this.alerts.push(alert)

    // Send notification (mock)
    this.sendAlertNotification(alert)

    return alert
  }

  private sendAlertNotification(alert: SecurityAlert) {
    // Mock notification sending
    console.log(`🚨 SECURITY ALERT: ${alert.title} - ${alert.description}`)

    // In a real implementation, this would send emails, Slack messages, etc.
  }

  private updateThreatIntelligence(ip: string, event: SecurityEvent) {
    let threat = this.threatIntel.get(ip)

    if (!threat) {
      threat = {
        ip,
        isMalicious: false,
        threatLevel: 0,
        lastSeen: new Date(),
        sources: [],
      }
    }

    // Update threat level based on event type
    switch (event.type) {
      case SecurityEventType.LOGIN_FAILURE:
        threat.threatLevel = Math.min(10, threat.threatLevel + 1)
        break
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        threat.threatLevel = Math.min(10, threat.threatLevel + 2)
        break
      case SecurityEventType.UNAUTHORIZED_ACCESS:
        threat.threatLevel = Math.min(10, threat.threatLevel + 5)
        break
      case SecurityEventType.DATA_BREACH_ATTEMPT:
        threat.threatLevel = 10
        threat.isMalicious = true
        break
    }

    if (threat.threatLevel >= 7) {
      threat.isMalicious = true
      this.suspiciousIPs.add(ip)
    }

    threat.lastSeen = new Date()
    this.threatIntel.set(ip, threat)
  }

  getEvents(filters?: {
    type?: SecurityEventType
    severity?: SecuritySeverity
    userId?: string
    ip?: string
    limit?: number
    offset?: number
  }): SecurityEvent[] {
    let filteredEvents = [...this.events]

    if (filters) {
      if (filters.type) {
        filteredEvents = filteredEvents.filter((e) => e.type === filters.type)
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter((e) => e.severity === filters.severity)
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter((e) => e.userId === filters.userId)
      }
      if (filters.ip) {
        filteredEvents = filteredEvents.filter((e) => e.ip === filters.ip)
      }
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply pagination
    const offset = filters?.offset || 0
    const limit = filters?.limit || 100

    return filteredEvents.slice(offset, offset + limit)
  }

  getAlerts(status?: "active" | "acknowledged" | "resolved"): SecurityAlert[] {
    let alerts = [...this.alerts]

    if (status) {
      alerts = alerts.filter((a) => a.status === status)
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (!alert) return false

    alert.status = "acknowledged"
    alert.acknowledgedAt = new Date()
    alert.assignedTo = acknowledgedBy

    return true
  }

  resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (!alert) return false

    alert.status = "resolved"
    alert.resolvedAt = new Date()

    // Also mark the associated event as resolved
    const event = this.events.find((e) => e.id === alert.eventId)
    if (event) {
      event.resolved = true
      event.resolvedAt = new Date()
      event.resolvedBy = resolvedBy
    }

    return true
  }

  getThreatIntelligence(ip: string): ThreatIntelligence | null {
    return this.threatIntel.get(ip) || null
  }

  isSuspiciousIP(ip: string): boolean {
    return this.suspiciousIPs.has(ip) || (this.threatIntel.get(ip)?.isMalicious ?? false)
  }

  getSecurityDashboard(): {
    totalEvents: number
    activeAlerts: number
    criticalAlerts: number
    suspiciousIPs: number
    recentEvents: SecurityEvent[]
    topThreats: ThreatIntelligence[]
  } {
    const activeAlerts = this.alerts.filter((a) => a.status === "active")
    const criticalAlerts = activeAlerts.filter((a) => a.severity === SecuritySeverity.CRITICAL)
    const recentEvents = this.getEvents({ limit: 10 })

    const topThreats = Array.from(this.threatIntel.values())
      .filter((t) => t.isMalicious)
      .sort((a, b) => b.threatLevel - a.threatLevel)
      .slice(0, 10)

    return {
      totalEvents: this.events.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      suspiciousIPs: this.suspiciousIPs.size,
      recentEvents,
      topThreats,
    }
  }

  recordRateLimitViolation(ip: string): void {
    const current = this.rateLimitViolations.get(ip) || 0
    this.rateLimitViolations.set(ip, current + 1)

    this.logEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, SecuritySeverity.MEDIUM, `Rate limit exceeded from IP ${ip}`, {
      ip,
    })
  }

  checkSuspiciousActivity(userId: string, activity: string, metadata?: Record<string, any>): void {
    // Simple heuristics for suspicious activity
    let severity = SecuritySeverity.LOW

    if (activity.includes("admin") || activity.includes("root")) {
      severity = SecuritySeverity.HIGH
    }

    if (activity.includes("sql") || activity.includes("script")) {
      severity = SecuritySeverity.CRITICAL
    }

    this.logEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, severity, `Suspicious activity detected: ${activity}`, {
      userId,
      activity,
      ...metadata,
    })
  }
}

// Create and export security monitor instance
export const securityMonitor = new SecurityMonitor()
