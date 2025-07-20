"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Key,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Save,
  AlertTriangle,
  DollarSign,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { BackToDashboard } from "@/components/back-to-dashboard"

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    trading: true,
    news: false,
    security: true,
  })

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    timezone: "UTC",
    language: "en",
  })

  const [preferences, setPreferences] = useState({
    theme: "dark",
    currency: "USD",
    soundEnabled: true,
    autoRefresh: true,
    compactView: false,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>
        <BackToDashboard />
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Timezone</Label>
                  <Select
                    value={profile.timezone}
                    onValueChange={(value) => setProfile({ ...profile, timezone: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Language</Label>
                  <Select
                    value={profile.language}
                    onValueChange={(value) => setProfile({ ...profile, language: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about important events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">Email Notifications</span>
                    </div>
                    <p className="text-sm text-gray-400">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-green-400" />
                      <span className="text-white font-medium">Push Notifications</span>
                    </div>
                    <p className="text-sm text-gray-400">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-400" />
                      <span className="text-white font-medium">SMS Notifications</span>
                    </div>
                    <p className="text-sm text-gray-400">Text message alerts</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                  />
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h4 className="text-white font-medium">Notification Types</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-blue-400" />
                      <span className="text-white">Trading Alerts</span>
                    </div>
                    <p className="text-sm text-gray-400">Bot actions, trades, and P&L updates</p>
                  </div>
                  <Switch
                    checked={notifications.trading}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, trading: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white">Market News</span>
                    <p className="text-sm text-gray-400">Important market updates and news</p>
                  </div>
                  <Switch
                    checked={notifications.news}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, news: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white">Security Alerts</span>
                    <p className="text-sm text-gray-400">Login attempts and security events</p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, security: checked })}
                  />
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-200">
                  Two-factor authentication is recommended for enhanced security
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">Change Password</span>
                    </div>
                    <p className="text-sm text-gray-400">Update your account password</p>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 bg-transparent">
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-400" />
                      <span className="text-white font-medium">Two-Factor Authentication</span>
                      <Badge variant="outline" className="text-red-400 border-red-400">
                        Disabled
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-purple-400" />
                      <span className="text-white font-medium">API Keys</span>
                    </div>
                    <p className="text-sm text-gray-400">Manage your trading API keys</p>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 bg-transparent">
                    Manage Keys
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h4 className="text-white font-medium">Recent Security Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Last login: Today at 2:30 PM</span>
                    <span className="text-green-400">✓ Verified</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Password changed: 30 days ago</span>
                    <span className="text-green-400">✓ Secure</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>API key created: 15 days ago</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Billing & Subscription</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Current Plan</h3>
                    <p className="text-gray-300">Professional Plan</p>
                  </div>
                  <Badge className="bg-blue-600 text-white">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Monthly Cost:</span>
                    <span className="text-white ml-2 font-medium">$99/month</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Next Billing:</span>
                    <span className="text-white ml-2 font-medium">Jan 15, 2024</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Payment Methods</h4>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-400">Expires 12/25</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Default
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 bg-transparent">
                  Add Payment Method
                </Button>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h4 className="text-white font-medium">Billing History</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
                    <div>
                      <p className="text-white">Professional Plan</p>
                      <p className="text-sm text-gray-400">Dec 15, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">$99.00</p>
                      <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                        Paid
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
                    <div>
                      <p className="text-white">Professional Plan</p>
                      <p className="text-sm text-gray-400">Nov 15, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">$99.00</p>
                      <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                        Paid
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Upgrade Plan</Button>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 bg-transparent">
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">App Preferences</CardTitle>
              <CardDescription>Customize your trading experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {preferences.theme === "dark" ? (
                        <Moon className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Sun className="h-4 w-4 text-yellow-400" />
                      )}
                      <span className="text-white font-medium">Theme</span>
                    </div>
                    <p className="text-sm text-gray-400">Choose your preferred theme</p>
                  </div>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                  >
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-white font-medium">Default Currency</span>
                    </div>
                    <p className="text-sm text-gray-400">Display prices in your preferred currency</p>
                  </div>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
                  >
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {preferences.soundEnabled ? (
                        <Volume2 className="h-4 w-4 text-purple-400" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-white font-medium">Sound Effects</span>
                    </div>
                    <p className="text-sm text-gray-400">Play sounds for notifications and alerts</p>
                  </div>
                  <Switch
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, soundEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-medium">Auto Refresh Data</span>
                    <p className="text-sm text-gray-400">Automatically update market data and charts</p>
                  </div>
                  <Switch
                    checked={preferences.autoRefresh}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, autoRefresh: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-medium">Compact View</span>
                    <p className="text-sm text-gray-400">Use a more compact layout to show more data</p>
                  </div>
                  <Switch
                    checked={preferences.compactView}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, compactView: checked })}
                  />
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
