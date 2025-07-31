"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ProfileOverview } from "@/components/profile/profile-overview"
import { PersonalInfo } from "@/components/profile/personal-info"
import { SecuritySettings } from "@/components/profile/security-settings"
import { NotificationSettings } from "@/components/profile/notification-settings"
import { TradingPreferences } from "@/components/profile/trading-preferences"
import { ApiKeyManagement } from "@/components/profile/api-key-management"
import { BillingSubscription } from "@/components/profile/billing-subscription"
import { ActivityLogs } from "@/components/profile/activity-logs"
import { DataManagement } from "@/components/profile/data-management"
import { AccountDeletion } from "@/components/profile/account-deletion"
import { OAuthAccountManager } from "@/components/profile/oauth-account-manager"
import { BackToDashboard } from "@/components/back-to-dashboard"
import { User, Settings, Bell, TrendingUp, Key, CreditCard, Activity, Database, Link2, Shield } from "lucide-react"

export default function ProfileContent() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/auth/login"
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-400">Manage your account settings, preferences, and connected services</p>
          </div>
          <BackToDashboard />
        </div>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="oauth" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProfileOverview />
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <PersonalInfo />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="oauth" className="space-y-6">
            <OAuthAccountManager />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <TradingPreferences />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <ApiKeyManagement />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <BillingSubscription />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityLogs />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManagement />
            <AccountDeletion />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
