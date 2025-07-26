import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface ProfileChangeData {
  userEmail: string
  userName: string
  changeType: string
  changeDetails: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"CoinWayFinder" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      console.log("Email sent successfully:", info.messageId)
      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  async sendProfileChangeNotification(data: ProfileChangeData): Promise<boolean> {
    const template = this.getProfileChangeTemplate(data)

    return await this.sendEmail({
      to: data.userEmail,
      subject: `Profile Change Notification - ${data.changeType}`,
      html: template.html,
      text: template.text,
    })
  }

  async sendSecurityAlert(data: {
    userEmail: string
    userName: string
    alertType: string
    details: string
    timestamp: string
    ipAddress?: string
    location?: string
  }): Promise<boolean> {
    const template = this.getSecurityAlertTemplate(data)

    return await this.sendEmail({
      to: data.userEmail,
      subject: `Security Alert - ${data.alertType}`,
      html: template.html,
      text: template.text,
    })
  }

  async sendPasswordChangeConfirmation(data: {
    userEmail: string
    userName: string
    timestamp: string
    ipAddress?: string
  }): Promise<boolean> {
    const template = this.getPasswordChangeTemplate(data)

    return await this.sendEmail({
      to: data.userEmail,
      subject: "Password Changed Successfully",
      html: template.html,
      text: template.text,
    })
  }

  async sendTwoFactorStatusChange(data: {
    userEmail: string
    userName: string
    enabled: boolean
    timestamp: string
  }): Promise<boolean> {
    const template = this.getTwoFactorTemplate(data)

    return await this.sendEmail({
      to: data.userEmail,
      subject: `Two-Factor Authentication ${data.enabled ? "Enabled" : "Disabled"}`,
      html: template.html,
      text: template.text,
    })
  }

  async sendApiKeyNotification(data: {
    userEmail: string
    userName: string
    action: "created" | "deleted" | "updated"
    keyName: string
    timestamp: string
  }): Promise<boolean> {
    const template = this.getApiKeyTemplate(data)

    return await this.sendEmail({
      to: data.userEmail,
      subject: `API Key ${data.action.charAt(0).toUpperCase() + data.action.slice(1)} - ${data.keyName}`,
      html: template.html,
      text: template.text,
    })
  }

  private getProfileChangeTemplate(data: ProfileChangeData) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Change Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .alert-box { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .button { display: inline-block; background-color: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Profile Change Notification</h1>
              <p>Your CoinWayFinder profile has been updated</p>
            </div>
            <div class="content">
              <p>Hello ${data.userName},</p>
              
              <div class="alert-box">
                <strong>Change Type:</strong> ${data.changeType}<br>
                <strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}<br>
                ${data.ipAddress ? `<strong>IP Address:</strong> ${data.ipAddress}<br>` : ""}
              </div>

              <div class="details">
                <h3>Change Details:</h3>
                <p>${data.changeDetails}</p>
              </div>

              <p>If you did not make this change, please contact our support team immediately.</p>
              
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/security" class="button">Review Security Settings</a>
            </div>
            <div class="footer">
              <p>This is an automated message from CoinWayFinder. Please do not reply to this email.</p>
              <p>© 2024 CoinWayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
Profile Change Notification

Hello ${data.userName},

Your CoinWayFinder profile has been updated:

Change Type: ${data.changeType}
Time: ${new Date(data.timestamp).toLocaleString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ""}

Change Details:
${data.changeDetails}

If you did not make this change, please contact our support team immediately.

Review your security settings: ${process.env.NEXT_PUBLIC_BASE_URL}/profile/security

This is an automated message from CoinWayFinder.
© 2024 CoinWayFinder. All rights reserved.
    `

    return { html, text }
  }

  private getSecurityAlertTemplate(data: {
    userEmail: string
    userName: string
    alertType: string
    details: string
    timestamp: string
    ipAddress?: string
    location?: string
  }) {
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
            .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .alert-box { background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .button { display: inline-block; background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Security Alert</h1>
              <p>Important security notification for your account</p>
            </div>
            <div class="content">
              <p>Hello ${data.userName},</p>
              
              <div class="alert-box">
                <strong>Alert Type:</strong> ${data.alertType}<br>
                <strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}<br>
                ${data.ipAddress ? `<strong>IP Address:</strong> ${data.ipAddress}<br>` : ""}
                ${data.location ? `<strong>Location:</strong> ${data.location}<br>` : ""}
              </div>

              <div class="details">
                <h3>Alert Details:</h3>
                <p>${data.details}</p>
              </div>

              <p><strong>If this was you:</strong> No action is required.</p>
              <p><strong>If this was not you:</strong> Please secure your account immediately by changing your password and enabling two-factor authentication.</p>
              
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/security" class="button">Secure My Account</a>
            </div>
            <div class="footer">
              <p>This is an automated security message from CoinWayFinder.</p>
              <p>© 2024 CoinWayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
🚨 SECURITY ALERT

Hello ${data.userName},

Alert Type: ${data.alertType}
Time: ${new Date(data.timestamp).toLocaleString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ""}
${data.location ? `Location: ${data.location}` : ""}

Alert Details:
${data.details}

If this was you: No action is required.
If this was not you: Please secure your account immediately.

Secure your account: ${process.env.NEXT_PUBLIC_BASE_URL}/profile/security

This is an automated security message from CoinWayFinder.
© 2024 CoinWayFinder. All rights reserved.
    `

    return { html, text }
  }

  private getPasswordChangeTemplate(data: {
    userEmail: string
    userName: string
    timestamp: string
    ipAddress?: string
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .success-box { background-color: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Changed Successfully</h1>
              <p>Your password has been updated</p>
            </div>
            <div class="content">
              <p>Hello ${data.userName},</p>
              
              <div class="success-box">
                <p><strong>Your password has been successfully changed.</strong></p>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                ${data.ipAddress ? `<p><strong>IP Address:</strong> ${data.ipAddress}</p>` : ""}
              </div>

              <p>If you did not make this change, please contact our support team immediately.</p>
              
              <p>For your security, we recommend:</p>
              <ul>
                <li>Using a strong, unique password</li>
                <li>Enabling two-factor authentication</li>
                <li>Regularly reviewing your account activity</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated message from CoinWayFinder.</p>
              <p>© 2024 CoinWayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
✅ Password Changed Successfully

Hello ${data.userName},

Your password has been successfully changed.

Time: ${new Date(data.timestamp).toLocaleString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ""}

If you did not make this change, please contact our support team immediately.

For your security, we recommend:
- Using a strong, unique password
- Enabling two-factor authentication
- Regularly reviewing your account activity

This is an automated message from CoinWayFinder.
© 2024 CoinWayFinder. All rights reserved.
    `

    return { html, text }
  }

  private getTwoFactorTemplate(data: {
    userEmail: string
    userName: string
    enabled: boolean
    timestamp: string
  }) {
    const status = data.enabled ? "Enabled" : "Disabled"
    const color = data.enabled ? "#4caf50" : "#ff9800"
    const emoji = data.enabled ? "🔐" : "🔓"

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Two-Factor Authentication ${status}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .status-box { background-color: ${data.enabled ? "#e8f5e8" : "#fff3e0"}; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${emoji} Two-Factor Authentication ${status}</h1>
              <p>Your account security has been updated</p>
            </div>
            <div class="content">
              <p>Hello ${data.userName},</p>
              
              <div class="status-box">
                <p><strong>Two-Factor Authentication has been ${status.toLowerCase()}.</strong></p>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
              </div>

              ${
                data.enabled
                  ? "<p>Great! Your account is now more secure with two-factor authentication enabled. You will need to provide a verification code from your authenticator app when logging in.</p>"
                  : "<p>Two-factor authentication has been disabled. We recommend keeping 2FA enabled for better account security.</p>"
              }

              <p>If you did not make this change, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from CoinWayFinder.</p>
              <p>© 2024 CoinWayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
${emoji} Two-Factor Authentication ${status}

Hello ${data.userName},

Two-Factor Authentication has been ${status.toLowerCase()}.
Time: ${new Date(data.timestamp).toLocaleString()}

${
  data.enabled
    ? "Great! Your account is now more secure with two-factor authentication enabled."
    : "Two-factor authentication has been disabled. We recommend keeping 2FA enabled for better security."
}

If you did not make this change, please contact our support team immediately.

This is an automated message from CoinWayFinder.
© 2024 CoinWayFinder. All rights reserved.
    `

    return { html, text }
  }

  private getApiKeyTemplate(data: {
    userEmail: string
    userName: string
    action: "created" | "deleted" | "updated"
    keyName: string
    timestamp: string
  }) {
    const actionText = {
      created: "Created",
      deleted: "Deleted",
      updated: "Updated",
    }[data.action]

    const emoji = {
      created: "🔑",
      deleted: "🗑️",
      updated: "✏️",
    }[data.action]

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>API Key ${actionText}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .info-box { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${emoji} API Key ${actionText}</h1>
              <p>Your API key has been ${data.action}</p>
            </div>
            <div class="content">
              <p>Hello ${data.userName},</p>
              
              <div class="info-box">
                <p><strong>API Key "${data.keyName}" has been ${data.action}.</strong></p>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
              </div>

              ${
                data.action === "created"
                  ? "<p>Your new API key has been created successfully. Please store it securely as it will not be shown again.</p>"
                  : data.action === "deleted"
                    ? "<p>The API key has been permanently deleted and can no longer be used to access your account.</p>"
                    : "<p>Your API key permissions or settings have been updated.</p>"
              }

              <p>If you did not make this change, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from CoinWayFinder.</p>
              <p>© 2024 CoinWayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
${emoji} API Key ${actionText}

Hello ${data.userName},

API Key "${data.keyName}" has been ${data.action}.
Time: ${new Date(data.timestamp).toLocaleString()}

${
  data.action === "created"
    ? "Your new API key has been created successfully. Please store it securely."
    : data.action === "deleted"
      ? "The API key has been permanently deleted and can no longer be used."
      : "Your API key permissions or settings have been updated."
}

If you did not make this change, please contact our support team immediately.

This is an automated message from CoinWayFinder.
© 2024 CoinWayFinder. All rights reserved.
    `

    return { html, text }
  }
}

export const emailService = new EmailService()
