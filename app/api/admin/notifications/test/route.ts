import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import adminNotificationService from "@/lib/admin-notification-service"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, type } = await request.json()

    if (!email || !type) {
      return NextResponse.json({ error: "Email and type are required" }, { status: 400 })
    }

    if (!["security", "admin"].includes(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    await adminNotificationService.sendTestNotification(email, type)

    return NextResponse.json({
      success: true,
      message: `Test ${type} notification sent to ${email}`,
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json({ error: "Failed to send test notification" }, { status: 500 })
  }
}
