import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

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

export interface NotificationData {
  type: "security" | "admin" | "system" | "user"
  subject: string
  message: string
  priority: "low" | "medium" | "high" | "critical"
  recipients: string[]
  metadata?: Record<string, any>
}

export interface NotificationHistory {
  id: string
  type: string
  subject: string
  message: string
  recipients: string[]
  status: "pending" | "sent" | "delivered" | "failed"
  sentAt: Date
  deliveredAt?: Date
  error?: string
  metadata?: Record<string, any>
}

class AdminNotificationService {
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

  private async logNotification(notification: NotificationData, status: string, error?: string) {
    try {
      const db = await connectToDatabase()
      await db.collection("notification_history").insertOne({
        type: notification.type,
        subject: notification.subject,
        message: notification.message,
        recipients: notification.recipients,
        status,
        sentAt: new Date(),
        error,
        metadata: notification.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Failed to log notification:", error)
    }
  }

  async sendSecurityAlert(data: {
    title: string
    message: string
    severity: "low" | "medium" | "high" | "critical"
    userEmail?: string
    ipAddress?: string
    userAgent?: string
  }) {
    const notification: NotificationData = {
      type: "security",
      subject: `Security Alert: ${data.title}`,
      message: `
        <h2>Security Alert</h2>
        <p><strong>Alert:</strong> ${data.title}</p>
        <p><strong>Severity:</strong> ${data.severity}</p>
        <p><strong>Details:</strong> ${data.message}</p>
        ${data.userEmail ? `<p><strong>User:</strong> ${data.userEmail}</p>` : ""}
        ${data.ipAddress ? `<p><strong>IP Address:</strong> ${data.ipAddress}</p>` : ""}
        ${data.userAgent ? `<p><strong>User Agent:</strong> ${data.userAgent}</p>` : ""}
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
      priority: data.severity,
      recipients: this.config.adminEmails,
      metadata: {
        userEmail: data.userEmail,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        severity: data.severity,
      },
    }

    return this.sendNotification(notification)
  }

  async sendAdminAction(data: {
    action: string
    adminUser: string
    targetUser?: string
    details: string
  }) {
    const notification: NotificationData = {
      type: "admin",
      subject: `Admin Action: ${data.action}`,
      message: `
        <h2>Admin Action Performed</h2>
        <p><strong>Action:</strong> ${data.action}</p>
        <p><strong>Performed by:</strong> ${data.adminUser}</p>
        ${data.targetUser ? `<p><strong>Target User:</strong> ${data.targetUser}</p>` : ""}
        <p><strong>Details:</strong> ${data.details}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
      priority: "medium",
      recipients: this.config.adminEmails,
      metadata: {
        action: data.action,
        adminUser: data.adminUser,
        targetUser: data.targetUser,
      },
    }

    return this.sendNotification(notification)
  }

  async sendSystemHealth(data: {
    component: string
    status: "healthy" | "warning" | "critical" | "down"
    message: string
    metrics?: Record<string, any>
  }) {
    const priority =
      data.status === "critical" || data.status === "down" ? "critical" : data.status === "warning" ? "high" : "medium"

    const notification: NotificationData = {
      type: "system",
      subject: `System Health: ${data.component} - ${data.status.toUpperCase()}`,
      message: `
        <h2>System Health Alert</h2>
        <p><strong>Component:</strong> ${data.component}</p>
        <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        ${data.metrics ? `<p><strong>Metrics:</strong> ${JSON.stringify(data.metrics, null, 2)}</p>` : ""}
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
      priority,
      recipients: this.config.adminEmails,
      metadata: {
        component: data.component,
        status: data.status,
        metrics: data.metrics,
      },
    }

    return this.sendNotification(notification)
  }

  private async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      // Log the notification attempt
      await this.logNotification(notification, "pending")

      // Send email notifications
      for (const recipient of notification.recipients) {
        try {
          await sendEmail({
            to: recipient,
            subject: notification.subject,
            html: notification.message,
            text: notification.message.replace(/<[^>]*>/g, ""), // Strip HTML for text version
          })
        } catch (emailError) {
          console.error(`Failed to send email to ${recipient}:`, emailError)
          await this.logNotification(notification, "failed", String(emailError))
          return false
        }
      }

      // Log successful delivery
      await this.logNotification(notification, "sent")
      return true
    } catch (error) {
      console.error("Failed to send notification:", error)
      await this.logNotification(notification, "failed", String(error))
      return false
    }
  }

  async getNotificationHistory(filters?: {
    type?: string
    status?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<NotificationHistory[]> {
    try {
      const db = await connectToDatabase()
      const query: any = {}

      if (filters?.type) query.type = filters.type
      if (filters?.status) query.status = filters.status
      if (filters?.startDate || filters?.endDate) {
        query.sentAt = {}
        if (filters.startDate) query.sentAt.$gte = filters.startDate
        if (filters.endDate) query.sentAt.$lte = filters.endDate
      }

      const notifications = await db
        .collection("notification_history")
        .find(query)
        .sort({ sentAt: -1 })
        .limit(filters?.limit || 100)
        .skip(filters?.offset || 0)
        .toArray()

      return notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        subject: n.subject,
        message: n.message,
        recipients: n.recipients,
        status: n.status,
        sentAt: n.sentAt,
        deliveredAt: n.deliveredAt,
        error: n.error,
        metadata: n.metadata,
      }))
    } catch (error) {
      console.error("Failed to fetch notification history:", error)
      return []
    }
  }

  async getNotificationStats(): Promise<{
    total: number
    sent: number
    failed: number
    pending: number
    byType: Record<string, number>
  }> {
    try {
      const db = await connectToDatabase()
      const stats = await db
        .collection("notification_history")
        .aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
              failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            },
          },
        ])
        .toArray()

      const typeStats = await db
        .collection("notification_history")
        .aggregate([
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray()

      const byType: Record<string, number> = {}
      typeStats.forEach((stat) => {
        byType[stat._id] = stat.count
      })

      return {
        total: stats[0]?.total || 0,
        sent: stats[0]?.sent || 0,
        failed: stats[0]?.failed || 0,
        pending: stats[0]?.pending || 0,
        byType,
      }
    } catch (error) {
      console.error("Failed to fetch notification stats:", error)
      return {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        byType: {},
      }
    }
  }
}

// Create and export singleton instance
const adminNotificationService = new AdminNotificationService()

// Named exports
export { adminNotificationService, AdminNotificationService }

// Default export
export default adminNotificationService
