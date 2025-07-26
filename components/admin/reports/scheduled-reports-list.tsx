"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, Mail, Trash2, Play } from "lucide-react"

interface ScheduledReport {
  id: string
  type: string
  frequency: string
  recipients: string[]
  enabled: boolean
  createdAt: string
  lastRun?: string
  nextRun: string
}

interface ScheduledReportsListProps {
  reports: ScheduledReport[]
  onRefresh: () => void
}

export function ScheduledReportsList({ reports, onRefresh }: ScheduledReportsListProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-100 text-blue-800"
      case "weekly":
        return "bg-green-100 text-green-800"
      case "monthly":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "bg-orange-100 text-orange-800"
      case "weekly":
        return "bg-teal-100 text-teal-800"
      case "monthly":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const toggleSchedule = async (reportId: string, enabled: boolean) => {
    try {
      // API call to toggle schedule would go here
      console.log(`Toggling schedule ${reportId} to ${enabled}`)
      onRefresh()
    } catch (error) {
      console.error("Error toggling schedule:", error)
    }
  }

  const deleteSchedule = async (reportId: string) => {
    try {
      // API call to delete schedule would go here
      console.log(`Deleting schedule ${reportId}`)
      onRefresh()
    } catch (error) {
      console.error("Error deleting schedule:", error)
    }
  }

  const runNow = async (reportId: string) => {
    try {
      // API call to run report immediately would go here
      console.log(`Running report ${reportId} now`)
    } catch (error) {
      console.error("Error running report:", error)
    }
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No scheduled reports found</p>
            <p className="text-sm">Set up automated report generation to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Reports ({reports.length})
          </CardTitle>
          <CardDescription>Automated security report generation and delivery</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={getTypeColor(report.type)}>{report.type.toUpperCase()} REPORT</Badge>
                    <Badge className={getFrequencyColor(report.frequency)}>{report.frequency.toUpperCase()}</Badge>
                    <Badge variant={report.enabled ? "default" : "secondary"}>
                      {report.enabled ? "ACTIVE" : "PAUSED"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Recipients:</span>
                      </div>
                      <div className="ml-6 text-muted-foreground">
                        {report.recipients.slice(0, 2).map((email, index) => (
                          <div key={index}>{email}</div>
                        ))}
                        {report.recipients.length > 2 && (
                          <div className="text-xs">+{report.recipients.length - 2} more</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Schedule:</span>
                      </div>
                      <div className="ml-6 text-muted-foreground space-y-1">
                        <div>Next run: {formatDateTime(report.nextRun)}</div>
                        {report.lastRun && <div>Last run: {formatDateTime(report.lastRun)}</div>}
                        <div>Created: {formatDateTime(report.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Switch checked={report.enabled} onCheckedChange={(enabled) => toggleSchedule(report.id, enabled)} />
                  <Button variant="outline" size="sm" onClick={() => runNow(report.id)} disabled={!report.enabled}>
                    <Play className="h-4 w-4 mr-1" />
                    Run Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => deleteSchedule(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
