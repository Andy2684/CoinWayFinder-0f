"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  Bug,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  Download,
  Filter,
  Calendar,
  BarChart3,
} from "lucide-react"
import { useComprehensiveErrorHandler } from "@/hooks/use-comprehensive-error-handler"
import { errorReportingService, type ErrorReport } from "@/lib/error-reporting"

export const ErrorDashboard: React.FC = () => {
  const { getErrorStats, clearErrorHistory, errorHistory } = useComprehensiveErrorHandler()
  const [localReports, setLocalReports] = useState<ErrorReport[]>([])
  const [reportStats, setReportStats] = useState<any>(null)
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h")

  useEffect(() => {
    loadErrorData()
  }, [])

  const loadErrorData = () => {
    const reports = errorReportingService.getLocalReports()
    const stats = errorReportingService.getReportStats()
    setLocalReports(reports)
    setReportStats(stats)
  }

  const clearAllErrors = () => {
    clearErrorHistory()
    errorReportingService.clearLocalReports()
    loadErrorData()
  }

  const exportErrorData = () => {
    const data = {
      errorHistory,
      localReports,
      stats: getErrorStats(),
      reportStats,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `coinwayfinder-errors-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredReports = localReports.filter((report) => {
    if (selectedSeverity !== "all" && report.severity !== selectedSeverity) {
      return false
    }

    const reportTime = new Date(report.timestamp)
    const now = new Date()
    const timeRanges = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }

    const range = timeRanges[selectedTimeRange as keyof typeof timeRanges]
    if (range && now.getTime() - reportTime.getTime() > range) {
      return false
    }

    return true
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const stats = getErrorStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Error Monitoring Dashboard</h2>
          <p className="text-muted-foreground">Monitor and analyze application errors</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadErrorData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportErrorData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={clearAllErrors} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Errors</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bug className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unresolved</p>
                <p className="text-2xl font-bold text-red-600">{stats.unresolved}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Errors</TabsTrigger>
          <TabsTrigger value="components">By Component</TabsTrigger>
          <TabsTrigger value="severity">By Severity</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-1 border rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-1 border rounded-md"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No errors found for the selected criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.errorId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.timestamp).toLocaleString()}
                          </span>
                          {report.context && <Badge variant="outline">{report.context}</Badge>}
                        </div>
                        <p className="font-medium mb-1">{report.message}</p>
                        <p className="text-sm text-muted-foreground">ID: {report.errorId}</p>
                        {report.url && <p className="text-xs text-muted-foreground mt-1">URL: {report.url}</p>}
                      </div>
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Errors by Component</CardTitle>
              <CardDescription>Distribution of errors across different components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byComponent).map(([component, count]) => (
                  <div key={component} className="flex items-center justify-between">
                    <span className="font-medium">{component}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(count / stats.total) * 100} className="w-24" />
                      <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="severity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Errors by Severity</CardTitle>
              <CardDescription>Breakdown of error severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportStats &&
                  Object.entries(reportStats.bySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(severity)}>{severity}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / reportStats.total) * 100} className="w-24" />
                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error trend analysis would be implemented here with charts showing error patterns over time. This would
              help identify recurring issues and system stability trends.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
