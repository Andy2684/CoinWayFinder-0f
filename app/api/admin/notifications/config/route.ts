import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import adminNotificationService, { type AdminNotificationConfig } from "@/lib/admin-notification-service"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = adminNotificationService.getConfiguration()
    return NextResponse.json({ config })
  } catch (error) {
    console.error("Failed to get notification config:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates: Partial<AdminNotificationConfig> = await request.json()

    // Validate the updates
    if (updates.adminEmails && !Array.isArray(updates.adminEmails)) {
      return NextResponse.json({ error: "adminEmails must be an array" }, { status: 400 })
    }

    if (updates.securityEmails && !Array.isArray(updates.securityEmails)) {
      return NextResponse.json({ error: "securityEmails must be an array" }, { status: 400 })
    }

    // Validate email formats
    const validateEmails = (emails: string[]) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emails.every((email) => emailRegex.test(email))
    }

    if (updates.adminEmails && !validateEmails(updates.adminEmails)) {
      return NextResponse.json({ error: "Invalid email format in adminEmails" }, { status: 400 })
    }

    if (updates.securityEmails && !validateEmails(updates.securityEmails)) {
      return NextResponse.json({ error: "Invalid email format in securityEmails" }, { status: 400 })
    }

    await adminNotificationService.updateConfiguration(updates)

    return NextResponse.json({ success: true, message: "Notification configuration updated" })
  } catch (error) {
    console.error("Failed to update notification config:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
