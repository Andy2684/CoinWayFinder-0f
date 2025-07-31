"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Loader2 } from "lucide-react"

interface NotificationStats {
  byType: Record<
    string,
    {
      total: number
      sent: number
      delivered: number
      failed: number
      first_sent: string
      last_sent: string
    }
  >
  overall: {
    total: number
    sent: number
    delivered: number
    failed: number
  }
}

export function NotificationStats() {
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/notifications/history/stats")

        if (!response.ok) {
          throw new Error("Failed to fetch notification statistics")
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        <p>No statistics available</p>
      </div>
    )
  }

  // Prepare data for charts
  const typeData = Object.entries(stats.byType).map(([type, data]) => ({
    name: formatNotificationType(type),
    total: data.total,
    sent: data.sent || 0,
    delivered: data.delivered || 0,
    failed: data.failed || 0,
  }))

  const statusData = [
    { name: "Sent", value: stats.overall.sent },
    { name: "Delivered", value: stats.overall.delivered },
    { name: "Failed", value: stats.overall.failed },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ff7c7c"]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total</CardTitle>
            <CardDescription>All notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overall.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Delivered</CardTitle>
            <CardDescription>Successfully delivered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.overall.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Failed</CardTitle>
            <CardDescription>Failed to deliver</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.overall.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="by-type">
        <TabsList>
          <TabsTrigger value="by-type">By Type</TabsTrigger>
          <TabsTrigger value="by-status">By Status</TabsTrigger>
        </TabsList>
        <TabsContent value="by-type" className="p-4 border rounded-md mt-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" name="Total" />
                <Bar dataKey="delivered" fill="#82ca9d" name="Delivered" />
                <Bar dataKey="failed" fill="#ff7c7c" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="by-status" className="p-4 border rounded-md mt-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatNotificationType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
