import { type NextRequest, NextResponse } from "next/server"
import { adminNotificationService } from "@/lib/admin-notification-service"

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email || !type) {
      return NextResponse.json({ error: "Email and type are required" }, { status: 400 })
    }

    if (!["security", "admin", "system"].includes(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    await adminNotificationService.sendTestNotification(email, type)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send test notification:", error)
    return NextResponse.json({ error: "Failed to send test notification" }, { status: 500 })
  }
}
