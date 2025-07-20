"use client"

import dynamic from "next/dynamic"

const DashboardPageClient = dynamic(() => import("./dashboard-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
})

export default function DashboardPage() {
  return <DashboardPageClient />
}
