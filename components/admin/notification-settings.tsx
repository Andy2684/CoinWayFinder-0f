"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, Send, CheckCircle, XCircle } from "lucide-react"

interface NotificationConfig {
  adminEmails: string[]
  securityEmails: string[]
  enabledTypes: {
    security: boolean
    adminActions: boolean
    systemHealth: boolean
    userManagement: boolean
  }
}

export default function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    adminEmails: [],
    securityEmails: [],
    enabledTypes: {
      security: true,
      adminActions: true,
      systemHealth: true,
      userManagement: true,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testType, setTestType] = useState("security")
  const [sendingTest, setSendingTest] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newSecurityEmail, setNewSecurityEmail] = useState("")

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/admin/notifications/config")
      const data = await response.json()

      if (data.success) {
        setConfig(data.config)
      } else {
        setMessage({ type: "error", text: "Failed to load notification config" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error loading notification config" })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/notifications/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Notification settings saved successfully" })
        setConfig(data.config)
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error saving notification settings" })
    } finally {
      setSaving(false)
    }
  }

  const sendTestNotification = async () => {
    if (!testEmail) {
      setMessage({ type: "error", text: "Please enter an email address for testing" })
      return
    }

    setSendingTest(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testEmail, type: testType }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        setTestEmail("")
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send test notification" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error sending test notification" })
    } finally {
      setSendingTest(false)
    }
  }

  const addAdminEmail = () => {
    if (newAdminEmail && !config.adminEmails.includes(newAdminEmail)) {
      setConfig((prev) => ({
        ...prev,
        adminEmails: [...prev.adminEmails, newAdminEmail],
      }))
      setNewAdminEmail("")
    }
  }

  const removeAdminEmail = (email: string) => {
    setConfig((prev) => ({
      ...prev,
      adminEmails: prev.adminEmails.filter((e) => e !== email),
    }))
  }

  const addSecurityEmail = () => {
    if (newSecurityEmail && !config.securityEmails.includes(newSecurityEmail)) {
      setConfig((prev) => ({
        ...prev,
        securityEmails: [...prev.securityEmails, newSecurityEmail],
      }))
      setNewSecurityEmail("")
    }
  }

  const removeSecurityEmail = (email: string) => {
    setConfig((prev) => ({
      ...prev,
      securityEmails: prev.securityEmails.filter((e) => e !== email),
    }))
  }

  const updateNotificationType = (type: keyof typeof config.enabledTypes, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      enabledTypes: {
        ...prev.enabledTypes,
        [type]: enabled,
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">Configure email notifications for admin actions and security alerts</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Admin Email Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Email Recipients</CardTitle>
            <CardDescription>Email addresses that will receive admin action notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="admin@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAdminEmail()}
              />
              <Button onClick={addAdminEmail} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {config.adminEmails.map((email) => (
                <div key={email} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{email}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeAdminEmail(email)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {config.adminEmails.length === 0 && (
                <p className="text-sm text-muted-foreground">No admin emails configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Email Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>Security Email Recipients</CardTitle>
            <CardDescription>
              Email addresses that will receive security alerts and critical notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="security@example.com"
                value={newSecurityEmail}
                onChange={(e) => setNewSecurityEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSecurityEmail()}
              />
              <Button onClick={addSecurityEmail} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {config.securityEmails.map((email) => (
                <div key={email} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{email}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeSecurityEmail(email)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {config.securityEmails.length === 0 && (
                <p className="text-sm text-muted-foreground">No security emails configured</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Configure which types of notifications to send</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Failed logins, suspicious activity</p>
              </div>
              <Switch
                id="security"
                checked={config.enabledTypes.security}
                onCheckedChange={(checked) => updateNotificationType("security", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="adminActions">Admin Actions</Label>
                <p className="text-sm text-muted-foreground">User management, settings changes</p>
              </div>
              <Switch
                id="adminActions"
                checked={config.enabledTypes.adminActions}
                onCheckedChange={(checked) => updateNotificationType("adminActions", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="systemHealth">System Health</Label>
                <p className="text-sm text-muted-foreground">Performance issues, component failures</p>
              </div>
              <Switch
                id="systemHealth"
                checked={config.enabledTypes.systemHealth}
                onCheckedChange={(checked) => updateNotificationType("systemHealth", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="userManagement">User Management</Label>
                <p className="text-sm text-muted-foreground">Account changes, registrations</p>
              </div>
              <Switch
                id="userManagement"
                checked={config.enabledTypes.userManagement}
                onCheckedChange={(checked) => updateNotificationType("userManagement", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>Send a test notification to verify your email configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="testEmail">Test Email</Label>
              <Input
                id="testEmail"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="testType">Notification Type</Label>
              <select
                id="testType"
                className="w-full p-2 border rounded"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
              >
                <option value="security">Security Alert</option>
                <option value="admin_action">Admin Action</option>
                <option value="system_health">System Health</option>
                <option value="user_management">User Management</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={sendTestNotification} disabled={sendingTest || !testEmail} className="w-full">
                {sendingTest ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
