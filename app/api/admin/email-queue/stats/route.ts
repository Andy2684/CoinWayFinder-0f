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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      // Check if user is admin
      if (!decoded.isAdmin && decoded.email !== "admin@coinwayfinder.com") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const stats = emailQueue.getQueueStats()
    const failedJobs = emailQueue.getFailedJobs()

    // Calculate additional metrics
    const successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    const failureRate = stats.total > 0 ? (stats.failed / stats.total) * 100 : 0

    // Group failed jobs by type
    const failedJobsByType = failedJobs.reduce(
      (acc, job) => {
        acc[job.type] = (acc[job.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate average retry attempts for failed jobs
    const avgRetryAttempts =
      failedJobs.length > 0 ? failedJobs.reduce((sum, job) => sum + job.attempts, 0) / failedJobs.length : 0

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
        avgRetryAttempts: Math.round(avgRetryAttempts * 100) / 100,
      },
      failedJobsByType,
      recentFailedJobs: failedJobs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((job) => ({
          id: job.id,
          type: job.type,
          attempts: job.attempts,
          maxAttempts: job.maxAttempts,
          error: job.error,
          createdAt: job.createdAt,
          userEmail: job.data.userEmail,
          userName: job.data.userName,
        })),
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
