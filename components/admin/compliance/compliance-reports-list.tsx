"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Trash2, Eye, Search, Filter } from "lucide-react"

interface ComplianceReportsListProps {
  reports: any[]
  onLoadReport: (reportId: string) => void
  onRefresh: () => void
}

export function ComplianceReportsList({ reports, onLoadReport, onRefresh }: ComplianceReportsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFramework, setFilterFramework] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500"
      case "non-compliant":
        return "bg-red-500"
      case "partial":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.framework.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFramework = filterFramework === "all" || report.framework === filterFramework
    const matchesStatus = filterStatus === "all" || report.status === filterStatus

    return matchesSearch && matchesFramework && matchesStatus
  })

  const deleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return

    try {
      const response = await fetch(`/api/admin/compliance/${reportId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        onRefresh()
      } else {
        alert("Failed to delete report: " + data.error)
      }
    } catch (error) {
      console.error("Error deleting report:", error)
      alert("Error deleting report")
    }
  }

  const exportReport = async (reportId: string, title: string) => {
    try {
      const response = await fetch(`/api/admin/compliance/${reportId}`)
      const data = await response.json()

      if (data.success) {
        const dataStr = JSON.stringify(data.report, null, 2)
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

        const exportFileDefaultName = `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`

        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      alert("Error exporting report")
    }
  }

  const uniqueFrameworks = [...new Set(reports.map((r) => r.framework))]
  const uniqueStatuses = [...new Set(reports.map((r) => r.status))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saved Compliance Reports</h2>
          <p className="text-muted-foreground">View and manage previously generated compliance reports</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={filterFramework} onValueChange={setFilterFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  {uniqueFrameworks.map((framework) => (
                    <SelectItem key={framework} value={framework}>
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>No compliance reports found</p>
                <p className="text-sm">Generate your first compliance report to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {report.title}
                    </CardTitle>
                    <CardDescription>
                      Framework: {report.framework} • Generated: {report.generatedAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(report.status)} text-white`}>
                      {report.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{report.overallScore}%</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Period: {report.periodStart.toLocaleDateString()} - {report.periodEnd.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onLoadReport(report.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportReport(report.id, report.title)}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
