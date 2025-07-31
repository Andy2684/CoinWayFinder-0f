"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Bell,
  Mail,
  MessageSquare,
  Shield,
  TrendingUp,
  Bot,
  Signal,
  Wallet,
  Newspaper,
  Settings,
  Gift,
} from "lucide-react"

interface NotificationPreferences {
  email_enabled: boolean
  email_trading_alerts: boolean
  email_bot_updates: boolean
  email_signals: boolean
  email_portfolio: boolean
  email_security: boolean
  email_news: boolean
  email_system: boolean
  email_promotions: boolean
  push_enabled: boolean
  push_trading_alerts: boolean
  push_bot_updates: boolean
  push_signals: boolean
  push_portfolio: boolean
  push_security: boolean
  push_news: boolean
  push_system: boolean
  push_promotions: boolean
  sms_enabled: boolean
  sms_trading_alerts: boolean
  sms_bot_updates: boolean
  sms_signals: boolean
  sms_portfolio: boolean
  sms_security: boolean
  sms_news: boolean
  sms_system: boolean
  sms_promotions: boolean
  frequency: string
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  timezone: string
  phone_number: string | null
  phone_verified: boolean
}

const notificationTypes = [
  {
    key: "trading_alerts",
    label: "Trading Alerts",
    icon: TrendingUp,
    description: "Price alerts and trading opportunities",
  },
  { key: "bot_updates", label: "Bot Updates", icon: Bot, description: "Trading bot status and performance updates" },
  { key: "signals", label: "Signals", icon: Signal, description: "Trading signals and recommendations" },
  { key: "portfolio", label: "Portfolio", icon: Wallet, description: "Portfolio performance and updates" },
  { key: "security", label: "Security", icon: Shield, description: "Security alerts and account changes" },
  { key: "news", label: "News", icon: Newspaper, description: "Market news and analysis" },
  { key: "system", label: "System", icon: Settings, description: "System updates and maintenance" },
  { key: "promotions", label: "Promotions", icon: Gift, description: "Special offers and promotions" },
]

const deliveryMethods = [
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Bell },
  { key: "sms", label: "SMS", icon: MessageSquare },
]

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      } else {
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return

    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)

    setSaving(true)
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification preferences updated",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update preferences",
          variant: "destructive",
        })
        // Revert changes
        setPreferences(preferences)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      })
      // Revert changes
      setPreferences(preferences)
    } finally {
      setSaving(false)
    }
  }

  const sendVerificationCode = async () => {
    if (!preferences?.phone_number) {
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
        credentials: "include",
        body: JSON.stringify({ phoneNumber: preferences.phone_number }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Code Sent",
          description: `Verification code sent to ${preferences.phone_number}. Demo code: ${data.demoCode}`,
        })
        setPhoneVerificationOpen(true)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification code",
          variant: "destructive",
        })
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

  const verifyPhone = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      })
      return
    }

    setVerifyingCode(true)
    try {
      const response = await fetch("/api/notifications/preferences/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Phone number verified successfully",
        })
        setPhoneVerificationOpen(false)
        setVerificationCode("")
        await fetchPreferences() // Refresh preferences
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to verify phone number",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify phone number",
        variant: "destructive",
      })
    } finally {
      setVerifyingCode(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Failed to load notification preferences</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <Label className="text-base font-medium">Email</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => updatePreferences({ email_enabled: checked })}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-green-500" />
              <div>
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive browser push notifications</p>
              </div>
            </div>
            <Switch
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => updatePreferences({ push_enabled: checked })}
            />
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <Label className="text-base font-medium">SMS</Label>
                <p className="text-sm text-gray-500">Receive notifications via text message</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {preferences.phone_verified && (
                <Badge variant="secondary" className="text-green-600">
                  Verified
                </Badge>
              )}
              <Switch
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) => updatePreferences({ sms_enabled: checked })}
                disabled={!preferences.phone_verified}
              />
            </div>
          </div>

          {/* Phone Number Setup */}
          {!preferences.phone_verified && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex space-x-2">
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={preferences.phone_number || ""}
                  onChange={(e) => updatePreferences({ phone_number: e.target.value })}
                />
                <Button onClick={sendVerificationCode} disabled={sendingCode || !preferences.phone_number}>
                  {sendingCode ? "Sending..." : "Verify"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Choose which notifications you want to receive for each delivery method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Notification Type</th>
                  {deliveryMethods.map((method) => (
                    <th key={method.key} className="text-center py-3 px-2">
                      <div className="flex items-center justify-center space-x-1">
                        <method.icon className="h-4 w-4" />
                        <span>{method.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notificationTypes.map((type) => (
                  <tr key={type.key} className="border-b">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <type.icon className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </td>
                    {deliveryMethods.map((method) => {
                      const prefKey = `${method.key}_${type.key}` as keyof NotificationPreferences
                      const enabledKey = `${method.key}_enabled` as keyof NotificationPreferences
                      const isMethodEnabled = preferences[enabledKey] as boolean

                      return (
                        <td key={method.key} className="text-center py-4 px-2">
                          <Switch
                            checked={preferences[prefKey] as boolean}
                            onCheckedChange={(checked) => updatePreferences({ [prefKey]: checked })}
                            disabled={!isMethodEnabled || (method.key === "sms" && !preferences.phone_verified)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>Configure when and how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Frequency */}
          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select value={preferences.frequency} onValueChange={(value) => updatePreferences({ frequency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">Security notifications are always sent immediately</p>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Quiet Hours</Label>
                <p className="text-sm text-gray-500">Disable non-critical notifications during these hours</p>
              </div>
              <Switch
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={(checked) => updatePreferences({ quiet_hours_enabled: checked })}
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => updatePreferences({ quiet_hours_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => updatePreferences({ quiet_hours_end: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={preferences.timezone} onValueChange={(value) => updatePreferences({ timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Phone Verification Dialog */}
      <Dialog open={phoneVerificationOpen} onOpenChange={setPhoneVerificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>Enter the verification code sent to {preferences.phone_number}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <p className="text-sm text-gray-500">Demo code: 123456</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={verifyPhone} disabled={verifyingCode || !verificationCode} className="flex-1">
                {verifyingCode ? "Verifying..." : "Verify"}
              </Button>
              <Button variant="outline" onClick={sendVerificationCode} disabled={sendingCode}>
                {sendingCode ? "Sending..." : "Resend"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Saving preferences...
        </div>
      )}
    </div>
  )
}
