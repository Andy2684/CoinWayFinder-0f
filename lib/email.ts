import formData from "form-data"
import Mailgun from "mailgun.js"

// Initialize Mailgun
const mailgun = new Mailgun(formData)

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: process.env.MAILGUN_URL || "https://api.mailgun.net",
})

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || ""

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    data: Buffer | string
    contentType?: string
  }>
  template?: string
  templateVariables?: Record<string, any>
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  message?: string
  error?: string
}

// Default sender email
const DEFAULT_FROM = process.env.MAILGUN_FROM_EMAIL || `noreply@${MAILGUN_DOMAIN}`

/**
 * Send email using Mailgun
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    if (!MAILGUN_DOMAIN || !process.env.MAILGUN_API_KEY) {
      throw new Error(
        "Mailgun configuration missing. Please check MAILGUN_DOMAIN and MAILGUN_API_KEY environment variables.",
      )
    }

    const emailData: any = {
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
    }

    // Add CC if provided
    if (options.cc) {
      emailData.cc = Array.isArray(options.cc) ? options.cc.join(", ") : options.cc
    }

    // Add BCC if provided
    if (options.bcc) {
      emailData.bcc = Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc
    }

    // Add content
    if (options.html) {
      emailData.html = options.html
    }
    if (options.text) {
      emailData.text = options.text
    }

    // Add template if provided
    if (options.template) {
      emailData.template = options.template
      if (options.templateVariables) {
        Object.keys(options.templateVariables).forEach((key) => {
          emailData[`v:${key}`] = options.templateVariables![key]
        })
      }
    }

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      emailData.attachment = options.attachments.map((att) => ({
        filename: att.filename,
        data: att.data,
        contentType: att.contentType,
      }))
    }

    const response = await mg.messages.create(MAILGUN_DOMAIN, emailData)

    return {
      success: true,
      messageId: response.id,
      message: response.message || "Email sent successfully",
    }
  } catch (error: any) {
    console.error("Mailgun send error:", error)
    return {
      success: false,
      error: error.message || "Failed to send email",
    }
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResponse> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to CoinWayFinder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CoinWayFinder! 🚀</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for joining CoinWayFinder, the most advanced AI-powered cryptocurrency trading platform.</p>
          
          <h3>🎯 What's Next?</h3>
          <ul>
            <li>✅ Complete your profile setup</li>
            <li>🔗 Connect your exchange accounts</li>
            <li>🤖 Create your first AI trading bot</li>
            <li>📊 Explore market analysis tools</li>
          </ul>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">Get Started</a>
          
          <p>If you have any questions, our support team is here to help!</p>
        </div>
        <div class="footer">
          <p>© 2024 CoinWayFinder. All rights reserved.</p>
          <p>This email was sent to ${userEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: "Welcome to CoinWayFinder - Let's Get Started! 🚀",
    html: htmlContent,
    text: `Welcome to CoinWayFinder, ${userName}! Thank you for joining our AI-powered cryptocurrency trading platform. Get started at ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
  })
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(userEmail: string, verificationToken: string): Promise<EmailResponse> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${verificationToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - CoinWayFinder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address 📧</h1>
        </div>
        <div class="content">
          <h2>Almost there!</h2>
          <p>Please verify your email address to complete your CoinWayFinder account setup.</p>
          
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
          
          <p>If you didn't create an account with CoinWayFinder, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 CoinWayFinder. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: "Verify Your Email Address - CoinWayFinder",
    html: htmlContent,
    text: `Please verify your email address by visiting: ${verificationUrl}`,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<EmailResponse> {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - CoinWayFinder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request 🔐</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your CoinWayFinder account password.</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <div class="warning">
            <strong>🔒 Security Notice:</strong> This reset link will expire in 1 hour for your security.
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 5px;">${resetUrl}</p>
          
          <p><strong>If you didn't request this password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© 2024 CoinWayFinder. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: "Reset Your Password - CoinWayFinder",
    html: htmlContent,
    text: `Reset your password by visiting: ${resetUrl}`,
  })
}

/**
 * Send trading alert email
 */
export async function sendTradingAlert(
  userEmail: string,
  alertData: {
    symbol: string
    price: number
    change: number
    alertType: "price_target" | "stop_loss" | "take_profit" | "volume_spike"
    message: string
  },
): Promise<EmailResponse> {
  const { symbol, price, change, alertType, message } = alertData

  const alertTypeLabels = {
    price_target: "🎯 Price Target",
    stop_loss: "🛑 Stop Loss",
    take_profit: "💰 Take Profit",
    volume_spike: "📈 Volume Spike",
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Trading Alert - ${symbol}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff6b35; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: white; border-left: 5px solid #ff6b35; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .price { font-size: 24px; font-weight: bold; color: ${change >= 0 ? "#28a745" : "#dc3545"}; }
        .change { color: ${change >= 0 ? "#28a745" : "#dc3545"}; font-weight: bold; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Trading Alert</h1>
          <h2>${symbol}</h2>
        </div>
        <div class="content">
          <div class="alert-box">
            <h3>${alertTypeLabels[alertType]}</h3>
            <div class="price">$${price.toLocaleString()}</div>
            <div class="change">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">View Dashboard</a>
          
          <p><em>This alert was generated by your CoinWayFinder trading bot.</em></p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: `🚨 Trading Alert: ${symbol} - ${alertTypeLabels[alertType]}`,
    html: htmlContent,
    text: `Trading Alert for ${symbol}: ${message}. Current price: $${price}. Change: ${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
  })
}

/**
 * Validate Mailgun configuration
 */
export function validateMailgunConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!process.env.MAILGUN_API_KEY) {
    errors.push("MAILGUN_API_KEY is required")
  }

  if (!process.env.MAILGUN_DOMAIN) {
    errors.push("MAILGUN_DOMAIN is required")
  }

  if (!process.env.MAILGUN_FROM_EMAIL) {
    errors.push("MAILGUN_FROM_EMAIL is recommended")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Test Mailgun connection
 */
export async function testMailgunConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const validation = validateMailgunConfig()
    if (!validation.isValid) {
      return {
        success: false,
        message: `Configuration errors: ${validation.errors.join(", ")}`,
      }
    }

    // Test by getting domain info
    const domainInfo = await mg.domains.get(MAILGUN_DOMAIN)

    return {
      success: true,
      message: `Successfully connected to Mailgun domain: ${domainInfo.domain.name}`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Mailgun connection failed: ${error.message}`,
    }
  }
}
