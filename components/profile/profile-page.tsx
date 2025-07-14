"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Mail,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  Settings,
  Phone,
  MapPin,
  Globe,
  Save,
  Edit3,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    website: user?.website || "",
    bio: user?.bio || "",
    timezone: user?.timezone || "UTC",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || "dark",
    notifications: user?.preferences?.notifications || true,
    twoFactor: user?.preferences?.twoFactor || false,
    emailAlerts: user?.preferences?.emailAlerts || true,
    smsAlerts: user?.preferences?.smsAlerts || false,
    tradingAlerts: user?.preferences?.tradingAlerts || true,
    newsAlerts: user?.preferences?.newsAlerts || true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: user?.securitySettings?.sessionTimeout || "30",
    ipWhitelist: user?.securitySettings?.ipWhitelist || false,
    apiAccess: user?.securitySettings?.apiAccess || false,
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    // Basic validation
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setMessage({ type: "error", text: "First name and last name are required" })
      setLoading(false)
      return
    }

    if (!profileData.email.trim() || !profileData.email.includes("@")) {
      setMessage({ type: "error", text: "Valid email address is required" })
      setLoading(false)
      return
    }

    if (!profileData.username.trim() || profileData.username.length < 3) {
      setMessage({ type: "error", text: "Username must be at least 3 characters long" })
      setLoading(false)
      return
    }

    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" })
        setIsEditing(false)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    if (!passwordData.currentPassword) {
      setMessage({ type: "error", text: "Current password is required" })
      setLoading(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long" })
      setLoading(false)
      return
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword)
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword)
    const hasNumbers = /\d/.test(passwordData.newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setMessage({
        type: "error",
        text: "Password must contain uppercase, lowercase, numbers, and special characters",
      })
      setLoading(false)
      return
    }

    try {
      // Simulate API call for password update
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage({ type: "success", text: "Password updated successfully!" })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update password" })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const result = await updateProfile({ preferences })
      if (result.success) {
        setMessage({ type: "success", text: "Preferences updated successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update preferences" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const handleSecurityUpdate = async () => {
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const result = await updateProfile({ securitySettings })
      if (result.success) {
        setMessage({ type: "success", text: "Security settings updated successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update security settings" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

    const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

    return { level: levels[strength - 1] || "Very Weak", color: colors[strength - 1] || "bg-red-500", strength }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#191A1E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#30D5C8]" />
      </div>
    )
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  return (
    <div className="min-h-screen bg-[#191A1E] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-2xl bg-[#30D5C8] text-[#191A1E]">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 p-0 bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-400 text-lg">@{user.username}</p>
                <p className="text-gray-500 mt-1">{user.email}</p>
                <div className="flex items-center space-x-2 mt-3">
                  <Badge variant={user.isVerified ? "default" : "secondary"} className="bg-green-500/10 text-green-400">
                    {user.isVerified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </>
                    )}
                  </Badge>
                  <Badge className="bg-[#30D5C8]/10 text-[#30D5C8] capitalize">{user.role}</Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                    {user.plan} Plan
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Member since</p>
                <p className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Alert */}
        {message.text && (
          <Alert
            className={
              message.type === "success" ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"
            }
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-300" : "text-red-300"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              <Mail className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">
                        First Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">
                        Last Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">
                        Username *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          disabled={!isEditing}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">
                        Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          disabled={!isEditing}
                          placeholder="New York, NY"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white">
                      Website
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        disabled={!isEditing}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white resize-none"
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 text-right">{profileData.bio.length}/500</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Member Since</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        disabled
                        className="pl-10 bg-gray-800 border-gray-700 text-gray-400"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setProfileData({
                            firstName: user?.firstName || "",
                            lastName: user?.lastName || "",
                            username: user?.username || "",
                            email: user?.email || "",
                            phone: user?.phone || "",
                            location: user?.location || "",
                            website: user?.website || "",
                            bio: user?.bio || "",
                            timezone: user?.timezone || "UTC",
                          })
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Change Password</CardTitle>
                  <CardDescription className="text-gray-400">Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white">
                        Current Password *
                      </Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          required
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
                        New Password *
                      </Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          required
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
                      {passwordData.newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{passwordStrength.level}</span>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p className={passwordData.newPassword.length >= 8 ? "text-green-400" : ""}>
                              ✓ At least 8 characters
                            </p>
                            <p className={/[A-Z]/.test(passwordData.newPassword) ? "text-green-400" : ""}>
                              ✓ One uppercase letter
                            </p>
                            <p className={/[a-z]/.test(passwordData.newPassword) ? "text-green-400" : ""}>
                              ✓ One lowercase letter
                            </p>
                            <p className={/\d/.test(passwordData.newPassword) ? "text-green-400" : ""}>✓ One number</p>
                            <p
                              className={
                                /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? "text-green-400" : ""
                              }
                            >
                              ✓ One special character
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirm New Password *
                      </Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          required
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
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-red-400">Passwords do not match</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure additional security options for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-400">
                        {preferences.twoFactor
                          ? "Two-factor authentication is enabled"
                          : "Add an extra layer of security to your account"}
                      </p>
                    </div>
                    <Switch
                      checked={preferences.twoFactor}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, twoFactor: checked })}
                    />
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">IP Whitelist</p>
                      <p className="text-sm text-gray-400">Only allow access from specific IP addresses</p>
                    </div>
                    <Switch
                      checked={securitySettings.ipWhitelist}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, ipWhitelist: checked })}
                    />
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">API Access</p>
                      <p className="text-sm text-gray-400">Enable API access for third-party applications</p>
                    </div>
                    <Switch
                      checked={securitySettings.apiAccess}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, apiAccess: checked })}
                    />
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="space-y-2">
                    <Label className="text-white font-medium">Session Timeout</Label>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="240">4 hours</option>
                      <option value="480">8 hours</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleSecurityUpdate}
                    className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Security Settings"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Account Preferences</CardTitle>
                <CardDescription className="text-gray-400">
                  Customize your account settings and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-white font-medium">Theme Preference</Label>
                  <div className="flex space-x-4">
                    <Button
                      variant={preferences.theme === "dark" ? "default" : "outline"}
                      onClick={() => setPreferences({ ...preferences, theme: "dark" })}
                      className={
                        preferences.theme === "dark"
                          ? "bg-[#30D5C8] text-[#191A1E]"
                          : "border-gray-600 text-gray-300 hover:bg-gray-800"
                      }
                    >
                      Dark
                    </Button>
                    <Button
                      variant={preferences.theme === "light" ? "default" : "outline"}
                      onClick={() => setPreferences({ ...preferences, theme: "light" })}
                      className={
                        preferences.theme === "light"
                          ? "bg-[#30D5C8] text-[#191A1E]"
                          : "border-gray-600 text-gray-300 hover:bg-gray-800"
                      }
                    >
                      Light
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="space-y-2">
                  <Label className="text-white font-medium">Timezone</Label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                  </select>
                </div>

                <Separator className="bg-gray-700" />

                <Button
                  onClick={handlePreferencesUpdate}
                  className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Notification Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive general email updates about your account</p>
                  </div>
                  <Switch
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: checked })}
                  />
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Alerts</p>
                    <p className="text-sm text-gray-400">Receive important alerts via email</p>
                  </div>
                  <Switch
                    checked={preferences.emailAlerts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, emailAlerts: checked })}
                  />
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">SMS Alerts</p>
                    <p className="text-sm text-gray-400">Receive critical alerts via SMS</p>
                  </div>
                  <Switch
                    checked={preferences.smsAlerts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, smsAlerts: checked })}
                  />
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Trading Alerts</p>
                    <p className="text-sm text-gray-400">Get notified about trading opportunities and signals</p>
                  </div>
                  <Switch
                    checked={preferences.tradingAlerts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, tradingAlerts: checked })}
                  />
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">News Alerts</p>
                    <p className="text-sm text-gray-400">Receive notifications about market news and updates</p>
                  </div>
                  <Switch
                    checked={preferences.newsAlerts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, newsAlerts: checked })}
                  />
                </div>

                <Separator className="bg-gray-700" />

                <Button
                  onClick={handlePreferencesUpdate}
                  className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Notification Settings"
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
