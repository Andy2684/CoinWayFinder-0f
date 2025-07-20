"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Bell, Shield, CreditCard, Key, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { BackToDashboard } from "@/components/back-to-dashboard"

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    trading: true,
    security: true,
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackToDashboard />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user?.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user?.lastName} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={user?.username} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                    <SelectItem value="cet">Central European Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified about important events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive important alerts via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trading Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about bot performance and trades</p>
                  </div>
                  <Switch
                    checked={notifications.trading}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, trading: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Important security and account notifications</p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, security: checked }))}
                  />
                </div>
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and authentication methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Password</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Two-Factor Authentication
                    {twoFactorEnabled ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    <Button
                      variant={twoFactorEnabled ? "destructive" : "default"}
                      size="sm"
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    >
                      {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">API Keys</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Manage your API keys for trading integrations</p>
                    <Button variant="outline" size="sm">
                      <Key className="h-4 w-4 mr-2" />
                      Manage Keys
                    </Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Active Sessions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground">Chrome on Windows • New York, US</p>
                      </div>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Mobile App</p>
                        <p className="text-xs text-muted-foreground">iOS App • Last active 2 hours ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Plan</h4>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Pro Plan</p>
                      <p className="text-sm text-muted-foreground">$29.99/month • Renews on Jan 15, 2024</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Payment Method</h4>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Billing History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Pro Plan - December 2023</p>
                        <p className="text-xs text-muted-foreground">Paid on Dec 15, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">$29.99</p>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Pro Plan - November 2023</p>
                        <p className="text-xs text-muted-foreground">Paid on Nov 15, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">$29.99</p>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your subscription will automatically renew on January 15, 2024. You can cancel anytime before the
                  renewal date.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="destructive">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
