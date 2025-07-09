import { type NextRequest, NextResponse } from "next/server"
import { securityMonitor, SecurityEventType } from "@/lib/security-monitor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cspReport = body["csp-report"]

    if (cspReport) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.CSP_VIOLATION,
        severity: "low" as any,
        source: request.nextUrl.pathname,
        details: {
          documentUri: cspReport["document-uri"],
          referrer: cspReport.referrer,
          violatedDirective: cspReport["violated-directive"],
          originalPolicy: cspReport["original-policy"],
          blockedUri: cspReport["blocked-uri"],
          statusCode: cspReport["status-code"],
        },
        userAgent: request.headers.get("user-agent") || undefined,
        ip: request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip,
      })
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("CSP report error:", error)
    return NextResponse.json({ status: "error" }, { status: 400 })
  }
}
