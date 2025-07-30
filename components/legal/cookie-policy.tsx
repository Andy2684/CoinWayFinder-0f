"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Cookie, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CookiePolicy() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "what-are-cookies": true,
  })

  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    marketing: false,
    personalization: true,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const updateCookiePreference = (category: string, enabled: boolean) => {
    if (category === "essential") return // Essential cookies cannot be disabled

    setCookiePreferences((prev) => ({
      ...prev,
      [category]: enabled,
    }))
  }

  const sections = [
    {
      id: "what-are-cookies",
      title: "1. What Are Cookies?",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Cookies are small text files that are stored on your device when you visit our website. They help us provide
            you with a better experience by remembering your preferences and understanding how you use our platform.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white">Types of Cookies We Use</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Session Cookies</h5>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Temporary cookies that expire when you close your browser. Used for essential functionality like
                maintaining your login session.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">Persistent Cookies</h5>
              <p className="text-green-800 dark:text-green-200 text-sm">
                Cookies that remain on your device for a set period. Used to remember your preferences and provide
                personalized experiences.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">First-Party Cookies</h5>
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                Cookies set directly by CoinWayFinder to provide core functionality and improve your experience on our
                platform.
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h5 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Third-Party Cookies</h5>
              <p className="text-orange-800 dark:text-orange-200 text-sm">
                Cookies set by our partners and service providers for analytics, advertising, and enhanced
                functionality.
              </p>
            </div>
          </div>

          <Alert>
            <Cookie className="h-4 w-4" />
            <AlertDescription>
              <strong>Your Control:</strong> You can manage your cookie preferences at any time using the settings below
              or through your browser settings.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "cookie-categories",
      title: "2. Cookie Categories",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-green-600" />
                  Essential Cookies
                </h4>
                <Switch checked={cookiePreferences.essential} disabled />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                These cookies are necessary for the website to function and cannot be switched off. They are usually
                only set in response to actions made by you which amount to a request for services.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Examples:</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Authentication and login sessions</li>
                  <li>• Security and fraud prevention</li>
                  <li>• Shopping cart and checkout functionality</li>
                  <li>• Load balancing and performance optimization</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-blue-600" />
                  Analytics Cookies
                </h4>
                <Switch
                  checked={cookiePreferences.analytics}
                  onCheckedChange={(checked) => updateCookiePreference("analytics", checked)}
                />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                These cookies help us understand how visitors interact with our website by collecting and reporting
                information anonymously.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Examples:</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Google Analytics for usage statistics</li>
                  <li>• Page view and user journey tracking</li>
                  <li>• Performance monitoring and error reporting</li>
                  <li>• A/B testing and feature optimization</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Cookie className="mr-2 h-5 w-5 text-purple-600" />
                  Personalization Cookies
                </h4>
                <Switch
                  checked={cookiePreferences.personalization}
                  onCheckedChange={(checked) => updateCookiePreference("personalization", checked)}
                />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                These cookies enable the website to provide enhanced functionality and personalization based on your
                preferences and behavior.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Examples:</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Theme preferences (dark/light mode)</li>
                  <li>• Language and region settings</li>
                  <li>• Customized dashboard layouts</li>
                  <li>• Favorite trading pairs and watchlists</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-orange-600" />
                  Marketing Cookies
                </h4>
                <Switch
                  checked={cookiePreferences.marketing}
                  onCheckedChange={(checked) => updateCookiePreference("marketing", checked)}
                />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                These cookies are used to track visitors across websites to display relevant and engaging
                advertisements.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Examples:</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Targeted advertising and retargeting</li>
                  <li>• Social media integration and sharing</li>
                  <li>• Conversion tracking and attribution</li>
                  <li>• Email marketing campaign optimization</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Save Your Preferences</h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
              Your cookie preferences have been updated. Changes will take effect on your next page load.
            </p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Save Preferences
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "specific-cookies",
      title: "3. Specific Cookies We Use",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Below is a detailed list of the specific cookies used on our platform:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Cookie Name</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Purpose</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Duration</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">auth-token</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">User authentication</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">7 days</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Essential</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">session-id</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Session management</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Session</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Essential</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">csrf-token</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Security protection</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Session</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Essential</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">theme-preference</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">UI theme setting</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 year</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Personalization</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">language</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Language preference</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 year</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Personalization</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">_ga</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Google Analytics</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">2 years</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Analytics</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">_gid</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Google Analytics</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">24 hours</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Analytics</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">_fbp</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Facebook Pixel</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">3 months</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Marketing</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">intercom-session</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Customer support chat</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">7 days</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Personalization</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This list may not be exhaustive. We regularly review and update our cookie usage to
              improve our services.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "third-party-cookies",
      title: "4. Third-Party Cookies",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We work with trusted third-party service providers who may set cookies on our website to provide their
            services:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Google Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Helps us understand how users interact with our website through anonymous usage statistics.
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Privacy Policy:</strong>{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Privacy Policy
                    </a>
                  </p>
                  <p>
                    <strong>Opt-out:</strong>{" "}
                    <a
                      href="https://tools.google.com/dlpage/gaoptout"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Analytics Opt-out
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Intercom</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Provides customer support chat functionality and helps us communicate with users.
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Privacy Policy:</strong>{" "}
                    <a
                      href="https://www.intercom.com/legal/privacy"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Intercom Privacy Policy
                    </a>
                  </p>
                  <p>
                    <strong>Data Processing:</strong> EU-US Privacy Shield certified
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stripe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Processes payments securely and helps prevent fraud during checkout.
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Privacy Policy:</strong>{" "}
                    <a
                      href="https://stripe.com/privacy"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Stripe Privacy Policy
                    </a>
                  </p>
                  <p>
                    <strong>Security:</strong> PCI DSS Level 1 certified
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cloudflare</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Provides content delivery network (CDN) and security services to improve website performance.
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Privacy Policy:</strong>{" "}
                    <a
                      href="https://www.cloudflare.com/privacypolicy/"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cloudflare Privacy Policy
                    </a>
                  </p>
                  <p>
                    <strong>Purpose:</strong> Performance optimization and DDoS protection
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Data Protection:</strong> All our third-party partners are required to comply with applicable data
              protection laws and maintain appropriate security measures.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "managing-cookies",
      title: "5. Managing Your Cookie Preferences",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Browser Settings</h4>
          <p className="text-gray-700 dark:text-gray-300">
            You can control cookies through your browser settings. Here's how to manage cookies in popular browsers:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Google Chrome</h5>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>1. Click the three dots menu → Settings</li>
                <li>2. Go to Privacy and security → Cookies</li>
                <li>3. Choose your preferred cookie settings</li>
                <li>4. Manage exceptions for specific sites</li>
              </ol>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Mozilla Firefox</h5>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>1. Click the menu button → Settings</li>
                <li>2. Select Privacy & Security</li>
                <li>3. Go to Cookies and Site Data</li>
                <li>4. Adjust your cookie preferences</li>
              </ol>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Safari</h5>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>1. Go to Safari → Preferences</li>
                <li>2. Click the Privacy tab</li>
                <li>3. Choose your cookie blocking options</li>
                <li>4. Manage website data as needed</li>
              </ol>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Microsoft Edge</h5>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>1. Click the three dots → Settings</li>
                <li>2. Go to Cookies and site permissions</li>
                <li>3. Select Cookies and site data</li>
                <li>4. Configure your cookie settings</li>
              </ol>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Platform Cookie Settings</h4>
          <p className="text-gray-700 dark:text-gray-300">
            You can also manage your cookie preferences directly on our platform:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Use the cookie preference center (available in your account settings)</li>
            <li>Adjust settings for each category of cookies</li>
            <li>Changes take effect immediately for future visits</li>
            <li>Essential cookies cannot be disabled as they're required for basic functionality</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Mobile Devices</h4>
          <p className="text-gray-700 dark:text-gray-300">
            For mobile browsers, cookie settings are typically found in the browser's privacy or security settings. Some
            mobile apps may also have in-app cookie preference options.
          </p>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Disabling certain cookies may affect the functionality of our website and your
              user experience.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "updates-contact",
      title: "6. Policy Updates and Contact Information",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Policy Updates</h4>
          <p className="text-gray-700 dark:text-gray-300">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other
            operational, legal, or regulatory reasons. We will notify you of any material changes by:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Posting the updated policy on this page</li>
            <li>Updating the "Last Updated" date at the top of the policy</li>
            <li>Sending email notifications for significant changes</li>
            <li>Displaying prominent notices on our website</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Contact Us</h4>
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Email Contacts</h5>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Privacy Team:</strong>
                  <br />
                  <a href="mailto:privacy@coinwayfinder.com" className="text-blue-600 hover:underline">
                    privacy@coinwayfinder.com
                  </a>
                </p>
                <p>
                  <strong>Data Protection Officer:</strong>
                  <br />
                  <a href="mailto:dpo@coinwayfinder.com" className="text-blue-600 hover:underline">
                    dpo@coinwayfinder.com
                  </a>
                </p>
                <p>
                  <strong>General Support:</strong>
                  <br />
                  <a href="mailto:support@coinwayfinder.com" className="text-blue-600 hover:underline">
                    support@coinwayfinder.com
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Mailing Address</h5>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p>CoinWayFinder Inc.</p>
                <p>Attn: Privacy Team</p>
                <p>123 Crypto Street, Suite 456</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-6">Your Rights</h4>
          <p className="text-gray-700 dark:text-gray-300">
            Depending on your location, you may have certain rights regarding cookies and personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Right to withdraw consent for non-essential cookies</li>
            <li>Right to access information about cookies we use</li>
            <li>Right to request deletion of cookie data</li>
            <li>Right to object to certain types of cookie processing</li>
          </ul>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Actions</h5>
            <div className="space-y-2">
              <Button size="sm" variant="outline" className="mr-2 bg-transparent">
                Manage Cookie Preferences
              </Button>
              <Button size="sm" variant="outline" className="mr-2 bg-transparent">
                Download Cookie Data
              </Button>
              <Button size="sm" variant="outline">
                Contact Privacy Team
              </Button>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cookie Policy</h1>
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
          This Cookie Policy explains how CoinWayFinder uses cookies and similar technologies to recognize you when you
          visit our website and use our services. It explains what these technologies are, why we use them, and your
          rights to control our use of them.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          By continuing to use our website, you consent to our use of cookies as described in this policy. You can
          change your cookie preferences at any time using the controls provided below.
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
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cookie Consent Management</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            You can manage your cookie preferences at any time. Changes will be applied to future visits to our website.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Manage All Cookies</Button>
            <Button size="sm" variant="outline">
              Accept All Cookies
            </Button>
            <Button size="sm" variant="outline">
              Reject Non-Essential
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
