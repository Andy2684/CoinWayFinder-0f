import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import adminNotificationService from "@/lib/admin-notification-service"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, email } = body

    if (!type || !email) {
      return NextResponse.json({ error: "Type and email are required" }, { status: 400 })
    }

    const testNotifications = {
      security: {
        type: "suspicious_activity" as const,
        severity: "medium" as const,
        details: {
          userId: "test-user-123",
          ipAddress: "192.168.1.100",
          userAgent: "Test User Agent",
          timestamp: new Date(),
          description: "This is a test security alert notification",
          location: "Test Location",
          attemptCount: 3,
        },
        affectedSystems: ["Authentication System", "User Database"],
        recommendedActions: [
          "Review user access logs",
          "Consider temporary account suspension",
          "Monitor for additional suspicious activity",
        ],
      },
      admin: {
        action: "user_banned",
        adminId: authResult.user.id,
        adminEmail: authResult.user.email,
        targetUserEmail: "test-user@example.com",
        details: {
          reason: "Test ban action",
          duration: "7 days",
        },
        timestamp: new Date(),
        ipAddress: "192.168.1.100",
      },
      system: {
        component: "Database Connection Pool",
        status: "degraded" as const,
        details: "Connection pool utilization above 90%. Response times may be affected.",
        timestamp: new Date(),
      },
    }

    switch (type) {
      case "security":
        // Temporarily override config to send to specific email
        const originalConfig = adminNotificationService.getConfiguration()
        await adminNotificationService.updateConfiguration({
          securityEmails: [email],
          securityAlerts: true,
        })

        await adminNotificationService.sendSecurityAlert(testNotifications.security)

        // Restore original config
        await adminNotificationService.updateConfiguration(originalConfig)
        break

      case "admin":
        const originalAdminConfig = adminNotificationService.getConfiguration()
        await adminNotificationService.updateConfiguration({
          adminEmails: [email],
          userManagement: true,
        })

        await adminNotificationService.sendAdminActionNotification(testNotifications.admin)

        // Restore original config
        await adminNotificationService.updateConfiguration(originalAdminConfig)
        break

      case "system":
        const originalSystemConfig = adminNotificationService.getConfiguration()
        await adminNotificationService.updateConfiguration({
          adminEmails: [email],
          systemHealth: true,
        })

        await adminNotificationService.sendSystemHealthAlert(testNotifications.system)

        // Restore original config
        await adminNotificationService.updateConfiguration(originalSystemConfig)
        break

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Test ${type} notification sent to ${email}`,
    })
  } catch (error) {
    console.error("Failed to send test notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
