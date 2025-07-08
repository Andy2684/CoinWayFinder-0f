"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Calendar, Crown, Gift } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const [userSettings, setUserSettings] = useState<any>(null)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }

    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      })
      fetchUserSettings()
    }
  }, [user, loading, router])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch("/api/user/settings")
      if (response.ok) {
        const data = await response.json()
        setUserSettings(data.settings)
      }
    } catch (error) {
      console.error("Failed to fetch user settings:", error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Profile updated successfully!")
        await refreshUser()
      } else {
        setMessage(data.error || "Failed to update profile")
      }
    } catch (error) {
      setMessage("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#30D5C8]" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-100 text-gray-800"
      case "basic":
        return "bg-blue-100 text-blue-800"
      case "premium":
        return "bg-purple-100 text-purple-800"
      case "enterprise":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400">Manage your account and subscription</p>
          </div>

          {message && (
            <Alert
              className={message.includes("success") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
            >
              <AlertDescription className={message.includes("success") ? "text-green-800" : "text-red-800"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-[#30D5C8] text-black text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <p className="text-gray-400">{user.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <Button type="submit" disabled={updating} className="w-full">
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Subscription
                </CardTitle>
                <CardDescription className="text-gray-400">Your current plan and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSettings ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Current Plan</span>
                      <Badge className={getPlanColor(userSettings.subscription.plan)}>
                        {userSettings.subscription.plan.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Status</span>
                      <Badge variant={userSettings.subscription.status === "active" ? "default" : "destructive"}>
                        {userSettings.subscription.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Started</span>
                      <span className="text-white">{formatDate(userSettings.subscription.startDate)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Expires</span>
                      <span className="text-white">{formatDate(userSettings.subscription.endDate)}</span>
                    </div>

                    {userSettings.subscription.trialUsed && (
                      <div className="flex items-center gap-2 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                        <Gift className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-400 text-sm">Trial period used</span>
                      </div>
                    )}

                    <Separator className="bg-gray-700" />

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Referral Program</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Your Code</span>
                        <code className="bg-gray-700 px-2 py-1 rounded text-[#30D5C8]">
                          {userSettings.referrals.referralCode}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Referrals</span>
                        <span className="text-white">{userSettings.referrals.referredUsers.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Bonus Days</span>
                        <span className="text-[#30D5C8]">+{userSettings.referrals.bonusDays}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black">Upgrade Plan</Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#30D5C8]" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#30D5C8]">0</div>
                  <div className="text-sm text-gray-400">Active Bots</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#30D5C8]">0</div>
                  <div className="text-sm text-gray-400">Total Trades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#30D5C8]">$0.00</div>
                  <div className="text-sm text-gray-400">Total Profit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#30D5C8]">0%</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
