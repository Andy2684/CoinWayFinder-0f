"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SecuritySettings } from "@/components/integrations/security-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function DashboardSettingsClient() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardSidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="mt-2 text-sm text-gray-300">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-8">
              {/* Profile Settings */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        defaultValue={user.firstName}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        defaultValue={user.lastName}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                      Username
                    </Label>
                    <Input
                      id="username"
                      defaultValue={user.username}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                </CardContent>
              </Card>

              <Separator className="bg-slate-700" />

              {/* Security Settings */}
              <SecuritySettings />

              {/* Account Settings */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage your account preferences and subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Current Plan</h3>
                      <p className="text-gray-300 text-sm">You are currently on the {user.plan} plan</p>
                    </div>
                    <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
                      Upgrade Plan
                    </Button>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Account Status</h3>
                      <p className="text-gray-300 text-sm">
                        Your account is {user.isVerified ? "verified" : "pending verification"}
                      </p>
                    </div>
                    {!user.isVerified && (
                      <Button
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                      >
                        Verify Account
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
