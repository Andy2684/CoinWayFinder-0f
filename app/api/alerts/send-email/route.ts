import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import jwt from "jsonwebtoken"

const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    let decoded: any

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { alertType, title, message, symbol, price, action } = await request.json()

    if (!alertType || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find user
    const user = users.find((u) => u.id === decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Send trading alert email
    const emailSent = await emailService.sendTradingAlert(user.email, user.firstName, {
      type: alertType,
      title,
      message,
      symbol,
      price,
      action,
    })

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send alert email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Trading alert sent successfully",
    })
  } catch (error) {
    console.error("Send alert email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
