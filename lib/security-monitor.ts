import { adminNotificationService, type SecurityEvent } from "./admin-notification-service"
import { auditLogger } from "./audit-logger"

interface FailedLoginAttempt {
  email: string
  ip: string
  userAgent: string
  timestamp: Date
}

interface SuspiciousActivity {
  type: string
  details: string
  ip: string
  userAgent?: string
  timestamp: Date
}

interface LoginAttempt {
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  timestamp: Date
}

class SecurityMonitor {
  private static instance: SecurityMonitor
  private failedLogins: Map<string, FailedLoginAttempt[]> = new Map()
  private suspiciousActivities: SuspiciousActivity[] = []
  private readonly MAX_FAILED_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  private readonly IP_LOCKOUT_DURATION = 60 * 60 * 1000 // 1 hour

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  async logFailedLogin(email: string, ip: string, userAgent: string): Promise<void> {
    const attempt: FailedLoginAttempt = {
      email,
      ip,
      userAgent,
      timestamp: new Date(),
    }

    // Get existing attempts for this email
    const attempts = this.failedLogins.get(email) || []

    // Remove attempts older than lockout duration
    const recentAttempts = attempts.filter((a) => Date.now() - a.timestamp.getTime() < this.LOCKOUT_DURATION)

    // Add new attempt
    recentAttempts.push(attempt)
    this.failedLogins.set(email, recentAttempts)

    // Check if we should send an alert
    if (recentAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
      await this.sendFailedLoginAlert(email, recentAttempts)
    }

    // Also check for suspicious patterns
    await this.checkSuspiciousPatterns(email, ip, userAgent)
  }

  async logSuspiciousActivity(type: string, details: string, ip: string, userAgent?: string): Promise<void> {
    const activity: SuspiciousActivity = {
      type,
      details,
      ip,
      userAgent,
      timestamp: new Date(),
    }

    this.suspiciousActivities.push(activity)

    // Keep only recent activities (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.suspiciousActivities = this.suspiciousActivities.filter((a) => a.timestamp.getTime() > oneDayAgo)

    // Send alert for suspicious activity
    const securityEvent: SecurityEvent = {
      type: "suspicious_activity",
      ip,
      userAgent,
      details: `${type}: ${details}`,
      timestamp: activity.timestamp,
      severity: "medium",
    }

    await adminNotificationService.sendSecurityAlert(securityEvent)
  }

  async logUnauthorizedAccess(
    userId: string,
    email: string,
    ip: string,
    userAgent: string,
    details: string,
  ): Promise<void> {
    const securityEvent: SecurityEvent = {
      type: "unauthorized_access",
      userId,
      email,
      ip,
      userAgent,
      details,
      timestamp: new Date(),
      severity: "high",
    }

    await adminNotificationService.sendSecurityAlert(securityEvent)
  }

  async logDataBreach(details: string, severity: "low" | "medium" | "high" | "critical" = "critical"): Promise<void> {
    const securityEvent: SecurityEvent = {
      type: "data_breach",
      details,
      timestamp: new Date(),
      severity,
    }

    await adminNotificationService.sendSecurityAlert(securityEvent)
  }

  private async sendFailedLoginAlert(email: string, attempts: FailedLoginAttempt[]): Promise<void> {
    const latestAttempt = attempts[attempts.length - 1]
    const uniqueIPs = new Set(attempts.map((a) => a.ip))

    const securityEvent: SecurityEvent = {
      type: "failed_login",
      email,
      ip: latestAttempt.ip,
      userAgent: latestAttempt.userAgent,
      details: `${attempts.length} failed login attempts in the last 15 minutes from ${uniqueIPs.size} unique IP address(es)`,
      timestamp: latestAttempt.timestamp,
      severity: attempts.length >= 10 ? "high" : "medium",
    }

    await adminNotificationService.sendSecurityAlert(securityEvent)
  }

  private async checkSuspiciousPatterns(email: string, ip: string, userAgent: string): Promise<void> {
    // Check for rapid attempts from different IPs
    const allAttempts = Array.from(this.failedLogins.values()).flat()
    const recentAttempts = allAttempts.filter(
      (a) => Date.now() - a.timestamp.getTime() < 5 * 60 * 1000, // Last 5 minutes
    )

    const uniqueIPs = new Set(recentAttempts.map((a) => a.ip))
    if (uniqueIPs.size >= 5) {
      await this.logSuspiciousActivity(
        "Distributed Attack",
        `Multiple failed login attempts from ${uniqueIPs.size} different IP addresses in the last 5 minutes`,
        ip,
        userAgent,
      )
    }

    // Check for unusual user agent patterns
    const suspiciousUserAgents = ["curl", "wget", "python", "bot", "crawler", "scanner"]

    if (suspiciousUserAgents.some((ua) => userAgent.toLowerCase().includes(ua))) {
      await this.logSuspiciousActivity(
        "Automated Attack",
        `Login attempt with suspicious user agent: ${userAgent}`,
        ip,
        userAgent,
      )
    }
  }

  async recordLoginAttempt(attempt: LoginAttempt) {
    const key = `${attempt.email}:${attempt.ipAddress}`

    if (!attempt.success) {
      // Track failed attempts
      if (!this.failedLogins.has(key)) {
        this.failedLogins.set(key, [])
      }

      const attempts = this.failedLogins.get(key)!
      attempts.push({
        email: attempt.email,
        ip: attempt.ipAddress,
        userAgent: attempt.userAgent,
        timestamp: attempt.timestamp,
      })

      // Clean old attempts
      const cutoff = new Date(Date.now() - this.LOCKOUT_DURATION)
      const recentAttempts = attempts.filter((a) => a.timestamp > cutoff)
      this.failedLogins.set(key, recentAttempts)

      // Check for suspicious activity
      if (recentAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
        await this.sendFailedLoginAlert(attempt.email, recentAttempts)
      }
    } else {
      // Clear failed attempts on successful login
      this.failedLogins.delete(key)
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

  getFailedLoginStats(): { email: string; attempts: number; lastAttempt: Date }[] {
    const stats: { email: string; attempts: number; lastAttempt: Date }[] = []

    for (const [email, attempts] of this.failedLogins.entries()) {
      const recentAttempts = attempts.filter((a) => Date.now() - a.timestamp.getTime() < this.LOCKOUT_DURATION)

      if (recentAttempts.length > 0) {
        stats.push({
          email,
          attempts: recentAttempts.length,
          lastAttempt: recentAttempts[recentAttempts.length - 1].timestamp,
        })
      }
    }

    return stats.sort((a, b) => b.attempts - a.attempts)
  }

  getSuspiciousActivityStats(): SuspiciousActivity[] {
    return [...this.suspiciousActivities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  clearFailedLogins(email?: string): void {
    if (email) {
      this.failedLogins.delete(email)
    } else {
      this.failedLogins.clear()
    }
  }

  isIPSuspicious(ipAddress: string): boolean {
    return this.suspiciousActivities.some((activity) => activity.ip === ipAddress)
  }

  // Clean up old data periodically
  cleanup() {
    const cutoff = new Date(Date.now() - this.IP_LOCKOUT_DURATION)

    for (const [key, attempts] of this.failedLogins.entries()) {
      const recentAttempts = attempts.filter((a) => a.timestamp > cutoff)
      if (recentAttempts.length === 0) {
        this.failedLogins.delete(key)
      } else {
        this.failedLogins.set(key, recentAttempts)
      }
    }

    // Remove suspicious activities older than 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.suspiciousActivities = this.suspiciousActivities.filter((a) => a.timestamp.getTime() > oneDayAgo)
  }
}

export const securityMonitor = SecurityMonitor.getInstance()

// Clean up every hour
setInterval(
  () => {
    securityMonitor.cleanup()
  },
  60 * 60 * 1000,
)
