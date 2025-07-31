"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Settings, Bell, AlertTriangle, Info } from "lucide-react"
import { toast } from "sonner"

interface NotificationSettings {
  adminEmails: string[]
  notifications: {
    adminActions: boolean
    securityAlerts: boolean
    systemEvents: boolean
    userRegistrations: boolean
    failedLogins: boolean
    suspiciousActivity: boolean
  }
  alertThresholds: {
    failedLoginAttempts: number
    suspiciousActivityScore: number
    criticalAlertDelay: number
    highAlertDelay: number
    mediumAlertDelay: number
    lowAlertDelay: number
  }
}

export default function AdminNotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [testEmail, setTestEmail] = useState("")
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/notifications/settings", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }

      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load notification settings")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch("/api/admin/notifications/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast.success("Notification settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save notification settings")
    } finally {
      setSaving(false)
    }
  }

  const addEmail = () => {
    if (!newEmail || !settings) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (settings.adminEmails.includes(newEmail)) {
      toast.error("Email address already exists")
      return
    }

    setSettings({
      ...settings,
      adminEmails: [...settings.adminEmails, newEmail],
    })
    setNewEmail("")
    toast.success("Email address added")
  }

  const removeEmail = (email: string) => {
    if (!settings) return

    setSettings({
      ...settings,
      adminEmails: settings.adminEmails.filter((e) => e !== email),
    })
    toast.success("Email address removed")
  }

  const updateNotificationSetting = (key: keyof NotificationSettings["notifications"], value: boolean) => {
    if (!settings) return

    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    })
  }

  const updateThreshold = (key: keyof NotificationSettings["alertThresholds"], value: number) => {
    if (!settings) return

    setSettings({
      ...settings,
      alertThresholds: {
        ...settings.alertThresholds,
        [key]: value,
      },
    })
  }

  const sendTestNotification = async (type: string) => {
    setSendingTest(true)
    try {
      const testData = {
        type,
        data: getTestData(type),
      }

      const response = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(testData),
      })

      if (!response.ok) {
        throw new Error("Failed to send test notification")
      }

      toast.success(`Test ${type} notification sent successfully`)
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast.error("Failed to send test notification")
    } finally {
      setSendingTest(false)
    }
  }

  const getTestData = (type: string) => {
    switch (type) {
      case "admin-action":
        return {
          adminEmail: "admin@coinwayfinder.com",
          adminName: "Test Admin",
          targetUserEmail: "user@example.com",
          targetUserName: "Test User",
          action: "verify",
          actionDetails: "This is a test admin action notification",
        }
      case "security-alert":
        return {
          alertType: "Test Security Alert",
          severity: "medium",
          description: "This is a test security alert notification",
          affectedUsers: 1,
        }
      case "system-event":
        return {
          eventType: "Test System Event",
          description: "This is a test system event notification",
          severity: "info",
        }
      default:
        return {}
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load notification settings. Please try again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">Configure email notifications for admin actions and security alerts</p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="test">Test Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Admin Email Addresses
              </CardTitle>
              <CardDescription>Email addresses that will receive admin notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="admin@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addEmail()}
                />
                <Button onClick={addEmail}>Add Email</Button>
              </div>

              <div className="space-y-2">
                {settings.adminEmails.map((email) => (
                  <div key={email} className="flex items-center justify-between p-2 border rounded">
                    <span>{email}</span>
                    <Button variant="outline" size="sm" onClick={() => removeEmail(email)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Types
              </CardTitle>
              <CardDescription>Choose which types of notifications to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="admin-actions">Admin Actions</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications when admins perform user management actions
                    </p>
                  </div>
                  <Switch
                    id="admin-actions"
                    checked={settings.notifications.adminActions}
                    onCheckedChange={(checked) => updateNotificationSetting("adminActions", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="security-alerts">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">High-priority security events and threats</p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={settings.notifications.securityAlerts}
                    onCheckedChange={(checked) => updateNotificationSetting("securityAlerts", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-events">System Events</Label>
                    <p className="text-sm text-muted-foreground">System status changes and important events</p>
                  </div>
                  <Switch
                    id="system-events"
                    checked={settings.notifications.systemEvents}
                    onCheckedChange={(checked) => updateNotificationSetting("systemEvents", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="user-registrations">User Registrations</Label>
                    <p className="text-sm text-muted-foreground">Notifications for new user sign-ups</p>
                  </div>
                  <Switch
                    id="user-registrations"
                    checked={settings.notifications.userRegistrations}
                    onCheckedChange={(checked) => updateNotificationSetting("userRegistrations", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="failed-logins">Failed Login Attempts</Label>
                    <p className="text-sm text-muted-foreground">Multiple failed login attempts from same IP</p>
                  </div>
                  <Switch
                    id="failed-logins"
                    checked={settings.notifications.failedLogins}
                    onCheckedChange={(checked) => updateNotificationSetting("failedLogins", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="suspicious-activity">Suspicious Activity</Label>
                    <p className="text-sm text-muted-foreground">Unusual user behavior and potential threats</p>
                  </div>
                  <Switch
                    id="suspicious-activity"
                    checked={settings.notifications.suspiciousActivity}
                    onCheckedChange={(checked) => updateNotificationSetting("suspiciousActivity", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>Configure when alerts should be triggered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="failed-login-threshold">Failed Login Attempts</Label>
                  <Input
                    id="failed-login-threshold"
                    type="number"
                    value={settings.alertThresholds.failedLoginAttempts}
                    onChange={(e) => updateThreshold("failedLoginAttempts", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">Number of failed attempts before alert</p>
                </div>

                <div>
                  <Label htmlFor="suspicious-score">Suspicious Activity Score</Label>
                  <Input
                    id="suspicious-score"
                    type="number"
                    value={settings.alertThresholds.suspiciousActivityScore}
                    onChange={(e) => updateThreshold("suspiciousActivityScore", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">Score threshold for suspicious activity</p>
                </div>

                <div>
                  <Label htmlFor="critical-delay">Critical Alert Delay (seconds)</Label>
                  <Input
                    id="critical-delay"
                    type="number"
                    value={settings.alertThresholds.criticalAlertDelay}
                    onChange={(e) => updateThreshold("criticalAlertDelay", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">Delay before sending critical alerts</p>
                </div>

                <div>
                  <Label htmlFor="high-delay">High Alert Delay (seconds)</Label>
                  <Input
                    id="high-delay"
                    type="number"
                    value={settings.alertThresholds.highAlertDelay}
                    onChange={(e) => updateThreshold("highAlertDelay", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">Delay before sending high priority alerts</p>
                </div>

                <div>
                  <Label htmlFor="medium-delay">Medium Alert Delay (seconds)</Label>
                  <Input
                    id="medium-delay"
                    type="number"
                    value={settings.alertThresholds.mediumAlertDelay}
                    onChange={(e) => updateThreshold("mediumAlertDelay", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">Delay before sending medium priority alerts</p>
                </div>

                <div>
                  <Label htmlFor="low-delay">Low Alert Delay (seconds)</Label>
                  <Input
                    id="low-delay"
                    type="number"
                    value={settings.alertThresholds.lowAlertDelay}
                    onChange={(e) => updateThreshold("lowAlertDelay", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">Delay before sending low priority alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>Send test notifications to verify your email configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Test notifications will be sent to all configured admin email addresses.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Action</CardTitle>
                    <CardDescription>Test admin action notification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => sendTestNotification("admin-action")}
                      disabled={sendingTest}
                      className="w-full"
                    >
                      {sendingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Test
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Alert</CardTitle>
                    <CardDescription>Test security alert notification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => sendTestNotification("security-alert")}
                      disabled={sendingTest}
                      className="w-full"
                    >
                      {sendingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Test
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Event</CardTitle>
                    <CardDescription>Test system event notification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => sendTestNotification("system-event")}
                      disabled={sendingTest}
                      className="w-full"
                    >
                      {sendingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Test
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Separator />
                <div>
                  <Label htmlFor="test-email">Send Test to Specific Email</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="test-email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (testEmail) {
                          // This would send to a specific email instead of all admin emails
                          sendTestNotification("admin-action")
                        }
                      }}
                      disabled={sendingTest || !testEmail}
                    >
                      Send Test
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send a test notification to a specific email address
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
