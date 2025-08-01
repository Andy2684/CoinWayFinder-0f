import { AchievementDashboard } from "@/components/achievements/achievement-dashboard"

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
          <p className="text-gray-300">
            Track your progress, unlock rewards, and celebrate your trading journey milestones
          </p>
        </div>

        <AchievementDashboard />
      </div>
    </div>
  )
}
