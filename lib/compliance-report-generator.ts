import { sql } from "./database"

export interface ComplianceReport {
  id: string
  framework: ComplianceFramework
  title: string
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  status: "compliant" | "non-compliant" | "partial" | "needs-review"
  overallScore: number
  summary: ComplianceSummary
  controls: ComplianceControl[]
  findings: ComplianceFinding[]
  recommendations: ComplianceRecommendation[]
  evidence: ComplianceEvidence[]
  attestations: ComplianceAttestation[]
  riskAssessment: RiskAssessment
}

export type ComplianceFramework = "SOC2" | "GDPR" | "HIPAA" | "PCI_DSS" | "ISO27001" | "NIST" | "CCPA"

export interface ComplianceSummary {
  totalControls: number
  compliantControls: number
  nonCompliantControls: number
  partialControls: number
  notApplicableControls: number
  compliancePercentage: number
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
}

export interface ComplianceControl {
  id: string
  framework: ComplianceFramework
  category: string
  subcategory?: string
  title: string
  description: string
  requirement: string
  status: "compliant" | "non-compliant" | "partial" | "not-applicable" | "needs-review"
  implementationStatus: "implemented" | "partially-implemented" | "not-implemented" | "planned"
  lastAssessed: Date
  assessor: string
  evidence: string[]
  findings: string[]
  riskLevel: "critical" | "high" | "medium" | "low"
  remediationPlan?: string
  dueDate?: Date
  owner: string
  testResults: TestResult[]
}

export interface ComplianceFinding {
  id: string
  controlId: string
  type: "gap" | "deficiency" | "observation" | "exception"
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  impact: string
  recommendation: string
  status: "open" | "in-progress" | "resolved" | "accepted-risk"
  identifiedDate: Date
  targetResolutionDate?: Date
  actualResolutionDate?: Date
  owner: string
  evidence: string[]
}

export interface ComplianceRecommendation {
  id: string
  priority: "critical" | "high" | "medium" | "low"
  category: string
  title: string
  description: string
  implementation: string
  estimatedEffort: "low" | "medium" | "high"
  estimatedCost: "low" | "medium" | "high"
  expectedBenefit: string
  timeline: string
  dependencies: string[]
  owner: string
  status: "pending" | "approved" | "in-progress" | "completed" | "rejected"
}

export interface ComplianceEvidence {
  id: string
  controlId: string
  type: "document" | "screenshot" | "log" | "certificate" | "policy" | "procedure" | "test-result"
  title: string
  description: string
  filePath?: string
  url?: string
  collectedDate: Date
  validUntil?: Date
  collector: string
  verified: boolean
  verifiedBy?: string
  verifiedDate?: Date
}

export interface ComplianceAttestation {
  id: string
  framework: ComplianceFramework
  period: {
    start: Date
    end: Date
  }
  attestor: string
  role: string
  statement: string
  attestationDate: Date
  signature?: string
  limitations?: string[]
}

export interface RiskAssessment {
  overallRisk: "critical" | "high" | "medium" | "low"
  riskFactors: RiskFactor[]
  mitigationStrategies: string[]
  residualRisk: "critical" | "high" | "medium" | "low"
  riskTolerance: string
  nextReviewDate: Date
}

export interface RiskFactor {
  category: string
  description: string
  likelihood: "very-high" | "high" | "medium" | "low" | "very-low"
  impact: "very-high" | "high" | "medium" | "low" | "very-low"
  riskLevel: "critical" | "high" | "medium" | "low"
  mitigation: string
  owner: string
}

export interface TestResult {
  id: string
  testType: "automated" | "manual" | "interview" | "observation"
  testDate: Date
  tester: string
  result: "pass" | "fail" | "partial" | "not-tested"
  details: string
  evidence: string[]
  nextTestDate?: Date
}

class ComplianceReportGenerator {
  private frameworkControls: Record<ComplianceFramework, any[]> = {
    SOC2: [
      {
        id: "CC1.1",
        category: "Control Environment",
        title: "Integrity and Ethical Values",
        description: "The entity demonstrates a commitment to integrity and ethical values.",
        requirement:
          "Management establishes tone at the top and demonstrates commitment to integrity and ethical values through policies, procedures, and actions.",
      },
      {
        id: "CC1.2",
        category: "Control Environment",
        title: "Board Independence and Oversight",
        description: "The board of directors demonstrates independence and exercises oversight of system controls.",
        requirement:
          "Board provides oversight of management's design, implementation, and conduct of internal controls.",
      },
      {
        id: "CC2.1",
        category: "Communication and Information",
        title: "Internal Communication",
        description:
          "The entity obtains or generates and uses relevant, quality information to support the functioning of internal control.",
        requirement:
          "Management obtains relevant information and communicates internally to support internal control functioning.",
      },
      {
        id: "CC3.1",
        category: "Risk Assessment",
        title: "Risk Identification",
        description:
          "The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks.",
        requirement:
          "Management specifies objectives clearly to enable identification of risks to achievement of objectives.",
      },
      {
        id: "CC4.1",
        category: "Control Activities",
        title: "Control Design and Implementation",
        description: "The entity selects and develops control activities that contribute to the mitigation of risks.",
        requirement:
          "Management selects and develops control activities that contribute to mitigation of risks to acceptable levels.",
      },
      {
        id: "CC5.1",
        category: "Monitoring Activities",
        title: "Ongoing Monitoring",
        description:
          "The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether components of internal control are present and functioning.",
        requirement: "Management establishes ongoing monitoring activities and evaluates results.",
      },
      {
        id: "CC6.1",
        category: "Logical and Physical Access Controls",
        title: "Logical Access",
        description:
          "The entity implements logical access security software, infrastructure, and architectures over protected information assets.",
        requirement:
          "Logical access controls restrict access to information assets and protect against unauthorized access.",
      },
      {
        id: "CC6.2",
        category: "Logical and Physical Access Controls",
        title: "Physical Access",
        description: "The entity restricts physical access to facilities and protected information assets.",
        requirement: "Physical access controls restrict access to facilities, equipment, and information assets.",
      },
      {
        id: "CC7.1",
        category: "System Operations",
        title: "System Capacity and Performance",
        description: "The entity monitors system capacity and performance to meet processing requirements.",
        requirement: "System capacity and performance monitoring ensures processing requirements are met.",
      },
      {
        id: "CC8.1",
        category: "Change Management",
        title: "Change Authorization and Testing",
        description:
          "The entity authorizes, designs, develops, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.",
        requirement: "Changes are authorized, tested, and approved before implementation.",
      },
    ],
    GDPR: [
      {
        id: "GDPR.5",
        category: "Principles",
        title: "Data Processing Principles",
        description: "Personal data shall be processed lawfully, fairly and in a transparent manner.",
        requirement: "Implement lawful basis for processing and ensure transparency in data processing activities.",
      },
      {
        id: "GDPR.6",
        category: "Lawful Basis",
        title: "Lawfulness of Processing",
        description: "Processing shall be lawful only if and to the extent that at least one lawful basis applies.",
        requirement: "Establish and document lawful basis for all personal data processing activities.",
      },
      {
        id: "GDPR.7",
        category: "Consent",
        title: "Conditions for Consent",
        description: "Consent must be freely given, specific, informed and unambiguous.",
        requirement: "Implement consent mechanisms that meet GDPR requirements for validity.",
      },
      {
        id: "GDPR.12",
        category: "Transparency",
        title: "Transparent Information",
        description:
          "Information provided to data subjects must be concise, transparent, intelligible and easily accessible.",
        requirement: "Provide clear and accessible privacy notices and information to data subjects.",
      },
      {
        id: "GDPR.15",
        category: "Data Subject Rights",
        title: "Right of Access",
        description: "Data subjects have the right to obtain confirmation of processing and access to personal data.",
        requirement: "Implement processes to handle data subject access requests within required timeframes.",
      },
      {
        id: "GDPR.17",
        category: "Data Subject Rights",
        title: "Right to Erasure",
        description: "Data subjects have the right to obtain erasure of personal data without undue delay.",
        requirement: "Implement data deletion processes and respond to erasure requests appropriately.",
      },
      {
        id: "GDPR.25",
        category: "Data Protection by Design",
        title: "Data Protection by Design and by Default",
        description:
          "Implement appropriate technical and organisational measures to ensure data protection principles.",
        requirement: "Integrate data protection measures into system design and default settings.",
      },
      {
        id: "GDPR.32",
        category: "Security",
        title: "Security of Processing",
        description: "Implement appropriate technical and organisational measures to ensure security of processing.",
        requirement: "Implement encryption, access controls, and other security measures appropriate to the risk.",
      },
      {
        id: "GDPR.33",
        category: "Breach Notification",
        title: "Notification of Personal Data Breach",
        description: "Notify supervisory authority of personal data breaches within 72 hours.",
        requirement: "Implement breach detection and notification procedures meeting regulatory timeframes.",
      },
      {
        id: "GDPR.35",
        category: "Impact Assessment",
        title: "Data Protection Impact Assessment",
        description: "Conduct DPIA when processing is likely to result in high risk to rights and freedoms.",
        requirement: "Implement DPIA processes for high-risk processing activities.",
      },
    ],
    HIPAA: [
      {
        id: "164.308(a)(1)",
        category: "Administrative Safeguards",
        title: "Security Officer",
        description: "Assign security responsibilities to an individual.",
        requirement:
          "Designate a security officer responsible for developing and implementing security policies and procedures.",
      },
      {
        id: "164.308(a)(2)",
        category: "Administrative Safeguards",
        title: "Assigned Security Responsibilities",
        description: "Identify the security officer and assign security responsibilities.",
        requirement: "Assign security responsibilities to workforce members and ensure accountability.",
      },
      {
        id: "164.308(a)(3)",
        category: "Administrative Safeguards",
        title: "Workforce Training",
        description: "Implement procedures for authorizing access to electronic protected health information.",
        requirement: "Provide security awareness and training to workforce members.",
      },
      {
        id: "164.308(a)(4)",
        category: "Administrative Safeguards",
        title: "Information Access Management",
        description: "Implement procedures for granting access to electronic protected health information.",
        requirement: "Implement access management procedures including authorization, modification, and termination.",
      },
      {
        id: "164.308(a)(5)",
        category: "Administrative Safeguards",
        title: "Security Awareness and Training",
        description: "Implement security awareness and training program for all workforce members.",
        requirement: "Conduct periodic security updates and training on security policies and procedures.",
      },
      {
        id: "164.310(a)(1)",
        category: "Physical Safeguards",
        title: "Facility Access Controls",
        description: "Implement procedures to limit physical access to electronic information systems.",
        requirement: "Control physical access to facilities housing electronic protected health information.",
      },
      {
        id: "164.310(b)",
        category: "Physical Safeguards",
        title: "Workstation Use",
        description: "Implement procedures that govern the receipt and removal of hardware and electronic media.",
        requirement: "Implement controls for workstation use and access to electronic protected health information.",
      },
      {
        id: "164.312(a)(1)",
        category: "Technical Safeguards",
        title: "Access Control",
        description: "Implement technical policies and procedures for electronic information systems.",
        requirement:
          "Implement access controls including unique user identification, emergency access, and automatic logoff.",
      },
      {
        id: "164.312(b)",
        category: "Technical Safeguards",
        title: "Audit Controls",
        description:
          "Implement hardware, software, and procedural mechanisms for recording access to electronic protected health information.",
        requirement: "Implement audit controls to record and examine access and other activity in information systems.",
      },
      {
        id: "164.312(c)(1)",
        category: "Technical Safeguards",
        title: "Integrity",
        description:
          "Implement policies and procedures to protect electronic protected health information from improper alteration or destruction.",
        requirement:
          "Implement controls to ensure electronic protected health information is not improperly altered or destroyed.",
      },
    ],
    PCI_DSS: [
      {
        id: "PCI.1",
        category: "Network Security",
        title: "Install and maintain firewall configuration",
        description: "Install and maintain a firewall configuration to protect cardholder data.",
        requirement: "Establish firewall and router configuration standards and maintain secure network architecture.",
      },
      {
        id: "PCI.2",
        category: "Network Security",
        title: "Remove default passwords and security parameters",
        description: "Do not use vendor-supplied defaults for system passwords and other security parameters.",
        requirement:
          "Change default passwords and remove unnecessary default accounts before installing systems on the network.",
      },
      {
        id: "PCI.3",
        category: "Data Protection",
        title: "Protect stored cardholder data",
        description: "Protect stored cardholder data through encryption and other methods.",
        requirement: "Implement strong encryption and key management for protection of stored cardholder data.",
      },
      {
        id: "PCI.4",
        category: "Data Protection",
        title: "Encrypt transmission of cardholder data",
        description: "Encrypt transmission of cardholder data across open, public networks.",
        requirement: "Use strong cryptography and security protocols to safeguard cardholder data during transmission.",
      },
      {
        id: "PCI.5",
        category: "Vulnerability Management",
        title: "Protect against malware",
        description: "Protect all systems against malware and regularly update anti-virus software.",
        requirement: "Deploy anti-virus software on all systems commonly affected by malicious software.",
      },
      {
        id: "PCI.6",
        category: "Vulnerability Management",
        title: "Develop secure systems and applications",
        description: "Develop and maintain secure systems and applications.",
        requirement:
          "Establish processes to identify security vulnerabilities and protect systems from known vulnerabilities.",
      },
      {
        id: "PCI.7",
        category: "Access Control",
        title: "Restrict access by business need-to-know",
        description: "Restrict access to cardholder data by business need to know.",
        requirement:
          "Implement role-based access controls and limit access to cardholder data to those with legitimate business need.",
      },
      {
        id: "PCI.8",
        category: "Access Control",
        title: "Identify and authenticate access",
        description: "Identify and authenticate access to system components.",
        requirement:
          "Assign unique identification to each person with computer access and implement proper user authentication management.",
      },
      {
        id: "PCI.9",
        category: "Physical Security",
        title: "Restrict physical access",
        description: "Restrict physical access to cardholder data.",
        requirement:
          "Implement physical security controls to restrict access to systems and media containing cardholder data.",
      },
      {
        id: "PCI.10",
        category: "Monitoring",
        title: "Track and monitor access",
        description: "Track and monitor all access to network resources and cardholder data.",
        requirement:
          "Implement audit trails and log monitoring for all access to system components and cardholder data.",
      },
    ],
    ISO27001: [
      {
        id: "A.5.1",
        category: "Information Security Policies",
        title: "Information Security Policy",
        description:
          "Management direction and support for information security in accordance with business requirements.",
        requirement:
          "Establish, implement, maintain and continually improve an information security management system.",
      },
      {
        id: "A.6.1",
        category: "Organization of Information Security",
        title: "Information Security Roles and Responsibilities",
        description: "Ensure that information security responsibilities are defined and allocated.",
        requirement: "Define and allocate information security responsibilities and establish management commitment.",
      },
      {
        id: "A.7.1",
        category: "Human Resource Security",
        title: "Prior to Employment",
        description: "Ensure that employees understand their responsibilities and are suitable for the roles.",
        requirement: "Conduct background verification checks and establish terms and conditions of employment.",
      },
      {
        id: "A.8.1",
        category: "Asset Management",
        title: "Responsibility for Assets",
        description: "Identify organizational assets and define appropriate protection responsibilities.",
        requirement: "Maintain an inventory of assets and assign ownership and acceptable use responsibilities.",
      },
      {
        id: "A.9.1",
        category: "Access Control",
        title: "Business Requirements of Access Control",
        description: "Limit access to information and information processing facilities.",
        requirement: "Establish access control policy and procedures for secure access to information systems.",
      },
      {
        id: "A.10.1",
        category: "Cryptography",
        title: "Cryptographic Controls",
        description:
          "Ensure proper and effective use of cryptography to protect information confidentiality, authenticity and integrity.",
        requirement: "Develop and implement cryptographic policy and procedures for protection of information.",
      },
      {
        id: "A.11.1",
        category: "Physical and Environmental Security",
        title: "Secure Areas",
        description:
          "Prevent unauthorized physical access, damage and interference to information and information processing facilities.",
        requirement: "Define and implement physical security perimeters and physical entry controls.",
      },
      {
        id: "A.12.1",
        category: "Operations Security",
        title: "Operational Procedures and Responsibilities",
        description: "Ensure correct and secure operations of information processing facilities.",
        requirement: "Document and implement operational procedures and establish change management processes.",
      },
      {
        id: "A.13.1",
        category: "Communications Security",
        title: "Network Security Management",
        description:
          "Ensure the protection of information in networks and supporting information processing facilities.",
        requirement: "Implement network controls and security of network services to protect information in transit.",
      },
      {
        id: "A.14.1",
        category: "System Acquisition, Development and Maintenance",
        title: "Security Requirements of Information Systems",
        description:
          "Ensure that information security is an integral part of information systems across the entire lifecycle.",
        requirement: "Include security requirements in requirements for new information systems or enhancements.",
      },
    ],
    NIST: [
      {
        id: "ID.AM",
        category: "Identify - Asset Management",
        title: "Asset Management",
        description:
          "The data, personnel, devices, systems, and facilities that enable the organization to achieve business purposes are identified and managed.",
        requirement: "Develop and maintain asset inventories and establish asset management processes.",
      },
      {
        id: "ID.BE",
        category: "Identify - Business Environment",
        title: "Business Environment",
        description:
          "The organization's mission, objectives, stakeholders, and activities are understood and prioritized.",
        requirement:
          "Understand organizational context and establish risk management strategy aligned with business objectives.",
      },
      {
        id: "ID.GV",
        category: "Identify - Governance",
        title: "Governance",
        description:
          "The policies, procedures, and processes to manage and monitor the organization's regulatory, legal, risk, environmental, and operational requirements are understood.",
        requirement: "Establish governance framework and ensure compliance with applicable regulatory requirements.",
      },
      {
        id: "PR.AC",
        category: "Protect - Access Control",
        title: "Access Control",
        description:
          "Access to physical and logical assets and associated facilities is limited to authorized users, processes, and devices.",
        requirement: "Implement identity and access management controls including authentication and authorization.",
      },
      {
        id: "PR.AT",
        category: "Protect - Awareness and Training",
        title: "Awareness and Training",
        description:
          "The organization's personnel and partners are provided cybersecurity awareness education and are trained to perform their cybersecurity-related duties.",
        requirement: "Develop and implement cybersecurity awareness and training programs for all personnel.",
      },
      {
        id: "PR.DS",
        category: "Protect - Data Security",
        title: "Data Security",
        description:
          "Information and records are managed consistent with the organization's risk strategy to protect confidentiality, integrity, and availability.",
        requirement: "Implement data protection controls including encryption, backup, and data loss prevention.",
      },
      {
        id: "DE.AE",
        category: "Detect - Anomalies and Events",
        title: "Anomalies and Events",
        description: "Anomalous activity is detected and the potential impact of events is understood.",
        requirement: "Implement monitoring and detection capabilities to identify cybersecurity events and anomalies.",
      },
      {
        id: "RS.RP",
        category: "Respond - Response Planning",
        title: "Response Planning",
        description:
          "Response processes and procedures are executed and maintained to ensure response to detected cybersecurity incidents.",
        requirement: "Develop and maintain incident response plans and procedures for cybersecurity events.",
      },
      {
        id: "RC.RP",
        category: "Recover - Recovery Planning",
        title: "Recovery Planning",
        description:
          "Recovery processes and procedures are executed and maintained to ensure restoration of systems or assets affected by cybersecurity incidents.",
        requirement: "Develop and maintain recovery plans and procedures to restore normal operations after incidents.",
      },
    ],
    CCPA: [
      {
        id: "CCPA.1798.100",
        category: "Consumer Rights",
        title: "Right to Know",
        description: "Consumers have the right to know what personal information is collected about them.",
        requirement: "Provide clear disclosure of personal information collection, use, and sharing practices.",
      },
      {
        id: "CCPA.1798.105",
        category: "Consumer Rights",
        title: "Right to Delete",
        description: "Consumers have the right to request deletion of personal information.",
        requirement:
          "Implement processes to handle consumer deletion requests and delete personal information as required.",
      },
      {
        id: "CCPA.1798.110",
        category: "Consumer Rights",
        title: "Right to Access",
        description: "Consumers have the right to request access to their personal information.",
        requirement: "Provide consumers with access to their personal information in a readily useable format.",
      },
      {
        id: "CCPA.1798.115",
        category: "Consumer Rights",
        title: "Right to Opt-Out",
        description: "Consumers have the right to opt-out of the sale of their personal information.",
        requirement: "Provide clear opt-out mechanisms and honor consumer opt-out requests.",
      },
      {
        id: "CCPA.1798.120",
        category: "Consumer Rights",
        title: "Right to Non-Discrimination",
        description: "Consumers have the right not to be discriminated against for exercising their privacy rights.",
        requirement: "Ensure no discrimination against consumers who exercise their CCPA rights.",
      },
      {
        id: "CCPA.1798.130",
        category: "Business Obligations",
        title: "Notice at Collection",
        description: "Businesses must provide notice to consumers at or before the point of collection.",
        requirement: "Provide clear notice of personal information collection practices at the point of collection.",
      },
      {
        id: "CCPA.1798.135",
        category: "Business Obligations",
        title: "Opt-Out Methods",
        description: "Businesses must provide methods for consumers to opt-out of personal information sales.",
        requirement:
          "Implement and maintain clear opt-out methods including 'Do Not Sell My Personal Information' links.",
      },
    ],
  }

  async generateComplianceReport(
    framework: ComplianceFramework,
    startDate: Date,
    endDate: Date,
    assessor = "System Generated",
  ): Promise<ComplianceReport> {
    const reportId = `${framework.toLowerCase()}-${startDate.toISOString().split("T")[0]}-${Date.now()}`

    // Get framework-specific controls
    const frameworkControls = this.frameworkControls[framework] || []

    // Generate controls with current status
    const controls = await this.assessControls(framework, frameworkControls, startDate, endDate, assessor)

    // Generate findings based on control assessments
    const findings = await this.generateFindings(controls)

    // Generate recommendations
    const recommendations = await this.generateRecommendations(framework, controls, findings)

    // Collect evidence
    const evidence = await this.collectEvidence(controls, startDate, endDate)

    // Generate attestations
    const attestations = await this.generateAttestations(framework, startDate, endDate, assessor)

    // Perform risk assessment
    const riskAssessment = await this.performRiskAssessment(framework, controls, findings)

    // Calculate summary
    const summary = this.calculateSummary(controls, findings)

    // Determine overall status
    const status = this.determineComplianceStatus(summary)

    return {
      id: reportId,
      framework,
      title: `${framework} Compliance Report`,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      status,
      overallScore: summary.compliancePercentage,
      summary,
      controls,
      findings,
      recommendations,
      evidence,
      attestations,
      riskAssessment,
    }
  }

  private async assessControls(
    framework: ComplianceFramework,
    frameworkControls: any[],
    startDate: Date,
    endDate: Date,
    assessor: string,
  ): Promise<ComplianceControl[]> {
    const controls: ComplianceControl[] = []

    for (const control of frameworkControls) {
      // Assess each control based on available data
      const assessment = await this.assessControl(framework, control, startDate, endDate)

      controls.push({
        id: control.id,
        framework,
        category: control.category,
        subcategory: control.subcategory,
        title: control.title,
        description: control.description,
        requirement: control.requirement,
        status: assessment.status,
        implementationStatus: assessment.implementationStatus,
        lastAssessed: new Date(),
        assessor,
        evidence: assessment.evidence,
        findings: assessment.findings,
        riskLevel: assessment.riskLevel,
        remediationPlan: assessment.remediationPlan,
        dueDate: assessment.dueDate,
        owner: assessment.owner || "Security Team",
        testResults: assessment.testResults,
      })
    }

    return controls
  }

  private async assessControl(framework: ComplianceFramework, control: any, startDate: Date, endDate: Date) {
    // This would integrate with actual system data to assess control effectiveness
    // For now, we'll simulate assessment based on audit logs and security events

    try {
      // Check for relevant audit events
      const auditEvents = await sql`
        SELECT COUNT(*) as event_count, 
               COUNT(CASE WHEN success = false THEN 1 END) as failure_count
        FROM audit_logs 
        WHERE created_at >= ${startDate} 
          AND created_at <= ${endDate}
          AND (event_category LIKE ${`%${this.getControlCategory(framework, control.id)}%`}
               OR event_type LIKE ${`%${this.getControlCategory(framework, control.id)}%`})
      `

      const eventCount = Number.parseInt(auditEvents[0]?.event_count || "0")
      const failureCount = Number.parseInt(auditEvents[0]?.failure_count || "0")
      const successRate = eventCount > 0 ? ((eventCount - failureCount) / eventCount) * 100 : 100

      // Determine status based on success rate and control type
      let status: "compliant" | "non-compliant" | "partial" | "not-applicable" | "needs-review"
      let implementationStatus: "implemented" | "partially-implemented" | "not-implemented" | "planned"
      let riskLevel: "critical" | "high" | "medium" | "low"

      if (successRate >= 95) {
        status = "compliant"
        implementationStatus = "implemented"
        riskLevel = "low"
      } else if (successRate >= 80) {
        status = "partial"
        implementationStatus = "partially-implemented"
        riskLevel = "medium"
      } else if (successRate >= 60) {
        status = "non-compliant"
        implementationStatus = "partially-implemented"
        riskLevel = "high"
      } else {
        status = "non-compliant"
        implementationStatus = "not-implemented"
        riskLevel = "critical"
      }

      // Generate evidence references
      const evidence = [
        `Audit log analysis: ${eventCount} events, ${successRate.toFixed(1)}% success rate`,
        `Assessment period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      ]

      // Generate findings if non-compliant
      const findings = []
      if (status === "non-compliant" || status === "partial") {
        findings.push(`Control effectiveness below threshold: ${successRate.toFixed(1)}% success rate`)
      }

      // Generate remediation plan if needed
      let remediationPlan: string | undefined
      let dueDate: Date | undefined
      if (status === "non-compliant" || status === "partial") {
        remediationPlan = this.generateRemediationPlan(framework, control)
        dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }

      // Generate test results
      const testResults: TestResult[] = [
        {
          id: `test-${control.id}-${Date.now()}`,
          testType: "automated",
          testDate: new Date(),
          tester: "Compliance System",
          result: successRate >= 95 ? "pass" : successRate >= 80 ? "partial" : "fail",
          details: `Automated assessment based on audit log analysis. Success rate: ${successRate.toFixed(1)}%`,
          evidence: [`audit-logs-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}`],
          nextTestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        },
      ]

      return {
        status,
        implementationStatus,
        riskLevel,
        evidence,
        findings,
        remediationPlan,
        dueDate,
        owner: "Security Team",
        testResults,
      }
    } catch (error) {
      console.error(`Error assessing control ${control.id}:`, error)
      return {
        status: "needs-review" as const,
        implementationStatus: "not-implemented" as const,
        riskLevel: "medium" as const,
        evidence: ["Assessment failed - manual review required"],
        findings: ["Automated assessment could not be completed"],
        remediationPlan: "Manual assessment required",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        owner: "Security Team",
        testResults: [],
      }
    }
  }

  private getControlCategory(framework: ComplianceFramework, controlId: string): string {
    // Map control IDs to relevant audit log categories
    const categoryMappings: Record<string, string> = {
      // SOC2 mappings
      "CC6.1": "authentication",
      "CC6.2": "physical_access",
      "CC8.1": "change_management",

      // GDPR mappings
      "GDPR.15": "data_access",
      "GDPR.17": "data_deletion",
      "GDPR.32": "security",
      "GDPR.33": "breach",

      // HIPAA mappings
      "164.308(a)(4)": "access_management",
      "164.312(a)(1)": "access_control",
      "164.312(b)": "audit",

      // PCI DSS mappings
      "PCI.7": "access_control",
      "PCI.8": "authentication",
      "PCI.10": "monitoring",

      // ISO27001 mappings
      "A.9.1": "access_control",
      "A.12.1": "operations",
      "A.14.1": "development",

      // NIST mappings
      "PR.AC": "access_control",
      "DE.AE": "monitoring",
      "RS.RP": "incident_response",

      // CCPA mappings
      "CCPA.1798.105": "data_deletion",
      "CCPA.1798.110": "data_access",
    }

    return categoryMappings[controlId] || "general"
  }

  private generateRemediationPlan(framework: ComplianceFramework, control: any): string {
    const remediationPlans: Record<string, Record<string, string>> = {
      SOC2: {
        "CC6.1":
          "Implement multi-factor authentication, review access controls, and enhance user provisioning processes.",
        "CC6.2":
          "Strengthen physical access controls, implement visitor management, and review facility security measures.",
        "CC8.1":
          "Enhance change management procedures, implement automated testing, and improve change approval workflows.",
      },
      GDPR: {
        "GDPR.15": "Implement automated data subject access request handling and improve data inventory management.",
        "GDPR.17":
          "Enhance data deletion procedures, implement automated erasure capabilities, and improve data retention policies.",
        "GDPR.32": "Strengthen encryption implementation, enhance access controls, and improve security monitoring.",
        "GDPR.33":
          "Implement automated breach detection, improve incident response procedures, and enhance notification workflows.",
      },
      HIPAA: {
        "164.308(a)(4)":
          "Enhance access management procedures, implement role-based access controls, and improve user lifecycle management.",
        "164.312(a)(1)":
          "Implement stronger authentication mechanisms, enhance access controls, and improve session management.",
        "164.312(b)": "Enhance audit logging capabilities, implement log monitoring, and improve audit trail analysis.",
      },
      PCI_DSS: {
        "PCI.7":
          "Implement role-based access controls, enhance need-to-know restrictions, and improve access review processes.",
        "PCI.8":
          "Strengthen authentication mechanisms, implement multi-factor authentication, and enhance user management.",
        "PCI.10":
          "Enhance logging and monitoring capabilities, implement real-time alerting, and improve log analysis.",
      },
      ISO27001: {
        "A.9.1":
          "Develop comprehensive access control policy, implement access management procedures, and enhance access reviews.",
        "A.12.1":
          "Document operational procedures, implement change management, and enhance operational security controls.",
        "A.14.1":
          "Integrate security requirements into development lifecycle, implement secure coding practices, and enhance security testing.",
      },
      NIST: {
        "PR.AC":
          "Implement identity and access management framework, enhance authentication controls, and improve access governance.",
        "DE.AE": "Implement advanced threat detection, enhance monitoring capabilities, and improve anomaly detection.",
        "RS.RP":
          "Develop comprehensive incident response plan, enhance response procedures, and improve incident handling capabilities.",
      },
      CCPA: {
        "CCPA.1798.105":
          "Implement automated data deletion processes, enhance data subject request handling, and improve data inventory management.",
        "CCPA.1798.110":
          "Implement data portability mechanisms, enhance data access procedures, and improve consumer request handling.",
      },
    }

    return (
      remediationPlans[framework]?.[control.id] ||
      "Conduct detailed assessment and develop specific remediation plan based on identified gaps."
    )
  }

  private async generateFindings(controls: ComplianceControl[]): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = []

    for (const control of controls) {
      if (control.status === "non-compliant" || control.status === "partial") {
        for (const finding of control.findings) {
          findings.push({
            id: `finding-${control.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            controlId: control.id,
            type: control.status === "non-compliant" ? "gap" : "deficiency",
            severity: control.riskLevel,
            title: `${control.title} - Control Deficiency`,
            description: finding,
            impact: this.getImpactDescription(control.riskLevel),
            recommendation: control.remediationPlan || "Implement corrective measures to address control deficiency",
            status: "open",
            identifiedDate: new Date(),
            targetResolutionDate: control.dueDate,
            owner: control.owner,
            evidence: control.evidence,
          })
        }
      }
    }

    return findings
  }

  private getImpactDescription(riskLevel: string): string {
    const impacts = {
      critical: "Critical impact on compliance posture and business operations. Immediate remediation required.",
      high: "High impact on compliance and security. Remediation should be prioritized.",
      medium: "Moderate impact on compliance. Should be addressed in planned remediation cycle.",
      low: "Low impact on overall compliance posture. Can be addressed during routine maintenance.",
    }
    return impacts[riskLevel as keyof typeof impacts] || "Impact assessment required"
  }

  private async generateRecommendations(
    framework: ComplianceFramework,
    controls: ComplianceControl[],
    findings: ComplianceFinding[],
  ): Promise<ComplianceRecommendation[]> {
    const recommendations: ComplianceRecommendation[] = []

    // Generate recommendations based on findings
    const criticalFindings = findings.filter((f) => f.severity === "critical")
    const highFindings = findings.filter((f) => f.severity === "high")

    if (criticalFindings.length > 0) {
      recommendations.push({
        id: `rec-critical-${Date.now()}`,
        priority: "critical",
        category: "Immediate Action Required",
        title: "Address Critical Compliance Gaps",
        description: `${criticalFindings.length} critical compliance gaps identified that require immediate attention.`,
        implementation:
          "Implement emergency remediation procedures for all critical findings. Assign dedicated resources and establish daily progress reviews.",
        estimatedEffort: "high",
        estimatedCost: "high",
        expectedBenefit: "Restore compliance posture and eliminate critical risks to business operations.",
        timeline: "1-2 weeks",
        dependencies: ["Management approval", "Resource allocation", "Technical team availability"],
        owner: "Chief Security Officer",
        status: "pending",
      })
    }

    if (highFindings.length > 0) {
      recommendations.push({
        id: `rec-high-${Date.now()}`,
        priority: "high",
        category: "Security Enhancement",
        title: "Strengthen Security Controls",
        description: `${highFindings.length} high-priority security control improvements identified.`,
        implementation:
          "Develop and execute remediation plan for high-priority findings. Implement enhanced monitoring and controls.",
        estimatedEffort: "medium",
        estimatedCost: "medium",
        expectedBenefit: "Significantly improve compliance posture and reduce security risks.",
        timeline: "4-6 weeks",
        dependencies: ["Budget approval", "Technical resources", "Vendor coordination"],
        owner: "Security Team Lead",
        status: "pending",
      })
    }

    // Framework-specific recommendations
    const frameworkRecommendations = this.getFrameworkSpecificRecommendations(framework, controls)
    recommendations.push(...frameworkRecommendations)

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private getFrameworkSpecificRecommendations(
    framework: ComplianceFramework,
    controls: ComplianceControl[],
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = []

    switch (framework) {
      case "SOC2":
        recommendations.push({
          id: `rec-soc2-${Date.now()}`,
          priority: "medium",
          category: "SOC2 Enhancement",
          title: "Implement Continuous Monitoring",
          description: "Establish continuous monitoring capabilities to maintain SOC2 compliance throughout the year.",
          implementation:
            "Deploy automated monitoring tools, establish regular control testing schedules, and implement real-time alerting.",
          estimatedEffort: "medium",
          estimatedCost: "medium",
          expectedBenefit: "Maintain continuous compliance and reduce audit preparation time.",
          timeline: "8-12 weeks",
          dependencies: ["Tool selection", "Integration planning", "Staff training"],
          owner: "Compliance Manager",
          status: "pending",
        })
        break

      case "GDPR":
        recommendations.push({
          id: `rec-gdpr-${Date.now()}`,
          priority: "high",
          category: "Privacy Enhancement",
          title: "Enhance Data Subject Rights Management",
          description:
            "Implement automated systems for handling data subject requests and maintaining compliance with GDPR requirements.",
          implementation:
            "Deploy privacy management platform, automate request handling workflows, and enhance data mapping capabilities.",
          estimatedEffort: "high",
          estimatedCost: "high",
          expectedBenefit: "Streamline GDPR compliance and reduce manual effort for data subject requests.",
          timeline: "12-16 weeks",
          dependencies: ["Platform selection", "Data mapping", "Process redesign"],
          owner: "Data Protection Officer",
          status: "pending",
        })
        break

      case "HIPAA":
        recommendations.push({
          id: `rec-hipaa-${Date.now()}`,
          priority: "high",
          category: "Healthcare Security",
          title: "Strengthen PHI Protection Controls",
          description:
            "Enhance protection of Protected Health Information through improved access controls and monitoring.",
          implementation:
            "Implement advanced access controls, enhance audit logging, and deploy PHI-specific monitoring solutions.",
          estimatedEffort: "medium",
          estimatedCost: "medium",
          expectedBenefit: "Strengthen PHI protection and improve HIPAA compliance posture.",
          timeline: "6-8 weeks",
          dependencies: ["Healthcare IT team", "Compliance review", "Staff training"],
          owner: "HIPAA Security Officer",
          status: "pending",
        })
        break
    }

    return recommendations
  }

  private async collectEvidence(
    controls: ComplianceControl[],
    startDate: Date,
    endDate: Date,
  ): Promise<ComplianceEvidence[]> {
    const evidence: ComplianceEvidence[] = []

    for (const control of controls) {
      // Generate evidence entries for each control
      evidence.push({
        id: `evidence-${control.id}-${Date.now()}`,
        controlId: control.id,
        type: "log",
        title: `Audit Log Analysis for ${control.title}`,
        description: `Automated analysis of audit logs for control assessment during period ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        collectedDate: new Date(),
        collector: "Compliance System",
        verified: true,
        verifiedBy: "System",
        verifiedDate: new Date(),
      })

      // Add test result evidence
      for (const testResult of control.testResults) {
        evidence.push({
          id: `evidence-test-${testResult.id}`,
          controlId: control.id,
          type: "test-result",
          title: `${testResult.testType} Test Result`,
          description: testResult.details,
          collectedDate: testResult.testDate,
          collector: testResult.tester,
          verified: true,
          verifiedBy: testResult.tester,
          verifiedDate: testResult.testDate,
        })
      }
    }

    return evidence
  }

  private async generateAttestations(
    framework: ComplianceFramework,
    startDate: Date,
    endDate: Date,
    assessor: string,
  ): Promise<ComplianceAttestation[]> {
    return [
      {
        id: `attestation-${framework.toLowerCase()}-${Date.now()}`,
        framework,
        period: { start: startDate, end: endDate },
        attestor: assessor,
        role: "Compliance Assessor",
        statement: `I attest that this ${framework} compliance assessment has been conducted in accordance with applicable standards and represents an accurate evaluation of the organization's compliance posture for the period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`,
        attestationDate: new Date(),
        limitations: [
          "Assessment based on available audit logs and system data",
          "Manual verification may be required for certain controls",
          "Assessment reflects point-in-time evaluation",
        ],
      },
    ]
  }

  private async performRiskAssessment(
    framework: ComplianceFramework,
    controls: ComplianceControl[],
    findings: ComplianceFinding[],
  ): Promise<RiskAssessment> {
    const criticalControls = controls.filter((c) => c.riskLevel === "critical" && c.status !== "compliant")
    const highRiskControls = controls.filter((c) => c.riskLevel === "high" && c.status !== "compliant")
    const criticalFindings = findings.filter((f) => f.severity === "critical")
    const highFindings = findings.filter((f) => f.severity === "high")

    let overallRisk: "critical" | "high" | "medium" | "low"
    if (criticalControls.length > 0 || criticalFindings.length > 0) {
      overallRisk = "critical"
    } else if (highRiskControls.length > 2 || highFindings.length > 3) {
      overallRisk = "high"
    } else if (highRiskControls.length > 0 || highFindings.length > 0) {
      overallRisk = "medium"
    } else {
      overallRisk = "low"
    }

    const riskFactors: RiskFactor[] = []

    if (criticalControls.length > 0) {
      riskFactors.push({
        category: "Control Deficiencies",
        description: `${criticalControls.length} critical control(s) not compliant`,
        likelihood: "high",
        impact: "very-high",
        riskLevel: "critical",
        mitigation: "Immediate remediation of critical control deficiencies",
        owner: "Chief Security Officer",
      })
    }

    if (highRiskControls.length > 0) {
      riskFactors.push({
        category: "Security Controls",
        description: `${highRiskControls.length} high-risk control(s) require attention`,
        likelihood: "medium",
        impact: "high",
        riskLevel: "high",
        mitigation: "Prioritized remediation of high-risk controls",
        owner: "Security Team",
      })
    }

    return {
      overallRisk,
      riskFactors,
      mitigationStrategies: [
        "Implement immediate remediation for critical findings",
        "Establish continuous monitoring and assessment processes",
        "Enhance security awareness and training programs",
        "Regular review and update of security policies and procedures",
      ],
      residualRisk: overallRisk === "critical" ? "high" : overallRisk === "high" ? "medium" : "low",
      riskTolerance: "Low risk tolerance for compliance-related issues",
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    }
  }

  private calculateSummary(controls: ComplianceControl[], findings: ComplianceFinding[]): ComplianceSummary {
    const totalControls = controls.length
    const compliantControls = controls.filter((c) => c.status === "compliant").length
    const nonCompliantControls = controls.filter((c) => c.status === "non-compliant").length
    const partialControls = controls.filter((c) => c.status === "partial").length
    const notApplicableControls = controls.filter((c) => c.status === "not-applicable").length

    const compliancePercentage = totalControls > 0 ? Math.round((compliantControls / totalControls) * 100) : 0

    const criticalFindings = findings.filter((f) => f.severity === "critical").length
    const highFindings = findings.filter((f) => f.severity === "high").length
    const mediumFindings = findings.filter((f) => f.severity === "medium").length
    const lowFindings = findings.filter((f) => f.severity === "low").length

    return {
      totalControls,
      compliantControls,
      nonCompliantControls,
      partialControls,
      notApplicableControls,
      compliancePercentage,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
    }
  }

  private determineComplianceStatus(
    summary: ComplianceSummary,
  ): "compliant" | "non-compliant" | "partial" | "needs-review" {
    if (summary.criticalFindings > 0) {
      return "non-compliant"
    } else if (summary.compliancePercentage >= 95) {
      return "compliant"
    } else if (summary.compliancePercentage >= 80) {
      return "partial"
    } else {
      return "non-compliant"
    }
  }
}

export const complianceReportGenerator = new ComplianceReportGenerator()
