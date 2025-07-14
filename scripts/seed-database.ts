import { db } from "../lib/db"
import { users, signals, bots, news, alertRules } from "../lib/db/schema"
import bcrypt from "bcryptjs"

async function seedDatabase() {
  console.log("🌱 Seeding database...")

  try {
    // Create demo users
    const demoUser = await db
      .insert(users)
      .values({
        email: "demo@coinwayfinder.com",
        firstName: "Demo",
        lastName: "User",
        username: "demouser",
        passwordHash: await bcrypt.hash("password", 10),
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        website: "https://demo.coinwayfinder.com",
        bio: "Passionate crypto trader and blockchain enthusiast. Always looking for the next big opportunity in DeFi and NFTs.",
        timezone: "America/New_York",
        role: "user",
        plan: "starter",
        isVerified: true,
        avatar: "/placeholder-user.jpg",
        preferences: {
          theme: "dark",
          notifications: true,
          twoFactor: false,
          emailAlerts: true,
          smsAlerts: false,
          tradingAlerts: true,
          newsAlerts: true,
        },
        securitySettings: {
          sessionTimeout: "30",
          ipWhitelist: false,
          apiAccess: false,
        },
      })
      .returning()

    const adminUser = await db
      .insert(users)
      .values({
        email: "admin@coinwayfinder.com",
        firstName: "Admin",
        lastName: "User",
        username: "admin",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        phone: "+1 (555) 987-6543",
        location: "San Francisco, CA",
        website: "https://admin.coinwayfinder.com",
        bio: "System administrator and crypto expert. Managing the platform and helping users succeed in their trading journey.",
        timezone: "America/Los_Angeles",
        role: "admin",
        plan: "enterprise",
        isVerified: true,
        avatar: "/placeholder-user.jpg",
        preferences: {
          theme: "dark",
          notifications: true,
          twoFactor: true,
          emailAlerts: true,
          smsAlerts: true,
          tradingAlerts: true,
          newsAlerts: true,
        },
        securitySettings: {
          sessionTimeout: "60",
          ipWhitelist: true,
          apiAccess: true,
        },
      })
      .returning()

    console.log("✅ Users created")

    // Create demo signals
    await db.insert(signals).values([
      {
        userId: demoUser[0].id,
        symbol: "BTC/USDT",
        type: "BUY",
        strategy: "Trend Following",
        exchange: "Binance",
        timeframe: "4H",
        confidence: 87,
        entryPrice: "43250.00",
        targetPrice: "45800.00",
        stopLoss: "41900.00",
        currentPrice: "44120.00",
        pnl: "870.00",
        pnlPercentage: "2.01",
        progress: 34,
        riskLevel: "MEDIUM",
        aiAnalysis:
          "Strong bullish momentum with RSI showing oversold conditions. Volume profile indicates institutional accumulation.",
        status: "ACTIVE",
      },
      {
        userId: demoUser[0].id,
        symbol: "ETH/USDT",
        type: "SELL",
        strategy: "Mean Reversion",
        exchange: "Bybit",
        timeframe: "1H",
        confidence: 92,
        entryPrice: "2580.00",
        targetPrice: "2420.00",
        stopLoss: "2650.00",
        currentPrice: "2510.00",
        pnl: "70.00",
        pnlPercentage: "2.71",
        progress: 44,
        riskLevel: "LOW",
        aiAnalysis: "Overbought conditions on multiple timeframes. Bearish divergence detected on MACD.",
        status: "ACTIVE",
      },
    ])

    console.log("✅ Signals created")

    // Create demo bots
    await db.insert(bots).values([
      {
        userId: demoUser[0].id,
        name: "DCA Bitcoin Bot",
        strategy: "DCA",
        status: "ACTIVE",
        pair: "BTC/USDT",
        exchange: "Binance",
        profit: "1250.50",
        totalTrades: 45,
        winRate: "78.50",
        maxDrawdown: "5.25",
        sharpeRatio: "1.85",
        config: {
          amount: 100,
          interval: "1h",
          targetProfit: 15,
          stopLoss: 5,
        },
        riskSettings: {
          maxPositionSize: 1000,
          maxDailyLoss: 50,
          riskPerTrade: 2,
        },
      },
      {
        userId: demoUser[0].id,
        name: "Grid Trading ETH",
        strategy: "Grid",
        status: "PAUSED",
        pair: "ETH/USDT",
        exchange: "Bybit",
        profit: "-230.75",
        totalTrades: 23,
        winRate: "65.22",
        maxDrawdown: "8.90",
        sharpeRatio: "0.45",
        config: {
          gridSize: 10,
          upperLimit: 4000,
          lowerLimit: 3000,
          orderAmount: 50,
        },
        riskSettings: {
          maxPositionSize: 2000,
          maxDailyLoss: 100,
          riskPerTrade: 3,
        },
      },
    ])

    console.log("✅ Bots created")

    // Create demo news
    await db.insert(news).values([
      {
        title: "Bitcoin Reaches New All-Time High of $68,000",
        content:
          "Bitcoin has reached a new all-time high of $68,000, driven by institutional adoption and growing mainstream acceptance...",
        summary: "Bitcoin hits $68K ATH amid institutional buying pressure",
        source: "CoinDesk",
        author: "John Smith",
        url: "https://coindesk.com/bitcoin-ath-68000",
        category: "Market",
        sentiment: "POSITIVE",
        sentimentScore: "0.85",
        impact: "HIGH",
        tags: ["bitcoin", "ath", "institutional"],
        publishedAt: new Date("2024-01-15T10:30:00Z"),
      },
      {
        title: "Ethereum 2.0 Staking Rewards Increase to 5.2%",
        content: "Ethereum 2.0 staking rewards have increased to 5.2% APY as more validators join the network...",
        summary: "ETH 2.0 staking rewards up to 5.2% APY",
        source: "CoinTelegraph",
        author: "Jane Doe",
        url: "https://cointelegraph.com/ethereum-staking-rewards",
        category: "DeFi",
        sentiment: "POSITIVE",
        sentimentScore: "0.72",
        impact: "MEDIUM",
        tags: ["ethereum", "staking", "defi"],
        publishedAt: new Date("2024-01-15T08:15:00Z"),
      },
    ])

    console.log("✅ News created")

    // Create demo alert rules
    await db.insert(alertRules).values([
      {
        userId: demoUser[0].id,
        name: "High Confidence Signals",
        condition: "confidence_above",
        symbol: "BTC/USDT",
        value: "85",
        operator: ">",
        enabled: true,
        channels: ["push", "email"],
        status: "ACTIVE",
      },
      {
        userId: demoUser[0].id,
        name: "BTC Price Alert",
        condition: "price_above",
        symbol: "BTC/USDT",
        value: "45000",
        operator: ">",
        enabled: true,
        channels: ["push", "telegram"],
        status: "ACTIVE",
      },
    ])

    console.log("✅ Alert rules created")

    console.log("🎉 Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
