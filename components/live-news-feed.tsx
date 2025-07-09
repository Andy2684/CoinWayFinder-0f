"use client"

import { useState, useEffect } from "react"
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
        `/api/news?category=${categoryFilter}&limit=${variant === "homepage" ? limit : 50}&whales=true`
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
        const whaleResponse = await fetch('/api/whales?limit=20&type=transactions')
        const whale
