"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Settings, Moon, Sun, Eye, EyeOff, Volume2, VolumeX, RefreshCw, Maximize2, Minimize2 } from "lucide-react"
import { toast } from "sonner"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PortfolioAnalytics } from "@/components/dashboard/portfolio-analytics"
import { RiskManagement } from "@/components/dashboard/risk-management"
import { LiveMarketTicker } from "@/components/dashboard/live-market-ticker"
import { RealtimeMarketTicker } from "@/components/dashboard/realtime-market-ticker"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { RealtimeOrderBook } from "@/components/dashboard/realtime-order-book"
import { RealtimeTradeFeed } from "@/components/dashboard/realtime-trade-feed"
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview"
import { BackToDashboard } from "@/components/back-to-dashboard"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isCompactView, setIsCompactView] = useState(false)
  const [showBalances, setShowBalances] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [connectedWallets, setConnectedWallets] = useState([
    { name: "MetaMask", address: "0x742d...4c2f", balance: "2.45 ETH", network: "Ethereum", connected: true },
    { name: "Phantom", address: "9WzD...8kL2", balance: "156.7 SOL", network: "Solana", connected: true },
  ])

  const [portfolioData] = useState({
    totalValue: 45678.9,
    dailyChange: 1234.56,
    dailyChangePercent: 2.78,
    activeBots: 12,
    totalTrades: 1456,
    winRate: 68.5,
    sharpeRatio: 1.42,
    riskScore: 7.2,
  })

  const handleQuickAction = (action: string) => {
    toast.success(`${action} clicked!`)
  }

  const handleWalletAction = (action: string, wallet: string) => {
    toast.info(`${action} for ${wallet}`)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    toast.success(`Switched to ${!isDarkMode ? "dark" : "light"} mode`)
  }

  const handleRefresh = () => {
    toast.success("Dashboard refreshed!")
  }

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Auto refresh logic here
      }, Number.parseInt(refreshInterval) * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${isDarkMode ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-gray-50 via-white to-gray-100"}`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-xl border-b ${isDarkMode ? "bg-black/20 border-white/10" : "bg-white/20 border-gray-200/50"}`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Welcome back, {user.firstName || user.name}!
              </h1>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Pro Account
              </Badge>
            </div>

            {/* Control Panel */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-gray-900 hover:bg-gray-100"}`}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCompactView(!isCompactView)}
                className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-gray-900 hover:bg-gray-100"}`}
              >
                {isCompactView ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-gray-900 hover:bg-gray-100"}`}
              >
                {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-gray-900 hover:bg-gray-100"}`}
              >
                <Bell className={`h-4 w-4 ${notificationsEnabled ? "text-blue-400" : "text-gray-400"}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-gray-900 hover:bg-gray-100"}`}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-gray-900 hover:bg-gray-100"}`}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Select>
                <SelectTrigger
                  className={`w-[120px] ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Settings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="preferences">Preferences</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="api">API Keys</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="destructive" size="sm" onClick={logout} className="bg-red-600 hover:bg-red-700">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your trading overview.</p>
          </div>
          <BackToDashboard text="Refresh Dashboard" showIcon={false} variant="ghost" />
        </div>

        {/* Real-time Market Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealtimeMarketTicker />
          <LiveMarketTicker />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardOverview />
            <PortfolioAnalytics />
            <ActiveStrategies />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <PnLTracking />
            <RiskManagement />
          </div>
        </div>

        {/* Portfolio and Market Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioOverview />
          <LiveMarketData />
        </div>

        {/* Real-time Trading Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealtimeOrderBook />
          <RealtimeTradeFeed />
        </div>

        {/* Trade Logs */}
        <TradeLogs />
      </div>
    </div>
  )
}
