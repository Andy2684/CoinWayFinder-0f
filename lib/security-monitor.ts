import adminNotificationService from "./admin-notification-service"
import { auditLog } from "./audit-logger"

interface SecurityEvent {
  userId?: string
  ipAddress?: string
  userAgent?: string
  eventType: "login_attempt" | "failed_login" | "suspicious_activity" | "data_access" | "admin_action"
  timestamp: Date
  details: Record<string, any>
}

class SecurityMonitor {
  private static instance: SecurityMonitor
  private failedLoginAttempts: Map<string, { count: number; lastAttempt: Date; attempts: Date[] }> = new Map()
  private suspiciousIps: Set<string> = new Set()
  private readonly MAX_FAILED_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  private readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 10

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Log to audit trail
    await auditLog({
      action: `security_event_${event.eventType}`,
      userId: event.userId || "anonymous",
      details: {
        ...event.details,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      },
    })

    // Process specific event types
    switch (event.eventType) {
      case "failed_login":
        await this.handleFailedLogin(event)
        break
      case "suspicious_activity":
        await this.handleSuspiciousActivity(event)
        break
      case "admin_action":
        await this.handleAdminAction(event)
        break
    }
  }

  private async handleFailedLogin(event: SecurityEvent): Promise<void> {
    const key = event.ipAddress || "unknown"
    const now = new Date()

    // Get or create tracking record
    const record = this.failedLoginAttempts.get(key) || {
      count: 0,
      lastAttempt: now,
      attempts: [],
    }

    // Clean old attempts (older than lockout duration)
    record.attempts = record.attempts.filter((attempt) => now.getTime() - attempt.getTime() < this.LOCKOUT_DURATION)

    record.attempts.push(now)
    record.count = record.attempts.length
    record.lastAttempt = now

    this.failedLoginAttempts.set(key, record)

    // Check if threshold exceeded
    if (record.count >= this.MAX_FAILED_ATTEMPTS) {
      // Mark IP as suspicious
      this.suspiciousIps.add(key)

      // Send security alert
      await adminNotificationService.sendSecurityAlert({
        type: "failed_login",
        severity: record.count >= this.MAX_FAILED_ATTEMPTS * 2 ? "high" : "medium",
        details: {
          userId: event.userId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          timestamp: now,
          description: `Multiple failed login attempts detected from IP ${event.ipAddress}`,
          location: event.details.location,
          attemptCount: record.count,
        },
        recommendedActions: [
          "Block IP address temporarily",
          "Review user account security",
          "Check for credential stuffing attacks",
          "Monitor for additional attempts from this IP",
        ],
      })
    }
  }

  private async handleSuspiciousActivity(event: SecurityEvent): Promise<void> {
    const severity = this.calculateSuspiciousActivitySeverity(event)

    await adminNotificationService.sendSecurityAlert({
      type: "suspicious_activity",
      severity,
      details: {
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: event.timestamp,
        description: event.details.description || "Suspicious activity detected",
        location: event.details.location,
      },
      affectedSystems: event.details.affectedSystems,
      recommendedActions: [
        "Investigate user activity logs",
        "Review recent account changes",
        "Consider temporary access restrictions",
        "Monitor for escalation",
      ],
    })
  }

  private async handleAdminAction(event: SecurityEvent): Promise<void> {
    // Only notify for high-risk admin actions
    const highRiskActions = [
      "user_deleted",
      "user_banned",
      "admin_created",
      "role_changed",
      "data_export",
      "bulk_action",
      "security_settings_changed",
    ]

    if (highRiskActions.some((action) => event.details.action?.includes(action))) {
      await adminNotificationService.sendAdminActionNotification({
        action: event.details.action,
        adminId: event.userId || "unknown",
        adminEmail: event.details.adminEmail || "unknown",
        targetUserId: event.details.targetUserId,
        targetUserEmail: event.details.targetUserEmail,
        details: event.details,
        timestamp: event.timestamp,
        ipAddress: event.ipAddress,
      })
    }
  }

  private calculateSuspiciousActivitySeverity(event: SecurityEvent): "low" | "medium" | "high" | "critical" {
    const riskFactors = {
      newIp: !event.details.knownIp ? 1 : 0,
      suspiciousLocation: event.details.suspiciousLocation ? 2 : 0,
      multipleAccounts: event.details.multipleAccounts ? 2 : 0,
      adminAccount: event.details.adminAccount ? 3 : 0,
      dataAccess: event.details.dataAccess ? 2 : 0,
      offHours: event.details.offHours ? 1 : 0,
    }

    const totalRisk = Object.values(riskFactors).reduce((sum, value) => sum + value, 0)

    if (totalRisk >= 7) return "critical"
    if (totalRisk >= 5) return "high"
    if (totalRisk >= 3) return "medium"
    return "low"
  }

  async isIpSuspicious(ipAddress: string): Promise<boolean> {
    return this.suspiciousIps.has(ipAddress)
  }

  async clearFailedAttempts(ipAddress: string): Promise<void> {
    this.failedLoginAttempts.delete(ipAddress)
    this.suspiciousIps.delete(ipAddress)
  }

  async getSecurityStats(): Promise<{
    failedLoginAttempts: number
    suspiciousIps: number
    recentAlerts: number
  }> {
    return {
      failedLoginAttempts: this.failedLoginAttempts.size,
      suspiciousIps: this.suspiciousIps.size,
      recentAlerts: await this.getRecentAlertsCount(),
    }
  }

  private async getRecentAlertsCount(): Promise<number> {
    // This would typically query the audit log for recent security events
    // For now, return a placeholder
    return 0
  }
}

export const securityMonitor = SecurityMonitor.getInstance()
export default securityMonitor
