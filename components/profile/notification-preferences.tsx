"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Phone,
  Check,
  X,
} from "lucide-react"

interface NotificationPreferences {
  id?: string
  emailPreferences: {
    enabled: boolean
    tradingAlerts: boolean
    botUpdates: boolean
    signalNotifications: boolean
    portfolioUpdates: boolean
    securityAlerts: boolean
    marketNews: boolean
    systemUpdates: boolean
    promotions: boolean
  }
  pushPreferences: {
    enabled: boolean
    tradingAlerts: boolean
    botUpdates: boolean
    signalNotifications: boolean
    portfolioUpdates: boolean
    securityAlerts: boolean
    marketNews: boolean
    systemUpdates: boolean
    promotions: boolean
  }
  smsPreferences: {
    enabled: boolean
    tradingAlerts: boolean
    botUpdates: boolean
    signalNotifications: boolean
    portfolioUpdates: boolean
    securityAlerts: boolean
    marketNews: boolean
    systemUpdates: boolean
    promotions: boolean
  }
  deliveryPreferences: {
    frequency: string
    quietHoursEnabled: boolean
    quietStart: string
    quietEnd: string
    timezone: string
    language: string
  }
  contactInfo: {
    phoneNumber: string
    phoneVerified: boolean
  }
}

const defaultPreferences: NotificationPreferences = {
  emailPreferences: {
    enabled: true,
    tradingAlerts: true,
    botUpdates: true,
    signalNotifications: true,
    portfolioUpdates: false,
    securityAlerts: true,
    marketNews: true,
    systemUpdates: false,
    promotions: false,
  },
  pushPreferences: {
    enabled: true,
    tradingAlerts: true,
    botUpdates: false,
    signalNotifications: true,
    portfolioUpdates: true,
    securityAlerts: true,
    marketNews: false,
    systemUpdates: true,
    promotions: false,
  },
  smsPreferences: {
    enabled: false,
    tradingAlerts: false,
    botUpdates: false,
    signalNotifications: false,
    portfolioUpdates: false,
    securityAlerts: true,
    marketNews: false,
    systemUpdates: false,
    promotions: false,
  },
  deliveryPreferences: {
    frequency: "immediate",
    quietHoursEnabled: false,
    quietStart: "22:00",
    quietEnd: "08:00",
    timezone: "UTC",
    language: "en",
  },
  contactInfo: {
    phoneNumber: "",
    phoneVerified: false,
  },
}

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

export function NotificationPreferences() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [verificationDialog, setVerificationDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences")
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          // Map database fields to UI structure
          const dbPrefs = data.preferences
          setPreferences({
            emailPreferences: {
              enabled: dbPrefs.email_enabled,
              tradingAlerts: dbPrefs.email_trading_alerts,
              botUpdates: dbPrefs.email_bot_updates,
              signalNotifications: dbPrefs.email_signal_notifications,
              portfolioUpdates: dbPrefs.email_portfolio_updates,
              securityAlerts: dbPrefs.email_security_alerts,
              marketNews: dbPrefs.email_market_news,
              systemUpdates: dbPrefs.email_system_updates,
              promotions: dbPrefs.email_promotions,
            },
            pushPreferences: {
              enabled: dbPrefs.push_enabled,
              tradingAlerts: dbPrefs.push_trading_alerts,
              botUpdates: dbPrefs.push_bot_updates,
              signalNotifications: dbPrefs.push_signal_notifications,
              portfolioUpdates: dbPrefs.push_portfolio_updates,
              securityAlerts: dbPrefs.push_security_alerts,
              marketNews: dbPrefs.push_market_news,
              systemUpdates: dbPrefs.push_system_updates,
              promotions: dbPrefs.push_promotions,
            },
            smsPreferences: {
              enabled: dbPrefs.sms_enabled,
              tradingAlerts: dbPrefs.sms_trading_alerts,
              botUpdates: dbPrefs.sms_bot_updates,
              signalNotifications: dbPrefs.sms_signal_notifications,
              portfolioUpdates: dbPrefs.sms_portfolio_updates,
              securityAlerts: dbPrefs.sms_security_alerts,
              marketNews: dbPrefs.sms_market_news,
              systemUpdates: dbPrefs.sms_system_updates,
              promotions: dbPrefs.sms_promotions,
            },
            deliveryPreferences: {
              frequency: dbPrefs.frequency,
              quietHoursEnabled: dbPrefs.quiet_hours_enabled,
              quietStart: dbPrefs.quiet_hours_start,
              quietEnd: dbPrefs.quiet_hours_end,
              timezone: dbPrefs.timezone,
              language: dbPrefs.language,
            },
            contactInfo: {
              phoneNumber: dbPrefs.phone_number || "",
              phoneVerified: dbPrefs.phone_verified,
            },
          })
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error)
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      })
    }
  }

  const handleEmailToggle = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      emailPreferences: { ...prev.emailPreferences, [key]: value },
    }))
  }

  const handlePushToggle = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      pushPreferences: { ...prev.pushPreferences, [key]: value },
    }))
  }

  const handleSmsToggle = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      smsPreferences: { ...prev.smsPreferences, [key]: value },
    }))
  }

  const handleDeliveryChange = (key: string, value: string | boolean) => {
    setPreferences((prev) => ({
      ...prev,
      deliveryPreferences: { ...prev.deliveryPreferences, [key]: value },
    }))
  }

  const handleContactChange = (key: string, value: string | boolean) => {
    setPreferences((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [key]: value },
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your notification preferences have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save preferences")
      }
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

  const sendVerificationCode = async () => {
    if (!preferences.contactInfo.phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number first",
        variant: "destructive",
      })
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch("/api/notifications/preferences/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: preferences.contactInfo.phoneNumber }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Verification Code Sent",
          description: `Code sent to ${preferences.contactInfo.phoneNumber}. Demo code: ${data.demoCode}`,
        })
        setVerificationDialog(true)
      } else {
        throw new Error("Failed to send verification code")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setSendingCode(false)
    }
  }

  const verifyPhoneNumber = async () => {
    setVerifyingCode(true)
    try {
      const response = await fetch("/api/notifications/preferences/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: preferences.contactInfo.phoneNumber,
          verificationCode,
        }),
      })

      if (response.ok) {
        handleContactChange("phoneVerified", true)
        setVerificationDialog(false)
        setVerificationCode("")
        toast({
          title: "Phone Verified",
          description: "Your phone number has been verified successfully",
        })
      } else {
        throw new Error("Invalid verification code")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setVerifyingCode(false)
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
          {/* Master Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">Email</span>
              </div>
              <Switch
                checked={preferences.emailPreferences.enabled}
                onCheckedChange={(value) => handleEmailToggle("enabled", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-400" />
                <span className="text-white font-medium">Push</span>
              </div>
              <Switch
                checked={preferences.pushPreferences.enabled}
                onCheckedChange={(value) => handlePushToggle("enabled", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-400" />
                <span className="text-white font-medium">SMS</span>
              </div>
              <Switch
                checked={preferences.smsPreferences.enabled}
                onCheckedChange={(value) => handleSmsToggle("enabled", value)}
              />
            </div>
          </div>

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
                        checked={preferences.emailPreferences[type.key as keyof typeof preferences.emailPreferences]}
                        onCheckedChange={(value) => handleEmailToggle(type.key, value)}
                        disabled={!preferences.emailPreferences.enabled}
                      />
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Switch
                        checked={preferences.pushPreferences[type.key as keyof typeof preferences.pushPreferences]}
                        onCheckedChange={(value) => handlePushToggle(type.key, value)}
                        disabled={!preferences.pushPreferences.enabled}
                      />
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Switch
                        checked={preferences.smsPreferences[type.key as keyof typeof preferences.smsPreferences]}
                        onCheckedChange={(value) => handleSmsToggle(type.key, value)}
                        disabled={!preferences.smsPreferences.enabled}
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
                value={preferences.deliveryPreferences.frequency}
                onValueChange={(value) => handleDeliveryChange("frequency", value)}
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
              <Select
                value={preferences.deliveryPreferences.timezone}
                onValueChange={(value) => handleDeliveryChange("timezone", value)}
              >
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
                checked={preferences.deliveryPreferences.quietHoursEnabled}
                onCheckedChange={(value) => handleDeliveryChange("quietHoursEnabled", value)}
              />
            </div>

            {preferences.deliveryPreferences.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="quietStart" className="text-white">
                    Start Time
                  </Label>
                  <Select
                    value={preferences.deliveryPreferences.quietStart}
                    onValueChange={(value) => handleDeliveryChange("quietStart", value)}
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
                    value={preferences.deliveryPreferences.quietEnd}
                    onValueChange={(value) => handleDeliveryChange("quietEnd", value)}
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
                  <p className="text-sm text-gray-400">Primary email address</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">SMS Notifications</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={preferences.contactInfo.phoneNumber}
                      onChange={(e) => handleContactChange("phoneNumber", e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white text-sm w-40"
                    />
                    {preferences.contactInfo.phoneVerified ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <X className="h-4 w-4" />
                        <span className="text-sm">Not verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendVerificationCode}
                  disabled={sendingCode || !preferences.contactInfo.phoneNumber}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {sendingCode ? "Sending..." : "Verify"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-400">Browser notifications</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if ("Notification" in window) {
                    Notification.requestPermission().then((permission) => {
                      if (permission === "granted") {
                        new Notification("Test notification", {
                          body: "Push notifications are working!",
                          icon: "/favicon.ico",
                        })
                      }
                    })
                  }
                }}
              >
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

      {/* Phone Verification Dialog */}
      <Dialog open={verificationDialog} onOpenChange={setVerificationDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Verify Phone Number</DialogTitle>
            <DialogDescription>
              Enter the verification code sent to {preferences.contactInfo.phoneNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-white">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                maxLength={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVerificationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={verifyPhoneNumber} disabled={verifyingCode || verificationCode.length !== 6}>
                {verifyingCode ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
