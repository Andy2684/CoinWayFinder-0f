import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { ApiAccess } from "@/components/dashboard/api-access"

export default function DashboardPage() {
  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">A high-level overview of your business.</p>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Sales</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <Overview />
        </TabsContent>
        <TabsContent value="recent" className="space-y-6">
          <RecentSales />
        </TabsContent>
        <TabsContent value="api" className="space-y-6">
          <ApiAccess />
        </TabsContent>
      </Tabs>
    </div>
  )
}
