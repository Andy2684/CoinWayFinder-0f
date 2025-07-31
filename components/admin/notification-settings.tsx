"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Loader2, Mail, Shield, Activity, Users } from "lucide-react"

interface NotificationConfig {
  adminEmails: string[]
  securityEmails: string[]
  enabledTypes: {
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
    enabledTypes: {
      securityAlerts: true,
      adminActions: true,
      systemHealth: true,
      userManagement: true,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [sendingTest, setSendingTest] = useState<string | null>(null)

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
      console.error("Failed to fetch config:", error)
      toast({
        title: "Error",
        description: "Failed to load notification settings",
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
          description: "Notification settings saved successfully",
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to save config:", error)
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const sendTestNotification = async (type: "security" | "admin" | "system") => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setSendingTest(type)
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
      console.error("Failed to send test notification:", error)
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      })
    } finally {
      setSendingTest(null)
    }
  }

  const updateEmails = (type: "adminEmails" | "securityEmails", value: string) => {
    const emails = value
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)
    setConfig((prev) => ({ ...prev, [type]: emails }))
  }

  const updateEnabledType = (type: keyof NotificationConfig["enabledTypes"], enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      enabledTypes: { ...prev.enabledTypes, [type]: enabled },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground">Configure email notifications for admin actions and security alerts</p>
      </div>

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
            <Input
              id="admin-emails"
              placeholder="admin1@example.com, admin2@example.com"
              value={config.adminEmails.join(", ")}
              onChange={(e) => updateEmails("adminEmails", e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">Comma-separated list of admin email addresses</p>
          </div>

          <div>
            <Label htmlFor="security-emails">Security Team Emails</Label>
            <Input
              id="security-emails"
              placeholder="security1@example.com, security2@example.com"
              value={config.securityEmails.join(", ")}
              onChange={(e) => updateEmails("securityEmails", e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">Comma-separated list of security team email addresses</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Enable or disable different types of notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              <div>
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Failed logins, suspicious activity, unauthorized access</p>
              </div>
            </div>
            <Switch
              checked={config.enabledTypes.securityAlerts}
              onCheckedChange={(checked) => updateEnabledType("securityAlerts", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <Label>Admin Actions</Label>
                <p className="text-sm text-muted-foreground">User management, role changes, system settings</p>
              </div>
            </div>
            <Switch
              checked={config.enabledTypes.adminActions}
              onCheckedChange={(checked) => updateEnabledType("adminActions", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <Label>System Health</Label>
                <p className="text-sm text-muted-foreground">Component failures, performance issues, recovery</p>
              </div>
            </div>
            <Switch
              checked={config.enabledTypes.systemHealth}
              onCheckedChange={(checked) => updateEnabledType("systemHealth", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div>
                <Label>User Management</Label>
                <p className="text-sm text-muted-foreground">User registrations, account changes, deletions</p>
              </div>
            </div>
            <Switch
              checked={config.enabledTypes.userManagement}
              onCheckedChange={(checked) => updateEnabledType("userManagement", checked)}
            />
          </div>
        </CardContent>
      </Card>

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
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendTestNotification("security")}
              disabled={sendingTest === "security"}
            >
              {sendingTest === "security" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Test Security Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendTestNotification("admin")}
              disabled={sendingTest === "admin"}
            >
              {sendingTest === "admin" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Test Admin Action
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendTestNotification("system")}
              disabled={sendingTest === "system"}
            >
              {sendingTest === "system" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Test System Health
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Settings
        </Button>
      </div>
    </div>
  )
}
