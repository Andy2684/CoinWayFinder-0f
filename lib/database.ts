import type { User } from "./auth"

// In-memory database for development
const users = new Map<string, User>()
const sessions = new Map<string, any>()
const bots = new Map<string, any>()
const trades = new Map<string, any>()
const apiKeys = new Map<string, any>()
const userSettings = new Map<string, any>()

// Generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export class Database {
  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const id = generateId()
    const user: User = {
      id,
      email: userData.email!,
      username: userData.username!,
      password: userData.password,
      isActive: userData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: userData.subscription || {
        plan: "free",
        status: "active",
      },
    }

    users.set(id, user)

    // Create default user settings
    userSettings.set(id, {
      userId: id,
      subscription: user.subscription,
      preferences: {
        notifications: true,
        theme: "light",
      },
    })

    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return users.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id)
    if (!user) return null

    const updatedUser = { ...user, ...updates, updatedAt: new Date() }
    users.set(id, updatedUser)
    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    return users.delete(id)
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<any> {
    return userSettings.get(userId) || null
  }

  async updateUserSettings(userId: string, settings: any): Promise<any> {
    const existing = userSettings.get(userId) || {}
    const updated = { ...existing, ...settings }
    userSettings.set(userId, updated)
    return updated
  }

  // Session operations
  async createSession(userId: string, sessionData: any): Promise<any> {
    const sessionId = generateId()
    const session = {
      id: sessionId,
      userId,
      ...sessionData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }
    sessions.set(sessionId, session)
    return session
  }

  async getSession(sessionId: string): Promise<any> {
    return sessions.get(sessionId) || null
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return sessions.delete(sessionId)
  }

  // Bot operations
  async createBot(userId: string, botData: any): Promise<any> {
    const botId = generateId()
    const bot = {
      id: botId,
      userId,
      ...botData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "inactive",
    }
    bots.set(botId, bot)
    return bot
  }

  async getBotById(botId: string): Promise<any> {
    return bots.get(botId) || null
  }

  async getBotsByUserId(userId: string): Promise<any[]> {
    const userBots = []
    for (const bot of bots.values()) {
      if (bot.userId === userId) {
        userBots.push(bot)
      }
    }
    return userBots
  }

  async updateBot(botId: string, updates: any): Promise<any> {
    const bot = bots.get(botId)
    if (!bot) return null

    const updatedBot = { ...bot, ...updates, updatedAt: new Date() }
    bots.set(botId, updatedBot)
    return updatedBot
  }

  async deleteBot(botId: string): Promise<boolean> {
    return bots.delete(botId)
  }

  // Trade operations
  async createTrade(tradeData: any): Promise<any> {
    const tradeId = generateId()
    const trade = {
      id: tradeId,
      ...tradeData,
      createdAt: new Date(),
    }
    trades.set(tradeId, trade)
    return trade
  }

  async getTradesByUserId(userId: string): Promise<any[]> {
    const userTrades = []
    for (const trade of trades.values()) {
      if (trade.userId === userId) {
        userTrades.push(trade)
      }
    }
    return userTrades
  }

  async getTradesByBotId(botId: string): Promise<any[]> {
    const botTrades = []
    for (const trade of trades.values()) {
      if (trade.botId === botId) {
        botTrades.push(trade)
      }
    }
    return botTrades
  }

  // API Key operations
  async createApiKey(userId: string, keyData: any): Promise<any> {
    const keyId = generateId()
    const apiKey = {
      id: keyId,
      userId,
      ...keyData,
      createdAt: new Date(),
      lastUsed: null,
    }
    apiKeys.set(keyId, apiKey)
    return apiKey
  }

  async getApiKeysByUserId(userId: string): Promise<any[]> {
    const userKeys = []
    for (const key of apiKeys.values()) {
      if (key.userId === userId) {
        userKeys.push(key)
      }
    }
    return userKeys
  }

  async updateApiKey(keyId: string, updates: any): Promise<any> {
    const key = apiKeys.get(keyId)
    if (!key) return null

    const updatedKey = { ...key, ...updates }
    apiKeys.set(keyId, updatedKey)
    return updatedKey
  }

  async deleteApiKey(keyId: string): Promise<boolean> {
    return apiKeys.delete(keyId)
  }

  // Statistics
  async getStats(): Promise<any> {
    return {
      totalUsers: users.size,
      totalBots: bots.size,
      totalTrades: trades.size,
      totalApiKeys: apiKeys.size,
    }
  }
}

// Database connection
export async function connectToDatabase(): Promise<Database> {
  // In a real app, this would connect to MongoDB, PostgreSQL, etc.
  console.log("Connected to in-memory database")
  return database
}

// Export singleton instance
export const database = new Database()
