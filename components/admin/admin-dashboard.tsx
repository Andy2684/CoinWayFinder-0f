"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, Bot, TrendingUp, DollarSign, Activity, Settings, FileText } from "lucide-react"
import { UserManagement } from "./user-management"

interface AdminStats {
  overview: {
    totalUsers: number
    activeUsers: number
    totalBots: number
    activeBots: number
    totalSignals: number
    activeSignals: number
    totalRevenue: number
  }
  userGrowth: Array<{ month: string; users: number }>
  planDistribution: Array<{ plan: string; count: number; percentage: number }>
  recentActivity: Array<{
    id: number
    type: string
    message: string
    timestamp: string
  }>
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return <Users className="w-4 h-4 text-green-400" />
      case "bot_created":
        return <Bot className="w-4 h-4 text-blue-400" />
      case "signal_triggered":
        return <TrendingUp className="w-4 h-4 text-yellow-400" />
      case "payment_received":
        return <DollarSign className="w-4 h-4 text-green-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30D5C8] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#191A1E] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your CoinWayFinder platform</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
              User Management
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-[#30D5C8]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{stats.overview.totalUsers.toLocaleString()}</div>
                      <p className="text-xs text-green-400">{stats.overview.activeUsers} active users</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Trading Bots</CardTitle>
                      <Bot className="h-4 w-4 text-[#30D5C8]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{stats.overview.totalBots}</div>
                      <p className="text-xs text-green-400">{stats.overview.activeBots} active bots</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Signals</CardTitle>
                      <TrendingUp className="h-4 w-4 text-[#30D5C8]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {stats.overview.totalSignals.toLocaleString()}
                      </div>
                      <p className="text-xs text-yellow-400">{stats.overview.activeSignals} active signals</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-[#30D5C8]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        ${stats.overview.totalRevenue.toLocaleString()}
                      </div>
                      <p className="text-xs text-green-400">+12% from last month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Plan Distribution */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Subscription Plans</CardTitle>
                    <CardDescription className="text-gray-400">
                      Distribution of users across different plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.planDistribution.map((plan) => (
                      <div key={plan.plan} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{plan.plan}</span>
                          <span className="text-gray-400">
                            {plan.count} users ({plan.percentage}%)
                          </span>
                        </div>
                        <Progress value={plan.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-gray-400">Latest platform activities and events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/50">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{activity.message}</p>
                            <p className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Settings
                </CardTitle>
                <CardDescription className="text-gray-400">Configure platform settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">System settings panel coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  System Logs
                </CardTitle>
                <CardDescription className="text-gray-400">View system logs and audit trails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">System logs viewer coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
