import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Get user preferences or create default ones
    let preferences = await db.collection("user_notification_preferences").findOne({ user_id: user.id })

    if (!preferences) {
      // Create default preferences
      const defaultPreferences = {
        user_id: user.id,
        email_enabled: true,
        email_trading_alerts: true,
        email_bot_updates: true,
        email_signals: true,
        email_portfolio: true,
        email_security: true,
        email_news: false,
        email_system: true,
        email_promotions: false,
        push_enabled: true,
        push_trading_alerts: true,
        push_bot_updates: true,
        push_signals: true,
        push_portfolio: false,
        push_security: true,
        push_news: false,
        push_system: true,
        push_promotions: false,
        sms_enabled: false,
        sms_trading_alerts: false,
        sms_bot_updates: false,
        sms_signals: false,
        sms_portfolio: false,
        sms_security: true,
        sms_news: false,
        sms_system: false,
        sms_promotions: false,
        frequency: "immediate",
        quiet_hours_enabled: false,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00",
        timezone: "UTC",
        phone_number: null,
        phone_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      }

      await db.collection("user_notification_preferences").insertOne(defaultPreferences)
      preferences = defaultPreferences
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const db = await connectToDatabase()

    // Update preferences
    const updateData = {
      ...body,
      updated_at: new Date(),
    }

    await db
      .collection("user_notification_preferences")
      .updateOne({ user_id: user.id }, { $set: updateData }, { upsert: true })

    return NextResponse.json({ success: true, message: "Preferences updated successfully" })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
