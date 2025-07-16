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

// Trading bots functions
export async function getTradingBots(userId: string) {
  return await sql`
    SELECT * FROM trading_bots 
    WHERE created_by = ${userId}
    ORDER BY created_at DESC
  `
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

export async function updateBotStatus(botId: string, status: string) {
  const [bot] = await sql`
    UPDATE trading_bots 
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${botId}
    RETURNING *
  `
  return bot
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
