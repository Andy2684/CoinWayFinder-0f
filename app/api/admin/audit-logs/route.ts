import { type NextRequest, NextResponse } from "next/server"
import { getAuditLogs } from "@/lib/audit-logger"
import { verifyToken } from "@/lib/auth"

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

    // Check if user is admin (you might want to verify this from database)
    // For now, we'll assume the token contains role information

    const { searchParams } = new URL(request.url)

    const filter = {
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

    const logs = await getAuditLogs(filter)

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
