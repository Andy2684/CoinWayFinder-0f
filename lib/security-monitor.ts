import adminNotificationService from "./admin-notification-service"
import { auditLog } from "./audit-logger"
import type { SecurityEvent } from "./admin-notification-service"

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

    // Track failed login attempts
    if (event.eventType === "failed_login") {
      const key = `${event.ipAddress}:${event.userId || "unknown"}`
      const record = this.failedLoginAttempts.get(key) || {
        count: 0,
        lastAttempt: new Date(),
        attempts: [],
      }
      const now = new Date()

      // Clean old attempts (older than lockout duration)
      record.attempts = record.attempts.filter((attempt) => now.getTime() - attempt.getTime() < this.LOCKOUT_DURATION)

      record.attempts.push(now)
      record.count = record.attempts.length
      record.lastAttempt = now

      this.failedLoginAttempts.set(key, record)

      // Mark IP as suspicious after 5 failed attempts
      if (record.count >= this.MAX_FAILED_ATTEMPTS) {
        this.suspiciousIps.add(event.ipAddress)
        await adminNotificationService.sendSecurityAlert({
          ...event,
          eventType: "suspicious_activity",
          details: {
            ...event.details,
            failedAttempts: record.count,
            reason: "Multiple failed login attempts",
          },
        })
      } else {
        await adminNotificationService.sendSecurityAlert(event)
      }
    } else {
      await adminNotificationService.sendSecurityAlert(event)
    }

    // Process specific event types
    switch (event.eventType) {
      case "failed_login":
        // Handled above
        break
      case "suspicious_activity":
        await this.handleSuspiciousActivity(event)
        break
      case "admin_action":
        await this.handleAdminAction(event)
        break
    }

    // Log to console for debugging
    console.log("Security event logged:", {
      type: event.eventType,
      userId: event.userId,
      ip: event.ipAddress,
      timestamp: event.timestamp,
    })
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
    const key = `${ipAddress}:${event.userId || "unknown"}`
    this.failedLoginAttempts.delete(key)
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

  getFailedAttempts(ip: string, userId?: string): number {
    const key = `${ip}:${userId || "unknown"}`
    return (this.failedLoginAttempts.get(key) || { count: 0 }).count
  }
}

export const securityMonitor = SecurityMonitor.getInstance()
export default securityMonitor
