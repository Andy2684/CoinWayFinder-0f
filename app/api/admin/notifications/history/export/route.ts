import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build WHERE clause
    const whereConditions = []
    const params: any[] = []
    let paramIndex = 1

    if (type) {
      whereConditions.push(`type = $${paramIndex}`)
      params.push(type)
      paramIndex++
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    if (startDate) {
      whereConditions.push(`created_at >= $${paramIndex}`)
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      whereConditions.push(`created_at <= $${paramIndex}`)
      params.push(endDate)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    const query = `
      SELECT 
        notification_id,
        type,
        subject,
        array_to_string(recipients, ';') as recipients,
        status,
        error_message,
        sent_at,
        delivered_at,
        created_at
      FROM notification_history
      ${whereClause}
      ORDER BY created_at DESC
    `

    const notifications = await sql(query, params)

    // Convert to CSV
    const headers = [
      "Notification ID",
      "Type",
      "Subject",
      "Recipients",
      "Status",
      "Error Message",
      "Sent At",
      "Delivered At",
      "Created At",
    ]

    const csvRows = [
      headers.join(","),
      ...notifications.map((notification) =>
        [
          `"${notification.notification_id}"`,
          `"${notification.type}"`,
          `"${notification.subject.replace(/"/g, '""')}"`,
          `"${notification.recipients}"`,
          `"${notification.status}"`,
          `"${(notification.error_message || "").replace(/"/g, '""')}"`,
          `"${notification.sent_at || ""}"`,
          `"${notification.delivered_at || ""}"`,
          `"${notification.created_at}"`,
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const filename = `notification-history-${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting notification history:", error)
    return NextResponse.json({ success: false, error: "Failed to export notification history" }, { status: 500 })
  }
}
