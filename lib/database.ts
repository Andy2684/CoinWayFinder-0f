// Mock Database Implementation for CoinWayFinder

export interface User {
  id: string
  email: string
  password: string
  name: string
  isAdmin: boolean
  subscriptionTier: "free" | "basic" | "premium" | "enterprise"
  subscriptionStatus: "active" | "expired" | "canceled"
  subscriptionExpiry: Date
  apiUsage: {
    current: number
    limit: number
    resetDate: Date
  }
  createdAt: Date
  updatedAt: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  exchange: string
  pair: string
  balance: number
  profit: number
  trades: number
  createdAt: Date
  updatedAt: Date
  config: {
    riskLevel: "low" | "medium" | "high"
    maxInvestment: number
    stopLoss: number
    takeProfit: number
  }
}

export interface Trade {
  id: string
  botId: string
  userId: string
  type: "buy" | "sell"
  pair: string
  amount: number
  price: number
  profit: number
  status: "pending" | "completed" | "failed"
  timestamp: Date
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  exchange: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
}

export interface Subscription {
  id: string
  userId: string
  tier: "basic" | "premium" | "enterprise"
  status: "active" | "expired" | "canceled"
  startDate: Date
  endDate: Date
  stripeSubscriptionId?: string
  features: string[]
  limits: {
    bots: number
    apiCalls: number
    exchanges: number
  }
}

// Mock data storage
const users: User[] = [
  {
    id: "admin-1",
    email: "admin@coinwayfinder.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    name: "Admin User",
    isAdmin: true,
    subscriptionTier: "enterprise",
    subscriptionStatus: "active",
    subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    apiUsage: {
      current: 0,
      limit: 100000,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date(),
    stripeCustomerId: "cus_admin_123",
  },
  {
    id: "user-1",
    email: "expired@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    name: "Expired User",
    isAdmin: false,
    subscriptionTier: "basic",
    subscriptionStatus: "expired",
    subscriptionExpiry: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    apiUsage: {
      current: 450,
      limit: 500,
      resetDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
    stripeCustomerId: "cus_expired_123",
  },
  {
    id: "user-2",
    email: "premium@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    name: "Premium User",
    isAdmin: false,
    subscriptionTier: "premium",
    subscriptionStatus: "active",
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    apiUsage: {
      current: 1250,
      limit: 10000,
      resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date(),
    stripeCustomerId: "cus_premium_123",
    stripeSubscriptionId: "sub_premium_123",
  },
]

const bots: Bot[] = [
  {
    id: "bot-1",
    userId: "user-2",
    name: "BTC Scalper",
    strategy: "scalping",
    status: "active",
    exchange: "binance",
    pair: "BTC/USDT",
    balance: 1000,
    profit: 125.5,
    trades: 45,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date(),
    config: {
      riskLevel: "medium",
      maxInvestment: 100,
      stopLoss: 2,
      takeProfit: 3,
    },
  },
  {
    id: "bot-2",
    userId: "user-2",
    name: "ETH DCA",
    strategy: "dca",
    status: "paused",
    exchange: "coinbase",
    pair: "ETH/USD",
    balance: 500,
    profit: -25.75,
    trades: 12,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date(),
    config: {
      riskLevel: "low",
      maxInvestment: 50,
      stopLoss: 5,
      takeProfit: 10,
    },
  },
]

const trades: Trade[] = [
  {
    id: "trade-1",
    botId: "bot-1",
    userId: "user-2",
    type: "buy",
    pair: "BTC/USDT",
    amount: 0.001,
    price: 45000,
    profit: 5.25,
    status: "completed",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "trade-2",
    botId: "bot-1",
    userId: "user-2",
    type: "sell",
    pair: "BTC/USDT",
    amount: 0.001,
    price: 45250,
    profit: 5.25,
    status: "completed",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
]

const apiKeys: ApiKey[] = [
  {
    id: "key-1",
    userId: "user-2",
    name: "Binance Main",
    key: "binance_key_encrypted",
    exchange: "binance",
    permissions: ["read", "trade"],
    isActive: true,
    createdAt: new Date("2024-02-10"),
    lastUsed: new Date(),
  },
]

const subscriptions: Subscription[] = [
  {
    id: "sub-1",
    userId: "user-2",
    tier: "premium",
    status: "active",
    startDate: new Date("2024-02-01"),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    stripeSubscriptionId: "sub_premium_123",
    features: ["Advanced bots", "Multiple exchanges", "Priority support"],
    limits: {
      bots: 10,
      apiCalls: 10000,
      exchanges: 5,
    },
  },
]

// Database functions
export const db = {
  // User operations
  users: {
    findById: async (id: string): Promise<User | null> => {
      return users.find((user) => user.id === id) || null
    },

    findByEmail: async (email: string): Promise<User | null> => {
      return users.find((user) => user.email === email) || null
    },

    create: async (userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> => {
      const user: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      users.push(user)
      return user
    },

    update: async (id: string, updates: Partial<User>): Promise<User | null> => {
      const index = users.findIndex((user) => user.id === id)
      if (index === -1) return null

      users[index] = { ...users[index], ...updates, updatedAt: new Date() }
      return users[index]
    },

    delete: async (id: string): Promise<boolean> => {
      const index = users.findIndex((user) => user.id === id)
      if (index === -1) return false

      users.splice(index, 1)
      return true
    },

    list: async (filters?: { isAdmin?: boolean; subscriptionTier?: string }): Promise<User[]> => {
      let filteredUsers = users

      if (filters?.isAdmin !== undefined) {
        filteredUsers = filteredUsers.filter((user) => user.isAdmin === filters.isAdmin)
      }

      if (filters?.subscriptionTier) {
        filteredUsers = filteredUsers.filter((user) => user.subscriptionTier === filters.subscriptionTier)
      }

      return filteredUsers
    },
  },

  // Bot operations
  bots: {
    findById: async (id: string): Promise<Bot | null> => {
      return bots.find((bot) => bot.id === id) || null
    },

    findByUserId: async (userId: string): Promise<Bot[]> => {
      return bots.filter((bot) => bot.userId === userId)
    },

    create: async (botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> => {
      const bot: Bot = {
        ...botData,
        id: `bot-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      bots.push(bot)
      return bot
    },

    update: async (id: string, updates: Partial<Bot>): Promise<Bot | null> => {
      const index = bots.findIndex((bot) => bot.id === id)
      if (index === -1) return null

      bots[index] = { ...bots[index], ...updates, updatedAt: new Date() }
      return bots[index]
    },

    delete: async (id: string): Promise<boolean> => {
      const index = bots.findIndex((bot) => bot.id === id)
      if (index === -1) return false

      bots.splice(index, 1)
      return true
    },

    list: async (filters?: { userId?: string; status?: string }): Promise<Bot[]> => {
      let filteredBots = bots

      if (filters?.userId) {
        filteredBots = filteredBots.filter((bot) => bot.userId === filters.userId)
      }

      if (filters?.status) {
        filteredBots = filteredBots.filter((bot) => bot.status === filters.status)
      }

      return filteredBots
    },
  },

  // Trade operations
  trades: {
    findById: async (id: string): Promise<Trade | null> => {
      return trades.find((trade) => trade.id === id) || null
    },

    findByUserId: async (userId: string): Promise<Trade[]> => {
      return trades.filter((trade) => trade.userId === userId)
    },

    findByBotId: async (botId: string): Promise<Trade[]> => {
      return trades.filter((trade) => trade.botId === botId)
    },

    create: async (tradeData: Omit<Trade, "id">): Promise<Trade> => {
      const trade: Trade = {
        ...tradeData,
        id: `trade-${Date.now()}`,
      }
      trades.push(trade)
      return trade
    },

    list: async (filters?: { userId?: string; botId?: string; status?: string }): Promise<Trade[]> => {
      let filteredTrades = trades

      if (filters?.userId) {
        filteredTrades = filteredTrades.filter((trade) => trade.userId === filters.userId)
      }

      if (filters?.botId) {
        filteredTrades = filteredTrades.filter((trade) => trade.botId === filters.botId)
      }

      if (filters?.status) {
        filteredTrades = filteredTrades.filter((trade) => trade.status === filters.status)
      }

      return filteredTrades
    },
  },

  // API Key operations
  apiKeys: {
    findById: async (id: string): Promise<ApiKey | null> => {
      return apiKeys.find((key) => key.id === id) || null
    },

    findByUserId: async (userId: string): Promise<ApiKey[]> => {
      return apiKeys.filter((key) => key.userId === userId)
    },

    create: async (keyData: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> => {
      const apiKey: ApiKey = {
        ...keyData,
        id: `key-${Date.now()}`,
        createdAt: new Date(),
      }
      apiKeys.push(apiKey)
      return apiKey
    },

    update: async (id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> => {
      const index = apiKeys.findIndex((key) => key.id === id)
      if (index === -1) return null

      apiKeys[index] = { ...apiKeys[index], ...updates }
      return apiKeys[index]
    },

    delete: async (id: string): Promise<boolean> => {
      const index = apiKeys.findIndex((key) => key.id === id)
      if (index === -1) return false

      apiKeys.splice(index, 1)
      return true
    },
  },

  // Subscription operations
  subscriptions: {
    findById: async (id: string): Promise<Subscription | null> => {
      return subscriptions.find((sub) => sub.id === id) || null
    },

    findByUserId: async (userId: string): Promise<Subscription | null> => {
      return subscriptions.find((sub) => sub.userId === userId) || null
    },

    create: async (subData: Omit<Subscription, "id">): Promise<Subscription> => {
      const subscription: Subscription = {
        ...subData,
        id: `sub-${Date.now()}`,
      }
      subscriptions.push(subscription)
      return subscription
    },

    update: async (id: string, updates: Partial<Subscription>): Promise<Subscription | null> => {
      const index = subscriptions.findIndex((sub) => sub.id === id)
      if (index === -1) return null

      subscriptions[index] = { ...subscriptions[index], ...updates }
      return subscriptions[index]
    },

    delete: async (id: string): Promise<boolean> => {
      const index = subscriptions.findIndex((sub) => sub.id === id)
      if (index === -1) return false

      subscriptions.splice(index, 1)
      return true
    },
  },
}

// Helper functions
export async function getUserWithSubscription(userId: string) {
  const user = await db.users.findById(userId)
  if (!user) return null

  const subscription = await db.subscriptions.findByUserId(userId)
  return { user, subscription }
}

export async function checkSubscriptionAccess(userId: string, feature: string): Promise<boolean> {
  const { user, subscription } = (await getUserWithSubscription(userId)) || {}

  if (!user || !subscription) return false
  if (subscription.status !== "active") return false
  if (subscription.endDate < new Date()) return false

  return subscription.features.includes(feature)
}

export async function checkApiUsageLimit(
  userId: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const user = await db.users.findById(userId)
  if (!user) return { allowed: false, current: 0, limit: 0 }

  const { current, limit, resetDate } = user.apiUsage

  // Reset usage if reset date has passed
  if (resetDate < new Date()) {
    await db.users.update(userId, {
      apiUsage: {
        current: 0,
        limit,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    return { allowed: true, current: 0, limit }
  }

  return { allowed: current < limit, current, limit }
}

export async function incrementApiUsage(userId: string): Promise<void> {
  const user = await db.users.findById(userId)
  if (!user) return

  await db.users.update(userId, {
    apiUsage: {
      ...user.apiUsage,
      current: user.apiUsage.current + 1,
    },
  })
}
