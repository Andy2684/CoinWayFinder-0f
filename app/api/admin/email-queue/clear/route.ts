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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      // Check if user is admin (you can implement your own admin check logic)
      if (!decoded.isAdmin && decoded.email !== "admin@coinwayfinder.com") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const clearedCount = emailQueue.clearCompletedJobs()

    return NextResponse.json({
      success: true,
      message: `Cleared ${clearedCount} completed jobs`,
      clearedCount,
    })
  } catch (error) {
    console.error("Clear completed jobs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
