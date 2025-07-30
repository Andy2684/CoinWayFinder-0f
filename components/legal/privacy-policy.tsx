"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PrivacyPolicy() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "data-collection": true,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sections = [
    {
      id: "data-collection",
      title: "1. Information We Collect",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Personal Information</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Account Information:</strong> Name, email address, username, password, phone number, and profile
              picture
            </li>
            <li>
              <strong>Identity Verification:</strong> Government-issued ID, proof of address, and other KYC documents as
              required by law
            </li>
            <li>
              <strong>Financial Information:</strong> Bank account details, payment method information, and transaction
              history
            </li>
            <li>
              <strong>Trading Data:</strong> Portfolio holdings, trading history, bot configurations, and investment
              preferences
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Technical Information</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Device Information:</strong> IP address, browser type, operating system, device identifiers
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, time spent on platform, click patterns
            </li>
            <li>
              <strong>API Data:</strong> Exchange API keys (encrypted), trading bot performance metrics
            </li>
            <li>
              <strong>Communication Data:</strong> Support tickets, chat messages, email correspondence
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Third-Party Data</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Information from cryptocurrency exchanges when you connect your accounts</li>
            <li>Market data and news from financial data providers</li>
            <li>Social media information if you choose to link your accounts</li>
            <li>Credit and identity verification data from trusted third-party services</li>
          </ul>
        </div>
      ),
    },
    {
      id: "data-usage",
      title: "2. How We Use Your Information",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Service Provision</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Create and manage your account</li>
            <li>Execute trading operations and manage your portfolio</li>
            <li>Provide AI-powered trading recommendations and market analysis</li>
            <li>Process payments and manage subscriptions</li>
            <li>Deliver customer support and respond to inquiries</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Legal and Compliance</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Comply with KYC (Know Your Customer) and AML (Anti-Money Laundering) regulations</li>
            <li>Prevent fraud, money laundering, and other illegal activities</li>
            <li>Respond to legal requests and regulatory inquiries</li>
            <li>Maintain audit trails and transaction records as required by law</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Platform Improvement</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Analyze usage patterns to improve our services</li>
            <li>Develop new features and enhance existing functionality</li>
            <li>Personalize your experience and provide relevant content</li>
            <li>Conduct research and analytics for business purposes</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Communication</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Send important account notifications and security alerts</li>
            <li>Provide trading alerts and market updates (with your consent)</li>
            <li>Share product updates and new feature announcements</li>
            <li>Send marketing communications (you can opt out anytime)</li>
          </ul>
        </div>
      ),
    },
    {
      id: "data-sharing",
      title: "3. Information Sharing and Disclosure",
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>We never sell your personal information.</strong> We only share your data in the limited
              circumstances described below.
            </AlertDescription>
          </Alert>

          <h4 className="font-semibold text-gray-900 dark:text-white">Service Providers</h4>
          <p className="text-gray-700 dark:text-gray-300">
            We work with trusted third-party service providers who help us operate our platform:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Cloud hosting providers (AWS, Google Cloud) for data storage and processing</li>
            <li>Payment processors for handling transactions</li>
            <li>Identity verification services for KYC compliance</li>
            <li>Email and communication service providers</li>
            <li>Analytics and monitoring services</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Legal Requirements</h4>
          <p className="text-gray-700 dark:text-gray-300">We may disclose your information when required by law:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>To comply with legal obligations and regulatory requirements</li>
            <li>In response to valid legal requests from law enforcement</li>
            <li>To protect our rights, property, or safety, or that of our users</li>
            <li>In connection with legal proceedings or investigations</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Business Transfers</h4>
          <p className="text-gray-700 dark:text-gray-300">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new
            entity. We will notify you of any such change and your options regarding your data.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">With Your Consent</h4>
          <p className="text-gray-700 dark:text-gray-300">
            We may share your information with third parties when you explicitly consent, such as when connecting to
            external exchanges or sharing portfolio performance publicly.
          </p>
        </div>
      ),
    },
    {
      id: "data-security",
      title: "4. Data Security and Protection",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Technical Safeguards</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)
            </li>
            <li>
              <strong>Access Controls:</strong> Multi-factor authentication and role-based access controls
            </li>
            <li>
              <strong>Network Security:</strong> Firewalls, intrusion detection, and DDoS protection
            </li>
            <li>
              <strong>API Security:</strong> Rate limiting, API key encryption, and secure key storage
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Operational Security</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Regular security audits and penetration testing</li>
            <li>Employee background checks and security training</li>
            <li>Incident response procedures and breach notification protocols</li>
            <li>Data backup and disaster recovery systems</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Financial Security</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We never store your exchange passwords or private keys</li>
            <li>API keys are encrypted and stored securely with limited permissions</li>
            <li>All financial transactions are monitored for suspicious activity</li>
            <li>Cold storage recommendations for cryptocurrency holdings</li>
          </ul>

          <Alert>
            <AlertDescription>
              <strong>Security Incident Reporting:</strong> If you suspect any security issues with your account, please
              contact us immediately at security@coinwayfinder.com
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "user-rights",
      title: "5. Your Rights and Choices",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Data Access and Portability</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Access:</strong> Request a copy of all personal data we hold about you
            </li>
            <li>
              <strong>Portability:</strong> Export your data in a machine-readable format
            </li>
            <li>
              <strong>Transparency:</strong> Understand how your data is processed and shared
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Data Control</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Correction:</strong> Update or correct inaccurate personal information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)
            </li>
            <li>
              <strong>Restriction:</strong> Limit how we process your data in certain circumstances
            </li>
            <li>
              <strong>Objection:</strong> Object to processing based on legitimate interests
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Communication Preferences</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Opt out of marketing emails and promotional communications</li>
            <li>Customize notification preferences for trading alerts</li>
            <li>Choose your preferred communication channels</li>
            <li>Manage cookie and tracking preferences</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Account Management</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Update your profile information and preferences anytime</li>
            <li>Download your trading history and account data</li>
            <li>Close your account and request data deletion</li>
            <li>Manage connected exchange accounts and API permissions</li>
          </ul>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Exercise Your Rights</h5>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              To exercise any of these rights, please contact us at privacy@coinwayfinder.com or use the data management
              tools in your account settings. We will respond to your request within 30 days.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "international-transfers",
      title: "6. International Data Transfers",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            CoinWayFinder operates globally and may transfer your personal data to countries outside your residence. We
            ensure appropriate safeguards are in place for all international transfers.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white">Transfer Mechanisms</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Adequacy Decisions:</strong> Transfers to countries with adequate data protection laws
            </li>
            <li>
              <strong>Standard Contractual Clauses:</strong> EU-approved contracts ensuring data protection
            </li>
            <li>
              <strong>Binding Corporate Rules:</strong> Internal policies ensuring consistent data protection
            </li>
            <li>
              <strong>Certification Programs:</strong> Participation in recognized privacy frameworks
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Data Processing Locations</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Primary data centers in the United States and European Union</li>
            <li>Backup and disaster recovery facilities in multiple jurisdictions</li>
            <li>Customer support operations in various time zones</li>
            <li>Third-party service providers in countries with adequate protection</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Your Rights Regarding Transfers</h4>
          <p className="text-gray-700 dark:text-gray-300">
            You have the right to obtain information about international transfers of your data and to object to
            transfers in certain circumstances. Contact us for more details about specific transfers.
          </p>
        </div>
      ),
    },
    {
      id: "data-retention",
      title: "7. Data Retention",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We retain your personal data only as long as necessary for the purposes outlined in this policy and as
            required by applicable laws.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white">Retention Periods</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Data Type</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Retention Period</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Account Information</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    Duration of account + 7 years
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Legal compliance</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Trading Records</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">7 years after transaction</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Financial regulations</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">KYC Documents</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    5 years after account closure
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">AML compliance</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Usage Analytics</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">2 years</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Service improvement</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Support Communications</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">3 years</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Customer service</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Deletion Process</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Automated deletion based on retention schedules</li>
            <li>Secure data destruction using industry-standard methods</li>
            <li>Regular audits to ensure compliance with retention policies</li>
            <li>Manual review for data subject deletion requests</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Legal Hold</h4>
          <p className="text-gray-700 dark:text-gray-300">
            In some cases, we may need to retain data longer due to legal proceedings, regulatory investigations, or
            other legal obligations. We will notify you if your data is subject to a legal hold.
          </p>
        </div>
      ),
    },
    {
      id: "contact-info",
      title: "8. Contact Information",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Contacts
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>General Privacy:</strong>
                  <br />
                  <a href="mailto:privacy@coinwayfinder.com" className="text-blue-600 hover:underline">
                    privacy@coinwayfinder.com
                  </a>
                </div>
                <div>
                  <strong>Data Protection Officer:</strong>
                  <br />
                  <a href="mailto:dpo@coinwayfinder.com" className="text-blue-600 hover:underline">
                    dpo@coinwayfinder.com
                  </a>
                </div>
                <div>
                  <strong>Security Issues:</strong>
                  <br />
                  <a href="mailto:security@coinwayfinder.com" className="text-blue-600 hover:underline">
                    security@coinwayfinder.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Mailing Address
              </h4>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p>CoinWayFinder Inc.</p>
                <p>Attn: Privacy Officer</p>
                <p>123 Crypto Street, Suite 456</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Response Times</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• General inquiries: 2-3 business days</li>
              <li>• Data subject requests: 30 days (as required by law)</li>
              <li>• Security incidents: 24 hours</li>
              <li>• Urgent matters: Same business day</li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Regulatory Authorities</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              If you are not satisfied with our response to your privacy concerns, you have the right to lodge a
              complaint with your local data protection authority. For EU residents, you can find your local authority
              at{" "}
              <a
                href="https://edpb.europa.eu/about-edpb/board/members_en"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                edpb.europa.eu
              </a>
              .
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Effective Date:</strong> {new Date().toLocaleDateString()} | <strong>Last Updated:</strong>{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="mb-8 prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          At CoinWayFinder, we are committed to protecting your privacy and ensuring the security of your personal
          information. This Privacy Policy explains how we collect, use, share, and protect your data when you use our
          cryptocurrency trading platform and related services.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          This policy applies to all users of CoinWayFinder's website, mobile applications, APIs, and any other services
          we provide. By using our services, you agree to the collection and use of information in accordance with this
          policy.
        </p>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Collapsible key={section.id} open={openSections[section.id]} onOpenChange={() => toggleSection(section.id)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-6 h-auto text-left hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</span>
                {openSections[section.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6 border-l border-r border-b border-gray-200 dark:border-gray-700 rounded-b-lg -mt-1">
              <div className="pt-4">{section.content}</div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Policy Updates</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
            the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy
            periodically for any changes.
          </p>
        </div>
      </div>
    </div>
  )
}
