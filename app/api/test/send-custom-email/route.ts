import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message } = await request.json()

    if (!email || !subject || !message) {
      return NextResponse.json({ error: "Email, subject, and message are required" }, { status: 400 })
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #30D5C8 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📧 Test Email</h1>
        </div>
        <div class="content">
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
        <div class="footer">
          <p>This is a test email from CoinWayFinder</p>
          <p>© 2024 CoinWayFinder. All rights reserved.</p>
        </div>
      </body>
      </html>
    `

    const emailSent = await emailService.sendEmail({
      to: email,
      subject,
      html,
    })

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Custom email sent successfully!",
    })
  } catch (error) {
    console.error("Test custom email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
