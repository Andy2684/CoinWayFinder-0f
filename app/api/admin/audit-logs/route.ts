import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"
import { getAuditLogs, type AuditLogFilter } from "@/lib/audit-logger"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Get user and check admin role
    const user = await getUserById(decoded.userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filter: AuditLogFilter = {
      userId: searchParams.get("userId") || undefined,
      eventCategory: (searchParams.get("eventCategory") as any) || undefined,
      eventType: searchParams.get("eventType") || undefined,
      riskLevel: (searchParams.get("riskLevel") as any) || undefined,
      success: searchParams.get("success") ? searchParams.get("success") === "true" : undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      ipAddress: searchParams.get("ipAddress") || undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : 0,
    }

    // Get audit logs
    const logs = await getAuditLogs(filter)

    return NextResponse.json({
      success: true,
      logs,
      filter,
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
