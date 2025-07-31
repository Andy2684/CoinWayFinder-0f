import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { emailQueue } from "@/lib/email-queue"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim()
    return ip !== "unknown" ? ip : "127.0.0.1"
  }
  if (realIP && realIP !== "unknown") {
    return realIP
  }
  if (remoteAddr && remoteAddr !== "unknown") {
    return remoteAddr
  }
  return "127.0.0.1"
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data, options = {} } = body
    const clientIP = getClientIP(request)

    let success = false
    let jobId = ""

    switch (type) {
      case "admin-action":
        // Add IP address to data
        data.ipAddress = clientIP
        data.timestamp = data.timestamp || new Date().toISOString()

        jobId = emailQueue.addJob("admin-action", data, options)
        success = true
        break

      case "security-alert":
        data.ipAddress = data.ipAddress || clientIP
        data.timestamp = data.timestamp || new Date().toISOString()

        jobId = emailQueue.addJob("security-alert", data, options)
        success = true
        break

      case "system-event":
        data.timestamp = data.timestamp || new Date().toISOString()

        jobId = emailQueue.addJob("system-event", data, options)
        success = true
        break

      case "user-registration":
        const registrationData = {
          alertType: "New User Registration",
          severity: "low" as const,
          description: `New user registered: ${data.userName} (${data.userEmail})`,
          affectedUsers: 1,
          timestamp: new Date().toISOString(),
          ipAddress: data.ipAddress || clientIP,
          metadata: { userEmail: data.userEmail, userName: data.userName },
        }

        jobId = emailQueue.addJob("security-alert", registrationData, options)
        success = true
        break

      case "failed-login":
        const severity = data.attempts > 10 ? "critical" : data.attempts > 5 ? "high" : "medium"
        const failedLoginData = {
          alertType: "Multiple Failed Login Attempts",
          severity,
          description: `${data.attempts} failed login attempts for ${data.email}`,
          timestamp: new Date().toISOString(),
          ipAddress: data.ipAddress || clientIP,
          location: data.location,
          metadata: { email: data.email, attempts: data.attempts },
        }

        jobId = emailQueue.addJob("security-alert", failedLoginData, options)
        success = true
        break

      case "suspicious-activity":
        const suspiciousData = {
          alertType: "Suspicious Activity Detected",
          severity: "high" as const,
          description: data.description,
          timestamp: new Date().toISOString(),
          ipAddress: data.ipAddress || clientIP,
          metadata: { userId: data.userId, ...data.metadata },
        }

        jobId = emailQueue.addJob("security-alert", suspiciousData, options)
        success = true
        break

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Notification queued successfully",
        jobId,
      })
    } else {
      return NextResponse.json({ error: "Failed to queue notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("Admin notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
