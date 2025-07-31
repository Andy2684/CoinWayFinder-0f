"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface Notification {
  id: number
  notification_id: string
  type: string
  subject: string
  content: string
  html_content?: string
  recipients: string[]
  status: string
  error_message?: string
  metadata: any
  sent_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
}

interface NotificationTableProps {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onPageChange: (page: number) => void
  loading: boolean
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "security":
      return "destructive"
    case "admin":
      return "default"
    case "system":
      return "secondary"
    case "user":
      return "outline"
    default:
      return "default"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600" />
    case "sent":
      return <Mail className="h-4 w-4 text-blue-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "text-green-600"
    case "failed":
      return "text-red-600"
    case "pending":
      return "text-yellow-600"
    case "sent":
      return "text-blue-600"
    default:
      return "text-gray-600"
  }
}

export function NotificationTable({ notifications, pagination, onPageChange, loading }: NotificationTableProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
        <CardDescription>{pagination.total.toLocaleString()} total notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No notifications found
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <Badge variant={getTypeColor(notification.type)}>{notification.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={notification.subject}>
                        {notification.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {notification.recipients.length} recipient{notification.recipients.length !== 1 ? "s" : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${getStatusColor(notification.status)}`}>
                        {getStatusIcon(notification.status)}
                        <span className="capitalize">{notification.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(notification.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedNotification(notification)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Notification Details</DialogTitle>
                            <DialogDescription>ID: {notification.notification_id}</DialogDescription>
                          </DialogHeader>

                          {selectedNotification && (
                            <div className="space-y-6">
                              {/* Basic Info */}
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <h4 className="font-medium mb-2">Type</h4>
                                  <Badge variant={getTypeColor(selectedNotification.type)}>
                                    {selectedNotification.type}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Status</h4>
                                  <div
                                    className={`flex items-center gap-2 ${getStatusColor(selectedNotification.status)}`}
                                  >
                                    {getStatusIcon(selectedNotification.status)}
                                    <span className="capitalize">{selectedNotification.status}</span>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              {/* Subject */}
                              <div>
                                <h4 className="font-medium mb-2">Subject</h4>
                                <p className="text-sm">{selectedNotification.subject}</p>
                              </div>

                              {/* Recipients */}
                              <div>
                                <h4 className="font-medium mb-2">Recipients</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedNotification.recipients.map((recipient, index) => (
                                    <Badge key={index} variant="outline">
                                      {recipient}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Content */}
                              <div>
                                <h4 className="font-medium mb-2">Content</h4>
                                {selectedNotification.html_content ? (
                                  <div className="border rounded-lg p-4 bg-muted/50">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: selectedNotification.html_content,
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="border rounded-lg p-4 bg-muted/50">
                                    <pre className="whitespace-pre-wrap text-sm">{selectedNotification.content}</pre>
                                  </div>
                                )}
                              </div>

                              {/* Error Message */}
                              {selectedNotification.error_message && (
                                <div>
                                  <h4 className="font-medium mb-2 text-red-600">Error Message</h4>
                                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                    <p className="text-sm text-red-800">{selectedNotification.error_message}</p>
                                  </div>
                                </div>
                              )}

                              {/* Timestamps */}
                              <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <h4 className="font-medium mb-2">Created</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(selectedNotification.created_at).toLocaleString()}
                                  </p>
                                </div>
                                {selectedNotification.sent_at && (
                                  <div>
                                    <h4 className="font-medium mb-2">Sent</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(selectedNotification.sent_at).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                                {selectedNotification.delivered_at && (
                                  <div>
                                    <h4 className="font-medium mb-2">Delivered</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(selectedNotification.delivered_at).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Metadata */}
                              {selectedNotification.metadata &&
                                Object.keys(selectedNotification.metadata).length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Metadata</h4>
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                      <pre className="text-xs">
                                        {JSON.stringify(selectedNotification.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}{" "}
              notifications
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={!pagination.hasPrev}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={!pagination.hasNext}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
