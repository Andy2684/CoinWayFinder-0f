"use client"

import dynamic from "next/dynamic"

const DashboardBotsClient = dynamic(() => import("./dashboard-bots-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  ),
})

export default function DashboardBotsWrapper() {
  return <DashboardBotsClient />
}
