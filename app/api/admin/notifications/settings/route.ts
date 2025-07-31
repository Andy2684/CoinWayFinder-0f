import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { adminEmailService } from "@/lib/admin-email-service"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const adminUser = await db.collection("users").findOne({ _id: decoded.userId })

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get notification settings from database or use defaults
    const settings = (await db.collection("admin_settings").findOne({ type: "notifications" })) || {
      adminEmails: adminEmailService.getAdminEmails(),
      notifications: {
        adminActions: true,
        securityAlerts: true,
        systemEvents: true,
        userRegistrations: false,
        failedLogins: true,
        suspiciousActivity: true,
      },
      alertThresholds: {
        failedLoginAttempts: 5,
        suspiciousActivityScore: 75,
        criticalAlertDelay: 0,
        highAlertDelay: 300, // 5 minutes
        mediumAlertDelay: 1800, // 30 minutes
        lowAlertDelay: 3600, // 1 hour
      },
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Get notification settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
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

    const { db } = await connectToDatabase()
    const adminUser = await db.collection("users").findOne({ _id: decoded.userId })

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { adminEmails, notifications, alertThresholds } = body

    // Validate admin emails
    if (adminEmails && Array.isArray(adminEmails)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const validEmails = adminEmails.every((email: string) => emailRegex.test(email))

      if (!validEmails) {
        return NextResponse.json({ error: "Invalid email addresses provided" }, { status: 400 })
      }

      // Update admin email service
      adminEmailService.setAdminEmails(adminEmails)
    }

    const settings = {
      type: "notifications",
      adminEmails: adminEmails || adminEmailService.getAdminEmails(),
      notifications: notifications || {
        adminActions: true,
        securityAlerts: true,
        systemEvents: true,
        userRegistrations: false,
        failedLogins: true,
        suspiciousActivity: true,
      },
      alertThresholds: alertThresholds || {
        failedLoginAttempts: 5,
        suspiciousActivityScore: 75,
        criticalAlertDelay: 0,
        highAlertDelay: 300,
        mediumAlertDelay: 1800,
        lowAlertDelay: 3600,
      },
      updatedAt: new Date(),
      updatedBy: decoded.userId,
    }

    await db.collection("admin_settings").replaceOne({ type: "notifications" }, settings, { upsert: true })

    return NextResponse.json({
      success: true,
      message: "Notification settings updated successfully",
      settings,
    })
  } catch (error) {
    console.error("Update notification settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
