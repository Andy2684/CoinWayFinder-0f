import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { auditLogger } from "@/lib/audit-logger"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (remoteAddr) {
    return remoteAddr
  }
  return "unknown"
}

export async function POST(request: NextRequest) {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"

  try {
    // Get token from cookie to identify user for logging
    const token = request.cookies.get("auth-token")?.value
    let userId: string | undefined

    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        userId = decoded.userId
        // Log the logout event
        await auditLogger.logLogout(userId, ipAddress, userAgent)
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)

    // Log system error
    await auditLogger.logSystemEvent(
      "logout_error",
      `Logout error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { ipAddress, userAgent },
    )

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during logout",
      },
      { status: 500 },
    )
  }
}
