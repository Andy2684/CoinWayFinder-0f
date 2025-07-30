import { type NextRequest, NextResponse } from "next/server"
import {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTradingAlert,
  validateMailgunConfig,
  testMailgunConnection,
  getEmailStats,
} from "@/lib/email"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(ip: string): string {
  return `email_rate_limit:${ip}`
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 10

  let record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs }
    rateLimitStore.set(key, record)
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  rateLimitStore.set(key, record)

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim()
    return ip !== "unknown" ? ip : "127.0.0.1"
  }
  if (realIP && realIP !== "unknown") {
    return realIP
  }
  if (remoteAddr && remoteAddr !== "unknown") {
    return remoteAddr
  }
  return "127.0.0.1"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "test":
        const testResult = await testMailgunConnection()
        return NextResponse.json(testResult)

      case "config":
        const validation = validateMailgunConfig()
        return NextResponse.json({
          isValid: validation.isValid,
          errors: validation.errors,
          config: {
            domain: process.env.MAILGUN_DOMAIN || "Not set",
            fromEmail: process.env.MAILGUN_FROM_EMAIL || "Not set",
            apiKeySet: !!process.env.MAILGUN_API_KEY,
          },
        })

      case "stats":
        const days = Number.parseInt(searchParams.get("days") || "7")
        const stats = await getEmailStats(days)
        return NextResponse.json(stats)

      case "health":
        return NextResponse.json({
          status: "healthy",
          timestamp: new Date().toISOString(),
          service: "email-api",
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Use: test, config, stats, or health",
          },
          { status: 400 },
        )
    }
  } catch (error: any) {
    console.error("Email API GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    console.log(`Email API request from IP: ${clientIP}`)

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: "Too many email requests. Please try again later.",
          resetTime: rateLimit.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          },
        },
      )
    }

    const body = await request.json()
    const { type, ...emailData } = body

    console.log(`Processing email request of type: ${type}`)

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: "Email type is required",
        },
        { status: 400 },
      )
    }

    let result

    switch (type) {
      case "welcome":
        if (!emailData.email || !emailData.name) {
          return NextResponse.json(
            {
              success: false,
              error: "Email and name are required for welcome emails",
            },
            { status: 400 },
          )
        }
        console.log(`Sending welcome email to: ${emailData.email}`)
        result = await sendWelcomeEmail(emailData.email, emailData.name)
        break

      case "verification":
        if (!emailData.email || !emailData.token) {
          return NextResponse.json(
            {
              success: false,
              error: "Email and verification token are required",
            },
            { status: 400 },
          )
        }
        console.log(`Sending verification email to: ${emailData.email}`)
        result = await sendVerificationEmail(emailData.email, emailData.token)
        break

      case "password-reset":
        if (!emailData.email || !emailData.token) {
          return NextResponse.json(
            {
              success: false,
              error: "Email and reset token are required",
            },
            { status: 400 },
          )
        }
        console.log(`Sending password reset email to: ${emailData.email}`)
        result = await sendPasswordResetEmail(emailData.email, emailData.token)
        break

      case "trading-alert":
        if (!emailData.email || !emailData.alertData) {
          return NextResponse.json(
            {
              success: false,
              error: "Email and alert data are required",
            },
            { status: 400 },
          )
        }
        console.log(`Sending trading alert to: ${emailData.email}`)
        result = await sendTradingAlert(emailData.email, emailData.alertData)
        break

      case "custom":
        if (!emailData.to || !emailData.subject) {
          return NextResponse.json(
            {
              success: false,
              error: "To address and subject are required for custom emails",
            },
            { status: 400 },
          )
        }
        console.log(`Sending custom email to: ${emailData.to}`)
        result = await sendEmail({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          from: emailData.from,
          cc: emailData.cc,
          bcc: emailData.bcc,
          attachments: emailData.attachments,
          tags: emailData.tags,
          tracking: emailData.tracking,
          trackingClicks: emailData.trackingClicks,
          trackingOpens: emailData.trackingOpens,
        })
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

    console.log(`Email send result:`, result)

    // Add rate limit headers to successful responses
    const response = NextResponse.json(result)
    response.headers.set("X-RateLimit-Limit", "10")
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString())
    response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString())

    return response
  } catch (error: any) {
    console.error("Email API POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to process email request",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
