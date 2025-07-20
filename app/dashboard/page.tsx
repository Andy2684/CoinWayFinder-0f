"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  TrendingUp,
  Wallet,
  Bell,
  Settings,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  RefreshCw,
  MoreHorizontal,
  Plus,
  Edit,
  Share,
  Download,
  Upload,
  Search,
  Calculator,
  AlertTriangle,
  BookOpen,
  Users,
  MessageCircle,
  Play,
  BarChart3,
  Zap,
  Target,
  Shield,
  Coins,
  Activity,
  PieChart,
  LineChart,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { toast } from "sonner"

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

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Settings Panel */}
        <Card
          className={`${isDarkMode ? "bg-black/40 border-white/10" : "bg-white/80 border-gray-200"} backdrop-blur-xl`}
        >
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>Quick Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="flex items-center space-x-2">
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Auto Refresh</span>
              </div>

              <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                <SelectTrigger
                  className={`w-full ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Notifications</span>
              </div>

              <div className="flex items-center space-x-2">
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Sound Alerts</span>
              </div>

              <div className="flex items-center space-x-2">
                <Switch checked={advancedMode} onCheckedChange={setAdvancedMode} />
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Advanced Mode</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? "border-white/10 text-white hover:bg-white/10" : "border-gray-200 text-gray-900 hover:bg-gray-100"}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Customize
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className={`${isDarkMode ? "bg-black/40 border-white/10 hover:bg-black/50" : "bg-white/80 border-gray-200 hover:bg-white/90"} backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Total Portfolio Value
              </CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Share className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {showBalances ? `$${portfolioData.totalValue.toLocaleString()}` : "••••••"}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">
                  +${portfolioData.dailyChange.toLocaleString()} ({portfolioData.dailyChangePercent}%)
                </span>
              </div>
              <Progress value={75} className="mt-3" />
            </CardContent>
          </Card>

          <Card
            className={`${isDarkMode ? "bg-black/40 border-white/10 hover:bg-black/50" : "bg-white/80 border-gray-200 hover:bg-white/90"} backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 group cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Active Trading Bots
              </CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {portfolioData.activeBots}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>8 running, 4 paused</span>
              </div>
              <Progress value={67} className="mt-3" />
            </CardContent>
          </Card>

          <Card
            className={`${isDarkMode ? "bg-black/40 border-white/10 hover:bg-black/50" : "bg-white/80 border-gray-200 hover:bg-white/90"} backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Win Rate
              </CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <BarChart3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Target className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {portfolioData.winRate}%
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {portfolioData.totalTrades} total trades
                </span>
              </div>
              <Progress value={portfolioData.winRate} className="mt-3" />
            </CardContent>
          </Card>

          <Card
            className={`${isDarkMode ? "bg-black/40 border-white/10 hover:bg-black/50" : "bg-white/80 border-gray-200 hover:bg-white/90"} backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 group cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {advancedMode ? "Risk Score" : "Performance"}
              </CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Shield className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Activity className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {advancedMode ? `${portfolioData.riskScore}/10` : `${portfolioData.sharpeRatio}`}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {advancedMode ? "Medium risk" : "Sharpe ratio"}
                </span>
              </div>
              <Progress
                value={advancedMode ? portfolioData.riskScore * 10 : portfolioData.sharpeRatio * 20}
                className="mt-3"
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <Card
          className={`${isDarkMode ? "bg-black/40 border-white/10" : "bg-white/80 border-gray-200"} backdrop-blur-xl`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Quick Actions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? "border-white/10 text-white hover:bg-white/10" : "border-gray-200 text-gray-900 hover:bg-gray-100"}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Action
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Bot, label: "Create Bot", color: "blue", action: "create-bot" },
                { icon: Zap, label: "Quick Trade", color: "green", action: "quick-trade" },
                { icon: PieChart, label: "Portfolio", color: "purple", action: "portfolio" },
                { icon: Activity, label: "Signals", color: "orange", action: "signals" },
                { icon: BarChart3, label: "Analytics", color: "cyan", action: "analytics" },
                { icon: Settings, label: "Settings", color: "gray", action: "settings" },
                { icon: Download, label: "Export", color: "indigo", action: "export" },
                { icon: Upload, label: "Import", color: "pink", action: "import" },
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-20 flex-col space-y-2 ${isDarkMode ? "border-white/10 hover:bg-white/10" : "border-gray-200 hover:bg-gray-100"} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${item.color}-500/20 group`}
                  onClick={() => handleQuickAction(item.label)}
                >
                  <item.icon className={`h-6 w-6 text-${item.color}-500 group-hover:scale-110 transition-transform`} />
                  <span className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{item.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Search, label: "Search Assets", desc: "Find and analyze cryptocurrencies", color: "blue" },
            { icon: Calculator, label: "P&L Calculator", desc: "Calculate profit/loss scenarios", color: "green" },
            { icon: AlertTriangle, label: "Set Alerts", desc: "Create custom price alerts", color: "yellow" },
            { icon: BookOpen, label: "Trading Journal", desc: "Track trading decisions", color: "purple" },
            { icon: Users, label: "Copy Trading", desc: "Follow successful traders", color: "cyan" },
            { icon: MessageCircle, label: "Market News", desc: "Real-time news and analysis", color: "orange" },
            { icon: MessageCircle, label: "Community Chat", desc: "Connect with traders", color: "pink" },
            { icon: Play, label: "Video Tutorials", desc: "Educational content", color: "indigo" },
          ].map((item, index) => (
            <Card
              key={index}
              className={`${isDarkMode ? "bg-black/40 border-white/10 hover:bg-black/50" : "bg-white/80 border-gray-200 hover:bg-white/90"} backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${item.color}-500/20 cursor-pointer group`}
              onClick={() => handleQuickAction(item.label)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-${item.color}-500/20`}>
                    <item.icon className={`h-5 w-5 text-${item.color}-500`} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"} group-hover:text-${item.color}-500 transition-colors`}
                    >
                      {item.label}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>{item.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wallet Management */}
        <Card
          className={`${isDarkMode ? "bg-black/40 border-white/10" : "bg-white/80 border-gray-200"} backdrop-blur-xl`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Connected Wallets</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? "border-white/10 text-white hover:bg-white/10" : "border-gray-200 text-gray-900 hover:bg-gray-100"}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Connect Wallet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedWallets.map((wallet, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"} transition-all duration-300 hover:shadow-md`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                      <Wallet className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{wallet.name}</h3>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          {wallet.network}
                        </Badge>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {wallet.address} • {showBalances ? wallet.balance : "••••••"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWalletAction("View Details", wallet.name)}
                      className={`${isDarkMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWalletAction("Copy Address", wallet.name)}
                      className={`${isDarkMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWalletAction("View on Explorer", wallet.name)}
                      className={`${isDarkMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Select>
                      <SelectTrigger
                        className={`w-[100px] ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disconnect">Disconnect</SelectItem>
                        <SelectItem value="refresh">Refresh Balance</SelectItem>
                        <SelectItem value="export">Export Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: "MetaMask", color: "orange" },
                { name: "WalletConnect", color: "blue" },
                { name: "Coinbase", color: "blue" },
                { name: "Phantom", color: "purple" },
                { name: "Trust Wallet", color: "blue" },
                { name: "Ledger", color: "black" },
              ].map((wallet, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`${isDarkMode ? "border-white/10 hover:bg-white/10" : "border-gray-200 hover:bg-gray-100"} transition-all duration-300 hover:scale-105`}
                  onClick={() => handleWalletAction("Connect", wallet.name)}
                >
                  <Wallet className={`h-4 w-4 mr-2 text-${wallet.color}-500`} />
                  {wallet.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Bot, label: "AI Trading", desc: "Automated strategies", gradient: "from-blue-500 to-cyan-500" },
            {
              icon: BarChart3,
              label: "Market Analysis",
              desc: "Real-time insights",
              gradient: "from-green-500 to-emerald-500",
            },
            { icon: Coins, label: "Portfolio", desc: "Asset management", gradient: "from-purple-500 to-pink-500" },
            { icon: Activity, label: "Live Signals", desc: "Trading alerts", gradient: "from-orange-500 to-red-500" },
            {
              icon: Shield,
              label: "Risk Management",
              desc: "Protect investments",
              gradient: "from-indigo-500 to-purple-500",
            },
            { icon: LineChart, label: "Performance", desc: "Track results", gradient: "from-cyan-500 to-blue-500" },
          ].map((item, index) => (
            <Button
              key={index}
              className={`h-20 flex-col space-y-1 bg-gradient-to-r ${item.gradient} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-white border-0`}
              onClick={() => handleQuickAction(item.label)}
            >
              <item.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="text-xs font-medium">{item.label}</div>
                <div className="text-xs opacity-80">{item.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
