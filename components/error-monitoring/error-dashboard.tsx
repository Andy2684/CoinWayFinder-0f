"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Bug, CheckCircle, Download, RefreshCw, Search, Activity } from "lucide-react"
import { useComprehensiveErrorHandler } from "@/hooks/use-comprehensive-error-handler"
import { errorReporting, type ErrorReport } from "@/lib/error-reporting"

interface ErrorDashboardProps {
  className?: string
}

export function ErrorDashboard({ className }: ErrorDashboardProps) {
  const { errors, getErrorStats, resolveError, clearErrors } = useComprehensiveErrorHandler()
  const [storedReports, setStoredReports] = useState<ErrorReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("24h")

  // Load stored reports
  useEffect(() => {
    const reports = errorReporting.getStoredReports()
    setStoredReports(reports)
  }, [])

  // Filter errors based on search and filters
  const filteredErrors = useMemo(() => {
    let filtered = [...errors]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (error) =>
          error.error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          error.context.component?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          error.context.action?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((error) => error.severity === severityFilter)
    }

    // Status filter
    if (statusFilter === "resolved") {
      filtered = filtered.filter((error) => error.resolved)
    } else if (statusFilter === "unresolved") {
      filtered = filtered.filter((error) => !error.resolved)
    }

    // Time filter
    const now = new Date()
    const timeThresholds = {
      "1h": 1 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }

    if (timeFilter !== "all" && timeThresholds[timeFilter as keyof typeof timeThresholds]) {
      const threshold = timeThresholds[timeFilter as keyof typeof timeThresholds]
      filtered = filtered.filter((error) => now.getTime() - error.timestamp.getTime() <= threshold)
    }

    return filtered
  }, [errors, searchTerm, severityFilter, statusFilter, timeFilter])

  const stats = getErrorStats()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityBadgeVariant = (severity: string) => {
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
        return "outline"
    }
  }

  const exportErrors = () => {
    const dataStr = JSON.stringify(filteredErrors, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `error-report-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Error Monitoring</h2>
            <p className="text-muted-foreground">Monitor and manage application errors in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportErrors}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={clearErrors}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{stats.unresolved} unresolved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.bySeverity.critical || 0}</div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </div>
              <Progress value={stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{errorReporting.getQueueSize()}</div>
              <p className="text-xs text-muted-foreground">Pending reports</p>
            </CardContent>
          </Card>
        </div>

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
            <CardTitle className="text-lg">Error List ({filteredErrors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredErrors.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No errors found</h3>
                <p className="text-gray-500">
                  {errors.length === 0
                    ? "Great! No errors have been recorded yet."
                    : "No errors match your current filters."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredErrors.map((error) => (
                  <div
                    key={error.id}
                    className={`border rounded-lg p-4 ${error.resolved ? "bg-green-50 border-green-200" : "bg-white"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityBadgeVariant(error.severity)}>{error.severity}</Badge>
                          {error.resolved && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                          {error.context.component && <Badge variant="secondary">{error.context.component}</Badge>}
                        </div>

                        <h4 className="font-medium text-gray-900 mb-1">{error.error.message}</h4>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Time:</strong> {error.timestamp.toLocaleString()}
                          </p>
                          {error.context.action && (
                            <p>
                              <strong>Action:</strong> {error.context.action}
                            </p>
                          )}
                          {error.attempts > 1 && (
                            <p>
                              <strong>Attempts:</strong> {error.attempts}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {!error.resolved && (
                          <Button size="sm" variant="outline" onClick={() => resolveError(error.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
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
      </div>
    </div>
  )
}

export default ErrorDashboard
