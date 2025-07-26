import { type NextRequest, NextResponse } from "next/server"
import { complianceReportGenerator } from "@/lib/compliance-report-generator"
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

    // Get available frameworks
    const frameworks = await complianceReportGenerator.getAvailableFrameworks()

    return NextResponse.json({
      success: true,
      frameworks
    })
  } catch (error) {
    console.error("Error fetching compliance frameworks:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch compliance frameworks" },
      { status: 500 }
    )
  }
}
