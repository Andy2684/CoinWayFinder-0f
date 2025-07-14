import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getCohortAnalysis } from "@/lib/analytics/queries"

// Helper function to get admin user
async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    if (decoded.role !== "admin") {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)

    if (!adminUser) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Default to last 12 months for cohort analysis
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

    const cohortData = await getCohortAnalysis(startDate, endDate)

    // Transform data for frontend consumption
    const cohortTable: { [key: string]: { [key: number]: number } } = {}

    cohortData.forEach(({ cohortMonth, periodNumber, userCount }) => {
      if (!cohortTable[cohortMonth]) {
        cohortTable[cohortMonth] = {}
      }
      cohortTable[cohortMonth][periodNumber] = userCount
    })

    return NextResponse.json({
      success: true,
      data: {
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        cohortTable,
        rawData: cohortData,
      },
    })
  } catch (error) {
    console.error("Error fetching cohort analysis:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cohort analysis" }, { status: 500 })
  }
}
