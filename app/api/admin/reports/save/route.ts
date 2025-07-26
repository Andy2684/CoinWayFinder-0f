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

    const { report } = await request.json()

    if (!report) {
      return NextResponse.json({ error: "Report data is required" }, { status: 400 })
    }

    // Ensure reports table exists
    await sql`
      CREATE TABLE IF NOT EXISTS security_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        period_start TIMESTAMP WITH TIME ZONE NOT NULL,
        period_end TIMESTAMP WITH TIME ZONE NOT NULL,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        generated_by UUID,
        report_data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'completed'
      )
    `

    const [savedReport] = await sql`
      INSERT INTO security_reports (
        title, type, period_start, period_end, generated_by, report_data
      ) VALUES (
        ${report.title},
        ${report.period.type},
        ${report.period.start},
        ${report.period.end},
        ${decoded.userId},
        ${JSON.stringify(report)}
      )
      RETURNING id, generated_at
    `

    return NextResponse.json({
      success: true,
      reportId: savedReport.id,
      generatedAt: savedReport.generated_at,
    })
  } catch (error) {
    console.error("Error saving security report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
