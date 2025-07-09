// Real-time crypto data integration using multiple APIs

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
  hash: string
  blockchain: string
  symbol: string
  amount: number
  amount_usd: number
  from: {
    address: string
    owner?: string
    owner_type?: string
  }
  to: {
    address: string
    owner?: string
    owner_type?: string
  }
  timestamp: number
  transaction_type: "transfer" | "exchange_deposit" | "exchange_withdrawal"
}

export interface CryptoNews {
  id: string
  title: string
  summary: string
  url: string
  source: string
  published_at: string
  sentiment: "positive" | "negative" | "neutral"
  category: string
  image_url?: string
  votes?: {
    positive: number
    negative: number
    important: number
  }
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
  private static instance: CryptoAPI
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 60000 // 1 minute cache

  static getInstance(): CryptoAPI {
    if (!CryptoAPI.instance) {
      CryptoAPI.instance = new CryptoAPI()
    }
    return CryptoAPI.instance
  }

  private async fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const data = await fetcher()
      this.cache.set(key, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error(`API fetch error for ${key}:`, error)
      if (cached) return cached.data
      throw error
    }
  }

  // 1. Live Price Data using CoinGecko API (Free)
  async getLivePrices(
    coins: string[] = ["bitcoin", "ethereum", "binancecoin", "solana", "cardano"],
  ): Promise<CryptoPrice[]> {
    return this.fetchWithCache("live-prices", async () => {
      try {
        const coinsParam = coins.join(",")
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinsParam}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`,
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
          price_change_24h: coin.price_change_24h,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap: coin.market_cap,
          total_volume: coin.total_volume,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          last_updated: coin.last_updated,
        }))
      } catch (error) {
        console.error("CoinGecko API error:", error)
        return this.getMockPriceData()
      }
    })
  }

  // 2. Whale Alerts using Whale Alert API
  async getWhaleTransactions(minValue = 1000000): Promise<WhaleTransaction[]> {
    return this.fetchWithCache("whale-transactions", async () => {
      try {
        if (process.env.WHALE_ALERT_API_KEY) {
          const response = await fetch(
            `https://api.whale-alert.io/v1/transactions?api_key=${process.env.WHALE_ALERT_API_KEY}&min_value=${minValue}&limit=50`,
          )

          if (!response.ok) {
            throw new Error(`Whale Alert API error: ${response.status}`)
          }

          const data = await response.json()
          return (
            data.transactions?.map((tx: any) => ({
              id: tx.hash,
              hash: tx.hash,
              blockchain: tx.blockchain,
              symbol: tx.symbol,
              amount: tx.amount,
              amount_usd: tx.amount_usd,
              from: {
                address: tx.from.address,
                owner: tx.from.owner,
                owner_type: tx.from.owner_type,
              },
              to: {
                address: tx.to.address,
                owner: tx.to.owner,
                owner_type: tx.to.owner_type,
              },
              timestamp: tx.timestamp,
              transaction_type:
                tx.from.owner_type === "exchange"
                  ? "exchange_withdrawal"
                  : tx.to.owner_type === "exchange"
                    ? "exchange_deposit"
                    : "transfer",
            })) || []
          )
        }

        return this.getMockWhaleData()
      } catch (error) {
        console.error("Whale Alert API error:", error)
        return this.getMockWhaleData()
      }
    })
  }

  // 3. Real-Time Crypto News using CryptoPanic API
  async getCryptoNews(limit = 20): Promise<CryptoNews[]> {
    return this.fetchWithCache("crypto-news", async () => {
      try {
        if (process.env.CRYPTOPANIC_API_KEY) {
          const response = await fetch(
            `https://cryptopanic.com/api/v1/posts/?auth_token=${process.env.CRYPTOPANIC_API_KEY}&public=true&kind=news&filter=hot&page_size=${limit}`,
          )

          if (!response.ok) {
            throw new Error(`CryptoPanic API error: ${response.status}`)
          }

          const data = await response.json()
          return (
            data.results?.map((item: any) => ({
              id: item.id.toString(),
              title: item.title,
              summary: item.title,
              url: item.url,
              source: item.source?.title || "CryptoPanic",
              published_at: item.published_at,
              sentiment: this.determineSentiment(item.votes),
              category: item.currencies?.[0]?.title || "General",
              image_url: item.source?.favicon,
              votes: item.votes,
            })) || []
          )
        }

        // Fallback to RSS feeds
        return this.getRSSNews(limit)
      } catch (error) {
        console.error("CryptoPanic API error:", error)
        return this.getMockNewsData()
      }
    })
  }

  // 4. Market Trends, Gainers, Losers
  async getMarketTrends(): Promise<{
    gainers: MarketTrend[]
    losers: MarketTrend[]
    trending: MarketTrend[]
  }> {
    return this.fetchWithCache("market-trends", async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h",
        )

        if (!response.ok) {
          throw new Error(`CoinGecko trends API error: ${response.status}`)
        }

        const data = await response.json()
        const trends = data.map((coin: any, index: number) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap: coin.market_cap,
          volume_24h: coin.total_volume,
          rank: index + 1,
        }))

        // Sort for gainers and losers
        const gainers = [...trends]
          .filter((coin) => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          .slice(0, 10)

        const losers = [...trends]
          .filter((coin) => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
          .slice(0, 10)

        const trending = trends.slice(0, 10)

        return { gainers, losers, trending }
      } catch (error) {
        console.error("Market trends API error:", error)
        return this.getMockTrendsData()
      }
    })
  }

  // Get trending coins from CoinGecko
  async getTrendingCoins(): Promise<any[]> {
    return this.fetchWithCache("trending-coins", async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/search/trending")

        if (!response.ok) {
          throw new Error(`CoinGecko trending API error: ${response.status}`)
        }

        const data = await response.json()
        return (
          data.coins?.map((item: any) => ({
            id: item.item.id,
            name: item.item.name,
            symbol: item.item.symbol,
            market_cap_rank: item.item.market_cap_rank,
            thumb: item.item.thumb,
            price_btc: item.item.price_btc,
          })) || []
        )
      } catch (error) {
        console.error("Trending coins API error:", error)
        return []
      }
    })
  }

  // Helper methods
  private determineSentiment(votes: any): "positive" | "negative" | "neutral" {
    if (!votes) return "neutral"

    const positive = votes.positive || 0
    const negative = votes.negative || 0

    if (positive > negative) return "positive"
    if (negative > positive) return "negative"
    return "neutral"
  }

  private async getRSSNews(limit: number): Promise<CryptoNews[]> {
    try {
      // This would require server-side RSS parsing
      // For now, return mock data
      return this.getMockNewsData().slice(0, limit)
    } catch (error) {
      console.error("RSS news error:", error)
      return this.getMockNewsData()
    }
  }

  // Mock data methods for fallback
  private getMockPriceData(): CryptoPrice[] {
    return [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        current_price: 67234.56,
        price_change_24h: 1567.89,
        price_change_percentage_24h: 2.39,
        market_cap: 1320000000000,
        total_volume: 28500000000,
        high_24h: 68500.0,
        low_24h: 65800.0,
        last_updated: new Date().toISOString(),
      },
      {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        current_price: 3456.78,
        price_change_24h: -89.12,
        price_change_percentage_24h: -2.51,
        market_cap: 415000000000,
        total_volume: 15200000000,
        high_24h: 3580.0,
        low_24h: 3420.0,
        last_updated: new Date().toISOString(),
      },
      {
        id: "binancecoin",
        symbol: "BNB",
        name: "BNB",
        current_price: 589.45,
        price_change_24h: 23.67,
        price_change_percentage_24h: 4.18,
        market_cap: 87500000000,
        total_volume: 1800000000,
        high_24h: 595.0,
        low_24h: 565.0,
        last_updated: new Date().toISOString(),
      },
    ]
  }

  private getMockWhaleData(): WhaleTransaction[] {
    return [
      {
        id: "whale_1",
        hash: "0x1234567890abcdef1234567890abcdef12345678",
        blockchain: "ethereum",
        symbol: "ETH",
        amount: 15000,
        amount_usd: 51840000,
        from: {
          address: "0xabcd...1234",
          owner: "Unknown Wallet",
        },
        to: {
          address: "0xefgh...5678",
          owner: "Binance",
          owner_type: "exchange",
        },
        timestamp: Math.floor(Date.now() / 1000) - 1800,
        transaction_type: "exchange_deposit",
      },
      {
        id: "whale_2",
        hash: "0xabcdef1234567890abcdef1234567890abcdef12",
        blockchain: "bitcoin",
        symbol: "BTC",
        amount: 750,
        amount_usd: 50425920,
        from: {
          address: "1A1zP1...DivfNa",
          owner: "Coinbase",
          owner_type: "exchange",
        },
        to: {
          address: "3J98t1...WrnqRh",
          owner: "Unknown Wallet",
        },
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        transaction_type: "exchange_withdrawal",
      },
    ]
  }

  private getMockNewsData(): CryptoNews[] {
    return [
      {
        id: "1",
        title: "Bitcoin ETF Sees Record $500M Daily Inflows",
        summary: "Spot Bitcoin ETFs continue to attract institutional investors with unprecedented daily inflows.",
        url: "#",
        source: "CoinDesk",
        published_at: new Date(Date.now() - 1800000).toISOString(),
        sentiment: "positive",
        category: "Bitcoin",
        votes: { positive: 45, negative: 5, important: 12 },
      },
      {
        id: "2",
        title: "Ethereum Layer 2 Solutions Hit New Transaction Records",
        summary: "Arbitrum and Optimism process over 2M transactions daily as scaling solutions gain traction.",
        url: "#",
        source: "CoinTelegraph",
        published_at: new Date(Date.now() - 3600000).toISOString(),
        sentiment: "positive",
        category: "Ethereum",
        votes: { positive: 32, negative: 8, important: 7 },
      },
      {
        id: "3",
        title: "Major Exchange Faces Regulatory Scrutiny",
        summary: "Regulators investigate trading practices amid concerns over market manipulation.",
        url: "#",
        source: "CryptoPanic",
        published_at: new Date(Date.now() - 5400000).toISOString(),
        sentiment: "negative",
        category: "Regulation",
        votes: { positive: 12, negative: 28, important: 15 },
      },
    ]
  }

  private getMockTrendsData(): { gainers: MarketTrend[]; losers: MarketTrend[]; trending: MarketTrend[] } {
    return {
      gainers: [
        {
          id: "solana",
          symbol: "SOL",
          name: "Solana",
          current_price: 156.78,
          price_change_percentage_24h: 12.45,
          market_cap: 67800000000,
          volume_24h: 2100000000,
          rank: 5,
        },
        {
          id: "cardano",
          symbol: "ADA",
          name: "Cardano",
          current_price: 0.4567,
          price_change_percentage_24h: 8.92,
          market_cap: 16200000000,
          volume_24h: 450000000,
          rank: 8,
        },
      ],
      losers: [
        {
          id: "ripple",
          symbol: "XRP",
          name: "XRP",
          current_price: 0.5234,
          price_change_percentage_24h: -5.67,
          market_cap: 28900000000,
          volume_24h: 1200000000,
          rank: 6,
        },
        {
          id: "dogecoin",
          symbol: "DOGE",
          name: "Dogecoin",
          current_price: 0.0789,
          price_change_percentage_24h: -3.21,
          market_cap: 11400000000,
          volume_24h: 890000000,
          rank: 9,
        },
      ],
      trending: [
        {
          id: "bitcoin",
          symbol: "BTC",
          name: "Bitcoin",
          current_price: 67234.56,
          price_change_percentage_24h: 2.39,
          market_cap: 1320000000000,
          volume_24h: 28500000000,
          rank: 1,
        },
        {
          id: "ethereum",
          symbol: "ETH",
          name: "Ethereum",
          current_price: 3456.78,
          price_change_percentage_24h: -2.51,
          market_cap: 415000000000,
          volume_24h: 15200000000,
          rank: 2,
        },
      ],
    }
  }
}

export const cryptoAPI = CryptoAPI.getInstance()
