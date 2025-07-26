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

    const { searchParams } = new URL(request.url)
    const framework = searchParams.get("framework")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = sql`
      SELECT id, framework, title, generated_at, period_start, period_end,
             status, overall_score, created_by, created_at, updated_at
      FROM compliance_reports
    `

    if (framework) {
      query = sql`
        SELECT id, framework, title, generated_at, period_start, period_end,
               status, overall_score, created_by, created_at, updated_at
        FROM compliance_reports
        WHERE framework = ${framework}
      `
    }

    query = sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const reports = await query

    // Get total count
    const countQuery = framework
      ? sql`SELECT COUNT(*) as total FROM compliance_reports WHERE framework = ${framework}`
      : sql`SELECT COUNT(*) as total FROM compliance_reports`

    const [{ total }] = await countQuery

    return NextResponse.json({
      success: true,
      reports: reports.map((report) => ({
        ...report,
        generatedAt: new Date(report.generated_at),
        periodStart: new Date(report.period_start),
        periodEnd: new Date(report.period_end),
        createdAt: new Date(report.created_at),
        updatedAt: report.updated_at ? new Date(report.updated_at) : null,
      })),
      pagination: {
        total: Number.parseInt(total),
        limit,
        offset,
        hasMore: offset + limit < Number.parseInt(total),
      },
    })
  } catch (error) {
    console.error("Error fetching compliance reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
