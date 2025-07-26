"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, Activity, Users, Globe, Clock, Filter } from "lucide-react"
import { format } from "date-fns"

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
  createdAt: string
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  metadata?: Record<string, any>
}

interface AuditStats {
  totalEvents: number
  failedEvents: number
  highRiskEvents: number
  criticalEvents: number
  eventsLast24h: number
  eventsLast7d: number
  uniqueUsers: number
  uniqueIps: number
}

interface TopEventType {
  eventType: string
  eventCategory: string
  count: number
  failedCount: number
}

export function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [topEventTypes, setTopEventTypes] = useState<TopEventType[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    eventCategory: "all",
    eventType: "all",
    riskLevel: "all",
    success: "all",
    userId: "",
    ipAddress: "",
    limit: 100,
    offset: 0,
  })

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs")
      }

      const data = await response.json()
      setLogs(data.logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/audit-logs/stats", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }

      const data = await response.json()
      setStats(data.stats)
      setTopEventTypes(data.topEventTypes)
      setSecurityAlerts(data.securityAlerts)
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchAuditLogs()
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

  const getEventCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <Shield className="h-4 w-4" />
      case "security":
        return <AlertTriangle className="h-4 w-4" />
      case "system":
        return <Activity className="h-4 w-4" />
      case "user_management":
        return <Users className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.eventsLast24h} in last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failedEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.failedEvents / stats.totalEvents) * 100).toFixed(1)}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.highRiskEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.criticalEvents} critical events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.uniqueIps} unique IPs</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select
                  value={filters.eventCategory}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, eventCategory: value }))}
                >
                  <SelectTrigger>
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
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, riskLevel: value }))}
                >
                  <SelectTrigger>
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

                <Select
                  value={filters.success}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, success: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Success</SelectItem>
                    <SelectItem value="false">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="User ID"
                  value={filters.userId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
                />

                <Input
                  placeholder="IP Address"
                  value={filters.ipAddress}
                  onChange={(e) => setFilters((prev) => ({ ...prev, ipAddress: e.target.value }))}
                />

                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      eventCategory: "all",
                      eventType: "all",
                      riskLevel: "all",
                      success: "all",
                      userId: "",
                      ipAddress: "",
                      limit: 100,
                      offset: 0,
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Showing {logs.length} events</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading audit logs...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getEventCategoryIcon(log.eventCategory)}
                              <div>
                                <div className="font-medium">{log.eventType}</div>
                                <div className="text-xs text-muted-foreground">{log.eventCategory}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.email ? (
                              <div>
                                <div className="font-medium">
                                  {log.firstName} {log.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">{log.email}</div>
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
                            <Badge variant={log.success ? "default" : "destructive"}>
                              {log.success ? "Success" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate" title={log.eventDescription}>
                              {log.eventDescription}
                            </div>
                            {log.errorMessage && (
                              <div className="text-xs text-destructive mt-1">{log.errorMessage}</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Security Alerts (Last 24 Hours)
              </CardTitle>
              <CardDescription>High and critical risk events requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {securityAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No security alerts in the last 24 hours</div>
              ) : (
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <Alert key={alert.id} variant={alert.riskLevel === "critical" ? "destructive" : "default"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{alert.eventDescription}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {alert.email && `User: ${alert.email} • `}
                              IP: {alert.ipAddress} •{format(new Date(alert.createdAt), "MMM dd, HH:mm:ss")}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Event Types (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topEventTypes.map((eventType, index) => (
                    <div
                      key={`${eventType.eventType}-${eventType.eventCategory}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{eventType.eventType}</div>
                          <div className="text-xs text-muted-foreground">{eventType.eventCategory}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{eventType.count.toLocaleString()}</div>
                        {eventType.failedCount > 0 && (
                          <div className="text-xs text-destructive">{eventType.failedCount} failed</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Success Rate</span>
                    <span className="font-medium">
                      {stats ? ((1 - stats.failedEvents / stats.totalEvents) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Events Last 24h</span>
                    <span className="font-medium">{stats?.eventsLast24h.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Events Last 7d</span>
                    <span className="font-medium">{stats?.eventsLast7d.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unique Users</span>
                    <span className="font-medium">{stats?.uniqueUsers.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unique IP Addresses</span>
                    <span className="font-medium">{stats?.uniqueIps.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
