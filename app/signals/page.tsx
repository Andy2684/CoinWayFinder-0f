"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AutomatedSignals } from "@/components/signals/automated-signals"
import { ExecutionMonitor } from "@/components/signals/execution-monitor"
import { SignalFeed } from "@/components/signals/signal-feed"
import { SignalPerformance } from "@/components/signals/signal-performance"

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-[#0F1015] text-white">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="automated" className="space-y-6">
          <TabsList className="bg-[#1A1B23] border-gray-800">
            <TabsTrigger value="automated">🤖 Automated Signals</TabsTrigger>
            <TabsTrigger value="execution">⚡ Execution Monitor</TabsTrigger>
            <TabsTrigger value="feed">📡 Signal Feed</TabsTrigger>
            <TabsTrigger value="performance">📊 Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="automated">
            <AutomatedSignals />
          </TabsContent>

          <TabsContent value="execution">
            <ExecutionMonitor />
          </TabsContent>

          <TabsContent value="feed">
            <SignalFeed />
          </TabsContent>

          <TabsContent value="performance">
            <SignalPerformance />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
