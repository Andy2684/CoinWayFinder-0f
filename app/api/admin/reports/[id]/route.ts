import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const [report] = await sql`
      SELECT report_data
      FROM security_reports
      WHERE id = ${params.id}
    `

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      report: report.report_data,
    })
  } catch (error) {
    console.error("Error fetching security report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
