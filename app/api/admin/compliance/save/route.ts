import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      )
    }

    // Verify admin role
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId}
    `

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      )
    }

    const { report } = await request.json()

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report data required" },
        { status: 400 }
      )
    }

    // Save compliance report
    const [savedReport] = await sql`
      INSERT INTO compliance_reports (
        id,
        framework_id,
        framework_name,
        report_date,
        assessor,
        date_range_start,
        date_range_end,
        overall_score,
        total_controls,
        compliant_controls,
        partial_controls,
        non_compliant_controls,
        critical_findings,
        high_findings,
        medium_findings,
        low_findings,
        risk_level,
        report_data,
        executive_summary,
        next_assessment_date,
        created_by,
        created_at
      ) VALUES (
        ${report.id},
        ${report.frameworkId},
        ${report.frameworkName},
        ${report.reportDate}::timestamp,
        ${report.assessor},
        ${report.dateRange.start}::timestamp,
        ${report.dateRange.end}::timestamp,
        ${report.summary.overallScore},
        ${report.summary.totalControls},
        ${report.summary.compliantControls},
        ${report.summary.partialControls},
        ${report.summary.nonCompliantControls},
        ${report.summary.criticalFindings},
        ${report.summary.highFindings},
        ${report.summary.mediumFindings},
        ${report.summary.lowFindings},
        ${report.summary.riskLevel},
        ${JSON.stringify(report)},
        ${report.executiveSummary},
        ${report.nextAssessmentDate}::timestamp,
        ${decoded.userId},
        CURRENT_TIMESTAMP
      )
      RETURNING id, created_at
    `

    return NextResponse.json({
      success: true,
      message: "Compliance report saved successfully",
      reportId: savedReport.id,
      createdAt: savedReport.created_at
    })
  } catch (error) {
    console.error("Error saving compliance report:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save compliance report" },
      { status: 500 }
    )
  }
}
