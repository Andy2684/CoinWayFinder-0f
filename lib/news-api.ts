// Enhanced news API integration with real-time feeds

export interface NewsSource {
  id: string
  name: string
  category: "crypto" | "stocks" | "economy"
  apiEndpoint: string
  apiKey?: string
  rateLimit?: number
  priority: number
}

export interface NewsArticle {
  id: string
  title: string
  summary: string
  content?: string
  source: string
  category: "crypto" | "stocks" | "economy"
  publishedAt: string
  url: string
  sentiment: "positive" | "negative" | "neutral"
  aiSummary?: string
  impact?: "high" | "medium" | "low"
  tags?: string[]
  imageUrl?: string
  author?: string
  readTime?: number
}

export interface WhaleTransaction {
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

export interface SmartMoneyWallet {
  address: string
  label?: string
  type: "whale" | "institution" | "smart_trader" | "early_adopter"
  totalBalance: number
  recentActivity: WhaleTransaction[]
  winRate?: number
  avgProfit?: number
  followersCount?: number
}

export const newsSources: NewsSource[] = [
  {
    id: "cryptopanic",
    name: "CryptoPanic",
    category: "crypto",
    apiEndpoint: "https://cryptopanic.com/api/v1/posts/",
    priority: 1,
    rateLimit: 100,
  },
  {
    id: "newsdata",
    name: "NewsData.io",
    category: "economy",
    apiEndpoint: "https://newsdata.io/api/1/news",
    priority: 2,
    rateLimit: 200,
  },
  {
    id: "coindesk",
    name: "CoinDesk",
    category: "crypto",
    apiEndpoint: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    priority: 1,
    rateLimit: 50,
  },
  {
    id: "cointelegraph",
    name: "CoinTelegraph",
    category: "crypto",
    apiEndpoint: "https://cointelegraph.com/rss",
    priority: 1,
    rateLimit: 50,
  },
]

class NewsAPIManager {
  private static instance: NewsAPIManager
  private cache: Map<string, { data: NewsArticle[]; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static getInstance(): NewsAPIManager {
    if (!NewsAPIManager.instance) {
      NewsAPIManager.instance = new NewsAPIManager()
    }
    return NewsAPIManager.instance
  }

  async fetchCryptoNews(limit = 20): Promise<NewsArticle[]> {
    const cacheKey = `crypto_news_${limit}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const articles: NewsArticle[] = []

      // CryptoPanic API
      if (process.env.CRYPTOPANIC_API_KEY) {
        const cryptoPanicNews = await this.fetchFromCryptoPanic(limit / 2)
        articles.push(...cryptoPanicNews)
      }

      // CoinDesk RSS
      const coinDeskNews = await this.fetchFromCoinDesk(limit / 4)
      articles.push(...coinDeskNews)

      // CoinTelegraph RSS
      const coinTelegraphNews = await this.fetchFromCoinTelegraph(limit / 4)
      articles.push(...coinTelegraphNews)

      // Add some mock articles if no real data
      if (articles.length === 0) {
        articles.push(...this.getMockCryptoNews(limit))
      }

      // Sort by published date and remove duplicates
      const uniqueArticles = this.removeDuplicates(articles)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit)

      // Cache the results
      this.cache.set(cacheKey, { data: uniqueArticles, timestamp: Date.now() })

      return uniqueArticles
    } catch (error) {
      console.error("Error fetching crypto news:", error)
      return cached?.data || this.getMockCryptoNews(limit)
    }
  }

  private getMockCryptoNews(limit: number): NewsArticle[] {
    const mockNews: NewsArticle[] = [
      {
        id: "mock_1",
        title: "Bitcoin Surges Past $68,000 as ETF Inflows Hit Record High",
        summary:
          "Spot Bitcoin ETFs see unprecedented $500M daily inflows as institutional adoption accelerates globally",
        source: "CryptoNews",
        category: "crypto",
        publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "positive",
        impact: "high",
        aiSummary: "Strong institutional demand signals potential for continued upward momentum in BTC price",
        tags: ["BTC", "ETF", "institutional"],
      },
      {
        id: "mock_2",
        title: "Ethereum Layer 2 Solutions See 400% Growth in Transaction Volume",
        summary: "Arbitrum, Optimism, and Polygon lead the charge in scaling Ethereum with record-breaking activity",
        source: "DeFi Pulse",
        category: "crypto",
        publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "positive",
        impact: "medium",
        aiSummary: "L2 growth indicates healthy ecosystem development and potential ETH price catalyst",
        tags: ["ETH", "L2", "scaling"],
      },
      {
        id: "mock_3",
        title: "Major Crypto Exchange Reports $2B in Suspicious Transactions",
        summary: "Regulatory scrutiny increases as exchange implements enhanced KYC measures",
        source: "Regulatory Watch",
        category: "crypto",
        publishedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "negative",
        impact: "medium",
        aiSummary: "Regulatory pressure may impact short-term sentiment but strengthens long-term legitimacy",
        tags: ["regulation", "compliance", "exchange"],
      },
      {
        id: "mock_4",
        title: "DeFi Protocol Launches Revolutionary Yield Farming Strategy",
        summary: "New automated market maker promises 15% APY with reduced impermanent loss risk",
        source: "DeFi Today",
        category: "crypto",
        publishedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "positive",
        impact: "low",
        aiSummary: "Innovation in DeFi continues to attract capital and users to the ecosystem",
        tags: ["DeFi", "yield", "AMM"],
      },
      {
        id: "mock_5",
        title: "Central Bank Digital Currency Pilot Program Expands to 10 Countries",
        summary: "Global CBDC adoption accelerates as nations test digital currency infrastructure",
        source: "Central Banking",
        category: "crypto",
        publishedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "neutral",
        impact: "high",
        aiSummary: "CBDC development may compete with but also legitimize cryptocurrency adoption",
        tags: ["CBDC", "government", "adoption"],
      },
    ]

    return mockNews.slice(0, limit)
  }

  private async fetchFromCryptoPanic(limit: number): Promise<NewsArticle[]> {
    try {
      const response = await fetch(
        `https://cryptopanic.com/api/v1/posts/?auth_token=${process.env.CRYPTOPANIC_API_KEY}&public=true&kind=news&filter=hot&page_size=${limit}`,
      )
      const data = await response.json()

      return (
        data.results?.map((item: any) => ({
          id: `cryptopanic_${item.id}`,
          title: item.title,
          summary: item.title,
          source: item.source?.title || "CryptoPanic",
          category: "crypto" as const,
          publishedAt: item.published_at,
          url: item.url,
          sentiment: this.detectSentiment(item.title),
          impact: item.votes?.important > 5 ? "high" : item.votes?.important > 2 ? "medium" : "low",
          tags: item.currencies?.map((c: any) => c.code) || [],
          imageUrl: item.source?.favicon,
        })) || []
      )
    } catch (error) {
      console.error("CryptoPanic API error:", error)
      return []
    }
  }

  private async fetchFromCoinDesk(limit: number): Promise<NewsArticle[]> {
    try {
      const response = await fetch("https://www.coindesk.com/arc/outboundfeeds/rss/")
      const text = await response.text()

      // Parse RSS feed (simplified - you might want to use a proper RSS parser)
      const articles = this.parseRSSFeed(text, "CoinDesk", limit)
      return articles
    } catch (error) {
      console.error("CoinDesk RSS error:", error)
      return []
    }
  }

  private async fetchFromCoinTelegraph(limit: number): Promise<NewsArticle[]> {
    try {
      const response = await fetch("https://cointelegraph.com/rss")
      const text = await response.text()

      const articles = this.parseRSSFeed(text, "CoinTelegraph", limit)
      return articles
    } catch (error) {
      console.error("CoinTelegraph RSS error:", error)
      return []
    }
  }

  private parseRSSFeed(rssText: string, source: string, limit: number): NewsArticle[] {
    const articles: NewsArticle[] = []

    // Simple RSS parsing (in production, use a proper RSS parser like 'rss-parser')
    const itemRegex = /<item>(.*?)<\/item>/gs
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/s
    const linkRegex = /<link>(.*?)<\/link>/s
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/s
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/s

    let match
    let count = 0

    while ((match = itemRegex.exec(rssText)) !== null && count < limit) {
      const itemContent = match[1]

      const titleMatch = titleRegex.exec(itemContent)
      const linkMatch = linkRegex.exec(itemContent)
      const descMatch = descRegex.exec(itemContent)
      const pubDateMatch = pubDateRegex.exec(itemContent)

      if (titleMatch && linkMatch) {
        articles.push({
          id: `${source.toLowerCase()}_${Date.now()}_${count}`,
          title: titleMatch[1].trim(),
          summary: descMatch
            ? descMatch[1]
                .replace(/<[^>]*>/g, "")
                .trim()
                .substring(0, 200)
            : titleMatch[1].trim(),
          source,
          category: "crypto" as const,
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          url: linkMatch[1].trim(),
          sentiment: this.detectSentiment(titleMatch[1]),
          impact: "medium" as const,
        })
        count++
      }
    }

    return articles
  }

  private detectSentiment(text: string): "positive" | "negative" | "neutral" {
    const positiveWords = [
      "surge",
      "rally",
      "bull",
      "gain",
      "rise",
      "up",
      "high",
      "moon",
      "pump",
      "breakthrough",
      "adoption",
      "partnership",
      "growth",
      "success",
      "record",
      "milestone",
    ]
    const negativeWords = [
      "crash",
      "dump",
      "bear",
      "fall",
      "drop",
      "down",
      "low",
      "fear",
      "sell",
      "decline",
      "hack",
      "scam",
      "regulation",
      "ban",
      "warning",
      "risk",
    ]

    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>()
    return articles.filter((article) => {
      const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, "")
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  async fetchStockNews(limit = 10): Promise<NewsArticle[]> {
    try {
      if (!process.env.NEWSDATA_API_KEY) {
        return this.getMockStockNews(limit)
      }

      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&category=business&q=stock%20market&size=${limit}`,
      )
      const data = await response.json()

      return (
        data.results?.map((item: any) => ({
          id: `newsdata_${item.article_id}`,
          title: item.title,
          summary: item.description || item.title,
          source: item.source_id,
          category: "stocks" as const,
          publishedAt: item.pubDate,
          url: item.link,
          sentiment: this.detectSentiment(item.title),
          impact: "medium" as const,
          imageUrl: item.image_url,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching stock news:", error)
      return this.getMockStockNews(limit)
    }
  }

  private getMockStockNews(limit: number): NewsArticle[] {
    const mockNews: NewsArticle[] = [
      {
        id: "stock_mock_1",
        title: "S&P 500 Reaches New All-Time High Amid Tech Rally",
        summary: "Major technology stocks drive market gains as earnings season approaches",
        source: "MarketWatch",
        category: "stocks",
        publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "positive",
        impact: "high",
      },
      {
        id: "stock_mock_2",
        title: "Federal Reserve Hints at Interest Rate Stability",
        summary: "Fed officials suggest current rates may remain unchanged through Q2",
        source: "Financial Times",
        category: "stocks",
        publishedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "neutral",
        impact: "high",
      },
    ]

    return mockNews.slice(0, limit)
  }

  async fetchEconomyNews(limit = 10): Promise<NewsArticle[]> {
    try {
      if (!process.env.NEWSDATA_API_KEY) {
        return this.getMockEconomyNews(limit)
      }

      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&category=business&q=economy%20inflation%20fed&size=${limit}`,
      )
      const data = await response.json()

      return (
        data.results?.map((item: any) => ({
          id: `economy_${item.article_id}`,
          title: item.title,
          summary: item.description || item.title,
          source: item.source_id,
          category: "economy" as const,
          publishedAt: item.pubDate,
          url: item.link,
          sentiment: this.detectSentiment(item.title),
          impact: "high" as const,
          imageUrl: item.image_url,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching economy news:", error)
      return this.getMockEconomyNews(limit)
    }
  }

  private getMockEconomyNews(limit: number): NewsArticle[] {
    const mockNews: NewsArticle[] = [
      {
        id: "economy_mock_1",
        title: "Inflation Rate Drops to 3.2% in Latest CPI Report",
        summary: "Consumer prices show continued cooling trend, supporting Fed policy stance",
        source: "Reuters",
        category: "economy",
        publishedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "positive",
        impact: "high",
      },
      {
        id: "economy_mock_2",
        title: "Global Supply Chain Disruptions Ease in Q4",
        summary: "Manufacturing and shipping delays show significant improvement worldwide",
        source: "Bloomberg",
        category: "economy",
        publishedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
        url: "#",
        sentiment: "positive",
        impact: "medium",
      },
    ]

    return mockNews.slice(0, limit)
  }

  async analyzeNewsSentiment(articles: NewsArticle[]): Promise<NewsArticle[]> {
    // This would integrate with OpenAI for better sentiment analysis
    // For now, using the basic sentiment detection
    return articles.map((article) => ({
      ...article,
      sentiment: this.detectSentiment(article.title + " " + article.summary),
    }))
  }
}

export const newsAPIManager = NewsAPIManager.getInstance()

// Whale tracking functionality
class WhaleTracker {
  private static instance: WhaleTracker
  private whaleAlertApiKey: string

  constructor() {
    this.whaleAlertApiKey = process.env.WHALE_ALERT_API_KEY || ""
  }

  static getInstance(): WhaleTracker {
    if (!WhaleTracker.instance) {
      WhaleTracker.instance = new WhaleTracker()
    }
    return WhaleTracker.instance
  }

  async getRecentWhaleTransactions(limit = 50): Promise<WhaleTransaction[]> {
    if (!this.whaleAlertApiKey) {
      return this.getMockWhaleTransactions(limit)
    }

    try {
      const response = await fetch(
        `https://api.whale-alert.io/v1/transactions?api_key=${this.whaleAlertApiKey}&min_value=500000&limit=${limit}`,
      )
      const data = await response.json()

      return (
        data.transactions?.map((tx: any) => ({
          id: tx.hash,
          hash: tx.hash,
          blockchain: tx.blockchain,
          symbol: tx.symbol,
          amount: tx.amount,
          amountUSD: tx.amount_usd,
          from: tx.from?.address || "unknown",
          to: tx.to?.address || "unknown",
          timestamp: new Date(tx.timestamp * 1000),
          type: this.determineTransactionType(tx),
          exchange: tx.from?.name || tx.to?.name,
          walletLabel: tx.from?.owner || tx.to?.owner,
        })) || []
      )
    } catch (error) {
      console.error("Whale Alert API error:", error)
      return this.getMockWhaleTransactions(limit)
    }
  }

  private getMockWhaleTransactions(limit: number): WhaleTransaction[] {
    const mockTransactions: WhaleTransaction[] = []
    const symbols = ["BTC", "ETH", "USDT", "BNB", "SOL", "ADA", "XRP", "MATIC", "AVAX", "DOT"]
    const exchanges = ["Binance", "Coinbase", "Kraken", "Bybit", "OKX", "Bitfinex", "Huobi"]
    const blockchains = ["bitcoin", "ethereum", "binance-smart-chain", "solana", "polygon"]

    for (let i = 0; i < limit; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const blockchain = blockchains[Math.floor(Math.random() * blockchains.length)]
      const amount = Math.random() * 1000 + 100
      const basePrice = symbol === "BTC" ? 65000 : symbol === "ETH" ? 3500 : 1
      const amountUSD = amount * basePrice * (0.8 + Math.random() * 0.4)

      const transactionTypes: WhaleTransaction["type"][] = [
        "exchange_inflow",
        "exchange_outflow",
        "transfer",
        "dex_trade",
      ]

      mockTransactions.push({
        id: `mock_${Date.now()}_${i}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockchain,
        symbol,
        amount,
        amountUSD,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        exchange: Math.random() > 0.5 ? exchanges[Math.floor(Math.random() * exchanges.length)] : undefined,
        isSmartMoney: Math.random() > 0.7,
        walletLabel: Math.random() > 0.8 ? "Institutional Wallet" : undefined,
      })
    }

    return mockTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  private determineTransactionType(tx: any): WhaleTransaction["type"] {
    if (tx.from?.name && !tx.to?.name) return "exchange_outflow"
    if (!tx.from?.name && tx.to?.name) return "exchange_inflow"
    if (tx.from?.name && tx.to?.name) return "transfer"
    return "transfer"
  }

  async getSmartMoneyWallets(limit = 20): Promise<SmartMoneyWallet[]> {
    // Mock smart money wallets - in production, integrate with Arkham, Nansen, etc.
    const mockWallets: SmartMoneyWallet[] = []
    const walletTypes: SmartMoneyWallet["type"][] = ["whale", "institution", "smart_trader", "early_adopter"]
    const walletLabels = [
      "DeFi Whale #1",
      "Institutional Fund",
      "Smart Trader Pro",
      "Early Bitcoin Adopter",
      "Yield Farmer Elite",
      "NFT Collector",
      "Arbitrage Bot",
      "Long-term Holder",
    ]

    for (let i = 0; i < limit; i++) {
      const recentActivity = await this.getRecentWhaleTransactions(3)

      mockWallets.push({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        label: walletLabels[Math.floor(Math.random() * walletLabels.length)],
        type: walletTypes[Math.floor(Math.random() * walletTypes.length)],
        totalBalance: Math.random() * 10000000 + 1000000,
        recentActivity: recentActivity.slice(0, 3),
        winRate: Math.random() * 30 + 70, // 70-100%
        avgProfit: Math.random() * 50 + 10, // 10-60%
        followersCount: Math.floor(Math.random() * 5000 + 100),
      })
    }

    return mockWallets
  }
}

export const whaleTracker = WhaleTracker.getInstance()

// Export functions for backward compatibility
export async function fetchCryptoNews() {
  return newsAPIManager.fetchCryptoNews()
}

export async function fetchStockNews() {
  return newsAPIManager.fetchStockNews()
}

export async function fetchEconomyNews() {
  return newsAPIManager.fetchEconomyNews()
}

export async function analyzeNewsSentiment(articles: any[]) {
  return newsAPIManager.analyzeNewsSentiment(articles)
}
