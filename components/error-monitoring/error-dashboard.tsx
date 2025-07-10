"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Bug, Info, XCircle, Download, Trash2, RefreshCw } from "lucide-react"
import { useComprehensiveErrorHandler } from "@/hooks/use-comprehensive-error-handler"
import { getStoredErrorReports, clearStoredErrorReports, type ErrorReport } from "@/lib/error-reporting"
import { toast } from "@/components/ui/use-toast"

interface ErrorDashboardProps {
  className?: string
}

export function ErrorDashboard({ className }: ErrorDashboardProps) {
  const { errorHistory, getErrorStats, clearErrorHistory } = useComprehensiveErrorHandler()
  const [storedReports, setStoredReports] = useState<ErrorReport[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setStoredReports(getStoredErrorReports())
  }, [])

  const errorStats = useMemo(() => getErrorStats(), [getErrorStats])

  const filteredErrors = useMemo(() => {
    let errors = [
      ...errorHistory,
      ...storedReports.map((report) => ({
        id: report.id,
        error: report.error,
        context: report.context,
        timestamp: report.timestamp,
        resolved: false,
        severity: report.severity,
      })),
    ]

    // Filter by severity
    if (selectedSeverity !== "all") {
      errors = errors.filter(
        (error) =>
          (error as any).severity === selectedSeverity || (!(error as any).severity && selectedSeverity === "medium"),
      )
    }

    // Filter by time range
    const now = new Date()
    const timeRanges = {
      "1h": 1 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }

    if (selectedTimeRange !== "all") {
      const timeLimit = timeRanges[selectedTimeRange as keyof typeof timeRanges]
      errors = errors.filter((error) => now.getTime() - error.timestamp.getTime() <= timeLimit)
    }

    // Filter by search query
    if (searchQuery) {
      errors = errors.filter(
        (error) =>
          error.error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          error.context.component?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          error.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [errorHistory, storedReports, selectedSeverity, selectedTimeRange, searchQuery])

  const severityStats = useMemo(() => {
    const stats = { low: 0, medium: 0, high: 0, critical: 0 }
    filteredErrors.forEach((error) => {
      const severity = (error as any).severity || "medium"
      stats[severity as keyof typeof stats]++
    })
    return stats
  }, [filteredErrors])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <Info className="h-4 w-4" />
      case "medium":
        return <AlertTriangle className="h-4 w-4" />
      case "high":
        return <Bug className="h-4 w-4" />
      case "critical":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleClearAllErrors = () => {
    clearErrorHistory()
    clearStoredErrorReports()
    setStoredReports([])
    toast({
      title: "Errors cleared",
      description: "All error records have been cleared successfully.",
    })
  }

  const handleExportErrors = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: errorStats,
      severityStats,
      errors: filteredErrors.map((error) => ({
        id: error.id,
        message: error.error.message,
        stack: error.error.stack,
        context: error.context,
        timestamp: error.timestamp.toISOString(),
        severity: (error as any).severity || "medium",
        resolved: error.resolved,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `error-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export completed",
      description: "Error report has been downloaded successfully.",
    })
  }

  const handleRefresh = () => {
    setStoredReports(getStoredErrorReports())
    toast({
      title: "Refreshed",
      description: "Error data has been refreshed.",
    })
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Error Monitoring</h2>
          <p className="text-muted-foreground">Monitor and analyze application errors in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportErrors}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearAllErrors}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.total}</div>
            <p className="text-xs text-muted-foreground">{errorStats.resolved} resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{severityStats.critical}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{severityStats.high}</div>
            <p className="text-xs text-muted-foreground">Should be addressed soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.unresolved}</div>
            <p className="text-xs text-muted-foreground">Unresolved errors</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors ({filteredErrors.length})</CardTitle>
              <CardDescription>Latest errors matching your filter criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredErrors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No errors found matching your criteria</div>
                  ) : (
                    filteredErrors.map((error, index) => (
                      <div key={error.id}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">{getSeverityIcon((error as any).severity || "medium")}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge className={getSeverityColor((error as any).severity || "medium")}>
                                  {(error as any).severity || "medium"}
                                </Badge>
                                {error.context.component && <Badge variant="outline">{error.context.component}</Badge>}
                                {error.resolved && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Resolved
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{error.timestamp.toLocaleString()}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground mt-1">{error.error.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">ID: {error.id}</p>
                            {error.context.action && (
                              <p className="text-xs text-muted-foreground">Action: {error.context.action}</p>
                            )}
                            {error.error.stack && (
                              <details className="mt-2">
                                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                  View Stack Trace
                                </summary>
                                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                                  {error.error.stack}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                        {index < filteredErrors.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Errors by Component</CardTitle>
                <CardDescription>Distribution of errors across application components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(errorStats.byComponent).map(([component, count]) => (
                    <div key={component} className="flex justify-between items-center">
                      <span className="text-sm">{component}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Breakdown of errors by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(severityStats).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(severity)}
                        <span className="text-sm capitalize">{severity}</span>
                      </div>
                      <Badge className={getSeverityColor(severity)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
