import dynamic from "next/dynamic"
import DashboardBotsClient from "./dashboard-bots-client"

const DashboardBotsWrapper = dynamic(() => import("./dashboard-bots-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  ),
})

export default function DashboardBotsPage() {
  return <DashboardBotsClient />
}
