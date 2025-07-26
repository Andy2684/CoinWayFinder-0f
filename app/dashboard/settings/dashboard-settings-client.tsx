"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SecuritySettings } from "@/components/integrations/security-settings"
import { ExchangeIntegrations } from "@/components/integrations/exchange-integrations"
import { TradingFeatures } from "@/components/integrations/trading-features"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardSettingsClient() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="lg:pl-64">
          <DashboardHeader />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>

              <Tabs defaultValue="security" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
                  <TabsTrigger value="trading">Trading</TabsTrigger>
                </TabsList>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your account security and authentication preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SecuritySettings />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="exchanges">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exchange Integrations</CardTitle>
                      <CardDescription>Connect and manage your cryptocurrency exchange accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ExchangeIntegrations />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trading">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trading Features</CardTitle>
                      <CardDescription>Configure your trading preferences and risk management settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TradingFeatures />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
