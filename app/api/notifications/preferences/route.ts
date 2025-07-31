import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get user preferences or create default ones
    let [preferences] = await sql`
      SELECT * FROM user_notification_preferences 
      WHERE user_id = ${decoded.userId}
    `

    if (!preferences) {
      // Create default preferences
      ;[preferences] = await sql`
        INSERT INTO user_notification_preferences (user_id)
        VALUES (${decoded.userId})
        RETURNING *
      `
    }

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json({ error: "Failed to get preferences" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { emailPreferences, pushPreferences, smsPreferences, deliveryPreferences, contactInfo } = body

    // Update preferences
    const [updatedPreferences] = await sql`
      INSERT INTO user_notification_preferences (
        user_id,
        email_enabled, email_trading_alerts, email_bot_updates, email_signal_notifications,
        email_portfolio_updates, email_security_alerts, email_market_news, email_system_updates, email_promotions,
        push_enabled, push_trading_alerts, push_bot_updates, push_signal_notifications,
        push_portfolio_updates, push_security_alerts, push_market_news, push_system_updates, push_promotions,
        sms_enabled, sms_trading_alerts, sms_bot_updates, sms_signal_notifications,
        sms_portfolio_updates, sms_security_alerts, sms_market_news, sms_system_updates, sms_promotions,
        frequency, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, timezone, language,
        phone_number
      )
      VALUES (
        ${decoded.userId},
        ${emailPreferences.enabled}, ${emailPreferences.tradingAlerts}, ${emailPreferences.botUpdates}, ${emailPreferences.signalNotifications},
        ${emailPreferences.portfolioUpdates}, ${emailPreferences.securityAlerts}, ${emailPreferences.marketNews}, ${emailPreferences.systemUpdates}, ${emailPreferences.promotions},
        ${pushPreferences.enabled}, ${pushPreferences.tradingAlerts}, ${pushPreferences.botUpdates}, ${pushPreferences.signalNotifications},
        ${pushPreferences.portfolioUpdates}, ${pushPreferences.securityAlerts}, ${pushPreferences.marketNews}, ${pushPreferences.systemUpdates}, ${pushPreferences.promotions},
        ${smsPreferences.enabled}, ${smsPreferences.tradingAlerts}, ${smsPreferences.botUpdates}, ${smsPreferences.signalNotifications},
        ${smsPreferences.portfolioUpdates}, ${smsPreferences.securityAlerts}, ${smsPreferences.marketNews}, ${smsPreferences.systemUpdates}, ${smsPreferences.promotions},
        ${deliveryPreferences.frequency}, ${deliveryPreferences.quietHoursEnabled}, ${deliveryPreferences.quietStart}, ${deliveryPreferences.quietEnd}, 
        ${deliveryPreferences.timezone}, ${deliveryPreferences.language},
        ${contactInfo.phoneNumber}
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        email_enabled = ${emailPreferences.enabled},
        email_trading_alerts = ${emailPreferences.tradingAlerts},
        email_bot_updates = ${emailPreferences.botUpdates},
        email_signal_notifications = ${emailPreferences.signalNotifications},
        email_portfolio_updates = ${emailPreferences.portfolioUpdates},
        email_security_alerts = ${emailPreferences.securityAlerts},
        email_market_news = ${emailPreferences.marketNews},
        email_system_updates = ${emailPreferences.systemUpdates},
        email_promotions = ${emailPreferences.promotions},
        push_enabled = ${pushPreferences.enabled},
        push_trading_alerts = ${pushPreferences.tradingAlerts},
        push_bot_updates = ${pushPreferences.botUpdates},
        push_signal_notifications = ${pushPreferences.signalNotifications},
        push_portfolio_updates = ${pushPreferences.portfolioUpdates},
        push_security_alerts = ${pushPreferences.securityAlerts},
        push_market_news = ${pushPreferences.marketNews},
        push_system_updates = ${pushPreferences.systemUpdates},
        push_promotions = ${pushPreferences.promotions},
        sms_enabled = ${smsPreferences.enabled},
        sms_trading_alerts = ${smsPreferences.tradingAlerts},
        sms_bot_updates = ${smsPreferences.botUpdates},
        sms_signal_notifications = ${smsPreferences.signalNotifications},
        sms_portfolio_updates = ${smsPreferences.portfolioUpdates},
        sms_security_alerts = ${smsPreferences.securityAlerts},
        sms_market_news = ${smsPreferences.marketNews},
        sms_system_updates = ${smsPreferences.systemUpdates},
        sms_promotions = ${smsPreferences.promotions},
        frequency = ${deliveryPreferences.frequency},
        quiet_hours_enabled = ${deliveryPreferences.quietHoursEnabled},
        quiet_hours_start = ${deliveryPreferences.quietStart},
        quiet_hours_end = ${deliveryPreferences.quietEnd},
        timezone = ${deliveryPreferences.timezone},
        language = ${deliveryPreferences.language},
        phone_number = ${contactInfo.phoneNumber},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: updatedPreferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}
