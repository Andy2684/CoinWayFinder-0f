import { sendEmail } from "./email"

export interface NotificationConfig {
  adminEmails: string[]
  securityEmails: string[]
  enabledTypes: {
    security: boolean
    adminActions: boolean
    systemHealth: boolean
    userManagement: boolean
  }
}

export interface SecurityEvent {
  type: "failed_login" | "suspicious_activity" | "unauthorized_access" | "data_breach"
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  details: string
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
}

export interface AdminAction {
  type: "user_deleted" | "user_banned" | "role_changed" | "settings_updated" | "data_export"
  adminId: string
  adminEmail: string
  targetUserId?: string
  targetUserEmail?: string
  details: string
  timestamp: Date
}

export class AdminNotificationService {
  private static instance: AdminNotificationService
  private config: NotificationConfig = {
    adminEmails: process.env.ADMIN_EMAILS?.split(",") || [],
    securityEmails: process.env.SECURITY_ALERT_EMAILS?.split(",") || [],
    enabledTypes: {
      security: true,
      adminActions: true,
      systemHealth: true,
      userManagement: true,
    },
  }

  static getInstance(): AdminNotificationService {
    if (!AdminNotificationService.instance) {
      AdminNotificationService.instance = new AdminNotificationService()
    }
    return AdminNotificationService.instance
  }

  async updateConfig(newConfig: Partial<NotificationConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): NotificationConfig {
    return this.config
  }

  async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    if (!this.config.enabledTypes.security) return

    const recipients =
      event.severity === "critical" || event.severity === "high"
        ? [...this.config.adminEmails, ...this.config.securityEmails]
        : this.config.securityEmails

    const subject = `🚨 Security Alert: ${this.getSecurityEventTitle(event.type)}`
    const htmlContent = this.generateSecurityAlertHTML(event)
    const textContent = this.generateSecurityAlertText(event)

    for (const email of recipients) {
      try {
        await sendEmail({
          to: email,
          subject,
          html: htmlContent,
          text: textContent,
        })
      } catch (error) {
        console.error(`Failed to send security alert to ${email}:`, error)
      }
    }
  }

  async sendAdminActionNotification(action: AdminAction): Promise<void> {
    if (!this.config.enabledTypes.adminActions) return

    const subject = `📋 Admin Action: ${this.getAdminActionTitle(action.type)}`
    const htmlContent = this.generateAdminActionHTML(action)
    const textContent = this.generateAdminActionText(action)

    for (const email of this.config.adminEmails) {
      try {
        await sendEmail({
          to: email,
          subject,
          html: htmlContent,
          text: textContent,
        })
      } catch (error) {
        console.error(`Failed to send admin action notification to ${email}:`, error)
      }
    }
  }

  async sendSystemHealthAlert(message: string, severity: "low" | "medium" | "high" | "critical"): Promise<void> {
    if (!this.config.enabledTypes.systemHealth) return

    const recipients =
      severity === "critical" || severity === "high"
        ? [...this.config.adminEmails, ...this.config.securityEmails]
        : this.config.adminEmails

    const subject = `⚠️ System Health Alert: ${severity.toUpperCase()}`
    const htmlContent = this.generateSystemHealthHTML(message, severity)
    const textContent = this.generateSystemHealthText(message, severity)

    for (const email of recipients) {
      try {
        await sendEmail({
          to: email,
          subject,
          html: htmlContent,
          text: textContent,
        })
      } catch (error) {
        console.error(`Failed to send system health alert to ${email}:`, error)
      }
    }
  }

  async sendTestNotification(email: string, type: string): Promise<void> {
    const subject = `🧪 Test Notification: ${type}`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Test Notification</h2>
        <p>This is a test notification of type: <strong>${type}</strong></p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>If you received this email, your notification configuration is working correctly.</p>
      </div>
    `
    const textContent = `Test Notification: ${type}\n\nSent at: ${new Date().toISOString()}\n\nIf you received this email, your notification configuration is working correctly.`

    await sendEmail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    })
  }

  private getSecurityEventTitle(type: string): string {
    const titles = {
      failed_login: "Failed Login Attempt",
      suspicious_activity: "Suspicious Activity Detected",
      unauthorized_access: "Unauthorized Access Attempt",
      data_breach: "Potential Data Breach",
    }
    return titles[type as keyof typeof titles] || "Security Event"
  }

  private getAdminActionTitle(type: string): string {
    const titles = {
      user_deleted: "User Account Deleted",
      user_banned: "User Account Banned",
      role_changed: "User Role Changed",
      settings_updated: "System Settings Updated",
      data_export: "Data Export Performed",
    }
    return titles[type as keyof typeof titles] || "Admin Action"
  }

  private generateSecurityAlertHTML(event: SecurityEvent): string {
    const severityColor = {
      low: "#28a745",
      medium: "#ffc107",
      high: "#fd7e14",
      critical: "#dc3545",
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: ${severityColor[event.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🚨 Security Alert</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${this.getSecurityEventTitle(event.type)}</p>
        </div>
        <div style="padding: 20px;">
          <div style="margin-bottom: 15px;">
            <strong>Severity:</strong> <span style="color: ${severityColor[event.severity]}; text-transform: uppercase;">${event.severity}</span>
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Time:</strong> ${event.timestamp.toISOString()}
          </div>
          ${event.email ? `<div style="margin-bottom: 15px;"><strong>User:</strong> ${event.email}</div>` : ""}
          ${event.ip ? `<div style="margin-bottom: 15px;"><strong>IP Address:</strong> ${event.ip}</div>` : ""}
          ${event.userAgent ? `<div style="margin-bottom: 15px;"><strong>User Agent:</strong> ${event.userAgent}</div>` : ""}
          <div style="margin-bottom: 15px;">
            <strong>Details:</strong> ${event.details}
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              This is an automated security alert from CoinWayFinder. Please review and take appropriate action if necessary.
            </p>
          </div>
        </div>
      </div>
    `
  }

  private generateSecurityAlertText(event: SecurityEvent): string {
    return `
SECURITY ALERT: ${this.getSecurityEventTitle(event.type)}

Severity: ${event.severity.toUpperCase()}
Time: ${event.timestamp.toISOString()}
${event.email ? `User: ${event.email}` : ""}
${event.ip ? `IP Address: ${event.ip}` : ""}
${event.userAgent ? `User Agent: ${event.userAgent}` : ""}

Details: ${event.details}

This is an automated security alert from CoinWayFinder. Please review and take appropriate action if necessary.
    `.trim()
  }

  private generateAdminActionHTML(action: AdminAction): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">📋 Admin Action</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${this.getAdminActionTitle(action.type)}</p>
        </div>
        <div style="padding: 20px;">
          <div style="margin-bottom: 15px;">
            <strong>Time:</strong> ${action.timestamp.toISOString()}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Admin:</strong> ${action.adminEmail}
          </div>
          ${action.targetUserEmail ? `<div style="margin-bottom: 15px;"><strong>Target User:</strong> ${action.targetUserEmail}</div>` : ""}
          <div style="margin-bottom: 15px;">
            <strong>Details:</strong> ${action.details}
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              This is an automated notification of an admin action performed on CoinWayFinder.
            </p>
          </div>
        </div>
      </div>
    `
  }

  private generateAdminActionText(action: AdminAction): string {
    return `
ADMIN ACTION: ${this.getAdminActionTitle(action.type)}

Time: ${action.timestamp.toISOString()}
Admin: ${action.adminEmail}
${action.targetUserEmail ? `Target User: ${action.targetUserEmail}` : ""}

Details: ${action.details}

This is an automated notification of an admin action performed on CoinWayFinder.
    `.trim()
  }

  private generateSystemHealthHTML(message: string, severity: string): string {
    const severityColor = {
      low: "#28a745",
      medium: "#ffc107",
      high: "#fd7e14",
      critical: "#dc3545",
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: ${severityColor[severity as keyof typeof severityColor]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⚠️ System Health Alert</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Severity: ${severity.toUpperCase()}</p>
        </div>
        <div style="padding: 20px;">
          <div style="margin-bottom: 15px;">
            <strong>Time:</strong> ${new Date().toISOString()}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Message:</strong> ${message}
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              This is an automated system health alert from CoinWayFinder. Please investigate and resolve if necessary.
            </p>
          </div>
        </div>
      </div>
    `
  }

  private generateSystemHealthText(message: string, severity: string): string {
    return `
SYSTEM HEALTH ALERT

Severity: ${severity.toUpperCase()}
Time: ${new Date().toISOString()}

Message: ${message}

This is an automated system health alert from CoinWayFinder. Please investigate and resolve if necessary.
    `.trim()
  }
}

export const adminNotificationService = AdminNotificationService.getInstance()
