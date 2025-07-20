"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Bot,
  Signal,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Settings,
  BarChart3,
  Target,
  Zap,
  Globe,
  CheckCircle,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  LinkIcon,
  Copy,
  PieChart,
  Smartphone,
  Monitor,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hideBalances, setHideBalances] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const [stats, setStats] = useState({
    totalBalance: 125678.32,
    totalPnL: 15456.78,
    pnlPercent: 14.2,
    activeBots: 18,
    totalTrades: 3847,
    winRate: 76.4,
    connectedExchanges: 8,
    activeSignals: 42,
    todayPnL: 1567.89,
    todayPnLPercent: 2.3,
    weeklyPnL: 4567.12,
    monthlyPnL: 12345.67,
    totalVolume: 2456789.45,
    avgTradeSize: 1234.56,
    bestPerformer: "BTC Grid Bot",
    worstPerformer: "ETH Scalper",
    riskScore: 6.8,
    sharpeRatio: 1.45,
  })

  const [walletConnections, setWalletConnections] = useState([
    {
      id: 1,
      name: "MetaMask",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
      balance: "12.4567 ETH",
      usdValue: 42345.67,
      network: "Ethereum",
      status: "connected",
      lastUsed: "2 minutes ago",
    },
    {
      id: 2,
      name: "Coinbase Wallet",
      address: "0x8ba1f109551bD432803012645Hac136c22C501e5",
      balance: "0.8934 BTC",
      usdValue: 58234.12,
      network: "Bitcoin",
      status: "connected",
      lastUsed: "1 hour ago",
    },
    {
      id: 3,
      name: "Trust Wallet",
      address: "0x9cd2462556d2c929e2dbcdb1dB058d6E6BEcC4e6",
      balance: "2,456 BNB",
      usdValue: 15678.9,
      network: "BSC",
      status: "connected",
      lastUsed: "3 hours ago",
    },
    {
      id: 4,
      name: "Phantom",
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      balance: "145.67 SOL",
      usdValue: 8234.56,
      network: "Solana",
      status: "disconnected",
      lastUsed: "1 day ago",
    },
  ])

  const [portfolioHoldings, setPortfolioHoldings] = useState([
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 2.3456,
      value: 156340.67,
      change: 3.4,
      allocation: 42.2,
      avgPrice: 58000,
      profit: 12456.78,
      profitPercent: 8.7,
      exchange: "Binance",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 25.8765,
      value: 89765.43,
      change: -1.8,
      allocation: 24.2,
      avgPrice: 3200,
      profit: 5678.9,
      profitPercent: 6.8,
      exchange: "Coinbase",
    },
    {
      symbol: "ADA",
      name: "Cardano",
      amount: 45000,
      value: 23456.78,
      change: 7.2,
      allocation: 6.3,
      avgPrice: 0.45,
      profit: 2345.67,
      profitPercent: 11.1,
      exchange: "Kraken",
    },
    {
      symbol: "SOL",
      name: "Solana",
      amount: 234.67,
      value: 18456.78,
      change: 4.5,
      allocation: 5.0,
      avgPrice: 65,
      profit: 3456.78,
      profitPercent: 23.1,
      exchange: "FTX",
    },
    {
      symbol: "DOT",
      name: "Polkadot",
      amount: 1890.45,
      value: 12234.56,
      change: -2.1,
      allocation: 3.3,
      avgPrice: 5.8,
      profit: -567.89,
      profitPercent: -4.4,
      exchange: "Bybit",
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      amount: 567.89,
      value: 8945.67,
      change: 5.6,
      allocation: 2.4,
      avgPrice: 14.5,
      profit: 1234.56,
      profitPercent: 16.0,
      exchange: "KuCoin",
    },
    {
      symbol: "UNI",
      name: "Uniswap",
      amount: 890.12,
      value: 6789.45,
      change: 2.8,
      allocation: 1.8,
      avgPrice: 6.8,
      profit: 456.78,
      profitPercent: 7.2,
      exchange: "Uniswap",
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      amount: 3456.78,
      value: 4567.89,
      change: 1.9,
      allocation: 1.2,
      avgPrice: 1.2,
      profit: 234.56,
      profitPercent: 5.4,
      exchange: "Polygon",
    },
  ])

  const [recentTrades, setRecentTrades] = useState([
    {
      id: 1,
      type: "BUY",
      symbol: "BTC/USDT",
      amount: 0.2345,
      price: 67234.5,
      total: 15761.89,
      time: "2 minutes ago",
      pnl: 456.78,
      exchange: "Binance",
      status: "Filled",
      fee: 15.76,
      orderId: "BIN123456789",
    },
    {
      id: 2,
      type: "SELL",
      symbol: "ETH/USDT",
      amount: 3.5,
      price: 3456.78,
      total: 12098.73,
      time: "5 minutes ago",
      pnl: -123.45,
      exchange: "Coinbase",
      status: "Filled",
      fee: 12.1,
      orderId: "CB987654321",
    },
    {
      id: 3,
      type: "BUY",
      symbol: "ADA/USDT",
      amount: 2000,
      price: 0.5234,
      total: 1046.8,
      time: "12 minutes ago",
      pnl: 89.12,
      exchange: "Kraken",
      status: "Filled",
      fee: 1.05,
      orderId: "KR456789123",
    },
    {
      id: 4,
      type: "SELL",
      symbol: "SOL/USDT",
      amount: 15.234,
      price: 156.78,
      total: 2388.49,
      time: "18 minutes ago",
      pnl: 345.67,
      exchange: "FTX",
      status: "Partial",
      fee: 2.39,
      orderId: "FTX789123456",
    },
    {
      id: 5,
      type: "BUY",
      symbol: "DOT/USDT",
      amount: 200,
      price: 6.45,
      total: 1290.0,
      time: "25 minutes ago",
      pnl: -23.45,
      exchange: "Bybit",
      status: "Filled",
      fee: 1.29,
      orderId: "BY123789456",
    },
    {
      id: 6,
      type: "SELL",
      symbol: "LINK/USDT",
      amount: 50,
      price: 15.67,
      total: 783.5,
      time: "32 minutes ago",
      pnl: 67.89,
      exchange: "KuCoin",
      status: "Filled",
      fee: 0.78,
      orderId: "KC456123789",
    },
  ])

  const [activeBots, setActiveBots] = useState([
    {
      id: 1,
      name: "BTC DCA Master Pro",
      strategy: "DCA",
      status: "active",
      profit: 8456.78,
      profitPercent: 18.4,
      winRate: 82.3,
      trades: 256,
      allocation: 15000,
      lastTrade: "2 hours ago",
      exchange: "Binance",
      risk: "Medium",
      timeframe: "4H",
      created: "2024-01-15",
    },
    {
      id: 2,
      name: "ETH Grid Trader Elite",
      strategy: "Grid",
      status: "active",
      profit: 6834.56,
      profitPercent: 22.7,
      winRate: 78.4,
      trades: 434,
      allocation: 12000,
      lastTrade: "15 minutes ago",
      exchange: "Coinbase",
      risk: "Low",
      timeframe: "1H",
      created: "2024-01-20",
    },
    {
      id: 3,
      name: "Multi-Coin Scalper AI",
      strategy: "Scalping",
      status: "active",
      profit: 4567.43,
      profitPercent: 15.2,
      winRate: 71.9,
      trades: 1245,
      allocation: 8500,
      lastTrade: "5 minutes ago",
      exchange: "Kraken",
      risk: "High",
      timeframe: "5M",
      created: "2024-02-01",
    },
    {
      id: 4,
      name: "AI Trend Follower V2",
      strategy: "AI",
      status: "active",
      profit: 3245.67,
      profitPercent: 10.8,
      winRate: 69.2,
      trades: 189,
      allocation: 7000,
      lastTrade: "1 hour ago",
      exchange: "Bybit",
      risk: "Medium",
      timeframe: "1D",
      created: "2024-02-10",
    },
    {
      id: 5,
      name: "Arbitrage Hunter",
      strategy: "Arbitrage",
      status: "paused",
      profit: -345.67,
      profitPercent: -4.9,
      winRate: 58.2,
      trades: 89,
      allocation: 5000,
      lastTrade: "2 days ago",
      exchange: "KuCoin",
      risk: "Low",
      timeframe: "1M",
      created: "2024-02-15",
    },
    {
      id: 6,
      name: "Momentum Rider",
      strategy: "Momentum",
      status: "active",
      profit: 2156.78,
      profitPercent: 7.2,
      winRate: 65.4,
      trades: 167,
      allocation: 6000,
      lastTrade: "30 minutes ago",
      exchange: "FTX",
      risk: "High",
      timeframe: "15M",
      created: "2024-02-20",
    },
  ])

  const [marketData, setMarketData] = useState({
    btcPrice: 67234.56,
    btcChange: 3.2,
    ethPrice: 3456.78,
    ethChange: -1.8,
    totalMarketCap: "2.3T",
    fearGreedIndex: 78,
    dominance: 54.2,
    volume24h: "89.5B",
    defiTvl: "156.7B",
    activeAddresses: "1.2M",
  })

  const [activeSignals, setActiveSignals] = useState([
    {
      id: 1,
      symbol: "BTC/USDT",
      type: "BUY",
      confidence: 89,
      targetPrice: 72500,
      currentPrice: 67234,
      timeframe: "4H",
      source: "AI Analysis",
      strength: "Strong",
      rsi: 45.6,
      macd: "Bullish",
    },
    {
      id: 2,
      symbol: "ETH/USDT",
      type: "SELL",
      confidence: 76,
      targetPrice: 3200,
      currentPrice: 3456,
      timeframe: "1H",
      source: "Technical",
      strength: "Medium",
      rsi: 72.3,
      macd: "Bearish",
    },
    {
      id: 3,
      symbol: "ADA/USDT",
      type: "BUY",
      confidence: 82,
      targetPrice: 0.65,
      currentPrice: 0.5234,
      timeframe: "1D",
      source: "Fundamental",
      strength: "Strong",
      rsi: 38.9,
      macd: "Bullish",
    },
    {
      id: 4,
      symbol: "SOL/USDT",
      type: "BUY",
      confidence: 71,
      targetPrice: 180,
      currentPrice: 156.78,
      timeframe: "2H",
      source: "Social Sentiment",
      strength: "Medium",
      rsi: 42.1,
      macd: "Neutral",
    },
    {
      id: 5,
      symbol: "DOT/USDT",
      type: "SELL",
      confidence: 68,
      targetPrice: 5.8,
      currentPrice: 6.45,
      timeframe: "6H",
      source: "Technical",
      strength: "Weak",
      rsi: 68.7,
      macd: "Bearish",
    },
  ])

  const [exchangeStatus, setExchangeStatus] = useState([
    { name: "Binance", status: "operational", latency: "12ms", uptime: "99.9%" },
    { name: "Coinbase", status: "operational", latency: "18ms", uptime: "99.8%" },
    { name: "Kraken", status: "operational", latency: "25ms", uptime: "99.7%" },
    { name: "Bybit", status: "maintenance", latency: "45ms", uptime: "98.9%" },
    { name: "KuCoin", status: "operational", latency: "22ms", uptime: "99.6%" },
    { name: "FTX", status: "operational", latency: "15ms", uptime: "99.9%" },
    { name: "OKX", status: "operational", latency: "20ms", uptime: "99.5%" },
    { name: "Huobi", status: "operational", latency: "28ms", uptime: "99.4%" },
  ])

  // Real-time updates simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())

      // Update stats with small random changes
      setStats((prev) => ({
        ...prev,
        totalBalance: prev.totalBalance + (Math.random() - 0.5) * 500,
        todayPnL: prev.todayPnL + (Math.random() - 0.5) * 100,
        todayPnLPercent: prev.todayPnLPercent + (Math.random() - 0.5) * 0.2,
        totalTrades: prev.totalTrades + Math.floor(Math.random() * 3),
        winRate: Math.max(70, Math.min(85, prev.winRate + (Math.random() - 0.5) * 0.5)),
        totalVolume: prev.totalVolume + Math.random() * 10000,
      }))

      // Update market data
      setMarketData((prev) => ({
        ...prev,
        btcPrice: prev.btcPrice + (Math.random() - 0.5) * 1000,
        btcChange: prev.btcChange + (Math.random() - 0.5) * 0.5,
        ethPrice: prev.ethPrice + (Math.random() - 0.5) * 200,
        ethChange: prev.ethChange + (Math.random() - 0.5) * 0.5,
        fearGreedIndex: Math.max(0, Math.min(100, prev.fearGreedIndex + (Math.random() - 0.5) * 5)),
      }))

      // Update portfolio holdings
      setPortfolioHoldings((prev) =>
        prev.map((holding) => ({
          ...holding,
          change: holding.change + (Math.random() - 0.5) * 2,
          value: holding.value * (1 + (Math.random() - 0.5) * 0.02),
        })),
      )
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setRefreshing(false)
    toast({
      title: "Data Refreshed",
      description: "All dashboard data has been updated successfully.",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Address copied successfully.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to exchanges and fetching data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Please log in to access the dashboard.</p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.firstName || user.name || "Trader"}! 👋
            </h1>
            <p className="text-gray-400 mt-1">
              {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()} • Last updated:{" "}
              {refreshing ? "Updating..." : "Just now"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              System Operational
            </Badge>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setHideBalances(!hideBalances)}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {hideBalances ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {hideBalances ? "Show" : "Hide"}
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/bots">
                <Plus className="w-4 h-4 mr-2" />
                Create Bot
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {hideBalances ? "••••••••" : `$${stats.totalBalance.toLocaleString()}`}
              </div>
              <div className="flex items-center text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                <span className="text-green-400">
                  {hideBalances ? "••••" : `+$${stats.totalPnL.toFixed(2)} (${stats.pnlPercent}%)`}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Volume: {hideBalances ? "••••••••" : `$${stats.totalVolume.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Today's P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {hideBalances ? "••••••••" : `+$${stats.todayPnL.toFixed(2)}`}
              </div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1 text-green-400" />
                <span className="text-green-400">
                  {hideBalances ? "••••" : `+${stats.todayPnLPercent.toFixed(2)}% today`}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Weekly: {hideBalances ? "••••••••" : `+$${stats.weeklyPnL.toFixed(2)}`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeBots}</div>
              <div className="flex items-center text-xs mt-1">
                <Target className="w-3 h-3 mr-1 text-blue-400" />
                <span className="text-blue-400">{stats.winRate.toFixed(1)}% win rate</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Best: {stats.bestPerformer} • Risk: {stats.riskScore}/10
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Signals</CardTitle>
              <Zap className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeSignals}</div>
              <div className="flex items-center text-xs mt-1">
                <Signal className="w-3 h-3 mr-1 text-purple-400" />
                <span className="text-purple-400">Real-time signals</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Avg Trade: {hideBalances ? "••••••••" : `$${stats.avgTradeSize.toFixed(2)}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Connections */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-green-400" />
              Wallet Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {walletConnections.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    wallet.status === "connected"
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          wallet.status === "connected" ? "bg-green-400" : "bg-red-400"
                        }`}
                      ></div>
                      <p className="font-medium text-white text-sm">{wallet.name}</p>
                    </div>
                    <Badge variant={wallet.status === "connected" ? "default" : "destructive"} className="text-xs">
                      {wallet.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-white">{wallet.network}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-white">{hideBalances ? "••••••••" : wallet.balance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">USD Value:</span>
                      <span className="text-green-400">
                        {hideBalances ? "••••••••" : `$${wallet.usdValue.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-400 truncate mr-2">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallet.address)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last used: {wallet.lastUsed}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <WalletConnectButton />
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Smartphone className="w-4 h-4 mr-2" />
                Connect Mobile
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Monitor className="w-4 h-4 mr-2" />
                Hardware Wallet
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <LinkIcon className="w-4 h-4 mr-2" />
                WalletConnect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Different Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/40 backdrop-blur-xl border-white/10">
            <TabsTrigger value="overview" className="text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-white">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="bots" className="text-white">
              Trading Bots
            </TabsTrigger>
            <TabsTrigger value="signals" className="text-white">
              Signals
            </TabsTrigger>
            <TabsTrigger value="trades" className="text-white">
              Trade History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Market Summary */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-400" />
                  Market Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">BTC/USD</p>
                    <p className="text-lg font-bold text-white">${marketData.btcPrice.toLocaleString()}</p>
                    <div className="flex items-center justify-center space-x-1">
                      {marketData.btcChange > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                      <span className={marketData.btcChange > 0 ? "text-green-400" : "text-red-400"}>
                        {marketData.btcChange > 0 ? "+" : ""}
                        {marketData.btcChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">ETH/USD</p>
                    <p className="text-lg font-bold text-white">${marketData.ethPrice.toLocaleString()}</p>
                    <div className="flex items-center justify-center space-x-1">
                      {marketData.ethChange > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                      <span className={marketData.ethChange > 0 ? "text-green-400" : "text-red-400"}>
                        {marketData.ethChange > 0 ? "+" : ""}
                        {marketData.ethChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                    <p className="text-lg font-bold text-white">${marketData.totalMarketCap}</p>
                    <span className="text-green-400 text-sm">+2.1%</span>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Fear & Greed</p>
                    <p className="text-lg font-bold text-yellow-400">{marketData.fearGreedIndex}</p>
                    <span className="text-yellow-400 text-sm">Extreme Greed</span>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                    <p className="text-lg font-bold text-white">${marketData.volume24h}</p>
                    <span className="text-blue-400 text-sm">+5.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exchange Status */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-400" />
                  Exchange Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {exchangeStatus.map((exchange) => (
                    <div key={exchange.name} className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white text-sm">{exchange.name}</p>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            exchange.status === "operational" ? "bg-green-400" : "bg-yellow-400"
                          }`}
                        ></div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={exchange.status === "operational" ? "text-green-400" : "text-yellow-400"}>
                            {exchange.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Latency:</span>
                          <span className="text-white">{exchange.latency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Uptime:</span>
                          <span className="text-green-400">{exchange.uptime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Holdings */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-green-400" />
                  Portfolio Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioHoldings.map((holding) => (
                    <div
                      key={holding.symbol}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold">
                          {holding.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{holding.symbol}</p>
                          <p className="text-sm text-gray-400">{holding.name}</p>
                          <p className="text-xs text-gray-500">
                            {hideBalances ? "••••••••" : `${holding.amount.toLocaleString()} ${holding.symbol}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {hideBalances ? "••••••••" : `$${holding.value.toLocaleString()}`}
                        </p>
                        <p
                          className={`text-sm flex items-center justify-end ${holding.change >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {holding.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(holding.change).toFixed(2)}%
                        </p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Allocation: {holding.allocation}%</p>
                          <p>
                            P&L:{" "}
                            <span className={holding.profit >= 0 ? "text-green-400" : "text-red-400"}>
                              {hideBalances
                                ? "••••••••"
                                : `${holding.profit >= 0 ? "+" : ""}$${holding.profit.toFixed(2)} (${holding.profitPercent}%)`}
                            </span>
                          </p>
                          <p>Exchange: {holding.exchange}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bots" className="space-y-6">
            {/* Active Bots */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-blue-400" />
                  Trading Bots ({activeBots.filter((bot) => bot.status === "active").length} Active)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeBots.map((bot) => (
                    <div
                      key={bot.id}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-white">{bot.name}</p>
                        <Badge variant={bot.status === "active" ? "default" : "secondary"} className="text-xs">
                          {bot.status === "active" ? (
                            <>
                              <Play className="w-3 h-3 mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 mr-1" /> Paused
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Strategy:</span>
                            <span className="text-white">{bot.strategy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Exchange:</span>
                            <span className="text-white">{bot.exchange}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Risk:</span>
                            <span
                              className={
                                bot.risk === "High"
                                  ? "text-red-400"
                                  : bot.risk === "Medium"
                                    ? "text-yellow-400"
                                    : "text-green-400"
                              }
                            >
                              {bot.risk}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Timeframe:</span>
                            <span className="text-white">{bot.timeframe}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Profit:</span>
                            <span className={bot.profit >= 0 ? "text-green-400" : "text-red-400"}>
                              {hideBalances ? "••••••••" : `${bot.profit >= 0 ? "+" : ""}$${bot.profit.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Win Rate:</span>
                            <span className="text-white">{bot.winRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Trades:</span>
                            <span className="text-white">{bot.trades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Allocation:</span>
                            <span className="text-white">
                              {hideBalances ? "••••••••" : `$${bot.allocation.toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Progress value={bot.winRate} className="mt-3 h-2" />
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-gray-500">Created: {bot.created}</span>
                        <span className="text-gray-500">Last trade: {bot.lastTrade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            {/* Active Signals */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Active Trading Signals ({activeSignals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-white">{signal.symbol}</p>
                        <Badge variant={signal.type === "BUY" ? "default" : "destructive"} className="text-xs">
                          {signal.type}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Confidence:</span>
                          <span className="text-green-400">{signal.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Strength:</span>
                          <span
                            className={
                              signal.strength === "Strong"
                                ? "text-green-400"
                                : signal.strength === "Medium"
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }
                          >
                            {signal.strength}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Target:</span>
                          <span className="text-white">${signal.targetPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current:</span>
                          <span className="text-white">${signal.currentPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Timeframe:</span>
                          <span className="text-white">{signal.timeframe}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">RSI:</span>
                          <span className="text-white">{signal.rsi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">MACD:</span>
                          <span
                            className={
                              signal.macd === "Bullish"
                                ? "text-green-400"
                                : signal.macd === "Bearish"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                            }
                          >
                            {signal.macd}
                          </span>
                        </div>
                      </div>
                      <Progress value={signal.confidence} className="mt-3 h-2" />
                      <p className="text-xs text-gray-500 mt-2">Source: {signal.source}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades" className="space-y-6">
            {/* Recent Trades */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-400" />
                  Recent Trades ({recentTrades.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge variant={trade.type === "BUY" ? "default" : "destructive"} className="text-xs">
                          {trade.type}
                        </Badge>
                        <div>
                          <p className="font-medium text-white text-sm">{trade.symbol}</p>
                          <p className="text-xs text-gray-400">{trade.exchange}</p>
                          <p className="text-xs text-gray-500">ID: {trade.orderId}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          <p>{hideBalances ? "••••••••" : `${trade.amount} @ $${trade.price.toLocaleString()}`}</p>
                          <p>Total: {hideBalances ? "••••••••" : `$${trade.total.toLocaleString()}`}</p>
                          <p>Fee: {hideBalances ? "••••••••" : `$${trade.fee.toFixed(2)}`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={trade.status === "Filled" ? "default" : "secondary"} className="text-xs mb-2">
                          {trade.status}
                        </Badge>
                        <p className={`font-medium text-sm ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {hideBalances ? "••••••••" : `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-gray-400">{trade.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button asChild className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/bots">
              <Bot className="w-5 h-5 mr-2" />
              Create New Bot
            </Link>
          </Button>
          <Button asChild className="h-16 bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/signals">
              <Zap className="w-5 h-5 mr-2" />
              View All Signals
            </Link>
          </Button>
          <Button asChild className="h-16 bg-green-600 hover:bg-green-700 text-white">
            <Link href="/portfolio">
              <BarChart3 className="w-5 h-5 mr-2" />
              Portfolio Analytics
            </Link>
          </Button>
          <Button asChild className="h-16 bg-orange-600 hover:bg-orange-700 text-white">
            <Link href="/integrations">
              <Settings className="w-5 h-5 mr-2" />
              Exchange Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
