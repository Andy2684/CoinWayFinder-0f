export interface User {
  id: string
  email: string
  username: string
  password?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  subscription?: {
    plan: string
    status: string
    trialEndsAt?: Date
    currentPeriodEnd?: Date
  }
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  config: Record<string, any>
  createdAt: Date
  updatedAt: Date
  performance?: {
    totalTrades: number
    winRate: number
    totalPnL: number
  }
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
  createdAt: Date
  filledAt?: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  isActive: boolean
}

export interface APIKey {
  id: string
  userId: string
  name: string
  key: string
  permissions: string[]
  createdAt: Date
  lastUsed?: Date
  isActive: boolean
}

class InMemoryDatabase {
  private users: Map<string, User> = new Map()
  private bots: Map<string, Bot> = new Map()
  private trades: Map<string, Trade> = new Map()
  private sessions: Map<string, Session> = new Map()
  private apiKeys: Map<string, APIKey> = new Map()

  // Utility function to generate IDs
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  // User operations
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const user: User = {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    }
    this.users.set(user.id, user)
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  async getUserByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user
      }
    }
    return null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }
    this.users.set(id, updatedUser)
    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id)
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const bot: Bot = {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...botData,
    }
    this.bots.set(bot.id, bot)
    return bot
  }

  async getBotById(id: string): Promise<Bot | null> {
    return this.bots.get(id) || null
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return Array.from(this.bots.values()).filter((bot) => bot.userId === userId)
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    const bot = this.bots.get(id)
    if (!bot) return null

    const updatedBot = {
      ...bot,
      ...updates,
      updatedAt: new Date(),
    }
    this.bots.set(id, updatedBot)
    return updatedBot
  }

  async deleteBot(id: string): Promise<boolean> {
    return this.bots.delete(id)
  }

  async getAllBots(): Promise<Bot[]> {
    return Array.from(this.bots.values())
  }

  // Trade operations
  async createTrade(tradeData: Omit<Trade, "id" | "createdAt">): Promise<Trade> {
    const trade: Trade = {
      id: this.generateId(),
      createdAt: new Date(),
      ...tradeData,
    }
    this.trades.set(trade.id, trade)
    return trade
  }

  async getTradeById(id: string): Promise<Trade | null> {
    return this.trades.get(id) || null
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter((trade) => trade.userId === userId)
  }

  async getTradesByBotId(botId: string): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter((trade) => trade.botId === botId)
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | null> {
    const trade = this.trades.get(id)
    if (!trade) return null

    const updatedTrade = {
      ...trade,
      ...updates,
    }
    this.trades.set(id, updatedTrade)
    return updatedTrade
  }

  async deleteTrade(id: string): Promise<boolean> {
    return this.trades.delete(id)
  }

  async getAllTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values())
  }

  // Session operations
  async createSession(sessionData: Omit<Session, "id" | "createdAt">): Promise<Session> {
    const session: Session = {
      id: this.generateId(),
      createdAt: new Date(),
      ...sessionData,
    }
    this.sessions.set(session.id, session)
    return session
  }

  async getSessionById(id: string): Promise<Session | null> {
    return this.sessions.get(id) || null
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    for (const session of this.sessions.values()) {
      if (session.token === token && session.isActive && session.expiresAt > new Date()) {
        return session
      }
    }
    return null
  }

  async getSessionsByUserId(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter((session) => session.userId === userId)
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const session = this.sessions.get(id)
    if (!session) return null

    const updatedSession = {
      ...session,
      ...updates,
    }
    this.sessions.set(id, updatedSession)
    return updatedSession
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id)
  }

  async deleteSessionsByUserId(userId: string): Promise<number> {
    let deletedCount = 0
    for (const [id, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(id)
        deletedCount++
      }
    }
    return deletedCount
  }

  // API Key operations
  async createAPIKey(keyData: Omit<APIKey, "id" | "createdAt">): Promise<APIKey> {
    const apiKey: APIKey = {
      id: this.generateId(),
      createdAt: new Date(),
      ...keyData,
    }
    this.apiKeys.set(apiKey.id, apiKey)
    return apiKey
  }

  async getAPIKeyById(id: string): Promise<APIKey | null> {
    return this.apiKeys.get(id) || null
  }

  async getAPIKeyByKey(key: string): Promise<APIKey | null> {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.key === key && apiKey.isActive) {
        return apiKey
      }
    }
    return null
  }

  async getAPIKeysByUserId(userId: string): Promise<APIKey[]> {
    return Array.from(this.apiKeys.values()).filter((key) => key.userId === userId)
  }

  async updateAPIKey(id: string, updates: Partial<APIKey>): Promise<APIKey | null> {
    const apiKey = this.apiKeys.get(id)
    if (!apiKey) return null

    const updatedKey = {
      ...apiKey,
      ...updates,
    }
    this.apiKeys.set(id, updatedKey)
    return updatedKey
  }

  async deleteAPIKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id)
  }

  // Utility methods
  async cleanup(): Promise<void> {
    // Clean up expired sessions
    const now = new Date()
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id)
      }
    }
  }

  async getStats(): Promise<{
    users: number
    bots: number
    trades: number
    sessions: number
    apiKeys: number
  }> {
    return {
      users: this.users.size,
      bots: this.bots.size,
      trades: this.trades.size,
      sessions: this.sessions.size,
      apiKeys: this.apiKeys.size,
    }
  }

  // Initialize with sample data
  async initialize(): Promise<void> {
    // Create sample admin user
    await this.createUser({
      email: "admin@coinwayfinder.com",
      username: "admin",
      password: "hashed_admin_password",
      isActive: true,
      subscription: {
        plan: "enterprise",
        status: "active",
      },
    })

    // Create sample regular user
    await this.createUser({
      email: "user@example.com",
      username: "testuser",
      password: "hashed_user_password",
      isActive: true,
      subscription: {
        plan: "pro",
        status: "active",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    console.log("✅ Database initialized with sample data")
  }
}

// Export singleton instance
export const database = new InMemoryDatabase()

// Initialize on module load
database.initialize().catch(console.error)
