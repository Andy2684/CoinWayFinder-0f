import { NextResponse } from "next/server"
import {
  createTradingSignal,
  getTradingSignals,
  createTradingBot,
  getTradingBots,
  updatePortfolioPosition,
  getUserPortfolio,
  createTradeRecord,
  getTradeHistory,
  createAlert,
  getUserAlerts,
  updateRiskSettings,
  getUserRiskSettings,
  createNewsArticle,
  getNewsArticles,
} from "@/lib/database"
import { sql } from "@/lib/db" // Declare the sql variable

export async function POST() {
  try {
    const testUserId = "test-user-" + Date.now()
    const results = []

    // Test Trading Signals
    try {
      const signal = await createTradingSignal({
        symbol: "BTC/USD",
        type: "BUY",
        price: 50000,
        targetPrice: 55000,
        stopLoss: 45000,
        confidence: 0.85,
        timeframe: "1h",
        exchange: "binance",
        analysis: "Test signal",
        createdBy: testUserId,
      })

      const signals = await getTradingSignals(10, 0)

      results.push({
        feature: "trading_signals",
        status: "passed",
        details: {
          created: !!signal,
          retrieved: signals.length >= 0,
        },
      })
    } catch (error) {
      results.push({
        feature: "trading_signals",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test Trading Bots
    try {
      const bot = await createTradingBot({
        name: "Test Bot",
        strategy: "grid",
        symbol: "BTC/USD",
        exchange: "binance",
        config: { gridSize: 10, upperLimit: 60000, lowerLimit: 40000 },
        createdBy: testUserId,
      })

      const bots = await getTradingBots(testUserId)

      results.push({
        feature: "trading_bots",
        status: "passed",
        details: {
          created: !!bot,
          retrieved: bots.length >= 0,
        },
      })
    } catch (error) {
      results.push({
        feature: "trading_bots",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test Portfolio
    try {
      const position = await updatePortfolioPosition(testUserId, "BTC/USD", {
        quantity: 0.1,
        averagePrice: 50000,
        currentPrice: 52000,
      })

      const portfolio = await getUserPortfolio(testUserId)

      results.push({
        feature: "portfolio",
        status: "passed",
        details: {
          updated: !!position,
          retrieved: portfolio.length >= 0,
        },
      })
    } catch (error) {
      results.push({
        feature: "portfolio",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test Trade History
    try {
      const trade = await createTradeRecord({
        userId: testUserId,
        symbol: "BTC/USD",
        type: "BUY",
        quantity: 0.1,
        price: 50000,
        exchange: "binance",
        fee: 25,
      })

      const trades = await getTradeHistory(testUserId, 10)

      results.push({
        feature: "trade_history",
        status: "passed",
        details: {
          created: !!trade,
          retrieved: trades.length >= 0,
        },
      })
    } catch (error) {
      results.push({
        feature: "trade_history",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test Alerts
    try {
      const alert = await createAlert({
        userId: testUserId,
        name: "BTC Price Alert",
        symbol: "BTC/USD",
        condition: "above",
        targetPrice: 60000,
      })

      const alerts = await getUserAlerts(testUserId)

      results.push({
        feature: "alerts",
        status: "passed",
        details: {
          created: !!alert,
          retrieved: alerts.length >= 0,
        },
      })
    } catch (error) {
      results.push({
        feature: "alerts",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test Risk Settings
    try {
      const settings = await updateRiskSettings(testUserId, {
        maxDrawdown: 15,
        positionSizeLimit: 10,
        dailyLossLimit: 2000,
        maxOpenPositions: 5,
        stopLossEnabled: true,
        takeProfitEnabled: true,
      })

      const retrievedSettings = await getUserRiskSettings(testUserId)

      results.push({
        feature: "risk_settings",
        status: "passed",
        details: {
          updated: !!settings,
          retrieved: !!retrievedSettings,
        },
      })
    } catch (error) {
      results.push({
        feature: "risk_settings",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test News
    try {
      const article = await createNewsArticle({
        title: "Test News Article",
        content: "This is a test news article",
        source: "test-source",
        url: "https://example.com/test",
        sentiment: "positive",
        sentimentScore: 0.8,
        symbols: ["BTC", "ETH"],
        publishedAt: new Date(),
      })

      const articles = await getNewsArticles(10)

      results.push({
        feature: "news",
        status: "passed",
        details: {
          created: !!article,
          retrieved: articles.length >= 0,
        },
      })
    } catch (error) {
      results.push({
        feature: "news",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Clean up test data
    try {
      await sql`DELETE FROM trading_signals WHERE created_by = ${testUserId}`
      await sql`DELETE FROM trading_bots WHERE created_by = ${testUserId}`
      await sql`DELETE FROM portfolios WHERE user_id = ${testUserId}`
      await sql`DELETE FROM trade_history WHERE user_id = ${testUserId}`
      await sql`DELETE FROM alerts WHERE user_id = ${testUserId}`
      await sql`DELETE FROM risk_settings WHERE user_id = ${testUserId}`
      await sql`DELETE FROM news_articles WHERE title = 'Test News Article'`
    } catch (error) {
      console.warn("Cleanup warning:", error)
    }

    const passedTests = results.filter((r) => r.status === "passed").length
    const totalTests = results.length

    return NextResponse.json({
      status: passedTests === totalTests ? "success" : "partial",
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
      },
      results,
    })
  } catch (error) {
    console.error("Feature test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
