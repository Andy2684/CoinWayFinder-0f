import type { Metadata } from "next"
import { NotificationDashboard } from "@/components/admin/notifications/notification-dashboard"

export const metadata: Metadata = {
  title: "Notification History - Admin Dashboard",
  description: "View and manage notification history and delivery status",
}

export default function NotificationHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification History</h1>
        <p className="text-muted-foreground">Track notification delivery status and analyze communication patterns</p>
      </div>

      <NotificationDashboard />
    </div>
  )
}
