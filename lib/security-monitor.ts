import { adminNotificationService, type SecurityAlert } from "./admin-notification-service"
import { auditLogger } from "./audit-logger"

interface LoginAttempt {
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  timestamp: Date
}

class SecurityMonitor {
  private failedAttempts = new Map<string, LoginAttempt[]>()
  private suspiciousIPs = new Set<string>()

  // Thresholds
  private readonly MAX_FAILED_ATTEMPTS = 5
  private readonly SUSPICIOUS_ATTEMPT_WINDOW = 15 * 60 * 1000 // 15 minutes
  private readonly IP_LOCKOUT_DURATION = 60 * 60 * 1000 // 1 hour

  async recordLoginAttempt(attempt: LoginAttempt) {
    const key = `${attempt.email}:${attempt.ipAddress}`

    if (!attempt.success) {
      // Track failed attempts
      if (!this.failedAttempts.has(key)) {
        this.failedAttempts.set(key, [])
      }

      const attempts = this.failedAttempts.get(key)!
      attempts.push(attempt)

      // Clean old attempts
      const cutoff = new Date(Date.now() - this.SUSPICIOUS_ATTEMPT_WINDOW)
      const recentAttempts = attempts.filter((a) => a.timestamp > cutoff)
      this.failedAttempts.set(key, recentAttempts)

      // Check for suspicious activity
      if (recentAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
        await this.handleSuspiciousActivity(attempt, recentAttempts.length)
      }
    } else {
      // Clear failed attempts on successful login
      this.failedAttempts.delete(key)
    }

    // Log the attempt
    await auditLogger.log({
      action: attempt.success ? "login_success" : "login_failed",
      userId: attempt.email,
      details: {
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        timestamp: attempt.timestamp,
      },
      timestamp: attempt.timestamp,
    })
  }

  private async handleSuspiciousActivity(attempt: LoginAttempt, attemptCount: number) {
    this.suspiciousIPs.add(attempt.ipAddress)

    const alert: SecurityAlert = {
      type: "suspicious_activity",
      severity: attemptCount >= 10 ? "high" : "medium",
      details: {
        email: attempt.email,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        timestamp: attempt.timestamp,
        description: `${attemptCount} failed login attempts detected for ${attempt.email} from IP ${attempt.ipAddress}`,
        metadata: {
          attemptCount,
          timeWindow: this.SUSPICIOUS_ATTEMPT_WINDOW / 1000 / 60, // minutes
        },
      },
    }

    await adminNotificationService.sendSecurityAlert(alert)
  }

  async recordUnauthorizedAccess(details: {
    userId?: string
    email?: string
    ipAddress: string
    userAgent: string
    resource: string
    action: string
  }) {
    const alert: SecurityAlert = {
      type: "unauthorized_access",
      severity: "high",
      details: {
        userId: details.userId,
        email: details.email,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
        timestamp: new Date(),
        description: `Unauthorized access attempt to ${details.resource} (${details.action})`,
        metadata: {
          resource: details.resource,
          action: details.action,
        },
      },
    }

    await adminNotificationService.sendSecurityAlert(alert)
  }

  async recordDataBreach(details: {
    affectedUsers: number
    dataTypes: string[]
    source: string
    description: string
  }) {
    const alert: SecurityAlert = {
      type: "data_breach",
      severity: "critical",
      details: {
        timestamp: new Date(),
        description: details.description,
        metadata: {
          affectedUsers: details.affectedUsers,
          dataTypes: details.dataTypes,
          source: details.source,
        },
      },
    }

    await adminNotificationService.sendSecurityAlert(alert)
  }

  isIPSuspicious(ipAddress: string): boolean {
    return this.suspiciousIPs.has(ipAddress)
  }

  getFailedAttempts(email: string, ipAddress: string): LoginAttempt[] {
    const key = `${email}:${ipAddress}`
    return this.failedAttempts.get(key) || []
  }

  clearSuspiciousIP(ipAddress: string) {
    this.suspiciousIPs.delete(ipAddress)
  }

  // Clean up old data periodically
  cleanup() {
    const cutoff = new Date(Date.now() - this.IP_LOCKOUT_DURATION)

    for (const [key, attempts] of this.failedAttempts.entries()) {
      const recentAttempts = attempts.filter((a) => a.timestamp > cutoff)
      if (recentAttempts.length === 0) {
        this.failedAttempts.delete(key)
      } else {
        this.failedAttempts.set(key, recentAttempts)
      }
    }
  }
}

export const securityMonitor = new SecurityMonitor()

// Clean up every hour
setInterval(
  () => {
    securityMonitor.cleanup()
  },
  60 * 60 * 1000,
)
