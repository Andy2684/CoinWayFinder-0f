import { type NextRequest, NextResponse } from "next/server"
import {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTradingAlert,
  testMailgunConnection,
  validateMailgunConfig,
  getEmailStats,
  type EmailOptions,
} from "@/lib/email"

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 10 // 10 emails per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function getRateLimitKey(ip: string): string {
  return `email_rate_limit:${ip}`
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    const newRecord = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
    rateLimitStore.set(key, newRecord)
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: newRecord.resetTime }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  rateLimitStore.set(key, record)
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetTime: record.resetTime }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip")

  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(",")[0].trim()

  return "unknown"
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request)

    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimit.resetTime,
          remaining: rateLimit.remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    const body = await request.json()
    const { type, ...emailData } = body

    console.log(`Processing email request - Type: ${type}, IP: ${ip}`)

    // Validate Mailgun configuration
    const configValidation = validateMailgunConfig()
    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured properly",
          details: configValidation.errors,
        },
        { status: 500 },
      )
    }

    let result

    switch (type) {
      case "welcome":
        if (!emailData.userEmail || !emailData.userName) {
          return NextResponse.json(
            {
              success: false,
              error: "userEmail and userName are required for welcome emails",
              required: ["userEmail", "userName"],
            },
            { status: 400 },
          )
        }
        console.log(`Sending welcome email to: ${emailData.userEmail}`)
        result = await sendWelcomeEmail(emailData.userEmail, emailData.userName)
        break

      case "verification":
        if (!emailData.userEmail || !emailData.verificationToken) {
          return NextResponse.json(
            {
              success: false,
              error: "userEmail and verificationToken are required for verification emails",
              required: ["userEmail", "verificationToken"],
            },
            { status: 400 },
          )
        }
        console.log(`Sending verification email to: ${emailData.userEmail}`)
        result = await sendVerificationEmail(emailData.userEmail, emailData.verificationToken)
        break

      case "password-reset":
        if (!emailData.userEmail || !emailData.resetToken) {
          return NextResponse.json(
            {
              success: false,
              error: "userEmail and resetToken are required for password reset emails",
              required: ["userEmail", "resetToken"],
            },
            { status: 400 },
          )
        }
        console.log(`Sending password reset email to: ${emailData.userEmail}`)
        result = await sendPasswordResetEmail(emailData.userEmail, emailData.resetToken)
        break

      case "trading-alert":
        if (!emailData.userEmail || !emailData.alertData) {
          return NextResponse.json(
            {
              success: false,
              error: "userEmail and alertData are required for trading alerts",
              required: ["userEmail", "alertData"],
            },
            { status: 400 },
          )
        }

        // Validate alertData structure
        const requiredAlertFields = ["symbol", "price", "change", "alertType", "message"]
        const missingFields = requiredAlertFields.filter((field) => !emailData.alertData[field])
        if (missingFields.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Missing required alertData fields: ${missingFields.join(", ")}`,
              required: requiredAlertFields,
            },
            { status: 400 },
          )
        }

        console.log(`Sending trading alert to: ${emailData.userEmail} for ${emailData.alertData.symbol}`)
        result = await sendTradingAlert(emailData.userEmail, emailData.alertData)
        break

      case "custom":
        // Validate required fields for custom emails
        if (!emailData.to || !emailData.subject) {
          return NextResponse.json(
            {
              success: false,
              error: "to and subject are required for custom emails",
              required: ["to", "subject"],
            },
            { status: 400 },
          )
        }

        if (!emailData.text && !emailData.html) {
          return NextResponse.json(
            {
              success: false,
              error: "Either text or html content is required",
              required: ["text OR html"],
            },
            { status: 400 },
          )
        }

        const emailOptions: EmailOptions = {
          to: emailData.to,
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
          from: emailData.from,
          cc: emailData.cc,
          bcc: emailData.bcc,
          attachments: emailData.attachments,
          template: emailData.template,
          templateVariables: emailData.templateVariables,
          tags: emailData.tags,
          tracking: emailData.tracking,
          trackingClicks: emailData.trackingClicks,
          trackingOpens: emailData.trackingOpens,
        }

        console.log(`Sending custom email to: ${emailOptions.to}`)
        result = await sendEmail(emailOptions)
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email type",
            supportedTypes: ["welcome", "verification", "password-reset", "trading-alert", "custom"],
            received: type,
          },
          { status: 400 },
        )
    }

    console.log(`Email send result:`, result)

    // Add rate limit headers to successful responses
    const response = NextResponse.json(result)
    response.headers.set("X-RateLimit-Limit", RATE_LIMIT_MAX.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString())
    response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString())

    return response
  } catch (error: any) {
    console.error("Send email API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "test":
        console.log("Testing Mailgun connection...")
        const testResult = await testMailgunConnection()
        return NextResponse.json(testResult)

      case "config":
        const validation = validateMailgunConfig()
        return NextResponse.json({
          isConfigured: validation.isValid,
          errors: validation.errors,
          configuration: {
            domain: process.env.MAILGUN_DOMAIN || "Not configured",
            fromEmail: process.env.MAILGUN_FROM_EMAIL || "Not configured",
            apiKeyConfigured: !!process.env.MAILGUN_API_KEY,
            baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "Not configured",
          },
        })

      case "stats":
        const days = Number.parseInt(searchParams.get("days") || "7")
        const statsResult = await getEmailStats(days)
        return NextResponse.json(statsResult)

      case "health":
        return NextResponse.json({
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          uptime: process.uptime(),
        })

      default:
        // Default: return API documentation
        return NextResponse.json({
          service: "CoinWayFinder Email API",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          endpoints: {
            "POST /api/send-email": {
              description: "Send emails",
              supportedTypes: ["welcome", "verification", "password-reset", "trading-alert", "custom"],
            },
            "GET /api/send-email?action=test": {
              description: "Test Mailgun connection",
            },
            "GET /api/send-email?action=config": {
              description: "Check configuration status",
            },
            "GET /api/send-email?action=stats&days=7": {
              description: "Get email statistics",
            },
            "GET /api/send-email?action=health": {
              description: "Health check",
            },
          },
          rateLimit: {
            maxRequests: RATE_LIMIT_MAX,
            windowMs: RATE_LIMIT_WINDOW,
            windowHours: RATE_LIMIT_WINDOW / (60 * 60 * 1000),
          },
          configuration: {
            domain: process.env.MAILGUN_DOMAIN || "Not configured",
            fromEmail: process.env.MAILGUN_FROM_EMAIL || "Not configured",
            apiKeyConfigured: !!process.env.MAILGUN_API_KEY,
          },
        })
    }
  } catch (error: any) {
    console.error("Email API GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
