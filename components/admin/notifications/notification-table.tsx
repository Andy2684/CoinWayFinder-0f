"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, Eye } from "lucide-react"
import { format } from "date-fns"

interface Notification {
  id: number
  type: string
  subject: string
  recipients: string[]
  content: string
  status: "sent" | "delivered" | "failed"
  sent_at: string
  delivered_at?: string
  error_message?: string
  metadata?: Record<string, any>
}

interface NotificationTableProps {
  filters: {
    type?: string
    status?: string
    startDate?: Date
    endDate?: Date
    search?: string
  }
}

export function NotificationTable({ filters }: NotificationTableProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [page, filters])

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      })

      if (filters.type) params.append("type", filters.type)
      if (filters.status) params.append("status", filters.status)
      if (filters.startDate) params.append("startDate", filters.startDate.toISOString())
      if (filters.endDate) params.append("endDate", filters.endDate.toISOString())
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`/api/admin/notifications/history?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch notification history")
      }

      const data = await response.json()
      setNotifications(data.notifications)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="outline">Sent</Badge>
      case "delivered":
        return <Badge variant="success">Delivered</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatNotificationType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Actions</TableHead>
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
                  <TableCell>{formatNotificationType(notification.type)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{notification.subject}</TableCell>
                  <TableCell>
                    {notification.recipients.length > 1
                      ? `${notification.recipients[0]} +${notification.recipients.length - 1} more`
                      : notification.recipients[0]}
                  </TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>{format(new Date(notification.sent_at), "MMM d, yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(notification)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink isActive={page === pageNum} onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm">Type</h3>
                  <p>{formatNotificationType(selectedNotification.type)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Status</h3>
                  <p>{getStatusBadge(selectedNotification.status)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Sent At</h3>
                  <p>{format(new Date(selectedNotification.sent_at), "PPP HH:mm:ss")}</p>
                </div>
                {selectedNotification.delivered_at && (
                  <div>
                    <h3 className="font-semibold text-sm">Delivered At</h3>
                    <p>{format(new Date(selectedNotification.delivered_at), "PPP HH:mm:ss")}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <h3 className="font-semibold text-sm">Subject</h3>
                  <p>{selectedNotification.subject}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-sm">Recipients</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNotification.recipients.map((recipient, index) => (
                      <Badge key={index} variant="secondary">
                        {recipient}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedNotification.error_message && (
                  <div className="col-span-2">
                    <h3 className="font-semibold text-sm text-red-600">Error</h3>
                    <p className="text-red-600">{selectedNotification.error_message}</p>
                  </div>
                )}
                {selectedNotification.metadata && (
                  <div className="col-span-2">
                    <h3 className="font-semibold text-sm">Metadata</h3>
                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedNotification.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Content</h3>
                <div className="border rounded-md p-4 max-h-96 overflow-y-auto bg-white">
                  <div dangerouslySetInnerHTML={{ __html: selectedNotification.content }} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
