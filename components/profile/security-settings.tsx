"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { notificationHelper } from "@/lib/notification-helper"
import {
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Loader2,
  Save,
  Trash2,
} from "lucide-react"

export function SecuritySettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true)
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(true)

  const [activeSessions] = useState([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "New York, US",
      ipAddress: "192.168.1.100",
      lastActive: "2024-01-15T10:30:00Z",
      current: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "New York, US",
      ipAddress: "192.168.1.101",
      lastActive: "2024-01-15T09:15:00Z",
      current: false,
    },
    {
      id: "3",
      device: "Firefox on MacOS",
      location: "Boston, US",
      ipAddress: "10.0.0.50",
      lastActive: "2024-01-14T16:45:00Z",
      current: false,
    },
  ])

  const [loginHistory] = useState([
    {
      id: "1",
      timestamp: "2024-01-15T10:30:00Z",
      device: "Chrome on Windows",
      location: "New York, US",
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: "2",
      timestamp: "2024-01-15T09:15:00Z",
      device: "Safari on iPhone",
      location: "New York, US",
      ipAddress: "192.168.1.101",
      status: "success",
    },
    {
      id: "3",
      timestamp: "2024-01-14T22:30:00Z",
      device: "Unknown Device",
      location: "Unknown Location",
      ipAddress: "203.0.113.1",
      status: "failed",
    },
    {
      id: "4",
      timestamp: "2024-01-14T16:45:00Z",
      device: "Firefox on MacOS",
      location: "Boston, US",
      ipAddress: "10.0.0.50",
      status: "success",
    },
  ])

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Send notification
      await notificationHelper.notifyPasswordChange({
        userEmail: "demo@coinwayfinder.com",
        userName: "Demo User",
      })

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setTwoFactorEnabled(enabled)

      // Send notification
      await notificationHelper.notifyTwoFactorChange(enabled, {
        userEmail: "demo@coinwayfinder.com",
        userName: "Demo User",
      })

      toast({
        title: enabled ? "2FA Enabled" : "2FA Disabled",
        description: enabled
          ? "Two-factor authentication has been enabled for your account."
          : "Two-factor authentication has been disabled for your account.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update two-factor authentication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Send security alert
      await notificationHelper.notifySecurityAlert(
        "Session Terminated",
        `A session was manually terminated from your account.`,
        {
          userEmail: "demo@coinwayfinder.com",
          userName: "Demo User",
        },
      )

      toast({
        title: "Session Terminated",
        description: "The session has been terminated successfully.",
      })
    } catch (error) {
      toast({
        title: "Termination Failed",
        description: "Failed to terminate session. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
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
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={
              loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </>
            )}
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
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Enable 2FA</p>
              <p className="text-sm text-gray-400">Require a verification code from your phone when signing in</p>
            </div>
            <div className="flex items-center gap-2">
              {twoFactorEnabled ? (
                <Badge variant="secondary" className="bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-600 text-white">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Disabled
                </Badge>
              )}
              <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} disabled={loading} />
            </div>
          </div>

          {!twoFactorEnabled && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">Security Recommendation</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Enable two-factor authentication to significantly improve your account security.
                  </p>
                </div>
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
          <CardDescription>Configure your security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Login Alerts</p>
              <p className="text-sm text-gray-400">Get notified when someone signs into your account</p>
            </div>
            <Switch checked={loginAlertsEnabled} onCheckedChange={setLoginAlertsEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Session Timeout</p>
              <p className="text-sm text-gray-400">Automatically log out after 30 minutes of inactivity</p>
            </div>
            <Switch checked={sessionTimeoutEnabled} onCheckedChange={setSessionTimeoutEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                      <span>{session.ipAddress}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription>Recent login attempts to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginHistory.map((login) => (
              <div key={login.id} className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded-full ${login.status === "success" ? "bg-green-600" : "bg-red-600"}`}>
                    {login.status === "success" ? (
                      <CheckCircle className="h-3 w-3 text-white" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{login.device}</p>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${login.status === "success" ? "bg-green-600" : "bg-red-600"} text-white`}
                      >
                        {login.status === "success" ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {login.location}
                      </span>
                      <span>{login.ipAddress}</span>
                      <span>{formatDate(login.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
