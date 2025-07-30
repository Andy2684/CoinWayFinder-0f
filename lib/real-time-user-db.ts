import { MongoClient, type Db, type Collection, ObjectId } from "mongodb"
import { EventEmitter } from "events"

interface User {
  _id?: ObjectId
  id?: string
  email: string
  username: string
  password_hash: string
  first_name?: string
  last_name?: string
  role: "user" | "admin"
  subscription_status: "free" | "starter" | "pro" | "enterprise"
  is_email_verified: boolean
  profile_picture?: string
  phone?: string
  location?: string
  website?: string
  bio?: string
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
      trading_alerts: boolean
      news_updates: boolean
      price_alerts: boolean
    }
    trading: {
      default_exchange: string
      risk_level: "low" | "medium" | "high"
      auto_trading: boolean
      stop_loss_enabled: boolean
      take_profit_enabled: boolean
    }
    ui: {
      theme: "light" | "dark"
      language: string
      timezone: string
      currency: string
    }
  }
  security: {
    two_factor_enabled: boolean
    two_factor_secret?: string
    backup_codes?: string[]
    login_attempts: number
    locked_until?: Date
    last_password_change: Date
    security_questions?: Array<{
      question: string
      answer_hash: string
    }>
  }
  activity: {
    last_login: Date
    last_active: Date
    login_count: number
    ip_addresses: string[]
    devices: Array<{
      device_id: string
      device_name: string
      browser: string
      os: string
      last_used: Date
    }>
  }
  trading_data: {
    total_trades: number
    total_pnl: number
    win_rate: number
    favorite_pairs: string[]
    active_bots: string[]
    portfolio_value: number
    risk_score: number
  }
  created_at: Date
  updated_at: Date
}

interface UserSession {
  user_id: string
  session_id: string
  token: string
  expires_at: Date
  device_info: {
    ip_address: string
    user_agent: string
    device_id: string
  }
  is_active: boolean
  created_at: Date
}

class RealTimeUserDatabase extends EventEmitter {
  private client: MongoClient
  private db: Db
  private users: Collection<User>
  private sessions: Collection<UserSession>
  private connected = false
  private connectionRetries = 0
  private maxRetries = 5
  private retryDelay = 5000

  constructor() {
    super()
    this.initializeConnection()
  }

  private async initializeConnection() {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is required")
      }

      this.client = new MongoClient(process.env.MONGODB_URI, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
      })

      await this.client.connect()
      this.db = this.client.db("coinwayfinder")
      this.users = this.db.collection<User>("users")
      this.sessions = this.db.collection<UserSession>("user_sessions")

      // Create indexes for better performance
      await this.createIndexes()

      // Set up change streams for real-time updates
      await this.setupChangeStreams()

      this.connected = true
      this.connectionRetries = 0
      this.emit("connected")

      console.log("✅ Real-time user database connected successfully")
    } catch (error) {
      console.error("❌ Failed to connect to user database:", error)
      await this.handleConnectionError()
    }
  }

  private async createIndexes() {
    try {
      // User collection indexes
      await this.users.createIndex({ email: 1 }, { unique: true })
      await this.users.createIndex({ username: 1 }, { unique: true })
      await this.users.createIndex({ "activity.last_active": 1 })
      await this.users.createIndex({ role: 1 })
      await this.users.createIndex({ subscription_status: 1 })
      await this.users.createIndex({ created_at: 1 })

      // Session collection indexes
      await this.sessions.createIndex({ user_id: 1 })
      await this.sessions.createIndex({ session_id: 1 }, { unique: true })
      await this.sessions.createIndex({ token: 1 }, { unique: true })
      await this.sessions.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
      await this.sessions.createIndex({ "device_info.ip_address": 1 })

      console.log("✅ Database indexes created successfully")
    } catch (error) {
      console.error("❌ Error creating indexes:", error)
    }
  }

  private async setupChangeStreams() {
    try {
      // Watch for user changes
      const userChangeStream = this.users.watch([
        { $match: { operationType: { $in: ["insert", "update", "delete"] } } },
      ])

      userChangeStream.on("change", (change) => {
        this.emit("userChange", {
          type: change.operationType,
          userId: change.documentKey?._id?.toString(),
          data: change.fullDocument,
          timestamp: new Date(),
        })
      })

      // Watch for session changes
      const sessionChangeStream = this.sessions.watch([
        { $match: { operationType: { $in: ["insert", "update", "delete"] } } },
      ])

      sessionChangeStream.on("change", (change) => {
        this.emit("sessionChange", {
          type: change.operationType,
          sessionId: change.documentKey?._id?.toString(),
          data: change.fullDocument,
          timestamp: new Date(),
        })
      })

      console.log("✅ Change streams set up successfully")
    } catch (error) {
      console.error("❌ Error setting up change streams:", error)
    }
  }

  private async handleConnectionError() {
    if (this.connectionRetries < this.maxRetries) {
      this.connectionRetries++
      console.log(`🔄 Retrying connection (${this.connectionRetries}/${this.maxRetries}) in ${this.retryDelay}ms...`)

      setTimeout(() => {
        this.initializeConnection()
      }, this.retryDelay)

      this.retryDelay *= 2 // Exponential backoff
    } else {
      console.error("❌ Max connection retries reached. Database unavailable.")
      this.emit("connectionFailed")
    }
  }

  // User Management Methods
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const now = new Date()
      const newUser: User = {
        email: userData.email!,
        username: userData.username!,
        password_hash: userData.password_hash!,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || "user",
        subscription_status: userData.subscription_status || "free",
        is_email_verified: false,
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
            trading_alerts: true,
            news_updates: true,
            price_alerts: true,
          },
          trading: {
            default_exchange: "binance",
            risk_level: "medium",
            auto_trading: false,
            stop_loss_enabled: true,
            take_profit_enabled: true,
          },
          ui: {
            theme: "dark",
            language: "en",
            timezone: "UTC",
            currency: "USD",
          },
        },
        security: {
          two_factor_enabled: false,
          login_attempts: 0,
          last_password_change: now,
        },
        activity: {
          last_login: now,
          last_active: now,
          login_count: 0,
          ip_addresses: [],
          devices: [],
        },
        trading_data: {
          total_trades: 0,
          total_pnl: 0,
          win_rate: 0,
          favorite_pairs: ["BTC/USDT", "ETH/USDT"],
          active_bots: [],
          portfolio_value: 0,
          risk_score: 50,
        },
        created_at: now,
        updated_at: now,
      }

      const result = await this.users.insertOne(newUser)
      const createdUser = await this.users.findOne({ _id: result.insertedId })

      if (createdUser) {
        createdUser.id = createdUser._id.toString()
        this.emit("userCreated", createdUser)
        return createdUser
      }

      throw new Error("Failed to retrieve created user")
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.users.findOne({ _id: new ObjectId(userId) })
      if (user) {
        user.id = user._id.toString()
        return user
      }
      return null
    } catch (error) {
      console.error("Error getting user by ID:", error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.users.findOne({ email: email.toLowerCase() })
      if (user) {
        user.id = user._id.toString()
        return user
      }
      return null
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.users.findOne({ username: username.toLowerCase() })
      if (user) {
        user.id = user._id.toString()
        return user
      }
      return null
    } catch (error) {
      console.error("Error getting user by username:", error)
      return null
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date(),
      }

      delete updateData._id
      delete updateData.id

      const result = await this.users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: "after" },
      )

      if (result) {
        result.id = result._id.toString()
        this.emit("userUpdated", result)
        return result
      }
      return null
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  async updateUserActivity(
    userId: string,
    activityData: {
      ip_address?: string
      device_info?: any
      action?: string
    },
  ): Promise<void> {
    try {
      const updates: any = {
        "activity.last_active": new Date(),
        updated_at: new Date(),
      }

      if (activityData.ip_address) {
        updates.$addToSet = {
          "activity.ip_addresses": activityData.ip_address,
        }
      }

      if (activityData.device_info) {
        updates.$push = {
          "activity.devices": {
            $each: [activityData.device_info],
            $slice: -10, // Keep only last 10 devices
          },
        }
      }

      await this.users.updateOne({ _id: new ObjectId(userId) }, updates)

      this.emit("userActivityUpdated", { userId, activity: activityData })
    } catch (error) {
      console.error("Error updating user activity:", error)
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<User["preferences"]>): Promise<User | null> {
    try {
      const result = await this.users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            preferences: preferences,
            updated_at: new Date(),
          },
        },
        { returnDocument: "after" },
      )

      if (result) {
        result.id = result._id.toString()
        this.emit("userPreferencesUpdated", result)
        return result
      }
      return null
    } catch (error) {
      console.error("Error updating user preferences:", error)
      throw error
    }
  }

  // Session Management
  async createSession(sessionData: Omit<UserSession, "created_at">): Promise<UserSession> {
    try {
      const newSession: UserSession = {
        ...sessionData,
        created_at: new Date(),
      }

      await this.sessions.insertOne(newSession)
      this.emit("sessionCreated", newSession)
      return newSession
    } catch (error) {
      console.error("Error creating session:", error)
      throw error
    }
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    try {
      return await this.sessions.findOne({ session_id: sessionId })
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  }

  async getSessionByToken(token: string): Promise<UserSession | null> {
    try {
      return await this.sessions.findOne({ token })
    } catch (error) {
      console.error("Error getting session by token:", error)
      return null
    }
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      return await this.sessions
        .find({
          user_id: userId,
          is_active: true,
          expires_at: { $gt: new Date() },
        })
        .toArray()
    } catch (error) {
      console.error("Error getting user sessions:", error)
      return []
    }
  }

  async invalidateSession(sessionId: string): Promise<boolean> {
    try {
      const result = await this.sessions.updateOne({ session_id: sessionId }, { $set: { is_active: false } })

      if (result.modifiedCount > 0) {
        this.emit("sessionInvalidated", { sessionId })
        return true
      }
      return false
    } catch (error) {
      console.error("Error invalidating session:", error)
      return false
    }
  }

  async invalidateAllUserSessions(userId: string): Promise<number> {
    try {
      const result = await this.sessions.updateMany({ user_id: userId }, { $set: { is_active: false } })

      this.emit("allUserSessionsInvalidated", { userId })
      return result.modifiedCount
    } catch (error) {
      console.error("Error invalidating all user sessions:", error)
      return 0
    }
  }

  // Real-time queries
  async getActiveUsers(limit = 100): Promise<User[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const users = await this.users
        .find({
          "activity.last_active": { $gte: fiveMinutesAgo },
        })
        .limit(limit)
        .sort({ "activity.last_active": -1 })
        .toArray()

      return users.map((user) => {
        user.id = user._id.toString()
        return user
      })
    } catch (error) {
      console.error("Error getting active users:", error)
      return []
    }
  }

  async getUserStats(): Promise<{
    total: number
    active: number
    verified: number
    byRole: Record<string, number>
    bySubscription: Record<string, number>
    recentSignups: number
  }> {
    try {
      const [total, active, verified, roleStats, subscriptionStats, recentSignups] = await Promise.all([
        this.users.countDocuments(),
        this.users.countDocuments({
          "activity.last_active": { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
        this.users.countDocuments({ is_email_verified: true }),
        this.users.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]).toArray(),
        this.users.aggregate([{ $group: { _id: "$subscription_status", count: { $sum: 1 } } }]).toArray(),
        this.users.countDocuments({
          created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ])

      const byRole: Record<string, number> = {}
      roleStats.forEach((stat) => {
        byRole[stat._id] = stat.count
      })

      const bySubscription: Record<string, number> = {}
      subscriptionStats.forEach((stat) => {
        bySubscription[stat._id] = stat.count
      })

      return {
        total,
        active,
        verified,
        byRole,
        bySubscription,
        recentSignups,
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return {
        total: 0,
        active: 0,
        verified: 0,
        byRole: {},
        bySubscription: {},
        recentSignups: 0,
      }
    }
  }

  // Security methods
  async incrementLoginAttempts(userId: string): Promise<void> {
    try {
      await this.users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $inc: { "security.login_attempts": 1 },
          $set: { updated_at: new Date() },
        },
      )
    } catch (error) {
      console.error("Error incrementing login attempts:", error)
    }
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    try {
      await this.users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            "security.login_attempts": 0,
            "security.locked_until": null,
            updated_at: new Date(),
          },
        },
      )
    } catch (error) {
      console.error("Error resetting login attempts:", error)
    }
  }

  async lockUser(userId: string, lockDuration: number = 30 * 60 * 1000): Promise<void> {
    try {
      const lockUntil = new Date(Date.now() + lockDuration)
      await this.users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            "security.locked_until": lockUntil,
            updated_at: new Date(),
          },
        },
      )

      this.emit("userLocked", { userId, lockUntil })
    } catch (error) {
      console.error("Error locking user:", error)
    }
  }

  // Cleanup methods
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.sessions.deleteMany({
        expires_at: { $lt: new Date() },
      })

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} expired sessions`)
      }

      return result.deletedCount
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error)
      return 0
    }
  }

  // Health check
  async healthCheck(): Promise<{
    connected: boolean
    users: number
    activeSessions: number
    lastCleanup: Date
  }> {
    try {
      const [userCount, sessionCount] = await Promise.all([
        this.users.countDocuments(),
        this.sessions.countDocuments({ is_active: true }),
      ])

      return {
        connected: this.connected,
        users: userCount,
        activeSessions: sessionCount,
        lastCleanup: new Date(),
      }
    } catch (error) {
      console.error("Health check failed:", error)
      return {
        connected: false,
        users: 0,
        activeSessions: 0,
        lastCleanup: new Date(),
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close()
        this.connected = false
        this.emit("disconnected")
        console.log("✅ User database disconnected")
      }
    } catch (error) {
      console.error("Error disconnecting from database:", error)
    }
  }
}

// Singleton instance
let userDatabase: RealTimeUserDatabase | null = null

export function getUserDatabase(): RealTimeUserDatabase {
  if (!userDatabase) {
    userDatabase = new RealTimeUserDatabase()
  }
  return userDatabase
}

export type { User, UserSession }
export { RealTimeUserDatabase }
