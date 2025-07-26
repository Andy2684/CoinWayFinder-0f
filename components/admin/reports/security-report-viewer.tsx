"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  Activity,
  BarChart3,
} from "lucide-react"
import type { SecurityReport } from "@/lib/security-report-generator"

interface SecurityReportViewerProps {
  report: SecurityReport
}

export function SecurityReportViewer({ report }: SecurityReportViewerProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {report.title}
              </CardTitle>
              <CardDescription>
                Generated on {report.generatedAt.toLocaleString()} • Period: {report.period.start.toLocaleDateString()}{" "}
                - {report.period.end.toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {report.period.type.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="charts">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalEvents.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(report.trends.eventTrend)}
                  <span>{report.trends.eventTrend}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{report.summary.successRate}%</div>
                <Progress value={report.summary.successRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{report.summary.failedEvents.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(report.trends.failureTrend)}
                  <span>{report.trends.failureTrend}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.uniqueUsers.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(report.trends.userActivityTrend)}
                  <span>{report.trends.userActivityTrend}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{report.summary.criticalEvents}</div>
                  <div className="text-sm text-muted-foreground">Critical Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{report.summary.highRiskEvents}</div>
                  <div className="text-sm text-muted-foreground">High Risk Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{report.summary.uniqueIps}</div>
                  <div className="text-sm text-muted-foreground">Unique IP Addresses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {report.insights.map((insight, index) => (
              <Alert
                key={index}
                className={`border-l-4 ${
                  insight.type === "critical"
                    ? "border-l-red-500"
                    : insight.type === "warning"
                      ? "border-l-yellow-500"
                      : insight.type === "success"
                        ? "border-l-green-500"
                        : "border-l-blue-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {insight.title}
                      <Badge variant="outline" className="text-xs">
                        {insight.impact.toUpperCase()}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-1">{insight.description}</AlertDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {insight.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {report.recommendations.map((rec, index) => (
              <Card
                key={index}
                className="border-l-4"
                style={{ borderLeftColor: `var(--${getPriorityColor(rec.priority).replace("bg-", "")})` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getPriorityColor(rec.priority)} text-white`}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{rec.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Recommended Action:</h4>
                      <p className="text-sm text-muted-foreground">{rec.action}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Effort: </span>
                        <Badge variant="outline" className="text-xs">
                          {rec.estimatedEffort}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Impact: </span>
                        <Badge variant="outline" className="text-xs">
                          {rec.expectedImpact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          {/* Events by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Events by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.charts.eventsByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium capitalize">{category.category}</span>
                      <Progress value={category.percentage} className="flex-1 max-w-xs" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.count} ({category.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Level Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.charts.riskLevelDistribution.map((risk, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge className={`${getPriorityColor(risk.level)} text-white text-xs`}>
                        {risk.level.toUpperCase()}
                      </Badge>
                      <Progress value={risk.percentage} className="flex-1 max-w-xs" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {risk.count} ({risk.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Failure Reasons */}
          {report.charts.topFailureReasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Failure Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.charts.topFailureReasons.map((failure, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{failure.reason}</span>
                      <Badge variant="outline">{failure.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {/* Critical Alerts */}
          {report.alerts.critical.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Alerts ({report.alerts.critical.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.alerts.critical.slice(0, 10).map((alert, index) => (
                    <div key={index} className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-red-500 text-white text-xs">CRITICAL</Badge>
                            <Badge variant="outline" className="text-xs">
                              {alert.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                            <span>{alert.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* High Risk Alerts */}
          {report.alerts.high.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  High Risk Alerts ({report.alerts.high.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.alerts.high.slice(0, 10).map((alert, index) => (
                    <div key={index} className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-orange-500 text-white text-xs">HIGH</Badge>
                            <Badge variant="outline" className="text-xs">
                              {alert.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                            <span>{alert.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medium Risk Alerts */}
          {report.alerts.medium.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Info className="h-5 w-5" />
                  Medium Risk Alerts ({report.alerts.medium.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.alerts.medium.slice(0, 10).map((alert, index) => (
                    <div key={index} className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-yellow-500 text-white text-xs">MEDIUM</Badge>
                            <Badge variant="outline" className="text-xs">
                              {alert.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                            <span>{alert.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Alerts Message */}
          {report.alerts.critical.length === 0 &&
            report.alerts.high.length === 0 &&
            report.alerts.medium.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No security alerts found for this period</p>
                    <p className="text-sm">System is operating normally</p>
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
