import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import {
  getUserAnalytics,
  getTradingAnalytics,
  getEngagementAnalytics,
  getRevenueAnalytics,
} from "@/lib/analytics/queries"

// Helper function to get user from token and check admin role
async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // In a real app, you'd check the user's role from the database
    // For now, we'll assume the token contains role information
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

    // Default to last 30 days if no date range provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const dateRange = { startDate, endDate }

    // Fetch all analytics data in parallel
    const [userAnalytics, tradingAnalytics, engagementAnalytics, revenueAnalytics] = await Promise.all([
      getUserAnalytics(dateRange),
      getTradingAnalytics(dateRange),
      getEngagementAnalytics(dateRange),
      getRevenueAnalytics(dateRange),
    ])

    return NextResponse.json({
      success: true,
      data: {
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        users: userAnalytics,
        trading: tradingAnalytics,
        engagement: engagementAnalytics,
        revenue: revenueAnalytics,
      },
    })
  } catch (error) {
    console.error("Error fetching analytics overview:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
