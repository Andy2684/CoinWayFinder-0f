import formData from "form-data"
import Mailgun from "mailgun.js"

// Initialize Mailgun
const mailgun = new Mailgun(formData)

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: "https://api.mailgun.net", // Base URL for Mailgun API
})

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "coinwayfinder.com"

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
  tags?: string[]
  tracking?: boolean
  trackingClicks?: boolean
  trackingOpens?: boolean
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  message?: string
  error?: string
  details?: any
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

    // Add tags for tracking
    if (options.tags && options.tags.length > 0) {
      emailData["o:tag"] = options.tags
    }

    // Add tracking options
    if (options.tracking !== undefined) {
      emailData["o:tracking"] = options.tracking ? "yes" : "no"
    }
    if (options.trackingClicks !== undefined) {
      emailData["o:tracking-clicks"] = options.trackingClicks ? "yes" : "no"
    }
    if (options.trackingOpens !== undefined) {
      emailData["o:tracking-opens"] = options.trackingOpens ? "yes" : "no"
    }

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      emailData.attachment = options.attachments.map((att) => ({
        filename: att.filename,
        data: att.data,
        contentType: att.contentType,
      }))
    }

    console.log(`Sending email to ${emailData.to} via Mailgun domain: ${MAILGUN_DOMAIN}`)

    const response = await mg.messages.create(MAILGUN_DOMAIN, emailData)

    console.log("Mailgun response:", response)

    return {
      success: true,
      messageId: response.id,
      message: response.message || "Email sent successfully",
      details: response,
    }
  } catch (error: any) {
    console.error("Mailgun send error:", error)
    return {
      success: false,
      error: error.message || "Failed to send email",
      details: error,
    }
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResponse> {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CoinWayFinder</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8f9fa;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 12px 12px 0 0; 
        }
        .header h1 { 
          font-size: 28px; 
          font-weight: 700; 
          margin-bottom: 10px; 
        }
        .header p { 
          font-size: 16px; 
          opacity: 0.9; 
        }
        .content { 
          background: #ffffff; 
          padding: 40px 30px; 
          border-radius: 0 0 12px 12px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .content h2 { 
          color: #2d3748; 
          font-size: 24px; 
          margin-bottom: 20px; 
        }
        .content p { 
          margin-bottom: 16px; 
          color: #4a5568; 
          font-size: 16px; 
        }
        .features-list { 
          background: #f7fafc; 
          padding: 24px; 
          border-radius: 8px; 
          margin: 24px 0; 
        }
        .features-list h3 { 
          color: #2d3748; 
          font-size: 18px; 
          margin-bottom: 16px; 
        }
        .features-list ul { 
          list-style: none; 
          padding: 0; 
        }
        .features-list li { 
          padding: 8px 0; 
          color: #4a5568; 
          font-size: 15px; 
        }
        .features-list li::before { 
          content: "✅ "; 
          margin-right: 8px; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 24px 0; 
          font-weight: 600; 
          font-size: 16px; 
          text-align: center; 
          transition: transform 0.2s ease;
        }
        .cta-button:hover { 
          transform: translateY(-2px); 
        }
        .stats { 
          display: flex; 
          justify-content: space-around; 
          margin: 32px 0; 
          padding: 24px; 
          background: #edf2f7; 
          border-radius: 8px; 
        }
        .stat { 
          text-align: center; 
        }
        .stat-number { 
          font-size: 24px; 
          font-weight: 700; 
          color: #667eea; 
        }
        .stat-label { 
          font-size: 14px; 
          color: #718096; 
          margin-top: 4px; 
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          padding-top: 24px; 
          border-top: 1px solid #e2e8f0; 
          color: #718096; 
          font-size: 14px; 
        }
        .footer p { 
          margin-bottom: 8px; 
        }
        .social-links { 
          margin-top: 16px; 
        }
        .social-links a { 
          color: #667eea; 
          text-decoration: none; 
          margin: 0 12px; 
        }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .header, .content { padding: 24px 20px; }
          .stats { flex-direction: column; gap: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CoinWayFinder! 🚀</h1>
          <p>The most advanced AI-powered cryptocurrency trading platform</p>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for joining CoinWayFinder. You're now part of an exclusive community of smart traders who use AI to maximize their cryptocurrency investments.</p>
          
          <div class="features-list">
            <h3>🎯 What's Next?</h3>
            <ul>
              <li>Complete your profile setup and security settings</li>
              <li>Connect your favorite exchange accounts (Binance, Bybit, Coinbase)</li>
              <li>Create your first AI trading bot with our intuitive wizard</li>
              <li>Explore advanced market analysis and sentiment tools</li>
              <li>Join our community Discord for tips and strategies</li>
            </ul>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-number">50K+</div>
              <div class="stat-label">Active Traders</div>
            </div>
            <div class="stat">
              <div class="stat-number">$2.5B+</div>
              <div class="stat-label">Volume Traded</div>
            </div>
            <div class="stat">
              <div class="stat-number">15+</div>
              <div class="stat-label">Exchanges</div>
            </div>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="cta-button">Get Started Now</a>
          
          <p>Need help getting started? Our support team is available 24/7 to assist you. Simply reply to this email or visit our help center.</p>
          
          <p><strong>Pro Tip:</strong> Start with our demo mode to practice your strategies risk-free before going live!</p>
        </div>
        <div class="footer">
          <p>© 2024 CoinWayFinder. All rights reserved.</p>
          <p>This email was sent to ${userEmail}</p>
          <div class="social-links">
            <a href="#">Twitter</a>
            <a href="#">Discord</a>
            <a href="#">Telegram</a>
            <a href="#">YouTube</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: "🚀 Welcome to CoinWayFinder - Your AI Trading Journey Begins!",
    html: htmlContent,
    text: `Welcome to CoinWayFinder, ${userName}! Thank you for joining our AI-powered cryptocurrency trading platform. Get started at ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    tags: ["welcome", "onboarding"],
    tracking: true,
    trackingClicks: true,
    trackingOpens: true,
  })
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(userEmail: string, verificationToken: string): Promise<EmailResponse> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${verificationToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - CoinWayFinder</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8f9fa;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .header { 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 12px 12px 0 0; 
        }
        .header h1 { 
          font-size: 28px; 
          font-weight: 700; 
          margin-bottom: 10px; 
        }
        .content { 
          background: #ffffff; 
          padding: 40px 30px; 
          border-radius: 0 0 12px 12px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .content h2 { 
          color: #2d3748; 
          font-size: 24px; 
          margin-bottom: 20px; 
        }
        .content p { 
          margin-bottom: 16px; 
          color: #4a5568; 
          font-size: 16px; 
        }
        .verify-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
          color: white; 
          padding: 18px 36px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 24px 0; 
          font-weight: 600; 
          font-size: 18px; 
          text-align: center; 
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
        .warning { 
          background: #fff3cd; 
          border: 1px solid #ffeaa7; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 24px 0; 
          border-left: 4px solid #ffc107;
        }
        .warning strong { 
          color: #856404; 
        }
        .link-box { 
          background: #f8f9fa; 
          padding: 16px; 
          border-radius: 8px; 
          margin: 20px 0; 
          word-break: break-all; 
          font-family: monospace; 
          font-size: 14px; 
          border: 1px solid #dee2e6;
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          padding-top: 24px; 
          border-top: 1px solid #e2e8f0; 
          color: #718096; 
          font-size: 14px; 
        }
        .security-note { 
          background: #e3f2fd; 
          padding: 16px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #2196f3; 
        }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .header, .content { padding: 24px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address 📧</h1>
        </div>
        <div class="content">
          <h2>Almost there!</h2>
          <p>Thank you for signing up with CoinWayFinder. To complete your account setup and start trading, please verify your email address by clicking the button below.</p>
          
          <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons. If you don't verify within this time, you'll need to request a new verification email.
          </div>
          
          <div class="security-note">
            <strong>🔒 Security Tip:</strong> We will never ask for your password via email. If you receive suspicious emails claiming to be from CoinWayFinder, please report them to our security team.
          </div>
          
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <div class="link-box">${verificationUrl}</div>
          
          <p>If you didn't create an account with CoinWayFinder, please ignore this email and no account will be created.</p>
          
          <p>Questions? Contact our support team at support@coinwayfinder.com</p>
        </div>
        <div class="footer">
          <p>© 2024 CoinWayFinder. All rights reserved.</p>
          <p>This verification email was sent to ${userEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: "🔐 Verify Your Email Address - CoinWayFinder",
    html: htmlContent,
    text: `Please verify your email address by visiting: ${verificationUrl}. This link will expire in 24 hours.`,
    tags: ["verification", "security"],
    tracking: true,
    trackingClicks: true,
    trackingOpens: true,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<EmailResponse> {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - CoinWayFinder</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8f9fa;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .header { 
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 12px 12px 0 0; 
        }
        .header h1 { 
          font-size: 28px; 
          font-weight: 700; 
          margin-bottom: 10px; 
        }
        .content { 
          background: #ffffff; 
          padding: 40px 30px; 
          border-radius: 0 0 12px 12px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .content h2 { 
          color: #2d3748; 
          font-size: 24px; 
          margin-bottom: 20px; 
        }
        .content p { 
          margin-bottom: 16px; 
          color: #4a5568; 
          font-size: 16px; 
        }
        .reset-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
          color: white; 
          padding: 18px 36px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 24px 0; 
          font-weight: 600; 
          font-size: 18px; 
          text-align: center; 
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }
        .warning { 
          background: #f8d7da; 
          border: 1px solid #f5c6cb; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 24px 0; 
          border-left: 4px solid #dc3545;
        }
        .warning strong { 
          color: #721c24; 
        }
        .link-box { 
          background: #f8f9fa; 
          padding: 16px; 
          border-radius: 8px; 
          margin: 20px 0; 
          word-break: break-all; 
          font-family: monospace; 
          font-size: 14px; 
          border: 1px solid #dee2e6;
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          padding-top: 24px; 
          border-top: 1px solid #e2e8f0; 
          color: #718096; 
          font-size: 14px; 
        }
        .security-info { 
          background: #d1ecf1; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #17a2b8; 
        }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .header, .content { padding: 24px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request 🔐</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset the password for your CoinWayFinder account. If you made this request, click the button below to create a new password.</p>
          
          <a href="${resetUrl}" class="reset-button">Reset Password</a>
          
          <div class="warning">
            <strong>🔒 Security Notice:</strong> This reset link will expire in 1 hour for your security. If you don't reset your password within this time, you'll need to request a new reset link.
          </div>
          
          <div class="security-info">
            <strong>🛡️ Security Information:</strong>
            <ul style="margin-top: 10px; padding-left: 20px;">
              <li>This request was made from IP: [Request IP will be logged]</li>
              <li>Time: ${new Date().toLocaleString()}</li>
              <li>If this wasn't you, please contact support immediately</li>
            </ul>
          </div>
          
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <div class="link-box">${resetUrl}</div>
          
          <p><strong>If you didn't request this password reset, please ignore this email.</strong> Your password will remain unchanged, and no further action is required.</p>
          
          <p>For additional security, consider enabling two-factor authentication on your account after resetting your password.</p>
          
          <p>Questions or concerns? Contact our security team at security@coinwayfinder.com</p>
        </div>
        <div class="footer">
          <p>© 2024 CoinWayFinder. All rights reserved.</p>
          <p>This password reset email was sent to ${userEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: "🔐 Password Reset Request - CoinWayFinder",
    html: htmlContent,
    text: `Reset your password by visiting: ${resetUrl}. This link will expire in 1 hour. If you didn't request this, please ignore this email.`,
    tags: ["password-reset", "security"],
    tracking: true,
    trackingClicks: true,
    trackingOpens: true,
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
    alertType: "price_target" | "stop_loss" | "take_profit" | "volume_spike" | "news_sentiment"
    message: string
    exchange?: string
    timestamp?: Date
  },
): Promise<EmailResponse> {
  const { symbol, price, change, alertType, message, exchange = "Multiple", timestamp = new Date() } = alertData

  const alertTypeLabels = {
    price_target: "🎯 Price Target Reached",
    stop_loss: "🛑 Stop Loss Triggered",
    take_profit: "💰 Take Profit Hit",
    volume_spike: "📈 Volume Spike Detected",
    news_sentiment: "📰 News Sentiment Alert",
  }

  const alertColors = {
    price_target: "#28a745",
    stop_loss: "#dc3545",
    take_profit: "#28a745",
    volume_spike: "#ffc107",
    news_sentiment: "#17a2b8",
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trading Alert - ${symbol}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8f9fa;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .header { 
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 12px 12px 0 0; 
        }
        .header h1 { 
          font-size: 24px; 
          font-weight: 700; 
          margin-bottom: 8px; 
        }
        .header .symbol { 
          font-size: 32px; 
          font-weight: 800; 
          margin-bottom: 8px; 
        }
        .content { 
          background: #ffffff; 
          padding: 30px; 
          border-radius: 0 0 12px 12px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .alert-box { 
          background: white; 
          border-left: 5px solid ${alertColors[alertType]}; 
          padding: 24px; 
          margin: 24px 0; 
          border-radius: 8px; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .alert-type { 
          color: ${alertColors[alertType]}; 
          font-size: 18px; 
          font-weight: 600; 
          margin-bottom: 16px; 
        }
        .price-info { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin: 16px 0; 
        }
        .price { 
          font-size: 28px; 
          font-weight: 700; 
          color: ${change >= 0 ? "#28a745" : "#dc3545"}; 
        }
        .change { 
          color: ${change >= 0 ? "#28a745" : "#dc3545"}; 
          font-weight: 600; 
          font-size: 18px; 
        }
        .details { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 8px; 
        }
        .detail-label { 
          font-weight: 600; 
          color: #495057; 
        }
        .detail-value { 
          color: #6c757d; 
        }
        .message-box { 
          background: #e9ecef; 
          padding: 16px; 
          border-radius: 8px; 
          margin: 20px 0; 
          font-style: italic; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0; 
          font-weight: 600; 
          text-align: center; 
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #e2e8f0; 
          color: #718096; 
          font-size: 14px; 
        }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .header, .content { padding: 20px; }
          .price-info { flex-direction: column; align-items: flex-start; }
          .price { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Trading Alert</h1>
          <div class="symbol">${symbol}</div>
        </div>
        <div class="content">
          <div class="alert-box">
            <div class="alert-type">${alertTypeLabels[alertType]}</div>
            <div class="price-info">
              <div class="price">$${price.toLocaleString()}</div>
              <div class="change">${change >= 0 ? "+" : ""}${change.toFixed(2)}%</div>
            </div>
            <div class="message-box">
              <strong>Alert Message:</strong> ${message}
            </div>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Exchange:</span>
              <span class="detail-value">${exchange}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Alert Type:</span>
              <span class="detail-value">${alertTypeLabels[alertType]}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Timestamp:</span>
              <span class="detail-value">${timestamp.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Price Change:</span>
              <span class="detail-value" style="color: ${change >= 0 ? "#28a745" : "#dc3545"};">
                ${change >= 0 ? "+" : ""}${change.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="cta-button">View Dashboard</a>
          
          <p><em>This alert was generated by your CoinWayFinder AI trading system. You can manage your alert settings in your dashboard.</em></p>
          
          <p><strong>Disclaimer:</strong> This is an automated alert for informational purposes only. Always conduct your own research before making trading decisions.</p>
        </div>
        <div class="footer">
          <p>© 2024 CoinWayFinder. All rights reserved.</p>
          <p>Alert sent to ${userEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: `🚨 ${alertTypeLabels[alertType]}: ${symbol} - $${price.toLocaleString()}`,
    html: htmlContent,
    text: `Trading Alert for ${symbol}: ${message}. Current price: $${price.toLocaleString()}. Change: ${change >= 0 ? "+" : ""}${change.toFixed(2)}%. Exchange: ${exchange}. Time: ${timestamp.toLocaleString()}`,
    tags: ["trading-alert", alertType, symbol.toLowerCase()],
    tracking: true,
    trackingClicks: true,
    trackingOpens: true,
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
    errors.push("MAILGUN_FROM_EMAIL is recommended for better deliverability")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Test Mailgun connection
 */
export async function testMailgunConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const validation = validateMailgunConfig()
    if (!validation.isValid) {
      return {
        success: false,
        message: `Configuration errors: ${validation.errors.join(", ")}`,
      }
    }

    console.log(`Testing Mailgun connection for domain: ${MAILGUN_DOMAIN}`)

    // Test by getting domain info
    const domainInfo = await mg.domains.get(MAILGUN_DOMAIN)

    return {
      success: true,
      message: `Successfully connected to Mailgun domain: ${domainInfo.domain.name}`,
      details: {
        domain: domainInfo.domain.name,
        state: domainInfo.domain.state,
        created_at: domainInfo.domain.created_at,
      },
    }
  } catch (error: any) {
    console.error("Mailgun connection test failed:", error)
    return {
      success: false,
      message: `Mailgun connection failed: ${error.message}`,
      details: error,
    }
  }
}

/**
 * Get email statistics from Mailgun
 */
export async function getEmailStats(days = 7): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const validation = validateMailgunConfig()
    if (!validation.isValid) {
      return {
        success: false,
        error: `Configuration errors: ${validation.errors.join(", ")}`,
      }
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const stats = await mg.stats.getDomain(MAILGUN_DOMAIN, {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      resolution: "day",
    })

    return {
      success: true,
      data: stats,
    }
  } catch (error: any) {
    console.error("Failed to get email stats:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
