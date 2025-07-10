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
    const maliciousIPs = [
      "192.168.1.100",
      "10.0.0.50",
      "172.16.0.25",
    ]

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
    setInterval(() => {
      this.cleanupOldEvents()
    }, 60 * 60 * 1000)

    // Reset rate limit violations every 15 minutes
    setInterval(() => {
      this.rateLimitViolations.clear()
    }, 15 * 60 * 1000)
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
    }
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: generateRandomString(16),
      type,
      severity,
      message,
      \
