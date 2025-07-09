export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  high_24h: number
  low_24h: number
  last_updated: string
}

export interface WhaleTransaction {
  id: string
  blockchain: string
  symbol: string
  amount: number
  amount_usd: number
  from: string
  to: string
  hash: string
  timestamp: string
  transaction_type: string
}

export interface CryptoNews {
  id: string
  title: string
  url: string
  source: string
  published_at: string
  sentiment: "positive" | "negative" | "neutral"
  currencies: string[]
  summary?: string
}

export interface MarketTrend {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  volume_24h: number
  rank: number
}

class CryptoAPI {
  private baseUrl = "https://api.coingecko.com/api/v3"
  private newsApiKey = process.env.CRYPTO_NEWS_API_KEY || ""

  async getLivePrices(
    coins: string[] = ["bitcoin", "ethereum", "binancecoin", "cardano", "solana"],
  ): Promise<CryptoPrice[]> {
    try {
      const coinsParam = coins.join(",")
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${coinsParam}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`,
        {
          headers: {
            Accept: "application/json",
          },
          next: { revalidate: 30 }, // Cache for 30 seconds
        },
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      return data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_24h || 0,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        last_updated: coin.last_updated,
      }))
    } catch (error) {
      console.error("Error fetching crypto prices:", error)
      return []
    }
  }

  async getTopGainersLosers(): Promise<{ gainers: MarketTrend[]; losers: MarketTrend[] }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=percent_change_24h_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
        {
          next: { revalidate: 60 }, // Cache for 1 minute
        },
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      const trends = data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        market_cap: coin.market_cap,
        volume_24h: coin.total_volume,
        rank: coin.market_cap_rank,
      }))

      const gainers = trends.filter((coin: MarketTrend) => coin.price_change_percentage_24h > 0).slice(0, 10)

      const losers = trends
        .filter((coin: MarketTrend) => coin.price_change_percentage_24h < 0)
        .sort((a: MarketTrend, b: MarketTrend) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, 10)

      return { gainers, losers }
    } catch (error) {
      console.error("Error fetching market trends:", error)
      return { gainers: [], losers: [] }
    }
  }

  async getCryptoNews(): Promise<CryptoNews[]> {
    try {
      // Using CryptoPanic API (free tier)
      const response = await fetch(
        "https://cryptopanic.com/api/v1/posts/?auth_token=free&public=true&kind=news&filter=hot",
        {
          next: { revalidate: 300 }, // Cache for 5 minutes
        },
      )

      if (!response.ok) {
        throw new Error(`CryptoPanic API error: ${response.status}`)
      }

      const data = await response.json()
      return (
        data.results?.slice(0, 20).map((article: any) => ({
          id: article.id.toString(),
          title: article.title,
          url: article.url,
          source: article.source?.title || "Unknown",
          published_at: article.published_at,
          sentiment: this.analyzeSentiment(article.title),
          currencies: article.currencies?.map((c: any) => c.code) || [],
          summary: article.title.length > 100 ? article.title.substring(0, 100) + "..." : article.title,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching crypto news:", error)
      // Fallback to mock data
      return this.getMockNews()
    }
  }

  async getWhaleAlerts(): Promise<WhaleTransaction[]> {
    try {
      // Mock whale data since Whale Alert API requires paid subscription
      // In production, you would integrate with Whale Alert API or similar service
      return this.getMockWhaleData()
    } catch (error) {
      console.error("Error fetching whale alerts:", error)
      return []
    }
  }

  private analyzeSentiment(title: string): "positive" | "negative" | "neutral" {
    const positiveWords = ["surge", "pump", "bull", "rise", "gain", "up", "high", "moon", "breakthrough"]
    const negativeWords = ["crash", "dump", "bear", "fall", "drop", "down", "low", "collapse", "decline"]

    const lowerTitle = title.toLowerCase()
    const hasPositive = positiveWords.some((word) => lowerTitle.includes(word))
    const hasNegative = negativeWords.some((word) => lowerTitle.includes(word))

    if (hasPositive && !hasNegative) return "positive"
    if (hasNegative && !hasPositive) return "negative"
    return "neutral"
  }

  private getMockNews(): CryptoNews[] {
    return [
      {
        id: "1",
        title: "Bitcoin Surges Past $45,000 as Institutional Adoption Continues",
        url: "#",
        source: "CoinDesk",
        published_at: new Date().toISOString(),
        sentiment: "positive",
        currencies: ["BTC"],
      },
      {
        id: "2",
        title: "Ethereum 2.0 Staking Rewards Reach New All-Time High",
        url: "#",
        source: "CoinTelegraph",
        published_at: new Date(Date.now() - 3600000).toISOString(),
        sentiment: "positive",
        currencies: ["ETH"],
      },
      {
        id: "3",
        title: "Regulatory Concerns Impact Altcoin Market Performance",
        url: "#",
        source: "Decrypt",
        published_at: new Date(Date.now() - 7200000).toISOString(),
        sentiment: "negative",
        currencies: ["ADA", "SOL"],
      },
    ]
  }

  private getMockWhaleData(): WhaleTransaction[] {
    const now = Date.now()
    return [
      {
        id: "1",
        blockchain: "Bitcoin",
        symbol: "BTC",
        amount: 1250.5,
        amount_usd: 56250000,
        from: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        to: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
        hash: "abc123...def456",
        timestamp: new Date(now - 300000).toISOString(),
        transaction_type: "transfer",
      },
      {
        id: "2",
        blockchain: "Ethereum",
        symbol: "ETH",
        amount: 15000,
        amount_usd: 37500000,
        from: "0x742d35Cc6634C0532925a3b8D4C9db96",
        to: "0x8ba1f109551bD432803012645Hac136c",
        hash: "xyz789...uvw012",
        timestamp: new Date(now - 600000).toISOString(),
        transaction_type: "transfer",
      },
    ]
  }
}

export const cryptoAPI = new CryptoAPI()
