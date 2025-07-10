"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  Clock,
  Component,
  AlertCircle,
  Info,
  XCircle,
} from "lucide-react"
import { useComprehensiveErrorHandler } from "@/hooks/use-comprehensive-error-handler"
import { format } from "date-fns"

export function ErrorMonitoringDashboard() {
  const { errors, getErrorStats, exportErrors, resolveError, clearErrors } = useComprehensiveErrorHandler()
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("24h")

  const stats = useMemo(() => getErrorStats(), [getErrorStats])

  const filteredErrors = useMemo(() => {
    let filtered = errors

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (error) =>
          error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          error.context.component?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          error.context.action?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((error) => error.severity === severityFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      const isResolved = statusFilter === "resolved"
      filtered = filtered.filter((error) => error.resolved === isResolved)
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date()
      const timeThresholds = {
        "1h": 1 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      }

      const threshold = timeThresholds[timeFilter as keyof typeof timeThresholds]
      if (threshold) {
        filtered = filtered.filter((error) => now.getTime() - error.timestamp.getTime() <= threshold)
      }
    }

    return filtered
  }, [errors, searchTerm, severityFilter, statusFilter, timeFilter])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "low":
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getResolutionRate = () => {
    if (stats.total === 0) return 0
    return Math.round((stats.resolved / stats.total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Error Monitoring</h2>
          <p className="text-muted-foreground">Monitor and manage application errors in real-time</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportErrors}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="destructive" onClick={clearErrors}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.unresolved} unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getResolutionRate()}%</div>
            <Progress value={getResolutionRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bySeverity.critical || 0}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Affected</CardTitle>
            <Component className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.byComponent)[0] || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{Object.values(stats.byComponent)[0] || 0} errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search errors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Errors ({filteredErrors.length})</CardTitle>
              <CardDescription>Recent application errors and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredErrors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold">No errors found</h3>
                  <p className="text-muted-foreground">
                    {errors.length === 0
                      ? "Great! No errors have been reported."
                      : "No errors match your current filters."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredErrors.map((error) => (
                    <div
                      key={error.id}
                      className={`p-4 border rounded-lg ${
                        error.resolved ? "bg-green-50 border-green-200" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            {getSeverityIcon(error.severity)}
                            <Badge variant={getSeverityColor(error.severity) as any}>{error.severity}</Badge>
                            {error.resolved && (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Resolved
                              </Badge>
                            )}
                            {error.retryCount > 0 && <Badge variant="secondary">Retried {error.retryCount}x</Badge>}
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm">{error.message}</h4>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {format(error.timestamp, "MMM dd, HH:mm:ss")}
                              </span>
                              {error.context.component && (
                                <span className="flex items-center">
                                  <Component className="mr-1 h-3 w-3" />
                                  {error.context.component}
                                </span>
                              )}
                              {error.context.action && <span>Action: {error.context.action}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {!error.resolved && (
                            <Button size="sm" variant="outline" onClick={() => resolveError(error.id)}>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Component Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Errors by Component</CardTitle>
              <CardDescription>Distribution of errors across different components</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.byComponent).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No component data available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.byComponent)
                    .sort(([, a], [, b]) => b - a)
                    .map(([component, count]) => (
                      <div key={component} className="flex items-center justify-between">
                        <span className="font-medium">{component}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(stats.byComponent))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Severity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Errors by Severity</CardTitle>
              <CardDescription>Breakdown of error severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["critical", "high", "medium", "low"] as const).map((severity) => (
                  <div key={severity} className="text-center">
                    <div className="flex justify-center mb-2">{getSeverityIcon(severity)}</div>
                    <div className="text-2xl font-bold">{stats.bySeverity[severity] || 0}</div>
                    <div className="text-sm text-muted-foreground capitalize">{severity}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
