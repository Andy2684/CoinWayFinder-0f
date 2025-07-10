import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string
  email: string
  username: string
  role: "user" | "admin"
  subscription: {
    plan: "free" | "starter" | "pro" | "enterprise"
    status: "active" | "inactive" | "cancelled"
    expiresAt: string | null
  }
  createdAt: string
  lastLogin: string | null
  trialStartedAt: string | null
  trialExpiresAt: string | null
}

export interface Bot {
  id: string
  userId: string
  name: string
  strategy: string
  symbol: string
  status: "running" | "paused" | "stopped" | "error"
  config: {
    riskLevel: number
    lotSize: number
    takeProfit: number
    stopLoss: number
    investment: number
    exchange?: string
  }
  stats: {
    totalTrades: number
    winningTrades: number
    totalProfit: number
    totalLoss: number
    winRate: number
    createdAt: string
    lastTradeAt?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  exchange: string
  publicKey: string
  secretKey: string
  passphrase?: string
  testnet: boolean
  permissions: string[]
  createdAt: string
  lastUsed?: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: "active" | "inactive" | "cancelled" | "past_due"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
  updatedAt: string
}

class Database {
  async createUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: userData.email,
          username: userData.username,
          role: userData.role || "user",
          subscription: userData.subscription || {
            plan: "free",
            status: "active",
            expiresAt: null,
          },
          createdAt: new Date().toISOString(),
          trialStartedAt: new Date().toISOString(),
          trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createUserWithTrial(userId: string, referralCode?: string): Promise<User> {
    const trialDays = referralCode ? 14 : 7
    const userData = {
      id: userId,
      email: `user${userId}@example.com`,
      username: `user${userId}`,
      role: "user" as const,
      subscription: {
        plan: "free" as const,
        status: "active" as const,
        expiresAt: null,
      },
      createdAt: new Date().toISOString(),
      trialStartedAt: new Date().toISOString(),
      trialExpiresAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
    }

    return this.createUser(userData)
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createBot(botData: Omit<Bot, "id" | "createdAt" | "updatedAt">): Promise<Bot> {
    const { data, error } = await supabase
      .from("bots")
      .insert([
        {
          ...botData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getBotById(botId: string): Promise<Bot | null> {
    const { data, error } = await supabase.from("bots").select("*").eq("id", botId).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data
  }

  async updateBot(botId: string, updates: Partial<Bot>): Promise<Bot> {
    const { data, error } = await supabase
      .from("bots")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", botId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteBot(botId: string): Promise<void> {
    const { error } = await supabase.from("bots").delete().eq("id", botId)

    if (error) throw error
  }

  async createApiKey(apiKeyData: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
    const { data, error } = await supabase
      .from("api_keys")
      .insert([
        {
          ...apiKeyData,
          createdAt: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getApiKeyById(keyId: string): Promise<ApiKey | null> {
    const { data, error } = await supabase.from("api_keys").select("*").eq("id", keyId).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data
  }

  async updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    const { data, error } = await supabase.from("api_keys").update(updates).eq("id", keyId).select().single()

    if (error) throw error
    return data
  }

  async deleteApiKey(keyId: string): Promise<void> {
    const { error } = await supabase.from("api_keys").delete().eq("id", keyId)

    if (error) throw error
  }

  async createSubscription(
    subscriptionData: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
  ): Promise<Subscription> {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          ...subscriptionData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("userId", userId)
      .eq("status", "active")
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data
  }

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUsageStats(userId: string): Promise<{
    botsCreated: number
    tradesExecuted: number
    apiCallsToday: number
    storageUsed: number
  }> {
    // Get bots count
    const { count: botsCount } = await supabase
      .from("bots")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)

    // Get trades count (mock for now)
    const tradesExecuted = Math.floor(Math.random() * 1000)
    const apiCallsToday = Math.floor(Math.random() * 500)
    const storageUsed = Math.floor(Math.random() * 100)

    return {
      botsCreated: botsCount || 0,
      tradesExecuted,
      apiCallsToday,
      storageUsed,
    }
  }

  async isTrialExpired(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId)
    if (!user || !user.trialExpiresAt) return false

    return new Date(user.trialExpiresAt) < new Date()
  }
}

// Create and export the database instance
export const database = new Database()
