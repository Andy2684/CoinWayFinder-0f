import { type NextRequest, NextResponse } from "next/server"
import { emailQueue } from "@/lib/email-queue"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data, delay = 0 } = body

    // Validate required fields
    if (!type || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate notification type
    const validTypes = ["profile_change", "security_alert", "password_change", "2fa_change", "api_key_change"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    // Add user info to data
    const notificationData = {
      ...data,
      userId: decoded.userId,
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    }

    // Queue the email
    const jobId = await emailQueue.addJob(type, notificationData, delay)

    return NextResponse.json({
      success: true,
      jobId,
      message: "Email notification queued successfully",
    })
  } catch (error) {
    console.error("Send notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
