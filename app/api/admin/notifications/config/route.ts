import { type NextRequest, NextResponse } from "next/server"
import { adminNotificationService } from "@/lib/admin-notification-service"
import { auditLogger } from "@/lib/audit-logger"

export async function GET() {
  try {
    const config = adminNotificationService.getConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Failed to get notification config:", error)
    return NextResponse.json({ error: "Failed to get notification config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    await adminNotificationService.updateConfig(body)

    await auditLogger.log({
      action: "notification_config_updated",
      userId: "admin", // TODO: Get from auth context
      details: { config: body },
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update notification config:", error)
    return NextResponse.json({ error: "Failed to update notification config" }, { status: 500 })
  }
}
