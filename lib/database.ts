import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  email: string
  name: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  raw_json?: any
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  created_at: Date
  updated_at: Date
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
  created_at: Date
}

export class Database {
  async getUser(id: string): Promise<User | null> {
    try {
      const result = await sql`
        SELECT * FROM neon_auth.users_sync 
        WHERE id = ${id} AND deleted_at IS NULL
      `

      if (result.length === 0) return null

      const user = result[0]
      return {
        id: user.id,
        email: user.email,
        name: user.name || "",
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
        deleted_at: user.deleted_at ? new Date(user.deleted_at) : undefined,
        raw_json: user.raw_json,
      }
    } catch (error) {
      console.error("Error getting user:", error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await sql`
        SELECT * FROM neon_auth.users_sync 
        WHERE email = ${email} AND deleted_at IS NULL
      `

      if (result.length === 0) return null

      const user = result[0]
      return {
        id: user.id,
        email: user.email,
        name: user.name || "",
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
        deleted_at: user.deleted_at ? new Date(user.deleted_at) : undefined,
        raw_json: user.raw_json,
      }
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  }

  async createUser(userData: Omit<User, "created_at" | "updated_at">): Promise<User> {
    try {
      const now = new Date()
      const result = await sql`
        INSERT INTO neon_auth.users_sync (id, email, name, created_at, updated_at, raw_json)
        VALUES (${userData.id}, ${userData.email}, ${userData.name}, ${now}, ${now}, ${JSON.stringify(userData.raw_json || {})})
        RETURNING *
      `

      const user = result[0]
      return {
        id: user.id,
        email: user.email,
        name: user.name || "",
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
        deleted_at: user.deleted_at ? new Date(user.deleted_at) : undefined,
        raw_json: user.raw_json,
      }
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const now = new Date()
      const result = await sql`
        UPDATE neon_auth.users_sync 
        SET 
          email = COALESCE(${updates.email}, email),
          name = COALESCE(${updates.name}, name),
          updated_at = ${now},
          raw_json = COALESCE(${JSON.stringify(updates.raw_json)}, raw_json)
        WHERE id = ${id} AND deleted_at IS NULL
        RETURNING *
      `

      if (result.length === 0) return null

      const user = result[0]
      return {
        id: user.id,
        email: user.email,
        name: user.name || "",
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
        deleted_at: user.deleted_at ? new Date(user.deleted_at) : undefined,
        raw_json: user.raw_json,
      }
    } catch (error) {
      console.error("Error updating user:", error)
      return null
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const now = new Date()
      const result = await sql`
        UPDATE neon_auth.users_sync 
        SET deleted_at = ${now}, updated_at = ${now}
        WHERE id = ${id} AND deleted_at IS NULL
      `

      return result.length > 0
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  // Mock implementations for bots and trades (tables don't exist yet)
  async getBots(userId: string): Promise<Bot[]> {
    // Mock data for now
    return [
      {
        id: "bot-1",
        userId,
        name: "DCA Bot",
        strategy: "dca",
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]
  }

  async createBot(botData: Omit<Bot, "created_at" | "updated_at">): Promise<Bot> {
    // Mock implementation
    return {
      ...botData,
      created_at: new Date(),
      updated_at: new Date(),
    }
  }

  async getTrades(userId: string): Promise<Trade[]> {
    // Mock data for now
    return [
      {
        id: "trade-1",
        botId: "bot-1",
        userId,
        symbol: "BTC/USD",
        side: "buy",
        amount: 0.001,
        price: 45000,
        status: "filled",
        created_at: new Date(),
      },
    ]
  }

  async createTrade(tradeData: Omit<Trade, "created_at">): Promise<Trade> {
    // Mock implementation
    return {
      ...tradeData,
      created_at: new Date(),
    }
  }

  async query(queryString: string, params: any[] = []): Promise<any[]> {
    try {
      // Simple query execution
      return await sql.unsafe(queryString, params)
    } catch (error) {
      console.error("Database query error:", error)
      throw error
    }
  }

  async close(): Promise<void> {
    // Neon serverless doesn't need explicit closing
    return Promise.resolve()
  }
}

// Legacy MongoDB-style connection function for compatibility
export async function connectToDatabase() {
  return {
    collection: (name: string) => ({
      findOne: async (query: any) => {
        if (name === "users") {
          const db = new Database()
          if (query._id) {
            return await db.getUser(query._id)
          }
          if (query.email) {
            return await db.getUserByEmail(query.email)
          }
        }
        return null
      },
      insertOne: async (doc: any) => {
        if (name === "users") {
          const db = new Database()
          return await db.createUser(doc)
        }
        return { insertedId: doc._id }
      },
      updateOne: async (query: any, update: any) => {
        if (name === "users" && query._id) {
          const db = new Database()
          return await db.updateUser(query._id, update.$set || update)
        }
        return { modifiedCount: 1 }
      },
      find: async (query: any) => ({
        toArray: async () => [],
      }),
    }),
  }
}

// Create and export the database instance
export const database = new Database()

// Export default
export default database
