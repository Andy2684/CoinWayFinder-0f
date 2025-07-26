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

    const body = await request.json()
    const { report } = body

    if (!report || !report.id) {
      return NextResponse.json({ error: "Invalid report data" }, { status: 400 })
    }

    // Save compliance report to database
    await sql`
      INSERT INTO compliance_reports (
        id, framework, title, generated_at, period_start, period_end,
        status, overall_score, report_data, created_by, created_at
      ) VALUES (
        ${report.id}, ${report.framework}, ${report.title}, ${report.generatedAt},
        ${report.period.start}, ${report.period.end}, ${report.status},
        ${report.overallScore}, ${JSON.stringify(report)}, ${decoded.userId}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        report_data = ${JSON.stringify(report)},
        updated_at = NOW()
    `

    return NextResponse.json({
      success: true,
      message: "Compliance report saved successfully",
    })
  } catch (error) {
    console.error("Error saving compliance report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
