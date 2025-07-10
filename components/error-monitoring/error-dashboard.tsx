"use client"

import { useState, useMemo } from "react"
import { AlertTriangle, CheckCircle, XCircle, Download, Trash2, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useComprehensiveErrorHandler } from "@/hooks/use-comprehensive-error-handler"

export function ErrorMonitoringDashboard() {
  const { errors, getErrorStats, clearErrors, exportErrors, resolveError } = useComprehensiveErrorHandler()
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [componentFilter, setComponentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const stats = useMemo(() => getErrorStats(), [getErrorStats])

  const filteredErrors = useMemo(() => {
    return errors.filter((error) => {
      const matchesSearch =
        error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (error.context.component || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSeverity = severityFilter === "all" || error.severity === severityFilter
      const matchesComponent = componentFilter === "all" || error.context.component === componentFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "resolved" && error.resolved) ||
        (statusFilter === "unresolved" && !error.resolved)

      return matchesSearch && matchesSeverity && matchesComponent && matchesStatus
    })
  }, [errors, searchTerm, severityFilter, componentFilter, statusFilter])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <XCircle className="w-4 h-4" />
      case "medium":
        return <AlertTriangle className="w-4 h-4" />
      case "low":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const uniqueComponents = useMemo(() => {
    const components = new Set(errors.map((e) => e.context.component).filter(Boolean))
    return Array.from(components)
  }, [errors])

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unresolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bySeverity.critical || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Error Management</CardTitle>
          <CardDescription>Monitor and manage application errors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
              <SelectTrigger className="w-full lg:w-[180px]">
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

            <Select value={componentFilter} onValueChange={setComponentFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                {uniqueComponents.map((component) => (
                  <SelectItem key={component} value={component}>
                    {component}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={exportErrors} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={clearErrors} variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          {filteredErrors.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.length === 0 ? "No errors recorded." : "No errors match the current filters."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrors.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell>
                        <Badge variant={getSeverityColor(error.severity)} className="flex items-center gap-1">
                          {getSeverityIcon(error.severity)}
                          {error.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{error.context.component || "Unknown"}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={error.message}>
                        {error.message}
                      </TableCell>
                      <TableCell>{error.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={error.resolved ? "default" : "secondary"}>
                          {error.resolved ? "Resolved" : "Unresolved"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!error.resolved && (
                          <Button size="sm" variant="outline" onClick={() => resolveError(error.id)}>
                            Mark Resolved
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
