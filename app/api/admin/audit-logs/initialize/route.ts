import { type NextRequest, NextResponse } from "next/server"
import { auditLogger } from "@/lib/audit-logger"
import { verifyToken } from "@/lib/auth"

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

    // Force initialization of audit logs table
    await auditLogger.log({
      eventType: "audit_system_initialization",
      eventCategory: "system",
      eventDescription: "Audit logging system initialized by admin",
      userId: decoded.userId,
      riskLevel: "low",
      success: true,
      metadata: { initializedBy: decoded.userId },
    })

    return NextResponse.json({
      success: true,
      message: "Audit logging system initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing audit logs:", error)
    return NextResponse.json({ error: "Failed to initialize audit logging system" }, { status: 500 })
  }
}
