"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  ExternalLink,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Newspaper,
  FishIcon as Whale,
  DollarSign,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { ClientOnly } from "@/components/client-only"
import { useAdmin } from "@/hooks/use-admin"

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  category: "crypto" | "stocks" | "economy"
  publishedAt: string
  url: string
  sentiment: "positive" | "negative" | "neutral"
  aiSummary?: string
  impact?: "high" | "medium" | "low"
  tags?: string[]
  imageUrl?: string
}

interface WhaleTransaction {
  id: string
  hash: string
  blockchain: string
  symbol: string
  amount: number
  amountUSD: number
  from: string
  to: string
  timestamp: Date
  type: "transfer" | "exchange_inflow" | "exchange_outflow" | "dex_trade"
  exchange?: string
  isSmartMoney?: boolean
  walletLabel?: string
}

interface SmartMoneyWallet {
  address: string
  label?: string
  type: "whale" | "institution" | "smart_trader" | "early_adopter"
  totalBalance: number
  recentActivity: WhaleTransaction[]
  winRate?: number
  avgProfit?: number
  followersCount?: number
}

interface LiveNewsFeedProps {
  variant?: "homepage" | "full"
  limit?: number
}

function LiveNewsFeedContent({ variant = "homepage", limit = 5 }: LiveNewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [whaleTransactions, setWhaleTransactions] = useState<WhaleTransaction[]>([])
  const [smartWallets, setSmartWallets] = useState<SmartMoneyWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("24h")
  const [activeTab, setActiveTab] = useState("news")

  const { isAdmin } = useAdmin()

  useEffect(() => {
    fetchData()

    // Set up refresh interval (every 3 minutes)
    const interval = setInterval(fetchData, 180000)
    return () => clearInterval(interval)
  }, [categoryFilter, timeFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch news
      const newsResponse = await fetch(
        `/api/news?category=${categoryFilter}&limit=${variant === "homepage" ? limit : 50}&whales=true`,
      )
      const newsData = await newsResponse.json()

      if (newsData.success) {
        setArticles(newsData.articles)

        // Set whale data if available
        if (newsData.whaleData) {
          setWhaleTransactions(newsData.whaleData.recentTransactions || [])
          setSmartWallets(newsData.whaleData.smartWallets || [])
        }
      }

      // Fetch additional whale data if admin or premium user
      if (isAdmin || variant === "full") {
        const whaleResponse = await fetch("/api/whales?limit=20&type=transactions")
        const whaleData = await whaleResponse.json()
        if (whaleData.success) {
          setWhaleTransactions([...whaleTransactions, ...whaleData.transactions])
          setSmartWallets([...smartWallets, ...whaleData.wallets])
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles
    .filter((article) => {
      if (categoryFilter !== "all" && article.category !== categoryFilter) return false
      if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) return false

      // Time filter logic
      const now = new Date()
      const articleDate = new Date(article.publishedAt)
      const hoursDiff = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60)

      switch (timeFilter) {
        case "1h":
          return hoursDiff <= 1
        case "24h":
          return hoursDiff <= 24
        case "week":
          return hoursDiff <= 168
        default:
          return true
      }
    })
    .slice(0, variant === "homepage" ? limit : undefined)

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "crypto":
        return "bg-[#30D5C8]/10 text-[#30D5C8] border-[#30D5C8]/20"
      case "stocks":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "economy":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (variant === "homepage") {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Newspaper className="w-6 h-6 text-[#30D5C8]" />
              <h2 className="text-2xl font-bold text-white">📢 Live Market News</h2>
            </div>
            <Link href="/news">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                See All News
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-700 rounded mb-3"></div>
                    <div className="h-3 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                        {article.category.toUpperCase()}
                      </Badge>
                      {getSentimentIcon(article.sentiment)}
                    </div>

                    <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-[#30D5C8] transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{article.summary}</p>

                    {article.aiSummary && (
                      <div className="bg-[#30D5C8]/5 border border-[#30D5C8]/20 rounded-lg p-3 mb-3">
                        <p className="text-[#30D5C8] text-xs font-medium mb-1">🧠 AI Analysis</p>
                        <p className="text-gray-300 text-xs">{article.aiSummary}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        <span>{article.source}</span>
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(article.publishedAt)}</span>
                      </div>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="crypto">🪙 Crypto</SelectItem>
            <SelectItem value="stocks">📈 Stocks</SelectItem>
            <SelectItem value="economy">🏦 Economy</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700 text-white">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900/50 border-gray-700">
          <TabsTrigger value="news" className="text-white hover:text-[#30D5C8]">
            News
          </TabsTrigger>
          <TabsTrigger value="whales" className="text-white hover:text-[#30D5C8]">
            Whale Transactions
          </TabsTrigger>
          <TabsTrigger value="wallets" className="text-white hover:text-[#30D5C8]">
            Smart Money Wallets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="news" className="space-y-4">
          {loading
            ? [...Array(5)].map((_, i) => (
                <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-700 rounded mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            : filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                          {article.category.toUpperCase()}
                        </Badge>
                        {article.impact && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {article.impact.toUpperCase()} IMPACT
                          </Badge>
                        )}
                      </div>
                      {getSentimentIcon(article.sentiment)}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3 hover:text-[#30D5C8] transition-colors cursor-pointer">
                      {article.title}
                    </h3>

                    <p className="text-gray-300 mb-4">{article.summary}</p>

                    {article.aiSummary && (
                      <div className="bg-[#30D5C8]/5 border border-[#30D5C8]/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-[#30D5C8] text-sm font-medium">🧠 AI Analysis</span>
                        </div>
                        <p className="text-gray-300 text-sm">{article.aiSummary}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">{article.source}</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeAgo(article.publishedAt)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#30D5C8]">
                        Read More <ExternalLink className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </TabsContent>
        <TabsContent value="whales" className="space-y-4">
          {loading ? (
            <div className="animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 border-gray-800 p-6 rounded-lg">
                  <div className="h-6 bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            whaleTransactions.map((transaction) => (
              <Card key={transaction.id} className="bg-gray-900/50 border-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Whale className="w-6 h-6 text-[#30D5C8]" />
                    <span className="text-white font-semibold">{transaction.symbol}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300">{transaction.amount}</span>
                    <DollarSign className="w-4 h-4 text-gray-300" />
                    <span className="text-gray-300">{transaction.amountUSD.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">
                  {transaction.type === "transfer"
                    ? "Transferred"
                    : transaction.type === "exchange_inflow"
                      ? "Bought"
                      : transaction.type === "exchange_outflow"
                        ? "Sold"
                        : "Traded"}{" "}
                  {transaction.amount} {transaction.symbol} from {transaction.from} to {transaction.to}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{transaction.blockchain}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(transaction.timestamp.toISOString())}</span>
                    </div>
                  </div>
                  {transaction.exchange && <span className="text-gray-300 font-medium">{transaction.exchange}</span>}
                </div>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="wallets" className="space-y-4">
          {loading ? (
            <div className="animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 border-gray-800 p-6 rounded-lg">
                  <div className="h-6 bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            smartWallets.map((wallet) => (
              <Card key={wallet.address} className="bg-gray-900/50 border-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-6 h-6 text-[#30D5C8]" />
                    <span className="text-white font-semibold">{wallet.label || wallet.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300">{wallet.totalBalance.toFixed(2)}</span>
                    <DollarSign className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
                <p className="text-gray-300 mb-4">
                  Type: {wallet.type.toUpperCase()}, Followers: {wallet.followersCount || 0}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">Recent Activity</span>
                  </div>
                  {wallet.recentActivity.length > 0 && (
                    <span className="text-gray-300 font-medium">
                      {getTimeAgo(wallet.recentActivity[0].timestamp.toISOString())}
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {filteredArticles.length === 0 && !loading && activeTab === "news" && (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No news found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}

      {whaleTransactions.length === 0 && !loading && activeTab === "whales" && (
        <div className="text-center py-12">
          <Whale className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No whale transactions found</h3>
          <p className="text-gray-500">Check back later for updates</p>
        </div>
      )}

      {smartWallets.length === 0 && !loading && activeTab === "wallets" && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No smart money wallets found</h3>
          <p className="text-gray-500">Check back later for updates</p>
        </div>
      )}
    </div>
  )
}

export function LiveNewsFeed(props: LiveNewsFeedProps) {
  if (props.variant === "homepage") {
    return (
      <ClientOnly
        fallback={
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Newspaper className="w-6 h-6 text-[#30D5C8]" />
                  <h2 className="text-2xl font-bold text-white">📢 Live Market News</h2>
                </div>
                <Link href="/news">
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                    See All News
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-700 rounded mb-3"></div>
                      <div className="h-3 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        }
      >
        <LiveNewsFeedContent {...props} />
      </ClientOnly>
    )
  }

  return (
    <ClientOnly
      fallback={
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <LiveNewsFeedContent {...props} />
    </ClientOnly>
  )
}
