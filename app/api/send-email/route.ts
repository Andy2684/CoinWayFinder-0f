import { type NextRequest, NextResponse } from "next/server"
import {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTradingAlert,
  testMailgunConnection,
  validateMailgunConfig,
  type EmailOptions,
} from "@/lib/email"
import { headers } from "next/headers"

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

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const headersList = headers()
    const forwarded = headersList.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"

    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimit.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          },
        },
      )
    }

    const body = await request.json()
    const { type, ...emailData } = body

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
            { success: false, error: "userEmail and userName are required for welcome emails" },
            { status: 400 },
          )
        }
        result = await sendWelcomeEmail(emailData.userEmail, emailData.userName)
        break

      case "verification":
        if (!emailData.userEmail || !emailData.verificationToken) {
          return NextResponse.json(
            { success: false, error: "userEmail and verificationToken are required for verification emails" },
            { status: 400 },
          )
        }
        result = await sendVerificationEmail(emailData.userEmail, emailData.verificationToken)
        break

      case "password-reset":
        if (!emailData.userEmail || !emailData.resetToken) {
          return NextResponse.json(
            { success: false, error: "userEmail and resetToken are required for password reset emails" },
            { status: 400 },
          )
        }
        result = await sendPasswordResetEmail(emailData.userEmail, emailData.resetToken)
        break

      case "trading-alert":
        if (!emailData.userEmail || !emailData.alertData) {
          return NextResponse.json(
            { success: false, error: "userEmail and alertData are required for trading alerts" },
            { status: 400 },
          )
        }
        result = await sendTradingAlert(emailData.userEmail, emailData.alertData)
        break

      case "custom":
        // Validate required fields for custom emails
        if (!emailData.to || !emailData.subject) {
          return NextResponse.json(
            { success: false, error: "to and subject are required for custom emails" },
            { status: 400 },
          )
        }

        if (!emailData.text && !emailData.html) {
          return NextResponse.json(
            { success: false, error: "Either text or html content is required" },
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
        }

        result = await sendEmail(emailOptions)
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email type. Supported types: welcome, verification, password-reset, trading-alert, custom",
          },
          { status: 400 },
        )
    }

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
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "test") {
      // Test Mailgun connection
      const result = await testMailgunConnection()
      return NextResponse.json(result)
    }

    if (action === "config") {
      // Check configuration
      const validation = validateMailgunConfig()
      return NextResponse.json({
        isConfigured: validation.isValid,
        errors: validation.errors,
        domain: process.env.MAILGUN_DOMAIN || "Not configured",
        fromEmail: process.env.MAILGUN_FROM_EMAIL || "Not configured",
      })
    }

    // Default: return API info
    return NextResponse.json({
      service: "CoinWayFinder Email API",
      version: "1.0.0",
      endpoints: {
        "POST /api/send-email": "Send emails",
        "GET /api/send-email?action=test": "Test Mailgun connection",
        "GET /api/send-email?action=config": "Check configuration",
      },
      supportedTypes: ["welcome", "verification", "password-reset", "trading-alert", "custom"],
      rateLimit: {
        maxRequests: RATE_LIMIT_MAX,
        windowMs: RATE_LIMIT_WINDOW,
      },
    })
  } catch (error: any) {
    console.error("Email API GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
      },
      { status: 500 },
    )
  }
}
