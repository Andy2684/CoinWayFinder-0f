interface SecurityEvent {
  id: string
  type: string
  category: string
  description: string
  riskLevel: "low" | "medium" | "high" | "critical"
  timestamp: string
  userId?: string
  ipAddress?: string
  success: boolean
}

interface SecurityStats {
  totalEvents: number
  failedEvents: number
  highRiskEvents: number
  criticalEvents: number
  eventsLast24h: number
  eventsLast7d: number
  uniqueUsers: number
  uniqueIps: number
}

interface SecurityData {
  stats: SecurityStats
  alerts: SecurityEvent[]
  recentEvents: SecurityEvent[]
  connectionStatus: "connected" | "disconnected" | "reconnecting"
}

export class WebSocketSecurityManager {
  private static instance: WebSocketSecurityManager
  private eventSource: EventSource | null = null
  private listeners: Set<(data: SecurityData) => void> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnected = false

  private constructor() {}

  public static getInstance(): WebSocketSecurityManager {
    if (!WebSocketSecurityManager.instance) {
      WebSocketSecurityManager.instance = new WebSocketSecurityManager()
    }
    return WebSocketSecurityManager.instance
  }

  public connect(token: string): void {
    if (this.eventSource) {
      this.disconnect()
    }

    const url = `/api/admin/security/websocket?token=${encodeURIComponent(token)}`
    this.eventSource = new EventSource(url)

    this.eventSource.onopen = () => {
      console.log("Security WebSocket connected")
      this.isConnected = true
      this.reconnectAttempts = 0
      this.notifyListeners({
        stats: this.getEmptyStats(),
        alerts: [],
        recentEvents: [],
        connectionStatus: "connected",
      })
    }

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "security_update") {
          this.notifyListeners(data.data)
        }
      } catch (error) {
        console.error("Error parsing security data:", error)
      }
    }

    this.eventSource.onerror = () => {
      console.error("Security WebSocket error")
      this.isConnected = false
      this.notifyListeners({
        stats: this.getEmptyStats(),
        alerts: [],
        recentEvents: [],
        connectionStatus: "disconnected",
      })
      this.handleReconnect(token)
    }

    this.eventSource.onclose = () => {
      console.log("Security WebSocket closed")
      this.isConnected = false
      this.notifyListeners({
        stats: this.getEmptyStats(),
        alerts: [],
        recentEvents: [],
        connectionStatus: "disconnected",
      })
    }
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.isConnected = false
  }

  public addListener(callback: (data: SecurityData) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }

  private handleReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.notifyListeners({
      stats: this.getEmptyStats(),
      alerts: [],
      recentEvents: [],
      connectionStatus: "reconnecting",
    })

    setTimeout(() => {
      this.connect(token)
    }, delay)
  }

  private notifyListeners(data: SecurityData): void {
    this.listeners.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error("Error in security data listener:", error)
      }
    })
  }

  private getEmptyStats(): SecurityStats {
    return {
      totalEvents: 0,
      failedEvents: 0,
      highRiskEvents: 0,
      criticalEvents: 0,
      eventsLast24h: 0,
      eventsLast7d: 0,
      uniqueUsers: 0,
      uniqueIps: 0,
    }
  }
}

export const securityManager = WebSocketSecurityManager.getInstance()
