import { NextResponse } from "next/server"
import { adminNotificationService } from "@/lib/admin-notification-service"

export async function GET() {
  try {
    const stats = await adminNotificationService.getNotificationStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching notification stats:", error)
    return NextResponse.json({ error: "Failed to fetch notification statistics" }, { status: 500 })
  }
}
