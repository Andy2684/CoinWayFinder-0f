"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useAuthContext } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { User, Shield, Bell, Settings, Key, CreditCard, Activity, Database, Trash2 } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-300">Manage your account settings and preferences</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 bg-slate-800/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="trading" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
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
              <TabsTrigger value="delete" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ProfileOverview />
            </TabsContent>

            <TabsContent value="personal">
              <PersonalInfo />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="trading">
              <TradingPreferences />
            </TabsContent>

            <TabsContent value="api">
              <ApiKeyManagement />
            </TabsContent>

            <TabsContent value="billing">
              <BillingSubscription />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityLogs />
            </TabsContent>

            <TabsContent value="data">
              <DataManagement />
            </TabsContent>

            <TabsContent value="delete">
              <AccountDeletion />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
