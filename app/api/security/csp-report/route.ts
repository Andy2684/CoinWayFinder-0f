import { type NextRequest, NextResponse } from "next/server"
import { securityMonitor, SecurityEventType, SecuritySeverity } from "../../../../lib/security-monitor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cspReport = body["csp-report"] || body

    // Extract relevant information from CSP violation report
    const violationDetails = {
      documentUri: cspReport["document-uri"] || cspReport.documentURI,
      referrer: cspReport.referrer,
      blockedUri: cspReport["blocked-uri"] || cspReport.blockedURI,
      violatedDirective: cspReport["violated-directive"] || cspReport.violatedDirective,
      originalPolicy: cspReport["original-policy"] || cspReport.originalPolicy,
      disposition: cspReport.disposition,
      statusCode: cspReport["status-code"] || cspReport.statusCode,
      scriptSample: cspReport["script-sample"] || cspReport.scriptSample,
      lineNumber: cspReport["line-number"] || cspReport.lineNumber,
      columnNumber: cspReport["column-number"] || cspReport.columnNumber,
      sourceFile: cspReport["source-file"] || cspReport.sourceFile,
    }

    // Determine severity based on violation type
    let severity = SecuritySeverity.LOW
    const directive = violationDetails.violatedDirective?.toLowerCase() || ""

    if (directive.includes("script-src") || directive.includes("unsafe-eval")) {
      severity = SecuritySeverity.HIGH
    } else if (directive.includes("object-src") || directive.includes("base-uri")) {
      severity = SecuritySeverity.MEDIUM
    }

    // Log the CSP violation as a security event
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.CSP_VIOLATION,
      severity,
      source: violationDetails.documentUri || "unknown",
      ip: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: {
        cspViolation: true,
        ...violationDetails,
        timestamp: new Date().toISOString(),
      },
    })

    // Log to console for immediate visibility
    console.warn("🔒 CSP Violation:", {
      directive: violationDetails.violatedDirective,
      blockedUri: violationDetails.blockedUri,
      documentUri: violationDetails.documentUri,
      severity,
    })

    // Return 204 No Content as per CSP specification
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("❌ CSP report processing error:", error)

    // Log the error as a security event
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.CSP_VIOLATION,
      severity: SecuritySeverity.LOW,
      source: "csp-report-endpoint",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        processingFailed: true,
      },
    })

    // Still return 204 to not break CSP reporting
    return new NextResponse(null, { status: 204 })
  }
}

function getClientIP(request: NextRequest): string {
  // Try various headers to get the real client IP
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip")

  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(",")[0].trim()

  return "unknown"
}

// Handle GET requests (though CSP reports are typically POST)
export async function GET() {
  return NextResponse.json({
    message: "CSP Violation Reporting Endpoint",
    method: "POST",
    contentType: "application/csp-report",
    description: "This endpoint receives Content Security Policy violation reports",
  })
}
