import { type NextRequest, NextResponse } from "next/server"
import { emailQueue } from "@/lib/email-queue"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
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

    const job = emailQueue.getJobStatus(params.jobId)

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
        data: job.data,
      },
    })
  } catch (error) {
    console.error("Get job details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { jobId: string } }) {
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

    const removed = emailQueue.removeJob(params.jobId)

    if (!removed) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Job removed successfully",
    })
  } catch (error) {
    console.error("Remove job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
