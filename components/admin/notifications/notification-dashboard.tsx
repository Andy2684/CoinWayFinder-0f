"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { NotificationStats } from "./notification-stats"
import { NotificationFilters } from "./notification-filters"
import { NotificationTable } from "./notification-table"

interface NotificationDashboardProps {
  initialData?: any
}

export function NotificationDashboard({ initialData }: NotificationDashboardProps) {
  const [activeTab, setActiveTab] = useState("history")
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch notifications
  const fetchNotifications = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...newFilters,
      })

      const response = await fetch(`/api/admin/notifications/history?${params}`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data.notifications)
        setPagination(data.data.pagination)
      } else {
        toast.error("Failed to fetch notifications")
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Failed to fetch notifications")
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch("/api/admin/notifications/history/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        toast.error("Failed to fetch notification stats")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Failed to fetch notification stats")
    } finally {
      setStatsLoading(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    fetchNotifications(1, newFilters)
  }

  // Handle page changes
  const handlePageChange = (page: number) => {
    fetchNotifications(page)
  }

  // Handle export
  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters)
      const response = await fetch(`/api/admin/notifications/history/export?${params}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `notification-history-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("Export completed successfully")
      } else {
        toast.error("Failed to export data")
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data")
    }
  }

  // Initial data load
  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history">Notification History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <NotificationFilters onFiltersChange={handleFiltersChange} onExport={handleExport} loading={loading} />

          <NotificationTable
            notifications={notifications}
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="stats">
          <NotificationStats stats={stats} loading={statsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
