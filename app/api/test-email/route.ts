import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const emailTemplates = {
  welcome: {
    subject: "Welcome to CoinWayFinder!",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CoinWayFinder!</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333;">Hello ${data.name || "Trader"}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining CoinWayFinder, the ultimate platform for cryptocurrency trading and analysis.
          </p>
          <p style="color: #666; line-height: 1.6;">
            You now have access to:
          </p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Real-time market data and analysis</li>
            <li>Advanced trading bots and strategies</li>
            <li>Portfolio tracking and management</li>
            <li>Price alerts and notifications</li>
            <li>News and sentiment analysis</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      </div>
    `,
  },
  verification: {
    subject: "Verify Your Email Address",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4CAF50; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Email Verification</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p style="color: #666; line-height: 1.6;">
            Please click the button below to verify your email address and activate your account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${data.token}" 
               style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `,
  },
  passwordReset: {
    subject: "Reset Your Password",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF9800; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${data.token}" 
               style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  },
  tradingAlert: {
    subject: "Trading Alert: Price Target Reached",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2196F3; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 Trading Alert</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333;">${data.symbol} Price Alert</h2>
          <p style="color: #666; line-height: 1.6;">
            Your price alert for <strong>${data.symbol}</strong> has been triggered!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Current Price:</span>
              <span style="font-weight: bold; color: #2196F3;">$${data.currentPrice}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Target Price:</span>
              <span style="font-weight: bold;">$${data.targetPrice}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Change:</span>
              <span style="font-weight: bold; color: ${data.change >= 0 ? "#4CAF50" : "#F44336"};">
                ${data.change >= 0 ? "+" : ""}${data.change}%
              </span>
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
               style="background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  },
  custom: {
    subject: (data: any) => data.subject || "CoinWayFinder Notification",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #667eea; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">${data.title || "CoinWayFinder"}</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          ${data.content || "<p>This is a test email from CoinWayFinder.</p>"}
        </div>
        <div style="padding: 20px; background: #e9ecef; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            © 2024 CoinWayFinder. All rights reserved.
          </p>
        </div>
      </div>
    `,
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, type = "custom", data = {} } = body

    if (!to) {
      return NextResponse.json({ success: false, error: "Recipient email is required" }, { status: 400 })
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ success: false, error: "SMTP configuration is missing" }, { status: 500 })
    }

    const template = emailTemplates[type as keyof typeof emailTemplates]
    if (!template) {
      return NextResponse.json({ success: false, error: "Invalid email template type" }, { status: 400 })
    }

    const transporter = createTransporter()

    // Test connection
    await transporter.verify()

    const subject = typeof template.subject === "function" ? template.subject(data) : template.subject

    const html = typeof template.html === "function" ? template.html(data) : template.html

    const mailOptions = {
      from: `"CoinWayFinder" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
      type,
      recipient: to,
    })
  } catch (error: any) {
    console.error("Test email error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Test Email API",
    availableTypes: Object.keys(emailTemplates),
    usage: {
      endpoint: "/api/test-email",
      method: "POST",
      body: {
        to: "recipient@example.com",
        type: "welcome|verification|passwordReset|tradingAlert|custom",
        data: {
          name: "User Name",
          token: "verification-token",
          symbol: "BTC/USDT",
          currentPrice: "45000",
          targetPrice: "50000",
          change: "5.2",
          subject: "Custom Subject (for custom type)",
          title: "Custom Title (for custom type)",
          content: "Custom HTML content (for custom type)",
        },
      },
    },
  })
}
