import { type NextRequest, NextResponse } from "next/server"
import { adminNotificationService } from "@/lib/admin-notification-service"

export async function GET() {
  try {
    const config = adminNotificationService.getConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching notification config:", error)
    return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await adminNotificationService.updateConfig(body)

    return NextResponse.json({
      success: true,
      message: "Notification configuration updated successfully",
    })
  } catch (error) {
    console.error("Error updating notification config:", error)
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 })
  }
}
