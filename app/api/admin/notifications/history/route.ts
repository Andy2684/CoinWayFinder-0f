import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

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

    if (search) {
      whereConditions.push(`(subject ILIKE $${paramIndex} OR array_to_string(recipients, ',') ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
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

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM notification_history
      ${whereClause}
    `
    const countResult = await sql(countQuery, params)
    const total = Number.parseInt(countResult[0].total)

    // Get notifications
    const query = `
      SELECT 
        id,
        notification_id,
        type,
        subject,
        content,
        recipients,
        status,
        error_message,
        metadata,
        sent_at,
        delivered_at,
        created_at,
        updated_at
      FROM notification_history
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    params.push(limit, offset)
    const notifications = await sql(query, params)

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching notification history:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch notification history" }, { status: 500 })
  }
}
