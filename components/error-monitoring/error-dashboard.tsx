"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle, Clock, Download, Search, Trash2 } from "lucide-react"
import { useComprehensiveErrorHandler } from "@/hooks/use-comprehensive-error-handler"
import { format } from "date-fns"

export function ErrorMonitoringDashboard() {
  const { errors, getErrorStats, resolveError, clearErrors } = useComprehensiveErrorHandler()
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("24h")

  const stats = useMemo(() => getErrorStats(), [getErrorStats])

  const filteredErrors = useMemo(() => {
    let filtered = errors

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (error) =>
          error.error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          error.error.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (error.context.component || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((error) => error.severity === severityFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isResolved = statusFilter === "resolved"
      filtered = filtered.filter((error) => error.resolved === isResolved)
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date()
      let cutoff: Date

      switch (timeFilter) {
        case "1h":
          cutoff = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case "24h":
          cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case "7d":
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        default:
          return filtered
      }

      filtered = filtered.filter((error) => error.timestamp >= cutoff)
    }

    return filtered
  }, [errors, searchTerm, severityFilter, statusFilter, timeFilter])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportErrors = () => {
    const dataStr = JSON.stringify(filteredErrors, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `error-report-${format(new Date(), "yyyy-MM-dd-HH-mm")}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Error Monitoring</h2>
          <p className="text-muted-foreground">Monitor and manage application errors in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportErrors} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={clearErrors} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.resolved} resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.last24h}</div>
            <p className="text-xs text-muted-foreground">{stats.lastHour} in last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bySeverity.critical}</div>
            <p className="text-xs text-muted-foreground">{stats.bySeverity.high} high severity</p>
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
            <p className="text-xs text-muted-foreground">
              {stats.resolved}/{stats.total} resolved
            </p>
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
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
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
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Errors ({filteredErrors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredErrors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No errors found matching your filters.</div>
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(error.severity)}>{error.severity}</Badge>
                            {error.resolved && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Resolved
                              </Badge>
                            )}
                            {error.context.component && <Badge variant="secondary">{error.context.component}</Badge>}
                          </div>

                          <h4 className="font-medium text-gray-900 mb-1">{error.error.name}</h4>

                          <p className="text-sm text-gray-600 mb-2">{error.error.message}</p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{format(error.timestamp, "MMM dd, yyyy HH:mm:ss")}</span>
                            {error.attempts > 1 && <span>{error.attempts} attempts</span>}
                            {error.context.url && <span className="truncate max-w-xs">{error.context.url}</span>}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Component Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Errors by Component</CardTitle>
              <CardDescription>Distribution of errors across different components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byComponent)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([component, count]) => (
                    <div key={component} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{component}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(stats.byComponent))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Severity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Errors by Severity</CardTitle>
              <CardDescription>Breakdown of error severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="text-center">
                    <div className="text-2xl font-bold mb-1">{count}</div>
                    <div className={`text-sm px-2 py-1 rounded-full ${getSeverityColor(severity)}`}>{severity}</div>
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
