import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { UserActivityWidget } from "@/components/dashboard/user-activity-widget"
import { SalesOverviewWidget } from "@/components/dashboard/sales-overview-widget"
import { TaskProgressWidget } from "@/components/dashboard/task-progress-widget"
import { AchievementProgressWidget } from "@/components/achievements/achievement-progress-widget"

const DashboardPageClient = () => {
  return (
    <div>
      <DashboardGrid>
        {/* User Activity Widget */}
        <UserActivityWidget />

        {/* Sales Overview Widget */}
        <SalesOverviewWidget />

        {/* Task Progress Widget */}
        <TaskProgressWidget />

        {/* Achievement Progress Widget */}
        <AchievementProgressWidget />
      </DashboardGrid>
    </div>
  )
}

export default DashboardPageClient
