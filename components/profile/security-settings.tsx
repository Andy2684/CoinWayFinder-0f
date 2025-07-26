"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, Key, Smartphone, Eye, EyeOff, AlertTriangle, CheckCircle, Lock, History, MapPin } from "lucide-react"

export function SecuritySettings() {
  const { toast } = useToast()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    setTwoFactorEnabled(enabled)
    toast({
      title: enabled ? "2FA Enabled" : "2FA Disabled",
      description: enabled
        ? "Two-factor authentication has been enabled for your account."
        : "Two-factor authentication has been disabled for your account.",
    })
  }

  const activeSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, US",
      lastActive: "2 minutes ago",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, US",
      lastActive: "1 hour ago",
      current: false,
    },
    {
      id: 3,
      device: "Firefox on MacOS",
      location: "Los Angeles, US",
      lastActive: "2 days ago",
      current: false,
    },
  ]

  const loginHistory = [
    {
      id: 1,
      timestamp: "2024-01-15 14:30:00",
      location: "New York, US",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: 2,
      timestamp: "2024-01-15 09:15:00",
      location: "New York, US",
      device: "Safari on iPhone",
      status: "success",
    },
    {
      id: 3,
      timestamp: "2024-01-14 18:45:00",
      location: "Unknown Location",
      device: "Chrome on Linux",
      status: "failed",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription className="text-gray-400">Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-white">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="bg-slate-700/50 border-slate-600 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="bg-slate-700/50 border-slate-600 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-slate-700/50 border-slate-600 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-gray-400">Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Enable 2FA</p>
              <p className="text-sm text-gray-400">Secure your account with two-factor authentication</p>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
          </div>

          {twoFactorEnabled && (
            <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">2FA is enabled</span>
              </div>
              <p className="text-sm text-gray-400">
                Your account is protected with two-factor authentication using your authenticator app.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                >
                  View Recovery Codes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                >
                  Regenerate Codes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Preferences
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure your security and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Email Security Notifications</p>
              <p className="text-sm text-gray-400">Receive email alerts for security events</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Login Alerts</p>
              <p className="text-sm text-gray-400">Get notified when someone logs into your account</p>
            </div>
            <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription className="text-gray-400">Manage your active login sessions across devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-600/50 rounded-lg">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{session.device}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span>{session.location}</span>
                    <span>•</span>
                    <span>{session.lastActive}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.current ? (
                  <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                    Current
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription className="text-gray-400">Recent login attempts and security events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginHistory.map((login) => (
            <div
              key={login.id}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${login.status === "success" ? "bg-green-600/20" : "bg-red-600/20"}`}>
                  {login.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{login.device}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span>{login.location}</span>
                    <span>•</span>
                    <span>{login.timestamp}</span>
                  </div>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={login.status === "success" ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"}
              >
                {login.status === "success" ? "Success" : "Failed"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
