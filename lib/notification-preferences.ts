import { sql } from "@/lib/database"

export interface UserNotificationPreferences {
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  emailPreferences: Record<string, boolean>
  pushPreferences: Record<string, boolean>
  smsPreferences: Record<string, boolean>
  deliveryPreferences: {
    frequency: string
    quietHoursEnabled: boolean
    quietStart: string
    quietEnd: string
    timezone: string
  }
  contactInfo: {
    phoneNumber?: string
    phoneVerified: boolean
  }
}

export async function getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | null> {
  try {
    const [preferences] = await sql`
      SELECT * FROM user_notification_preferences 
      WHERE user_id = ${userId}
    `

    if (!preferences) {
      return null
    }

    return {
      emailEnabled: preferences.email_enabled,
      pushEnabled: preferences.push_enabled,
      smsEnabled: preferences.sms_enabled,
      emailPreferences: {
        tradingAlerts: preferences.email_trading_alerts,
        botUpdates: preferences.email_bot_updates,
        signalNotifications: preferences.email_signal_notifications,
        portfolioUpdates: preferences.email_portfolio_updates,
        securityAlerts: preferences.email_security_alerts,
        marketNews: preferences.email_market_news,
        systemUpdates: preferences.email_system_updates,
        promotions: preferences.email_promotions,
      },
      pushPreferences: {
        tradingAlerts: preferences.push_trading_alerts,
        botUpdates: preferences.push_bot_updates,
        signalNotifications: preferences.push_signal_notifications,
        portfolioUpdates: preferences.push_portfolio_updates,
        securityAlerts: preferences.push_security_alerts,
        marketNews: preferences.push_market_news,
        systemUpdates: preferences.push_system_updates,
        promotions: preferences.push_promotions,
      },
      smsPreferences: {
        tradingAlerts: preferences.sms_trading_alerts,
        botUpdates: preferences.sms_bot_updates,
        signalNotifications: preferences.sms_signal_notifications,
        portfolioUpdates: preferences.sms_portfolio_updates,
        securityAlerts: preferences.sms_security_alerts,
        marketNews: preferences.sms_market_news,
        systemUpdates: preferences.sms_system_updates,
        promotions: preferences.sms_promotions,
      },
      deliveryPreferences: {
        frequency: preferences.frequency,
        quietHoursEnabled: preferences.quiet_hours_enabled,
        quietStart: preferences.quiet_hours_start,
        quietEnd: preferences.quiet_hours_end,
        timezone: preferences.timezone,
      },
      contactInfo: {
        phoneNumber: preferences.phone_number,
        phoneVerified: preferences.phone_verified,
      },
    }
  } catch (error) {
    console.error("Error fetching user notification preferences:", error)
    return null
  }
}

export function shouldSendNotification(
  preferences: UserNotificationPreferences,
  notificationType: string,
  deliveryMethod: "email" | "push" | "sms",
): boolean {
  // Check if the delivery method is enabled
  if (deliveryMethod === "email" && !preferences.emailEnabled) return false
  if (deliveryMethod === "push" && !preferences.pushEnabled) return false
  if (deliveryMethod === "sms" && !preferences.smsEnabled) return false

  // Check if the specific notification type is enabled for this delivery method
  const methodPreferences = preferences[`${deliveryMethod}Preferences`] as Record<string, boolean>
  if (!methodPreferences[notificationType]) return false

  // Check quiet hours (only for non-critical notifications)
  const criticalTypes = ["securityAlerts"]
  if (preferences.deliveryPreferences.quietHoursEnabled && !criticalTypes.includes(notificationType)) {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const { quietStart, quietEnd } = preferences.deliveryPreferences

    // Handle quiet hours that span midnight
    if (quietStart > quietEnd) {
      if (currentTime >= quietStart || currentTime <= quietEnd) {
        return false
      }
    } else {
      if (currentTime >= quietStart && currentTime <= quietEnd) {
        return false
      }
    }
  }

  return true
}

export async function createDefaultPreferences(userId: string) {
  try {
    await sql`
      INSERT INTO user_notification_preferences (user_id)
      VALUES (${userId})
      ON CONFLICT (user_id) DO NOTHING
    `
  } catch (error) {
    console.error("Error creating default preferences:", error)
  }
}
