import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

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

    // Check if reports table exists, create if not
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

    const reports = await sql`
      SELECT 
        id,
        title,
        type,
        period_start,
        period_end,
        generated_at,
        status
      FROM security_reports
      ORDER BY generated_at DESC
      LIMIT 50
    `

    return NextResponse.json({
      success: true,
      reports: reports.map((report) => ({
        id: report.id,
        title: report.title,
        type: report.type,
        periodStart: report.period_start,
        periodEnd: report.period_end,
        generatedAt: report.generated_at,
        status: report.status,
      })),
    })
  } catch (error) {
    console.error("Error fetching security reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
