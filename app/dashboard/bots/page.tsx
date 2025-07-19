"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BotsOverview } from "@/components/bots/bots-overview"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"

function BotsPageContent() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r bg-muted/10">
          <DashboardSidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:pl-64">
        <DashboardHeader />

        <main className="flex-1 p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Trading Bots</h1>
              <p className="text-muted-foreground">Manage and monitor your automated trading strategies</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Bot
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <BotsOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActiveBots />
              <BotPerformance />
            </div>
            <BotStrategies />
          </div>

          <CreateBotDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
        </main>
      </div>
    </div>
  )
}

export default function BotsPage() {
  return (
    <ProtectedRoute>
      <BotsPageContent />
    </ProtectedRoute>
  )
}
