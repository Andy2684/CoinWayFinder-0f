"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  TrendingUp,
  Bot,
  Zap,
  AlertTriangle,
  DollarSign,
  Activity,
  Save,
} from "lucide-react"

export function NotificationSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState({
    tradingSignals: true,
    botUpdates: true,
    priceAlerts: true,
    portfolioUpdates: false,
    newsAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
    weeklyReports: true,
  })

  const [pushNotifications, setPushNotifications] = useState({
    tradingSignals: true,
    botUpdates: true,
    priceAlerts: true,
    portfolioUpdates: true,
    newsAlerts: false,
    securityAlerts: true,
    systemMaintenance: true,
  })

  const [smsNotifications, setSmsNotifications] = useState({
    criticalAlerts: true,
    securityAlerts: true,
    largeTransactions: false,
  })

  const [preferences, setPreferences] = useState({
    emailFrequency: "immediate",
    quietHours: "22:00-08:00",
    timezone: "UTC",
    language: "en",
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Trading Signals</p>
                <p className="text-sm text-gray-400">New trading signals and recommendations</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications.tradingSignals}
              onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, tradingSignals: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Bot Updates</p>
                <p className="text-sm text-gray-400">Trading bot status changes and performance updates</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications.botUpdates}
              onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, botUpdates: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Price Alerts</p>
                <p className="text-sm text-gray-400">Cryptocurrency price movement alerts</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications.priceAlerts}
              onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, priceAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Portfolio Updates</p>
                <p className="text-sm text-gray-400">Daily portfolio performance summaries</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications.portfolioUpdates}
              onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, portfolioUpdates: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-white font-medium">News Alerts</p>
                <p className="text-sm text-gray-400">Important cryptocurrency news and market updates</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications.newsAlerts}
              onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, newsAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Security Alerts</p>
                <p className="text-sm text-gray-400">Account security and login notifications</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications.securityAlerts}
              onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, securityAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-400">Product updates and promotional content</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications.marketingEmails}
              onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, marketingEmails: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-white font-medium">Weekly Reports</p>
                <p className="text-sm text-gray-400">Weekly performance and market analysis reports</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications.weeklyReports}
              onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, weeklyReports: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription className="text-gray-400">Configure browser and mobile push notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Trading Signals</p>
                <p className="text-sm text-gray-400">Instant notifications for new signals</p>
              </div>
            </div>
            <Switch
              checked={pushNotifications.tradingSignals}
              onCheckedChange={(checked) => setPushNotifications((prev) => ({ ...prev, tradingSignals: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Bot Updates</p>
                <p className="text-sm text-gray-400">Real-time bot status changes</p>
              </div>
            </div>
            <Switch
              checked={pushNotifications.botUpdates}
              onCheckedChange={(checked) => setPushNotifications((prev) => ({ ...prev, botUpdates: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Price Alerts</p>
                <p className="text-sm text-gray-400">Immediate price movement notifications</p>
              </div>
            </div>
            <Switch
              checked={pushNotifications.priceAlerts}
              onCheckedChange={(checked) => setPushNotifications((prev) => ({ ...prev, priceAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Portfolio Updates</p>
                <p className="text-sm text-gray-400">Significant portfolio changes</p>
              </div>
            </div>
            <Switch
              checked={pushNotifications.portfolioUpdates}
              onCheckedChange={(checked) => setPushNotifications((prev) => ({ ...prev, portfolioUpdates: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Security Alerts</p>
                <p className="text-sm text-gray-400">Critical security notifications</p>
              </div>
            </div>
            <Switch
              checked={pushNotifications.securityAlerts}
              onCheckedChange={(checked) => setPushNotifications((prev) => ({ ...prev, securityAlerts: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription className="text-gray-400">Configure SMS alerts for critical events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Critical Alerts</p>
                <p className="text-sm text-gray-400">Emergency notifications and system alerts</p>
              </div>
            </div>
            <Switch
              checked={smsNotifications.criticalAlerts}
              onCheckedChange={(checked) => setSmsNotifications((prev) => ({ ...prev, criticalAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-white font-medium">Security Alerts</p>
                <p className="text-sm text-gray-400">Account security and unauthorized access attempts</p>
              </div>
            </div>
            <Switch
              checked={smsNotifications.securityAlerts}
              onCheckedChange={(checked) => setSmsNotifications((prev) => ({ ...prev, securityAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Large Transactions</p>
                <p className="text-sm text-gray-400">Notifications for transactions above $10,000</p>
              </div>
            </div>
            <Switch
              checked={smsNotifications.largeTransactions}
              onCheckedChange={(checked) => setSmsNotifications((prev) => ({ ...prev, largeTransactions: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Notification Preferences</CardTitle>
          <CardDescription className="text-gray-400">Configure how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white font-medium">Email Frequency</label>
              <Select
                value={preferences.emailFrequency}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, emailFrequency: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">Quiet Hours</label>
              <Select
                value={preferences.quietHours}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, quietHours: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="none">No Quiet Hours</SelectItem>
                  <SelectItem value="22:00-08:00">10 PM - 8 AM</SelectItem>
                  <SelectItem value="23:00-07:00">11 PM - 7 AM</SelectItem>
                  <SelectItem value="00:00-09:00">12 AM - 9 AM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white font-medium">Timezone</label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                  <SelectItem value="CET">Central European Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">Language</label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}
