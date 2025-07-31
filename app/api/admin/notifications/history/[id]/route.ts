import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const notification = await sql`
      SELECT 
        id,
        notification_id,
        type,
        subject,
        content,
        html_content,
        recipients,
        status,
        error_message,
        metadata,
        sent_at,
        delivered_at,
        created_at,
        updated_at
      FROM notification_history
      WHERE id = ${id}
    `

    if (notification.length === 0) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: notification[0],
    })
  } catch (error) {
    console.error("Error fetching notification details:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch notification details" }, { status: 500 })
  }
}
