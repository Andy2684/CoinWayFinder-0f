"use client"

import dynamic from "next/dynamic"

const DashboardSettingsPageClient = dynamic(() => import("./dashboard-settings-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
})

export default function DashboardSettingsPage() {
  return <DashboardSettingsPageClient />
}
