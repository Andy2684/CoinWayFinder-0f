import { type NextRequest, NextResponse } from "next/server"

interface ErrorLog {
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorLog = await request.json()

    // Add additional context
    const enrichedError = {
      ...errorData,
      ip: request.ip || "unknown",
      headers: Object.fromEntries(request.headers.entries()),
      severity: determineSeverity(errorData.message),
      environment: process.env.NODE_ENV || "unknown",
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Client Error:", enrichedError)
    }

    // In production, you would send this to your monitoring service
    // Examples: Sentry, LogRocket, Datadog, etc.
    await logToMonitoringService(enrichedError)

    // Store in database for analysis
    await storeErrorInDatabase(enrichedError)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Failed to log client error:", error)
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 })
  }
}

function determineSeverity(message: string): "low" | "medium" | "high" | "critical" {
  const criticalKeywords = ["payment", "transaction", "trade", "bot", "api key"]
  const highKeywords = ["auth", "login", "subscription", "data loss"]
  const mediumKeywords = ["network", "timeout", "connection"]

  const lowerMessage = message.toLowerCase()

  if (criticalKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return "critical"
  }
  if (highKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return "high"
  }
  if (mediumKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return "medium"
  }
  return "low"
}

async function logToMonitoringService(errorData: any) {
  // Example integration with monitoring service
  if (process.env.MONITORING_WEBHOOK_URL) {
    try {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `🚨 Client Error: ${errorData.message}`,
          attachments: [
            {
              color: errorData.severity === "critical" ? "danger" : "warning",
              fields: [
                { title: "URL", value: errorData.url, short: true },
                { title: "User Agent", value: errorData.userAgent, short: true },
                { title: "Timestamp", value: errorData.timestamp, short: true },
                { title: "Severity", value: errorData.severity, short: true },
              ],
            },
          ],
        }),
      })
    } catch (error) {
      console.error("Failed to send to monitoring service:", error)
    }
  }
}

async function storeErrorInDatabase(errorData: any) {
  // In a real app, you would store this in your database
  // For now, we'll just log it
  console.log("Storing error in database:", {
    timestamp: errorData.timestamp,
    message: errorData.message,
    severity: errorData.severity,
    url: errorData.url,
  })
}
