import { type NextRequest, NextResponse } from "next/server"
import { emailQueue } from "@/lib/email-queue"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url)
    const jobId = url.searchParams.get("jobId")

    if (jobId) {
      // Get specific job status
      const job = emailQueue.getJobById(jobId)
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          type: job.type,
          status: job.status,
          attempts: job.attempts,
          maxAttempts: job.maxAttempts,
          scheduledAt: job.scheduledAt,
          createdAt: job.createdAt,
        },
      })
    } else {
      // Get queue status
      const status = emailQueue.getQueueStatus()
      return NextResponse.json({
        success: true,
        queue: status,
      })
    }
  } catch (error) {
    console.error("Get notification status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
