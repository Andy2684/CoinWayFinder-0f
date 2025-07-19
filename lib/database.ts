import { neon, neonConfig } from '@neondatabase/serverless'
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { users } from '@/lib/schema'

const sql = neon(process.env.POSTGRES_URL_NON_POOLING!)
export const db = drizzle(sql)
export const pool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING })

// ✅ Пользователи
export async function getUserByEmail(email: string) {
  return await db.select().from(users).where(eq(users.email, email)).then(res => res[0] || null)
}

export async function getUserByUsername(username: string) {
  return await db.select().from(users).where(eq(users.username, username)).then(res => res[0] || null)
}

<<<<<<< HEAD
export async function getUserByUsername(username: string) {
  const [user] = await sql`
    SELECT id, email, username, first_name, last_name, role, is_email_verified, created_at
    FROM users WHERE username = ${username}
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
=======
export async function createUser(data: { email: string, username: string, password: string }) {
  return await db.insert(users).values(data).returning()
>>>>>>> b2cd8b3 (fix: restore working state after local fixes)
}

// ✅ Фиктивные сигналы
export async function getTradingSignals() {
  return [
    { id: '1', asset: 'BTC/USDT', type: 'Buy', confidence: 85 },
    { id: '2', asset: 'ETH/USDT', type: 'Sell', confidence: 78 },
  ]
}

// ✅ Боты (мок данные)
export async function getTradingBotsByUser(userId: string) {
  return [
    { id: 'bot-1', userId, name: 'DCA Bot', strategy: 'DCA', status: 'running' },
    { id: 'bot-2', userId, name: 'Scalping Bot', strategy: 'Scalping', status: 'paused' },
  ]
}

<<<<<<< HEAD
export async function getTradingBotsByUser(userId: string) {
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
=======
// ✅ Новости (мок данные)
export async function getNewsItems() {
  return [
    { id: '1', title: 'Bitcoin hits new high', source: 'CryptoPanic', date: new Date().toISOString() },
    { id: '2', title: 'Ethereum upgrade announced', source: 'CoinDesk', date: new Date().toISOString() },
  ]
}

export { sql }
>>>>>>> b2cd8b3 (fix: restore working state after local fixes)
