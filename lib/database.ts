// Simple in-memory database implementation for browser compatibility
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
}

export interface Trade {
  id: string
  botId: string
  userId: string
  symbol: string
  type: "buy" | "sell"
  amount: number
  price: number
  status: "pending" | "completed" | "failed"
  createdAt: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

class InMemoryDatabase {
  private users: Map<string, User> = new Map()
  private bots: Map<string, Bot> = new Map()
  private trades: Map<string, Trade> = new Map()
  private sessions: Map<string, Session> = new Map()
  private usersByEmail: Map<string, User> = new Map()

  // User operations
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    }

    this.users.set(user.id, user)
    this.usersByEmail.set(user.email, user)
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null
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
    if (updatedUser.email !== user.email) {
      this.usersByEmail.delete(user.email)
      this.usersByEmail.set(updatedUser.email, updatedUser)
    }

    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id)
    if (!user) return false

    this.users.delete(id)
    this.usersByEmail.delete(user.email)
    return true
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  // Bot operations
  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const bot: Bot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      ...sessionData,
    }

    this.sessions.set(session.id, session)
    return session
  }

  async getSessionById(id: string): Promise<Session | null> {
    const session = this.sessions.get(id)
    if (!session) return null

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(id)
      return null
    }

    return session
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    for (const session of this.sessions.values()) {
      if (session.token === token) {
        // Check if session is expired
        if (session.expiresAt < new Date()) {
          this.sessions.delete(session.id)
          return null
        }
        return session
      }
    }
    return null
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

  async cleanupExpiredSessions(): Promise<number> {
    let cleanedCount = 0
    const now = new Date()

    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  // Health check
  async getHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy"
    users: number
    bots: number
    trades: number
    sessions: number
    uptime: number
  }> {
    return {
      status: "healthy",
      users: this.users.size,
      bots: this.bots.size,
      trades: this.trades.size,
      sessions: this.sessions.size,
      uptime: Date.now(),
    }
  }

  // Cleanup old data
  async cleanup(): Promise<void> {
    await this.cleanupExpiredSessions()
    console.log("Database cleanup completed")
  }
}

// Create singleton instance
const database = new InMemoryDatabase()

// Export both the class and instance
export { InMemoryDatabase, database }

// For backward compatibility
export async function connectToDatabase() {
  return database
}
