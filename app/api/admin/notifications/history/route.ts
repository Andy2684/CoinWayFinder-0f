import { type NextRequest, NextResponse } from "next/server"
import { adminNotificationService } from "@/lib/admin-notification-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") || undefined
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (searchParams.has("startDate")) {
      startDate = new Date(searchParams.get("startDate") as string)
    }

    if (searchParams.has("endDate")) {
      endDate = new Date(searchParams.get("endDate") as string)
    }

    const result = await adminNotificationService.getNotificationHistory({
      page,
      limit,
      type,
      status,
      startDate,
      endDate,
      search,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching notification history:", error)
    return NextResponse.json({ error: "Failed to fetch notification history" }, { status: 500 })
  }
}
