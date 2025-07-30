import { type NextRequest, NextResponse } from "next/server"
import {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTradingAlert,
} from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, ...params } = body

    if (!email) {
      return NextResponse.json({ success: false, error: "Email address is required" }, { status: 400 })
    }

    let result

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(email, params.name || "Test User")
        break

      case "verification":
        result = await sendVerificationEmail(email, params.token || "test-token-123")
        break

      case "password-reset":
        result = await sendPasswordResetEmail(email, params.token || "reset-token-123")
        break

      case "trading-alert":
        result = await sendTradingAlert(email, {
          symbol: params.symbol || "BTC/USD",
          price: params.price || 45000,
          change: params.change || 5.2,
          alertType: params.alertType || "price_target",
          message: params.message || "Bitcoin has reached your target price!",
          exchange: params.exchange || "Binance",
          timestamp: new Date(),
        })
        break

      case "custom":
        result = await sendEmail({
          to: email,
          subject: params.subject || "Test Email from CoinWayFinder",
          html:
            params.html ||
            `
            <h1>Test Email</h1>
            <p>This is a test email from CoinWayFinder.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          `,
          text: params.text || "This is a test email from CoinWayFinder.",
          tags: ["test"],
          tracking: true,
        })
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email type. Use: welcome, verification, password-reset, trading-alert, or custom",
          },
          { status: 400 },
        )
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Test email sent successfully!" : "Failed to send test email",
      details: result,
    })
  } catch (error: any) {
    console.error("Test email error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test Email API",
    endpoints: {
      POST: "/api/test-email",
      body: {
        type: "welcome | verification | password-reset | trading-alert | custom",
        email: "recipient@example.com",
        name: "User Name (for welcome)",
        token: "verification-token (for verification/reset)",
        subject: "Email Subject (for custom)",
        html: "HTML content (for custom)",
        text: "Text content (for custom)",
      },
    },
    examples: [
      {
        type: "welcome",
        email: "user@example.com",
        name: "John Doe",
      },
      {
        type: "trading-alert",
        email: "trader@example.com",
        symbol: "BTC/USD",
        price: 45000,
        change: 5.2,
        alertType: "price_target",
        message: "Bitcoin reached your target!",
      },
    ],
  })
}
