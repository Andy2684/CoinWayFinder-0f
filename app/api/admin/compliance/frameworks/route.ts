import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const frameworks = [
      {
        id: "SOC2",
        name: "SOC 2 Type II",
        description:
          "Service Organization Control 2 - Security, Availability, Processing Integrity, Confidentiality, and Privacy",
        category: "Security & Trust",
        applicability: "Service organizations, SaaS providers, cloud services",
        keyFocus: ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"],
        reportingPeriod: "Annual",
        controlCount: 10,
      },
      {
        id: "GDPR",
        name: "General Data Protection Regulation",
        description: "European Union regulation on data protection and privacy",
        category: "Privacy & Data Protection",
        applicability: "Organizations processing EU personal data",
        keyFocus: ["Data Protection", "Privacy Rights", "Consent Management", "Breach Notification"],
        reportingPeriod: "Ongoing",
        controlCount: 10,
      },
      {
        id: "HIPAA",
        name: "Health Insurance Portability and Accountability Act",
        description: "US healthcare data protection and privacy regulation",
        category: "Healthcare Privacy",
        applicability: "Healthcare organizations, business associates",
        keyFocus: ["PHI Protection", "Access Controls", "Audit Logging", "Risk Assessment"],
        reportingPeriod: "Annual",
        controlCount: 10,
      },
      {
        id: "PCI_DSS",
        name: "Payment Card Industry Data Security Standard",
        description: "Security standard for organizations handling credit card information",
        category: "Payment Security",
        applicability: "Organizations processing, storing, or transmitting cardholder data",
        keyFocus: ["Network Security", "Data Protection", "Access Control", "Monitoring"],
        reportingPeriod: "Annual",
        controlCount: 10,
      },
      {
        id: "ISO27001",
        name: "ISO/IEC 27001",
        description: "International standard for information security management systems",
        category: "Information Security",
        applicability: "All organizations seeking systematic approach to information security",
        keyFocus: ["ISMS", "Risk Management", "Security Controls", "Continuous Improvement"],
        reportingPeriod: "Annual",
        controlCount: 10,
      },
      {
        id: "NIST",
        name: "NIST Cybersecurity Framework",
        description: "Framework for improving critical infrastructure cybersecurity",
        category: "Cybersecurity",
        applicability: "Critical infrastructure, government agencies, enterprises",
        keyFocus: ["Identify", "Protect", "Detect", "Respond", "Recover"],
        reportingPeriod: "Ongoing",
        controlCount: 9,
      },
      {
        id: "CCPA",
        name: "California Consumer Privacy Act",
        description: "California state law enhancing privacy rights and consumer protection",
        category: "Privacy & Consumer Rights",
        applicability: "Businesses operating in California or serving California residents",
        keyFocus: ["Consumer Rights", "Data Transparency", "Opt-out Rights", "Non-discrimination"],
        reportingPeriod: "Ongoing",
        controlCount: 7,
      },
    ]

    return NextResponse.json({
      success: true,
      frameworks,
    })
  } catch (error) {
    console.error("Error fetching compliance frameworks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
