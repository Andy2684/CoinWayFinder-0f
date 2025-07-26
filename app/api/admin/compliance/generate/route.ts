import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { complianceReportGenerator, type ComplianceFramework } from "@/lib/compliance-report-generator"

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
    const { framework, startDate, endDate, assessor } = body

    const validFrameworks: ComplianceFramework[] = ["SOC2", "GDPR", "HIPAA", "PCI_DSS", "ISO27001", "NIST", "CCPA"]

    if (!framework || !validFrameworks.includes(framework)) {
      return NextResponse.json({ error: "Invalid compliance framework" }, { status: 400 })
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 })
    }

    const report = await complianceReportGenerator.generateComplianceReport(
      framework,
      start,
      end,
      assessor || decoded.email || "System Generated",
    )

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Error generating compliance report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
