import { connectToDatabase } from "./mongodb"

export interface NotificationPreferences {
  user_id: number
  email_enabled: boolean
  email_trading_alerts: boolean
  email_bot_updates: boolean
  email_signals: boolean
  email_portfolio: boolean
  email_security: boolean
  email_news: boolean
  email_system: boolean
  email_promotions: boolean
  push_enabled: boolean
  push_trading_alerts: boolean
  push_bot_updates: boolean
  push_signals: boolean
  push_portfolio: boolean
  push_security: boolean
  push_news: boolean
  push_system: boolean
  push_promotions: boolean
  sms_enabled: boolean
  sms_trading_alerts: boolean
  sms_bot_updates: boolean
  sms_signals: boolean
  sms_portfolio: boolean
  sms_security: boolean
  sms_news: boolean
  sms_system: boolean
  sms_promotions: boolean
  frequency: string
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  timezone: string
  phone_number: string | null
  phone_verified: boolean
}

export async function getUserNotificationPreferences(userId: number): Promise<NotificationPreferences | null> {
  try {
    const db = await connectToDatabase()
    const preferences = await db.collection("user_notification_preferences").findOne({ user_id: userId })
    return preferences as NotificationPreferences | null
  } catch (error) {
    console.error("Error fetching user notification preferences:", error)
    return null
  }
}

export async function createDefaultPreferences(userId: number): Promise<void> {
  try {
    const db = await connectToDatabase()

    const defaultPreferences = {
      user_id: userId,
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
  } catch (error) {
    console.error("Error creating default notification preferences:", error)
  }
}

export function shouldSendNotification(
  preferences: NotificationPreferences,
  notificationType: string,
  deliveryMethod: "email" | "push" | "sms",
): boolean {
  // Always send security notifications
  if (notificationType === "security") {
    return true
  }

  // Check if delivery method is enabled
  const methodEnabled = preferences[`${deliveryMethod}_enabled` as keyof NotificationPreferences] as boolean
  if (!methodEnabled) {
    return false
  }

  // Check if specific notification type is enabled for this method
  const typeEnabled = preferences[`${deliveryMethod}_${notificationType}` as keyof NotificationPreferences] as boolean
  if (!typeEnabled) {
    return false
  }

  // Check quiet hours (except for security notifications)
  if (preferences.quiet_hours_enabled && notificationType !== "security") {
    const now = new Date()
    const userTime = new Date(now.toLocaleString("en-US", { timeZone: preferences.timezone }))
    const currentTime = userTime.getHours() * 60 + userTime.getMinutes()

    const [startHour, startMin] = preferences.quiet_hours_start.split(":").map(Number)
    const [endHour, endMin] = preferences.quiet_hours_end.split(":").map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Handle quiet hours that span midnight
    if (startTime > endTime) {
      if (currentTime >= startTime || currentTime <= endTime) {
        return false
      }
    } else {
      if (currentTime >= startTime && currentTime <= endTime) {
        return false
      }
    }
  }

  return true
}

export function getNotificationFrequency(preferences: NotificationPreferences, notificationType: string): string {
  // Security notifications are always immediate
  if (notificationType === "security") {
    return "immediate"
  }

  return preferences.frequency
}
