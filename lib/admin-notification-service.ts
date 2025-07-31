import { emailService } from "./email-service"
import { auditLogger } from "./audit-logger"

export interface NotificationConfig {
  adminEmails: string[]
  securityEmails: string[]
  enabledTypes: {
    securityAlerts: boolean
    adminActions: boolean
    systemHealth: boolean
    userManagement: boolean
  }
}

export interface SecurityAlert {
  type: "failed_login" | "suspicious_activity" | "unauthorized_access" | "data_breach"
  severity: "low" | "medium" | "high" | "critical"
  details: {
    userId?: string
    email?: string
    ipAddress?: string
    userAgent?: string
    timestamp: Date
    description: string
    metadata?: Record<string, any>
  }
}

export interface AdminAction {
  type: "user_deleted" | "user_banned" | "role_changed" | "settings_updated" | "data_exported"
  adminId: string
  adminEmail: string
  targetUserId?: string
  targetUserEmail?: string
  details: {
    action: string
    timestamp: Date
    changes?: Record<string, any>
    reason?: string
  }
}

class AdminNotificationService {
  private config: NotificationConfig = {
    adminEmails: process.env.ADMIN_EMAILS?.split(",") || [],
    securityEmails: process.env.SECURITY_ALERT_EMAILS?.split(",") || [],
    enabledTypes: {
      securityAlerts: true,
      adminActions: true,
      systemHealth: true,
      userManagement: true,
    },
  }

  async updateConfig(newConfig: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...newConfig }
    await auditLogger.log({
      action: "notification_config_updated",
      userId: "system",
      details: { newConfig },
      timestamp: new Date(),
    })
  }

  async sendSecurityAlert(alert: SecurityAlert) {
    if (!this.config.enabledTypes.securityAlerts) return

    const recipients =
      alert.severity === "critical" || alert.severity === "high"
        ? [...this.config.adminEmails, ...this.config.securityEmails]
        : this.config.securityEmails

    const subject = `🚨 Security Alert: ${alert.type.replace("_", " ").toUpperCase()}`

    const htmlContent = this.generateSecurityAlertHTML(alert)
    const textContent = this.generateSecurityAlertText(alert)

    try {
      await emailService.sendEmail({
        to: recipients,
        subject,
        html: htmlContent,
        text: textContent,
      })

      await auditLogger.log({
        action: "security_alert_sent",
        userId: "system",
        details: { alert, recipients: recipients.length },
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Failed to send security alert:", error)
      throw error
    }
  }

  async sendAdminActionNotification(action: AdminAction) {
    if (!this.config.enabledTypes.adminActions) return

    const recipients = this.config.adminEmails
    const subject = `Admin Action: ${action.type.replace("_", " ").toUpperCase()}`

    const htmlContent = this.generateAdminActionHTML(action)
    const textContent = this.generateAdminActionText(action)

    try {
      await emailService.sendEmail({
        to: recipients,
        subject,
        html: htmlContent,
        text: textContent,
      })

      await auditLogger.log({
        action: "admin_notification_sent",
        userId: action.adminId,
        details: { action, recipients: recipients.length },
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Failed to send admin action notification:", error)
      throw error
    }
  }

  async sendSystemHealthAlert(details: {
    component: string
    status: "degraded" | "down" | "recovered"
    message: string
    timestamp: Date
  }) {
    if (!this.config.enabledTypes.systemHealth) return

    const recipients =
      details.status === "down" ? [...this.config.adminEmails, ...this.config.securityEmails] : this.config.adminEmails

    const subject = `System Health: ${details.component} is ${details.status.toUpperCase()}`

    const htmlContent = this.generateSystemHealthHTML(details)
    const textContent = this.generateSystemHealthText(details)

    try {
      await emailService.sendEmail({
        to: recipients,
        subject,
        html: htmlContent,
        text: textContent,
      })
    } catch (error) {
      console.error("Failed to send system health alert:", error)
      throw error
    }
  }

  async sendTestNotification(email: string, type: "security" | "admin" | "system") {
    const testData = {
      security: {
        subject: "🧪 Test Security Alert",
        html: "<h2>Test Security Alert</h2><p>This is a test security notification.</p>",
        text: "Test Security Alert\n\nThis is a test security notification.",
      },
      admin: {
        subject: "🧪 Test Admin Notification",
        html: "<h2>Test Admin Notification</h2><p>This is a test admin action notification.</p>",
        text: "Test Admin Notification\n\nThis is a test admin action notification.",
      },
      system: {
        subject: "🧪 Test System Health Alert",
        html: "<h2>Test System Health Alert</h2><p>This is a test system health notification.</p>",
        text: "Test System Health Alert\n\nThis is a test system health notification.",
      },
    }

    const notification = testData[type]

    await emailService.sendEmail({
      to: [email],
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
    })
  }

  private generateSecurityAlertHTML(alert: SecurityAlert): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Security Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #dc3545; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h1 style="margin: 0;">🚨 Security Alert</h1>
              <p style="margin: 5px 0 0 0;">Severity: ${alert.severity.toUpperCase()}</p>
            </div>
            
            <h2>Alert Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Type:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.type.replace("_", " ").toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Time:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.details.timestamp.toISOString()}</td>
              </tr>
              ${
                alert.details.email
                  ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">User Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.details.email}</td>
              </tr>
              `
                  : ""
              }
              ${
                alert.details.ipAddress
                  ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">IP Address:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.details.ipAddress}</td>
              </tr>
              `
                  : ""
              }
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Description:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.details.description}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
              <p style="margin: 0;"><strong>Action Required:</strong> Please review this security event and take appropriate action if necessary.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateSecurityAlertText(alert: SecurityAlert): string {
    return `
SECURITY ALERT - ${alert.severity.toUpperCase()}

Type: ${alert.type.replace("_", " ").toUpperCase()}
Time: ${alert.details.timestamp.toISOString()}
${alert.details.email ? `User Email: ${alert.details.email}` : ""}
${alert.details.ipAddress ? `IP Address: ${alert.details.ipAddress}` : ""}
Description: ${alert.details.description}

Action Required: Please review this security event and take appropriate action if necessary.
    `.trim()
  }

  private generateAdminActionHTML(action: AdminAction): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Admin Action Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #007bff; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h1 style="margin: 0;">Admin Action Performed</h1>
            </div>
            
            <h2>Action Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Action:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${action.type.replace("_", " ").toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Admin:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${action.adminEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Time:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${action.details.timestamp.toISOString()}</td>
              </tr>
              ${
                action.targetUserEmail
                  ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Target User:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${action.targetUserEmail}</td>
              </tr>
              `
                  : ""
              }
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Description:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${action.details.action}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `
  }

  private generateAdminActionText(action: AdminAction): string {
    return `
ADMIN ACTION NOTIFICATION

Action: ${action.type.replace("_", " ").toUpperCase()}
Admin: ${action.adminEmail}
Time: ${action.details.timestamp.toISOString()}
${action.targetUserEmail ? `Target User: ${action.targetUserEmail}` : ""}
Description: ${action.details.action}
    `.trim()
  }

  private generateSystemHealthHTML(details: {
    component: string
    status: string
    message: string
    timestamp: Date
  }): string {
    const statusColor = details.status === "down" ? "#dc3545" : details.status === "degraded" ? "#ffc107" : "#28a745"

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>System Health Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${statusColor}; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h1 style="margin: 0;">System Health Alert</h1>
              <p style="margin: 5px 0 0 0;">Status: ${details.status.toUpperCase()}</p>
            </div>
            
            <h2>System Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Component:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${details.component}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Status:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${details.status.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Time:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${details.timestamp.toISOString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Message:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${details.message}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `
  }

  private generateSystemHealthText(details: {
    component: string
    status: string
    message: string
    timestamp: Date
  }): string {
    return `
SYSTEM HEALTH ALERT

Component: ${details.component}
Status: ${details.status.toUpperCase()}
Time: ${details.timestamp.toISOString()}
Message: ${details.message}
    `.trim()
  }

  getConfig(): NotificationConfig {
    return { ...this.config }
  }
}

export const adminNotificationService = new AdminNotificationService()
