"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Link, Users, TrendingUp, Github } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ProviderStat {
  provider: string
  count: number
  lastUsed: string
  firstLinked: string
}

interface MultiAccountUser {
  id: string
  email: string
  username: string
  accountCount: number
  providers: string[]
}

interface RecentActivity {
  id: string
  email: string
  username: string
  provider: string
  linkedAt: string
  lastUsed: string
}

interface OAuthStats {
  providerStats: ProviderStat[]
  multiAccountUsers: MultiAccountUser[]
  recentActivity: RecentActivity[]
  adoptionTrend: Array<{
    _id: { date: string; provider: string }
    count: number
  }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminOAuthPage() {
  const [stats, setStats] = useState<OAuthStats>({
    providerStats: [],
    multiAccountUsers: [],
    recentActivity: [],
    adoptionTrend: [],
  })
  const [loading, setLoading] = useState(true)

  const fetchOAuthStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/oauth/stats")
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      } else {
        toast.error(data.error || "Failed to fetch OAuth statistics")
      }
    } catch (error) {
      toast.error("Failed to fetch OAuth statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOAuthStats()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "github":
        return <Github className="h-4 w-4" />
      case "google":
        return (
          <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">G</div>
        )
      default:
        return <Link className="h-4 w-4" />
    }
  }

  const totalOAuthUsers = stats.providerStats.reduce((sum, stat) => sum + stat.count, 0)

  // Prepare chart data
  const pieChartData = stats.providerStats.map((stat, index) => ({
    name: stat.provider,
    value: stat.count,
    color: COLORS[index % COLORS.length],
  }))

  // Prepare trend data
  const trendData = stats.adoptionTrend.reduce((acc, item) => {
    const date = item._id.date
    const existing = acc.find((d) => d.date === date)
    if (existing) {
      existing[item._id.provider] = item.count
      existing.total += item.count
    } else {
      acc.push({
        date,
        [item._id.provider]: item.count,
        total: item.count,
      })
    }
    return acc
  }, [] as any[])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OAuth Management</h1>
          <p className="text-muted-foreground">Monitor and manage OAuth provider integrations</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="users">Multi-Account Users</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total OAuth Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOAuthUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
                  <Link className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.providerStats.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Multi-Account Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.multiAccountUsers.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Links</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentActivity.length}</div>
                  <p className="text-xs text-muted-foreground">Last 20 activities</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Provider Distribution</CardTitle>
                  <CardDescription>OAuth accounts by provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Adoption Trend</CardTitle>
                  <CardDescription>OAuth account links over time (last 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>OAuth Providers</CardTitle>
                <CardDescription>Statistics for each OAuth provider</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>First Linked</TableHead>
                      <TableHead>Last Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.providerStats.map((stat) => (
                      <TableRow key={stat.provider}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getProviderIcon(stat.provider)}
                            <span className="font-medium capitalize">{stat.provider}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{stat.count}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(stat.firstLinked)}</TableCell>
                        <TableCell className="text-sm">{stat.lastUsed ? formatDate(stat.lastUsed) : "Never"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Account Users</CardTitle>
                <CardDescription>Users with multiple OAuth accounts linked</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Accounts</TableHead>
                      <TableHead>Providers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.multiAccountUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{user.accountCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.providers.map((provider, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {provider}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent OAuth Activity</CardTitle>
                <CardDescription>Latest OAuth account links and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Linked</TableHead>
                      <TableHead>Last Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentActivity.map((activity) => (
                      <TableRow key={`${activity.id}-${activity.provider}`}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{activity.username}</div>
                            <div className="text-sm text-muted-foreground">{activity.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getProviderIcon(activity.provider)}
                            <span className="capitalize">{activity.provider}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(activity.linkedAt)}</TableCell>
                        <TableCell className="text-sm">
                          {activity.lastUsed ? formatDate(activity.lastUsed) : "Never"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
