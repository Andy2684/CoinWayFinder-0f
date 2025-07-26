import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { type, frequency, recipients, enabled = true } = await request.json()

    if (!type || !frequency || !recipients) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create scheduled reports table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS scheduled_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        frequency VARCHAR(50) NOT NULL,
        recipients TEXT[] NOT NULL,
        enabled BOOLEAN DEFAULT true,
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_run TIMESTAMP WITH TIME ZONE,
        next_run TIMESTAMP WITH TIME ZONE
      )
    `

    // Calculate next run time
    const nextRun = calculateNextRun(frequency)

    const [scheduledReport] = await sql`
      INSERT INTO scheduled_reports (
        type, frequency, recipients, enabled, created_by, next_run
      ) VALUES (
        ${type},
        ${frequency},
        ${recipients},
        ${enabled},
        ${decoded.userId},
        ${nextRun}
      )
      RETURNING id, created_at, next_run
    `

    return NextResponse.json({
      success: true,
      scheduledReport: {
        id: scheduledReport.id,
        type,
        frequency,
        recipients,
        enabled,
        createdAt: scheduledReport.created_at,
        nextRun: scheduledReport.next_run,
      },
    })
  } catch (error) {
    console.error("Error scheduling report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const scheduledReports = await sql`
      SELECT *
      FROM scheduled_reports
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      scheduledReports,
    })
  } catch (error) {
    console.error("Error fetching scheduled reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateNextRun(frequency: string): Date {
  const now = new Date()

  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case "monthly":
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
}
