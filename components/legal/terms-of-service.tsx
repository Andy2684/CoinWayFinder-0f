"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, AlertTriangle, Shield, Gavel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TermsOfService() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    acceptance: true,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            By accessing or using CoinWayFinder's services, you agree to be bound by these Terms of Service ("Terms")
            and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited
            from using or accessing our services.
          </p>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> These terms constitute a legally binding agreement between you and
              CoinWayFinder Inc. Please read them carefully.
            </AlertDescription>
          </Alert>

          <h4 className="font-semibold text-gray-900 dark:text-white">Who Can Use Our Services</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>You must be at least 18 years old or the age of majority in your jurisdiction</li>
            <li>You must have the legal capacity to enter into binding agreements</li>
            <li>You must not be prohibited from using our services under applicable laws</li>
            <li>You must not be located in a restricted jurisdiction (see Section 3)</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Agreement Updates</h4>
          <p className="text-gray-700 dark:text-gray-300">
            We reserve the right to modify these Terms at any time. Material changes will be communicated via email or
            platform notification at least 30 days before taking effect. Continued use of our services after changes
            constitutes acceptance of the new terms.
          </p>
        </div>
      ),
    },
    {
      id: "services",
      title: "2. Description of Services",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            CoinWayFinder provides a comprehensive cryptocurrency trading platform that includes:
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white">Core Services</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>AI-Powered Trading Bots:</strong> Automated trading algorithms and strategies
            </li>
            <li>
              <strong>Portfolio Management:</strong> Tools for tracking and managing cryptocurrency investments
            </li>
            <li>
              <strong>Market Analysis:</strong> Real-time market data, charts, and analytical tools
            </li>
            <li>
              <strong>News and Sentiment Analysis:</strong> Aggregated news and market sentiment indicators
            </li>
            <li>
              <strong>Exchange Integration:</strong> Connectivity to major cryptocurrency exchanges
            </li>
            <li>
              <strong>Risk Management:</strong> Tools for setting stop-losses, take-profits, and risk parameters
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Service Availability</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
            <li>Scheduled maintenance will be announced in advance when possible</li>
            <li>Emergency maintenance may occur without prior notice</li>
            <li>Some features may be temporarily unavailable during updates</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Third-Party Integrations</h4>
          <p className="text-gray-700 dark:text-gray-300">
            Our platform integrates with third-party services including cryptocurrency exchanges, data providers, and
            payment processors. We are not responsible for the availability, accuracy, or reliability of these
            third-party services.
          </p>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Beta Features:</strong> Some features may be in beta testing. Beta features are provided "as is"
              and may have limited functionality or reliability.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "eligibility",
      title: "3. Eligibility and Restrictions",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Geographic Restrictions</h4>
          <p className="text-gray-700 dark:text-gray-300">
            Our services are not available to residents of the following jurisdictions:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Countries subject to comprehensive US sanctions (Iran, North Korea, Syria, etc.)</li>
            <li>Jurisdictions where cryptocurrency trading is prohibited</li>
            <li>Regions where we do not have proper regulatory authorization</li>
            <li>Any jurisdiction where offering our services would violate local laws</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Identity Verification</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>All users must complete Know Your Customer (KYC) verification</li>
            <li>You must provide accurate and up-to-date identification documents</li>
            <li>Enhanced verification may be required for higher-tier services</li>
            <li>We reserve the right to request additional verification at any time</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Prohibited Users</h4>
          <p className="text-gray-700 dark:text-gray-300">You may not use our services if you are:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Listed on any government sanctions or watch lists</li>
            <li>A politically exposed person (PEP) without proper disclosure</li>
            <li>Acting on behalf of a prohibited entity or jurisdiction</li>
            <li>Previously banned from our platform for terms violations</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Account Limitations</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>One account per person or entity</li>
            <li>No sharing of account credentials</li>
            <li>No automated account creation or management</li>
            <li>Compliance with all applicable trading limits</li>
          </ul>
        </div>
      ),
    },
    {
      id: "user-obligations",
      title: "4. User Obligations and Conduct",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Account Security</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Enable two-factor authentication when available</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Use strong, unique passwords for your account</li>
            <li>Keep your contact information current and accurate</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Prohibited Activities</h4>
          <p className="text-gray-700 dark:text-gray-300">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Use our services for any illegal or unauthorized purpose</li>
            <li>Engage in market manipulation, wash trading, or other fraudulent activities</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
            <li>Reverse engineer, decompile, or disassemble our software</li>
            <li>Use automated systems to access our services without permission</li>
            <li>Transmit viruses, malware, or other harmful code</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Trading Conduct</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Trade only with funds you can afford to lose</li>
            <li>Understand the risks associated with cryptocurrency trading</li>
            <li>Comply with all applicable tax obligations</li>
            <li>Not engage in activities that could harm market integrity</li>
            <li>Report suspicious activities to our compliance team</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Content and Communications</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Do not post offensive, defamatory, or inappropriate content</li>
            <li>Respect other users and maintain professional conduct</li>
            <li>Do not share misleading or false information</li>
            <li>Comply with our community guidelines</li>
          </ul>

          <Alert>
            <Gavel className="h-4 w-4" />
            <AlertDescription>
              <strong>Enforcement:</strong> Violation of these obligations may result in account suspension,
              termination, or legal action.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "trading-risks",
      title: "5. Trading Risks and Disclaimers",
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>High Risk Warning:</strong> Cryptocurrency trading involves substantial risk of loss and is not
              suitable for all investors. You should carefully consider whether trading is appropriate for you.
            </AlertDescription>
          </Alert>

          <h4 className="font-semibold text-gray-900 dark:text-white">Market Risks</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Volatility:</strong> Cryptocurrency prices can fluctuate dramatically
            </li>
            <li>
              <strong>Liquidity:</strong> Some markets may have limited liquidity
            </li>
            <li>
              <strong>Market Manipulation:</strong> Cryptocurrency markets may be subject to manipulation
            </li>
            <li>
              <strong>Regulatory Changes:</strong> Government regulations may impact market conditions
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Technology Risks</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>System Failures:</strong> Technical issues may prevent trading or access to funds
            </li>
            <li>
              <strong>Cybersecurity:</strong> Risk of hacking, theft, or unauthorized access
            </li>
            <li>
              <strong>Software Bugs:</strong> Trading algorithms may contain errors or unexpected behavior
            </li>
            <li>
              <strong>Network Issues:</strong> Internet or blockchain network problems may affect transactions
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">AI and Algorithm Risks</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>AI trading bots may not perform as expected</li>
            <li>Past performance does not guarantee future results</li>
            <li>Algorithms may fail to adapt to changing market conditions</li>
            <li>Machine learning models may produce unexpected outcomes</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Regulatory and Legal Risks</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Cryptocurrency regulations are evolving and uncertain</li>
            <li>Tax implications may be complex and subject to change</li>
            <li>Legal status of cryptocurrencies varies by jurisdiction</li>
            <li>Compliance requirements may change without notice</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">No Investment Advice</h4>
          <p className="text-gray-700 dark:text-gray-300">
            CoinWayFinder does not provide investment advice. All information provided is for educational and
            informational purposes only. You should consult with qualified financial advisors before making investment
            decisions.
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h5 className="font-semibold text-red-900 dark:text-red-100 mb-2">Risk Acknowledgment</h5>
            <p className="text-red-800 dark:text-red-200 text-sm">
              By using our services, you acknowledge that you understand these risks and agree to trade at your own
              risk. You should never trade with money you cannot afford to lose.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "fees-payments",
      title: "6. Fees and Payments",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Subscription Fees</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Plan</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Monthly Fee</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Annual Fee</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Features</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Free</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$0</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$0</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    Basic features, limited bots
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Starter</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$29</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$290</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    5 active bots, basic analytics
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Pro</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$99</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$990</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    Unlimited bots, advanced features
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Enterprise</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Custom</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Custom</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    Custom solutions, dedicated support
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Additional Fees</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Exchange Fees:</strong> Fees charged by connected exchanges (not controlled by CoinWayFinder)
            </li>
            <li>
              <strong>Network Fees:</strong> Blockchain transaction fees for cryptocurrency transfers
            </li>
            <li>
              <strong>Premium Data:</strong> Additional charges for premium market data feeds
            </li>
            <li>
              <strong>API Usage:</strong> Fees for high-volume API usage beyond included limits
            </li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Payment Terms</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Subscription fees are billed in advance</li>
            <li>Annual subscriptions receive a discount compared to monthly billing</li>
            <li>All fees are non-refundable except as required by law</li>
            <li>We accept major credit cards and cryptocurrency payments</li>
            <li>Failed payments may result in service suspension</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Fee Changes</h4>
          <p className="text-gray-700 dark:text-gray-300">
            We reserve the right to change our fees with 30 days' notice. Existing subscribers will be notified of fee
            changes and may cancel their subscription before the new fees take effect.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Taxes</h4>
          <p className="text-gray-700 dark:text-gray-300">
            You are responsible for all applicable taxes related to your use of our services. Fees may be subject to VAT
            or other taxes depending on your location.
          </p>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      title: "7. Intellectual Property",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Our Rights</h4>
          <p className="text-gray-700 dark:text-gray-300">
            CoinWayFinder and its licensors own all rights, title, and interest in and to the platform, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Software, algorithms, and trading strategies</li>
            <li>User interface designs and layouts</li>
            <li>Trademarks, logos, and brand elements</li>
            <li>Documentation, tutorials, and educational content</li>
            <li>Data aggregation and analysis methodologies</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">License to Use</h4>
          <p className="text-gray-700 dark:text-gray-300">
            We grant you a limited, non-exclusive, non-transferable license to use our services for their intended
            purpose. This license does not include the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Copy, modify, or create derivative works</li>
            <li>Reverse engineer or decompile our software</li>
            <li>Remove or alter proprietary notices</li>
            <li>Use our intellectual property for commercial purposes</li>
            <li>Sublicense or transfer your rights to others</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">User Content</h4>
          <p className="text-gray-700 dark:text-gray-300">
            You retain ownership of content you create or upload to our platform. However, you grant us a worldwide,
            royalty-free license to use, display, and distribute your content as necessary to provide our services.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Third-Party Content</h4>
          <p className="text-gray-700 dark:text-gray-300">
            Our platform may include content from third parties, including market data, news, and analysis. This content
            is owned by its respective owners and is used under license.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">DMCA Policy</h4>
          <p className="text-gray-700 dark:text-gray-300">
            We respect intellectual property rights and will respond to valid DMCA takedown notices. If you believe your
            copyright has been infringed, please contact us at legal@coinwayfinder.com.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Trademark Policy</h4>
          <p className="text-gray-700 dark:text-gray-300">
            You may not use our trademarks, logos, or brand elements without our written permission. Any unauthorized
            use may result in legal action.
          </p>
        </div>
      ),
    },
    {
      id: "termination",
      title: "8. Account Termination",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Termination by You</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>You may close your account at any time through your account settings</li>
            <li>Account closure does not automatically cancel active subscriptions</li>
            <li>You must separately cancel any recurring payments</li>
            <li>We will retain certain data as required by law or regulation</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Termination by Us</h4>
          <p className="text-gray-700 dark:text-gray-300">We may suspend or terminate your account if:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>You violate these Terms of Service</li>
            <li>You engage in fraudulent or illegal activities</li>
            <li>Your account poses a security risk</li>
            <li>You fail to pay required fees</li>
            <li>We are required to do so by law or regulation</li>
            <li>We discontinue our services</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Notice and Appeal Process</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We will provide notice of termination when possible</li>
            <li>You may appeal termination decisions through our support system</li>
            <li>Emergency terminations may occur without prior notice</li>
            <li>We will explain the reason for termination when legally permissible</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Effects of Termination</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Your access to the platform will be immediately revoked</li>
            <li>Active trading bots will be stopped</li>
            <li>You will lose access to historical data and analytics</li>
            <li>Subscription fees are generally non-refundable</li>
            <li>You remain liable for any outstanding obligations</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Data Retention After Termination</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We will retain your data as required by applicable laws and regulations</li>
            <li>Trading records will be kept for regulatory compliance purposes</li>
            <li>Personal data will be deleted according to our Privacy Policy</li>
            <li>You may request data export before account closure</li>
          </ul>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Ensure you have exported any important data before closing your account, as
              some information may not be recoverable after termination.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "liability",
      title: "9. Limitation of Liability",
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> To the maximum extent permitted by law, CoinWayFinder disclaims all
              warranties and limits its liability as described below.
            </AlertDescription>
          </Alert>

          <h4 className="font-semibold text-gray-900 dark:text-white">Service Disclaimer</h4>
          <p className="text-gray-700 dark:text-gray-300">
            Our services are provided "as is" and "as available" without warranties of any kind, either express or
            implied, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Merchantability or fitness for a particular purpose</li>
            <li>Accuracy, reliability, or completeness of information</li>
            <li>Uninterrupted or error-free operation</li>
            <li>Security or freedom from viruses or harmful components</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Limitation of Damages</h4>
          <p className="text-gray-700 dark:text-gray-300">
            To the maximum extent permitted by law, CoinWayFinder shall not be liable for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Loss of profits, revenue, data, or business opportunities</li>
            <li>Trading losses or investment damages</li>
            <li>Damages resulting from third-party actions or services</li>
            <li>Damages exceeding the fees paid to us in the preceding 12 months</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Indemnification</h4>
          <p className="text-gray-700 dark:text-gray-300">
            You agree to indemnify and hold harmless CoinWayFinder and its affiliates from any claims, damages, or
            expenses arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Your use of our services</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of applicable laws</li>
            <li>Your infringement of third-party rights</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Force Majeure</h4>
          <p className="text-gray-700 dark:text-gray-300">
            We shall not be liable for any failure to perform due to circumstances beyond our reasonable control,
            including natural disasters, government actions, network failures, or other force majeure events.
          </p>
        </div>
      ),
    },
    {
      id: "governing-law",
      title: "10. Governing Law and Dispute Resolution",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Governing Law</h4>
          <p className="text-gray-700 dark:text-gray-300">
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United
            States, without regard to its conflict of law principles.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Dispute Resolution Process</h4>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Informal Resolution:</strong> Contact our support team to attempt resolution
            </li>
            <li>
              <strong>Mediation:</strong> If informal resolution fails, disputes may be submitted to mediation
            </li>
            <li>
              <strong>Arbitration:</strong> Binding arbitration through the American Arbitration Association
            </li>
            <li>
              <strong>Court Proceedings:</strong> Only for injunctive relief or intellectual property disputes
            </li>
          </ol>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Arbitration Agreement</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Most disputes will be resolved through binding arbitration</li>
            <li>Arbitration will be conducted in San Francisco, California</li>
            <li>The arbitrator's decision will be final and binding</li>
            <li>You waive the right to participate in class action lawsuits</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Exceptions to Arbitration</h4>
          <p className="text-gray-700 dark:text-gray-300">The following disputes are not subject to arbitration:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Intellectual property disputes</li>
            <li>Requests for injunctive relief</li>
            <li>Small claims court matters (under $10,000)</li>
            <li>Disputes that cannot be arbitrated under applicable law</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Jurisdiction</h4>
          <p className="text-gray-700 dark:text-gray-300">
            For disputes not subject to arbitration, you consent to the exclusive jurisdiction of the federal and state
            courts located in San Francisco, California.
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
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
          Welcome to CoinWayFinder! These Terms of Service ("Terms") govern your use of our cryptocurrency trading
          platform and related services. Please read these terms carefully before using our services.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          By creating an account or using our services, you agree to be bound by these Terms and our Privacy Policy. If
          you do not agree to these terms, please do not use our services.
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
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Questions or Concerns?</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:legal@coinwayfinder.com" className="text-blue-600 hover:underline">
                legal@coinwayfinder.com
              </a>
            </p>
            <p>
              <strong>Support:</strong>{" "}
              <a href="mailto:support@coinwayfinder.com" className="text-blue-600 hover:underline">
                support@coinwayfinder.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
