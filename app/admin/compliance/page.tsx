"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ComplianceReportViewer } from "@/components/admin/compliance/compliance-report-viewer"
import { ComplianceReportsList } from "@/components/admin/compliance/compliance-reports-list"
import { ComplianceFrameworkOverview } from "@/components/admin/compliance/compliance-framework-overview"
import { ComplianceScheduleManager } from "@/components/admin/compliance/compliance-schedule-manager"
import { Shield, FileText, Download, TrendingUp, RefreshCw } from "lucide-react"
import type { ComplianceReport, ComplianceFramework } from "@/lib/compliance-report-generator"

interface Framework {
  id: ComplianceFramework
  name: string
  description: string
  category: string
  applicability: string
  keyFocus: string[]
  reportingPeriod: string
  controlCount: number
}

export default function CompliancePage() {
  const [currentReport, setCurrentReport] = useState<ComplianceReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework>("SOC2")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [assessor, setAssessor] = useState("")
  const [savedReports, setSavedReports] = useState([])

  useEffect(() => {
    fetchFrameworks()
    fetchSavedReports()

    // Set default date range (last 90 days)
    const end = new Date()
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000)
    setEndDate(end.toISOString().split("T")[0])
    setStartDate(start.toISOString().split("T")[0])
  }, [])

  const fetchFrameworks = async () => {
    try {
      const response = await fetch("/api/admin/compliance/frameworks")
      const data = await response.json()
      if (data.success) {
        setFrameworks(data.frameworks)
      }
    } catch (error) {
      console.error("Error fetching frameworks:", error)
    }
  }

  const fetchSavedReports = async () => {
    try {
      const response = await fetch("/api/admin/compliance/list")
      const data = await response.json()
      if (data.success) {
        setSavedReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching saved reports:", error)
    }
  }

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/compliance/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          framework: selectedFramework,
          startDate,
          endDate,
          assessor: assessor || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setCurrentReport(data.report)
      } else {
        console.error("Failed to generate report:", data.error)
        alert("Failed to generate report: " + data.error)
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Error generating report")
    } finally {
      setLoading(false)
    }
  }

  const saveReport = async () => {
    if (!currentReport) return

    try {
      const response = await fetch("/api/admin/compliance/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report: currentReport }),
      })

      const data = await response.json()
      if (data.success) {
        fetchSavedReports()
        alert("Report saved successfully")
      } else {
        alert("Failed to save report: " + data.error)
      }
    } catch (error) {
      console.error("Error saving report:", error)
      alert("Error saving report")
    }
  }

  const loadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/compliance/${reportId}`)
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

    const exportFileDefaultName = `compliance-report-${currentReport.framework.toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500"
      case "partial":
        return "bg-yellow-500"
      case "non-compliant":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const selectedFrameworkInfo = frameworks.find((f) => f.id === selectedFramework)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Compliance Management
          </h1>
          <p className="text-muted-foreground">Generate and manage compliance reports for regulatory frameworks</p>
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
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="reports">Saved Reports</TabsTrigger>
          <TabsTrigger value="schedule">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          {/* Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Generate Compliance Report
              </CardTitle>
              <CardDescription>
                Create comprehensive compliance reports with automated control assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div>
                  <Label htmlFor="framework">Compliance Framework</Label>
                  <Select
                    value={selectedFramework}
                    onValueChange={(value: ComplianceFramework) => setSelectedFramework(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="assessor">Assessor (Optional)</Label>
                  <Input
                    id="assessor"
                    placeholder="Enter assessor name"
                    value={assessor}
                    onChange={(e) => setAssessor(e.target.value)}
                  />
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

              {/* Framework Info */}
              {selectedFrameworkInfo && (
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Framework</h4>
                        <p className="text-sm text-muted-foreground">{selectedFrameworkInfo.name}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Category</h4>
                        <Badge variant="outline">{selectedFrameworkInfo.category}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Controls</h4>
                        <p className="text-sm text-muted-foreground">{selectedFrameworkInfo.controlCount} controls</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-medium text-sm mb-1">Key Focus Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedFrameworkInfo.keyFocus.map((focus, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Report Viewer */}
          {currentReport && <ComplianceReportViewer report={currentReport} />}
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          <ComplianceFrameworkOverview frameworks={frameworks} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ComplianceReportsList reports={savedReports} onLoadReport={loadReport} onRefresh={fetchSavedReports} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ComplianceScheduleManager frameworks={frameworks} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
