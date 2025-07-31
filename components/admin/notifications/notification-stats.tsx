"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Mail, CheckCircle, XCircle, TrendingUp, AlertTriangle } from "lucide-react"

interface NotificationStats {
  overview: {
    totalNotifications: number
    sentCount: number
    deliveredCount: number
    failedCount: number
    pendingCount: number
    deliveryRate: number
  }
  byType: Array<{
    type: string
    count: number
    deliveredCount: number
    failedCount: number
    deliveryRate: string
  }>
  dailyStats: Array<{
    date: string
    count: number
    deliveredCount: number
    failedCount: number
  }>
  recentFailures: Array<{
    id: number
    type: string
    subject: string
    recipients: string[]
    errorMessage: string
    createdAt: string
  }>
}

interface NotificationStatsProps {
  stats: NotificationStats
  loading: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const getTypeColor = (type: string) => {
  switch (type) {
    case "security":
      return "destructive"
    case "admin":
      return "default"
    case "system":
      return "secondary"
    case "user":
      return "outline"
    default:
      return "default"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "text-green-600"
    case "failed":
      return "text-red-600"
    case "pending":
      return "text-yellow-600"
    case "sent":
      return "text-blue-600"
    default:
      return "text-gray-600"
  }
}

export function NotificationStats({ stats, loading }: NotificationStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const pieData = [
    { name: "Delivered", value: stats.overview.deliveredCount, color: "#00C49F" },
    { name: "Failed", value: stats.overview.failedCount, color: "#FF8042" },
    { name: "Pending", value: stats.overview.pendingCount, color: "#FFBB28" },
    { name: "Sent", value: stats.overview.sentCount, color: "#0088FE" },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalNotifications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.overview.deliveredCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overview.failedCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Delivery failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.deliveryRate}%</div>
            <Progress value={stats.overview.deliveryRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications by Type</CardTitle>
            <CardDescription>Distribution of notification types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of notification statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
          <CardDescription>Notification volume over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deliveredCount" stackId="a" fill="#00C49F" name="Delivered" />
              <Bar dataKey="failedCount" stackId="a" fill="#FF8042" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Failures */}
      {stats.recentFailures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Recent Failures
            </CardTitle>
            <CardDescription>Latest failed notification deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentFailures.map((failure) => (
                <div key={failure.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeColor(failure.type)}>{failure.type}</Badge>
                      <span className="font-medium">{failure.subject}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">To: {failure.recipients.join(", ")}</p>
                    <p className="text-sm text-red-600">{failure.errorMessage}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(failure.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
