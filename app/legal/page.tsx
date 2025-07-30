import type { Metadata } from "next"
import { LegalLayout } from "@/components/legal/legal-layout"
import Link from "next/link"
import { FileText, Shield, Cookie, Lock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Legal Center - CoinWayFinder",
  description: "Access our legal documents including privacy policy, terms of service, and security guidelines.",
}

export default function LegalCenterPage() {
  const legalDocuments = [
    {
      title: "Privacy Policy",
      description: "Learn how we collect, use, and protect your personal information and trading data.",
      icon: Shield,
      href: "/legal/privacy",
      lastUpdated: new Date().toLocaleDateString(),
      keyPoints: [
        "Data collection practices",
        "User rights and choices",
        "International transfers",
        "Contact information",
      ],
    },
    {
      title: "Terms of Service",
      description: "Read our user agreement and understand the rules for using our trading platform.",
      icon: FileText,
      href: "/legal/terms",
      lastUpdated: new Date().toLocaleDateString(),
      keyPoints: ["Service description", "User obligations", "Trading risks", "Dispute resolution"],
    },
    {
      title: "Cookie Policy",
      description: "Understand how we use cookies and similar technologies to enhance your experience.",
      icon: Cookie,
      href: "/legal/cookies",
      lastUpdated: new Date().toLocaleDateString(),
      keyPoints: ["Cookie categories", "Third-party cookies", "Managing preferences", "Browser settings"],
    },
    {
      title: "Security Guidelines",
      description: "Learn about our security measures and best practices for protecting your account.",
      icon: Lock,
      href: "/legal/security",
      lastUpdated: new Date().toLocaleDateString(),
      keyPoints: ["Account security", "Trading protection", "Platform infrastructure", "Incident response"],
    },
  ]

  return (
    <LegalLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Legal Center</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Access all our legal documents and policies in one place. We believe in transparency and want you to
            understand how we operate and protect your rights.
          </p>
        </div>

        {/* Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {legalDocuments.map((doc) => {
            const Icon = doc.icon
            return (
              <Card key={doc.href} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>{doc.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{doc.description}</p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Key Topics:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {doc.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Updated: {doc.lastUpdated}</span>
                    <Link href={doc.href}>
                      <Button variant="outline" size="sm">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Contact Us</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>
                  <a href="mailto:legal@coinwayfinder.com" className="hover:text-blue-600">
                    legal@coinwayfinder.com
                  </a>
                </li>
                <li>
                  <a href="mailto:privacy@coinwayfinder.com" className="hover:text-blue-600">
                    privacy@coinwayfinder.com
                  </a>
                </li>
                <li>
                  <a href="mailto:security@coinwayfinder.com" className="hover:text-blue-600">
                    security@coinwayfinder.com
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Your Rights</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Data access and portability</li>
                <li>Account deletion requests</li>
                <li>Cookie preference management</li>
                <li>Security incident reporting</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Compliance</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>GDPR compliant</li>
                <li>CCPA compliant</li>
                <li>SOC 2 Type II certified</li>
                <li>ISO 27001 standards</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> These documents are regularly updated to reflect changes in our practices and legal
            requirements. We recommend reviewing them periodically. Material changes will be communicated via email and
            platform notifications.
          </p>
        </div>
      </div>
    </LegalLayout>
  )
}
