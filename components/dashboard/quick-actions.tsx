"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Play, Pause, Settings, TrendingUp, Bot, Zap, BarChart3 } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Create Strategy",
      description: "Set up a new trading bot",
      icon: Plus,
      color: "bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]",
      action: () => console.log("Create strategy"),
    },
    {
      title: "Start All Bots",
      description: "Resume all paused strategies",
      icon: Play,
      color: "bg-green-600 hover:bg-green-700 text-white",
      action: () => console.log("Start all bots"),
    },
    {
      title: "Emergency Stop",
      description: "Pause all active trading",
      icon: Pause,
      color: "bg-red-600 hover:bg-red-700 text-white",
      action: () => console.log("Emergency stop"),
    },
    {
      title: "Portfolio Rebalance",
      description: "Rebalance across exchanges",
      icon: BarChart3,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      action: () => console.log("Rebalance"),
    },
  ]

  const quickStats = [
    { label: "Active Strategies", value: "12", icon: Bot },
    { label: "Total Trades Today", value: "47", icon: TrendingUp },
    { label: "System Status", value: "Optimal", icon: Zap },
    { label: "API Health", value: "100%", icon: Settings },
  ]

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.color}`}
                >
                  <action.icon className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs opacity-80">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Quick Stats</h3>
            <div className="space-y-4">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-[#30D5C8]" />
                    </div>
                    <span className="text-gray-300 text-sm">{stat.label}</span>
                  </div>
                  <span className="text-white font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
