"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Shield, Key, Smartphone, Eye, EyeOff, AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react"
import { notificationHelper } from "@/lib/notification-helper"
import { useAuth } from "@/hooks/use-auth"

interface SecuritySettingsProps {
  user: {
    id: string
    email: string
    name: string
    twoFactorEnabled: boolean
    lastPasswordChange?: string
    activeSessions: Array<{
      id: string
      device: string
      location: string
      lastActive: string
      current: boolean
    }>
  }
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const { token } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isToggling2FA, setIsToggling2FA] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsChangingPassword(true)

    try {
      // Get client IP for logging
      const ipResponse = await fetch("https://api.ipify.org?format=json")
      const { ip } = await ipResponse.json()

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to change password")
      }

      // Send email notification
      if (token) {
        notificationHelper.setAuthToken(token)
        await notificationHelper.sendPasswordChangeNotification(user.email, user.name, ip)
      }

      toast.success("Password changed successfully")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error(error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleToggle2FA = async () => {
    setIsToggling2FA(true)

    try {
      const response = await fetch("/api/auth/toggle-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: !user.twoFactorEnabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle 2FA")
      }

      // Send email notification
      if (token) {
        notificationHelper.setAuthToken(token)
        await notificationHelper.sendTwoFactorStatusChange(user.email, user.name, !user.twoFactorEnabled)
      }

      toast.success(`Two-factor authentication ${!user.twoFactorEnabled ? "enabled" : "disabled"}`)
    } catch (error) {
      console.error("Error toggling 2FA:", error)
      toast.error("Failed to update two-factor authentication")
    } finally {
      setIsToggling2FA(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/auth/terminate-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error("Failed to terminate session")
      }

      // Send security alert
      if (token) {
        notificationHelper.setAuthToken(token)
        await notificationHelper.sendSecurityAlert(
          user.email,
          user.name,
          "Session Terminated",
          `A session was manually terminated from your account settings.`,
        )
      }

      toast.success("Session terminated successfully")
    } catch (error) {
      console.error("Error terminating session:", error)
      toast.error("Failed to terminate session")
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.lastPasswordChange && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Last changed: {new Date(user.lastPasswordChange).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={
              isChangingPassword ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
          >
            {isChangingPassword ? "Changing Password..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Two-Factor Authentication</span>
                <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {user.twoFactorEnabled ? "Your account is protected with 2FA" : "Enable 2FA to secure your account"}
              </p>
            </div>
            <Switch checked={user.twoFactorEnabled} onCheckedChange={handleToggle2FA} disabled={isToggling2FA} />
          </div>

          {user.twoFactorEnabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is active. You'll need your authenticator app to sign in.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage your active sessions across different devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{session.device}</span>
                  {session.current && <Badge variant="default">Current Session</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {session.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last active: {new Date(session.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm" onClick={() => handleTerminateSession(session.id)}>
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {user.twoFactorEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className={user.twoFactorEnabled ? "text-green-700" : "text-yellow-700"}>
                {user.twoFactorEnabled ? "Two-factor authentication is enabled" : "Enable two-factor authentication"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {user.lastPasswordChange &&
              new Date(user.lastPasswordChange).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span
                className={
                  user.lastPasswordChange &&
                  new Date(user.lastPasswordChange).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
                    ? "text-green-700"
                    : "text-yellow-700"
                }
              >
                {user.lastPasswordChange &&
                new Date(user.lastPasswordChange).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
                  ? "Password recently updated"
                  : "Consider updating your password"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {user.activeSessions.length <= 3 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className={user.activeSessions.length <= 3 ? "text-green-700" : "text-yellow-700"}>
                {user.activeSessions.length <= 3 ? "Normal number of active sessions" : "Many active sessions detected"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
