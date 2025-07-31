import { type NextRequest, NextResponse } from "next/server"
import { adminNotificationService } from "@/lib/admin-notification-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type } = body

    if (!email || !type) {
      return NextResponse.json({ success: false, error: "Email and type are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Validate notification type
    const validTypes = ["security", "admin_action", "system_health", "user_management"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid notification type" }, { status: 400 })
    }

    await adminNotificationService.sendTestNotification(email, type)

    return NextResponse.json({
      success: true,
      message: `Test notification sent to ${email}`,
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json({ success: false, error: "Failed to send test notification" }, { status: 500 })
  }
}
