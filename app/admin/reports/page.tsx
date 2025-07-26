"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SecurityReportViewer } from "@/components/admin/reports/security-report-viewer"
import { ReportsList } from "@/components/admin/reports/reports-list"
import { ScheduledReportsList } from "@/components/admin/reports/scheduled-reports-list"
import { FileText, Calendar, Download, TrendingUp, Plus, RefreshCw } from "lucide-react"
import type { SecurityReport } from "@/lib/security-report-generator"

export default function SecurityReportsPage() {
  const [currentReport, setCurrentReport] = useState<SecurityReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [savedReports, setSavedReports] = useState([])
  const [scheduledReports, setScheduledReports] = useState([])

  // Schedule form state
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [scheduleFrequency, setScheduleFrequency] = useState("weekly")
  const [scheduleRecipients, setScheduleRecipients] = useState("")
  const [scheduleEnabled, setScheduleEnabled] = useState(true)

  useEffect(() => {
    fetchSavedReports()
    fetchScheduledReports()
  }, [])

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: reportType,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setCurrentReport(data.report)
      } else {
        console.error("Failed to generate report:", data.error)
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveReport = async () => {
    if (!currentReport) return

    try {
      const response = await fetch("/api/admin/reports/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report: currentReport }),
      })

      const data = await response.json()
      if (data.success) {
        fetchSavedReports()
      }
    } catch (error) {
      console.error("Error saving report:", error)
    }
  }

  const scheduleReport = async () => {
    try {
      const recipients = scheduleRecipients
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)

      const response = await fetch("/api/admin/reports/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: scheduleType,
          frequency: scheduleFrequency,
          recipients,
          enabled: scheduleEnabled,
        }),
      })

      const data = await response.json()
      if (data.success) {
        fetchScheduledReports()
        // Reset form
        setScheduleRecipients("")
        setScheduleEnabled(true)
      }
    } catch (error) {
      console.error("Error scheduling report:", error)
    }
  }

  const fetchSavedReports = async () => {
    try {
      const response = await fetch("/api/admin/reports/list")
      const data = await response.json()
      if (data.success) {
        setSavedReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching saved reports:", error)
    }
  }

  const fetchScheduledReports = async () => {
    try {
      const response = await fetch("/api/admin/reports/schedule")
      const data = await response.json()
      if (data.success) {
        setScheduledReports(data.scheduledReports)
      }
    } catch (error) {
      console.error("Error fetching scheduled reports:", error)
    }
  }

  const loadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`)
      const data = await response.json()
      if (data.success) {
        setCurrentReport(data.report)
      }
    } catch (error) {
      console.error("Error loading report:", error)
    }
  }

  const exportReport = () => {
    if (!currentReport) return

    const dataStr = JSON.stringify(currentReport, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `security-report-${currentReport.period.type}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Reports</h1>
          <p className="text-muted-foreground">Generate, view, and manage automated security reports</p>
        </div>
        <div className="flex items-center gap-2">
          {currentReport && (
            <>
              <Button variant="outline" onClick={saveReport}>
                <FileText className="h-4 w-4 mr-2" />
                Save Report
              </Button>
              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="schedule">Schedule New</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          {/* Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Generate Security Report
              </CardTitle>
              <CardDescription>
                Create comprehensive security reports with trends, insights, and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Report</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={generateReport} disabled={loading} className="w-full">
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Viewer */}
          {currentReport && <SecurityReportViewer report={currentReport} />}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <ReportsList reports={savedReports} onLoadReport={loadReport} />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <ScheduledReportsList reports={scheduledReports} onRefresh={fetchScheduledReports} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Automated Reports
              </CardTitle>
              <CardDescription>Set up automated security report generation and email delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scheduleType">Report Type</Label>
                    <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Report</SelectItem>
                        <SelectItem value="weekly">Weekly Report</SelectItem>
                        <SelectItem value="monthly">Monthly Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scheduleFrequency">Frequency</Label>
                    <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Every Day</SelectItem>
                        <SelectItem value="weekly">Every Week</SelectItem>
                        <SelectItem value="monthly">Every Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="scheduleEnabled" checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
                    <Label htmlFor="scheduleEnabled">Enable scheduled reports</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scheduleRecipients">Email Recipients</Label>
                    <Textarea
                      id="scheduleRecipients"
                      placeholder="Enter email addresses separated by commas"
                      value={scheduleRecipients}
                      onChange={(e) => setScheduleRecipients(e.target.value)}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Separate multiple email addresses with commas</p>
                  </div>

                  <Button onClick={scheduleReport} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
