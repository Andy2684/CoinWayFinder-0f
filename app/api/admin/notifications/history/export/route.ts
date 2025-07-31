import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

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

    // Build the WHERE clause
    let whereClause = sql``

    if (type) {
      whereClause = sql`${whereClause} AND type = ${type}`
    }

    if (status) {
      whereClause = sql`${whereClause} AND status = ${status}`
    }

    if (startDate) {
      whereClause = sql`${whereClause} AND sent_at >= ${startDate}`
    }

    if (endDate) {
      whereClause = sql`${whereClause} AND sent_at <= ${endDate}`
    }

    if (search) {
      whereClause = sql`${whereClause} AND (
        subject ILIKE ${"%" + search + "%"} OR
        ${search} = ANY(recipients)
      )`
    }

    // Get notifications
    const notifications = await sql`
      SELECT 
        id, type, subject, recipients, status, 
        sent_at, delivered_at, error_message,
        created_at, updated_at
      FROM notification_history
      WHERE 1=1 ${whereClause}
      ORDER BY sent_at DESC
    `

    // Convert to CSV
    const headers = [
      "ID",
      "Type",
      "Subject",
      "Recipients",
      "Status",
      "Sent At",
      "Delivered At",
      "Error Message",
      "Created At",
      "Updated At",
    ]

    const rows = notifications.map((notification: any) => [
      notification.id,
      notification.type,
      notification.subject,
      notification.recipients.join(", "),
      notification.status,
      notification.sent_at,
      notification.delivered_at || "",
      notification.error_message || "",
      notification.created_at,
      notification.updated_at,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row: any[]) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Set headers for CSV download
    const filename = `notification-history-${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting notification history:", error)
    return NextResponse.json({ error: "Failed to export notification history" }, { status: 500 })
  }
}
