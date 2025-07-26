"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Mail, AlertTriangle, CheckCircle, Clock, Trash2, Eye, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface EmailJob {
  id: string
  type: string
  status: "pending" | "processing" | "completed" | "failed"
  attempts: number
  maxAttempts: number
  createdAt: string
  processedAt?: string
  error?: string
  data: {
    userEmail?: string
    userName?: string
    changeType?: string
    alertType?: string
  }
}

interface QueueStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
}

export default function EmailQueueAdminPage() {
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  })
  const [failedJobs, setFailedJobs] = useState<EmailJob[]>([])
  const [selectedJob, setSelectedJob] = useState<EmailJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const fetchQueueStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/notifications/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch queue status")
      }

      const data = await response.json()
      setStats(data.stats)
      setFailedJobs(data.failedJobs || [])
    } catch (error) {
      console.error("Error fetching queue status:", error)
      toast.error("Failed to fetch queue status")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const retryFailedJobs = async () => {
    try {
      setRetrying(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/notifications/retry", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to retry jobs")
      }

      const data = await response.json()
      toast.success(`Retried ${data.retriedCount} failed jobs`)
      await fetchQueueStatus()
    } catch (error) {
      console.error("Error retrying jobs:", error)
      toast.error("Failed to retry jobs")
    } finally {
      setRetrying(false)
    }
  }

  const clearCompletedJobs = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/admin/email-queue/clear", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to clear completed jobs")
      }

      const data = await response.json()
      toast.success(`Cleared ${data.clearedCount} completed jobs`)
      await fetchQueueStatus()
    } catch (error) {
      console.error("Error clearing jobs:", error)
      toast.error("Failed to clear completed jobs")
    }
  }

  const getJobDetails = async (jobId: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`/api/notifications/status?jobId=${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch job details")
      }

      const data = await response.json()
      setSelectedJob(data.job)
    } catch (error) {
      console.error("Error fetching job details:", error)
      toast.error("Failed to fetch job details")
    }
  }

  useEffect(() => {
    fetchQueueStatus()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueueStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <AlertTriangle className="h-4 w-4" />
      case "processing":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "pending":
        return <Clock className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading queue status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Queue Administration</h1>
          <p className="text-muted-foreground">Monitor and manage email notification queue</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setRefreshing(true)
              fetchQueueStatus()
            }}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={retryFailedJobs} disabled={retrying || stats.failed === 0} variant="default">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Failed ({stats.failed})
          </Button>
          <Button onClick={clearCompletedJobs} disabled={stats.completed === 0} variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Completed
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
          <CardDescription>Overall email delivery success rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Success Rate</span>
              <span>{successRate.toFixed(1)}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {stats.completed} successful out of {stats.total} total jobs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Jobs Alert */}
      {stats.failed > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            There are {stats.failed} failed email jobs that require attention. Review the failed jobs below and retry if
            needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="failed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="failed">Failed Jobs ({stats.failed})</TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
        </TabsList>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Email Jobs</CardTitle>
              <CardDescription>Jobs that failed to send and need attention</CardDescription>
            </CardHeader>
            <CardContent>
              {failedJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No failed jobs! All emails are being delivered successfully.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-xs">{job.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.type.replace("-", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.data.userName || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{job.data.userEmail || "No email"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {job.attempts}/{job.maxAttempts}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{new Date(job.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-xs text-red-600">{job.error || "Unknown error"}</div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => getJobDetails(job.id)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Detailed information about selected email job</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedJob ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Job ID</label>
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedJob.id}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedJob.status)}>
                          {getStatusIcon(selectedJob.status)}
                          <span className="ml-1">{selectedJob.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <div className="text-sm">{selectedJob.type}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Attempts</label>
                      <div className="text-sm">
                        {selectedJob.attempts} / {selectedJob.maxAttempts}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Created</label>
                      <div className="text-sm">{new Date(selectedJob.createdAt).toLocaleString()}</div>
                    </div>
                    {selectedJob.processedAt && (
                      <div>
                        <label className="text-sm font-medium">Processed</label>
                        <div className="text-sm">{new Date(selectedJob.processedAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {selectedJob.error && (
                    <div>
                      <label className="text-sm font-medium text-red-600">Error</label>
                      <div className="text-sm bg-red-50 border border-red-200 p-3 rounded">{selectedJob.error}</div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Job Data</label>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(selectedJob.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a job from the failed jobs table to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
