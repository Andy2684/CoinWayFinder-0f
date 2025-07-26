import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

// User management functions
export async function createUser(userData: {
  email: string
  username: string
  passwordHash: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
}) {
  const [user] = await sql`
    INSERT INTO users (email, username, password_hash, first_name, last_name, date_of_birth)
    VALUES (${userData.email}, ${userData.username}, ${userData.passwordHash}, 
            ${userData.firstName || null}, ${userData.lastName || null}, ${userData.dateOfBirth || null})
    RETURNING id, email, username, first_name, last_name, role, is_email_verified, created_at
  `
  return user
}

export async function getUserByEmail(email: string) {
  const [user] = await sql`
    SELECT id, email, username, password_hash, first_name, last_name, role, is_email_verified, created_at
    FROM users WHERE email = ${email}
  `
  return user
}

export async function getUserById(id: string) {
  const [user] = await sql`
    SELECT id, email, username, first_name, last_name, role, is_email_verified, created_at
    FROM users WHERE id = ${id}
  `
  return user
}

export async function getUserByUsername(username: string) {
  const [user] = await sql`
    SELECT id, email, username, first_name, last_name, role, is_email_verified, created_at
    FROM users WHERE username = ${username}
  `
  return user
}

// Trading bots functions
export async function getTradingBots(userId: string) {
  return await sql`
    SELECT * FROM trading_bots 
    WHERE created_by = ${userId}
    ORDER BY created_at DESC
  `
}

export async function getTradingBotsByUser(userId: string) {
  return await sql`
    SELECT * FROM trading_bots 
    WHERE created_by = ${userId}
    ORDER BY created_at DESC
  `
}

export async function getTradingBotById(botId: string, userId: string) {
  const [bot] = await sql`
    SELECT * FROM trading_bots 
    WHERE id = ${botId} AND created_by = ${userId}
  `
  return bot
}

export async function createTradingBot(botData: {
  name: string
  strategy: string
  symbol: string
  exchange: string
  config: object
  createdBy: string
}) {
  const [bot] = await sql`
    INSERT INTO trading_bots (name, strategy, symbol, exchange, config, created_by)
    VALUES (${botData.name}, ${botData.strategy}, ${botData.symbol}, 
            ${botData.exchange}, ${JSON.stringify(botData.config)}, ${botData.createdBy})
    RETURNING *
  `
  return bot
}

export async function updateTradingBot(
  botId: string,
  userId: string,
  updates: {
    name?: string
    strategy?: string
    config?: object
    status?: string
  },
) {
  const [bot] = await sql`
    UPDATE trading_bots 
    SET name = COALESCE(${updates.name}, name),
        strategy = COALESCE(${updates.strategy}, strategy),
        config = COALESCE(${updates.config ? JSON.stringify(updates.config) : null}, config),
        status = COALESCE(${updates.status}, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${botId} AND created_by = ${userId}
    RETURNING *
  `
  return bot
}

export async function deleteTradingBot(botId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM trading_bots 
    WHERE id = ${botId} AND created_by = ${userId}
  `
  return result.count > 0
}

export async function updateBotStatus(botId: string, status: string) {
  const [bot] = await sql`
    UPDATE trading_bots 
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${botId}
    RETURNING *
  `
  return bot
}

export async function updateBotMetrics(
  botId: string,
  metrics: {
    totalTrades?: number
    lastTradeTime?: Date
    pnl?: number
    winRate?: number
  },
) {
  const [bot] = await sql`
    UPDATE trading_bots 
    SET trades_count = COALESCE(${metrics.totalTrades}, trades_count),
        last_trade_at = COALESCE(${metrics.lastTradeTime}, last_trade_at),
        pnl = COALESCE(${metrics.pnl}, pnl),
        win_rate = COALESCE(${metrics.winRate}, win_rate),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${botId}
    RETURNING *
  `
  return bot
}

// AI Bot functions
export async function getAIBotsByUser(userId: string) {
  return await sql`
    SELECT * FROM trading_bots 
    WHERE created_by = ${userId} AND strategy IN ('neural-network', 'deep-learning', 'reinforcement-learning', 'ensemble-ai')
    ORDER BY created_at DESC
  `
}

export async function createAIBot(botData: {
  name: string
  strategy: string
  symbol: string
  exchange: string
  config: object
  aiConfig: object
  createdBy: string
}) {
  const [bot] = await sql`
    INSERT INTO trading_bots (name, strategy, symbol, exchange, config, ai_config, created_by, status)
    VALUES (${botData.name}, ${botData.strategy}, ${botData.symbol}, 
            ${botData.exchange}, ${JSON.stringify(botData.config)}, 
            ${JSON.stringify(botData.aiConfig)}, ${botData.createdBy}, 'training')
    RETURNING *
  `
  return bot
}

export async function updateAIBotMetrics(
  botId: string,
  metrics: {
    learningProgress?: number
    confidence?: number
    predictionAccuracy?: number
    adaptationRate?: number
  },
) {
  const [bot] = await sql`
    UPDATE trading_bots 
    SET learning_progress = COALESCE(${metrics.learningProgress}, learning_progress),
        ai_confidence = COALESCE(${metrics.confidence}, ai_confidence),
        prediction_accuracy = COALESCE(${metrics.predictionAccuracy}, prediction_accuracy),
        adaptation_rate = COALESCE(${metrics.adaptationRate}, adaptation_rate),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${botId}
    RETURNING *
  `
  return bot
}

// Bot performance and analytics
export async function getBotPerformanceMetrics(botId: string, userId: string, timeframe: string) {
  const [metrics] = await sql`
    SELECT 
      b.*,
      COALESCE(SUM(th.total_value * CASE WHEN th.type = 'sell' THEN 1 ELSE -1 END), 0) as total_pnl,
      COUNT(th.id) as total_trades,
      COALESCE(AVG(CASE WHEN th.pnl > 0 THEN 1.0 ELSE 0.0 END) * 100, 0) as win_rate,
      COALESCE(AVG(th.pnl), 0) as avg_profit,
      COALESCE(MIN(th.pnl), 0) as max_drawdown,
      COALESCE(STDDEV(th.pnl) / NULLIF(AVG(th.pnl), 0), 0) as sharpe_ratio,
      COALESCE(SUM(CASE WHEN th.pnl > 0 THEN th.pnl ELSE 0 END) / NULLIF(ABS(SUM(CASE WHEN th.pnl < 0 THEN th.pnl ELSE 0 END)), 0), 0) as profit_factor
    FROM trading_bots b
    LEFT JOIN trade_history th ON b.id = th.bot_id 
      AND th.executed_at >= CURRENT_DATE - INTERVAL '${timeframe}'
    WHERE b.id = ${botId} AND b.created_by = ${userId}
    GROUP BY b.id
  `
  return metrics
}

export async function getBotTradeHistory(botId: string, userId: string, limit = 100) {
  return await sql`
    SELECT th.* 
    FROM trade_history th
    JOIN trading_bots b ON th.bot_id = b.id
    WHERE th.bot_id = ${botId} AND b.created_by = ${userId}
    ORDER BY th.executed_at DESC
    LIMIT ${limit}
  `
}

export async function getBotAnalytics(
  userId: string,
  options: {
    timeframe?: string
    botIds?: string[]
  },
) {
  const timeframe = options.timeframe || "30d"
  const botFilter = options.botIds ? sql`AND b.id = ANY(${options.botIds})` : sql``

  const [analytics] = await sql`
    SELECT 
      COUNT(DISTINCT b.id) as totalBots,
      COUNT(DISTINCT CASE WHEN b.status = 'active' THEN b.id END) as activeBots,
      COALESCE(SUM(CAST(b.investment AS DECIMAL)), 0) as totalInvestment,
      COALESCE(SUM(CAST(b.pnl AS DECIMAL)), 0) as totalPnl,
      COALESCE(SUM(b.trades_count), 0) as totalTrades,
      COALESCE(AVG(CAST(b.win_rate AS DECIMAL)), 0) as avgWinRate,
      COALESCE(STDDEV(CAST(b.pnl AS DECIMAL)) / NULLIF(AVG(CAST(b.pnl AS DECIMAL)), 0), 0) as sharpeRatio,
      COALESCE(MIN(CAST(b.pnl AS DECIMAL)), 0) as maxDrawdown,
      COALESCE(STDDEV(CAST(b.pnl AS DECIMAL)), 0) as volatility,
      0.8 as beta
    FROM trading_bots b
    WHERE b.created_by = ${userId} ${botFilter}
  `

  // Get best and worst performers
  const performers = await sql`
    SELECT 
      b.id, b.name, b.strategy, CAST(b.pnl AS DECIMAL) as pnl
    FROM trading_bots b
    WHERE b.created_by = ${userId} ${botFilter}
    ORDER BY CAST(b.pnl AS DECIMAL) DESC
  `

  // Get strategy distribution
  const strategyDist = await sql`
    SELECT 
      b.strategy,
      COUNT(*) as count,
      COALESCE(AVG(CAST(b.pnl AS DECIMAL)), 0) as avgPnl
    FROM trading_bots b
    WHERE b.created_by = ${userId} ${botFilter}
    GROUP BY b.strategy
  `

  return {
    ...analytics,
    bestPerformer: performers[0] || null,
    worstPerformer: performers[performers.length - 1] || null,
    strategyDistribution: strategyDist,
    dailyPnl: [], // Would be calculated from trade history
    monthlyPnl: [], // Would be calculated from trade history
  }
}

export async function getPortfolioAnalytics(userId: string, timeframe: string) {
  const [portfolio] = await sql`
    SELECT 
      COALESCE(SUM(p.total_value), 0) as totalValue,
      COALESCE(SUM(p.pnl), 0) as totalPnl
    FROM portfolios p
    WHERE p.user_id = ${userId}
  `

  const allocation = await sql`
    SELECT 
      p.symbol,
      p.total_value,
      p.pnl,
      p.pnl_percentage
    FROM portfolios p
    WHERE p.user_id = ${userId}
    ORDER BY p.total_value DESC
  `

  return {
    ...portfolio,
    allocation,
    performance: [], // Would be calculated from historical data
  }
}

export async function getHistoricalMarketData(symbol: string, days: number) {
  // This would typically fetch from a market data provider
  // For now, return mock data structure
  const data = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    data.push({
      timestamp: date,
      open: 50000 + Math.random() * 10000,
      high: 52000 + Math.random() * 10000,
      low: 48000 + Math.random() * 10000,
      close: 50000 + Math.random() * 10000,
      volume: Math.random() * 1000000,
    })
  }

  return data
}

// Trading signals functions
export async function getTradingSignals(limit = 50, offset = 0) {
  return await sql`
    SELECT * FROM trading_signals 
    ORDER BY created_at DESC 
    LIMIT ${limit} OFFSET ${offset}
  `
}

export async function createTradingSignal(signalData: {
  symbol: string
  type: string
  price: number
  targetPrice?: number
  stopLoss?: number
  confidence: number
  timeframe?: string
  exchange?: string
  analysis?: string
  createdBy: string
}) {
  const [signal] = await sql`
    INSERT INTO trading_signals (
      symbol, type, price, target_price, stop_loss, confidence, 
      timeframe, exchange, analysis, created_by
    )
    VALUES (
      ${signalData.symbol}, ${signalData.type}, ${signalData.price}, 
      ${signalData.targetPrice || null}, ${signalData.stopLoss || null}, 
      ${signalData.confidence}, ${signalData.timeframe || null}, 
      ${signalData.exchange || null}, ${signalData.analysis || null}, 
      ${signalData.createdBy}
    )
    RETURNING *
  `
  return signal
}

// Portfolio functions
export async function getUserPortfolio(userId: string) {
  return await sql`
    SELECT * FROM portfolios 
    WHERE user_id = ${userId}
    ORDER BY total_value DESC
  `
}

export async function updatePortfolioPosition(
  userId: string,
  symbol: string,
  data: {
    quantity: number
    averagePrice: number
    currentPrice?: number
  },
) {
  const totalValue = data.quantity * (data.currentPrice || data.averagePrice)
  const pnl = data.currentPrice ? (data.currentPrice - data.averagePrice) * data.quantity : 0
  const pnlPercentage = data.averagePrice > 0 ? (pnl / (data.averagePrice * data.quantity)) * 100 : 0

  const [position] = await sql`
    INSERT INTO portfolios (user_id, symbol, quantity, average_price, current_price, total_value, pnl, pnl_percentage)
    VALUES (${userId}, ${symbol}, ${data.quantity}, ${data.averagePrice}, 
            ${data.currentPrice || null}, ${totalValue}, ${pnl}, ${pnlPercentage})
    ON CONFLICT (user_id, symbol) 
    DO UPDATE SET 
      quantity = ${data.quantity},
      average_price = ${data.averagePrice},
      current_price = ${data.currentPrice || null},
      total_value = ${totalValue},
      pnl = ${pnl},
      pnl_percentage = ${pnlPercentage},
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return position
}

// Trade history functions
export async function getTradeHistory(userId: string, limit = 100) {
  return await sql`
    SELECT * FROM trade_history 
    WHERE user_id = ${userId}
    ORDER BY executed_at DESC
    LIMIT ${limit}
  `
}

export async function createTradeRecord(tradeData: {
  userId: string
  botId?: string
  symbol: string
  type: string
  quantity: number
  price: number
  fee?: number
  exchange: string
  orderId?: string
}) {
  const totalValue = tradeData.quantity * tradeData.price

  const [trade] = await sql`
    INSERT INTO trade_history (
      user_id, bot_id, symbol, type, quantity, price, total_value, 
      fee, exchange, order_id
    )
    VALUES (
      ${tradeData.userId}, ${tradeData.botId || null}, ${tradeData.symbol}, 
      ${tradeData.type}, ${tradeData.quantity}, ${tradeData.price}, 
      ${totalValue}, ${tradeData.fee || 0}, ${tradeData.exchange}, 
      ${tradeData.orderId || null}
    )
    RETURNING *
  `
  return trade
}

// News functions
export async function getNewsArticles(limit = 50, symbols?: string[]) {
  if (symbols && symbols.length > 0) {
    return await sql`
      SELECT * FROM news_articles 
      WHERE symbols && ${symbols}
      ORDER BY published_at DESC 
      LIMIT ${limit}
    `
  }

  return await sql`
    SELECT * FROM news_articles 
    ORDER BY published_at DESC 
    LIMIT ${limit}
  `
}

export async function getNewsItems(limit = 50, symbols?: string[]) {
  return getNewsArticles(limit, symbols)
}

export async function createNewsArticle(newsData: {
  title: string
  content?: string
  source?: string
  url?: string
  sentiment?: string
  sentimentScore?: number
  symbols?: string[]
  publishedAt?: Date
}) {
  const [article] = await sql`
    INSERT INTO news_articles (
      title, content, source, url, sentiment, sentiment_score, symbols, published_at
    )
    VALUES (
      ${newsData.title}, ${newsData.content || null}, ${newsData.source || null},
      ${newsData.url || null}, ${newsData.sentiment || "neutral"}, 
      ${newsData.sentimentScore || 0}, ${newsData.symbols || []}, 
      ${newsData.publishedAt || new Date()}
    )
    RETURNING *
  `
  return article
}

export async function createNewsItem(newsData: {
  title: string
  content?: string
  source?: string
  url?: string
  sentiment?: string
  sentimentScore?: number
  symbols?: string[]
  publishedAt?: Date
}) {
  return createNewsArticle(newsData)
}

// Risk management functions
export async function getUserRiskSettings(userId: string) {
  const [settings] = await sql`
    SELECT * FROM risk_settings WHERE user_id = ${userId}
  `
  return settings
}

export async function updateRiskSettings(
  userId: string,
  settings: {
    maxDrawdown?: number
    positionSizeLimit?: number
    dailyLossLimit?: number
    maxOpenPositions?: number
    stopLossEnabled?: boolean
    takeProfitEnabled?: boolean
  },
) {
  const [updated] = await sql`
    INSERT INTO risk_settings (
      user_id, max_drawdown, position_size_limit, daily_loss_limit, 
      max_open_positions, stop_loss_enabled, take_profit_enabled
    )
    VALUES (
      ${userId}, ${settings.maxDrawdown || 10}, ${settings.positionSizeLimit || 5},
      ${settings.dailyLossLimit || 1000}, ${settings.maxOpenPositions || 10},
      ${settings.stopLossEnabled !== undefined ? settings.stopLossEnabled : true},
      ${settings.takeProfitEnabled !== undefined ? settings.takeProfitEnabled : true}
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      max_drawdown = ${settings.maxDrawdown || 10},
      position_size_limit = ${settings.positionSizeLimit || 5},
      daily_loss_limit = ${settings.dailyLossLimit || 1000},
      max_open_positions = ${settings.maxOpenPositions || 10},
      stop_loss_enabled = ${settings.stopLossEnabled !== undefined ? settings.stopLossEnabled : true},
      take_profit_enabled = ${settings.takeProfitEnabled !== undefined ? settings.takeProfitEnabled : true},
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return updated
}

// Alerts functions
export async function getUserAlerts(userId: string) {
  return await sql`
    SELECT * FROM alerts 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
}

export async function createAlert(alertData: {
  userId: string
  name: string
  symbol: string
  condition: string
  targetPrice: number
}) {
  const [alert] = await sql`
    INSERT INTO alerts (user_id, name, symbol, condition, target_price)
    VALUES (${alertData.userId}, ${alertData.name}, ${alertData.symbol}, 
            ${alertData.condition}, ${alertData.targetPrice})
    RETURNING *
  `
  return alert
}

// Exchange connections functions
export async function getUserExchangeConnections(userId: string) {
  return await sql`
    SELECT id, exchange, is_active, permissions, last_sync, created_at
    FROM exchange_connections 
    WHERE user_id = ${userId}
  `
}

export async function createExchangeConnection(connectionData: {
  userId: string
  exchange: string
  apiKeyEncrypted: string
  apiSecretEncrypted: string
  passphraseEncrypted?: string
  permissions?: string[]
}) {
  const [connection] = await sql`
    INSERT INTO exchange_connections (
      user_id, exchange, api_key_encrypted, api_secret_encrypted, 
      passphrase_encrypted, permissions
    )
    VALUES (
      ${connectionData.userId}, ${connectionData.exchange}, 
      ${connectionData.apiKeyEncrypted}, ${connectionData.apiSecretEncrypted},
      ${connectionData.passphraseEncrypted || null}, ${connectionData.permissions || []}
    )
    ON CONFLICT (user_id, exchange) 
    DO UPDATE SET 
      api_key_encrypted = ${connectionData.apiKeyEncrypted},
      api_secret_encrypted = ${connectionData.apiSecretEncrypted},
      passphrase_encrypted = ${connectionData.passphraseEncrypted || null},
      permissions = ${connectionData.permissions || []},
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, exchange, is_active, permissions, created_at
  `
  return connection
}
