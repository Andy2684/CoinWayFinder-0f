export interface NewsArticle {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  sentiment?: "positive" | "negative" | "neutral"
  category: string
  imageUrl?: string
}

export interface WhaleTransaction {
  id: string
  hash: string
  amount: number
  amountUsd: number
  symbol: string
  from: string
  to: string
  timestamp: string
  blockchain: string
  transactionType: "transfer" | "exchange_inflow" | "exchange_outflow"
}

class NewsAPI {
  private cryptoPanicKey = process.env.CRYPTOPANIC_API_KEY
  private newsDataKey = process.env.NEWSDATA_API_KEY

  async getCryptoNews(limit = 10): Promise<NewsArticle[]> {
    try {
      const articles: NewsArticle[] = []

      // Try CryptoPanic API first
      if (this.cryptoPanicKey) {
        try {
          const response = await fetch(
            `https://cryptopanic.com/api/v1/posts/?auth_token=${this.cryptoPanicKey}&public=true&limit=${limit}`,
          )
          const data = await response.json()

          if (data.results) {
            articles.push(
              ...data.results.map((item: any) => ({
                id: `cp-${item.id}`,
                title: item.title,
                summary: item.title,
                url: item.url,
                source: item.source?.title || "CryptoPanic",
                publishedAt: item.published_at,
                sentiment:
                  item.votes?.positive > item.votes?.negative
                    ? "positive"
                    : item.votes?.negative > item.votes?.positive
                      ? "negative"
                      : "neutral",
                category: "crypto",
              })),
            )
          }
        } catch (error) {
          console.error("CryptoPanic API error:", error)
        }
      }

      // Try NewsData.io for general crypto news
      if (this.newsDataKey && articles.length < limit) {
        try {
          const response = await fetch(
            `https://newsdata.io/api/1/news?apikey=${this.newsDataKey}&q=cryptocurrency OR bitcoin OR ethereum&language=en&size=${limit - articles.length}`,
          )
          const data = await response.json()

          if (data.results) {
            articles.push(
              ...data.results.map((item: any) => ({
                id: `nd-${item.article_id}`,
                title: item.title,
                summary: item.description || item.title,
                url: item.link,
                source: item.source_id,
                publishedAt: item.pubDate,
                category: "crypto",
                imageUrl: item.image_url,
              })),
            )
          }
        } catch (error) {
          console.error("NewsData API error:", error)
        }
      }

      // RSS feeds as fallback
      if (articles.length < limit) {
        const rssArticles = await this.getRSSFeeds(limit - articles.length)
        articles.push(...rssArticles)
      }

      // Mock data if no real data available
      if (articles.length === 0) {
        return this.getMockNews(limit)
      }

      return articles.slice(0, limit)
    } catch (error) {
      console.error("News API error:", error)
      return this.getMockNews(limit)
    }
  }

  private async getRSSFeeds(limit: number): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = []

    try {
      // CoinDesk RSS
      const coinDeskResponse = await fetch("https://www.coindesk.com/arc/outboundfeeds/rss/")
      const coinDeskText = await coinDeskResponse.text()

      // Simple RSS parsing (in production, use a proper RSS parser)
      const coinDeskItems = this.parseSimpleRSS(coinDeskText, "CoinDesk")
      articles.push(...coinDeskItems.slice(0, Math.floor(limit / 2)))

      // CoinTelegraph RSS
      const cointelegraphResponse = await fetch("https://cointelegraph.com/rss")
      const cointelegraphText = await cointelegraphResponse.text()

      const cointelegraphItems = this.parseSimpleRSS(cointelegraphText, "CoinTelegraph")
      articles.push(...cointelegraphItems.slice(0, limit - articles.length))
    } catch (error) {
      console.error("RSS feed error:", error)
    }

    return articles
  }

  private parseSimpleRSS(rssText: string, source: string): NewsArticle[] {
    const articles: NewsArticle[] = []

    try {
      // Very basic RSS parsing - in production use a proper XML parser
      const items = rssText.match(/<item>[\s\S]*?<\/item>/g) || []

      items.forEach((item, index) => {
        const title =
          item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || ""
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ""
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]></description>/)?.[1] || 
 {27}item.match(/<description>(.*?)<\/description>/)?.[1] || ''
 {8}const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString()
\
        if (title && link) {
          articles.push({
            id: `rss-${source.toLowerCase()}-${index}`,
            title: title.trim(),
            summary: description.trim() || title.trim(),
            url: link.trim(),
            source,
            publishedAt: pubDate,
            category: "crypto",
          })
        }
      })
    } catch (error) {
      console.error("RSS parsing error:", error)
    }

    return articles
  }

  private getMockNews(limit: number): NewsArticle[] {
    const mockArticles = [
      {
        id: "mock-1",
        title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
        summary:
          "Bitcoin surged to unprecedented levels as major corporations announce treasury allocations and ETF approvals drive institutional demand.",
        url: "#",
        source: "CoinWayfinder News",
        publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        sentiment: "positive" as const,
        category: "crypto",
      },
      {
        id: "mock-2",
        title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
        summary:
          "Ethereum validators are seeing increased rewards as network activity surges and staking participation reaches new milestones.",
        url: "#",
        source: "Crypto Daily",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        sentiment: "positive" as const,
        category: "crypto",
      },
      {
        id: "mock-3",
        title: "DeFi Protocol Launches Revolutionary Yield Farming Strategy",
        summary:
          "New automated market maker introduces innovative liquidity mining rewards that could reshape decentralized finance.",
        url: "#",
        source: "DeFi Pulse",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        sentiment: "neutral" as const,
        category: "defi",
      },
      {
        id: "mock-4",
        title: "Regulatory Clarity Boosts Crypto Market Confidence",
        summary:
          "Clear guidelines from financial regulators provide much-needed certainty for cryptocurrency businesses and investors.",
        url: "#",
        source: "Regulatory News",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        sentiment: "positive" as const,
        category: "regulation",
      },
      {
        id: "mock-5",
        title: "Major Exchange Announces Zero-Fee Trading for Retail Investors",
        summary:
          "Leading cryptocurrency exchange eliminates trading fees for retail customers, intensifying competition in the space.",
        url: "#",
        source: "Exchange Weekly",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        sentiment: "positive" as const,
        category: "exchange",
      },
    ]

    return mockArticles.slice(0, limit)
  }

  async getWhaleTransactions(limit = 10): Promise<WhaleTransaction[]> {
    try {
      const whaleAlertKey = process.env.WHALE_ALERT_API_KEY

      if (whaleAlertKey) {
        const response = await fetch(
          `https://api.whale-alert.io/v1/transactions?api_key=${whaleAlertKey}&min_value=1000000&limit=${limit}`,
        )
        const data = await response.json()

        if (data.transactions) {
          return data.transactions.map((tx: any) => ({
            id: tx.hash,
            hash: tx.hash,
            amount: tx.amount,
            amountUsd: tx.amount_usd,
            symbol: tx.symbol,
            from: tx.from?.owner || tx.from?.address || "Unknown",
            to: tx.to?.owner || tx.to?.address || "Unknown",
            timestamp: new Date(tx.timestamp * 1000).toISOString(),
            blockchain: tx.blockchain,
            transactionType:
              tx.from?.owner_type === "exchange"
                ? "exchange_outflow"
                : tx.to?.owner_type === "exchange"
                  ? "exchange_inflow"
                  : "transfer",
          }))
        }
      }

      // Mock whale data if API not available
      return this.getMockWhaleTransactions(limit)
    } catch (error) {
      console.error("Whale Alert API error:", error)
      return this.getMockWhaleTransactions(limit)
    }
  }

  private getMockWhaleTransactions(limit: number): WhaleTransaction[] {
    const mockTransactions = [
      {
        id: "whale-1",
        hash: "0x1234567890abcdef1234567890abcdef12345678",
        amount: 1000,
        amountUsd: 45000000,
        symbol: "BTC",
        from: "Unknown Wallet",
        to: "Binance",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        blockchain: "bitcoin",
        transactionType: "exchange_inflow" as const,
      },
      {
        id: "whale-2",
        hash: "0xabcdef1234567890abcdef1234567890abcdef12",
        amount: 25000,
        amountUsd: 52500000,
        symbol: "ETH",
        from: "Coinbase",
        to: "Unknown Wallet",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        blockchain: "ethereum",
        transactionType: "exchange_outflow" as const,
      },
      {
        id: "whale-3",
        hash: "0x567890abcdef1234567890abcdef1234567890ab",
        amount: 50000000,
        amountUsd: 50000000,
        symbol: "USDT",
        from: "Tether Treasury",
        to: "Kraken",
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        blockchain: "ethereum",
        transactionType: "exchange_inflow" as const,
      },
    ]

    return mockTransactions.slice(0, limit)
  }
}

export const newsAPI = new NewsAPI()
