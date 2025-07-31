import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 })
    }

    const [notification] = await sql`
      SELECT * FROM notification_history WHERE id = ${id}
    `

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error fetching notification details:", error)
    return NextResponse.json({ error: "Failed to fetch notification details" }, { status: 500 })
  }
}
