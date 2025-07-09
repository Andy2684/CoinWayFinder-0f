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

      // Sort by published date and remove duplicates
      const uniqueArticles = this.removeDuplicates(articles)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit)

      // Cache the results
      this.cache.set(cacheKey, { data: uniqueArticles, timestamp: Date.now() })

      return uniqueArticles
    } catch (error) {
      console.error("Error fetching crypto news:", error)
      return cached?.data || []
    }
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
      if (!process.env.NEWSDATA_API_KEY) return []

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
      return []
    }
  }

  async fetchEconomyNews(limit = 10): Promise<NewsArticle[]> {
    try {
      if (!process.env.NEWSDATA_API_KEY) return []

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
      return []
    }
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
    const symbols = ["BTC", "ETH", "USDT", "BNB", "SOL", "ADA", "XRP"]
    const exchanges = ["Binance", "Coinbase", "Kraken", "Bybit", "OKX"]

    for (let i = 0; i < limit; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const amount = Math.random() * 1000 + 100
      const amountUSD = amount * (Math.random() * 50000 + 10000)

      mockTransactions.push({
        id: `mock_${Date.now()}_${i}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockchain: "ethereum",
        symbol,
        amount,
        amountUSD,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        type: Math.random() > 0.5 ? "exchange_inflow" : "exchange_outflow",
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        isSmartMoney: Math.random() > 0.7,
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

    for (let i = 0; i < limit; i++) {
      const recentActivity = await this.getRecentWhaleTransactions(5)

      mockWallets.push({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        label: `Smart Trader ${i + 1}`,
        type: Math.random() > 0.5 ? "smart_trader" : "whale",
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
