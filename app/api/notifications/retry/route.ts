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

    const retriedCount = emailQueue.retryFailedJobs()

    return NextResponse.json({
      success: true,
      message: `Retried ${retriedCount} failed email jobs`,
      retriedCount,
    })
  } catch (error) {
    console.error("Retry notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
