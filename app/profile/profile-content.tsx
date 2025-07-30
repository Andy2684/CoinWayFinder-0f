"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Save, User, Settings, Bell, Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileContent() {
  const { user, updateProfile, loading } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    timezone: "UTC",
    language: "en",
  })

  // Settings form state
  const [settingsData, setSettingsData] = useState({
    notifications: {
      email: true,
      push: true,
      trading_alerts: true,
      news_alerts: false,
    },
    trading: {
      default_risk_level: "medium",
      auto_trading: false,
      max_daily_trades: 10,
    },
    privacy: {
      profile_public: false,
      show_portfolio: false,
    },
  })

  // Load user data when component mounts
  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        first_name: user.profile.first_name || "",
        last_name: user.profile.last_name || "",
        bio: user.profile.bio || "",
        timezone: user.profile.timezone || "UTC",
        language: user.profile.language || "en",
      })
    }

    if (user?.settings) {
      setSettingsData({
        notifications: {
          email: user.settings.notifications?.email ?? true,
          push: user.settings.notifications?.push ?? true,
          trading_alerts: user.settings.notifications?.trading_alerts ?? true,
          news_alerts: user.settings.notifications?.news_alerts ?? false,
        },
        trading: {
          default_risk_level: user.settings.trading?.default_risk_level || "medium",
          auto_trading: user.settings.trading?.auto_trading ?? false,
          max_daily_trades: user.settings.trading?.max_daily_trades || 10,
        },
        privacy: {
          profile_public: user.settings.privacy?.profile_public ?? false,
          show_portfolio: user.settings.privacy?.show_portfolio ?? false,
        },
      })
    }
  }, [user])

  const handleProfileUpdate = async () => {
    setIsUpdating(true)
    setMessage(null)

    try {
      const result = await updateProfile({
        profile: profileData,
      })

      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSettingsUpdate = async () => {
    setIsUpdating(true)
    setMessage(null)

    try {
      const result = await updateProfile({
        settings: settingsData,
      })

      if (result.success) {
        setMessage({ type: "success", text: "Settings updated successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update settings" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                    <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={user.username || ""} disabled className="bg-muted" />
                    <p className="text-sm text-muted-foreground">Username cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={profileData.timezone}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, timezone: e.target.value }))}
                      placeholder="UTC"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={profileData.language}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, language: e.target.value }))}
                      placeholder="en"
                    />
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
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
                      checked={settingsData.notifications.email}
                      onCheckedChange={(checked) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.push}
                      onCheckedChange={(checked) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Trading Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about trading opportunities and bot activities
                      </p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.trading_alerts}
                      onCheckedChange={(checked) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, trading_alerts: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>News Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications about important market news</p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.news_alerts}
                      onCheckedChange={(checked) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, news_alerts: checked },
                        }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Notifications
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading">
            <Card>
              <CardHeader>
                <CardTitle>Trading Settings</CardTitle>
                <CardDescription>Configure your trading preferences and risk management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="risk_level">Default Risk Level</Label>
                    <select
                      id="risk_level"
                      className="w-full p-2 border rounded-md"
                      value={settingsData.trading.default_risk_level}
                      onChange={(e) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          trading: { ...prev.trading, default_risk_level: e.target.value },
                        }))
                      }
                    >
                      <option value="low">Low Risk</option>
                      <option value="medium">Medium Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Trading</Label>
                      <p className="text-sm text-muted-foreground">Allow bots to execute trades automatically</p>
                    </div>
                    <Switch
                      checked={settingsData.trading.auto_trading}
                      onCheckedChange={(checked) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          trading: { ...prev.trading, auto_trading: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_trades">Maximum Daily Trades</Label>
                    <Input
                      id="max_trades"
                      type="number"
                      min="1"
                      max="100"
                      value={settingsData.trading.max_daily_trades}
                      onChange={(e) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          trading: { ...prev.trading, max_daily_trades: Number.parseInt(e.target.value) || 10 },
                        }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Trading Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                    </div>
                    <Switch
                      checked={settingsData.privacy.profile_public}
                      onCheckedChange={(checked) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, profile_public: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Portfolio</Label>
                      <p className="text-sm text-muted-foreground">Display your portfolio performance publicly</p>
                    </div>
                    <Switch
                      checked={settingsData.privacy.show_portfolio}
                      onCheckedChange={(checked) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, show_portfolio: checked },
                        }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Privacy Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
