"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SignalFeed } from "@/components/signals/signal-feed"
import { SignalPerformance } from "@/components/signals/signal-performance"
import { SignalAlerts } from "@/components/signals/signal-alerts"
import { SignalFilters } from "@/components/signals/signal-filters"
import { CreateSignalDialog } from "@/components/signals/create-signal-dialog"

export default function SignalsPage() {
  const [filters, setFilters] = useState({
    symbols: [],
    strategies: [],
    exchanges: [],
    timeframes: [],
    confidenceRange: [0, 100],
    pnlRange: [-100, 100],
    riskLevels: [],
  })

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Signals</h1>
            <p className="text-gray-400 mt-2">AI-powered trading recommendations and market insights</p>
          </div>
          <CreateSignalDialog />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SignalFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <SignalFeed filters={filters} />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <SignalPerformance />
            <SignalAlerts />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
