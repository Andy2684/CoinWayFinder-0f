"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Shield, Lock, AlertTriangle, CheckCircle, Eye, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function SecurityGuidelines() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "account-security": true,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sections = [
    {
      id: "account-security",
      title: "1. Account Security Best Practices",
      content: (
        <div className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security First:</strong> Your account security is our top priority. Follow these guidelines to
              keep your account and funds safe.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Strong Password Requirements
              </h4>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Minimum 12 characters long
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mix of uppercase and lowercase letters
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Include numbers and special characters
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Unique to CoinWayFinder (not reused)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Use a password manager
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Two-Factor Authentication (2FA)
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Enable 2FA for an additional layer of security:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 dark:text-blue-200">Authenticator App</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Recommended
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 dark:text-blue-200">SMS Backup</span>
                    <Badge variant="outline">Optional</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 dark:text-blue-200">Hardware Keys</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Advanced
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Account Security Checklist
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-yellow-800 dark:text-yellow-200">Strong unique password</span>
                </div>
                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-200">Two-factor authentication enabled</span>
                </div>
                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-200">Email verification completed</span>
                </div>
                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-200">Recovery codes saved securely</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-200">Regular password updates</span>
                </div>
                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-200">Login notifications enabled</span>
                </div>
                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-200">Trusted devices configured</span>
                </div>
                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-200">Security alerts subscribed</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-yellow-800 dark:text-yellow-200">Security Score</span>
                <span className="text-yellow-800 dark:text-yellow-200 font-semibold">6/8 (75%)</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "trading-security",
      title: "2. Trading Security Measures",
      content: (
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 dark:text-white">API Key Security</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h5 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Never Share
              </h5>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                <li>• API secret keys</li>
                <li>• Private keys or seed phrases</li>
                <li>• Account passwords</li>
                <li>• 2FA codes or backup codes</li>
                <li>• Session tokens</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Best Practices
              </h5>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Use read-only API keys when possible</li>
                <li>• Restrict API key permissions</li>
                <li>• Set IP address restrictions</li>
                <li>• Regularly rotate API keys</li>
                <li>• Monitor API key usage</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Exchange Connection Security</h4>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Supported Security Features</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h6 className="font-medium text-blue-900 dark:text-blue-100">Encrypted Storage</h6>
                  <p className="text-xs text-blue-800 dark:text-blue-200">AES-256 encryption</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h6 className="font-medium text-blue-900 dark:text-blue-100">Activity Monitoring</h6>
                  <p className="text-xs text-blue-800 dark:text-blue-200">Real-time alerts</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h6 className="font-medium text-blue-900 dark:text-blue-100">Permission Control</h6>
                  <p className="text-xs text-blue-800 dark:text-blue-200">Granular access</p>
                </div>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> We never store your exchange passwords or private keys. All API keys are
                encrypted and stored securely with minimal required permissions.
              </AlertDescription>
            </Alert>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Trading Bot Security</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Risk Management</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Set maximum position sizes</li>
                  <li>• Configure stop-loss orders</li>
                  <li>• Implement daily loss limits</li>
                  <li>• Use portfolio allocation limits</li>
                  <li>• Enable emergency stop features</li>
                </ul>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Monitoring & Alerts</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Real-time performance tracking</li>
                  <li>• Unusual activity detection</li>
                  <li>• Error and failure notifications</li>
                  <li>• Regular performance reports</li>
                  <li>• Manual override capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "platform-security",
      title: "3. Platform Security Infrastructure",
      content: (
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 dark:text-white">Technical Security Measures</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Data Encryption</h5>
              <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>• TLS 1.3 for data in transit</li>
                <li>• AES-256 for data at rest</li>
                <li>• End-to-end encryption</li>
                <li>• Encrypted database storage</li>
              </ul>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Network Security</h5>
              <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
                <li>• Web Application Firewall</li>
                <li>• DDoS protection</li>
                <li>• Intrusion detection systems</li>
                <li>• Rate limiting and throttling</li>
              </ul>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
              <h5 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">Access Control</h5>
              <ul className="text-sm text-teal-800 dark:text-teal-200 space-y-1">
                <li>• Multi-factor authentication</li>
                <li>• Role-based permissions</li>
                <li>• Session management</li>
                <li>• IP whitelisting options</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Security Monitoring</h4>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">24/7 Monitoring</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Real-time threat detection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Automated incident response
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Security event logging
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Anomaly detection algorithms
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Compliance & Auditing</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                    SOC 2 Type II compliance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                    Regular penetration testing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                    Third-party security audits
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                    Vulnerability assessments
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Updates:</strong> We continuously update our security measures and will notify users of
              any significant changes that may affect their accounts.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "incident-response",
      title: "4. Security Incident Response",
      content: (
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 dark:text-white">Incident Response Process</h4>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h5 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                If You Suspect a Security Breach
              </h5>
              <ol className="text-sm text-red-800 dark:text-red-200 space-y-2">
                <li>
                  <strong>1. Immediate Action:</strong> Change your password immediately and log out of all devices
                </li>
                <li>
                  <strong>2. Contact Us:</strong> Email security@coinwayfinder.com with details of the suspected breach
                </li>
                <li>
                  <strong>3. Secure Your Accounts:</strong> Check and secure your connected exchange accounts
                </li>
                <li>
                  <strong>4. Monitor Activity:</strong> Review recent account activity and trading history
                </li>
                <li>
                  <strong>5. Follow Up:</strong> Respond to any requests from our security team
                </li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Warning Signs</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Unexpected login notifications</li>
                  <li>• Unauthorized trading activity</li>
                  <li>• Changes to account settings</li>
                  <li>• Suspicious email communications</li>
                  <li>• Unusual API key activity</li>
                  <li>• Unexpected password reset emails</li>
                </ul>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Our Response</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Immediate investigation within 1 hour</li>
                  <li>• Account protection measures activated</li>
                  <li>• Forensic analysis of the incident</li>
                  <li>• Communication with affected users</li>
                  <li>• Regulatory notification if required</li>
                  <li>• Post-incident security improvements</li>
                </ul>
              </div>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Communication During Incidents</h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 mb-3">
              During a security incident, we will communicate with you through:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <h6 className="font-medium text-blue-900 dark:text-blue-100">Platform Alerts</h6>
                <p className="text-xs text-blue-800 dark:text-blue-200">In-app notifications</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <h6 className="font-medium text-blue-900 dark:text-blue-100">Email Updates</h6>
                <p className="text-xs text-blue-800 dark:text-blue-200">Direct communication</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <h6 className="font-medium text-blue-900 dark:text-blue-100">Status Page</h6>
                <p className="text-xs text-blue-800 dark:text-blue-200">Public updates</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "compliance",
      title: "5. Regulatory Compliance & Standards",
      content: (
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 dark:text-white">Compliance Framework</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h5 className="font-semibold text-green-900 dark:text-green-100 mb-3">Financial Regulations</h5>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Anti-Money Laundering (AML)</li>
                <li>• Know Your Customer (KYC)</li>
                <li>• Bank Secrecy Act (BSA)</li>
                <li>• FinCEN compliance</li>
                <li>• State money transmitter licenses</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Data Protection</h5>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• GDPR (European Union)</li>
                <li>• CCPA (California)</li>
                <li>• PIPEDA (Canada)</li>
                <li>• SOC 2 Type II</li>
                <li>• ISO 27001 standards</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Security Certifications</h4>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h6 className="font-semibold text-gray-900 dark:text-white">SOC 2</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Type II</p>
                </div>
              </div>
              <div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h6 className="font-semibold text-gray-900 dark:text-white">ISO 27001</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Certified</p>
                </div>
              </div>
              <div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h6 className="font-semibold text-gray-900 dark:text-white">PCI DSS</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Level 1</p>
                </div>
              </div>
              <div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h6 className="font-semibold text-gray-900 dark:text-white">GDPR</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Compliant</p>
                </div>
              </div>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Audit & Transparency</h4>
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Regular Audits</h5>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Annual third-party security audits</li>
                <li>• Quarterly penetration testing</li>
                <li>• Monthly vulnerability assessments</li>
                <li>• Continuous compliance monitoring</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Transparency Reports</h5>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Annual security and compliance report</li>
                <li>• Incident disclosure within 72 hours</li>
                <li>• Regular security blog updates</li>
                <li>• Public security documentation</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "user-responsibilities",
      title: "6. User Security Responsibilities",
      content: (
        <div className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Shared Responsibility:</strong> Security is a shared responsibility between CoinWayFinder and our
              users. Your actions play a crucial role in maintaining account security.
            </AlertDescription>
          </Alert>

          <h4 className="font-semibold text-gray-900 dark:text-white">Your Security Obligations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h5 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Account Management</h5>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Keep login credentials secure and confidential</li>
                <li>• Use strong, unique passwords</li>
                <li>• Enable and maintain 2FA</li>
                <li>• Regularly review account activity</li>
                <li>• Log out from shared or public devices</li>
                <li>• Keep contact information updated</li>
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h5 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Device Security</h5>
              <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                <li>• Keep devices updated with latest security patches</li>
                <li>• Use reputable antivirus software</li>
                <li>• Avoid public Wi-Fi for trading</li>
                <li>• Use secure, private networks</li>
                <li>• Enable device lock screens</li>
                <li>• Be cautious with browser extensions</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Common Security Threats</h4>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h5 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Phishing Attacks
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-medium text-red-900 dark:text-red-100 mb-2">Warning Signs:</h6>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    <li>• Urgent security warnings via email</li>
                    <li>• Requests for passwords or 2FA codes</li>
                    <li>• Suspicious links or attachments</li>
                    <li>• Misspelled domain names</li>
                    <li>• Unexpected account verification requests</li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-medium text-red-900 dark:text-red-100 mb-2">Protection Tips:</h6>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    <li>• Always verify sender authenticity</li>
                    <li>• Type URLs directly into browser</li>
                    <li>• Check for HTTPS and valid certificates</li>
                    <li>• Never share credentials via email</li>
                    <li>• Report suspicious communications</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Social Engineering</h5>
              <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                Attackers may impersonate CoinWayFinder staff or use social manipulation tactics:
              </p>
              <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>• We will never ask for passwords or 2FA codes</li>
                <li>• Verify identity through official channels</li>
                <li>• Be skeptical of urgent requests</li>
                <li>• Don't provide sensitive information over phone/email</li>
                <li>• Contact support directly if unsure</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Reporting Security Issues</h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 mb-3">
              If you discover a security vulnerability or have security concerns:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Contact Information:</h6>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>
                    <strong>Email:</strong> security@coinwayfinder.com
                  </li>
                  <li>
                    <strong>Response Time:</strong> Within 24 hours
                  </li>
                  <li>
                    <strong>PGP Key:</strong> Available on request
                  </li>
                </ul>
              </div>
              <div>
                <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Bug Bounty Program:</h6>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Rewards for valid security findings</li>
                  <li>• Responsible disclosure process</li>
                  <li>• Recognition for security researchers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Security Guidelines</h1>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()} | <strong>Version:</strong> 2.1
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="mb-8 prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Security is fundamental to everything we do at CoinWayFinder. These guidelines outline our comprehensive
          security measures and provide you with the knowledge and tools needed to protect your account and trading
          activities.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          By following these security best practices and understanding our platform's security features, you can trade
          with confidence knowing your assets and data are protected by industry-leading security measures.
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
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Security Resources</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Additional security resources and tools to help protect your account:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Security Checklist</Button>
            <Button size="sm" variant="outline">
              2FA Setup Guide
            </Button>
            <Button size="sm" variant="outline">
              Password Manager
            </Button>
            <Button size="sm" variant="outline">
              Report Security Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
