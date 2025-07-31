"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Mail, Shield, Settings, Users, Activity } from "lucide-react"

interface NotificationConfig {
  adminEmails: string[]
  securityEmails: string[]
  enabledNotifications: {
    securityAlerts: boolean
    adminActions: boolean
    systemHealth: boolean
    userManagement: boolean
  }
}

export function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    adminEmails: [],
    securityEmails: [],
    enabledNotifications: {
      securityAlerts: true,
      adminActions: true,
      systemHealth: true,
      userManagement: true,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/admin/notifications/config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Error fetching config:", error)
      toast({
        title: "Error",
        description: "Failed to load notification configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/notifications/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification configuration saved successfully",
        })
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (error) {
      console.error("Error saving config:", error)
      toast({
        title: "Error",
        description: "Failed to save notification configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const sendTestNotification = async (type: "security" | "admin") => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setSendingTest(true)
    try {
      const response = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, type }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Test ${type} notification sent to ${testEmail}`,
        })
      } else {
        throw new Error("Failed to send test notification")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      })
    } finally {
      setSendingTest(false)
    }
  }

  const updateEmailList = (type: "adminEmails" | "securityEmails", value: string) => {
    const emails = value
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email)
    setConfig((prev) => ({ ...prev, [type]: emails }))
  }

  const toggleNotification = (key: keyof NotificationConfig["enabledNotifications"]) => {
    setConfig((prev) => ({
      ...prev,
      enabledNotifications: {
        ...prev.enabledNotifications,
        [key]: !prev.enabledNotifications[key],
      },
    }))
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground">Configure email notifications for admin actions and security alerts</p>
      </div>

      <div className="grid gap-6">
        {/* Email Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Recipients
            </CardTitle>
            <CardDescription>Configure who receives different types of notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin-emails">Admin Emails</Label>
              <Textarea
                id="admin-emails"
                placeholder="admin1@company.com, admin2@company.com"
                value={config.adminEmails.join(", ")}
                onChange={(e) => updateEmailList("adminEmails", e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">Comma-separated list of admin email addresses</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {config.adminEmails.map((email, index) => (
                  <Badge key={index} variant="secondary">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="security-emails">Security Team Emails</Label>
              <Textarea
                id="security-emails"
                placeholder="security@company.com, soc@company.com"
                value={config.securityEmails.join(", ")}
                onChange={(e) => updateEmailList("securityEmails", e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Comma-separated list of security team email addresses
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {config.securityEmails.map((email, index) => (
                  <Badge key={index} variant="secondary">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Types
            </CardTitle>
            <CardDescription>Enable or disable specific types of notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <div>
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">Failed logins, suspicious activity, security breaches</p>
                </div>
              </div>
              <Switch
                checked={config.enabledNotifications.securityAlerts}
                onCheckedChange={() => toggleNotification("securityAlerts")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <div>
                  <Label>Admin Actions</Label>
                  <p className="text-sm text-muted-foreground">User management, role changes, system configuration</p>
                </div>
              </div>
              <Switch
                checked={config.enabledNotifications.adminActions}
                onCheckedChange={() => toggleNotification("adminActions")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <div>
                  <Label>System Health</Label>
                  <p className="text-sm text-muted-foreground">
                    System failures, performance issues, recovery notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={config.enabledNotifications.systemHealth}
                onCheckedChange={() => toggleNotification("systemHealth")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <div>
                  <Label>User Management</Label>
                  <p className="text-sm text-muted-foreground">
                    User registrations, account deletions, profile changes
                  </p>
                </div>
              </div>
              <Switch
                checked={config.enabledNotifications.userManagement}
                onCheckedChange={() => toggleNotification("userManagement")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
            <CardDescription>Send test notifications to verify your email configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@company.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => sendTestNotification("security")} disabled={sendingTest} variant="outline">
                Send Security Alert Test
              </Button>
              <Button onClick={() => sendTestNotification("admin")} disabled={sendingTest} variant="outline">
                Send Admin Action Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>
    </div>
  )
}
