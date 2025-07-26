export class WebSocketSecurityManager {
  private connections: Map<string, any> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval = 30000

  connect(
    token: string,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onConnect?: () => void,
    onDisconnect?: () => void,
  ): string {
    const connectionId = `security_${Date.now()}`

    try {
      // For demo purposes, we'll simulate WebSocket connections
      // In production, you would use: new WebSocket(`ws://localhost:3000/api/admin/security/websocket?token=${token}`)
      const mockConnection = this.createMockSecurityWebSocket(onMessage, onConnect, onDisconnect)
      this.connections.set(connectionId, mockConnection)

      return connectionId
    } catch (error) {
      console.error("WebSocket connection failed:", error)
      if (onError) onError(error as Event)
      return ""
    }
  }

  private createMockSecurityWebSocket(
    onMessage: (data: any) => void,
    onConnect?: () => void,
    onDisconnect?: () => void,
  ) {
    const mockWs = {
      readyState: 1, // OPEN
      close: () => {
        if (onDisconnect) onDisconnect()
      },
      send: () => {},
    }

    // Simulate connection established
    setTimeout(() => {
      if (onConnect) onConnect()
    }, 100)

    // Simulate real-time security events
    this.simulateSecurityEvents(onMessage)

    return mockWs
  }

  private simulateSecurityEvents(onMessage: (data: any) => void) {
    // Simulate initial security data
    setTimeout(() => {
      onMessage({
        type: "security_update",
        data: {
          stats: {
            total_events: 1247,
            failed_events: 23,
            high_risk_events: 5,
            critical_events: 1,
            events_last_24h: 156,
            events_last_7d: 892,
            unique_users: 89,
            unique_ips: 234,
          },
          securityAlerts: [
            {
              id: "1",
              event_type: "suspicious_login",
              event_description: "Multiple failed login attempts from suspicious IP",
              risk_level: "high" as const,
              created_at: new Date().toISOString(),
              ip_address: "192.168.1.100",
              email: "user@example.com",
            },
          ],
          topEventTypes: [
            {
              event_type: "login_attempt",
              event_category: "authentication",
              count: 45,
              failed_count: 3,
            },
            {
              event_type: "api_request",
              event_category: "api",
              count: 234,
              failed_count: 12,
            },
          ],
          recentFailedLogins: [
            {
              ip_address: "192.168.1.100",
              email: "user@example.com",
              created_at: new Date().toISOString(),
              attempt_count: 3,
            },
          ],
          activeThreats: {
            suspiciousIps: 2,
            rateLimitViolations: 5,
            unauthorizedAccess: 1,
            highRiskEvents: 3,
          },
          systemHealth: {
            status: "healthy" as const,
            uptime: 99.8,
            errorRate: 0.2,
            responseTime: 145,
          },
        },
        timestamp: new Date().toISOString(),
      })
    }, 500)

    // Simulate periodic updates with slight variations
    setInterval(() => {
      const randomEvent = this.generateRandomSecurityEvent()
      onMessage({
        type: "security_event",
        data: randomEvent,
        timestamp: new Date().toISOString(),
      })
    }, 10000) // New event every 10 seconds

    // Simulate system health updates
    setInterval(() => {
      onMessage({
        type: "health_update",
        data: {
          systemHealth: {
            status: Math.random() > 0.9 ? "warning" : "healthy",
            uptime: 99.5 + Math.random() * 0.5,
            errorRate: Math.random() * 2,
            responseTime: 100 + Math.random() * 100,
          },
        },
        timestamp: new Date().toISOString(),
      })
    }, 15000) // Health update every 15 seconds

    // Simulate threat level changes
    setInterval(() => {
      onMessage({
        type: "threat_update",
        data: {
          activeThreats: {
            suspiciousIps: Math.floor(Math.random() * 5),
            rateLimitViolations: Math.floor(Math.random() * 10),
            unauthorizedAccess: Math.floor(Math.random() * 3),
            highRiskEvents: Math.floor(Math.random() * 8),
          },
        },
        timestamp: new Date().toISOString(),
      })
    }, 20000) // Threat update every 20 seconds
  }

  private generateRandomSecurityEvent() {
    const eventTypes = [
      "login_attempt",
      "api_request",
      "password_reset",
      "account_locked",
      "suspicious_activity",
      "rate_limit_exceeded",
    ]

    const riskLevels = ["low", "medium", "high", "critical"]
    const categories = ["authentication", "api", "security", "system"]

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]

    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_type: eventType,
      event_category: category,
      event_description: this.getEventDescription(eventType),
      risk_level: riskLevel,
      created_at: new Date().toISOString(),
      ip_address: this.generateRandomIP(),
      email: `user${Math.floor(Math.random() * 100)}@example.com`,
      success: Math.random() > 0.2, // 80% success rate
    }
  }

  private getEventDescription(eventType: string): string {
    const descriptions: Record<string, string> = {
      login_attempt: "User login attempt detected",
      api_request: "API endpoint accessed",
      password_reset: "Password reset requested",
      account_locked: "Account locked due to suspicious activity",
      suspicious_activity: "Suspicious user behavior detected",
      rate_limit_exceeded: "Rate limit exceeded for IP address",
    }

    return descriptions[eventType] || "Security event detected"
  }

  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }

  disconnect(connectionId: string) {
    const connection = this.connections.get(connectionId)
    if (connection) {
      connection.close()
      this.connections.delete(connectionId)
      this.reconnectAttempts.delete(connectionId)
    }
  }

  disconnectAll() {
    this.connections.forEach((connection, id) => {
      connection.close()
    })
    this.connections.clear()
    this.reconnectAttempts.clear()
  }

  private attemptReconnect(
    connectionId: string,
    token: string,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onConnect?: () => void,
    onDisconnect?: () => void,
  ) {
    const attempts = this.reconnectAttempts.get(connectionId) || 0

    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${connectionId}`)
      return
    }

    this.reconnectAttempts.set(connectionId, attempts + 1)

    setTimeout(() => {
      console.log(`Attempting to reconnect ${connectionId} (attempt ${attempts + 1})`)
      this.connect(token, onMessage, onError, onConnect, onDisconnect)
    }, this.reconnectDelay * Math.pow(2, attempts)) // Exponential backoff
  }
}

export const wsSecurityManager = new WebSocketSecurityManager()
