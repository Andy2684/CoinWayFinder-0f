export enum SecurityEventType {
  LOGIN_ATTEMPT = "login_attempt",
  FAILED_LOGIN = "failed_login",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  API_ABUSE = "api_abuse",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  DATA_BREACH = "data_breach",
  MALWARE_DETECTED = "malware_detected",
  DDOS_ATTACK = "ddos_attack",
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
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  metadata?: any
}

export class SecurityMonitor {
  private events: SecurityEvent[] = []
  private alertThresholds = {
    [SecurityEventType.FAILED_LOGIN]: 5,
    [SecurityEventType.API_ABUSE]: 100,
    [SecurityEventType.SUSPICIOUS_ACTIVITY]: 3,
  }

  async logEvent(event: Omit<SecurityEvent, "id" | "timestamp">): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
    }

    this.events.push(securityEvent)

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }

    // Check for alerts
    await this.checkAlerts(securityEvent)

    console.log(`Security Event: ${event.type} - ${event.message}`)
  }

  async getEvents(filters?: {
    type?: SecurityEventType
    severity?: SecuritySeverity
    userId?: string
    limit?: number
  }): Promise<SecurityEvent[]> {
    let filteredEvents = [...this.events]

    if (filters?.type) {
      filteredEvents = filteredEvents.filter((e) => e.type === filters.type)
    }

    if (filters?.severity) {
      filteredEvents = filteredEvents.filter((e) => e.severity === filters.severity)
    }

    if (filters?.userId) {
      filteredEvents = filteredEvents.filter((e) => e.userId === filters.userId)
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    if (filters?.limit) {
      filteredEvents = filteredEvents.slice(0, filters.limit)
    }

    return filteredEvents
  }

  async getSecurityDashboard(): Promise<any> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentEvents = this.events.filter((e) => e.timestamp > last24Hours)

    const eventsByType = recentEvents.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const eventsBySeverity = recentEvents.reduce(
      (acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      criticalEvents: recentEvents.filter((e) => e.severity === SecuritySeverity.CRITICAL).length,
      topThreats: this.getTopThreats(recentEvents),
    }
  }

  private async checkAlerts(event: SecurityEvent): Promise<void> {
    const threshold = this.alertThresholds[event.type]
    if (!threshold) return

    const recentEvents = this.events.filter(
      (e) => e.type === event.type && e.timestamp > new Date(Date.now() - 60 * 60 * 1000), // Last hour
    )

    if (recentEvents.length >= threshold) {
      await this.triggerAlert(event.type, recentEvents.length)
    }
  }

  private async triggerAlert(eventType: SecurityEventType, count: number): Promise<void> {
    console.warn(`SECURITY ALERT: ${eventType} threshold exceeded (${count} events in last hour)`)

    // In a real app, this would send notifications via email, Slack, etc.
    if (process.env.SECURITY_WEBHOOK_URL) {
      try {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alert: `Security Alert: ${eventType}`,
            count,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (error) {
        console.error("Failed to send security alert:", error)
      }
    }
  }

  private getTopThreats(events: SecurityEvent[]): any[] {
    const threatsByIP = events.reduce(
      (acc, event) => {
        if (event.ipAddress) {
          acc[event.ipAddress] = (acc[event.ipAddress] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(threatsByIP)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ip, count]) => ({ ip, count }))
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Monitor specific security patterns
  async monitorLoginAttempts(userId: string, success: boolean, ipAddress?: string): Promise<void> {
    await this.logEvent({
      type: success ? SecurityEventType.LOGIN_ATTEMPT : SecurityEventType.FAILED_LOGIN,
      severity: success ? SecuritySeverity.LOW : SecuritySeverity.MEDIUM,
      message: `Login ${success ? "successful" : "failed"} for user ${userId}`,
      userId,
      ipAddress,
    })
  }

  async monitorAPIUsage(userId: string, endpoint: string, ipAddress?: string): Promise<void> {
    // Check for API abuse patterns
    const recentAPICalls = this.events.filter(
      (e) =>
        e.userId === userId && e.type === SecurityEventType.API_ABUSE && e.timestamp > new Date(Date.now() - 60 * 1000), // Last minute
    )

    if (recentAPICalls.length > 60) {
      // More than 60 calls per minute
      await this.logEvent({
        type: SecurityEventType.API_ABUSE,
        severity: SecuritySeverity.HIGH,
        message: `Potential API abuse detected for user ${userId} on ${endpoint}`,
        userId,
        ipAddress,
        metadata: { endpoint, callsPerMinute: recentAPICalls.length },
      })
    }
  }
}

export const securityMonitor = new SecurityMonitor()
