import { sendEmail } from "./email"

export interface NotificationConfig {
  adminEmails: string[]
  securityEmails: string[]
  enabledNotifications: {
    securityAlerts: boolean
    adminActions: boolean
    systemHealth: boolean
    userManagement: boolean
  }
}

export interface SecurityEvent {
  userId?: string
  ipAddress: string
  userAgent: string
  eventType: "failed_login" | "suspicious_activity" | "data_breach" | "unauthorized_access" | "login_attempt"
  timestamp: Date
  details: Record<string, any>
}

export interface AdminAction {
  adminId: string
  adminEmail: string
  action: "user_delete" | "user_ban" | "role_change" | "data_export" | "settings_change"
  targetUserId?: string
  targetUserEmail?: string
  timestamp: Date
  details: Record<string, any>
}

class AdminNotificationService {
  private config: NotificationConfig = {
    adminEmails: process.env.ADMIN_EMAILS?.split(",") || [],
    securityEmails: process.env.SECURITY_ALERT_EMAILS?.split(",") || [],
    enabledNotifications: {
      securityAlerts: true,
      adminActions: true,
      systemHealth: true,
      userManagement: true,
    },
  }

  async updateConfig(newConfig: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): NotificationConfig {
    return this.config
  }

  async sendSecurityAlert(event: SecurityEvent) {
    if (!this.config.enabledNotifications.securityAlerts) return

    const subject = this.getSecurityAlertSubject(event.eventType)
    const { html, text } = this.generateSecurityAlertEmail(event)

    const recipients = [...this.config.adminEmails, ...this.config.securityEmails]

    for (const email of recipients) {
      try {
        await sendEmail({
          to: email,
          subject,
          html,
          text,
        })
      } catch (error) {
        console.error(`Failed to send security alert to ${email}:`, error)
      }
    }
  }

  async sendAdminActionNotification(action: AdminAction) {
    if (!this.config.enabledNotifications.adminActions) return

    const subject = this.getAdminActionSubject(action.action)
    const { html, text } = this.generateAdminActionEmail(action)

    for (const email of this.config.adminEmails) {
      try {
        await sendEmail({
          to: email,
          subject,
          html,
          text,
        })
      } catch (error) {
        console.error(`Failed to send admin action notification to ${email}:`, error)
      }
    }
  }

  async sendTestNotification(email: string, type: "security" | "admin") {
    const testEvent: SecurityEvent = {
      userId: "test-user",
      ipAddress: "192.168.1.1",
      userAgent: "Test Browser",
      eventType: "failed_login",
      timestamp: new Date(),
      details: { test: true },
    }

    const testAction: AdminAction = {
      adminId: "test-admin",
      adminEmail: "admin@test.com",
      action: "user_delete",
      targetUserId: "test-target",
      targetUserEmail: "target@test.com",
      timestamp: new Date(),
      details: { test: true },
    }

    if (type === "security") {
      const subject = "[TEST] Security Alert - Failed Login Attempt"
      const { html, text } = this.generateSecurityAlertEmail(testEvent)
      await sendEmail({ to: email, subject, html, text })
    } else {
      const subject = "[TEST] Admin Action - User Deletion"
      const { html, text } = this.generateAdminActionEmail(testAction)
      await sendEmail({ to: email, subject, html, text })
    }
  }

  private getSecurityAlertSubject(eventType: string): string {
    const subjects = {
      failed_login: "🚨 Security Alert - Failed Login Attempt",
      suspicious_activity: "⚠️ Security Alert - Suspicious Activity Detected",
      data_breach: "🔴 CRITICAL - Potential Data Breach",
      unauthorized_access: "🚨 Security Alert - Unauthorized Access Attempt",
      login_attempt: "✅ Login Notification",
    }
    return subjects[eventType as keyof typeof subjects] || "🚨 Security Alert"
  }

  private getAdminActionSubject(action: string): string {
    const subjects = {
      user_delete: "👤 Admin Action - User Account Deleted",
      user_ban: "🚫 Admin Action - User Account Banned",
      role_change: "🔄 Admin Action - User Role Changed",
      data_export: "📊 Admin Action - Data Export Performed",
      settings_change: "⚙️ Admin Action - System Settings Changed",
    }
    return subjects[action as keyof typeof subjects] || "⚙️ Admin Action Performed"
  }

  private generateSecurityAlertEmail(event: SecurityEvent) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Security Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .details { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Security Alert</h1>
            </div>
            <div class="content">
              <h2>Security Event Detected</h2>
              <p>A security event has been detected on your CoinWayFinder platform:</p>
              
              <div class="details">
                <h3>Event Details</h3>
                <p><strong>Event Type:</strong> ${event.eventType.replace("_", " ").toUpperCase()}</p>
                <p><strong>Timestamp:</strong> ${event.timestamp.toISOString()}</p>
                <p><strong>IP Address:</strong> ${event.ipAddress}</p>
                <p><strong>User Agent:</strong> ${event.userAgent}</p>
                ${event.userId ? `<p><strong>User ID:</strong> ${event.userId}</p>` : ""}
                ${Object.entries(event.details)
                  .map(([key, value]) => `<p><strong>${key.replace("_", " ")}:</strong> ${value}</p>`)
                  .join("")}
              </div>
              
              <p><strong>Recommended Actions:</strong></p>
              <ul>
                <li>Review the security logs for additional suspicious activity</li>
                <li>Consider implementing additional security measures if needed</li>
                <li>Monitor for similar events from the same IP address</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated security notification from CoinWayFinder</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
SECURITY ALERT - CoinWayFinder

A security event has been detected:

Event Type: ${event.eventType.replace("_", " ").toUpperCase()}
Timestamp: ${event.timestamp.toISOString()}
IP Address: ${event.ipAddress}
User Agent: ${event.userAgent}
${event.userId ? `User ID: ${event.userId}` : ""}

Additional Details:
${Object.entries(event.details)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

Please review your security logs and take appropriate action if necessary.

This is an automated notification from CoinWayFinder.
    `

    return { html, text }
  }

  private generateAdminActionEmail(action: AdminAction) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Admin Action Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .details { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚙️ Admin Action Performed</h1>
            </div>
            <div class="content">
              <h2>Administrative Action Notification</h2>
              <p>An administrative action has been performed on the CoinWayFinder platform:</p>
              
              <div class="details">
                <h3>Action Details</h3>
                <p><strong>Action:</strong> ${action.action.replace("_", " ").toUpperCase()}</p>
                <p><strong>Performed By:</strong> ${action.adminEmail}</p>
                <p><strong>Admin ID:</strong> ${action.adminId}</p>
                <p><strong>Timestamp:</strong> ${action.timestamp.toISOString()}</p>
                ${action.targetUserId ? `<p><strong>Target User ID:</strong> ${action.targetUserId}</p>` : ""}
                ${action.targetUserEmail ? `<p><strong>Target User Email:</strong> ${action.targetUserEmail}</p>` : ""}
                
                <h4>Additional Details:</h4>
                ${Object.entries(action.details)
                  .map(([key, value]) => `<p><strong>${key.replace("_", " ")}:</strong> ${value}</p>`)
                  .join("")}
              </div>
              
              <p>This action has been logged in the audit trail for compliance purposes.</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from CoinWayFinder Admin System</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
ADMIN ACTION NOTIFICATION - CoinWayFinder

An administrative action has been performed:

Action: ${action.action.replace("_", " ").toUpperCase()}
Performed By: ${action.adminEmail}
Admin ID: ${action.adminId}
Timestamp: ${action.timestamp.toISOString()}
${action.targetUserId ? `Target User ID: ${action.targetUserId}` : ""}
${action.targetUserEmail ? `Target User Email: ${action.targetUserEmail}` : ""}

Additional Details:
${Object.entries(action.details)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

This action has been logged in the audit trail.

This is an automated notification from CoinWayFinder.
    `

    return { html, text }
  }
}

export const adminNotificationService = new AdminNotificationService()
