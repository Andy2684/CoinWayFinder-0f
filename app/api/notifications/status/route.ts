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

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (jobId) {
      // Get specific job status
      const job = emailQueue.getJobStatus(jobId)
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
          createdAt: job.createdAt,
          processedAt: job.processedAt,
          error: job.error,
        },
      })
    } else {
      // Get queue statistics
      const stats = emailQueue.getQueueStats()
      const failedJobs = emailQueue.getFailedJobs().map((job) => ({
        id: job.id,
        type: job.type,
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
        error: job.error,
        createdAt: job.createdAt,
      }))

      return NextResponse.json({
        success: true,
        stats,
        failedJobs,
      })
    }
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
