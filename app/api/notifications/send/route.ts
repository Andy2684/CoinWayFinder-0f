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

    try {
      jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data, options = {} } = body

    if (!type || !data) {
      return NextResponse.json({ error: "Missing required fields: type and data" }, { status: 400 })
    }

    // Validate notification types
    const validTypes = ["profile-change", "security-alert", "password-change", "two-factor-change", "api-key-change"]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 },
      )
    }

    // Add job to queue
    const jobId = emailQueue.addJob(type, data, options)

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
