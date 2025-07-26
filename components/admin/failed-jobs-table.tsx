"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Trash2, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface FailedJob {
  id: string
  type: string
  attempts: number
  maxAttempts: number
  error: string
  createdAt: string
  userEmail?: string
  userName?: string
}

interface FailedJobsTableProps {
  jobs: FailedJob[]
  onJobRemoved?: (jobId: string) => void
  onJobRetried?: () => void
}

export function FailedJobsTable({ jobs, onJobRemoved, onJobRetried }: FailedJobsTableProps) {
  const [selectedJob, setSelectedJob] = useState<FailedJob | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const removeJob = async (jobId: string) => {
    try {
      setRemoving(jobId)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`/api/admin/email-queue/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to remove job")
      }

      toast.success("Job removed successfully")
      onJobRemoved?.(jobId)
    } catch (error) {
      console.error("Error removing job:", error)
      toast.error("Failed to remove job")
    } finally {
      setRemoving(null)
    }
  }

  const retryJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/notifications/retry", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })

      if (!response.ok) {
        throw new Error("Failed to retry job")
      }

      toast.success("Job queued for retry")
      onJobRetried?.()
    } catch (error) {
      console.error("Error retrying job:", error)
      toast.error("Failed to retry job")
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Failed Jobs</h3>
        <p className="text-gray-600">All email notifications are being delivered successfully!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {jobs.length} email job{jobs.length !== 1 ? "s" : ""} failed to send. Review the errors below and take
          appropriate action.
        </AlertDescription>
      </Alert>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Error</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-xs">{job.id.substring(0, 12)}...</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {job.type.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{job.userName || "Unknown User"}</div>
                    <div className="text-xs text-muted-foreground">{job.userEmail || "No email provided"}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="destructive" className="text-xs">
                    {job.attempts}/{job.maxAttempts}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(job.createdAt).toLocaleDateString()} <br />
                  <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleTimeString()}</span>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate text-sm text-red-600" title={job.error}>
                    {job.error}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedJob(job)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Job Details</DialogTitle>
                          <DialogDescription>Detailed information about failed email job</DialogDescription>
                        </DialogHeader>
                        {selectedJob && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Job ID</label>
                                <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">{selectedJob.id}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Type</label>
                                <div className="text-sm mt-1">{selectedJob.type}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Attempts</label>
                                <div className="text-sm mt-1">
                                  {selectedJob.attempts} / {selectedJob.maxAttempts}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Created</label>
                                <div className="text-sm mt-1">{new Date(selectedJob.createdAt).toLocaleString()}</div>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Recipient</label>
                              <div className="text-sm mt-1">
                                <div>{selectedJob.userName}</div>
                                <div className="text-muted-foreground">{selectedJob.userEmail}</div>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-red-600">Error Details</label>
                              <div className="text-sm bg-red-50 border border-red-200 p-3 rounded mt-1">
                                {selectedJob.error}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryJob(job.id)}
                      disabled={job.attempts >= job.maxAttempts}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeJob(job.id)}
                      disabled={removing === job.id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
