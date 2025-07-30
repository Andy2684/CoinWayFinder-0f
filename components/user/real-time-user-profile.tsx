"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Bell,
  Settings,
  Activity,
  Smartphone,
  Monitor,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { io, type Socket } from "socket.io-client"

interface UserProfile {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  role: string
  subscription_status: string
  is_email_verified: boolean
  profile_picture?: string
  phone?: string
  location?: string
  website?: string
  bio?: string
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
      trading_alerts: boolean
      news_updates: boolean
      price_alerts: boolean
    }
    trading: {
      default_exchange: string
      risk_level: string
      auto_trading: boolean
      stop_loss_enabled: boolean
      take_profit_enabled: boolean
    }
    ui: {
      theme: string
      language: string
      timezone: string
      currency: string
    }
  }
  activity: {
    last_login: string
    last_active: string
    login_count: number
    ip_addresses: string[]
    devices: Array<{
      device_id: string
      device_name: string
      browser: string
      os: string
      last_used: string
    }>
  }
  trading_data: {
    total_trades: number
    total_pnl: number
    win_rate: number
    favorite_pairs: string[]
    active_bots: string[]
    portfolio_value: number
    risk_score: number
  }
  created_at: string
  updated_at: string
}

interface UserSession {
  session_id: string
  device_info: {
    ip_address: string
    user_agent: string
    device_id: string
  }
  expires_at: string
  is_active: boolean
  created_at: string
}

export function RealTimeUserProfile() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
  })

  useEffect(() => {
    if (authUser) {
      loadUserProfile()
      loadUserSessions()
      initializeWebSocket()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [authUser])

  const initializeWebSocket = () => {
    const token =
      localStorage.getItem("auth_token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth-token="))
        ?.split("=")[1]

    if (!token) return

    const newSocket = io(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000", {
      auth: { token },
      transports: ["websocket", "polling"],
    })

    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected")
      setIsOnline(true)
      setSocket(newSocket)
    })

    newSocket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected")
      setIsOnline(false)
    })

    newSocket.on("user:updated", (data) => {
      console.log("👤 User updated:", data)
      setProfile(data.user)
      toast.success("Profile updated in real-time")
    })

    newSocket.on("user:preferences-updated", (data) => {
      console.log("⚙️ Preferences updated:", data)
      if (profile) {
        setProfile({ ...profile, preferences: data.preferences })
      }
      toast.success("Preferences updated")
    })

    newSocket.on("user:session-invalidated", (data) => {
      console.log("🔒 Session invalidated:", data)
      setSessions((prev) => prev.filter((s) => s.session_id !== data.sessionId))
      toast.info("Session invalidated")
    })

    newSocket.on("user:all-sessions-invalidated", () => {
      console.log("🔒 All sessions invalidated")
      setSessions([])
      toast.info("All sessions invalidated")
    })

    newSocket.on("user:account-locked", (data) => {
      console.log("🔒 Account locked:", data)
      toast.error(data.message)
    })

    newSocket.on("error", (error) => {
      console.error("❌ WebSocket error:", error)
      toast.error("Connection error occurred")
    })
  }

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/users?action=profile", {
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        setProfile(data.user)
        setFormData({
          first_name: data.user.first_name || "",
          last_name: data.user.last_name || "",
          phone: data.user.phone || "",
          location: data.user.location || "",
          website: data.user.website || "",
          bio: data.user.bio || "",
        })
      } else {
        toast.error("Failed to load profile")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const loadUserSessions = async () => {
    try {
      const response = await fetch("/api/users?action=sessions", {
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    }
  }

  const updateProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "update-profile",
          data: formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProfile((prev) => (prev ? { ...prev, ...data.user } : null))
        toast.success("Profile updated successfully")
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const updatePreferences = async (section: string, key: string, value: any) => {
    if (!profile) return

    const newPreferences = {
      ...profile.preferences,
      [section]: {
        ...profile.preferences[section as keyof typeof profile.preferences],
        [key]: value,
      },
    }

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "update-preferences",
          data: { preferences: newPreferences },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProfile((prev) => (prev ? { ...prev, preferences: data.preferences } : null))

        // Also send via WebSocket for real-time updates
        if (socket) {
          socket.emit("user:update-preferences", { preferences: newPreferences })
        }
      } else {
        toast.error("Failed to update preferences")
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("Failed to update preferences")
    }
  }

  const invalidateSession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "invalidate-session",
          data: { sessionId },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
        toast.success("Session invalidated")
      } else {
        toast.error("Failed to invalidate session")
      }
    } catch (error) {
      console.error("Error invalidating session:", error)
      toast.error("Failed to invalidate session")
    }
  }

  const invalidateAllSessions = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "invalidate-all-sessions",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSessions([])
        toast.success(`${data.invalidatedCount} sessions invalidated`)
      } else {
        toast.error("Failed to invalidate sessions")
      }
    } catch (error) {
      console.error("Error invalidating all sessions:", error)
      toast.error("Failed to invalidate sessions")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">Unable to load your profile data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "🟢 Online" : "🔴 Offline"}</Badge>
          <Badge variant="outline">{profile.subscription_status.toUpperCase()}</Badge>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.profile_picture || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {profile.first_name?.[0]}
                      {profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{profile.email}</span>
                      {profile.is_email_verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        className="pl-10"
                        value={formData.website}
                        onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={updateProfile} disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Account Status</span>
                    <Badge variant={profile.is_email_verified ? "default" : "secondary"}>
                      {profile.is_email_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Subscription</span>
                    <Badge variant="outline">{profile.subscription_status.toUpperCase()}</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Role</span>
                    <Badge variant="secondary">{profile.role.toUpperCase()}</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Trades</span>
                      <span className="font-medium">{profile.trading_data.total_trades}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total P&L</span>
                      <span
                        className={`font-medium ${profile.trading_data.total_pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        ${profile.trading_data.total_pnl.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Win Rate</span>
                      <span className="font-medium">{profile.trading_data.win_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Portfolio Value</span>
                      <span className="font-medium">${profile.trading_data.portfolio_value.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk Score</span>
                      <span className="font-medium">{profile.trading_data.risk_score}/100</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Member Since</span>
                      <span className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Login</span>
                      <span className="font-medium">{new Date(profile.activity.last_login).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Login Count</span>
                      <span className="font-medium">{profile.activity.login_count}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.email}
                    onCheckedChange={(checked) => updatePreferences("notifications", "email", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.push}
                    onCheckedChange={(checked) => updatePreferences("notifications", "push", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.sms}
                    onCheckedChange={(checked) => updatePreferences("notifications", "sms", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Trading Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about trading opportunities</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.trading_alerts}
                    onCheckedChange={(checked) => updatePreferences("notifications", "trading_alerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>News Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive market news and updates</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.news_updates}
                    onCheckedChange={(checked) => updatePreferences("notifications", "news_updates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Price Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when price targets are hit</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.price_alerts}
                    onCheckedChange={(checked) => updatePreferences("notifications", "price_alerts", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  UI Preferences
                </CardTitle>
                <CardDescription>Customize your interface settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={profile.preferences.ui.theme}
                    onChange={(e) => updatePreferences("ui", "theme", e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <Label>Language</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={profile.preferences.ui.language}
                    onChange={(e) => updatePreferences("ui", "language", e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>

                <div>
                  <Label>Timezone</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={profile.preferences.ui.timezone}
                    onChange={(e) => updatePreferences("ui", "timezone", e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>

                <div>
                  <Label>Currency</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={profile.preferences.ui.currency}
                    onChange={(e) => updatePreferences("ui", "currency", e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Active Sessions
                </CardTitle>
                <CardDescription>Manage your active login sessions across devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No active sessions found</p>
                  ) : (
                    sessions.map((session) => (
                      <div key={session.session_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-full">
                            {session.device_info.user_agent.includes("Mobile") ? (
                              <Smartphone className="h-4 w-4" />
                            ) : (
                              <Monitor className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {session.device_info.user_agent.includes("Mobile") ? "Mobile Device" : "Desktop"}
                            </p>
                            <p className="text-sm text-muted-foreground">IP: {session.device_info.ip_address}</p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(session.created_at).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires: {new Date(session.expires_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={session.is_active ? "default" : "secondary"}>
                            {session.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => invalidateSession(session.session_id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}

                  {sessions.length > 0 && (
                    <div className="pt-4 border-t">
                      <Button variant="destructive" onClick={invalidateAllSessions} className="w-full">
                        Invalidate All Sessions
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>View your recent account activity and login history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Login Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Logins</span>
                          <span className="font-medium">{profile.activity.login_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Login</span>
                          <span className="font-medium">{new Date(profile.activity.last_login).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Active</span>
                          <span className="font-medium">{new Date(profile.activity.last_active).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">IP Addresses</h4>
                      <div className="space-y-1">
                        {profile.activity.ip_addresses.slice(0, 5).map((ip, index) => (
                          <div key={index} className="text-sm font-mono">
                            {ip}
                          </div>
                        ))}
                        {profile.activity.ip_addresses.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{profile.activity.ip_addresses.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Recent Devices</h4>
                    <div className="space-y-2">
                      {profile.activity.devices.slice(0, 3).map((device, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium text-sm">{device.device_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {device.browser} on {device.os}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(device.last_used).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Trading Preferences
                </CardTitle>
                <CardDescription>Configure your default trading settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Exchange</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={profile.preferences.trading.default_exchange}
                    onChange={(e) => updatePreferences("trading", "default_exchange", e.target.value)}
                  >
                    <option value="binance">Binance</option>
                    <option value="coinbase">Coinbase</option>
                    <option value="kraken">Kraken</option>
                    <option value="bybit">Bybit</option>
                  </select>
                </div>

                <div>
                  <Label>Risk Level</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={profile.preferences.trading.risk_level}
                    onChange={(e) => updatePreferences("trading", "risk_level", e.target.value)}
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Trading</Label>
                    <p className="text-sm text-muted-foreground">Enable automated trading</p>
                  </div>
                  <Switch
                    checked={profile.preferences.trading.auto_trading}
                    onCheckedChange={(checked) => updatePreferences("trading", "auto_trading", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stop Loss</Label>
                    <p className="text-sm text-muted-foreground">Automatically set stop loss orders</p>
                  </div>
                  <Switch
                    checked={profile.preferences.trading.stop_loss_enabled}
                    onCheckedChange={(checked) => updatePreferences("trading", "stop_loss_enabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Take Profit</Label>
                    <p className="text-sm text-muted-foreground">Automatically set take profit orders</p>
                  </div>
                  <Switch
                    checked={profile.preferences.trading.take_profit_enabled}
                    onCheckedChange={(checked) => updatePreferences("trading", "take_profit_enabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Statistics</CardTitle>
                <CardDescription>Your trading performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Trades</span>
                    <span className="font-bold">{profile.trading_data.total_trades}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total P&L</span>
                    <span
                      className={`font-bold ${profile.trading_data.total_pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${profile.trading_data.total_pnl.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Win Rate</span>
                    <span className="font-bold">{profile.trading_data.win_rate.toFixed(1)}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Portfolio Value</span>
                    <span className="font-bold">${profile.trading_data.portfolio_value.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Risk Score</span>
                    <span className="font-bold">{profile.trading_data.risk_score}/100</span>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Favorite Trading Pairs</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.trading_data.favorite_pairs.map((pair, index) => (
                        <Badge key={index} variant="outline">
                          {pair}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Active Bots</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile.trading_data.active_bots.length} bots currently running
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
