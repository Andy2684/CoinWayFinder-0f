"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Users, UserCheck, Shield, Link, Activity, TrendingUp, AlertTriangle, Database } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface AdminStats {
  users: {
    total: number
    verified: number
    admins: number
    oauth: number
    newToday: number
    newThisWeek: number
  }
  system: {
    uptime: string
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
  security: {
    failedLogins: number
    blockedIPs: number
    activeThreats: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    users: {
      total: 0,
      verified: 0,
      admins: 0,
      oauth: 0,
      newToday: 0,
      newThisWeek: 0,
    },
    system: {
      uptime: "0 days",
      memoryUsage: 0,
      cpuUsage: 0,
      diskUsage: 0,
    },
    security: {
      failedLogins: 0,
      blockedIPs: 0,
      activeThreats: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  // Mock data for charts
  const userGrowthData = [
    { name: "Jan", users: 400 },
    { name: "Feb", users: 300 },
    { name: "Mar", users: 600 },
    { name: "Apr", users: 800 },
    { name: "May", users: 700 },
    { name: "Jun", users: 900 },
  ]

  const systemMetricsData = [
    { name: "CPU", value: stats.system.cpuUsage },
    { name: "Memory", value: stats.system.memoryUsage },
    { name: "Disk", value: stats.system.diskUsage },
  ]

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API calls
      setStats({
        users: {
          total: 1250,
          verified: 980,
          admins: 5,
          oauth: 750,
          newToday: 12,
          newThisWeek: 89,
        },
        system: {
          uptime: "15 days, 4 hours",
          memoryUsage: 68,
          cpuUsage: 45,
          diskUsage: 32,
        },
        security: {
          failedLogins: 23,
          blockedIPs: 8,
          activeThreats: 2,
        },
      })
    } catch (error) {
      toast.error("Failed to fetch admin statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your CoinWayFinder platform</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">+{stats.users.newToday} today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.verified}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.users.verified / stats.users.total) * 100)}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OAuth Users</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.oauth}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.users.oauth / stats.users.total) * 100)}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.admins}</div>
                <p className="text-xs text-muted-foreground">Active administrators</p>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.system.uptime}</div>
                <p className="text-xs text-muted-foreground">System running smoothly</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.system.memoryUsage}%</div>
                <p className="text-xs text-muted-foreground">Of available memory</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.security.failedLogins}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.security.activeThreats}</div>
                <p className="text-xs text-muted-foreground">Monitoring active</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registration trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>Current system resource usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={systemMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Latest user registrations and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-muted-foreground">john.doe@example.com - 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">OAuth account linked</p>
                      <p className="text-xs text-muted-foreground">
                        jane.smith@example.com linked Google - 5 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email verification</p>
                      <p className="text-xs text-muted-foreground">
                        mike.wilson@example.com verified email - 8 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Admin action</p>
                      <p className="text-xs text-muted-foreground">User promoted to admin - 15 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>Recent security events and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Multiple failed login attempts</p>
                      <p className="text-xs text-muted-foreground">IP: 192.168.1.100 - 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Suspicious activity detected</p>
                      <p className="text-xs text-muted-foreground">Unusual login pattern - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Security scan completed</p>
                      <p className="text-xs text-muted-foreground">No threats detected - 3 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System backup completed</p>
                      <p className="text-xs text-muted-foreground">Database backup successful - 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Badge variant="outline" className="p-3 cursor-pointer hover:bg-muted">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Badge>
                <Badge variant="outline" className="p-3 cursor-pointer hover:bg-muted">
                  <Link className="w-4 h-4 mr-2" />
                  OAuth Settings
                </Badge>
                <Badge variant="outline" className="p-3 cursor-pointer hover:bg-muted">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Logs
                </Badge>
                <Badge variant="outline" className="p-3 cursor-pointer hover:bg-muted">
                  <Database className="w-4 h-4 mr-2" />
                  Database Health
                </Badge>
                <Badge variant="outline" className="p-3 cursor-pointer hover:bg-muted">
                  <Activity className="w-4 h-4 mr-2" />
                  System Monitor
                </Badge>
                <Badge variant="outline" className="p-3 cursor-pointer hover:bg-muted">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
