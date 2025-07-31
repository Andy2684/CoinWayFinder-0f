import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get overall stats
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM notification_history
      WHERE created_at >= ${startDate}
    `

    // Get stats by type
    const typeStats = await sql`
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM notification_history
      WHERE created_at >= ${startDate}
      GROUP BY type
      ORDER BY count DESC
    `

    // Get daily stats for the last 7 days
    const dailyStats = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM notification_history
      WHERE created_at >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    // Get recent failures
    const recentFailures = await sql`
      SELECT 
        id,
        type,
        subject,
        recipients,
        error_message,
        created_at
      FROM notification_history
      WHERE status = 'failed' AND created_at >= ${startDate}
      ORDER BY created_at DESC
      LIMIT 10
    `

    const stats = overallStats[0]
    const deliveryRate =
      stats.total_notifications > 0 ? ((stats.delivered_count / stats.total_notifications) * 100).toFixed(2) : "0"

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalNotifications: Number.parseInt(stats.total_notifications),
          sentCount: Number.parseInt(stats.sent_count),
          deliveredCount: Number.parseInt(stats.delivered_count),
          failedCount: Number.parseInt(stats.failed_count),
          pendingCount: Number.parseInt(stats.pending_count),
          deliveryRate: Number.parseFloat(deliveryRate),
        },
        byType: typeStats.map((stat) => ({
          type: stat.type,
          count: Number.parseInt(stat.count),
          deliveredCount: Number.parseInt(stat.delivered_count),
          failedCount: Number.parseInt(stat.failed_count),
          deliveryRate: stat.count > 0 ? ((stat.delivered_count / stat.count) * 100).toFixed(2) : "0",
        })),
        dailyStats: dailyStats.map((stat) => ({
          date: stat.date,
          count: Number.parseInt(stat.count),
          deliveredCount: Number.parseInt(stat.delivered_count),
          failedCount: Number.parseInt(stat.failed_count),
        })),
        recentFailures: recentFailures.map((failure) => ({
          id: failure.id,
          type: failure.type,
          subject: failure.subject,
          recipients: failure.recipients,
          errorMessage: failure.error_message,
          createdAt: failure.created_at,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching notification stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch notification stats" }, { status: 500 })
  }
}
