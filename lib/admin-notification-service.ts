import { sendEmail } from "./email-service"
import { auditLog } from "./audit-logger"

export interface AdminNotificationConfig {
  userManagement: boolean
  securityAlerts: boolean
  systemHealth: boolean
  complianceReports: boolean
  dataExports: boolean
  adminEmails: string[]
  securityEmails: string[]
}

export interface SecurityAlertData {
  type: "failed_login" | "suspicious_activity" | "data_breach" | "unauthorized_access" | "system_compromise"
  severity: "low" | "medium" | "high" | "critical"
  details: {
    userId?: string
    ipAddress?: string
    userAgent?: string
    timestamp: Date
    description: string
    location?: string
    attemptCount?: number
  }
  affectedSystems?: string[]
  recommendedActions?: string[]
}

export interface AdminActionData {
  action: string
  adminId: string
  adminEmail: string
  targetUserId?: string
  targetUserEmail?: string
  details: Record<string, any>
  timestamp: Date
  ipAddress?: string
}

class AdminNotificationService {
  private static instance: AdminNotificationService
  private config: AdminNotificationConfig

  constructor() {
    this.config = {
      userManagement: true,
      securityAlerts: true,
      systemHealth: true,
      complianceReports: true,
      dataExports: true,
      adminEmails: process.env.ADMIN_EMAILS?.split(",") || [],
      securityEmails: process.env.SECURITY_ALERT_EMAILS?.split(",") || process.env.ADMIN_EMAILS?.split(",") || [],
    }
  }

  static getInstance(): AdminNotificationService {
    if (!AdminNotificationService.instance) {
      AdminNotificationService.instance = new AdminNotificationService()
    }
    return AdminNotificationService.instance
  }

  async sendSecurityAlert(alertData: SecurityAlertData): Promise<void> {
    if (!this.config.securityAlerts) return

    const subject = this.getSecurityAlertSubject(alertData)
    const htmlContent = this.generateSecurityAlertEmail(alertData)
    const textContent = this.generateSecurityAlertText(alertData)

    const recipients =
      alertData.severity === "critical" || alertData.severity === "high"
        ? [...this.config.securityEmails, ...this.config.adminEmails]
        : this.config.securityEmails

    for (const email of recipients) {
      try {
        await sendEmail({
          to: email,
          subject,
          html: htmlContent,
          text: textContent,
        })

        await auditLog({
          action: "security_alert_sent",
          userId: "system",
          details: {
            alertType: alertData.type,
            severity: alertData.severity,
            recipient: email,
          },
        })
      } catch (error) {
        console.error(`Failed to send security alert to ${email}:`, error)
      }
    }
  }

  async sendAdminActionNotification(actionData: AdminActionData): Promise<void> {
    if (!this.config.userManagement && !this.isHighRiskAction(actionData.action)) return

    const subject = this.getAdminActionSubject(actionData)
    const htmlContent = this.generateAdminActionEmail(actionData)
    const textContent = this.generateAdminActionText(actionData)

    const recipients = this.isHighRiskAction(actionData.action)
      ? [...this.config.adminEmails, ...this.config.securityEmails]
      : this.config.adminEmails

    for (const email of recipients) {
      if (email === actionData.adminEmail) continue // Don't send to the admin who performed the action

      try {
        await sendEmail({
          to: email,
          subject,
          html: htmlContent,
          text: textContent,
        })

        await auditLog({
          action: "admin_notification_sent",
          userId: actionData.adminId,
          details: {
            notificationAction: actionData.action,
            recipient: email,
          },
        })
      } catch (error) {
        console.error(`Failed to send admin notification to ${email}:`, error)
      }
    }
  }

  async sendSystemHealthAlert(healthData: {
    component: string
    status: "degraded" | "down" | "recovered"
    details: string
    timestamp: Date
  }): Promise<void> {
    if (!this.config.systemHealth) return

    const subject = `System Health Alert - ${healthData.component} is ${healthData.status}`
    const htmlContent = this.generateSystemHealthEmail(healthData)
    const textContent = this.generateSystemHealthText(healthData)

    for (const email of [...this.config.adminEmails, ...this.config.securityEmails]) {
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

  private getSecurityAlertSubject(alertData: SecurityAlertData): string {
    const severityPrefix = alertData.severity.toUpperCase()
    const alertTypeMap = {
      failed_login: "Multiple Failed Login Attempts",
      suspicious_activity: "Suspicious User Activity Detected",
      data_breach: "Potential Data Breach",
      unauthorized_access: "Unauthorized Access Attempt",
      system_compromise: "System Compromise Detected",
    }

    return `[${severityPrefix}] Security Alert - ${alertTypeMap[alertData.type]}`
  }

  private getAdminActionSubject(actionData: AdminActionData): string {
    const actionMap = {
      user_created: "New User Account Created",
      user_deleted: "User Account Deleted",
      user_banned: "User Account Banned",
      user_unbanned: "User Account Unbanned",
      role_changed: "User Role Modified",
      data_export: "User Data Export Performed",
      bulk_action: "Bulk User Action Performed",
      security_settings_changed: "Security Settings Modified",
      admin_created: "New Admin Account Created",
    }

    return `Admin Action Notification - ${actionMap[actionData.action as keyof typeof actionMap] || actionData.action}`
  }

  private isHighRiskAction(action: string): boolean {
    const highRiskActions = [
      "user_deleted",
      "user_banned",
      "admin_created",
      "role_changed",
      "data_export",
      "bulk_action",
      "security_settings_changed",
    ]
    return highRiskActions.includes(action)
  }

  private generateSecurityAlertEmail(alertData: SecurityAlertData): string {
    const severityColor = {
      low: "#fbbf24",
      medium: "#f59e0b",
      high: "#dc2626",
      critical: "#991b1b",
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Security Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${severityColor[alertData.severity]}; color: white; padding: 15px; border-radius: 5px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🚨 Security Alert</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px;">Severity: ${alertData.severity.toUpperCase()}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #374151; margin-top: 0;">Alert Details</h2>
              <p><strong>Type:</strong> ${alertData.type.replace("_", " ").toUpperCase()}</p>
              <p><strong>Time:</strong> ${alertData.details.timestamp.toISOString()}</p>
              <p><strong>Description:</strong> ${alertData.details.description}</p>
              
              ${alertData.details.userId ? `<p><strong>User ID:</strong> ${alertData.details.userId}</p>` : ""}
              ${alertData.details.ipAddress ? `<p><strong>IP Address:</strong> ${alertData.details.ipAddress}</p>` : ""}
              ${alertData.details.location ? `<p><strong>Location:</strong> ${alertData.details.location}</p>` : ""}
              ${alertData.details.attemptCount ? `<p><strong>Attempt Count:</strong> ${alertData.details.attemptCount}</p>` : ""}
              
              ${
                alertData.affectedSystems && alertData.affectedSystems.length > 0
                  ? `
                <p><strong>Affected Systems:</strong></p>
                <ul>
                  ${alertData.affectedSystems.map((system) => `<li>${system}</li>`).join("")}
                </ul>
              `
                  : ""
              }
            </div>

            ${
              alertData.recommendedActions && alertData.recommendedActions.length > 0
                ? `
              <div style="background: #eff6ff; padding: 20px; border-radius: 5px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin-top: 0;">Recommended Actions</h3>
                <ul>
                  ${alertData.recommendedActions.map((action) => `<li>${action}</li>`).join("")}
                </ul>
              </div>
            `
                : ""
            }

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p>This is an automated security alert from CoinWayFinder. Please investigate immediately if this is a high or critical severity alert.</p>
              <p>For questions or support, contact your security team.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateSecurityAlertText(alertData: SecurityAlertData): string {
    return `
SECURITY ALERT - ${alertData.severity.toUpperCase()}

Alert Type: ${alertData.type.replace("_", " ").toUpperCase()}
Time: ${alertData.details.timestamp.toISOString()}
Description: ${alertData.details.description}

${alertData.details.userId ? `User ID: ${alertData.details.userId}\n` : ""}${alertData.details.ipAddress ? `IP Address: ${alertData.details.ipAddress}\n` : ""}${alertData.details.location ? `Location: ${alertData.details.location}\n` : ""}${alertData.details.attemptCount ? `Attempt Count: ${alertData.details.attemptCount}\n` : ""}

${
  alertData.affectedSystems && alertData.affectedSystems.length > 0
    ? `
Affected Systems:
${alertData.affectedSystems.map((system) => `- ${system}`).join("\n")}
`
    : ""
}

${
  alertData.recommendedActions && alertData.recommendedActions.length > 0
    ? `
Recommended Actions:
${alertData.recommendedActions.map((action) => `- ${action}`).join("\n")}
`
    : ""
}

This is an automated security alert from CoinWayFinder. Please investigate immediately if this is a high or critical severity alert.
    `.trim()
  }

  private generateAdminActionEmail(actionData: AdminActionData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Admin Action Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #3b82f6; color: white; padding: 15px; border-radius: 5px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">👤 Admin Action Notification</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #374151; margin-top: 0;">Action Details</h2>
              <p><strong>Action:</strong> ${actionData.action.replace("_", " ").toUpperCase()}</p>
              <p><strong>Performed by:</strong> ${actionData.adminEmail}</p>
              <p><strong>Time:</strong> ${actionData.timestamp.toISOString()}</p>
              ${actionData.ipAddress ? `<p><strong>IP Address:</strong> ${actionData.ipAddress}</p>` : ""}
              
              ${
                actionData.targetUserEmail
                  ? `
                <p><strong>Target User:</strong> ${actionData.targetUserEmail}</p>
              `
                  : ""
              }
              
              ${
                Object.keys(actionData.details).length > 0
                  ? `
                <h3 style="color: #374151;">Additional Details</h3>
                ${Object.entries(actionData.details)
                  .map(
                    ([key, value]) =>
                      `<p><strong>${key.replace("_", " ")}:</strong> ${typeof value === "object" ? JSON.stringify(value) : value}</p>`,
                  )
                  .join("")}
              `
                  : ""
              }
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 14px;">This action has been logged in the audit trail for compliance and security purposes.</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p>This is an automated notification from CoinWayFinder admin system.</p>
              <p>If you have concerns about this action, please contact your security team immediately.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateAdminActionText(actionData: AdminActionData): string {
    return `
ADMIN ACTION NOTIFICATION

Action: ${actionData.action.replace("_", " ").toUpperCase()}
Performed by: ${actionData.adminEmail}
Time: ${actionData.timestamp.toISOString()}
${actionData.ipAddress ? `IP Address: ${actionData.ipAddress}\n` : ""}

${actionData.targetUserEmail ? `Target User: ${actionData.targetUserEmail}\n` : ""}

${
  Object.keys(actionData.details).length > 0
    ? `
Additional Details:
${Object.entries(actionData.details)
  .map(([key, value]) => `${key.replace("_", " ")}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
  .join("\n")}
`
    : ""
}

This action has been logged in the audit trail for compliance and security purposes.
This is an automated notification from CoinWayFinder admin system.
    `.trim()
  }

  private generateSystemHealthEmail(healthData: {
    component: string
    status: "degraded" | "down" | "recovered"
    details: string
    timestamp: Date
  }): string {
    const statusColor = {
      degraded: "#f59e0b",
      down: "#dc2626",
      recovered: "#10b981",
    }

    const statusIcon = {
      degraded: "⚠️",
      down: "🔴",
      recovered: "✅",
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>System Health Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${statusColor[healthData.status]}; color: white; padding: 15px; border-radius: 5px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">${statusIcon[healthData.status]} System Health Alert</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #374151; margin-top: 0;">System Status Update</h2>
              <p><strong>Component:</strong> ${healthData.component}</p>
              <p><strong>Status:</strong> ${healthData.status.toUpperCase()}</p>
              <p><strong>Time:</strong> ${healthData.timestamp.toISOString()}</p>
              <p><strong>Details:</strong> ${healthData.details}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p>This is an automated system health notification from CoinWayFinder.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateSystemHealthText(healthData: {
    component: string
    status: "degraded" | "down" | "recovered"
    details: string
    timestamp: Date
  }): string {
    return `
SYSTEM HEALTH ALERT

Component: ${healthData.component}
Status: ${healthData.status.toUpperCase()}
Time: ${healthData.timestamp.toISOString()}
Details: ${healthData.details}

This is an automated system health notification from CoinWayFinder.
    `.trim()
  }

  async updateConfiguration(config: Partial<AdminNotificationConfig>): Promise<void> {
    this.config = { ...this.config, ...config }

    await auditLog({
      action: "notification_config_updated",
      userId: "admin",
      details: config,
    })
  }

  getConfiguration(): AdminNotificationConfig {
    return { ...this.config }
  }
}

export const adminNotificationService = AdminNotificationService.getInstance()
export default adminNotificationService
