import { NotificationDashboard } from "@/components/admin/notifications/notification-dashboard"

export const metadata = {
  title: "Notification History | Admin Dashboard",
  description: "Track and monitor all notification activity",
}

export default function NotificationHistoryPage() {
  return (
    <div className="container mx-auto py-6">
      <NotificationDashboard />
    </div>
  )
}
