import { type NextRequest, NextResponse } from "next/server"
import { securityMonitor } from "@/lib/security-monitor"
import { getUserByEmail, verifyPassword } from "@/lib/user"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const user = await getUserByEmail(email)

  if (!user || !(await verifyPassword(password, user.password))) {
    // Log failed login attempt
    await securityMonitor.logSecurityEvent({
      userId: email,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      eventType: "failed_login",
      timestamp: new Date(),
      details: {
        email,
        reason: "Invalid credentials",
      },
    })

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  // Log successful login
  await securityMonitor.logSecurityEvent({
    userId: user.id,
    ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    eventType: "login_attempt",
    timestamp: new Date(),
    details: {
      email: user.email,
      success: true,
    },
  })

  return NextResponse.json({ message: "Login successful" }, { status: 200 })
}
