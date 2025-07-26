"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, Activity, Users, RefreshCw } from "lucide-react"

interface AuditLog {
  id: string
  userId?: string
  eventType: string
  eventCategory: string
  eventDescription: string
  ipAddress?: string
  userAgent?: string
  riskLevel: string
  success: boolean
  errorMessage?: string
  metadata: any
  createdAt: string
  email?: string
  username?: string
  firstName?: string
  lastName?: string
}

interface AuditStats {
  total_events: number
  failed_events: number
  high_risk_events: number
  critical_events: number
  events_last_24h: number
  events_last_7d: number
  unique_users: number
  unique_ips: number
}

export function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [topEventTypes, setTopEventTypes] = useState<any[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    eventCategory: "all",
    riskLevel: "all",
    success: "all",
    search: "",
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch stats first
      const statsResponse = await fetch("/api/admin/audit-logs/stats", {
        credentials: "include",
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.stats)
          setTopEventTypes(statsData.topEventTypes)
          setSecurityAlerts(statsData.securityAlerts)
          setInitialized(true)
        }
      }

      // Fetch logs
      const params = new URLSearchParams()
      if (filters.eventCategory !== "all") params.append("eventCategory", filters.eventCategory)
      if (filters.riskLevel !== "all") params.append("riskLevel", filters.riskLevel)
      if (filters.success !== "all") params.append("success", filters.success)
      params.append("limit", "50")

      const logsResponse = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: "include",
      })

      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        if (logsData.success) {
          setLogs(logsData.logs)
          setInitialized(true)
        }
      } else if (logsResponse.status === 401) {
        setError("Unauthorized access")
      }
    } catch (err) {
      console.error("Error fetching audit data:", err)
      setError("Failed to fetch audit data")
    } finally {
      setLoading(false)
    }
  }

  const initializeAuditSystem = async () => {
    try {
      const response = await fetch("/api/admin/audit-logs/initialize", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setInitialized(true)
        fetchData()
      } else {
        setError("Failed to initialize audit system")
      }
    } catch (err) {
      console.error("Error initializing audit system:", err)
      setError("Failed to initialize audit system")
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSuccessColor = (success: boolean) => {
    return success ? "outline" : "destructive"
  }

  if (loading && !initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading audit logs...</span>
      </div>
    )
  }

  if (error && !initialized) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          {error.includes("Failed to fetch") && (
            <Button onClick={initializeAuditSystem} className="ml-4" size="sm">
              Initialize Audit System
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_events.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.events_last_24h} in last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failed_events.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_events > 0 ? ((stats.failed_events / stats.total_events) * 100).toFixed(1) : 0}% failure
                rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.high_risk_events.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.critical_events} critical events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unique_users.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.unique_ips} unique IPs</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Event Logs</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search events..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full"
                  />
                </div>

                <Select
                  value={filters.eventCategory}
                  onValueChange={(value) => setFilters({ ...filters, eventCategory: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="authorization">Authorization</SelectItem>
                    <SelectItem value="user_management">User Management</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.riskLevel}
                  onValueChange={(value) => setFilters({ ...filters, riskLevel: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.success} onValueChange={(value) => setFilters({ ...filters, success: value })}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Success</SelectItem>
                    <SelectItem value="false">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={fetchData} variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest security and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.eventType}</div>
                              <div className="text-sm text-muted-foreground">{log.eventDescription}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.email ? (
                              <div>
                                <div className="font-medium">{log.email}</div>
                                {log.username && <div className="text-sm text-muted-foreground">@{log.username}</div>}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">System</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.ipAddress || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={getRiskLevelColor(log.riskLevel) as any}>{log.riskLevel}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSuccessColor(log.success) as any}>
                              {log.success ? "Success" : "Failed"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts (Last 24 Hours)</CardTitle>
              <CardDescription>High and critical risk events requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {securityAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No security alerts</p>
                  <p className="text-muted-foreground">All systems operating normally</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <Alert key={alert.id} className="border-orange-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{alert.eventDescription}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {alert.email && `User: ${alert.email} • `}
                              IP: {alert.ipAddress} •{new Date(alert.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={getRiskLevelColor(alert.riskLevel) as any}>{alert.riskLevel}</Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Event Types (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {topEventTypes.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No data available</p>
              ) : (
                <div className="space-y-4">
                  {topEventTypes.map((eventType, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{eventType.event_type}</div>
                        <div className="text-sm text-muted-foreground">{eventType.event_category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{eventType.count.toLocaleString()}</div>
                        {eventType.failed_count > 0 && (
                          <div className="text-sm text-destructive">{eventType.failed_count} failed</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
