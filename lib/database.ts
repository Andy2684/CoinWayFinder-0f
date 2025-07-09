import bcrypt from "bcryptjs"

// Mock database with realistic data
const mockDatabase = {
  users: [
    {
      id: "1",
      email: "admin@coinwayfinder.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      name: "Admin User",
      role: "admin",
      subscription: {
        plan: "premium",
        status: "active",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      email: "user@example.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      name: "Test User",
      role: "user",
      subscription: {
        plan: "free",
        status: "expired",
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      email: "premium@example.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      name: "Premium User",
      role: "user",
      subscription: {
        plan: "premium",
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  bots: [
    {
      id: "1",
      userId: "3",
      name: "DCA Bitcoin Bot",
      strategy: "dca",
      status: "active",
      config: {
        symbol: "BTC/USDT",
        amount: 100,
        interval: "1h",
      },
      performance: {
        totalTrades: 24,
        winRate: 0.75,
        totalPnl: 150.25,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  trades: [
    {
      id: "1",
      botId: "1",
      userId: "3",
      symbol: "BTC/USDT",
      side: "buy",
      amount: 0.001,
      price: 45000,
      status: "filled",
      pnl: 25.5,
      createdAt: new Date().toISOString(),
    },
  ],
  apiKeys: [
    {
      id: "1",
      userId: "3",
      exchange: "binance",
      name: "Main Trading Account",
      apiKey: "encrypted_api_key",
      secretKey: "encrypted_secret_key",
      permissions: ["spot", "futures"],
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ],
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "admin" | "user"
  subscription: {
    plan: "free" | "basic" | "premium"
    status: "active" | "expired" | "cancelled"
    expiresAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  config: Record<string, any>
  performance: {
    totalTrades: number
    winRate: number
    totalPnl: number
  }
  createdAt: string
  updatedAt: string
}

export interface Trade {
  id: string
  botId: string
  userId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  status: "pending" | "filled" | "cancelled"
  pnl: number
  createdAt: string
}

export interface ApiKey {
  id: string
  userId: string
  exchange: string
  name: string
  apiKey: string
  secretKey: string
  permissions: string[]
  status: "active" | "inactive"
  createdAt: string
}

// User operations
export async function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  const user: User = {
    ...userData,
    id: Date.now().toString(),
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockDatabase.users.push(user)
  return user
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return mockDatabase.users.find((user) => user.email === email) || null
}

export async function findUserById(id: string): Promise<User | null> {
  return mockDatabase.users.find((user) => user.id === id) || null
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const userIndex = mockDatabase.users.findIndex((user) => user.id === id)
  if (userIndex === -1) return null

  mockDatabase.users[userIndex] = {
    ...mockDatabase.users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return mockDatabase.users[userIndex]
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

// Bot operations
export async function createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
  const bot: Bot = {
    ...botData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockDatabase.bots.push(bot)
  return bot
}

export async function findBotsByUserId(userId: string): Promise<Bot[]> {
  return mockDatabase.bots.filter((bot) => bot.userId === userId)
}

export async function findBotById(id: string): Promise<Bot | null> {
  return mockDatabase.bots.find((bot) => bot.id === id) || null
}

export async function updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
  const botIndex = mockDatabase.bots.findIndex((bot) => bot.id === id)
  if (botIndex === -1) return null

  mockDatabase.bots[botIndex] = {
    ...mockDatabase.bots[botIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return mockDatabase.bots[botIndex]
}

export async function deleteBot(id: string): Promise<boolean> {
  const botIndex = mockDatabase.bots.findIndex((bot) => bot.id === id)
  if (botIndex === -1) return false

  mockDatabase.bots.splice(botIndex, 1)
  return true
}

// Trade operations
export async function createTrade(tradeData: Omit<Trade, "id" | "createdAt">): Promise<Trade> {
  const trade: Trade = {
    ...tradeData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  mockDatabase.trades.push(trade)
  return trade
}

export async function findTradesByUserId(userId: string): Promise<Trade[]> {
  return mockDatabase.trades.filter((trade) => trade.userId === userId)
}

export async function findTradesByBotId(botId: string): Promise<Trade[]> {
  return mockDatabase.trades.filter((trade) => trade.botId === botId)
}

// API Key operations
export async function createApiKey(apiKeyData: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
  const apiKey: ApiKey = {
    ...apiKeyData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  mockDatabase.apiKeys.push(apiKey)
  return apiKey
}

export async function findApiKeysByUserId(userId: string): Promise<ApiKey[]> {
  return mockDatabase.apiKeys.filter((key) => key.userId === userId)
}

export async function deleteApiKey(id: string): Promise<boolean> {
  const keyIndex = mockDatabase.apiKeys.findIndex((key) => key.id === id)
  if (keyIndex === -1) return false

  mockDatabase.apiKeys.splice(keyIndex, 1)
  return true
}

// Subscription helpers
export function isSubscriptionActive(user: User): boolean {
  if (user.subscription.status !== "active") return false
  return new Date(user.subscription.expiresAt) > new Date()
}

export function hasSubscriptionAccess(user: User, requiredPlan: "free" | "basic" | "premium"): boolean {
  if (!isSubscriptionActive(user)) return requiredPlan === "free"

  const planHierarchy = { free: 0, basic: 1, premium: 2 }
  return planHierarchy[user.subscription.plan] >= planHierarchy[requiredPlan]
}

// Usage limits
export function getUsageLimits(plan: string) {
  const limits = {
    free: { bots: 1, trades: 10, apiKeys: 1 },
    basic: { bots: 5, trades: 100, apiKeys: 3 },
    premium: { bots: 20, trades: 1000, apiKeys: 10 },
  }
  return limits[plan as keyof typeof limits] || limits.free
}

export async function checkUsageLimit(userId: string, resource: "bots" | "trades" | "apiKeys"): Promise<boolean> {
  const user = await findUserById(userId)
  if (!user) return false

  const limits = getUsageLimits(user.subscription.plan)
  const currentUsage = {
    bots: mockDatabase.bots.filter((bot) => bot.userId === userId).length,
    trades: mockDatabase.trades.filter((trade) => trade.userId === userId).length,
    apiKeys: mockDatabase.apiKeys.filter((key) => key.userId === userId).length,
  }

  return currentUsage[resource] < limits[resource]
}
