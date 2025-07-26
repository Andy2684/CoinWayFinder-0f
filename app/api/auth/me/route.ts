import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"
import { auditLogger } from "@/lib/audit-logger"

function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim()
    return ip || null
  }
  if (realIP) {
    return realIP
  }
  if (remoteAddr) {
    return remoteAddr
  }
  return null
}

export async function GET(request: NextRequest) {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"

  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      await auditLogger.log({
        eventType: "auth_check_no_token",
        eventCategory: "authentication",
        eventDescription: "Authentication check failed - no token provided",
        ipAddress,
        userAgent,
        riskLevel: "low",
        success: false,
        errorMessage: "No token provided",
      })

      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
          message: "Authentication required",
        },
        { status: 401 },
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      await auditLogger.log({
        eventType: "auth_check_invalid_token",
        eventCategory: "authentication",
        eventDescription: "Authentication check failed - invalid token",
        ipAddress,
        userAgent,
        riskLevel: "medium",
        success: false,
        errorMessage: "Invalid or expired token",
      })

      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
          message: "Token is invalid or expired",
        },
        { status: 401 },
      )
    }

    // Get user data
    const user = await getUserById(decoded.userId)
    if (!user) {
      await auditLogger.log({
        userId: decoded.userId,
        eventType: "auth_check_user_not_found",
        eventCategory: "authentication",
        eventDescription: "Authentication check failed - user not found",
        ipAddress,
        userAgent,
        riskLevel: "high",
        success: false,
        errorMessage: "User account no longer exists",
      })

      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "User account no longer exists",
        },
        { status: 404 },
      )
    }

    // Log successful token refresh/validation
    await auditLogger.logTokenRefresh(user.id, ipAddress, userAgent)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Auth verification error:", error)

    await auditLogger.log({
      eventType: "auth_check_server_error",
      eventCategory: "system",
      eventDescription: "Server error during authentication check",
      ipAddress,
      userAgent,
      riskLevel: "high",
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during authentication verification",
      },
      { status: 500 },
    )
  }
}
