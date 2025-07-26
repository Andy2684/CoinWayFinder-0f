import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const reportId = params.id

    // Get compliance report
    const [report] = await sql`
      SELECT 
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
        created_at
      FROM compliance_reports
      WHERE id = ${reportId}
    `

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      )
    }

    // Parse the full report data
    const fullReport = JSON.parse(report.report_data)

    return NextResponse.json({
      success: true,
      report: {
        ...fullReport,
        createdAt: report.created_at
      }
    })
  } catch (error) {
    console.error("Error fetching compliance report:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch compliance report" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const reportId = params.id

    // Delete compliance report
    const [deletedReport] = await sql`
      DELETE FROM compliance_reports
      WHERE id = ${reportId}
      RETURNING id
    `

    if (!deletedReport) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Compliance report deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting compliance report:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete compliance report" },
      { status: 500 }
    )
  }
}
