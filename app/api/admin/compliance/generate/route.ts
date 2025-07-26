import { type NextRequest, NextResponse } from "next/server"
import { complianceReportGenerator } from "@/lib/compliance-report-generator"
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

    const { frameworkId, assessor, dateRange } = await request.json()

    if (!frameworkId || !assessor || !dateRange) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate compliance report
    const report = await complianceReportGenerator.generateReport(
      frameworkId,
      assessor,
      dateRange
    )

    return NextResponse.json({
      success: true,
      report
    })
  } catch (error) {
    console.error("Compliance report generation error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate compliance report" },
      { status: 500 }
    )
  }
}
