"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationStats } from "./notification-stats"
import { NotificationFilters } from "./notification-filters"
import { NotificationTable } from "./notification-table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function NotificationDashboard() {
  const [filters, setFilters] = useState<{
    type?: string
    status?: string
    startDate?: Date
    endDate?: Date
    search?: string
  }>({})

  const handleFilterChange = (newFilters: {
    type?: string
    status?: string
    startDate?: Date
    endDate?: Date
    search?: string
  }) => {
    setFilters(newFilters)
  }

  const handleExport = async () => {
    // Build query params for export
    const params = new URLSearchParams()

    if (filters.type) params.append("type", filters.type)
    if (filters.status) params.append("status", filters.status)
    if (filters.startDate) params.append("startDate", filters.startDate.toISOString())
    if (filters.endDate) params.append("endDate", filters.endDate.toISOString())
    if (filters.search) params.append("search", filters.search)

    // Trigger download
    window.open(`/api/admin/notifications/history/export?${params.toString()}`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification History</h1>
          <p className="text-muted-foreground">Track and monitor all notification activity</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="space-y-4 pt-4">
          <NotificationFilters onFilterChange={handleFilterChange} />
          <NotificationTable filters={filters} />
        </TabsContent>
        <TabsContent value="stats" className="pt-4">
          <NotificationStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
