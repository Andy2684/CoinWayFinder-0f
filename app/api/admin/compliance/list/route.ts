import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const framework = searchParams.get('framework')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = sql`
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
        next_assessment_date,
        created_at
      FROM compliance_reports
    `

    if (framework) {
      query = sql`
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
          next_assessment_date,
          created_at
        FROM compliance_reports
        WHERE framework_id = ${framework}
      `
    }

    query = sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const reports = await query

    // Get total count
    const [{ count }] = framework 
      ? await sql`SELECT COUNT(*) as count FROM compliance_reports WHERE framework_id = ${framework}`
      : await sql`SELECT COUNT(*) as count FROM compliance_reports`

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        total: parseInt(count),
        limit,
        offset,
        hasMore: parseInt(count) > offset + limit
      }
    })
  } catch (error) {
    console.error("Error fetching compliance reports:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch compliance reports" },
      { status: 500 }
    )
  }
}
