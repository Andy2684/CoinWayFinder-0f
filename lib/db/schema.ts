import { pgTable, text, timestamp, boolean, integer, decimal, jsonb, uuid, varchar, index } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    username: varchar("username", { length: 50 }).unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: varchar("phone", { length: 20 }),
    location: varchar("location", { length: 100 }),
    website: varchar("website", { length: 255 }),
    bio: text("bio"),
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    avatar: text("avatar"),
    role: varchar("role", { length: 20 }).default("user"),
    plan: varchar("plan", { length: 20 }).default("free"),
    isVerified: boolean("is_verified").default(false),
    isActive: boolean("is_active").default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    preferences: jsonb("preferences").default({}),
    securitySettings: jsonb("security_settings").default({}),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    usernameIdx: index("users_username_idx").on(table.username),
  }),
)

// Signals table
export const signals = pgTable(
  "signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    symbol: varchar("symbol", { length: 20 }).notNull(),
    type: varchar("type", { length: 10 }).notNull(), // BUY, SELL
    strategy: varchar("strategy", { length: 50 }).notNull(),
    exchange: varchar("exchange", { length: 50 }).notNull(),
    timeframe: varchar("timeframe", { length: 10 }).notNull(),
    confidence: integer("confidence").notNull(),
    entryPrice: decimal("entry_price", { precision: 20, scale: 8 }).notNull(),
    targetPrice: decimal("target_price", { precision: 20, scale: 8 }).notNull(),
    stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }).notNull(),
    currentPrice: decimal("current_price", { precision: 20, scale: 8 }).notNull(),
    pnl: decimal("pnl", { precision: 20, scale: 8 }).default("0"),
    pnlPercentage: decimal("pnl_percentage", { precision: 10, scale: 4 }).default("0"),
    progress: integer("progress").default(0),
    riskLevel: varchar("risk_level", { length: 10 }).notNull(),
    aiAnalysis: text("ai_analysis"),
    status: varchar("status", { length: 20 }).default("ACTIVE"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userIdIdx: index("signals_user_id_idx").on(table.userId),
    symbolIdx: index("signals_symbol_idx").on(table.symbol),
    statusIdx: index("signals_status_idx").on(table.status),
    createdAtIdx: index("signals_created_at_idx").on(table.createdAt),
  }),
)

// Bots table
export const bots = pgTable(
  "bots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    strategy: varchar("strategy", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).default("INACTIVE"),
    pair: varchar("pair", { length: 20 }).notNull(),
    exchange: varchar("exchange", { length: 50 }).notNull(),
    profit: decimal("profit", { precision: 20, scale: 8 }).default("0"),
    totalTrades: integer("total_trades").default(0),
    winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0"),
    maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 4 }).default("0"),
    sharpeRatio: decimal("sharpe_ratio", { precision: 10, scale: 4 }).default("0"),
    config: jsonb("config").notNull(),
    riskSettings: jsonb("risk_settings").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastRunAt: timestamp("last_run_at"),
  },
  (table) => ({
    userIdIdx: index("bots_user_id_idx").on(table.userId),
    statusIdx: index("bots_status_idx").on(table.status),
    pairIdx: index("bots_pair_idx").on(table.pair),
  }),
)

// News table
export const news = pgTable(
  "news",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    summary: text("summary"),
    source: varchar("source", { length: 100 }).notNull(),
    author: varchar("author", { length: 100 }),
    url: text("url"),
    imageUrl: text("image_url"),
    category: varchar("category", { length: 50 }),
    sentiment: varchar("sentiment", { length: 20 }),
    sentimentScore: decimal("sentiment_score", { precision: 5, scale: 4 }),
    impact: varchar("impact", { length: 20 }),
    tags: jsonb("tags").default([]),
    publishedAt: timestamp("published_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("news_source_idx").on(table.source),
    categoryIdx: index("news_category_idx").on(table.category),
    publishedAtIdx: index("news_published_at_idx").on(table.publishedAt),
    sentimentIdx: index("news_sentiment_idx").on(table.sentiment),
  }),
)

// Alert rules table
export const alertRules = pgTable(
  "alert_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    condition: varchar("condition", { length: 50 }).notNull(),
    symbol: varchar("symbol", { length: 20 }),
    value: decimal("value", { precision: 20, scale: 8 }).notNull(),
    operator: varchar("operator", { length: 5 }).notNull(),
    enabled: boolean("enabled").default(true),
    channels: jsonb("channels").default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    triggeredAt: timestamp("triggered_at"),
    status: varchar("status", { length: 20 }).default("ACTIVE"),
  },
  (table) => ({
    userIdIdx: index("alert_rules_user_id_idx").on(table.userId),
    enabledIdx: index("alert_rules_enabled_idx").on(table.enabled),
    statusIdx: index("alert_rules_status_idx").on(table.status),
  }),
)

// Exchange integrations table
export const exchangeIntegrations = pgTable(
  "exchange_integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    exchangeName: varchar("exchange_name", { length: 50 }).notNull(),
    apiKey: text("api_key").notNull(),
    apiSecret: text("api_secret").notNull(),
    passphrase: text("passphrase"),
    sandbox: boolean("sandbox").default(false),
    status: varchar("status", { length: 20 }).default("DISCONNECTED"),
    permissions: jsonb("permissions").default([]),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("exchange_integrations_user_id_idx").on(table.userId),
    exchangeNameIdx: index("exchange_integrations_exchange_name_idx").on(table.exchangeName),
    statusIdx: index("exchange_integrations_status_idx").on(table.status),
  }),
)

// Bot trades table
export const botTrades = pgTable(
  "bot_trades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    botId: uuid("bot_id")
      .references(() => bots.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    symbol: varchar("symbol", { length: 20 }).notNull(),
    type: varchar("type", { length: 10 }).notNull(), // BUY, SELL
    side: varchar("side", { length: 10 }).notNull(), // LONG, SHORT
    quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
    price: decimal("price", { precision: 20, scale: 8 }).notNull(),
    fee: decimal("fee", { precision: 20, scale: 8 }).default("0"),
    pnl: decimal("pnl", { precision: 20, scale: 8 }).default("0"),
    exchange: varchar("exchange", { length: 50 }).notNull(),
    orderId: varchar("order_id", { length: 100 }),
    executedAt: timestamp("executed_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    botIdIdx: index("bot_trades_bot_id_idx").on(table.botId),
    userIdIdx: index("bot_trades_user_id_idx").on(table.userId),
    symbolIdx: index("bot_trades_symbol_idx").on(table.symbol),
    executedAtIdx: index("bot_trades_executed_at_idx").on(table.executedAt),
  }),
)

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const insertSignalSchema = createInsertSchema(signals)
export const selectSignalSchema = createSelectSchema(signals)
export const insertBotSchema = createInsertSchema(bots)
export const selectBotSchema = createSelectSchema(bots)
export const insertNewsSchema = createInsertSchema(news)
export const selectNewsSchema = createSelectSchema(news)
export const insertAlertRuleSchema = createInsertSchema(alertRules)
export const selectAlertRuleSchema = createSelectSchema(alertRules)
export const insertExchangeIntegrationSchema = createInsertSchema(exchangeIntegrations)
export const selectExchangeIntegrationSchema = createSelectSchema(exchangeIntegrations)
export const insertBotTradeSchema = createInsertSchema(botTrades)
export const selectBotTradeSchema = createSelectSchema(botTrades)

// TypeScript types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Signal = typeof signals.$inferSelect
export type NewSignal = typeof signals.$inferInsert
export type Bot = typeof bots.$inferSelect
export type NewBot = typeof bots.$inferInsert
export type News = typeof news.$inferSelect
export type NewNews = typeof news.$inferInsert
export type AlertRule = typeof alertRules.$inferSelect
export type NewAlertRule = typeof alertRules.$inferInsert
export type ExchangeIntegration = typeof exchangeIntegrations.$inferSelect
export type NewExchangeIntegration = typeof exchangeIntegrations.$inferInsert
export type BotTrade = typeof botTrades.$inferSelect
export type NewBotTrade = typeof botTrades.$inferInsert
