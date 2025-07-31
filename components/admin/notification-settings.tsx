"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send, Settings, Shield, Activity, TestTube } from "lucide-react"

interface NotificationConfig {
  userManagement: boolean
  securityAlerts: boolean
  systemHealth: boolean
  complianceReports: boolean
  dataExports: boolean
  adminEmails: string[]
  securityEmails: string[]
}

export function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    userManagement: true,
    securityAlerts: true,
    systemHealth: true,
    complianceReports: true,
    dataExports: true,
    adminEmails: [],
    securityEmails: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testType, setTestType] = useState<"security" | "admin" | "system">("security")
  const [sendingTest, setSendingTest] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/admin/notifications/config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      } else {
        toast({
          title: "Error",
          description: "Failed to load notification configuration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch config:", error)
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification configuration saved successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save configuration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save config:", error)
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const sendTestNotification = async () => {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: testType,
          email: testEmail,
        }),
      })

      if (response.ok) {
        toast({
          title: "Test Sent",
          description: `Test ${testType} notification sent to ${testEmail}`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to send test notification",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to send test:", error)
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      })
    } finally {
      setSendingTest(false)
    }
  }

  const addEmail = (type: "admin" | "security", email: string) => {
    if (!email || !email.includes("@")) return

    const field = type === "admin" ? "adminEmails" : "securityEmails"
    const currentEmails = config[field]

    if (!currentEmails.includes(email)) {
      setConfig({
        ...config,
        [field]: [...currentEmails, email],
      })
    }
  }

  const removeEmail = (type: "admin" | "security", email: string) => {
    const field = type === "admin" ? "adminEmails" : "securityEmails"
    setConfig({
      ...config,
      [field]: config[field].filter((e) => e !== email),
    })
  }

  if (loading) {
    return <div className="p-6">Loading notification settings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Email Notification Settings
          </h1>
          <p className="text-muted-foreground">Configure email notifications for admin actions and security alerts</p>
        </div>
        <Button onClick={saveConfig} disabled={saving}>
          <Settings className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
          <TabsTrigger value="recipients">Email Recipients</TabsTrigger>
          <TabsTrigger value="test">Test Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="userManagement" className="text-base font-medium">
                    User Management
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for user account changes, bans, role modifications
                  </p>
                </div>
                <Switch
                  id="userManagement"
                  checked={config.userManagement}
                  onCheckedChange={(checked) => setConfig({ ...config, userManagement: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="securityAlerts" className="text-base font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Critical security events, failed logins, suspicious activity
                  </p>
                </div>
                <Switch
                  id="securityAlerts"
                  checked={config.securityAlerts}
                  onCheckedChange={(checked) => setConfig({ ...config, securityAlerts: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemHealth" className="text-base font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    System Health
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    System downtime, performance issues, component failures
                  </p>
                </div>
                <Switch
                  id="systemHealth"
                  checked={config.systemHealth}
                  onCheckedChange={(checked) => setConfig({ ...config, systemHealth: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="complianceReports" className="text-base font-medium">
                    Compliance Reports
                  </Label>
                  <p className="text-sm text-muted-foreground">Automated compliance report generation and completion</p>
                </div>
                <Switch
                  id="complianceReports"
                  checked={config.complianceReports}
                  onCheckedChange={(checked) => setConfig({ ...config, complianceReports: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataExports" className="text-base font-medium">
                    Data Exports
                  </Label>
                  <p className="text-sm text-muted-foreground">User data exports and bulk operations</p>
                </div>
                <Switch
                  id="dataExports"
                  checked={config.dataExports}
                  onCheckedChange={(checked) => setConfig({ ...config, dataExports: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Admin Emails
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for all admin actions and general alerts
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="admin@example.com"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addEmail("admin", e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement
                      if (input?.value) {
                        addEmail("admin", input.value)
                        input.value = ""
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {config.adminEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{email}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeEmail("admin", email)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  {config.adminEmails.length === 0 && (
                    <p className="text-sm text-muted-foreground">No admin emails configured</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Emails
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Receive high-priority security alerts and critical notifications
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="security@example.com"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addEmail("security", e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement
                      if (input?.value) {
                        addEmail("security", input.value)
                        input.value = ""
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {config.securityEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{email}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeEmail("security", email)}>
                        Remove
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
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Notifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Send test notifications to verify your email configuration
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="testEmail">Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="testType">Notification Type</Label>
                  <select
                    id="testType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as any)}
                  >
                    <option value="security">Security Alert</option>
                    <option value="admin">Admin Action</option>
                    <option value="system">System Health</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button onClick={sendTestNotification} disabled={sendingTest || !testEmail} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    {sendingTest ? "Sending..." : "Send Test"}
                  </Button>
                </div>
              </div>

              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  Test notifications contain sample data and help verify that your email configuration is working
                  properly. The test will be sent to the specified email address regardless of your current notification
                  settings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
