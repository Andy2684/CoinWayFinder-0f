import dynamic from "next/dynamic"
import DashboardSettingsWrapper from "./dashboard-settings-wrapper"

const DashboardSettingsPageClient = dynamic(() => import("./dashboard-settings-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  ),
})

export default function DashboardSettingsPage() {
  return <DashboardSettingsWrapper />
}
