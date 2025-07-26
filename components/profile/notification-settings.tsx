"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  TrendingUp,
  Bot,
  Signal,
  AlertTriangle,
  DollarSign,
  Clock,
  Save,
} from "lucide-react"

export function NotificationSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [emailSettings, setEmailSettings] = useState({
    tradingAlerts: true,
    botUpdates: true,
    signalNotifications: true,
    portfolioUpdates: false,
    securityAlerts: true,
    marketNews: true,
    systemUpdates: false,
    promotions: false,
  })

  const [pushSettings, setPushSettings] = useState({
    tradingAlerts: true,
    botUpdates: false,
    signalNotifications: true,
    portfolioUpdates: true,
    securityAlerts: true,
    marketNews: false,
    systemUpdates: true,
    promotions: false,
  })

  const [smsSettings, setSmsSettings] = useState({
    tradingAlerts: false,
    botUpdates: false,
    signalNotifications: false,
    portfolioUpdates: false,
    securityAlerts: true,
    marketNews: false,
    systemUpdates: false,
    promotions: false,
  })

  const [preferences, setPreferences] = useState({
    frequency: "immediate",
    quietHours: true,
    quietStart: "22:00",
    quietEnd: "08:00",
    timezone: "UTC",
    language: "en",
  })

  const notificationTypes = [
    {
      key: "tradingAlerts",
      label: "Trading Alerts",
      description: "Notifications about trade executions, fills, and order updates",
      icon: TrendingUp,
    },
    {
      key: "botUpdates",
      label: "Bot Updates",
      description: "Status changes, performance updates, and bot notifications",
      icon: Bot,
    },
    {
      key: "signalNotifications",
      label: "Signal Notifications",
      description: "New trading signals and signal performance updates",
      icon: Signal,
    },
    {
      key: "portfolioUpdates",
      label: "Portfolio Updates",
      description: "Portfolio value changes and performance summaries",
      icon: DollarSign,
    },
    {
      key: "securityAlerts",
      label: "Security Alerts",
      description: "Login attempts, security changes, and suspicious activities",
      icon: AlertTriangle,
    },
    {
      key: "marketNews",
      label: "Market News",
      description: "Important market news and analysis updates",
      icon: Bell,
    },
    {
      key: "systemUpdates",
      label: "System Updates",
      description: "Platform updates, maintenance notifications, and new features",
      icon: Bell,
    },
    {
      key: "promotions",
      label: "Promotions",
      description: "Special offers, discounts, and promotional content",
      icon: Bell,
    },
  ]

  const handleEmailToggle = (key: string, value: boolean) => {
    setEmailSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handlePushToggle = (key: string, value: boolean) => {
    setPushSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSmsToggle = (key: string, value: boolean) => {
    setSmsSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how and when you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Types Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-2 text-white font-medium">Notification Type</th>
                  <th className="text-center py-3 px-2 text-white font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Email</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-2 text-white font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <Bell className="h-4 w-4" />
                      <span className="hidden sm:inline">Push</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-2 text-white font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">SMS</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {notificationTypes.map((type) => (
                  <tr key={type.key} className="border-b border-slate-700/50">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <type.icon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">{type.label}</p>
                          <p className="text-sm text-gray-400">{type.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Switch
                        checked={emailSettings[type.key as keyof typeof emailSettings]}
                        onCheckedChange={(value) => handleEmailToggle(type.key, value)}
                      />
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Switch
                        checked={pushSettings[type.key as keyof typeof pushSettings]}
                        onCheckedChange={(value) => handlePushToggle(type.key, value)}
                      />
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Switch
                        checked={smsSettings[type.key as keyof typeof smsSettings]}
                        onCheckedChange={(value) => handleSmsToggle(type.key, value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Preferences */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Delivery Preferences
          </CardTitle>
          <CardDescription>Control when and how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-white">
                Notification Frequency
              </Label>
              <Select
                value={preferences.frequency}
                onValueChange={(value) => handlePreferenceChange("frequency", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-white">
                Timezone
              </Label>
              <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange("timezone", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                  <SelectItem value="CET">Central European Time</SelectItem>
                  <SelectItem value="JST">Japan Standard Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Quiet Hours</p>
                <p className="text-sm text-gray-400">Disable non-critical notifications during specified hours</p>
              </div>
              <Switch
                checked={preferences.quietHours}
                onCheckedChange={(value) => handlePreferenceChange("quietHours", value)}
              />
            </div>

            {preferences.quietHours && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="quietStart" className="text-white">
                    Start Time
                  </Label>
                  <Select
                    value={preferences.quietStart}
                    onValueChange={(value) => handlePreferenceChange("quietStart", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0")
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietEnd" className="text-white">
                    End Time
                  </Label>
                  <Select
                    value={preferences.quietEnd}
                    onValueChange={(value) => handlePreferenceChange("quietEnd", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0")
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Methods */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Contact Methods
          </CardTitle>
          <CardDescription>Manage your notification delivery methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">demo@coinwayfinder.com</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update Email
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update Phone
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-400">Enabled on this device</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Test Push
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}
