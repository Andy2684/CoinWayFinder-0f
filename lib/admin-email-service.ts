import { emailService } from "./email-service"

interface AdminActionData {
  adminEmail: string
  adminName: string
  targetUserEmail: string
  targetUserName: string
  action: string
  actionDetails: string
  timestamp: string
  ipAddress?: string
  metadata?: Record<string, any>
}

interface SecurityAlertData {
  alertType: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  affectedUsers?: number
  timestamp: string
  ipAddress?: string
  location?: string
  metadata?: Record<string, any>
}

interface SystemEventData {
  eventType: string
  description: string
  severity: "info" | "warning" | "error" | "critical"
  timestamp: string
  metadata?: Record<string, any>
}

class AdminEmailService {
  private adminEmails: string[] = []

  constructor() {
    // Load admin emails from environment or database
    const adminEmailsEnv = process.env.ADMIN_EMAILS
    if (adminEmailsEnv) {
      this.adminEmails = adminEmailsEnv.split(",").map((email) => email.trim())
    }
  }

  async sendAdminActionNotification(data: AdminActionData): Promise<boolean> {
    const template = this.getAdminActionTemplate(data)

    try {
      const results = await Promise.all(
        this.adminEmails.map((adminEmail) =>
          emailService.sendEmail({
            to: adminEmail,
            subject: `Admin Action: ${data.action} - ${data.targetUserEmail}`,
            html: template.html,
            text: template.text,
          }),
        ),
      )

      return results.every((result) => result)
    } catch (error) {
      console.error("Failed to send admin action notification:", error)
      return false
    }
  }

  async sendSecurityAlert(data: SecurityAlertData): Promise<boolean> {
    const template = this.getSecurityAlertTemplate(data)

    try {
      const results = await Promise.all(
        this.adminEmails.map((adminEmail) =>
          emailService.sendEmail({
            to: adminEmail,
            subject: `🚨 Security Alert: ${data.alertType} (${data.severity.toUpperCase()})`,
            html: template.html,
            text: template.text,
          }),
        ),
      )

      return results.every((result) => result)
    } catch (error) {
      console.error("Failed to send security alert:", error)
      return false
    }
  }

  async sendSystemEvent(data: SystemEventData): Promise<boolean> {
    const template = this.getSystemEventTemplate(data)

    try {
      const results = await Promise.all(
        this.adminEmails.map((adminEmail) =>
          emailService.sendEmail({
            to: adminEmail,
            subject: `System Event: ${data.eventType} (${data.severity.toUpperCase()})`,
            html: template.html,
            text: template.text,
          }),
        ),
      )

      return results.every((result) => result)
    } catch (error) {
      console.error("Failed to send system event notification:", error)
      return false
    }
  }

  async sendUserRegistrationAlert(userEmail: string, userName: string, ipAddress?: string): Promise<boolean> {
    return this.sendSecurityAlert({
      alertType: "New User Registration",
      severity: "low",
      description: `New user registered: ${userName} (${userEmail})`,
      affectedUsers: 1,
      timestamp: new Date().toISOString(),
      ipAddress,
      metadata: { userEmail, userName },
    })
  }

  async sendFailedLoginAlert(email: string, attempts: number, ipAddress?: string, location?: string): Promise<boolean> {
    const severity = attempts > 10 ? "critical" : attempts > 5 ? "high" : "medium"

    return this.sendSecurityAlert({
      alertType: "Multiple Failed Login Attempts",
      severity,
      description: `${attempts} failed login attempts for ${email}`,
      timestamp: new Date().toISOString(),
      ipAddress,
      location,
      metadata: { email, attempts },
    })
  }

  async sendSuspiciousActivityAlert(description: string, userId?: string, ipAddress?: string): Promise<boolean> {
    return this.sendSecurityAlert({
      alertType: "Suspicious Activity Detected",
      severity: "high",
      description,
      timestamp: new Date().toISOString(),
      ipAddress,
      metadata: { userId },
    })
  }

  private getAdminActionTemplate(data: AdminActionData) {
    const severityColor = this.getSeverityColor(data.action)

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Action Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, ${severityColor} 0%, ${severityColor}dd 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .action-box { background-color: #f8f9fa; border-left: 4px solid ${severityColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .button { display: inline-block; background-color: ${severityColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            .metadata { font-family: monospace; background-color: #f1f3f4; padding: 10px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 Admin Action Performed</h1>
              <p>Administrative action has been executed</p>
            </div>
            <div class="content">
              <div class="action-box">
                <h3>Action Details</h3>
                <p><strong>Action:</strong> ${data.action}</p>
                <p><strong>Performed by:</strong> ${data.adminName} (${data.adminEmail})</p>
                <p><strong>Target User:</strong> ${data.targetUserName} (${data.targetUserEmail})</p>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                ${data.ipAddress ? `<p><strong>IP Address:</strong> ${data.ipAddress}</p>` : ""}
              </div>

              <div class="details">
                <h3>Action Description</h3>
                <p>${data.actionDetails}</p>
              </div>

              ${
                data.metadata
                  ? `
                <div class="details">
                  <h3>Additional Information</h3>
                  <div class="metadata">${JSON.stringify(data.metadata, null, 2)}</div>
                </div>
              `
                  : ""
              }

              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/users" class="button">View Admin Dashboard</a>
            </div>
            <div class="footer">
              <p>This is an automated notification from CoinWayFinder Admin System.</p>
              <p>© 2024 CoinWayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
Admin Action Notification

Action: ${data.action}
Performed by: ${data.adminName} (${data.adminEmail})
Target User: ${data.targetUserName} (${data.targetUserEmail})
Time: ${new Date(data.timestamp).toLocaleString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ""}

Action Description:
${data.actionDetails}

${data.metadata ? `Additional Information:\n${JSON.stringify(data.metadata, null, 2)}` : ""}

View Admin Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/users

This is an automated notification from CoinWayFinder Admin System.
© 2024 CoinWayFinder. All rights reserved.
    `

    return { html, text }
  }

  private getSecurityAlertTemplate(data: SecurityAlertData) {
    const severityColor = this.getSeverityColor(data.severity)
    const severityEmoji = this.getSeverityEmoji(data.severity)

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Security Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, ${severityColor} 0%, ${severityColor}dd 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .alert-box { background-color: ${data.severity === "critical" ? "#ffebee" : "#fff3e0"}; border-left: 4px solid ${severityColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .button { display: inline-block; background-color: ${severityColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            .severity { display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: ${severityColor}; color: white; font-weight: bold; text-transform: uppercase; }
            .metadata { font-family: monospace; background-color: #f1f3f4; padding: 10px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${severityEmoji} Security Alert</h1>
              <p>Security event detected on CoinWayFinder</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <h3>${data.alertType} <span class="severity">${data.severity}</span></h3>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                ${data.ipAddress ? `<p><strong>IP Address:</strong> ${data.ipAddress}</p>` : ""}
                ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ""}
                ${data.affectedUsers ? `<p><strong>Affected Users:</strong> ${data.affectedUsers}</p>` : ""}
              </div>

              <div class="details">
                <h3>Alert Description</h3>
                <p>${data.description}</p>
              </div>

              ${
                data.metadata
                  ? `
                <div class="details">
                  <h3>Technical Details</h3>
                  <div class="metadata">${JSON.stringify(data.metadata, null, 2)}</div>
                </div>
              `
                  : ""
              }

              <p><strong>Recommended Actions:</strong></p>
              <ul>
                <li>Review the security logs for additional context</li>
                <li>Monitor for similar patterns or escalation</li>
                <li>Consider implementing additional security measures if needed</li>
                ${data.severity === "critical" ? "<li><strong>IMMEDIATE ACTION REQUIRED</strong> - Investigate and respond immediately</li>" : ""}
              </ul>

              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/security" class="button">View Security Dashboard</a>
            </div>
            <div class="footer">
              <p>This is an automated security alert from CoinWayFinder.</p>
              <p>© 2024 CoinWayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
🚨 SECURITY ALERT - ${data.severity.toUpperCase()}

Alert Type: ${data.alertType}
Severity: ${data.severity.toUpperCase()}
Time: ${new Date(data.timestamp).toLocaleString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ""}
${data.location ? `Location: ${data.location}` : ""}
${data.affectedUsers ? `Affected Users: ${data.affectedUsers}` : ""}

Description:
${data.description}

${data.metadata ? `Technical Details:\n${JSON.stringify(data.metadata, null, 2)}` : ""}

Recommended Actions:
- Review the security logs for additional context
- Monitor for similar patterns or escalation
- Consider implementing additional security measures if needed
${data.severity === "critical" ? "- IMMEDIATE ACTION REQUIRED - Investigate and respond immediately" : ""}

View Security Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/security

This is an automated security alert from CoinWayFinder.
© 2024 CoinWayFinder. All rights reserved.
    `

    return { html, text }
  }

  private getSystemEventTemplate(data: SystemEventData) {
    const severityColor = this.getSeverityColor(data.severity)
    const severityEmoji = this.getSeverityEmoji(data.severity)

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>System Event Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, ${severityColor} 0%, ${severityColor}dd 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .event-box { background-color: #f8f9fa; border-left: 4px solid ${severityColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .button { display: inline-block; background-color: ${severityColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            .severity { display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: ${severityColor}; color: white; font-weight: bold; text-transform: uppercase; }
            .metadata { font-family: monospace; background-color: #f1f3f4; padding: 10px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${severityEmoji} System Event</h1>
              <p>System event notification from CoinWayFinder</p>
            </div>
            <div class="content">
              <div class="event-box">
                <h3>${data.eventType} <span class="severity">${data.severity}</span></h3>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
              </div>

              <div class="details">
                <h3>Event Description</h3>
                <p>${data.description}</p>
              </div>

              ${
                data.metadata
                  ? `
                <div class="details">
                  <h3>System Details</h3>
                  <div class="metadata">${JSON.stringify(data.metadata, null, 2)}</div>
                </div>
              `
                  : ""
              }

              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" class="button">View Admin Dashboard</a>
            </div>
            <div class="footer">
              <p>This is an automated system notification from CoinWayFinder.</p>
              <p>© 2024 CoinWayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
System Event Notification

Event Type: ${data.eventType}
Severity: ${data.severity.toUpperCase()}
Time: ${new Date(data.timestamp).toLocaleString()}

Description:
${data.description}

${data.metadata ? `System Details:\n${JSON.stringify(data.metadata, null, 2)}` : ""}

View Admin Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/admin

This is an automated system notification from CoinWayFinder.
© 2024 CoinWayFinder. All rights reserved.
    `

    return { html, text }
  }

  private getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case "critical":
        return "#d32f2f"
      case "high":
        return "#f57c00"
      case "medium":
        return "#fbc02d"
      case "low":
        return "#388e3c"
      case "info":
        return "#1976d2"
      case "warning":
        return "#f57c00"
      case "error":
        return "#d32f2f"
      case "user_delete":
        return "#d32f2f"
      case "user_promote":
        return "#388e3c"
      case "user_demote":
        return "#f57c00"
      case "user_verify":
        return "#1976d2"
      default:
        return "#666666"
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity.toLowerCase()) {
      case "critical":
        return "🚨"
      case "high":
        return "⚠️"
      case "medium":
        return "⚡"
      case "low":
        return "ℹ️"
      case "info":
        return "ℹ️"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      default:
        return "📢"
    }
  }

  setAdminEmails(emails: string[]) {
    this.adminEmails = emails
  }

  getAdminEmails(): string[] {
    return [...this.adminEmails]
  }
}

export const adminEmailService = new AdminEmailService()
