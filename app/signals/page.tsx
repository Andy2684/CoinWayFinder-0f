"use client"

import { SignalFeed } from "@/components/signals/signal-feed"
import { SignalPerformance } from "@/components/signals/signal-performance"
import { SignalAlerts } from "@/components/signals/signal-alerts"
import { SignalFilters } from "@/components/signals/signal-filters"
import { CreateSignalDialog } from "@/components/signals/create-signal-dialog"
import { BackToDashboard } from "@/components/back-to-dashboard"

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Signals</h1>
            <p className="text-gray-400">AI-powered trading signals and market insights</p>
          </div>
          <div className="flex items-center gap-4">
            <BackToDashboard />
            <CreateSignalDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SignalFilters />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <SignalPerformance />
            <SignalFeed />
          </div>
        </div>

        <SignalAlerts />
      </div>
    </div>
  )
}
