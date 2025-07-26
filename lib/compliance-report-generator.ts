import { sql } from "./database"

export interface ComplianceFramework {
  id: string
  name: string
  description: string
  version: string
  controls: ComplianceControl[]
}

export interface ComplianceControl {
  id: string
  name: string
  description: string
  category: string
  riskLevel: "critical" | "high" | "medium" | "low"
  implementationStatus: "implemented" | "partial" | "not_implemented"
  testResult: "pass" | "fail" | "not_tested"
  evidence: string[]
  recommendations: string[]
  lastAssessed?: string
  assessor?: string
}

export interface ComplianceReport {
  id: string
  frameworkId: string
  frameworkName: string
  reportDate: string
  assessor: string
  dateRange: {
    start: string
    end: string
  }
  summary: {
    overallScore: number
    totalControls: number
    compliantControls: number
    partialControls: number
    nonCompliantControls: number
    criticalFindings: number
    highFindings: number
    mediumFindings: number
    lowFindings: number
    riskLevel: "critical" | "high" | "medium" | "low"
  }
  controls: ComplianceControl[]
  findings: ComplianceFinding[]
  recommendations: ComplianceRecommendation[]
  executiveSummary: string
  nextAssessmentDate?: string
}

export interface ComplianceFinding {
  id: string
  controlId: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  impact: string
  recommendation: string
  status: "open" | "in_progress" | "resolved"
  assignee?: string
  dueDate?: string
  evidence: string[]
}

export interface ComplianceRecommendation {
  id: string
  priority: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  implementation: string
  timeline: string
  effort: "low" | "medium" | "high"
  dependencies: string[]
}

// Compliance frameworks with their controls
const COMPLIANCE_FRAMEWORKS: Record<string, ComplianceFramework> = {
  soc2: {
    id: "soc2",
    name: "SOC 2 Type II",
    description: "Service Organization Control 2 - Security, Availability, Processing Integrity, Confidentiality, and Privacy",
    version: "2017",
    controls: [
      {
        id: "CC1.1",
        name: "Integrity and Ethical Values",
        description: "The entity demonstrates a commitment to integrity and ethical values",
        category: "Control Environment",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "CC6.1",
        name: "Logical and Physical Access Controls",
        description: "The entity implements logical access security software, infrastructure, and architectures",
        category: "Logical and Physical Access Controls",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "CC8.1",
        name: "Change Management",
        description: "The entity authorizes, designs, develops, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures",
        category: "Change Management",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "CC2.1",
        name: "Internal Communication",
        description: "The entity communicates information internally, including objectives and responsibilities for internal control",
        category: "Communication and Information",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "CC3.1",
        name: "Risk Assessment Process",
        description: "The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks",
        category: "Risk Assessment",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "CC4.1",
        name: "Control Activities",
        description: "The entity selects and develops control activities that contribute to the mitigation of risks",
        category: "Control Activities",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "CC5.1",
        name: "Information and Communication",
        description: "The entity obtains or generates and uses relevant, quality information to support the functioning of internal control",
        category: "Information and Communication",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "CC7.1",
        name: "System Operations",
        description: "The entity restricts the logical access to system resources and information",
        category: "System Operations",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "CC9.1",
        name: "Risk Mitigation",
        description: "The entity identifies, selects, and implements risk mitigation activities",
        category: "Risk Mitigation",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "A1.1",
        name: "Availability Processing",
        description: "The entity maintains, monitors, and evaluates current processing capacity and use of system components",
        category: "Availability",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      }
    ]
  },
  gdpr: {
    id: "gdpr",
    name: "GDPR",
    description: "General Data Protection Regulation - EU Privacy Regulation",
    version: "2018",
    controls: [
      {
        id: "ART15",
        name: "Right of Access",
        description: "Data subjects have the right to obtain confirmation of whether personal data is being processed",
        category: "Individual Rights",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART17",
        name: "Right to Erasure",
        description: "Data subjects have the right to obtain erasure of personal data without undue delay",
        category: "Individual Rights",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART32",
        name: "Security of Processing",
        description: "Implement appropriate technical and organizational measures to ensure security of processing",
        category: "Security",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART33",
        name: "Notification of Breach",
        description: "Notify supervisory authority of personal data breach within 72 hours",
        category: "Breach Management",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART25",
        name: "Data Protection by Design",
        description: "Implement data protection principles by design and by default",
        category: "Privacy by Design",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART30",
        name: "Records of Processing",
        description: "Maintain records of processing activities under responsibility",
        category: "Documentation",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART35",
        name: "Data Protection Impact Assessment",
        description: "Carry out impact assessment where processing is likely to result in high risk",
        category: "Risk Assessment",
        riskLevel: "high",
        implementationStatus: "not_implemented",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART37",
        name: "Data Protection Officer",
        description: "Designate a data protection officer where required",
        category: "Governance",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART44",
        name: "International Transfers",
        description: "Ensure adequate level of protection for international transfers",
        category: "Data Transfers",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "ART83",
        name: "Administrative Fines",
        description: "Understand and mitigate risks of administrative fines",
        category: "Compliance",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      }
    ]
  },
  hipaa: {
    id: "hipaa",
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act - Healthcare Privacy and Security",
    version: "2013",
    controls: [
      {
        id: "164.308(a)(1)",
        name: "Security Officer",
        description: "Assign security responsibilities to an individual",
        category: "Administrative Safeguards",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.312(a)(1)",
        name: "Access Control",
        description: "Implement procedures for granting access to electronic PHI",
        category: "Technical Safeguards",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.312(b)",
        name: "Audit Controls",
        description: "Implement hardware, software, and procedural mechanisms for audit logs",
        category: "Technical Safeguards",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.312(c)(1)",
        name: "Integrity",
        description: "Protect electronic PHI from improper alteration or destruction",
        category: "Technical Safeguards",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.312(d)",
        name: "Person or Entity Authentication",
        description: "Verify that a person or entity seeking access is the one claimed",
        category: "Technical Safeguards",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.312(e)(1)",
        name: "Transmission Security",
        description: "Implement technical security measures for electronic PHI transmission",
        category: "Technical Safeguards",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.310(a)(1)",
        name: "Facility Access Controls",
        description: "Implement procedures to control physical access to facilities",
        category: "Physical Safeguards",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.310(b)",
        name: "Workstation Use",
        description: "Implement procedures for workstation use and access to electronic PHI",
        category: "Physical Safeguards",
        riskLevel: "medium",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.310(c)",
        name: "Device and Media Controls",
        description: "Implement procedures for receipt and removal of hardware and media",
        category: "Physical Safeguards",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "164.308(a)(5)",
        name: "Business Associate Contracts",
        description: "Obtain satisfactory assurances from business associates",
        category: "Administrative Safeguards",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      }
    ]
  },
  pci_dss: {
    id: "pci_dss",
    name: "PCI DSS",
    description: "Payment Card Industry Data Security Standard",
    version: "4.0",
    controls: [
      {
        id: "REQ1",
        name: "Install and Maintain Network Security Controls",
        description: "Install and maintain network security controls to protect the cardholder data environment",
        category: "Network Security",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ2",
        name: "Apply Secure Configurations",
        description: "Apply secure configurations to all system components",
        category: "System Configuration",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ3",
        name: "Protect Stored Account Data",
        description: "Protect stored account data",
        category: "Data Protection",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ4",
        name: "Protect Cardholder Data with Strong Cryptography",
        description: "Protect cardholder data with strong cryptography during transmission",
        category: "Cryptography",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ5",
        name: "Protect All Systems and Networks from Malicious Software",
        description: "Protect all systems and networks from malicious software",
        category: "Malware Protection",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ6",
        name: "Develop and Maintain Secure Systems and Software",
        description: "Develop and maintain secure systems and software",
        category: "Secure Development",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ7",
        name: "Restrict Access to System Components and Cardholder Data",
        description: "Restrict access to system components and cardholder data by business need to know",
        category: "Access Control",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ8",
        name: "Identify Users and Authenticate Access",
        description: "Identify users and authenticate access to system components",
        category: "Authentication",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ9",
        name: "Restrict Physical Access",
        description: "Restrict physical access to cardholder data",
        category: "Physical Security",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ10",
        name: "Log and Monitor All Access",
        description: "Log and monitor all access to system components and cardholder data",
        category: "Logging and Monitoring",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ11",
        name: "Test Security of Systems and Networks Regularly",
        description: "Test security of systems and networks regularly",
        category: "Security Testing",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "REQ12",
        name: "Support Information Security with Organizational Policies",
        description: "Support information security with organizational policies and programs",
        category: "Policy and Procedures",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      }
    ]
  },
  iso27001: {
    id: "iso27001",
    name: "ISO 27001",
    description: "International Standard for Information Security Management Systems",
    version: "2022",
    controls: [
      {
        id: "A.5.1",
        name: "Information Security Policies",
        description: "Information security policy and topic-specific policies",
        category: "Organizational Controls",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.6.1",
        name: "Screening",
        description: "Background verification checks on all candidates for employment",
        category: "People Controls",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.7.1",
        name: "Physical Security Perimeters",
        description: "Physical security perimeters for areas containing information and information processing facilities",
        category: "Physical and Environmental Controls",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.8.1",
        name: "User Endpoint Devices",
        description: "Information stored on, processed by or accessible via user endpoint devices",
        category: "Technology Controls",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.8.2",
        name: "Privileged Access Rights",
        description: "Allocation and use of privileged access rights",
        category: "Technology Controls",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.8.3",
        name: "Information Access Restriction",
        description: "Access to information and application system functions",
        category: "Technology Controls",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.8.4",
        name: "Access to Source Code",
        description: "Read and write access to source code, development tools and software libraries",
        category: "Technology Controls",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.8.5",
        name: "Secure Authentication",
        description: "Secure authentication technologies and procedures",
        category: "Technology Controls",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.8.6",
        name: "Capacity Management",
        description: "Monitoring, tuning and making projections of the capacity of resources",
        category: "Technology Controls",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "A.8.7",
        name: "Protection Against Malware",
        description: "Detection, prevention and recovery controls to protect against malware",
        category: "Technology Controls",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      }
    ]
  },
  nist: {
    id: "nist",
    name: "NIST Cybersecurity Framework",
    description: "National Institute of Standards and Technology Cybersecurity Framework",
    version: "2.0",
    controls: [
      {
        id: "ID.AM-1",
        name: "Physical devices and systems within the organization are inventoried",
        description: "Maintain an inventory of physical devices and systems",
        category: "Identify - Asset Management",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "PR.AC-1",
        name: "Identities and credentials are issued, managed, verified, revoked, and audited",
        description: "Identity and credential management processes",
        category: "Protect - Access Control",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "PR.DS-1",
        name: "Data-at-rest is protected",
        description: "Protection of data at rest through appropriate mechanisms",
        category: "Protect - Data Security",
        riskLevel: "critical",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "DE.AE-1",
        name: "A baseline of network operations and expected data flows is established",
        description: "Network baseline and monitoring capabilities",
        category: "Detect - Anomalies and Events",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "DE.CM-1",
        name: "The network is monitored to detect potential cybersecurity events",
        description: "Network monitoring for cybersecurity events",
        category: "Detect - Security Continuous Monitoring",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "RS.RP-1",
        name: "Response plan is executed during or after an incident",
        description: "Incident response plan execution",
        category: "Respond - Response Planning",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "RS.CO-1",
        name: "Personnel know their roles and order of operations when a response is needed",
        description: "Response roles and responsibilities",
        category: "Respond - Communications",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "RC.RP-1",
        name: "Recovery plan is executed during or after a cybersecurity incident",
        description: "Recovery plan execution",
        category: "Recover - Recovery Planning",
        riskLevel: "high",
        implementationStatus: "not_implemented",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "RC.IM-1",
        name: "Recovery plans incorporate lessons learned",
        description: "Lessons learned integration into recovery planning",
        category: "Recover - Improvements",
        riskLevel: "medium",
        implementationStatus: "not_implemented",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "RC.CO-1",
        name: "Public relations are managed",
        description: "Public relations and reputation management during recovery",
        category: "Recover - Communications",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      }
    ]
  },
  ccpa: {
    id: "ccpa",
    name: "CCPA",
    description: "California Consumer Privacy Act",
    version: "2020",
    controls: [
      {
        id: "1798.100",
        name: "Right to Know",
        description: "Consumers have the right to know what personal information is collected",
        category: "Consumer Rights",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.105",
        name: "Right to Delete",
        description: "Consumers have the right to delete personal information",
        category: "Consumer Rights",
        riskLevel: "high",
        implementationStatus: "partial",
        testResult: "fail",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.110",
        name: "Right to Know Categories",
        description: "Right to know categories of personal information collected",
        category: "Disclosure Requirements",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.115",
        name: "Right to Know Sources",
        description: "Right to know sources of personal information",
        category: "Disclosure Requirements",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.120",
        name: "Right to Opt-Out",
        description: "Right to opt-out of the sale of personal information",
        category: "Consumer Rights",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.125",
        name: "Non-Discrimination",
        description: "Prohibition on discriminating against consumers who exercise their rights",
        category: "Non-Discrimination",
        riskLevel: "high",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.130",
        name: "Notice at Collection",
        description: "Notice to consumers at or before the point of collection",
        category: "Notice Requirements",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.135",
        name: "Opt-Out Methods",
        description: "Methods for submitting requests to opt-out",
        category: "Request Processing",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.140",
        name: "Definitions",
        description: "Understanding and implementing CCPA definitions",
        category: "Definitions and Scope",
        riskLevel: "low",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      },
      {
        id: "1798.150",
        name: "Personal Information Categories",
        description: "Proper categorization of personal information",
        category: "Data Classification",
        riskLevel: "medium",
        implementationStatus: "implemented",
        testResult: "pass",
        evidence: [],
        recommendations: []
      }
    ]
  }
}

export class ComplianceReportGenerator {
  async generateReport(
    frameworkId: string,
    assessor: string,
    dateRange: { start: string; end: string }
  ): Promise<ComplianceReport> {
    const framework = COMPLIANCE_FRAMEWORKS[frameworkId]
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`)
    }

    // Assess controls based on audit logs and system data
    const assessedControls = await this.assessControls(framework.controls, dateRange)
    
    // Generate findings based on control assessments
    const findings = this.generateFindings(assessedControls)
    
    // Generate recommendations based on findings
    const recommendations = this.generateRecommendations(findings, assessedControls)
    
    // Calculate summary metrics
    const summary = this.calculateSummary(assessedControls, findings)
    
    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(framework, summary, findings)

    const report: ComplianceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      frameworkId: framework.id,
      frameworkName: framework.name,
      reportDate: new Date().toISOString(),
      assessor,
      dateRange,
      summary,
      controls: assessedControls,
      findings,
      recommendations,
      executiveSummary,
      nextAssessmentDate: this.calculateNextAssessmentDate()
    }

    return report
  }

  private async assessControls(
    controls: ComplianceControl[],
    dateRange: { start: string; end: string }
  ): Promise<ComplianceControl[]> {
    const assessedControls: ComplianceControl[] = []

    for (const control of controls) {
      const assessedControl = { ...control }
      
      // Assess control based on audit logs and system data
      const assessment = await this.assessIndividualControl(control, dateRange)
      
      assessedControl.implementationStatus = assessment.implementationStatus
      assessedControl.testResult = assessment.testResult
      assessedControl.evidence = assessment.evidence
      assessedControl.recommendations = assessment.recommendations
      assessedControl.lastAssessed = new Date().toISOString()
      
      assessedControls.push(assessedControl)
    }

    return assessedControls
  }

  private async assessIndividualControl(
    control: ComplianceControl,
    dateRange: { start: string; end: string }
  ): Promise<{
    implementationStatus: ComplianceControl['implementationStatus']
    testResult: ComplianceControl['testResult']
    evidence: string[]
    recommendations: string[]
  }> {
    // This would typically query audit logs, system configurations, etc.
    // For now, we'll use some basic logic based on control type and existing data
    
    try {
      // Query audit logs for evidence
      const auditLogs = await sql`
        SELECT event_type, event_description, created_at, success
        FROM audit_logs 
        WHERE created_at >= ${dateRange.start}::timestamp 
        AND created_at <= ${dateRange.end}::timestamp
        ORDER BY created_at DESC
        LIMIT 100
      `

      const evidence: string[] = []
      let implementationStatus: ComplianceControl['implementationStatus'] = 'implemented'
      let testResult: ComplianceControl['testResult'] = 'pass'
      const recommendations: string[] = []

      // Control-specific assessment logic
      if (control.id.includes('ACCESS') || control.id.includes('AC') || control.category.toLowerCase().includes('access')) {
        // Access control assessment
        const loginAttempts = auditLogs.filter(log => log.event_type.includes('login'))
        const failedLogins = loginAttempts.filter(log => !log.success)
        
        evidence.push(`${loginAttempts.length} login attempts recorded in assessment period`)
        evidence.push(`${failedLogins.length} failed login attempts detected`)
        
        if (failedLogins.length > loginAttempts.length * 0.1) {
          testResult = 'fail'
          implementationStatus = 'partial'
          recommendations.push('Review and strengthen access control mechanisms')
          recommendations.push('Implement additional monitoring for failed login attempts')
        }
      }

      if (control.id.includes('AUDIT') || control.id.includes('LOG') || control.category.toLowerCase().includes('audit')) {
        // Audit and logging assessment
        evidence.push(`${auditLogs.length} audit events recorded in assessment period`)
        
        if (auditLogs.length < 10) {
          testResult = 'fail'
          implementationStatus = 'partial'
          recommendations.push('Increase audit logging coverage')
          recommendations.push('Ensure all critical events are being logged')
        }
      }

      if (control.category.toLowerCase().includes('security') || control.category.toLowerCase().includes('protection')) {
        // Security control assessment
        const securityEvents = auditLogs.filter(log => 
          log.event_type.includes('security') || 
          log.event_type.includes('threat') ||
          log.event_type.includes('breach')
        )
        
        evidence.push(`${securityEvents.length} security-related events recorded`)
        
        if (securityEvents.some(event => !event.success)) {
          implementationStatus = 'partial'
          recommendations.push('Review and address security incidents')
          recommendations.push('Strengthen security monitoring and response procedures')
        }
      }

      // Default evidence if none found
      if (evidence.length === 0) {
        evidence.push('Control assessment completed based on system configuration review')
        evidence.push('No specific audit trail evidence available for this control')
      }

      return {
        implementationStatus,
        testResult,
        evidence,
        recommendations
      }
    } catch (error) {
      console.error('Error assessing control:', error)
      return {
        implementationStatus: 'not_implemented',
        testResult: 'not_tested',
        evidence: ['Assessment could not be completed due to system error'],
        recommendations: ['Manual review required for this control']
      }
    }
  }

  private generateFindings(controls: ComplianceControl[]): ComplianceFinding[] {
    const findings: ComplianceFinding[] = []

    controls.forEach(control => {
      if (control.testResult === 'fail' || control.implementationStatus !== 'implemented') {
        const finding: ComplianceFinding = {
          id: `finding_${control.id}_${Date.now()}`,
          controlId: control.id,
          severity: control.riskLevel,
          title: `${control.name} - Implementation Gap`,
          description: `Control ${control.id} (${control.name}) has been assessed as ${control.implementationStatus} with test result: ${control.testResult}`,
          impact: this.getImpactDescription(control.riskLevel),
          recommendation: control.recommendations.join('; ') || 'Review and implement proper controls',
          status: 'open',
          evidence: control.evidence,
          dueDate: this.calculateDueDate(control.riskLevel)
        }
        findings.push(finding)
      }
    })

    return findings
  }

  private generateRecommendations(findings: ComplianceFinding[], controls: ComplianceControl[]): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = []
    const priorityMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }

    // Group findings by severity and generate recommendations
    const criticalFindings = findings.filter(f => f.severity === 'critical')
    const highFindings = findings.filter(f => f.severity === 'high')
    const mediumFindings = findings.filter(f => f.severity === 'medium')
    const lowFindings = findings.filter(f => f.severity === 'low')

    if (criticalFindings.length > 0) {
      recommendations.push({
        id: `rec_critical_${Date.now()}`,
        priority: 'critical',
        title: 'Address Critical Security Controls',
        description: `${criticalFindings.length} critical control gaps identified that require immediate attention`,
        implementation: 'Implement missing critical controls, conduct security review, and establish monitoring',
        timeline: '1-2 weeks',
        effort: 'high',
        dependencies: ['Security team availability', 'Management approval', 'Technical resources']
      })
    }

    if (highFindings.length > 0) {
      recommendations.push({
        id: `rec_high_${Date.now()}`,
        priority: 'high',
        title: 'Strengthen High-Risk Controls',
        description: `${highFindings.length} high-risk control gaps need to be addressed to maintain compliance`,
        implementation: 'Review and enhance existing controls, implement additional safeguards',
        timeline: '2-4 weeks',
        effort: 'medium',
        dependencies: ['Process documentation', 'Staff training', 'System updates']
      })
    }

    if (mediumFindings.length > 0) {
      recommendations.push({
        id: `rec_medium_${Date.now()}`,
        priority: 'medium',
        title: 'Improve Medium-Risk Controls',
        description: `${mediumFindings.length} medium-risk areas identified for improvement`,
        implementation: 'Enhance documentation, improve processes, and implement best practices',
        timeline: '1-2 months',
        effort: 'medium',
        dependencies: ['Documentation updates', 'Process improvements']
      })
    }

    if (lowFindings.length > 0) {
      recommendations.push({
        id: `rec_low_${Date.now()}`,
        priority: 'low',
        title: 'Address Low-Risk Items',
        description: `${lowFindings.length} low-risk items for continuous improvement`,
        implementation: 'Update documentation, enhance monitoring, and implement minor improvements',
        timeline: '2-3 months',
        effort: 'low',
        dependencies: ['Documentation review', 'Process optimization']
      })
    }

    return recommendations.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority])
  }

  private calculateSummary(controls: ComplianceControl[], findings: ComplianceFinding[]) {
    const totalControls = controls.length
    const compliantControls = controls.filter(c => c.implementationStatus === 'implemented' && c.testResult === 'pass').length
    const partialControls = controls.filter(c => c.implementationStatus === 'partial').length
    const nonCompliantControls = controls.filter(c => c.implementationStatus === 'not_implemented' || c.testResult === 'fail').length

    const criticalFindings = findings.filter(f => f.severity === 'critical').length
    const highFindings = findings.filter(f => f.severity === 'high').length
    const mediumFindings = findings.filter(f => f.severity === 'medium').length
    const lowFindings = findings.filter(f => f.severity === 'low').length

    const overallScore = Math.round((compliantControls / totalControls) * 100)
    
    let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low'
    if (criticalFindings > 0 || overallScore < 60) riskLevel = 'critical'
    else if (highFindings > 2 || overallScore < 75) riskLevel = 'high'
    else if (mediumFindings > 3 || overallScore < 90) riskLevel = 'medium'

    return {
      overallScore,
      totalControls,
      compliantControls,
      partialControls,
      nonCompliantControls,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      riskLevel
    }
  }

  private generateExecutiveSummary(framework: ComplianceFramework, summary: any, findings: ComplianceFinding[]): string {
    return `
# Executive Summary - ${framework.name} Compliance Assessment

## Overall Assessment
This compliance assessment evaluated ${summary.totalControls} controls from the ${framework.name} framework. The organization achieved an overall compliance score of **${summary.overallScore}%** with a risk level of **${summary.riskLevel.toUpperCase()}**.

## Key Findings
- **${summary.compliantControls}** controls are fully compliant (${Math.round((summary.compliantControls / summary.totalControls) * 100)}%)
- **${summary.partialControls}** controls are partially compliant (${Math.round((summary.partialControls / summary.totalControls) * 100)}%)
- **${summary.nonCompliantControls}** controls are non-compliant (${Math.round((summary.nonCompliantControls / summary.totalControls) * 100)}%)

## Risk Assessment
${summary.criticalFindings > 0 ? `⚠️ **CRITICAL**: ${summary.criticalFindings} critical findings require immediate attention` : ''}
${summary.highFindings > 0 ? `🔴 **HIGH**: ${summary.highFindings} high-risk findings need prompt resolution` : ''}
${summary.mediumFindings > 0 ? `🟡 **MEDIUM**: ${summary.mediumFindings} medium-risk findings should be addressed` : ''}
${summary.lowFindings > 0 ? `🟢 **LOW**: ${summary.lowFindings} low-risk findings for continuous improvement` : ''}

## Recommendations
${summary.riskLevel === 'critical' ? 'Immediate action required to address critical compliance gaps. Focus on implementing missing security controls and establishing proper governance.' : ''}
${summary.riskLevel === 'high' ? 'Prompt attention needed to strengthen compliance posture. Prioritize high-risk findings and enhance existing controls.' : ''}
${summary.riskLevel === 'medium' ? 'Good compliance foundation with room for improvement. Focus on addressing medium-risk gaps and optimizing processes.' : ''}
${summary.riskLevel === 'low' ? 'Strong compliance posture maintained. Continue monitoring and address remaining low-risk items for continuous improvement.' : ''}

## Next Steps
1. Review detailed findings and assign ownership for remediation
2. Implement recommended controls based on priority levels
3. Schedule follow-up assessments to track progress
4. Update policies and procedures as needed
5. Conduct staff training on compliance requirements

*Assessment completed on ${new Date().toLocaleDateString()} by compliance team.*
    `.trim()
  }

  private getImpactDescription(riskLevel: string): string {
    switch (riskLevel) {
      case 'critical':
        return 'High impact to business operations, regulatory compliance, and organizational reputation. May result in significant fines, legal action, or business disruption.'
      case 'high':
        return 'Moderate to high impact on compliance posture and business operations. Could result in regulatory scrutiny and operational challenges.'
      case 'medium':
        return 'Moderate impact on compliance effectiveness. May lead to process inefficiencies and increased risk exposure.'
      case 'low':
        return 'Low impact on overall compliance. Represents opportunity for process improvement and risk reduction.'
      default:
        return 'Impact assessment pending review.'
    }
  }

  private calculateDueDate(riskLevel: string): string {
    const now = new Date()
    let daysToAdd = 90 // default for low risk

    switch (riskLevel) {
      case 'critical':
        daysToAdd = 7
        break
      case 'high':
        daysToAdd = 30
        break
      case 'medium':
        daysToAdd = 60
        break
      case 'low':
        daysToAdd = 90
        break
    }

    const dueDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
    return dueDate.toISOString()
  }

  private calculateNextAssessmentDate(): string {
    const now = new Date()
    const nextAssessment = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)) // 90 days from now
    return nextAssessment.toISOString()
  }

  async getAvailableFrameworks(): Promise<ComplianceFramework[]> {
    return Object.values(COMPLIANCE_FRAMEWORKS)
  }

  async getFramework(frameworkId: string): Promise<ComplianceFramework | null> {
    return COMPLIANCE_FRAMEWORKS[frameworkId] || null
  }
}

export const complianceReportGenerator = new ComplianceReportGenerator()
