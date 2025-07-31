import { type NextRequest, NextResponse } from "next/server"
import { adminNotificationService } from "@/lib/admin-notification-service"

export async function GET() {
  try {
    const config = adminNotificationService.getConfig()
    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("Error getting notification config:", error)
    return NextResponse.json({ success: false, error: "Failed to get notification config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminEmails, securityEmails, enabledTypes } = body

    // Validate input
    if (adminEmails && !Array.isArray(adminEmails)) {
      return NextResponse.json({ success: false, error: "adminEmails must be an array" }, { status: 400 })
    }

    if (securityEmails && !Array.isArray(securityEmails)) {
      return NextResponse.json({ success: false, error: "securityEmails must be an array" }, { status: 400 })
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (adminEmails) {
      for (const email of adminEmails) {
        if (!emailRegex.test(email)) {
          return NextResponse.json({ success: false, error: `Invalid admin email format: ${email}` }, { status: 400 })
        }
      }
    }

    if (securityEmails) {
      for (const email of securityEmails) {
        if (!emailRegex.test(email)) {
          return NextResponse.json(
            { success: false, error: `Invalid security email format: ${email}` },
            { status: 400 },
          )
        }
      }
    }

    // Update configuration
    await adminNotificationService.updateConfig({
      adminEmails,
      securityEmails,
      enabledTypes,
    })

    const updatedConfig = adminNotificationService.getConfig()
    return NextResponse.json({ success: true, config: updatedConfig })
  } catch (error) {
    console.error("Error updating notification config:", error)
    return NextResponse.json({ success: false, error: "Failed to update notification config" }, { status: 500 })
  }
}
