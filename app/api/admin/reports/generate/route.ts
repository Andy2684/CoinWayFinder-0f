import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { securityReportGenerator } from "@/lib/security-report-generator"

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
    const { type, startDate, endDate } = body

    if (!type || !["daily", "weekly", "monthly"].includes(type)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    const report = await securityReportGenerator.generateReport(type, start, end)

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Error generating security report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
